/* v96 — Layered reflective water and organic wakes. Rendering never changes race state. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const COLORS=['#fff4dc','#344756','#ed5747','#348ecf','#f6c641','#47b991'];
let skyImage=null;if(root.Image&&root.KM_VISUAL?.sky){skyImage=new root.Image();skyImage.src=root.KM_VISUAL.sky;}
const getSky=()=>root.KM_SKY_IMAGE||skyImage;
const panoramaU=u=>1-Math.abs(2*R.mod(u,1)-1);
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);
const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;
uniform mat4 uModel;uniform mat4 uVP;uniform mediump float uTime;uniform mediump float uWater;
#ifdef GL_FRAGMENT_PRECISION_HIGH
varying highp vec3 vWorld;
#else
varying mediump vec3 vWorld;
#endif
varying mediump vec3 vNormal;varying mediump vec2 vLocal;
void main(){vec4 p=uModel*vec4(aPosition,1.0);
if(uWater>3.5&&uWater<4.5)p.y+=sin(p.x*.31+p.z*.13+uTime*2.8)*.045;
vWorld=p.xyz;vLocal=aPosition.xz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uVP*p;}`;
const fragment=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uSky;uniform float uSkyReady;
uniform vec3 uColor;uniform vec3 uEye;uniform vec3 uFog;uniform vec3 uWeather;
uniform mediump float uTime;uniform mediump float uWater;
#ifdef GL_FRAGMENT_PRECISION_HIGH
varying highp vec3 vWorld;
#else
varying mediump vec3 vWorld;
#endif
varying mediump vec3 vNormal;varying mediump vec2 vLocal;
vec3 environment(vec3 ray){
 float angle=atan(max(.006,ray.y),length(ray.xz));
 float longitude=fract(atan(ray.z,ray.x)/6.2831853+.5);
 vec3 sky=mix(uFog,vec3(.20,.43,.64),clamp(angle*.8,0.,1.));
 if(uSkyReady>.5)sky=texture2D(uSky,vec2(1.-abs(2.*longitude-1.),clamp(.095+angle*.9,0.,1.))).rgb;
 return mix(sky,vec3(.38,.49,.57),uWeather.y*.66+uWeather.z*.28);
}
vec3 waterReflection(vec3 ray,float distance){
 float angle=atan(max(.006,ray.y),length(ray.xz));float lon=fract(atan(ray.z,ray.x)/6.2831853+.5);
 vec2 uv=vec2(1.-abs(2.*lon-1.),clamp(.095+angle*.9,0.,1.));
 vec3 sky=mix(uFog,vec3(.20,.43,.64),clamp(angle*.8,0.,1.));
 if(uSkyReady>.5){float blur=.003+smoothstep(15.,140.,distance)*.012;
 sky=texture2D(uSky,uv).rgb*.4+(texture2D(uSky,clamp(uv+vec2(blur,blur*.7),0.,1.)).rgb+texture2D(uSky,clamp(uv-vec2(blur,blur*.7),0.,1.)).rgb)*.3;}
 sky=mix(sky,uFog*.8,(1.-smoothstep(-.08,.05,ray.y))*.78);
 sky=mix(sky,uFog*.82,smoothstep(65.,230.,distance)*.70);
 return mix(sky,vec3(.38,.49,.57),uWeather.y*.66+uWeather.z*.28);
}
void main(){
 float dist=length(vWorld-uEye);
 if(uWater>5.5){vec2 uv=vLocal*2.;float edge=max(0.,1.-dot(uv,uv));gl_FragColor=vec4(.009,.045,.06,edge*edge*uColor.r);return;}
 if(uWater>4.5){
  // Soft, broken foam; no opaque slash polygons. Local UV follows each wake patch.
  vec2 uv=vLocal*2.;float edge=max(0.,1.-dot(uv,uv));
  vec2 p=vWorld.xz;float lace=sin(p.x*5.7+sin(p.y*3.9+uTime)*1.5-uTime*.6)*sin(p.y*6.9-p.x*2.3+uTime*.7);
  float bubbles=smoothstep(-.72,.7,lace);
  float alpha=edge*edge*(.18+.65*bubbles)*uColor.r;
  gl_FragColor=vec4(mix(vec3(.29,.62,.66),vec3(.91,.97,.92),bubbles),alpha);return;
 }
 if(uWater>2.5){gl_FragColor=vec4(uColor,1.);return;}
 if(uWater>1.5){vec3 ray=normalize((vWorld-uEye)*.002);gl_FragColor=vec4(environment(ray),1.);return;}
 vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.4,.88,.28));
 float sun=dot(n,light);float shade=sun>.5?1.0:sun>-.15?.82:.61;vec3 color=uColor*shade;
 if(uWater>.5){
  vec2 p=vWorld.xz;float t=uTime;float fine=1.-smoothstep(12.,85.,dist);
  float warp=sin(p.x*.071+p.y*.047+t*.24);
  vec2 slope=vec2(.0);
  slope+=vec2(.94,.34)*cos(dot(p,vec2(.94,.34))*.41+t*1.28+warp*.8)*.095;
  slope+=vec2(-.38,.92)*cos(dot(p,vec2(-.38,.92))*.69-t*.92+warp*.5)*.064;
  slope+=vec2(.79,-.61)*cos(dot(p,vec2(.79,-.61))*1.37+t*1.8)*.038;
  slope+=vec2(.18,.98)*cos(dot(p,vec2(.18,.98))*2.73-t*2.15+warp)*.027*fine;
  slope+=vec2(.97,-.24)*cos(dot(p,vec2(.97,-.24))*5.19+t*2.7)*.019*fine;
  slope+=vec2(-.73,.68)*cos(dot(p,vec2(-.73,.68))*8.17-t*3.3)*.010*fine;
  slope*=.75+uWeather.x*.80+uWeather.y*.25;
  n=normalize(vec3(-slope.x,1.,-slope.y));
  vec3 eye=normalize(uEye-vWorld);float facing=clamp(dot(n,eye),.015,1.);
  float fresnel=.025+.975*pow(1.-facing,5.);
  vec3 reflected=waterReflection(reflect(-eye,n),dist);
  // The basin is deep water, with green-blue body colour and a clear grazing reflection.
  vec3 body=mix(vec3(.018,.15,.19),vec3(.027,.27,.30),clamp(.48+slope.x*.9-slope.y*.6,0.,1.));
  body=mix(body,vec3(.055,.13,.17),uWeather.y*.35);
  color=mix(body,reflected*.86,fresnel*.82+.08);
  vec3 halfRay=normalize(eye+normalize(vec3(-.52,.48,.70)));
  float highlight=pow(max(dot(n,halfRay),0.),140.);
  float silver=pow(max(dot(n,normalize(eye+vec3(.2,.72,-.52))),0.),32.)*.065;
  color+=vec3(1.,.94,.77)*highlight*(1.-uWeather.y*.94-uWeather.z*.65)*.85+silver;
  float fog=1.-exp(-dist*.0018);gl_FragColor=vec4(mix(color,uFog,fog),1.);return;
 }
 float fog=1.-exp(-dist*.0016);gl_FragColor=vec4(mix(color,uFog,fog),1.);}`;
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function multiply(a,b){const out=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++){let v=0;for(let k=0;k<4;k++)v+=a[k*4+row]*b[c*4+k];out[c*4+row]=v;}return out;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=2*far*near/(near-far);return m;}
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const m=Math.hypot(...a)||1;return a.map(v=>v/m);};
function lookAt(eye,target,up){const z=unit(sub(eye,target)),x=unit(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function model(x,y,z,heading=0,sx=1,sy=1,sz=1){const c=Math.cos(heading),s=Math.sin(heading);return new Float32Array([c*sx,0,s*sx,0,0,sy,0,0,-s*sz,0,c*sz,0,x,y,z,1]);}
function meshBuilder(){const data=[];function tri(a,b,c){const n=unit(cross(sub(b,a),sub(c,a)));[a,b,c].forEach(p=>data.push(...p,...n));}return {data,tri,quad(a,b,c,d){tri(a,b,c);tri(a,c,d);}};}
function boxMesh(){const m=meshBuilder(),p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(f=>m.quad(...f.map(i=>p[i])));return m.data;}

function hullMesh(){const m=meshBuilder(),top=[[3.5,.36,0],[2.15,.47,-.78],[-1.85,.46,-.98],[-2.12,.34,-.70],[-2.12,.34,.70],[-1.85,.46,.98],[2.15,.47,.78]],bottom=top.map(p=>[p[0]*.94,-.06,p[2]*.78]);
for(let i=0;i<top.length;i++){m.tri([.2,.48,0],top[i],top[(i+1)%top.length]);m.quad(top[i],top[(i+1)%top.length],bottom[(i+1)%top.length],bottom[i]);}return m.data;}
function coneMesh(){return frustumMesh(1,0,0,1,12);}
function frustumMesh(r1,r2,y1,y2,steps=12){const m=meshBuilder();for(let i=0;i<steps;i++){const a=i*Math.PI*2/steps,b=(i+1)*Math.PI*2/steps;m.quad([Math.cos(a)*r1,y1,Math.sin(a)*r1],[Math.cos(b)*r1,y1,Math.sin(b)*r1],[Math.cos(b)*r2,y2,Math.sin(b)*r2],[Math.cos(a)*r2,y2,Math.sin(a)*r2]);}return m.data;}
function sphereMesh(steps=12,rings=6){const m=meshBuilder(),pt=(a,b)=>[Math.cos(a)*Math.sin(b),Math.cos(b),Math.sin(a)*Math.sin(b)];for(let i=0;i<steps;i++)for(let j=0;j<rings;j++)m.quad(pt(i*2*Math.PI/steps,j*Math.PI/rings),pt((i+1)*2*Math.PI/steps,j*Math.PI/rings),pt((i+1)*2*Math.PI/steps,(j+1)*Math.PI/rings),pt(i*2*Math.PI/steps,(j+1)*Math.PI/rings));return m.data;}
function planeMesh(size=600,steps=1){const m=meshBuilder();for(let i=0;i<steps;i++)for(let j=0;j<steps;j++){const x=-size/2+size*i/steps,z=-size/2+size*j/steps,v=size/steps;m.quad([x,0,z],[x,0,z+v],[x+v,0,z+v],[x+v,0,z]);}return m.data;}
function ringMesh(inner,outer,y=0){const m=meshBuilder(),steps=120;for(let i=0;i<steps;i++){const a=R.pointAt(R.C.length*i/steps,inner),b=R.pointAt(R.C.length*(i+1)/steps,inner),c=R.pointAt(R.C.length*(i+1)/steps,outer),d=R.pointAt(R.C.length*i/steps,outer);m.quad([a.x,y,a.z],[b.x,y,b.z],[c.x,y,c.z],[d.x,y,d.z]);}return m.data;}
function mountainMesh(radius,offset){const m=meshBuilder();for(let i=0;i<80;i++){const a=i*Math.PI/40,b=(i+1)*Math.PI/40,h=t=>15+Math.sin(t*3+offset)*8+Math.sin(t*9+offset)*5+Math.sin(t*17)*2; m.quad([Math.cos(a)*radius,-2,Math.sin(a)*radius],[Math.cos(b)*radius,-2,Math.sin(b)*radius],[Math.cos(b)*radius,h(b),Math.sin(b)*radius],[Math.cos(a)*radius,h(a),Math.sin(a)*radius]);}return m.data;}
function slashMesh(){const m=meshBuilder();m.quad([-1,0,-.15],[-.65,0,.08],[1,0,.15],[.65,0,-.08]);return m.data;}
function stripeMesh(){const m=meshBuilder();m.quad([.5,.491,-.25],[1,.491,.20],[3.42,.372,0],[2.7,.44,-.28]);return m.data;}
const G={box:boxMesh(),hull:hullMesh(),cone:coneMesh(),sphere:sphereMesh(),flat:planeMesh(1),slash:slashMesh(),stripe:stripeMesh(),
water:planeMesh(900,1),shore:ringMesh(90,235,.12),edge:ringMesh(87,90,.32),rope:ringMesh(R.C.inner-.06,R.C.inner+.06,.04),mountain:mountainMesh(270,0),farHill:mountainMesh(340,2),
buoy1:frustumMesh(1,.70,0,.9),buoy2:frustumMesh(.70,.37,.9,1.9),buoy3:frustumMesh(.37,.01,1.9,2.9),float:frustumMesh(1,1,0,.16)};
const distantSphere=sphereMesh(8,4);
const P={ink:rgb('#133346'),white:rgb('#fff5df'),foam:rgb('#e0fff4'),aqua:rgb('#49c5c2'),water:rgb('#137f9d'),steel:rgb('#87a9af'),red:rgb('#ee664e')};
const segs={1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg'};
function camera(d,width,height,motion,thrill=false){const b=R.own(d),fx=Math.cos(b.heading),fz=Math.sin(b.heading),t=motion?d.elapsed:0,bob=motion?Math.sin(t*4.3)*Math.min(.09,b.speed*.0015+b.wakeLoad*.05):0,roll=motion?b.heel*.16:0;
const eye=[b.x-fx*.25,1.65+bob,b.z-fz*.25],up=[-fz*Math.sin(roll),Math.cos(roll),fx*Math.sin(roll)],view=lookAt(eye,[eye[0]+fx*24,eye[1]-.72,eye[2]+fz*24],up);
const fov=80+(motion&&thrill?R.clamp((b.speed*3.6-52)/5,0,6):0);
return {eye,view,vp:multiply(perspective(fov*Math.PI/180,width/height,.14,650),view),focal:height/(2*Math.tan(fov*.5*Math.PI/180))};}
function palette(r){const rain=r.env.weather==='雨',cloud=r.env.weather==='曇り';return {fog:rgb(rain?'#9db9c7':cloud?'#b6d3df':'#b9e5ef'),water:rgb(rain?'#1b4655':cloud?'#1c5966':'#125d65'),rain,cloud};}
function weatherVector(r){return [R.clamp((r.env.windSpeed||0)/10,0,1),r.env.weather==='雨'?1:0,r.env.weather==='曇り'?1:0];}
// Same six wave bands as GLES. No random calls or mutable simulation data.
const trigTable=Float32Array.from({length:4097},(_,i)=>Math.sin(i*Math.PI/2048));
function fastSin(a){const v=a*(2048/Math.PI),i=Math.floor(v),f=v-i;return trigTable[i&4095]*(1-f)+trigTable[(i+1)&4095]*f;}
const waveBands=[[.94,.34,.41,1.28,.095,.8],[-.38,.92,.69,-.92,.064,.5],[.79,-.61,1.37,1.8,.038,0],[.18,.98,2.73,-2.15,.027,1],[.97,-.24,5.19,2.7,.019,0],[-.73,.68,8.17,-3.3,.010,0]];
function waterNormal(x,z,t,weather,dist,out=[0,0,0]){
 const q=R.clamp((dist-12)/73,0,1),fine=1-q*q*(3-2*q),warp=fastSin(x*.071+z*.047+t*.24);let sx=0,sz=0;
 for(let i=0;i<6;i++){const w=waveBands[i],a=fastSin((x*w[0]+z*w[1])*w[2]+t*w[3]+warp*w[5]+Math.PI/2)*w[4]*(i>2?fine:1);sx+=w[0]*a;sz+=w[1]*a;}
 const rough=.75+weather[0]*.8+weather[1]*.25;sx*=rough;sz*=rough;const len=Math.sqrt(sx*sx+1+sz*sz);out[0]=-sx/len;out[1]=1/len;out[2]=-sz/len;return out;
}
function offscreen(w,h){
 try{let c;if(root.OffscreenCanvas)c=new root.OffscreenCanvas(w,h);else if(root.document?.createElement){c=root.document.createElement('canvas');c.width=w;c.height=h;}return c&&c.getContext('2d')?c:null;}catch(_){return null;}
}
function createWaterPainter(){
 const surface=offscreen(1,1),cx=surface?.getContext('2d',{willReadFrequently:true});let pixels=null,skySource=null,skyPixels=null,sw=192,sh=96;
 const skyCanvas=offscreen(sw,sh),skyCtx=skyCanvas?.getContext('2d',{willReadFrequently:true});
 const foam=offscreen(96,96),fc=foam?.getContext('2d'),shadow=offscreen(96,96),sc=shadow?.getContext('2d');
 if(fc){const f=fc.createImageData(96,96);for(let y=0;y<96;y++)for(let x=0;x<96;x++){const u=(x+ .5)/48-1,v=(y+.5)/48-1,edge=Math.max(0,1-u*u-v*v),noise=(Math.sin(x*.59+Math.sin(y*.51)*1.5)*Math.sin(y*.73-x*.23)+1)*.5,k=(y*96+x)*4;f.data[k]=165+noise*67;f.data[k+1]=204+noise*41;f.data[k+2]=202+noise*34;f.data[k+3]=255*edge*edge*(.08+.84*noise*noise);}fc.putImageData(f,0,0);if(sc){for(let i=0;i<f.data.length;i+=4){const px=(i/4)%96,py=Math.floor(i/4/96),edge=Math.max(0,1-Math.pow((px+.5)/48-1,2)-Math.pow((py+.5)/48-1,2));f.data[i]=2;f.data[i+1]=12;f.data[i+2]=15;f.data[i+3]=255*edge*edge;}sc.putImageData(f,0,0);}}
 function draw(ctx,cam,width,height,pal,weather,t){
  if(!cx?.createImageData||!ctx.drawImage)return false;
  const image=getSky();if(image&&image.width>0&&skyCtx&&skySource!==image){try{skyCtx.drawImage(image,0,0,sw,sh);skyPixels=skyCtx.getImageData(0,0,sw,sh).data;skySource=image;}catch(_){skyPixels=null;}}
  const v=cam.view,f=cam.focal,eye=cam.eye,horizon=height/2-f*v[6]/v[5],top=Math.max(0,Math.floor(horizon-Math.abs(v[4]/v[5])*width/2-2));
  const w=Math.min(216,Math.max(160,Math.round(width*.5))),h=Math.min(144,Math.max(80,Math.round((height-top)*.4)));
  if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;pixels=cx.createImageData(w,h);}if(!pixels)pixels=cx.createImageData(w,h);
  const dark=[.018,.15,.19],lit=[.027,.27,.30],overcast=[.38,.49,.57],rainBody=[.055,.13,.17],sunColor=[1,.94,.77],skyBlue=[.2,.43,.64];
  const data=pixels.data,n=[0,0,0],rain=weather[1],cloud=weather[2],gray=rain*.66+cloud*.28;
  for(let row=0;row<h;row++){const y=top+(row+.5)*(height-top)/h,dy=(height/2-y)/f;
   for(let col=0;col<w;col++){const k=(row*w+col)*4,dx=((col+.5)*width/w-width/2)/f;
    let rx=v[0]*dx+v[1]*dy-v[2],ry=v[4]*dx+v[5]*dy-v[6],rz=v[8]*dx+v[9]*dy-v[10];
    if(ry>=-.00001){data[k+3]=0;continue;}const range=Math.min(800,-eye[1]/ry),wx=eye[0]+rx*range,wz=eye[2]+rz*range,rl=Math.sqrt(rx*rx+ry*ry+rz*rz),dist=range*rl;rx/=rl;ry/=rl;rz/=rl;
    waterNormal(wx,wz,t,weather,dist,n);const nd=-(n[0]*rx+n[1]*ry+n[2]*rz),face=R.clamp(nd,.015,1),falloff=1-face,fresnel=(.025+.975*falloff*falloff*falloff*falloff*falloff)*.82+.08;
    const ex=rx+2*nd*n[0],ey=ry+2*nd*n[1],ez=rz+2*nd*n[2],angle=Math.atan2(Math.max(.006,ey),Math.sqrt(ex*ex+ez*ez));
    const u=panoramaU(Math.atan2(ez,ex)/(2*Math.PI)+.5),vv=R.clamp(.095+angle*.9,0,1),fog=1-Math.exp(-dist*.0018),bodyMix=R.clamp(.48-n[0]/n[1]*.9+n[2]/n[1]*.6,0,1);
    const hx=-rx-.524,hy=-ry+.484,hz=-rz+.705,hl=Math.sqrt(hx*hx+hy*hy+hz*hz),spec=(n[0]*hx+n[1]*hy+n[2]*hz)/hl,highlight=(spec>.91?Math.pow(spec,140):0)*(1-rain*.94-cloud*.65)*.85;
    const below=1-R.clamp((ey+.08)/.13,0,1),far=R.clamp((dist-65)/165,0,1)*.70;
    const sx=u*(sw-1),sy=(1-vv)*(sh-1),ix=Math.floor(sx),iy=Math.floor(sy),tx=sx-ix,ty=sy-iy,at=(iy*sw+ix)*4,at2=(Math.min(sh-1,iy+1)*sw+ix)*4,extra=ix<sw-1?4:0;
    for(let c=0;c<3;c++){
     let reflected;if(skyPixels)reflected=((skyPixels[at+c]*(1-tx)+skyPixels[at+extra+c]*tx)*(1-ty)+(skyPixels[at2+c]*(1-tx)+skyPixels[at2+extra+c]*tx)*ty)/255;
     else reflected=pal.fog[c]*(1-Math.min(1,angle*.8))+skyBlue[c]*Math.min(1,angle*.8);
     reflected=reflected*(1-below*.78)+pal.fog[c]*.8*below*.78;
     reflected=reflected*(1-far)+pal.fog[c]*.82*far;reflected=reflected*(1-gray)+overcast[c]*gray;
     let body=dark[c]*(1-bodyMix)+lit[c]*bodyMix;body=body*(1-rain*.35)+rainBody[c]*rain*.35;
     const color=body*(1-fresnel)+reflected*.86*fresnel+highlight*sunColor[c];data[k+c]=Math.min(255,Math.max(0,Math.round((color*(1-fog)+pal.fog[c]*fog)*255)));
    }data[k+3]=255;
   }
  }
  cx.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(surface,0,0,w,h,0,top,width,height-top);return true;
 }
 function drawFoam(ctx,c){
  if(!foam||!ctx.transform||!ctx.clip)return;const q=c.quad,uv=[[0,0],[0,96],[96,96],[96,0]];
  for(const indices of [[0,1,2],[0,2,3]]){const p=indices.map(i=>q[i]),t=indices.map(i=>uv[i]),x1=t[1][0]-t[0][0],y1=t[1][1]-t[0][1],x2=t[2][0]-t[0][0],y2=t[2][1]-t[0][1],det=x1*y2-x2*y1;
   const a=((p[1][0]-p[0][0])*y2-(p[2][0]-p[0][0])*y1)/det,b=((p[1][1]-p[0][1])*y2-(p[2][1]-p[0][1])*y1)/det,cc=((p[2][0]-p[0][0])*x1-(p[1][0]-p[0][0])*x2)/det,dd=((p[2][1]-p[0][1])*x1-(p[1][1]-p[0][1])*x2)/det;
   ctx.save();ctx.globalAlpha=R.clamp(c.alpha,0,1);ctx.beginPath();ctx.moveTo(...p[0]);ctx.lineTo(...p[1]);ctx.lineTo(...p[2]);ctx.closePath();ctx.clip();ctx.transform(a,b,cc,dd,p[0][0]-a*t[0][0]-cc*t[0][1],p[0][1]-b*t[0][0]-dd*t[0][1]);ctx.drawImage(c.shadow?shadow:foam,0,0);ctx.restore();
  }
 }
 return {draw,drawFoam};
}
// Spectators are deterministic batched silhouettes: no per-person draw call or gameplay RNG.
function visualHash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function audience(r){
 const base={rookie:.24,g3:.43,g2:.59,g1:.75,sg:.89}[r.grade]||.24;
 const crowd=Math.min(.08,Math.max(...r.runners.map(n=>n.popularity||0))/2500);
 const variation=(visualHash(r.id+':crowd')/4294967295-.5)*.18;
 const density=R.clamp(base+crowd+(r.type==='championship'?.12:r.type==='consolation'?.05:0)+variation-(r.env.weather==='雨'?.10:0),.12,.98),count=Math.floor(density*432);
 return {density,count,label:count<140?'ゆったり':count<240?'にぎやか':count<340?'大盛況':'満員に近い'};
}
let crowdKey='',crowdCommands=[];
function crowdFor(r){
 const a=audience(r),key=r.id+':'+a.count;if(crowdKey===key)return crowdCommands;crowdKey=key;
 const colors=['#f6d68a','#f09374','#8ac8c0','#98b6db','#f3e6c3','#193e55'],builders=colors.map(()=>meshBuilder()),seats=[];
 for(const side of [-1,1])for(let stand=-4;stand<=4;stand++)for(let row=0;row<3;row++)for(let seat=0;seat<8;seat++){const index=seats.length;seats.push({side,stand,row,seat,order:visualHash(key+':'+index),index});}
 const patch=(i,points)=>{const m=builders[i];for(let k=1;k<points.length-1;k++)m.tri(points[0],points[k],points[k+1]);};
 seats.sort((x,y)=>x.order-y.order).slice(0,a.count).forEach(s=>{
  const x=s.stand*22-8.2+s.seat*2.35,y=3.15+s.row*.72,z=s.side*(106+s.row*2),col=s.order%4,lean=((s.order>>>7)%7-3)*.016;
  patch(col,[[x-.29,y,z],[x+.29,y,z],[x+.23+lean,y+.64,z],[x-.23+lean,y+.64,z]]);
  const head=[];for(let k=0;k<8;k++){const a=k*Math.PI/4;head.push([x+lean+Math.cos(a)*.21,y+.84+Math.sin(a)*.23,z-s.side*.018]);}patch(4,head);
  patch(5,[[x-.19+lean,y+.97,z-s.side*.025],[x+.19+lean,y+.97,z-s.side*.025],[x+.15+lean,y+1.08,z-s.side*.025],[x-.15+lean,y+1.08,z-s.side*.025]]);
  const cheer=s.order%5===0;for(const hand of [-1,1]){const top=y+(cheer?1.07:.48),xx=x+hand*.48;
   patch(col,[[x+hand*.18,y+.57,z],[x+hand*.31,y+.45,z],[xx+hand*.08,top,z],[xx-hand*.08,top+.03,z]]);
  }
  if(s.order%23===0){patch(4,[[x+.47,y+.45,z],[x+.50,y+.45,z],[x+.5,y+1.55,z],[x+.47,y+1.55,z]]);patch(col,[[x+.50,y+1.55,z],[x+1.06,y+1.41,z],[x+.50,y+1.19,z]]);}
 });
 crowdCommands=colors.map((c,i)=>{const key='crowd'+i;G[key]=builders[i].data;return [key,rgb(c)];});return crowdCommands;
}

function scene(d,r,settings,emit){
const player=R.own(d),time=settings.motion===false?0:d.elapsed,pal=palette(r);
const add=(key,x,y,z,h,sx,sy,sz,col)=>emit(key,model(x,y,z,h,sx,sy,sz),col,key==='sphere'&&sx>5?3:0);
if(!settings.paintedSky){emit('farHill',identity(),rgb('#8aadb5'),3);emit('mountain',identity(),rgb('#528987'),3);}
emit('shore',identity(),rgb('#6ba78f'));emit('edge',identity(),rgb('#bed2c6'));emit('rope',identity(),rgb('#e8b269'));
// Distant clouds are sculpted clusters; no textures, fetches or random calls.
if(!settings.paintedSky)for(let i=0;i<13;i++){const a=i*Math.PI*2/13,cx=Math.cos(a)*245,cz=Math.sin(a)*245;for(let j=0;j<3;j++){add('sphere',cx-Math.sin(a)*(j-1)*14,34+(j===1?8:0)+i%3*7,cz+Math.cos(a)*(j-1)*14,0,17,6+(j===1?4:0),9,pal.rain?rgb('#a0b4c1'):rgb('#eff9ed'));}}
// Two shore grandstands: canopy, terraces, windows, supports and seat ribbons.
for(const side of [-1,1])for(let i=-4;i<=4;i++){const x=i*22,z=side*114;
 add('box',x,1.5,z,0,10.5,1.5,9,rgb('#d2dccd'));add('box',x,5.1,z+side*3,0,10.5,1.3,6,rgb('#345f72'));
 for(let row=0;row<3;row++)add('box',x,3+row*.72,z-side*(8-row*2),0,10,.18,.55,row%2?P.red:rgb('#cedbce'));
 add('box',x,8.2,z,0,12,.22,12,P.ink);add('box',x,8.48,z,0,12,.12,12,P.white);
 for(const dx of [-9,9])add('box',x+dx,5,z-side*8,0,.12,3.2,.12,P.steel);
 for(let j=-2;j<=2;j++)add('box',x+j*4,5.2,z-side*3.1,0,1.7,.85,.1,rgb('#78a8b8'));
}
crowdFor(r).forEach(([key,col])=>emit(key,identity(),col,4));
for(let s=0;s<R.C.length;s+=18){const p=R.pointAt(s,R.C.inner),bob=Math.sin(time*1.7+s)*.035;add('sphere',p.x,.13+bob,p.z,p.heading,.42,.22,.42,Math.floor(s/18)%2?P.white:P.red);}
for(let s=0;s<R.C.length;s+=30){const p=R.pointAt(s,R.C.outer);add('sphere',p.x,.1,p.z,0,.36,.24,.36,P.white);}
for(const side of [-1,1]){const x=side*(R.C.halfStraight+R.C.inner),bob=Math.sin(time*1.8+side)*.045;

 add('float',x,.02,0,0,1.25,1,1.25,P.ink);
 for(const [key,col] of [['buoy1',P.red],['buoy2',P.white],['buoy3',P.red]])add(key,x,.12+bob,0,0,1,1,1,col);
}
const gx=R.pointAt(R.C.start).x;
for(let j=0;j<16;j++)add('flat',gx,.045,R.C.inner+(j+.5)*(R.C.outer-R.C.inner)/16,0,1.5,1,(R.C.outer-R.C.inner)/16,j%2?P.white:P.ink);
for(const z of [R.C.inner-2,R.C.outer+2]){add('box',gx,4,z,0,.11,4,.11,P.white);add('box',gx,7.2,z,0,.13,.7,.5,P.red);}
if(settings.guide!==false)for(let i=1;i<=12;i++){const p=R.pointAt(R.C.start+player.progress+i*8);add('slash',p.x,.07,p.z,p.heading,1.25,1,.22,rgb('#ffd17f'));}
// World-space foam patches follow the actual turning wake, and fade with its age.
for(const w of d.wakes){const age=d.elapsed-w.t;if(age<0||age>4.5||Math.hypot(w.x-player.x,w.z-player.z)>100)continue;
 const heading=Math.atan2(w.fz,w.fx),spread=.85+age*1.28,fade=Math.pow(1-age/4.5,1.6)*R.clamp(w.strength,.2,1.25);
 for(const side of [-1,1])emit('flat',model(w.x-w.fz*spread*side,.036,w.z+w.fx*spread*side,heading+side*.17,4.8+age,1,.65+age*.36),[fade*.7,1,1],5);
 if(age<2.5)emit('flat',model(w.x,.027,w.z,heading,5.3,1,1.35+age*.42),[fade*.43,1,1],5);
}
for(const n of d.boats){emit('flat',model(n.x,.021,n.z,n.heading,6.9,1,2.9),[.44,1,1],6);const color=rgb(COLORS[n.frame-1]),bob=Math.sin(time*3+n.frame)*.028;
 let layer=0;const local=(key,x,y,z,sx,sy,sz,col,h=0)=>{const fx=Math.cos(n.heading),fz=Math.sin(n.heading);emit(key,model(n.x+x*fx-z*fz,y+bob,n.z+x*fz+z*fx,n.heading+h,sx,sy,sz),col,0,{x:n.x,z:n.z,layer:layer++});};
 if(n.capsized){local('hull',0,.10,0,1,-.85,1,P.ink);continue;}
 local('hull',0,.03,0,1.025,1.05,1.025,P.ink);local('hull',0,.095,0,1,1,1,P.white);
 local('hull',0,.29,0,.96,.6,.96,color);
 local('hull',.08,.39,0,.92,.45,.92,P.white);
 local('stripe',0,.15,0,1,1,1,color);
 // Hard black gunwales, ivory sponsons, an open cockpit and low fairing.
 for(const side of [-1,1]){local('box',.08,.48,side*.80,1.8,.035,.035,P.ink);local('box',.85,.29,side*.86,1.25,.13,.11,color);}
 local('sphere',-.58,.48,0,.82,.10,.58,P.ink);
 local('sphere',.20,.56,0,.35,.20,.44,color);
 local('box',-1.93,.72,0,.32,.36,.35,P.ink);local('box',-1.95,1.02,0,.34,.09,.37,rgb('#8ca5a6'));
 for(let i=0;i<4;i++)local('box',-1.60,.63+i*.1,0,.022,.02,.28,P.steel);
 local('box',-2.12,.12,0,.08,.40,.1,P.ink);
 // Deck race number, modeled as seven-segment paint under a small ivory plate.
 local('box',2.3,.654,0,.25,.014,.22,P.ink);
 local('box',2.3,.673,0,.23,.012,.20,P.white);
 const lines={a:[.19,0,.16,.03],b:[.10,.19,.03,.14],c:[-.10,.19,.03,.14],d:[-.19,0,.16,.03],e:[-.10,-.19,.03,.14],f:[.10,-.19,.03,.14],g:[0,0,.16,.03]};
 for(const seg of segs[n.frame]){const q=lines[seg];local('box',2.3+q[0]*.58,.692,q[1]*.58,q[2]*.58,.008,q[3]*.58,P.ink);}
 if(!n.isPlayer){
 local('sphere',-.75,.73,0,.58,.31,.46,color);local('sphere',-.20,.91,0,.58,.33,.38,color);
 for(const side of [-1,1]){local('sphere',.14,.78,side*.35,.40,.11,.12,P.ink);local('sphere',.40,.70,side*.35,.15,.09,.12,P.white);}
 local('sphere',.35,1.25,0,.34,.36,.32,P.ink);local('sphere',.37,1.28,0,.32,.33,.30,P.white);
 local('sphere',.62,1.23,0,.15,.13,.26,P.ink);local('sphere',.68,1.25,-.04,.04,.045,.16,rgb('#76b8ce'));
 local('box',.18,1.59,0,.17,.018,.07,color);
 }else{
 local('box',.35,.60,0,.12,.075,.63,P.ink);local('sphere',.34,.62,0,.19,.08,.20,P.steel);
 for(const side of [-1,1]){local('sphere',.10,.57,side*.56,.25,.12,.13,P.ink);local('sphere',-.12,.57,side*.62,.24,.15,.17,color);}
 }
 if(n.speed>3){const fx=Math.cos(n.heading),fz=Math.sin(n.heading);
 for(let i=0;i<3;i++){const tail=2.7+i*1.55;emit('flat',model(n.x-fx*tail,.052,n.z-fz*tail,n.heading,3.8,1,1.4+i*.45),[R.clamp(n.speed/24,.15,.9)*(1-i*.16),1,1],5);}
 if(settings.motion!==false)for(let i=0;i<8;i++){const age=(time*1.7+i*.137)%1,side=i%2?1:-1,scale=(1-age)*.08;
 local('sphere',.1-age*(2+n.speed*.18),.18+Math.sin(age*Math.PI)*(.25+n.speed*.022),side*(.90+age*1.8),scale*2,scale,scale,P.foam);}
 }
}
}
function clipNear(points,near=.16){
 const result=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=near,insideB=b[2]>=near;
  if(insideA)result.push(a);if(insideA!==insideB){const t=(near-a[2])/(b[2]-a[2]);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}}
 return result;
}

function createWebGL(canvas){
const gl=canvas.getContext('webgl',{alpha:false,antialias:true,depth:true,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl',{alpha:false,antialias:true,depth:true});
if(!gl)throw Error('WebGLを利用できないため軽量描画へ切り替えます。');
const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(error);}return s;};
const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
if(!gl.getProgramParameter(program,gl.LINK_STATUS)){const error=gl.getProgramInfoLog(program);gl.deleteProgram(program);throw Error(error||'WebGL link');}gl.useProgram(program);
const uniforms={};['Model','VP','Color','Eye','Fog','Time','Water','Sky','SkyReady','Weather'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,'u'+k));
const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);gl.enable(gl.DEPTH_TEST);
const meshes={};for(const [key,data]of Object.entries(G)){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);meshes[key]={buffer,count:data.length/6,source:data};}
const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([170,215,230,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.Sky,0);
let width=1,height=1,vp=identity(),drawCamera=null,disposed=false,skyReady=false;
function emit(key,m,col,water=0){if(drawCamera&&water!==2&&key!=='water'&&!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const v=drawCamera.view,x=v[0]*m[12]+v[4]*m[13]+v[8]*m[14]+v[12],y=v[1]*m[12]+v[5]*m[13]+v[9]*m[14]+v[13],z=-(v[2]*m[12]+v[6]*m[13]+v[10]*m[14]+v[14]),radius=Math.max(Math.hypot(m[0],m[2]),Math.abs(m[5]),Math.hypot(m[8],m[10]))*(key==='hull'||key==='stripe'?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(z+radius<.14||Math.abs(x)-radius>Math.max(0,z+radius)*width/(2*drawCamera.focal)||Math.abs(y)-radius>Math.max(0,z+radius)*height/(2*drawCamera.focal))return;}let g=meshes[key];if(!g||g.source!==G[key]){const buffer=g?g.buffer:gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(G[key]),gl.STATIC_DRAW);g=meshes[key]={buffer,count:G[key].length/6,source:G[key]};}gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(uniforms.Model,false,m);gl.uniform3fv(uniforms.Color,col);gl.uniform1f(uniforms.Water,water);if(water>=5){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}gl.drawArrays(gl.TRIANGLES,0,g.count);if(water>=5){gl.depthMask(true);gl.disable(gl.BLEND);}}
function draw(d,r,settings={}){if(disposed||gl.isContextLost())return;width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);const scale=Math.min(root.devicePixelRatio||1,1.5,Math.sqrt(1050000/(width*height))),w=Math.round(width*scale),h=Math.round(height*scale);
if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
const image=getSky();if(!skyReady&&image&&image.width>0){try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);skyReady=true;}catch(_){/* Retain procedural sky when images cannot decode. */}}
gl.uniform1f(uniforms.SkyReady,skyReady?1:0);gl.uniform3fv(uniforms.Weather,weatherVector(r));
const cam=camera(d,width,height,settings.motion!==false,settings.raceFX==='full'),pal=palette(r);drawCamera=cam;vp=cam.vp;gl.clearColor(...pal.fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uniforms.VP,false,vp);gl.uniform3fv(uniforms.Eye,cam.eye);gl.uniform3fv(uniforms.Fog,pal.fog);gl.uniform1f(uniforms.Time,settings.motion===false?0:d.elapsed);
emit('sphere',model(cam.eye[0],cam.eye[1],cam.eye[2],0,480,480,480),pal.fog,2);emit('water',identity(),pal.water,1);scene(d,r,{...settings,paintedSky:skyReady},emit);
}
function project(x,y,z){const v=[x,y,z,1],a=[0,0,0,0];for(let i=0;i<4;i++)for(let k=0;k<4;k++)a[i]+=vp[k*4+i]*v[k];if(a[3]<=.16)return null;return {x:(a[0]/a[3]*.5+.5)*width,y:(.5-a[1]/a[3]*.5)*height,depth:a[3],visible:Math.abs(a[0]/a[3])<1.1&&Math.abs(a[1]/a[3])<1.1};}
return {canvas,mode:'webgl',diagnostic:null,draw,project,get size(){return {width,height};},destroy(){if(disposed)return;disposed=true;Object.values(meshes).forEach(g=>gl.deleteBuffer(g.buffer));gl.deleteTexture(texture);gl.deleteProgram(program);},isLost:()=>gl.isContextLost()};
}
function createCanvas(canvas){
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('この環境では水面を描画できません。観戦モードをご利用ください。');
let width=1,height=1,view=identity(),focal=1,disposed=false,painted=0;const waterPainter=createWaterPainter();
const cameraPoint=p=>[view[0]*p[0]+view[4]*p[1]+view[8]*p[2]+view[12],view[1]*p[0]+view[5]*p[1]+view[9]*p[2]+view[13],-(view[2]*p[0]+view[6]*p[1]+view[10]*p[2]+view[14])];
const screen=p=>[width/2+p[0]*focal/p[2],height/2-p[1]*focal/p[2]];
function project(x,y,z){const p=cameraPoint([x,y,z]);if(p[2]<=.16)return null;const q=screen(p);return {x:q[0],y:q[1],depth:p[2],visible:q[0]>-15&&q[0]<width+15&&q[1]>-15&&q[1]<height+15};}
const color=(base,fog,depth,light=1)=>{const t=1-Math.exp(-depth*.0016);return 'rgb('+base.map((v,i)=>Math.round(R.clamp(v*light*(1-t)+fog[i]*t,0,1)*255)).join(',')+')';};
function draw(d,r,settings={}){
if(disposed)return;painted++;width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);const scale=Math.min(root.devicePixelRatio||1,1.25,Math.sqrt(650000/(width*height))),w=Math.round(width*scale),h=Math.round(height*scale);
if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(w/width,0,0,h/height,0,0);
const cam=camera(d,width,height,settings.motion!==false,settings.raceFX==='full'),pal=palette(r),b=R.own(d),t=settings.motion===false?0:d.elapsed;view=cam.view;focal=cam.focal;
const horizon=height/2-focal*.03,sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,pal.rain?'#6c899f':'#398ecc');sky.addColorStop(1,color(pal.fog,pal.fog,0));ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
const art=getSky(),paintedSky=!!(art&&art.width>0&&ctx.drawImage);if(paintedSky){const dw=focal*Math.PI,dh=focal/.9,offset=R.mod(b.heading/(Math.PI*2)+.5,1)*2,y=horizon-dh*.905;for(let i=Math.floor(offset)-1;i<=Math.floor(offset)+1;i++){const x=width/2+(i-offset)*dw;ctx.save();ctx.translate(x+(R.mod(i,2)?dw:0),0);if(R.mod(i,2))ctx.scale(-1,1);ctx.drawImage(art,0,y,dw,dh);ctx.restore();}if(pal.rain){ctx.globalAlpha=.6;ctx.fillStyle='#4f708f';ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;}}
const water=ctx.createLinearGradient(0,horizon,0,height);water.addColorStop(0,color(pal.water,pal.fog,140));water.addColorStop(.35,color(pal.water,pal.fog,50));water.addColorStop(1,pal.rain?'#1e647f':'#076383');ctx.fillStyle=water;ctx.fillRect(0,horizon,width,height-horizon);
waterPainter.draw(ctx,cam,width,height,pal,weatherVector(r),t);
const commands=[];
function emit(key,m,col,material=0,anchor=null){if(material>=5){const points=[[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]].map(([x,z])=>cameraPoint([m[0]*x+m[8]*z+m[12],m[13],m[2]*x+m[10]*z+m[14]]));if(points.some(p=>p[2]<.25))return;const quad=points.map(screen);if(quad.every(p=>p[0]<0)||quad.every(p=>p[0]>width)||quad.every(p=>p[1]<0)||quad.every(p=>p[1]>height))return;commands.push({quad,shadow:material===6,alpha:col[0],depth:points.reduce((n,p)=>n+p[2],0)/4});return;}const center=cameraPoint([m[12],m[13],m[14]]),data=key==='sphere'&&center[2]>16?distantSphere:G[key];
if(!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const radius=Math.max(Math.hypot(m[0],m[1],m[2]),Math.hypot(m[4],m[5],m[6]),Math.hypot(m[8],m[9],m[10]))*(key==='hull'||key==='stripe'?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(center[2]+radius<.16||Math.abs(center[0])-radius>Math.max(0,center[2]+radius)*width/(2*focal)||Math.abs(center[1])-radius>Math.max(0,center[2]+radius)*height/(2*focal))return;}
for(let i=0;i<data.length;i+=18){const points=[];for(let k=0;k<3;k++){const j=i+k*6,x=data[j],y=data[j+1],z=data[j+2];points.push(cameraPoint([m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]]));}
const clipped=clipNear(points);if(clipped.length<3)continue;const depth=clipped.reduce((v,p)=>v+p[2],0)/clipped.length;if(depth>600)continue;const polygon=clipped.map(screen);
if(polygon.every(p=>p[0]<-2)||polygon.every(p=>p[0]>width+2)||polygon.every(p=>p[1]<-2)||polygon.every(p=>p[1]>height+2))continue;
const n=unit([m[0]*data[i+3]+m[4]*data[i+4]+m[8]*data[i+5],m[1]*data[i+3]+m[5]*data[i+4]+m[9]*data[i+5],m[2]*data[i+3]+m[6]*data[i+4]+m[10]*data[i+5]]),lit=-n[0]*.4+n[1]*.88+n[2]*.28,shade=material>=3?1:lit>.5?1:lit>-.15?.82:.61;
commands.push({polygon,depth:anchor?cameraPoint([anchor.x,.5,anchor.z])[2]-anchor.layer*.001+depth*.000001:depth,fill:material>=3?color(col,col,0):color(col,pal.fog,depth,shade)});
}
}
scene(d,r,{...settings,paintedSky},emit);commands.sort((a,b)=>b.depth-a.depth);
for(const c of commands){if(c.quad){waterPainter.drawFoam(ctx,c);continue;}ctx.fillStyle=c.fill;ctx.beginPath();ctx.moveTo(...c.polygon[0]);for(let i=1;i<c.polygon.length;i++)ctx.lineTo(...c.polygon[i]);ctx.closePath();ctx.fill();ctx.strokeStyle=c.fill;ctx.lineWidth=.45;ctx.stroke();}
}
return {canvas,mode:'canvas',diagnostic:null,draw,project,isLost:()=>false,get size(){return {width,height};},get frames(){return painted;},destroy(){disposed=true;}};
}
function freshCanvas(canvas){const fresh=canvas.cloneNode(false);canvas.parentNode.replaceChild(fresh,canvas);return fresh;}
function create(canvas,options={}){
 if(options.mode==='canvas')return createCanvas(canvas);
 try{return createWebGL(canvas);}catch(error){
  // A canvas that acquired WebGL cannot acquire 2D, even if shader linking failed.
  const next=freshCanvas(canvas),renderer=createCanvas(next);renderer.diagnostic=String(error.message||error).slice(0,1800);return renderer;
 }
}


const API={weatherVector,waterNormal,geometry:G,panoramaU,audience,crowdFor,create,createWebGL,createCanvas,freshCanvas,clipNear,COLORS,vertex,fragment,multiply,perspective,lookAt,model,point:R.pointAt,boxMesh,hullMesh,coneMesh,planeMesh,ringMesh,scene,camera,sphereMesh,frustumMesh};
root.KM_RACE_RENDERER=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
