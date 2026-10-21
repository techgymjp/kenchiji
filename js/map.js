'use strict';
// ひなた県のマップ・地区・建物・NPCの定義

const AREAS = {
  chuo:     { name: '中央市',          voters: 420000, rect: [22, 17, 48, 38], hub: [27, 27],
              interest: { keizai: 1.1, kosodate: 1.3, fukushi: 0.9, nourin: 0.3, kanko: 0.6, kaikaku: 1.3 } },
  aoba:     { name: 'あおば村',        voters: 100000, rect: [14, 2, 61, 14], hub: [35, 9],
              interest: { keizai: 0.6, kosodate: 0.6, fukushi: 1.2, nourin: 1.6, kanko: 0.5, kaikaku: 0.5 } },
  minato:   { name: 'みなと町',        voters: 140000, rect: [50, 17, 63, 42], hub: [56, 27],
              interest: { keizai: 1.0, kosodate: 0.7, fukushi: 0.9, nourin: 1.5, kanko: 1.0, kaikaku: 0.6 } },
  yukemuri: { name: 'ゆけむり町',      voters: 90000,  rect: [2, 17, 19, 42], hub: [10, 27],
              interest: { keizai: 0.8, kosodate: 0.5, fukushi: 1.4, nourin: 0.6, kanko: 1.6, kaikaku: 0.6 } },
  sakura:   { name: 'さくら工業団地',  voters: 210000, rect: [20, 40, 52, 54], hub: [35, 47],
              interest: { keizai: 1.5, kosodate: 1.4, fukushi: 0.8, nourin: 0.3, kanko: 0.4, kaikaku: 1.0 } },
};
const AREA_IDS = Object.keys(AREAS);

const THEMES = {
  keizai:   '経済・雇用',
  kosodate: '子育て・教育',
  fukushi:  '医療・福祉',
  nourin:   '農林水産業',
  kanko:    '観光振興',
  kaikaku:  '県政改革',
};

// [id, label, x, y, w, h, roof, wall]
const BUILDINGS_DEF = [
  // 中央市
  ['shinbun',  'ひなた新聞', 25, 18, 4, 3, '#3a3a5a', '#c8c8d0'],
  ['ishikai',  '医師会',     29, 18, 4, 3, '#2a7a8a', '#e8f0f0'],
  ['kencho',   '県庁',       37, 18, 5, 3, '#6a6a6a', '#d0d0d0'],
  ['kaikan',   '市民会館',   42, 18, 4, 3, '#8a5a2a', '#e8dcc8'],
  ['office',   '選挙事務所', 25, 24, 4, 3, '#e06a10', '#fff4e0'],
  ['shoko',    '商工会議所', 29, 24, 4, 3, '#2a4a8a', '#e0e4f0'],
  ['tv',       'HTV',        37, 24, 4, 3, '#8a2a6a', '#f0e0f0'],
  ['gondaOff', '権田事務所', 42, 24, 4, 3, '#2a6a2a', '#e8f4e0'],
  ['cafe',     '喫茶',       24, 30, 3, 3, '#7a4a2a', '#f4e8d0'],
  ['izakaya',  '居酒屋',     28, 30, 3, 3, '#3a2a1a', '#e8d0a0'],
  ['hospital', '病院',       31, 30, 4, 3, '#e0e0e0', '#ffffff'],
  ['station',  '中央駅',     37, 30, 5, 3, '#5a5a7a', '#d8d8e8'],
  ['koban',    '交番',       43, 30, 3, 3, '#2a3a7a', '#f0f0f0'],
  // あおば村
  ['house1',   '民家',       16, 5, 3, 3, '#8a3a2a', '#e8dcc0'],
  ['nokyo',    '農協',       24, 5, 4, 3, '#2a8a3a', '#f0f0e0'],
  ['kominkan', '公民館',     29, 5, 4, 3, '#6a5a3a', '#e8e0c8'],
  ['school',   '小学校',     37, 5, 5, 3, '#a03030', '#f0ece0'],
  ['house2',   '民家',       44, 5, 3, 3, '#3a3a6a', '#e8dcc0'],
  ['house3',   '民家',       53, 5, 3, 3, '#5a3a2a', '#e8dcc0'],
  // みなと町
  ['minshuku', '民宿',       51, 19, 4, 3, '#2a5a8a', '#f0e8d8'],
  ['gyokyo',   '漁協',       57, 19, 3, 3, '#1a4aa0', '#e0ecf8'],
  ['ichiba',   '魚市場',     57, 24, 4, 3, '#4a6a8a', '#d8e0e8'],
  ['shokudo',  '食堂',       51, 32, 4, 3, '#a04a2a', '#f4e4d0'],
  ['zosen',    '造船所',     57, 32, 4, 3, '#5a5a5a', '#c8c8c8'],
  // ゆけむり町
  ['jinja',    '神社',       4, 19, 3, 3, '#c02a1a', '#f4e8d0'],
  ['ryokan',   '温泉旅館',   12, 19, 5, 3, '#4a2a5a', '#f0e4d0'],
  ['kanko',    '観光協会',   4, 32, 4, 3, '#c07a1a', '#f8f0e0'],
  ['rojin',    'ホーム',     12, 32, 4, 3, '#7a8a4a', '#f4f4e8'],
  // さくら工業団地
  ['union',    '労働組合',   22, 43, 4, 3, '#a02020', '#f0e0e0'],
  ['factory',  'ひなた製作所', 27, 43, 6, 3, '#6a7080', '#d0d4dc'],
  ['univ',     'ひなた大学', 37, 43, 6, 3, '#4a3a7a', '#ece8f4'],
  ['kensetsu', '建設協会',   44, 43, 4, 3, '#a07a1a', '#f4ecd8'],
  ['hoiku',    '保育園',     48, 43, 3, 3, '#e07aa0', '#fff0f4'],
  ['danchi',   '団地',       23, 49, 5, 3, '#8a8a7a', '#e8e8dc'],
  ['araiOff',  '新井事務所', 29, 49, 4, 3, '#d05a8a', '#fff0f6'],
  ['mall',     'モール',     37, 49, 6, 3, '#1a8a8a', '#e0f4f4'],
  ['kaigo',    '介護施設',   44, 49, 4, 3, '#6a9a6a', '#f0f8f0'],
];

const BOARDS_DEF = [
  [24, 22], [34, 23], [46, 23], [34, 29], [46, 29], [45, 34],
  [21, 9], [36, 9], [49, 9], [34, 4], [51, 12],
  [55, 23], [61, 36], [55, 40], [61, 29],
  [9, 23], [11, 36], [9, 30], [17, 26],
  [22, 47], [34, 44], [36, 48], [50, 47], [43, 53],
];

// 演説台
const PODIUMS_DEF = [
  { id: 'p_chuo', x: 40, y: 35, area: 'chuo', name: '中央駅前広場' },
  { id: 'p_aoba', x: 33, y: 10, area: 'aoba', name: 'あおば村 役場前' },
  { id: 'p_minato', x: 54, y: 29, area: 'minato', name: 'みなと町 港の広場' },
  { id: 'p_yukemuri', x: 14, y: 29, area: 'yukemuri', name: 'ゆけむり温泉 足湯前' },
  { id: 'p_sakura', x: 33, y: 48, area: 'sakura', name: 'さくらモール前' },
];

// NPC: [x, y, type, lines(配列 or 関数)]
const NPCS_DEF = [
  // 中央市
  [30, 27, 'staff', ['スタッフ「{N}さん！ 選挙カーは メニューの『いどう』で呼べますよ！」', 'スタッフ「ポスター掲示板を見つけたら しらべて 貼りましょう！」']],
  [36, 22, 'salary', ['会社員「権田知事？ まあ 無難だよね。変わりばえ しないけど」', '会社員「子育て支援を ちゃんと やってくれる人がいいなあ」']],
  [40, 28, 'woman', ['女性「県庁の 天下り問題、ニュースで見たわ。うんざり」']],
  [45, 27, 'reporter', ['記者「権田陣営は 業界団体を がっちり固めてますよ。推薦を奪えれば 大きいですね」']],
  [26, 35, 'granny', ['おばあさん「公園のベンチ、もっと増やしてほしいねえ」']],
  [31, 36, 'kid', ['子ども「ねえねえ、知事ってなにするひと？」']],
  [38, 36, 'man', ['男性「駅前で 演説するなら 夕方が 人が多いよ」']],
  [42, 37, 'student', ['学生「選挙とか 正直 よくわかんないっす」', '学生「でも 奨学金の話なら 聞いてみたいかも」']],
  [33, 21, 'oldman', ['おじいさん「医師会の先生方は 医師不足に 頭を抱えとるよ」']],
  [47, 31, 'police', ['おまわりさん「選挙運動は 朝8時から 夜8時まで。ルールは守ってくださいね」']],
  [24, 27, 'mom', ['お母さん「保育園、うちは 3回も 落ちたのよ…」']],
  // あおば村
  [22, 8, 'farmer', ['農家「イノシシに 畑を荒らされて 困っとる」', '農家「農協の組合長は 頑固じゃが 筋を通す人には 弱いぞ」']],
  [28, 9, 'granny', ['おばあさん「若い人が みんな 町に出てしもうてねえ」']],
  [40, 9, 'kid', ['子ども「小学校、来年 となりの学校と くっつくんだって」']],
  [47, 10, 'farmer', ['農家「自由化なんて されたら うちは おしまいだ」']],
  [35, 4, 'oldman', ['おじいさん「わしは 権田さんに 3回 入れた。だが 今回は どうするかのう」']],
  // みなと町
  [55, 25, 'fisher', ['漁師「洋上風力？ 海のことを 知らん連中が 勝手に決めよって」']],
  [67, 27, 'fisher', ['漁師「この桟橋から見る 夕日は 県で一番じゃ」', '漁師「漁協の組合長は 海の話を わかってくれる人を 推すよ」']],
  [59, 29, 'worker', ['造船所の工員「仕事は きついが 誇りを持っとる」']],
  [53, 37, 'mom', ['お母さん「この町、小児科が ひとつも ないのよ」']],
  [58, 40, 'dog', ['犬「ワン！」']],
  // ゆけむり町
  [9, 25, 'priest', ['神主「お参りしていかれては？ 厄よけになりますぞ」']],
  [11, 30, 'woman', ['旅館の女将「海外のお客さん、案内表示がなくて 迷われるのよ」']],
  [6, 26, 'oldman', ['おじいさん「足湯は ええぞ。足腰が 軽くなる」']],
  [15, 37, 'granny', ['おばあさん「ホームの職員さん、人手が 足りんそうでねえ」']],
  [8, 38, 'salary', ['観光協会の人「温泉まつりは 11日目だよ。にぎやかだよ」']],
  // さくら工業団地
  [26, 47, 'worker', ['工員「工場の門前に 朝いちで 立つ候補者は 信用できる」', '工員「賃上げ、賃上げ。それだけよ」']],
  [40, 47, 'student', ['学生「15日目の 学園祭、来てくださいよ！」']],
  [44, 47, 'worker', ['作業員「建設協会は ダム計画の話で もちきりだよ」']],
  [30, 53, 'mom', ['お母さん「団地のエレベーター、早く直してほしいわ」']],
  [48, 53, 'kid', ['子ども「サッカーしよーぜ！」']],
  [27, 48, 'arai', ['新井ひかり「あら、{N}さん。お互い がんばりましょうね。…負けませんけど」']],
];

const MAP = (() => {
  const W = 72, H = 56;
  const t = new Uint8Array(W * H);
  const deco = new Uint8Array(W * H);
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const set = (x, y, v) => { if (inb(x, y)) t[y * W + x] = v; };
  const get = (x, y) => (inb(x, y) ? t[y * W + x] : T.MOUNT);
  const rect = (x0, y0, x1, y1, v) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v);
  };
  let seed = 20261021;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

  function areaRectAt(x, y) {
    for (const id of AREA_IDS) {
      const [x0, y0, x1, y1] = AREAS[id].rect;
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return id;
    }
    return null;
  }

  // 地形
  rect(0, 0, W - 1, H - 1, T.GRASS);
  rect(64, 0, W - 1, H - 1, T.WATER);
  rect(62, 0, 63, H - 1, T.SAND);
  rect(12, 15, 61, 16, T.WATER); // ひなた川
  rect(0, 0, W - 1, 1, T.MOUNT);
  rect(0, H - 2, 61, H - 1, T.MOUNT);
  rect(0, 0, 1, H - 1, T.MOUNT);

  // 森と山（地区の外）
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < 62; x++) {
      if (get(x, y) !== T.GRASS) continue;
      if (!areaRectAt(x, y)) {
        const r = rnd();
        if (x < 13 && y < 15) set(x, y, r < 0.55 ? T.MOUNT : (r < 0.85 ? T.TREE : T.GRASS));
        else set(x, y, r < 0.6 ? T.TREE : (r < 0.7 ? T.MOUNT : T.GRASS));
      }
    }
  }

  // あおば村の田畑
  rect(15, 10, 33, 13, T.FIELD);
  rect(37, 10, 59, 13, T.FIELD);
  rect(22, 2, 33, 3, T.FIELD);
  rect(43, 2, 50, 3, T.FIELD);

  // 道路
  const road = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      set(x, y, get(x, y) === T.WATER ? T.BRIDGE : T.ROAD);
    }
  };
  road(35, 3, 35, 53);
  road(3, 27, 61, 27);
  // 中央市
  road(23, 21, 47, 21); road(23, 33, 47, 33); road(23, 21, 23, 33); road(47, 21, 47, 33);
  // あおば村
  road(15, 8, 60, 8); road(20, 3, 20, 13); road(50, 3, 50, 13);
  road(60, 8, 60, 22);
  // みなと町
  road(56, 18, 56, 41); road(50, 22, 61, 22); road(50, 35, 61, 35);
  for (let x = 62; x <= 69; x++) set(x, 27, x < 64 ? T.ROAD : T.BRIDGE); // 桟橋
  // ゆけむり町
  road(10, 18, 10, 41); road(3, 22, 18, 22); road(3, 35, 18, 35);
  // さくら工業団地
  road(21, 46, 51, 46); road(21, 52, 51, 52); road(21, 46, 21, 52); road(51, 46, 51, 52);

  // 広場・公園
  rect(36, 34, 44, 37, T.PLAZA);
  rect(24, 34, 33, 37, T.GRASS);
  for (let x = 24; x <= 33; x++) { set(x, 34, T.FLOWER); }
  set(24, 37, T.TREE); set(33, 37, T.TREE); set(28, 37, T.TREE);
  rect(32, 9, 34, 10, T.PLAZA);
  rect(52, 28, 55, 30, T.PLAZA);
  rect(12, 28, 16, 30, T.PLAZA);
  rect(5, 28, 7, 29, T.ONSEN);
  rect(32, 47, 34, 48, T.PLAZA);
  // 地区内の木と花
  for (let y = 2; y < H - 2; y++) {
    for (let x = 2; x < 62; x++) {
      if (get(x, y) !== T.GRASS || !areaRectAt(x, y)) continue;
      const nearRoad = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(x + dx, y + dy) === T.ROAD);
      const r = rnd();
      if (!nearRoad && r < 0.035) set(x, y, T.TREE);
      else if (r > 0.97) set(x, y, T.FLOWER);
    }
  }

  // 建物
  const buildings = BUILDINGS_DEF.map(([id, label, x, y, w, h, roof, wall]) => {
    const b = { id, label, x, y, w, h, roof, wall, door: [x + Math.floor(w / 2), y + h - 1] };
    rect(x, y, x + w - 1, y + h - 1, T.BLD);
    set(b.door[0], b.door[1], T.DOOR);
    const below = get(b.door[0], b.door[1] + 1);
    if (below !== T.ROAD && below !== T.PLAZA) set(b.door[0], b.door[1] + 1, T.ROAD);
    b.area = areaRectAt(b.door[0], b.door[1]) || 'chuo';
    return b;
  });
  const doorAt = {};
  buildings.forEach(b => { doorAt[`${b.door[0]},${b.door[1]}`] = b; });
  const bldById = {};
  buildings.forEach(b => { bldById[b.id] = b; });

  // 掲示板・演説台
  const boards = [];
  BOARDS_DEF.forEach(([x, y], i) => {
    const v = get(x, y);
    if (v === T.GRASS || v === T.FIELD || v === T.SAND || v === T.FLOWER || v === T.TREE) {
      set(x, y, T.BOARD);
      boards.push({ id: `b${i}`, x, y, area: areaRectAt(x, y) || 'chuo' });
    }
  });
  const boardAt = {};
  boards.forEach(b => { boardAt[`${b.x},${b.y}`] = b; });
  const podiumAt = {};
  PODIUMS_DEF.forEach(p => { set(p.x, p.y, T.PODIUM); podiumAt[`${p.x},${p.y}`] = p; });

  for (let i = 0; i < W * H; i++) deco[i] = Math.floor(rnd() * 4);

  const SOLID = new Set([T.WATER, T.TREE, T.MOUNT, T.BLD, T.BOARD, T.PODIUM, T.ONSEN]);
  const passable = (x, y) => inb(x, y) && !SOLID.has(get(x, y));

  // 地区判定（地区外は最寄りの地区）
  function areaAt(x, y) {
    const a = areaRectAt(x, y);
    if (a) return a;
    let best = 'chuo', bd = 1e9;
    for (const id of AREA_IDS) {
      const [x0, y0, x1, y1] = AREAS[id].rect;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const d = (cx - x) ** 2 + (cy - y) ** 2;
      if (d < bd) { bd = d; best = id; }
    }
    return best;
  }

  // NPCの初期位置を通行可能なマスに補正
  function nearestPassable(x, y) {
    if (passable(x, y) && get(x, y) !== T.DOOR) return [x, y];
    for (let r = 1; r < 6; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx, ny = y + dy;
        if (passable(nx, ny) && get(nx, ny) !== T.DOOR) return [nx, ny];
      }
    }
    return [x, y];
  }

  return {
    W, H, get, set, passable, areaAt, buildings, doorAt, bldById, boards, boardAt, podiumAt,
    variant: (x, y) => deco[y * W + x], nearestPassable,
  };
})();
