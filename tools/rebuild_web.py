from pathlib import Path
import re,json,base64,hashlib
root=Path(__file__).resolve().parents[1];names=json.loads((root/'tools/script_order.json').read_text())
html=(root/'index.html').read_text();matches=list(re.finditer(r'<script[^>]*>(.*?)</script>',html,re.S))
if len(matches)!=len(names):raise SystemExit('スクリプト構成が一致しません。')
web=root/'web';(web/'assets').mkdir(parents=True,exist_ok=True);(web/'src').mkdir(exist_ok=True)
assets={};ext={'image/webp':'webp','image/png':'png','image/jpeg':'jpg','audio/mpeg':'mp3','audio/wav':'wav','audio/mp3':'mp3'}
def external(m):
 mime=m.group(1);raw=base64.b64decode(m.group(2));digest=hashlib.sha256(raw).hexdigest();name=digest[:20]+'.'+ext[mime];assets[name]={'mime':mime,'bytes':len(raw),'sha256':digest};(web/'assets'/name).write_bytes(raw);return 'assets/'+name
pattern=r'data:(image/(?:webp|png|jpeg)|audio/(?:mpeg|wav|mp3));base64,([A-Za-z0-9+/=]+)'
for name,m in zip(names,matches):(web/'src'/(name+'.js')).write_text(re.sub(pattern,external,m.group(1)))
index=0
def source(m):
 global index
 name=names[index];index+=1;return '<script src="src/'+name+'.js"></script>'
html=re.sub(r'<script[^>]*>.*?</script>',source,html,flags=re.S)
guard=re.search(r'<script[^>]*>.*?</script>',(root/'index_iphone_safe.html').read_text(),re.S).group()
html=html.replace('<script src=',guard+'\n<script src=',1)
(web/'index.html').write_text(re.sub(pattern,external,html));(web/'assets-manifest.json').write_text(json.dumps(assets,indent=2))
print('web/ を単体HTMLと同じ内容へ更新しました。')
