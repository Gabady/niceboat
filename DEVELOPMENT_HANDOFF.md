# v100 開発引継ぎ

正本はZIPルート。build '100'、save.version80／drive.version2。今回、物理・育成バランスを変更していない。公開／GitHub変更なし。

## v100の接続

- `music.js`：KM_MUSIC.tracks/select/resolve/create。7枠。main/race/final/sgLounge/heroineの5MP3、sgRace/sgFinalはsrc:nullでrace/finalへ代用。曲対応と追加手順はMUSIC.md。元MP3はassets/audio、音質変更なし。
- `script.js` render→syncAudioScene→audioSceneInfo→KM_AUDIO.scene。raceでは現レースgrade/type、その他はcareer.stage、bonds pending／romance outcome／SG恋愛報酬をheroineへ。titleなど育成外はmain。レースの種別championshipだけ決勝曲、consolationは通常曲。おまけレースを育成SGと混同しない。
- `audio.js`：既存km_audio_v92のmute/BGM/SFX/volumeを継承。最初mute。MP3一重再生、同曲更新は位置維持、切替で旧要素解放、0.32秒フェードイン。短い6効果音だけWeb Audio。旧harbor/raceループはmusicモジュール不在時のみ。隠れたら停止し次タップまで再開しない。play Promiseは世代tokenで競合を防ぐ。
- `portraits.js`：KM_PORTRAITS.fixed/definition/render。ヒロイン5＋師匠5＋壁5の専用顔、一般NPCはIDハッシュから輪郭等を独立決定。cast_接頭辞は除去して同一人物へ。Bonds.portraitとCast.portraitがこの共通描画を利用。thoughtful/sad/warm差分。SVGのみ、名前をescape、任意色はhex限定。ゲームの乱数不使用。
- scriptsは19本。portraits.jsをbonds/castより前、music.jsをaudioより前。共通4CSS。iPhoneのみ互換JS1本＋CSS1本追加。
- tools/package.pyは既定music.js内のassets/audio/*.mp3をdata URIへ変換し2つの単体HTMLを出力。ファイル欠落は生成エラー。ZIPはassets以下を再帰収録。HTML約30MB、ZIPは両単体版・原MP3を含むため大きい。
- 保存build99→100は既存進行を保持。音量設定は端末側。顔はIDから作るのでセーブに画像を増やさない。

## 既存ゲームの主要点

- data.jsの図鑑89能力。bonds-data.jsに成人5人×7話＋SG本文。通常物語123イベントはstory.js/story-extra.js。
- bonds.js：ensure/gate/open/scene/choose/depart/final/rivalInfo/train/status/valid。career.bonds version1。2走ごとの交流、1シリーズ1回のライバル特訓、重要章2/4の悪手で交際不可、第6話告白。選択キーは保存し二重処理防止。登録選手へ履歴を残す。
- 恋愛LR：akari→bond_reignite、mio→bond_headline、nagi→bond_breakwater、kanade→bond_clockletter、tsumugi→bond_lastorder。交際中stage8/championship未開始で1回。専用LRは通常抽選とNPCから除外。登録選手由来のSG継承は維持。
- profile.jsは名前・地域・ひと言・色・お気に入り。3保存枠、更新前バックアップ、JSON、Android保存不可時の一時保存を継承。
- race-renderer.jsが水面と艇、driving-ui.jsが左右下半分タッチ。racing.jsは固定刻みの3周物理。優勝戦と準優勝戦は操船必須。予選のみ観戦・結果スキップ、観戦→操船可。

## 検証と次作業

新規 node tests/music-v100-tests.cjs（21）。回帰はrelationships-v99（26）、career-v98（22）、race-v95（22）、android-update（14）、presentation-v94（5）、audio-v92（5）。単体生成後python3 tests/static-checks.py（45）とiphone-static-checks.py（24）。計184。集計tests/release-v100-verification.json。MP3のハッシュ・全区間decodeはaudio-files-v100.json。

NODE_PATHに開発依存を設定して tests/portraits-v100-preview.cjs を実行するとSkia確認画像を再生成。ゲーム本体は外部ライブラリ不要。実ブラウザ／スマホ実機／音出しは未検証。次は端末再生と切替、単体HTMLのメモリ確認、未完成SG2曲の差し替え。古い検証JSONは各版の記録で現在の集計に混ぜない。
