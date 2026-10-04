'use strict';
// Actual lifecycle/physics and driving UI callbacks through a DOM adapter.
// This does not verify browser layout, Safari or physical-device interaction.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../src/script'),R=E.R,Cheer=require('../src/cheer126'),Renderer=require('../src/race-renderer');
const report={build:'126',scope:'Real source logic, deterministic race simulation and driving UI DOM event adapter; no browser or physical-device claim',checks:[],heroines:[]};
const test=(name,fn)=>{fn();report.checks.push(name)};
function fixture(id='akari'){
 const s=E.newState(126501),p=E.character(s,'応援検証');p.scenario='light';const c=E.createCareer(s,p);c.stage=8;c.player.totalEarnings=2500;E.startSeries(s);
 c.player.points=100;c.series.npcs.find(n=>n.id===E.Development.rival(c).id).points=95;c.series.npcs.find(n=>n.id==='mizuki').points=90;c.series.round=5;E.prepareRace(s);
 const r=c.series.race,t=E.Bonds.ensure(c),q=t.heroines[id];assert.ok(q,'heroine missing: '+id);Object.assign(q,{met:true,metStage:0,metRace:0,step:7,choices:[0,0,0,0,0,0,0],dated:true,failed:false,trust:100,affection:100});t.partner=t.completed=id;
 c.status='preRace';return {s,c,r};
}
function drive(r){r.drive=R.create(r,126501);r.drive.paused=true;return r.drive;}
function target(){const listeners={};return {listeners,addEventListener(t,f){(listeners[t]??=[]).push(f)},removeEventListener(t,f){listeners[t]=(listeners[t]||[]).filter(x=>x!==f)},emit(t,e={}){for(const f of [...(listeners[t]||[])])f({preventDefault(){},...e})},classList:{add(){},remove(){},toggle(){}},style:{},dataset:{},hidden:true,innerHTML:'',textContent:'',clientWidth:393,clientHeight:852,setAttribute(){},getBoundingClientRect(){return{width:160,height:140,left:0,top:0}},setPointerCapture(){},getContext(){return null}}}
function mount(r,settings={},failRenderer=false){
 const nodes={},get=id=>nodes[id]??=target(),doc=target();doc.hidden=false;doc.getElementById=get;get('modal').hidden=true;let nextFrame,now=0,saves=0,broken=failRenderer;
 const eventRoot=target(),context={...eventRoot,console,document:doc,PointerEvent:function(){},performance:{now:()=>now},requestAnimationFrame:f=>(nextFrame=f,1),cancelAnimationFrame(){},setTimeout:()=>1,matchMedia:()=>({matches:false}),KM_RACING:R,KM_DATA:E.D,KM_CHEER126:Cheer,KM_THRILL:require('../src/thrill'),KM_FEEDBACK:require('../src/race-feedback'),KM_RACE_RENDERER:{COLORS:Renderer.COLORS,freshCanvas:x=>x,create:canvas=>{if(broken)throw Error('Test renderer is unavailable');return{canvas,mode:'canvas',draw(){},project:()=>null,isLost:()=>false,destroy(){}}}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/driving-ui.js'),'utf8'),context);
 const controller=context.KM_DRIVE_UI.mount(r,{motion:true,renderMode:'canvas',...settings},{save(){saves++},finish(){},skip(){},exit(){}});
 return {r,controller,doc,get,root:context,saves:()=>saves,renderReady(){broken=false},step(ms=17){now+=ms;nextFrame(now)},click(action){get('drive-shell').emit('click',{target:{closest:()=>({dataset:{drive:action}})}})}};
}
test('完走ヒロイン各人の最優秀優勝戦でだけ応援を準備',()=>{
 for(const h of E.Bonds.B.heroines){const {c,r}=fixture(h.id),before=structuredClone(c.player),seed=c.seed;const prepared=Cheer.prepare(c,r);assert.equal(prepared.heroine,h.id);assert.equal(prepared.state,'pending');assert.ok(Cheer.valid(prepared,r));assert.deepEqual(c.player,before);assert.equal(c.seed,seed);assert.equal(Cheer.prepare(c,r),prepared);drive(r);const info=Cheer.take(r);assert.equal(info.person.id,h.id);assert.ok(info.line.length>=20);assert.ok(['warm','determined'].includes(info.emotion));report.heroines.push({id:h.id,line:info.line,emotion:info.emotion});}
});
test('未完走・関係終了・別の相手・予選・準優勝戦・他シリーズでは発火しない',()=>{
 const mutations=[c=>c.bonds.completed=null,c=>c.bonds.heroines.akari.step=6,c=>c.bonds.heroines.akari.failed=true,c=>c.bonds.heroines.akari.dated=false,c=>c.bonds.partner='mio',c=>c.stage=7,(c,r)=>r.type='qualifier',(c,r)=>r.type='consolation',(c,r)=>r.grade='g1',(c,r)=>r.done=true];
 for(const mutate of mutations){const {c,r}=fixture();mutate(c,r);assert.equal(Cheer.prepare(c,r),null);assert.equal(r.cheer126,undefined)}
 const {c,r}=fixture();assert.equal(Cheer.prepare(c,{...r}),null);
});
test('瑞希は同じ優勝戦への出場有無で応援台詞と場面を変える',()=>{
 for(const onGrid of [true,false]){const {c,r}=fixture('mizuki');const me=r.runners.find(n=>n.id==='mizuki')||r.runners.find(n=>!n.isPlayer);if(onGrid){me.id='mizuki';me.castId=null;}else for(const n of r.runners)if(n.id==='mizuki'||n.castId==='mizuki'){n.id='non_mizuki';n.castId=null;}Cheer.prepare(c,r);drive(r);const z=Cheer.take(r);assert.equal(z.line.includes('私も、一着を取りに行く'),onGrid);assert.equal(z.place.includes('それぞれの艇'),onGrid);assert.doesNotMatch(z.line,/客席|スタンド|待ってる/)}
});
test('表示済み状態を保存し、JSON再読込・準備再呼出しでは重ねて出さない',()=>{
 const {c,r}=fixture();Cheer.prepare(c,r);drive(r);const seed=r.drive.seed,stats=structuredClone(r.drive.boats);assert.ok(Cheer.take(r));assert.equal(r.cheer126.state,'shown');assert.equal(Cheer.take(r),null);const restored=JSON.parse(JSON.stringify(r));assert.equal(Cheer.take(restored),null);assert.equal(Cheer.prepare(c,r).state,'shown');assert.equal(r.drive.seed,seed);assert.deepEqual(r.drive.boats,stats);
});
test('演出設定は標準・短縮・動き停止・なしで表示方法だけ変更',()=>{
 for(const [settings,mode] of [[{},'full'],[{presentation:'short'},'short'],[{motion:false},'short'],[{presentation:'off'},'plain']]){const {c,r}=fixture();Cheer.prepare(c,r);drive(r);const info=Cheer.take(r,settings),html=Cheer.markup(info);assert.equal(info.mode,mode);assert.ok(html.includes(info.line));assert.match(html,/汐見 灯/);if(mode==='plain')assert.doesNotMatch(html,/portrait-face|<img/);else assert.match(html,/data-emotion="warm"/);assert.doesNotMatch(html,/特殊能力|能力上昇|獲得/)}
});
test('進行中・完走済み・練習・動いている時計へ応援を割り込ませない',()=>{
 for(const mutate of [r=>r.drive.elapsed=.1,r=>r.drive.started=true,r=>r.drive.finished=true,r=>r.drive.paused=false,r=>r.drill='start',r=>r.done=true]){const {c,r}=fixture();Cheer.prepare(c,r);drive(r);mutate(r);assert.equal(Cheer.take(r),null)}
 const {c,r}=fixture();drive(r);r.drive.elapsed=10;assert.equal(Cheer.prepare(c,r),null);
});
test('任意フィールドの検証は旧セーブを許し、異なるレースや未知人物を拒否',()=>{
 const {c,r}=fixture(),q=Cheer.prepare(c,r);assert.equal(Cheer.valid(undefined,r),true);assert.equal(Cheer.valid(null,r),true);
 for(const patch of [{raceId:'different'},{heroine:'unknown'},{state:'again'},{version:2}])assert.equal(Cheer.valid({...q,...patch},r),false);
 assert.equal(Cheer.valid(q,{...r,type:'qualifier'}),false);assert.equal(Cheer.valid(q,{...r,grade:'g1'}),false);
});
test('実走行画面の初回は停止中に応援と開始ボタンを表示、追加タップなく開始',()=>{
 const {c,r}=fixture();Cheer.prepare(c,r);drive(r);const q=mount(r);assert.equal(q.saves(),1);assert.match(q.get('drive-overlay').innerHTML,/cheer-dialog126/);assert.equal(r.drive.paused,true);assert.equal(r.drive.elapsed,0);assert.match(q.get('drive-overlay').innerHTML,/data-drive="resume"/);assert.equal((q.get('drive-overlay').innerHTML.match(/data-drive="resume"/g)||[]).length,1);q.step(1000);assert.equal(r.drive.elapsed,0);
 q.click('resume');assert.equal(r.drive.paused,false);assert.equal(q.get('drive-overlay').hidden,true);q.step();q.step();assert.ok(r.drive.elapsed>0);q.click('pause');assert.doesNotMatch(q.get('drive-overlay').innerHTML,/final-cheer126/);const time=r.drive.elapsed;q.step(1000);assert.equal(r.drive.elapsed,time);q.click('resume');assert.equal(q.get('drive-overlay').hidden,true);q.controller.destroy();
 const second=mount(r);assert.doesNotMatch(second.get('drive-overlay').innerHTML,/final-cheer126/);second.controller.destroy();
});
test('最初の描画失敗では未表示のまま保持、軽量再開できてから一度だけ表示',()=>{
 const {c,r}=fixture();Cheer.prepare(c,r);drive(r);const q=mount(r,{},true);assert.equal(r.cheer126.state,'pending');assert.equal(q.saves(),0);assert.doesNotMatch(q.get('drive-overlay').innerHTML,/final-cheer126/);q.renderReady();q.click('light');assert.equal(r.cheer126.state,'shown');assert.match(q.get('drive-overlay').innerHTML,/final-cheer126/);q.controller.destroy();
});
test('応援中の非表示/回転は時計を進めず、同じ画面の一言を保持',()=>{
 const {c,r}=fixture();Cheer.prepare(c,r);drive(r);const q=mount(r,{presentation:'short'}),first=q.get('drive-overlay').innerHTML;q.root.emit('blur');q.doc.hidden=true;q.doc.emit('visibilitychange');q.root.emit('orientationchange');q.step(10000);assert.equal(r.drive.elapsed,0);assert.equal(r.drive.paused,true);assert.equal(q.get('drive-overlay').innerHTML,first);assert.equal(q.saves(),1);q.controller.destroy();
});
test('実際の出走開始API・保存検証・読込まで応援状態と既存特能報酬が一度だけ保持される',()=>{
 for(const id of ['akari','natsu']){const {s,c,r}=fixture(id);assert.ok(E.validState(s));const before=c.player.skills.slice();assert.equal(E.takeControl(s),r);assert.equal(c.status,'race');assert.equal(r.cheer126.state,'pending');assert.ok(E.validState(s));const reward=structuredClone(c.bonds.reward),skills=c.player.skills.slice(),first=mount(r);assert.equal(r.cheer126.state,'shown');assert.ok(E.validState(s));first.controller.destroy();const restored=E.decode(JSON.stringify(s)),race=restored.career.series.race;assert.ok(E.validState(restored));assert.equal(race.cheer126.state,'shown');assert.deepEqual(restored.career.bonds.reward,reward);assert.deepEqual(restored.career.player.skills,skills);assert.ok(skills.length>=before.length);assert.equal(E.takeControl(restored),race);assert.deepEqual(restored.career.player.skills,skills);assert.equal(Cheer.take(race),null);}
});
test('応援の有無で自動完走の乱数・順位・タイム・物理結果は同一',()=>{
 const {c,r}=fixture(),plain=structuredClone(r);Cheer.prepare(c,r);const left=R.runAI(r,991),right=R.runAI(plain,991);assert.equal(left.finished,true);assert.equal(right.finished,true);assert.deepEqual(left,right);assert.equal(Cheer.take({...r,drive:left}),null);
});
report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'cheer-v126.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,heroines:report.heroines.map(h=>h.id)}));
