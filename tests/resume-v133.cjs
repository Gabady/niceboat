// Acceptance check for the resumed release. Uses the real qualification flow.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('../src/script.js'),B=E.Bonds;
const report={build:'133',verifiedAt:new Date().toISOString(),scope:'Engine execution and save roundtrip; no browser layout or physical-device test',checks:[],browserTested:false,physicalDevicesTested:false,browserLimitation:'Engine and DOM adapter only; no browser or physical-device verification in this release.'};
function test(name,fn){fn();report.checks.push(name);console.log('PASS '+name);}
const s=E.newState(130),p=E.character(s,'再開検証');p.scenario='light';p.difficulty='easy';E.createCareer(s,p);
const c=s.career,id='natsu',q=c.bonds.heroines[id];
Object.assign(q,{met:true,metStage:0,metRace:0});
for(let i=1;i<=6;i++)c.affinity.rolled.push(id+':'+i);
test('第1〜9話を順に選択し、第8話だけで交際が始まる',()=>{
 for(let i=0;i<9;i++){
  const ch=B.episode(c,B.B.map[id],i);c.stage=Math.max(c.stage,ch.stage,i>=7?7:0);
  c.stats.races=Math.max(c.stats.races,ch.races,c.bonds.nextAt,c.stage*6);
  if(i>=7)c.history=[{stage:6,name:'G1前期',champion:true,finalType:'championship',finalPlace:1}];
  assert.ok(B.gate(c,id).chapter);const pending=B.open(c,id),sc=B.scene(c);
  const result=E.chooseBond(c,pending.key,sc.choices.findIndex(x=>x.code===0));
  assert.equal(result.startedDating,i===7);assert.equal(q.dated,i>=7);assert.equal(q.step,i+1);
 }
 assert.equal(c.bonds.completed,null);assert.equal(c.bonds.reward,null);assert.ok(E.validState(s));
});
test('予選5走の実計算で優勝戦へ進出した時だけ第10話を解放する',()=>{
 c.stage=8;c.player.totalEarnings=10000;for(const k of E.D.statKeys)c.player.stats[k]=100;
 E.startSeries(s);E.prepareRace(s);report.qualifierResults=[];
 for(let i=0;i<5;i++){
  assert.equal(c.series.race.type,'qualifier');assert.equal(B.gate(c,id).finalOnly,true);
  c.status='preRace';E.autoResolve(s);assert.ok(c.series.race.done);report.qualifierResults.push(c.lastResult.place);
  E.continueAfterRace(s);
 }
 assert.equal(c.series.round,5);assert.equal(c.series.race.type,'championship');
 assert.equal(c.series.race.done,false);assert.ok(B.Routes.qualifiedFinal(c));
 assert.ok(B.gate(c,id).chapter);assert.equal(c.bonds.reward,null);assert.ok(E.validState(E.decode(JSON.stringify(s))));
});
test('優勝戦前に保存復元して第10話を読了し、LR相当の伝授は一度だけ',()=>{
 const restored=E.decode(JSON.stringify(s)),cc=restored.career,rr=cc.series.race;
 const pending=B.open(cc,id),scene=B.scene(cc);assert.equal(scene.title,B.B.map[id].chapters[9].title);
 assert.equal(cc.bonds.heroines[id].step,9);assert.equal(cc.bonds.reward,null);
 E.chooseBond(cc,pending.key,scene.choices.findIndex(x=>x.code===0));
 assert.equal(cc.bonds.heroines[id].step,10);assert.equal(cc.bonds.completed,id);assert.ok(cc.bonds.reward);
 const skill=cc.bonds.reward.skill,skills=cc.player.skills.slice();
 assert.equal(skill,E.D.easyRewardMap[B.B.map[id].skill]);
 assert.equal(E.chooseBond(cc,pending.key,0),null);assert.equal(B.final(cc,rr,E),null);assert.deepEqual(cc.player.skills,skills);
 cc.status='race';E.startDrive(cc,rr);assert.deepEqual(cc.player.skills,skills);assert.equal(B.Routes.qualifiedFinal(cc),false);
 assert.ok(E.validState(E.decode(JSON.stringify(restored))));
});
fs.writeFileSync(path.join(__dirname,'resume-v133.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.checks.length,qualifierResults:report.qualifierResults}));
