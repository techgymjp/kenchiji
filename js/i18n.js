'use strict';
// 表示言語（日本語 / 英語）。端末の言語が日本語なら日本語、それ以外は英語。タイトル画面で切り替えも可能
// ゲーム中の文章は日本語のまま書き、英語は js/i18n-en.js の翻訳表（日本語の文 → 英語の文）から引く。
// 数や名前が入る文は '{n}人' のように {名前} の形で書き、tr(文, { n: 3 }) で埋める（{N} はプレイヤー名）

const I18N = (() => {
  const STORE_KEY = 'kenchiji_lang';
  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
  const deviceLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'ja';
  let lang = saved === 'ja' || saved === 'en' ? saved : (/^ja\b/i.test(deviceLang) ? 'ja' : 'en');

  // 画面の固定の文言（index.html の data-i18n）
  const UI_TEXT = {
    ja: {
      'doc.title': '県知事になろう',
      'title.sub': 'ひなた県知事選挙',
      'title.name': '県知事に<br>なろう',
      'title.desc': '17日間の選挙戦を かけぬけろ！',
      'title.help': '移動：矢印/WASD　決定：Z/Enter/Space　メニュー：X/Esc',
      'title.helpTouch': '十字ボタン：移動　A：決定・しらべる　B：メニュー',
      'legal.privacy': 'プライバシーポリシー',
      'legal.adSettings': '広告の設定',
      'url.privacy': 'https://techgym.jp/privacy-policy/',
      'pad.a': 'しらべる',
      'pad.b': 'メニュー',
    },
    en: {
      'doc.title': 'Run for Governor!',
      'title.sub': 'Hinata Prefecture Governor Election',
      'title.name': 'Run for <br>Governor!',
      'title.desc': 'Survive a 17-day campaign and win the vote!',
      'title.help': 'Move: Arrows/WASD　OK: Z/Enter/Space　Menu: X/Esc',
      'title.helpTouch': 'D-pad: Move　A: OK / Talk　B: Menu',
      'legal.privacy': 'Privacy Policy',
      'legal.adSettings': 'Ad Settings',
      'url.privacy': 'https://techgym.jp/privacy-policy-en/',
      'pad.a': 'TALK',
      'pad.b': 'MENU',
    },
  };

  function fill(s, p) {
    if (!p) return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (p[k] !== undefined ? p[k] : m));
  }

  // 日本語の文を表示言語に訳す（翻訳表にない文はそのまま）
  function tr(s, p) {
    if (s === null || s === undefined) return s;
    let r = String(s);
    if (lang === 'en' && typeof EN !== 'undefined' && Object.prototype.hasOwnProperty.call(EN, r)) r = EN[r];
    return fill(r, p);
  }

  function ui(key) { return UI_TEXT[lang][key] || UI_TEXT.ja[key] || key; }

  function apply() {
    document.documentElement.lang = lang;
    document.title = ui('doc.title');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = ui(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-href]').forEach(el => { el.href = ui(el.dataset.i18nHref); });
    document.querySelectorAll('[data-lang]').forEach(el => el.classList.toggle('on', el.dataset.lang === lang));
  }

  function set(l) {
    if (!UI_TEXT[l] || l === lang) return;
    lang = l;
    try { localStorage.setItem(STORE_KEY, l); } catch (e) { /* ignore */ }
    apply();
  }

  // データ表の項目（地区名など）を、読むたびに表示言語へ訳すようにする。
  // prefix を付けると、同じ日本語でも '看板:商工会議所' のような別の訳を先に探す（屋根の看板用の短い訳など）
  function localize(obj, fields, prefix) {
    fields.forEach(f => {
      const ja = obj[f];
      const get = () => (prefix && lang === 'en' && typeof EN !== 'undefined' && EN[prefix + ja] !== undefined ? EN[prefix + ja] : tr(ja));
      Object.defineProperty(obj, f, { get, enumerable: true, configurable: true });
      Object.defineProperty(obj, f + 'Ja', { value: ja, enumerable: false });
    });
  }

  return {
    get lang() { return lang; },
    tr, ui, apply, set, localize,
  };
})();

const tr = I18N.tr;

// 資金（ゲーム内では万円単位）の表示。英語では百万円単位（¥20M など）。short は状態ウィンドウ用の短い表記
function fmtMoney(m, short) {
  if (I18N.lang === 'en') return '¥' + (m / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M';
  return m.toLocaleString('ja-JP') + (short ? '万' : '万円');
}
