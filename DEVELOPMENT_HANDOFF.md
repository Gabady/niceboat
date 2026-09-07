# 開発引継ぎ — 競艇物語 v87

## 次回の最短ルート
- このメモ→git status/diff→対象関数だけ読む。旧ログ・全JSの再読込は避ける。
- 正本 `/workspace/sites/kyotei-monogatari-v70/dist`。依頼はファイル出力で、公開・デプロイは未依頼。
- 配布 `/workspace/scratch/c938c42c53df/release_v87`。保存済ID・版は `/workspace/scratch/c938c42c53df/upload-v87-results.json` を使う。現在の具体的な版をガードに指定。
- 単体HTMLを直接編集しない。分割ソース→`python3 tools/package.py`→静的検査→結果も含め再パッケージ。
- Android／iPhone実機・ブラウザの操作テストは未実施。計算／APIスタンドイン／ソース整合のみ。
- 引継ぎ・@付き変更理由・README・検証報告も同時更新。確認待ちで配布を止めない。

## ファイル
- data.js: 能力63種、グレード、難易度係数、5連携。
- racing.js: 60Hz物理／NPC／接触／3周／能力／復帰。ゲーム計算をUIから分離。
- script.js: 育成・報酬・シリーズ・ショップ・観戦接続・検証／移行・画面。
- driving-ui.js: 入力・HUD・12秒針。race-renderer.js: WebGL1とCanvas2D代替。
- iphone-compat.js / iphone.css: iPhone単体の画面高さ、安全領域、Web Share／コピー保存。

## v87の確定仕様
- 600m×3周、反時計回り。加速を押している間は旋回でも速度維持。ブレーキなし、接触・引き波損失あり。
- C.prestart=12。新規drive.startAt=12。`startAt(d)`は保存値、未設定の旧v86は10。`raceTime`と残り助走・AI予測はこの関数を使う。旧時刻を足し替えない。
- 12秒針 `startClockAngle(t)=t*30`、−12秒→−360°、0→頂点。手動／観戦に同じSVG。F<−.25、L>=1.5（ゲーム独自猶予）。STは「秒早い（許容内）／秒後」。
- start能力: 発進response=.35+start*.055、launch加速係数=.65+start*.0085。予測は物理による全開試走＋保存済startRoll×uncertainty。uncertainty=.03+(1-start/100)^1.35*.46。表示は見込み・精度で、±秒を廃止。
- 旋回: steeringLimitsに低能力の基礎負荷、舵のrate低下。yawMax=(.42+turn*.0081+gearTurn*.02)*clamp(.78+turn*.0022,.78,1)。速度が低くても能力差が出る。
- physical: mass=.65+power*.007（低体幹が押し負ける）、gripのpower係数.036、lateralDampingにpower*.009。全艇共通。
- 速度の表示はkm/h。R.kmhは整数船速、R.speedTextは小数1桁までの時速（風速に使用）。内部はm・秒・m/sのまま。
- tilt選択−.5/0/.5/1.5/3°、無料・次の1走。高角速度+.65×角度、grip−.45×角度、damping−.10×角度。低角はspeed1.6×角度、grip−1.2×角度、damping−.3×角度。r.strategyは旧保存互換として残し、現行物理はr.tiltを使う。
- gear寄与: motor.speed*condition*.14、機材accel合計*.055、prop.turn*condition*.11。基礎speed*.130。ティルトと機材はstats表示値を変えず物理へ加算。
- 内側ブイ: constrainがboundaryInnerを記録。最近.20秒内の接触＋接線方向速度<2.2m/sでboundaryStallを蓄積。それ以外は0。連続.7秒で全艇自動復帰。
- quickRecoverは現在位置の接線+.38radへ船首を向けるだけ。yawRate/steerを0、.9秒は舵の切込を抑えて抜ける猶予。位置・進行・速度・停止ペナルティを変更しない。旧ボタンは廃止。通常rescueの4秒停止は別機能として維持。

## 育成・追加行動
- `lateGrowthFactor(c,key)=1-.8*(stage/8)*clamp((stat-60)/30,0,1)`。最終SGで90以上は20%、75は60%、60以下は100%。「20%まで」は20%残すと明示済。練習とレース後の基礎成長だけに適用。機材・調整能力は対象外。
- 通常の練習＋3次走buffを廃止。`prep_n/r/sr/ssr/ur/lr`追加（育成カテゴリ、type:prep、phases空）。確率.16/.25/.38/.52/.68/.82、補正1/2/3/5/7/9。
- 最初の練習1回だけ最上位所持能力を抽選（action.prepRolled）。対象は練習key、race.buffへ。次走prepareRaceでリセット。追加練習で再抽選しない。発動をログ・toastに表示。
- action.halfActions.training/tuneが能力による残り追加枠。consumeActionはnormalを先に消費し、その後専用枠。能力枠のeffectScale=.5、通常と券は1。
- 追加枠の基礎成長・調整能力成長・機材成功／失敗のdelta・prep発動量へ半分を適用。成長の端数は保持。追加通知と調整ログに50%表記。
- 連続調整の調整能力成長は1/.55/.22。練習でリセット。これはhalfActionや非SGと乗算。
- `prepVersion:87`。旧未開始レースの固定練習buffを消す。既にdriveがあれば保持。旧action.halfActionsは残数−使用済み券1枠から補完（旧形式は取得元の厳密復元不可）。

## 難易度
- E: growth.75、報酬レア−1、ショップSSR上限、SG優勝UR。N: growth1、高レア報酬、SG優勝LR。後半減衰は両方へ乗算。
- npcTimeScale=.945。基礎pace E speed/accel1.16/1.16維持、N1.265/1.28。
- gradePace 新人/G3/G2/G1/SG: E1/1.008/1.015/1.021/1.026維持、N1/1.018/1.032/1.045/1.058。
- NPC最高速・ターン目標にgrade、加速にgrade²。手動自艇はpace等倍、観戦自艇にgrade追加はなし。
- 観戦自艇は各modeのNPC基礎paceにassist E.995/1.005/1、N.968/.985/.99（speed/accel/turn）。
- spectatorAdjustment: 基礎を6艇平均へ18%近づけ各±4.5以内、保存値は不変。保存aiBias/frame/progressの連続sinで速度±1.2%、加速±2%。順位ゴムバンドなし、再読込再抽選なし。
- NPC基礎値・レア抽選はv86を維持。SGは一部NPCにLR。次シリーズの生成時に更新。

## 維持する機能
- 9シリーズ、20選手、予選5走＋優勝／準優勝最終戦、SG累計1800万円。
- 金額は万円未満切捨て、10000万以上に億。能力は端数保持、整数＋ランク表示。
- 登録選手／記憶ライバルの特別参戦はSG優勝戦のみ。名前はそのまま。
- 5連携、洞口SR–LR、モンキーSR–LR（モンキーターン/Vモンキー/超絶Vモンキー/究極Vモンキー）。同系統最上位のみ。
- WebGL1失敗時Canvas2D、Pointer/Touchの2本指、ステア見た目維持で左下50%×50%の判定。
- save version80/build87。localStorage+backup+memory+JSON。SafariのローカルプレビューJS制限はHTMLで解除できない。

## 最小検証
- `node tests/race-v87-tests.cjs`: 新機能15項目。6条件×6艇の3周完走。片方の能力だけ変えるテスト、F/L境界、方向復帰、成長、移行を含む。
- `node tests/engine-tests.cjs`: 育成21項目。通常練習buff期待値のみ今回0へ更新。
- `node tests/race-v86-tests.cjs`: グレード・観戦・報酬差8項目。
- `node tests/android-update-tests.cjs` 14項目、`node tests/iphone-tests.cjs` 4項目。描画・入力・保存APIスタンドイン。
- package→`python3 tests/static-checks.py` 17項目／`python3 tests/iphone-static-checks.py` 10項目→結果込みpackage。
- 旧v84テストの0.7秒停止などは廃止仕様なので現行ゲートとして一括実行しない。
- v87の全9期・SG到達率の統計は未実施。今回試走は合成同能力・無スキルで勝率保証に使わない。実機操作感を次回フィードバックで調整。
