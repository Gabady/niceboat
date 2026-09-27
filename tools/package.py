#!/usr/bin/env python3
"""Build the standalone HTML and release ZIP; Python standard library only."""
from pathlib import Path
import re
import base64
import json
import zipfile
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'dist' if (ROOT / 'dist').exists() else ROOT
(SOURCE/'visual-assets.js').write_text('/* Original v95 cyclic painted race panorama, embedded for local execution. */\n(function(r){r.KM_VISUAL='+json.dumps({'sky':'data:image/webp;base64,'+base64.b64encode((SOURCE/'assets/shore-panorama.webp').read_bytes()).decode()},separators=(',',':'))+';})(globalThis);\n',encoding='utf-8')
html = (SOURCE / 'index.html').read_text(encoding='utf-8')
css = (SOURCE / 'style.css').read_text(encoding='utf-8')
css = re.sub(r'url\("(assets/[^"\\n]+)"\)', lambda m: 'url("data:image/webp;base64,' + base64.b64encode((SOURCE/m.group(1)).read_bytes()).decode() + '")', css)
css += '\n' + (SOURCE/'story.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="story.css">','')
scripts = ['data.js','racing.js','story.js','cast.js','race-feedback.js','audio-assets.js','audio.js','presentation.js','thrill.js','visual-assets.js','race-renderer.js','driving-ui.js','script.js']
def inline_js(s):
    return re.sub(r'</script', r'<\\/script', s, flags=re.I)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '</style>')
for name in scripts:
    html = html.replace('<script src="'+name+'"></script>', '<script>\n' + inline_js((SOURCE/name).read_text(encoding='utf-8')) + '\n</script>')
html = html.replace('<title>競艇物語</title>', '<title>競艇物語 | Android Safe</title>')
standalone = SOURCE / 'index_android_safe.html'
standalone.write_text(html, encoding='utf-8')
assert '<script src=' not in html and '<link rel="stylesheet"' not in html
iphone = html.replace('Android Safe', 'iPhone Safe').replace('<span class="version">v95</span>', '<span class="version">v95 iPhone</span>')
iphone = iphone.replace('</head>', '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="競艇物語">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<style>\n' + (SOURCE/'iphone.css').read_text() + '\n</style>\n<script>\n' + inline_js((SOURCE/'iphone-compat.js').read_text()) + '\n</script>\n</head>')
iphone = iphone.replace('<p class="loading">水面を準備しています…</p>', '<p class="loading">水面を準備しています…</p><p class="notice">この表示から進まない場合は、JavaScriptを実行できる環境で開いてください。SafariではWebページのURLから開きます。ファイルのプレビューだけでは遊べない場合があります。</p>')
(SOURCE/'index_iphone_safe.html').write_text(iphone,encoding='utf-8')
zip_path = ROOT / 'kyotei_monogatari_v95.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['index.html','style.css','story.css',*scripts,'index_android_safe.html','index_iphone_safe.html','iphone-compat.js','iphone.css']:
        z.write(SOURCE/name,name)
    for name in ['README.md','CHANGES_AT.md','BALANCE_REPORT.md','DEVELOPMENT_HANDOFF.md','IPHONE_README.md']:
        z.write(ROOT/name,name)
    for p in sorted((SOURCE/'assets').glob('*')):
        if p.is_file(): z.write(p,'assets/'+p.name)
    z.write(ROOT/'ART_DIRECTION.md','ART_DIRECTION.md')
    z.write(ROOT/'STORY_DESIGN.md','STORY_DESIGN.md')
    for p in sorted((ROOT/'previews').glob('*.png')):
        z.write(p,'previews/'+p.name)
    for folder in ['tests','tools']:
        for p in sorted((ROOT/folder).glob('*')):
            if p.is_file() and p.suffix in ['.cjs','.json','.py']:
                z.write(p,p.relative_to(ROOT))
print(str(standalone))
print(str(SOURCE/'index_iphone_safe.html'))
print(str(zip_path))
