"""Render the actual GLES shaders with a surfaceless Mesa context (not browser QA)."""
import ctypes as C, json, sys, os
from pathlib import Path
from PIL import Image
os.environ.setdefault('EGL_PLATFORM','surfaceless')
egl=C.CDLL('libEGL.so.1');ptr=C.c_void_p;I=C.c_int;U=C.c_uint;F=C.c_float
def ef(name,restype,args):
 f=getattr(egl,name);f.restype=restype;f.argtypes=args;return f
getDisplay=ef('eglGetDisplay',ptr,[ptr]);init=ef('eglInitialize',U,[ptr,C.POINTER(I),C.POINTER(I)])
display=getDisplay(None);major=I();minor=I();assert init(display,C.byref(major),C.byref(minor)),'EGL init unavailable'
ef('eglBindAPI',U,[U])(0x30A0)
attrs=(I*17)(0x3024,8,0x3023,8,0x3022,8,0x3021,8,0x3025,24,0x3033,1,0x3040,4,0x3038,0,0)
config=ptr();count=I();assert ef('eglChooseConfig',U,[ptr,C.POINTER(I),C.POINTER(ptr),I,C.POINTER(I)])(display,attrs,C.byref(config),1,C.byref(count)) and count.value
data=json.loads(Path(sys.argv[1]).read_text());w=data['width'];h=data['height']
surface=ef('eglCreatePbufferSurface',ptr,[ptr,ptr,C.POINTER(I)])(display,config,(I*5)(0x3057,w,0x3056,h,0x3038))
context=ef('eglCreateContext',ptr,[ptr,ptr,ptr,C.POINTER(I)])(display,config,None,(I*3)(0x3098,2,0x3038))
assert ef('eglMakeCurrent',U,[ptr,ptr,ptr,ptr])(display,surface,surface,context)
getproc=ef('eglGetProcAddress',ptr,[C.c_char_p])
def gl(name,restype,args):
 addr=getproc(name.encode());assert addr,name
 return C.CFUNCTYPE(restype,*args)(addr)
createShader=gl('glCreateShader',U,[U]);source=gl('glShaderSource',None,[U,I,C.POINTER(C.c_char_p),C.POINTER(I)]);compileShader=gl('glCompileShader',None,[U]);getShader=gl('glGetShaderiv',None,[U,U,C.POINTER(I)])
def shader(kind,text):
 s=createShader(kind);raw=text.encode();source(s,1,(C.c_char_p*1)(raw),None);compileShader(s);ok=I();getShader(s,0x8B81,C.byref(ok))
 if not ok.value:
  log=C.create_string_buffer(4096);gl('glGetShaderInfoLog',None,[U,I,C.POINTER(I),ptr])(s,4096,None,log);raise RuntimeError(log.value.decode())
 return s
program=gl('glCreateProgram',U,[])();attach=gl('glAttachShader',None,[U,U]);attach(program,shader(0x8B31,data['vertex']));attach(program,shader(0x8B30,data['fragment']));gl('glLinkProgram',None,[U])(program);ok=I();gl('glGetProgramiv',None,[U,U,C.POINTER(I)])(program,0x8B82,C.byref(ok));assert ok.value,'link failed';gl('glUseProgram',None,[U])(program)
loc=gl('glGetUniformLocation',I,[U,C.c_char_p]);uniform={k:loc(program,('u'+k).encode()) for k in ['Model','VP','Color','Eye','Fog','Time','Water','Sky','SkyReady']}
mat=gl('glUniformMatrix4fv',None,[I,I,U,C.POINTER(F)]);vec=gl('glUniform3fv',None,[I,I,C.POINTER(F)]);scalar=gl('glUniform1f',None,[I,F])
mat(uniform['VP'],1,0,(F*16)(*data['camera']['vp']));vec(uniform['Eye'],1,(F*3)(*data['camera']['eye']));vec(uniform['Fog'],1,(F*3)(*data['fog']));scalar(uniform['Time'],data['time'])
texture=U();gl('glGenTextures',None,[I,C.POINTER(U)])(1,C.byref(texture));gl('glActiveTexture',None,[U])(0x84C0);gl('glBindTexture',None,[U,U])(0x0DE1,texture)
image=Image.open(Path(__file__).resolve().parent.parent/'assets/shore-panorama.webp').convert('RGBA').transpose(Image.Transpose.FLIP_TOP_BOTTOM);raw=image.tobytes();pixels=C.create_string_buffer(raw)
gl('glTexImage2D',None,[U,I,I,I,I,I,U,U,ptr])(0x0DE1,0,0x1908,image.width,image.height,0,0x1908,0x1401,pixels)
for key,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:gl('glTexParameteri',None,[U,U,I])(0x0DE1,key,value)
gl('glUniform1i',None,[I,I])(uniform['Sky'],0);scalar(uniform['SkyReady'],1)
gl('glViewport',None,[I,I,I,I])(0,0,w,h);gl('glEnable',None,[U])(0x0B71);gl('glClearColor',None,[F,F,F,F])(*data['fog'],1);gl('glClear',None,[U])(0x4000|0x100)
gen=gl('glGenBuffers',None,[I,C.POINTER(U)]);bind=gl('glBindBuffer',None,[U,U]);upload=gl('glBufferData',None,[U,C.c_ssize_t,ptr,U]);attrib=gl('glGetAttribLocation',I,[U,C.c_char_p]);position=attrib(program,b'aPosition');normal=attrib(program,b'aNormal');enable=gl('glEnableVertexAttribArray',None,[U]);enable(position);enable(normal);pointer=gl('glVertexAttribPointer',None,[U,I,U,U,I,ptr]);draw=gl('glDrawArrays',None,[U,I,I]);buffers={}
for key,values in data['geometry'].items():
 buffer=U();gen(1,C.byref(buffer));bind(0x8892,buffer);arr=(F*len(values))(*values);upload(0x8892,C.sizeof(arr),arr,0x88E4);buffers[key]=(buffer,len(values)//6)
for command in data['commands']:
 key,m,col,material=command[:4];buffer,count=buffers[key];bind(0x8892,buffer);pointer(position,3,0x1406,0,24,None);pointer(normal,3,0x1406,0,24,ptr(12));mat(uniform['Model'],1,0,(F*16)(*m));vec(uniform['Color'],1,(F*3)(*col));scalar(uniform['Water'],material);draw(4,0,count)
gl('glFinish',None,[])();error=gl('glGetError',U,[])();assert not error,hex(error)
pixels=(C.c_ubyte*(w*h*4))();gl('glReadPixels',None,[I,I,I,I,U,U,ptr])(0,0,w,h,0x1908,0x1401,pixels)
Image.frombytes('RGBA',(w,h),bytes(pixels)).transpose(Image.Transpose.FLIP_TOP_BOTTOM).save(sys.argv[2]);print('GLES shaders compiled, linked and rendered:',sys.argv[2])
