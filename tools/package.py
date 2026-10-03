#!/usr/bin/env python3
"""Build the standalone HTML and release ZIP; Python standard library only."""
from pathlib import Path
import re
import base64
import json
import zipfile
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'dist' if (ROOT / 'dist').exists() else ROOT
(SOURCE/'visual-assets.js').write_text('/* Original v101 cyclic painted race panorama, embedded for local execution. */\n(function(r){r.KM_VISUAL='+json.dumps({'sky':'data:image/webp;base64,'+base64.b64encode((SOURCE/'assets/shore-panorama.webp').read_bytes()).decode()},separators=(',',':'))+';})(globalThis);\n',encoding='utf-8')
html = (SOURCE / 'index.html').read_text(encoding='utf-8')
css = (SOURCE / 'style.css').read_text(encoding='utf-8')
css = re.sub(r'url\("(assets/[^"\\n]+)"\)', lambda m: 'url("data:image/webp;base64,' + base64.b64encode((SOURCE/m.group(1)).read_bytes()).decode() + '")', css)
css += '\n' + (SOURCE/'story.css').read_text(encoding='utf-8') + '\n' + (SOURCE/'interface.css').read_text(encoding='utf-8')
css += '\n' + (SOURCE/'bonds.css').read_text(encoding='utf-8')
css += '\n' + (SOURCE/'dialogue.css').read_text(encoding='utf-8')
css = re.sub(r'url\("(assets/[^"\n]+)"\)', lambda m: 'url("data:image/webp;base64,' + base64.b64encode((SOURCE/m.group(1)).read_bytes()).decode() + '")', css)
html=html.replace('<link rel="stylesheet" href="dialogue.css">','')
html=html.replace('<link rel="stylesheet" href="bonds.css">','')
html = html.replace('<link rel="stylesheet" href="story.css">','').replace('<link rel="stylesheet" href="interface.css">','')
scripts = ['data.js','affinity.js','drama-data.js','drama.js','racing.js','profile.js','story-extra.js','story.js','portrait-assets.js','portraits.js','bonds-data.js','bonds.js','mentor-data.js','cast.js','campaign-data.js','campaign.js','race-feedback.js','audio-assets.js','music.js','audio.js','presentation.js','thrill.js','visual-assets.js','race-renderer.js','race-dialogue.js','driving-ui.js','development.js','finale.js','dialogue.js','script.js']
def embed_music(source):
    def replace(m):
        path = SOURCE / m.group(2)
        if not path.is_file():
            raise FileNotFoundError('Missing configured MP3: ' + str(path))
        return m.group(1) + 'data:audio/mpeg;base64,' + base64.b64encode(path.read_bytes()).decode('ascii') + m.group(1)
    return re.sub(r"(['\"])(assets/audio/[^'\"\n]+\.mp3)\1", replace, source)

def embed_portraits(source):
    return re.sub(r"(['\"])(assets/portraits/[^'\"\n]+\.webp)\1", lambda m:m.group(1)+'data:image/webp;base64,'+base64.b64encode((SOURCE/m.group(2)).read_bytes()).decode('ascii')+m.group(1), source)

def inline_js(s):
    return re.sub(r'</script', r'<\\/script', s, flags=re.I)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '</style>')
for name in scripts:
    html = html.replace('<script src="'+name+'"></script>', '<script>\n' + inline_js(embed_music((SOURCE/name).read_text(encoding='utf-8')) if name=='music.js' else embed_portraits((SOURCE/name).read_text(encoding='utf-8')) if name=='portrait-assets.js' else (SOURCE/name).read_text(encoding='utf-8')) + '\n</script>')
html = html.replace('<title>競艇物語</title>', '<title>競艇物語 | Android Safe</title>')
standalone = SOURCE / 'index_android_safe.html'
standalone.write_text(html, encoding='utf-8')
assert '<script src=' not in html and '<link rel="stylesheet"' not in html
iphone = html.replace('Android Safe', 'iPhone Safe').replace('<span class="version">v114</span>', '<span class="version">v114 iPhone</span>')
iphone = iphone.replace('</head>', '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="競艇物語">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<style>\n' + (SOURCE/'iphone.css').read_text() + '\n</style>\n<script>\n' + inline_js((SOURCE/'iphone-compat.js').read_text()) + '\n</script>\n</head>')
iphone = iphone.replace('<p class="loading">水面を準備しています…</p>', '<p class="loading">水面を準備しています…</p><p class="notice">この表示から進まない場合は、JavaScriptを実行できる環境で開いてください。SafariではWebページのURLから開きます。ファイルのプレビューだけでは遊べない場合があります。</p>')
(SOURCE/'index_iphone_safe.html').write_text(iphone,encoding='utf-8')
zip_path = ROOT / 'kyotei_monogatari_v114.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in ['index.html','style.css','story.css','interface.css','bonds.css','dialogue.css',*scripts,'index_android_safe.html','index_iphone_safe.html','iphone-compat.js','iphone.css']:
        z.write(SOURCE/name,name)
    for name in ['README.md','CHANGES_AT.md','BALANCE_REPORT.md','DEVELOPMENT_HANDOFF.md','IPHONE_README.md']:
        z.write(ROOT/name,name)
    for p in sorted((SOURCE/'assets').rglob('*')):
        if p.is_file(): z.write(p,p.relative_to(SOURCE))
    z.write(ROOT/'ART_DIRECTION.md','ART_DIRECTION.md')
    z.write(ROOT/'THIRD_PARTY_NOTICES.txt','THIRD_PARTY_NOTICES.txt')
    z.write(ROOT/'STORY_DESIGN.md','STORY_DESIGN.md')
    z.write(ROOT/'EVENT_CATALOG.md','EVENT_CATALOG.md')
    z.write(ROOT/'RELATIONSHIPS.md','RELATIONSHIPS.md')
    for name in ['MUSIC.md','PORTRAITS.md','MENTOR_ROUTES.md','PORTRAIT_PROMPTS.json','SKILL_NAMES.md','POSTURE_CONTROL.md','MAIN_SCENARIOS.md','V105_GUIDE.md','V106_GUIDE.md','V107_GUIDE.md','V108_GUIDE.md','V109_GUIDE.md','V110_GUIDE.md','V111_GUIDE.md','V112_GUIDE.md','V113_GUIDE.md','V113_UPDATE.txt','V114_GUIDE.md','V114_UPDATE.txt','SCENARIO_STYLE_V109.md','SCENARIO_STYLE_V110.md','V107_PORTRAITS.md','RIVAL_SCENARIOS_V106.md','V105_ART_PROMPT.txt']:
        if (ROOT/name).exists(): z.write(ROOT/name,name)
    for name in ['v110-spectator.png','v110-final-grid.png','v110-race-dialogue.png','v110-finish-runout.png','v110-mizuki-story.png','v110-android.png','v110-iphone.png','v110-main.png','v110-choice.png','v110-mentor-outcome.png','v110-opportunities.png','v110-story.png','v110-heroine.png','v110-development.png','v110-small.png','v101-portraits.png','v97-sunny-webgl.png','v97-sunny-canvas.png','v97-turn-webgl.png','v97-rain-webgl.png','v97-model-straight.png','v97-model-turn.png','v97-reward-emblems.png','v97-boat-comparison.png']:
        p=ROOT/'previews'/name
        if p.exists() and not p.name.startswith('v110-'): z.write(p,'previews/'+p.name)
    for p in sorted((ROOT/'previews').glob('v114-*.png')):
        z.write(p,'previews/'+p.name)
    for folder in ['tests','tools']:
        for p in sorted((ROOT/folder).glob('*')):
            if p.is_file() and p.suffix in ['.cjs','.json','.py','.html','.txt']:
                z.write(p,p.relative_to(ROOT))
print(str(standalone))
print(str(SOURCE/'index_iphone_safe.html'))
print(str(zip_path))

patch_path=ROOT/'kyotei_monogatari_v114_patch.zip'
with zipfile.ZipFile(patch_path,'w',zipfile.ZIP_DEFLATED) as z:
    for name in ['index.html','data.js','script.js','music.js','audio.js','interface.css']:
        z.write(SOURCE/name,name)
    z.write(ROOT/'V114_UPDATE.txt','V114_UPDATE.txt')
print(str(patch_path))
