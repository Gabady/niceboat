from pathlib import Path
from html.parser import HTMLParser
import json,subprocess,tempfile
R=Path(__file__).resolve().parent.parent;S=R/'dist' if (R/'dist').exists() else R
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.scripts=[];self.styles=[];self.current=None;self.external=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script' and a.get('src'):self.external.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet':self.external.append(a.get('href'))
  if tag in ['script','style']:self.current=(tag,'')
 def handle_data(self,data):
  if self.current:self.current=(self.current[0],self.current[1]+data)
 def handle_endtag(self,tag):
  if self.current and self.current[0]==tag:
   (self.scripts if tag=='script' else self.styles).append(self.current[1].strip());self.current=None
p=Parser();p.feed((S/'index_iphone_safe.html').read_text());results=[]
def check(n,ok):assert ok,n;results.append({'name':n,'passed':True})
check('iPhone単体に外部JS/CSS参照なし',not p.external)
js=['iphone-compat.js','data.js','racing.js','race-renderer.js','driving-ui.js','script.js'];check('互換処理→データ→計算→描画→入力→育成の順で埋め込み',len(p.scripts)==6)
for name,content in zip(js,p.scripts):
 check(name+'がソースと一致',content.replace('<\\/script','</script')==(S/name).read_text().strip())
 with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
  f.write(content);f.flush();subprocess.run(['node','--check',f.name],check=True,capture_output=True)
check('全インラインJSの構文',True)
check('共通CSSとiPhone追加CSSが一致',p.styles==[(S/f).read_text().strip() for f in ['style.css','iphone.css']])
(S.parent/'tests' if S.name=='dist' else S/'tests').joinpath('iphone-static-results.json').write_text(json.dumps({'passed':len(results),'failed':0,'results':results,'iphone_device_tested':False},ensure_ascii=False,indent=2))
print(json.dumps({'passed':len(results),'failed':0}))
