'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script.js'),C=E.Cast,Dev=E.Development,Dialogue=require('../src/dialogue.js');
const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/mentor-v124.json'),'utf8'));
const report={scope:'師匠5人の出会い・弟子入り・初練習・既存5話・旧セーブ互換',checks:[]};
const copy=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){fn();report.checks.push(name);}
function fresh(seed,scenario='back'){const s=E.newState(seed),p=E.character({seed},'入門検証');p.scenario=scenario;E.createCareer(s,p);s.career.stage=2;E.startSeries(s);return s;}
const states=new Map();for(let seed=1;states.size<5&&seed<120;seed++){const s=fresh(seed);states.set(s.career.cast.mentor.id,s);}assert.equal(states.size,5);
function complete(c){for(let i=0;i<2;i++){const sc=C.introductionScene(c);assert.ok(sc);assert.equal(sc.step,i);assert.ok(C.introductionAdvance(c,sc.key));}}
test('全5人の割当はライバルと異なる分野で、出会い前から固定・再読込でも再抽選されない',()=>{
 for(const s of states.values()){const c=copy(s.career),id=c.cast.mentor.id;assert.notEqual(C.map[id].key,Dev.rival(c).key);assert.deepEqual(c.cast.introduction,{id,step:0});for(let i=0;i<4;i++){C.setup(c);C.assignMentor(c);assert.equal(c.cast.mentor.id,id);}const restored=E.decode(JSON.stringify(s));assert.deepEqual(restored.career.cast.introduction,s.career.cast.introduction);assert.equal(restored.career.cast.mentor.id,id);assert.ok(E.validState(restored));}
});
test('出会いから入門までの2場面は全5人に固有の理由・お願い・受諾を持ち、既存5話より先に現れる',()=>{
 const seen=new Set();for(const s of states.values()){const c=copy(s.career),id=c.cast.mentor.id;assert.equal(C.introduced(c),false);assert.equal(C.routeGate(c).open,false);assert.equal(C.routeGate(c).introduction,true);assert.equal(C.routeOpen(c),null);
 const before=copy(c),meet=C.introductionScene(c);assert.deepEqual(c,before);assert.equal(meet.step,0);assert.ok(meet.body.length>=8&&meet.body.length<=14);assert.ok(!meet.body.some(x=>x.startsWith('主人公「')&&x.includes('師匠')));seen.add(JSON.stringify(meet.body));
 assert.deepEqual(C.introductionAdvance(c,meet.key),{id,step:1,completed:false});assert.equal(C.introductionAdvance(c,meet.key),null);assert.equal(C.routeOpen(c),null);
 const ask=C.introductionScene(c);assert.ok(ask.body.join('\n').includes('弟子に'));assert.ok(ask.body.some(x=>/引き受け|教えよう|続けて教えよう/.test(x)));assert.ok(ask.body.length<=14);
 assert.deepEqual(C.introductionAdvance(c,ask.key),{id,step:2,completed:true});assert.equal(C.introductionAdvance(c,ask.key),null);assert.equal(C.introductionScene(c),null);assert.equal(C.introduced(c),true);const first=C.routeOpen(c);assert.equal(first.step,0);assert.ok(first.body.length>C.routes[id].chapters[0].body.length);assert.equal(C.routeState(c).step,0);assert.ok(C.valid(c.cast));
 }assert.equal(seen.size,5);
});
test('入門で能力・特能・好感度・練習枠・乱数を増減させず、成立記録は一度だけ追加する',()=>{
 for(const s of states.values()){const c=copy(s.career),before={player:copy(c.player),affinity:copy(c.affinity),seed:c.seed,action:copy(c.series.action)};complete(c);assert.deepEqual(c.player,before.player);assert.deepEqual(c.affinity,before.affinity);assert.equal(c.seed,before.seed);assert.deepEqual(c.series.action,before.action);assert.equal(c.story.log.filter(x=>x.title.endsWith('への弟子入り')).length,1);C.introductionAdvance(c,'mentor-introduction:'+c.cast.mentor.id+':1');assert.equal(c.story.log.filter(x=>x.title.endsWith('への弟子入り')).length,1);}
});
test('各場面の中断・保存・再開は同じ本文としおりを保ち、段階を飛び越せない',()=>{
 for(const s0 of states.values()){let s=copy(s0);for(let step=0;step<2;step++){let c=s.career;const sc=C.introductionScene(c),book=Dev.ensure(c).readers,pages=Dialogue.pages(sc.body),index=Math.min(4,pages.length-1);Dialogue.remember(book,Dialogue.bookmark(sc.key),index);C.routeDepart(c);s=E.decode(JSON.stringify(s));c=s.career;const resumed=C.introductionScene(c);assert.deepEqual(resumed,sc);assert.equal(Dialogue.cursor(Dev.ensure(c).readers,Dialogue.bookmark(sc.key),pages.length),index);const before=copy(c);assert.equal(C.introductionAdvance(c,'mentor-introduction:'+c.cast.mentor.id+':'+(step===0?1:0)),null);assert.deepEqual(c,before);C.introductionAdvance(c,resumed.key);assert.ok(E.validState(s));}}
});
test('合同練習は入門前に枠を消費せず、入門後は従来の得意分野で実行できる',()=>{
 for(const s0 of states.values()){const s=copy(s0),c=s.career,key=C.map[c.cast.mentor.id].key;E.prepareRace(s);assert.equal(c.status,'action');const budget=copy(c.series.action),stats=copy(c.player.stats),trained=c.cast.trained;assert.equal(C.growth(c,key),1);assert.equal(Dev.training(c,key,'mentor',E),null);assert.deepEqual(c.series.action,budget);assert.deepEqual(c.player.stats,stats);assert.equal(c.cast.trained,trained);complete(c);assert.equal(C.growth(c,key),1.25);const z=Dev.training(c,key,'mentor',E);assert.ok(z);assert.equal(z.method,'mentor');assert.equal(c.cast.trained,trained+1);}
});
test('レース中・育成終了後・不正キーで入門を進めず、壊れた導入セーブを拒否する',()=>{
 for(const s0 of states.values()){const c=copy(s0.career),sc=C.introductionScene(c);c.status='race';assert.equal(C.introductionScene(c),null);assert.equal(C.introductionAdvance(c,sc.key),null);c.status='seriesIntro';c.ending='early';assert.equal(C.introductionScene(c),null);c.ending=null;for(const intro of [null,{id:'other',step:0},{id:c.cast.mentor.id,step:-1},{id:c.cast.mentor.id,step:3},{id:c.cast.mentor.id,step:.5}]){const bad=copy(c.cast);bad.introduction=intro;assert.equal(C.valid(bad),false);}const bad=copy(c.cast);bad.introduction.step=1;bad.route={id:c.cast.mentor.id,step:1};assert.equal(C.valid(bad),false);}
});
test('V124の割当済み・会話途中・初話済みセーブは導入を挿入せず、能力・選択・報酬・関係を維持する',()=>{
 for(const name of ['assigned','pending','progressed']){const old=legacy[name],s=E.decode(JSON.stringify(old));assert.equal(C.introduced(s.career),true);assert.equal(C.introductionScene(s.career),null);assert.equal(s.career.cast.introduction,undefined);assert.deepEqual(s.career,old.career);assert.ok(E.validState(s));if(name==='pending'){const sc=C.routeScene(s.career);assert.equal(sc.step,0);assert.deepEqual(sc.body,C.routes[s.career.cast.mentor.id].chapters[0].body);}}
});
test('既存5話の題名・段階・分岐ID・条件・返答・報酬は5人ともV124から不変',()=>{
 for(const old of legacy.baseline){const r=C.routes[old.id];assert.equal(r.title,old.route.title);assert.equal(r.reward,old.route.reward);assert.equal(r.easyReward,old.route.easyReward);assert.deepEqual(r.chapters,old.route.chapters);assert.deepEqual(r.recoveryChapters,old.route.recoveryChapters);assert.equal(r.chapters.length,5);assert.equal(C.map[old.id].key,old.poolKey);}
});
test('全5人で入門後も5話の順序・2走間隔・好感度条件を守り、正しい選択で従来の奥義を取得する',()=>{
 for(const s0 of states.values()){const s=copy(s0),c=s.career,id=c.cast.mentor.id;complete(c);for(let i=0;i<5;i++){c.stage=[2,3,4,6,8][i];c.stats.races=12+i*2;const sc=C.routeOpen(c);assert.ok(sc);assert.equal(sc.step,i);const index=sc.choices.findIndex(ch=>ch.aligned),z=E.chooseMentor(c,sc.key,index);assert.ok(z);assert.equal(C.routeState(c).step,i+1);assert.equal(C.routeChoose(c,sc.key,index,E),null);if(i<4){c.stage=[3,4,6,8][i];assert.equal(C.routeGate(c).open,false);}}
 assert.equal(C.routeState(c).reward.skill,C.routes[id].reward);assert.ok(c.player.skills.includes(C.routes[id].reward));assert.equal(C.routeGate(c).completed,true);assert.ok(C.valid(c.cast));}
});
test('復帰編でも全員が今の走りを起点に出会い、赤嶺には復帰を踏まえた入門理由がある',()=>{
 for(const s0 of states.values()){const c=copy(s0.career);c.campaign.arc='recovery';const sc=C.introductionScene(c);assert.match(sc.body[0],/G1.*今の自分/);C.introductionAdvance(c,sc.key);const ask=C.introductionScene(c);if(c.cast.mentor.id==='akamine'){assert.match(ask.body[0],/復帰/);assert.match(ask.body[1],/身体と同じだとは決めつけない/);}assert.ok(ask.body.every(x=>!x.includes('新人')));}
});
report.mentors=[...states.keys()];report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'mentor-v125.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
