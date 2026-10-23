"""Package V139 only from the current, matching validation reports."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1]
dest=root.parent/'deliverables-v139';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
required=['cpu-stats','progress','hard','cpu-start','safe-sync','parity']
reports={n:json.loads((root/'tests'/f'{n}-v139.json').read_text()) for n in required}
assert all(r['build']=='139' and not r.get('failures') for r in reports.values())
assert {n:len(reports[n]['checks']) for n in required[:4]}=={'cpu-stats':8,'progress':37,'hard':16,'cpu-start':13}
for n in ['safe-sync','parity']:assert reports[n]['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3 and all(e['passed'] and e['delegatedClickChecks']==37 for e in reports['safe-sync']['entries'])
assert all(sha(root/e['file'])==e['sha256'] for e in reports['safe-sync']['entries'])
release={'build':'139','revision':'reimplemented-from-v137-2026-10-22','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'hardCpuReduction':{'stats':5,'stages':[0,1,2,3,4,5,6,7],'sgUnchanged':True,'playerUnchanged':True,'activeRacesPreserved':True},
 'checks':{n:len(r['checks']) for n,r in reports.items() if 'checks' in r},'checksTotal':74,
 'deliveredInlineChecks':111,'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'browserTested':False,'physicalDevicesTested':False,
 'limitations':['DOM adapter executes the production handlers, not real layout or touchscreen.','Browser installation failed; no browser screenshots or physical-device/audio/FPS verification.']}
(root/'tests/release-v139.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ['MANIFEST.json','MANIFEST.sha256'] and not p.name.endswith(('.pyc','.log')) and not p.name.startswith('.'))
(root/'MANIFEST.json').write_text(json.dumps({'build':'139','revision':release['revision'],'files':[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files]},ensure_ascii=False,indent=2)+'\n')
files.append(root/'MANIFEST.json')
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n');files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html','README.md','IPHONE_README.md','CHANGES_AT.md']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v139.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==len(files)
 for n in release['htmlEntrypoints']+['src/hard129.js','src/script.js','src/audio.js','README.md','AGENTS.md']:
  assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
print(json.dumps({'build':'139','files':len(files),'archiveIntegrity':'PASS','checks':release,'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file()]},ensure_ascii=False))
