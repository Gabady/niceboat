
/* v95: race feedback only. This module never changes race state or random seeds. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null),D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
function level(d){const b=R.own(d),kmh=b.speed*3.6,skill=D.statKeys.reduce((n,k)=>n+b.stats[k],0)/500;
 return {speed:kmh,intensity:R.clamp((kmh-48)/35,0,1)*(.25+.75*skill),high:kmh>=65,contact:d.elapsed-(b.lastContactAt??-10)<.18,boundary:d.elapsed-(b.boundaryAt??-10)<.18};}
function create(d){return {lastEvent:d.eventSequence-1,rank:R.place(d,R.own(d)),lap:Math.floor(Math.max(0,R.own(d).progress)/R.C.length),phase:R.own(d).phase,lastMark:-1e9,banner:null,until:0,rankSince:0};}
function update(st,d,r,settings={},now=0){
 const b=R.own(d),v=level(d),events=[];
 if(d.paused||d.finished||b.capsized||b.dnf||b.finishTime!==null){st.banner=null;return {...v,active:false,event:null};}
 const fresh=d.events.filter(e=>e.index>st.lastEvent);if(fresh.length)st.lastEvent=fresh.at(-1).index;
 const skills=fresh.filter(e=>e.kind==='ability'&&D.rarities.indexOf(e.rarity)>=4).sort((a,c)=>(c.athleteId===b.id?10:0)+D.rarities.indexOf(c.rarity)-(a.athleteId===b.id?10:0)-D.rarities.indexOf(a.rarity));
 if(skills.length){const e=skills[0],a=D.abilityMap[e.abilityId];events.push({kind:e.rarity==='LR'?'legend':'ultra',tone:e.rarity.toLowerCase(),title:a.name,note:e.frame+'号艇 · '+e.rarity+(e.variant==='recoil'?' · 3周目の反動':''),priority:5});}
 const rank=R.place(d,b),lap=Math.floor(Math.max(0,b.progress)/R.C.length),valid=!b.startFault&&R.raceTime(d)>2;
 if(valid&&rank<st.rank&&now-st.lastMark>1600)events.push({kind:'overtake',tone:'pass',title:rank===1?'先頭へ！':rank+'位へ浮上',note:rank===1?'その航跡を、守り抜け':'前の艇を捉えた',priority:3});
 if(valid&&lap===2&&st.lap<2)events.push({kind:'finalLap',tone:'lap',title:'ラスト1周',note:r.castDuel?'決着の水面へ':'最後のターンまで、勝負',priority:4});
 if(valid&&[1,3].includes(st.phase)&&[2,4].includes(b.phase)&&v.speed>=52&&b.stats.turn>=65&&b.slip<2.5&&b.throttle>.8)events.push({kind:'exit',tone:'exit',title:'鮮やかな立ち上がり',note:'艇が前を向いた',priority:2});
 st.rank=rank;st.lap=lap;st.phase=b.phase;
 const event=events.sort((a,c)=>c.priority-a.priority)[0]||null;
 if(event){st.banner=event;st.until=now+1450;st.lastMark=now;root.KM_PRESENTATION?.pulse(event.kind,settings,now);if(['overtake','exit'].includes(event.kind))root.KM_AUDIO?.effect('skill');}
 else if(v.contact)root.KM_PRESENTATION?.pulse('contact',settings,now);
 else if(v.boundary)root.KM_PRESENTATION?.pulse('boundary',settings,now);
 else if(v.high&&valid)root.KM_PRESENTATION?.pulse('speed',settings,now);
 if(st.banner&&now>=st.until)st.banner=null;
 return {...v,active:true,event,banner:st.banner};
}
function paint(ctx,w,h,v,t,reduced=false){
 if(!v.active||reduced||v.intensity<.03)return 0;const x0=w*.5,y0=h*.45,n=Math.floor(12+v.intensity*24);ctx.save();let count=0;
 // Keep the navigable centre clear; jets stretch towards the screen edges.
 for(let i=0;i<n;i++){const side=i%2?1:-1,f=(i*.618+t*(.9+v.intensity))%1,y=h*(.48+(i*.313%1)*.42),x=x0+side*w*(.32+f*.18),len=(.04+v.intensity*.10)*w;
  ctx.strokeStyle='rgba(191,245,255,'+(.05+v.intensity*.14)*(1-f)+')';ctx.lineWidth=1+(i%3===0?1:0);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+side*len,y+(y-y0)*.2);ctx.stroke();count++;
 }
 if(v.intensity>.4){for(const side of [-1,1]){const g=ctx.createLinearGradient(side<0?0:w,h*.8,side<0?w*.1:w*.9,h*.8);g.addColorStop(0,'rgba(90,234,255,'+(v.intensity*.17)+')');g.addColorStop(1,'rgba(90,234,255,0)');ctx.fillStyle=g;ctx.fillRect(side<0?0:w*.9,h*.30,w*.10,h*.55);}}
 for(let i=0;i<14;i++){const side=i%2?1:-1,f=(i*.317+t*(.8+v.intensity*.5))%1,x=w*(.5+side*(.52-f*.17)),y=h*(.79-f*.26);ctx.fillStyle='rgba(225,253,255,'+((1-f)*v.intensity*.38)+')';ctx.beginPath();ctx.arc(x,y,1+(i%3)*.65,0,Math.PI*2);ctx.fill();}
 ctx.restore();return count;
}
const API={level,create,update,paint};root.KM_THRILL=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

