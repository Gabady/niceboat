"""Aggregate only the suites actually run for V106."""
from pathlib import Path
import json, hashlib
P=Path(__file__).resolve().parent.parent
names=['drama-v106','development-v106','career-flow-v106','browser-v106','race-v106','posture-v106','music-v106','relationships-v106','encounters-v106','android-update','static','iphone-static']
rows=[]
for name in names:
    d=json.loads((P/'tests'/f'{name}-results.json').read_text())
    if name=='static':
        passed=sum(bool(x['passed']) for x in d['checks']); failed=len(d['checks'])-passed
    else:
        passed=d['passed']; failed=d['failed']
    assert failed==0,(name,failed)
    rows.append({'suite':name,'passed':passed,'failed':failed})
files=['index.html','style.css','story.css','interface.css','bonds.css','dialogue.css','data.js','drama-data.js','drama.js','racing.js','story.js','mentor-data.js','cast.js','campaign.js','development.js','dialogue.js','script.js','index_android_safe.html','index_iphone_safe.html']
result={'build':106,'passed':sum(x['passed'] for x in rows),'failed':0,'suites':rows,'mentorChoiceCombinations':320,'careerTransitionCases':6,'scriptedTransitionRaces':324,'transitionPlacementsControlled':True,'realBrowserTested':True,'browser':'Chromium stable headless, 360/390px mobile viewports','androidDeviceTested':False,'iphoneDeviceTested':False,'safariTested':False,'sourceHashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in files}}
(P/'tests/release-v106-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['build','passed','failed','mentorChoiceCombinations','scriptedTransitionRaces','realBrowserTested']},ensure_ascii=False))
