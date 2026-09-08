# 競艇物語 v91 開発引継ぎ

## v91差分（最初に読む）

- R.recordReplay：create時、30tickごと、ゴール時に記録。d.replay.version1/from/frames/events。最大600フレーム、400イベント。艇配列はd.boats順。7値の意味はBALANCE_REPORT。乱数は使わない。
- R.validReplayをR.validに追加。保存形式version80/drive.version2は維持。旧版はreplayなしでも可。
- R.dramaticRace(d)：有効自艇1着で最終100m逆転／最終周3位以下から逆転／着差0.25秒以下を判定。文字列かnull。結果画面と操船終了UIに表示。
- script.jsのreplayResultPanel/openReplay/paintReplay/scheduleReplay/stopReplayが表示専用。モーダルで俯瞰位置・順位・ログを再生。currentRace参照のみ、物理やsettleRaceを呼ばない。
- UI速度は1/2/4倍、±5秒、rangeシーク。closeModal/navigate/visibilitychangeで停止。次走のr差し替えで前走記録を破棄。保存スロットやJSONは現在レースの記録も含む。
- v91新規9＋既存108＝117項目。tests/race-v91-tests.cjs。実ブラウザ・実機未検証。録画ファイル出力はなし。
- 出力release_v91、保存IDと具体版はupload-v91-results.json。パッケージkyotei_monogatari_v91.zip。旧段落のv90の説明は履歴として読む。

## v90差分（最初に読む）

- tuningOutlookは純粋関数、現在値・上下限を使い成功時の増減方向だけ返す。tuningPanelで現在3項目の整数＋ランクと方向ボタンを表示。乱数や行動残数は消費しない。
- tuneのログは変更後値・次回成功率を撤去。実際の整数表示差だけ。debugにはbefore/afterが残る。
- 通常練習はfocus固定。UIの2タブとtrainingModeハンドラを撤去。矢印・能力値・ランクを残す。
- R.tiltInstabilityをsteeringLimitsとintegrate、HUD警告で共用。閾値と係数はBALANCE_REPORT。NPCのティルトは従来どおり0、プレイヤーは観戦でも選択角度を適用。
- constrainのブイ速度保持を.90→.55。canQuickRecoverは.65秒・内外両方・助走中も対象。quickRecoverは速度の方向も安全側へ。位置・進捗・速さを増やさない。
- build90、保存version80/drive.version2は維持。v88/v89/v90には整備上限の旧移行を再適用しない。

## 再開の最短手順
- このメモ→git status/diff→対象関数だけ読む。全コード・旧ログの再読込を避ける。
- 正本 `/workspace/sites/kyotei-monogatari-v70/dist`。今回の依頼はファイル出力。公開・GitHub操作はしていない。
- 配布 `/workspace/scratch/c938c42c53df/release_v91`。保存IDと最新具体版は `/workspace/scratch/c938c42c53df/upload-v91-results.json`。
- 分割ソースを変更し、`python3 tools/package.py` でAndroid/iPhone単体とZIP。生成HTMLを直接編集しない。
- 説明・@変更理由・検証・この引継ぎを更新。実機やブラウザ操作は未検証。検証済と混同しない。

## v89から維持した差分（v90との差分は先頭を参照）

- 分割ソースが正本。Android/iPhone単体版はtools/package.pyで生成、ZIPはkyotei_monogatari_v91.zip。
- spectatorPaceは常に180tick、important:false。doAdvanceも180固定、stepAutoRaceのadaptive引数は互換のため残すが区切りなし。自動は500/settings.speed ms（下限170）。手動は押すまで停止。
- R.finishCrossing(d,b,previousBowX,DT)：最終周・checkpoints>=23・progress>=1725・順方向・コース内で船首が描画と同じC.startラインを越えた瞬間に完走。tick内でstartCrossingと同じ座標を使用。integrateの中心累積距離による完走処理は撤去。
- performanceで同じid+kindの有効効果は最後のみ。能力正補正36超を25%換算、上限48。D.driveEffectCapsは追加mechanicsの合計上限。基礎能力や機材は上限対象外。
- comet/legend_speed/wave/legend_turnのmechanicsとSSR以上monkey.pivotを縮小。数値はBALANCE_REPORT。
- v90では練習タブとtrainingModeハンドラを削除。trainのデフォルトはfocus固定、旧セーブのtrainingModeを参照しない。foundationの純粋関数は旧検証互換用のみ。
- decodeはv88の能力/所持金/残行動/走行状態を維持しbuild89へ。v87以前だけ既存v88移行処理を通す。保存version80とdrive.version2は維持。
- 現行ゲート：race-v90 9、race-v89 12、race-v88回帰21、engine21、Android14、iPhone4、static17、iPhone静的10＝108。実ブラウザ・実機未検証。
- tests/race-v88-tests.cjsの旧観戦速度の期待値とbuild固定値だけ現行へ更新。新規検証はtests/race-v89-tests.cjs。

## v88から維持した仕様
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
- 観戦の重要場面減速はv89で撤去。現行仕様は先頭のv89差分を参照。
- 自艇ゴール済みなら未完走艇を観戦速度判定に使う。全物理は60Hz・3周で共通。

## 予選・経歴
- qualificationTarget: 他19人の6番目/12番目のpointsに対する単独超え必要点、残り走数×10も表示。将来の境界予測や確定条件ではない。残り0で結果を表示。
- recordRaceをsettleRaceの二重精算ガード内で実行。careerLogにraces/wins/firstWin/bestST/venues/highlights(最大12)。validCareerLogを検証。
- 保存/登録へplayer丸ごとコピー。旧版の未記録履歴は創作せずv88以降だけ。詳細UIは記録内の初勝利と明記。

## 複数保存・移行
- newStateはversion80/build'91'。旧saveもversion80を維持。
- createSaveSlots(safeStorage): kyotei_slots_v1_1〜3に独立の全stateJSON。
- _archivesは通常上書き/読込/復元前の直近4件。_updateは専用の更新前1件。protectはdecode検証後に元rawを変更せず保護。_protected_<旧build>で重複保護を防ぐ。
- 起動時decode前のrawをprotectへ渡し、saveでも旧rawを検知。データ管理に保存/読込/復元。上書きや切替に確認、現在のデータも退避。
- 現在のJSON exportは選択中の全stateのみで、3枠一括ではない。枠を読み込んで個別export。localStorage容量不足はメモリへ。注意表示と個別JSON退避が必要。
- 更新前専用は通常の上書き7回でも消えない検証。復元は古いバイナリ復帰ではなく現行decodeで読み込み。
- decodeのv88未満移行時: 全player系adjustSuccess>70だけ70へ。旧行動残数・機材・走行位置は維持。新規raceから通常2枠。最終build90化。
- リセットは現在stateだけを初期化し、保存枠・退避は残すと確認文に明記。

## 維持
- 600m×3周CCW、全開旋回速度維持、低旋回/低体幹の負荷、ティルト5段階、ブイ.65秒スタックから自動方向復帰。
- Eは低成長/低レア、Nは高成長/高レア。NPC pace/grade/観戦補助はv87のまま。
- 9シリーズ、20人、予選5、SG1800万円、登録/ライバルはSG優勝戦特別参戦のみ。
- 単体Android/iPhone、WebGL→Canvas代替、全速度km/h、能力整数ランク、億万円、fraction保持。

## 検証・次回注意
- tests/race-v88-tests.cjs: 21項目。新操作/成長/整備/取得/接触/観戦/保存、3条件の3周物理。
- engine-tests.cjs:21。通常枠変更による旧期待値だけ更新。全9期テストはSG門用の賞金設定あり、実戦勝率統計ではない。
- android-update-tests.cjs14、iphone-tests.cjs4、static-checks.py17、iphone-static-checks.py10。合計87。
- 過去版テストは廃止仕様（旧成長・F・1行動・復帰停止）を含むので一括ゲートにしない。
- 新機材の調整方向と初期成功率による難易度の変化、成長型による練習対象の偏りを次回実機フィードバックで判断。
