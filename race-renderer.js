/* v94 — Original cel-shaded water sport art; one shared scene for WebGL and Canvas. */
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
varying mediump vec3 vWorld;varying mediump vec3 vNormal;
void main(){vec4 p=uModel*vec4(aPosition,1.0);
if(uWater>0.5&&uWater<1.5)p.y+=sin(p.x*.19+p.z*.12+uTime)*.06;
if(uWater>3.5)p.y+=sin(p.x*.31+p.z*.13+uTime*2.8)*.045;
vWorld=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uVP*p;}`;
const fragment=`precision mediump float;
uniform sampler2D uSky;uniform float uSkyReady;
uniform vec3 uColor;uniform vec3 uEye;uniform vec3 uFog;uniform mediump float uTime;uniform mediump float uWater;
varying mediump vec3 vWorld;varying mediump vec3 vNormal;
void main(){
vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.4,.88,.28));
float sun=dot(n,light);float shade=sun>.5?1.0:sun>-.15?.82:.61;
vec3 color=uColor*shade;float dist=length(vWorld-uEye);
if(uWater>2.5){gl_FragColor=vec4(uColor,1.);return;}
if(uWater>1.5&&uSkyReady>.5){vec3 ray=normalize((vWorld-uEye)*.002);float angle=atan(ray.y,length(ray.xz));float longitude=fract(atan(ray.z,ray.x)/6.2831853+.5);vec2 uv=vec2(1.-abs(2.*longitude-1.),clamp(.095+angle*.9,0.,1.));vec3 painted=texture2D(uSky,uv).rgb;gl_FragColor=vec4(mix(painted,vec3(.31,.44,.56),(1.-step(.65,uFog.r))*.6),1.);return;}
if(uWater>1.5){float height=clamp((vWorld.y-uEye.y)/230.,0.,1.);color=mix(uFog,vec3(.15,.47,.75),height);gl_FragColor=vec4(color,1.);return;}
if(uWater>.5){
vec2 p=vWorld.xz;float wave=sin(p.x*.43+p.y*.22+sin(p.y*.37+uTime*.6)*.75+uTime*1.4);
float wave2=sin(p.y*.64-p.x*.21-uTime*.85);
float bands=(wave*.5+.5)*.035+(wave2*.5+.5)*.02;
vec3 eye=normalize(uEye-vWorld);float fresnel=pow(1.-max(eye.y,0.),4.);
color=mix(uColor+vec3(bands*.28,bands,bands),uFog,fresnel*.58);
float foam=smoothstep(.962,.994,wave)*smoothstep(.25,.65,wave2);
float glint=smoothstep(.990,.999,sin(p.x*2.7+p.y*.55+uTime)*sin(p.y*2.1-uTime*1.2));
float close=1.-smoothstep(35.,130.,dist);
color=mix(color,vec3(.82,.97,.94),foam*.60*close+glint*.40*close);
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
water:planeMesh(900,25),shore:ringMesh(90,235,.12),edge:ringMesh(87,90,.32),rope:ringMesh(R.C.inner-.06,R.C.inner+.06,.04),mountain:mountainMesh(270,0),farHill:mountainMesh(340,2),
buoy1:frustumMesh(1,.70,0,.9),buoy2:frustumMesh(.70,.37,.9,1.9),buoy3:frustumMesh(.37,.01,1.9,2.9),float:frustumMesh(1,1,0,.16)};
const distantSphere=sphereMesh(8,4);
const P={ink:rgb('#133346'),white:rgb('#fff5df'),foam:rgb('#e0fff4'),aqua:rgb('#49c5c2'),water:rgb('#137f9d'),steel:rgb('#87a9af'),red:rgb('#ee664e')};
const segs={1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg'};
function camera(d,width,height,motion,thrill=false){const b=R.own(d),fx=Math.cos(b.heading),fz=Math.sin(b.heading),t=motion?d.elapsed:0,bob=motion?Math.sin(t*4.3)*Math.min(.09,b.speed*.0015+b.wakeLoad*.05):0,roll=motion?b.heel*.16:0;
const eye=[b.x-fx*.25,1.65+bob,b.z-fz*.25],up=[-fz*Math.sin(roll),Math.cos(roll),fx*Math.sin(roll)],view=lookAt(eye,[eye[0]+fx*24,eye[1]-.72,eye[2]+fz*24],up);
const fov=80+(motion&&thrill?R.clamp((b.speed*3.6-52)/5,0,6):0);
return {eye,view,vp:multiply(perspective(fov*Math.PI/180,width/height,.14,650),view),focal:height/(2*Math.tan(fov*.5*Math.PI/180))};}
function palette(r){const rain=r.env.weather==='雨',cloud=r.env.weather==='曇り';return {fog:rgb(rain?'#9db9c7':cloud?'#b6d3df':'#b9e5ef'),water:rgb(rain?'#337c92':cloud?'#268eaa':'#138eaf'),rain};}
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
 add('sphere',x,.012,0,0,1.75,.01,1.65,rgb('#136a84'));
 add('float',x,.02,0,0,1.25,1,1.25,P.ink);
 for(const [key,col] of [['buoy1',P.red],['buoy2',P.white],['buoy3',P.red]])add(key,x,.12+bob,0,0,1,1,1,col);
}
const gx=R.pointAt(R.C.start).x;
for(let j=0;j<16;j++)add('flat',gx,.045,R.C.inner+(j+.5)*(R.C.outer-R.C.inner)/16,0,1.5,1,(R.C.outer-R.C.inner)/16,j%2?P.white:P.ink);
for(const z of [R.C.inner-2,R.C.outer+2]){add('box',gx,4,z,0,.11,4,.11,P.white);add('box',gx,7.2,z,0,.13,.7,.5,P.red);}
if(settings.guide!==false)for(let i=1;i<=12;i++){const p=R.pointAt(R.C.start+player.progress+i*8);add('slash',p.x,.07,p.z,p.heading,1.25,1,.22,rgb('#ffd17f'));}
// Expanding, tapering ribbons along the actual physical wake trail.
for(const w of d.wakes){const age=d.elapsed-w.t;if(age>4.5||Math.hypot(w.x-player.x,w.z-player.z)>110)continue;
 const heading=Math.atan2(w.fz,w.fx),spread=.9+age*1.35,col=age<1.2?P.foam:age<2.7?rgb('#8ce5dc'):rgb('#43b4bd');
 for(const side of [-1,1])add('slash',w.x-w.fz*spread*side,.065,w.z+w.fx*spread*side,heading+side*.10,2.8,1,1.5*(1-age/5),col);
}
for(const n of d.boats){const color=rgb(COLORS[n.frame-1]),bob=Math.sin(time*3+n.frame)*.028;
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
 if(n.speed>3){for(let i=0;i<5;i++){const tail=2.5+i*1.4;local('slash',-tail,.075,Math.sin(i)*.25,1.4,1,.7+i*.18,i%2?P.aqua:P.foam);}
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
const uniforms={};['Model','VP','Color','Eye','Fog','Time','Water','Sky','SkyReady'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,'u'+k));
const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);gl.enable(gl.DEPTH_TEST);
const meshes={};for(const [key,data]of Object.entries(G)){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);meshes[key]={buffer,count:data.length/6,source:data};}
const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([170,215,230,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(uniforms.Sky,0);
let width=1,height=1,vp=identity(),drawCamera=null,disposed=false,skyReady=false;
function emit(key,m,col,water=0){if(drawCamera&&water!==2&&key!=='water'&&!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const v=drawCamera.view,x=v[0]*m[12]+v[4]*m[13]+v[8]*m[14]+v[12],y=v[1]*m[12]+v[5]*m[13]+v[9]*m[14]+v[13],z=-(v[2]*m[12]+v[6]*m[13]+v[10]*m[14]+v[14]),radius=Math.max(Math.hypot(m[0],m[2]),Math.abs(m[5]),Math.hypot(m[8],m[10]))*(key==='hull'||key==='stripe'?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(z+radius<.14||Math.abs(x)-radius>Math.max(0,z+radius)*width/(2*drawCamera.focal)||Math.abs(y)-radius>Math.max(0,z+radius)*height/(2*drawCamera.focal))return;}let g=meshes[key];if(!g||g.source!==G[key]){const buffer=g?g.buffer:gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(G[key]),gl.STATIC_DRAW);g=meshes[key]={buffer,count:G[key].length/6,source:G[key]};}gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(uniforms.Model,false,m);gl.uniform3fv(uniforms.Color,col);gl.uniform1f(uniforms.Water,water);gl.drawArrays(gl.TRIANGLES,0,g.count);}
function draw(d,r,settings={}){if(disposed||gl.isContextLost())return;width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);const scale=Math.min(root.devicePixelRatio||1,1.5,Math.sqrt(1050000/(width*height))),w=Math.round(width*scale),h=Math.round(height*scale);
if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
const image=getSky();if(!skyReady&&image&&image.width>0){try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);skyReady=true;}catch(_){/* Retain procedural sky when images cannot decode. */}}
gl.uniform1f(uniforms.SkyReady,skyReady?1:0);
const cam=camera(d,width,height,settings.motion!==false,settings.raceFX==='full'),pal=palette(r);drawCamera=cam;vp=cam.vp;gl.clearColor(...pal.fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uniforms.VP,false,vp);gl.uniform3fv(uniforms.Eye,cam.eye);gl.uniform3fv(uniforms.Fog,pal.fog);gl.uniform1f(uniforms.Time,settings.motion===false?0:d.elapsed);
emit('sphere',model(cam.eye[0],cam.eye[1],cam.eye[2],0,480,480,480),pal.fog,2);emit('water',identity(),pal.water,1);scene(d,r,{...settings,paintedSky:skyReady},emit);
}
function project(x,y,z){const v=[x,y,z,1],a=[0,0,0,0];for(let i=0;i<4;i++)for(let k=0;k<4;k++)a[i]+=vp[k*4+i]*v[k];if(a[3]<=.16)return null;return {x:(a[0]/a[3]*.5+.5)*width,y:(.5-a[1]/a[3]*.5)*height,depth:a[3],visible:Math.abs(a[0]/a[3])<1.1&&Math.abs(a[1]/a[3])<1.1};}
return {canvas,mode:'webgl',diagnostic:null,draw,project,get size(){return {width,height};},destroy(){if(disposed)return;disposed=true;Object.values(meshes).forEach(g=>gl.deleteBuffer(g.buffer));gl.deleteTexture(texture);gl.deleteProgram(program);},isLost:()=>gl.isContextLost()};
}
function createCanvas(canvas){
const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('この環境では水面を描画できません。観戦モードをご利用ください。');
let width=1,height=1,view=identity(),focal=1,disposed=false,painted=0;
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
const commands=[];
function emit(key,m,col,material=0,anchor=null){const center=cameraPoint([m[12],m[13],m[14]]),data=key==='sphere'&&center[2]>16?distantSphere:G[key];
if(!key.startsWith('crowd')&&!['mountain','farHill','shore','edge','rope'].includes(key)){const radius=Math.max(Math.hypot(m[0],m[1],m[2]),Math.hypot(m[4],m[5],m[6]),Math.hypot(m[8],m[9],m[10]))*(key==='hull'||key==='stripe'?4:key==='cone'||key.startsWith('buoy')?3:1.8);if(center[2]+radius<.16||Math.abs(center[0])-radius>Math.max(0,center[2]+radius)*width/(2*focal)||Math.abs(center[1])-radius>Math.max(0,center[2]+radius)*height/(2*focal))return;}
for(let i=0;i<data.length;i+=18){const points=[];for(let k=0;k<3;k++){const j=i+k*6,x=data[j],y=data[j+1],z=data[j+2];points.push(cameraPoint([m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]]));}
const clipped=clipNear(points);if(clipped.length<3)continue;const depth=clipped.reduce((v,p)=>v+p[2],0)/clipped.length;if(depth>600)continue;const polygon=clipped.map(screen);
if(polygon.every(p=>p[0]<-2)||polygon.every(p=>p[0]>width+2)||polygon.every(p=>p[1]<-2)||polygon.every(p=>p[1]>height+2))continue;
const n=unit([m[0]*data[i+3]+m[4]*data[i+4]+m[8]*data[i+5],m[1]*data[i+3]+m[5]*data[i+4]+m[9]*data[i+5],m[2]*data[i+3]+m[6]*data[i+4]+m[10]*data[i+5]]),lit=-n[0]*.4+n[1]*.88+n[2]*.28,shade=material>=3?1:lit>.5?1:lit>-.15?.82:.61;
commands.push({polygon,depth:anchor?cameraPoint([anchor.x,.5,anchor.z])[2]-anchor.layer*.001+depth*.000001:depth,fill:material>=3?color(col,col,0):color(col,pal.fog,depth,shade)});
}
}
// World-anchored, staggered ripple strokes. No horizontal screen-space scan lines.
const sx=Math.floor(b.x/6)*6,sz=Math.floor(b.z/6)*6;
for(let i=-12;i<=12;i++)for(let j=-12;j<=12;j++){const x=sx+i*6+Math.sin((sz+j*6)*.37)*2,z=sz+j*6+Math.sin((sx+i*6)*.21)*2;
const shimmer=Math.sin(x*.43+z*.22+t*1.4),length=1.2+(shimmer+1)*1.4;
emit('slash',model(x+t%4*.3,.01,z,1.1+Math.sin(z*.2)*.45,length,1,.22+Math.max(0,shimmer)*.14),shimmer>.8?rgb('#9cebdd'):shimmer>0?rgb('#42b2bc'):rgb('#147f9d'));}
scene(d,r,{...settings,paintedSky},emit);commands.sort((a,b)=>b.depth-a.depth);
for(const c of commands){ctx.fillStyle=c.fill;ctx.beginPath();ctx.moveTo(...c.polygon[0]);for(let i=1;i<c.polygon.length;i++)ctx.lineTo(...c.polygon[i]);ctx.closePath();ctx.fill();ctx.strokeStyle=c.fill;ctx.lineWidth=.45;ctx.stroke();}
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


const API={geometry:G,panoramaU,audience,crowdFor,create,createWebGL,createCanvas,freshCanvas,clipNear,COLORS,vertex,fragment,multiply,perspective,lookAt,model,point:R.pointAt,boxMesh,hullMesh,coneMesh,planeMesh,ringMesh,scene,camera,sphereMesh,frustumMesh};
root.KM_RACE_RENDERER=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
