/* Registered-racer cups. Independent seed, immutable entrants, bounded records. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),copy=x=>JSON.parse(JSON.stringify(x));
const formats={sprint:{name:'三水面カップ',races:3,description:'穏やかな水面・向かい風・横風の3戦。合計得点で競う。'},rotation:{name:'全コース選手権',races:6,description:'同じ水面で全6コースを一度ずつ走る。合計得点で競う。'}};
const points=[10,8,6,4,2,1],good=n=>!n.startFault&&!n.capsized&&!n.dnf;
function compact(p){const n=copy(p);for(const k of Object.keys(n))if(/Journal$/.test(k)||['careerLog','record','recordedAt','pathNotes143'].includes(k))delete n[k];return n;}
function standings(cup){const rows=cup.entrants.map((p,index)=>({id:p.id,name:p.name,index,points:0,wins:0,valid:0,places:[0,0,0,0,0,0]}));for(const r of cup.results)for(const n of r.finish){const p=rows.find(x=>x.id===n.id);p.points+=n.points;p.valid+=Number(n.valid);if(n.valid){p.places[n.place-1]++;if(n.place===1)p.wins++;}}rows.sort((a,b)=>b.points-a.points||b.places.map((v,i)=>v-a.places[i]).find(x=>x)||b.valid-a.valid||a.index-b.index);let rank=0;return rows.map((p,i)=>{const prev=rows[i-1];if(!prev||prev.points!==p.points||prev.valid!==p.valid||prev.places.some((v,j)=>v!==p.places[j]))rank=i+1;return {...p,rank};});}
function start(s,ids,driverId,format,E){
 if(s.challenge145&&!s.challenge145.complete)return {error:'固定挑戦を終えてから通常大会を開始してください。'};
 if(!formats[format])return {error:'大会形式を選んでください。'};
 if(s.cup143&&!s.cup143.complete)return {error:'開催中の大会を続けるか、終了してください。'};
 if(s.quick&&!s.quick.race.done)return {error:'進行中のレースを終えてください。'};
 const unique=[...new Set(ids)],chosen=unique.map(id=>s.registry.find(p=>p.id===id));
 if(chosen.length<1||chosen.length>6||chosen.some(x=>!x)||!unique.includes(driverId))return {error:'登録選手を1〜6人、操船する選手をその中から選んでください。'};
 const seed=((s.cupSerial143||0)+1)*7919+(s.seed>>>0),c={seed:seed>>>0||143};
 const entrants=chosen.map(compact),base=Math.round(chosen.reduce((n,p)=>n+E.average(p),0)/chosen.length),skills=chosen.reduce((best,p)=>p.skills.length<best.length?p.skills:best,chosen[0].skills);
 while(entrants.length<6){const i=entrants.length,p=E.character(c,'招待選手 '+(i+1),base);p.id='cup143_guest_'+i;p.stats=Object.fromEntries(D.statKeys.map(k=>[k,Math.max(15,Math.min(100,p.stats[k]))]));p.skills=skills.filter(id=>D.abilityMap[id].category!=='弱点'&&D.rarities.indexOf(D.abilityMap[id].rarity)<=D.rarities.indexOf('SSR')).slice(0,3);p.difficulty='normal';entrants.push(p);}
 for(const p of entrants)p.equipment=E.equipment(c);
 const serial=(s.cupSerial143||0)+1;s.cupSerial143=serial;
 s.cup143={version:1,id:'cup143_'+serial,format,driverId,seed:c.seed,round:0,entrants,results:[],complete:false,awarded:false,venue:copy(D.venues[serial%D.venues.length]),raceId:null};s.quick=null;return s.cup143;
}
function prepare(s,E){const c=s.cup143;if(!c||c.complete)return {error:'開催中の大会がありません。'};if(s.quick?.cup143?.id===c.id&&s.quick.cup143.round===c.round)return s.quick;if(s.quick&&!s.quick.race.done)return {error:'先に進行中のレースを終えてください。'};
 const env=c.format==='rotation'?{weather:'晴れ',wind:'無風',windSpeed:0}:[{weather:'晴れ',wind:'無風',windSpeed:0},{weather:'曇り',wind:'向かい風',windSpeed:4},{weather:'晴れ',wind:'横風',windSpeed:5}][c.round];
 const r=E.makeRace(c,c.entrants,c.venue,env,'exhibition',c.driverId);r.difficulty='normal';r.courseLock143=c.format==='rotation';r.finalSpectator141=true;
 for(const p of r.runners){const i=c.entrants.findIndex(n=>n.id===p.id);p.frame=(i+c.round)%6+1;p.course=p.frame;}E.odds(r);c.raceId=r.id;
 s.quick={race:r,stake:0,betId:null,paid:false,payout:0,cup143:{id:c.id,round:c.round}};return s.quick;
}
function settle(s,E){const c=s.cup143,q=s.quick;if(!c||!q?.race.done||q.cup143?.id!==c.id||q.cup143.round!==c.round||q.race.id!==c.raceId||c.results.some(x=>x.raceId===q.race.id))return false;
 c.results.push({raceId:q.race.id,round:c.round,mode:E.Improve141.mode(q.race),finish:E.ordered(q.race).map((p,i)=>({id:p.id,place:i+1,valid:good(p),points:good(p)?points[i]:0,course:p.course}))});
 if(c.results.length===formats[c.format].races){c.complete=true;if(!c.awarded){c.awarded=true;const records=s.cupRecords143||(s.cupRecords143=[]);records.unshift({id:c.id,format:c.format,driverId:c.driverId,standings:standings(c).map(({id,name,rank,points,wins})=>({id,name,rank,points,wins})),results:copy(c.results)});records.splice(20);}}
 return true;
}
function next(s,E){const c=s.cup143;if(!c||c.complete||c.results.length!==c.round+1||!s.quick?.race.done||s.quick.cup143?.id!==c.id)return false;c.round++;c.raceId=null;s.quick=null;return true;}
function leave(s){if(s.quick?.cup143?.id===s.cup143?.id)s.quick=null;s.cup143=null;}
const integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,n=120)=>typeof v==='string'&&v.length>0&&v.length<=n;
function validResults(rs,ids,max){return Array.isArray(rs)&&rs.length<=max&&new Set(rs.map(r=>r.raceId)).size===rs.length&&rs.every((r,i)=>r&&str(r.raceId)&&r.round===i&&['manual','auto','assisted','spectator','skip','unknown','mixed'].includes(r.mode)&&Array.isArray(r.finish)&&r.finish.length===6&&new Set(r.finish.map(n=>n.id)).size===6&&new Set(r.finish.map(n=>n.course)).size===6&&r.finish.every((n,j)=>n&&ids.includes(n.id)&&n.place===j+1&&typeof n.valid==='boolean'&&n.points===(n.valid?points[j]:0)&&integer(n.course,1,6)));}
function valid(s,validPlayer,validEquipment){try{if(s.cupSerial143!==undefined&&!integer(s.cupSerial143,0,1000000))return false;
 const records=s.cupRecords143;if(records!==undefined&&(!Array.isArray(records)||records.length>20||new Set(records.map(x=>x.id)).size!==records.length||!records.every(r=>r&&str(r.id)&&formats[r.format]&&Array.isArray(r.standings)&&r.standings.length===6&&new Set(r.standings.map(x=>x.id)).size===6&&r.standings.some(x=>x.id===r.driverId)&&r.standings.every(x=>str(x.id)&&str(x.name,40)&&integer(x.rank,1,6)&&integer(x.points,0,60)&&integer(x.wins,0,6))&&validResults(r.results,r.standings.map(x=>x.id),formats[r.format].races)&&r.results.length===formats[r.format].races&&JSON.stringify(standings({entrants:r.standings,results:r.results}).map(({id,rank,points,wins})=>({id,rank,points,wins})))===JSON.stringify(r.standings.map(({id,rank,points,wins})=>({id,rank,points,wins}))))))return false;
 const c=s.cup143;if(c===undefined||c===null)return !s.quick?.cup143;
 if(c.version!==1||!str(c.id)||!formats[c.format]||!integer(c.seed,0,0xffffffff)||!integer(c.round,0,formats[c.format].races-1)||!Array.isArray(c.entrants)||c.entrants.length!==6||!c.entrants.every(p=>validPlayer(p)&&validEquipment(p.equipment))||new Set(c.entrants.map(p=>p.id)).size!==6||!c.entrants.some(x=>x.id===c.driverId)||!D.venues.some(v=>v.id===c.venue?.id)||!c.venue.stats||!Object.entries(c.venue.stats).every(([k,v])=>D.statKeys.includes(k)&&Number.isFinite(v))||!Number.isFinite(c.venue.lane)||!Number.isFinite(c.venue.roughness)||!validResults(c.results,c.entrants.map(x=>x.id),formats[c.format].races)||typeof c.complete!=='boolean'||typeof c.awarded!=='boolean'||c.complete!==(c.results.length===formats[c.format].races)||c.awarded!==c.complete||![c.round,c.round+1].includes(c.results.length)||!(c.raceId===null||str(c.raceId)))return false;
 if(s.quick?.cup143){const q=s.quick;if(q.cup143.id!==c.id||q.cup143.round!==c.round||q.race.id!==c.raceId||q.stake!==0||q.betId!==null||q.payout!==0||q.race.type!=='exhibition'||q.race.courseLock143!==(c.format==='rotation')||(c.results.length===c.round+1&&!q.race.done)||!q.race.runners.every(p=>c.entrants.some(x=>x.id===p.id))||q.race.runners.find(p=>p.isPlayer)?.id!==c.driverId)return false;}
 else if(c.raceId!==null)return false;
 return true;}catch(_){return false;}}
const api={formats,start,prepare,settle,next,leave,standings,valid,compact};root.KM_AFTER143=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
