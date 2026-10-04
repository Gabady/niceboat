
/* V121: read-only coaching and measured, loss-aware save transport. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const finite=v=>Number.isFinite(v)?v:0;

function support(player){
 const stats=player.stats,base=R.straightSupport(stats);
 const alternatives=['accel','power'].map(key=>{const amount=Math.min(5,Math.max(0,100-stats[key]));return {key,amount,effective:R.straightSupport({...stats,[key]:stats[key]+amount}).effective};});
 return {...base,speed:stats.speed,accel:stats.accel,power:stats.power,alternatives};
}
function advice(c){
 const p=c.player,z=c.lastResult,m=z?.driving?.metrics||{},v=support(p);
 let short={key:'accel',drill:'turn',evidence:'ターン出口の姿勢と舵の戻し方を試せます。',title:'出口からの再加速を確認',observed:false};
 if(z?.startFault)short={key:'start',drill:'start',title:'スタートを合わせる',evidence:'前走は'+z.startFault+'。時計の帯と踏み始めを確認します。',observed:true};
 else if(z?.capsized||finite(m.slideSeconds)>3||finite(m.boundaries)>0)short={key:'turn',drill:'turn',title:'ターンの余白をつくる',evidence:z?.capsized?'前走は転覆。進入速度・姿勢・艇間を確認します。':'前走の横滑り '+finite(m.slideSeconds).toFixed(1)+'秒 / 境界接触 '+finite(m.boundaries)+'回。旋回不足だけが原因とは限りません。',observed:true};
 else if(finite(m.wakeSeconds)>3||finite(m.contacts)>0)short={key:'power',drill:'wake',title:'波と艇間への対処を試す',evidence:'前走の引き波 '+finite(m.wakeSeconds).toFixed(1)+'秒 / 他艇接触 '+finite(m.contacts)+'回。進路選びでも対処できます。',observed:true};
 else if(v.loss>.05){const key=p.stats.accel<=p.stats.power?'accel':'power';short={key,drill:'turn',title:'直線を支える'+D.stats[key],evidence:'基礎能力だけの直線換算は '+v.effective.toFixed(1)+'。加速・フィジカルの不足で伸びが抑えられています。',observed:false};}
 else if(z)short={key:'accel',drill:'turn',title:'得意区間をもう一度確認',evidence:'今回の記録だけでは主な敗因を特定できません。出口の舵と姿勢を同じ条件で試せます。',observed:true};
 const paths=c.development?.paths||{};
 const developed=D.statKeys.filter(k=>paths[k]&&paths[k].branch!==null);
 const candidates=(developed.length>=2?developed:D.statKeys.filter(k=>paths[k]&&paths[k].branch===null)).sort((a,b)=>((paths[b].hints+paths[b].practice)-(paths[a].hints+paths[a].practice))||p.stats[b]-p.stats[a]);
 const key=candidates[0]||D.statKeys.slice().sort((a,b)=>p.stats[b]-p.stats[a])[0],q=paths[key];
 const long={key,title:D.stats[key]+(q?.branch!==null&&q?'の技を活かす':'の技を育てる'),evidence:q?(q.branch!==null?'開花した技を使う場面を確かめましょう。':(q.learned?'開花':'基礎習得')+'へ：コツ '+q.hints.toFixed(1)+' / '+(q.learned?5:2)+'、実践 '+q.practice.toFixed(1)+' / '+(q.learned?5:2)+'。'+(q.learned?'開花はG2以降、主軸2つまで。':'練習と有効完走で積み重ねます。')):'自分の得意を主軸に、次の技を選びましょう。'};
 return {short,long,support:v};
}

function createStorage(access,key){
 const memory=Object.create(null),dirty=new Map(),deleted=new Set(),listeners=new Set();
 let persistent=true,failure=null,serial=0;
 const emit=()=>{for(const fn of listeners){try{fn({persistent,failure,serial});}catch(_){}}};
 const fail=(e,k)=>{persistent=false;failure={key:k,kind:e?.name==='QuotaExceededError'||e?.code===22?'capacity':'unavailable'};serial++;emit();};
 try{const disk=access();disk.setItem(key+'_probe','1');disk.removeItem(key+'_probe');}catch(e){fail(e,key);}
 return {
  get persistent(){return persistent;},get failure(){return failure;},get serial(){return serial;},
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},
  get(k){if(!dirty.has(k)&&!deleted.has(k)){try{const value=access().getItem(k);if(value!==null)memory[k]=value;else delete memory[k];return value;}catch(e){fail(e,k);}}return memory[k]??null;},
  set(k,v){memory[k]=v;dirty.set(k,v);deleted.delete(k);if(persistent){try{access().setItem(k,v);dirty.delete(k);return true;}catch(e){fail(e,k);}}return false;},
  remove(k){delete memory[k];dirty.delete(k);deleted.add(k);if(persistent){try{access().removeItem(k);deleted.delete(k);return true;}catch(e){fail(e,k);}}return false;},
  retry(){
   try{const disk=access();disk.setItem(key+'_probe','1');disk.removeItem(key+'_probe');for(const k of deleted)disk.removeItem(k);for(const [k,v] of dirty)disk.setItem(k,v);deleted.clear();dirty.clear();persistent=true;failure=null;serial++;emit();return true;}catch(e){fail(e,key);return false;}
  }
 };
}

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

