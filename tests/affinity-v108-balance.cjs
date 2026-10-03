'use strict';
// Controlled finishing schedules, not simulated win rates or statistical playtests.
const fs=require('fs'),E=require('../script'),rows=[];
for(const [name,places]of [['上位と中位',[2,3,4,5,3,2]],['苦戦と回復',[5,6,4,3,5,2]],['ほぼ下位',[6,5,6,4,3,5]]]){
 const s=E.newState(90);E.createCareer(s,E.character(s,'評価基準'));const c=s.career;c.stage=2;E.startSeries(s);const id=c.cast.mentor.id;const series=[];
 for(let stage=2;stage<=8;stage++){c.stage=stage;for(let race=0;race<6;race++){c.stats.races++;const place=places[race];E.Affinity.settle(c,{id:stage+':'+race},{place,startFault:null,dnf:false,capsized:false,finish:[]});}series.push({stage,affinity:E.Affinity.value(c,'mentor',id)});}
 rows.push({profile:name,places,series,finalBeforeChoices:E.Affinity.value(c,'mentor',id),finalWithFourAlignedChoices:Math.min(100,E.Affinity.value(c,'mentor',id)+20)});
}
fs.writeFileSync(__dirname+'/affinity-v108-balance.json',JSON.stringify({build:108,note:'Controlled result schedules. The +20 scenario is four aligned choices applied after races to show contribution, not actual play order.',threshold:60,rows},null,2));console.log(JSON.stringify(rows));
