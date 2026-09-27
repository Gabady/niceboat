'use strict';
// Native SVG rasterization for visual review; not a browser screenshot.
const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('@napi-rs/canvas'),P=require('../portraits'),E=require('../script');
(async()=>{
 const persons=E.Bonds.B.heroines.concat(E.Cast.mentors,E.Cast.walls,Array.from({length:5},(_,i)=>({id:'rival_'+i,name:'Rival '+(i+1)})));
 const labels=['Akari','Mio','Nagi','Kanade','Tsumugi','Hayase','Tsukino','Kuzumi','Akamine','Iwase','Kurose','Shirakami','Kagura','Raiden','Onizuka','Rival 1','Rival 2','Rival 3','Rival 4','Rival 5'];
 const cv=createCanvas(1050,1240),x=cv.getContext('2d');x.fillStyle='#102536';x.fillRect(0,0,1050,1240);x.font='20px sans-serif';x.fillStyle='#f0e7d3';x.fillText('KYOTEI MONOGATARI / ORIGINAL CAST v100',30,36);
 for(const [i,p]of persons.entries()){
  const svg=P.render(p,true).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="192" height="230.4" '),im=await loadImage(Buffer.from(svg)),left=25+(i%5)*205,top=70+Math.floor(i/5)*287;
  x.drawImage(im,left+15,top,165,198);x.textAlign='center';x.fillStyle='#f0e9d9';x.font='18px sans-serif';x.fillText(labels[i],left+97,top+226);x.fillStyle='#9cb4bf';x.font='12px sans-serif';x.fillText(['HEROINE','MENTOR','FINAL WALL','RIVAL'][Math.floor(i/5)],left+97,top+249);
 }
 fs.writeFileSync(path.join(__dirname,'../previews/v100-portraits.png'),cv.toBuffer('image/png'));
 const faces=createCanvas(660,300),f=faces.getContext('2d');f.fillStyle='#102536';f.fillRect(0,0,660,300);
 for(const [i,emotion] of [null,'thoughtful','sad','warm'].entries()){const svg=P.render(E.Bonds.B.heroines[0],true,emotion).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="150" height="180" ');f.drawImage(await loadImage(Buffer.from(svg)),15+i*164,24);f.fillStyle='#eee';f.font='14px sans-serif';f.fillText(emotion||'identity',22+i*164,230);}
 fs.writeFileSync(path.join(__dirname,'../previews/v100-expressions.png'),faces.toBuffer('image/png'));
 console.log('20 portraits + 4 expressions rendered with Skia.');
})();
