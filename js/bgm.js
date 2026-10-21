'use strict';
// ファミコン風BGM（矩形波2ch＋三角波ベース）。曲はすべてオリジナル。
// 記法: 音名+オクターブ（C4, F#3, Bb2）または R（休符）、"/n" で長さ（16分音符n個分）。
//       長さを省略すると直前の長さを引き継ぐ。

const BGM = (() => {
  const r = (s, n) => Array(n).fill(s).join(' ');
  const bars = (...b) => b.join(' ');

  const TRACKS = {
    // タイトル：堂々としたマーチ
    title: { bpm: 96, ch: [
      bars('G4/4 C5/4 E5/6 D5/2', 'C5/8 G4/8', 'A4/4 C5/4 F5/6 E5/2', 'D5/12 R/4',
           'E5/4 F5/4 G5/6 E5/2', 'C5/4 E5/4 A5/8', 'G5/4 F5/4 E5/4 D5/4', 'C5/12 R/4'),
      bars('E4/8 G4/8', 'E4/8 E4/8', 'F4/8 A4/8', 'G4/8 B4/8',
           'C5/8 C5/8', 'A4/8 E5/8', 'B4/8 G4/8', 'E4/12 R/4'),
      bars('C3/4 G3/4 C3/4 G3/4', 'E3/4 G3/4 C3/4 G3/4', 'F3/4 C4/4 F3/4 C4/4', 'G3/4 D4/4 G2/4 B2/4',
           'C3/4 G3/4 E3/4 G3/4', 'A2/4 E3/4 A3/4 E3/4', 'G2/4 B2/4 G2/4 B2/4', 'C3/8 G2/4 C3/4'),
    ] },

    // フィールド（昼）：軽快に歩きまわる曲
    field: { bpm: 138, ch: [
      bars('F4/2 A4/2 C5/4 A4/2 C5/2 F5/4', 'E5/4 D5/2 C5/2 D5/8', 'Bb4/2 D5/2 F5/4 E5/2 D5/2 C5/4', 'C5/12 R/4',
           'A4/2 C5/2 F5/4 E5/2 F5/2 G5/4', 'A5/4 G5/2 F5/2 E5/8', 'D5/4 Bb4/4 C5/4 E5/4', 'F5/12 R/4',
           'Bb4/4 D5/4 F5/6 D5/2', 'C5/4 E5/4 G5/8', 'A4/2 Bb4/2 C5/4 D5/2 C5/2 A4/4', 'G4/12 R/4',
           'Bb4/2 C5/2 D5/4 F5/2 E5/2 D5/4', 'C5/2 D5/2 E5/4 F5/2 G5/2 A5/4', 'G5/4 F5/2 E5/2 D5/4 E5/4', 'F5/8 C5/4 R/4'),
      bars(r('R/2 A4/2 R/2 C5/2', 2), r('R/2 G4/2 R/2 C5/2', 2), r('R/2 Bb4/2 R/2 D5/2', 2), r('R/2 G4/2 R/2 E5/2', 2),
           r('R/2 A4/2 R/2 C5/2', 2), r('R/2 A4/2 R/2 D5/2', 2), r('R/2 G4/2 R/2 Bb4/2', 2), r('R/2 A4/2 R/2 C5/2', 2),
           r('R/2 Bb4/2 R/2 D5/2', 2), r('R/2 G4/2 R/2 C5/2', 2), r('R/2 A4/2 R/2 C5/2', 2), r('R/2 G4/2 R/2 E5/2', 2),
           r('R/2 Bb4/2 R/2 D5/2', 2), r('R/2 G4/2 R/2 C5/2', 2), r('R/2 G4/2 R/2 Bb4/2', 2), r('R/2 A4/2 R/2 C5/2', 2)),
      bars('F2/4 C3/4 F3/4 C3/4', 'C3/4 G2/4 C3/4 E3/4', 'Bb2/4 F3/4 Bb2/4 D3/4', 'C3/4 G2/4 C3/4 E3/4',
           'F2/4 C3/4 F3/4 A3/4', 'D3/4 A2/4 D3/4 F3/4', 'C3/4 G2/4 C3/4 E3/4', 'F2/4 C3/4 F2/8',
           'Bb2/4 F3/4 Bb2/4 D3/4', 'C3/4 G3/4 C3/4 E3/4', 'F2/4 C3/4 D3/4 A2/4', 'C3/4 G2/4 C3/4 G2/4',
           'Bb2/4 F3/4 Bb2/4 F3/4', 'C3/4 G3/4 A2/4 E3/4', 'C3/4 G2/4 C3/4 E3/4', 'F2/4 C3/4 F2/8'),
    ] },

    // フィールド（夕方〜夜）：少しさみしげ
    evening: { bpm: 100, ch: [
      bars('D5/6 C5/2 A4/8', 'Bb4/4 A4/4 G4/8', 'F4/6 G4/2 A4/4 C5/4', 'A4/16',
           'D5/6 E5/2 F5/8', 'E5/4 D5/4 C5/8', 'Bb4/4 A4/4 G4/4 E4/4', 'D4/16'),
      bars(r('F4/2 A4/2', 4), r('D4/2 G4/2', 4), r('C4/2 F4/2', 4), r('C#4/2 E4/2', 4),
           r('D4/2 F4/2', 4), r('C4/2 E4/2', 4), r('D4/2 G4/2', 2) + ' ' + r('C#4/2 E4/2', 2), r('D4/2 F4/2', 4)),
      bars('D3/8 A2/8', 'G2/8 D3/8', 'F2/8 C3/8', 'A2/8 E3/8',
           'Bb2/8 F3/8', 'C3/8 G3/8', 'G2/8 A2/8', 'D3/16'),
    ] },

    // 建物の中・朝の事務所
    town: { bpm: 120, ch: [
      bars('G4/2 B4/2 D5/2 B4/2 G4/2 B4/2 D5/4', 'C5/2 E5/2 D5/2 C5/2 B4/8', 'A4/2 C5/2 E5/2 C5/2 A4/2 C5/2 E5/4', 'D5/2 C5/2 B4/2 A4/2 G4/8',
           'B4/4 D5/4 G5/4 D5/4', 'E5/4 C5/4 A4/8', 'D5/4 F#5/4 A5/4 F#5/4', 'G5/8 R/8'),
      bars('D4/8 D4/8', 'E4/8 D4/8', 'C4/8 E4/8', 'D4/8 B3/8',
           'G4/8 B4/8', 'C5/8 A4/8', 'C5/8 D5/8', 'B4/8 R/8'),
      bars('G2/4 D3/4 G2/4 D3/4', 'C3/4 G3/4 G2/4 D3/4', 'A2/4 E3/4 A2/4 E3/4', 'D3/4 A2/4 G2/4 D3/4',
           'G2/4 D3/4 G3/4 D3/4', 'C3/4 G3/4 A2/4 E3/4', 'D3/4 A3/4 D3/4 F#3/4', 'G2/8 R/8'),
    ] },

    // 出来事（ランダムエンカウント）：なにか起きた！
    event: { bpm: 150, ch: [
      bars('A4/2 R/2 A4/2 C5/2 E5/4 D5/4', 'C5/2 B4/2 A4/2 B4/2 G#4/8', 'A4/2 R/2 A4/2 C5/2 E5/4 G5/4', 'F5/2 E5/2 D5/2 B4/2 E5/8'),
      bars('E4/4 E4/4 E4/4 E4/4', 'D4/4 D4/4 E4/8', 'E4/4 E4/4 C5/4 C5/4', 'A4/4 F4/4 G#4/8'),
      bars(r('A2/2 A3/2', 4), r('F2/2 F3/2', 2) + ' ' + r('E2/2 E3/2', 2), r('A2/2 A3/2', 4), r('D3/2 D4/2', 2) + ' ' + r('E2/2 E3/2', 2)),
    ] },

    // スキャンダル・トラブル
    trouble: { bpm: 84, ch: [
      bars('E5/4 D#5/4 E5/4 B4/4', 'C5/8 A4/8', 'B4/4 A#4/4 B4/4 F#4/4', 'G4/12 R/4',
           'E5/4 D#5/4 E5/4 G5/4', 'F#5/8 E5/8', 'D#5/4 C5/4 B4/4 A4/4', 'B4/12 R/4'),
      bars('G4/16', 'E4/16', 'D#4/16', 'E4/16', 'G4/16', 'A4/8 C5/8', 'F#4/16', 'D#4/16'),
      bars(r('E2/2 E3/2', 4), r('A2/2 A3/2', 4), r('B1/2 B2/2', 4), r('E2/2 E3/2', 4),
           r('E2/2 E3/2', 4), r('C3/2 C4/2', 4), r('B1/2 B2/2', 4), r('B1/2 B2/2', 4)),
    ] },

    // 夜の報告：子守歌のように
    night: { bpm: 72, ch: [
      bars('C5/8 A4/4 F4/4', 'G4/8 Bb4/8', 'A4/8 F4/4 D4/4', 'C4/16',
           'F4/4 G4/4 A4/4 C5/4', 'D5/8 C5/8', 'Bb4/4 A4/4 G4/4 E4/4', 'F4/16'),
      bars(r('F3/2 A3/2 C4/2 A3/2', 2), r('E3/2 G3/2 Bb3/2 G3/2', 2), r('D3/2 F3/2 A3/2 F3/2', 2), r('C3/2 E3/2 G3/2 E3/2', 2),
           r('F3/2 A3/2 C4/2 A3/2', 2), r('D3/2 F3/2 Bb3/2 F3/2', 2), r('E3/2 G3/2 C4/2 G3/2', 2), r('F3/2 A3/2 C4/2 A3/2', 2)),
      bars('F2/16', 'C2/16', 'D2/16', 'C2/16', 'F2/16', 'Bb1/16', 'C2/16', 'F2/16'),
    ] },

    // 討論会などの大舞台：戦闘曲ふう
    debate: { bpm: 168, ch: [
      bars('D5/2 D5/2 R/2 D5/2 F5/2 E5/2 D5/2 C5/2', 'D5/4 A4/4 R/4 A4/4', 'Bb4/2 Bb4/2 R/2 Bb4/2 D5/2 C5/2 Bb4/2 A4/2', 'A4/4 E5/4 C#5/8',
           'D5/2 F5/2 A5/4 G5/2 F5/2 E5/4', 'F5/2 E5/2 D5/4 C5/2 Bb4/2 A4/4', 'Bb4/2 C5/2 D5/2 E5/2 F5/2 G5/2 A5/4', 'A5/8 C#5/8'),
      bars(r('A4/2 R/2', 4), r('F4/2 R/2', 4), r('F4/2 R/2', 4), r('E4/2 R/2', 2) + ' E4/8',
           r('A4/2 R/2', 4), r('A4/2 R/2', 2) + ' ' + r('F4/2 R/2', 2), r('F4/2 R/2', 2) + ' ' + r('G4/2 R/2', 2), 'E5/8 E4/8'),
      bars(r('D2/2 D3/2', 4), r('D2/2 D3/2', 4), r('Bb1/2 Bb2/2', 4), r('A1/2 A2/2', 4),
           r('D2/2 D3/2', 4), r('Bb1/2 Bb2/2', 2) + ' ' + r('F2/2 F3/2', 2), r('G2/2 G3/2', 2) + ' ' + r('A2/2 A3/2', 2), r('A1/2 A2/2', 4)),
    ] },

    // 開票速報：緊張感のある刻み
    election: { bpm: 112, ch: [
      bars('A4/2 E5/2 A4/2 E5/2 A4/2 F5/2 A4/2 E5/2', 'A4/2 E5/2 A4/2 E5/2 G4/2 D5/2 G4/2 D5/2',
           'F4/2 C5/2 F4/2 C5/2 F4/2 D5/2 F4/2 C5/2', 'E4/2 B4/2 E4/2 B4/2 E4/2 G#4/2 B4/2 E5/2'),
      bars('C5/16', 'B4/16', 'A4/16', 'G#4/16'),
      bars('A2/4 R/4 A2/4 R/4', 'G2/4 R/4 G2/4 R/4', 'F2/4 R/4 F2/4 R/4', 'E2/4 R/4 E2/4 E2/4'),
    ] },

    // 当選！
    victory: { bpm: 120, ch: [
      bars('C5/2 C5/2 C5/2 C5/2 G5/8', 'F5/2 E5/2 D5/2 E5/2 C5/8', 'A4/2 C5/2 F5/4 E5/2 D5/2 C5/4', 'D5/2 E5/2 F5/4 G5/8',
           'C6/4 B5/2 A5/2 G5/4 E5/4', 'F5/4 A5/4 G5/8', 'E5/2 F5/2 G5/4 D5/4 B4/4', 'C5/12 R/4'),
      bars('G4/8 E4/8', 'A4/8 G4/8', 'F4/8 A4/8', 'B4/8 B4/8',
           'E5/8 C5/8', 'C5/8 B4/8', 'C5/8 G4/8', 'E4/12 R/4'),
      bars('C3/4 G3/4 C3/4 G3/4', 'F3/4 C3/4 G2/4 C3/4', 'F2/4 C3/4 F3/4 A3/4', 'G2/4 D3/4 G3/4 B3/4',
           'A2/4 E3/4 C3/4 G3/4', 'F2/4 C3/4 G2/4 D3/4', 'C3/4 E3/4 G2/4 B2/4', 'C3/8 G2/4 C3/4'),
    ] },

    // 落選…
    defeat: { bpm: 66, ch: [
      bars('E5/8 D5/4 C5/4', 'B4/8 A4/8', 'F4/4 G4/4 A4/4 C5/4', 'B4/16',
           'C5/8 B4/4 A4/4', 'G#4/8 A4/8', 'F4/4 E4/4 D4/4 B3/4', 'A3/16'),
      bars('A4/16', 'F4/16', 'D4/16', 'E4/16', 'A4/16', 'E4/16', 'D4/8 B3/8', 'C4/16'),
      bars('A2/16', 'F2/16', 'D2/16', 'E2/16', 'A2/16', 'E2/16', 'D2/16', 'A2/16'),
    ] },
  };

  // チャンネル設定：[波形, 音量, 音を切る割合]
  const VOICES = [
    { wave: 'pulse25', vol: 0.05, gate: 0.88 },
    { wave: 'pulse50', vol: 0.025, gate: 0.8 },
    { wave: 'triangle', vol: 0.11, gate: 0.92 },
  ];
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function parse(str) {
    const out = [];
    let len = 4;
    str.trim().split(/\s+/).forEach(tok => {
      const [n, l] = tok.split('/');
      if (l) len = +l;
      if (n === 'R') { out.push({ f: 0, len }); return; }
      const m = /^([A-G])([#b]?)(\d)$/.exec(n);
      if (!m) throw new Error('BGM: bad note ' + tok);
      const midi = 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
      out.push({ f: 440 * Math.pow(2, (midi - 69) / 12), len });
    });
    return out;
  }

  const parsed = {};
  Object.keys(TRACKS).forEach(k => { parsed[k] = TRACKS[k].ch.map(parse); });

  // ファミコンの矩形波（デューティ比）を再現
  const waves = {};
  function pulseWave(c, duty) {
    const key = 'pulse' + duty;
    if (waves[key]) return waves[key];
    const n = 32;
    const real = new Float32Array(n), imag = new Float32Array(n);
    for (let i = 1; i < n; i++) {
      real[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    }
    waves[key] = c.createPeriodicWave(real, imag);
    return waves[key];
  }

  let name = null;
  let timer = null;
  let master = null;
  let chans = [];

  function startTrack() {
    const c = Sound.context();
    if (!c || !name) return;
    master = c.createGain();
    master.gain.value = 1;
    master.connect(c.destination);
    const t0 = c.currentTime + 0.05;
    chans = parsed[name].map((notes, i) => ({ notes, i: 0, next: t0, voice: VOICES[i] }));
    const step = 60 / TRACKS[name].bpm / 4;
    const myMaster = master;
    const tick = () => {
      if (master !== myMaster) return;
      const now = c.currentTime;
      chans.forEach(ch => {
        if (ch.next < now - 0.3) ch.next = now + 0.02; // タブ復帰時などの遅れは捨てる
        while (ch.next < now + 0.25) {
          const n = ch.notes[ch.i];
          const dur = n.len * step;
          if (n.f) playNote(c, myMaster, ch.voice, n.f, ch.next, dur);
          ch.next += dur;
          ch.i = (ch.i + 1) % ch.notes.length;
        }
      });
    };
    tick();
    timer = setInterval(tick, 40);
  }

  function playNote(c, out, v, f, t, dur) {
    const o = c.createOscillator();
    if (v.wave === 'triangle') o.type = 'triangle';
    else o.setPeriodicWave(pulseWave(c, v.wave === 'pulse25' ? 0.25 : v.wave === 'pulse12' ? 0.125 : 0.5));
    o.frequency.value = f;
    const g = c.createGain();
    const end = t + dur * v.gate;
    g.gain.setValueAtTime(v.vol, t);
    g.gain.setValueAtTime(v.vol * 0.8, t + Math.min(0.05, dur * 0.3));
    g.gain.linearRampToValueAtTime(0, end);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(end + 0.01);
  }

  function stopTrack() {
    if (timer) clearInterval(timer);
    timer = null;
    if (master) {
      const c = Sound.context();
      const m = master;
      master = null;
      try {
        m.gain.setValueAtTime(m.gain.value, c.currentTime);
        m.gain.linearRampToValueAtTime(0, c.currentTime + 0.15);
        setTimeout(() => m.disconnect(), 400);
      } catch (e) { m.disconnect(); }
    }
  }

  return {
    TRACKS,
    get current() { return name; },
    play(n) {
      if (n === name && (timer || !Sound.on)) return;
      stopTrack();
      name = n;
      if (Sound.on) startTrack();
    },
    stop() { stopTrack(); name = null; },
    refresh() {
      stopTrack();
      if (Sound.on && name) startTrack();
    },
  };
})();
