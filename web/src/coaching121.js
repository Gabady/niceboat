
/* V121: read-only coaching and measured, loss-aware save transport. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const Storage122=root.KM_STORAGE||(typeof require==='function'?require('./storage122.js'):null);
const Review122=root.KM_REVIEW||(typeof require==='function'?require('./review122.js'):null);
const finite=v=>Number.isFinite(v)?v:0;

function support(player){
 const stats=player.stats,base=R.straightSupport(stats);
 const alternatives=['accel','power'].map(key=>{const amount=Math.min(5,Math.max(0,100-stats[key]));return {key,amount,effective:R.straightSupport({...stats,[key]:stats[key]+amount}).effective};});
 return {...base,speed:stats.speed,accel:stats.accel,power:stats.power,alternatives};
}
function advice(c){
 const p=c.player,z=c.lastResult,m=z?.driving?.metrics||{},v=support(p);
 let short={key:'accel',drill:'turn',evidence:'ターン出口の姿勢と舵の戻し方を試せます。',title:'出口からの再加速を確認',observed:false};
 if(z)short=Review122.review(z,p);
 else if(v.loss>.05){const key=p.stats.accel<=p.stats.power?'accel':'power';short={key,drill:'turn',title:'直線を支える'+D.stats[key],evidence:'基礎能力だけの直線換算は '+v.effective.toFixed(1)+'。加速・フィジカルの不足で伸びが抑えられています。',observed:false};}
 const paths=c.development?.paths||{};
 const developed=D.statKeys.filter(k=>paths[k]&&paths[k].branch!==null);
 const candidates=(developed.length>=2?developed:D.statKeys.filter(k=>paths[k]&&paths[k].branch===null)).sort((a,b)=>((paths[b].hints+paths[b].practice)-(paths[a].hints+paths[a].practice))||p.stats[b]-p.stats[a]);
 const key=candidates[0]||D.statKeys.slice().sort((a,b)=>p.stats[b]-p.stats[a])[0],q=paths[key];
 const long={key,title:D.stats[key]+(q?.branch!==null&&q?'の技を活かす':'の技を育てる'),evidence:q?(q.branch!==null?'開花した技を使う場面を確かめましょう。':(q.learned?'開花':'基礎習得')+'へ：コツ '+q.hints.toFixed(1)+' / '+(q.learned?5:2)+'、実践 '+q.practice.toFixed(1)+' / '+(q.learned?5:2)+'。'+(q.learned?'開花はG2以降、主軸2つまで。':'練習と有効完走で積み重ねます。')):'自分の得意を主軸に、次の技を選びましょう。'};
 return {short,long,support:v};
}

function createStorage(access,key){return Storage122.createStorage(access,key);}

// During an uninterrupted race the registered rosters cannot be edited. Reuse
// their serialized strings only for periodic saves; every explicit save refreshes.
function createSerializer(){
 const cache=new Map();
 return function serialize(state,periodic=false){
  return '{'+Object.keys(state).map(key=>{
   const value=state[key];let raw;
   if(key==='registry'||key==='rivals'){
    const old=cache.get(key);
    if(periodic&&old&&old.ref===value&&old.length===value.length)raw=old.raw;
    else{raw=JSON.stringify(value);cache.set(key,{ref:value,length:value.length,raw});}
   }else raw=JSON.stringify(value);
   return raw===undefined?null:JSON.stringify(key)+':'+raw;
  }).filter(Boolean).join(',')+'}';
 };
}

const API={support,advice,createStorage,createSerializer};
root.KM_COACHING=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

