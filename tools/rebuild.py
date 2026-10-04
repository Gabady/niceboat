from pathlib import Path
import re,json
from sync_safe import sync_safe
root=Path(__file__).resolve().parents[1]
names=json.loads((root/'tools/script_order.json').read_text())
updates=[]
for name,offset in [('index.html',0)]:
 if not (root/name).exists():continue
 html=(root/name).read_text();i=0
 def script(m):
  global i
  n=i;i+=1
  if n<offset:return m.group(0)
  text=(root/'src'/(names[n-offset]+'.js')).read_text()
  if '</script' in text.lower():raise ValueError('JS本文にscript終端タグが含まれています')
  return '<script>\n'+text+'\n</script>'
 html=re.sub(r'<script[^>]*>.*?</script>',script,html,flags=re.S)
 if i!=len(names)+offset:raise ValueError('スクリプト数が一致しません')
 updates.append((root/name,html))
for file,html in updates:file.write_text(html)
sync_safe(root)
print('基本HTMLと両Safe版を更新しました。web/の更新は rebuild_web.py を実行してください。')
