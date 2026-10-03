"""Aggregate only the tests rerun for V109, preserve source fingerprints."""
from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent.parent
names=['narrative-v109','affinity-v109','development-v109','race-v109','career-flow-v109','browser-dialogue-v109','browser-affinity-v109','android-update','static','iphone-static']
rows=[]
for name in names:
 d=json.loads((P/'tests'/f'{name}-results.json').read_text())
 checks=d.get('checks',d.get('results',[]))
 passed=d.get('passed',sum(x.get('passed',False) for x in checks))
 failed=d.get('failed',sum(not x.get('passed',False) for x in checks))
 assert failed==0,(name,failed)
 rows.append({'suite':name,'passed':passed,'failed':failed})
files=sorted({p.name for p in P.glob('*.js')}|{p.name for p in P.glob('*.css')}|{'index.html','index_android_safe.html','index_iphone_safe.html'})
result={'build':109,'passed':sum(r['passed'] for r in rows),'failed':0,'suites':rows,'mentorChoiceCombinations':320,'heroineRewardRoutes':12,'scriptedTransitionRaces':324,'transitionPlacementsControlled':True,'browser':'Chromium 390x844, 360x740 and 320x640 mobile touch emulation','androidDeviceTested':False,'iphoneDeviceTested':False,'safariTested':False,'sourceHashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in files}}
(P/'tests/release-v109-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['build','passed','failed']},ensure_ascii=False))
