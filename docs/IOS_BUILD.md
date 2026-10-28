# iOS 版をビルドして App Store に出す手順（Mac での作業）

県知事になろう の iOS 版は、Android 版と同じ Capacitor で作っています（`ios/` フォルダ）。
コードの準備はできているので、Mac では「ビルドして App Store Connect にアップロードする」作業だけを行います。

- Bundle ID：`jp.techgym.kenchiji`（Android と同じ）
- チーム：Team ID `GNM3VTX9YG`（Xcode の設定に入れてあります）。Apple Developer には**個人で登録**しています（App Store の販売元は個人名になります）
- 対応端末：iPhone（横画面固定）。iPad では iPhone 用の画面で動きます
- 表示言語：日本語 / 英語（端末の言語で切り替わる。ホーム画面のアプリ名も英語の端末では「Run for Governor!」）
- 広告：AdMob（iOS 用のアプリと広告ユニット。バナー・インタースティシャル・リワード）。起動時に「トラッキングの許可」の確認画面が出ます

---

## 0. ブラウザでの準備（ゲームごとに1回だけ）

1. **Apple Developer**（developer.apple.com）→「Certificates, Identifiers & Profiles」→「Identifiers」→「＋」→「App IDs」→「App」
   - Description：`Run for Governor`（英数字だけ。「！」や日本語は使えないことがある）
   - Bundle ID：「Explicit」で `jp.techgym.kenchiji`
   - Capabilities：何もチェックしない
2. **App Store Connect**（appstoreconnect.apple.com）→「マイ App」→「＋」→「新規 App」
   - プラットフォーム：iOS ／ 名前：`県知事になろう 〜ドット絵の選挙RPG〜`（Google Play と同じ。App Store 全体で重複不可）／ プライマリ言語：日本語
   - バンドル ID：1 で登録したもの ／ SKU：`kenchiji`（あとから変更不可）／ ユーザアクセス：アクセス制限なし
3. **AdMob**
   - 「アプリを追加」→ **iOS** →「ストアに掲載されていない」で登録し、**バナー・インタースティシャル・リワード**の広告ユニットを作る
   - アプリ ID（`ca-app-pub-…~…`）と広告ユニット ID 3 つを Claude Code に渡す（アプリ ID は `ios/App/App/Info.plist` の `GADApplicationIdentifier`、広告ユニット ID は `js/ads.js` の `UNITS.ios.production` に入ります）
   - 「プライバシーとメッセージ」→「欧州の規制」のメッセージに iOS アプリも追加する

iOS 用の AdMob の ID（アプリ ID と、バナー・インタースティシャル・リワードの広告ユニット）は設定済みです。広告ユニットを消して作り直したときは、新しい ID を Claude Code に渡して入れ直してもらってください。

---

## 1. Mac の準備（最初の1回だけ）

1. **Xcode** を App Store からインストールする（数十 GB あるので時間がかかります）。インストール後に一度起動し、追加コンポーネントのインストールを済ませる
2. Xcode の「Settings…」→「Accounts」→「＋」で、Apple Developer に登録している Apple ID でサインインする（チームが個人名で表示されれば OK）
3. **Node.js**（LTS 版）を https://nodejs.org/ からインストールする
4. ターミナルでリポジトリを取得する
   ```bash
   cd ~/Desktop   # 置きたい場所（どこでもよい）
   git clone https://github.com/techgymjp/kenchiji.git
   cd kenchiji
   npm ci
   ```
   `git` がないと言われたら、表示に従って「コマンドライン・デベロッパツール」をインストールしてから、もう一度実行します。

2回目以降は、`cd kenchiji` のあと `git pull` と `npm ci` で最新にします。

---

## 2. 自分の iPhone で動作確認する（テスト広告）

```bash
npm run ios:sync    # ゲームのファイルを iOS のプロジェクトにコピー（テスト広告）
npm run ios:open    # Xcode で開く
```

1. iPhone を USB ケーブルで Mac につなぎ、iPhone で「このコンピュータを信頼」を許可する
2. iPhone の「設定」→「プライバシーとセキュリティ」→「デベロッパモード」をオンにする（再起動を求められます。項目がない場合は、Xcode で一度 iPhone を選ぶと表示されます）
3. Xcode の上部で、実行先に自分の iPhone を選ぶ
4. 左の「App」→「Signing & Capabilities」で、「Automatically manage signing」がオン、Team に自分（個人名）のチームが選ばれていることを確認する
5. ▶（Run）を押すと、iPhone にアプリが入って起動する

確認すること：

- 横画面で全画面表示になる。左に十字ボタン、右に A・B ボタン、真ん中にゲーム画面
- 起動時にトラッキングの確認画面が出る（日本語の端末なら日本語で）
- 画面の下に**テスト広告**のバナーが出て、ゲーム画面や操作ボタンと重ならない（ホームインジケータの上に出る）
- 「はじめから」「つづきから」と、メニューの「トップへ」で全画面のテスト広告が出る。夜の報告のあとにも出る
- 選挙事務所の「応援動画を見る」で、リワードのテスト広告が出て体力が全回復する
- 音（BGM・効果音）が鳴る。別のアプリに切り替えると止まり、戻ると続きから遊べる
- エンディングの「結果を シェアする」で共有メニューが出る
- 端末の言語を英語にすると、ゲームもホーム画面のアプリ名も英語になる

---

## 3. App Store 用にビルドしてアップロードする（本番広告）

```bash
git pull && npm ci
npm run ios:release   # 本番の広告 ID でコピーする（ここが ios:sync と違う）
npm run ios:open
```

1. Xcode の左で「App」→「General」→「Identity」を開き、**Build の番号を前回より大きくする**（初回は 1。アップロードのたびに 2、3…と上げる。同じ番号は二度アップロードできない）。Version はストアに表示されるバージョン（1.0.0）
2. 上部の実行先を「**Any iOS Device (arm64)**」にする
3. メニューの「Product」→「**Archive**」（Product のメニューは画面最上部のメニューバーにあります。全画面表示だと隠れるので、マウスを画面の上端に動かす）
4. 終わると Organizer が開くので、「**Distribute App**」→「**App Store Connect**」→「Upload」で進める（途中の確認は既定のまま「Next」でよい。「Xcode Cloud can automate…」は「Remind Me Later」で閉じてよい）
5. 10〜30 分ほどで、App Store Connect の「TestFlight」タブにビルドが表示される

輸出コンプライアンス（暗号化）の質問は、Info.plist で「独自の暗号化は使っていない」と設定済みなので、聞かれません。

**注意**：`ios:release` でビルドしたアプリは本番の広告が出ます。TestFlight で確認するときも、**本番の広告はタップしない**でください（AdMob のアカウント停止の対象）。Xcode から iPhone に直接入れて試すときは、`npm run ios:sync` でテスト広告に戻してから実行します。

---

## 4. TestFlight で確認する

1. App Store Connect の「TestFlight」→「内部テスト」でグループを作り、自分を追加する
2. iPhone に「TestFlight」アプリを App Store から入れ、届いた招待から 県知事になろう をインストールする

---

## 5. 審査用の操作の録画を用意する（提出前に）

新しいアカウントの初回の審査では、「Guideline 2.1 - Information Needed」として**実機（最新の iOS）での操作の画面録画**を求められます。提出前に用意しておくと早く進みます。

1. iPhone の「設定」→「コントロールセンター」に「画面収録」を追加する
2. TestFlight で入れたアプリを**完全に終了した状態**から、コントロールセンターの「画面収録」を始める
3. 録画する内容（2〜3 分が目安）
   - ホーム画面からアプリを起動する（起動から映す）
   - トラッキングの確認画面（許可・不許可どちらでもよい）
   - タイトル画面 →「はじめから」→ 名前の入力 → プロローグ
   - 街を歩き、人に話しかける・演説台で演説する・建物に入る・偶然の出来事に答える
   - B ボタンのメニュー（いどう・つよさ・じょうせい など）
   - 広告（バナー・全画面）が表示されるところ。**本番の広告はタップしない**
4. 録画は「写真」アプリに保存される。大きすぎると返信に添付できない（400MB でも失敗した例がある）ので、Mac の Finder で右クリック →「選択したビデオファイルをエンコード」→ 720p にするか、Google ドライブの共有リンクを返信文に貼る

### App Review への返信文（下書き）

同じ文を、バージョンのページの「App Review に関する情報」→「メモ」にも入れておきます。

```
Thank you for reviewing our app. Here is the information you requested.

1. Screen recording: [録画ファイルまたは共有リンク]
   Recorded on a physical iPhone running the latest iOS, starting from app launch.

2. Purpose and audience:
   "Run for Governor!" (県知事になろう) is a single-player, retro pixel-art RPG for ages 13+.
   The player runs a 17-day campaign for governor of a fictional prefecture, meets townspeople,
   gives speeches and wins endorsements, and the game ends with election-night returns.
   All characters, places and organizations are fictional.

3. How to use:
   No account or login is required. Tap "New Game" on the title screen, enter a name and play
   with the on-screen D-pad and A/B buttons. Progress is saved automatically on the device.

4. External services:
   Google AdMob for banner, interstitial and rewarded ads (with Google's consent form where
   required and App Tracking Transparency). No other third-party services, no in-app purchases,
   no user accounts, no user-generated content.

5. Regional differences:
   None, except the language (Japanese or English, following the device language) and the
   ad consent form shown only in regions that require it (e.g. the EU/UK).

6. Regulated industries / third-party content:
   The app does not operate in a regulated industry. All artwork, music and text are original
   and owned by us; no third-party copyrighted content is used. The game is political satire
   about a fictional election and does not reference real politicians or parties.
```

---

## 6. App Store Connect で審査に出す

「配信」タブ（iOS App のバージョン）で入力します。**バージョンは 1.0.0**（アプリの Version と同じにする。「1.0」のままだとアップロードしたビルドが選べない）。

| 項目 | 入力内容 |
| --- | --- |
| スクリーンショット | 「Dynamic Island 搭載 iPhone（中型ディスプレイ）」の欄に、`docs/store/ios/6.3inch/` の 2622 × 1206（横向き）を入れる。日本語版（ja-）と英語版（en-）各 4 枚。6.9 インチ（2868 × 1320）は受け付けられない |
| ヘッダ・検索結果 | 「ヘッダと検索結果」タブに `docs/store/ios/appstore-header-3840x1646.png` と `appstore-search-3840x2560.png`（ヘッダを入れたら検索結果も入れる。片方だけだと赤枠になる） |
| サブタイトル（30 文字） | 日本語：`ドット絵の選挙RPG` ／ 英語：`A retro pixel election RPG` |
| プロモーション用テキスト（170 文字） | 日本語：`17日間の知事選を、ドット絵の県内を歩いて戦い抜こう。人助けか、それともスキャンダルの罠か。開票速報で「当選確実」をつかみ取れ！` ／ 英語：`Walk a pixel-art prefecture for 17 days and win the governor's race. Good deed or scandal trap? Find out on election night!` |
| 概要 | Google Play 用の「詳しい説明」（`docs/store/listing.md`）を流用 |
| キーワード（100 文字） | 日本語：`選挙,知事,政治,選挙戦,投票,演説,RPG,レトロ,ドット絵,シミュレーション,8bit,オフライン` ／ 英語：`election,governor,politics,campaign,RPG,retro,pixel,8-bit,simulation,offline,chiptune,strategy` |
| サポート URL | https://techgym.jp/ |
| プライバシーポリシー URL（App 情報・App のプライバシー） | https://techgym.jp/privacy-policy/ |
| 著作権 | 2026 TECH GYM K.K. |
| ビルド | TestFlight で確認したビルドを選ぶ |
| カテゴリ（App 情報） | ゲーム（サブカテゴリ：シミュレーション、ロールプレイング） |
| コンテンツの配信権（App 情報） | 第三者のコンテンツ：いいえ（絵・音楽・文章はすべて自前） |
| 年齢制限 | 質問に答える（下記） |
| App のプライバシー | AdMob が収集するデータを申告する（下記） |
| App Review に関する情報 | ログイン不要。連絡先を入力。メモに 5 章の文を入れる |

**年齢制限の答え方（目安）**

- アルコール・タバコ・ドラッグの使用または言及：まれ／軽度（居酒屋でお酒を飲める場面がある）
- 成人向け・示唆的なテーマ：まれ／軽度（週刊誌の不倫疑惑・暴力団・買収などの話題。セリフだけで描写はない政治風刺）
- 漫画やファンタジーの暴力：まれ／軽度（ケンカの仲裁で殴られる場面のみ。流血なし）
- それ以外（性的表現・ギャンブル・ホラー・医療情報など）：なし
- ユーザー同士のやり取り・Web の閲覧・アプリ内課金：なし

**App のプライバシー（AdMob を使うアプリの目安）**
Google の「Apple の App Store のデータ開示要件への準備」（AdMob のヘルプ）に、AdMob が収集するデータの一覧があります。必ずそちらを見て最終確認してください。目安は次のとおりです。

- 収集する：ID（デバイス ID）、使用状況データ（広告データ、製品の操作）、診断（クラッシュデータ、パフォーマンスデータ、その他の診断データ）、位置情報（おおよその場所）
- 目的：サードパーティ広告、アナリティクス
- ユーザーに関連付け：しない
- トラッキングに使用：デバイス ID と広告データは「する」

入力が終わったら「審査用に追加」→「審査へ提出」。

---

## 7. 公開後にやること

- AdMob で iOS アプリを App Store のアプリに紐づける（「アプリ」→ iOS の 県知事になろう →「アプリの設定」）
- App Store からインストールして、起動・同意画面・トラッキングの確認・広告を確認する

---

## 8. 自動化の準備（2回目以降を GitHub Actions に任せる場合）

push するだけで GitHub Actions（GitHub の Mac 環境）がビルドし、TestFlight にアップロードできるようにするための準備です。
JET STRIKE で作った API キー（.p8）と配布用の証明書（.p12）は Apple Developer のチーム共通なので、**同じものを使い回せます**（作り方は jet-fighter の `docs/IOS_BUILD.md` の 7 章）。

このリポジトリの Settings → Secrets and variables → Actions（https://github.com/techgymjp/kenchiji/settings/secrets/actions ）に、次の 5 つを登録します。

| 名前 | 内容 |
| --- | --- |
| `IOS_DIST_CERT_P12_BASE64` | 証明書（.p12）を `base64 -i 証明書.p12 \| tr -d '\n' \| pbcopy` で変換した文字列 |
| `IOS_DIST_CERT_PASSWORD` | .p12 を書き出したときのパスワード |
| `ASC_KEY_ID` | API キーのキー ID |
| `ASC_ISSUER_ID` | Issuer ID |
| `ASC_KEY_P8_BASE64` | API キー（.p8）を `base64 -i AuthKey_XXXXXXXXXX.p8 \| tr -d '\n' \| pbcopy` で変換した文字列 |

登録が終わったら、Claude Code に「iOS の自動アップロードのワークフローを作って」と頼みます。審査への提出は、これまでどおり App Store Connect で行います。

**注意**：証明書（.p12）、そのパスワード、API キー（.p8）は、アップロード鍵と同じく、チャット・AI へのアップロード・リポジトリへのコミットで**絶対に共有しない**でください。

---

## つまずきやすいところ

| 症状 | 対処 |
| --- | --- |
| アップロードで「同じビルド番号がすでにある」 | General の Build の番号を上げてから Archive し直す |
| Signing でエラー（チームが選べない、証明書がない） | Xcode の Accounts で Apple ID にサインインし直し、Team に自分のチームを選ぶ。「Automatically manage signing」をオンにする |
| 実行先に iPhone が出ない | ケーブルをつなぎ直し、iPhone で「信頼」を許可。デベロッパモードをオンにする |
| 実行先に「iOS 26.x Not Installed」と出る | 「Get」で iOS のシミュレーターと部品をダウンロードする（8 GB ほど。Archive にも必要） |
| ビルドが古いゲームのまま | `npm run ios:sync`（または `ios:release`）を実行し忘れている。`git pull` してから実行し直す |
| アップロードしたビルドが選べない | App Store Connect のバージョンが「1.0」のまま。バージョンのページで 1.0.0 に直して保存する |
| 「審査用に追加できません」 | 「App 情報」の「コンテンツの配信権」と、「App のプライバシー」のプライバシーポリシー URL を入力する |
| 本番の広告が出ない | 作ったばかりの広告ユニットは、出るまで数時間〜1日かかることがある。広告ユニットを作り直した場合は、新しい ID が入っているか確認する |
| App Store の審査で「Xcode が古い」と言われる | Xcode を最新版に更新してから Archive し直す |
