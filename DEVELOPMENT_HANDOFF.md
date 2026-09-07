# 競艇物語 v88 開発引継ぎ

## 再開の最短手順
- このメモ→git status/diff→対象関数だけ読む。全コード・旧ログの再読込を避ける。
- 正本 `/workspace/sites/kyotei-monogatari-v70/dist`。今回の依頼はファイル出力。公開・GitHub操作はしていない。
- 配布 `/workspace/scratch/c938c42c53df/release_v88`。保存IDと最新具体版は `/workspace/scratch/c938c42c53df/upload-v88-results.json`。
- 分割ソースを変更し、`python3 tools/package.py` でAndroid/iPhone単体とZIP。生成HTMLを直接編集しない。
- 説明・@変更理由・検証・この引継ぎを更新。実機やブラウザ操作は未検証。検証済と混同しない。

## v88の変更点
- 右下50%×50%にthrottle-hit-zone。左側とともにz-index6でcontrols5より前。steer-padの見た目62%が中央を越えるため判定面を上へ出した。overlay9でメニューを優先。
- bindPointerは始点のkindとpointerIdを固定。同じ指を両担当にしない。capture失敗はrootのreleaseで解除。アクセル判定外でもthrottle-pedalをheldにする。
- 時計は右上、助走中のdrive-mapはvisibility hidden。start-map内cutinはvisibility visibleと下方向transformで時計を避けて維持。
- 時計の色帯: U.clockGuide。中心=(raceTime+launchIn+.20)*30度、幅max(5,uncertainty*100)。発進目安の文は廃止。高スタートほど狭く、位置の誤差も小さい。
- C.flyingGrace=.09（F<−.09）、lateLimit1.5維持。比較には微小丸め許容。旧時刻のstartAt未設定は10、新規12。

## 育成
- statGrowthRate: E1 / D.9 / C.8 / B.7 / A.5 / S.2。lateGrowthFactorは互換名のまま、シーズンを参照しない。
- 練習とレース後の基礎成長を1.5倍にし、処理前ランク率を乗算。難易度E.75/N1、非SG等は従来どおり別乗算。
- trainingMode focus/foundation。focusはgrowthOf.values[key]*1.1、foundationはkey<自分の平均なら1.3、他.8で成長型倍率を置換。
- prepareRace action: normal0/training1/tune1、baseActions各1、halfActions各0、actionVersion88。
- consumeAction: 旧normalがあれば先に消費。専用枠はbaseActions→能力追加half→券。能力追加効果.5、通常と券1。validatorでbase/halfが残数以下を確認。
- 次走専用prep_n〜lrはv87のまま。最初の練習1回抽選、同系統最上位だけ。通常練習の固定buffなし。prepVersion87はこの方式を表すのでbuildとは別。

## 機材と整備
- 新規characterのmotorSuccess/propSuccessは18〜22（基礎確率%）。
- tuningChance=min(70,param)/100 + tuningスキルのsuccess/100、上限.92。
- tuningLearning: param<50→1、<60→.45、<70→.18、70以上0。
- 毎回success paramへ4*learning*difficulty.growth*effectScale、上限70。成功失敗不問。連続調整減衰はVarの成長.8*diminish*difficulty*scaleだけ。
- 成功幅=(1+success*3)*quality、失敗幅=−(.15+(1−success)*.25)*severity。Var/.effectScaleを重ねる。
- direction balanced / primary / accel / stability。成功時primaryとaccelは他方を35%犠牲、stabilityはconditionを3倍・primary20%/accel15%犠牲。失敗時は交換先の無料強化をしない。
- equipment.motor/prop.trait=0〜3の数値。0均衡、1主能力、2加速、3状態。生成時に性能を偏らせ、物理への隠し二重加算はしない。
- validEquipmentでtrait enum。古い機材traitなしは均衡として表示、性能は維持。equipmentPanel/debugはtraitを数値パラメータ一覧から除外。

## 能力・レース
- data.js計66能力。追加N feather、R straighten、SR wake_escape、type operation。
- operationSkills(d,b,input,dt): start後、各周各能力1回。b.operationにused/timers/wakeAt/wakeHeadingを保存・検証。
- feather: ターン・throttle<.2・実舵abs>.2を.4秒→確定、2秒damping+.65/turn+2。
- straighten: ターン出口4秒内・throttle>.98・実舵abs<.15を.4秒→確定、3秒response+.9/accel+3。
- wake_escape: wakeLoad>.15を記録、2秒内にwake<.04＆向き差>.06rad→65%、4秒accel/power/wake耐性。抽選失敗でもその周を消費。
- operationはenterZoneの抽選から除外し、integrate内で実入力を見て発動。通常の能力IDイベント・cutinを共用。
- acquire: 新規かつ非弱点ならrandom keyへN.3/R.5/SR.8/SSR1.2/UR1.8/LR2.5 * statGrowthRate。元成長1.5倍は掛けない。重複はmasteryのみ。ショップもこの経路。
- contactType: headings対向cos<−.55→head、平行cos>.55かつ接触法線の前後成分>.65→rear、他side。CONTACTにrestitution/yaw/stress/retainを分ける。イベントにcontactType。
- spectatorPace: スタート/近接ターン/直近イベント/ゴール付近なら30tick、平常180tick。重要時500ms、平常500/settings.speed(ms下限170)。stepAutoRace(adaptive=true)は高速区間から重要へ入った瞬間にbreak。
- 自艇ゴール済みなら未完走艇を観戦速度判定に使う。全物理は60Hz・3周で共通。

## 予選・経歴
- qualificationTarget: 他19人の6番目/12番目のpointsに対する単独超え必要点、残り走数×10も表示。将来の境界予測や確定条件ではない。残り0で結果を表示。
- recordRaceをsettleRaceの二重精算ガード内で実行。careerLogにraces/wins/firstWin/bestST/venues/highlights(最大12)。validCareerLogを検証。
- 保存/登録へplayer丸ごとコピー。旧版の未記録履歴は創作せずv88以降だけ。詳細UIは記録内の初勝利と明記。

## 複数保存・移行
- newStateはversion80/build'88'。旧saveもversion80を維持。
- createSaveSlots(safeStorage): kyotei_slots_v1_1〜3に独立の全stateJSON。
- _archivesは通常上書き/読込/復元前の直近4件。_updateは専用の更新前1件。protectはdecode検証後に元rawを変更せず保護。_protected_<旧build>で重複保護を防ぐ。
- 起動時decode前のrawをprotectへ渡し、saveでも旧rawを検知。データ管理に保存/読込/復元。上書きや切替に確認、現在のデータも退避。
- 現在のJSON exportは選択中の全stateのみで、3枠一括ではない。枠を読み込んで個別export。localStorage容量不足はメモリへ。注意表示と個別JSON退避が必要。
- 更新前専用は通常の上書き7回でも消えない検証。復元は古いバイナリ復帰ではなく現行decodeで読み込み。
- decode旧build時: 全player系adjustSuccess>70だけ70へ。旧行動残数・機材・走行位置は維持。新規raceから通常2枠。build88化。
- リセットは現在stateだけを初期化し、保存枠・退避は残すと確認文に明記。

## 維持
- 600m×3周CCW、全開旋回速度維持、低旋回/低体幹の負荷、ティルト5段階、ブイ.7秒スタックから自動方向復帰。
- Eは低成長/低レア、Nは高成長/高レア。NPC pace/grade/観戦補助はv87のまま。
- 9シリーズ、20人、予選5、SG1800万円、登録/ライバルはSG優勝戦特別参戦のみ。
- 単体Android/iPhone、WebGL→Canvas代替、全速度km/h、能力整数ランク、億万円、fraction保持。

## 検証・次回注意
- tests/race-v88-tests.cjs: 21項目。新操作/成長/整備/取得/接触/観戦/保存、3条件の3周物理。
- engine-tests.cjs:21。通常枠変更による旧期待値だけ更新。全9期テストはSG門用の賞金設定あり、実戦勝率統計ではない。
- android-update-tests.cjs14、iphone-tests.cjs4、static-checks.py17、iphone-static-checks.py10。合計87。
- 過去版テストは廃止仕様（旧成長・F・1行動・復帰停止）を含むので一括ゲートにしない。
- 新機材の調整方向と初期成功率による難易度の変化、特化/基礎が一択にならないかを次回実機フィードバックで判断。
