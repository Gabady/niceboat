const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const E=require('../src/script.js'),W=E.Workshop,D=E.D,clone=E.clone;
const report={build:'128',scope:'Deterministic engine tests; no browser or physical-device verification',checks:[],maintenance:[],growth:[]};
function test(name,fn){fn();report.checks.push(name);}
function career(arc='light',seed=12801){const s=E.newState(seed),p=E.character(s,'検証');p.scenario=arc;E.createCareer(s,p);return s;}
function ready(arc='light'){const s=career(arc);E.startSeries(s);E.prepareRace(s);return s;}
function afterStory(c,stage){c.stage=stage;E.Campaign.capture(c,{stage,qualificationRank:8,finalPlace:3,finalType:'consolation',champion:false});const entry=c.campaign.entries.at(-1);return E.Drama.choose(c,entry.id,0,E);}
function settleMock(c,id,good=true){W.settle(c,{id},{startFault:good?null:'F',capsized:false,dnf:false});}
test('54回集中はA、半々はB。父の教え・追加経験があっても基礎はAまで',()=>{
 for(const start of [18,20,22])for(const arc of Object.keys(W.arcs))for(const mode of ['easy','normal']){
  const c=career(arc).career;c.player.difficulty=mode;c.player.skills=[];c.player.adjust.motorSuccess=c.player.adjust.propSuccess=start;
  for(let i=0;i<54;i++)W.learn(c.player,'motor',W.learningFactor(c));for(let i=0;i<27;i++)W.learn(c.player,'prop',W.learningFactor(c));
  assert.equal(W.rank(W.effective(c.player,'motor')),'A');assert.equal(W.rank(W.effective(c.player,'prop')),'B');
  report.maintenance.push({start,arc,mode,concentrated:c.player.adjust.motorSuccess,split:c.player.adjust.propSuccess});
  W.learn(c.player,'motor',9999);assert.equal(c.player.adjust.motorSuccess,88);assert.equal(W.rank(W.effective(c.player,'motor')),'A');
  W.learn(c.player,'prop',9999);assert.equal(c.player.adjust.propSuccess,88);
 }
});
test('特殊能力補正だけでSに届き、重ねてもS上限。過去の基礎数値は削らない',()=>{
 const p=career().career.player;p.adjust.motorSuccess=88;p.skills=['sc128_tools','sc128_sound'];assert.equal(W.rank(W.effective(p,'motor')),'S');
 p.skills.push('mechanic','spanner','craft');assert.equal(W.effective(p,'motor'),100);p.adjust.motorSuccess=95;W.learn(p,'motor',10);assert.equal(p.adjust.motorSuccess,95);assert.equal(W.effective(p,'motor'),100);
 for(const value of [34.9,49.9,64.9,79.9,87.9]){const a=clone(p),b=clone(p);a.adjust.motorSuccess=b.adjust.motorSuccess=value;W.learn(a,'motor',1);W.learn(b,'motor',.5);W.learn(b,'motor',.5);assert.ok(Math.abs(a.adjust.motorSuccess-b.adjust.motorSuccess)<.0003);}
});
test('B以下の普段の効果は小さく、会心だけ上振れ。Sでも影響は有界',()=>{
 const p=career().career.player;p.skills=[];const deltas=[];
 for(const value of [20,50,65,79,88,100]){p.adjust.motorSuccess=value;p.skills=value===100?['craft']:[];const normal=W.outcome(p,'motor',0,.4),high=W.outcome(p,'motor',0,.05),miss=W.outcome(p,'motor',.99,.5);assert.ok(high.delta>normal.delta);assert.ok(high.delta<=2.5);assert.equal(miss.label,'手応えは控えめ');assert.ok(miss.delta>=-.06);deltas.push(normal.delta);if(value<80)assert.ok(normal.delta<.72);assert.ok(W.chance(p,'motor')<=.8);}
 assert.ok(deltas.every((x,i)=>i===0||x>deltas[i-1]));
});
test('整備の実操作は一回で完結し、失敗も学習。半分効果・無効操作・旧ムラ値の非依存',()=>{
 let testedFailure=false;
 for(let seed=1;seed<18;seed++){const s=ready('back'),c=s.career;c.seed=seed;const expected={seed:c.seed};E.rand(expected);E.rand(expected);const before=clone(c.player.adjust);const z=E.tune(c,'motor');assert.ok(z);assert.equal(c.seed,expected.seed);assert.ok(c.player.adjust.motorSuccess>before.motorSuccess);assert.equal(c.player.adjust.motorVar,before.motorVar);if(!z.positive)testedFailure=true;const saved=JSON.stringify(c);assert.equal(E.tune(c,'motor'),null);assert.equal(E.tune(c,'nonsense'),null);assert.equal(JSON.stringify(c),saved);assert.ok(E.validState(s));}
 assert.ok(testedFailure);
 const a=ready('back'),b=clone(a);b.career.player.adjust.motorVar=100;a.career.player.adjust.motorVar=0;assert.deepEqual(E.tune(a.career,'motor').changes,E.tune(b.career,'motor').changes);
 const s=ready('back'),c=s.career,initial=c.player.adjust.propSuccess;c.series.action.baseActions.tune=0;c.series.action.halfActions.tune=1;const z=E.tune(c,'prop');assert.equal(z.effectScale,.5);assert.ok(c.player.adjust.propSuccess-initial<1.31);
});
test('父の今節の約束と整備会話は新しい上限を使い、Aの経験を70へ戻さない',()=>{
 const s=ready(),c=s.career;E.Development.choosePlan(c,1);c.player.adjust.motorSuccess=84;E.tune(c,'motor');assert.ok(c.player.adjust.motorSuccess>84);assert.ok(c.player.adjust.motorSuccess<=88);
 const source=fs.readFileSync(path.join(__dirname,'../src/story.js'),'utf8');assert.ok(source.includes('W.learn(p,x.learn,x.value*.25)'));assert.ok(!source.includes("Math.min(70,p.adjust[k]"));
});
test('追加整備券も半分の経験・効果で、行動前と行動後のどちらでも一度だけ使える',()=>{
 for(const early of [true,false]){const s=ready('back'),c=s.career;c.player.inventory.tune=2;if(!early)E.tune(c,'motor');assert.ok(!E.useItem(c,'tune').error);if(early)assert.equal(E.tune(c,'motor').effectScale,1);assert.equal(E.tune(c,'prop').effectScale,.5);assert.ok(E.useItem(c,'tune').error);assert.equal(c.player.inventory.tune,1);assert.ok(E.validState(s));}
 for(const start of [18,20,22]){const c=career('light').career;c.player.skills=[];c.player.adjust.motorSuccess=c.player.adjust.propSuccess=start;for(let i=0;i<27;i++)for(const part of ['motor','prop'])W.learn(c.player,part,1.18);for(let i=0;i<9;i++)for(const part of ['motor','prop'])W.learn(c.player,part,.59);assert.equal(W.rank(c.player.adjust.motorSuccess),'B');assert.equal(W.rank(c.player.adjust.propSuccess),'B');}
});
test('新しいレースのティルト効果は整備力に従う。旧レースは元の角度と効果を保持',()=>{
 const s=ready(),r=s.career.series.race,b=r.runners.find(n=>n.isPlayer);r.tilt=.5;assert.equal(E.R.tiltEffects(r,b).speed,0);r.workshop128.tiltFactor=.2;assert.ok(E.R.tiltEffects(r,b).speed<.1);
 const legacy=clone(r);delete legacy.workshop128;legacy.tilt=1.5;assert.equal(E.R.tiltEffects(legacy,b).speed,1.5*.65);assert.equal(E.R.tiltEffects(r,r.runners.find(n=>!n.isPlayer)).speed,0);
});
test('本編の返答で四物語それぞれ2つの技を伝授し、再読・無効選択では重複しない',()=>{
 for(const arc of Object.keys(W.arcs)){
  const s=career(arc),c=s.career;assert.ok(E.Drama.choose(c,'opening',0,E));let first,second;
  for(let stage=0;stage<=5;stage++){const before=c.player.skills.length,z=afterStory(c,stage);if(stage===3){first=z;assert.deepEqual(z.scenarioSkills,[W.arcs[arc].skills[0]]);assert.equal(c.player.skills.length,before+1);}if(stage===5){second=z;assert.deepEqual(z.scenarioSkills,[W.arcs[arc].skills[1]]);}if(z){const raw=JSON.stringify(c);assert.equal(E.Drama.choose(c,'season:'+stage,0,E),null);assert.equal(JSON.stringify(c),raw);}}
  assert.ok(first.note.includes(W.arcs[arc].lines[0]));assert.ok(second.note.includes(W.arcs[arc].lines[1]));assert.deepEqual(c.scenario128.awarded,W.arcs[arc].skills);assert.ok(E.validState(s));assert.ok(E.validState(E.decode(JSON.stringify(s))));
  for(const id of W.arcs[arc].skills)assert.equal(D.abilityMap[id].exclusive,'scenario128');
 }
});
test('旧進行の物語報酬は読込時に与えず、未読の節目を読んだ時だけ付与する',()=>{
 const s=career(),c=s.career;E.Drama.choose(c,'opening',0,E);for(let stage=0;stage<=3;stage++)afterStory(c,stage);c.player.skills=c.player.skills.filter(id=>!id.startsWith('sc128'));delete c.scenario128;s.build='127';const stats=JSON.stringify(c.player),out=E.decode(JSON.stringify(s));assert.equal(JSON.stringify(out.career.player),stats);assert.equal(out.career.scenario128,undefined);afterStory(out.career,4);const z=afterStory(out.career,5);assert.equal(z.scenarioSkills.length,2);assert.ok(E.validState(out));
});
test('完走・失格・分析の記録は一度だけ更新。次走スナップショットだけを変更',()=>{
 for(const arc of Object.keys(W.arcs)){const s=ready(arc),c=s.career,old=JSON.stringify(c.series.race.scenario128);c.player.stats.turn=15;for(let i=0;i<8;i++)settleMock(c,'test:'+i);assert.equal(c.scenario128.streak,3);assert.equal(c.scenario128.recovery,6);assert.equal(c.scenario128.analysisKey,'turn');assert.equal(JSON.stringify(c.series.race.scenario128),old);const q=JSON.stringify(c.scenario128);settleMock(c,'test:7');assert.equal(JSON.stringify(c.scenario128),q);settleMock(c,'test:8',false);assert.equal(c.scenario128.streak,0);assert.equal(c.scenario128.recovery,6);assert.ok(W.valid(c.scenario128,arc));}
 const c=career('back').career;c.player.stats.turn=15;settleMock(c,'analysis');assert.equal(W.training(c,'turn'),1.16);assert.equal(W.training(c,'speed'),1);
 const recovery=career('recovery').career;assert.equal(W.training(recovery,'power'),1.18);recovery.refinement.recovery.origin='start';recovery.refinement.recovery.path='renew';assert.equal(W.training(recovery,'turn'),1.18);
});
test('物語のレース効果はプレイヤーのみ。手動・観戦とも小幅で、保存後も同じ',()=>{
 for(const arc of Object.keys(W.arcs)){const s=ready(arc),c=s.career,r=c.series.race;for(let i=0;i<6;i++)settleMock(c,'effect:'+i);c.player.skills.push(...W.arcs[arc].skills);E.syncPlayerSnapshot(c);const snap=clone(r.scenario128),bonus=W.raceStats(snap);assert.ok(Object.values(bonus).every(v=>v>=0&&v<=4.2));
  c.status='preRace';E.startDrive(c,r);const d=r.drive,b=E.R.own(d),npc=d.boats.find(x=>!x.isPlayer);
  for(const mode of ['manual','spectator']){r.controlMode=mode;r.watch=mode==='spectator';const yes=E.R.performance(b,d,r),npcYes=E.R.performance(npc,d,r);delete r.scenario128;const no=E.R.performance(b,d,r),npcNo=E.R.performance(npc,d,r);r.scenario128=snap;assert.deepEqual(npcYes,npcNo);if(arc==='light')assert.deepEqual(yes,no);else assert.notDeepEqual(yes,no);}
  r.watch=false;r.controlMode='manual';assert.ok(E.validState(s));assert.deepEqual(E.decode(JSON.stringify(s)).career.series.race.scenario128,snap);
 }
});
test('V127進行中セーブの位置・能力・機材・会話を変更せず復元する',()=>{
 const raw=fs.readFileSync(path.join(__dirname,'v127-save.json'),'utf8'),before=JSON.parse(raw),after=E.decode(raw);assert.equal(after.build,'128');assert.deepEqual(after.career.player,before.career.player);assert.deepEqual(after.career.series.race,before.career.series.race);assert.deepEqual(after.career.campaign,before.career.campaign);assert.equal(after.career.scenario128,undefined);assert.ok(E.validState(after));
});
test('追加データの不正な値・別物語の特能をセーブ読込で拒否する',()=>{
 const s=ready();for(const mutate of [x=>x.career.scenario128.streak=4,x=>x.career.scenario128.arc='bad',x=>x.career.scenario128.awarded=['sc128_focus'],x=>x.career.series.race.scenario128.traits=['craft'],x=>x.career.series.race.scenario128.recovery=7,x=>x.career.series.race.workshop128.tiltFactor=50,x=>x.career.series.race.workshop128.focus='bogus']){const t=clone(s);mutate(t);assert.equal(E.validState(t),false);assert.throws(()=>E.decode(JSON.stringify(t)));}
});
test('V127実エンジンの固定条件と比較し、C以下の練習と全帯域のレース成長を抑制',()=>{
 const old=JSON.parse(fs.readFileSync(path.join(__dirname,'growth-baseline-v127.json'))),current=JSON.parse(cp.execFileSync(process.execPath,[path.join(__dirname,'growth-probe-v128.cjs'),path.join(__dirname,'../src/script.js')],{encoding:'utf8'}));
 for(let i=0;i<old.length;i++){const a=old[i],b=current[i];assert.equal(a.value,b.value);assert.ok(b.race<a.race);if(a.value<65)assert.ok(b.training<a.training*.71);else assert.equal(b.training,a.training);report.growth.push({value:a.value,mode:a.mode,trainingBefore:a.training,trainingAfter:b.training,raceBefore:a.race,raceAfter:b.race});}
});
fs.writeFileSync(path.join(__dirname,'balance-v128.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.checks.length,checks:report.checks}));
