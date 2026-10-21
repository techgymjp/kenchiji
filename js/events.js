'use strict';
// イベント定義
//   X.say(...) / X.ask(text, opts) / X.fx({...}) / X.chance(p) / X.later(days, id)
//   X.flag(k) / X.has(k) / X.area / X.log(text)
// fx: sup(現在地区) all(全地区) at{地区:値} g(権田・全地区) ga{地区:値} ar(新井・全地区)
//     fame money(万円) hp posters org{団体:信頼度} time(分)

// ===================== 団体 =====================
const ORGS = {
  nokyo: {
    name: 'あおば農協', bld: 'nokyo', area: 'aoba', boss: '組合長',
    endorse: { at: { aoba: 9 }, all: 0.8, ga: { aoba: -6 } },
    qs: [
      { q: '組合長「TPPだ 自由化だと 騒がしい。あんたは 農業の大規模化と自由化、どう考える？」',
        a: [['家族経営の農家を 守り抜きます', 30, '組合長「…うむ。その言葉、忘れんでくれよ」'],
            ['競争力強化のため 自由化を進めます', -15, '組合長「ふん。都会の学者みたいなことを言う」'],
            ['大規模化と家族経営の 両立を目指します', 12, '組合長「両立か。きれいごとに 聞こえんように 頼むぞ」']] },
      { q: '組合長「イノシシやシカの被害が ひどい。県は何をしてくれる？」',
        a: [['鳥獣対策予算を 倍増します', 25, '組合長「倍か！ 言ったな？」'],
            ['ハンターの育成を 支援します', 20, '組合長「若い猟師が 増えれば 助かる」'],
            ['自然との共生を 考えましょう', -5, '組合長「…共生しとるのは イノシシだけじゃ」']] },
      { q: '組合長「農業の後継者が おらん。どうする？」',
        a: [['新規就農者に 県独自の給付金を', 25, '組合長「ほう、具体的じゃな」'],
            ['スマート農業で 人手不足を補います', 15, '組合長「機械か。まあ 悪くはない」'],
            ['移住者に 期待しましょう', 0, '組合長「期待だけでは 田んぼは 耕せんぞ」']] },
    ],
  },
  gyokyo: {
    name: 'みなと漁協', bld: 'gyokyo', area: 'minato', boss: '組合長',
    endorse: { at: { minato: 9 }, all: 0.6, ga: { minato: -5 } },
    qs: [
      { q: '組合長「沖合の 洋上風力発電計画。あんたは 賛成か 反対か」',
        a: [['漁業者の同意なしに 進めません', 30, '組合長「…ようやく 話のわかる候補が 来たわい」'],
            ['脱炭素のため 推進します', -20, '組合長「帰ってくれ。海は 発電所じゃない」'],
            ['慎重に 検討します', 5, '組合長「検討、検討。役人と 同じ言葉じゃな」']] },
      { q: '組合長「燃料代が 上がって 船を出すたびに 赤字じゃ」',
        a: [['燃油高騰の 緊急補助を 出します', 25, '組合長「ありがたい。本当に頼むぞ」'],
            ['付加価値の高い ブランド魚を 育てましょう', 15, '組合長「ブランドか。若い衆が 喜びそうじゃ」'],
            ['漁業も 自己責任です', -25, '組合長「…あんた、海に 落ちたことは あるか」']] },
    ],
  },
  shoko: {
    name: '商工会議所', bld: 'shoko', area: 'chuo', boss: '大黒会頭',
    endorse: { at: { chuo: 7 }, all: 1.2, g: -1.5 },
    qs: [
      { q: '大黒会頭「中小企業は 人手不足と物価高で 青息吐息だ。どう支える？」',
        a: [['制度融資と 事業承継支援を 拡充します', 25, '会頭「現場が わかっとるね」'],
            ['規制緩和で 新しい商売を 後押しします', 15, '会頭「ふむ、悪くない」'],
            ['大企業の工場を 誘致します', 0, '会頭「下請けが 増えるだけ じゃなきゃいいがね」']] },
      { q: '大黒会頭「駅前の シャッター街。何か 手はあるかね」',
        a: [['空き店舗に 若い起業家を 呼び込みます', 25, '会頭「若い人か。にぎやかに なるといいね」'],
            ['郊外モールを 規制します', 5, '会頭「…モールにも 会員は いるんだよ」'],
            ['駐車場を 無料にします', 15, '会頭「ああ、それは 地味に 効くね」']] },
    ],
  },
  ishikai: {
    name: '県医師会', bld: 'ishikai', area: 'chuo', boss: '会長',
    endorse: { all: 1.8, at: { chuo: 2 }, g: -1 },
    qs: [
      { q: '会長「地方の 医師不足は 深刻です。具体策は？」',
        a: [['医学部の地域枠を 拡大します', 25, '会長「長い目で 見た 正しい策です」'],
            ['遠隔医療を 普及させます', 15, '会長「補助的には 有効でしょう」'],
            ['病院を 統合して 効率化します', -15, '会長「…地域の反発を わかって 言っていますか」']] },
      { q: '会長「救急車の 到着時間が 年々 延びています」',
        a: [['ドクターヘリを 増やします', 25, '会長「それは 心強い」'],
            ['救急の 適正利用を 呼びかけます', 10, '会長「啓発も 大事ですね」'],
            ['市町村の 問題です', -20, '会長「…県知事に なろうという方の 言葉とは 思えませんな」']] },
    ],
  },
  union: {
    name: '県労働組合', bld: 'union', area: 'sakura', boss: '委員長',
    endorse: { at: { sakura: 9 }, all: 0.5, ar: -1.5, ga: { sakura: -2 } },
    qs: [
      { q: '委員長「物価ばかり 上がって 給料は 上がらない。どうするんだ」',
        a: [['賃上げ企業を 県の発注で 優遇します', 30, '委員長「おお！ それは 効くぞ」'],
            ['最低賃金の 引き上げを 国に 求めます', 15, '委員長「国頼みか…まあいい」'],
            ['賃金は 経営者が 決めることです', -25, '委員長「帰れ帰れ！」']] },
      { q: '委員長「非正規の 仲間が 増えている」',
        a: [['正社員化した企業に 助成金を 出します', 25, '委員長「わかってるねえ」'],
            ['多様な 働き方を 尊重します', 5, '委員長「便利な 言葉だな」'],
            ['県庁から まず 改善します', 20, '委員長「足元から か。いいね」']] },
    ],
  },
  kanko: {
    name: 'ゆけむり観光協会', bld: 'kanko', area: 'yukemuri', boss: '会長',
    endorse: { at: { yukemuri: 9 }, all: 0.5, ga: { yukemuri: -5 } },
    qs: [
      { q: '会長「海外からの お客さんを 増やしたい。何が 必要だと思う？」',
        a: [['多言語の案内と 駅からの足を 整えます', 25, '会長「そう、それなのよ！」'],
            ['宿泊税を 導入して 財源にします', -10, '会長「お客さんが 減ったら どうするの」'],
            ['温泉を 世界ブランドに 育てます', 20, '会長「夢があるわね」']] },
      { q: '会長「旅館の 人手不足が ひどくて…」',
        a: [['観光人材の 育成学校を つくります', 25, '会長「若い子が 来てくれれば…」'],
            ['外国人材の 受け入れを 支援します', 15, '会長「現実的ね」'],
            ['機械化を 進めましょう', 0, '会長「おもてなしを ロボットに？」']] },
    ],
  },
  kensetsu: {
    name: '県建設業協会', bld: 'kensetsu', area: 'sakura', boss: '会長',
    endorse: { at: { sakura: 6, chuo: 3 }, all: 0.5, g: -1.5 },
    qs: [
      { q: '会長「ひなたダム建設計画、もちろん 推進してくれますな？ ウチの票は 大きいですよ」',
        a: [['推進を 約束します', 70, '会長「話が早い！ 我々も 全力で 応援しますぞ」', 'dam'],
            ['必要性を 一から 再検証します', -10, '会長「…権田さんは 約束してくれたがね」'],
            ['防災インフラ 全体の中で 考えます', 15, '会長「ふむ。まあ 前向きと 受け取っておこう」']] },
      { q: '会長「建設業の 担い手が 減って 災害対応も 危うい」',
        a: [['週休二日を 公共工事で 標準化します', 25, '会長「若い者が 来てくれるかもな」'],
            ['ICT施工を 支援します', 15, '会長「ドローンか。悪くない」'],
            ['民間で 頑張ってください', -20, '会長「災害の時だけ 頼られても 困るんだよ」']] },
    ],
  },
};

// ===================== 演説 =====================
async function doSpeech(X, pod) {
  const area = pod.area;
  if (G.daily.speech[pod.id] >= 2) {
    await X.say('今日は ここで もう2回 演説した。', '同じ場所ばかりでは 聴衆も 飽きてしまう。ほかの地区へ 行こう。');
    return;
  }
  const opts = Object.keys(THEMES).map(k => THEMES[k]);
  opts.push('やめる');
  const c = await X.ask(`${pod.name}の 演説台だ。\nなにを うったえる？`, opts, { title: '演説テーマ' });
  if (c < 0 || c === opts.length - 1) return;
  const theme = Object.keys(THEMES)[c];
  const h = Math.floor(G.min / 60);
  let crowdF = 0.7;
  if (h === 12 || h >= 17) crowdF = 1.2;
  else if (h <= 8) crowdF = 0.85;
  const crowd = Math.round((20 + G.fame * 4) * crowdF * (AREAS[area].voters / 150000) * (0.8 + Math.random() * 0.4));
  await X.say(`{N}は 演説台に 立った！`, `聴衆は ${crowd}人ほど あつまっている。`);
  const interest = AREAS[area].interest[theme];
  const repeat = G.daily.themes[`${area}_${theme}`] ? 0.4 : 1;
  G.daily.themes[`${area}_${theme}`] = 1;
  G.daily.speech[pod.id] = (G.daily.speech[pod.id] || 0) + 1;
  const main = G.mainTheme === theme ? 1.25 : 1;
  let gain = 1.6 * interest * crowdF * repeat * main;
  if (interest >= 1.3) await X.say(`「${THEMES[theme]}」の話に 聴衆が 身を乗り出した！`);
  else if (interest <= 0.6) await X.say(`「${THEMES[theme]}」の話は この地区では いまいち ピンと こないようだ…`);
  else await X.say(`{N}は 「${THEMES[theme]}」について 熱く 語った。`);
  if (G.mainTheme === theme) await X.say('第一声から 一貫した 訴えに 説得力が ある！');

  if (Math.random() < 0.3) {
    const hk = await X.ask('ヤジ「口だけなら なんとでも 言えるぞー！ 引っこめー！」', [
      '笑顔で 受け流す', '「あなたのような方の 声こそ 聞きたい！」と 呼びかける', '「黙って 聞け！」と 言い返す',
    ]);
    if (hk === 0) { await X.say('{N}は にっこり 手を振った。', '聴衆から ちいさな 拍手が おきた。'); gain += 0.5; }
    else if (hk === 1) {
      await X.say('ヤジの男性は 少し たじろいだ。', '男性「…じゃあ 言わせてもらうがな、バスの本数がだな…」', '{N}は 演説台を降りて 男性の話に 耳を 傾けた。', '聴衆から 大きな拍手が わきおこった！');
      gain += 1.5; X.fx({ time: 15, quiet: true });
    } else {
      await X.say('会場が 一瞬 しんと 静まりかえった…', 'だれかが スマホで 動画を 撮っている。');
      gain -= 1.5;
      if (X.chance(0.5)) X.later(1, 'd_angry_clip');
    }
  }
  await X.fx({ at: { [area]: Math.max(0, gain) }, fame: 1.5, hp: -8, time: 45 });
}

// ===================== 掲示板 =====================
async function doBoard(X, b) {
  if (G.boards[b.id]) { await X.say('ポスター掲示板だ。', '{N}の ポスターが しっかり 貼られている。'); return; }
  if (G.posters <= 0) { await X.say('ポスター掲示板だ。', 'しかし ポスターが もう ない！', '事務所で 補充しよう。'); return; }
  const c = await X.ask('ポスター掲示板だ。\n{N}の ポスターを 貼りますか？', ['貼る', 'やめる']);
  if (c !== 0) return;
  G.boards[b.id] = true;
  G.posters--;
  await X.say('{N}は ポスターを ていねいに 貼った！');
  await X.fx({ at: { [b.area]: 0.8 }, fame: 1, time: 10 });
  const n = Object.keys(G.boards).length;
  if (n === MAP.boards.length && !X.has('allBoards')) {
    X.flag('allBoards');
    await X.say('県内すべての 掲示板に ポスターを 貼りおえた！', 'スタッフ「すごい！ 県のすみずみまで {N}さんの顔が！」');
    await X.fx({ all: 1.5, fame: 5 });
  }
}

// ===================== 偶然の出来事（ランダムエンカウント） =====================
const ENCOUNTERS = [
  { id: 'granny', areas: null, w: 3, once: true, run: async X => {
    const c = await X.ask('なんと！ おばあさんが 重そうな荷物を かかえて よろよろ 歩いている！', [
      '家まで 荷物を 運んであげる', 'スタッフに 任せる', '急いでいるので 会釈して 通りすぎる']);
    if (c === 0) {
      await X.say('{N}は 荷物を かついで おばあさんの家まで 送りとどけた。', 'おばあさん「ご親切に… どちらさまか 存じませんが ありがたいねえ」', '立派な 門構えの 家だった…');
      X.flag('grannyHelped');
      X.later(1, 'd_granny_son');
      await X.fx({ sup: 1, hp: -6, time: 40 });
    } else if (c === 1) {
      await X.say('スタッフが おばあさんを 送っていった。');
      await X.fx({ sup: 0.5, time: 5 });
    } else {
      await X.say('{N}は 会釈して 足早に 通りすぎた。');
      if (X.chance(0.35)) { await X.say('…背後で だれかが ひそひそ 話している。', '「あの候補、おばあちゃんを 無視したわよ」'); await X.fx({ sup: -1.5 }); }
    }
  } },

  { id: 'fight', areas: ['chuo', 'sakura', 'minato'], w: 3, once: true, run: async X => {
    const c = await X.ask('おや？ 若者たちが 道ばたで 胸ぐらを つかみあっている！\n「てめえ、ぶつかっといて その態度は なんだ！」', [
      '間に 割って入る', '警察を 呼ぶ', '関わらないでおく']);
    if (c === 0) {
      await X.say('{N}は 二人の間に 割って入った！', '{N}「まあまあ！ 二人とも 落ち着いて！」');
      if (Math.random() < 0.7) {
        await X.say('若者A「…チッ、おっさんに 免じて 勘弁してやらあ」', '若者B「てか アンタ、ポスターの人じゃん。ウケる」', '若者A「俺ら ヒマだし、ポスター貼り 手伝ってやるよ！」');
        const free = MAP.boards.filter(b => !G.boards[b.id]).slice(0, 4);
        free.forEach(b => { G.boards[b.id] = true; });
        if (free.length) await X.say(`若者たちが ${free.length}か所の 掲示板に ポスターを 貼ってくれた！`);
        X.log('喧嘩を仲裁し、若者たちがポスター貼りを手伝ってくれた');
        await X.fx({ sup: 1.5, fame: 3 + free.length, hp: -8, time: 20 });
      } else {
        await X.say('ゴツン！', '{N}は とばっちりで 一発 殴られてしまった！', '若者たちは 青い顔で 逃げていった。', '…しかし 見ていた 通行人たちが 駆けよってきた。', '「身体を張って 止めるなんて…！」');
        await X.fx({ sup: 2, hp: -22, time: 30 });
      }
    } else if (c === 1) {
      await X.say('{N}は 110番に 通報した。', 'まもなく おまわりさんが かけつけ、二人は 引き離された。');
      await X.fx({ sup: 0.5, time: 15 });
    } else {
      await X.say('{N}は 見なかったことにした…');
    }
  } },

  { id: 'woman', areas: ['chuo', 'minato', 'yukemuri'], w: 3, once: true, cond: () => G.min >= 15 * 60, run: async X => {
    await X.say('夕暮れの 路地裏で 若い女性が ふらついて うずくまっている。', '女性「すみません… 少し 気分が 悪くて…」', '…ふと 向かいの 物陰で 何かが キラリと 光った 気がした。');
    const c = await X.ask('どうする？', ['肩を貸して 大通りまで 送っていく', '女性スタッフを 呼んで 任せる', '救急車を 呼ぶ']);
    if (c === 0) {
      await X.say('{N}は 女性に 肩を貸し、タクシー乗り場まで 送りとどけた。', '女性「本当に ありがとうございました…」', '女性は 何度も 頭を下げて 去っていった。');
      await X.fx({ sup: 1, time: 25 });
      if (X.chance(0.75)) X.later(2, 'd_affair');
    } else if (c === 1) {
      await X.say('かけつけた 女性スタッフが 女性を 介抱し、家族に 連絡をとった。', 'スタッフ「念のため、こういう時は 私たちを 呼んでくださいね」');
      X.later(3, 'd_thanks_letter');
      await X.fx({ sup: 1, time: 20 });
    } else {
      await X.say('{N}は 119番に 電話し、救急車が 来るまで 付きそった。', '救急隊員「軽い 貧血ですね。ご連絡 ありがとうございます」');
      await X.fx({ sup: 1, time: 30 });
    }
  } },

  { id: 'lostchild', areas: null, w: 3, once: true, run: async X => {
    const c = await X.ask('小さな 女の子が 泣いている。\n「ママぁ… ママが いないよぉ…」', [
      'いっしょに ママを さがす', '交番に 連れていく', 'だれかが 助けるだろう']);
    if (c === 0) {
      await X.say('{N}は 女の子と 手をつないで 商店街を 歩きまわった。', '母親「ゆいちゃん！ よかった…！」', '母親「本当に ありがとうございました！ あの、候補者の方ですよね？」', '母親は ママ友グループで このことを 話してくれるそうだ。');
      X.flag('momNetwork');
      await X.fx({ sup: 3, hp: -5, time: 45 });
    } else if (c === 1) {
      await X.say('{N}は 女の子を 交番まで 送りとどけた。', 'おまわりさん「ご協力 感謝します」');
      await X.fx({ sup: 1, time: 20 });
    } else {
      await X.say('{N}は その場を 立ち去った…', '…なんだか 胸が ちくりと 痛む。');
      await X.fx({ hp: -3 });
    }
  } },

  { id: 'envelope', areas: null, w: 2, once: true, cond: () => G.day >= 3, run: async X => {
    await X.say('身なりの良い 中年男性が 近づいてきた。', '男性「{N}先生、応援しとります。これは ほんの 気持ちです…」', '男性は 分厚い 封筒を さしだした。中身は 現金のようだ。');
    const c = await X.ask('どうする？', ['ありがたく 受け取る（資金+500万）', '丁重に 断る', '「正式に 寄付の手続きを してください」と 伝える']);
    if (c === 0) {
      await X.say('{N}は 封筒を 受け取った。', '男性「話が わかる方で よかった。くれぐれも よろしく…」', '…男性は にやりと 笑って 去っていった。');
      X.flag('bribe');
      X.later(3, 'd_bribe');
      await X.fx({ money: 500 });
    } else {
      await X.say('{N}「お気持ちだけ いただきます。選挙は きれいに 戦いたいので」', '男性「…ほう」', '男性は 満足そうに うなずくと、胸ポケットから 名刺を 出した。', '『HTVテレビ 報道局 抜き打ち調査班』', '男性「候補者の 金銭感覚を 調べる企画でしてね。合格ですよ」');
      if (c === 2) await X.say('男性「手続きの話まで するとは。権田陣営は 封筒を 受け取りましたがね… おっと、これは オフレコで」');
      X.later(1, 'd_tv_test');
      await X.fx({ fame: 2 });
    }
  } },

  { id: 'sns', areas: ['chuo', 'sakura'], w: 2, once: true, run: async X => {
    await X.say('派手な スーツの 男が 名刺を さしだしてきた。', '男「SNSコンサルの 者です。200万円で フォロワー10万人、一晩で 用意できますよ」', '男「みんなやってますって。数字は 力ですから」');
    const c = await X.ask('どうする？', ['フォロワーを 買う（-200万）', 'きっぱり 断る']);
    if (c === 0) {
      if (G.money < 200) { await X.say('しかし 資金が 足りなかった！', '男「…またの ご縁を」'); return; }
      await X.say('翌朝、{N}の SNSの フォロワーは 10万人を こえていた！', '…ただし コメント欄は 外国語の 謎のアカウントばかりだ。');
      X.later(4, 'd_stealth');
      await X.fx({ money: -200, fame: 8 });
    } else {
      await X.say('{N}「自分の 言葉で 一人ずつ 増やしていきます」', '男「…そうですか。後悔しますよ」');
    }
  } },

  { id: 'autograph', areas: null, w: 2, once: true, run: async X => {
    const c = await X.ask('子ども「あーっ！ ポスターの人だ！ サインちょうだい！」', ['よろこんで サインする', '握手だけ する']);
    if (c === 0) { await X.say('{N}は ノートに 大きく サインした。', '子ども「やったー！ ママに 見せよーっと！」'); await X.fx({ sup: 0.8, fame: 1, time: 5 }); }
    else { await X.say('子ども「えー、ケチー！」', '…でも 手は ぶんぶん ふってくれた。'); await X.fx({ sup: 0.3 }); }
  } },

  { id: 'dog', areas: null, w: 2, once: true, run: async X => {
    const c = await X.ask('段ボール箱の中で 子犬が ふるえている。\n「くぅ～ん…」', ['事務所で 保護する', '動物愛護センターに 連絡する', 'そっと 立ち去る']);
    if (c === 0) {
      await X.say('{N}は 子犬を 抱きあげた。', 'スタッフが 撮った写真が SNSで 拡散された！', '『#選挙事務所の看板犬』が トレンド入りした！');
      X.flag('dog');
      X.log('子犬を保護。選挙事務所の看板犬になった');
      await X.fx({ fame: 5, at: { chuo: 1, sakura: 1 }, time: 20 });
    } else if (c === 1) {
      await X.say('{N}は センターに 連絡した。', '職員「すぐ 引き取りに 行きます。ありがとうございます」');
      await X.fx({ sup: 0.5, time: 10 });
    } else {
      await X.say('子犬の 鳴き声が 背中に ひびいた…');
    }
  } },

  { id: 'accident', areas: ['aoba', 'yukemuri', 'minato'], w: 2, once: true, run: async X => {
    const c = await X.ask('たいへんだ！ 自転車の おじいさんが 転んで 起きあがれずに いる！', ['すぐに 手当てして 救急車を 呼ぶ', '近くの人に 声をかけて 任せる']);
    if (c === 0) {
      await X.say('{N}は 上着を 脱いで おじいさんの 頭の下に しき、救急車を 呼んだ。', 'おじいさん「すまんのう… あんた、選挙の…」', '救急車が 到着し、おじいさんは 運ばれていった。');
      X.later(1, 'd_accident_news');
      await X.fx({ sup: 1, hp: -5, time: 60 });
    } else {
      await X.say('{N}は 近くの人に 声をかけ、その場を 離れた。');
    }
  } },

  { id: 'izakaya', areas: ['chuo', 'minato'], w: 2, once: true, cond: () => G.min >= 17 * 60, run: async X => {
    const c = await X.ask('赤ら顔の おじさん「おう、候補者さん！ 一杯 つきあえや！ 話が あるんだ！」', [
      '一杯だけ 付き合う', 'ウーロン茶で 付き合う', '丁重に 断る']);
    if (c === 0) {
      await X.say('{N}は ビールを 一杯… 二杯… 三杯…', 'おじさん「あんた いい人だなあ！ 町内会で 推しとくよ！」');
      await X.fx({ sup: 2.5, hp: -8, time: 60 });
      if (X.chance(0.35)) {
        await X.say('{N}「農業なんて 補助金漬けで… あっ」', '…酔った勢いで 余計なことを 言ってしまった。', 'となりの席で だれかが メモを とっている…');
        X.later(1, 'd_drunk_gaffe');
      }
    } else if (c === 1) {
      await X.say('{N}は ウーロン茶で 乾杯した。', 'おじさん「マジメだねえ！ でも そこがいい！」');
      await X.fx({ sup: 1.5, time: 60 });
    } else {
      await X.say('おじさん「なんでえ、つれねえなあ」');
    }
  } },

  { id: 'yakuza', areas: ['chuo', 'minato'], w: 2, once: true, run: async X => {
    await X.say('金の ネックレスに 白いスーツの いかつい男が 近づいてきた。', '男「よう 先生！ ワシ あんたのファンやねん！ いっしょに 写真 撮ってくれへんか？」', '…背後には 黒い高級車と 屈強な 男たちが 控えている。');
    const c = await X.ask('どうする？', ['笑顔で 写真に おさまる', 'やんわりと 握手だけで 済ませる']);
    if (c === 0) {
      await X.say('パシャリ！', '男「おおきに！ 事務所に 飾っとくわ！」');
      await X.fx({ sup: 0.3 });
      if (X.chance(0.65)) X.later(3, 'd_yakuza');
    } else {
      await X.say('{N}「写真は ちょっと… 握手で ご勘弁を」', '男「なんや、つれないのう。まあ ええわ」');
    }
  } },

  { id: 'cleanup', areas: null, w: 2, once: false, run: async X => {
    const c = await X.ask('町内会の人たちが 道路の ゴミ拾いを している。\n町内会長「おや、候補者さん。ご苦労さまです」', ['いっしょに ゴミを 拾う（40分）', '「ご苦労さまです！」と 声をかける']);
    if (c === 0) { await X.say('{N}は 軍手をはめ、汗だくで ゴミを 拾った。', '町内会長「選挙の時だけ… と思ったが、あんたは 手際がいい。本物だな」'); await X.fx({ sup: 2, hp: -6, time: 40 }); }
    else { await X.say('町内会長「…どうも」'); await X.fx({ sup: 0.2 }); }
  } },

  { id: 'tourist', areas: ['chuo', 'yukemuri'], w: 2, once: true, run: async X => {
    const c = await X.ask('外国人観光客「Excuse me… Where is the hot spring?」\n地図を手に 困っているようだ。', ['英語で 道案内する', '身ぶり手ぶりで 案内する', 'Sorry… と 笑ってごまかす']);
    if (c === 0 || c === 1) {
      await X.say(c === 0 ? '{N}は 流暢な英語で 温泉への 道を 教えた。' : '{N}は 全身を使って 温泉への 道を 伝えた。', '観光客「Thank you so much! You are so kind!」', '観光客は {N}と 自撮りをして 去っていった。');
      X.later(2, 'd_tourist_video');
      await X.fx({ at: { yukemuri: 1 }, time: 15 });
    } else {
      await X.say('観光客は 困った顔のまま 去っていった…');
    }
  } },

  { id: 'student_paper', areas: ['sakura', 'chuo'], w: 2, once: true, run: async X => {
    const c = await X.ask('学生「ひなた大学 新聞部です！ 若者のために 何を してくれますか？」', [
      '県独自の 給付型奨学金を つくる', '学生起業を 全力で 支援する', 'まず 選挙に 行ってほしい！']);
    const r = [[3, 2, '学生「マジっすか！ 記事に しまくります！」'], [2, 3, '学生「起業！ 熱いっすね！」'], [1, 1, '学生「…まあ、正論っすね」']][c];
    await X.say(r[2]);
    await X.fx({ at: { sakura: r[0] }, fame: r[1], time: 20 });
  } },

  { id: 'rain', areas: null, w: 2, once: true, run: async X => {
    const c = await X.ask('ポツ… ポツ… ザーーーッ！\n突然の どしゃぶりだ！ 周りの人々が 駆けだしていく。', ['ずぶ濡れのまま 街頭で 訴え続ける', '軒下で 雨宿りする']);
    if (c === 0) {
      await X.say('{N}は 雨に 打たれながら マイクを 握り続けた！', '「傘もささずに…」 立ち止まる人が 一人、また一人…', 'ずぶ濡れ演説の 写真が SNSで 話題に なった！');
      await X.fx({ sup: 2.5, fame: 5, hp: -15, time: 40 });
      if (Math.random() < 0.3) { await X.say('…へっくしょん！ 寒気が する。'); X.later(1, 'd_cold'); }
    } else {
      await X.say('{N}は 軒下で 雨が 止むのを 待った。', 'となりで 雨宿りしていた 主婦と 世間話を した。');
      await X.fx({ sup: 0.5, time: 30 });
    }
  } },

  { id: 'ryotei', areas: ['chuo'], w: 2, once: true, cond: () => G.min >= 16 * 60, run: async X => {
    await X.say('黒塗りの車が 横づけされた。', '秘書風の男「建設業界の 有力者が 料亭で お待ちです。ぜひ 今夜 一席…」');
    const c = await X.ask('どうする？', ['料亭へ 行く', '「選挙中ですので」と 断る']);
    if (c === 0) {
      await X.say('{N}は 高級料亭で 業界の 重鎮たちと 杯を かわした。', '重鎮「いやあ、心強い。協会も 前向きに 考えますよ」');
      await X.fx({ org: { kensetsu: 35 }, hp: -5, time: 120 });
      if (X.chance(0.7)) X.later(2, 'd_ryotei');
    } else {
      await X.say('秘書風の男「…さようですか」', '車は 静かに 去っていった。');
    }
  } },

  { id: 'wallet', areas: null, w: 2, once: true, run: async X => {
    const c = await X.ask('道ばたに 革の財布が 落ちている。かなり 分厚い。', ['交番に 届ける', 'そのままに しておく']);
    if (c === 0) {
      await X.say('{N}は 財布を 交番に 届けた。');
      X.later(1, 'd_wallet');
      await X.fx({ time: 20 });
    } else {
      await X.say('{N}は 見なかったことにした。');
    }
  } },

  { id: 'torn_poster', areas: null, w: 2, once: true, cond: () => G.day >= 2, run: async X => {
    const c = await X.ask('おや？ 権田候補の ポスターが ビリビリに 破られている…', ['ていねいに 貼りなおしてあげる', '権田陣営に 電話で 知らせる', '放っておく']);
    if (c === 0) {
      await X.say('{N}は 破れた ポスターを テープで 補修した。');
      if (X.chance(0.35)) { await X.say('…パシャッ。どこかで シャッター音が した。'); X.later(1, 'd_poster_misread'); }
      else { X.later(1, 'd_fairplay'); }
      await X.fx({ time: 15 });
    } else if (c === 1) {
      await X.say('権田陣営スタッフ「…それは どうも。ご丁寧に」');
      await X.fx({ sup: 0.5, time: 5 });
    } else {
      await X.say('…選挙は 戦いだ。');
    }
  } },

  { id: 'truck', areas: ['aoba'], w: 3, once: true, run: async X => {
    const c = await X.ask('農道で 軽トラが 脱輪して 動けなくなっている！\n農家「まいったのう… だれか 押してくれんかのう」', ['スーツのまま 押す！', 'JAF を 呼んであげる']);
    if (c === 0) {
      await X.say('{N}「せーのっ！」', 'ズボッ！ 軽トラは 見事に 道へ 戻った！', 'スーツは 泥だらけだ…', '農家「あんた 気に入った！ 農協の 組合長は わしの 幼なじみじゃ。よう 言うとく！」');
      X.log('脱輪した軽トラを押した。農協の組合長に口をきいてもらえる');
      await X.fx({ sup: 2.5, org: { nokyo: 30 }, hp: -10, time: 25 });
    } else {
      await X.say('農家「そりゃ どうも…」', '1時間後、JAFが 来たそうだ。');
      await X.fx({ sup: 0.3, time: 10 });
    }
  } },

  { id: 'squid', areas: ['minato'], w: 3, once: true, run: async X => {
    const c = await X.ask('漁師「おう 候補者さん！ とれたての イカだ！ 食ってけ！」\n…まだ 動いている。', ['その場で いただく！', '「あとで いただきます」と 持ち帰る']);
    if (c === 0) {
      await X.say('{N}は イカに かぶりついた！', '漁師「おお！ いい食いっぷりだ！ 気に入った！」');
      await X.fx({ sup: 2.5, org: { gyokyo: 15 }, time: 15 });
      if (Math.random() < 0.3) { await X.say('…うっ。おなかが ゴロゴロ してきた。'); await X.fx({ hp: -18 }); }
    } else {
      await X.say('漁師「なんだ、都会もんだなあ」');
      await X.fx({ sup: 0.3 });
    }
  } },

  { id: 'smear', areas: null, w: 3, once: true, cond: () => G.day >= 6, run: async X => {
    await X.say('スタッフが 青い顔で 駆けよってきた。', 'スタッフ「{N}さん！ 大変です！ こんな怪文書が 県内に 出回っています！」', '『{N}候補には 隠し子が いる！ 県庁時代には 横領も！』', '…まったくの でたらめだ。');
    const c = await X.ask('どう 対応する？', ['すぐ 記者会見を開き 法的措置を 表明する', '「事実無根」と 一言だけ コメントする', '演説で ネタにして 笑い飛ばす']);
    if (c === 0) {
      await X.say('{N}は 毅然とした 態度で 会見に のぞんだ。', '記者たちの 反応は おおむね 好意的だった。');
      await X.fx({ all: 0.5, fame: 3, time: 60 });
    } else if (c === 1) {
      await X.say('…しかし 怪文書は じわじわと 広がっている。');
      await X.fx({ all: -1 });
    } else {
      await X.say('{N}「隠し子が いるなら 選挙を 手伝ってほしいくらいですよ！」', '聴衆は どっと 笑った！');
      if (Math.random() < 0.6) await X.fx({ all: 0.8, fame: 3 });
      else { await X.say('…しかし 一部では 「不謹慎だ」との 声も。'); await X.fx({ all: -0.5, fame: 3 }); }
    }
  } },

  { id: 'celeb', areas: ['chuo'], w: 2, once: true, cond: () => G.day >= 4, run: async X => {
    await X.say('サングラスの 男性が 近づいてきた。', '男性「どうも！ 芸人の ゴリラ山田っす！ 地元なんで 応援演説 させてくださいよ！」', '…テレビで よく見る 人気芸人だ！');
    const c = await X.ask('応援を 受ける？', ['ぜひ お願いします！', 'お気持ちだけ いただきます']);
    if (c === 0) {
      await X.say('ゴリラ山田「みなさーん！ {N}さんを よろしく ウッホー！」', '駅前は 大変な 人だかりに なった！');
      await X.fx({ at: { chuo: 3 }, fame: 10, time: 60 });
      if (X.chance(0.5)) X.later(2, 'd_celeb');
    } else {
      await X.say('ゴリラ山田「マジメっすね～。じゃ、陰ながら！」');
    }
  } },

  { id: 'festival', areas: ['aoba', 'yukemuri'], w: 2, once: true, run: async X => {
    const c = await X.ask('ピーヒャラ ドンドン！ 地区の 秋祭りだ！\n法被姿の 人たちが 盆踊りの 輪を つくっている。', ['輪に 加わって 踊る！', '来賓席で 挨拶だけ する']);
    if (c === 0) {
      await X.say('{N}は 汗だくで 踊りまくった！', '「あの候補、踊りが うまいぞ！」', 'おばあちゃんたちに 大人気だ！');
      await X.fx({ sup: 3.5, hp: -12, time: 60 });
    } else {
      await X.say('{N}は 来賓席で 丁寧に 挨拶した。');
      await X.fx({ sup: 1, time: 20 });
    }
  } },

  { id: 'blood', areas: ['chuo', 'sakura'], w: 2, once: true, run: async X => {
    const c = await X.ask('献血バスが 止まっている。\n職員「血液が 不足しています！ ご協力 お願いします！」', ['献血する（体力-15）', '通りすぎる']);
    if (c === 0) { await X.say('{N}は 400mlの 献血を した。', '職員「ご協力 ありがとうございました！ ジュース どうぞ」'); await X.fx({ sup: 1.2, fame: 1, hp: -15, time: 40 }); }
  } },

  { id: 'grumpy', areas: null, w: 3, once: false, run: async X => {
    const c = await X.ask('おじいさん「ふん、政治家なんぞ 選挙の時だけ 頭を下げおって。どうせ みんな 同じじゃ」', [
      'じっくり 話を 聞く（40分）', '政策ビラを 渡す', '「私は ちがいます！」と 力説する']);
    if (c === 0) {
      await X.say('{N}は ベンチに 腰かけ、おじいさんの 話に 耳を 傾けた。', '戦争のこと、亡くなった 奥さんのこと、バスが 減ったこと…', 'おじいさん「…あんたは 最後まで 聞いてくれたのう」');
      if (Math.random() < 0.5) { await X.say('おじいさん「実は わし、このへんの 町内会長でな。みんなに 言うとくわ」'); await X.fx({ sup: 4, time: 40 }); }
      else await X.fx({ sup: 2, time: 40 });
    } else if (c === 1) {
      await X.say('おじいさんは ビラを ポケットに ねじこんだ。');
      await X.fx({ sup: 0.3 });
    } else {
      await X.say('おじいさん「みんな そう言うんじゃ」');
    }
  } },

  { id: 'mama', areas: ['sakura', 'chuo'], w: 3, once: true, run: async X => {
    const c = await X.ask('ベビーカーの 母親「あの… 保育園に 入れなくて 仕事に 戻れないんです。知事に なったら どうにか なりますか？」', [
      '保育士の 給与を 県が 上乗せして 定員を 増やします', '「すぐには 難しいですが 必ず 取り組みます」', '「国の制度の 問題ですね…」']);
    const r = [[3, '母親「…本当ですか！ 信じてみます」'], [1.5, '母親「正直な方 なんですね」'], [-1, '母親「…そうですか」']][c];
    await X.say(r[1]);
    await X.fx({ sup: r[0], time: 15 });
  } },

  { id: 'boar', areas: ['aoba', 'yukemuri'], w: 2, once: true, run: async X => {
    const c = await X.ask('農家「見てくれ！ 一晩で イノシシに 畑を 全部 やられた！」\n荒らされた畑が 広がっている…', ['畑を 一緒に 見てまわる（60分）', '「県に 要望しておきます」と 伝える']);
    if (c === 0) {
      await X.say('{N}は 泥だらけになりながら 被害を 一つ一つ 確かめた。', '農家「ここまで 見てくれた 候補は あんたが 初めてじゃ」');
      await X.fx({ sup: 3, org: { nokyo: 15 }, hp: -8, time: 60 });
    } else {
      await X.say('農家「…あんたが 県に なるんじゃろうが」');
      await X.fx({ sup: -0.5 });
    }
  } },

  { id: 'youtuber', areas: ['chuo', 'sakura'], w: 2, once: true, run: async X => {
    await X.say('「はーい どうもー！ 突撃系YouTuberの ゲキトツ太郎でーす！」', '「いま 生配信中なんですけどー、知事候補の {N}さんに 突撃しまーす！」', '「ぶっちゃけ 給料 いくら もらう気ですかー？」');
    const c = await X.ask('どうする？', ['冷静に 政策を 説明する', '「失礼だろ！」と 怒鳴る', 'カメラを 手で ふさいで 逃げる']);
    if (c === 0) {
      await X.say('{N}は 給与削減の 公約も ふくめ、淡々と 説明した。', 'ゲキトツ太郎「…あ、意外と ちゃんとしてる… えっと、がんばってください」', 'コメント欄「この候補 神対応すぎ」「推せる」');
      await X.fx({ at: { chuo: 1.5, sakura: 1.5 }, fame: 5, time: 15 });
    } else if (c === 1) {
      await X.say('ゲキトツ太郎「キレたー！ 知事候補が キレましたー！」', '怒鳴る場面だけが 切り抜かれ、拡散された…');
      await X.fx({ all: -1.5, fame: 6 });
    } else {
      await X.say('ゲキトツ太郎「逃げたー！」', 'コメント欄「やましいことでも あんの？」');
      await X.fx({ all: -0.5, fame: 2 });
    }
  } },

  { id: 'petition', areas: ['chuo', 'minato'], w: 2, once: true, run: async X => {
    await X.say('笑顔の 若い女性が バインダーを 持って 近づいてきた。', '女性「世界平和のための 署名に ご協力 お願いしまーす！ 候補者さんなら 当然 書いてくれますよね？」', '…バインダーの 隅に 小さく 見慣れない 団体名が 書いてある。');
    const c = await X.ask('どうする？', ['世界平和なら… と 署名する', '団体のことを くわしく 聞く', '急いでいるので と 断る']);
    if (c === 0) {
      await X.say('{N}は 署名した。', '女性「ありがとうございまーす！ 会報に 載せておきますね！」');
      X.later(2, 'd_cult');
    } else if (c === 1) {
      await X.say('女性「えっと… あの… 失礼しまーす！」', '女性は そそくさと 去っていった。', '…あとで 調べると、高額な 壺を 売る団体 だった。危なかった。');
    } else {
      await X.say('女性「…チッ」');
    }
  } },

  { id: 'soccer', areas: ['sakura', 'aoba'], w: 2, once: true, run: async X => {
    const c = await X.ask('子どもたち「おじさーん！ ボール とってー！」\nサッカーボールが 転がってきた。', ['華麗に 蹴りかえす！', '手で 投げかえす']);
    if (c === 0) {
      if (Math.random() < 0.5) { await X.say('バシッ！ 見事な ロングパス！', '子どもたち「すげー！！」', '見ていた 親たちも 拍手している。'); await X.fx({ sup: 1.5 }); }
      else { await X.say('スカッ… ドテーン！', '{N}は 盛大に しりもちを ついた。', '子どもたち「ギャハハハ！」', '…なぜか その動画が 「親しみやすい」と 話題に なった。'); await X.fx({ sup: 1, fame: 3, hp: -3 }); }
    } else {
      await X.say('子どもたち「ありがとー！」');
      await X.fx({ sup: 0.3 });
    }
  } },

  { id: 'ambush', areas: ['chuo'], w: 2, once: true, cond: () => G.day >= 4, run: async X => {
    const c = await X.ask('記者「{N}さん！ 権田知事の 4選出馬について 一言 お願いします！」', [
      '「多選は 県政を よどませる」と 正面から 批判する', '「私は 政策で 勝負します」と かわす', '「権田さんは 立派な方です」と 持ちあげる']);
    if (c === 0) {
      await X.say('{N}の 発言は 夕方の ニュースで 大きく 取りあげられた。');
      await X.fx({ all: 0.6, g: -0.6, fame: 3, time: 10 });
    } else if (c === 1) {
      await X.say('記者「…はい、ありがとうございます」');
      await X.fx({ all: 0.3, time: 10 });
    } else {
      await X.say('記者「え、それって 出馬した 意味は…？」', '…弱腰と 受けとられて しまったようだ。');
      await X.fx({ all: -0.8, time: 10 });
    }
  } },

  { id: 'thief', areas: ['chuo', 'sakura'], w: 2, once: true, run: async X => {
    const c = await X.ask('女性「キャーッ！ ひったくりよー！」\nバイクの 男が 女性のバッグを 奪って 逃げていく！', ['全力で 追いかける！', '「ひったくりだー！」と 大声で 知らせる']);
    if (c === 0) {
      if (Math.random() < 0.55) {
        await X.say('{N}は 全力疾走！', '信号で 止まった バイクに 追いつき、男を 取り押さえた！', '女性「ありがとうございます…！」', 'この活躍は 夜の ニュースで 報じられた！');
        await X.fx({ all: 1.5, fame: 7, hp: -15, time: 40 });
      } else {
        await X.say('{N}は 全力疾走！… しかし 見失って しまった。', 'ゼエ… ゼエ…');
        await X.fx({ sup: 0.5, hp: -15, time: 20 });
      }
    } else {
      await X.say('{N}の 声で 通行人が 集まり、男は 自転車の 学生に 取り押さえられた！');
      await X.fx({ sup: 0.8, time: 20 });
    }
  } },

  { id: 'handshake_line', areas: null, w: 4, once: false, run: async X => {
    const n = 5 + Math.floor(Math.random() * 15);
    const c = await X.ask(`バス停に ${n}人ほどの 人が 並んでいる。`, ['一人ずつ 握手して まわる', '軽く 会釈する']);
    if (c === 0) { await X.say('{N}は 一人ひとりの 目を見て 握手した。', '「がんばってね」「応援してるよ」'); await X.fx({ sup: 0.3 + n * 0.06, time: 15, hp: -2 }); }
  } },

  { id: 'shrine_fox', areas: ['yukemuri'], w: 1, once: true, run: async X => {
    await X.say('道ばたの 小さな お地蔵さまが 傾いている。');
    const c = await X.ask('どうする？', ['まっすぐに 直して 手を合わせる', '通りすぎる']);
    if (c === 0) { await X.say('{N}は お地蔵さまを 直し、手を合わせた。', '…なんだか 心が 落ち着いた。'); G.daily.luck = true; await X.fx({ hp: 10 }); }
  } },

  { id: 'staff_trouble', areas: null, w: 2, once: true, cond: () => G.day >= 5, run: async X => {
    await X.say('スタッフから 電話だ。', 'スタッフ「すみません！ 選挙カーの 運転手が スピード違反で 捕まりました…！」', 'スタッフ「マスコミにも 知られて しまって…」');
    const c = await X.ask('どうする？', ['候補者として すぐ 謝罪する', '「スタッフ個人の 問題」と コメントする']);
    if (c === 0) { await X.say('{N}は 深々と 頭を下げた。', '早い 謝罪で 騒ぎは すぐに おさまった。'); await X.fx({ all: -0.3, time: 30 }); }
    else { await X.say('…「責任逃れ」との 批判が 広がった。'); await X.fx({ all: -1.5 }); }
  } },
];

// ===================== 後から起きる出来事 =====================
const DELAYED = {
  d_granny_son: async X => {
    await X.say('朝、事務所に 恰幅のいい 紳士が 訪ねてきた。', '紳士「商工会議所 会頭の 大黒です。昨日は 母が 大変 お世話に なったそうで」', '大黒「母は 『あんな親切な人は 今どき いない』と 申しておりました」', '大黒「…会議所でも {N}さんを 応援できないか、話してみましょう」');
    X.log('助けたおばあさんは商工会議所会頭の母だった！');
    await X.fx({ org: { shoko: 50 }, at: { chuo: 2 } });
  },
  d_affair: async X => {
    Sound.bad();
    await X.say('スタッフが 週刊誌を 握りしめて 駆けこんできた！', '『激写！ {N}候補 深夜の密会！ 若い女性と 肩を寄せあい 夜の街へ…』', '…あの夜、女性を 送っていった 時の 写真だ！');
    X.log('週刊誌に「不倫疑惑」写真を撮られた');
    const c = await X.ask('どう 対応する？', ['会見を開き、経緯を ありのまま 説明する', '「完全な ねつ造だ」と 法的措置を 表明する', 'ノーコメントで やりすごす']);
    if (c === 0) {
      await X.say('{N}は 会見で あの夜の 経緯を 丁寧に 説明した。');
      await X.fx({ all: -2 });
      if (Math.random() < 0.6) {
        await X.say('…その日の 午後。', '一人の女性が SNSに 投稿した。', '「あの夜、具合が悪かった私を 助けてくださったのは {N}さんです。本当に 感謝しています」', '投稿は またたく間に 拡散され、週刊誌への 批判が 殺到した！');
        X.log('助けた女性が名乗り出て、疑惑が晴れた');
        await X.fx({ all: 3, fame: 4 });
      } else {
        await X.say('説明は 一定の 理解を 得たようだ。');
      }
    } else if (c === 1) {
      await X.say('「ムキになって 否定するのは 怪しい」という 声も…');
      await X.fx({ all: -3.5, fame: 3 });
    } else {
      await X.say('…沈黙は 疑惑を 深めて しまった。');
      await X.fx({ all: -6 });
    }
  },
  d_thanks_letter: async X => {
    await X.say('事務所に 一通の 手紙が 届いた。', '「先日は スタッフの方に 助けていただき ありがとうございました。家族みんなで 応援します」');
    await X.fx({ sup: 0.5, hp: 5 });
  },
  d_bribe: async X => {
    Sound.bad();
    await X.say('朝刊の 一面に 衝撃の 見出しが おどった。', '『{N}候補 現金授受か　業者から 封筒 受け取る瞬間を 激写』', '…あの男は 権田陣営と つながる 業者だったらしい！');
    X.log('現金授受が報道された');
    await X.say('県警が 公職選挙法違反の 疑いで 事情を 聴くという…', '支持者が 潮が引くように 離れていく…');
    await X.fx({ all: -8, g: 1, fame: 5 });
  },
  d_tv_test: async X => {
    await X.say('昨夜の HTVの 特集番組で、{N}が 現金を 断る 場面が 放送された！', 'キャスター「お金に きれいな候補が いました」', '…ちなみに 権田陣営の 対応は モザイクで 放送された。');
    X.log('抜き打ち企画で現金を断った姿がテレビで放送された');
    await X.fx({ all: 3, g: -1.5, fame: 8 });
  },
  d_stealth: async X => {
    Sound.bad();
    await X.say('ネットニュース「{N}候補の フォロワー、9割が 海外の 偽アカウントか」', 'SNSでは 「フォロワー買い」の ハッシュタグが 拡散されている…');
    X.log('フォロワー購入が発覚した');
    await X.fx({ all: -3.5, at: { chuo: -1, sakura: -1.5 } });
  },
  d_accident_news: async X => {
    await X.say('地元紙の 社会面に 小さな 記事が 載った。', '『転倒の高齢男性を 救護　知事選候補が 上着を 枕に』', '…そして 事務所に 電話が。', '電話「昨日 助けてもらった じいさんじゃ。わしは 元 農協の 組合長でのう。若い連中に よう 言うとくでな」');
    X.log('助けたおじいさんは元農協組合長だった');
    await X.fx({ all: 1.2, fame: 3, org: { nokyo: 30 } });
  },
  d_drunk_gaffe: async X => {
    Sound.bad();
    await X.say('ネットに 一本の 音声が 出回った。', '『{N}候補「農業なんて 補助金漬けで…」 居酒屋での 本音？』', 'あおば村の 農家から 怒りの声が あがっている…');
    await X.fx({ at: { aoba: -4, minato: -1 }, org: { nokyo: -30 } });
  },
  d_yakuza: async X => {
    Sound.bad();
    await X.say('週刊誌が 一枚の写真を 掲載した。', '『{N}候補、指定暴力団 幹部と 笑顔の ツーショット』', '…あの 白いスーツの 男だ！');
    X.log('暴力団幹部との写真が報道された');
    await X.fx({ all: -5 });
  },
  d_tourist_video: async X => {
    await X.say('海外の 人気旅行YouTuberの 動画が 話題に なっている。', '『日本の 温泉の町で とても 親切な 政治家に 出会った！』', '再生回数は 100万回を 突破！');
    await X.fx({ at: { yukemuri: 2.5 }, all: 0.5, fame: 5, org: { kanko: 20 } });
  },
  d_ryotei: async X => {
    Sound.bad();
    await X.say('ネットニュース「{N}候補、選挙中に 建設業界と 料亭会合」', '「結局 権田知事と 同じじゃないか」と 失望の声が…');
    await X.fx({ all: -3, at: { chuo: -1 } });
  },
  d_wallet: async X => {
    await X.say('事務所に 電話が かかってきた。', '電話「財布を 届けてくださった方ですよね？ ひなた新聞の 記者の 者です」', '電話「中に 取材メモが 入っていて 本当に 助かりました。…この件、コラムに 書かせてください」');
    await X.fx({ all: 1, fame: 3 });
  },
  d_poster_misread: async X => {
    Sound.bad();
    await X.say('SNSに 一枚の写真が 出回った。', '『{N}候補、深夜に 権田候補の ポスターを はがす！？』', '…補修していた 時の 写真が 誤解されている！');
    const c = await X.ask('どう 対応する？', ['補修に 使った テープの 写真を 公開して 説明する', '無視する']);
    if (c === 0) {
      await X.say('{N}は 補修したポスターの 写真を 公開した。', '権田陣営「…確かに 補修されています。お礼を 申し上げます」', '誤解は とけ、むしろ 「フェアな候補」と 評判に なった！');
      await X.fx({ all: 1.2 });
    } else {
      await X.fx({ all: -2.5 });
    }
  },
  d_fairplay: async X => {
    await X.say('地元紙のコラム「ライバルの ポスターを 補修する 候補者」', '…{N}の フェアプレーが 話題に なった。');
    await X.fx({ all: 1, fame: 2 });
  },
  d_celeb: async X => {
    Sound.bad();
    await X.say('芸能ニュース「ゴリラ山田、闇営業 発覚で 活動自粛」', '…数日前に {N}の 応援演説を した 芸人だ。', '「そんな芸人を 応援に 呼ぶ 候補って…」');
    await X.fx({ all: -2.5, at: { chuo: -1 } });
  },
  d_cult: async X => {
    Sound.bad();
    await X.say('ネットで 一枚の 画像が 拡散されている。', '『○○平和連合 会報：{N}候補も 賛同署名！』', '…高額な 壺を 売りつける 団体として 有名な 組織だった！');
    const c = await X.ask('どう 対応する？', ['「知らずに署名した」と すぐに 謝罪する', '「関係ない」と だけ 言う']);
    if (c === 0) { await X.say('素早い 謝罪で 騒ぎは 最小限に おさまった。'); await X.fx({ all: -1.5 }); }
    else { await X.say('…説明不足との 批判が 続いている。'); await X.fx({ all: -4 }); }
  },
  d_cold: async X => {
    await X.say('ゴホッ ゴホッ… 昨日の 雨で 風邪を ひいてしまった。');
    await X.fx({ hp: -20 });
  },
  d_angry_clip: async X => {
    Sound.bad();
    await X.say('SNSで 動画が 拡散されている。', '『{N}候補、聴衆に 「黙って聞け！」と 逆ギレ』');
    await X.fx({ all: -2 });
  },
  d_dam: async X => {
    Sound.bad();
    await X.say('朝刊「{N}候補、建設業協会と ダム推進の 密約か」', '環境団体や 無党派層から 批判の声が あがっている…');
    await X.fx({ at: { chuo: -3, yukemuri: -2, aoba: -1 }, all: -0.5 });
  },
  d_bigshot: async X => {
    await X.say('朝、事務所に 一本の 電話が。', '電話の声「民自党の 鬼瓦だ。幹事長の 鬼瓦 権三だよ」', '鬼瓦「君、なかなか 健闘しとるそうじゃないか。最終盤、ワシが 応援に 入ってやろう」', '鬼瓦「そのかわり 当選したら 党の 推薦候補として 頼むよ。ガハハ」');
    const c = await X.ask('どうする？', ['ぜひ お願いします', '「県民党で 戦います」と 断る']);
    if (c === 0) {
      X.flag('bigshot');
      await X.say('鬼瓦幹事長が 県内を 練り歩いた！', '組織票は 固まったが、無党派層は しらけ気味だ…');
      await X.fx({ at: { aoba: 3, yukemuri: 3, minato: 2, chuo: -2.5, sakura: -2.5 }, g: -1, fame: 5 });
      if (Math.random() < 0.4) {
        await X.say('…さらに 鬼瓦幹事長が 演説で 失言！', '鬼瓦「この県は 田舎だから ワシらが 面倒みてやらんと！ ガハハ！」', '県民の 怒りが {N}陣営にも 飛び火した…');
        await X.fx({ all: -2 });
      }
    } else {
      await X.say('鬼瓦「…ふん、後悔するなよ」', 'しかし 「どこにも 縛られない候補」として 無党派層の 支持が 広がった！');
      await X.fx({ at: { chuo: 2.5, sakura: 2.5 }, fame: 3 });
    }
  },
  d_rival_gaffe: async X => {
    await X.say('朝刊「権田知事、街頭演説で 失言」', '権田「若い母親は 家で 子どもを 見ておればいい！」', '…県内に 怒りが 広がっている。チャンスだ！');
    await X.fx({ g: -3, at: { chuo: 0.5, sakura: 0.5 }, quiet: false });
  },
};

// ===================== 予定されたイベント =====================
const SCHEDULE = [
  { day: 3, from: 13, to: 17, at: 'kominkan', id: 's_aoba', title: 'あおば村 農業者集会（公民館 13〜17時）' },
  { day: 6, from: 8, to: 11, at: 'ichiba', id: 's_asaichi', title: 'みなと町 朝市（魚市場 8〜11時）' },
  { day: 8, from: 17, to: 20, at: 'kaikan', id: 's_debate', title: '公開討論会（市民会館 17〜20時）', big: true },
  { day: 11, from: 10, to: 16, at: 'kanko', id: 's_fes', title: 'ゆけむり温泉まつり（観光協会 10〜16時）' },
  { day: 13, from: 17, to: 20, at: 'tv', id: 's_tv', title: 'テレビ討論会（HTV 17〜20時）', big: true },
  { day: 15, from: 11, to: 17, at: 'univ', id: 's_gakusai', title: 'ひなた大学 学園祭（11〜17時）' },
  { day: 17, from: 17, to: 20, at: 'station', id: 's_final', title: '最後のお願い（中央駅 17〜20時）', big: true },
];

async function debateQuestions(X, qs) {
  let score = 0;
  for (const q of qs) {
    const c = await X.ask(q.q, q.a.map(a => a[0]));
    await X.say(q.a[c][2]);
    score += q.a[c][1];
  }
  return score;
}

const SCHEDULED_EVENTS = {
  s_aoba: async X => {
    await X.say('公民館には 農家の人たちが ぎっしり 集まっている！', '司会「それでは {N}候補に ご挨拶を いただきます」');
    const c = await X.ask('何を 話す？', ['米価と 農家の 所得を 守る', '若者が 農業を 選べる 県に する', '農協改革を 断行する']);
    const r = [[4, '「そうだ！」と 声が あがった！'], [3.5, 'うなずく 若い農家の 姿が 見える。'], [-2, '会場が ざわついた…'],][c];
    await X.say(r[1]);
    await X.fx({ at: { aoba: r[0] }, org: { nokyo: c === 2 ? -20 : 15 }, hp: -5, time: 60 });
  },
  s_asaichi: async X => {
    await X.say('魚市場は 朝市で にぎわっている！', '威勢のいい 声が 飛びかう。');
    const c = await X.ask('どうする？', ['競りを 見学して 漁師と 語らう', 'マグロの 解体ショーに 飛び入り参加！']);
    if (c === 0) { await X.say('漁師たちと 燃料代や 後継者の 話を じっくり した。'); await X.fx({ at: { minato: 3.5 }, org: { gyokyo: 20 }, time: 60 }); }
    else { await X.say('{N}は 包丁を 握った！', '…ぎこちない 手つきに 大爆笑！ でも 拍手喝采だ！'); await X.fx({ at: { minato: 3 }, fame: 4, time: 60 }); }
  },
  s_debate: async X => {
    await X.say('市民会館の 大ホールは 満席だ！', '権田「ふん、新人に 県政の 何が わかる」', '新井「私は 女性目線で 県を 変えます！」', '司会「では 3候補による 公開討論会を 始めます！」');
    const s = await debateQuestions(X, [
      { q: '司会「最初の テーマは 人口減少です。{N}候補」', a: [
        ['子育て世代への 大胆な 投資で 若者を 呼び込みます', 2, '会場から 大きな拍手！'],
        ['人口減少を 前提に 小さく 賢い県に 変えます', 1, '「現実的だ」と うなずく人も。'],
        ['移民を 大量に 受け入れます', -2, '会場が どよめいた…']] },
      { q: '権田「{N}さん、あなたは 行政経験が ないでしょう。財源は どうするんです？」', a: [
        ['「経験より 改革が 必要です」と 言い返す', 1, '権田は 鼻で 笑った。'],
        ['県の 無駄な 外郭団体を 数字で 示し 財源を 説明する', 3, '権田は 言葉に 詰まった！ 会場が どよめいた！'],
        ['「…それは これから 考えます」', -3, '会場から 失笑が もれた…']] },
      { q: '司会「最後に、県民へ ひとことを」', a: [
        ['「ひなた県を あきらめない」', 2, '心に 響く 言葉だった。'],
        ['「権田県政の 16年を 終わらせよう」', 1, '支持者が 歓声を あげた。'],
        ['「よろしく お願いします」', 0, '…少し 物足りない 印象だ。']] },
    ]);
    if (s >= 5) await X.say('討論会は {N}の 圧勝だった！', '記者たちが {N}を 取り囲んでいる！');
    else if (s >= 2) await X.say('討論会は まずまずの 手応えだった。');
    else await X.say('…討論会は 苦しい 内容に 終わった。');
    await X.fx({ all: s * 0.8, g: s >= 5 ? -1.5 : 0, fame: 6, hp: -10, time: 120 });
  },
  s_fes: async X => {
    await X.say('ゆけむり温泉まつりは 大にぎわい！', '観光協会の 会長「ようこそ！ 神輿を かついで いきますか？」');
    const c = await X.ask('どうする？', ['神輿を かつぐ！', '観光客に 地元の 名物を ふるまう']);
    if (c === 0) { await X.say('わっしょい！ わっしょい！', '{N}は 法被姿で 町を 練り歩いた！'); await X.fx({ at: { yukemuri: 4.5 }, org: { kanko: 20 }, hp: -15, time: 90 }); }
    else { await X.say('{N}は 温泉まんじゅうを 配って まわった。', '観光客「おいしい！」'); await X.fx({ at: { yukemuri: 3 }, fame: 3, org: { kanko: 15 }, time: 60 }); }
  },
  s_tv: async X => {
    await X.say('HTVの スタジオ。照明が まぶしい。', 'キャスター「生放送で お送りする 知事選 テレビ討論会。本番 5秒前… 4、3…」');
    const s = await debateQuestions(X, [
      { q: 'キャスター「権田候補は 『新人に 県政は 無理だ』と 言っています。{N}候補、いかがですか？」', a: [
        ['「16年 同じ人なら 新しい風が 必要です」', 2, 'スタジオが 静まりかえった。'],
        ['「新人の 私なら しがらみが ありません」と 笑顔で 返す', 3, 'キャスターが 思わず 笑った！ SNSで 好評だ！'],
        ['「失礼じゃないですか！」と 怒る', -2, '…カメラが {N}の 怒った顔を アップで 映した。']] },
      { q: 'キャスター「新井候補は 『女性知事の 誕生を』と 訴えています」', a: [
        ['「性別ではなく 政策で 選んでほしい」', 1, '新井「それは 私も 同じです」'],
        ['「新井さんの 子育て政策には 賛成です。でも 財源は 私が 示せます」', 3, '新井は 苦笑いした。視聴者の 評価が 上がった！'],
        ['「アナウンサー出身で 政治が できますか？」', -3, '新井「それ、職業差別ですよね？」 …炎上の予感だ。']] },
      { q: 'キャスター「最後に、カメラに 向かって 30秒で どうぞ」', a: [
        ['自分の 言葉で 県の 未来を 語る', 3, 'まっすぐな 言葉が 画面越しに 届いた！'],
        ['用意した 原稿を 読みあげる', 0, '…無難に まとまった。'],
        ['「投票に 行ってください！」と だけ 叫ぶ', 1, '…インパクトは あった。']] },
    ]);
    if (s >= 6) await X.say('テレビ討論会は 大反響！', '放送後、事務所の 電話が 鳴りやまない！');
    else if (s >= 2) await X.say('テレビ討論会は まずまずの 出来だった。');
    else await X.say('…テレビ討論会は 散々な 結果に 終わった。');
    await X.fx({ all: s * 0.7, fame: 8, hp: -10, time: 120 });
  },
  s_gakusai: async X => {
    await X.say('ひなた大学の 学園祭は 学生で あふれている！', '学生「{N}さん！ 本当に 来てくれたんですね！」');
    const c = await X.ask('どうする？', ['ステージで 学生と トークバトル', '模擬店を まわって 学生と 語らう']);
    if (c === 0) {
      await X.say('学生「知事になったら 最初に 何を しますか？」', '{N}「給付型奨学金と、県内就職の 応援！ あと この焼きそばを 県の名物に！」', '会場は 大盛りあがり！');
      await X.fx({ at: { sakura: 4, chuo: 1.5 }, fame: 4, hp: -8, time: 90 });
    } else {
      await X.say('{N}は 焼きそば、たこ焼き、チョコバナナを 食べ歩いた。', '学生たちと 将来の 不安について 本音で 語りあった。');
      await X.fx({ at: { sakura: 3 }, hp: 5, time: 90 });
    }
  },
  s_final: async X => {
    await X.say('最終日の 夜。中央駅前は 人で 埋めつくされている！', 'スタッフ「{N}さん… ここまで 本当に お疲れさまでした」', 'スタッフ「最後のお願いです。思いの丈を ぶつけてください！」');
    await X.ask('最後に 何を 訴える？', ['この17日間で 出会った人たちの 話', '必ず 実現する 公約', 'ただ ひたすら 「お願いします！」']);
    await X.say('{N}の 声は かすれていた。', 'それでも 最後の 一言まで 力を ふりしぼった。', '「ひなた県の 未来を、私に 託してください！」', '…駅前に 割れんばかりの 拍手が ひびいた！');
    await X.fx({ all: 2.5, fame: 5, hp: -20, time: 90 });
  },
};

// ===================== 夜のニュース（ライバル陣営） =====================
const RIVAL_NEWS = [
  { t: '権田陣営、業界団体の 総決起大会に 5000人', fx: { g: 1.5 } },
  { t: '権田知事、「新人など 眼中にない」と 余裕の発言', fx: { ga: { chuo: -0.8, sakura: -0.8 } } },
  { t: '新井候補の 子育て公約、SNSで 共感 広がる', fx: { ar: 1.5 } },
  { t: '新井候補、過去の 番組での 発言が 掘り起こされ 炎上', fx: { ar: -2.5 } },
  { t: '権田陣営の 県議、公選法違反の 疑いで 事情聴取', fx: { g: -2.5 } },
  { t: '新井候補に 人気俳優が 応援メッセージ', fx: { ar: 1.2 } },
  { t: '権田知事、地元の祭りで 「次も わしじゃ」と 気勢', fx: { ga: { aoba: 1, yukemuri: 1, minato: 1 } } },
  { t: '新井候補、討論会での 失言に 謝罪', fx: { ar: -1.5 } },
  { t: '権田知事、県議会の 大半から 支援を 取りつける', fx: { g: 1.2 } },
  { t: '新井候補、街頭演説に 若者 1000人', fx: { ar: 1.5 } },
  { t: '権田知事の 公用車 私的利用疑惑、野党が 追及', fx: { g: -2 } },
  { t: '台風接近… 各陣営、運動を 一時 自粛', fx: {} },
];

// ===================== 施設 =====================
async function orgVisit(X, oid) {
  const o = ORGS[oid];
  const st = G.org[oid];
  if (st.endorsed) {
    await X.say(`${o.name}の 事務所だ。`, `${o.boss}「推薦候補として 全力で 応援しとりますよ！」`, '壁に {N}の ポスターが 何枚も 貼られている。');
    return;
  }
  const meter = () => {
    const n = Math.max(0, Math.min(10, Math.round(st.rel / 10)));
    return '信頼度 ' + '■'.repeat(n) + '□'.repeat(10 - n);
  };
  await X.say(`${o.name}の 事務所だ。\n${meter()}`);
  while (true) {
    const c = await X.ask(null, ['あいさつする', '推薦を お願いする', '立ち去る'], { cancel: true });
    if (c === 0) {
      if (G.daily.org[oid]) { await X.say(`${o.boss}「今日は もう お会いしましたな。熱心ですなあ」`); continue; }
      G.daily.org[oid] = true;
      const q = o.qs[st.q % o.qs.length];
      st.q++;
      const a = await X.ask(q.q, q.a.map(x => x[0]));
      const ans = q.a[a];
      await X.say(ans[2]);
      if (ans[3] === 'dam' && !X.has('dam')) { X.flag('dam'); X.later(2, 'd_dam'); }
      const repeat = st.q > o.qs.length ? 0.5 : 1;
      await X.fx({ org: { [oid]: Math.round((12 + ans[1]) * repeat) }, time: 30 });
      await X.say(meter());
    } else if (c === 1) {
      if (st.rel >= 80) {
        st.endorsed = true;
        Sound.good();
        await X.say(`${o.boss}「…わかりました。${o.name}は {N}候補を 推薦します！」`, `${o.name}の 推薦を 勝ち取った！`, '権田陣営に とって 大きな 痛手だ！');
        X.log(`${o.name}の推薦を獲得`);
        await X.fx(Object.assign({ time: 20 }, o.endorse));
        return;
      }
      await X.say(`${o.boss}「推薦？ ははは、気が早い。まずは 我々の話を 聞いてもらわんと」`);
      st.rel = Math.max(0, st.rel - 5);
      await X.say(meter());
    } else return;
  }
}

async function restAt(X, name, hp, time, money) {
  if (G.daily.rest[name]) { await X.say('今日は もう ここで 休んだ。'); return; }
  if (money && G.money < money) { await X.say('資金が 足りない！'); return; }
  G.daily.rest[name] = true;
  await X.fx({ hp, time, money: money ? -money : 0 });
}

const FACILITIES = {
  office: async X => {
    const dog = X.has('dog') ? '\n看板犬が しっぽを 振っている。' : '';
    await X.say(`{N}選挙事務所だ。スタッフが 電話かけに 追われている。${dog}`);
    while (true) {
      const c = await X.ask(null, ['ひと休みする（1時間）', 'ポスターを 印刷する（50万円で20枚）', 'スタッフに 相談する', '今日の 活動を 終える', '出る'], { cancel: true });
      if (c === 0) {
        await X.say('{N}は 事務所の ソファで 仮眠を とった。');
        await X.fx({ hp: 20, time: 60 });
      } else if (c === 1) {
        if (G.money < 50) { await X.say('資金が 足りない！'); continue; }
        await X.say('印刷所に 追加の ポスターを 発注した。');
        await X.fx({ money: -50, posters: 20, time: 10 });
      } else if (c === 2) {
        await staffAdvice(X);
      } else if (c === 3) {
        const y = await X.ask('今日の 活動を 終えますか？\n（早く休むと 体力が 多めに 回復します）', ['終える', 'まだ がんばる']);
        if (y === 0) { G.endEarly = true; return; }
      } else return;
    }
  },
  shinbun: async X => {
    await X.say('ひなた新聞社だ。輪転機の 音が ひびいている。');
    const c = await X.ask(null, ['新聞広告を 出す（300万円）', 'インタビューを 受ける', '立ち去る'], { cancel: true });
    if (c === 0) {
      if (G.daily.ad) { await X.say('広告担当「本日分の 枠は もう 埋まっております」'); return; }
      if (G.money < 300) { await X.say('資金が 足りない！'); return; }
      G.daily.ad = true;
      await X.say('明日の 朝刊に 全面広告を 出した！');
      await X.fx({ money: -300, fame: 6, all: 0.6, time: 20 });
    } else if (c === 1) {
      if (X.has('interview_' + G.day) || G.interviews >= 3) { await X.say('記者「今は 取材の 予定が 埋まっていて…」'); return; }
      X.flag('interview_' + G.day);
      G.interviews = (G.interviews || 0) + 1;
      const qs = [
        ['記者「なぜ 県庁を 辞めてまで 立候補を？」', [['「内側から 見て、変えなければと 思った」', 1.2], ['「権田知事を 倒すためです」', 0.4], ['「なんとなく…」', -1]]],
        ['記者「あなたの 最大の 弱点は？」', [['「経験不足。だから 現場を 誰より 歩きます」', 1.2], ['「弱点は ありません」', -0.5], ['「朝が 弱いことですかね」', 0.6]]],
        ['記者「当選したら 最初に 何を しますか？」', [['「知事の 退職金を 廃止します」', 1.2], ['「県庁の 改革です」', 0.8], ['「まずは ゆっくり 寝たいです」', -0.3]]],
      ];
      const q = qs[(G.interviews - 1) % qs.length];
      const a = await X.ask(q[0], q[1].map(x => x[0]));
      await X.say('記者は 熱心に メモを とった。', '明日の 紙面に 載るそうだ。');
      await X.fx({ all: q[1][a][1], fame: 3, time: 40 });
    }
  },
  ishikai: X => orgVisit(X, 'ishikai'),
  shoko: X => orgVisit(X, 'shoko'),
  nokyo: X => orgVisit(X, 'nokyo'),
  gyokyo: X => orgVisit(X, 'gyokyo'),
  kanko: X => orgVisit(X, 'kanko'),
  union: X => orgVisit(X, 'union'),
  kensetsu: X => orgVisit(X, 'kensetsu'),
  kencho: async X => {
    await X.say('ひなた県庁だ。{N}が かつて 働いていた 場所でもある。', '守衛「あっ、{N}さん… いや、選挙中ですから 中には…」', '元同僚が 窓から こっそり 手を振っている。');
    if (!G.daily.kencho) { G.daily.kencho = true; await X.say('元同僚（小声）「みんな 応援してますよ…！」'); await X.fx({ hp: 5 }); }
  },
  kaikan: async X => {
    await X.say('市民会館だ。');
    const c = await X.ask('ホールを 借りて 個人演説会を 開く？（80万円・90分）', ['開く', 'やめる']);
    if (c !== 0) return;
    if (G.money < 80) { await X.say('資金が 足りない！'); return; }
    if (G.daily.kaikan) { await X.say('今日は もう 開いた。'); return; }
    G.daily.kaikan = true;
    const n = Math.round(50 + G.fame * 8);
    await X.say(`個人演説会を 開いた！ ${n}人が 集まった。`);
    if (G.fame < 25) await X.say('…空席が 目立つ。まだ 知名度が 足りないようだ。');
    await X.fx({ money: -80, at: { chuo: 0.5 + G.fame / 25 }, hp: -8, time: 90 });
  },
  tv: async X => {
    await X.say('ひなたテレビ（HTV）だ。');
    const c = await X.ask(null, ['テレビCMを 流す（600万円）', '立ち去る'], { cancel: true });
    if (c !== 0) return;
    if (G.daily.cm) { await X.say('営業「本日の 枠は もう ございません」'); return; }
    if (G.money < 600) { await X.say('資金が 足りない！'); return; }
    G.daily.cm = true;
    await X.say('{N}の テレビCMが 県内に 流れた！');
    await X.fx({ money: -600, fame: 10, all: 1, time: 30 });
  },
  gondaOff: async X => {
    if (X.has('gondaVisit')) { await X.say('権田事務所だ。', '秘書「先生は 外出中です」'); return; }
    X.flag('gondaVisit');
    await X.say('権田事務所だ。巨大な だるまが 鎮座している。', '権田「…ほう、新人が 何の用だ」');
    const c = await X.ask(null, ['「正々堂々 戦いましょう」と 握手を求める', '「県政を 私物化するな」と 言い放つ']);
    if (c === 0) {
      await X.say('権田「…ふん。若いのに 礼儀は わきまえとるな」', '権田は しぶしぶ 握手に 応じた。', 'その様子を 記者が 写真に おさめていた。');
      await X.fx({ all: 0.6, fame: 2, time: 15 });
    } else {
      await X.say('権田「…出ていけ！」', '記者「おお、バチバチですね！」');
      await X.fx({ at: { chuo: 0.5, sakura: 0.5 }, fame: 3, time: 10 });
      await X.fx({ at: { aoba: -0.5, yukemuri: -0.5 }, quiet: true });
    }
  },
  araiOff: async X => {
    await X.say('新井ひかり事務所だ。若い ボランティアで いっぱいだ。', 'ボランティア「あ、{N}さん！ …敵情視察ですか？」', 'ボランティア「新井さんは 外です。お互い がんばりましょ！」');
  },
  cafe: async X => {
    await X.say('喫茶「ひなた」だ。コーヒーの 香りが ただよう。');
    const c = await X.ask(null, ['コーヒーを 飲む（30分・体力+12）', '常連客の 噂話を 聞く', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'cafe', 12, 30, 0);
    else if (c === 1) await gossip(X);
  },
  izakaya: async X => {
    if (G.min < 17 * 60) { await X.say('居酒屋「いっぽ」だ。', '「準備中」の 札が かかっている。夕方から 開くようだ。'); return; }
    await X.say('居酒屋「いっぽ」だ。にぎやかな 笑い声が する。');
    const c = await X.ask(null, ['常連さんと 語りあう（60分）', '出る'], { cancel: true });
    if (c !== 0) return;
    if (G.daily.izakaya) { await X.say('大将「今日は もう 十分 語ったろう？ 早く 寝な」'); return; }
    G.daily.izakaya = true;
    await X.say('常連たちと 県の 未来を 熱く 語った。', '大将「あんたなら やれるよ！」');
    await X.fx({ at: { chuo: 2 }, hp: -5, time: 60 });
  },
  hospital: async X => {
    await X.say('ひなた中央病院だ。');
    const c = await X.ask(null, ['点滴を 受ける（60分・体力+40・10万円）', '院長と 地域医療について 話す', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'hospital', 40, 60, 10);
    else if (c === 1) {
      if (G.daily.hosp) { await X.say('院長は 手術中だ。'); return; }
      G.daily.hosp = true;
      await X.say('院長「医師も 看護師も 足りません。どうか 現場の声を…」', '{N}は 現場の 実情を 真剣に 聞いた。');
      await X.fx({ at: { chuo: 1 }, org: { ishikai: 12 }, time: 40 });
    }
  },
  station: async X => {
    await X.say('ひなた中央駅だ。人の 流れが 絶えない。');
    const c = await X.ask(null, ['改札前で ビラを 配る（30分）', '出る'], { cancel: true });
    if (c !== 0) return;
    const h = Math.floor(G.min / 60);
    const rush = h <= 9 || (h >= 17 && h < 20);
    await X.say(rush ? '通勤・通学の 人たちに ビラを 配った！ ラッシュで 次々に はけていく！' : 'ビラを 配った。人通りは まばらだ…');
    await X.fx({ at: { chuo: rush ? 1.5 : 0.5 }, fame: rush ? 2 : 1, hp: -3, time: 30 });
  },
  koban: async X => {
    await X.say('交番だ。', 'おまわりさん「戸別訪問と 買収は 公職選挙法違反ですよ。気をつけてくださいね」');
  },
  house1: X => houseVisit(X), house2: X => houseVisit(X), house3: X => houseVisit(X),
  kominkan: async X => {
    await X.say('あおば村 公民館だ。婦人会の 人たちが 集まっている。');
    if (G.daily.kominkan) { await X.say('婦人会長「また 来たの？ ありがたいねえ」'); return; }
    G.daily.kominkan = true;
    const c = await X.ask('婦人会長「あら 候補者さん。お茶でも どう？」', ['お茶を いただきながら 話を 聞く（40分）', '挨拶だけして 失礼する']);
    if (c === 0) { await X.say('買い物が 不便なこと、病院が 遠いこと…', '{N}は 一つ一つ メモを とった。'); await X.fx({ at: { aoba: 2 }, hp: 5, time: 40 }); }
    else await X.fx({ at: { aoba: 0.3 }, time: 5 });
  },
  school: async X => {
    await X.say('あおば小学校だ。子どもたちの 元気な 声が 聞こえる。');
    const c = await X.ask(null, ['校内に 入って 挨拶する', '外から 見守る']);
    if (c === 0) { await X.say('教頭先生「困ります！ 選挙運動で 学校に 入られては…！」', '…学校は 政治的中立の 場だ。軽率だった。'); await X.fx({ at: { aoba: -1 } }); }
    else await X.say('子どもたちの 未来のためにも 負けられない。');
  },
  minshuku: async X => {
    await X.say('民宿「かもめ」だ。');
    const c = await X.ask(null, ['ひと休みさせてもらう（40分・体力+18）', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'minshuku', 18, 40, 0);
  },
  ichiba: async X => {
    await X.say('みなと魚市場だ。');
    if (G.min >= 12 * 60) { await X.say('競りは もう 終わったようだ。がらんとしている。'); return; }
    if (G.daily.ichiba) { await X.say('仲買人「また来たのか、熱心だねえ」'); return; }
    G.daily.ichiba = true;
    await X.say('仲買人たちと 挨拶を かわした。', '仲買人「朝から 市場に 来る 候補は めずらしいな！」');
    await X.fx({ at: { minato: 1.5 }, org: { gyokyo: 8 }, time: 30 });
  },
  shokudo: async X => {
    await X.say('港町食堂だ。');
    const c = await X.ask(null, ['海鮮丼を 食べる（30分・体力+15・2000円）', '女将の 噂話を 聞く', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'shokudo', 15, 30, 0);
    else if (c === 1) await gossip(X);
  },
  zosen: async X => {
    await X.say('ひなた造船所だ。火花が 散っている。');
    if (G.daily.zosen) { await X.say('工員たちは 作業中だ。'); return; }
    G.daily.zosen = true;
    await X.say('昼休みの 工員たちに 挨拶して まわった。', '工員「受注が 減ってて 不安なんだよ」');
    await X.fx({ at: { minato: 1.5 }, time: 30 });
  },
  jinja: async X => {
    await X.say('ゆけむり神社だ。');
    const c = await X.ask(null, ['お参りする', 'おみくじを 引く', '出る'], { cancel: true });
    if (c === 0) {
      if (G.daily.luck) { await X.say('今日は もう お参りした。'); return; }
      G.daily.luck = true;
      await X.say('{N}は 必勝を 祈願した。', '神主「今日一日、悪い縁から 守られましょう」', '（今日は トラブルに 巻きこまれにくくなった）');
      await X.fx({ time: 15 });
    } else if (c === 1) {
      const r = ['大吉', '吉', '中吉', '小吉', '末吉', '凶'][Math.floor(Math.random() * 6)];
      const t = { 大吉: '「当選間違いなし。ただし 慢心するべからず」', 吉: '「人を 助けよ。されど 人を 選べ」', 中吉: '「待ち人 来る。年長者を 大切に」', 小吉: '「甘い話に 乗るべからず」', 末吉: '「写真に 気をつけよ」', 凶: '「…失言に 注意」' }[r];
      await X.say(`おみくじは… 【${r}】！`, t);
    }
  },
  ryokan: async X => {
    await X.say('温泉旅館「ゆけむり荘」だ。');
    const c = await X.ask(null, ['温泉に つかる（60分・体力+50・1万円）', '女将と 話す', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'ryokan', 50, 60, 1);
    else if (c === 1) {
      await X.say('女将「観光協会の 会長は インバウンドに ご執心なのよ」', '女将「海外のお客さまが 迷わない 町にしてくれる人なら 応援するわ」');
    }
  },
  rojin: async X => {
    await X.say('特別養護老人ホーム「やすらぎ」だ。');
    if (G.daily.rojin) { await X.say('お年寄りたちは お昼寝中だ。'); return; }
    G.daily.rojin = true;
    const c = await X.ask('職員「よかったら 皆さんと お話して いってください」', ['いっしょに 歌を 歌う（40分）', '職員の 待遇について 聞く（30分）']);
    if (c === 0) { await X.say('「ふるさと」を みんなで 歌った。', 'おばあちゃん「あんた いい声じゃねえ！」'); await X.fx({ at: { yukemuri: 2 }, hp: 3, time: 40 }); }
    else { await X.say('職員「夜勤は 一人で 30人を 見ているんです…」', '{N}は 介護職の 処遇改善を 約束した。'); await X.fx({ at: { yukemuri: 1.5 }, all: 0.3, time: 30 }); }
  },
  factory: async X => {
    await X.say('ひなた製作所だ。');
    if (G.daily.factory) { await X.say('工員たちは 作業中だ。'); return; }
    G.daily.factory = true;
    const h = Math.floor(G.min / 60);
    if (h < 9) {
      await X.say('始業前の 門前で 出勤する 工員たちに 挨拶した！', '工員「朝から ご苦労さん！」「がんばれよ！」');
      await X.fx({ at: { sakura: 2.5 }, fame: 1, time: 30 });
    } else {
      await X.say('工員たちは もう 作業を 始めている。', '…朝の 出勤時間に 来れば よかった。');
      await X.fx({ at: { sakura: 0.3 }, time: 10 });
    }
  },
  univ: async X => {
    await X.say('ひなた大学だ。');
    if (G.daily.univ) { await X.say('学生たちは 講義中だ。'); return; }
    G.daily.univ = true;
    await X.say('学食で 学生たちと 語りあった。', '学生「奨学金の 返済が 不安で…」', '学生「地元に 仕事が あれば 残りたいんですけど」');
    await X.fx({ at: { sakura: 1.5 }, fame: 1, time: 40 });
  },
  hoiku: async X => {
    await X.say('さくら保育園だ。');
    if (G.daily.hoiku) { await X.say('お迎えの 時間は まだ先だ。'); return; }
    G.daily.hoiku = true;
    if (G.min >= 17 * 60) {
      await X.say('お迎えに来た 保護者たちと 話した。', '母親「待機児童、なんとかしてください！」');
      await X.fx({ at: { sakura: 2 }, time: 30 });
    } else {
      await X.say('保育士「いまは お昼寝の 時間なので…」', '…保護者に 会うなら 夕方の お迎え時間が 良さそうだ。');
    }
  },
  danchi: async X => {
    await X.say('さくら団地だ。');
    if (G.daily.danchi) { await X.say('集会所は 閉まっている。'); return; }
    G.daily.danchi = true;
    const c = await X.ask('自治会長「集会所で 座談会でも どうです？」', ['座談会を 開く（60分）', 'やめておく']);
    if (c === 0) { await X.say('エレベーター、高齢化、孤独死… 切実な 声を 聞いた。'); await X.fx({ at: { sakura: 2.5 }, hp: -5, time: 60 }); }
  },
  mall: async X => {
    await X.say('さくらモールだ。家族連れで にぎわっている。');
    const c = await X.ask(null, ['フードコートで 休憩する（30分・体力+10）', '出る'], { cancel: true });
    if (c === 0) await restAt(X, 'mall', 10, 30, 0);
  },
  kaigo: async X => {
    await X.say('介護施設「さくらの里」だ。');
    if (G.daily.kaigo) { await X.say('皆さん リハビリ中だ。'); return; }
    G.daily.kaigo = true;
    await X.say('施設長「人が 足りない。給料が 安すぎて 来てくれないんです」', '{N}は 介護職員の 賃上げを 約束した。');
    await X.fx({ at: { sakura: 1.5 }, org: { union: 8 }, time: 40 });
  },
};

async function houseVisit(X) {
  const c = await X.ask('民家だ。中から テレビの 音が 聞こえる。', ['戸別訪問して 投票を お願いする', 'やめておく']);
  if (c === 0) {
    await X.say('ピンポーン…', '住人「…選挙の お願い？ それ、戸別訪問って 法律違反じゃなかった？」', '…しまった！ 公職選挙法で 戸別訪問は 禁止されている！');
    X.log('うっかり戸別訪問をしてしまった');
    await X.fx({ sup: -1.5 });
  } else {
    await X.say('選挙運動での 戸別訪問は 法律で 禁止されている。ぐっと こらえた。');
  }
}

async function gossip(X) {
  const pool = [
    '「農協の組合長は 筋を通す人に 弱い。何度も 足を運ぶのが 大事らしいよ」',
    '「漁協は 洋上風力に 大反対さ。賛成なんて 言ったら 二度と 口きいてもらえないよ」',
    '「建設業協会は ダムを 約束すれば すぐ 推薦するって。…でも 後が 怖いよねえ」',
    '「最近 白いスーツの ヤクザが 候補者と 写真を 撮りたがってるらしいよ。気をつけな」',
    '「権田さんの 陣営、週刊誌の 記者と 仲が いいって 噂だよ」',
    '「工場の 連中は 朝の 門前に 立つ候補を 信用するんだとさ」',
    '「保育園の ママたちは 夕方の お迎えの時間に つかまえるのが いいよ」',
    '「ポスター掲示板、まだ 貼ってない所が 多いんじゃない？」',
    '「討論会は 準備が 大事。財源を 聞かれたら 数字で 答えられないとね」',
    '「温泉の 観光協会は 海外客の 受け入れに 熱心だよ」',
    '「署名を 集めてる 若い子たち、変な 団体らしいよ」',
  ];
  await X.say('常連客「ここだけの 話だけどね…」', pool[Math.floor(Math.random() * pool.length)]);
  await X.fx({ time: 20, quiet: true });
}

async function staffAdvice(X) {
  const tips = [];
  const today = SCHEDULE.filter(s => s.day === G.day && !G.schedDone[s.id]);
  today.forEach(s => tips.push(`「今日は ${s.title}が あります！ 忘れずに！」`));
  const weak = AREA_IDS.map(a => [a, shareOf(a).p]).sort((x, y) => x[1] - y[1])[0];
  tips.push(`「${AREAS[weak[0]].name}が 手薄です。演説台で 地域に 合った テーマを 訴えましょう」`);
  const notEnd = Object.keys(ORGS).filter(k => !G.org[k].endorsed);
  if (notEnd.length) {
    const k = notEnd[Math.floor(Math.random() * notEnd.length)];
    tips.push(`「${ORGS[k].name}の 推薦が 取れれば 大きいです。信頼度を 上げてから 推薦を お願いしましょう」`);
  }
  const left = MAP.boards.length - Object.keys(G.boards).length;
  if (left > 0) tips.push(`「ポスター掲示板が あと ${left}か所 残っています。手持ちは ${G.posters}枚です」`);
  if (G.hp < 40) tips.push('「顔色が 悪いですよ！ 温泉か 病院で 休んでください！」');
  tips.push('「うまい話には 裏が あります。人助けも、相手と 状況を よく 見て…」');
  await X.say('スタッフ「そうですね…」', ...tips.slice(0, 4));
}
