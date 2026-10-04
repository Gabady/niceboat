'use strict';
// Real shipped Canvas rasterization in Node; no browser, DOM, device or FPS claim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require('@napi-rs/canvas'),E=require('../src/script'),R=E.R;
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'graphics-previews'),checks=[];
const check=(name,fn)=>{fn();checks.push({name,ok:true});};
function fixture(weather='晴れ'){
 const {r}=E.Craft.practice(E,'wake',null,118);r.env={weather,wind:'横風',windSpeed:weather==='雨'?7:3};r.drive.elapsed=17.3;r.drive.paused=false;
 const b=R.own(r.drive);b.speed=23;b.heel=.08;b.wakeLoad=.28;b.posture=0;
 // Present the renderer with a recorded-looking sample of each visible boat's wake.
 r.drive.wakes=[];for(const n of r.drive.boats)for(let i=0;i<7;i++){const fx=Math.cos(n.heading),fz=Math.sin(n.heading),age=i*.22;r.drive.wakes.push({x:n.x-fx*(2.5+i*3.5),z:n.z-fz*(2.5+i*3.5),fx,fz,t:r.drive.elapsed-age,strength:.64});}
 return r;
}
function loadRenderer(file,sky){const context={KM_RACING:R,KM_SKY_IMAGE:sky,devicePixelRatio:1,OffscreenCanvas:function(w,h){return createCanvas(w,h)}};vm.createContext(context);vm.runInContext(fs.readFileSync(file,'utf8'),context);return context.KM_RACE_RENDERER;}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const sky=await loadImage(path.join(root,'web/assets/f182808207ebe70798aa.webp'));
 const Renderer=loadRenderer(path.join(root,'src/race-renderer.js'),sky),r=fixture(),d=r.drive,b=R.own(d);
 check('姿勢を起こすと目線が高く、伏せると水面が近い',()=>{b.posture=1;const up=Renderer.camera(d,393,852,false,true,r);b.posture=-1;const down=Renderer.camera(d,393,852,false,true,r);assert.ok(up.eye[1]-down.eye[1]>.6);assert.ok(down.fov>up.fov);assert.ok(up.eye[1]>1.9&&down.eye[1]>1.3);b.posture=0;});
 check('揺れOFFでは経過時間・荒波・速度に揺らされない',()=>{const a=Renderer.camera(d,393,852,false,true,r);d.elapsed+=.7;const z=Renderer.camera(d,393,852,false,true,r);assert.deepEqual(JSON.stringify(a),JSON.stringify(z));assert.equal(a.bob,0);assert.equal(a.pitch,0);assert.equal(a.roll,0);});
 const rms=(power,speed,weather,wind)=>{b.stats.power=power;b.speed=speed;r.env.weather=weather;r.env.windSpeed=wind;let energy=0;for(let i=0;i<120;i++){d.elapsed=i*.041;const c=Renderer.camera(d,393,852,true,true,r);energy+=c.bob*c.bob+c.roll*c.roll+c.pitch*c.pitch;}return Math.sqrt(energy/120);};
 check('高フィジカルでは同じ条件の揺れが減衰する',()=>{assert.ok(rms(100,25,'雨',7)<rms(0,25,'雨',7)*.6);});
 check('高速と荒波では揺れが増える',()=>{const calm=rms(60,10,'晴れ',0);assert.ok(rms(60,25,'晴れ',0)>calm*1.4);assert.ok(rms(60,25,'雨',7)>rms(60,25,'晴れ',0));});
 check('カメラの変化に不連続な振動がない',()=>{b.speed=30;b.stats.power=0;b.wakeLoad=1.5;let last;for(let i=0;i<300;i++){d.elapsed=i/60;const c=Renderer.camera(d,393,852,true,true,r);if(last){assert.ok(Math.abs(c.bob-last.bob)<.045);assert.ok(Math.abs(c.roll-last.roll)<.016);assert.ok(Math.abs(c.pitch-last.pitch)<.016);}last=c;}});
 check('波の法線は有限・正規化、白波は荒天だけに控えめに出現',()=>{let roughSum=0;for(let i=0;i<800;i++){const n=Renderer.waterNormal(i*.31,i*.57,4,[.8,1,0],12);assert.ok(n.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...n)-1)<1e-6);assert.equal(Renderer.waterWhitecap(i*.31,i*.57,4,[0,0,0],12),0);const f=Renderer.waterWhitecap(i*.31,i*.57,4,[.8,1,0],12);assert.ok(f>=0&&f<=.18);roughSum+=f;}assert.ok(roughSum>0);});
 check('描画は状態・物理乱数へ書き込まない',()=>{const race=fixture('雨'),saved=JSON.stringify(race),c=createCanvas(393,852);c.clientWidth=393;c.clientHeight=852;Renderer.createCanvas(c).draw(race.drive,race,{motion:true,raceFX:'full',guide:true});assert.equal(JSON.stringify(race),saved);});
 const report={scope:'Real Canvas renderer in Node, not browser/device. Water/boat/background only; no HUD.',checks,frames:[],benchmark:[]};
 const baseline=path.join(root,'../v123/src/race-renderer.js'),variants=fs.existsSync(baseline)?[['before',loadRenderer(baseline,sky)],['after',Renderer]]:[['after',Renderer]];
 for(const [variant,api]of variants)for(const weather of['晴れ','雨'])for(const posture of[-1,0,1]){
  const race=fixture(weather);R.own(race.drive).posture=posture;const w=960,h=540,c=createCanvas(w,h);c.clientWidth=w;c.clientHeight=h;
  const renderer=api.createCanvas(c),saved=JSON.stringify(race);renderer.draw(race.drive,race,{motion:true,raceFX:'full',guide:true});assert.equal(JSON.stringify(race),saved);
  const file=`${variant}-${weather==='雨'?'rain':'sun'}-${posture<0?'crouch':posture>0?'upright':'neutral'}.png`;fs.writeFileSync(path.join(out,file),c.toBuffer('image/png'));report.frames.push({file,width:w,height:h,noStateMutation:true});renderer.destroy();
 }
 for(const weather of['晴れ','雨']){const race=fixture(weather),c=createCanvas(393,852);c.clientWidth=393;c.clientHeight=852;Renderer.createCanvas(c).draw(race.drive,race,{motion:true,raceFX:'full',guide:true});const file=`after-${weather==='雨'?'rain':'sun'}-393.png`;fs.writeFileSync(path.join(out,file),c.toBuffer('image/png'));report.frames.push({file,width:393,height:852});}
 for(const[variant,api]of variants)for(const quality of['full','soft','off']){const race=fixture('雨'),c=createCanvas(393,852);c.clientWidth=393;c.clientHeight=852;const renderer=api.createCanvas(c),samples=[];for(let i=0;i<8;i++){race.drive.elapsed=17.3+i*.033;const start=performance.now();renderer.draw(race.drive,race,{guide:true,motion:true,raceFX:quality});if(i>=3)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);report.benchmark.push({variant,quality,medianMs:+samples[2].toFixed(2),samplesMs:samples.map(n=>+n.toFixed(2)),scope:'Node Canvas CPU time, not browser FPS'});renderer.destroy();}
 fs.writeFileSync(path.join(__dirname,'renderer-v124.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1;});
