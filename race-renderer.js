/* 競艇物語 v80.1 — WebGL 1 + Canvas 2D first-person renderers; no external assets. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const COLORS=['#f6f4e9','#252f39','#fa5949','#299ce8','#f6ca4e','#37c78a'];
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);
const vertex=`attribute vec3 aPosition;attribute vec3 aNormal;
uniform mat4 uModel;uniform mat4 uVP;uniform mediump float uTime;uniform mediump float uWater;
varying mediump vec3 vWorld;varying mediump vec3 vNormal;
void main(){vec4 p=uModel*vec4(aPosition,1.0);
 if(uWater>0.5){p.y+=sin(p.x*0.34+uTime*1.5)*0.06+sin(p.z*0.42-uTime*1.1)*0.04;}
 vWorld=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uVP*p;}`;
const fragment=`precision mediump float;
uniform vec3 uColor;uniform vec3 uEye;uniform vec3 uFog;uniform mediump float uTime;uniform mediump float uWater;
varying mediump vec3 vWorld;varying mediump vec3 vNormal;
void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-0.45,0.85,0.35));
 vec3 color=uColor*(0.62+0.38*max(0.0,dot(n,light)));
 if(uWater>0.5){vec2 p=vWorld.xz;float a=sin(p.x*0.7+p.y*0.31+uTime*2.0);
 float b=sin(p.x*0.21-p.y*0.83-uTime*1.7);n=normalize(vec3(a*0.13,1.0,b*0.11));
 vec3 eye=normalize(uEye-vWorld);float fresnel=pow(1.0-max(dot(n,eye),0.0),3.0);
 float spec=pow(max(dot(reflect(-light,n),eye),0.0),70.0);
 float foam=pow(max(0.0,a*b),14.0)*0.1;
 color=mix(uColor*(0.88+0.07*a+0.05*b),uFog,fresnel*0.62)+vec3(spec*0.42+foam);}
 float fog=1.0-exp(-length(vWorld-uEye)*0.0032);gl_FragColor=vec4(mix(color,uFog,fog),1.0);}`;
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
function hullMesh(){const m=meshBuilder(),top=[[3.5,.36,0],[1.7,.5,-.83],[-1.8,.5,-.85],[-2,.34,.85],[1.7,.5,.83]],bottom=top.map(p=>[p[0]*.92,-.1,p[2]*.7]);
 for(let i=0;i<5;i++){m.tri([.4,.48,0],top[(i+1)%5],top[i]);m.quad(top[i],top[(i+1)%5],bottom[(i+1)%5],bottom[i]);}return m.data;}
function coneMesh(){const m=meshBuilder();for(let i=0;i<16;i++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8;m.tri([Math.cos(a),0,Math.sin(a)],[0,1,0],[Math.cos(b),0,Math.sin(b)]);}return m.data;}
function planeMesh(size=600,steps=1){const m=meshBuilder();for(let i=0;i<steps;i++)for(let j=0;j<steps;j++){const x=-size/2+size*i/steps,z=-size/2+size*j/steps,v=size/steps;m.quad([x,0,z],[x,0,z+v],[x+v,0,z+v],[x+v,0,z]);}return m.data;}
function ringMesh(inner,outer,y=0){const m=meshBuilder(),steps=160;for(let i=0;i<steps;i++){const s=R.C.length*i/steps,t=R.C.length*(i+1)/steps,a=R.pointAt(s,inner),b=R.pointAt(t,inner),c=R.pointAt(t,outer),d=R.pointAt(s,outer);m.quad([a.x,y,a.z],[b.x,y,b.z],[c.x,y,c.z],[d.x,y,d.z]);}return m.data;}
function createWebGL(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:true,powerPreference:'high-performance'})||canvas.getContext('experimental-webgl',{alpha:false,antialias:false,depth:true});
 if(!gl)throw Error('この表示アプリでは3D描画を開始できません。HTMLをChromeなどのWebGL対応ブラウザで開いてください。');
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error('3Dシェーダーの準備に失敗: '+msg);}return s;};
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){const info=gl.getProgramInfoLog(program)||'link failed';gl.deleteProgram(program);throw Error('3D描画の初期化: '+info);}gl.useProgram(program);
 const uniforms={};['Model','VP','Color','Eye','Fog','Time','Water'].forEach(k=>uniforms[k]=gl.getUniformLocation(program,'u'+k));
 const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);gl.enable(gl.DEPTH_TEST);
 const buffers=[];const upload=data=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);buffers.push(buffer);return {buffer,count:data.length/6};};
 const geometry={box:upload(boxMesh()),hull:upload(hullMesh()),cone:upload(coneMesh()),water:upload(planeMesh(700,40)),shore:upload(ringMesh(90,230,.2)),edge:upload(ringMesh(87,90,.35)),wake:upload(planeMesh(1)),innerLine:upload(ringMesh(R.C.inner-.18,R.C.inner+.18,.05))};
 const buoys=[];for(let s=0;s<R.C.length;s+=12)buoys.push(R.pointAt(s,R.C.inner));
 const outer=[];for(let s=0;s<R.C.length;s+=20)outer.push(R.pointAt(s,R.C.outer));
 let vp=identity(),eye=[0,1,0],width=1,height=1,disposed=false;
 function drawMesh(mesh,matrix,color,water=0){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);gl.uniformMatrix4fv(uniforms.Model,false,matrix);gl.uniform3fv(uniforms.Color,color);gl.uniform1f(uniforms.Water,water);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
 function projectPoint(x,y,z){const v=[x,y,z,1],out=[0,0,0,0];for(let row=0;row<4;row++)for(let k=0;k<4;k++)out[row]+=vp[k*4+row]*v[k];if(out[3]<=.2)return null;return {x:(out[0]/out[3]*.5+.5)*width,y:(.5-out[1]/out[3]*.5)*height,depth:out[3],visible:Math.abs(out[0]/out[3])<1.1&&Math.abs(out[1]/out[3])<1.1};}
 function draw(d,r,settings={}){
  if(disposed||gl.isContextLost())return;
  width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);const scale=Math.min(root.devicePixelRatio||1,1.5,Math.sqrt(1100000/(width*height)));
  const w=Math.round(width*scale),h=Math.round(height*scale);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  const b=R.own(d),f=[Math.cos(b.heading),0,Math.sin(b.heading)],right=[-f[2],0,f[0]];
  const rough=settings.motion===false?0:Math.sin(d.elapsed*5.3)*Math.min(.16,b.speed*.002+b.wakeLoad*.07),roll=settings.motion===false?0:b.heel*.3;
  eye=[b.x-f[0]*.75,1.25+rough,b.z-f[2]*.75];const target=[eye[0]+f[0]*20,eye[1]-.9,eye[2]+f[2]*20],up=[right[0]*Math.sin(roll),Math.cos(roll),right[2]*Math.sin(roll)];
  vp=multiply(perspective(83*Math.PI/180,width/height,.12,650),lookAt(eye,target,up));
  const rain=r.env.weather==='雨',fog=rain?[.39,.55,.59]:r.env.weather==='曇り'?[.60,.73,.76]:[.64,.83,.87];
  gl.clearColor(...fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(uniforms.VP,false,vp);gl.uniform3fv(uniforms.Eye,eye);gl.uniform3fv(uniforms.Fog,fog);gl.uniform1f(uniforms.Time,d.elapsed);
  drawMesh(geometry.water,identity(),rain?[.055,.28,.34]:[.045,.40,.47],1);
  drawMesh(geometry.innerLine,identity(),[.95,.58,.3]);drawMesh(geometry.shore,identity(),[.19,.34,.32]);drawMesh(geometry.edge,identity(),[.38,.46,.45]);
  // Grandstands and shore structures are simple original geometry.
  for(let i=0;i<13;i++){const x=-120+i*20;drawMesh(geometry.box,model(x,3.1,-120,0,8,3.1,8),i%3?[.69,.74,.68]:[.39,.55,.52]);drawMesh(geometry.box,model(x,6.4,-120,0,8.8,.25,9),[.19,.34,.36]);}
  drawMesh(geometry.box,model(R.C.halfStraight+R.C.outer+12,6,30,0,3,6,3),[.79,.80,.7]);drawMesh(geometry.box,model(R.C.halfStraight+R.C.outer+12,12.5,30,0,5,.5,5),[.17,.36,.37]);
  buoys.forEach((p,i)=>{drawMesh(geometry.cone,model(p.x,.02,p.z,0,.62,.64,.62),i%2?[.96,.85,.63]:[.97,.32,.21]);});
  outer.forEach(p=>drawMesh(geometry.cone,model(p.x,.02,p.z,0,.5,.55,.5),[.88,.93,.83]));
  [-1,1].forEach(sign=>drawMesh(geometry.cone,model(sign*(R.C.halfStraight+R.C.inner),.05,0,0,1.2,2.7,1.2),[1,.36,.22]));
  // START / GOAL gate stays outside the navigable water; stripe has no collision.
  const gx=R.pointAt(R.C.start).x;
  [R.C.inner-2,R.C.outer+2].forEach(z=>drawMesh(geometry.box,model(gx,4.8,z,0,.28,4.8,.28),[.85,.92,.84]));

  for(let j=0;j<12;j++)drawMesh(geometry.wake,model(gx,.04,R.C.inner+(j+.5)*(R.C.outer-R.C.inner)/12,0,1,1,(R.C.outer-R.C.inner)/12),j%2?[.9,.94,.85]:[.11,.28,.30]);
  if(settings.guide!==false){for(let i=1;i<=16;i++){const p=R.pointAt(R.C.start+b.progress+i*8,R.C.radius);drawMesh(geometry.wake,model(p.x,.06,p.z,p.heading,2.6,1,.16),[.33,.79,.73]);}}
  for(const w of d.wakes){const age=d.elapsed-w.t;if(age>5||Math.hypot(w.x-b.x,w.z-b.z)>150)continue;const width=1.2+age*1.6,h=Math.atan2(w.fz,w.fx);for(const side of [-1,1])drawMesh(geometry.wake,model(w.x-w.fz*width*side,.045,w.z+w.fx*width*side,h,5,1,.45),[.22+(1-age/5)*.32,.57+(1-age/5)*.28,.61+(1-age/5)*.24]);}
  d.boats.forEach(n=>{
   const bob=settings.motion===false?0:Math.sin(d.elapsed*3+n.frame)*.035;
   if(!n.isPlayer&&n.speed>2&&!n.capsized){for(let i=0;i<3;i++){const tail=3+i*2.2,x=n.x-Math.cos(n.heading)*tail,z=n.z-Math.sin(n.heading)*tail;drawMesh(geometry.wake,model(x,.03,z,n.heading,2.4,1,.6+i*.35),[.47+i*.08,.78+i*.04,.77+i*.04]);}}
   drawMesh(geometry.hull,model(n.x,.06+bob,n.z,n.heading,1,n.capsized?-.65:1,1),rgb(COLORS[n.frame-1]));
   if(!n.isPlayer&&!n.capsized){drawMesh(geometry.box,model(n.x-.4*Math.cos(n.heading),.85+bob,n.z-.4*Math.sin(n.heading),n.heading,.4,.38,.4),[.12,.2,.23]);drawMesh(geometry.cone,model(n.x-.4*Math.cos(n.heading),1.23+bob,n.z-.4*Math.sin(n.heading),0,.29,.38,.29),rgb(COLORS[n.frame-1]));}
   if(n.isPlayer){drawMesh(geometry.box,model(n.x+Math.cos(n.heading)*.45,.62,n.z+Math.sin(n.heading)*.45,n.heading,.17,.1,.67),[.10,.17,.20]);drawMesh(geometry.box,model(n.x+Math.cos(n.heading)*.65,.57,n.z+Math.sin(n.heading)*.65,n.heading,.48,.06,.36),[.18,.28,.30]);}
  });
 }
 return {canvas,mode:'webgl',diagnostic:null,draw,project:projectPoint,get size(){return {width,height};},destroy(){if(disposed)return;disposed=true;buffers.forEach(b=>gl.deleteBuffer(b));gl.deleteProgram(program);},isLost:()=>gl.isContextLost()};
}
/* Software projection fallback: same world/camera/boats, without GPU shaders. */
function clipNear(points,near=.16){
 const result=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=near,insideB=b[2]>=near;
  if(insideA)result.push(a);if(insideA!==insideB){const t=(near-a[2])/(b[2]-a[2]);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}}
 return result;
}
function createCanvas(canvas){
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('描画を開始できません。「おまかせで結果へ」から育成を進められます。');
 const geometries={box:boxMesh(),hull:hullMesh(),cone:coneMesh(),flat:planeMesh(1),shore:ringMesh(90,210,.2),edge:ringMesh(87,90,.35)};
 geometries.innerLine=ringMesh(R.C.inner-.18,R.C.inner+.18,.05);
 const inner=[],outer=[];for(let s=0;s<R.C.length;s+=12)inner.push(R.pointAt(s,R.C.inner));for(let s=0;s<R.C.length;s+=20)outer.push(R.pointAt(s,R.C.outer));
 let width=1,height=1,eye=[0,1,0],view=identity(),focal=1,disposed=false,painted=0;
 const cameraPoint=p=>[view[0]*p[0]+view[4]*p[1]+view[8]*p[2]+view[12],view[1]*p[0]+view[5]*p[1]+view[9]*p[2]+view[13],-(view[2]*p[0]+view[6]*p[1]+view[10]*p[2]+view[14])];
 const screen=p=>[width/2+p[0]*focal/p[2],height/2-p[1]*focal/p[2]];
 function projectPoint(x,y,z){const p=cameraPoint([x,y,z]);if(p[2]<=.16)return null;const q=screen(p);return {x:q[0],y:q[1],depth:p[2],visible:q[0]>-15&&q[0]<width+15&&q[1]>-15&&q[1]<height+15};}
 const color=(base,fog,depth,light=1)=>{const t=1-Math.exp(-depth*.004);return 'rgb('+base.map((v,i)=>Math.round(R.clamp(v*light*(1-t)+fog[i]*t,0,1)*255)).join(',')+')';};
 function draw(d,r,settings={}){
  if(disposed)return;painted++;width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);
  const scale=Math.min(root.devicePixelRatio||1,1.25,Math.sqrt(700000/(width*height))),w=Math.round(width*scale),h=Math.round(height*scale);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(w/width,0,0,h/height,0,0);
  const b=R.own(d),fx=Math.cos(b.heading),fz=Math.sin(b.heading),rough=settings.motion===false?0:Math.sin(d.elapsed*5.3)*Math.min(.11,b.speed*.0015+b.wakeLoad*.05),roll=settings.motion===false?0:b.heel*.18;
  eye=[b.x-fx*.75,1.25+rough,b.z-fz*.75];view=lookAt(eye,[eye[0]+fx*20,eye[1]-.9,eye[2]+fz*20],[-fz*Math.sin(roll),Math.cos(roll),fx*Math.sin(roll)]);focal=height/(2*Math.tan(83*Math.PI/360));
  const rain=r.env.weather==='雨',fog=rain?[.39,.55,.59]:r.env.weather==='曇り'?[.60,.73,.76]:[.64,.83,.87],horizon=height/2-focal*.045;
  const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,rain?'#385764':'#75b7c6');sky.addColorStop(1,color(fog,fog,0));ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const water=ctx.createLinearGradient(0,horizon,0,height);water.addColorStop(0,rain?'#45767e':'#4a929c');water.addColorStop(.5,rain?'#164c5b':'#126374');water.addColorStop(1,'#093c50');ctx.fillStyle=water;ctx.fillRect(0,horizon,width,height-horizon);
  // Small perspective ripples move with time, while course objects use world coordinates.
  for(let i=1;i<35;i++){const t=i/35,y=horizon+(height-horizon)*t*t,shift=Math.sin(d.elapsed*1.6+i*.9+b.x*.04)*width*.03*t;
    ctx.globalAlpha=.06+t*.11;ctx.strokeStyle=i%3?'#9ed7d6':'#052a3b';ctx.lineWidth=.4+t*1.2;ctx.beginPath();ctx.moveTo(width*(.03+(i%4)*.07)+shift,y);ctx.lineTo(width*(.63+(i%5)*.055)+shift,y+Math.sin(i+d.elapsed)*t*1.4);ctx.stroke();}
  ctx.globalAlpha=1;const commands=[];
  function mesh(data,m,c){
   for(let i=0;i<data.length;i+=18){const points=[];for(let k=0;k<3;k++){const j=i+k*6,x=data[j],y=data[j+1],z=data[j+2];points.push(cameraPoint([m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]]));}
    const clipped=clipNear(points);if(clipped.length<3)continue;const depth=clipped.reduce((v,p)=>v+p[2],0)/clipped.length;if(depth>550)continue;
    const polygon=clipped.map(screen);if(polygon.every(p=>p[0]<-2)||polygon.every(p=>p[0]>width+2)||polygon.every(p=>p[1]<-2)||polygon.every(p=>p[1]>height+2))continue;
    const n=unit([m[0]*data[i+3]+m[4]*data[i+4]+m[8]*data[i+5],m[1]*data[i+3]+m[5]*data[i+4]+m[9]*data[i+5],m[2]*data[i+3]+m[6]*data[i+4]+m[10]*data[i+5]]);
    commands.push({polygon,depth,fill:color(c,fog,depth,.64+.36*Math.max(0,-n[0]*.44+n[1]*.83+n[2]*.34))});
   }
  }
  mesh(geometries.innerLine,identity(),[.95,.58,.3]);mesh(geometries.shore,identity(),[.19,.34,.32]);mesh(geometries.edge,identity(),[.38,.46,.45]);
  for(let i=0;i<11;i++){const x=-100+i*20;mesh(geometries.box,model(x,3.1,-120,0,8,3.1,8),i%3?[.69,.74,.68]:[.39,.55,.52]);mesh(geometries.box,model(x,6.4,-120,0,8.8,.25,9),[.19,.34,.36]);}
  inner.forEach((p,i)=>mesh(geometries.cone,model(p.x,.02,p.z,0,.62,.64,.62),i%2?[.96,.85,.63]:[.97,.32,.21]));
  outer.forEach(p=>mesh(geometries.cone,model(p.x,.02,p.z,0,.5,.55,.5),[.88,.93,.83]));
  [-1,1].forEach(sign=>mesh(geometries.cone,model(sign*(R.C.halfStraight+R.C.inner),.05,0,0,1.2,2.7,1.2),[1,.36,.22]));
  const gx=R.pointAt(R.C.start).x;[R.C.inner-2,R.C.outer+2].forEach(z=>mesh(geometries.box,model(gx,4.8,z,0,.28,4.8,.28),[.85,.92,.84]));

  for(let j=0;j<12;j++)mesh(geometries.flat,model(gx,.04,R.C.inner+(j+.5)*(R.C.outer-R.C.inner)/12,0,1,1,(R.C.outer-R.C.inner)/12),j%2?[.9,.94,.85]:[.11,.28,.30]);
  if(settings.guide!==false)for(let i=1;i<=16;i++){const p=R.pointAt(R.C.start+b.progress+i*8);mesh(geometries.flat,model(p.x,.06,p.z,p.heading,2.6,1,.16),[.33,.79,.73]);}
  for(const w of d.wakes){const age=d.elapsed-w.t;if(age>5||Math.hypot(w.x-b.x,w.z-b.z)>120)continue;const width=1.2+age*1.6,h=Math.atan2(w.fz,w.fx);for(const side of [-1,1])mesh(geometries.flat,model(w.x-w.fz*width*side,.045,w.z+w.fx*width*side,h,5,1,.45),[.22+(1-age/5)*.32,.57+(1-age/5)*.28,.61+(1-age/5)*.24]);}
  d.boats.forEach(n=>{if(!n.isPlayer&&n.speed>2&&!n.capsized)for(let i=0;i<3;i++){const tail=3+i*2.2;mesh(geometries.flat,model(n.x-Math.cos(n.heading)*tail,.03,n.z-Math.sin(n.heading)*tail,n.heading,2.4,1,.6+i*.35),[.6,.82,.81]);}
   mesh(geometries.hull,model(n.x,.06,n.z,n.heading,1,n.capsized?-.65:1,1),rgb(COLORS[n.frame-1]));
   if(!n.isPlayer&&!n.capsized){mesh(geometries.box,model(n.x-.4*Math.cos(n.heading),.85,n.z-.4*Math.sin(n.heading),n.heading,.4,.38,.4),[.12,.2,.23]);mesh(geometries.cone,model(n.x-.4*Math.cos(n.heading),1.23,n.z-.4*Math.sin(n.heading),0,.29,.38,.29),rgb(COLORS[n.frame-1]));}
   if(n.isPlayer)mesh(geometries.box,model(n.x+Math.cos(n.heading)*.45,.62,n.z+Math.sin(n.heading)*.45,n.heading,.17,.1,.67),[.1,.17,.2]);
  });
  commands.sort((a,b)=>b.depth-a.depth);for(const c of commands){ctx.fillStyle=c.fill;ctx.beginPath();ctx.moveTo(...c.polygon[0]);for(let i=1;i<c.polygon.length;i++)ctx.lineTo(...c.polygon[i]);ctx.closePath();ctx.fill();}
 }
 return {canvas,mode:'canvas',diagnostic:null,draw,project:projectPoint,isLost:()=>false,get size(){return {width,height};},get frames(){return painted;},destroy(){disposed=true;}};
}
function freshCanvas(canvas){const fresh=canvas.cloneNode(false);canvas.parentNode.replaceChild(fresh,canvas);return fresh;}
function create(canvas,options={}){
 if(options.mode==='canvas')return createCanvas(canvas);
 try{return createWebGL(canvas);}catch(error){
  // A canvas that acquired WebGL cannot acquire 2D, even if shader linking failed.
  const next=freshCanvas(canvas),renderer=createCanvas(next);renderer.diagnostic=String(error.message||error).slice(0,1800);return renderer;
 }
}

const API={create,createWebGL,createCanvas,freshCanvas,clipNear,COLORS,vertex,fragment,multiply,perspective,lookAt,model,point:R.pointAt,boxMesh,hullMesh,coneMesh,planeMesh,ringMesh};
root.KM_RACE_RENDERER=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
