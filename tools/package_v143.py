"""Package V143 only from the current source-bound validation reports."""
from pathlib import Path
import hashlib,json,zipfile,shutil
root=Path(__file__).resolve().parents[1];dest=root.parent/'deliverables-v143';dest.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
expected={'progress':61,'cpu-stats':8,'hard':16,'cpu-start':13,'rules':15,'improve':24,'controls':10,'continuity':29,'after':19}
reports={n:json.loads((root/'tests'/f'{n}-v143.json').read_text()) for n in [*expected,'safe-sync','parity','validation']}
assert all(r['build']=='143' and not r.get('failures') for r in reports.values())
for name,count in expected.items():assert len(reports[name]['checks'])==count
for n in ['safe-sync','parity','validation']:assert reports[n]['sourceSha256']==sha(root/'index.html')
assert len(reports['safe-sync']['entries'])==3 and all(e['passed'] and e['delegatedClickChecks']==61 for e in reports['safe-sync']['entries'])
assert all(sha(root/e['file'])==e['sha256'] for e in reports['safe-sync']['entries'])
assert reports['validation']['checksTotal']==sum(expected.values())
for file,digest in reports['validation']['sourceModules'].items():assert sha(root/file)==digest
for name in expected:assert reports['validation']['reports'][name]['sha256']==sha(root/'tests'/f'{name}-v143.json')
release={'build':'143','revision':'post-career-stage-5-2026-10-22','modules':len(json.loads((root/'tools/script_order.json').read_text())),
 'sourceSha256':sha(root/'index.html'),'checks':expected,'checksTotal':sum(expected.values()),'deliveredInlineChecks':183,
 'improvementSuiteSimulatedRaces':reports['improve']['simulatedRaces'],'afterSuiteSimulatedRaces':reports['after']['simulatedRaces'],
 'scope':['registered-racer 3-race and 6-course cups with isolated state','one-meet short career for four story arcs','eight cast life scenes with encounter gates','actual main-task history and route-specific guidance','optional reading spacing and twelve-card archive pages','save-transfer shortcut and play-only packaging'],
 'htmlEntrypoints':['index.html','index_android_safe.html','index_iphone_safe.html','index_editable.html','web/index.html'],
 'browserTested':False,'physicalDevicesTested':False,
 'limitations':['Production DOM/input handlers run in adapters, not real layout or touchscreen.','No browser screenshots or physical-device/audio/FPS verification.','Reports named V142 and earlier are historical.','Short careers stop after two qualifiers and, when qualified, one final; they do not advance the ten-part heroine routes.']}
(root/'tests/release-v143.json').write_text(json.dumps(release,ensure_ascii=False,indent=2)+'\n')
files=sorted(p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name not in ['MANIFEST.json','MANIFEST.sha256'] and not p.name.endswith(('.pyc','.log')) and not p.name.startswith('.'))
(root/'MANIFEST.json').write_text(json.dumps({'build':'143','revision':release['revision'],'files':[{'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files]},ensure_ascii=False,indent=2)+'\n');files.append(root/'MANIFEST.json')
(root/'MANIFEST.sha256').write_text('\n'.join(sha(p)+'  '+p.relative_to(root).as_posix() for p in files)+'\n');files.append(root/'MANIFEST.sha256')
for name in ['index_android_safe.html','index_iphone_safe.html','README.md','IPHONE_README.md','CHANGES_AT.md']:shutil.copyfile(root/name,dest/name)
archive=dest/'kyotei_monogatari_v143.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(root).as_posix())
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None and len(z.namelist())==len(files)
 for n in release['htmlEntrypoints']+['src/after143.js','src/passage143.js','src/days143.js','src/script.js','src/driving-ui.js','README.md','AGENTS.md']:assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
play=dest/'kyotei_monogatari_v143_play.zip'
with zipfile.ZipFile(play,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name in ['index.html','index_android_safe.html','index_iphone_safe.html']:z.write(root/name,name)
 z.writestr('START_HERE.txt','競艇物語 V143\nAndroid: index_android_safe.html\niPhone: index_iphone_safe.html\nPC: index.html\n\n更新前に旧版からセーブJSONを書き出し、新版タイトルの「旧版のセーブを引き継ぐ」で読み込んでください。\n大会: 選手名鑑 → 登録選手の大会\n短編: 選手作成 → 育成の長さ → 短編\n\n各HTMLは単体で動作します。端末のプレビューで起動できない場合はHTMLを実行できるブラウザー環境で開いてください。iPhoneのファイルプレビューでは実行や保存が制限される場合があります。実機未検証です。\n')
with zipfile.ZipFile(play) as z:
 assert z.testzip() is None
 for n in ['index.html','index_android_safe.html','index_iphone_safe.html']:assert hashlib.sha256(z.read(n)).hexdigest()==sha(root/n)
print(json.dumps({'build':'143','files':len(files),'archiveIntegrity':'PASS','checksTotal':release['checksTotal'],'deliverables':[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(dest.iterdir()) if p.is_file() and not p.name.startswith('.')]},ensure_ascii=False))
