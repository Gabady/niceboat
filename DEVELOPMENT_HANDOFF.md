# V112 開発引継ぎ

## 現在地

D.version=80、D.build='112'、保存キーkyotei_monogatari_v80。変更履歴@316〜319。V111から会話UIと描画を更新。育成・好感度・報酬条件・物理・AI・音源・画像は変更なし。公開作業なし。

## 会話の不具合

script.js の openNovel は、返答画面を開くたびに戻り先をnovelへ上書きしていた。今は会話外から入る時だけ戻り先を記録する。novelExit は現在の会話と結果表示の一時状態を消し、元の画面か各話のexitへ進む。outcomeNovel は元会話のexitを継承し、本編はcampaignExitで章一覧へ戻す。師匠はmentor、ヒロインはbondsへ明示移動する。

返答keyは元会話のkeyから生成。選択処理はnovelCurrentの末頁と選択肢のaction/value一致を要求する。render冒頭でnovelCurrentをクリアするため、画面外に古い選択肢を残さない。強制おねだりは返答必須のまま。読書位置・選択・成長は既存の保存方式を使う。

## 描画

race-renderer.js: hull/foredeckをloftRowsで補間。roundedBoxMeshで船外機を再構成、金具と冷却口を追加。木目はBM.woodのみへ適用。latheProfileでbuoy1/2/3とcollar/band、buoySceneで配置。BM.buoyは表面の細かな凹凸と水際の湿りを表現。

deckOneで数字1を専用生成、G.digit1を置換。他の数字は既存のライセンス付きアウトライン。BM.decalでプレートと数字を安定表示。プレートはboxではなくflat一枚、Canvasは同じデカールの三角形を一つのパスへまとめる。裏面重なりと継ぎ目対策を戻さない。近景81 draw calls、遠景は細部省略。racing.jsとコライダーは変更なし。

## 検証と配布

- tests/dialogue-v112-tests.cjs: 閉じる、再開、選択連打、強制依頼、保存復元。
- tests/dialogue-v111-reproduction.json: 修正前の失敗記録。現行合計に加えない。
- tests/browser-v112.cjs: Chromiumのスマホタッチ操作、単体HTML、WebGL/Canvas起動。
- tests/render-v112.cjs: 有限な形状、連続した数字1、LOD、GLESとSkiaで固定場面描画、描画副作用なし。
- tests/music-v112-tests.cjs: 会話のBGM遷移と旧セーブ互換など。音楽7曲の設定はV111を維持。
- android-update-tests.cjs、static-checks.py、iphone-static-checks.pyでフォールバックと単体版を確認。
- 現行集計は tests/release-v112-verification.json。過去の結果は履歴として保持。

実機Android/iPhone、Safari、実機FPS、スピーカーの音、複数タッチは未検証。新たな勝率推定はしていない。

python tools/package.py でAndroid/iPhone単体版とZIPを生成。埋込HTMLは直接編集しない。全音源と肖像を内蔵、ゲームに外部依存や追加通信なし。assets/はV111からバイト単位で維持。

PlaywrightとCanvasはCODEX_PRIMARY_RUNTIME_NODE_MODULES。Chromium既定は/tmp/v105-browser/chrome-headless-shell-linux64/chrome-headless-shell、フォントは/tmp/v105-fonts.conf。タップ後は対象actionのclick受信を待つ。KM_APP.getState()はclone。Android/iPhone単体HTMLはfile URLからChromiumで検証し、Safari実機として扱わない。

## 次回の編集

バランス変更時はdata.js、racing.js、script.jsの計算APIを確認。物語原稿はtools/dialogue-v110.txt、本文方針はSCENARIO_STYLE_V110.md。今回の描画・会話バグ修正に過去の全キャリア試験を無条件で再実行しない。変更対象に絞り、結果と引継ぎを更新する。
