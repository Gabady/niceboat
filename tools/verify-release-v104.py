from pathlib import Path
import json,hashlib
P=Path(__file__).resolve().parent.parent
names=['update-v104','posture-v104','posture-v104-render','relationships-v104','mentor-v104','music-v104','encounters-v104','career-v98','race-v95','android-update','presentation-v94','audio-v92','static','iphone-static']
rows=[]
for name in names:
 d=json.loads((P/'tests'/f'{name}-results.json').read_text())
 if name=='static': passed=sum(x['passed'] for x in d['checks']);failed=len(d['checks'])-passed
 else:passed=d['passed'];failed=d['failed']
 assert failed==0,(name,failed)
 rows.append({'suite':name,'passed':passed,'failed':failed})
b=json.loads((P/'tests/cast-v104-benchmark.json').read_text())
assert len(b['results'])==60 and all(x['current']['finished']==6 for x in b['results'])
h=json.loads((P/'tests/cast-v104-developed.json').read_text())
assert len(h['results'])==10 and all(x['finished']==6 for x in h['results'])
assert {x['boss'] for x in h['results'] if x['playerPlace']==1}=={'kurose','shirakami','kagura','raiden','onizuka'}
files=['index.html','style.css','interface.css','bonds.css','data.js','racing.js','driving-ui.js','cast.js','campaign-data.js','campaign.js','script.js','index_android_safe.html','index_iphone_safe.html']
result={'build':104,'passed':sum(x['passed'] for x in rows),'failed':0,'suites':rows,'pairedRaceFixtures':60,'developedRaceFixtures':10,'realBrowserTested':False,'androidDeviceTested':False,'iphoneDeviceTested':False,'sourceHashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in files}}
(P/'tests/release-v104-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'passed':result['passed'],'failed':0,'raceFixtures':70}))
