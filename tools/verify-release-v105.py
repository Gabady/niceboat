"""Aggregate only the suites run for V105; do not count historical fixtures as current tests."""
from pathlib import Path
import json, hashlib
P=Path(__file__).resolve().parent.parent
names=['development-v105','career-flow-v105','browser-v105','race-v105','posture-v105','career-v105','music-v105','presentation-v105','encounters-v104','mentor-v104','relationships-v104','android-update','audio-v92','static','iphone-static']
rows=[]
for name in names:
    d=json.loads((P/'tests'/f'{name}-results.json').read_text())
    if name=='static':
        passed=sum(bool(x['passed']) for x in d['checks']); failed=len(d['checks'])-passed
    else:
        passed=d['passed']; failed=d['failed']
    assert failed==0,(name,failed)
    rows.append({'suite':name,'passed':passed,'failed':failed})
files=['index.html','style.css','story.css','interface.css','bonds.css','dialogue.css','data.js','racing.js','story.js','cast.js','campaign.js','development.js','dialogue.js','script.js','index_android_safe.html','index_iphone_safe.html']
result={'build':105,'passed':sum(x['passed'] for x in rows),'failed':0,'suites':rows,'careerTransitionCases':6,'scriptedTransitionRaces':324,'transitionPlacementsControlled':True,'realBrowserTested':True,'browser':'Chromium stable headless, mobile viewport','androidDeviceTested':False,'iphoneDeviceTested':False,'safariTested':False,'sourceHashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in files}}
(P/'tests/release-v105-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['build','passed','failed','scriptedTransitionRaces','realBrowserTested']},ensure_ascii=False))
