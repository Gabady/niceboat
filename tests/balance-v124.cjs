'use strict';
// Independent behavioral balance review. Uses public tick/serialization paths;
// does not replace game functions or infer wake balance from total lap time.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script'),R=E.R,clone=structuredClone;
const report={build:'124',scope:'Fixed-seed headless physics; no browser/device or human win-rate claims',checks:[],isolatedWake:[],combinedWake:[],aiStarts:[],eliteStarts:[],continuations:[],raceSmoke:[]};
function test(name,fn){fn();report.checks.push(name);console.log('PASS '+name);}
function fixture(seed=124){const s=E.newState(seed),p=E.character(s,'独立比較');p.scenario='light';const c=E.createCareer(s,p);E.startSeries(s);E.prepareRace(s);const r=c.series.race;
 r.env={weather:'晴れ',wind:'無風',windSpeed:0};r.venue.stats={};r.venue.roughness=0;r.buff=Object.fromEntries(E.D.statKeys.map(k=>[k,0]));r.itemBoost=0;r.startPolicy='attack';r.controlMode='manual';r.watch=false;
 const gear=clone(r.runners[0].equipment);r.runners.forEach((n,i)=>{n.stats={speed:65,turn:65,start:64,accel:65,power:50};n.equipment=clone(gear);n.skills=[];n.mastery={};n.course=i+1;delete n.racePersona;delete n.castId;delete n.castRole;});return {s,c,r};}
function positioned(power,wakeStrength=0){const {r}=fixture(),d=R.create(r,970124,{keepCourses:true}),b=R.own(d);d.elapsed=18;d.countdown=0;d.started=true;d.paused=false;b.stats.power=power;
 Object.assign(b,{x:30,z:48,heading:0,vx:15,vz:0,speed:15,engine:1,startTime:0,progress:25,lastS:R.project(30,48).s,phase:0,lastZone:'0:0'});
 for(const other of d.boats)if(other!==b)other.dnf=true;
 if(wakeStrength)d.wakes=[{owner:d.boats.find(n=>n!==b).id,x:30,z:45,fx:1,fz:0,t:d.elapsed-.8,strength:wakeStrength}];
 return {r,d,b};}
function emitted(power){const {r,d,b}=positioned(power);d.wakeClock=.349;R.tick(d,r,{throttle:.5},R.DT,false);const w=d.wakes.find(w=>w.owner===b.id);assert.ok(w,'emitter generated actual trail');return {power,coefficient:w.strength/(b.speed/20),actualSpeed:b.speed,trailStrength:w.strength};}
function received(power,strength=1){const {r,d,b}=positioned(power,strength);const seed=d.seed;R.tick(d,r,{throttle:.5},R.DT,false);return {power,load:b.wakeLoad,seedUnchanged:d.seed===seed};}
test('Actual emission/receiving coefficients stay near neutral and weaken monotonically with physical strength',()=>{
 const neutralOut=emitted(50).coefficient,neutralIn=received(50).load;let priorOut=Infinity,priorIn=Infinity;
 for(const power of[0,25,50,75,100,125]){const a=emitted(power),b=received(power),outRatio=a.coefficient/neutralOut,inRatio=b.load/neutralIn;
  assert.ok(outRatio>=.919999&&outRatio<=1.080001);assert.ok(inRatio>=.919999&&inRatio<=1.080001);assert.ok(a.coefficient<=priorOut+1e-12);assert.ok(b.load<=priorIn+1e-12);assert.ok(b.seedUnchanged);
  priorOut=a.coefficient;priorIn=b.load;report.isolatedWake.push({...a,load:b.load,outRatio,inRatio});
 }
 assert.ok(report.isolatedWake[0].outRatio>1.07&&report.isolatedWake[4].outRatio<.93);assert.ok(report.isolatedWake[0].inRatio>1.07&&report.isolatedWake[4].inRatio<.93);
});
test('Leader and follower physical effects combine within the intended small envelope at identical geometry',()=>{
 const neutral=received(50,emitted(50).coefficient).load;
 for(const leaderPower of[0,50,100])for(const followerPower of[0,50,100]){const load=received(followerPower,emitted(leaderPower).coefficient).load,ratio=load/neutral;assert.ok(ratio>=.8463&&ratio<=1.1665);report.combinedWake.push({leaderPower,followerPower,load,ratio});}
 assert.ok(report.combinedWake[0].ratio>report.combinedWake[4].ratio);assert.ok(report.combinedWake[8].ratio<report.combinedWake[4].ratio);
});
test('Real line crossing: just below B is F before zero; B and higher cross legally with their allowance',()=>{
 for(const stat of[0,50,64,64.999999,65,90]){const {r}=fixture(),d=R.create(r,55124,{keepCourses:true}),b=R.own(d);d.paused=false;d.elapsed=R.startAt(d)-.030;d.wakes=[];b.stats.start=stat;
  Object.assign(b,{x:R.pointAt(R.C.start).x-3.5-.10,vx:15,vz:0,speed:15,engine:1,heading:0});b.lastS=R.project(b.x,b.z).s;for(const o of d.boats)if(o!==b)o.dnf=true;
  R.tick(d,r,{throttle:1},R.DT,false);assert.ok(b.startTime<-.01&&b.startTime>-.03);assert.equal(b.startFault,stat<65?'F':null);assert.equal(b.dnf,stat<65);
 }
});
test('C-or-lower NPC launch matrix: no new early/late failures for ordinary legal AI goals',()=>{
 const scenarios=[{weather:'晴れ',wind:'無風',windSpeed:0},{weather:'雨',wind:'向かい風',windSpeed:10},{weather:'雨',wind:'追い風',windSpeed:10}];
 for(const start of[0,50,64])for(const [i,env]of scenarios.entries())for(const difficulty of['normal','easy']){const {r}=fixture(210+i);r.env=env;r.difficulty=difficulty;r.runners.forEach(n=>n.stats.start=start);
  const seed=20000+start*10+i,d=R.create(r,seed,{keepCourses:true});d.paused=false;while(d.elapsed<13.55&&!d.finished)R.tick(d,r,{},R.DT,true);
  const npc=d.boats.filter(b=>!b.isPlayer);for(const b of npc){assert.equal(b.startFault,null,JSON.stringify({start,env,difficulty,course:b.course,st:b.startTime}));assert.ok(b.startTime>=0&&b.startTime<1.5);}
  report.aiStarts.push({start,weather:env.weather,wind:env.wind,difficulty,seed,samples:npc.length,minST:Math.min(...npc.map(b=>b.startTime)),maxST:Math.max(...npc.map(b=>b.startTime)),faults:npc.filter(b=>b.startFault).length});
 }
});
test('Identified elite runners follow the same B gate, including a saved start ability below B',()=>{
 const personas=[{id:'cast_kagura',castId:'kagura',castRole:'boss',racePersona:'wall_start'},{id:'cast_teiou',castId:'teiou',castRole:'king',racePersona:'king'},{id:'main_izumi',racePersona:'rival_final'}];
 for(const persona of personas)for(const start of[64,65]){const {r}=fixture(830124);r.grade='sg';r.env={weather:'雨',wind:'追い風',windSpeed:8};const n=r.runners.find(n=>!n.isPlayer);Object.assign(n,persona);n.stats.start=start;
  const d=R.create(r,730124,{keepCourses:true});d.paused=false;while(d.elapsed<13.55&&!d.finished)R.tick(d,r,{},R.DT,true);const b=d.boats.find(b=>b.id===persona.id);assert.equal(b.startFault,null);if(start<65)assert.ok(b.startTime>=0);else assert.ok(Math.abs(b.startTime+.3)<.0001);report.eliteStarts.push({id:persona.id,start,st:b.startTime,fault:b.startFault});
 }
});
function physicsSnapshot(d){return {seed:d.seed,frame:d.frame,elapsed:d.elapsed,boats:d.boats.map(b=>({id:b.id,x:b.x,z:b.z,vx:b.vx,vz:b.vz,progress:b.progress,startTime:b.startTime,startFault:b.startFault,stamina:b.stamina,wakeLoad:b.wakeLoad})),wakes:d.wakes};}
test('Save/read before and after line crossing preserves deterministic continuation and settled start judgments',()=>{
 for(const seconds of[7,13]){const {s,c,r}=fixture(124170);E.startDrive(c,r);const d=r.drive;d.paused=false;while(d.elapsed<seconds)R.tick(d,r,{},R.DT,true);
  const before=physicsSnapshot(d),decoded=E.decode(JSON.stringify(s)),r2=decoded.career.series.race,d2=r2.drive;assert.deepEqual(physicsSnapshot(d2),before);d2.paused=false;
  for(let i=0;i<180;i++){R.tick(d,r,{},R.DT,true);R.tick(d2,r2,{},R.DT,true);}assert.deepEqual(physicsSnapshot(d2),physicsSnapshot(d));assert.ok(E.validState(decoded));report.continuations.push({savedAt:seconds,steps:180,identical:true});
 }
});
test('Representative calm/rough full races still finish under identical seed and do not amplify trail difference into instability',()=>{
 for(const power of[25,75])for(const rough of[false,true]){const {r}=fixture(64124);r.env=rough?{weather:'雨',wind:'横風',windSpeed:8}:{weather:'晴れ',wind:'無風',windSpeed:0};r.runners.forEach(n=>n.stats.start=65);r.runners.find(n=>n.isPlayer).stats.power=power;
  const d=R.runAI(r,345124),b=R.own(d);assert.ok(R.valid(d,r));assert.ok(d.finished);assert.equal(b.startFault,null);assert.equal(b.capsized,false);assert.ok(b.finishTime!==null);report.raceSmoke.push({power,rough,seed:345124,place:R.place(d,b),finishTime:b.finishTime,wakeSeconds:b.metrics.wakeSeconds,contacts:b.metrics.contacts,boundaries:b.metrics.boundaries});
 }
});
report.summary={checks:report.checks.length,ordinaryNpcLaunches:report.aiStarts.reduce((n,r)=>n+r.samples,0),ordinaryNpcFaults:report.aiStarts.reduce((n,r)=>n+r.faults,0),eliteLaunches:report.eliteStarts.length,fullRaces:report.raceSmoke.length,combinedMinimum:Math.min(...report.combinedWake.map(r=>r.ratio)),combinedMaximum:Math.max(...report.combinedWake.map(r=>r.ratio))};
report.limitations=['Full-race placements/times include existing acceleration, grip, fatigue and AI effects from physical strength; they are not causal estimates of wake changes.','AI launch sample is a targeted boundary/weather regression, not an estimated population F rate.','No actual-device or browser frame-rate testing.'];
fs.writeFileSync(path.join(__dirname,'balance-v124.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));
