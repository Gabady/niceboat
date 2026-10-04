// V123: narrative data may change; save IDs, thresholds, choices and rewards must not.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../src/script'),B=E.Bonds.B;
const textKeys=new Set(['body','title','label','reply','theme','hint','intro','final','finalTitle','visits','recoveryFinal']);
function rules(x){if(Array.isArray(x))return x.map(rules);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).filter(([k])=>!textKeys.has(k)&&k!=='map').map(([k,v])=>[k,rules(v)]));return x;}
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/heroine-rules-v122.json'),'utf8'));
const report={checks:[],scenes:0,choicePaths:0,visits:0,finals:0};
function test(name,fn){fn();report.checks.push(name);}
function ready(arc,id,step){const s=E.newState(123),p=E.character(s,'校閲検証');p.scenario=arc;const c=E.createCareer(s,p),t=E.Bonds.ensure(c),q=t.heroines[id];c.stage=7;c.stats.races=40;c.history=[{stage:6,champion:true}];Object.assign(q,{met:true,metStage:0,metRace:0,step,trust:100,affection:100,choices:Array(step).fill(0)});return c;}
test('V122の全人物・進行条件・選択分岐・スキル・数値を維持',()=>assert.deepEqual(rules(B),baseline));
test('通常42話と復帰差分14話、168選択経路を実エンジンで確認',()=>{
 for(const h of B.heroines)for(const arc of h.recoveryChapters?['light','recovery']:['light'])for(let step=0;step<7;step++){
  const episode=arc==='recovery'?h.recoveryChapters[step]:h.chapters[step];report.scenes++;
  for(let index=0;index<3;index++){
   const c=ready(arc,h.id,step),t=c.bonds,q=t.heroines[h.id];assert.equal(E.Bonds.gate(c,h.id).chapter,true);
   const pending=E.Bonds.open(c,h.id),scene=E.Bonds.scene(c);assert.equal(scene.id,episode.id);assert.deepEqual(scene.body,episode.body);
   const ch=episode.choices[index],z=E.Bonds.choose(c,pending.key,index);assert.ok(z);assert.equal(q.step,step+1);assert.equal(q.choices.at(-1),ch.code);
   assert.equal(q.trust,Math.min(100,100+ch.trust));assert.equal(q.affection,Math.min(100,100+ch.affection));assert.equal(q.failed,!!(ch.break||ch.friend));
   assert.equal(z.note,ch.reply);assert.equal(z.completed,!!(episode.resolution&&!q.failed));assert.equal(t.completed,z.completed?h.id:null);assert.equal(q.dated,z.completed);
   assert.ok(E.Bonds.valid(t),`${arc}:${episode.id}:${ch.code}`);assert.equal(E.Bonds.choose(c,pending.key,index),null,'同じ返答を二重適用しない');report.choicePaths++;
  }
 }
});
test('交際相手が既にいる時の台詞差替えで分岐・交際状態を変えない',()=>{
 for(const h of B.heroines)for(let index=0;index<3;index++){
  const c=ready('light',h.id,5),t=c.bonds,other=B.heroines.find(x=>x.id!==h.id),oq=t.heroines[other.id];
  Object.assign(oq,{met:true,metStage:0,metRace:0,step:7,trust:100,affection:100,choices:Array(7).fill(0),dated:true});t.partner=t.completed=other.id;
  const p=E.Bonds.open(c,h.id),scene=E.Bonds.scene(c),ch=scene.choices[index];assert.match(scene.body.join(''),/大切な相手/);
  assert.deepEqual(scene.choices.map(rules),h.chapters[5].choices.map(rules));
  assert.ok(ch.reply);if(ch.code===0||ch.code===1)assert.match(ch.reply,/友人|友達/);else assert.match(ch.reply,/大切な相手/);
  assert.ok(E.Bonds.choose(c,p.key,index));assert.equal(t.partner,other.id);assert.equal(t.completed,other.id);assert.ok(E.Bonds.valid(t));
 }
});
test('6人の日常12本と通常・復帰の終幕8本は表示可能',()=>{
 for(const h of B.heroines){
  const c=ready('light',h.id,7),t=c.bonds;t.partner=t.completed=h.id;t.heroines[h.id].dated=true;
  for(let i=0;i<h.visits.length;i++){t.log=Array(i).fill({kind:'romance',heroine:h.id});E.Bonds.open(c,h.id);const sc=E.Bonds.scene(c);assert.equal(sc.kind,'visit');assert.deepEqual(sc.body,h.visits[i]);report.visits++;}
  for(const arc of h.recoveryFinal?['light','recovery']:['light']){c.campaign.arc=arc;const f=E.Bonds.finalBody(c,h);assert.ok(f.length);assert.ok(f.join('\n').length<=1500,'終幕の保存上限');report.finals++;}
 }
});
test('全台詞・選択肢に空文、未定義文字列、かぎ括弧の欠落を含めない',()=>{
 for(const h of B.heroines){
  const episodes=[...h.chapters,...(h.recoveryChapters||[])];
  const lines=[h.intro,h.hint,h.theme,...h.final,...(h.recoveryFinal||[]),...h.visits.flat(),...episodes.flatMap(c=>[c.title,...c.body,...c.choices.flatMap(x=>[x.label,x.reply])])];
  for(const line of lines){assert.equal(typeof line,'string');assert.ok(line.trim());assert.doesNotMatch(line,/undefined|\[object Object\]|TODO|PLACEHOLDER/);assert.equal((line.match(/「/g)||[]).length,(line.match(/」/g)||[]).length,line);}
  for(const e of episodes){assert.equal(e.choices.length,3);assert.deepEqual(e.choices.map(x=>x.code).sort(),[0,1,2]);assert.ok(e.choices.every(x=>x.label.length<=100));for(let i=1;i<e.body.length;i++)assert.notEqual(e.body[i],e.body[i-1]);}
 }
});
test('告白前のG1優勝条件と最終話の好感度条件を維持',()=>{
 for(const h of B.heroines){let c=ready('light',h.id,5);c.history=[];assert.equal(E.Bonds.gate(c,h.id).chapter,false);c.history=[{stage:6,champion:true}];assert.equal(E.Bonds.gate(c,h.id).chapter,true);c=ready('light',h.id,6);c.bonds.heroines[h.id].affection=69;assert.equal(E.Bonds.gate(c,h.id).chapter,false);c.bonds.heroines[h.id].affection=70;assert.equal(E.Bonds.gate(c,h.id).chapter,true);}
});
report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'story-heroine-v123.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
