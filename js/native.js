'use strict';
// Android アプリ（Capacitor）との連携。Web 版では Capacitor がないので何もしない

const Native = (() => {
  const cap = window.Capacitor;
  const native = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const plugin = name => (native && cap.Plugins ? cap.Plugins[name] : null);
  const $ = id => document.getElementById(id);

  // アプリではキー名ではなくボタン名で案内する
  if (native) {
    document.body.classList.add('native');
    $('titleHelp').textContent = '十字ボタン：移動　A：決定・しらべる　B：メニュー';
  }

  // タイトル画面にビルド番号を出す
  if (window.APP_VERSION && window.APP_VERSION !== 'dev') $('buildInfo').textContent = window.APP_VERSION;

  // EU など同意が必要な地域では「広告の設定」を開けるようにする
  Ads.initDone.then(() => { if (Ads.privacyOptionsRequired) $('adPrivacy').classList.remove('hidden'); });
  $('adPrivacy').addEventListener('click', e => { e.preventDefault(); Ads.showPrivacyOptions(); });

  // 別アプリに切り替えたら音を止め、その時点の状態をセーブしておく（裏で終了されても続きから遊べるように）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      Sound.suspend();
      if (typeof G !== 'undefined' && G && G.scene === 'field') save();
    } else if (!Ads.showing) {
      Sound.resume();
    }
  });

  // 戻るボタン：タイトル画面ではアプリを終了、それ以外は B ボタン（メニュー・キャンセル）
  const App = plugin('App');
  if (App) {
    App.addListener('backButton', () => {
      if (Ads.showing) return;
      if (!$('title').classList.contains('hidden')) App.exitApp();
      else Input.press('b');
    });
  }

  // 結果のシェア：アプリでは Android の共有メニュー、Web では共有 API かクリップボード
  async function share(text) {
    const nativeShare = plugin('Share');
    if (nativeShare) {
      try { await nativeShare.share({ title: '県知事になろう', text, dialogTitle: '結果をシェア' }); } catch (e) { /* キャンセル */ }
      return 'shared';
    }
    if (navigator.share) {
      try { await navigator.share({ title: '県知事になろう', text }); } catch (e) { /* キャンセル */ }
      return 'shared';
    }
    try {
      await navigator.clipboard.writeText(text);
      return 'copied';
    } catch (e) {
      return 'failed';
    }
  }

  return { native, share };
})();
