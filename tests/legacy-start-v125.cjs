'use strict';
// Independent V124 -> V125 import and actual SG guest-reward regression.
// Fixtures were generated with the V124 engine, then driven through the start.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script.js'),R=E.R,clone=structuredClone;
const report={build:'125',checks:[],migrations:[],rewards:[]};
const check=(name,fn)=>{fn();report.checks.push(name)};
const file=name=>path.join(__dirname,'fixtures',name);
function entries(s){return [
 ...s.rivals.map(n=>({where:'rivals',n})),
 ...(s.career?.series?.npcs||[]).map(n=>({where:'npcs',n})),
 ...[s.career?.series?.race,s.quick?.race].filter(Boolean).flatMap(r=>[
  ...r.runners.map(n=>({where:'runners',n})),...(r.drive?.boats||[]).map(n=>({where:'boats',n}))])];}
for(const [fixture,expected,count] of [
 ['legacy-start-v124-king.json',['cast_kagura','cast_teiou'],6],
 ['legacy-start-v124-rival.json',['cast_kagura','main_ibuki'],7]])check('V124実SGセーブの先駆移行・通過済み結果保持: '+fixture,()=>{
 const raw=fs.readFileSync(file(fixture),'utf8'),old=JSON.parse(raw),s=E.decode(raw);
 assert.equal(old.build,'124');assert.ok(E.validState(s));
 const a=entries(old),b=entries(s),changes=[];assert.equal(a.length,b.length);
 for(let i=0;i<a.length;i++){
  const before=a[i].n,after=b[i].n;assert.equal(before.id,after.id);
  if(expected.includes(before.id)){
   assert.deepEqual(after.skills,[...before.skills,'pioneer_start']);assert.equal(R.earlyStart(after),true);
   changes.push({where:b[i].where,id:after.id});
  }else assert.deepEqual(after.skills,before.skills);
  for(const k of ['stats','startTime','startFault','x','z','startAim','seed'])assert.deepEqual(after[k],before[k],before.id+':'+k);
 }
 assert.equal(changes.length,count);assert.deepEqual(s.career.player.skills,old.career.player.skills);
 const d=s.career.series.race.drive,r=s.career.series.race;assert.ok(d.boats.every(n=>n.startTime!==null));
 const passed=d.boats.map(n=>[n.id,n.startTime,n.startFault,n.startAim]);d.paused=false;R.tick(d,r,{},R.DT,true);
 assert.deepEqual(d.boats.map(n=>[n.id,n.startTime,n.startFault,n.startAim]),passed);
 const again=E.decode(JSON.stringify(s));assert.deepEqual(entries(again).map(x=>x.n.skills),entries(s).map(x=>x.n.skills));
 report.migrations.push({fixture,changes,passedPreserved:true});
});
check('既存の一般選手・旧主人公・現役ライバルには先駆を付与しない',()=>{
 for(const name of ['v116-save.json','v117-save.json','v122-save.json','v123-save.json','v124-save.json']){
  const raw=fs.readFileSync(path.join(__dirname,name),'utf8'),old=JSON.parse(raw),s=E.decode(raw);
  assert.deepEqual(entries(s).map(x=>x.n.skills),entries(old).map(x=>x.n.skills));
  assert.deepEqual(s.career.player.skills,old.career.player.skills);
 }
});
function winGuest(skill){
 const archived=clone(JSON.parse(fs.readFileSync(file('legacy-start-v124-rival.json'),'utf8')).rivals[0]);archived.skills=[skill];archived.mastery={};
 const s=E.newState(125881),p=E.character(s,'先着報酬検証');p.scenario='light';
 const c=E.createCareer(s,p);c.stage=8;c.player.totalEarnings=2500;c.player.stats.start=70;s.rivals=[archived];
 E.startSeries(s);c.player.points=100;c.series.npcs.find(n=>n.id===E.Development.rival(c).id).points=95;
 c.series.npcs.find(n=>n.id==='mizuki').points=90;c.series.round=5;E.prepareRace(s);
 const r=c.series.race,guest=r.runners.find(n=>n.id===archived.id);assert.ok(guest?.special);assert.deepEqual(guest.skills,[skill]);assert.ok(E.validState(s));
 E.simulate(c,r);
 // Prescribe this test's finishing order; run the real result/reward path afterward.
 for(const n of r.runners){n.capsized=false;n.dnf=false;n.startFault=null;n.score=n.isPlayer?1000:n.special?500:100;}
 const z=E.settleRace(s);assert.equal(z.place,1);
 const awards=z.acquired.filter(x=>x.source.startsWith(guest.name+'に先着'));
 report.rewards.push({skill,awards:awards.map(a=>a.id),acquired:z.acquired.map(a=>a.id)});
 return {s,c,z,awards};
}
check('先駆だけを所持するSG招待選手に先着しても固有特性を獲得しない',()=>{
 const {c,awards}=winGuest('pioneer_start');assert.deepEqual(awards,[]);assert.ok(!c.player.skills.includes('pioneer_start'));
});
for(const [id,allowance] of [['zero',.06],['legend_start',.1]])check('通常のスタート補助特能はSG先着報酬で取得可能: '+id,()=>{
 const {c,awards}=winGuest(id);assert.equal(awards.length,1);assert.equal(awards[0].id,id);
 assert.ok(c.player.skills.includes(id));assert.ok(c.player.stats.start<80);assert.equal(R.startAllowance(c.player),allowance);
});
check('先駆は一般報酬・NPC抽選・ショップ共通の候補から除外',()=>{
 assert.equal(E.D.abilityMap.pioneer_start.exclusive,'story');
 const general=E.D.abilities.filter(a=>!a.exclusive);assert.ok(!general.some(a=>a.id==='pioneer_start'));
 for(const id of ['zero','legend_start'])assert.ok(general.some(a=>a.id===id));
 const source=fs.readFileSync(path.join(__dirname,'../src/script.js'),'utf8');
 assert.match(source,/function randomSkill[^\n]+filter\(a=>!a\.exclusive/);
 assert.match(source,/const stock=shuffle\(c,D\.abilities\.filter\(a=>!a\.exclusive/);
});
report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'legacy-start-v125.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,migrations:report.migrations,rewards:report.rewards}));
