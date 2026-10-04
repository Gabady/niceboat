'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script.js'),I=require('../src/introductions126.js'),Dialogue=require('../src/dialogue.js');
const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/introductions-v125.json'),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const report={build:'126',scope:'繰り返し登場する5人の初紹介・既読化・再開・旧セーブ移行',checks:[]};
function test(name,fn){fn();report.checks.push(name);}
function fresh(){const s=E.newState(12600),p=E.character(s,'紹介検証');p.scenario='light';E.createCareer(s,p);return s;}
function scene(id,key='first:'+id){return {key,title:'最初の会話',person:{id},body:[I.definitions[id].names[0]+'「今日の話をしよう」']};}
function withoutIntros(c){const out=clone(c);delete out.story.introductions;return out;}
test('新規育成は誰とも未紹介で始まり、5人それぞれに役割の明確な4行を持つ',()=>{
 const c=fresh().career;assert.deepEqual(c.story.introductions,{version:1,known:[],scenes:[]});assert.ok(I.valid(c.story.introductions));assert.equal(I.ids.length,5);
 for(const id of I.ids){const sc=scene(id),z=I.prepare(c,sc);assert.equal(z.changed,true);assert.deepEqual(z.scene.body.slice(0,4),I.definitions[id].body);assert.equal(z.scene.body.at(-1),sc.body[0]);assert.equal(I.definitions[id].body.length,4);assert.equal(I.known(c,id),false);assert.ok(z.scene.body.some(x=>x.startsWith('主人公')));}
 assert.match(I.definitions.asakura.body.join(''),/先輩選手/);assert.doesNotMatch(I.definitions.asakura.body.join(''),/師匠|弟子/);assert.match(I.definitions.shinohara.body.join(''),/整備士/);assert.match(I.definitions.natsu.body.join(''),/地元/);
});
test('開くだけ・紹介途中で閉じるだけでは既知化せず、人物ごとの紹介末尾で一度だけ既知化',()=>{
 for(const id of I.ids){const c=fresh().career,z=I.prepare(c,scene(id)),at=z.scene._introductions126.marks[0].through;assert.equal(I.read(c,z.scene,0),false);assert.equal(I.read(c,z.scene,at-1),false);assert.equal(I.known(c,id),false);assert.equal(I.read(c,z.scene,at),true);assert.equal(I.known(c,id),true);assert.equal(I.read(c,z.scene,at),false);const next=scene(id,'second:'+id),later=I.prepare(c,next);assert.strictEqual(later.scene,next);assert.equal(later.changed,false);}
});
test('同じ準備済み本文の再レンダーで二重挿入せず、読了後の同じ場面も本文としおりが変わらない',()=>{
 const c=fresh().career,sc=scene('natsu'),first=I.prepare(c,sc),book=c.development.readers,pages=Dialogue.pages(first.scene.body);assert.strictEqual(I.prepare(c,first.scene).scene,first.scene);assert.equal(I.prepare(c,first.scene).changed,false);Dialogue.remember(book,Dialogue.bookmark(sc.key),3);I.read(c,first.scene,3);
 const later=I.prepare(c,sc,{book});assert.deepEqual(later.scene.body,first.scene.body);assert.equal(later.changed,false);assert.equal(Dialogue.cursor(book,Dialogue.bookmark(sc.key),pages.length),3);
});
test('中断保存・decode・元本文から再開しても紹介の位置と未読状態を保持する',()=>{
 let s=fresh(),c=s.career,sc=scene('shinohara'),z=I.prepare(c,sc);Dialogue.remember(c.development.readers,Dialogue.bookmark(sc.key),1);I.read(c,z.scene,1);const before=clone(z.scene.body);assert.ok(E.validState(s));s=E.decode(JSON.stringify(s));c=s.career;z=I.prepare(c,sc,{book:c.development.readers});assert.deepEqual(z.scene.body,before);assert.equal(I.known(c,'shinohara'),false);assert.equal(Dialogue.cursor(c.development.readers,Dialogue.bookmark(sc.key),Dialogue.pages(z.scene.body).length),1);assert.ok(E.validState(s));
});
test('active journalの初読も紹介する。登録選手や明示的記録再読は現在育成の関係を変更しない',()=>{
 const c=fresh().career,sc=scene('asakura','journal:123');assert.equal(I.prepare(c,sc).changed,true);const before=clone(c);for(const opts of [{record:true}]){const original=scene('shinohara','journal:456');assert.strictEqual(I.prepare(c,original,opts).scene,original);}assert.equal(I.prepare(c,{...scene('nanase'),registry:'archived-player'}).changed,false);assert.equal(I.prepare(c,{...scene('hiiragi'),record:true}).changed,false);assert.deepEqual(c,before);
});
test('複数人が初登場する本文は各紹介を一度だけ加え、後の人物まで先に既知化しない',()=>{
 const c=fresh().career,sc={key:'two-people',body:['篠原が朝倉を呼んだ。朝倉「一緒に確かめよう」']},z=I.prepare(c,sc);assert.deepEqual(z.scene._introductions126.marks.map(x=>x.id),['asakura','shinohara']);assert.equal(I.read(c,z.scene,3),true);assert.equal(I.known(c,'asakura'),true);assert.equal(I.known(c,'shinohara'),false);assert.equal(I.read(c,z.scene,7),true);assert.equal(I.known(c,'shinohara'),true);assert.deepEqual(I.prepare(c,sc).scene.body,z.scene.body);
});
test('紹介表示では能力・報酬・好感度・行動回数・乱数を一切変えない',()=>{
 const c=fresh().career,before=withoutIntros(c);for(const id of I.ids){const z=I.prepare(c,scene(id));I.read(c,z.scene,3);}assert.deepEqual(withoutIntros(c),before);
});
test('本物のV125会話完了実績から接触済みの2人だけを移行し、未読の章ログは出会いとみなさない',()=>{
 assert.equal(legacy.createdUsingBuild,'125');for(const [label,expected] of [['unseen',[]],['completed',['shinohara','natsu']]]){const old=clone(legacy[label].career),before=withoutIntros(old);E.Story.ensure(old);assert.deepEqual(old.story.introductions.known,expected);assert.deepEqual(withoutIntros(old),before);assert.ok(E.Story.valid(old.story));const again=clone(old);E.Story.ensure(old);assert.deepEqual(old,again);}
});
test('本物のV125会話途中しおりは原文のまま再開し、未紹介扱いでページがずれない',()=>{
 const c=clone(legacy.interrupted.career),p=c.story.pending,sc={key:'event:'+p.key,person:{id:'shinohara'},body:[E.Story.resolve(p).text]},book=c.development.readers;E.Story.ensure(c);assert.ok(I.known(c,'shinohara'));const z=I.prepare(c,sc,{book});assert.strictEqual(z.scene,sc);assert.equal(Dialogue.cursor(book,Dialogue.bookmark(sc.key),Dialogue.pages(sc.body).length),1);
 // A legacy non-event reader key is resolved lazily when its concrete scene is opened.
 const freshC=fresh().career,other=scene('hiiragi','campaign:legacy:season:1');freshC.development.readers[Dialogue.bookmark(other.key)]=2;const z2=I.prepare(freshC,other,{book:freshC.development.readers});assert.strictEqual(z2.scene,other);assert.equal(z2.changed,true);assert.ok(I.known(freshC,'hiiragi'));
});
test('会話せずレースへ進んだイベントは人物を既知化しない',()=>{
 const c=clone(legacy.interrupted.career);delete c.development.readers['dialogue118:event:'+c.story.pending.key];E.Story.ensure(c);assert.equal(I.known(c,'shinohara'),false);E.Story.begin(c,c.series.race,E);assert.equal(c.story.pending,null);assert.equal(I.known(c,'shinohara'),false);assert.equal(c.story.log.at(-1).kind,'skip');
});
test('支援者の別名は同じ人物に収束し、専任師匠や似た語句を誤って朝倉・なつ扱いしない',()=>{
 assert.deepEqual(I.mentioned({person:{id:'mechanic'},body:['確認しよう']}),['shinohara']);assert.deepEqual(I.mentioned({person:{id:'fan'},body:['ナツ「こんにちは」']}),['natsu']);assert.deepEqual(I.mentioned({person:{id:'hayase'},body:['懐かしい話をした。なつかしい、と笑う。']}),[]);
});
test('破損した人物・重複・型・余剰フィールドを拒否し、旧記録と紹介付き新記録の両方を許容する',()=>{
 const c=fresh().career;I.prepare(c,scene('natsu'));const t=c.story.introductions,bad=[null,[],{...t,version:2},{...t,known:['other']},{...t,known:['natsu','natsu']},{...t,known:'natsu'},{...t,scenes:[{key:'',ids:['natsu']}]},{...t,scenes:[{key:'test',ids:['natsu','natsu']}]},{...t,scenes:[{key:'test',ids:['other']}]},{...t,scenes:[{key:'test',ids:['natsu']},{key:'test',ids:['natsu']}]},{...t,unexpected:1}];
 for(const b of bad){assert.equal(I.valid(b),false);const story=clone(c.story);story.introductions=b;assert.equal(E.Story.valid(story),false);}for(const intros of [undefined,clone(t)])assert.equal(E.Story.validJournal({log:c.story.log,rivals:c.story.rivals,arcs:c.story.arcs,introductions:intros}),true);
});
report.passed=report.checks.length;report.characters=I.ids;report.limitations=['ブラウザー/端末の実操作ではなく、ゲーム処理と読書しおりの自動検証'];fs.writeFileSync(path.join(__dirname,'introductions-v126.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
