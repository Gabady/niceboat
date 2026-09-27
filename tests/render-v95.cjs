'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const E=require('../script'),R=E.R,G=require('../race-renderer'),T=require('../thrill'),C=E.Cast;
global.OffscreenCanvas=function(w,h){return createCanvas(w,h);};
const out=path.join(__dirname,'../previews');
(async()=>{
 const sheet=createCanvas(720,342),x=sheet.getContext('2d');x.fillStyle='#102b3e';x.fillRect(0,0,720,342);
 for(const [i,p]of [...C.mentors,...C.walls].entries()){const svg=C.portrait(p.id).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="96" height="104" '),img=await loadImage(Buffer.from(svg)),left=12+i%5*142,top=10+Math.floor(i/5)*170;x.drawImage(img,left+20,top,96,104);x.fillStyle='#f8edce';x.font='bold 14px sans-serif';x.textAlign='center';x.fillText(p.name,left+68,top+125);x.fillStyle=p.color;x.font='12px sans-serif';x.fillText(E.D.stats[p.key]+(i>=5?' 100 S':'の師匠'),left+68,top+146);}
 fs.writeFileSync(path.join(out,'v95-cast.png'),sheet.toBuffer('image/png'));
 global.KM_SKY_IMAGE=await loadImage(path.join(__dirname,'../assets/shore-panorama.webp'));
 const s=E.newState(5);E.createCareer(s,E.character(s,'疾走'));E.startSeries(s);E.prepareRace(s);const r=s.career.series.race,d=E.startDrive(s.career,r);r.env={weather:'晴れ',wind:'追い風',windSpeed:2};d.elapsed=35;d.paused=false;d.started=true;
 for(const [i,b]of d.boats.entries()){b.progress=330+(b.isPlayer?0:i*14+12);const q=R.pointAt(R.C.start+b.progress,40+i*2);Object.assign(b,q,{startTime:.15,speed:23,vx:Math.cos(q.heading)*23,vz:Math.sin(q.heading)*23});b.stats=Object.fromEntries(E.D.statKeys.map(k=>[k,92]));}
 const canvas=createCanvas(390,844);canvas.clientWidth=390;canvas.clientHeight=844;const renderer=G.createCanvas(canvas),before=JSON.stringify(d);renderer.draw(d,r,{guide:false,motion:true,raceFX:'full'});const ctx=canvas.getContext('2d'),v=T.update(T.create(d),d,r,{haptics:false},3500);const count=T.paint(ctx,390,844,v,d.elapsed,false);assert.ok(count>=20);assert.equal(JSON.stringify(d),before);fs.writeFileSync(path.join(out,'v95-speed.png'),canvas.toBuffer('image/png'));
 const standard=G.camera(d,390,844,true,false),wide=G.camera(d,390,844,true,true),reduced=G.camera(d,390,844,false,true);assert.ok(wide.focal<standard.focal);assert.equal(reduced.focal,standard.focal);assert.equal(T.paint(ctx,390,844,v,35,true),0);
 const cam=wide,commands=[['sphere',Array.from(G.model(...cam.eye,0,480,480,480)),[.725,.898,.937],2],['water',Array.from(G.model(0,0,0)),[.075,.557,.686],1]];G.scene(d,r,{guide:false,motion:true,paintedSky:true},(k,m,c,v=0)=>commands.push([k,Array.from(m),c,v]));fs.writeFileSync(path.join(out,'v95-speed-scene.json'),JSON.stringify({width:390,height:844,time:d.elapsed,vertex:G.vertex,fragment:G.fragment,camera:{eye:cam.eye,vp:Array.from(cam.vp)},geometry:G.geometry,commands,fog:[.725,.898,.937]}));
 const report={passed:3,failed:0,checks:['10 original SVG faces rendered on Canvas','High speed Canvas effects preserve physics state','Speed perspective and reduced-motion fallback'],method:'Real Skia Canvas / SVG, not browser or mobile-device testing'};fs.writeFileSync(path.join(__dirname,'render-v95-results.json'),JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e);process.exitCode=1;});
