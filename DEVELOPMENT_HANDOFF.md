# V110 開発引継ぎ

## 現在地

V109から4点を変更。D.version=80、D.build='110'、保存キーkyotei_monogatari_v80。変更履歴@309〜312。素材は64ファイルすべてV109のまま。Web公開なし。

1. data.js D.permanentGrowthScale=.92。script.js growStatでamount>0だけ適用。練習・レース後・物語・新規技能の小成長を共通化。負の効果・既存能力・調整・好感度は変えない。
2. racing.js tiltEffects(r,b,power)でaccel=max(0,angle)*.12*(.25+.75*clamp(power,0,100)/100)。performanceの加速基礎項に1回だけ加算。実効フィジカルを渡す。最高速・不安定化・通常NPCの0度設定は維持。
3. affinity.js guidance、bonds.js gate、cast/dramaの最終話不足理由、script.jsゲージと交流ボタン。既存条件や好感度を変更せず、待ち走数と交流不足を区別。終了済み/別交際の制限には回復を促さない。
4. tools/dialogue-v110.txtの変動話者は{{rival}}。dialogue.js describe/proseで実名へ解決。旧保存の主ライバルや能力ランク表現は表示時のみ互換処理。能力数値欄は変えない。UIの役割表記も自然化。

## 編集元と保存

node tools/apply-dialogue-v110.cjs → drama-data.js / mentor-data.js / bonds-data.js / story-extra.js。原稿以外の動的台詞は bonds/affinity/finale/development/drama/script.js。本文の編集基準は SCENARIO_STYLE_V110.md。旧作者ツールは履歴参照用で使わない。人気帯Infinityの専用直列化、ブラウザのKM_BOND_DATA（単数）を守る。

ページ構成は変えずdialogue109:読書位置を継続。decodeの移行済みビルドへ109を追加。V109の能力・整備・好感度・途中走行を再計算しない。登録選手の会話はsc.registryで本人と本人のライバルを解決する。

好感度の最終話閾値はライバル/師匠60、ヒロイン70。師匠のテーマ選択条件、EasyのUR上限、3走の面会待ちなど従来どおり。

## 検証

現行集計: tests/release-v110-verification.json。

balance-v110-testsは23項目。tests/growth-scenarios-v110.cjsで9種類の育成を固定条件比較。V109基準はv109-growth-baseline.json。通常確認で基準ファイルを書き換えない。

narrative-v110 / affinity-v110 / development-v110 / race-v110 / career-flow-v110 / browser-dialogue-v110 / browser-affinity-v110 / android-update / static / iphone-staticを実行。過去版の結果は履歴で合算しない。V108本文基準テストは成長係数とティルトの意図した変更を除外しているため、新balanceテストと組み合わせる。

師匠320選択、ヒロイン12報酬ルート、324走の進行は固定結果の試験で実勝率ではない。物理バランスの大幅な再調整を行っていない。実Android/iPhone/Safariは未検証。

Playwright: CODEX_PRIMARY_RUNTIME_NODE_MODULES。KM_TEST_BROWSERの既定は/tmp/v105-browser/chrome-headless-shell-linux64/chrome-headless-shell、FONTCONFIG_FILE=/tmp/v105-fonts.conf。KM_APP.getState()はclone。ブラウザのtap後はクリック受信カウンタを待ち、タップ遅延中にreloadしない。

生成: python tools/package.py。単体HTMLを直接編集しない。共通JS30+iPhone互換1。検証後verify-release-v110.py、再度package.py、ZIPのCRC・重複なし・元ファイル一致・sourceHashes一致を確認。

次回はこの引継ぎと変更対象関数だけを読む。大きな埋込音源や全履歴を読み直さない。現在の調整係数・未検証範囲はBALANCE_REPORT.mdの先頭を参照。
