'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),src=fs.existsSync(path.join(root,'dist'))?path.join(root,'dist'):root;
const E=require(path.join(src,'script.js')),R=E.R,G=require(path.join(src,'race-renderer.js'));
global.OffscreenCanvas=function(w,h){return createCanvas(w,h);};
const out=process.argv[2]||path.join(root,'previews');fs.mkdirSync(out,{recursive:true});
(async()=>{global.KM_SKY_IMAGE=await loadImage(path.join(src,'assets/shore-panorama.webp'));const results=[];
for(const [name,progress,weather,width,height]of [['race-sunny',25,'晴れ',390,844],['race-turn',115,'晴れ',390,844],['race-rain',345,'雨',390,844],['race-wide',115,'晴れ',844,390],['race-buoy',143,'晴れ',390,844]]){
 const s=E.newState(932);E.createCareer(s,E.character(s,'蒼井 かなた'));E.startSeries(s);E.prepareRace(s);const r=s.career.series.race,d=E.startDrive(s.career,r),b=R.own(d);
 r.env={weather,wind:'横風',windSpeed:5};d.elapsed=32;d.started=true;d.countdown=0;d.paused=false;
 for(const [i,n]of d.boats.entries()){n.progress=progress+(n.isPlayer?0:8+i*10);const pt=R.pointAt(R.C.start+n.progress,38+(i%3)*6);Object.assign(n,pt,{speed:18,vx:Math.cos(pt.heading)*18,vz:Math.sin(pt.heading)*18,startTime:.2});if(!n.isPlayer)for(let j=1;j<10;j++)d.wakes.push({owner:n.id,x:n.x-Math.cos(n.heading)*j*2,z:n.z-Math.sin(n.heading)*j*2,fx:Math.cos(n.heading),fz:Math.sin(n.heading),t:d.elapsed-j*.25,strength:1});}
 const opponent=d.boats.find(n=>!n.isPlayer);const near=R.pointAt(R.C.start+progress+10,R.project(b.x,b.z).radial-1.7);Object.assign(opponent,near,{progress:progress+10});
 if(name==='race-buoy'){b.x=R.C.halfStraight+38;b.z=14;b.heading=-Math.PI/2-.18;}
 if(['race-sunny','race-turn','race-buoy'].includes(name)){const cam=G.camera(d,width,height,true),commands=[['sphere',Array.from(G.model(...cam.eye,0,480,480,480)),[.725,.898,.937],2],['water',Array.from(G.model(0,0,0)),[.075,.557,.686],1]];G.scene(d,r,{guide:false,paintedSky:true},(k,m,c,v=0)=>commands.push([k,Array.from(m),c,v]));fs.writeFileSync(path.join(out,name+'-scene.json'),JSON.stringify({width,height,time:d.elapsed,vertex:G.vertex,fragment:G.fragment,camera:{eye:cam.eye,vp:Array.from(cam.vp)},geometry:G.geometry,commands,fog:[.725,.898,.937]}));}
 const canvas=createCanvas(width,height);canvas.clientWidth=width;canvas.clientHeight=height;const renderer=G.createCanvas(canvas),before=JSON.stringify(d),start=performance.now();renderer.draw(d,r,{guide:false});const ms=performance.now()-start;assert.equal(JSON.stringify(d),before);
 fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));const rgba=canvas.getContext('2d').getImageData(0,0,width,height).data,colors=new Set();for(let i=0;i<rgba.length;i+=40)colors.add(rgba[i]+','+rgba[i+1]+','+rgba[i+2]);assert.ok(colors.size>100);results.push({name,width,height,drawMilliseconds:Math.round(ms),sampledColors:colors.size,stateUnchanged:true});renderer.destroy();
}
fs.writeFileSync(path.join(root,'tests/render-v93-results.json'),JSON.stringify({method:'Real Canvas 2D rendered with Skia; not a browser or mobile GPU test',results},null,2));console.log(results);})();
