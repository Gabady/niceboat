# v95 開発引継ぎ — 現行を先に読む

- 正本：ZIPルート、作業 `/workspace/scratch/c938c42c53df/kyotei-v95`。build95、save.version80／drive.version2。公開・GitHub変更なし。
- 追加 `cast.js`：師匠5＋壁5、SVG顔、`c.cast` 保存、G3選択→prepareで固定、得意練習×1.25、G1対決予約、SG壁予選＋優勝戦、先着報酬。登録に `p.castJournal` 保持。既存 `story.rivals`、記憶ライバル `state.rivals` と別。
- 人物は20名のNPC枠1つを置換し、従前の得点を引き継ぐ。SG優勝戦の登録・記憶招待枠は保護。既存の人物IDが出場済みなら再生成しない。顔は全てコード内SVG。
- `story.js`：9章／51イベント／3結末。強6、不運4。抽選枠3%＋8%、直近3記録の不運を回避。bad未選択時はstartDriveで選択0を適用してsnapshot同期。支援金は累計賞金に含めない。師匠／壁の対決金は累計にも加算。
- `thrill.js`：表示用の状態をmount内だけに保持。速度・能力に応じた線、追い抜き・出口・最終周・UR/LR、接触と高速振動。競技状態や乱数を変更しない。
- `presentation.js`：振動は種類別クールダウン＋優先度。performance.nowの単一時間軸。暗転はrace/replay＋body.in-raceで二重禁止。強イベントと対戦紹介も表示済みIDを保存してから演出。
- `racing.js`：requiresManual(final)とskipモード判定、実接触lastContactAtのみ追加。物理係数は前版維持。
- `script.js`：prepareSpectator/prepareAutoRace/prepareSkip/skipToResultを決勝で拒否。takeControlは座標・速度・seed・replayを維持。UI runInstantは360tickずつ分割し、非表示で観戦へ戻す。ui.resolving中は多重操作を防止。decodeは進行中の旧決勝観戦→操船、途中skip→観戦へ。
- newState haptics=true/raceFX=full。明示falseを維持。古いundefinedだけONへ。追加演出はfull/soft/off、OS動き軽減では速度視野・線の増幅なし。
- 共通13JS＋2CSS。tools/package.pyでAndroid単体13JS、iPhoneは互換を加え14JS。元JS/CSS一致をstatic-checksで検証。
- 新規ゲート `node tests/race-v95-tests.cjs`、`node tests/render-v95.cjs`。現行回帰一覧は `tests/v95-regression.json`。古いテストの定義数・版番号・振動間隔は新仕様に合わせ更新。出力集約は `tests/release-v95-verification.json`。
- ブラウザ実行バイナリなし。UIハンドラはDOM/API代替環境、描画はSkia Canvas＋Mesa EGL/GLES。実機QAを実施済みと書かない。
- 次に必要な実機確認：接触振動が疲れないか、後半の速度感、師匠選択画面の320px表示、SG壁の勝率。コードの任意全面改修・新しい公開作業は今回の範囲外。

過去の変更理由はCHANGES_AT.md、詳細な仕様値はBALANCE_REPORT.mdを参照。新しい依頼では必要なモジュールとテストだけを読み、全履歴の再読を避ける。
