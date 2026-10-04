// Permanent-stat growth regression. Actual engine entry points; no browser claims.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
function samples(E){
 const rows=[];
 function make(level,stage=2,mode='normal',arc='light'){
  const s=E.newState(125077),p=E.character(s,'成長検証');p.scenario=arc;p.difficulty=mode;p.growth='balanced';
  const c=E.createCareer(s,p);for(const k of E.D.statKeys)c.player.stats[k]=level;c.stage=stage;c.player.totalEarnings=2000;
  assert.ok(E.startSeries(s));E.prepareRace(s);
  // Compare growth after the new apprenticeship introduction has been read.
  if(E.Cast.introductionScene)for(let i=0;i<2;i++){const sc=E.Cast.introductionScene(c);if(sc)assert.ok(E.Cast.introductionAdvance(c,sc.key));}
  return {s,c,p:c.player,r:c.series.race};
 }
 function record(name,level,f,stage=2,mode='normal',arc='light'){
  const z=make(level,stage,mode,arc),before={...z.p.stats};const result=f(z);assert.ok(result,name);
  rows.push({name,level,stage,mode,gains:Object.fromEntries(E.D.statKeys.map(k=>[k,E.round(z.p.stats[k]-before[k])]))});
 }
 for(const level of [45,60,70,85,95]){
  for(const stage of [0,8])for(const mode of ['normal','easy'])for(const key of E.D.statKeys)
   record('練習:'+key,level,({c})=>E.train(c,key),stage,mode);
  record('師匠合同練習',level,({c})=>{const m=E.Cast.map[c.cast.mentor.id];return E.Development.training(c,m.key,'mentor',E)});
  record('ライバル合同練習',level,({c})=>E.Development.training(c,E.Development.rival(c).key,'rival',E));
  record('ライバルの個別特訓',level,({c})=>E.Bonds.train(c,E.Development.rival(c).id,'parallel',E));
  record('能力の新規獲得',level,({c,p})=>E.acquire(c,p,'comet','成長検証'));
  record('メインシナリオの選択',level,({c})=>E.Drama.choose(c,'opening',0,E));
  record('ライバルシナリオの選択',level,({c})=>{E.Drama.rivalScene(c,E.Development.rival(c));return E.Drama.chooseRival(c,0,E.Drama.B.rivals[c.development.rival.cast].chapters[0][3],E)});
  record('師匠シナリオの選択',level,({c})=>{const sc=E.Cast.routeOpen(c);assert.ok(sc);return E.chooseMentor(c,sc.key,sc.choices.findIndex(x=>x.aligned))});
  record('通常イベントの選択',level,({c,r})=>{c.story.pending={kind:'event',key:r.id+':finalticket',id:'finalticket',raceId:r.id,variant:0};return E.chooseStory(c,c.story.pending.key,0)});
  record('約束達成の報酬',level,({c,r})=>{assert.ok(E.Development.choosePlan(c,0));E.Development.plan(c).progress=2;const z={place:2,finish:[],acquired:[],activations:[]};E.Development.settle(c,r,z,E);return z.promise},2,'normal','recovery');
  record('レース結果の基本成長',level,({s,c,r,p})=>{E.simulate(c,r);const z=E.settleRace(s);assert.ok(z);return z},2);
 }
 return rows;
}
if(process.argv[2]==='--samples'){console.log(JSON.stringify(samples(require(path.resolve(process.argv[3])))));process.exit(0)}
const E=require('../src/script.js'),report={build:'125',scope:'Permanent ability growth, all five stats; actual engine entry points and threshold math',checks:[],rates:[],comparisons:[]};
const test=(name,f)=>{f();report.checks.push(name)};
const expectedRate=v=>v>=90?.07:v>=80?.20:v>=65?.45:v>=50?.8:v>=35?.9:1;
const oldRate=v=>v>=90?.16:v>=80?.4:v>=65?.6:v>=50?.8:v>=35?.9:1;
const independent=(before,raw)=>{
 const bands=[[0,35,1],[35,50,.9],[50,65,.8],[65,80,.45],[80,90,.2],[90,100,.07]];
 let value=before,budget=raw*E.D.permanentGrowthScale;
 for(const [lo,hi,rate] of bands){if(value>=hi)continue;const gain=Math.min(hi-value,budget*rate);value+=gain;budget-=gain/rate;if(budget<=1e-12)break;}
 return E.round(value);
};
test('B/A/S の減衰係数、5能力共通、C以下の係数維持',()=>{
 for(const value of [0,34.99,35,49.99,50,64.99,65,79.99,80,89.99,90,99.99,100]){
  assert.equal(E.statGrowthRate(value),expectedRate(value));
  for(const key of E.D.statKeys){const p={stats:{[key]:value}};assert.equal(E.lateGrowthFactor({player:p},key),expectedRate(value));}
 }
 for(const value of [45,60,70,85,95])report.rates.push({value,old:oldRate(value),current:expectedRate(value),reductionPercent:E.round((1-expectedRate(value)/oldRate(value))*100)});
});
test('5能力の全境界で大きい報酬を区間ごとに減衰、端数・上限維持',()=>{
 for(const key of E.D.statKeys)for(const before of [0,34.99,35,49.99,50,64.99,65,79.99,80,89.99,90,99.99,100])for(const raw of [.05,1,5,20,2000]){
  const p={stats:{[key]:before}},gain=E.growStat(p,key,raw*E.statGrowthRate(before));
  assert.equal(p.stats[key],independent(before,raw),`${key}/${before}/${raw}`);
  assert.equal(gain,E.round(p.stats[key]-before));assert.ok(p.stats[key]>=before&&p.stats[key]<=100);
 }
 assert.equal(independent(64,10),68.58);assert.equal(independent(79,10),81.4);assert.equal(independent(89,10),90.29);
});
test('負の増分は成長減衰・恒久成長倍率を掛けず、ゼロは値維持',()=>{
 for(const key of E.D.statKeys)for(const before of [0,34,64,65,79,80,89,90,100]){
  const p={stats:{[key]:before}};E.growStat(p,key,0);assert.equal(p.stats[key],before);
  const gain=E.growStat(p,key,-2.5);assert.equal(p.stats[key],Math.max(0,before-2.5));assert.equal(gain,p.stats[key]-before);
 }
});
const current=samples(E),fixture=path.join(__dirname,'fixtures/growth-v124-baseline.json');
if(!fs.existsSync(fixture)){
 const previous=path.resolve(root,'../v124/src/script.js');assert.ok(fs.existsSync(previous),'Initial comparison needs the actual V124 source');
 fs.mkdirSync(path.dirname(fixture),{recursive:true});fs.writeFileSync(fixture,cp.execFileSync(process.execPath,[__filename,'--samples',previous],{encoding:'utf8'}));
}
const baseline=JSON.parse(fs.readFileSync(fixture,'utf8'));
test('V124との150組比較：C以下は維持、B以上は各実成長経路で減速',()=>{
 assert.equal(current.length,150);assert.equal(current.length,baseline.length);
 current.forEach((row,i)=>{
  const old=baseline[i];assert.deepEqual([row.name,row.level,row.stage,row.mode],[old.name,old.level,old.stage,old.mode]);
  let total=0,totalOld=0;
  for(const key of E.D.statKeys){const a=row.gains[key],b=old.gains[key];total+=a;totalOld+=b;
   if(row.level<65)assert.equal(a,b,`${row.name}/${row.level}/${key}`);
   else {assert.ok(a<=b,`${row.name}/${row.level}/${key}: ${a} > ${b}`);}
  }
  assert.ok(total>0,`${row.name}/${row.level}: growth disappeared`);
  if(row.level>=65)assert.ok(total<totalOld,`${row.name}/${row.level}: growth did not slow`);
  if(row.stage===2&&row.mode==='normal')report.comparisons.push({...row,oldGains:old.gains});
 });
});
test('恒久能力への直接代入は初期生成/NPCのみ、全獲得元の減衰呼出を監査',()=>{
 const files=['script','drama','story','cast','bonds','development'];
 for(const name of files){const src=fs.readFileSync(path.join(root,'src',name+'.js'),'utf8');
  const calls=src.split('\n').filter(line=>/\bgrowStat\(/.test(line)&&!/^function growStat/.test(line));
  assert.ok(calls.length,name);for(const line of calls){assert.ok(/statGrowthRate|lateGrowthFactor|amount\)|,gain\)/.test(line),name+': '+line);}
 }
});
test('既存保存データを読み込んでも能力を削減しない',()=>{
 for(const file of ['v122-save.json','v123-save.json']){const raw=fs.readFileSync(path.join(__dirname,file),'utf8'),old=JSON.parse(raw),s=E.decode(raw);assert.deepEqual(s.career.player.stats,old.career.player.stats);assert.deepEqual(s.registry.map(p=>p.stats),old.registry.map(p=>p.stats));}
});
report.samples=current.length;report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'growth-v125.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,samples:report.samples,rates:report.rates}));
