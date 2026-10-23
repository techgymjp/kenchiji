'use strict';
// 支持率の計算・世論調査・開票速報・エンディング

const RIVALS = {
  g: { name: '権田 剛造', short: '権田', desc: '現職・4選をめざす（68）', cls: 'c-g' },
  a: { name: '新井 ひかり', short: '新井', desc: '新人・元アナウンサー（41）', cls: 'c-a' },
};

const INITIAL_SUPPORT = {
  chuo:     { p: 16, g: 46, a: 34 },
  aoba:     { p: 13, g: 62, a: 16 },
  minato:   { p: 15, g: 54, a: 22 },
  yukemuri: { p: 20, g: 52, a: 20 },
  sakura:   { p: 14, g: 42, a: 40 },
};

function candName(k) { return k === 'p' ? G.name : RIVALS[k].name; }
function candShort(k) { return k === 'p' ? G.name.split(/\s|　/)[0] : RIVALS[k].short; }
function candCls(k) { return k === 'p' ? 'c-p' : RIVALS[k].cls; }

function fameMult() { return 0.5 + 0.5 * Math.min(100, G.fame) / 100; }

function shareOf(area) {
  const s = G.sup[area];
  const pe = Math.max(1, s.p) * fameMult();
  const g = Math.max(1, s.g), a = Math.max(1, s.a);
  const t = pe + g + a;
  return { p: pe / t, g: g / t, a: a / t };
}

function overallShare() {
  const r = { p: 0, g: 0, a: 0 };
  let tot = 0;
  AREA_IDS.forEach(id => {
    const s = shareOf(id), v = AREAS[id].voters;
    r.p += s.p * v; r.g += s.g * v; r.a += s.a * v;
    tot += v;
  });
  r.p /= tot; r.g /= tot; r.a /= tot;
  return r;
}

// 毎晩のライバル陣営の動き
function rivalDrift() {
  const ov = overallShare();
  const push = ov.p > ov.g ? 0.7 : 0; // 現職陣営の巻き返し
  const pushA = ov.p > ov.a ? 0.25 : 0;
  AREA_IDS.forEach(id => {
    const s = G.sup[id];
    s.g += 0.25 + Math.random() * 0.45 + push;
    s.a += (id === 'chuo' || id === 'sakura' ? 0.3 : 0.12) + Math.random() * 0.35 + pushA;
  });
}

function barHtml(sh, undecided = 0) {
  const k = 1 - undecided;
  const w = v => (v * 100 * k).toFixed(1);
  return `<div class="bar"><span class="p" style="width:${w(sh.p)}%"></span><span class="g" style="width:${w(sh.g)}%"></span><span class="a" style="width:${w(sh.a)}%"></span><span class="u" style="width:${(undecided * 100).toFixed(1)}%"></span></div>`;
}

// 陣営の情勢分析（ノイズあり）
function situationHtml() {
  const label = d => (d > 0.08 ? '<span class="good">優勢</span>' : d > 0.02 ? '<span class="good">やや優勢</span>'
    : d > -0.02 ? '接戦' : d > -0.08 ? '<span class="bad">やや劣勢</span>' : '<span class="bad">劣勢</span>');
  let h = '<h2>じょうせい（陣営の 独自分析）</h2>';
  h += `<p><span class="c-p">■ ${G.name}</span>　<span class="c-g">■ 権田</span>　<span class="c-a">■ 新井</span></p>`;
  AREA_IDS.forEach(id => {
    const s = shareOf(id);
    const n = () => (Math.random() - 0.5) * 0.04;
    const sh = { p: Math.max(0.01, s.p + n()), g: Math.max(0.01, s.g + n()), a: Math.max(0.01, s.a + n()) };
    const t = sh.p + sh.g + sh.a;
    sh.p /= t; sh.g /= t; sh.a /= t;
    const top = Math.max(sh.g, sh.a);
    h += `<p>${AREAS[id].name}（有権者 ${(AREAS[id].voters / 10000).toFixed(0)}万人）　${label(sh.p - top)}</p>${barHtml(sh)}`;
  });
  const ov = overallShare();
  const top = Math.max(ov.g, ov.a);
  h += `<h3>県全体　${label(ov.p - top + (Math.random() - 0.5) * 0.02)}</h3>${barHtml(ov)}`;
  h += `<p class="dim">知名度 ${Math.round(G.fame)}　※知名度が低いと 支持が 票に 結びつきにくい</p>`;
  return h;
}

// 新聞の世論調査
function pollHtml() {
  const ov = overallShare();
  const und = Math.max(0.12, 0.42 - G.day * 0.018);
  const r = k => Math.round(ov[k] * (1 - und) * 100 + (Math.random() - 0.5) * 3);
  const vals = { p: r('p'), g: r('g'), a: r('a') };
  const order = ['p', 'g', 'a'].sort((x, y) => vals[y] - vals[x]);
  const head = vals[order[0]] - vals[order[1]] >= 6
    ? `${candShort(order[0])}氏が リード、${candShort(order[1])}氏 追う`
    : `${candShort(order[0])}氏と ${candShort(order[1])}氏が 激しく競る`;
  return `<div class="news"><b>ひなた新聞 世論調査</b>${head}<br>` +
    order.map(k => `<span class="${candCls(k)}">■</span> ${candName(k)}　${vals[k]}%`).join('<br>') +
    `<br>態度未定　${Math.round(und * 100)}%</div>`;
}

// ===================== 開票 =====================
function computeResult() {
  const turnout = Math.min(0.66, 0.44 + G.fame * 0.0013 + (G.flags.allBoards ? 0.02 : 0));
  const areas = {};
  const totals = { p: 0, g: 0, a: 0 };
  AREA_IDS.forEach(id => {
    const s = shareOf(id);
    const n = () => 1 + (Math.random() - 0.5) * 0.05;
    const raw = { p: s.p * n(), g: s.g * n(), a: s.a * n() };
    const t = raw.p + raw.g + raw.a;
    const voters = AREAS[id].voters * (turnout + (Math.random() - 0.5) * 0.04);
    areas[id] = {};
    ['p', 'g', 'a'].forEach(k => {
      areas[id][k] = Math.round(voters * raw[k] / t);
      totals[k] += areas[id][k];
    });
  });
  const all = totals.p + totals.g + totals.a;
  const order = ['p', 'g', 'a'].sort((x, y) => totals[y] - totals[x]);
  return { areas, totals, all, order, turnout };
}

async function electionNight() {
  G.scene = 'election';
  const R = computeResult();
  G.result = R;
  const winner = R.order[0];
  const lead = (R.totals[R.order[0]] - R.totals[R.order[1]]) / R.all;

  await UI.fadeOut();
  await UI.fadeIn();
  await UI.say(
    '投票日。',
    '{N}は 地元の 投票所で 自分の名前を 書いた。',
    '…やれることは すべて やった。あとは 県民の 判断を 待つだけだ。',
    '午後8時。投票が 締め切られた。',
    'スタッフ「テレビ、つけます！」'
  );
  UI.closeMsg();
  BGM.play('election');

  const panel = document.getElementById('panel');
  panel.classList.remove('hidden');
  const fmtN = n => n.toLocaleString('ja-JP');
  const render = (counted, timeStr, rate, flash) => {
    const tot = { p: 0, g: 0, a: 0 };
    AREA_IDS.forEach(id => ['p', 'g', 'a'].forEach(k => { tot[k] += counted[id][k]; }));
    const order = ['p', 'g', 'a'].sort((x, y) => tot[y] - tot[x]);
    let h = `<h2>HTV 開票速報　ひなた県知事選挙　<span class="dim">${timeStr}</span></h2>`;
    h += `<p>開票率 <b>${rate}%</b>　投票率 ${(R.turnout * 100).toFixed(1)}%</p><table>`;
    order.forEach(k => {
      const mark = G.decided === k ? '<span class="bad">当確</span> ' : '';
      h += `<tr><td>${mark}<span class="${candCls(k)}">■ ${candName(k)}</span></td><td style="text-align:right">${fmtN(tot[k])} 票</td></tr>`;
    });
    h += '</table><h3>地区別</h3><table>';
    AREA_IDS.forEach(id => {
      const c = counted[id];
      h += `<tr><td>${AREAS[id].name}</td><td class="c-p">${fmtN(c.p)}</td><td class="c-g">${fmtN(c.g)}</td><td class="c-a">${fmtN(c.a)}</td></tr>`;
    });
    h += '</table>';
    if (flash) h += `<p class="bad" style="font-size:4cqw;text-align:center">${flash}</p>`;
    panel.innerHTML = h;
  };
  const zero = () => { const c = {}; AREA_IDS.forEach(id => { c[id] = { p: 0, g: 0, a: 0 }; }); return c; };
  G.decided = null;

  render(zero(), '午後8時00分', 0);
  await UI.sleep(1500);

  if (lead >= 0.07) {
    G.decided = winner;
    render(zero(), '午後8時00分', 0, `速報　${candName(winner)}氏　当選確実`);
    BGM.stop();
    Sound.encounter();
    await UI.showBanner(`${candName(winner)}　当選確実`, 2600);
    await UI.sleep(400);
  } else {
    const speed = { aoba: 1.6, yukemuri: 1.4, minato: 1.15, sakura: 0.95, chuo: 0.8 };
    const delay = { aoba: 0, yukemuri: 0, minato: 1, sakura: 1, chuo: 2 };
    const jit = {};
    AREA_IDS.forEach(id => { jit[id] = { p: Math.random(), g: Math.random(), a: Math.random() }; });
    for (let k = 1; k < 60; k++) {
      const counted = {};
      let cnt = 0;
      AREA_IDS.forEach(id => {
        const f = Math.max(0, Math.min(1, (k - delay[id]) * 0.07 * speed[id]));
        counted[id] = {};
        ['p', 'g', 'a'].forEach(c => {
          // 序盤は 開票順の偏りで ぶれる
          const j = 1 + (jit[id][c] - 0.5) * 0.16 * (1 - f) * Math.sin(k * 0.7 + jit[id][c] * 6);
          counted[id][c] = Math.round(R.areas[id][c] * f * j / 100) * 100;
          cnt += counted[id][c];
        });
      });
      const rate = Math.min(100, Math.round(cnt / R.all * 100));
      const mins = 20 * 60 + 30 + k * 15;
      const hh = Math.floor(mins / 60), mm = mins % 60;
      const timeStr = `${hh >= 24 ? '午前' + (hh - 24) : '午後' + (hh - 12)}時${String(mm).padStart(2, '0')}分`;
      const done = AREA_IDS.every(id => Math.min(1, (k - delay[id]) * 0.07 * speed[id]) >= 1);
      const fr = cnt / R.all;
      if (!G.decided && (done || (fr > 0.08 && lead > 0.12 * Math.pow(1 - fr, 1.1)))) {
        G.decided = winner;
        render(done ? (() => { const c = {}; AREA_IDS.forEach(id => { c[id] = Object.assign({}, R.areas[id]); }); return c; })() : counted,
          timeStr, done ? 100 : rate, `速報　${candName(winner)}氏　当選確実`);
        BGM.stop();
        Sound.encounter();
        await UI.showBanner(`${candName(winner)}　当選確実`, 2600);
        break;
      }
      render(counted, timeStr, rate);
      Sound.blip();
      await UI.sleep(900);
    }
  }
  await UI.sleep(600);
  panel.classList.add('hidden');
  await ending(R);
}

function endingRank(R) {
  const p = R.totals.p / R.all;
  if (R.order[0] === 'p') {
    const lead = (R.totals.p - R.totals[R.order[1]]) / R.all;
    if (lead > 0.15) return '伝説の 県知事';
    if (lead > 0.07) return '県民の 希望の星';
    if (lead > 0.02) return 'ドブ板の 達人';
    return '奇跡の 辛勝知事';
  }
  if (R.order[1] === 'p') return p > 0.3 ? '惜敗の 次期有力候補' : '善戦の 新人';
  return p > 0.15 ? '健闘の 新人' : '泡沫候補';
}

async function ending(R) {
  const win = R.order[0] === 'p';
  if (win) {
    BGM.play('victory');
    await UI.say(
      '事務所は 割れんばかりの 歓声に つつまれた！',
      'スタッフ「やった… やりましたよ、{N}さん！！」',
      '{N}は 大きな だるまに 墨で 目を 入れた。',
      '「バンザーイ！ バンザーイ！ バンザーイ！」',
      '{N}は ひなた県知事に 当選した！'
    );
    const epi = [];
    if (G.flags.dam) epi.push('…しかし 就任後、建設業協会との ダム推進の 約束が 重くのしかかることに なる。');
    if (G.flags.bigshot) epi.push('…党本部からは さっそく 「お祝い」の 電話が かかってきた。鬼瓦幹事長の 笑い声が 耳に 残った。');
    if (G.flags.bribe) epi.push('…数か月後、例の 封筒の件で 県警から 呼び出しが かかった。');
    if (G.flags.dog) epi.push('看板犬は 知事公舎で 暮らすことに なった。');
    if (G.flags.grannyHelped) epi.push('当選祝いの 花束の中に、あの おばあさんからの 手紙が あった。「やっぱり あんたは いい人だった」');
    if (epi.length) await UI.say(...epi);
  } else {
    BGM.play('defeat');
    const w = R.order[0];
    await UI.say(
      '事務所は 静まりかえった…',
      `${candName(w)}氏の 事務所から 歓声が 聞こえてくる。`,
      '{N}は 支持者の前に 立ち、深々と 頭を 下げた。',
      '{N}「私の 力不足です。…ですが、この17日間で 出会った 皆さんの 声は 決して 忘れません」',
      '支持者「{N}さーん！ 次こそ！」'
    );
  }
  UI.closeMsg();
  const rank = endingRank(R);
  const pct = k => (R.totals[k] / R.all * 100).toFixed(1);
  const endorsed = Object.keys(ORGS).filter(k => G.org[k].endorsed).map(k => ORGS[k].name);
  let h = `<h2>${win ? '🎉 当選！' : '落選…'}　称号：「${rank}」</h2><table>`;
  R.order.forEach((k, i) => {
    h += `<tr><td>${i === 0 ? '当' : '　'}</td><td class="${candCls(k)}">${candName(k)}</td><td style="text-align:right">${R.totals[k].toLocaleString('ja-JP')} 票</td><td>${pct(k)}%</td></tr>`;
  });
  h += `</table><p>投票率 ${(R.turnout * 100).toFixed(1)}%</p>`;
  h += '<h3>選挙戦の 記録</h3>';
  h += `<p>最終知名度 ${Math.round(G.fame)}　／　貼ったポスター ${Object.keys(G.boards).length}/${MAP.boards.length}か所　／　残り資金 ${G.money}万円</p>`;
  h += `<p>推薦団体：${endorsed.length ? endorsed.join('、') : 'なし'}</p>`;
  if (G.log.length) h += '<p>' + G.log.map(l => `・${l.day}日目　${l.text}`).join('<br>') + '</p>';
  await UI.showPanel(h);
  try { localStorage.removeItem('kenchiji_save'); } catch (e) { /* ignore */ }
  const text = win
    ? `「県知事になろう」で ひなた県知事に 当選しました！ 得票率 ${pct('p')}%　称号「${rank}」 #県知事になろう`
    : `「県知事になろう」で ひなた県知事選に 挑戦… ${R.order.indexOf('p') + 1}位（得票率 ${pct('p')}%）　称号「${rank}」 #県知事になろう`;
  while (true) {
    const c = await UI.ask('おつかれさまでした！', ['タイトルに もどる', '結果を シェアする']);
    if (c === 0) break;
    const r = await Native.share(text);
    if (r === 'copied') await UI.say('結果を クリップボードに コピーしました。');
    else if (r === 'failed') await UI.say('シェアできませんでした…');
  }
  location.reload();
}
