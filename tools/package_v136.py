"""Package V136 only after its required source, story, UI and parity checks pass."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1]
dest=root.parent/'deliverables-v136';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
required=['routes','legacy','balance','features','flow','safe-sync','parity','resume','narrative','journey','progress','hard','calibration']
reports={n:json.loads((root/'tests'/f'{n}-v136.json').read_text()) for n in required}
assert all(r['build']=='136' and not r.get('failures') for r in reports.values())
assert sum(len(r.get('checks', [])) for r in reports.values())==146
for n in ['safe-sync','parity']:assert reports[n]['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3 and all(e['passed'] and e['delegatedClickChecks']==23 for e in reports['safe-sync']['entries'])
assert reports['safe-sync']['gameScripts']==58
assert all(sha(root/e['file'])==e['sha256'] for e in reports['safe-sync']['entries'])
release={'build':'136','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'heroineEpisodes':70,'rivalEpisodes':40,
 'bugfixes':['late-plan-choice','final-bridge-choice','interrupted-race-screen','unanswered-read-chapter','discarded-reader-backstack','between-races-save'],
 'hardBalance':{'growthBefore':1.2,'growthNow':1.4,'initialGrowth':1.2,'trainingBaseRange':[2.05,3.05],'normalAndEasyUnchanged':True},
 'awakening':{'hardOnly':True,'noPodium':{'threshold':5,'initialProbability':0.08,'increment':0.04,'cap':0.32,'rarities':['SR','SSR'],'skills':[1,1],'focusGain':4,'allGain':1},'sixthStreak':{'threshold':4,'initialProbability':0.1,'increment':0.06,'cap':0.4,'rarities':['SSR','UR'],'skills':[1,2],'focusGain':10,'allGain':3},'resetBothOnOccurrence':True,'drawAndRewardsSaved':True},
 'addedInlineBytesVersusV135':(root/'index_android_safe.html').stat().st_size-(root.parent/'deliverables-v135/index_android_safe.html').stat().st_size,
 'checks':{n:len(r['checks']) for n,r in reports.items() if 'checks' in r},
 'deliveredInlineClickChecks':sum(e['delegatedClickChecks'] for e in reports['safe-sync']['entries']),'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'legacySavesVerified':reports['legacy']['fixtures'],'browserTested':False,'physicalDevicesTested':False,
 'resumedVerificationAt':reports['resume']['verifiedAt'],
 'limitations':['DOM adapter verifies markup and actions, not layout.','No physical-device touch, audio or FPS test.','Route availability still depends on encounters, choices, affection and racing results.']}
(root/'tests/release-v136.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='MANIFEST.sha256' and not p.name.endswith(('.pyc','.log')) and not p.name.startswith('.'))
(root/'MANIFEST.json').write_text(json.dumps({'build':'136','packageRevision':'progression-and-hard-awakening-2026-10-19','files':[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files if p.name!='MANIFEST.json']},ensure_ascii=False,indent=2)+'\n')
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n');files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v136.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==len(files)
 for n in release['htmlEntrypoints']+['src/routes130.js','src/scene131.js','src/narrative132.js','src/choices133.js','src/practice133.js','src/journey134.js','src/awakening136.js','src/development.js','src/flow131.js','src/bonds.js','src/drama.js','src/script.js','AGENTS.md','README.md']:
  assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
print(json.dumps({'build':'136','files':len(files),'archiveIntegrity':'PASS','checks':release,'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file() and not p.name.startswith('.')]},ensure_ascii=False))
