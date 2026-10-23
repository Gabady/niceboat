'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),E=require('../src/script'),R=E.R;
const report={build:'147',checks:[],simulatedRaces:0};
function test(name,fn){try{fn();report.checks.push(name);console.log('PASS '+name)}catch(e){report.failures||=[];report.failures.push({name,error:e.stack});console.error(name,e)}}
function fixture(stage=0,type='qualifier',mode='drive',difficulty='normal'){
 const s=E.newState(147),p=E.character(s,'継続検証');p.scenario='light';p.difficulty=difficulty;
 const c=E.createCareer(s,p);c.stage=stage;c.player.totalEarnings=10000;E.startSeries(s);E.prepareRace(s);c.status='preRace';
 const r=c.series.race;r.type=type;if(type!=='qualifier'){c.series.round=5;c.series.finalType=type;}E.Improve141.setMode(c,mode);E.Drama.rivalState(c);return {s,c,r};
}
function manual(f,ticks=600){assert.ok(E.takeControl(f.s));const d=f.r.drive;d.paused=false;for(let i=0;i<ticks&&!d.finished;i++)R.tick(d,f.r,R.pilot(d,R.own(d),f.r));d.paused=true;return f;}
test('全9シリーズ・3難易度・2方式・3レース種別の制限が最優秀最終戦に限られる',()=>{
 for(let stage=0;stage<9;stage++)for(const difficulty of ['easy','normal','hard'])for(const mode of ['drive','development'])for(const type of ['qualifier','championship','consolation']){
  const f=fixture(stage,type,mode,difficulty),required=stage===8&&type!=='qualifier';assert.equal(R.requiresManual(f.r),required);
  const before=JSON.stringify(f.s);assert.equal(!!E.prepareSkip(f.s),!required);if(required)assert.equal(JSON.stringify(f.s),before);
 }
});
test('操船途中のスキップ準備で艇・経過・乱数・履歴を巻き戻さない',()=>{const f=manual(fixture()),d=f.r.drive,before=structuredClone(d);assert.ok(E.prepareSkip(f.s));assert.equal(f.r.drive,d);assert.deepEqual(d,before);assert.equal(R.own(d).dnf,false);assert.ok(E.validState(f.s));});
test('途中スキップと同じ位置からの観戦は同じ着順・時計・走行軌跡になる',()=>{
 const f=manual(fixture()),other=E.decode(JSON.stringify(f.s));E.skipToResult(f.s);E.prepareSpectator(other);while(!other.career.series.race.done)E.spectatorStep(other,false,null,360);
 const a=f.r.drive,b=other.career.series.race.drive;assert.deepEqual(a,b);assert.equal(E.Improve141.mode(f.r),'mixed');assert.equal(f.c.lastResult.controlRecord141,'mixed');assert.ok(f.r.done&&f.r.settled);assert.ok(E.validState(f.s));report.simulatedRaces+=2;
});
test('最初からスキップした成績を手動完走として記録しない',()=>{const f=fixture();E.skipToResult(f.s);assert.equal(f.c.lastResult.controlRecord141,'auto');assert.equal(f.c.player.controlRecord141.manual.races,0);report.simulatedRaces++;});
test('スキップしても発生済みのフライング・転覆を消さない',()=>{for(const fault of ['F','capsize']){const f=manual(fixture(),30),b=R.own(f.r.drive);b.dnf=true;if(fault==='F')b.startFault='F';else b.capsized=true;E.skipToResult(f.s);const own=f.r.runners.find(x=>x.isPlayer);assert.equal(own.dnf,true);assert.equal(fault==='F'?own.startFault:own.capsized,fault==='F'?'F':true);assert.ok(E.validState(f.s));report.simulatedRaces++;}});
test('結果確定・スキップ・精算の再実行で賞金・成長・覚醒を重ねない',()=>{const f=manual(fixture());E.skipToResult(f.s);const once=JSON.stringify(f.s);E.skipToResult(f.s);E.completeDrive(f.s);E.settleRace(f.s);assert.equal(JSON.stringify(f.s),once);report.simulatedRaces++;});
test('スキップ途中の保存復元は同じ位置から観戦で再開し同じ結果へ到達する',()=>{const f=manual(fixture());E.prepareSkip(f.s);E.stepAutoRace(f.r,400);const before=structuredClone(f.r.drive),loaded=E.decode(JSON.stringify(f.s)),r=loaded.career.series.race;assert.deepEqual(r.drive,before);assert.equal(r.controlMode,'spectator');assert.equal(r.watch,true);E.skipToResult(f.s);E.skipToResult(loaded);assert.deepEqual(r.drive,f.r.drive);assert.deepEqual(loaded.career.lastResult,f.c.lastResult);assert.ok(E.validState(loaded));report.simulatedRaces+=2;});
test('実V146セーブを移行して通常決勝・登録データ・成長を保持する',()=>{const old=require('./fixtures/save-v146-to-v147.json');assert.equal(old.sourceBuild,'146');const s=old.cases.normalFinal,loaded=E.decode(JSON.stringify(s));assert.equal(loaded.build,'147');assert.deepEqual(loaded.career,s.career);assert.deepEqual(loaded.registry,s.registry);assert.deepEqual(loaded.settings,s.settings);assert.ok(E.prepareSkip(loaded));});
test('実V146の最優秀最終戦は位置と状態を保持して手動の一時停止へ移行する',()=>{for(const s of Object.values(require('./fixtures/save-v146-to-v147.json').cases).slice(1)){const loaded=E.decode(JSON.stringify(s)),r=loaded.career.series.race,old=s.career.series.race;assert.ok(R.requiresManual(r));assert.equal(r.watch,false);assert.equal(r.controlMode,'manual');assert.equal(r.drive.paused,true);for(const key of ['boats','elapsed','frame','seed','events','replay','controlUse141'])assert.deepEqual(r.drive[key],old.drive[key]);assert.equal(E.prepareSkip(loaded),null);assert.equal(E.prepareSpectator(loaded),null);assert.ok(E.takeControl(loaded));assert.ok(E.validState(loaded));}});
test('最優秀決勝から再練習を作っても育成の操作制限を持ち込まない',()=>{assert.equal(R.requiresManual({grade:'sg',type:'championship',drill:'turn'}),false);assert.equal(R.requiresManual({grade:'sg',type:'exhibition',challenge145:{mode:'manual'}}),false);});
fs.writeFileSync(path.join(__dirname,'race-skip-v147.json'),JSON.stringify(report,null,2)+'\n');if(report.failures?.length)process.exitCode=1;
