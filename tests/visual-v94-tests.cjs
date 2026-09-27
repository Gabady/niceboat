'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const E=require('../script'),R=E.R,G=require('../race-renderer'),out=path.join(__dirname,'../previews');
(async()=>{
 global.KM_SKY_IMAGE=await loadImage(path.join(__dirname,'../assets/shore-panorama.webp'));
 const s=E.newState(194),p=E.character(s,'描画確認');E.createCareer(s,p);E.startSeries(s);E.prepareRace(s);const r=s.career.series.race,d=E.startDrive(s.career,r),own=R.own(d);
 r.env={weather:'晴れ',wind:'無風',windSpeed:0};d.elapsed=30;d.started=true;d.countdown=0;
 const pos=R.pointAt(380,44);Object.assign(own,pos,{progress:280,speed:0});
 function draw(name,heading){own.heading=heading;const canvas=createCanvas(390,600);canvas.clientWidth=390;canvas.clientHeight=600;const renderer=G.createCanvas(canvas),before=JSON.stringify(d);renderer.draw(d,r,{motion:false,guide:false});assert.equal(JSON.stringify(d),before);fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));renderer.destroy();return canvas.getContext('2d').getImageData(0,0,390,220).data;}
 const a=draw('v94-wrap-left',-Math.PI+.00001),b=draw('v94-wrap-right',Math.PI-.00001);let delta=0;for(let i=0;i<a.length;i+=4)for(let k=0;k<3;k++)delta+=Math.abs(a[i+k]-b[i+k]);delta/=a.length*.75;assert.ok(delta<1,'360 seam mean RGB delta '+delta);
 for(const u of [0,.5,1])assert.ok(Math.abs(G.panoramaU(u-.000001)-G.panoramaU(u+.000001))<.00001);
 const counts=[];for(const grade of ['rookie','g3','g2','g1','sg']){r.grade=grade;r.type='qualifier';counts.push(G.audience(r).count);}assert.ok(counts.every((v,i)=>i===0||v>counts[i-1]));
 const before=JSON.stringify(r);G.crowdFor(r);const geometry=G.crowdFor(r).map(([k])=>JSON.stringify(G.geometry[k])).join('');assert.equal(JSON.stringify(r),before);assert.equal(G.crowdFor(r).map(([k])=>JSON.stringify(G.geometry[k])).join(''),geometry);
 // Close to the grandstand, looking from the course toward its spectators.
 own.x=0;own.z=83;own.heading=Math.PI/2;own.speed=0;r.grade='sg';r.type='championship';draw('v94-grandstand-sg',own.heading);
 const cam=G.camera(d,390,600,false),commands=[['sphere',Array.from(G.model(...cam.eye,0,480,480,480)),[.725,.898,.937],2],['water',Array.from(G.model(0,0,0)),[.075,.557,.686],1]];
 G.scene(d,r,{motion:false,guide:false,paintedSky:true},(k,m,c,v=0)=>commands.push([k,Array.from(m),c,v]));
 fs.writeFileSync(path.join(out,'v94-grandstand-scene.json'),JSON.stringify({width:390,height:600,time:0,vertex:G.vertex,fragment:G.fragment,camera:{eye:cam.eye,vp:Array.from(cam.vp)},geometry:G.geometry,commands,fog:[.725,.898,.937]}));
 r.grade='rookie';r.type='qualifier';draw('v94-grandstand-rookie',own.heading);
 const report={passed:4,failed:0,checks:['360-degree wrap continuity rendered on real Canvas','Periodic mirrored coordinates at both joins','Grade crowd count and stable state','Real Canvas crowd closeups'],seamMeanRGBDelta:delta,gradeCrowdCounts:counts,method:'Skia Canvas renderer, not browser/mobile verification'};
 fs.writeFileSync(path.join(__dirname,'visual-v94-results.json'),JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e);process.exitCode=1;});
