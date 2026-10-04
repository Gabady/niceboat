
/* V122: bounded practice comparisons. Pure helpers; no career writes, clocks or RNG. */
(function(root){'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const KINDS=['start','turn','wake'],LIMITS=Object.freeze({groups:12,attempts:3,keyChars:32768,total:1000000000});
const defs={
 start:[['st','ST','秒',3,'lower']],
 turn:[['time','区間時間','秒',2,'lower'],['exitSpeed','出口速度','km/h',1,'higher'],['slideSeconds','横滑り','秒',1,'lower'],['contacts','接触','回',0,'lower'],['boundaries','境界接触','回',0,'lower']],
 wake:[['wakeSeconds','引き波内','秒',1,'lower'],['contacts','接触','回',0,'lower'],['time','区間時間','秒',2,'lower'],['boundaries','境界接触','回',0,'lower']]
};
const bounds={st:[-12,1.5],time:[0,283],exitSpeed:[0,540],slideSeconds:[0,283],contacts:[0,10000],boundaries:[0,10000],wakeSeconds:[0,283]};
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
const empty=()=>({version:1,groups:[]});
function metrics(kind){return (defs[kind]||[]).map(([id,label,unit,precision,better])=>({id,label,unit,precision,better}));}
function canonical(value,depth=0){
 if(depth>24)throw Error('Deep practice condition');
 if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
 if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Invalid practice condition');return JSON.stringify(value);}
 if(Array.isArray(value))return '['+value.map(x=>canonical(x,depth+1)).join(',')+']';
 if(object(value))return '{'+Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>JSON.stringify(k)+':'+canonical(value[k],depth+1)).join(',')+'}';
 throw Error('Unsupported practice condition');
}
function pick(o,keys){const p={};for(const k of keys)if(o[k]!==undefined)p[k]=o[k];return p;}
function boatValid(b){return object(b)&&typeof b.isPlayer==='boolean'&&object(b.stats)&&['speed','turn','start','accel','power'].every(k=>finite(b.stats[k],0,150))&&Array.isArray(b.skills)&&b.skills.length<=200&&b.skills.every(x=>typeof x==='string'&&x.length<100)&&object(b.mastery)&&Object.values(b.mastery).every(v=>finite(v,0,10000))&&object(b.equipment)&&['motor','prop','boat'].every(k=>object(b.equipment[k])&&Object.values(b.equipment[k]).every(v=>finite(v,-100,100)))&&Number.isInteger(b.course)&&finite(b.course,1,6)&&Number.isInteger(b.frame)&&finite(b.frame,1,6);}
function descriptorValid(c){return object(c)&&[1,2,3].includes(c.revision)&&KINDS.includes(c.kind)&&typeof c.assisted==='boolean'&&object(c.race)&&c.race.drill===c.kind&&finite(c.race.practiceLimit,1,1800)&&object(c.race.env)&&typeof c.race.env.weather==='string'&&typeof c.race.env.wind==='string'&&finite(c.race.env.windSpeed,0,100)&&object(c.drive)&&finite(c.drive.elapsed,0,283)&&Number.isInteger(c.drive.seed)&&finite(c.drive.seed,0,4294967295)&&Array.isArray(c.boats)&&c.boats.length===6&&c.boats.every(boatValid)&&c.boats.filter(b=>b.isPlayer).length===1&&new Set(c.boats.map(b=>b.course)).size===6&&new Set(c.boats.map(b=>b.frame)).size===6;}
function initial(t){
 const r=t?.initial,d=r?.drive;
 if(!KINDS.includes(t?.kind)||!object(r)||!object(d)||r.drill!==t.kind||!finite(r.practiceLimit,1,1800)||!finite(d.elapsed,0,283)||!Array.isArray(d.boats)||d.boats.length!==6||d.boats.filter(b=>b?.isPlayer).length!==1)return null;
 return {r,d,b:d.boats.find(b=>b.isPlayer)};
}
function conditionKey(t){
 const a=initial(t);if(!a)return null;
 try{
  const {r,d}=a,ids=new Map(d.boats.map((b,i)=>[b.id,i]));
  // IDs identify peers, not conditions. Resolve those references to stable boat slots.
  const ref=x=>ids.has(x)?ids.get(x):x==null?null:'unmatched:'+x;
  const boats=d.boats.map(b=>{
   const v={};for(const k of Object.keys(b))if(!['id','name','portraitKey','metrics','activations','interference','phaseHistory','savedAt','createdAt','updatedAt'].includes(k))v[k]=b[k];
   v.earlyStart=R.earlyStart(b);v.allowance=R.startAllowance(b);
   if(Array.isArray(v.effects))v.effects=v.effects.map(e=>({...e,...('source' in e?{source:ref(e.source)}:{})}));
   // Initial counters matter when computing the delta for a short segment.
   v.metrics=pick(b.metrics||{},['contacts','boundaries','slideSeconds','wakeSeconds']);
   return v;
  });
  // Increase revision if a later update changes driving rules for these conditions.
  const descriptor={revision:3,kind:t.kind,assisted:!!t.assistUsed,
   race:pick(r,['drill','practiceLimit','type','grade','env','buff','itemBoost','strategy','tilt','difficulty','controlMode','startPolicy','watch','auto']),
   venue:pick(r.venue||{},['id','stats','roughness','lane']),
   finalAlliance:ref(r.finalAlliance),
   drive:pick(d,['version','progressRule','seed','frame','elapsed','startAt','countdown','started','laps','goal','controls','wakeClock']),
   wakes:(d.wakes||[]).map(w=>({...w,owner:ref(w.owner)})),boats};
  // Keep the exact canonical condition, avoiding hash collisions between unlike runs.
  const key='p122:'+canonical(descriptor);return descriptorValid(descriptor)&&key.length<=LIMITS.keyChars?key:null;
 }catch(_){return null;}
}
function summarize(t){
 const a=initial(t),r=t?.r,d=r?.drive,b=Array.isArray(d?.boats)?d.boats.find(n=>n?.isPlayer):null;
 if(!a||r.drill!==t.kind||!object(b)||!finite(d.elapsed,a.d.elapsed,283))return null;
 const m=b.metrics||{},m0=a.b.metrics||{},delta=k=>finite(m[k],0,10000000)&&finite(m0[k]??0,0,10000000)?Math.max(0,m[k]-(m0[k]||0)):null;
 const st=finite(b.startTime,-12,283)?b.startTime:null,legal=st!==null&&st>=-R.startAllowance(b)-1e-7&&st<R.C.lateLimit-1e-7;
 const completed=d.finished===true&&d.elapsed>a.d.elapsed&&r.practiceLimit===a.r.practiceLimit&&finite(b.progress,r.practiceLimit,2800)&&!b.startFault&&!b.capsized&&!b.dnf&&legal;
 const status=b.startFault==='F'||st!==null&&st< -R.startAllowance(b)-1e-7?'F':b.startFault==='L'||st!==null&&st>=R.C.lateLimit-1e-7?'L':b.capsized?'capsized':b.dnf?'dnf':completed?'complete':'unfinished';
 const result={kind:t.kind,completed,status,metrics:{st,time:d.elapsed-a.d.elapsed,exitSpeed:completed&&finite(b.speed,0,150)?b.speed*3.6:null,slideSeconds:delta('slideSeconds'),contacts:delta('contacts'),boundaries:delta('boundaries'),wakeSeconds:delta('wakeSeconds')}};
 // Invalid counters cannot become a record; failed/unfinished ST remains visible.
 if(completed&&metrics(t.kind).some(q=>!metricValid(q.id,result.metrics[q.id])))return {...result,completed:false,status:'unfinished'};
 return result;
}
function metricValid(id,value){const b=bounds[id];return !!b&&finite(value,b[0],b[1])&&(!['contacts','boundaries'].includes(id)||Number.isInteger(value));}
function cleanSummary(a,kind){
 if(!object(a)||a.kind!==kind||typeof a.completed!=='boolean'||!['complete','F','L','capsized','dnf','unfinished'].includes(a.status)||a.completed!==(a.status==='complete')||!object(a.metrics))return null;
 const m={};for(const k of Object.keys(bounds)){const v=a.metrics[k];m[k]=metricValid(k,v)?v:null;}
 if(a.completed&&metrics(kind).some(q=>m[q.id]===null))return null;
 // Every completed drill must have a valid start; faults never enter the best table.
 if(a.completed&&(m.st===null||m.st>=R.C.lateLimit-1e-7))return null;
 return {kind,completed:a.completed,status:a.status,metrics:m};
}
function cleanBest(b,kind){if(!object(b))return null;const v={};for(const q of metrics(kind))if(metricValid(q.id,b[q.id])&&(q.id!=='time'||b[q.id]>0))v[q.id]=b[q.id];return Object.keys(v).length?v:null;}
function improved(id,value,old){return old==null||((defs.start.concat(defs.turn,defs.wake).find(q=>q[0]===id)?.[4]==='higher')?value>old+1e-7:value<old-1e-7);}
function updateBest(best,current){
 const next=best?{...best}:{};
 if(current.completed)for(const q of metrics(current.kind)){const v=current.metrics[q.id];if(metricValid(q.id,v)&&improved(q.id,v,next[q.id]))next[q.id]=v;}
 return Object.keys(next).length?next:null;
}
function sanitize(raw){
 if(!object(raw)||raw.version!==1||!Array.isArray(raw.groups))return empty();
 const groups=[];
 for(const a of raw.groups.slice(-LIMITS.groups)){
  if(!object(a)||!KINDS.includes(a.kind)||typeof a.key!=='string'||!a.key.startsWith('p122:')||a.key.length>LIMITS.keyChars||!Array.isArray(a.attempts))continue;
  // Check the structural identity as well as the string prefix on imported data.
  let condition;try{condition=JSON.parse(a.key.slice(5));if(!descriptorValid(condition)||condition.kind!==a.kind||'p122:'+canonical(condition)!==a.key)continue;}catch(_){continue;}
  const player=condition.boats.find(b=>b.isPlayer);
  // Preserve V122–V124 records under their captured rule; revision 3 never compares with them.
  const allowance=condition.revision<3&&finite(player.allowance,0,.30)?player.allowance:R.startAllowance(player);
  const attempts=a.attempts.slice(-LIMITS.attempts).map(x=>cleanSummary(x,a.kind)).filter(x=>x&&(!x.completed||x.metrics.st>=-allowance-1e-7&&x.metrics.time>0));
  let best=cleanBest(a.best,a.kind);if(best?.st!=null&&(best.st< -allowance-1e-7||best.st>=R.C.lateLimit-1e-7))delete best.st;
  if(best&&Object.keys(best).length===0)best=null;
  for(const x of attempts)best=updateBest(best,x);
  if(!attempts.length&&!best)continue;
  const group={key:a.key,kind:a.kind,attempts,best,total:Number.isInteger(a.total)&&finite(a.total,attempts.length,LIMITS.total)?a.total:attempts.length};
  const duplicate=groups.findIndex(g=>g.key===a.key);if(duplicate>=0)groups.splice(duplicate,1);groups.push(group);
 }
 return {version:1,groups};
}
function history(store,t){const key=conditionKey(t);return key?sanitize(store).groups.find(g=>g.key===key)||null:null;}
function difference(current,reference,kind){const out={};for(const q of metrics(kind)){const a=current?.[q.id],b=reference?.[q.id];out[q.id]=metricValid(q.id,a)&&metricValid(q.id,b)?a-b:null;}return out;}
function compareGroup(group,current){
 const previous=group?.attempts.at(-1)||null,bestBefore=group?.best||null,best=updateBest(bestBefore,current);
 return {current,previous,best,bestBefore,
  deltas:{previous:difference(current.completed?current.metrics:null,previous?.completed?previous.metrics:null,current.kind),best:difference(current.completed?current.metrics:null,bestBefore,current.kind)},
  personalBests:current.completed?metrics(current.kind).filter(q=>improved(q.id,current.metrics[q.id],bestBefore?.[q.id])).map(q=>q.id):[],
  first:!group,attempts:Math.min(LIMITS.total,(group?.total||0)+1)};
}
function compare(store,t){const current=summarize(t);return current&&conditionKey(t)?compareGroup(history(store,t),current):null;}
function record(raw,t){
 const store=sanitize(raw),key=conditionKey(t),current=summarize(t);
 if(!key||!current)return {store,comparison:null};
 const old=store.groups.find(g=>g.key===key),comparison=compareGroup(old,current);
 const group={key,kind:t.kind,attempts:[...(old?.attempts||[]),current].slice(-LIMITS.attempts),best:comparison.best,total:comparison.attempts};
 return {store:{version:1,groups:[...store.groups.filter(g=>g.key!==key),group].slice(-LIMITS.groups)},comparison};
}
const API={conditionKey,summarize,compare,record,history,sanitize,metrics,limits:LIMITS};
root.KM_PRACTICE122=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);

