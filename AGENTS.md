# 競艇物語の更新規則

ユーザー指定：今後の実装はすべてのHTMLへ反映すること。

- 基本版、Android Safe、iPhone Safe、素材分離版を同じゲーム処理・画面・CSS・素材で更新する。
- iPhone固有の画面高・共有保存補助は保持する。
- 編集元は `src/` と基本 `index.html` の画面・CSS。派生HTMLだけを手修正しない。
- `python3 tools/build_all.py` で `index.html`、`index_android_safe.html`、`index_iphone_safe.html`、`index_editable.html`、`web/index.html` を生成する。
- 配布前に `python3 tools/verify_all.py` と関連する回帰テストを実行する。
- ZIPには基本版と両Safe版を必ず同梱する。セーブキーと既得データを維持する。
- 実機未検証とブラウザー検証済みを混同しない。旧版の検証記録は今回の結果として扱わない。
