// 英語の翻訳表（js/i18n-en.js）に入っていない日本語の文を探す
//   node scripts/check-i18n.js          … 訳がない文の一覧（なければ OK）
//   node scripts/check-i18n.js --json   … 訳がない文を JSON で出す（翻訳作業用）
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
// i18n.js は画面の固定文言の表（日本語と英語の両方を持つ）なので対象外
const FILES = ['map.js', 'ui.js', 'native.js', 'events.js', 'election.js', 'engine.js'];
const JA = /[ぁ-ヺ㐀-鿿]/;
// 日本語でだけ使う文（英語では別の処理で表示する）
const JA_ONLY = new Set(['午前', '午後', '時', '分', '万', '万円', '🌐 日本語', '看板:']);

// 文字列リテラルとテンプレートの文字部分を取り出す（${...} の中も調べる）
function scan(src, out) {
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
    if (c === "'" || c === '"') {
      let j = i + 1, s = '';
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; continue; }
        s += src[j++];
      }
      out.push(vm.runInNewContext(c + s + c));
      i = j + 1;
      continue;
    }
    if (c === '`') {
      let j = i + 1, s = '';
      while (j < src.length && src[j] !== '`') {
        if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; continue; }
        if (src[j] === '$' && src[j + 1] === '{') {
          out.push(s); s = '';
          let d = 0, k = j + 1;
          for (; k < src.length; k++) {
            if (src[k] === '{') d++;
            else if (src[k] === '}' && --d === 0) break;
            else if (src[k] === "'" || src[k] === '"' || src[k] === '`') {
              // 式の中の文字列は飛ばさずに後で調べる
              const q = src[k];
              let m = k + 1;
              while (m < src.length && src[m] !== q) { if (src[m] === '\\') m++; m++; }
              k = m;
            }
          }
          scan(src.slice(j + 2, k), out);
          j = k + 1;
          continue;
        }
        s += src[j++];
      }
      out.push(s);
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}

const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'js', 'i18n-en.js'), 'utf8') + '\nthis.EN = EN;', ctx);
const EN = ctx.EN;

const missing = [];
const seen = new Set();
for (const f of FILES) {
  for (const s of scan(fs.readFileSync(path.join(root, 'js', f), 'utf8'), [])) {
    if (!JA.test(s) || JA_ONLY.has(s) || seen.has(s)) continue;
    seen.add(s);
    if (!Object.prototype.hasOwnProperty.call(EN, s)) missing.push({ file: f, text: s });
  }
}

// 翻訳の {名前} が日本語と同じかも確かめる
const bad = [];
for (const [ja, en] of Object.entries(EN)) {
  const keys = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
  if (keys(ja) !== keys(en)) bad.push({ ja, en });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(missing.map(m => m.text), null, 1));
} else {
  missing.forEach(m => console.log(`訳なし ${m.file}: ${m.text.replace(/\n/g, '\\n')}`));
  bad.forEach(b => console.log(`{} が一致しない: ${b.ja} → ${b.en}`));
  console.log(`日本語の文 ${seen.size} 件 / 訳なし ${missing.length} 件 / {} の不一致 ${bad.length} 件`);
  process.exitCode = missing.length || bad.length ? 1 : 0;
}
