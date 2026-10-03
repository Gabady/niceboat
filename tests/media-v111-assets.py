from pathlib import Path
from PIL import Image
import hashlib, json, subprocess

ROOT = Path(__file__).resolve().parent.parent
baseline = json.loads((ROOT/'tests/media-v111-baseline.json').read_text())
ids = ['akari', 'mio', 'nagi', 'kanade', 'tsumugi']
results = []
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def check(name, ok):
    results.append({'name': name, 'passed': bool(ok)})
    assert ok, name
    print('PASS', name)

changed = {f'assets/{folder}/{id}.{ext}' for id in ids for folder,ext in [('portraits','webp'),('portrait-png','png')]}
for rel, before in baseline.items():
    if rel.startswith('assets/') and rel not in changed:
        assert sha(ROOT/rel)==before, rel
check('瑞希と他の人物・既存5曲・背景を含む対象外54素材を維持', True)
for id in ids:
    for folder,ext in [('portraits','webp'),('portrait-png','png')]:
        p = ROOT/f'assets/{folder}/{id}.{ext}'
        with Image.open(p) as im:
            im.load()
            assert im.size==(512,512)
        assert sha(p)!=baseline[str(p.relative_to(ROOT))]
    with Image.open(ROOT/f'assets/portrait-source-v111/{id}.png') as im:
        im.load()
        assert im.size==(1254,1254)
    check(id+' 新しいPNG/WebP/原画を正しく復号',True)
for filename, uploaded, duration in [('sg-race.mp3','01-mp3',186.120),('sg-final.mp3','02-mp3',203.256)]:
    p=ROOT/'assets/audio'/filename
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,sample_rate','-of','json',str(p)]))
    assert abs(float(probe['format']['duration'])-duration)<.01
    assert probe['streams'][0]['codec_name']=='mp3'
    subprocess.run(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-f','null','-'],check=True)
    origin=ROOT.parent/'upload'/uploaded
    # The original uploads exist only in the authoring workspace.
    if origin.exists(): assert sha(p)==sha(origin)
    check(filename+' 元の長さを維持し全区間の音声を復号',True)
unmodified=['racing.js','audio.js','bonds-data.js','bonds.js','affinity.js','cast.js','finale.js','drama.js','drama-data.js','development.js','mentor-data.js','campaign.js','campaign-data.js','dialogue.js']
check('レース物理・音声再生処理・育成・物語・好感度のソースを維持',all(sha(ROOT/p)==baseline[p] for p in unmodified))
manifest=json.loads((ROOT/'PORTRAIT_PROMPTS.json').read_text())
for id in ids:
    m=next(m for m in manifest['portraits'] if m['id']==id)
    assert m['generatedBuild']==111 and (ROOT/m['source']).is_file() and len(m['prompt'])>500
check('5人の生成プロンプトと原画への対応を保持',True)
report={'build':111,'passed':len(results),'failed':0,'results':results,'sha256':{str(p.relative_to(ROOT)):sha(p) for p in sorted((ROOT/'assets').rglob('*')) if p.is_file()}}
(ROOT/'tests/media-v111-assets-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
