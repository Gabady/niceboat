// Executes the actual UI functions with a small DOM adapter; this is not a visual/browser test.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const names=JSON.parse(read('tools/script_order.json')),report={build:'127',testType:'DOM adapter; no layout, touch, audio or physical-device verification',checks:[]};
const cls=()=>({add(){},remove(){},toggle(){}}),element=()=>({innerHTML:'',textContent:'',hidden:true,dataset:{},classList:cls(),style:{},querySelector(){return null},querySelectorAll(){return []}});
const nodes=Object.fromEntries(['app','toast','save-health121','modal'].map(n=>[n,element()])),listeners={};
const disk=new Map();let quota=false,backupOnly=false,controller;
const ctx=vm.createContext({console,structuredClone,TextEncoder,TextDecoder,performance,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},scrollTo(){},matchMedia:()=>({matches:true}),localStorage:{getItem:k=>disk.get(k)??null,setItem(k,v){if(quota||(backupOnly&&k.endsWith('_backup')))throw Object.assign(Error('full'),{name:'QuotaExceededError'});disk.set(k,v)},removeItem(k){disk.delete(k)}}});
for(const n of names.filter(n=>n!=='script'))vm.runInContext(read('src/'+n+'.js'),ctx,{filename:n+'.js'});
ctx.document={getElementById:id=>nodes[id]||null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(name,fn){listeners[name]=fn},body:{classList:cls()},documentElement:{style:{}},hidden:false};
ctx.window=ctx;ctx.KM_AUDIO=null;ctx.KM_PRESENTATION=null;
ctx.KM_DRIVE_UI.mount=(r,settings,callbacks)=>(controller={r,settings,callbacks,pause(){callbacks.save()},destroy(){}});
const source=read('src/script.js').replace('root.KM_APP={','root.QA121={actions,render,save,ui,mentorView,mentorIntroductionPanel125,epiloguePanel126,novelContext,supportPanel121,startPolicyPanel118,helpView,openNovel,novel:()=>novelCurrent,prepHub121,entryOptions,recordPractice122,practiceStore:()=>practiceRecords122,load(s,page){state=s;ui.page=page;render();},current:()=>state};root.KM_APP={');
vm.runInContext(source,ctx,{filename:'script-ui-test.js'});
const Q=ctx.QA121,E=ctx.KM_ENGINE,html=()=>nodes.app.innerHTML;
function preserve(before,after,at='career'){if(before===null||typeof before!=='object'){assert.equal(after,before,at);return;}if(Array.isArray(before))assert.equal(after.length,before.length,at);for(const key of Object.keys(before))preserve(before[key],after[key],at+'.'+key);}
function test(name,fn){fn();report.checks.push(name)}
function career(arc='light',seed=121){const s=E.newState(seed),p=E.character(s,'画面検証');p.scenario=arc;E.createCareer(s,p);return s}
test('初登場紹介を実画面へ挿入し、中断・再開と既知化を保存する',()=>{
 const s=career('light',126901);Q.load(s,'home');const c=s.career,p=c.player,stats=JSON.stringify(p.stats),scene={key:'intro-ui126',title:'旗の帰り道',person:{id:'natsu',name:'なつ'},body:['なつ「今日は旗を畳んで帰るね」','主人公「また話そう」']};
 Q.openNovel(scene);assert.ok(Q.novel()._introductions126);assert.equal(E.Introductions126.known(c,'natsu'),false);assert.match(html(),/なつ/);Q.actions.novelNext();const cursor=Q.novel().index;Q.actions.novelExit();Q.openNovel(scene);assert.equal(Q.novel().index,cursor);
 while(!E.Introductions126.known(c,'natsu'))Q.actions.novelNext();Q.actions.novelExit();Q.openNovel({...scene,key:'intro-ui126-second'});assert.equal(Q.novel()._introductions126,undefined);assert.equal(Q.novel().pages.length,2);assert.equal(JSON.stringify(p.stats),stats);assert.ok(E.validState(E.decode(JSON.stringify(s))));Q.actions.novelExit();
});
test('ナツの本編をGUIから開き、選択前に進行せず本人の表情を表示する',()=>{
 const s=career('back',126902),c=s.career;c.stage=2;c.player.totalEarnings=2000;E.startSeries(s);E.prepareRace(s);c.story.introductions.known.push('natsu');const q=c.bonds.heroines.natsu;Object.assign(q,{met:true,metStage:2,metRace:12});c.stats.races=12;Q.load(s,'bonds');Q.actions.meet('natsu');assert.equal(c.bonds.pending.id,'natsu');assert.equal(q.step,0);assert.match(html(),/data-portrait="natsu"/);let hasExpression=false;while(Q.novel().index<Q.novel().pages.length-1){if(/data-emotion="(warm|thoughtful|determined|surprised|blush)"/.test(html()))hasExpression=true;Q.actions.novelNext();}assert.ok(hasExpression);assert.equal(q.step,0);assert.match(html(),/novel-choices/);Q.actions.novelExit();assert.equal(q.step,0);
});
let terminalState;
test('実SG最終レース完了から結果エンディングを確定し、三者のカードを表示する',()=>{
 const s=career('back',126903),c=s.career;c.stage=8;c.player.totalEarnings=2500;c.history=[{stage:6,name:'G1前期',champion:true,finalType:'championship',finalPlace:1}];c.stats.races=53;E.startSeries(s);E.prepareRace(s);c.cast.introduction.step=2;
 const q=c.bonds.heroines.natsu;Object.assign(q,{met:true,metStage:2,metRace:12,step:7,choices:Array(7).fill(0),trust:100,affection:100,dated:true});c.bonds.partner=c.bonds.completed='natsu';
 const r=c.series.race;r.type='championship';c.series.finalType='championship';c.series.round=5;c.status='preRace';assert.ok(E.takeControl(s,false));r.drive.paused=false;for(let i=0;i<22000&&!r.drive.finished;i++)E.R.tick(r.drive,r,{},E.R.DT,true);assert.ok(r.drive.finished);E.completeDrive(s,false);assert.ok(c.lastResult);E.finishSeries(s);assert.ok(c.epilogues126);assert.ok(E.Epilogues126.valid(c.epilogues126));assert.equal(E.Epilogues126.list(c).length,3);assert.ok(E.validState(s));const fixed=JSON.stringify(c.epilogues126);E.finishSeries(s);assert.equal(JSON.stringify(c.epilogues126),fixed);
 Q.load(s,'seriesResult');assert.match(html(),/水面の、その先へ/);assert.equal((html().match(/data-action="epilogueRead"/g)||[]).length,3);assert.ok(html().indexOf('epilogue-panel126')<html().indexOf('登録前ラストショップ'));Q.actions.stories();assert.match(html(),/epilogue-panel126/);terminalState=E.clone(s);
});
test('主ライバル終幕の話者と肖像を取り違えず、エンディング再読は報酬を変えない',()=>{
 const s=E.clone(terminalState),c=s.career;Q.load(s,'seriesResult');const card=E.Epilogues126.list(c).find(x=>x.kind==='rival'),before=JSON.stringify(c.player);Q.actions.epilogueRead(c.player.id+'|'+card.key);assert.equal(Q.ui.page,'novel');assert.equal(Q.novel()._introductions126,undefined);const body=Q.novel().pages;let matched=0;for(let i=0;i<body.length;i++){const line=E.Dialogue.describe(body[i],Q.novel().context);if(line.person?.id===card.person.id)matched++;}assert.ok(matched>=3,'ライバル本人の発話を解決');Q.actions.novelNext();Q.actions.novelExit();Q.actions.epilogueRead(c.player.id+'|'+card.key);assert.equal(Q.novel().index,1);assert.equal(JSON.stringify(c.player),before);Q.actions.novelExit();
});
test('登録後の終幕と紹介記録を保持し、別育成中の読書で現在の関係を変更しない',()=>{
 const s=E.clone(terminalState),snapshot=JSON.stringify(s.career.epilogues126),intro=JSON.stringify(s.career.story.introductions),p=E.register(s);assert.equal(JSON.stringify(p.epilogueJournal),snapshot);assert.equal(JSON.stringify(p.storyJournal.introductions),intro);assert.ok(E.validState(E.decode(JSON.stringify(s))));const n=E.character(s,'次の選手');n.scenario='light';E.createCareer(s,n);const current=s.career;Object.assign(current.bonds.heroines.natsu,{met:true,metStage:0,metRace:0});current.affinity.rolled.push('natsu:1');current.affinity.requests.push({id:'natsu:1',heroine:'natsu',chapter:1,type:'gift',cost:90,target:0,status:'offer',created:0,deadline:null,resolved:null,delta:null,deferred:false});assert.ok(E.Affinity.offer(current));const before=JSON.stringify(s.career);Q.ui.profileId=p.id;Q.load(s,'profile');assert.match(html(),/epilogue-panel126/);const card=E.Epilogues126.list(p)[0];Q.actions.epilogueRead(p.id+'|'+card.key);assert.equal(Q.ui.novelRegistry,p.id);Q.actions.novelNext();Q.actions.novelExit();assert.equal(JSON.stringify(s.career),before);assert.equal(Q.ui.page,'profile');
});
test('旧版の終了直前データに後日談を追加し、途中登録には最優秀後を捏造しない',()=>{
 const s=E.clone(terminalState);delete s.career.epilogues126;s.build='125';const player=JSON.stringify(s.career.player),out=E.decode(JSON.stringify(s));assert.ok(out.career.epilogues126);assert.equal(JSON.stringify(out.career.player),player);assert.ok(E.validState(out));const fresh=career();const p=E.register(fresh,true);assert.equal(p.epilogueJournal,undefined);assert.ok(E.validState(fresh));
});
test('最優秀へ未進出の終了もその他エンドとなり、データ破損は読込時に拒否する',()=>{
 const s=career('light',126904),c=s.career;c.stage=8;assert.equal(E.startSeries(s),false);assert.equal(c.ending,'gate');assert.equal(c.epilogues126.outcome,'other');Q.load(s,'registration');assert.match(html(),/epilogue-panel126/);assert.ok(E.validState(s));const broken=E.clone(terminalState);broken.career.epilogues126.entries[0].outcome='bogus';assert.throws(()=>E.decode(JSON.stringify(broken)));const badRace=E.clone(terminalState);badRace.career.series.race.cheer126.heroine='unknown';assert.throws(()=>E.decode(JSON.stringify(badRace)));
});
fs.writeFileSync(path.join(__dirname,'story-integration-v127.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
