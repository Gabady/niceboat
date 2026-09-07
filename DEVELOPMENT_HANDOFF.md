# 開発引継ぎ — 競艇物語 v86

## 再開時
- このメモ→git status/diff→対象関数のみ。全JS/過去ログ/旧レポートを一括再読込しない。
- ユーザーはAndroid/iPhone単体HTMLとZIP、@付き変更理由を希望。実装と配布まで進め、確認待ちで止めない。
- 正本 /workspace/sites/kyotei-monogatari-v70/dist。公開・デプロイの依頼なし。
- 配布 /workspace/scratch/c938c42c53df/release_v86。保存済ID/版はupload-v86-results.jsonを再利用。
- tools/package.pyで単体2種とZIP生成。生成HTMLの直接編集禁止。Python/Nodeは開発時のみ必要。

## ファイルの担当
- data.js: 能力57種、グレード、難易度係数と5連携。
- racing.js: 60Hz物理/NPC/周回/能力/観戦調整/復帰。UIと独立。
- script.js: 育成/シリーズ/報酬/ショップ/観戦接続/セーブとUI。
- driving-ui.js: 入力とHUD。race-renderer.js: WebGL/Canvas代替。
- iphone-compat.js/iphone.css: iPhone単体だけの画面高さと共有保存/安全領域。

## v86の主目的・係数
- Eは勝ちやすいが成長75%/報酬レア-1/ショップSSRまで/SG報酬UR。Nは成長100%/高レア報酬。
- 既存NPC基礎pace: E速度/加速1.16/1.16、N1.23/1.25、npcTimeScale=.945。
- gradePace 新人/G3/G2/G1/SG: E1/1.008/1.015/1.021/1.026、N1/1.008/1.018/1.028/1.038。
- NPC speed/turnにgrade、accelにgrade²。手動自艇は全て等倍。観戦自艇にもgrade追加分は掛けない。
- 観戦自艇は難易度別NPC基礎paceへassist E.995/1.005/1、N.985/1.005/1(speed/accel/turn)。v85の1.035/1.06/1.015より減少。
- NPCの基礎値: Eは新人からのtier.base増加分を82%。Nは+0/.5/1/1.5/2。値は出走者詳細で見える。
- E NPCの獲得レアも1段階低下。SG NPC通常枠[SR,SR,SSR,SSR,SSR,UR]、index%5===0だけLR追加（EはUR）。
- Nレース成長base着順1〜6=.78/.74/.70/.66/.62/.58。Eは旧値.78/.71/.63/.56/.5/.45×.75。敗戦でもNを育てられるようにする。
- spectatorAdjustment: watchだけ各基礎を6艇平均へ18%近づけ、各±4.5以内。所持能力と基礎保存値は変更しない。
- 調子form=保存済aiBias/frame/progressからsin。speed±1.2%/accel±2%。連続変化、RNG消費なし、読込で再抽選なし。
- makeRace.grade保存、validRace検証、decodeで旧データをcareer.series.tierから補完。既存NPCは保持、次のシリーズ生成から新NPC。

## iPhone
- 同じソースからindex_iphone_safe.html生成。CSSと互換JSを追加埋め込みし、その後通常の5JSを実行。
- visualViewportが等倍の高さを--iphone-heightへ。拡大時はinnerHeight。ノッチ/ホームバー余白、入力16px、レース長押し抑制。
- script.js exportSave async、KM_IPHONEがある時だけWeb Share。成功は共有先へ渡した表示、キャンセルは何もしない、未対応/失敗はコピー用JSON。
- Web Shareはクリック直後、await前に呼ぶ。localStorage失敗は既存のメモリ退避とJSON。
- Safari Web URLとローカルHTML実行環境の説明をIPHONE_READMEへ。ファイルプレビューからJS実行制限を解除する仕組みはない。オフラインWebキャッシュ/SW未実装。

## 維持するゲーム仕様
- 600m×3周、反時計回り、10秒助走、外4–6は後方。F<0/L>=1秒。全スキップは3周物理観戦。
- 全開中は旋回による自動減速なし、横滑り/重い舵/衝突/転覆はあり。ブレーキなし。
- ブイ内側余白.45、接線減速は最初の接触のみ×.90。quickRecoverは同進行地点へ0.7秒停止/6秒間隔、空きレーン。NPC/観戦はスタック1.2秒で自動離脱。
- ステアの表示幅62%/ノブ56px維持。相対操作、透明判定は左下50%×50%(z4)。ボタンz5/6、overlay9。
- 9シリーズ/予選5走/上位6優勝戦・次6準優戦/SG条件1800万円/登録・ライバル特別出走はSG優勝戦のみ。
- 能力端数保持、表示整数＋ランク、金額10000万円から億。セーブversion80/build86。
- 洞口SR〜LR: 1周強化/2周通常/3周反動。モンキーSR/SSR/UR/LR=モンキーターン/Vモンキー/超絶Vモンキー/究極Vモンキー。ID不変。
- 同系統最上位だけ有効。全速左旋回/6m/s以上/各マーク1抽選、再抽選なし。カットインは能力ID直渡し。
- 5連携: launch(内/序盤/start40)、cutback(出口4秒/accel40)、stormwall(雨風/power40)、duel(18m/start,power35)、craftline(2周目/accel40)。条件と代償あり。

## 検証と残課題
- race-v86 8項目、iphone4、engine21、android共通API14、v84関連10、v85関連11、静的17+10成功。
- balance-v86-results.json: グレード60走比較、無購入通し4人、SG攻撃構成24走。任意ベンチマークを同梱。
- 追加のショップありN育成2例: SG到達1/2、SG優勝0。通常育成のSG僅差目標は確認不足。高レア構成への依存と相性を次に見る。
- 最終SG攻撃構成N能力95は8走2勝、100は8走4勝。UR複数所持の予選相当、通常育成の優勝戦勝率とは違う。
- Android/iPhone実機とブラウザ視覚QAは未実施。ブラウザ検証は明示依頼時のみ。
- 継続指標: 普通の購入を含む育成のSG到達/優勝率、NPC/自艇の差、G3以降の成長と能力獲得の連鎖、操作感。
- v85以前の数値・ベンチマークは履歴。今回の係数へ期待値を更新したテストのみ現行ゲートとして使用。
- 変更に直結した検証だけ実行。途中試算の結果を最終版の根拠と混在させない。
