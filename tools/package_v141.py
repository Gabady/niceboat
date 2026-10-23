"""Package V141 only from the current source-bound validation reports."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1];dest=root.parent/'deliverables-v141';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
expected={'progress':46,'cpu-stats':8,'hard':16,'cpu-start':13,'rules':15,'improve':24,'controls':10}
reports={n:json.loads((root/'tests'/f'{n}-v141.json').read_text()) for n in [*expected,'safe-sync','parity','validation']}
assert all(r['build']=='141' and not r.get('failures') for r in reports.values())
for name,count in expected.items():assert len(reports[name]['checks'])==count
for n in ['safe-sync','parity','validation']:assert reports[n]['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3 and all(e['passed'] and e['delegatedClickChecks']==46 for e in reports['safe-sync']['entries'])
assert all(sha(root/e['file'])==e['sha256'] for e in reports['safe-sync']['entries'])
assert reports['validation']['checksTotal']==sum(expected.values())
for file,digest in reports['validation']['sourceModules'].items():assert sha(root/file)==digest
for name in expected:assert reports['validation']['reports'][name]['sha256']==sha(root/'tests'/f'{name}-v141.json')
release={'build':'141','revision':'review-practice-next-race-stage-3-2026-10-22','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'checks':expected,'checksTotal':sum(expected.values()),'deliveredInlineChecks':138,
 'improvementSuiteSimulatedRaces':reports['improve']['simulatedRaces'],
 'scope':['review goal -> normal training/maintenance -> one next-race comparison','same equipment/water, nearby recorded segment practice without career writes','contextual opponent hints','brief skill/wake/contact feedback','optional all-final spectator mode and separate actual control records','three-stage tutorial and configurable tap/drag controls'],
 'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'browserTested':False,'physicalDevicesTested':False,
 'limitations':['Production DOM/input handlers run in adapters, not real layout or touchscreen.','Replay-derived practice approximates positions/speeds/wakes; transient effects and loads reset.','Next-race differences are observations, not isolated causal training effects.','No browser screenshots or physical-device/audio/FPS verification.','Reports named V140 and earlier are historical, not rerun balance benchmarks.']}
(root/'tests/release-v141.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ['MANIFEST.json','MANIFEST.sha256'] and not p.name.endswith(('.pyc','.log')) and not p.name.startswith('.'))
(root/'MANIFEST.json').write_text(json.dumps({'build':'141','revision':release['revision'],'files':[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files]},ensure_ascii=False,indent=2)+'\n');files.append(root/'MANIFEST.json')
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n');files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html','README.md','IPHONE_README.md','CHANGES_AT.md']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v141.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==len(files)
 for n in release['htmlEntrypoints']+['src/improve141.js','src/script.js','src/driving-ui.js','README.md','AGENTS.md']:assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
print(json.dumps({'build':'141','files':len(files),'archiveIntegrity':'PASS','checksTotal':release['checksTotal'],'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file() and not p.name.startswith('.')]},ensure_ascii=False))
