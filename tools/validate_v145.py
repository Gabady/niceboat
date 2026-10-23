"""Run current regression cases and delivered HTML checks; bind results to the source."""
from pathlib import Path
import subprocess,json,hashlib,time
root=Path(__file__).resolve().parents[1]
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def sources():return {p.relative_to(root).as_posix():digest(p) for p in sorted((root/'src').glob('*.js'))}
before=sources();reports={};expected={'progress':81,'cpu-stats':8,'hard':16,'cpu-start':13,'rules':15,'improve':24,'controls':10,'continuity':29,'after':19,'progression':15,'review':14,'challenge':22}
for name,n in expected.items():
 start=time.monotonic()
 with open('/tmp/validation-'+name+'-145.log','w') as log:
  subprocess.run(['node','tests/'+name+'-v145.cjs'],cwd=root,stdout=log,stderr=log,check=True)
 r=json.loads((root/'tests'/f'{name}-v145.json').read_text());assert r['build']=='145' and len(r['checks'])==n and not r.get('failures')
 reports[name]={'checks':n,'seconds':round(time.monotonic()-start,2),'sha256':digest(root/'tests'/f'{name}-v145.json')}
 print(name,n,'PASS',flush=True)
subprocess.run(['node','tests/safe-sync-v145.cjs'],cwd=root,check=True)
assert before==sources(),'Source changed during validation'
(root/'tests/validation-v145.json').write_text(json.dumps({'build':'145','sourceModules':before,'sourceSha256':digest(root/'index.html'),'reports':reports,'checksTotal':sum(expected.values()),'browserTested':False,'physicalDevicesTested':False},ensure_ascii=False,indent=2)+'\n')
