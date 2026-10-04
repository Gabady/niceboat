/* V123: narrative audit and unchanged branch/reward checks. Node-only, no browser claims. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
const src=path.resolve(__dirname,'../src');
const oldFingerprints={
  "campaign-data.js": "7fb22d8126249b305225bff47a3c1e942e3ecb33f125c961903cb4a15b2ff380",
  "mentor-data.js": "5a43cc523f5d2817a4f393959e1990b30928c5a5003783a53d82058de268e721",
  "cast.js": "13365fb839f468f1945da7a9670f35d1c88e47ff4db6e26319038bedb369d833",
  "campaign.js": "ad52078433d187f65a2e6b7f53488fdff23ac30eb69f46b61c01ffdc93477720",
  "finale.js": "b207d27041146a664c3046434c253d06b5f358837307aa42fea2629e4a373db4",
  "race-dialogue.js": "96af69b39367352f8a21feb78a17302b42b6b0cd521129ba0230d702e4bddff7"
};
let checks=0;const check=(name,f)=>{f();checks++;console.log('PASS '+name)};
const read=name=>fs.readFileSync(path.join(src,name),'utf8');
const mask=s=>s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,m=>/[\u3040-\u30ff\u3400-\u9fff]/.test(m)?'"<JA>"':m);
const fingerprint=s=>crypto.createHash('sha256').update(mask(s)).digest('hex');
function load(name,deps={}){const box={module:{exports:{}},...deps};box.globalThis=box;vm.runInNewContext(read(name),box,{filename:name});return box.module.exports;}
const mentors=load('mentor-data.js'),campaign=load('campaign-data.js');
for(const [name,expected] of Object.entries(oldFingerprints))check(name+': 構文と非表示処理の不変性',()=>{new vm.Script(read(name),{filename:name});assert.equal(fingerprint(read(name)),expected)});
const statKeys=['speed','turn','start','accel','power'];
const expectedMentors={hayase:{title:'並んで見える水平線',reward:'legend_speed',easyReward:'comet',titles:['一本の線では走れない','消せない航跡','前を譲る練習','名前のない余白','水平線を渡す日'],aligned:[0,1,0,1,0],keys:['turn','power','accel','turn','power']},tsukino:{title:'型の向こうの旋回',reward:'legend_turn',easyReward:'monkey_ur',titles:['美しい失敗','正解の重さ','外して残るもの','師匠に似ていない','名前のないターン'],aligned:[1,0,1,0,1],keys:['power','start','accel','power','start']},kuzumi:{title:'十二秒の、その手前',reward:'legend_start',easyReward:'zero',titles:['時計を見ない十二秒','早すぎた日','遅れる勇気ではなく','針を動かす','自分の一瞬'],aligned:[1,0,1,0,1],keys:['power','turn','accel','power','power']},akamine:{title:'もう一度、水をつかむ',reward:'legend_tide',easyReward:'wit_latefee',titles:['勢いだけなら教えない','戻れなかった速さ','空回りの音','もう速くなくても','再点火のその先'],aligned:[0,1,0,1,0],keys:['turn','power','speed','power','speed']},iwase:{title:'帰る場所の強さ',reward:'mirror',easyReward:'reflect',titles:['揺れを止める人','最後に帰る人','守りの隙間','頼る側の椅子','防波堤の向こう'],aligned:[1,0,1,1,0],keys:['turn','start','accel','speed','turn']}};
check('師匠30話：旧セーブ用章題・段階・報酬・選択判定を保持',()=>{
 assert.deepEqual(Object.keys(mentors),Object.keys(expectedMentors));
 for(const [id,exp] of Object.entries(expectedMentors)){
  const route=mentors[id];for(const k of ['title','reward','easyReward'])assert.equal(route[k],exp[k]);
  for(const chapters of [route.chapters,...(route.recoveryChapters?[route.recoveryChapters]:[])]){
   assert.equal(chapters.length,5);
   chapters.forEach((chapter,i)=>{assert.equal(chapter.title,exp.titles[i]);assert.equal(chapter.stage,[2,3,4,6,8][i]);assert.equal(chapter.choices.length,2);chapter.choices.forEach((choice,j)=>{assert.equal(choice.approach,j);assert.equal(choice.aligned,exp.aligned[i]===j);assert.equal(choice.key,j===0?null:exp.keys[i]);assert.ok(choice.label&&choice.reply)})});
  }
 }
});
check('旧メイン3ルート：勝敗3分岐と全成長差分を保持',()=>{
 assert.deepEqual(Array.from(campaign.stages),[1,3,5,7,8]);
 assert.deepEqual(campaign.arcs.map(x=>x.id).join(','),'light,back,shore');
 for(const arc of campaign.arcs){assert.equal(arc.intro.length,3);assert.equal(arc.chapters.length,5);assert.deepEqual(Object.keys(arc.craft).sort(),['accel','balanced','power','speed','start','turn']);for(const ch of arc.chapters){assert.equal(ch.body.length,2);assert.deepEqual(Object.keys(ch.variants).sort(),['setback','steady','win']);for(const s of [...ch.body,...Object.values(ch.variants)])assert.ok(s.length<240)}}
});
check('師匠台詞：括弧・短文単位・回復ルートを確認',()=>{
 let chapters=0;for(const r of Object.values(mentors))for(const eps of [r.chapters,...(r.recoveryChapters?[r.recoveryChapters]:[])])for(const ch of eps){chapters++;for(const s of [...ch.body,...ch.choices.flatMap(c=>[c.label,c.reply])]){assert.equal((s.match(/「/g)||[]).length,(s.match(/」/g)||[]).length,s);assert.ok(s.length<180,s)}}assert.equal(chapters,30);
});
const dialogue=load('race-dialogue.js',{KM_RACING:{},KM_PORTRAITS:{}});
check('レース台詞：16人物×6状況×2台詞を保持',()=>{
 assert.equal(Object.keys(dialogue.lines).length,16);for(const [id,events] of Object.entries(dialogue.lines)){assert.equal(events.length,6,id);for(const event of events){const alternatives=event.split('|');assert.equal(alternatives.length,2);assert.ok(alternatives.every(s=>s.length>0&&s.length<=25),event)}}
});
const finale=load('finale.js',{KM_DATA:{statKeys},KM_STORY:{},KM_DEVELOPMENT:{rival:()=>({id:'haruto',name:'春斗'})},KM_CAST:{},KM_BONDS:{}});
check('決勝会話：優勝・先着のみ・敗戦で結末を混同しない',()=>{
 for(const persona of ['king','rival_final'])for(const route of ['open','ally','duel'])for(const [won,champion] of [[true,true],[true,false],[false,false]]){
  const target={id:persona==='king'?'cast_teiou':'haruto',racePersona:persona,name:persona==='king'?'挺王':'春斗'};
  const c={stage:8,lastResult:{finalChallenge:{id:target.id,won,champion}},series:{race:{id:'final',type:'championship',runners:[target]}},finale:{rival:{route}}};
  const text=finale.outcomeScene(c).body.join('\n');assert.ok(!text.includes('立て直す判断が遅れました'));assert.ok(!text.includes('二人とも'));
  if(champion)assert.ok(text.includes('一番上'));else if(won)assert.ok(text.includes('優勝したのは、別の選手'));else assert.ok(!text.includes('優勝したのは、別の選手'));
 }
});
const affinity={ensure:()=>{},gate:()=>({open:true,remaining:0}),unlock:()=>{},choice:()=>({delta:1})};
const cast=load('cast.js',{KM_AFFINITY:affinity,KM_DATA:{statKeys,stages:Array.from({length:9},(_,i)=>({name:'段階'+i}))},KM_STORY:{},KM_MENTOR_DATA:mentors});
check('全選択組合せ：通常5師匠＋回復赤嶺の伝授判定を確認',()=>{
 let runs=0;
 for(const id of Object.keys(mentors))for(const recovery of [false,...(id==='akamine'?[true]:[])])for(let bits=0;bits<32;bits++){
  const c={stage:8,status:'hub',player:{difficulty:'normal',stats:Object.fromEntries(statKeys.map(k=>[k,50]))},stats:{races:0},cast:{mentor:{id},mentorLocked:true},campaign:{arc:recovery?'recovery':'light'}};
  const api={growStat:()=>{},statGrowthRate:()=>1,growthFactor:()=>1,acquire:(career,player,skill)=>({id:skill})};
  for(let i=0;i<5;i++){c.stats.races=i*2;const sc=cast.routeOpen(c);assert.ok(sc);const result=cast.routeChoose(c,sc.key,(bits>>i)&1,api);assert.ok(result);}
  const q=cast.routeState(c),score=q.choices.filter((v,i)=>mentors[id].chapters[i].choices[v].aligned).length,expected=score>=4&&mentors[id].chapters[4].choices[q.choices[4]].aligned;
  assert.equal(!!q.reward,expected,id+':'+bits);assert.equal(cast.validRoute(q,c.cast.mentor),true);
  if(!expected)assert.ok(q.log[4].note.includes('4回以上')&&q.log[4].note.includes('最終話'));runs++;
 }
 assert.equal(runs,192);
});
const report={build:123,scope:'Nodeによる文章構造・非表示処理不変性・師匠192経路・決勝18分岐の確認。ブラウザー表示の検証ではない。',checks,passed:true};
fs.writeFileSync(path.join(__dirname,'story-support-v123.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
