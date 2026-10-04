const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script'),R=E.R,clone=structuredClone;
let checks=0;const report={checks:[],eliteStarts:[]};
function test(name,fn){fn();checks++;report.checks.push(name);}
function career(arc='recovery',seed=117){const s=E.newState(seed),p=E.character(s,'再起テスト');p.scenario=arc;const c=E.createCareer(s,p);return {s,c};}
function race(seed=117){const {s,c}=career('recovery',seed);E.startSeries(s);E.prepareRace(s);return {s,c,r:c.series.race};}
test('STは秒:百分の一秒。早発はゼロ、未通過はダッシュ',()=>{for(const [t,str] of [[-.3,'00:00'],[-.2,'00:00'],[0,'00:00'],[.01,'00:01'],[.204,'00:20'],[1.49,'01:49'],[null,'—']])assert.equal(R.startText(t),str);});
for(const stat of [0,1,34,50,65,90,99,100,120])test('早発境界 start='+stat,()=>{
 const {r}=race();const d=R.create(r,110);const b=R.own(d);b.stats.start=stat;const grace=stat<65?0:.2*Math.min(stat,100)/100;assert.equal(R.startAllowance(b),grace);
 for(const [offset,fault] of [[-grace,null],[-grace-.0001,'F'],[0,null],[1.499,null],[1.5,'L']]){let a=clone(b),z=clone(d);a.x=R.pointAt(R.C.start).x-3.5+.01;a.z=a.lane;z.elapsed=R.startAt(z)+offset+R.DT*.5;R.startCrossing(z,a,R.pointAt(R.C.start).x-.01,R.DT);assert.equal(a.startFault,fault,`${stat},${offset}`);}
});
test('通常の高能力NPCとプレイヤーには0.30秒特例なし',()=>{assert.equal(R.earlyStart({isPlayer:false,stats:{start:120}}),false);assert.equal(R.earlyStart({isPlayer:true,id:'cast_teiou',castRole:'king'}),false);});
for(const wind of ['無風','横風','向かい風','追い風'])test('直進固定と通過後の解除 '+wind,()=>{
 const {r}=race();r.env={weather:'雨',wind,windSpeed:10};const d=R.create(r,92);d.paused=false;const b=R.own(d),lane=b.z;
 for(let i=0;i<180;i++){R.tick(d,r,{steer:i%2?1:-1,throttle:0,posture:1});assert.equal(b.heading,0);assert.equal(b.yawRate,0);assert.equal(b.steer,0);assert.equal(b.z,lane);assert.equal(b.vz,0);}
 // Approach the line at a legal time, holding a steering request through crossing.
 d.elapsed=R.startAt(d)-.04;b.stats.start=100;b.x=R.pointAt(R.C.start).x-3.5-.4;b.vx=b.speed=15;b.engine=1;b.lastS=R.project(b.x,b.z).s;
 while(b.startTime===null&&!b.startFault)R.tick(d,r,{steer:-1,throttle:1});assert.equal(b.startFault,null);assert.equal(b.heading,0);assert.equal(b.z,lane);
 for(let i=0;i<30;i++)R.tick(d,r,{steer:-1,throttle:1});assert.ok(Math.abs(b.heading)>.001);assert.ok(Math.abs(b.z-lane)>.001);
});
for(const mode of ['normal','easy'])for(const wind of ['無風','横風','向かい風','追い風'])test('強敵の全コース0.30秒先行 '+mode+' '+wind,()=>{
 for(let course=1;course<=6;course++){
  const {r}=race(300+course);r.difficulty=mode;r.grade='sg';r.env={weather:'雨',wind,windSpeed:wind==='無風'?0:10};
  r.runners.forEach((b,i)=>{b.isPlayer=i===5;b.course=i+1;b.skills=[];});
  const special=r.runners.find(b=>b.course===course);r.runners.forEach(b=>b.isPlayer=false);
  Object.assign(special,course%3===1?{id:'cast_kagura',castId:'kagura',castRole:'boss',racePersona:'wall_start'}:course%3===2?{id:'cast_teiou',castId:'teiou',castRole:'king',racePersona:'king'}:{id:'main_izumi',racePersona:'rival_final'});
  for(const k of E.D.statKeys)special.stats[k]=k==='start'&&special.castId==='kagura'?120:96;
  special.skills=course%3===1?['doguchi_lr','inside','immune']:['zero','straighten'];
  const d=R.create(r,700+course,{keepCourses:true});d.paused=false;while(d.elapsed<13.5&&!d.finished)R.tick(d,r,{},R.DT,true);
  const b=d.boats.find(b=>b.id===special.id);assert.equal(b.startFault,null);assert.ok(Math.abs(b.startTime+.3)<.0001,JSON.stringify({mode,wind,course,st:b.startTime}));assert.equal(R.startText(b.startTime),'00:00');
  report.eliteStarts.push({mode,wind,course,id:b.id,actual:b.startTime});
 }
});
for(const ending of ['early','gate'])test('再起編の終了 '+ending,()=>{const {c}=career();c.stage=ending==='gate'?7:0;E.Campaign.close(c,ending);assert.ok(E.Campaign.valid(c.campaign));assert.match(E.Campaign.scene(c.campaign,ending).body.join(''),/相馬/);});
test('人物ルートの文脈切替と既存の選択条件維持',()=>{
 const c=career().c,base=career('light').c,H=E.Bonds.B;
 for(const h of H.heroines)for(let i=0;i<7;i++){const a=E.Bonds.episode(c,h,i),b=E.Bonds.episode(base,h,i);assert.equal(a.id,b.id);assert.deepEqual(a.choices.map(x=>[x.code,x.trust,x.affection,x.break]),b.choices.map(x=>[x.code,x.trust,x.affection,x.break]));if(['nagi','mizuki'].includes(h.id))assert.notDeepEqual(a.body,b.body);else assert.deepEqual(a.body,b.body);}
 for(const [id,m] of Object.entries(E.Cast.routes))for(let i=0;i<5;i++){const a=E.Cast.routeEpisode(c,m,i),b=E.Cast.routeEpisode(base,m,i);assert.deepEqual(a.choices.map(x=>[x.aligned,x.key,x.approach]),b.choices.map(x=>[x.aligned,x.key,x.approach]));if(id==='akamine')assert.notDeepEqual(a.body,b.body);else assert.deepEqual(a.body,b.body);}
 assert.ok(E.Bonds.episode(c,H.map.nagi,1).body.join('').includes('ローイング'));
});
test('再起編の今節の約束は有効なデータとして保存可能',()=>{for(const choice of [0,1]){const {s,c}=career();assert.ok(E.Development.choosePlan(c,choice));assert.ok(E.Development.valid(c.development));assert.ok(E.validState(E.decode(JSON.stringify(s))));}});
test('実レースの中断再開は同じ位置・判定',()=>{
 const {s,c,r}=race();E.startDrive(c,r);const d=r.drive;d.paused=false;for(let i=0;i<420;i++)R.tick(d,r,{},R.DT,true);const position=d.boats.map(b=>[b.x,b.z,b.startTime]);const decoded=E.decode(JSON.stringify(s));assert.deepEqual(decoded.career.series.race.drive.boats.map(b=>[b.x,b.z,b.startTime]),position);assert.ok(E.validState(decoded));
 const d2=clone(d);for(let i=0;i<300;i++){R.tick(d,r,{},R.DT,true);R.tick(d2,r,{},R.DT,true);}assert.deepEqual(d2,d);
});
// Baseline V116 is evaluated in an isolated Node process so globals cannot mix versions.
test('V116の整備・能力・シナリオ・保有報酬を移行で変更しない',()=>{
 const fixture=path.join(__dirname,'v116-save.json');let raw;
 if(fs.existsSync(fixture))raw=fs.readFileSync(fixture,'utf8');else{
 const vm=require('node:vm'),context=vm.createContext({});
 for(const n of JSON.parse(fs.readFileSync(path.join(__dirname,'../script_order.json')))){if(['portrait-assets','audio-assets','music','visual-assets'].includes(n))continue;vm.runInContext(fs.readFileSync(path.join(__dirname,'../baseline/'+n+'.js'),'utf8'),context);}
 raw=vm.runInContext(`const E=KM_ENGINE;const s=E.newState(116),p=E.character(s,'既存選手');E.createCareer(s,p);s.career.player.adjust.motorSuccess=69;s.career.player.skills.push('comet');E.startSeries(s);E.prepareRace(s);E.startDrive(s.career,s.career.series.race);JSON.stringify(s);`,context);
 fs.writeFileSync(fixture,raw);}
 const before=JSON.parse(raw),after=E.decode(raw);assert.equal(after.build,E.D.build);assert.deepEqual(after.career.player.adjust,before.career.player.adjust);assert.deepEqual(after.career.player.stats,before.career.player.stats);assert.deepEqual(after.career.player.skills,before.career.player.skills);assert.equal(after.career.campaign.arc,before.career.campaign.arc);assert.ok(E.validState(after));
});
report.total=checks;fs.writeFileSync(path.join(__dirname,'verification-v124-base.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:checks,eliteStarts:report.eliteStarts.length,min:Math.min(...report.eliteStarts.map(x=>x.actual)),max:Math.max(...report.eliteStarts.map(x=>x.actual))}));
