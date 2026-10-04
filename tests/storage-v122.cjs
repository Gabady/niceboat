'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const S=require('../src/storage122.js');
const cases=[];
function test(name,fn){fn();cases.push(name);}
const quota=()=>Object.assign(new Error('full'),{name:'QuotaExceededError'});
function mock(initial={}){
 const values=new Map(Object.entries(initial)),blocks=new Map(),calls=[];
 return {values,blocks,calls,
  getItem(k){calls.push(['get',k]);if(blocks.get('get:'+k))throw blocks.get('get:'+k);return values.get(k)??null;},
  setItem(k,v){calls.push(['set',k]);if(blocks.get('set:'+k))throw blocks.get('set:'+k);values.set(k,String(v));},
  removeItem(k){calls.push(['remove',k]);if(blocks.get('remove:'+k))throw blocks.get('remove:'+k);values.delete(k);}
 };
}
test('backup failure does not block later main or slot writes',()=>{
 const d=mock(),s=S.createStorage(()=>d,'main');d.blocks.set('set:backup',quota());
 assert.equal(s.set('main','first'),true);assert.equal(s.set('backup','first'),false);
 assert.equal(s.persistent,true);assert.equal(s.failure,null);assert.equal(s.status('backup').pending,true);
 assert.equal(s.set('main','second'),true);assert.equal(s.set('slot1','slot'),true);
 assert.equal(d.values.get('main'),'second');assert.equal(d.values.get('slot1'),'slot');
 assert.deepEqual(s.failures(),[{key:'backup',operation:'set',kind:'capacity'}]);
});
test('partial retry attempts every key and retains only failed jobs',()=>{
 const d=mock(),s=S.createStorage(()=>d,'main');
 for(const k of ['main','backup','slot']){d.blocks.set('set:'+k,quota());s.set(k,k+'-new');}
 d.blocks.delete('set:main');d.blocks.delete('set:slot');
 const first=s.retry();assert.equal(first.ok,false);assert.equal(first.mainDurable,true);
 assert.deepEqual(first.succeeded,['main','slot']);assert.deepEqual(first.failed,['backup']);assert.deepEqual(first.pendingKeys,['backup']);
 d.blocks.delete('set:backup');const second=s.retry();assert.equal(second.ok,true);assert.deepEqual(second.succeeded,['backup']);
 assert.deepEqual(s.failures(),[]);assert.equal(d.values.get('backup'),'backup-new');
});
test('full storage can read existing data without creating a probe',()=>{
 const d=mock({main:'existing'});const write=d.setItem.bind(d);d.setItem=(k,v)=>{if(k.endsWith('_probe'))throw quota();write(k,v);};
 const s=S.createStorage(()=>d,'main');assert.equal(s.get('main'),'existing');assert.equal(s.persistent,true);
 assert.equal(s.set('main','replacement'),true);assert.equal(d.calls.some(c=>c[1].endsWith('_probe')),false);
});
test('memory retains newest failed save and next direct write can recover',()=>{
 const d=mock({main:'old'}),s=S.createStorage(()=>d,'main');d.blocks.set('set:main',quota());
 assert.equal(s.set('main','new'),false);assert.equal(s.persistent,false);assert.equal(s.get('main'),'new');assert.equal(d.values.get('main'),'old');
 d.blocks.delete('set:main');assert.equal(s.set('main','newest'),true);assert.equal(s.persistent,true);assert.equal(s.failure,null);assert.deepEqual(s.summary().pendingKeys,[]);
});
test('failed read preserves cached value and recovers independently',()=>{
 const d=mock({main:'saved',slot:'slot-old'}),s=S.createStorage(()=>d,'main');s.get('slot');
 d.blocks.set('get:main',new Error('access denied'));d.blocks.set('get:slot',new Error('access denied'));
 assert.equal(s.get('main'),'saved');assert.equal(s.get('slot'),'slot-old');assert.equal(s.persistent,false);
 d.blocks.delete('get:main');const r=s.retry();assert.equal(r.mainDurable,true);assert.equal(r.ok,false);assert.deepEqual(r.failed,['slot']);
 d.blocks.delete('get:slot');assert.equal(s.retry().ok,true);
});
test('unavailable storage at startup can recover without losing queued values',()=>{
 const d=mock();let unavailable=true;const s=S.createStorage(()=>{if(unavailable)throw new Error('blocked');return d;},'main');
 assert.equal(s.persistent,false);assert.equal(s.set('main','memory'),false);assert.equal(s.get('main'),'memory');
 unavailable=false;const r=s.retry();assert.equal(r.mainDurable,true);assert.equal(r.ok,true);assert.equal(d.values.get('main'),'memory');
});
test('deletion is retried without restoring an old value',()=>{
 const d=mock({main:'live',backup:'old'}),s=S.createStorage(()=>d,'main');d.blocks.set('remove:backup',new Error('blocked'));
 assert.equal(s.remove('backup'),false);assert.equal(s.get('backup'),null);assert.equal(d.values.get('backup'),'old');assert.equal(s.status('backup').operation,'remove');
 assert.equal(s.set('main','later'),true);d.blocks.delete('remove:backup');assert.equal(s.retry().ok,true);assert.equal(d.values.has('backup'),false);
});
test('a newer set supersedes queued deletion and newer deletion supersedes a set',()=>{
 const d=mock({main:'live',slot:'old'}),s=S.createStorage(()=>d,'main');d.blocks.set('remove:slot',quota());s.remove('slot');
 assert.equal(s.set('slot','new'),true);assert.equal(s.get('slot'),'new');d.blocks.delete('remove:slot');s.retry();assert.equal(d.values.get('slot'),'new');
 d.blocks.set('set:slot',quota());s.set('slot','pending');assert.equal(s.remove('slot'),true);assert.equal(s.get('slot'),null);assert.deepEqual(s.summary().pendingKeys,[]);
});
test('listeners see both failed and restored states, and cannot break saving',()=>{
 const d=mock(),s=S.createStorage(()=>d,'main'),events=[];const unsubscribe=s.subscribe(x=>events.push(x));s.subscribe(()=>{throw Error('UI failure');});
 d.blocks.set('set:main',quota());assert.equal(s.set('main','value'),false);d.blocks.delete('set:main');assert.equal(s.retry().ok,true);
 assert.equal(events[0].persistent,false);assert.equal(events.at(-1).persistent,true);assert.ok(events.at(-1).serial>events[0].serial);
 unsubscribe();const n=events.length;s.set('main','next');assert.equal(events.length,n);
});
test('status snapshots cannot mutate internal failures or pending queues',()=>{
 const d=mock(),s=S.createStorage(()=>d,'main');d.blocks.set('set:main',quota());s.set('main','new');
 s.status('main').failure.kind='altered';s.summary().pendingKeys.length=0;s.failures()[0].key='altered';
 assert.equal(s.status('main').failure.kind,'capacity');assert.deepEqual(s.summary().pendingKeys,['main']);
});
test('file bytes and text validation agree for Japanese, emoji and lone surrogates',()=>{
 for(const str of ['plain','競艇物語','雨の水面🌧️🚤','\ud800','\udc00','\ud800x','\ud800\udc00'])assert.equal(S.byteLength(str),Buffer.byteLength(str,'utf8'));
 const limit='あ'.repeat(5000000);assert.equal(S.byteLength(limit),S.SAVE_MAX_BYTES);assert.equal(S.assertSize(limit),S.SAVE_MAX_BYTES);
 assert.throws(()=>S.assertSize(limit+'c'),/大きすぎ/);assert.throws(()=>S.byteLength({}),TypeError);
});
test('UTF-8 fallback matches TextEncoder without browser-only dependencies',()=>{
 const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/storage122.js'),'utf8'),sandbox);
 for(const str of ['日本語🚤','\ud800x\udc00','🌧️','ASCII'])assert.equal(sandbox.KM_STORAGE.byteLength(str),Buffer.byteLength(str,'utf8'));
});

const report={build:'122',suite:'per-key storage and UTF-8 limits',passed:cases.length,cases};
fs.writeFileSync(path.join(__dirname,'storage-v122.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
