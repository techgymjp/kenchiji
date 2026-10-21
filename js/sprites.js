'use strict';
// ドット絵（キャラクター・タイル）をプログラムで生成してキャッシュする

const TS = 16;

const T = {
  GRASS: 0, ROAD: 1, WATER: 2, TREE: 3, MOUNT: 4, BLD: 5, FIELD: 6, SAND: 7,
  FLOWER: 8, BRIDGE: 9, BOARD: 10, PLAZA: 11, DOOR: 12, PODIUM: 13, ONSEN: 14,
};

const PEOPLE = {
  hero:     { H: '#1a1a1a', C: '#23336e', P: '#141433', W: '#ffffff', sash: '#d42020' },
  staff:    { H: '#3a2410', C: '#e8701a', P: '#2a2a2a', W: '#ffffff' },
  granny:   { H: '#d4d4d4', C: '#7a4a7a', P: '#5a3a5a', W: '#e8d8c0', bun: true },
  oldman:   { H: '#e0e0e0', C: '#6b5b3a', P: '#3a3020', W: '#d0c8b0', bald: true },
  man:      { H: '#222222', C: '#3a6a3a', P: '#2a2a3a', W: '#dddddd' },
  salary:   { H: '#222222', C: '#404858', P: '#2a2e38', W: '#ffffff' },
  woman:    { H: '#5a2a10', C: '#d0507a', P: '#7a2a4a', W: '#ffffff', long: true },
  mom:      { H: '#3a1a0a', C: '#e0a040', P: '#506090', W: '#ffffff', long: true },
  kid:      { H: '#222222', C: '#e8b020', P: '#3050a0', W: '#ffffff', kid: true },
  farmer:   { H: '#e8d070', C: '#4a7a2a', P: '#5a4a2a', W: '#dddddd', hat: true },
  fisher:   { H: '#f0f0f0', C: '#2a4a8a', P: '#202a40', W: '#dddddd', band: true },
  worker:   { H: '#f0d000', C: '#6a7a9a', P: '#3a4a6a', W: '#dddddd', helmet: true },
  student:  { H: '#111111', C: '#1a1a2a', P: '#1a1a2a', W: '#d0d0ff' },
  reporter: { H: '#4a3020', C: '#8a7a5a', P: '#3a3a3a', W: '#ffffff' },
  yakuza:   { H: '#111111', C: '#f0f0f0', P: '#e0e0e0', W: '#d0a000' },
  police:   { H: '#1a2a5a', C: '#2a3a7a', P: '#1a2450', W: '#ffffff', helmet: true },
  priest:   { H: '#222222', C: '#f4f4f4', P: '#8a2020', W: '#ffffff' },
  gonda:    { H: '#9a9a9a', C: '#5a3a1a', P: '#2a1a0a', W: '#ffffff', bald: true, sash: '#2a8a3a' },
  arai:     { H: '#3a1a0a', C: '#f0f0f0', P: '#3a6ad0', W: '#ffffff', long: true, sash: '#e070a0' },
  dog:      { dog: true },
};

const Sprites = (() => {
  const cache = {};
  const SKIN = '#f2c094';
  const EYE = '#111111';
  const SHOE = '#2a1a0a';

  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function paint(rows, pal, flip) {
    const c = mk(16, 16);
    const x = c.getContext('2d');
    rows.forEach((r, y) => {
      for (let i = 0; i < 16; i++) {
        const ch = r[i];
        if (!ch || ch === '.') continue;
        const col = pal[ch];
        if (!col) continue;
        x.fillStyle = col;
        x.fillRect(flip ? 15 - i : i, y, 1, 1);
      }
    });
    return c;
  }

  function setRow(rows, i, s) { rows[i] = s; }
  function setPx(rows, y, x, ch) {
    const r = rows[y].split('');
    r[x] = ch;
    rows[y] = r.join('');
  }

  function adultRows(cfg, dir, frame) {
    const rows = [
      '................',
      '.....HHHHHH.....',
      '....HHHHHHHH....',
      '....HSSSSSSH....',
      '....SESSSSES....',
      '....SSSSSSSS....',
      '.....SSSSSS.....',
      '....CCCWWCCC....',
      '...CCCCWWCCCC...',
      '...CCCCCCCCCC...',
      '..SCCCCCCCCCCS..',
      '..S.CCCCCCCC.S..',
      '....PPPPPPPP....',
      '....PPP..PPP....',
      '....PPP..PPP....',
      '....BBB..BBB....',
    ];
    if (frame === 1) {
      setRow(rows, 14, '....BBB..PPP....');
      setRow(rows, 15, '.........BBB....');
      setRow(rows, 10, '..SCCCCCCCCCC...');
      setRow(rows, 11, '..S.CCCCCCCCS...');
    }
    if (cfg.bald) {
      setRow(rows, 1, '......SSSS......');
      setRow(rows, 2, '....HSSSSSSH....');
    }
    if (cfg.bun) setRow(rows, 0, '......HHHH......');
    if (cfg.hat) {
      setRow(rows, 0, '.....HHHHHH.....');
      setRow(rows, 1, '..HHHHHHHHHHHH..');
      setRow(rows, 2, '....SSSSSSSS....');
    }
    if (cfg.helmet) {
      setRow(rows, 0, '.....HHHHHH.....');
      setRow(rows, 1, '....HHHHHHHH....');
      setRow(rows, 2, '...HHHHHHHHHH...');
    }
    if (cfg.band) {
      setRow(rows, 1, '.....XXXXXX.....');
      setRow(rows, 2, '....HHHHHHHH....');
    }
    if (dir === 'up') {
      setRow(rows, 3, cfg.hat ? '....SSSSSSSS....' : '....HHHHHHHH....');
      setRow(rows, 4, '....HHHHHHHH....');
      setRow(rows, 5, '....SSSSSSSS....');
      setRow(rows, 7, '....CCCCCCCC....');
      setRow(rows, 8, '...CCCCCCCCCC...');
    } else if (dir === 'left') {
      setRow(rows, 3, '....HSSSSSHH....');
      setRow(rows, 4, '....SESSSSHH....');
      setRow(rows, 7, '....CWWCCCCC....');
      setRow(rows, 8, '...CCWCCCCCCC...');
      if (cfg.hat) setRow(rows, 3, '....SSSSSSHH....');
    }
    if (cfg.long) {
      if (dir === 'up') {
        setRow(rows, 5, '...HHHHHHHHHH...');
        setRow(rows, 6, '...HHHHHHHHHH...');
      } else if (dir === 'left') {
        setRow(rows, 5, '....SSSSSSHHH...');
        setRow(rows, 6, '.....SSSSSHHH...');
      } else {
        setRow(rows, 5, '...HSSSSSSSSH...');
        setRow(rows, 6, '...HHSSSSSSHH...');
      }
    }
    if (cfg.sash) {
      const pts = [[7, 4], [8, 5], [8, 6], [9, 6], [9, 7], [10, 8], [10, 9], [11, 9], [11, 10]];
      pts.forEach(([y, x], i) => setPx(rows, y, x, i % 3 === 2 ? 'U' : 'T'));
    }
    return rows;
  }

  function kidRows(cfg, dir, frame) {
    const rows = [
      '................',
      '................',
      '................',
      '................',
      '.....HHHHHH.....',
      '....HHHHHHHH....',
      '....HSESSESH....',
      '....SSSSSSSS....',
      '.....SSSSSS.....',
      '....CCCCCCCC....',
      '...SCCCCCCCCS...',
      '....CCCCCCCC....',
      '....PPPPPPPP....',
      '....PP....PP....',
      '....BB....BB....',
      '................',
    ];
    if (frame === 1) {
      setRow(rows, 13, '....BB....PP....');
      setRow(rows, 14, '..........BB....');
    }
    if (dir === 'up') {
      setRow(rows, 6, '....HHHHHHHH....');
    } else if (dir === 'left') {
      setRow(rows, 6, '....SESSSSHH....');
    }
    return rows;
  }

  function dogRows(frame) {
    const rows = [
      '................',
      '................',
      '................',
      '................',
      '................',
      '...........DD...',
      '..........DDDD..',
      '..........DEDDN.',
      'D.........DDDD..',
      '.D.DDDDDDDDDD...',
      '..DDDDDDDDDD....',
      '...DDDDDDDDD....',
      '...DD.DD.DD.D...',
      '...DD.DD.DD.D...',
      '................',
      '................',
    ];
    if (frame === 1) {
      setRow(rows, 8, '..........DDDD..');
      setRow(rows, 7, 'D.........DEDDN.');
      setRow(rows, 12, '...DD..DD.DD....');
      setRow(rows, 13, '..DD...DD..DD...');
    }
    return rows;
  }

  // dir: down/up/left/right, frame: 0/1
  function person(type, dir, frame) {
    const key = `${type}_${dir}_${frame}`;
    if (cache[key]) return cache[key];
    const cfg = PEOPLE[type] || PEOPLE.man;
    let c;
    if (cfg.dog) {
      c = paint(dogRows(frame), { D: '#c8902a', E: EYE, N: '#000' }, dir === 'left');
    } else {
      const d = dir === 'right' ? 'left' : dir;
      const rows = cfg.kid ? kidRows(cfg, d, frame) : adultRows(cfg, d, frame);
      const pal = {
        H: cfg.H, S: SKIN, E: EYE, C: cfg.C, P: cfg.P, B: SHOE, W: cfg.W,
        T: cfg.sash || '#d42020', U: '#ffffff', X: cfg.band ? '#ffffff' : cfg.H,
      };
      c = paint(rows, pal, dir === 'right');
    }
    cache[key] = c;
    return c;
  }

  // ---- tiles ----
  function rng(seed) {
    let s = seed;
    return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  }

  function grass(x, seed) {
    x.fillStyle = '#58a838';
    x.fillRect(0, 0, 16, 16);
    const r = rng(seed);
    for (let i = 0; i < 7; i++) {
      x.fillStyle = r() < 0.5 ? '#4a9030' : '#6cc04c';
      const px = Math.floor(r() * 15), py = Math.floor(r() * 15);
      x.fillRect(px, py, 1, 2);
    }
  }

  function water(x, frame) {
    x.fillStyle = '#2860c8';
    x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#5a92ea';
    const o = frame ? 4 : 0;
    x.fillRect((2 + o) % 16, 4, 5, 1);
    x.fillRect((10 + o) % 16, 9, 4, 1);
    x.fillRect((5 + o) % 16, 13, 5, 1);
  }

  function tile(type, variant) {
    const key = `t${type}_${variant}`;
    if (cache[key]) return cache[key];
    const c = mk(16, 16);
    const x = c.getContext('2d');
    switch (type) {
      case T.GRASS: grass(x, 7 + variant * 31); break;
      case T.ROAD: {
        x.fillStyle = '#ccb88c';
        x.fillRect(0, 0, 16, 16);
        const r = rng(99 + variant);
        x.fillStyle = '#b8a476';
        for (let i = 0; i < 6; i++) x.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1);
        break;
      }
      case T.WATER: water(x, variant % 2); break;
      case T.TREE: {
        grass(x, 3);
        x.fillStyle = '#6a4020';
        x.fillRect(7, 11, 2, 4);
        x.fillStyle = '#1e6a24';
        x.beginPath(); x.arc(8, 7, 6, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#3a9a3a';
        x.beginPath(); x.arc(6.5, 5.5, 3, 0, Math.PI * 2); x.fill();
        break;
      }
      case T.MOUNT: {
        grass(x, 5);
        x.fillStyle = '#7a6438';
        x.beginPath(); x.moveTo(0, 16); x.lineTo(8, 1); x.lineTo(16, 16); x.fill();
        x.fillStyle = '#5a4a28';
        x.beginPath(); x.moveTo(8, 1); x.lineTo(16, 16); x.lineTo(10, 16); x.fill();
        x.fillStyle = '#eeeeee';
        x.beginPath(); x.moveTo(5.5, 6); x.lineTo(8, 1); x.lineTo(10.5, 6); x.fill();
        break;
      }
      case T.FIELD: {
        x.fillStyle = '#86b84a';
        x.fillRect(0, 0, 16, 16);
        x.fillStyle = '#5e8e2e';
        for (let i = 1; i < 16; i += 4) x.fillRect(0, i, 16, 1);
        x.fillStyle = '#c8d860';
        for (let i = 2; i < 16; i += 4) x.fillRect((i * 3) % 13, i + 1, 2, 1);
        break;
      }
      case T.SAND: {
        x.fillStyle = '#e8d8a0';
        x.fillRect(0, 0, 16, 16);
        x.fillStyle = '#d4c084';
        x.fillRect(3, 4, 1, 1); x.fillRect(11, 9, 1, 1); x.fillRect(6, 13, 1, 1);
        break;
      }
      case T.FLOWER: {
        grass(x, 11);
        const cols = ['#ff5a7a', '#ffe04a', '#ffffff'];
        [[3, 4], [10, 3], [6, 10], [12, 12], [2, 13]].forEach(([px, py], i) => {
          x.fillStyle = cols[(i + variant) % 3];
          x.fillRect(px, py, 2, 2);
        });
        break;
      }
      case T.BRIDGE: {
        water(x, 0);
        x.fillStyle = '#a07040';
        x.fillRect(0, 1, 16, 14);
        x.fillStyle = '#7a5028';
        for (let i = 1; i < 16; i += 3) x.fillRect(i, 1, 1, 14);
        x.fillRect(0, 1, 16, 1); x.fillRect(0, 14, 16, 1);
        break;
      }
      case T.PLAZA: {
        x.fillStyle = '#d4ccbc';
        x.fillRect(0, 0, 16, 16);
        x.fillStyle = '#b4ac9c';
        x.fillRect(0, 7, 16, 1); x.fillRect(0, 15, 16, 1);
        x.fillRect(7, 0, 1, 7); x.fillRect(15, 8, 1, 7);
        break;
      }
      case T.BOARD: {
        grass(x, 13);
        x.fillStyle = '#6a4020';
        x.fillRect(3, 9, 2, 7); x.fillRect(11, 9, 2, 7);
        x.fillStyle = '#e8e8e8';
        x.fillRect(1, 2, 14, 9);
        x.fillStyle = '#888';
        x.fillRect(1, 2, 14, 1); x.fillRect(1, 6, 14, 1); x.fillRect(1, 10, 14, 1);
        x.fillRect(5, 2, 1, 9); x.fillRect(10, 2, 1, 9);
        // 他候補のポスター
        x.fillStyle = '#3a9a4a'; x.fillRect(2, 3, 3, 3);
        x.fillStyle = '#ff7ab0'; x.fillRect(11, 7, 3, 3);
        if (variant === 1) {
          // 自分のポスター
          x.fillStyle = '#2a50c0'; x.fillRect(6, 3, 4, 3);
          x.fillStyle = '#f2c094'; x.fillRect(7, 3, 2, 2);
          x.fillStyle = '#d42020'; x.fillRect(6, 7, 4, 3);
          x.fillStyle = '#fff'; x.fillRect(7, 8, 2, 1);
        }
        break;
      }
      case T.PODIUM: {
        x.fillStyle = '#d4ccbc';
        x.fillRect(0, 0, 16, 16);
        x.fillStyle = '#a01818';
        x.fillRect(3, 7, 10, 8);
        x.fillStyle = '#d42020';
        x.fillRect(3, 7, 10, 2);
        x.fillStyle = '#fff';
        x.fillRect(6, 10, 4, 3);
        x.fillStyle = '#333';
        x.fillRect(8, 2, 1, 5);
        x.fillStyle = '#111';
        x.fillRect(7, 1, 3, 2);
        break;
      }
      case T.ONSEN: {
        x.fillStyle = '#8a8a8a';
        x.fillRect(0, 0, 16, 16);
        x.fillStyle = '#7ad0e0';
        x.fillRect(1, 1, 14, 14);
        x.fillStyle = variant % 2 ? '#ffffff' : '#d8f4f8';
        x.fillRect(4, 3 + (variant % 2), 1, 3); x.fillRect(8, 2, 1, 4); x.fillRect(12, 3 + ((variant + 1) % 2), 1, 3);
        break;
      }
      default:
        x.fillStyle = '#f0f';
        x.fillRect(0, 0, 16, 16);
    }
    cache[key] = c;
    return c;
  }

  return { person, tile };
})();
