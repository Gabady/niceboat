'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script.js'),B=E.Bonds,A=E.Affinity,S=E.Story;
const report={scope:'V126 なつ条件付き恋愛・独立抽選・旧セーブ互換・会話/お願い・実日程に沿った7話/報酬',checks:[],timetables:[],discoverySamples:[]};
const copy=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){fn();report.checks.push(name);}
function rng(seed){return ((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296;}
const hitSeed=Array.from({length:10000},(_,i)=>i).find(i=>rng(i)<B.natsuEncounterRate),missSeed=0;
function fresh(seed=12617,stage=2){const s=E.newState(seed),p=E.character({seed},'なつ検証');p.scenario='back';E.createCareer(s,p);const c=s.career;c.player.totalEarnings=2000;c.stage=stage;E.startSeries(s);E.prepareRace(s);const t=B.ensure(c);t.encounters.seed=0;t.encounters.rolled=[];t.encounters.natsu={seed:hitSeed,rolled:[]};return s;}
function experience(c,count=2){c.story.seen.novel_banner_0=count;}
function prepared(c,stage,round,races){c.stage=stage;c.stats.races=races;c.status='action';c.series.stage=stage;c.series.round=round;c.series.race.done=false;delete c.series.race.drive;c.series.race.type=round===5?'championship':'qualifier';c.series.race.id='natsu-'+stage+'-'+round;return c.series.race;}
function discover(c){experience(c);assert.equal(B.encounter(c,c.series.race)?.id,'natsu');return c.bonds.heroines.natsu;}
function offer(c,type='gift'){const a=A.ensure(c),h=c.bonds.heroines.natsu;h.met=true;h.metStage=c.stage;h.metRace=c.stats.races;const id='natsu:1';a.rolled.push(id);a.requests.push({id,heroine:'natsu',chapter:1,type,cost:type==='gift'?90:0,target:type==='race'?2:0,status:'offer',created:c.stats.races,deadline:null,resolved:null,delta:null});return a.requests.at(-1);}
function respond(c){const q=A.offer(c);if(q)assert.ok(A.reply(c,q.id,1,E));}
test('G3〜G1前期・会話選択完了2回・交際/完走なしを満たした場合だけ候補になる',()=>{
 for(const stage of [0,1,7,8]){const c=fresh(12617,stage).career;experience(c);assert.equal(B.natsuGate(c).eligible,false);assert.notEqual(B.encounter(c,c.series.race)?.id,'natsu');}
 for(const count of [0,1]){const c=fresh().career;experience(c,count);assert.equal(B.natsuGate(c).eligible,false);assert.notEqual(B.encounter(c,c.series.race)?.id,'natsu');}
 for(const prop of ['partner','completed']){const c=fresh().career;experience(c);c.bonds[prop]='akari';assert.equal(B.natsuGate(c).eligible,false);assert.notEqual(B.encounter(c,c.series.race)?.id,'natsu');}
 const c=fresh().career;experience(c);assert.equal(B.natsuGate(c).eligible,true);assert.equal(B.natsuGate(c).interactions,2);c.ending='gate';assert.equal(B.natsuGate(c).eligible,false);assert.equal(B.encounter(c,c.series.race),null);
});
test('一度のレース準備で当選/落選を確定し、保存復元・画面閲覧・連打では再抽選しない',()=>{
 for(const [seed,win]of [[hitSeed,true],[missSeed,false]]){const s=fresh(),c=s.career;experience(c);c.bonds.encounters.natsu.seed=seed;assert.equal(B.encounter(c,c.series.race)?.id==='natsu',win);const settled=copy(c.bonds.encounters);for(let i=0;i<5;i++){B.natsuGate(c);B.metHeroines(c);B.gate(c,'natsu');assert.equal(B.encounter(c,c.series.race),null);}assert.deepEqual(c.bonds.encounters,settled);assert.ok(B.valid(c.bonds));const restored=E.decode(JSON.stringify(s));assert.equal(B.encounter(restored.career,restored.career.series.race),null);assert.deepEqual(restored.career.bonds.encounters,settled);}
 const c=fresh().career;assert.notEqual(B.encounter(c,c.series.race)?.id,'natsu');experience(c);assert.equal(B.encounter(c,c.series.race),null);assert.equal(c.bonds.heroines.natsu.met,false);
});
test('専用抽選が通常の出会い・レース・物語・好感度の乱数を消費しない',()=>{
 const ca=fresh().career,cb=copy(ca);experience(cb);ca.bonds.encounters.natsu.seed=cb.bonds.encounters.natsu.seed=missSeed;const before={seed:ca.seed,story:ca.story.seed,affinity:ca.affinity.seed};B.encounter(ca,ca.series.race);B.encounter(cb,cb.series.race);assert.equal(ca.bonds.encounters.seed,cb.bonds.encounters.seed);assert.deepEqual({seed:cb.seed,story:cb.story.seed,affinity:cb.affinity.seed},before);assert.equal(ca.bonds.encounters.natsu.seed,missSeed);assert.notEqual(cb.bonds.encounters.natsu.seed,missSeed);
 for(let seed=0;seed<100;seed++){const c=fresh().career;c.bonds.encounters.seed=seed;c.stage=8;c.series.round=0;const z=B.encounter(c,c.series.race);assert.notEqual(z?.id,'natsu');}
});
test('交流回数はfanイベントの選択完了だけを数え、中断/見送り/他人物は数えない',()=>{
 const c=fresh().career;c.story.seen.novel_ink_0=9;c.story.pending={id:'novel_banner_0',key:'not-yet',kind:'event',raceId:c.series.race.id};assert.equal(B.natsuGate(c).interactions,0);S.begin(c,c.series.race,E);assert.equal(B.natsuGate(c).interactions,0);
 for(let i=0;i<2;i++){c.story.pending={id:'novel_banner_0',kind:'event',key:'fan-choice-'+i,raceId:c.series.race.id,variant:0};assert.ok(E.chooseStory(c,c.story.pending.key,0));}assert.equal(B.natsuGate(c).interactions,2);assert.equal(B.natsuGate(c).eligible,true);
});
test('V125の6人および旧5人・v1/v2の実データ由来セーブを先行validで受け入れ、6人の進行/旧記録を維持する',()=>{
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/natsu-v125.json'),'utf8'));
 for(const version of [1,2])for(const oldSize of [5,6]){const s=copy(fixture),journals=[s.career.bonds,s.registry[0].bondJournal];for(const t of journals){t.version=version;if(oldSize===5)delete t.heroines.mizuki;assert.ok(B.valid(t));}
 const old=copy(s),restored=E.decode(JSON.stringify(s));assert.ok(E.validState(restored));assert.equal(restored.career.bonds.heroines.natsu.met,false);assert.equal(restored.career.bonds.heroines.natsu.step,0);for(const id of Object.keys(old.career.bonds.heroines)){for(const key of ['step','trust','affection','failed','reason','dated','choices'])assert.deepEqual(restored.career.bonds.heroines[id][key],old.career.bonds.heroines[id][key]);}assert.deepEqual(restored.registry[0].bondJournal,old.registry[0].bondJournal);assert.deepEqual(restored.career.player.stats,old.career.player.stats);}
});
test('未知人物・欠けた必須人物・不正な追加乱数や重複/範囲外raceキーを拒否する',()=>{
 const base=fresh().career.bonds;for(const mutate of [t=>{delete t.heroines.akari;},t=>{t.heroines.natsu=null;},t=>{t.heroines.mizuki=null;},t=>{delete t.heroines.natsu;t.waitHeroine='natsu';},t=>{t.heroines.unknown=copy(t.heroines.akari);},t=>{t.partner='natsu';delete t.heroines.natsu;},t=>{t.encounters.natsu.seed=-1;},t=>{t.encounters.natsu.rolled=['2:0','2:0'];},t=>{t.encounters.natsu.rolled=['9:0'];},t=>{t.encounters.natsu.rolled=['2:0'];}]){const t=copy(base);mutate(t);assert.equal(B.valid(t),false);}
});
test('ナツの日常/他交際時の告白は本人の語調となり、友人分岐と失敗分岐も保存できる',()=>{
 for(const choice of [0,1,2]){const c=fresh().career;discover(c);const q=c.bonds.heroines.natsu;q.step=5;q.choices=[0,0,0,0,0];q.trust=q.affection=100;c.stats.races=40;c.stage=6;c.history=[{stage:6,champion:true}];const other=c.bonds.heroines.akari;other.met=true;other.metStage=0;other.metRace=0;other.step=7;other.choices=Array(7).fill(0);other.dated=true;c.bonds.partner=c.bonds.completed='akari';const p=B.open(c,'natsu');assert.ok(p);const scene=B.scene(c);assert.ok(!scene.body.join('\n').includes('私も選手'));assert.ok(!scene.choices.map(x=>x.reply).join('\n').includes('勝負では遠慮'));assert.ok(B.choose(c,p.key,choice));assert.equal(c.bonds.partner,'akari');assert.ok(B.valid(c.bonds));}
 const c=fresh().career;discover(c);c.bonds.heroines.natsu.step=1;c.bonds.heroines.natsu.choices=[0];const p=B.open(c,'natsu');assert.equal(p.kind,'visit');assert.ok(B.scene(c).body.every(x=>typeof x==='string'));const z=B.choose(c,p.key,0);assert.match(z.note,/なつ「/);assert.ok(B.valid(c.bonds));
});
test('ナツのお願いは贈与・辞退・時間支援・次走の約束に対応し、undefined表示や不正な人物制限がない',()=>{
 for(const [type,index]of [['gift',0],['gift',1],['gift',2],['race',0],['race',1]]){const c=fresh().career;c.player.money=100;const q=offer(c,type),scene=A.requestScene(c,B.B.map);assert.ok(!JSON.stringify(scene).includes('undefined'));assert.match(scene.body.join('\n'),/なつ/);const z=A.reply(c,q.id,index,E);assert.ok(z);assert.ok(!z.note.includes('undefined'));assert.ok(A.valid(c.affinity));if(type==='race'&&index===0){c.stats.races++;A.settle(c,c.series.race,{place:1,finish:[],capsized:false,dnf:false,startFault:null});assert.equal(q.status,'fulfilled');assert.ok(A.valid(c.affinity));}}
 const a=A.ensure(fresh().career);a.rolled=B.B.heroines.flatMap(h=>[1,2,3,4,5,6].map(n=>h.id+':'+n));a.unlocked=['rival',...['hayase','tsukino','kuzumi','akamine','iwase'].map(x=>'mentor:'+x),...B.B.heroines.map(h=>'heroine:'+h.id)];assert.equal(a.rolled.length,42);assert.equal(a.unlocked.length,13);assert.ok(A.valid(a));assert.ok(E.Craft.valid({version:1,grandfather:B.B.heroines.map(h=>h.id),races:[],recovery:null}));
});
function timetable(metRace,difficulty='normal',arc='shore'){
 const s=fresh(12691,Math.floor(metRace/6)),c=s.career;c.player.difficulty=difficulty;c.campaign.arc=arc;experience(c);const meetings=[];let reward=null;
 for(let races=metRace;races<=53;races++){
  const stage=Math.floor(races/6),round=races%6;prepared(c,stage,round,races);c.bonds.encounters.natsu.seed=hitSeed;B.encounter(c,c.series.race);if(races>=42&&!c.history.some(x=>x.stage===6))c.history.push({stage:6,champion:true});
  respond(c);const g=B.gate(c,'natsu');if(g.open){const p=B.open(c,'natsu'),scene=B.scene(c),index=p.kind==='chapter'?scene.choices.findIndex(x=>x.code===0):0,z=E.chooseBond(c,p.key,index);assert.ok(z);meetings.push({races,stage,round,kind:p.kind,step:c.bonds.heroines.natsu.step});respond(c);}
  const z=B.final(c,c.series.race,{acquire:E.acquire});if(z)reward=z;
 }
 assert.equal(c.bonds.completed,'natsu',JSON.stringify({metRace,arc,meetings,gate:B.gate(c,'natsu'),state:c.bonds.heroines.natsu}));assert.equal(c.bonds.heroines.natsu.step,7);const skill=difficulty==='easy'?'bond_natsu_ur':'bond_natsu';assert.equal(c.bonds.reward.skill,skill);assert.ok(c.player.skills.includes(skill));const before=copy(c.player);assert.equal(B.final(c,c.series.race,{acquire:E.acquire}),null);assert.deepEqual(c.player,before);assert.ok(B.valid(c.bonds));assert.ok(A.valid(c.affinity));return {metRace,difficulty,arc,meetings,reward:skill};
}
test('最速/中盤/最終解放日の1育成日程で待ち走数・G1優勝・好感度・7話・SG優勝戦特能まで到達する',()=>{
 for(const arc of ['shore','recovery'])for(const [at,difficulty]of [[12,'normal'],[29,'normal'],[41,'normal'],[41,'easy']])report.timetables.push(timetable(at,difficulty,arc));
});
test('実際の物語抽選を通す100育成の代表seedで、ナツの解放が条件成立後かつG1前期までに収まる',()=>{
 const eligibleStarts=[],metRaces=[];let eligibleCount=0;
 for(let seed=1;seed<=100;seed++){
  const c=fresh(seed,0).career;c.story.seen={};c.story.gates=[];c.story.pending=null;c.bonds.encounters.rolled=[];delete c.bonds.encounters.natsu;let eligibleAt=null,metAt=null;
  for(let races=0;races<42;races++){
   const stage=Math.floor(races/6),r=prepared(c,stage,races%6,races);r.env={weather:'晴れ',wind:'無風',windSpeed:0};c.player.popularity=Math.min(100,races*2);if(!c.story.chapters.includes(stage))S.series(c);S.prepare(c,r);
   if(B.natsuGate(c).eligible&&eligibleAt===null)eligibleAt=races;const notice=B.encounter(c,r);if(notice?.id==='natsu'){metAt=races;assert.ok(B.natsuGate(c).interactions>=2);}
   const pending=c.story.pending;if(pending?.kind==='event'){const e=S.resolve(pending),index=Math.max(0,e.choices.findIndex(x=>x.aligned));E.chooseStory(c,pending.key,index);}
   if(metAt!==null)break;
  }
  if(eligibleAt!==null){eligibleCount++;eligibleStarts.push(eligibleAt);}if(metAt!==null){metRaces.push(metAt);assert.ok(metAt>=12&&metAt<=41);}if(seed<=12||seed===100)report.discoverySamples.push({seed,eligibleAt,metAt});
 }
 assert.ok(eligibleCount>0);assert.ok(metRaces.length>0);assert.ok(new Set(metRaces).size>1);report.discoverySummary={samples:100,conditionsReached:eligibleCount,unlocked:metRaces.length,earliest:Math.min(...metRaces),latest:Math.max(...metRaces),meaning:'固定天候・順当な人気推移・fanを含む全提示イベントへの応答を行う代表日程。実プレイの解放率推定ではない。'};
});
test('瑞希が同じSG優勝戦に出る場合の約束は新規/復帰とも同時出走に一致し、非出場時の本文を変えない',()=>{
 const h=B.B.map.mizuki;for(const arc of ['shore','recovery']){const c=fresh(12617,8).career;c.campaign.arc=arc;const r=c.series.race;r.type='championship';const source=copy(arc==='recovery'?h.recoveryFinal:h.final);r.runners=r.runners.filter(x=>x.id!=='mizuki');assert.deepEqual(B.finalBody(c,h),source);r.runners.push({id:'mizuki'});const body=B.finalBody(c,h);assert.ok(body.join('\n').includes('それぞれの艇'));assert.ok(!body.join('\n').includes('次に一緒に走る'));assert.ok(!body.join('\n').includes('次に私と走る'));assert.ok(!body.join('\n').includes('戻ってくるのを待ってる'));assert.deepEqual(B.finalBody(c,h,copy(r)),source);r.type='qualifier';assert.deepEqual(B.finalBody(c,h),source);assert.deepEqual(arc==='recovery'?h.recoveryFinal:h.final,source);}
});
report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'natsu-logic-v126.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
