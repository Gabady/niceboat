const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {review}=require('../src/review122');
const report={build:'122',checks:[]};
function test(name,fn){fn();report.checks.push(name)}
function sector(index,start,gapChange,slide=0,wake=0,contacts=0){return {index,start,end:start+20,seconds:20,speed:300,slide,wake,contacts,rank:3,rankEnd:3,gap:10,gapEnd:10+gapChange}}
function result(sectors=[],mode='manual'){return {place:3,startFault:null,startTime:.12,capsized:false,dnf:false,driving:{controlMode:mode,time:130,metrics:{contacts:0,boundaries:0,slideSeconds:0,wakeSeconds:0,craft:{sectors,exitGood:0}}}}}
test('主な損失区間の引き波を、別区間の小さな境界接触より優先',()=>{
 const z=result([sector(0,20,1,0,0,1),sector(1,40,30,0,8,0)]);z.driving.metrics.boundaries=1;z.driving.metrics.wakeSeconds=8;
 const a=review(z);assert.equal(a.priority,'wake');assert.equal(a.drill,'wake');assert.equal(a.mark,40);assert.match(a.detail,/向こう正面/);assert.match(a.evidence,/40%/);assert.doesNotMatch(a.evidence,/原因です|せいです/);
});
test('順位低下区間も拾い、区間の滑りと引き波を比較',()=>{const x=sector(2,60,1,6,2);x.rankEnd=5;const a=review(result([x]));assert.equal(a.priority,'slide');assert.equal(a.mark,60);assert.match(a.detail,/3位→5位/)});
test('全体の接触数を無関係な区間の原因にしない',()=>{const z=result([sector(1,40,25)]);z.driving.metrics.contacts=9;z.driving.metrics.boundaries=2;const a=review(z);assert.equal(a.priority,'section');assert.equal(a.mark,40);assert.match(a.evidence,/原因を特定できません/)});
test('部分区間では観測済みの終端値を採用し、接触は差分で集計',()=>{
 const z=result([]),m=z.driving.metrics;m.contacts=5;m.boundaries=1;m.craft.current=sector(3,80,0,0,0,4);m.craft.current.rankEnd=3;
 z.observation={sections:[{name:'1周目・ホーム直線',t:80,rank:3,rankEnd:5,speed:54,slide:0,wake:0,gapChange:18}]};
 const a=review(z);assert.equal(a.priority,'contact');assert.equal(a.sections[0].contacts,2);assert.equal(a.sections[0].speed,54);assert.equal(a.mark,80);
});
test('終端未観測のcurrentから損失を推測しない',()=>{const z=result([]);z.driving.metrics.craft.current=sector(3,80,90,0,8);assert.equal(review(z).priority,'confirm');assert.equal(review(z).mark,null)});
test('FとLは区間の課題より優先し、無関係なリプレイ時刻を付けない',()=>{for(const fault of ['F','L']){const z=result([sector(1,40,30,0,8)]);z.startFault=fault;z.dnf=true;const a=review(z);assert.equal(a.priority,'start');assert.equal(a.key,'start');assert.equal(a.drill,'start');assert.equal(a.mark,null);assert.match(a.evidence,new RegExp(fault+'：'))}});
test('転覆と未完走の文脈を分け、原因は断定しない',()=>{const z=result([sector(1,40,30,0,8)]);z.capsized=true;z.dnf=true;let a=review(z);assert.equal(a.priority,'capsize');assert.equal(a.mark,null);assert.match(a.evidence,/断定はできません/);z.capsized=false;a=review(z);assert.equal(a.priority,'finish');assert.equal(a.mark,40);assert.match(a.tip,/立て直し/)});
test('同じ走行記録でも手動・観戦・途中から観戦を区別',()=>{
 const z=result([sector(1,40,30,0,8)]),manual=review(z);assert.equal(manual.manual,true);assert.doesNotMatch(manual.trainingLabel,/任意/);
 for(const mode of ['auto','spectator','skip','assisted']){z.driving.controlMode=mode;const a=review(z);assert.equal(a.manual,false);assert.equal(a.priority,manual.priority);assert.equal(a.mark,manual.mark);assert.match(a.trainingLabel,/任意/);assert.match(a.evidence,mode==='assisted'?/混在/:/操作の評価ではありません/);assert.match(a.tip,/次走/);assert.doesNotMatch(a.tip,/舵を戻す|踏み始め/)}
});
test('観戦中のスタート違反で本人の操作を責めない',()=>{const z=result([],'auto');z.startFault='F';const a=review(z);assert.match(a.tip,/スタート方針/);assert.doesNotMatch(a.tip,/遅らせ/);assert.match(a.evidence,/操作の評価ではありません/)});
test('全走行の秒数は所要時間に対する割合で判定',()=>{
 const z=result([]);z.driving.metrics.slideSeconds=4;z.driving.metrics.wakeSeconds=5;assert.equal(review(z).priority,'confirm');
 z.driving.metrics.wakeSeconds=20;assert.equal(review(z).priority,'wake');assert.match(review(z).evidence,/15%/);
 z.driving.metrics.slideSeconds=30;assert.equal(review(z).priority,'slide');assert.match(review(z).evidence,/23%/);
});
test('疎な旧記録でも空欄・NaNを出さず、操作評価を推定しない',()=>{
 for(const z of [{},{place:6,playerPhase:[]},{observation:{sections:[]}},{driving:{metrics:{}}},{driving:{metrics:{wakeSeconds:5}}},{driving:{controlMode:'old',metrics:{contacts:1}}}]){const a=review(z);assert.equal(a.manual,false);assert.equal(a.controlMode,'unknown');assert.match(a.evidence,/操作方式の記録がない/);assert.doesNotMatch(JSON.stringify(a),/NaN|undefined/);assert.equal(a.mark,null)}
 assert.equal(review(null),null);assert.equal(review(undefined),null);
});
test('旧observationのみでも同じ区間から助言とリプレイ位置を選ぶ',()=>{const z={observation:{sections:[{name:'2周目・向こう正面',t:75,rank:2,rankEnd:3,speed:54,slide:.5,wake:3,gapChange:10}]}};const a=review(z);assert.equal(a.priority,'wake');assert.equal(a.mark,75);assert.equal(a.sections[0].speed,54)});
test('壊れた区間要素を除外して残りの観測記録を表示',()=>{const z=result([null,false,7,'bad',sector(1,40,30,0,8)]);z.observation={sections:[null,false,{name:'1周目・向こう正面',t:40,rank:3,rankEnd:4,speed:54,slide:0,wake:8,gapChange:30}]};const a=review(z);assert.equal(a.priority,'wake');assert.equal(a.mark,40);assert.equal(a.sections.length,1);assert.equal(a.sections[0].seconds,20)});
test('良かった区間を、次の課題のリプレイ位置に混同しない',()=>{const x=sector(1,40,-10);x.rank=4;x.rankEnd=2;const a=review(result([x]));assert.match(a.success,/4位→2位/);assert.equal(a.priority,'confirm');assert.equal(a.mark,null)});
test('診断は凍結した記録を変更せず、乱数にも触れない',()=>{
 const z=result([sector(1,40,30,0,8)]),p={stats:{speed:100,turn:50,start:60,accel:30,power:30}},before=JSON.stringify({z,p});
 function freeze(o){if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o)}}freeze(z);freeze(p);
 const old=Math.random;Math.random=()=>{throw Error('RNG was used')};try{for(let i=0;i<20;i++)review(z,p)}finally{Math.random=old}assert.equal(JSON.stringify({z,p}),before);
});
fs.writeFileSync(path.join(__dirname,'review-v122.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
