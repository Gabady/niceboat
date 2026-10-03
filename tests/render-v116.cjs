'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const G=require('../race-renderer'),E=require('../script'),R=E.R,root=path.resolve(__dirname,'..'),out=path.join(root,'previews'),results=[];
const pass=name=>{results.push({name,passed:true});console.log('PASS',name);};
const emitTo=a=>(k,m,c,v=0)=>a.push([k,Array.from(m),c,v]);
function render(name,eye,target,commands,w=960,h=640,weather=[.35,0,0]){
 const vp=G.multiply(G.perspective(44*Math.PI/180,w/h,.12,650),G.lookAt(eye,target,[0,1,0])),file='/tmp/v116-'+name+'.json';
 fs.writeFileSync(file,JSON.stringify({width:w,height:h,time:32,vertex:G.vertex,fragment:G.fragment,weather,camera:{eye,vp:Array.from(vp)},geometry:G.geometry,commands:[['sphere',Array.from(G.model(...eye,0,480,480,480)),[.725,.898,.937],2],['water',Array.from(G.identity()),[.075,.557,.686],1],...commands],fog:[.725,.898,.937]}));
 cp.execFileSync('python3',[path.join(__dirname,'render-webgl.py'),file,path.join(out,'v116-'+name+'.png')]);
}
(async()=>{
 const newKeys=['roundedLow','coamingLow','coamingInsideLow','liveryLow','jacketLow','sleeveLow','trouserLow','coaming','coamingInside','livery','pennant','jacket','sleeve','trouser','raceHelmet','raceHelmetLow','raceVisor','raceSeal','chinBand',...Object.keys(G.geometry).filter(k=>k.startsWith('side'))];
 for(const key of newKeys){const a=G.geometry[key];assert.ok(a.length%18===0&&a.every(Number.isFinite));for(let i=0;i<a.length;i+=6){const len=Math.hypot(...a.slice(i+3,i+6));assert.ok(Math.abs(len-1)<.0005,`${key} normal ${i}: ${len}`);}}
 pass('新モデル'+newKeys.length+'メッシュの頂点と法線が有効');
 assert.equal(new Set(G.COLORS).size,6);assert.deepEqual(G.COLORS,['#f4f5ef','#171d24','#df2635','#125dd3','#ffd124','#179b5c']);pass('6艇は白 黒 赤 青 黄 緑で重複しない');
 const base={id:'preview',frame:1,isPlayer:false,x:0,z:0,heading:0,speed:21,steer:0,yawRate:0,heel:0,posture:0};
 let near;
 for(let frame=1;frame<=6;frame++){
  const a=[];G.boatScene({...base,frame},{elapsed:32},{motion:true},emitTo(a));if(frame===1)near=a;
  assert.ok(a.length<=90);assert.ok(a.some(x=>x[0]==='sideDigit'+frame+'R'));assert.ok(a.some(x=>x[0]==='sideDigit'+frame+'L'));
  const color=G.COLORS[frame-1].slice(1).match(/../g).map(v=>parseInt(v,16)/255);
  for(const key of ['livery','jacket','pennant','raceHelmet'])assert.deepEqual(a.find(x=>x[0]===key)[2],color);
  render('boat-'+frame,[5.6,3.35,6.2],[.2,.78,0],a);
 }
 pass('6艇すべての側面番号 旗 上衣 艇体色を実GLESで描画');
 const rear=[];G.boatScene({...base,frame:4},{elapsed:32},{motion:true},emitTo(rear));render('boat-rear',[-5.3,2.8,5.9],[-.5,.8,0],rear);pass('追走方向から船外機と背面艇番を描画');
 const turn=[];G.boatScene({...base,frame:5,posture:1,steer:-.85,yawRate:-.4,heel:-.35},{elapsed:32},{motion:true},emitTo(turn));render('boat-turn',[4.7,2.9,5.4],[.1,.8,0],turn);
 const low=G.racerPose({...base,posture:-1},false),high=G.racerPose({...base,posture:1},false);assert.ok(high.head[1]>low.head[1]+.3);assert.ok(G.racerPose({...base,steer:-1},false).head[2]<0);pass('伏せ 中立 起こすと旋回の体重移動が連動');
 for(const dist of [45,100]){const a=[];G.boatScene({...base,x:dist},{elapsed:32,boats:[{isPlayer:true,x:0,z:0}]},{lightweight:true},emitTo(a));assert.ok(a.length<near.length);for(const k of ['coaming','livery','pennant','jacket'])assert.ok(a.some(x=>x[0]===k));if(dist===100)assert.ok(a.length<=25);}
 pass('中遠距離も艇体形状と色を保持し遠方25部品以下');
 const a=[],b=[];G.boatScene(base,{elapsed:0},{motion:false},emitTo(a));G.boatScene(base,{elapsed:9},{motion:false},emitTo(b));assert.deepEqual(a,b);pass('演出短縮で揺れと旗の動きが固定');
 const own=[];G.boatScene({...base,isPlayer:true},{elapsed:0},{motion:false},emitTo(own));assert.ok(!own.some(x=>['jacket','raceHelmet','raceHelmetLow','raceVisor'].includes(x[0])));assert.ok(own.some(x=>x[0]==='sleeve'));pass('自艇の頭と上体を除外し手袋と袖を表示');
 const upside=[];G.boatScene({...base,capsized:true},{elapsed:10},{},emitTo(upside));assert.equal(upside.length,1);assert.equal(upside[0][0],'shell');pass('転覆モデルを維持');
 global.KM_SKY_IMAGE=await loadImage(path.join(root,'assets/shore-panorama.webp'));global.OffscreenCanvas=function(w,h){return createCanvas(w,h)};
 const s=E.newState(409);E.createCareer(s,E.character(s,'表示検証'));E.startSeries(s);E.prepareRace(s);const r=s.career.series.race,d=E.startDrive(s.career,r);d.elapsed=35;d.started=true;d.paused=false;const player=R.own(d);Object.assign(player,{x:-70,z:40,heading:0,speed:18,startTime:.1,posture:0,frame:1});
 let i=0;for(const b of d.boats){if(b!==player){Object.assign(b,{x:player.x+9+(i%2)*6,z:player.z+(i-2)*3.0,heading:.02,speed:18,startTime:.1,posture:0,frame:i+2});i++;}}
 for(const weather of ['晴れ','雨']){
  r.env={weather,wind:'横風',windSpeed:weather==='雨'?8:2};const canvas=createCanvas(390,844);canvas.clientWidth=390;canvas.clientHeight=844;const renderer=G.createCanvas(canvas),before=JSON.stringify(d),start=performance.now();
  renderer.draw(d,r,{guide:false,motion:true});const ms=performance.now()-start;assert.equal(JSON.stringify(d),before);fs.writeFileSync(path.join(out,'v116-'+(weather==='雨'?'rain':'race')+'-canvas.png'),canvas.toBuffer('image/png'));renderer.destroy();console.log('Canvas reference frame ms',Math.round(ms));
  const cam=G.camera(d,390,844,true),commands=[];G.scene(d,r,{guide:false,motion:true,paintedSky:true},emitTo(commands));const file='/tmp/v116-race.json';fs.writeFileSync(file,JSON.stringify({width:390,height:844,time:d.elapsed,vertex:G.vertex,fragment:G.fragment,weather:G.weatherVector(r),camera:{eye:cam.eye,vp:Array.from(cam.vp)},geometry:G.geometry,commands:[['sphere',Array.from(G.model(...cam.eye,0,480,480,480)),[.725,.898,.937],2],['water',Array.from(G.identity()),[.075,.557,.686],1],...commands],fog:weather==='雨'?[.616,.725,.780]:[.725,.898,.937]}));cp.execFileSync('python3',[path.join(__dirname,'render-webgl.py'),file,path.join(out,'v116-'+(weather==='雨'?'rain':'race')+'-webgl.png')]);assert.equal(JSON.stringify(d),before);pass(weather+'の390px一人称 WebGL Canvasで表示し物理状態を変更しない');
 }
 const old=JSON.parse(fs.readFileSync(path.join(__dirname,'v115-render-save.json'),'utf8'));
 const decoded=E.decode(JSON.stringify(old));assert.equal(decoded.build,E.D.build);assert.deepEqual(decoded.career.player,old.career.player);assert.deepEqual(decoded.career.series.race.drive.boats,old.career.series.race.drive.boats);pass('V115から能力 好感度 調整力 走行位置を保持して移行');
 fs.writeFileSync(path.join(__dirname,'render-v116-results.json'),JSON.stringify({build:116,passed:results.length,failed:0,results,geometryMeshes:newKeys.length,nearParts:near.length,method:'Native GLES and Skia Canvas plus geometry and save migration; not phone performance tests'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
