const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const E=require('../src/script'),R=E.R,P=require('../src/portraits'),Dialog=require('../src/dialogue');
const out={checks:[],mentorPairs:{},support:[],growth:[],lapBug:null};
function test(name,fn){fn();out.checks.push(name);}
function career(seed=120){const s=E.newState(seed),p=E.character(s,'改修検証');p.scenario='light';return {s,c:E.createCareer(s,p)};}
function race(seed=120){const {s,c}=career(seed);E.startSeries(s);E.prepareRace(s);return {s,c,r:c.series.race};}
function oldRacing(){const ctx=vm.createContext({});for(const n of ['data','craft118','racing'])vm.runInContext(fs.readFileSync(path.join(__dirname,'fixtures/v119-source/'+n+'.js'),'utf8').replace('const R={C,DT,','const R={integrate,C,DT,'),ctx);return ctx.KM_RACING;}
test('5種のライバル × 残る4師匠に抽選が分散し、再表示・再読込で固定',()=>{
 for(const rival of E.Development.rivals)for(let n=0;n<100;n++){
  const {s,c}=career(n+1);c.player.id='assignment_'+n;c.development.rival={...c.development.rival,id:'main_'+rival.id,cast:rival.id};c.stage=2;
  E.Cast.setup(c);const id=c.cast.mentor.id;assert.notEqual(E.Cast.map[id].key,rival.key);out.mentorPairs[rival.key+':'+E.Cast.map[id].key]=(out.mentorPairs[rival.key+':'+E.Cast.map[id].key]||0)+1;
  for(let i=0;i<5;i++){E.Cast.setup(c);assert.equal(c.cast.mentor.id,id);assert.equal(E.Cast.select(c,E.Cast.mentors[i].id),false);}
  assert.equal(E.decode(JSON.stringify(s)).career.cast.mentor.id,id);
 }
 assert.equal(Object.keys(out.mentorPairs).length,20);
});
test('旧セーブは未交流の重複だけ解消し、始まった師弟関係の記録は保持',()=>{
 const {s,c}=career();c.stage=2;const key=E.Development.rival(c).key,id=E.Cast.mentors.find(x=>x.key===key).id;E.Cast.ensure(c).mentor={id,wins:0,losses:0};s.build='119';
 const pending=E.decode(JSON.stringify(s));assert.notEqual(E.Cast.map[pending.career.cast.mentor.id].key,key);
 c.cast.mentorLocked=true;E.Cast.routeState(c);const imported=E.decode(JSON.stringify(s));assert.deepEqual(imported.career.cast,c.cast);
});
test('B65・A80・S90からだけ成長を抑え、獲得済み数値を減らさない',()=>{
 for(const [v,before,after] of [[34,1,1],[35,.9,.9],[50,.8,.8],[64.99,.8,.8],[65,.7,.6],[79.99,.7,.6],[80,.5,.4],[89.99,.5,.4],[90,.2,.16],[100,.2,.16]]){assert.equal(E.statGrowthRate(v),after);out.growth.push({value:v,before,after});}
 const {s,c}=career();E.D.statKeys.forEach((k,i)=>c.player.stats[k]=[65,79,80,90,100][i]);s.build='119';assert.deepEqual(E.decode(JSON.stringify(s)).career.player.stats,c.player.stats);
});
test('直線の効率は連続・単調。加速とフィジカル両方の不足に段階的に反応',()=>{
 for(let speed=0;speed<=100;speed+=2)for(let accel=0;accel<=100;accel+=5)for(let power=0;power<=100;power+=5){const s={speed,accel,power},v=R.straightSupport(s);assert.ok(v.effective>=0&&v.effective<=speed);for(const key of ['speed','accel','power'])assert.ok(R.straightSupport({...s,[key]:s[key]+.01}).effective>=v.effective-1e-9);}
 for(const speed of [50,70,100])assert.equal(R.straightSupport({speed,accel:speed,power:speed}).effective,speed);
 for(const a of [20,35,50,65,85,100]){const s={speed:100,accel:a,power:a};out.support.push({...s,...R.straightSupport(s)});}
 assert.ok(R.straightSupport({speed:100,accel:35,power:35}).loss>20);
 assert.ok(R.straightSupport({speed:100,accel:100,power:35}).loss>R.straightSupport({speed:100,accel:100,power:100}).loss);
 for(const speed of [50,65,85]){const a=R.straightSupport({speed:speed-.00001,accel:35,power:35}),b=R.straightSupport({speed:speed+.00001,accel:35,power:35});assert.ok(Math.abs(b.effective-a.effective)<.0001);}
});
test('ライバル・師匠・主要脇役のIDは古いportraitKeyより優先する',()=>{
 for(const r of E.Development.rivals)for(const id of [r.id,'main_'+r.id])assert.equal(P.definition({id,portraitKey:'rival_12'}).key,r.portraitKey);
 for(const c of [...E.Cast.mentors,...E.Cast.walls,E.Finale.king])for(const id of [c.id,'cast_'+c.id])assert.equal(P.definition({id,portraitKey:'rival_05'}).key,c.id);
 for(const [id,key] of Object.entries({mentor:'rival_02',asakura:'rival_02',mechanic:'shinohara',shinohara:'shinohara',fan:'natsu',natsu:'natsu',campaign_soma:'rival_03',campaign_riku:'riku',riku:'riku'}))assert.equal(P.definition({id}).key,key);
 assert.equal(P.definition({id:'rival_03'}).key,'rival_03');assert.notEqual(P.definition('shinohara').src,P.definition('campaign_soma').src);assert.notEqual(P.definition('natsu').src,P.definition('nanase').src);
});
test('話者は完全名・明示した別名のみ。曖昧な姓や未知の発話に別人を当てない',()=>{
 const people=[...Object.values(P.supporting),...E.Bonds.B.heroines,...E.Development.rivals,...Object.values(E.Development.actors),{id:'riku',name:'陸'}];
 const ctx={people,person:people[0],playerName:'検証選手'};
 for(const [speaker,id] of [['篠原','shinohara'],['先輩・朝倉','asakura'],['なつ','natsu'],['相馬','campaign_soma'],['陸','riku'],['花守 凪','nagi'],['凪','nagi'],['灯','akari']])assert.equal(Dialog.describe(speaker+'「話す」',ctx).person?.id,id,speaker);
 for(const speaker of ['知らない人','橘','宮','先'])assert.equal(Dialog.describe(speaker+'「話す」',ctx).person,null);
 assert.equal(Dialog.describe('主人公「話す」',ctx).kind,'player');
});
test('ブイ沿いに進んだ距離の欠落を旧エンジンで再現し、新版は保持',()=>{
 const old=oldRacing(),{r}=race(),d=old.create(r,120),b=old.own(d);d.elapsed=30;b.startTime=0;b.x=0;b.z=R.C.inner+.45;b.heading=0;b.vx=15;b.vz=-1;b.speed=15;b.engine=1;b.stamina=100;b.progress=R.project(b.x,b.z).s-R.C.start;b.lastS=R.project(b.x,b.z).s;
 const start=b.progress,pos=R.project(b.x,b.z).s;old.integrate(d,b,r,{throttle:1,steer:0,posture:0},R.DT);const moved=R.project(b.x,b.z).s-pos;assert.ok(moved>.1);assert.equal(b.progress,start);
 const a=structuredClone(b);a.lastS=pos;R.advanceProgress(a);assert.ok(Math.abs(a.progress-(start+moved))<1e-8);out.lapBug={physicalAdvance:moved,oldCounted:b.progress-start,newCounted:a.progress-start};
});
test('内外ブイに触れ続けても3周目の艇首通過で確定。2周・逆走・位置飛躍で短縮不可',()=>{
 for(const lane of [R.C.inner+.2,R.C.outer+.2]){
  const {r}=race(),d=R.create(r,120),b=R.own(d);Object.assign(b,{...R.pointAt(R.C.start,lane),startTime:0,progress:0,lastS:R.C.start,checkpoints:0});let crossings=0;
  for(let n=1;n<=1802&&!b.finishTime;n++){
   const previous=b.x+Math.cos(b.heading)*3.5;Object.assign(b,R.pointAt(R.C.start+n,lane));d.elapsed=12+n/18;R.constrain(d,b);R.advanceProgress(b);
   const bow=b.x+Math.cos(b.heading)*3.5;if(previous<R.pointAt(R.C.start).x&&bow>=R.pointAt(R.C.start).x&&b.z>0)crossings++;
   const done=R.finishCrossing(d,b,previous,1/18);if(crossings<3)assert.equal(done,false);
  }
  assert.equal(crossings,3);assert.notEqual(b.finishTime,null);assert.equal(b.progress,1800);assert.equal(b.checkpoints,24);const frozen=JSON.stringify([b.finishTime,b.progress,b.checkpoints]);for(let i=0;i<120;i++)R.runOut(b,R.DT);assert.equal(JSON.stringify([b.finishTime,b.progress,b.checkpoints]),frozen);
 }
 const {r}=race(),d=R.create(r,120),b=R.own(d);Object.assign(b,{...R.pointAt(100),progress:0,lastS:100,checkpoints:0,startTime:0});for(const s of [99,98,99,100]){Object.assign(b,R.pointAt(s));R.advanceProgress(b);}assert.ok(Math.abs(b.progress)<1e-8);assert.equal(b.checkpoints,0);Object.assign(b,R.pointAt(300));R.advanceProgress(b);assert.equal(b.checkpoints,0);assert.equal(b.progress,0);
});
test('旧版の途中レースはリプレイ位置から距離を復元し、再移行と確定結果に副作用なし',()=>{
 const {r}=race(),d=R.create(r,120),b=R.own(d),i=d.boats.indexOf(b);delete d.progressRule;d.replay.frames=[];d.paused=false;b.startTime=0;
 // Regular 0.5-second frames, with 100 metres discarded by the old buoy bookkeeping.
 for(let n=0;n<=250;n++){const progress=-42+n*6;Object.assign(b,R.pointAt(R.C.start+progress));b.progress=progress-Math.min(100,n);d.elapsed=n*.5;d.frame=n*30;R.recordReplay(d,true);}
 const expected=1458;assert.ok(R.migrateProgress(d));assert.ok(Math.abs(b.progress-expected)<.001);assert.equal(b.checkpoints,19);const saved=JSON.stringify(d);assert.equal(R.migrateProgress(d),false);assert.equal(JSON.stringify(d),saved);
 const done=structuredClone(d);delete done.progressRule;done.finalized=true;const before=JSON.stringify(done.boats);R.migrateProgress(done);assert.equal(JSON.stringify(done.boats),before);
});
test('強敵報酬・恋愛条件・本文・能力配布の処理はV119を維持',()=>{
 // extract_source.py includes the line breaks surrounding each inline script.
 for(const name of ['bonds','bonds-data','mentor-data','story','story-extra','development','drama','drama-data','campaign','campaign-data','finale','affinity','craft118'])assert.equal(fs.readFileSync(path.join(__dirname,'../src/'+name+'.js'),'utf8').trim(),fs.readFileSync(path.join(__dirname,'fixtures/v119-source/'+name+'.js'),'utf8').trim(),name);
 const old=fs.readFileSync(path.join(__dirname,'fixtures/v119-source/cast.js'),'utf8'),now=fs.readFileSync(path.join(__dirname,'../src/cast.js'),'utf8');assert.equal(now.slice(now.indexOf('function settle('),now.indexOf('function routeState(')),old.slice(old.indexOf('function settle('),old.indexOf('function routeState(')));
});
fs.writeFileSync(path.join(__dirname,'fixes-v120.json'),JSON.stringify(out,null,2));console.log(JSON.stringify({checks:out.checks.length,mentorPairs:Object.keys(out.mentorPairs).length,lapBug:out.lapBug,support:out.support}));
