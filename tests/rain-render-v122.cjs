'use strict';
// Uses the shipped Canvas renderer, not a browser screenshot or simulated game image.
// Requires @napi-rs/canvas. Output contains no HUD, because DOM layout is not tested here.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const E=require('../src/script'),R=E.R,root=path.resolve(__dirname,'..'),out=process.argv[2]||path.join(__dirname,'rain-v122');
(async()=>{fs.mkdirSync(out,{recursive:true});global.OffscreenCanvas=function(w,h){return createCanvas(w,h)};global.devicePixelRatio=1;global.KM_SKY_IMAGE=await loadImage(path.join(root,'web/assets/f182808207ebe70798aa.webp'));
const Renderer=require('../src/race-renderer'),UI=require('../src/driving-ui'),report={scope:'Real Canvas renderer + weather overlay in Node. No browser/DOM or device verification.',frames:[]};
for(const[w,h]of[[393,852],[1280,720]]){const{r}=E.Craft.practice(E,'wake',null,118);r.env={weather:'雨',wind:'横風',windSpeed:7};r.drive.elapsed=17.3;r.drive.paused=false;const before=JSON.stringify(r),c=createCanvas(w,h);c.clientWidth=w;c.clientHeight=h;const renderer=Renderer.createCanvas(c);
for(const quality of['full','soft','off']){const start=performance.now();renderer.draw(r.drive,r,{guide:true,motion:true,raceFX:quality});const display=createCanvas(w,h),ctx=display.getContext('2d');ctx.drawImage(c,0,0,w,h);const fx=createCanvas(w,h);UI.paintWeather(fx.getContext('2d'),w,h,UI.effectLevels(r.drive,r),r.drive.elapsed,true,quality);ctx.drawImage(fx,0,0);const file=`rain-${w}-${quality}.png`;fs.writeFileSync(path.join(out,file),display.toBuffer('image/png'));assert.equal(JSON.stringify(r),before);const px=ctx.getImageData(0,0,w,Math.floor(h*.25)).data;let blue=0;for(let i=0;i<px.length;i+=4)if(px[i+2]-px[i]>50)blue++;assert.equal(blue,0,'No bright blue sunny sky in rainy conditions');report.frames.push({file,css:[w,h],backing:[c.width,c.height],renderMs:Math.round(performance.now()-start),noStateMutation:true,noSunnyBlueSky:true});}
renderer.destroy();}
fs.writeFileSync(path.join(out,'render-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
