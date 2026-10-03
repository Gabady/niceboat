# V114 開発引継ぎ

D.version=80、D.build='114'、保存キーkyotei_monogatari_v80。V113を引き継ぎ、曲名のみの切替通知を追加。@323〜324。物理・育成・素材・選曲ルールは変更なし。

## 変更

- music.js：onTrackChange({id,title})を再生成功時に発行。最後に通知した実音源srcで重複を抑止し、mute/stop/再開でも記憶を保つ。古いPromise、再生拒否、音量ゼロは通知しない。音量ゼロからの復帰は未通知の曲のみ通知する。
- audio.js：sound-controls内に独立したsound-noticeを作成。約4.2秒で非表示。次曲読込中、ミュート、BGMオフ、音量ゼロ、非表示・pagehideで消去。ゲームのtoastは流用しない。
- interface.css：曲名のみの小型表示、pointer-events:none、aria-live polite、reduced-motion対応。通常／会話は上64px、レースはHUDの下・時計の左に表示。
- index.html/data.js/script.js：版番号と移行文。V113を過去の移行済みリストへ追加。

V113の重要修正：endNovel(false)は明示終了、trueは読了。Affinity.offer.deferredは保留。閉じた直後の再オープン・自動章一覧を戻さない。閉じるは右上84×48px以上。会話修正本体は変更していない。

## 検証・配布

結果はtests/release-v114-verification.json。music-v114-tests.cjsで実選曲・UIルーティング・メディアライフサイクル・通知を検証。browser-music-v114.cjsは実Chromium・タッチ画面・7曲MP3・3配布形式で通知と配置を確認。static-checks.py / iphone-static-checks.pyは構文と埋込一致。

Android/iPhone実機、Safari、実スピーカーでの音出しは未確認。変更のないレース物理の再試験は行わない。過去の検証結果を今回分へ合算しない。

python tools/package.py で全体ZIP、Android/iPhone単体HTMLとV113向け差分ZIPを生成。差分はindex.html/data.js/script.js/music.js/audio.js/interface.cssとV114_UPDATE.txt。単体HTMLは直接編集しない。assetsはV113と同一。

PlaywrightはCODEX_PRIMARY_RUNTIME_NODE_MODULES、Chromium /tmp/v105-browser/chrome-headless-shell-linux64/chrome-headless-shell、FONTCONFIG_FILE=/tmp/v105-fonts.conf。KM_APP.getState()はclone。タップはbuttonを指定し対象actionのclick到達を待つ。
