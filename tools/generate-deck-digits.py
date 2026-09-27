from matplotlib.textpath import TextPath
from matplotlib.font_manager import FontProperties
from matplotlib.path import Path as MP
import matplotlib.tri as mt
import numpy as np,json
from pathlib import Path
out={}
for n in range(1,7):
 p=TextPath((0,0),str(n),size=1,prop=FontProperties(family='DejaVu Sans',weight='bold',style='oblique'))
 polys=[x[:-1] for x in p.to_polygons()];pts=np.unique(np.vstack(polys),axis=0);tris=mt.Triangulation(pts[:,0],pts[:,1]).triangles
 lo=pts.min(axis=0);hi=pts.max(axis=0);scale=hi[1]-lo[1];mid=(lo+hi)/2;data=[]
 for tri in tris:
  verts=pts[tri];center=verts.mean(axis=0)
  samples=np.vstack([center,(verts+np.roll(verts,1,axis=0))*.5*.999+center*.001]);inside=np.zeros(len(samples),dtype=bool)
  for poly in polys:inside^=MP(np.vstack([poly,poly[0]])).contains_points(samples)
  if not inside.all():continue
  for v in verts:
   xy=(v-mid)/scale;data.extend([round(float(xy[1]),6),0,round(float(xy[0]),6),0,1,0])
 out['digit'+str(n)]=data
Path(__file__).resolve().parent.joinpath('generated-deck-digits.js').write_text('const digitGeometry='+json.dumps(out,separators=(',',':'))+';\n')
print('digit triangles',sum(len(v)//18 for v in out.values()))
