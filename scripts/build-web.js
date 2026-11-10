// Web ファイルを www/ にコピーする（Web 版の公開と、Android / iOS アプリへの同梱に使う）
//   npm run build      … Web 版（Vercel）
//   npm run build:app  … アプリ用（APP_BUILD=1）。Web 版だけの部分を取り除く
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
for (const item of ['index.html', 'css', 'js']) {
  const src = path.join(root, item);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, item), { recursive: true });
}
// アプリ用のビルドでは、Web 版だけの部分（Google Play へのリンクなど）を取り除く。
// アプリで「隠す」のではなくバンドルに入れないことで、App Store の審査で隠し機能と見なされないようにする。
//   HTML：<!-- web-only --> … <!-- /web-only -->   JS：// web-only:start … // web-only:end
if (process.env.APP_BUILD === '1') {
  const strip = file => {
    const s = fs.readFileSync(file, 'utf8');
    const t = s
      .replace(/[ \t]*<!-- web-only -->[\s\S]*?<!-- \/web-only -->[ \t]*\n?/g, '')
      .replace(/[ \t]*\/\/ web-only:start[\s\S]*?\/\/ web-only:end[ \t]*\n?/g, '');
    if (t !== s) fs.writeFileSync(file, t);
  };
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js)$/.test(e.name)) strip(p);
  });
  walk(out);
}

// ストアに出すビルドでは本番の広告を使う
const mode = process.env.ADMOB_MODE === 'production' ? 'production' : 'test';
fs.writeFileSync(path.join(out, 'js', 'ads-config.js'), `// ビルド時に生成\nwindow.AD_MODE = '${mode}';\n`);
// タイトル画面に出すバージョン（CI では VERSION_NAME / VERSION_CODE を使う）
const version = process.env.VERSION_CODE
  ? `v${process.env.VERSION_NAME || require('../package.json').version} (build ${process.env.VERSION_CODE})`
  : 'dev';
fs.writeFileSync(path.join(out, 'js', 'build-info.js'), `// ビルド時に生成\nwindow.APP_VERSION = '${version}';\n`);
// アプリ用のビルドに、Web 版だけの内容の取り残しがあればビルドを止める（生成したファイルも含めて調べる）
if (process.env.APP_BUILD === '1') {
  const found = [];
  const check = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) check(p);
    else if (/\.(html|js|css)$/.test(e.name) && /play\.google\.com|Google Play/.test(fs.readFileSync(p, 'utf8'))) found.push(path.relative(out, p));
  });
  check(out);
  if (found.length) {
    console.error(`アプリ用のビルドに Web 版だけの内容（Google Play）が残っています: ${found.join(', ')}`);
    process.exit(1);
  }
}
console.log(`built web assets into www/ (${process.env.APP_BUILD === '1' ? 'app' : 'web'}, ads: ${mode}, version: ${version})`);
