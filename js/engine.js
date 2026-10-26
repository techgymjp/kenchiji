'use strict';
// ゲーム本体：状態・フィールド移動・描画・一日の流れ・タイトル

let G = null;
const SAVE_KEY = 'kenchiji_save';
let VIEW_W = 17;
const VIEW_H = 13;
const DAY_START = 8 * 60, DAY_END = 20 * 60;
const LAST_DAY = 17;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

// 画面の向き：アプリやスマホの横画面では、左右に操作ボタンを置き、ゲーム画面を横に広げる
function layout() {
  const touch = document.body.classList.contains('native') || matchMedia('(pointer: coarse)').matches;
  document.body.classList.toggle('land', touch && innerWidth > innerHeight);
  const screen = document.getElementById('screen');
  const aspect = document.body.classList.contains('land') && screen.clientHeight
    ? screen.clientWidth / screen.clientHeight : 272 / 208;
  const w = Math.max(208, Math.min(480, Math.round(208 * aspect / 2) * 2));
  if (cv.width !== w) {
    cv.width = w;
    ctx.imageSmoothingEnabled = false;
  }
  VIEW_W = Math.ceil(w / TS);
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 200));
// バナー広告の高さが変わったとき（画面が縮む）にも合わせる
new ResizeObserver(layout).observe(document.getElementById('screen'));

// ===================== 状態 =====================
function freshDaily() {
  return { speech: {}, themes: {}, org: {}, rest: {}, npc: {}, enc: {}, luck: false, warned: {} };
}

function newGame(name) {
  const org = {};
  Object.keys(ORGS).forEach(k => { org[k] = { rel: 0, endorsed: false, q: 0 }; });
  org.kensetsu.rel = 10;
  G = {
    name, day: 1, min: DAY_START, hp: 100, money: 2000, fame: 10, posters: 30,
    x: 27, y: 27, dir: 'down',
    sup: JSON.parse(JSON.stringify(INITIAL_SUPPORT)),
    org, flags: {}, once: {}, log: [], boards: {}, schedDone: {}, newsUsed: [],
    pending: [{ day: 16, id: 'd_bigshot' }, { day: 7 + Math.floor(Math.random() * 5), id: 'd_rival_gaffe' }],
    daily: freshDaily(), mainTheme: null, interviews: 0, dayGain: 0, stepsSinceEnc: 0, steps: 0,
    endEarly: false, collapsed: false, scene: 'field',
  };
  UI.vars.N = name;
}

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); return true; } catch (e) { return false; }
}
function loadSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

// ===================== 効果 =====================
function supLine(name, n) {
  const a = Math.abs(n);
  const p = { a: name };
  if (n > 0) return a >= 3 ? tr('{a}で 支持が ぐんと ひろがった！', p) : a >= 1.2 ? tr('{a}で 支持が ひろがった！', p) : tr('{a}で 支持が すこし ひろがった！', p);
  return a >= 3 ? tr('{a}で 支持が ぐんと へった…', p) : a >= 1.2 ? tr('{a}で 支持が へった…', p) : tr('{a}で 支持が すこし へった…', p);
}

async function applyFx(o, ctxArea) {
  const lines = [];
  let good = 0, bad = 0;
  const area = o.area || ctxArea || MAP.areaAt(G.x, G.y);
  const addP = (a, n) => {
    G.sup[a].p = Math.max(1, G.sup[a].p + n);
    G.dayGain += n * AREAS[a].voters / 192000;
  };
  const sup = (a, n, label) => {
    if (!n) return;
    addP(a, n);
    lines.push(supLine(label || AREAS[a].name, n));
    if (n > 0) good++; else bad++;
  };
  if (o.sup) sup(area, o.sup);
  if (o.at) Object.keys(o.at).forEach(a => sup(a, o.at[a]));
  if (o.all) {
    AREA_IDS.forEach(a => addP(a, o.all));
    lines.push(supLine(tr('県内全体'), o.all));
    if (o.all > 0) good++; else bad++;
  }
  const rival = (k, perArea, label) => {
    let sum = 0;
    Object.keys(perArea).forEach(a => {
      G.sup[a][k] = Math.max(1, G.sup[a][k] + perArea[a]);
      sum += perArea[a];
    });
    if (sum) lines.push(sum < 0 ? tr('{c}陣営の 勢いが にぶった！', { c: label }) : tr('{c}陣営が 勢いづいている…', { c: label }));
  };
  const allAreas = n => Object.fromEntries(AREA_IDS.map(a => [a, n]));
  if (o.g) rival('g', allAreas(o.g), RIVALS.g.short);
  if (o.ga) rival('g', o.ga, RIVALS.g.short);
  if (o.ar) rival('a', allAreas(o.ar), RIVALS.a.short);
  if (o.fame) {
    const before = G.fame;
    G.fame = Math.max(0, Math.min(100, G.fame + o.fame));
    const d = Math.round(G.fame - before);
    if (d > 0) { lines.push(tr('知名度が {n} あがった！', { n: d })); good++; }
    else if (d < 0) lines.push(tr('知名度が {n} さがった…', { n: -d }));
  }
  if (o.money) {
    G.money = Math.round(G.money + o.money);
    lines.push(o.money > 0 ? tr('資金が {m} ふえた！', { m: fmtMoney(o.money) }) : tr('資金を {m} つかった。', { m: fmtMoney(-o.money) }));
  }
  if (o.hp) {
    const before = G.hp;
    G.hp = Math.max(0, Math.min(100, G.hp + o.hp));
    const d = Math.round(G.hp - before);
    if (d > 0) lines.push(tr('体力が {n} かいふくした！', { n: d }));
    else if (d < 0) lines.push(tr('体力が {n} へった。', { n: -d }));
  }
  if (o.posters) {
    G.posters += o.posters;
    lines.push(tr('ポスターが {n}枚 とどいた！', { n: o.posters }));
  }
  if (o.org) {
    Object.keys(o.org).forEach(id => {
      const st = G.org[id];
      if (!st || st.endorsed || !o.org[id]) return;
      st.rel = Math.max(0, Math.min(100, st.rel + o.org[id]));
      lines.push(tr(o.org[id] > 0 ? '{o}の 信頼度が あがった！' : '{o}の 信頼度が さがった…', { o: ORGS[id].name }));
    });
  }
  if (o.time) G.min += o.time;
  updateStatus();
  if (o.quiet || !lines.length) return;
  if (bad > good) Sound.bad(); else if (good) Sound.good();
  const pages = [];
  for (let i = 0; i < lines.length; i += 3) pages.push(lines.slice(i, i + 3).join('\n'));
  await UI.say(...pages);
}

function makeX(area) {
  area = area || MAP.areaAt(G.x, G.y);
  return {
    area,
    areaName: AREAS[area].name,
    say: (...p) => UI.say(...p),
    ask: (t, o, opt) => UI.ask(t, o, opt),
    fx: o => applyFx(o, area),
    chance: p => Math.random() < p * (G.daily.luck ? 0.5 : 1),
    later: (d, id) => G.pending.push({ day: G.day + d, id }),
    flag: (k, v = true) => { G.flags[k] = v; },
    has: k => !!G.flags[k],
    log: (t, p) => G.log.push({ day: G.day, text: t, p }),
  };
}

// ===================== 実行制御 =====================
let running = false;

async function runEvent(fn) {
  if (running) return;
  running = true;
  try {
    await fn();
  } catch (e) {
    console.error(e);
  }
  UI.closeMsg();
  try {
    await checkDayEnd();
  } catch (e) {
    console.error(e);
  }
  UI.closeMsg();
  updateStatus();
  if (G.scene === 'field') BGM.play(fieldTrack());
  running = false;
}

// フィールドの曲（夕方からは夜の曲）
function fieldTrack() {
  return G.min >= 17 * 60 ? 'evening' : 'field';
}

// 後から届く悪い知らせ
const BAD_NEWS = new Set(['d_affair', 'd_bribe', 'd_stealth', 'd_drunk_gaffe', 'd_yakuza', 'd_ryotei',
  'd_poster_misread', 'd_celeb', 'd_cult', 'd_angry_clip', 'd_dam', 'd_cold']);

async function checkDayEnd() {
  if (G.scene !== 'field') return;
  if (G.hp <= 0) {
    BGM.play('trouble');
    Sound.bad();
    await UI.say('{N}は ふらふらと よろめいた…', 'バタッ！', '{N}は 過労で 倒れてしまった！');
    // Android アプリでは リワード広告を見れば その日の活動を続けられる（1日1回）
    if (Ads.rewardedAvailable && !G.daily.revived) {
      const c = await UI.ask('スタッフ「{N}さん！ 支援者からの 応援動画が 届いてます！ 見ますか？」', ['応援動画を 見て 立ちあがる（広告）', '今日は もう 休む']);
      if (c === 0) {
        const r = await Ads.showRewarded();
        if (r === 'rewarded') {
          G.daily.revived = true;
          G.hp = 60;
          updateStatus();
          await UI.say('「負けるなー！」「まだ 終わってないぞ！」', '{N}は 応援の 声に 励まされて 立ちあがった！', '体力が 60 まで かいふくした！');
          return;
        }
        await UI.say(r === 'skipped' ? '…動画を 最後まで 見られなかった。' : 'いまは 応援動画を 見られないようだ…');
      }
    }
    await UI.say('…気がつくと 病院の ベッドの上だった。', 'スタッフ「今日は もう 休んでください！」');
    G.collapsed = true;
    await nightSequence();
    return;
  }
  if (G.endEarly || G.min >= DAY_END) {
    if (!G.endEarly) await UI.say('午後8時に なった。', '選挙運動が できるのは ここまでだ。事務所に 戻ろう。');
    await nightSequence();
    return;
  }
  if (G.min >= 19 * 60 + 30 && !G.daily.warned.late) {
    G.daily.warned.late = true;
    await UI.say('（もうすぐ 夜8時だ。今日の 活動も あとわずか）');
  }
  if (G.hp < 20 && !G.daily.warned.hp) {
    G.daily.warned.hp = true;
    await UI.say('（体力が 残りわずかだ… 温泉や 病院、事務所で 休もう）');
  }
}

// ===================== 一日の流れ =====================
function starStr(n) {
  const s = Math.max(1, Math.min(5, n));
  return '★'.repeat(s) + '☆'.repeat(5 - s);
}

async function nightSequence() {
  G.scene = 'night';
  UI.closeMsg();
  BGM.play('night');
  await UI.fadeOut();
  let h = `<h2>${tr('{d}日目　終了', { d: G.day })}</h2>`;
  const g = G.dayGain;
  const stars = g >= 14 ? 5 : g >= 9 ? 4 : g >= 5 ? 3 : g >= 2 ? 2 : 1;
  h += `<p>${tr('今日の 手応え')}　<span class="stars">${starStr(stars)}</span></p>`;

  // 欠席した予定
  const missed = SCHEDULE.filter(s => s.day === G.day && !G.schedDone[s.id]);
  missed.forEach(s => {
    const pen = s.big ? -2.5 : -1;
    AREA_IDS.forEach(a => { G.sup[a].p = Math.max(1, G.sup[a].p + pen * (s.big ? 1 : 0.4)); });
    h += `<p class="bad">${tr('「{t}」を 欠席した…（支持 ダウン）', { t: s.title })}</p>`;
  });

  // ライバルのニュース
  const pool = RIVAL_NEWS.map((n, i) => i).filter(i => !G.newsUsed.includes(i));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick !== undefined) {
    G.newsUsed.push(pick);
    const n = RIVAL_NEWS[pick];
    await applyFx(Object.assign({ quiet: true }, n.fx));
    h += `<div class="news"><b>${tr('夜のニュース')}</b>${tr(n.t)}</div>`;
  }
  rivalDrift();
  if ([5, 10, 15].includes(G.day)) h += pollHtml();

  G.money -= 30;
  h += `<p class="dim">${tr('事務所の 経費　-{c}（残り {m}）', { c: fmtMoney(30), m: fmtMoney(G.money) })}</p>`;
  if (G.money < 0) {
    h += `<p class="bad">${tr('資金が 底をついた！ 支援者から 借金して しのいだ…')}</p>`;
    G.money = 0;
    AREA_IDS.forEach(a => { G.sup[a].p = Math.max(1, G.sup[a].p - 0.5); });
  }
  if (G.day >= LAST_DAY) {
    h += `<h3>${tr('17日間の 選挙戦が 終わった。')}</h3><p>${tr('明日は いよいよ 投票日だ…')}</p>`;
  } else {
    h += `<h3>${tr('選挙戦は 残り {n}日', { n: LAST_DAY - G.day })}</h3>`;
  }
  await UI.fadeIn();
  await UI.showPanel(h);
  // Android アプリでは 毎晩、夜の報告のあとに全画面広告を出す
  if (Ads.available) await Ads.showInterstitial();

  if (G.day >= LAST_DAY) {
    await electionNight();
    return;
  }

  // 翌朝へ
  const rec = G.collapsed ? 0 : (G.endEarly ? 65 : 45);
  G.hp = G.collapsed ? 60 : Math.min(100, G.hp + rec);
  G.collapsed = false;
  G.endEarly = false;
  G.day++;
  G.min = DAY_START;
  G.daily = freshDaily();
  G.dayGain = 0;
  G.x = 27; G.y = 27; G.dir = 'down';
  P.reset();
  await UI.fadeOut();
  G.scene = 'field';
  save();
  updateStatus();
  updateArea(true);
  BGM.play('town');
  await UI.fadeIn();
  await morning();
}

async function morning() {
  const left = LAST_DAY + 1 - G.day;
  await UI.say(tr('{d}日目の 朝が きた。\n投票日まで あと {n}日。', { d: G.day, n: left }) + (G.day === LAST_DAY ? '\n' + tr('今日が 選挙運動 最終日だ！') : ''));
  // 後から起きる出来事
  const due = G.pending.filter(p => p.day <= G.day);
  G.pending = G.pending.filter(p => p.day > G.day);
  for (const p of due) {
    if (DELAYED[p.id]) {
      if (BAD_NEWS.has(p.id)) BGM.play('trouble');
      await DELAYED[p.id](makeX('chuo'));
      BGM.play('town');
    }
  }
  // 今日の予定
  const today = SCHEDULE.filter(s => s.day === G.day);
  if (today.length) await UI.say(tr('スタッフ「今日の 予定です！」') + '\n' + today.map(s => '・' + s.title).join('\n'));
  // 作戦
  const c = await UI.ask('スタッフ「今日の 事務所の 作戦は どうしますか？」', [
    '電話作戦（30万円・県内全体の支持）', 'ビラのポスティング（20万円・知名度）', 'SNS発信（無料・若者に効く）', 'まかせる（何もしない）',
  ]);
  const X = makeX('chuo');
  if (c === 0 && G.money >= 30) { await UI.say('スタッフ総出で 電話作戦を 展開した！'); await X.fx({ money: -30, all: 0.5 }); }
  else if (c === 1 && G.money >= 20) { await UI.say('ボランティアが 県内に ビラを 配った！'); await X.fx({ money: -20, fame: 2 }); }
  else if (c === 2) {
    if (Math.random() < 0.15) { await UI.say('SNSの 投稿が… 言葉足らずで 炎上して しまった！'); await X.fx({ at: { chuo: -0.8, sakura: -0.8 } }); }
    else { await UI.say('SNSの 投稿が 若者に 拡散された！'); await X.fx({ at: { chuo: 0.7, sakura: 0.7 }, fame: 1 }); }
  } else if (c <= 1) await UI.say('資金が 足りない！');
  UI.closeMsg();
}

async function prologue() {
  await UI.say(
    'ここは ひなた県。人口 およそ 120万人。',
    '現職の 権田剛造知事は 業界団体を 固め、4期目を めざしている。',
    '元アナウンサーの 新井ひかりも 「女性知事の 誕生を」と 名乗りをあげた。',
    'そして もう一人――',
    '県庁を 辞めて 立候補した 新人、{N}。',
    '「このままでは ひなた県は ダメになる。県政を 変えるんだ！」',
    '知事選の 告示日。17日間の 選挙戦が いま 始まる！'
  );
  await UI.say('選挙事務所の 前で 出陣式だ！', '支援者たちが 「必勝」の ハチマキを 締めて 集まっている。');
  const keys = Object.keys(THEMES);
  const c = await UI.ask('第一声で 何を いちばんに 訴える？', keys.map(k => THEMES[k]));
  G.mainTheme = keys[c];
  const tp = { t: THEMES[G.mainTheme] };
  await UI.say(tr('{N}「私は 『{t}』で ひなた県を 変えます！」', tp), '支援者「うおおおー！」', tr('（演説で 「{t}」を 訴えると 効果が 少し 高まる）', tp));
  await UI.say(
    'スタッフ「{N}さん、基本を 確認しましょう！」',
    'スタッフ「県内を 歩きまわって 人と 話したり、施設を 訪ねたり、ポスターを 貼ったり しましょう」',
    'スタッフ「各地区の 演説台では 地域に 合った テーマで 演説すると 効果的です」',
    'スタッフ「農協や 漁協などの 団体に 何度も 挨拶して 信頼を 得れば、推薦が もらえるかも！」',
    'スタッフ「選挙運動は 朝8時から 夜8時まで。体力にも 気をつけて」',
    'スタッフ「Bボタン（X / Esc）で メニュー。選挙カーでの 移動も できますよ！」',
    'スタッフ「それと… 人助けは 大事ですが、写真や うまい話には くれぐれも 注意を！」'
  );
  UI.closeMsg();
  save();
}

// ===================== プレイヤー・NPC =====================
const P = {
  fx: 0, fy: 0, t: 1, moving: false, frame: 0, animT: 0, bumpT: 0,
  reset() { this.fx = G.x; this.fy = G.y; this.t = 1; this.moving = false; },
  get px() { return this.moving ? this.fx + (G.x - this.fx) * this.t : G.x; },
  get py() { return this.moving ? this.fy + (G.y - this.fy) * this.t : G.y; },
};

const NPCS = NPCS_DEF.map(([x, y, type, lines]) => {
  const [nx, ny] = MAP.nearestPassable(x, y);
  return { x: nx, y: ny, hx: nx, hy: ny, fx: nx, fy: ny, t: 1, type, lines, dir: 'down', frame: 0, next: Math.random() * 2000 };
});
NPCS.forEach((n, i) => { n.id = i; });

function npcAt(x, y) { return NPCS.find(n => n.x === x && n.y === y); }

const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

function canWalk(x, y) {
  return MAP.passable(x, y) && !npcAt(x, y);
}

let lastDirKey = null;
Input.on(k => {
  if (G === null || G.scene !== 'field' || running) return;
  if (DIRS[k]) lastDirKey = k;
  if (k === 'a') runEvent(examine);
  else if (k === 'b') runEvent(commandMenu);
});

function update(dt) {
  if (!G || G.scene !== 'field') return;
  // NPC
  NPCS.forEach(n => {
    if (n.t < 1) {
      n.t = Math.min(1, n.t + dt / 260);
      n.frame = n.t < 0.5 ? 1 : 0;
      return;
    }
    n.next -= dt;
    if (n.next > 0 || running) return;
    n.next = 1200 + Math.random() * 2500;
    const keys = Object.keys(DIRS);
    const d = keys[Math.floor(Math.random() * 4)];
    const [dx, dy] = DIRS[d];
    const nx = n.x + dx, ny = n.y + dy;
    n.dir = d;
    if (Math.abs(nx - n.hx) > 2 || Math.abs(ny - n.hy) > 2) return;
    if (!MAP.passable(nx, ny) || MAP.get(nx, ny) === T.DOOR || npcAt(nx, ny)) return;
    if ((nx === G.x && ny === G.y) || (P.moving && nx === P.fx && ny === P.fy)) return;
    n.fx = n.x; n.fy = n.y; n.x = nx; n.y = ny; n.t = 0;
  });

  if (running) return;
  if (P.moving) {
    P.t = Math.min(1, P.t + dt / 150);
    P.animT += dt;
    if (P.t >= 1) {
      P.moving = false;
      onStep();
    }
    return;
  }
  let dir = null;
  if (lastDirKey && Input.held.has(lastDirKey)) dir = lastDirKey;
  else dir = ['up', 'down', 'left', 'right'].find(d => Input.held.has(d)) || null;
  if (!dir) return;
  G.dir = dir;
  const [dx, dy] = DIRS[dir];
  const nx = G.x + dx, ny = G.y + dy;
  if (canWalk(nx, ny)) {
    P.fx = G.x; P.fy = G.y; P.t = 0; P.moving = true;
    G.x = nx; G.y = ny;
    P.frame ^= 1;
  } else {
    P.bumpT -= dt;
    if (P.bumpT <= 0) { Sound.bump(); P.bumpT = 300; }
  }
}

function onStep() {
  G.min += 1;
  G.steps++;
  G.stepsSinceEnc++;
  if (G.steps % 12 === 0) G.hp = Math.max(0, G.hp - 1);
  updateStatus();
  updateArea();
  if (!running) BGM.play(fieldTrack());
  const b = MAP.doorAt[`${G.x},${G.y}`];
  if (b) {
    runEvent(async () => {
      await enterBuilding(b);
      G.x = b.door[0]; G.y = b.door[1] + 1; G.dir = 'down';
      P.reset();
    });
    return;
  }
  if (G.min >= DAY_END || G.hp <= 0) { runEvent(async () => {}); return; }
  // ランダムエンカウント
  if (G.stepsSinceEnc >= 16 && Math.random() < 0.055) {
    const area = MAP.areaAt(G.x, G.y);
    const list = ENCOUNTERS.filter(e =>
      (!e.areas || e.areas.includes(area)) &&
      !(e.once && G.once[e.id]) && !G.daily.enc[e.id] &&
      (!e.cond || e.cond()));
    if (list.length) {
      let r = Math.random() * list.reduce((s, e) => s + e.w, 0);
      const ev = list.find(e => (r -= e.w) < 0) || list[0];
      G.stepsSinceEnc = 0;
      G.once[ev.id] = true;
      G.daily.enc[ev.id] = true;
      runEvent(async () => {
        BGM.play('event');
        Sound.encounter();
        await UI.flash(3);
        await ev.run(makeX(area));
      });
    }
  }
}

async function enterBuilding(b) {
  const X = makeX(b.area);
  const h = G.min / 60;
  const sch = SCHEDULE.find(s => s.at === b.id && s.day === G.day && !G.schedDone[s.id]);
  if (sch) {
    if (h >= sch.from && h < sch.to) {
      G.schedDone[sch.id] = true;
      BGM.play(sch.big ? 'debate' : 'event');
      Sound.encounter();
      await UI.flash(2);
      await SCHEDULED_EVENTS[sch.id](X);
      return;
    }
    if (h < sch.from) await UI.say(tr('今日は ここで 「{t}」が ある。\nまだ 始まっていないようだ。', { t: sch.title }));
  }
  const f = FACILITIES[b.id];
  BGM.play('town');
  if (f) await f(X);
  else await UI.say(tr('{b}だ。', { b: b.label }));
}

async function examine() {
  const [dx, dy] = DIRS[G.dir];
  const tx = G.x + dx, ty = G.y + dy;
  const n = npcAt(tx, ty);
  const X = makeX();
  if (n) {
    n.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[G.dir];
    const lines = typeof n.lines === 'function' ? n.lines() : n.lines;
    const line = lines[Math.floor(Math.random() * lines.length)];
    await UI.say(line);
    const voter = !['staff', 'arai', 'dog', 'police'].includes(n.type);
    if (voter && !G.daily.npc[n.id]) {
      G.daily.npc[n.id] = true;
      await UI.say('{N}は 両手で しっかり 握手した！');
      await X.fx({ sup: 0.25, time: 3, quiet: true });
    }
    return;
  }
  const bd = MAP.boardAt[`${tx},${ty}`];
  if (bd) { await doBoard(X, bd); return; }
  const pd = MAP.podiumAt[`${tx},${ty}`];
  if (pd) {
    const sch = SCHEDULE.find(s => s.at === 'station' && s.day === G.day && !G.schedDone[s.id]);
    if (pd.id === 'p_chuo' && sch && G.min / 60 >= sch.from) {
      G.schedDone[sch.id] = true;
      BGM.play('debate');
      await SCHEDULED_EVENTS[sch.id](makeX('chuo'));
      return;
    }
    await doSpeech(X, pd);
    return;
  }
  await UI.say('{N}は あたりを しらべた。\nとくに なにも みつからなかった。');
}

// ===================== メニュー =====================
async function commandMenu() {
  while (true) {
    const c = await UI.choose([
      'いどう（選挙カー）', 'つよさ', 'じょうせい', 'にってい', 'てちょう', 'セーブ', tr(Sound.on ? 'おと：ON' : 'おと：OFF'), 'タイトルに もどる', 'とじる',
    ], { cancel: true, pos: 'left top', title: 'コマンド' });
    if (c < 0 || c === 8) return;
    if (c === 0) { if (await carMove()) return; }
    else if (c === 1) await UI.showPanel(statusHtml());
    else if (c === 2) await UI.showPanel(situationHtml());
    else if (c === 3) await UI.showPanel(scheduleHtml());
    else if (c === 4) await UI.showPanel(logHtml());
    else if (c === 5) { await UI.say(save() ? 'セーブしました。' : 'セーブできませんでした…'); UI.closeMsg(); }
    else if (c === 6) Sound.toggle();
    else if (c === 7) {
      const y = await UI.ask('セーブして タイトルに もどりますか？\n（「つづきから」で 今の状態から 再開できます）', ['もどる', 'やめる'], { cancel: true });
      UI.closeMsg();
      if (y === 0) {
        save();
        await UI.fadeOut();
        location.reload();
        return;
      }
    }
  }
}

async function carMove() {
  const dests = [[tr('選挙事務所前'), 'chuo', [27, 27]], ...AREA_IDS.map(a => [AREAS[a].name, a, AREAS[a].hub])];
  const c = await UI.choose([...dests.map(d => d[0]), 'やめる'], { cancel: true, pos: 'left top', title: '選挙カーで どこへ？（30分）' });
  if (c < 0 || c === dests.length) return false;
  const [label, area, [x, y]] = dests[c];
  await UI.fadeOut();
  G.x = x; G.y = y; G.dir = 'down';
  const blocker = npcAt(x, y);
  if (blocker) { const [nx, ny] = MAP.nearestPassable(x + 1, y); blocker.x = nx; blocker.y = ny; blocker.t = 1; }
  P.reset();
  updateArea(true);
  await UI.fadeIn();
  await UI.say(tr('選挙カーで {a}へ 移動した。\n「{N}、{N}で ございます！」', { a: label }));
  await applyFx({ at: { [area]: 0.3 }, time: 30, hp: 3, quiet: true });
  return true;
}

function statusHtml() {
  const end = Object.keys(ORGS).map(k => {
    const st = G.org[k];
    const n = Math.max(0, Math.min(10, Math.round(st.rel / 10)));
    return `<tr><td>${ORGS[k].name}</td><td>${st.endorsed ? `<span class="good">${tr('推薦獲得！')}</span>` : '■'.repeat(n) + '□'.repeat(10 - n)}</td></tr>`;
  }).join('');
  return `<h2>${tr('つよさ')}</h2><table>
    <tr><td>${tr('なまえ')}</td><td>${G.name}</td></tr>
    <tr><td>${tr('体力')}</td><td>${G.hp} / 100</td></tr>
    <tr><td>${tr('資金')}</td><td>${fmtMoney(G.money)}</td></tr>
    <tr><td>${tr('知名度')}</td><td>${Math.round(G.fame)}</td></tr>
    <tr><td>${tr('ポスター')}</td><td>${tr('手持ち {n}枚　（掲示 {b}/{t}か所）', { n: G.posters, b: Object.keys(G.boards).length, t: MAP.boards.length })}</td></tr>
    <tr><td>${tr('第一声のテーマ')}</td><td>${THEMES[G.mainTheme] || '-'}</td></tr>
    </table><h3>${tr('団体の 信頼度')}</h3><table>${end}</table>
    <p class="dim">${tr('信頼度が 8割を こえたら 推薦を お願いしてみよう')}</p>`;
}

function scheduleHtml() {
  let h = `<h2>${tr('にってい')}</h2><table>`;
  SCHEDULE.forEach(s => {
    const st = G.schedDone[s.id] ? `<span class="good">${tr('済')}</span>` : s.day < G.day ? `<span class="dim">${tr('欠席')}</span>` : s.day === G.day ? `<span class="bad">${tr('今日！')}</span>` : '';
    h += `<tr><td>${tr('{d}日目', { d: s.day })}</td><td>${s.title}</td><td>${st}</td></tr>`;
  });
  h += `<tr><td>${tr('5・10・15日目')}</td><td>${tr('新聞の 世論調査（夜に発表）')}</td><td></td></tr>`;
  h += `<tr><td>${tr('{d}日目', { d: LAST_DAY + 1 })}</td><td>${tr('投票日・開票')}</td><td></td></tr></table>`;
  return h;
}

function logHtml() {
  if (!G.log.length) return `<h2>${tr('てちょう')}</h2><p>${tr('まだ 特別な 出来事は ない。')}</p>`;
  return `<h2>${tr('てちょう')}</h2><p>` + G.log.map(logLine).join('<br>') + '</p>';
}

// てちょうの 1行（推薦団体の名前など、あとから言語を切り替えても訳せるように {名前} の形で記録している）
function logLine(l) {
  const p = Object.assign({}, l.p);
  if (p.org) p.o = ORGS[p.org].name;
  return tr('{d}日目', { d: l.day }) + '　' + UI.fmt(tr(l.text, p));
}

// ===================== 表示 =====================
const statusEl = document.getElementById('status');
const areaEl = document.getElementById('areaLabel');
let curArea = null;

function updateStatus() {
  if (!G) return;
  const m = Math.min(G.min, DAY_END);
  const hh = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
  statusEl.innerHTML =
    `<div class="row day"><span>${tr('{d}日目', { d: G.day })}</span><span>${G.day <= LAST_DAY ? tr('あと{n}日', { n: LAST_DAY + 1 - G.day }) : tr('投票日')}</span></div>` +
    `<div class="row"><span>${tr('時刻')}</span><span>${hh}:${mm}</span></div>` +
    `<div class="row${G.hp < 25 ? ' warn' : ''}"><span>${tr('体力')}</span><span>${G.hp}</span></div>` +
    `<div class="row"><span>${tr('資金')}</span><span>${fmtMoney(G.money, true)}</span></div>` +
    `<div class="row"><span>${tr('知名度')}</span><span>${Math.round(G.fame)}</span></div>`;
}

function updateArea(force) {
  const a = MAP.areaAt(G.x, G.y);
  if (a !== curArea || force) {
    curArea = a;
    areaEl.textContent = AREAS[a].name;
  }
}

function drawBuilding(b, ox, oy) {
  const x0 = b.x * TS - ox, y0 = b.y * TS - oy;
  const w = b.w * TS, rh = (b.h - 1) * TS;
  ctx.fillStyle = b.roof;
  ctx.fillRect(x0, y0, w, rh);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 4; y < rh; y += 5) ctx.fillRect(x0, y0 + y, w, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x0, y0, w, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x0, y0 + rh - 2, w, 2);
  // 壁
  const wy = y0 + rh;
  ctx.fillStyle = b.wall;
  ctx.fillRect(x0, wy, w, TS);
  for (let i = 0; i < b.w; i++) {
    const tx = x0 + i * TS;
    if (b.x + i === b.door[0]) {
      ctx.fillStyle = '#5a3418';
      ctx.fillRect(tx + 3, wy + 3, 10, 13);
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(tx + 5, wy + 5, 6, 11);
      ctx.fillStyle = '#e8c040';
      ctx.fillRect(tx + 9, wy + 10, 1, 1);
    } else {
      ctx.fillStyle = '#555';
      ctx.fillRect(tx + 3, wy + 3, 10, 8);
      ctx.fillStyle = '#9ad0f0';
      ctx.fillRect(tx + 4, wy + 4, 8, 6);
      ctx.fillStyle = '#fff';
      ctx.fillRect(tx + 5, wy + 5, 2, 1);
    }
  }
  // 看板
  let size = 10;
  ctx.font = `${size}px "DotGothic16", monospace`;
  const label = b.label;
  let tw = ctx.measureText(label).width;
  while (tw > w - 6 && size > 6) {
    size--;
    ctx.font = `${size}px "DotGothic16", monospace`;
    tw = ctx.measureText(label).width;
  }
  const sx = Math.round(x0 + (w - tw) / 2) - 2, sy = Math.round(y0 + rh / 2 - size / 2) - 2;
  ctx.fillStyle = '#fff';
  ctx.fillRect(sx, sy, Math.ceil(tw) + 4, size + 4);
  ctx.fillStyle = '#222';
  ctx.fillRect(sx, sy + size + 3, Math.ceil(tw) + 4, 1);
  ctx.fillStyle = '#111';
  ctx.textBaseline = 'top';
  ctx.fillText(label, sx + 2, sy + 2);
}

function render(now) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cv.width, cv.height);
  if (!G) return;
  const ppx = P.px * TS, ppy = P.py * TS;
  const ox = Math.round(Math.max(0, Math.min(MAP.W * TS - cv.width, ppx + 8 - cv.width / 2)));
  const oy = Math.round(Math.max(0, Math.min(MAP.H * TS - cv.height, ppy + 8 - cv.height / 2)));
  const tx0 = Math.floor(ox / TS), ty0 = Math.floor(oy / TS);
  const anim = Math.floor(now / 600) % 2;
  for (let ty = ty0; ty <= ty0 + VIEW_H + 1; ty++) {
    for (let tx = tx0; tx <= tx0 + VIEW_W + 1; tx++) {
      if (tx >= MAP.W || ty >= MAP.H) continue;
      let t = MAP.get(tx, ty);
      let v = MAP.variant(tx, ty);
      if (t === T.BLD || t === T.DOOR) t = T.GRASS;
      if (t === T.WATER || t === T.ONSEN) v = (v + anim) % 2;
      if (t === T.BOARD) {
        const b = MAP.boardAt[`${tx},${ty}`];
        v = b && G.boards[b.id] ? 1 : 0;
      }
      ctx.drawImage(Sprites.tile(t, v), tx * TS - ox, ty * TS - oy);
    }
  }
  MAP.buildings.forEach(b => {
    if (b.x * TS - ox > cv.width || (b.x + b.w) * TS - ox < 0 || b.y * TS - oy > cv.height || (b.y + b.h) * TS - oy < 0) return;
    drawBuilding(b, ox, oy);
  });
  // キャラクター（y順）
  const chars = NPCS.map(n => ({
    x: (n.fx + (n.x - n.fx) * n.t) * TS, y: (n.fy + (n.y - n.fy) * n.t) * TS,
    img: Sprites.person(n.type, n.dir, n.t < 1 ? n.frame : (Math.floor(now / 500 + n.id) % 2)),
  }));
  if (G.flags.dog) {
    // 看板犬は事務所の前に
    chars.push({ x: 28 * TS, y: 27 * TS + 0, img: Sprites.person('dog', 'left', Math.floor(now / 400) % 2), dog: true });
  }
  const pf = P.moving ? (P.t < 0.5 ? P.frame : 0) : Math.floor(now / 500) % 2;
  chars.push({ x: ppx, y: ppy, img: Sprites.person('hero', G.dir, pf) });
  chars.sort((a, b) => a.y - b.y);
  chars.forEach(c => {
    const x = Math.round(c.x - ox), y = Math.round(c.y - oy);
    if (x < -16 || y < -16 || x > cv.width || y > cv.height) return;
    ctx.drawImage(c.img, x, y);
  });
  // 夕方〜夜の色
  if (G.scene === 'field' && G.min >= 16 * 60) {
    const k = Math.min(1, (G.min - 16 * 60) / 240);
    ctx.fillStyle = `rgba(${Math.round(255 - 200 * k)},${Math.round(120 - 90 * k)},${Math.round(40 + 60 * k)},${0.12 + 0.28 * k})`;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
}

let lastT = performance.now();
function loop(now) {
  const dt = Math.min(50, now - lastT);
  lastT = now;
  update(dt);
  render(now);
  requestAnimationFrame(loop);
}

// ===================== タイトル =====================
const titleEl = document.getElementById('title');
const titleMenu = document.getElementById('titleMenu');

function titleScreen() {
  const saved = loadSave();
  // 4つめは表示言語の切り替え（いまの言語ではないほうを表示する）
  const items = [{ label: 'はじめから' }, { label: 'つづきから', disabled: !saved }, { label: 'あそびかた' }, { label: '' }];
  let sel = 0;
  const render = () => {
    items[3].label = I18N.lang === 'ja' ? '🌐 English' : '🌐 日本語';
    titleMenu.innerHTML = items.map((o, i) =>
      `<div class="item${i === sel ? ' sel' : ''}${o.disabled ? ' dis' : ''}" data-i="${i}">${i < 3 ? tr(o.label) : o.label}</div>`).join('');
    titleMenu.querySelectorAll('.item').forEach(el => {
      el.onclick = () => { sel = +el.dataset.i; choose(); };
    });
  };
  const choose = () => {
    if (items[sel].disabled) { Sound.bump(); return; }
    Sound.ok();
    if (sel === 3) {
      I18N.set(I18N.lang === 'ja' ? 'en' : 'ja');
      render();
      return;
    }
    Input.release();
    if (sel === 2) {
      UI.showPanel(howToHtml()).then(titleScreen);
      return;
    }
    BGM.play('title');
    if (sel === 0) nameEntry();
    else startFromSave(saved);
  };
  Input.capture(k => {
    if (k === 'up' || k === 'down') {
      const d = k === 'up' ? -1 : 1;
      do { sel = (sel + d + items.length) % items.length; } while (items[sel].disabled);
      Sound.cursor();
      render();
    }
    else if (k === 'a') choose();
  });
  render();
  BGM.play('title');
  // バナーは起動してから ずっと画面の下に出しておく（2回目以降は何もしない）
  Ads.showBanner();
}

// あそびかた（操作説明）
function howToHtml() {
  const touch = document.body.classList.contains('native') || matchMedia('(pointer: coarse)').matches;
  const keys = touch
    ? [['十字ボタン', '歩く'], ['A ボタン', 'はなす・しらべる・決定'], ['B ボタン', 'メニュー（ポーズ）・キャンセル']]
    : [['矢印キー / WASD', '歩く'], ['Z / Enter / Space', 'はなす・しらべる・決定'], ['X / Esc', 'メニュー（ポーズ）・キャンセル']];
  const tips = [
    '17日間、朝8時から 夜8時まで 県内を 歩きまわって 支持を 集めよう。1歩で 1分 たつ。',
    '演説台では 地区に 合った テーマで 演説しよう（農村なら 農林水産業、工業団地なら 経済・雇用 など）。',
    'ポスター掲示板を しらべると ポスターを 貼れる。知名度が 低いと 支持が 票に なりにくい。',
    '農協や 漁協などの 団体に 何度も 挨拶して 信頼度を 8割まで 上げ、推薦を お願いしよう。',
    '歩いていると いろいろな 出来事に 出くわす。人助けは 大事だが、写真や うまい話には 注意！',
    '体力が なくなると 倒れてしまう。温泉・病院・喫茶店・事務所で 休もう。',
    'メニューの 「いどう」で 選挙カーに 乗れば 各地区へ すぐ 移動できる。',
    '投票日の夜は 開票速報。だれかに 「当選確実」が 出たら 決着だ！',
  ];
  return `<h2>${tr('あそびかた')}</h2><h3>${tr('そうさ')}</h3><table>` +
    keys.map(([k, v]) => `<tr><td>${tr(k)}</td><td>${tr(v)}</td></tr>`).join('') +
    `</table><h3>${tr('選挙戦の すすめかた')}</h3><p>` + tips.map(t => '・' + tr(t)).join('<br>') + '</p>';
}

function nameEntry() {
  const def = tr('日向 進');
  titleMenu.innerHTML = `<div>${tr('あなたの なまえを 入力してください')}</div><input id="nameIn" maxlength="16" value="${def}"><div class="item sel" id="nameOk">${tr('けってい')}</div>`;
  const inp = document.getElementById('nameIn');
  inp.focus();
  inp.select();
  const ok = () => {
    const name = (inp.value || '').trim() || def;
    Input.release();
    inp.blur();
    startNew(name);
  };
  document.getElementById('nameOk').onclick = ok;
  Input.capture(k => { if (k === 'a') ok(); });
}

async function startNew(name) {
  newGame(name);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  await beginField();
  running = true;
  BGM.play('town');
  try {
    await prologue();
    await UI.say('1日目の 活動 開始だ！');
  } finally {
    UI.closeMsg();
    BGM.play(fieldTrack());
    running = false;
  }
}

async function startFromSave(saved) {
  G = saved;
  G.scene = 'field';
  if (!G.daily) G.daily = freshDaily();
  UI.vars.N = G.name;
  await beginField();
  running = true;
  try {
    await UI.say(tr('{d}日目から 再開します。', { d: G.day }));
  } finally {
    UI.closeMsg();
    BGM.play(fieldTrack());
    running = false;
  }
}

async function beginField() {
  P.reset();
  await UI.fadeOut();
  titleEl.classList.add('hidden');
  statusEl.classList.remove('hidden');
  areaEl.classList.remove('hidden');
  updateStatus();
  updateArea(true);
  await UI.fadeIn();
}

// フォント読み込み後に開始
(async () => {
  try { await Promise.race([document.fonts.load('10px "DotGothic16"'), UI.sleep(2500)]); } catch (e) { /* ignore */ }
  requestAnimationFrame(loop);
  titleScreen();
})();
