'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const P=require('../src/epilogues126.js'),Dialogue=require('../src/dialogue.js');
const copy=x=>JSON.parse(JSON.stringify(x));
const results=[];function test(name,fn){fn();results.push({name,pass:true});}
function career(outcome='win',opts={}){
 const place=outcome==='win'?1:outcome==='placed'?3:6,id='epilogue-test-player',raceId='sg-epilogue-test';
 const c={stage:8,status:'seriesResult',ending:outcome==='win'?'sgChampion':'sgFinished',player:{id,stats:{speed:70,turn:71,start:72,accel:73,power:74},skills:['quick'],money:123},seed:9823,stats:{races:54,wins:4,capsizes:0},history:[{stage:8,finalType:'championship',finalPlace:place,champion:outcome==='win'}],series:{completed:true,race:{id:raceId,type:'championship',done:true,runners:[{id,isPlayer:true,capsized:false,dnf:false,startFault:null}]}},lastResult:{raceId,type:'championship',place,capsized:false,dnf:false,startFault:null,finish:[{id,isPlayer:true,place,capsized:false,dnf:false,startFault:null}]},bonds:{completed:null,partner:null,heroines:{}},cast:{mentor:null},development:{rival:{cast:'haruto'}},drama:{rival:{step:0}}};
 if(outcome==='other'){c.lastResult.dnf=true;c.lastResult.finish[0].dnf=true;}
 if(opts.partner){const id=opts.partner;c.bonds.partner=id;c.bonds.completed=id;c.bonds.heroines[id]={met:true,step:7,dated:true,failed:false,reason:''};}
 if(opts.mentor)c.cast={mentor:{id:opts.mentor},introduction:{id:opts.mentor,step:2},route:{step:0}};
 if(opts.rival)c.development.rival.cast=opts.rival;
 return c;
}
test('Clean championship places: first is win; all 2–6 are placed',()=>{
 for(let place=1;place<=6;place++){const c=career('placed');c.history[0].finalPlace=c.lastResult.place=c.lastResult.finish[0].place=place;const q=P.classify(c);assert.equal(q.outcome,place===1?'win':'placed');assert.equal(q.reason,'finish');assert.equal(q.finalPlace,place);}
});
test('F/L/capsize/DNF never become placing endings even when displayed first or second',()=>{
 for(const place of [1,2,6])for(const key of ['startFault','capsized','dnf'])for(const source of ['result','finish','runner']){
 const c=career('win');c.history[0].finalPlace=c.lastResult.place=c.lastResult.finish[0].place=place;
 const target=source==='result'?c.lastResult:source==='finish'?c.lastResult.finish[0]:c.series.race.runners[0];target[key]=key==='startFault'?'F':true;
 assert.equal(P.classify(c).outcome,'other');assert.equal(P.classify(c).reason,key);
 if(key==='startFault'){target[key]='L';assert.equal(P.classify(c).outcome,'other');}
 }
});
test('Consolation first, qualifier elimination, and SG gate use other without championship claims',()=>{
 for(const finalType of ['consolation','eliminated']){const c=career('win',{partner:'akari'});c.history[0].finalType=finalType;c.series.race.type='qualifier';c.lastResult.type='qualifier';const z=P.capture(c);assert.equal(z.outcome,'other');assert.equal(z.reason,finalType);assert(P.valid(z));assert(!P.scene(c,'heroine:akari').body.some(x=>/優勝した|優勝戦の映像を開いた/.test(x)));}
 for(const stage of [7,8])for(const status of ['seriesResult','registration']){const c=career('win',{partner:'natsu'});c.stage=stage;c.status=status;c.ending='gate';const z=P.capture(c);assert.equal(z.reason,'gate');assert.equal(z.finalPlace,null);assert(P.valid(z));assert(P.scene(c,'heroine:natsu').body[0].includes('出場を果たせなかった'));}
});
test('Early registration and in-progress SG never capture a final epilogue',()=>{
 for(const ending of [null,'early']){const c=career();c.ending=ending;c.status='registration';assert.equal(P.capture(c),null);assert(!c.epilogues126);}
 const c=career();c.series.completed=false;c.status='raceResult';assert.equal(P.capture(c),null);
 c.ending='gate';c.stage=6;assert.equal(P.capture(c),null);
});
test('A historical champion flag cannot invent a clean first place without matching real result',()=>{
 for(const variant of ['missing','wrongRace','wrongType','notDone','missingOwn','placeMismatch']){const c=career();if(variant==='missing')delete c.lastResult;if(variant==='wrongRace')c.lastResult.raceId='another-race';if(variant==='wrongType')c.lastResult.type='qualifier';if(variant==='notDone')c.series.race.done=false;if(variant==='missingOwn')c.lastResult.finish=[];if(variant==='placeMismatch')c.lastResult.place=4;assert.equal(P.classify(c).outcome,'other');assert.equal(P.classify(c).reason,'unverified');}
});
let authored=0;const bodies=new Set(),cues=[];
test('All 51 authored result-specific episodes are reachable, distinct, and valid',()=>{
 for(const outcome of ['win','placed','other'])for(const [kind,ids]of [['heroine',P.heroineIds],['mentor',P.mentorIds],['rival',P.rivalIds]])for(const id of ids){
 const opts=kind==='heroine'?{partner:id}:kind==='mentor'?{mentor:id}:{rival:id},c=career(outcome,opts),before=copy(c),z=P.capture(c),card=P.list(c).find(x=>x.id===kind+':'+id),sc=P.scene(c,card.key);
 assert(P.valid(z),kind+':'+id+':'+outcome);assert.equal(sc.body.length,11);assert.equal(sc.endingOutcome,outcome);assert(sc.record);assert.equal(card.relationship,kind==='heroine'?'partner':kind);assert.equal(sc.person.id,id);
 const without=copy(c);delete without.epilogues126;assert.deepEqual(without,before,'Capture changes neither RNG nor gameplay/rewards');
 const hash=crypto.createHash('sha256').update(sc.body.slice(1).join('\n')).digest('hex');assert(!bodies.has(hash),'Individual authored bodies differ');bodies.add(hash);authored++;
 if(kind==='heroine'){
  assert(Object.values(sc.expressionCues).flat().length>0,'Ending has authored expression cues');
  const pages=Dialogue.pages(sc.body);for(let index=0;index<pages.length;index++){const line=Dialogue.describe(pages[index],{person:sc.person,people:[sc.person],playerName:'テスト'}),emotion=Dialogue.portraitEmotion(line,sc.person,{scene:sc,index});if(line.kind!=='person')assert.equal(emotion,'calm');}
  for(const [emotion,texts]of Object.entries(sc.expressionCues))for(const text of texts){const original=sc.person.name.split(' ').at(-1)+'「'+text+'」';const source=sc.body.find(x=>x.endsWith('「'+text+'」'));assert(source);cues.push({id,outcome,emotion,text});}
 }
 assert(!sc.body.some(x=>/表示上の順番|保存された記録だけ|勝敗を決めつけず|今回の今季|育成を終/.test(x)),'Narration avoids implementation language');
 }
 assert.equal(authored,51);
});
test('Met but incomplete, friend, and separated relationships do not become lovers',()=>{
 for(const id of P.heroineIds)for(const relation of ['acquaintance','friend','apart'])for(const outcome of ['win','placed','other']){const c=career(outcome);c.bonds.heroines[id]={met:true,step:relation==='acquaintance'?3:6,dated:false,failed:relation!=='acquaintance',reason:relation==='friend'?'友人として歩むことを選びました':relation==='apart'?'大切な約束を守れず、交際には進めなくなりました':''};const z=P.capture(c),card=P.list(c).find(e=>e.id==='heroine:'+id),sc=P.scene(c,card.key);assert(P.valid(z));assert.equal(card.relationship,relation);assert(!sc.body.some(x=>/恋人|二人だけの|手を取|愛して/.test(x)));if(relation==='apart')assert(sc.body.some(x=>x.includes('文章は送らず')));if(['natsu','mizuki'].includes(id)&&relation!=='apart')assert(!sc.body.some(x=>/席を立った|顔を合わせて/.test(x)));}
 const c=career();c.bonds.heroines.akari={met:false,step:0,dated:false,failed:false};assert(!P.list(P.capture(c)).some(e=>e.kind==='heroine'));
});
test('Unintroduced mentors stay absent; pre-apprenticeship meetings never invent a mentor relation',()=>{
 for(const id of P.mentorIds)for(const step of [0,1,2]){const c=career('placed',{mentor:id});c.cast.introduction.step=step;const z=P.capture(c),card=P.list(c).find(e=>e.kind==='mentor');assert(P.valid(z));if(step===0)assert(!card);else{assert.equal(card.relationship,step===1?'senior':'mentor');if(step===1)assert(!P.scene(c,card.key).body.some(x=>/師匠|弟子|師弟/.test(x)));}}
 const old=career('win',{mentor:'iwase'});delete old.cast.introduction;assert.equal(P.list(P.capture(old)).find(x=>x.kind==='mentor').relationship,'mentor');
});
test('One snapshot survives later state changes and registration; reader APIs cannot mutate it',()=>{
 const c=career('win',{partner:'natsu',mentor:'hayase',rival:'ren'}),z=P.capture(c),serialized=JSON.stringify(z);c.lastResult.dnf=true;c.bonds.completed=null;c.cast.mentor.id='iwase';assert.equal(P.capture(c),z);assert.equal(JSON.stringify(c.epilogues126),serialized);
 const record={epilogueJournal:JSON.parse(serialized)};assert.deepEqual(P.list(record),P.list(z));const key=P.list(record)[0].key;assert.deepEqual(P.scene(record,key),P.scene(z,key));const scene=P.scene(record,key);scene.body[0]='tampered';scene.person.name='tampered';const list=P.list(record);list[0].person.name='tampered';assert.equal(JSON.stringify(record.epilogueJournal),serialized);assert.equal(P.scene(record,'missing'),null);
});
test('Save validation rejects cross-kind identities, duplicate cards, invalid outcomes and cue injection',()=>{
 const good=P.capture(career('placed',{partner:'natsu',mentor:'hayase'}));assert(P.valid(good));assert(P.valid(null));
 const mutations=[s=>s.outcome='win',s=>s.finalPlace=99,s=>s.entries.push(copy(s.entries[0])),s=>s.entries[0].person.name='別人',s=>s.entries[0].kind='mentor',s=>s.entries[0].relationship='partner-bypass',s=>s.entries[0].body=['too short'],s=>s.entries[0].expressionCues={warm:['別人の台詞']},s=>s.entries[0].expressionCues={unknown:[]},s=>s.entries[0].chapterStep=99,s=>s.stage=0,s=>s.reason='finish-anyway'];
 for(const mutate of mutations){const s=copy(good);mutate(s);assert.equal(P.valid(s),false);}
});
const report={build:126,pass:true,tests:results,authoredEpisodes:authored,uniqueBodies:bodies.size,expressionCueCount:cues.length,verification:'Node state/reader logic; no browser or device validation'};
fs.writeFileSync(path.join(__dirname,'epilogues-v126.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({pass:true,tests:results.length,authoredEpisodes:authored,expressionCueCount:cues.length}));
