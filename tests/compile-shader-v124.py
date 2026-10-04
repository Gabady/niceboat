import ctypes as C,json,os,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
shader_source=json.loads(subprocess.check_output(['node','-e','const r=require("./src/race-renderer");process.stdout.write(JSON.stringify({vertex:r.vertex,fragment:r.fragment}))'],cwd=root,text=True))
os.environ['EGL_PLATFORM']='surfaceless'
e=C.CDLL('libEGL.so.1');ptr=C.c_void_p;I=C.c_int;U=C.c_uint
def fn(name,restype,args):
 f=getattr(e,name);f.restype=restype;f.argtypes=args;return f
getdisplay=fn('eglGetDisplay',ptr,[ptr]);initialize=fn('eglInitialize',U,[ptr,C.POINTER(I),C.POINTER(I)]);bind=fn('eglBindAPI',U,[U]);choose=fn('eglChooseConfig',U,[ptr,C.POINTER(I),C.POINTER(ptr),I,C.POINTER(I)]);create=fn('eglCreateContext',ptr,[ptr,ptr,ptr,C.POINTER(I)]);make=fn('eglMakeCurrent',U,[ptr,ptr,ptr,ptr]);getproc=fn('eglGetProcAddress',ptr,[C.c_char_p])
d=getdisplay(None);major=I();minor=I();assert initialize(d,C.byref(major),C.byref(minor));assert bind(0x30A0)
attrs=(I*13)(0x3033,1,0x3040,4,0x3024,8,0x3023,8,0x3022,8,0x3021,8,0x3038);cfg=ptr();n=I();assert choose(d,attrs,C.byref(cfg),1,C.byref(n)) and n.value
ctx=create(d,cfg,None,(I*3)(0x3098,2,0x3038));assert ctx and make(d,None,None,ctx)
def gl(name,ret,args):
 p=getproc(name.encode());assert p,name;return C.CFUNCTYPE(ret,*args)(p)
creates=gl('glCreateShader',U,[U]);source=gl('glShaderSource',None,[U,I,C.POINTER(C.c_char_p),C.POINTER(I)]);compile=gl('glCompileShader',None,[U]);geti=gl('glGetShaderiv',None,[U,U,C.POINTER(I)]);log=gl('glGetShaderInfoLog',None,[U,I,C.POINTER(I),C.c_void_p]);createp=gl('glCreateProgram',U,[]);attach=gl('glAttachShader',None,[U,U]);link=gl('glLinkProgram',None,[U]);getpi=gl('glGetProgramiv',None,[U,U,C.POINTER(I)]);getplog=gl('glGetProgramInfoLog',None,[U,I,C.POINTER(I),C.c_void_p]);getstr=gl('glGetString',C.c_char_p,[U])
report={'backend':getstr(0x1F02).decode(),'renderer':getstr(0x1F01).decode(),'scope':'Shader compilation/link only, surfaceless Mesa, not browser or device rendering','shaders':[]};program=createp()
for name,kind in [('vertex',0x8B31),('fragment',0x8B30)]:
 s=creates(kind);data=shader_source[name].encode();raw=C.c_char_p(data);source(s,1,C.byref(raw),None);compile(s);status=I();geti(s,0x8B81,C.byref(status));buf=C.create_string_buffer(8192);log(s,8192,None,buf);report['shaders'].append({'name':name,'compiled':bool(status.value),'log':buf.value.decode()});assert status.value,buf.value;attach(program,s)
link(program);status=I();getpi(program,0x8B82,C.byref(status));buf=C.create_string_buffer(8192);getplog(program,8192,None,buf);report.update(linked=bool(status.value),linkLog=buf.value.decode());assert status.value,buf.value
open(root/'tests/mesa-shader-v124.json','w').write(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
