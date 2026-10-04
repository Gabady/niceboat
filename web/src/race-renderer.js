


/* v116 — Japanese racing hydroplanes, sculpted safety gear and clear six-lane liveries. Drawing never changes race state. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const COLORS=['#f4f5ef','#171d24','#df2635','#125dd3','#ffd124','#179b5c'];
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
vWorld=p.xyz;vLocal=aPosition.xz;vNormal=normalize(uModel[0].xyz*aNormal.x/max(dot(uModel[0].xyz,uModel[0].xyz),.000001)+uModel[1].xyz*aNormal.y/max(dot(uModel[1].xyz,uModel[1].xyz),.000001)+uModel[2].xyz*aNormal.z/max(dot(uModel[2].xyz,uModel[2].xyz),.000001));gl_Position=uVP*p;}`;
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
 if(uWater>6.5){
  vec3 n=normalize(vNormal),eye=normalize(uEye-vWorld),light=normalize(vec3(-.4,.88,.28));
  float diffuse=max(dot(n,light),0.);float hemi=.47+.20*n.y;vec3 base=uColor;
  float roughness=.29,specular=.24,reflectivity=.10;
  if(uWater>7.5&&uWater<8.5){roughness=.82;specular=.035;reflectivity=.01;}
  if(uWater>8.5&&uWater<9.5){roughness=.22;specular=.62;reflectivity=.31;}
  if(uWater>9.5&&uWater<10.5){roughness=.13;specular=.76;reflectivity=.52;}
  if(uWater>10.5&&uWater<11.5){
   roughness=.32;specular=.30;reflectivity=.075;
   float bend=sin(vLocal.x*2.4)*.8+sin(vLocal.x*.63)*1.6;
   float grain=sin(vLocal.y*142.+bend)+sin(vLocal.y*317.+bend*1.8)*.28;
   float pores=pow(abs(sin(vLocal.y*64.+bend*.45)),18.);
   base*=.98+(grain*.025-pores*.042)*(1.-smoothstep(8.,28.,dist));
  }
  if(uWater>11.5&&uWater<12.5){roughness=.56;specular=.22;reflectivity=.08;
   float weave=sin(vLocal.x*173.)*sin(vLocal.y*139.);
   float weld=pow(abs(cos(atan(vLocal.y,vLocal.x)*4.)),90.);
   base*=(.98+weave*.008-weld*.045)*(1.-smoothstep(5.,28.,dist)) + smoothstep(5.,28.,dist);
   float wet=1.-smoothstep(.10,.42,vWorld.y);base*=1.-wet*.22;roughness-=wet*.25;reflectivity+=wet*.16;
  }
  if(uWater>12.5){gl_FragColor=vec4(mix(uColor,uFog,1.-exp(-dist*.0016)),1.);return;}
  if(uWater>7.5&&uWater<8.5)base*=.985+sin(vLocal.x*190.)*sin(vLocal.y*180.)*.009;
  float skyReflection=pow(1.-max(dot(n,eye),0.),4.);
  vec3 color=base*(hemi+diffuse*.42);
  vec3 reflectionRay=reflect(-eye,n);
  vec3 reflected=environment(reflectionRay);
  // A broad sky reflection keeps a small helmet visor legible without noisy panorama aliasing.
  if(uWater>9.5&&uWater<10.5){
   reflected=mix(vec3(.055,.12,.18),uFog*.80,smoothstep(-.14,.65,reflectionRay.y));
   reflected+=vec3(.21,.27,.30)*pow(max(0.,1.-abs(reflectionRay.y-.11)*3.),12.);
  }
  color=mix(color,reflected,reflectivity*(.35+skyReflection*.65));
  float highlight=pow(max(dot(n,normalize(light+eye)),0.),mix(150.,9.,roughness));
  color+=vec3(1.,.97,.87)*highlight*specular*(1.-uWeather.y*.58-uWeather.z*.34);
  color*=.87+.13*smoothstep(.10,.52,vWorld.y);
  float fog=1.-exp(-dist*.0016);gl_FragColor=vec4(mix(color,uFog,fog),1.);return;
 }
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
// v97 hull and rig. Geometry is original, reusable and independent of race simulation.
function smoothMesh(rows,cols,point,normal){const a=[];function v(i,j){const p=point(i/rows,j/cols),n=normal?normal(i/rows,j/cols):unit(p);a.push(...p,...n);}for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){v(i,j);v(i+1,j);v(i+1,j+1);v(i,j);v(i+1,j+1);v(i,j+1);}return a;}
function smoothSphere(rows=16,cols=10){return smoothMesh(rows,cols,(u,v)=>[Math.cos(u*Math.PI*2)*Math.sin(v*Math.PI),Math.cos(v*Math.PI),Math.sin(u*Math.PI*2)*Math.sin(v*Math.PI)]);}
function smoothNormals(data){const sums=new Map(),key=(i)=>data.slice(i,i+3).map(x=>x.toFixed(5)).join(',');for(let i=0;i<data.length;i+=6){const k=key(i),n=sums.get(k)||[0,0,0];for(let c=0;c<3;c++)n[c]+=data[i+3+c];sums.set(k,n);}for(let i=0;i<data.length;i+=6){const n=unit(sums.get(key(i)));for(let c=0;c<3;c++)data[i+3+c]=n[c];}return data;}
// Catmull-Rom loft samples keep the original end stations and collision envelope.
function loftRows(rows,steps=3){const out=[];for(let i=0;i<rows.length-1;i++)for(let j=0;j<steps;j++){const t=j/steps,a=rows[Math.max(0,i-1)],b=rows[i],c=rows[i+1],d=rows[Math.min(rows.length-1,i+2)];out.push(b.map((v,k)=>.5*((2*v)+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t)));}out.push(rows.at(-1));return out;}
function roundedBoxMesh(radius=.22,steps=5){const out=[];for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const u=(axis+1)%3,v=(axis+2)%3;const part=smoothMesh(steps,steps,(a,b)=>{const p=[0,0,0];p[axis]=sign;p[u]=a*2-1;p[v]=b*2-1;const core=p.map(x=>R.clamp(x,-1+radius,1-radius)),n=unit(sub(p,core));return p.map((_,k)=>core[k]+n[k]*radius);},(a,b)=>{const p=[0,0,0];p[axis]=sign;p[u]=a*2-1;p[v]=b*2-1;return unit(sub(p,p.map(x=>R.clamp(x,-1+radius,1-radius))));});out.push(...part);}return out;}
function latheProfile(rows,steps=32){const out=[];for(let j=0;j<rows.length-1;j++){const a=rows[j],b=rows[j+1],slope=(a[1]-b[1])/Math.max(.0001,b[0]-a[0]);for(let i=0;i<steps;i++){const v=(row,k)=>{const angle=k*Math.PI*2/steps,n=unit([Math.cos(angle),slope,Math.sin(angle)]);out.push(Math.cos(angle)*row[1],row[0],Math.sin(angle)*row[1],...n);};v(a,i);v(b,i);v(b,i+1);v(a,i);v(b,i+1);v(a,i+1);}}return smoothNormals(out);}
function deckOne(){const m=meshBuilder(),rect=(x1,x2,z1,z2)=>m.quad([x1,0,z1],[x1,0,z2],[x2,0,z2],[x2,0,z1]);rect(-.5,-.34,-.30,.32);rect(-.34,.5,-.055,.13);m.quad([.10,0,-.29],[.28,0,-.055],[.5,0,-.055],[.31,0,-.29]);return m.data;}
function hullShell(){const m=meshBuilder(),stations=loftRows([[-2.1,.76,.34],[-1.8,.92,.40],[-1.1,1.02,.43],[.0,1.02,.45],[.8,.96,.43],[1.6,.79,.38],[2.3,.52,.32],[2.75,.42,.30],[3.15,.25,.28]]),section=([x,w,h])=>[[x,h,-w*.92],[x,h*.78,-w],[x,.06,-w*.90],[x,-.07,-w*.58],[x,-.10,0],[x,-.07,w*.58],[x,.06,w*.9],[x,h*.78,w],[x,h,w*.92]];
 for(let i=0;i<stations.length-1;i++){const a=section(stations[i]),b=section(stations[i+1]);for(let j=0;j<a.length-1;j++)m.quad(a[j],b[j],b[j+1],a[j+1]);}const a=section(stations[0]),b=section(stations[stations.length-1]);for(let j=1;j<a.length-1;j++){m.tri(a[0],a[j],a[j+1]);m.tri(b[0],b[j+1],b[j]);}return smoothNormals(m.data);}
function foreDeck(trim=false){const m=meshBuilder(),rows=loftRows([[.42,.94,.48],[.8,.96,.49],[1.2,.89,.46],[1.6,.79,.43],[2,.65,.38],[2.3,.52,.35],[2.6,.453,.345],[2.75,.42,.34],[3.15,.25,.31]]);
 const point=(r,u)=>[r[0],r[2]+.018-.035*Math.pow(Math.abs(u),1.5),r[1]*u*.92];if(trim){for(let i=0;i<rows.length-1;i++)for(const side of [-1,1]){const p=(r,u)=>{const a=point(r,u);a[1]+=.005;return a;};m.quad(p(rows[i],side*.86),p(rows[i],side*.995),p(rows[i+1],side*.995),p(rows[i+1],side*.86));}const d=smoothNormals(m.data);for(let i=0;i<d.length;i+=6)if(d[i+4]<0){d[i+3]*=-1;d[i+4]*=-1;d[i+5]*=-1;}return d;}for(let i=0;i<rows.length-1;i++)for(let j=0;j<8;j++){const u=-1+j/4,v=u+.25;m.quad(point(rows[i],u),point(rows[i],v),point(rows[i+1],v),point(rows[i+1],u));}return smoothNormals(m.data);}
function wingDeck(){const m=meshBuilder(),rows=[[-2.06,.7],[-1.7,.90],[-1.1,.94],[0,.94],[.42,.89]];for(let i=0;i<rows.length-1;i++){const a=rows[i],b=rows[i+1];m.quad([a[0],.47,.55],[a[0],.455,a[1]],[b[0],.455,b[1]],[b[0],.47,.55]);}return smoothNormals(m.data);}
function torsoMesh(){const m=meshBuilder(),rows=[[-1,.70,.72],[-.7,.90,.88],[.15,1,.98],[.60,.98,1],[.85,.72,.77],[1,.45,.52]],pt=(r,a)=>[Math.cos(a)*r[1],r[0],Math.sin(a)*r[2]];for(let i=0;i<rows.length-1;i++)for(let j=0;j<12;j++){const a=j*Math.PI/6,b=(j+1)*Math.PI/6;m.quad(pt(rows[i],a),pt(rows[i+1],a),pt(rows[i+1],b),pt(rows[i],b));}const d=smoothNormals(m.data);for(let i=0;i<d.length;i+=6){if(d[i]*d[i+3]+d[i+2]*d[i+5]<0){d[i+3]*=-1;d[i+4]*=-1;d[i+5]*=-1;}}return d;}
function helmetSealMesh(){return smoothMesh(24,1,(u,v)=>{const a=u*Math.PI*2,y=-.34+v*.08,r=Math.sqrt(1-y*y);return [Math.cos(a)*r,y,Math.sin(a)*r];});}
function visorMesh(){return smoothMesh(18,7,(u,v)=>{const a=(u-.5)*2.40,b=-.25+v*.63;return [Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b)];});}
function helmetStripe(){return smoothMesh(16,2,(u,v)=>{const a=-.38+u*2.66,z=(v-.5)*.22;return [Math.cos(a)*Math.sqrt(1-z*z),Math.sin(a)*Math.sqrt(1-z*z),z];});}
function wheelMesh(){const m=meshBuilder(),n=24,k=6;for(let i=0;i<n;i++)for(let j=0;j<k;j++){const p=(a,b)=>[Math.sin(b)*.08,Math.cos(a)*(1+Math.cos(b)*.08),Math.sin(a)*(1+Math.cos(b)*.08)];m.quad(p(i*2*Math.PI/n,j*2*Math.PI/k),p((i+1)*2*Math.PI/n,j*2*Math.PI/k),p((i+1)*2*Math.PI/n,(j+1)*2*Math.PI/k),p(i*2*Math.PI/n,(j+1)*2*Math.PI/k));}return smoothNormals(m.data);}
// v116: a low hydroplane with an open, raised cockpit coaming. These meshes
// share boat coordinates (+X bow, +Y up); they never change the collision hull.
const COAMING=[[-1.83,.54,.76,.79,.88],[-1.25,.58,.83,.94,1.05],[-.44,.57,.85,1.06,1.15],[.12,.49,.80,1.08,1.08],[.46,.29,.67,.96,1.00],[.65,0,.52,.78,.95],[1.43,0,.26,.48,.73]];
const COAMING_SAMPLES=loftRows(COAMING,4).map(r=>[r[0],Math.max(0,r[1]),r[2],r[3],r[4]]);
function coamingMesh(kind='shell',lightweight=false){
 const m=meshBuilder(),rows=lightweight?COAMING:COAMING_SAMPLES;
 for(const side of [-1,1])for(let i=0;i<rows.length-1;i++){
  const a=rows[i],b=rows[i+1],quad=(...pts)=>m.quad(...(side===-1?pts.reverse():pts));
  const edge=(r,t)=>[r[0],.465+(r[3]-.465)*t,side*(r[4]+(r[2]-r[4])*t)];
  if(kind==='shell'){
   // Colour panels replace this middle band rather than fighting a coplanar surface.
   for(const [lo,hi] of [[0,.12],[.83,1]])quad(edge(a,lo),edge(b,lo),edge(b,hi),edge(a,hi));
   quad([a[0],a[3],side*a[1]],edge(a,1),edge(b,1),[b[0],b[3],side*b[1]]);
  }else if(kind==='livery')quad(edge(a,.12),edge(b,.12),edge(b,.83),edge(a,.83));
  else if(a[1]||b[1]){const p=(r,y)=>[r[0],r[3]-y,side*r[1]];quad(p(a,.012),p(b,.012),p(b,.32),p(a,.32));}
 }
 return smoothNormals(m.data);
}
function coamingZ(x,y){
 let i=0;while(i<COAMING_SAMPLES.length-2&&COAMING_SAMPLES[i+1][0]<x)i++;
 const a=COAMING_SAMPLES[i],b=COAMING_SAMPLES[i+1],t=R.clamp((x-a[0])/(b[0]-a[0]),0,1),r=a.map((v,k)=>v+(b[k]-v)*t),u=R.clamp((y-.465)/(r[3]-.465),0,1);
 return r[4]+(r[2]-r[4])*u;
}
function sideMarkMesh(source,side,number=false){
 const out=[];
 for(let i=0;i<source.length;i+=6){const x=-.65+side*source[i+2]*(number?.39:.56),y=.755+source[i]*(number?.32:.40),z=side*(coamingZ(x,y)+(number?.022:.009));out.push(x,y,z,0,.460129,side*.887852);}
 return out;
}
function tailoredMesh(rows,steps=14,detail=2){
 const m=meshBuilder(),stations=detail===1?rows:loftRows(rows,detail),pt=(r,a)=>[Math.cos(a)*r[1],r[0],Math.sin(a)*r[2]];
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<steps;j++){const a=j*Math.PI*2/steps,b=(j+1)*Math.PI*2/steps;m.quad(pt(stations[i],a),pt(stations[i+1],a),pt(stations[i+1],b),pt(stations[i],b));}
 for(const [r,flip] of [[stations[0],true],[stations.at(-1),false]])for(let j=0;j<steps;j++){const a=pt(r,j*Math.PI*2/steps),b=pt(r,(j+1)*Math.PI*2/steps);m.tri([0,r[0],0],flip?b:a,flip?a:b);}
 const out=smoothNormals(m.data);for(let i=0;i<out.length;i+=6)if(out[i]*out[i+3]+out[i+2]*out[i+5]<0){out[i+3]*=-1;out[i+4]*=-1;out[i+5]*=-1;}return out;
}
const HELMET_ROWS=[[-1,.53,-.43,.44],[-.79,.86,-.73,.72],[-.42,1.06,-.93,.93],[.10,.94,-1,.99],[.55,.70,-.84,.84],[.88,.33,-.52,.50],[1,-.04,-.15,.035]];
function helmetPoint(y,a,offset=0){
 const rows=HELMET_ROWS;let i=0;while(i<rows.length-2&&rows[i+1][0]<y)i++;
 const r=rows[i],s=rows[i+1],t=R.clamp((y-r[0])/(s[0]-r[0]),0,1),front=r[1]+(s[1]-r[1])*t,back=r[2]+(s[2]-r[2])*t,width=r[3]+(s[3]-r[3])*t;
 return [(front+back)/2+Math.cos(a)*((front-back)/2+offset),y,Math.sin(a)*(width+offset)];
}
function raceHelmet(kind='shell',steps=24){
 const m=meshBuilder(),rows=kind==='shell'?loftRows(HELMET_ROWS,2).map(r=>r[0]):kind==='visor'?[-.27,-.12,.08,.28,.42]:kind==='seal'?[-.31,-.27,.42,.46]:[-.97,-.83,-.66];
 const arc=kind==='visor'||kind==='seal'?2.48:Math.PI*2;
 for(let i=0;i<rows.length-1;i++){
  if(kind==='seal'&&i===1)continue;
  for(let j=0;j<steps;j++){
   const a=(j/steps-.5)*arc,b=((j+1)/steps-.5)*arc,offset=kind==='shell'?0:kind==='visor'?.065:.055;
   m.quad(helmetPoint(rows[i],a,offset),helmetPoint(rows[i+1],a,offset),helmetPoint(rows[i+1],b,offset),helmetPoint(rows[i],b,offset));
  }
 }
 return smoothNormals(m.data);
}
function pennantMesh(){const m=meshBuilder(),p=(x,y)=>[x,y,Math.sin(x*9)*.026];m.tri(p(0,.04),p(-.68,.20),p(0,.37));return m.data;}
function rotation(x=0,y=0,z=0){const c=Math.cos,s=Math.sin,rx=new Float32Array([1,0,0,0,0,c(x),s(x),0,0,-s(x),c(x),0,0,0,0,1]),ry=model(0,0,0,y),rz=new Float32Array([c(z),s(z),0,0,-s(z),c(z),0,0,0,0,1,0,0,0,0,1]);return multiply(multiply(ry,rx),rz);}
function normalVector(m,n){const a=m[0]*m[0]+m[1]*m[1]+m[2]*m[2]||1,b=m[4]*m[4]+m[5]*m[5]+m[6]*m[6]||1,c=m[8]*m[8]+m[9]*m[9]+m[10]*m[10]||1,x=n[0]/a,y=n[1]/b,z=n[2]/c;let nx=m[0]*x+m[4]*y+m[8]*z,ny=m[1]*x+m[5]*y+m[9]*z,nz=m[2]*x+m[6]*y+m[10]*z;const l=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;return [nx/l,ny/l,nz/l];}
function segmentMatrix(a,b,rx,rz){const y=unit(sub(b,a)),x=unit(cross(y,[0,0,1])),z=cross(x,y),len=Math.hypot(...sub(b,a))*.5;return new Float32Array([x[0]*rx,x[1]*rx,x[2]*rx,0,y[0]*len,y[1]*len,y[2]*len,0,z[0]*rz,z[1]*rz,z[2]*rz,0,(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5,1]);}
function racerPose(n,motion=true,time=0){
 const turn=R.clamp((n.steer||0)*.8+(n.yawRate||0)*.24,-1,1),speed=R.clamp(n.speed/23,0,1),posture=R.clamp(Number(n.posture)||0,-1,1),lean=turn*(.19+Math.max(0,posture)*.065),breathe=motion?Math.sin(time*2.3+n.frame)*.008:0;
 return {turn,lean,speed,posture,hip:[-1.02,.72+Math.max(0,posture)*.035,lean*.30],shoulder:[-.34+speed*.05-posture*.13,1.22+posture*.17-speed*.04+breathe,lean],head:[.02+speed*.06-posture*.16,1.64+posture*.19-speed*.04+breathe,lean*1.18],heel:motion?R.clamp(n.heel||0,-.65,.65)*.14:0,pitch:motion?speed*.014:0};
}
const BM={paint:7,fabric:8,metal:9,glass:10,wood:11,buoy:12,decal:13};
const BOAT_PALETTE={white:rgb('#edf0eb'),wood:rgb('#c58a45'),rubber:rgb('#151b21'),steel:rgb('#b6c2c5'),dark:rgb('#26313b'),stitch:rgb('#d4dddf')};
function boatScene(n,d,settings,emit){
 const time=settings.motion===false?0:d.elapsed,pose=racerPose(n,settings.motion!==false,time),p=BOAT_PALETTE,color=rgb(COLORS[n.frame-1]),ink=n.frame===1||n.frame===5?p.rubber:p.white;
 const bob=settings.motion===false?0:Math.sin(time*3+n.frame)*.018,base=multiply(model(n.x,.035+bob,n.z,n.heading),rotation(pose.heel,0,pose.pitch));
 let layer=0;const part=(key,m,c,material=BM.paint)=>emit(key,multiply(base,m),c,material,{x:n.x,z:n.z,layer:layer++});
 const add=(key,x,y,z,sx,sy,sz,c,material=BM.paint,rot=null)=>part(key,rot?multiply(model(x,y,z),multiply(rot,model(0,0,0,0,sx,sy,sz))):model(x,y,z,0,sx,sy,sz),c,material);
 const seg=(a,b,rx,rz,c,material=BM.fabric,key=null)=>part(key||(rx<.07?'thin':'sleeve'),segmentMatrix(a,b,rx,rz),c,material);
 if(n.capsized){part('shell',multiply(rotation(Math.PI,0,0),model(0,-.16,0,0,1,.84,1.14)),p.wood,BM.wood);return;}
 const viewer=d.boats?.find(b=>b.isPlayer),distance=viewer?Math.hypot(n.x-viewer.x,n.z-viewer.z):0,lod=n.isPlayer?0:distance>(settings.lightweight?46:70)?2:distance>(settings.lightweight?18:32)?1:0;
 // Broad, shallow wooden hull, sealed deck and a raised open cockpit.
 add('shell',0,.065,0,1,.84,1.14,p.wood,BM.wood);
 add('deck',0,-.005,0,1,1,1.14,p.white);
 add('deckTrim',0,-.002,0,1,1,1.14,p.rubber,BM.fabric);
 for(const side of [-1,1])add('wing',0,0,0,1,1,side*1.14,p.wood,BM.wood);
 add('box',-.72,.25,0,.90,.055,.58,p.rubber,BM.fabric);
 part('coaming',identity(),p.white);part('coamingInside',identity(),p.rubber,BM.fabric);part('livery',identity(),color);
 // Upright side plates. +X of each glyph is its top; both sides read normally.
 if(lod<2)for(const side of [-1,1]){
  part('sidePlate'+(side===1?'R':'L'),identity(),p.white,BM.decal);
  part('sideDigit'+n.frame+(side===1?'R':'L'),identity(),p.rubber,BM.decal);
 }
 // Bow pennant repeats the jacket colour above the deck.
 seg([2.51,.34,0],[2.51,1.05,0],.016,.016,p.steel,BM.metal);
 add('pennant',2.50,.66,0,1,1,1,color,BM.fabric,rotation(0,settings.motion===false?0:Math.sin(time*7+n.frame)*.12,0));
 // Exposed racing outboard: alloy powerhead, black airbox, tank and drive leg.
 add('rounded',-2.02,.53,0,.18,.21,.32,p.steel,BM.metal);
 add('rounded',-2.18,.78,0,.27,.23,.27,p.steel,BM.metal);
 add('rounded',-2.17,1.005,0,.35,.085,.34,p.steel,BM.metal);
 add('rounded',-2.38,.77,.12,.14,.17,.24,p.rubber,BM.fabric);
 add('rounded',-2.17,.09,0,.075,.37,.085,p.steel,BM.metal);
 if(lod===0){
  add('rounded',-2.10,1.104,-.10,.062,.027,.068,p.rubber,BM.fabric);
  for(let i=0;i<4;i++)add('box',-2.06,.65+i*.075,-.275,.17,.012,.015,p.dark,BM.metal);
  for(const side of [-1,1]){
   add('rounded',-1.89,.40,side*.31,.17,.047,.055,p.steel,BM.metal);
   seg([-1.81,.39,side*.32],[-2.05,.69,side*.32],.025,.025,p.steel,BM.metal);
   seg([-2.27,.67,side*.22],[-1.63,.42,side*.49],.015,.015,p.rubber,BM.fabric);
   // Soft bow rim and fine rub rail separate the livery from the waterline.
   seg([-1.82,.36,side*.98],[.62,.37,side*1.01],.028,.024,p.rubber,BM.fabric);
   seg([.62,.37,side*1.01],[2.58,.29,side*.47],.023,.020,p.rubber,BM.fabric);
  }
  add('rounded',3.10,.285,0,.10,.086,.275,p.white);
  add('box',-1.77,.49,0,.12,.04,.60,p.wood,BM.wood);
 }
 const hands=[[.21,.84,-.40],[.02,.68,.47]],shoulder=pose.shoulder,hip=pose.hip;
 if(!n.isPlayer){
  // Folded knees and fitted trousers support the low racing posture.
  if(lod<2)for(const side of [-1,1]){
   seg([hip[0]+.09,hip[1]-.12,hip[2]+side*.23],[-.27,.39,side*.34],.175,.17,p.dark,BM.fabric,'trouser');
   seg([-.27,.37,side*.34],[-1.23,.30,side*.39],.11,.12,p.dark,BM.fabric,'sleeve');
   add('rounded',-1.39,.31,side*.39,.22,.10,.125,p.rubber,BM.fabric);
  }
  part('jacket',segmentMatrix(hip,shoulder,.265,.355),color,BM.fabric);
  // Dark stretch insert follows the same anatomy; no external sphere joints.
  if(lod<2){
   const backA=[hip[0]-.14,hip[1]+.19,hip[2]],backB=[shoulder[0]-.17,shoulder[1]+.22,shoulder[2]];
   seg(backA,backB,.036,.255,p.dark,BM.fabric,'jacket');
   if(lod===0){
    const up=unit(sub(shoulder,hip)),back=unit([-up[1],up[0],0]),mid=hip.map((v,k)=>(v+shoulder[k])*.5+back[k]*.306);
    const mark=(size,offset)=>new Float32Array([up[0]*size,up[1]*size,up[2]*size,0,back[0],back[1],0,0,0,0,size,0,mid[0]+back[0]*offset,mid[1]+back[1]*offset,mid[2],1]);
    part('flat',mark(.41,0),p.white,BM.decal);part('digit'+n.frame,mark(.29,.007),p.rubber,BM.decal);
   }
   for(const side of [-1,1])seg([hip[0]-.16,hip[1]+.13,hip[2]+side*.23],[shoulder[0]-.17,shoulder[1]+.14,shoulder[2]+side*.25],.012,.013,p.stitch);
   for(const side of [-1,1]){
    const joint=[shoulder[0]-.025,shoulder[1]-.08,shoulder[2]+side*.295],elbow=[-.14+pose.posture*.05,.95+pose.posture*.055,side*.47+pose.lean*.55],hand=hands[side===-1?0:1];
    seg(joint,elbow,.115,.115,color,BM.fabric,'sleeve');seg(elbow,hand,.088,.091,p.dark,BM.fabric,'sleeve');
    if(lod===0)seg([joint[0]-.065,joint[1]+.035,joint[2]],[elbow[0]-.063,elbow[1]+.035,elbow[2]],.018,.014,p.stitch);
   }
  }
  const head=pose.head,hr=rotation(-pose.turn*.07,pose.turn*.17,-.08-pose.speed*.05);
  seg([shoulder[0]+.09,shoulder[1]+.09,shoulder[2]],[head[0]-.12,head[1]-.24,head[2]],.105,.12,p.rubber,BM.fabric);
  add(lod===2?'raceHelmetLow':'raceHelmet',...head,.31,.34,.29,color,BM.paint,hr);
  add('raceVisor',...head,.31,.34,.29,rgb('#132e39'),BM.glass,hr);
  if(lod===0){
   add('raceSeal',...head,.31,.34,.29,p.rubber,BM.fabric,hr);
   add('chinBand',...head,.311,.34,.291,p.white,BM.paint,hr);
   for(const side of [-1,1])add('softLow',head[0]-.026,head[1]+.05,head[2]+side*.286,.026,.026,.011,p.steel,BM.metal);
  }
 }
 if(lod===2)return;
 // Wheel and throttle are visible in the first-person cockpit; arms stay low.
 const steer=pose.turn*.42;
 add('wheel',.27,.81,-.16,.235,.235,.235,p.rubber,BM.fabric,rotation(steer,0,-.32));
 if(lod===0){
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3+steer;seg([.27,.81,-.16],[.27,.81+Math.cos(a)*.20,-.16+Math.sin(a)*.20],.012,.012,p.steel,BM.metal);}
  add('rounded',.25,.81,-.16,.045,.045,.045,p.steel,BM.metal);
  seg([-.21,.43,.48],[.07,.69,.47],.022,.025,p.steel,BM.metal);
  if(n.isPlayer)for(const side of [-1,1]){
   const hand=hands[side===-1?0:1];seg([-.48,.44,side*.48],hand,.10,.105,color,BM.fabric,'sleeve');
   seg([hand[0]-.13,hand[1]-.13,hand[2]],[hand[0]-.065,hand[1]-.065,hand[2]],.096,.095,p.dark,BM.fabric,'sleeve');
  }
 }
 for(const hand of hands){add('rounded',...hand,.102,.057,.077,p.rubber,BM.fabric);if(lod===0){add('rounded',hand[0]+.005,hand[1]+.046,hand[2],.068,.012,.057,p.stitch,BM.fabric);for(let i=0;i<3;i++)add('box',hand[0]+.025,hand[1]+.059,hand[2]+(i-1)*.024,.023,.003,.006,p.dark,BM.fabric);}}
}

/* Deck digit outline notice.
Fonts are (c) Bitstream (see below). DejaVu changes are in public domain.
Glyphs imported from Arev fonts are (c) Tavmjong Bah (see below)

Bitstream Vera Fonts Copyright
------------------------------

Copyright (c) 2003 by Bitstream, Inc. All Rights Reserved. Bitstream Vera is
a trademark of Bitstream, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of the fonts accompanying this license ("Fonts") and associated
documentation files (the "Font Software"), to reproduce and distribute the
Font Software, including without limitation the rights to use, copy, merge,
publish, distribute, and/or sell copies of the Font Software, and to permit
persons to whom the Font Software is furnished to do so, subject to the
following conditions:

The above copyright and trademark notices and this permission notice shall
be included in all copies of one or more of the Font Software typefaces.

The Font Software may be modified, altered, or added to, and in particular
the designs of glyphs or characters in the Fonts may be modified and
additional glyphs or characters may be added to the Fonts, only if the fonts
are renamed to names not containing either the words "Bitstream" or the word
"Vera".

This License becomes null and void to the extent applicable to Fonts or Font
Software that has been modified and is distributed under the "Bitstream
Vera" names.

The Font Software may be sold as part of a larger software package but no
copy of one or more of the Font Software typefaces may be sold by itself.

THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT,
TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL BITSTREAM OR THE GNOME
FOUNDATION BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING
ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE
FONT SOFTWARE.

Except as contained in this notice, the names of Gnome, the Gnome
Foundation, and Bitstream Inc., shall not be used in advertising or
otherwise to promote the sale, use or other dealings in this Font Software
without prior written authorization from the Gnome Foundation or Bitstream
Inc., respectively. For further information, contact: fonts at gnome dot
org. 

Arev Fonts Copyright
------------------------------

Copyright (c) 2006 by Tavmjong Bah. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining
a copy of the fonts accompanying this license ("Fonts") and
associated documentation files (the "Font Software"), to reproduce
and distribute the modifications to the Bitstream Vera Font Software,
including without limitation the rights to use, copy, merge, publish,
distribute, and/or sell copies of the Font Software, and to permit
persons to whom the Font Software is furnished to do so, subject to
the following conditions:

The above copyright and trademark notices and this permission notice
shall be included in all copies of one or more of the Font Software
typefaces.

The Font Software may be modified, altered, or added to, and in
particular the designs of glyphs or characters in the Fonts may be
modified and additional glyphs or characters may be added to the
Fonts, only if the fonts are renamed to names not containing either
the words "Tavmjong Bah" or the word "Arev".

This License becomes null and void to the extent applicable to Fonts
or Font Software that has been modified and is distributed under the 
"Tavmjong Bah Arev" names.

The Font Software may be sold as part of a larger software package but
no copy of one or more of the Font Software typefaces may be sold by
itself.

THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL
TAVMJONG BAH BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

Except as contained in this notice, the name of Tavmjong Bah shall not
be used in advertising or otherwise to promote the sale, use or other
dealings in this Font Software without prior written authorization
from Tavmjong Bah. For further information, contact: tavmjong @ free
. fr.

$Id: LICENSE 2133 2007-11-28 02:46:28Z lechimp $

*/
const digitGeometry={"digit1":[-0.5,0,-0.367017,0,1,0,-0.321903,0,-0.103836,0,1,0,-0.321903,0,-0.33144,0,1,0,-0.321903,0,0.367017,0,1,0,-0.321903,0,0.140699,0,1,0,-0.5,0,0.33294,0,1,0,-0.5,0,0.33294,0,1,0,-0.321903,0,-0.103836,0,1,0,-0.5,0,-0.367017,0,1,0,-0.5,0,0.33294,0,1,0,-0.321903,0,0.140699,0,1,0,-0.321903,0,-0.103836,0,1,0,-0.321903,0,-0.103836,0,1,0,-0.321903,0,0.140699,0,1,0,0.324475,0,0.021539,0,1,0,0.5,0,0.054329,0,1,0,0.451779,0,-0.18742,0,1,0,0.324475,0,0.021539,0,1,0,0.324475,0,0.021539,0,1,0,0.451779,0,-0.18742,0,1,0,0.276254,0,-0.22171,0,1,0,0.324475,0,0.021539,0,1,0,0.5,0,0.299293,0,1,0,0.5,0,0.054329,0,1,0],"digit2":[-0.5,0,-0.426,0,1,0,-0.5,0,0.287263,0,1,0,-0.313895,0,-0.103684,0,1,0,-0.312421,0,-0.389158,0,1,0,-0.313895,0,-0.103684,0,1,0,0.002737,0,0.028526,0,1,0,-0.5,0,-0.426,0,1,0,-0.313895,0,-0.103684,0,1,0,-0.312421,0,-0.389158,0,1,0,0.002737,0,0.028526,0,1,0,-0.313895,0,-0.103684,0,1,0,-0.129684,0,0.141789,0,1,0,0.271,0,-0.192789,0,1,0,0.434947,0,-0.242421,0,1,0,0.226316,0,-0.284526,0,1,0,0.302316,0,-0.110842,0,1,0,0.434947,0,-0.242421,0,1,0,0.271,0,-0.192789,0,1,0,0.258526,0,0.426,0,1,0,0.358579,0,0.404421,0,1,0,0.261684,0,0.159526,0,1,0,0.261684,0,0.159526,0,1,0,0.358579,0,0.404421,0,1,0,0.435158,0,0.339684,0,1,0,-0.313895,0,0.323263,0,1,0,-0.313895,0,-0.103684,0,1,0,-0.5,0,0.287263,0,1,0,0.463579,0,-0.153789,0,1,0,0.434947,0,-0.242421,0,1,0,0.302316,0,-0.110842,0,1,0,0.002737,0,0.028526,0,1,0,-0.129684,0,0.141789,0,1,0,0.055684,0,0.088789,0,1,0,0.055684,0,0.088789,0,1,0,-0.129684,0,0.141789,0,1,0,-0.009211,0,0.289158,0,1,0,-0.009211,0,0.289158,0,1,0,0.109263,0,0.132737,0,1,0,0.055684,0,0.088789,0,1,0,0.5,0,0.103684,0,1,0,0.495947,0,0.018947,0,1,0,0.326947,0,0.028526,0,1,0,0.083579,0,0.373368,0,1,0,0.166789,0,0.412842,0,1,0,0.213895,0,0.168737,0,1,0,0.258526,0,0.426,0,1,0,0.261684,0,0.159526,0,1,0,0.213895,0,0.168737,0,1,0,0.213895,0,0.168737,0,1,0,0.166789,0,0.412842,0,1,0,0.258526,0,0.426,0,1,0,0.320789,0,-0.037474,0,1,0,0.463579,0,-0.153789,0,1,0,0.302316,0,-0.110842,0,1,0,0.483789,0,-0.066842,0,1,0,0.463579,0,-0.153789,0,1,0,0.320789,0,-0.037474,0,1,0,0.320789,0,-0.037474,0,1,0,0.495947,0,0.018947,0,1,0,0.483789,0,-0.066842,0,1,0,0.320789,0,-0.037474,0,1,0,0.326947,0,0.028526,0,1,0,0.495947,0,0.018947,0,1,0,0.297263,0,0.131895,0,1,0,0.483789,0,0.237632,0,1,0,0.5,0,0.103684,0,1,0,0.435158,0,0.339684,0,1,0,0.483789,0,0.237632,0,1,0,0.297263,0,0.131895,0,1,0,0.297263,0,0.131895,0,1,0,0.261684,0,0.159526,0,1,0,0.435158,0,0.339684,0,1,0,0.083579,0,0.373368,0,1,0,0.213895,0,0.168737,0,1,0,0.162368,0,0.159737,0,1,0,-0.009211,0,0.289158,0,1,0,0.083579,0,0.373368,0,1,0,0.162368,0,0.159737,0,1,0,0.162368,0,0.159737,0,1,0,0.109263,0,0.132737,0,1,0,-0.009211,0,0.289158,0,1,0,0.5,0,0.103684,0,1,0,0.326947,0,0.028526,0,1,0,0.319526,0,0.087632,0,1,0,0.319526,0,0.087632,0,1,0,0.297263,0,0.131895,0,1,0,0.5,0,0.103684,0,1,0],"digit3":[0.378279,0,0.400589,0,1,0,0.274788,0,0.1651,0,1,0,0.284342,0,0.421194,0,1,0,0.378279,0,0.400589,0,1,0,0.445672,0,0.338773,0,1,0,0.274788,0,0.1651,0,1,0,0.5,0,0.093369,0,1,0,0.306445,0,0.13427,0,1,0,0.486418,0,0.236315,0,1,0,0.274788,0,0.1651,0,1,0,0.445672,0,0.338773,0,1,0,0.486418,0,0.236315,0,1,0,0.486418,0,0.236315,0,1,0,0.306445,0,0.13427,0,1,0,0.274788,0,0.1651,0,1,0,-0.086139,0,0.347191,0,1,0,-0.179818,0,0.11258,0,1,0,-0.154617,0,0.357364,0,1,0,-0.154617,0,0.357364,0,1,0,-0.179818,0,0.11258,0,1,0,-0.297872,0,0.325656,0,1,0,-0.407457,0,0.230531,0,1,0,-0.297872,0,0.325656,0,1,0,-0.241841,0,0.096674,0,1,0,-0.297872,0,0.325656,0,1,0,-0.179818,0,0.11258,0,1,0,-0.241841,0,0.096674,0,1,0,0.332266,0,0.015286,0,1,0,0.489672,0,-0.052882,0,1,0,0.328703,0,-0.042088,0,1,0,0.300558,0,-0.170109,0,1,0,0.458686,0,-0.203057,0,1,0,0.276699,0,-0.238587,0,1,0,0.104524,0,0.046633,0,1,0,0.095332,0,-0.044206,0,1,0,-0.071938,0,0.003615,0,1,0,0.489672,0,-0.052882,0,1,0,0.332266,0,0.015286,0,1,0,0.497418,0,0.020657,0,1,0,0.328703,0,-0.042088,0,1,0,0.489672,0,-0.052882,0,1,0,0.476761,0,-0.127401,0,1,0,-0.497005,0,-0.200372,0,1,0,-0.5,0,-0.118364,0,1,0,-0.33082,0,-0.123528,0,1,0,-0.473043,0,-0.35189,0,1,0,-0.290229,0,-0.324416,0,1,0,-0.452076,0,-0.421194,0,1,0,-0.488019,0,-0.278248,0,1,0,-0.312435,0,-0.259244,0,1,0,-0.473043,0,-0.35189,0,1,0,-0.473043,0,-0.35189,0,1,0,-0.312435,0,-0.259244,0,1,0,-0.290229,0,-0.324416,0,1,0,-0.452076,0,-0.421194,0,1,0,-0.290229,0,-0.324416,0,1,0,-0.26038,0,-0.384425,0,1,0,0.124045,0,0.363974,0,1,0,0.175325,0,0.160607,0,1,0,0.070543,0,0.295239,0,1,0,0.175325,0,0.160607,0,1,0,0.124045,0,0.363974,0,1,0,0.23146,0,0.175377,0,1,0,0.23146,0,0.175377,0,1,0,0.124045,0,0.363974,0,1,0,0.19624,0,0.406889,0,1,0,0.284342,0,0.421194,0,1,0,0.274788,0,0.1651,0,1,0,0.23146,0,0.175377,0,1,0,0.23146,0,0.175377,0,1,0,0.19624,0,0.406889,0,1,0,0.284342,0,0.421194,0,1,0,-0.33082,0,-0.123528,0,1,0,-0.5,0,-0.118364,0,1,0,-0.320595,0,-0.025873,0,1,0,-0.5,0,-0.118364,0,1,0,-0.476864,0,0.079891,0,1,0,-0.320595,0,-0.025873,0,1,0,0.070543,0,0.295239,0,1,0,0.175325,0,0.160607,0,1,0,0.038525,0,0.203057,0,1,0,0.325811,0,0.084074,0,1,0,0.306445,0,0.13427,0,1,0,0.5,0,0.093369,0,1,0,0.5,0,0.093369,0,1,0,0.497418,0,0.020657,0,1,0,0.325811,0,0.084074,0,1,0,0.325811,0,0.084074,0,1,0,0.497418,0,0.020657,0,1,0,0.332266,0,0.015286,0,1,0,0.328703,0,-0.042088,0,1,0,0.476761,0,-0.127401,0,1,0,0.318013,0,-0.104317,0,1,0,0.458686,0,-0.203057,0,1,0,0.300558,0,-0.170109,0,1,0,0.318013,0,-0.104317,0,1,0,0.318013,0,-0.104317,0,1,0,0.476761,0,-0.127401,0,1,0,0.458686,0,-0.203057,0,1,0,-0.064759,0,-0.081595,0,1,0,-0.071938,0,0.003615,0,1,0,0.095332,0,-0.044206,0,1,0,-0.064759,0,-0.081595,0,1,0,0.095332,0,-0.14873,0,1,0,-0.064759,0,-0.180335,0,1,0,0.095332,0,-0.044206,0,1,0,0.095332,0,-0.14873,0,1,0,-0.064759,0,-0.081595,0,1,0,0.104524,0,0.046633,0,1,0,-0.071938,0,0.003615,0,1,0,-0.093472,0,0.064243,0,1,0,-0.093472,0,0.064243,0,1,0,0.038525,0,0.203057,0,1,0,0.104524,0,0.046633,0,1,0,-0.326224,0,-0.191334,0,1,0,-0.497005,0,-0.200372,0,1,0,-0.33082,0,-0.123528,0,1,0,-0.488019,0,-0.278248,0,1,0,-0.497005,0,-0.200372,0,1,0,-0.326224,0,-0.191334,0,1,0,-0.326224,0,-0.191334,0,1,0,-0.312435,0,-0.259244,0,1,0,-0.488019,0,-0.278248,0,1,0,-0.289919,0,0.048957,0,1,0,-0.320595,0,-0.025873,0,1,0,-0.476864,0,0.079891,0,1,0,-0.289919,0,0.048957,0,1,0,-0.476864,0,0.079891,0,1,0,-0.407457,0,0.230531,0,1,0,-0.407457,0,0.230531,0,1,0,-0.241841,0,0.096674,0,1,0,-0.289919,0,0.048957,0,1,0,0.104524,0,0.046633,0,1,0,0.038525,0,0.203057,0,1,0,0.132101,0,0.116298,0,1,0,0.132101,0,0.116298,0,1,0,0.038525,0,0.203057,0,1,0,0.175325,0,0.160607,0,1,0,0.038525,0,0.203057,0,1,0,-0.093472,0,0.064243,0,1,0,-0.129415,0,0.100496,0,1,0,0.013065,0,0.26792,0,1,0,0.038525,0,0.203057,0,1,0,-0.129415,0,0.100496,0,1,0,-0.129415,0,0.100496,0,1,0,-0.029436,0,0.31667,0,1,0,0.013065,0,0.26792,0,1,0,-0.129415,0,0.100496,0,1,0,-0.179818,0,0.11258,0,1,0,-0.086139,0,0.347191,0,1,0,-0.086139,0,0.347191,0,1,0,-0.029436,0,0.31667,0,1,0,-0.129415,0,0.100496,0,1,0],"digit4":[0.280326,0,0.130626,0,1,0,0.5,0,0.417167,0,1,0,0.5,0,0.123768,0,1,0,0.5,0,0.123768,0,1,0,-0.096871,0,-0.39252,0,1,0,0.280326,0,0.130626,0,1,0,-0.130947,0,0.293292,0,1,0,0.280326,0,0.130626,0,1,0,-0.130947,0,0.0494,0,1,0,-0.130947,0,0.293292,0,1,0,-0.317831,0,0.40045,0,1,0,-0.130947,0,0.436027,0,1,0,-0.130947,0,-0.225139,0,1,0,0.280326,0,0.130626,0,1,0,-0.096871,0,-0.39252,0,1,0,-0.130947,0,-0.225139,0,1,0,-0.096871,0,-0.39252,0,1,0,-0.317831,0,-0.436027,0,1,0,-0.317831,0,0.40045,0,1,0,-0.130947,0,0.293292,0,1,0,-0.317831,0,0.257715,0,1,0,-0.317831,0,0.257715,0,1,0,-0.130947,0,0.293292,0,1,0,-0.130947,0,0.0494,0,1,0,-0.317831,0,0.014038,0,1,0,-0.5,0,-0.022182,0,1,0,-0.5,0,0.222353,0,1,0,-0.5,0,0.222353,0,1,0,-0.317831,0,0.257715,0,1,0,-0.317831,0,0.014038,0,1,0,-0.317831,0,0.014038,0,1,0,-0.317831,0,0.257715,0,1,0,-0.130947,0,0.0494,0,1,0,-0.130947,0,0.0494,0,1,0,-0.130947,0,-0.225139,0,1,0,-0.317831,0,0.014038,0,1,0,-0.317831,0,0.014038,0,1,0,-0.130947,0,-0.225139,0,1,0,-0.317831,0,-0.436027,0,1,0],"digit5":[-0.003311,0,0.021074,0,1,0,0.178789,0,0.054656,0,1,0,0.177686,0,0.023176,0,1,0,-0.273597,0,0.061804,0,1,0,-0.471673,0,0.08971,0,1,0,-0.386693,0,0.243641,0,1,0,0.5,0,0.424427,0,1,0,0.5,0,-0.20433,0,1,0,0.313958,0,-0.03868,0,1,0,-0.471673,0,0.08971,0,1,0,-0.273597,0,0.061804,0,1,0,-0.314274,0,-0.010984,0,1,0,-0.276855,0,-0.313696,0,1,0,-0.235758,0,-0.385537,0,1,0,-0.434833,0,-0.424427,0,1,0,0.5,0,0.424427,0,1,0,0.313958,0,-0.03868,0,1,0,0.313958,0,0.38827,0,1,0,0.162182,0,-0.06832,0,1,0,0.313958,0,-0.03868,0,1,0,0.5,0,-0.20433,0,1,0,-0.008304,0,-0.171116,0,1,0,0.162182,0,-0.06832,0,1,0,-0.026225,0,-0.238228,0,1,0,0.5,0,-0.20433,0,1,0,-0.051818,0,-0.311331,0,1,0,-0.026225,0,-0.238228,0,1,0,-0.026225,0,-0.238228,0,1,0,0.162182,0,-0.06832,0,1,0,0.5,0,-0.20433,0,1,0,-0.2109,0,0.108629,0,1,0,-0.273597,0,0.061804,0,1,0,-0.386693,0,0.243641,0,1,0,-0.386693,0,0.243641,0,1,0,-0.253311,0,0.341707,0,1,0,-0.2109,0,0.108629,0,1,0,-0.327833,0,-0.104478,0,1,0,-0.322262,0,-0.174795,0,1,0,-0.5,0,-0.110994,0,1,0,-0.322262,0,-0.174795,0,1,0,-0.495953,0,-0.192033,0,1,0,-0.5,0,-0.110994,0,1,0,-0.5,0,-0.110994,0,1,0,-0.314274,0,-0.010984,0,1,0,-0.327833,0,-0.104478,0,1,0,-0.471673,0,0.08971,0,1,0,-0.314274,0,-0.010984,0,1,0,-0.5,0,-0.110994,0,1,0,-0.483813,0,-0.270759,0,1,0,-0.495953,0,-0.192033,0,1,0,-0.322262,0,-0.174795,0,1,0,-0.031217,0,0.076939,0,1,0,0.178789,0,0.054656,0,1,0,-0.003311,0,0.021074,0,1,0,-0.031217,0,0.076939,0,1,0,0.161604,0,0.188564,0,1,0,0.178789,0,0.054656,0,1,0,0.110048,0,0.289678,0,1,0,-0.074732,0,0.112413,0,1,0,0.028116,0,0.353216,0,1,0,0.161604,0,0.188564,0,1,0,-0.031217,0,0.076939,0,1,0,0.110048,0,0.289678,0,1,0,0.110048,0,0.289678,0,1,0,-0.031217,0,0.076939,0,1,0,-0.074732,0,0.112413,0,1,0,0.028116,0,0.353216,0,1,0,-0.074732,0,0.112413,0,1,0,-0.080198,0,0.374396,0,1,0,-0.003311,0,0.021074,0,1,0,0.177686,0,0.023176,0,1,0,0.174375,0,-0.008198,0,1,0,-0.003311,0,0.021074,0,1,0,0.174375,0,-0.008198,0,1,0,0.005991,0,-0.051923,0,1,0,-0.30555,0,-0.244061,0,1,0,-0.483813,0,-0.270759,0,1,0,-0.322262,0,-0.174795,0,1,0,-0.13128,0,0.124238,0,1,0,-0.2109,0,0.108629,0,1,0,-0.253311,0,0.341707,0,1,0,-0.253311,0,0.341707,0,1,0,-0.080198,0,0.374396,0,1,0,-0.13128,0,0.124238,0,1,0,-0.13128,0,0.124238,0,1,0,-0.080198,0,0.374396,0,1,0,-0.074732,0,0.112413,0,1,0,-0.463475,0,-0.347856,0,1,0,-0.276855,0,-0.313696,0,1,0,-0.434833,0,-0.424427,0,1,0,-0.463475,0,-0.347856,0,1,0,-0.30555,0,-0.244061,0,1,0,-0.276855,0,-0.313696,0,1,0,-0.483813,0,-0.270759,0,1,0,-0.30555,0,-0.244061,0,1,0,-0.463475,0,-0.347856,0,1,0,0.002417,0,-0.10926,0,1,0,0.162182,0,-0.06832,0,1,0,-0.008304,0,-0.171116,0,1,0,0.002417,0,-0.10926,0,1,0,0.005991,0,-0.051923,0,1,0,0.162182,0,-0.06832,0,1,0,0.162182,0,-0.06832,0,1,0,0.005991,0,-0.051923,0,1,0,0.169224,0,-0.038785,0,1,0,0.169224,0,-0.038785,0,1,0,0.005991,0,-0.051923,0,1,0,0.174375,0,-0.008198,0,1,0],"digit6":[-0.294206,0,-0.380861,0,1,0,-0.221132,0,-0.158851,0,1,0,-0.143049,0,-0.403429,0,1,0,-0.334435,0,-0.095177,0,1,0,-0.476709,0,-0.204142,0,1,0,-0.5,0,-0.058046,0,1,0,-0.215193,0,0.106899,0,1,0,-0.386181,0,0.241686,0,1,0,-0.256094,0,0.329064,0,1,0,0.108345,0,-0.363561,0,1,0,0.091407,0,-0.128486,0,1,0,0.219841,0,-0.315431,0,1,0,-0.221132,0,-0.158851,0,1,0,-0.294206,0,-0.380861,0,1,0,-0.272206,0,-0.151622,0,1,0,-0.272206,0,-0.151622,0,1,0,-0.294206,0,-0.380861,0,1,0,-0.406837,0,-0.313158,0,1,0,-0.28269,0,0.071266,0,1,0,-0.471545,0,0.1085,0,1,0,-0.386181,0,0.241686,0,1,0,-0.386181,0,0.241686,0,1,0,-0.215193,0,0.106899,0,1,0,-0.28269,0,0.071266,0,1,0,0.395579,0,-0.166701,0,1,0,0.272568,0,-0.038215,0,1,0,0.453522,0,-0.068168,0,1,0,0.195053,0,-0.097862,0,1,0,0.272568,0,-0.038215,0,1,0,0.395579,0,-0.166701,0,1,0,0.195053,0,-0.097862,0,1,0,0.219841,0,-0.315431,0,1,0,0.091407,0,-0.128486,0,1,0,0.091407,0,-0.128486,0,1,0,-0.064966,0,-0.111754,0,1,0,-0.019417,0,-0.057994,0,1,0,-0.143049,0,-0.403429,0,1,0,-0.221132,0,-0.158851,0,1,0,-0.13427,0,-0.147077,0,1,0,0.5,0,0.16918,0,1,0,0.48838,0,0.043948,0,1,0,0.337224,0,0.156166,0,1,0,-0.476709,0,-0.204142,0,1,0,-0.334435,0,-0.095177,0,1,0,-0.310576,0,-0.129932,0,1,0,-0.406837,0,-0.313158,0,1,0,-0.476709,0,-0.204142,0,1,0,-0.310576,0,-0.129932,0,1,0,-0.310576,0,-0.129932,0,1,0,-0.272206,0,-0.151622,0,1,0,-0.406837,0,-0.313158,0,1,0,-0.471545,0,0.1085,0,1,0,-0.28269,0,0.071266,0,1,0,-0.327463,0,0.017507,0,1,0,-0.5,0,-0.058046,0,1,0,-0.471545,0,0.1085,0,1,0,-0.327463,0,0.017507,0,1,0,0.48838,0,0.043948,0,1,0,0.453522,0,-0.068168,0,1,0,0.32106,0,0.047562,0,1,0,0.32106,0,0.047562,0,1,0,0.453522,0,-0.068168,0,1,0,0.272568,0,-0.038215,0,1,0,0.337224,0,0.156166,0,1,0,0.48838,0,0.043948,0,1,0,0.32106,0,0.047562,0,1,0,0.314708,0,-0.251188,0,1,0,0.195053,0,-0.097862,0,1,0,0.395579,0,-0.166701,0,1,0,0.219841,0,-0.315431,0,1,0,0.195053,0,-0.097862,0,1,0,0.314708,0,-0.251188,0,1,0,-0.014305,0,-0.393462,0,1,0,-0.13427,0,-0.147077,0,1,0,-0.064966,0,-0.111754,0,1,0,-0.014305,0,-0.393462,0,1,0,0.091407,0,-0.128486,0,1,0,0.108345,0,-0.363561,0,1,0,-0.014305,0,-0.393462,0,1,0,-0.064966,0,-0.111754,0,1,0,0.091407,0,-0.128486,0,1,0,-0.143049,0,-0.403429,0,1,0,-0.13427,0,-0.147077,0,1,0,-0.014305,0,-0.393462,0,1,0,0.305309,0,0.313881,0,1,0,0.280417,0,0.368519,0,1,0,0.458686,0,0.403429,0,1,0,0.33366,0,0.208428,0,1,0,0.5,0,0.16918,0,1,0,0.337224,0,0.156166,0,1,0,0.497418,0,0.22893,0,1,0,0.5,0,0.16918,0,1,0,0.33366,0,0.208428,0,1,0,0.476761,0,0.345022,0,1,0,0.305309,0,0.313881,0,1,0,0.458686,0,0.403429,0,1,0,0.32297,0,0.26069,0,1,0,0.305309,0,0.313881,0,1,0,0.476761,0,0.345022,0,1,0,0.085416,0,0.282586,0,1,0,-0.077412,0,0.11165,0,1,0,0.005474,0,0.339289,0,1,0,0.005474,0,0.339289,0,1,0,-0.077412,0,0.11165,0,1,0,-0.093886,0,0.35819,0,1,0,-0.093886,0,0.35819,0,1,0,-0.077412,0,0.11165,0,1,0,-0.132101,0,0.118777,0,1,0,-0.132101,0,0.118777,0,1,0,-0.215193,0,0.106899,0,1,0,-0.256094,0,0.329064,0,1,0,-0.256094,0,0.329064,0,1,0,-0.093886,0,0.35819,0,1,0,-0.132101,0,0.118777,0,1,0,-0.037286,0,0.090271,0,1,0,-0.077412,0,0.11165,0,1,0,0.085416,0,0.282586,0,1,0,0.085416,0,0.282586,0,1,0,0.138246,0,0.196344,0,1,0,-0.037286,0,0.090271,0,1,0,-0.342388,0,-0.049163,0,1,0,-0.334435,0,-0.095177,0,1,0,-0.5,0,-0.058046,0,1,0,-0.5,0,-0.058046,0,1,0,-0.327463,0,0.017507,0,1,0,-0.342388,0,-0.049163,0,1,0,-0.004235,0,0.009089,0,1,0,0.15188,0,0.030004,0,1,0,0.13995,0,-0.024995,0,1,0,0.32297,0,0.26069,0,1,0,0.476761,0,0.345022,0,1,0,0.489672,0,0.287131,0,1,0,0.497418,0,0.22893,0,1,0,0.33366,0,0.208428,0,1,0,0.489672,0,0.287131,0,1,0,0.489672,0,0.287131,0,1,0,0.33366,0,0.208428,0,1,0,0.32297,0,0.26069,0,1,0,-0.012497,0,0.055825,0,1,0,0.138246,0,0.196344,0,1,0,0.155856,0,0.088411,0,1,0,-0.012497,0,0.055825,0,1,0,-0.037286,0,0.090271,0,1,0,0.138246,0,0.196344,0,1,0,-0.012497,0,0.055825,0,1,0,0.15188,0,0.030004,0,1,0,-0.004235,0,0.009089,0,1,0,0.155856,0,0.088411,0,1,0,0.15188,0,0.030004,0,1,0,-0.012497,0,0.055825,0,1,0,0.091407,0,-0.128486,0,1,0,-0.019417,0,-0.057994,0,1,0,0.119965,0,-0.077412,0,1,0,0.119965,0,-0.077412,0,1,0,-0.019417,0,-0.057994,0,1,0,-0.004235,0,0.009089,0,1,0,-0.004235,0,0.009089,0,1,0,0.13995,0,-0.024995,0,1,0,0.119965,0,-0.077412,0,1,0]};
const G={roundedLow:roundedBoxMesh(.22,2),coamingLow:coamingMesh("shell",true),coamingInsideLow:coamingMesh("inside",true),liveryLow:coamingMesh("livery",true),jacketLow:tailoredMesh([[-1,.68,.73],[-.7,.91,.86],[.28,1,.97],[.68,.95,1],[.93,.69,.74],[1,.46,.55]],10,1),sleeveLow:tailoredMesh([[-1,.72,.72],[-.8,.98,.95],[-.2,1,1],[.55,.81,.83],[1,.63,.69]],8,1),trouserLow:tailoredMesh([[-1,.68,.76],[-.7,.95,1],[.1,1,.94],[.72,.80,.77],[1,.64,.66]],8,1),coaming:coamingMesh(),coamingInside:coamingMesh("inside"),livery:coamingMesh("livery"),pennant:pennantMesh(),jacket:tailoredMesh([[-1,.68,.73],[-.7,.91,.86],[.28,1,.97],[.68,.95,1],[.93,.69,.74],[1,.46,.55]]),sleeve:tailoredMesh([[-1,.72,.72],[-.8,.98,.95],[-.2,1,1],[.55,.81,.83],[1,.63,.69]],10),trouser:tailoredMesh([[-1,.68,.76],[-.7,.95,1],[.1,1,.94],[.72,.80,.77],[1,.64,.66]],10),raceHelmet:raceHelmet(),raceHelmetLow:raceHelmet("shell",12),raceVisor:raceHelmet("visor",24),raceSeal:raceHelmet("seal",24),chinBand:raceHelmet("chin",24),...digitGeometry,digit1:deckOne(),rounded:roundedBoxMesh(),thin:smoothNormals(frustumMesh(1,1,-1,1,6)),softTiny:smoothSphere(6,4),helmetLow:smoothSphere(12,8),torso:torsoMesh(),helmetSeal:helmetSealMesh(),shell:hullShell(),deck:foreDeck(),deckTrim:foreDeck(true),wing:wingDeck(),soft:smoothSphere(),softLow:smoothSphere(8,5),helmet:smoothSphere(24,14),visor:visorMesh(),helmetStripe:helmetStripe(),wheel:wheelMesh(),box:boxMesh(),hull:hullMesh(),cone:coneMesh(),sphere:sphereMesh(),flat:planeMesh(1),slash:slashMesh(),stripe:stripeMesh(),
water:planeMesh(900,1),shore:ringMesh(90,235,.12),edge:ringMesh(87,90,.32),rope:ringMesh(R.C.inner-.06,R.C.inner+.06,.04),mountain:mountainMesh(270,0),farHill:mountainMesh(340,2),
buoy1:latheProfile([[0,.88],[.07,.98],[.22,1],[.44,.94],[.67,.835],[.9,.72]]),buoy2:latheProfile([[.9,.72],[1.15,.61],[1.4,.51],[1.65,.405],[1.9,.30]]),buoy3:latheProfile([[1.9,.30],[2.15,.207],[2.4,.12],[2.63,.045],[2.68,.01]]),buoyCollar:latheProfile([[0,.93],[.035,1.10],[.11,1.13],[.18,1.06],[.205,.97]]),buoyBand:latheProfile([[.895,.729],[.924,.716]]),float:frustumMesh(1,1,0,.16)};
for(const side of [-1,1]){const suffix=side===1?'R':'L';G['sidePlate'+suffix]=sideMarkMesh(planeMesh(1,8),side);for(let frame=1;frame<=6;frame++)G['sideDigit'+frame+suffix]=sideMarkMesh(G['digit'+frame],side,true);}
const distantSphere=sphereMesh(8,4);
const P={ink:rgb('#133346'),white:rgb('#fff5df'),foam:rgb('#e0fff4'),aqua:rgb('#49c5c2'),water:rgb('#137f9d'),steel:rgb('#87a9af'),red:rgb('#ee664e')};
const segs={1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg'};
function camera(d,width,height,motion,thrill=false){const b=R.own(d),fx=Math.cos(b.heading),fz=Math.sin(b.heading),t=motion?d.elapsed:0,bob=motion?Math.sin(t*4.3)*Math.min(.09,b.speed*.0015+b.wakeLoad*.05):0,roll=motion?b.heel*.16:0;
const eye=[b.x-fx*.75,1.65+(motion?R.clamp(Number(b.posture)||0,-1,1)*.12:0)+bob,b.z-fz*.75],up=[-fz*Math.sin(roll),Math.cos(roll),fx*Math.sin(roll)],view=lookAt(eye,[eye[0]+fx*24,eye[1]-.72,eye[2]+fz*24],up);
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

function buoyScene(x,z,time,settings,emit){
 const moving=settings.motion!==false,bob=moving?Math.sin(time*1.8+x)*.034:0,lean=moving?Math.sin(time*1.15+x)*.020:0;
 const base=multiply(model(x,.035+bob,z),rotation(lean,0,lean*.7));
 const part=(key,m,color,material=BM.buoy)=>emit(key,multiply(base,m),color,material);
 part('buoyCollar',identity(),rgb('#4b3736'));
 part('buoy1',model(0,.13,0),rgb('#c84227'));
 part('buoy2',model(0,.13,0),rgb('#edeee2'));
 part('buoy3',model(0,.13,0),rgb('#d94428'));
 part('buoyBand',model(0,.13,0),rgb('#bdbeb3'));
 if(settings.motion!==false)emit('flat',model(x,.045,z,0,3.15,1,3.15),[.14,1,1],5);
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
for(const side of [-1,1])buoyScene(side*(R.C.halfStraight+R.C.inner),0,time,settings,emit);
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
for(const n of d.boats){
 emit('flat',model(n.x,.021,n.z,n.heading,6.9,1,2.9),[.44,1,1],6);boatScene(n,d,settings,emit);
 if(n.speed>3&&!n.capsized){const fx=Math.cos(n.heading),fz=Math.sin(n.heading);
 for(let i=0;i<3;i++){const tail=2.7+i*1.55;emit('flat',model(n.x-fx*tail,.052,n.z-fz*tail,n.heading,3.8,1,1.4+i*.45),[R.clamp(n.speed/24,.15,.9)*(1-i*.16),1,1],5);}
 if(settings.motion!==false)for(let i=0;i<8;i++){const age=(time*1.7+i*.137)%1,side=i%2?1:-1,scale=(1-age)*.065,x=.1-age*(2+n.speed*.18),z=side*(.90+age*1.8);add('sphere',n.x+x*fx-z*fz,.18+Math.sin(age*Math.PI)*(.25+n.speed*.022),n.z+x*fz+z*fx,n.heading,scale*2,scale,scale,P.foam);}
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
function emit(key,m,col,water=0){if(drawCamera&&water!==2&&key!=='water'&&!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const v=drawCamera.view,x=v[0]*m[12]+v[4]*m[13]+v[8]*m[14]+v[12],y=v[1]*m[12]+v[5]*m[13]+v[9]*m[14]+v[13],z=-(v[2]*m[12]+v[6]*m[13]+v[10]*m[14]+v[14]),radius=Math.max(Math.hypot(m[0],m[2]),Math.abs(m[5]),Math.hypot(m[8],m[10]))*(['hull','stripe','shell','deck','deckTrim','wing','coaming','coamingInside','livery'].includes(key)||key.startsWith('side')?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(z+radius<.14||Math.abs(x)-radius>Math.max(0,z+radius)*width/(2*drawCamera.focal)||Math.abs(y)-radius>Math.max(0,z+radius)*height/(2*drawCamera.focal))return;}let g=meshes[key];if(!g||g.source!==G[key]){const buffer=g?g.buffer:gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(G[key]),gl.STATIC_DRAW);g=meshes[key]={buffer,count:G[key].length/6,source:G[key]};}gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(uniforms.Model,false,m);gl.uniform3fv(uniforms.Color,col);gl.uniform1f(uniforms.Water,water);if(water===5||water===6){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}gl.drawArrays(gl.TRIANGLES,0,g.count);if(water===5||water===6){gl.depthMask(true);gl.disable(gl.BLEND);}}
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
// The Canvas fallback uses a small software depth buffer for solid geometry.
// Average-depth polygon sorting tears the cockpit and numbers at close range.
function createDepthPainter(){
 let layer=null,context=null,pixels=null,depth=null,width=0,height=0;
 function draw(ctx,commands,w,h){
  const targetW=Math.max(1,Math.round(w)),targetH=Math.max(1,Math.round(h));
  if(!layer){layer=root.OffscreenCanvas?new root.OffscreenCanvas(targetW,targetH):root.document.createElement('canvas');context=layer.getContext('2d');}
  if(width!==targetW||height!==targetH){width=targetW;height=targetH;layer.width=width;layer.height=height;pixels=context.createImageData(width,height);depth=new Float32Array(width*height);}
  pixels.data.fill(0);depth.fill(0);const rgba=pixels.data;
  function triangle(a,b,c,za,zb,zc,color){
   const determinant=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(determinant)<.00001)return;
   const left=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),right=Math.min(width-1,Math.ceil(Math.max(a[0],b[0],c[0]))),top=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),bottom=Math.min(height-1,Math.ceil(Math.max(a[1],b[1],c[1])));
   const ax=(b[1]-c[1])/determinant,ay=(c[0]-b[0])/determinant,bx=(c[1]-a[1])/determinant,by=(a[0]-c[0])/determinant,ia=1/za,ib=1/zb,ic=1/zc;
   for(let y=top;y<=bottom;y++){
    let u=ax*(left+.5-c[0])+ay*(y+.5-c[1]),v=bx*(left+.5-c[0])+by*(y+.5-c[1]);
    for(let x=left;x<=right;x++,u+=ax,v+=bx){if(u<-.00001||v<-.00001||u+v>1.00001)continue;const d=u*ia+v*ib+(1-u-v)*ic,index=y*width+x;if(d<=depth[index])continue;depth[index]=d;const p=index*4;rgba[p]=color[0];rgba[p+1]=color[1];rgba[p+2]=color[2];rgba[p+3]=255;}
   }
  }
  for(const cmd of commands){if(!cmd.polygon)continue;const color=cmd.fill.match(/[\d.]+/g).map(Number),p=cmd.polygon,z=cmd.z;for(let i=1;i<p.length-1;i++)triangle(p[0],p[i],p[i+1],z[0],z[i],z[i+1],color);}
  context.putImageData(pixels,0,0);ctx.drawImage(layer,0,0,w,h);
 }
 return {draw};
}
function createCanvas(canvas){
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('この環境では水面を描画できません。観戦モードをご利用ください。');
let width=1,height=1,view=identity(),focal=1,disposed=false,painted=0;const waterPainter=createWaterPainter(),depthPainter=createDepthPainter();
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
function emit(key,m,col,material=0,anchor=null){if(material===5||material===6){const points=[[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]].map(([x,z])=>cameraPoint([m[0]*x+m[8]*z+m[12],m[13],m[2]*x+m[10]*z+m[14]]));if(points.some(p=>p[2]<.25))return;const quad=points.map(screen);if(quad.every(p=>p[0]<0)||quad.every(p=>p[0]>width)||quad.every(p=>p[1]<0)||quad.every(p=>p[1]>height))return;commands.push({quad,shadow:material===6,alpha:col[0],depth:points.reduce((n,p)=>n+p[2],0)/4});return;}const center=cameraPoint([m[12],m[13],m[14]]),data=key==='sphere'&&center[2]>16?distantSphere:key==='soft'||key==='softLow'?G.softTiny:key==='helmet'?(center[2]>23?G.softLow:G.helmetLow):key==='raceHelmet'?G.raceHelmetLow:['rounded','coaming','coamingInside','livery','jacket','sleeve','trouser'].includes(key)?G[key+'Low']:G[key];
if(!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const radius=Math.max(Math.hypot(m[0],m[1],m[2]),Math.hypot(m[4],m[5],m[6]),Math.hypot(m[8],m[9],m[10]))*(['hull','stripe','shell','deck','deckTrim','wing','coaming','coamingInside','livery'].includes(key)||key.startsWith('side')?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(center[2]+radius<.16||Math.abs(center[0])-radius>Math.max(0,center[2]+radius)*width/(2*focal)||Math.abs(center[1])-radius>Math.max(0,center[2]+radius)*height/(2*focal))return;}

const world=[m[12],m[13],m[14]],eye=unit(sub(cam.eye,world)),half=unit([eye[0]-.4,eye[1]+.88,eye[2]+.28]);
for(let i=0;i<data.length;i+=18){const points=[];for(let k=0;k<3;k++){const j=i+k*6,x=data[j],y=data[j+1],z=data[j+2];points.push(cameraPoint([m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]]));}
const clipped=clipNear(points);if(clipped.length<3)continue;const depth=clipped.reduce((v,p)=>v+p[2],0)/clipped.length;if(depth>600)continue;const polygon=clipped.map(screen);
if(polygon.every(p=>p[0]<-2)||polygon.every(p=>p[0]>width+2)||polygon.every(p=>p[1]<-2)||polygon.every(p=>p[1]>height+2))continue;
const normal=[0,1,2].map(c=>(data[i+3+c]+data[i+9+c]+data[i+15+c])/3),n=normalVector(m,normal);
if(anchor&&key!=='pennant'){const nv=[view[0]*n[0]+view[4]*n[1]+view[8]*n[2],view[1]*n[0]+view[5]*n[1]+view[9]*n[2],-(view[2]*n[0]+view[6]*n[1]+view[10]*n[2])],mid=[0,1,2].map(k=>points.reduce((sum,p)=>sum+p[k],0)/3);if(dot(nv,mid)>.001)continue;}
const lit=-n[0]*.4+n[1]*.88+n[2]*.28,unlit=material===3||material===4;
let fill;if(material===BM.decal){fill=color(col,pal.fog,depth);}else if(material>=7){
 const power=material===8?25:material===9?120:material===10?140:material===11?65:95,spec=material===8?.035:material===9?.50:material===10?.65:.19;
 const shine=Math.pow(Math.max(0,dot(n,half)),power)*spec*(pal.rain?.42:pal.cloud?.66:1),facing=1-Math.max(0,dot(n,eye)),reflect=(material===10?.52:material===9?.26:.04)*(.35+Math.pow(facing,4)*.65),light=.47+.20*n[1]+Math.max(0,lit)*.42;
 const painted=col.map((v,c)=>(v*light*(1-reflect)+pal.fog[c]*reflect+shine*[1,.97,.87][c])*(.87+.13*R.clamp((world[1]-.10)/.42,0,1)));fill=color(painted,pal.fog,depth);
}else fill=unlit?color(col,col,0):color(col,pal.fog,depth,lit>.5?1:lit>-.15?.82:.61);
commands.push({polygon,z:clipped.map(p=>p[2]),depth,fill});
}

}
scene(d,r,{...settings,paintedSky,lightweight:true},emit);commands.sort((a,b)=>b.depth-a.depth);
for(const c of commands)if(c.quad)waterPainter.drawFoam(ctx,c);
depthPainter.draw(ctx,commands,width,height);
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


const API={buoyScene,deckOne,boatScene,racerPose,normalVector,BM,identity,rotation,weatherVector,waterNormal,geometry:G,panoramaU,audience,crowdFor,create,createWebGL,createCanvas,freshCanvas,clipNear,COLORS,vertex,fragment,multiply,perspective,lookAt,model,point:R.pointAt,boxMesh,hullMesh,coneMesh,planeMesh,ringMesh,scene,camera,sphereMesh,frustumMesh};
root.KM_RACE_RENDERER=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);



