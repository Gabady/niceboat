"""Package the validated V129 tree, excluding build caches and old manifest."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1]
dest=root.parent/'deliverables-v129'
dest.mkdir(exist_ok=True)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
required=['balance','ui-logic','story-integration','safe-sync','parity','features','hard-races','legacy']
reports={n:json.loads((root/'tests'/f'{n}-v129.json').read_text()) for n in required}
assert all(r['build']=='129' for r in reports.values())
assert reports['safe-sync']['sourceSha256']==sha(root/'index.html')
assert reports['parity']['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3
assert all(r['passed'] for r in reports['safe-sync']['entries'])
release={'build':'129','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'engineChecks':len(reports['balance']['checks'])+len(reports['features']['checks']),
 'hardRaceComparison':reports['hard-races']['comparison'], 'hardFinalRuns':len(reports['hard-races']['hardFinals']), 'legacy128Checked':True,
 'uiChecks':len(reports['ui-logic']['checks']),'storyIntegrationChecks':len(reports['story-integration']['checks']),
 'deliveredInlineRaceRuns':36,'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'oldSaves':[116,117,121,122,123,124,125,127,128],
 'browserTested':False,'physicalDevicesTested':False,
 'limitations':['DOM adapter verifies markup generation, not screen layout.','No physical-device touch, audio or FPS test.','Maintenance rank estimates assume 54 normal attempts across 9 completed series.','AI comparison uses eight fixed conditions, not a population win-rate measurement.']}
(root/'tests/release-v129.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ['MANIFEST.sha256'] and not p.name.endswith('.pyc'))
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n')
files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v129.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert len(z.namelist())==len(files)
 for name in release['htmlEntrypoints']+['src/workshop128.js','src/hard129.js','src/reader129.js','src/social129.js','src/script.js','AGENTS.md','README.md','BALANCE_V129.md']:
  assert hashlib.sha256(z.read(name)).hexdigest()==sha(root/name)
print(json.dumps({'build':'129','files':len(files),'archiveIntegrity':'PASS','checks':release,'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file()]},ensure_ascii=False))
