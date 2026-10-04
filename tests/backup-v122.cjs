const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script'),report={build:'122',checks:[]};
const main='kyotei_monogatari_v80',prefix='kyotei_slots_v1',update=prefix+'_update',marker=prefix+'_protected_121';
function test(name,fn){fn();report.checks.push(name)}
function fixture(){const s=E.newState(122);s.build='121';return s;}
function disk(initial={}){const values=new Map(Object.entries(initial)),blocked=new Set(),writes=[];return {values,blocked,writes,getItem:k=>values.get(k)??null,setItem(k,v){writes.push(k);if(blocked.has(k))throw Object.assign(Error('quota'),{name:'QuotaExceededError'});values.set(k,String(v))},removeItem:k=>values.delete(k)}}
function open(d){const storage=E.createSafeStorage(()=>d,main);return {storage,slots:E.createSaveSlots(storage,prefix)}}
test('更新前バックアップ失敗時は保護済みマーカーを保存しない',()=>{
 const raw=JSON.stringify(fixture()),d=disk({[main]:raw}),{storage,slots}=open(d);d.blocked.add(update);slots.protect(raw);
 assert.equal(d.values.has(update),false);assert.equal(d.values.has(marker),false);assert.equal(storage.status(update).pending,true);assert.equal(storage.status(marker).pending,false);
 assert.equal(storage.set(main,JSON.stringify(E.newState(123))),true);assert.equal(storage.persistent,true);
});
test('失敗後に開き直しても保護済み扱いせずバックアップを再作成する',()=>{
 const raw=JSON.stringify(fixture()),d=disk({[main]:raw});d.blocked.add(update);open(d).slots.protect(raw);d.blocked.clear();
 const fresh=open(d);fresh.slots.protect(raw);assert.equal(JSON.parse(d.values.get(update)).raw,raw);assert.equal(d.values.get(marker),'1');assert.equal(fresh.storage.status(update).durable,true);
});
test('以前の誤ったマーカーだけが残っていても復元用データを作成する',()=>{
 const raw=JSON.stringify(fixture()),d=disk({[main]:raw,[marker]:'1'}),{slots}=open(d);slots.protect(raw);assert.equal(JSON.parse(d.values.get(update)).raw,raw);
});
test('別版のバックアップと古いマーカーの組合せで保護を省略しない',()=>{
 const raw=JSON.stringify(fixture()),older=fixture();older.build='120';const d=disk({[marker]:'1',[update]:JSON.stringify({raw:JSON.stringify(older),reason:'old',date:'old'})});open(d).slots.protect(raw);assert.equal(JSON.parse(d.values.get(update)).raw,raw);
});
test('壊れた更新前データをマーカーだけで正常と判断しない',()=>{
 const raw=JSON.stringify(fixture());for(const broken of ['not-json',JSON.stringify({raw:'not-json',reason:'old',date:'old'})]){const d=disk({[marker]:'1',[update]:broken});open(d).slots.protect(raw);assert.equal(JSON.parse(d.values.get(update)).raw,raw)}
});
test('バックアップ成功後のマーカー失敗でも原文が残り再試行できる',()=>{
 const raw=JSON.stringify(fixture(),null,2),d=disk({[main]:raw}),{storage,slots}=open(d);d.blocked.add(marker);slots.protect(raw);
 assert.equal(JSON.parse(d.values.get(update)).raw,raw);assert.equal(storage.status(update).durable,true);assert.equal(storage.status(marker).pending,true);d.blocked.clear();assert.equal(storage.retry().ok,true);assert.equal(d.values.get(marker),'1');
});
test('正常に保護済みなら同じ旧版の後続状態で原文を上書きしない',()=>{
 const a=fixture(),raw=JSON.stringify(a),d=disk({[main]:raw}),{slots}=open(d);slots.protect(raw);const protectedText=d.values.get(update),count=d.writes.filter(k=>k===update).length;a.coins+=100;slots.protect(JSON.stringify(a));assert.equal(d.values.get(update),protectedText);assert.equal(d.writes.filter(k=>k===update).length,count);
});
test('現行版の通常保存では更新前バックアップを追加しない',()=>{const d=disk(),{slots}=open(d);slots.protect(JSON.stringify(E.newState(122)));assert.equal(d.values.has(update),false)});
test('保存枠の失敗は失敗を返し、本体や他の保存枠を止めない',()=>{
 const d=disk(),{storage,slots}=open(d),s=E.newState(122);d.blocked.add(prefix+'_1');assert.equal(slots.save(1,s),false);assert.equal(storage.set(main,JSON.stringify(s)),true);assert.equal(slots.save(2,s),true);assert.equal(storage.persistent,true);assert.equal(storage.status(prefix+'_1').pending,true);d.blocked.clear();assert.equal(storage.retry().ok,true);assert.deepEqual(slots.load(1),s);
});
test('保存枠の上書き前の内容を復元用バックアップに保持する',()=>{
 const d=disk(),{slots}=open(d),a=E.newState(122),b=E.newState(123);assert.equal(slots.save(1,a),true);assert.equal(slots.save(1,b),true);const archive=slots.archives().find(x=>x.reason==='保存枠1の上書き前');assert.equal(archive.raw,JSON.stringify(a));assert.deepEqual(slots.load(1),b);
});
fs.writeFileSync(path.join(__dirname,'backup-v122.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
