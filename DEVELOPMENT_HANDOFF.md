# v97 開発引継ぎ — 現行接続点

- 正本：ZIPルート、作業 `/workspace/scratch/c938c42c53df/kyotei-v97`。build97、save.version80／drive.version2。公開・GitHub変更なし。
- 今回：`race-renderer.js` のboatScene/racerPoseと材質7〜11、`presentation.js`のmedalSVG/rewardMarkup、`story.css`の報酬とカットイン。計算・入力・報酬のバランスはv96と同一。
- Gにshell/deck/deckTrim/wing/torso/helmet/visor/helmetSeal/wheel/thin/数字1〜6を追加。生成メッシュの法線とGLの逆転置相当計算で非等方拡大に対応。5/6だけ半透明。7塗装、8布、9金属、10バイザー、11木材。
- boatSceneは頭・肩・腕・脚と装備を別部品で配置。自艇の頭／胴を非表示。姿勢はsteer/yawRate/speed/heelから表示専用計算。motion=falseなら揺れ・呼吸なし。競技状態を書き換えない。
- LOD：通常32/70m、Canvas18/46mで小物省略。CanvasはsoftTinyとhelmetLowで頂点削減。Canvasの重なりは艇単位＋部品順で近似し、GLESの深度と完全一致ではない。
- 数字はDejaVu Sans由来の静的三角形。THIRD_PARTY_NOTICES.txtとソースコメントにライセンス、単体HTMLにも埋込。tools/generate-deck-digits.pyは開発時Matplotlibで再生成、ゲーム実行・package.pyには不要。
- presentationはmedalSVG/rewardMarkupを純関数で公開。箔8/12/16、短縮・不運0。role/status・ESC・クリック・既存タイマー・レース暗転禁止を維持。決定済み報酬にだけ演出する既存契約を変えない。
- 新ゲート：node tests/visual-v97-tests.cjs（15項目）、接近モデルはmodel-v97-preview.cjs。既存water-v96-testsは現在build名でPNGを出し、21項目を継続。演出の実機手動確認はtests/presentation-preview.html。
- 全検証集約：tests/release-v97-verification.json。実際に動かしたのはMesa GLES2、Skia Canvas、DOM/API代替環境。実ブラウザCSS・Android/iPhone実機は未検証。実機FPSを断言しない。
- 共通13JS＋2CSS。package.pyでAndroid13JS、iPhone互換込み14JSを内蔵。static-checksとiphone-static-checksでソース一致。97を既知版に追加し、旧整備補正を再適用しない。
- v96水面：6波長法線・背景反射・Fresnel・天候・泡。canvas縮小バッファ最大216×144、空192×96、泡96×96。画像未読込で色の反射へ代替。詳細は必要時にBALANCE_REPORT.mdのv96節を参照。
- 既存キャリア：予選3モード／決勝操船必須、師匠5＋壁5、物語51。racing.js/cast.js/story.js/thrill.jsは今回変更なし。保存済み精算ID、SG招待枠、runInstant分割処理を維持。

変更理由@195〜202はCHANGES_AT.md。新規依頼に関係するコードと試験だけを読み、全履歴の再読を避ける。
