
/* V122: each save destination succeeds or retries independently. */
(function(root){
'use strict';

// The old decoder accepted 5,000,000 UTF-16 units. 15 MB retains its largest
// Japanese payloads while giving file and pasted imports one UTF-8 byte limit.
const SAVE_MAX_BYTES=15000000;
function byteLength(text){
 if(typeof text!=='string')throw new TypeError('セーブデータは文字列で指定してください。');
 if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(text).length;
 // UTF-8, including replacement characters for unpaired UTF-16 surrogates.
 let bytes=0;
 for(let i=0;i<text.length;i++){
  const n=text.charCodeAt(i);
  if(n<0x80)bytes++;
  else if(n<0x800)bytes+=2;
  else if(n>=0xd800&&n<=0xdbff&&i+1<text.length&&text.charCodeAt(i+1)>=0xdc00&&text.charCodeAt(i+1)<=0xdfff){bytes+=4;i++;}
  else bytes+=3;
 }
 return bytes;
}
function assertSize(text){
 const bytes=byteLength(text);
 if(bytes>SAVE_MAX_BYTES)throw new Error('セーブデータのサイズが大きすぎます（上限 '+(SAVE_MAX_BYTES/1000000)+' MB）。');
 return bytes;
}

function createStorage(access,mainKey){
 const memory=Object.create(null),pending=new Map(),records=new Map(),listeners=new Set();
 let serial=0;
 const record=k=>{if(!records.has(k))records.set(k,{known:false,failure:null,lastDurableAt:null});return records.get(k);};
 function status(k){
  const r=record(k),p=pending.get(k);
  return {key:k,durable:r.known&&!p&&!r.failure,pending:!!p,operation:p?.operation||null,
   failure:r.failure?{...r.failure}:null,lastDurableAt:r.lastDurableAt};
 }
 function failures(){return [...records.values()].filter(r=>r.failure).map(r=>({...r.failure}));}
 function summary(){return {mainDurable:status(mainKey).durable,pendingKeys:[...pending.keys()],failures:failures()};}
 function emit(){serial++;const s={...summary(),persistent:status(mainKey).durable,failure:status(mainKey).failure,serial};for(const fn of listeners){try{fn(s);}catch(_){}}}
 function fail(e,k,operation){
  record(k).failure={key:k,operation,kind:e?.name==='QuotaExceededError'||e?.code===22||e?.code===1014?'capacity':'unavailable'};
  emit();
 }
 function get(k){
  // A failed write remains the newest value, even if the disk still contains an older one.
  if(pending.has(k))return memory[k]??null;
  try{
   const value=access().getItem(k),r=record(k),recovering=!!r.failure;
   if(value===null)delete memory[k];else memory[k]=String(value);
   r.known=true;r.failure=null;
   if(recovering)emit();
   return memory[k]??null;
  }catch(e){fail(e,k,'get');return memory[k]??null;}
 }
 function commit(k){
  const job=pending.get(k);if(!job)return status(k).durable;
  try{
   const disk=access();
   if(job.operation==='remove')disk.removeItem(k);else disk.setItem(k,job.value);
   pending.delete(k);const r=record(k);r.known=true;r.failure=null;r.lastDurableAt=new Date().toISOString();emit();return true;
  }catch(e){fail(e,k,job.operation);return false;}
 }
 function set(k,value){
  const text=String(value);memory[k]=text;pending.set(k,{operation:'set',value:text});return commit(k);
 }
 function remove(k){delete memory[k];pending.set(k,{operation:'remove'});return commit(k);}
 function retry(){
  const succeeded=[],failed=[];
  // Main progress gets the first attempt. A failed destination never blocks another.
  const keys=[...pending.keys()].sort((a,b)=>a===mainKey?-1:b===mainKey?1:0);
  for(const k of keys)(commit(k)?succeeded:failed).push(k);
  // Security/read failures may have no queued write to retry.
  for(const [k,r] of records){
   if(r.failure?.operation!=='get'||pending.has(k))continue;
   get(k);(status(k).durable?succeeded:failed).push(k);
  }
  const s=summary();return {ok:s.pendingKeys.length===0&&s.failures.length===0,...s,succeeded,failed};
 }
 // Reading an existing save still works when storage is full; no quota-consuming probe.
 get(mainKey);
 return {
  get persistent(){return status(mainKey).durable;},get failure(){return status(mainKey).failure;},get serial(){return serial;},
  get,set,remove,retry,status,failures,summary,
  subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
 };
}

const API={SAVE_MAX_BYTES,byteLength,assertSize,createStorage};
root.KM_STORAGE=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

