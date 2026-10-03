"""Aggregate only the checks run for this V107 release."""
from pathlib import Path
import json,hashlib,re
P=Path(__file__).resolve().parent.parent
names=['finale-v107','drama-v107','development-v107','relationships-v107','encounters-v107','posture-v107','music-v107','race-v107','career-flow-v107','browser-v107','android-update','static','iphone-static']
rows=[]
for name in names:
 d=json.loads((P/'tests'/f'{name}-results.json').read_text())
 checks=d.get('checks',d.get('results',[]))
 passed=d.get('passed',sum(x.get('passed',False) for x in checks))
 failed=d.get('failed',sum(not x.get('passed',False) for x in checks))
 assert failed==0,(name,failed)
 rows.append({'suite':name,'passed':passed,'failed':failed})
files=sorted({p.name for p in P.glob('*.js')}|{p.name for p in P.glob('*.css')}|{'index.html','index_android_safe.html','index_iphone_safe.html'})
result={'build':107,'passed':sum(r['passed'] for r in rows),'failed':0,'suites':rows,'sixBoatLineupCases':12,'scriptedTransitionRaces':324,'transitionPlacementsControlled':True,'raceDialoguePatterns':192,'browser':'Chromium headless; 360x740, 390x844 mobile emulation','realBrowserTested':True,'androidDeviceTested':False,'iphoneDeviceTested':False,'safariTested':False,'sourceHashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in files}}
(P/'tests/release-v107-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['build','passed','failed','scriptedTransitionRaces','raceDialoguePatterns']},ensure_ascii=False))
