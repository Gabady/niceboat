# v103 開発引継ぎ

正本はZIPルート。build '103'、save.version80／drive.version2、bonds.version2。公開／GitHubの更新なし。前回v102の交際・所持報酬・途中レースを維持。

## 今回の実装

- data.jsのskillNamesで57IDの表示名を更新。全94名に句読点・区切り記号なし、名前重複なし。効果・条件・確率・IDは不変。SKILL_NAMES.mdに旧→新と全94種。モンキー4段階は既存名を維持。bonds-dataのfinalTitleと関係／師匠資料も更新。過去の保存済み実況文字列はそのまま。
- racing.jsの姿勢はcontrols.posture／boat.posture／boat.postureTarget、範囲[-1,1]。-1伏せ＋1起こす。新規は0、古い保存ではフィールド省略可。validは存在時に範囲を検証。tickで入力欠落なら現在目標を保持。
- postureEffects：伏せtopSpeed×1.028、grip×.90、yaw×.92、damping×.86。起こすtopSpeed×.978、grip×1.10、yaw×1.08、damping×1.14。中間は線形。助走中補正0、ライン通過後1.2秒で立ち上げ。steeringLimitsの水圧loadも姿勢で±10%。自動ターン減速なし。
- movePosture：rate=(.75+turn*.0075+power*.0035)/(1+min(.8,abs(yawRate)*speed*.06))。固定DT、同じ制約を全艇へ。能力の元値と接触質量は変更しない。
- postureTarget：助走0、曲率を先読みしてターン手前＋.84、通常直線−.86、雨／強風／引き波直線−.48。pilot・観戦・スキップと手動の姿勢補助が共用。姿勢で新しい乱数を消費しない。
- driving-ui.js：左下全体のXに既存steerDrag、YにpostureDrag（8pxデッドゾーン、片道50〜78px）。pointer/touch/mouseへclientYを伝搬。指離しで舵だけ0、姿勢保持。pause/blur/visibility/pagehideでスロットルと舵解除、姿勢目標維持。上下手動入力でpostureAssist=falseへ即切替。
- PCは←→/ADが舵、↑↓が姿勢、W/Spaceが加速。settings.postureAssistのbooleanを保存検証。一時停止画面に設定。報酬ペナルティなし。
- 左スライダー上に小型姿勢パネル。現在点と目標印を分離。左右下半分の判定と横スライダーは継承。競合した旧min-heightを82pxに整理し画面外はみ出しを抑制。実況・予兆・警告を上へずらす。
- race-renderer.jsのracerPoseに頭・肩・腰の上下と前後。camera高さ±.12m、motion=falseでは固定。Canvas/WebGL共用。race-feedback.jsにlowTurnSeconds/highStraightSecondsを使う短い改善ヒント。新metricsは省略可で旧保存互換。

## 継承する重要仕様

3周、予選のみ観戦／即結果、優勝戦・準優勝戦は操船。F許容0.09秒、L1.5秒。3保存枠・バックアップ・JSON・safeStorage。27人物WebPとPNG、5MP3、SGレースの2曲枠は未設定で代用。共通JS21本・CSS4本、iPhoneのみ互換1JS＋1CSS。素材は再生成しない。

v102の出会い抽選[.002,.004,.009,.013,.019,.023,.028,.035,.045]はstage:roundで一度だけ、専用LCGを保存。met人物だけ一覧へ。新規は第7話で交際／完走1人、ほかは第6話まで。第5〜7話に即終了選択、第4話後から3走待ち。90万円bond_shortcutは1育成1回2走短縮。旧交際維持。師匠5人×5話は別枠、EasyはUR上限。RELATIONSHIPS.md／MENTOR_ROUTES.md参照。

## 検証と次の作業

集計 tests/release-v103-verification.json：262項目。posture-v103 27、posture-v103-render 3、relationships-v103 26、mentor-v103 20（320選択組合せ）、music-v103 21、encounters-v103 22、career-v98 22、race-v95 22、android-update 14、presentation-v94 5、audio-v92 5、static 49、iphone-static 26。

posture-v103-benchmark：60組の同一条件比較（2難易度×5グレード×2天候×3シード）。旧／新とも360艇完走。NPC平均タイム条件別−2.0〜−4.4%。プレイヤーAI勝利Easy13→12/30、Normal6→7/30。実際の人間の勝率ではない。旧基準はtests/posture-v102-baseline.json、旧セーブ固定はv102-posture-migration.json。旧catalogは名前と効果の不変確認用。

UI試験は本番JS＋DOM/API代替環境。水面はSkiaで実描画し2画像を目視確認。ブラウザ実体がないため実ブラウザ・実スマホのタッチ/レイアウト/音/FPSは未確認。画像は水面描画の出力でGUIスクリーンショットではない。

再生成はpython tools/package.py → python tests/static-checks.pyとiphone-static-checks.py。集計更新後にもう一度packageしZIPを検証。過去版testsとJSONは履歴、現行集計へ混ぜない。次は実機の上下左右誤入力、姿勢補助、短い縦画面と横画面のHUD重なりを確認。新しい変更理由は@255から追記。
