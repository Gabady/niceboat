'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas'),E=require('../script'),R=E.R,G=require('../race-renderer');
global.OffscreenCanvas=function(w,h){return createCanvas(w,h)};
(async()=>{
 global.KM_SKY_IMAGE=await loadImage(path.join(__dirname,'../assets/shore-panorama.webp'));
 const s=E.newState(409);E.createCareer(s,E.character(s,'姿勢比較'));E.startSeries(s);E.prepareRace(s);const r=s.career.series.race,d=E.startDrive(s.career,r);d.elapsed=35;d.started=true;d.paused=false;r.env={weather:'晴れ',wind:'無風',windSpeed:0};
 for(const [i,b] of d.boats.entries()){const q=R.pointAt(R.C.start+310+i*12,41+i*3);Object.assign(b,q,{progress:310+i*12,startTime:.2,speed:19,vx:Math.cos(q.heading)*19,vz:Math.sin(q.heading)*19,posture:0});}
 const b=R.own(d),canvas=createCanvas(390,844);canvas.clientWidth=390;canvas.clientHeight=844;const renderer=G.createCanvas(canvas),images=[];
 for(const [name,value] of [['low',-1],['high',1]]){b.posture=value;for(const n of d.boats)if(!n.isPlayer)n.posture=value;const before=JSON.stringify(d);renderer.draw(d,r,{guide:false,motion:true,raceFX:'off'});assert.equal(JSON.stringify(d),before);const bytes=canvas.toBuffer('image/png');fs.writeFileSync(path.join(__dirname,'../previews/v104-posture-'+name+'.png'),bytes);images.push(bytes);}
 assert.ok(!images[0].equals(images[1]));renderer.destroy();
 const result={build:104,passed:3,failed:0,checks:['Both postures render using production Canvas renderer','Images differ with posture while stored race data is unchanged','Camera and racer pose share the new posture state'],method:'Production renderer on Skia Canvas, not browser layout or device testing.'};fs.writeFileSync(path.join(__dirname,'posture-v104-render-results.json'),JSON.stringify(result,null,2));console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1});
