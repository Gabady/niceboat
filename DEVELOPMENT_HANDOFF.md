# V116 開発引継ぎ

D.version=80、D.build='116'、保存キーkyotei_monogatari_v80。V115を基準にレースの描画だけ刷新。@327〜330。物理・技能・育成・出会い率の変更なし。assets/全71ファイルは同一。

## 変更点と座標

race-renderer.js：+Xが艇首、+Yが上、Zが左右。boatSceneがWebGLとCanvasの共通モデル。幅を見た目だけ1.14倍にして浅い船底・白いデッキ・COAMINGの開放式カバーを構成。物理の衝突形状はracing.jsのまま。

COAMINGを補間した同じ境界でcoaming / liveryを作る。色帯を別面の上に重ねない。sideMarkMeshは曲面に沿った白いプレートと数字。数字+Xが上。側面は視線に合わせた向き、背面番号はZ正方向が右。1の専用形状を維持。

racerPoseは3姿勢・旋回・速度を読み、jacket / sleeve / trouserのテーパ形状を配置。raceHelmetは頬・顎の輪郭を持つ。描画は状態を書き換えずRNGも使わない。遠方は25パーツ以下。近距離78パーツ。

cameraの後方オフセットを.25→.75へ。自艇の上体・頭を省いて視界を保つ。目線高さ・FOV・操作計算は維持。

Canvas：小さいソフトウェア奥行きバッファ(createDepthPainter)で全固体を描く。水と泡は従来の水面処理。船体部品を平均距離で並べるだけの処理へ戻すと、操縦席や番号が欠ける。低負荷のcoamingLow / jacketLow等を使用。通常WebGLは従来のGPU奥行き判定。Canvasは通常版より曲面と反射が簡略化される。

## 更新と検証

index/data/scriptは版番号と移行文、V115を移行済みリストへ追加。単体HTMLはtools/package.pyで生成。

render-v116.cjs：6艇・色・頂点・素材・姿勢・近中遠距離・転覆・390px晴雨・状態不変・V115移行。render-webgl.pyは実GLES shader描画。browser-v116.cjsは分割版WebGL/Canvas・Android単体・iPhone単体の実UI起動とタッチ操作。static-checksとiphone-static-checksは埋込一致・構文。集計はrelease-v116-verification.json。

確認画像はpreviews/v116-*.png。v116-boats-preview.pngは実際のゲーム描画を並べた画像。Android/iPhone実機・Safariの今回の確認は未実施。

## 配布

フルZIP / Android Safe / iPhone Safe / V115向け差分ZIP。差分実行ファイルはindex.html data.js script.js race-renderer.js。CSS・他のJS・assetsは同一。

## 既存仕様の注意

V115 encounterRates=[.004,.009,.020,.029,.042,.050,.060,.073,.090]は通常5人全体の出走前抽選。瑞希は同走の有効な1着後18%。済み抽選は再実行しない。V114曲名通知は実際の再生時のみ約4秒。V113 endNovel(false)は明示終了、trueは読了。明示終了直後に依頼を自動再表示しない。

PlaywrightはCODEX_PRIMARY_RUNTIME_NODE_MODULES、Chromium /tmp/v105-browser/chrome-headless-shell-linux64/chrome-headless-shell、FONTCONFIG_FILE=/tmp/v105-fonts.conf。KM_APP.getState()はclone。ブラウザ試験にGLESエミュレーションが含まれるため実機性能の保証に使わない。
