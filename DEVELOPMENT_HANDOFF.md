# v104 開発引継ぎ

正本はZIPルート。build104、save.version80／drive.version2／bonds.version2／campaign.version1。公開・GitHub更新なし。次回はこの文書と変更箇所だけを読む。

## 変更箇所

- `script.js bondSceneView`：選択前の「選ぶとルート終了」、terminal classを削除。一般的な選択説明のみ。選択後のroute-failed・理由は維持。選択順はbonds-dataの既存人物・章別ローテーションで、再読込では変化なし。
- `racing.js`：`postureStep`で目標を−1/0/1へ。身体の現在値は移行中のみ連続。切替rate=6+turn*.012+power*.006、旋回負荷の追加遅延を削除。伏せtopSpeed×1.028、grip×.9等の物理効果はv103のまま。荒天・引き波の直線のAI姿勢は0、晴れ直線−1、ターン1。助走中効果0。
- `driving-ui.js`：24px刻みスワイプ、直接タップ3ボタン、上下キー1押し1段。右下加速・左下操舵の広域判定維持。postureRevisionでタップ後の左指の上下基点を更新。指離しは舵だけ戻し姿勢保持。手動姿勢で補助OFF。ボタンaria-pressed。controls z7、hit-zones z6。姿勢と舵を左半分に収め、ボタンは高さ44px。スタイル末尾を参照。
- `cast.js loadouts`：10人物に固定能力・技能。師匠は主97＋他80〜88、4技能。ボスは主100＋他89〜98、6技能（LR2を含む）。Easyは主以外を師匠−4、ボス−5。機材は元の抽選。一般NPCの難易度定数やスキル効果は不変。lineUpは既存キャストも次の出走表を作る時に再構成し、ポイントと機材を維持。読み込み時の途中レースは改変しない。

## 本編

- 新規 `campaign-data.js` と `campaign.js`。KM_CAMPAIGNをscript.js前にロード。共通JS23本、iPhone24本。CSS4本＋iPhone1本。
- 3ルート：light「灯を継ぐ」、back「置いてきた背中」、shore「遠い岸の約束」。新規作成のui.draft.scenario→player.scenario、再抽選でも維持。未指定／旧育成はlight。
- `campaign.ensure(c)`：{version:1,arc,origin,entries,closed}。opening1章を作り、進行中の旧育成は現在stageから開始。古い全履歴の偽再構成はしない。
- `finishSeries`→`Campaign.capture`：stage1/3/5/7/8で章。champion→win、championshipまたはconsolation3着以内→steady、それ以外setback。真の着順を保存。SG未進出gateと途中登録earlyは別結末。全18本編章＋6結末、節目15章×3の成績本文。G3/G1/SGにstrong(5能力orbalanced)とweakを追加。
- 分岐時点で能力差8未満はbalanced、差15以上なら最下位能力をweak。現在の能力で過去章を再判定しない。readフラグのみ読書で変化。報酬・レース乱数は消費しない。
- `Campaign.valid`で章ID、順序、成績分岐、能力キー、既読型などを検証。旧保存は省略可、decode検証後に追加。現在シリーズの確定結果があればその章のみ追加。
- 登録時 `campaignJournal`をclone。profileから再読可。途中登録ではearlyを追加しclosed。既読／未読の章一覧、ホームとシリーズ結果の小型入口。自動モーダルなし。専用page=campaign、出走中に開く導線なし。
- `MAIN_SCENARIOS.md`に全文。ストーリー追加時はB.stagesとentries最大7、保存検証、UI・packagerの依存順を合わせる。

## 継承

3周600m、F.09s、L1.5s、12秒針、決勝は手動。3保存枠・バックアップ・JSON・safeStorage。Easy新規UR上限、NormalLR。27人物WebP＋PNG、MP3 5曲。スキル94種の名称変更とID維持。恋愛ランダム出会い・1人完走・終盤3走待ち・1回短縮、師匠25話を維持。素材再生成不要。

## 検証・次回

現行集計 `tests/release-v104-verification.json`。update-v104、posture-v104、encounters-v104、mentor-v104、relationships-v104、music-v104、既存career/race/android/audio/presentation、Android/iPhone静的埋込一致を実行。固定旧保存 `v103-migration.json`、旧60レース `cast-v103-baseline.json`、新比較 `cast-v104-benchmark.json`。Normalの未調整固定選手は旧新とも勝利0/30、実プレイヤー勝率に換算しない。調整済み上限寄りの10例は全ボスに勝利可能だが通常育成の到達率ではない。

DOM/API代替の本番JSテスト、SkiaによるCanvas描画。実ブラウザ／実Android／実iPhoneのUI・タッチ・音・FPSは未検証。previews/v104-posture-*.pngは水面描画のみでGUIスクショではない。

次に調べるのは親指の届き方、3段階の誤入力、実操船での人物別勝率、本編の未読滞留。不要な全ファイル再読は避ける。`python tools/package.py`→静的2試験→集計更新→もう一度package→ZIP整合。新しい変更理由は@264から。
