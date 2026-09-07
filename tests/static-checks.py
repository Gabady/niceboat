from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess,tempfile,hashlib
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/'dist' if (ROOT/'dist').exists() else ROOT
class HTML(HTMLParser):
    def __init__(self):super().__init__();self.refs=[];self.scripts=[];self.current=None;self.styles=[];self.style=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='script':
            if 'src' in a:self.refs.append(a['src'])
            else:self.current=''
        if tag=='link' and a.get('rel')=='stylesheet':self.refs.append(a['href'])
        if tag=='style':self.style=''
    def handle_data(self,data):
        if self.current is not None:self.current+=data
        if self.style is not None:self.style+=data
    def handle_endtag(self,tag):
        if tag=='script' and self.current is not None:self.scripts.append(self.current);self.current=None
        if tag=='style' and self.style is not None:self.styles.append(self.style);self.style=None
checks=[]
def check(name,condition):
    assert condition,name
    checks.append({'name':name,'passed':True})
h=HTML();h.feed((SRC/'index.html').read_text())
check('分割版がCSSと5つのJSのローカル参照を持つ',h.refs==['style.css','data.js','racing.js','race-renderer.js','driving-ui.js','script.js'])
check('参照ファイルがすべて存在',all((SRC/r).is_file() for r in h.refs))
a=HTML();a.feed((SRC/'index_android_safe.html').read_text())
check('単体版に外部参照なし・5つのインラインJSとCSSを保持',len(a.refs)==0 and len(a.scripts)==5 and len(a.styles)==1)
for i,file in enumerate(['data.js','racing.js','race-renderer.js','driving-ui.js','script.js']):
    source=(SRC/file).read_text()
    check('単体版の'+file+'が分割版と一致',a.scripts[i].strip().replace('<\\/script','</script')==source.strip())
    with tempfile.NamedTemporaryFile(suffix='.js',mode='w',delete=True) as tmp:
        tmp.write(a.scripts[i]);tmp.flush();subprocess.run(['node','--check',tmp.name],check=True)
    check(file+'構文',True)
css=(SRC/'style.css').read_text()
check('単体版CSSが分割版と一致',a.styles[0].strip()==css.strip())
text=re.sub(r'/\*.*?\*/','',css,flags=re.S);stack=[];quote=None;escaped=False
for c in text:
    if quote:
        if not escaped and c==quote:quote=None
        escaped=(c=='\\' and not escaped)
        continue
    if c in ['"',"'"]:quote=c;continue
    if c in ['{','(']:stack.append(c)
    if c in ['}',')']:
        assert stack and stack.pop()==({'}':'{',')':'('}[c]),'CSS delimiter mismatch'
check('CSSの区切り・引用符',not stack and quote is None)
check('スマホ幅・動きを減らす設定を含む','max-width:660px' in css and 'max-width:359px' in css and 'prefers-reduced-motion' in css)
source='\n'.join(p.read_text() for p in SRC.glob('*.js'))
check('ネットワークAPIを使用しない',not re.search(r'\b(fetch\s*\(|XMLHttpRequest|WebSocket\s*\()',source))
result={'checks':checks,'hashes':{name:hashlib.sha256((SRC/name).read_bytes()).hexdigest() for name in ['index.html','style.css','data.js','racing.js','race-renderer.js','driving-ui.js','script.js','index_android_safe.html']},'browser_testing':False,'android_device_testing':False}
(ROOT/'tests/static-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'passed':len(checks),'failed':0,'browser_tested':False},ensure_ascii=False))
