from pathlib import Path
import re,json
from sync_safe import sync_safe
root=Path(__file__).resolve().parents[1]
names=json.loads((root/'tools/script_order.json').read_text())
html=(root/'index.html').read_text()
pattern=r'<script[^>]*>.*?</script>'
matches=list(re.finditer(pattern,html,re.S))
if not matches:raise ValueError('スクリプト挿入位置が見つかりません')
start,end=matches[0].start(),matches[-1].end()
if re.sub(pattern,'',html[start:end],flags=re.S).strip():raise ValueError('スクリプト間のHTMLを保護するため中止しました')
blocks=[]
for name in names:
 text=(root/'src'/(name+'.js')).read_text()
 if '</script' in text.lower():raise ValueError('JS本文にscript終端タグが含まれています')
 blocks.append('<script>\n'+text+'\n</script>')
(root/'index.html').write_text(html[:start]+'\n'.join(blocks)+html[end:])
sync_safe(root)
print('基本HTMLと両Safe版を更新しました。web/の更新は rebuild_web.py を実行してください。')
