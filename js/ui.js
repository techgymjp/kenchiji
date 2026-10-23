'use strict';
// ドラクエ風ウィンドウ（メッセージ・選択肢・パネル）と入力・効果音

const Sound = (() => {
  let ctx = null;
  let on = true;
  try { on = localStorage.getItem('kenchiji_sound') !== 'off'; } catch (e) { /* ignore */ }
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type = 'square', vol = 0.05, delay = 0) {
    if (!on) return;
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = c.currentTime + delay;
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  const seq = (notes, step = 0.12, type = 'square', vol = 0.05) =>
    notes.forEach((n, i) => n && tone(n, step * 0.95, type, vol, i * step));
  // ブラウザの自動再生制限：最初の操作で音を有効にする
  const unlock = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); };
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
  return {
    get on() { return on; },
    context: ac,
    // アプリの切り替え中や全画面広告の表示中は音を止める
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && on && document.visibilityState === 'visible') ctx.resume(); },
    toggle() {
      on = !on;
      try { localStorage.setItem('kenchiji_sound', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
      if (typeof BGM !== 'undefined') BGM.refresh();
      return on;
    },
    blip() { tone(880, 0.025, 'square', 0.015); },
    cursor() { tone(1200, 0.04, 'square', 0.03); },
    ok() { tone(660, 0.06, 'square', 0.04); tone(990, 0.08, 'square', 0.04, 0.05); },
    bump() { tone(110, 0.08, 'square', 0.04); },
    encounter() { seq([523, 659, 784, 1047, 0, 784, 1047], 0.07); },
    good() { seq([784, 988, 1175, 1568], 0.08); },
    bad() { seq([392, 370, 349, 311], 0.13, 'triangle', 0.08); },
    fanfare() { seq([523, 523, 523, 698, 0, 880, 784, 880, 1047, 0, 1047, 1047], 0.13, 'square', 0.05); },
    night() { seq([659, 523, 440, 523, 392], 0.2, 'triangle', 0.06); },
  };
})();

const Input = (() => {
  const held = new Set();
  let handler = null; // UIが入力を奪うときのハンドラ
  const listeners = [];
  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
    z: 'a', Z: 'a', Enter: 'a', ' ': 'a', x: 'b', X: 'b', Escape: 'b', Backspace: 'b',
  };
  function press(k) {
    if (handler) { handler(k); return; }
    listeners.forEach(fn => fn(k));
  }
  window.addEventListener('keydown', e => {
    if (e.target && e.target.tagName === 'INPUT') {
      if (e.key === 'Enter') { e.preventDefault(); press('a'); }
      return;
    }
    const k = KEYMAP[e.key];
    if (!k) return;
    e.preventDefault();
    if (['up', 'down', 'left', 'right'].includes(k)) held.add(k);
    if (!e.repeat || ['up', 'down'].includes(k)) press(k);
  });
  window.addEventListener('keyup', e => {
    const k = KEYMAP[e.key];
    if (k) held.delete(k);
  });
  window.addEventListener('blur', () => held.clear());
  // タッチパッド
  document.querySelectorAll('#pad button').forEach(btn => {
    const k = btn.dataset.k;
    const down = e => {
      e.preventDefault();
      btn.classList.add('on');
      if (['up', 'down', 'left', 'right'].includes(k)) held.add(k);
      press(k);
    };
    const up = e => {
      e.preventDefault();
      btn.classList.remove('on');
      held.delete(k);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
  });
  return {
    held,
    press,
    capture(fn) { handler = fn; },
    release() { handler = null; },
    get captured() { return !!handler; },
    on(fn) { listeners.push(fn); },
  };
})();

const UI = (() => {
  const $ = id => document.getElementById(id);
  const msg = $('msg'), msgText = $('msgText'), msgNext = $('msgNext');
  const choice = $('choice'), panel = $('panel'), fade = $('fade'), banner = $('banner');
  let typing = null;
  const vars = {};

  function fmt(s) {
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  }

  function typeText(text) {
    return new Promise(resolve => {
      msg.classList.remove('hidden');
      msgNext.classList.remove('on');
      const chars = Array.from(text);
      let i = 0;
      msgText.textContent = '';
      const done = () => {
        clearInterval(typing);
        typing = null;
        msgText.textContent = text;
        resolve();
      };
      typing = setInterval(() => {
        i++;
        msgText.textContent = chars.slice(0, i).join('');
        if (i % 2 === 0) Sound.blip();
        if (i >= chars.length) done();
      }, 22);
      Input.capture(k => { if (k === 'a' || k === 'b') done(); });
      msg.onclick = () => done();
    });
  }

  function waitA() {
    return new Promise(resolve => {
      msgNext.classList.add('on');
      const fin = () => {
        msgNext.classList.remove('on');
        Input.release();
        msg.onclick = null;
        Sound.cursor();
        resolve();
      };
      Input.capture(k => { if (k === 'a' || k === 'b') fin(); });
      msg.onclick = () => fin();
    });
  }

  // ページ送りのメッセージ
  async function say(...pages) {
    pages = pages.flat().filter(p => p !== null && p !== undefined && p !== '');
    for (const p of pages) {
      await typeText(fmt(p));
      await waitA();
    }
  }

  // 選択肢 opts: 文字列 or {label, disabled}
  function choose(opts, { cancel = false, title = '', pos = '' } = {}) {
    return new Promise(resolve => {
      const items = opts.map(o => (typeof o === 'string' ? { label: o } : o));
      let sel = items.findIndex(o => !o.disabled);
      if (sel < 0) sel = 0;
      choice.className = 'win' + (pos ? ' ' + pos : '');
      const render = () => {
        choice.innerHTML = (title ? `<div class="ttl">${fmt(title)}</div>` : '') +
          items.map((o, i) =>
            `<div class="item${i === sel ? ' sel' : ''}${o.disabled ? ' dis' : ''}" data-i="${i}">${fmt(o.label)}</div>`
          ).join('');
        choice.querySelectorAll('.item').forEach(el => {
          el.onclick = e => {
            e.stopPropagation();
            const i = +el.dataset.i;
            if (items[i].disabled) { Sound.bump(); return; }
            sel = i;
            finish(i);
          };
        });
        const cur = choice.querySelector('.item.sel');
        if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
      };
      const finish = i => {
        Input.release();
        choice.classList.add('hidden');
        if (i >= 0) Sound.ok(); else Sound.cursor();
        resolve(i);
      };
      Input.capture(k => {
        if (k === 'up' || k === 'down') {
          const d = k === 'up' ? -1 : 1;
          let n = sel;
          for (let c = 0; c < items.length; c++) {
            n = (n + d + items.length) % items.length;
            if (!items[n].disabled) break;
          }
          sel = n;
          Sound.cursor();
          render();
        } else if (k === 'a') {
          if (items[sel].disabled) { Sound.bump(); return; }
          finish(sel);
        } else if (k === 'b' && cancel) {
          finish(-1);
        }
      });
      render();
    });
  }

  // メッセージを出してから選択肢
  async function ask(text, opts, o = {}) {
    if (text) await typeText(fmt(text));
    return choose(opts, o);
  }

  function showPanel(html) {
    return new Promise(resolve => {
      panel.innerHTML = fmt(html) + '<div class="close">― Aボタン / クリックで とじる ―</div>';
      panel.classList.remove('hidden');
      panel.scrollTop = 0;
      let ready = false;
      setTimeout(() => { ready = true; }, 250);
      const fin = () => {
        if (!ready) return;
        Input.release();
        panel.classList.add('hidden');
        panel.onclick = null;
        Sound.cursor();
        resolve();
      };
      Input.capture(k => {
        if (k === 'a' || k === 'b') fin();
        else if (k === 'up') panel.scrollTop -= 40;
        else if (k === 'down') panel.scrollTop += 40;
      });
      panel.onclick = fin;
    });
  }

  function closeMsg() {
    msg.classList.add('hidden');
    choice.classList.add('hidden');
    msgText.textContent = '';
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function fadeOut() { fade.classList.remove('flash'); fade.classList.add('on'); await sleep(480); }
  async function fadeIn() { fade.classList.remove('on'); await sleep(480); }
  async function flash(n = 3) {
    fade.classList.add('flash');
    for (let i = 0; i < n; i++) {
      fade.classList.add('on'); await sleep(70);
      fade.classList.remove('on'); await sleep(70);
    }
    fade.classList.remove('flash');
  }
  async function showBanner(text, ms = 2200) {
    banner.textContent = text;
    banner.classList.remove('hidden');
    await sleep(ms);
    banner.classList.add('hidden');
  }

  return {
    vars, fmt, say, ask, choose, showPanel, closeMsg, fadeOut, fadeIn, flash, showBanner, sleep,
    get busy() { return Input.captured; },
  };
})();
