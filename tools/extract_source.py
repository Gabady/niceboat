from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
names=json.loads((root/'tools/script_order.json').read_text())
source=root/'src'
if source.exists() and any(source.iterdir()):
 raise SystemExit('srcには既存ファイルがあります。編集内容を保護するため、上書きしません。')
source.mkdir(exist_ok=True)
html=(root/'index.html').read_text();matches=list(re.finditer(r'<script[^>]*>(.*?)</script>',html,re.S))
if len(matches)!=len(names):raise SystemExit('スクリプト構成が一致しません。')
for name,m in zip(names,matches):(source/(name+'.js')).write_text(m.group(1))
i=0
def external(m):
 global i
 name=names[i];i+=1;return '<script src="src/'+name+'.js"></script>'
(root/'index_editable.html').write_text(re.sub(r'<script[^>]*>.*?</script>',external,html,flags=re.S))
print('src/ と index_editable.html を作成しました。')
