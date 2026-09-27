# v96 開発引継ぎ — 現行の接続点だけを読む

- 正本：ZIPルート、作業 `/workspace/scratch/c938c42c53df/kyotei-v96`。build96、save.version80／drive.version2。公開やGitHubの変更なし。
- 今回は水面描画だけ。`race-renderer.js`に6波長法線・背景反射・Fresnel・日照光沢・距離LOD・天候粗さ。水面は平面、波の法線だけを合成。`racing.js`等の物理係数に変更なし。
- マテリアル：0艇など、1水、2空、3無照明、4観客、5半透明泡、6艇の水際の影。5/6だけBLENDとdepthMask(false)、直後に元へ戻す。GL_FRAGMENT_PRECISION_HIGH分岐は両シェーダーで一致。
- 航跡はd.wakesを読むだけ（4.5秒まで）。泡のcol[0]は不透明度。G.geometryのflatとvLocalで軟らかいパッチへ。乱数・物理・セーブは描画から変更しない。
- CanvasはcreateWaterPainterの縮小バッファ（最大216×144）、同じ6波長、192×96の背景サンプル、96×96泡テクスチャ。OffscreenCanvasまたはdocument.createElementのcanvas。画像の未読込時は反射を色で代替。createWaterPainterはrendererごとに一度生成。
- 新ゲート `node tests/water-v96-tests.cjs`（21項目）。`tests/render-webgl.py`はuWeather＋5/6の半透明描画対応。Skiaテストではglobal.OffscreenCanvasをcreateCanvasで提供。比較PNGはpreviews/v96-*。
- 共通13JS＋2CSS。`tools/package.py`でAndroid単体13JS、iPhoneは互換を加えて14JS。分割ソースとの一致はstatic-checksとiphone-static-checks。v96移行は通知とbuild更新のみ、旧版補正の除外リストに96を追加済み。
- 現行検証まとめ `tests/release-v96-verification.json`。実ブラウザ／Android／iPhone実機は未検証。ソフトウェア描画の速度を実機FPSと書かない。
- v95既存：予選の操船／観戦／即結果、観戦からtakeControlで状態維持、決勝はrequiresManual。runInstantは360tick分割、非表示で観戦へ。師匠5＋壁5はcast.js、物語51件はstory.js、速度／接触／UR/LR演出はthrill.js。競技と演出の乱数を混ぜない。
- v95セーブ：c.cast、p.castJournal、イベントの精算済みID。人物は20名枠の置換、SGの既存登録・記憶招待を保護。詳しく必要な場合のみSTORY_DESIGN.mdと対象コードを読む。
- 今後の水面改善はスマホ実機でのGPU負荷とCanvas速度を先に確認。近似反射なので艇や動く観客の鏡像は未実装。新しい依頼と無関係な全履歴／全テストの再読を避ける。

変更理由はCHANGES_AT.md @188〜194。描画仕様と限界はBALANCE_REPORT.mdの先頭。
