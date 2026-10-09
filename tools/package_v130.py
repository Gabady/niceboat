"""Package V130 only after its required source, story, UI and parity checks pass."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1]
dest=root.parent/'deliverables-v130';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
required=['routes','legacy','balance','features','ui-logic','story-integration','safe-sync','parity']
reports={n:json.loads((root/'tests'/f'{n}-v130.json').read_text()) for n in required}
assert all(r['build']=='130' for r in reports.values())
for n in ['safe-sync','parity']:assert reports[n]['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3 and all(e['passed'] for e in reports['safe-sync']['entries'])
release={'build':'130','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'heroineEpisodes':70,'rivalEpisodes':40,
 'checks':{n:len(r['checks']) for n,r in reports.items() if 'checks' in r},
 'deliveredInlineRaceRuns':36,'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'legacyRouteSaves':10,'browserTested':False,'physicalDevicesTested':False,
 'limitations':['DOM adapter verifies markup and actions, not layout.','No physical-device touch, audio or FPS test.','Route availability still depends on encounters, choices, affection and racing results.']}
(root/'tests/release-v130.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='MANIFEST.sha256' and not p.name.endswith('.pyc') and not p.name.startswith('.'))
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n');files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v130.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==len(files)
 for n in release['htmlEntrypoints']+['src/routes130.js','src/bonds.js','src/drama.js','src/script.js','AGENTS.md','README.md']:
  assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
print(json.dumps({'build':'130','files':len(files),'archiveIntegrity':'PASS','checks':release,'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file()]},ensure_ascii=False))
