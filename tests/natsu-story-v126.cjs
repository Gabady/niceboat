'use strict';
// Data-contract and reader integration tests. Encounter/save/reward integration
// is exercised separately by natsu-logic-v126; no browser is simulated here.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),old=require('../../v125/src/bonds-data.js');
const h=require('../src/natsu-data126.js'),B=require('../src/bonds-data.js'),Dialogue=require('../src/dialogue.js');
const results=[];
function check(name,fn){fn();results.push({name,status:'pass'});}
const routeLines=route=>route.flatMap(c=>[...c.body,...c.choices.map(q=>q.reply)]);
const all=[...routeLines(h.chapters),...routeLines(h.recoveryChapters),...h.visits.flat(),...h.final,...h.recoveryFinal,h.visitReply];
check('one Natsu, canonical name and existing six stories preserved',()=>{
 assert.equal(B.heroines.length,7);assert.equal(B.heroines.filter(x=>x.id==='natsu').length,1);assert.equal(B.map.natsu,h);
 assert.equal(h.name,'なつ');assert.ok(h.aliases.includes('ナツ'));assert.equal(h.skill,'bond_natsu');
 for(const existing of old.heroines)assert.deepEqual(B.map[existing.id],existing);
});
check('browser script ordering loads the same route without CommonJS',()=>{
 const c=vm.createContext({});for(const file of ['natsu-data126.js','bonds-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'src',file),'utf8'),c,{filename:file});
 assert.equal(c.KM_BOND_DATA.heroines.length,7);assert.equal(JSON.stringify(c.KM_BOND_DATA.map.natsu),JSON.stringify(h));
});
check('all fourteen chapters honor the existing gate and choice contract',()=>{
 const fields=['races','stage','trust','affection','critical','confession','resolution','dating'];
 for(const route of [h.chapters,h.recoveryChapters]){
  assert.equal(route.length,7);
  route.forEach((c,i)=>{
   assert.equal(c.id,'natsu_'+i);assert.ok(c.title.length>0);assert.ok(c.body.length>=14);
   for(const field of fields)assert.equal(c[field],B.map.nagi.chapters[i][field],`chapter ${i}: ${field}`);
   assert.deepEqual(c.choices.map(q=>q.code).sort(),[0,1,2]);
   for(const q of c.choices){assert.equal(q.trust,q.code===0?14:q.code===1?6:-12);assert.equal(q.affection,q.code===0?12:q.code===1?7:-10);assert.ok(q.reply.startsWith('なつ「'));assert.ok(q.label.length<=60);}
   assert.equal(!!c.choices.find(q=>q.code===2).break,[2,4,5,6].includes(i));
   assert.equal(!!c.choices.find(q=>q.code===1).friend,i===5);
  });
 }
});
check('good choices meet chapter thresholds without negative-path lock bypass',()=>{
 for(const route of [h.chapters,h.recoveryChapters]){
  let trust=0,affection=0;
  for(const c of route){assert.ok(trust>=c.trust,`${c.id}: trust`);assert.ok(affection>=c.affection,`${c.id}: affection`);const q=c.choices.find(x=>x.code===0);assert.ok(!q.break&&!q.friend);trust=Math.min(100,trust+q.trust);affection=Math.min(100,affection+q.affection);}
  assert.equal(route.filter(c=>c.resolution).length,1);assert.equal(route[6].resolution,true);assert.equal(route.filter(c=>c.confession).length,1);
 }
});
check('recovery has separate authored bodies and independent choice objects',()=>{
 h.chapters.forEach((c,i)=>{assert.notDeepEqual(c.body,h.recoveryChapters[i].body);assert.notEqual(c.choices,h.recoveryChapters[i].choices);c.choices.forEach((q,j)=>{assert.notEqual(q,h.recoveryChapters[i].choices[j]);assert.deepEqual(q,h.recoveryChapters[i].choices[j]);});});
 assert.notDeepEqual(h.final,h.recoveryFinal);assert.equal(h.visits.length,2);assert.ok(h.visits.every(x=>x.length>=7));
 for(const body of [h.final,h.recoveryFinal]){assert.ok(body.length>=10);assert.ok(body.join('').includes('優勝戦'));assert.ok(body.join('').includes('勝'))}
 assert.ok(h.chapters[0].body.join('').includes('何度か言葉を交わしてきた'));
 assert.ok(h.recoveryChapters[0].body[0].includes('復帰してから'));
});
check('every authored expression cue exists, and both routes cover all six faces',()=>{
 const states=['calm','warm','thoughtful','determined','surprised','blush'];assert.deepEqual(Object.keys(h.expressionCues),states);
 const utterances=new Set(all.filter(x=>x.startsWith('なつ「')).map(x=>Dialogue.parse(x).text));
 for(const [state,cues] of Object.entries(h.expressionCues)){assert.ok(cues.length>=2);for(const cue of cues)assert.ok(utterances.has(cue),`${state}: nonexistent utterance ${cue}`);}
 for(const route of [h.chapters,h.recoveryChapters]){
  const body=routeLines(route),pages=Dialogue.pages(body),seen=new Set();
  for(let i=0;i<pages.length;i++){const line=Dialogue.describe(pages[i],{people:[h],person:h});if(line.person?.id==='natsu')seen.add(Dialogue.portraitEmotion(line,h,{scene:{body},index:i}));}
  assert.deepEqual([...seen].sort(),states.slice().sort());
 }
 for(const [state,cues] of Object.entries(h.expressionCues))for(const cue of cues){const body=['なつ「'+cue+'」'],line=Dialogue.describe(body[0],{people:[h],person:h});assert.equal(Dialogue.portraitEmotion(line,h,{scene:{body},index:0}),state,cue);}
 const player=Dialogue.describe('主人公「うれしい。私も、あなたのことが好き。旗を持っていない日にも会いたい。次は、二人のこれからの話をしよう。」',{people:[h],person:h});
 assert.equal(Dialogue.portraitEmotion(player,h,{scene:{body:['主人公「好きだ」']},index:0}),'calm');
});
check('dialogue is readable without unresolved markup or unsupported speakers',()=>{
 for(const text of all){assert.ok(typeof text==='string'&&text.trim());assert.ok(!/undefined|TODO|\{\{|<script/iu.test(text));const p=Dialogue.parse(text);if(p.speaker)assert.ok(['主人公','なつ'].includes(p.speaker),p.speaker);assert.ok(Dialogue.pages([text]).length>=1);}
 assert.ok(h.final.join('\n').length<=1500);assert.ok(h.recoveryFinal.join('\n').length<=1500);
});
const report={build:126,status:'pass',groups:results.length,chapters:14,visits:2,preFinalScenes:2,utterances:all.length,expressionCues:Object.values(h.expressionCues).reduce((s,x)=>s+x.length,0),results,scope:'Narrative data, browser module loading and shared reader/expression integration; no browser or device execution.'};
fs.writeFileSync(path.join(__dirname,'natsu-story-v126.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
