'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),N=require('../src/natsu-data126.js'),B=require('../src/bonds-data.js'),D=require('../src/dialogue.js'),C=require('../src/heroine-expressions125.js'),P=require('../src/portraits.js');
require('../src/portrait-expressions.js');
const states=['calm','warm','thoughtful','determined','surprised','blush'],checks=[],assetFacts={};
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
async function test(name,fn){try{const detail=await fn();checks.push({name,passed:true,...detail});console.log('PASS '+name);}catch(e){checks.push({name,passed:false,error:e.message.slice(0,1500)});console.error('FAIL '+name+' '+e.message.slice(0,1500));}}
function allstrings(x){if(typeof x==='string')return[x];if(Array.isArray(x))return x.flatMap(allstrings);if(x&&typeof x==='object')return Object.entries(x).filter(([k])=>k!=='expressionCues').flatMap(([,v])=>allstrings(v));return[];}
function context(h){return {person:h,playerName:'選手',people:B.heroines};}
function emotion(h,body,index){const pages=D.pages(body),line=D.describe(pages[index],context(h)),person=line.person||(line.kind==='person'?null:h);return D.portraitEmotion(line,person,{scene:{person:h,body},index});}
async function main(){
 await test('New Natsu sheet is a real six-cell atlas with distinct visible faces',async()=>{
  const file=path.join(root,'assets/heroine-expressions/natsu-v126.webp'),bytes=fs.readFileSync(file),img=await loadImage(bytes);assert.equal(img.width,1536);assert.equal(img.height,1024);
  const cell=createCanvas(512,512),ctx=cell.getContext('2d'),hashes=[];for(let i=0;i<6;i++){ctx.clearRect(0,0,512,512);ctx.drawImage(img,(i%3)*512,Math.floor(i/3)*512,512,512,0,0,512,512);hashes.push(digest(ctx.getImageData(0,0,512,512).data));}assert.equal(new Set(hashes).size,6);
  assert.equal(globalThis.KM_PORTRAIT_EXPRESSIONS.natsu,'data:image/webp;base64,'+bytes.toString('base64'));
  Object.assign(assetFacts,{id:'natsu',width:img.width,height:img.height,states,webpBytes:bytes.length,webpSha256:digest(bytes),pngSha256:digest(fs.readFileSync(path.join(root,'assets/heroine-expressions/natsu-v126.png'))),cellSha256:hashes,visualReview:'Generated atlas and original portrait viewed: identity, mustard cardigan, short brown bob, waterside background and six expressions retained.'});return {width:img.width,height:img.height,cells:6};
 });
 await test('All eight preexisting expression sheets and base portraits remain byte-identical',()=>{
  const s={};vm.runInNewContext(fs.readFileSync(path.join(root,'../v125/src/portrait-expressions.js'),'utf8'),s);for(const[k,v]of Object.entries(s.KM_PORTRAIT_EXPRESSIONS))assert.equal(globalThis.KM_PORTRAIT_EXPRESSIONS[k],v,k);
  assert.equal(digest(fs.readFileSync(path.join(root,'src/portrait-assets.js'))),digest(fs.readFileSync(path.join(root,'../v125/src/portrait-assets.js'))));return {preserved:Object.keys(s.KM_PORTRAIT_EXPRESSIONS)};
 });
 await test('All seven heroines render six exact atlas positions and accessible labels',()=>{
  assert.equal(B.heroines.length,7);for(const h of B.heroines){assert.deepEqual(P.expressionLayout(h.id),{columns:3,rows:2,states});for(let i=0;i<states.length;i++){const f=P.expressionFrame(h.id,states[i]),html=P.render(h,true,states[i]);assert.equal(f.x,(i%3)*50);assert.equal(f.y,Math.floor(i/3)*100);assert(html.includes('data-portrait="'+h.id+'"'));assert(html.includes('data-emotion="'+states[i]+'"'));assert(html.includes('background-size:300% 200%'));assert(html.includes('background-position:'+f.x+'% '+f.y+'%'));assert(html.includes('aria-label="'+h.name+'の表情：'));}assert(P.render(h,true).startsWith('<img'));}return {heroines:7,frames:42};
 });
 await test('Natsu, fan, and Japanese name aliases retain one portrait identity',()=>{
  for(const id of ['natsu','fan','なつ','ナツ'])assert.equal(P.definition(id).key,'natsu');
  for(const raw of ['なつ「今日は旗を置いてきたよ」','ナツ「今日は旗を置いてきたよ」']){const line=D.describe(raw,context(N));assert.equal(line.person.id,'natsu');assert.equal(line.speaker,'なつ');}
 });
 await test('Natsu authored cues are original utterances and reach the correct expression',()=>{
  const actual=new Set(allstrings(N).map(x=>D.parse(x).text)),seen=new Set();let count=0;
  for(const state of states){assert(N.expressionCues[state]?.length>0);for(const raw of N.expressionCues[state]){assert(actual.has(raw),'missing source '+raw);assert(!seen.has(raw),'duplicate cue '+raw);seen.add(raw);assert.equal(emotion(N,['なつ「'+raw+'」'],0),state,raw);count++;}}
  return {cues:count,states:6};
 });
 await test('Natsu route and recovery chapters have authored facial performances',()=>{
  const groups=[...N.chapters.map(c=>c.body),...(N.recoveryChapters||[]).map(c=>c.body),...N.visits,N.final,N.recoveryFinal];
  for(const body of groups){const pages=D.pages(body);assert(pages.some((raw,i)=>emotion(N,body,i)!=='calm'),'all-neutral Natsu scene '+pages[0]);for(let i=0;i<pages.length;i++)assert(states.includes(emotion(N,body,i)));}return {scenes:groups.length};
 });
 await test('Existing six heroines preserve all authored expression cues',()=>{
  let count=0;for(const h of B.heroines.filter(h=>h.id!=='natsu'))for(const[state,rows]of Object.entries(C.cues[h.id]))for(const raw of rows){assert.equal(emotion(h,[h.name+'「'+raw+'」'],0),state);count++;}return {cues:count};
 });
 await test('Narration, player and other speakers never give the listener their expression',()=>{
  for(const h of B.heroines){for(const raw of ['主人公「うれしい。ありがとう！」','うれしい時間だった。','別の人「ありがとう！」']){const line=D.describe(raw,context(h));assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'warm',body:[raw]},index:0}),'calm');}
   const other=B.heroines.find(x=>x.id!==h.id),raw=other.name+'「笑えない。嬉しくない」',line=D.describe(raw,context(h));assert.equal(line.person.id,other.id);assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'warm',body:[raw]}}),'calm');assert.equal(D.portraitEmotion(line,other,{scene:{person:h,emotion:'warm',body:[raw]}}),'thoughtful');}
 });
 await test('Negated joy, wrapped dialogue and old three-panel portraits remain correct',()=>{
  for(const words of ['笑えない','笑ってごまかしたくない','嬉しくない','うれしいです。でも怖い','ありがとう。でも、困っています'])assert.equal(emotion(N,['なつ「'+words+'」'],0),'thoughtful');
  const raw='昔の強かったあなたを見に来ているだけではありません。'.repeat(5)+'怖いけれど、今の話を聞きたいです。',body=['なつ「'+raw+'」'];assert(D.pages(body).length>1);D.pages(body).forEach((p,i)=>{assert.equal(D.parse(D.pageSource(body,i)).text,raw);assert.equal(emotion(N,body,i),'thoughtful');});assert.equal(D.bookmark('a'),'dialogue118:a');
  for(const key of ['akamine','rival_03']){assert.deepEqual(P.expressionLayout(key),{columns:3,rows:1,states:['calm','thoughtful','warm']});assert.equal(P.expressionFrame(key,'blush').emotion,'warm');assert.equal(P.expressionFrame(key,'determined').emotion,'thoughtful');}
 });
 await test('Scene-specific cues follow the named speaker, original utterance and introduction prefixes',()=>{
  const sad='今日は残念だったけれど、聞きたいことがある。',joy='これからも隣で話していきたい。',long='あの日のことを、まだ覚えている。'.repeat(10)+'今日は自分の言葉で伝えるね。';
  const original=['なつ「'+sad+'」','主人公「'+joy+'」','なつ「'+joy+'」','なつ「'+long+'」','汐見 灯「'+sad+'」'],cues={thoughtful:[sad],warm:[joy],determined:[long]};
  for(const prefix of [[],['会場の外で、一人の女性が旗を畳んでいた。','なつ「応援団のなつです」','主人公は名乗り、声をかけてくれた礼を伝えた。']]){
   const scene={person:N,body:[...prefix,...original],expressionCues:cues},pages=D.pages(scene.body);assert(pages.length>scene.body.length);
   for(let i=0;i<pages.length;i++){const line=D.describe(pages[i],context(N)),source=D.parse(D.pageSource(scene.body,i)),person=line.person||N,actual=D.portraitEmotion(line,person,{scene,index:i});
    const want=line.person?.id==='natsu'?(source.text===sad?'thoughtful':source.text===joy?'warm':source.text===long?'determined':'calm'):'calm';assert.equal(actual,want,source.text);
   }
  }
  const raw='なつ「'+joy+'」',line=D.describe(raw,context(N));assert.equal(D.portraitEmotion(line,N,{scene:{person:B.map.akari,body:[raw],expressionCues:cues},index:0}),'calm');assert.equal(D.portraitEmotion(line,N,{scene:{person:N,body:[raw],expressionCues:{invalid:[joy],warm:'bad metadata'}},index:0}),'calm');
 });
 const result={version:126,scope:'Node presentation logic, original dialogue cues, actual image dimensions and atlas metadata; not browser/device rendering',checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length};
 fs.writeFileSync(path.join(__dirname,'expressions-v126.json'),JSON.stringify(result,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'natsu-art-v126.json'),JSON.stringify({build:126,count:1,totalStates:6,method:'built-in image_gen',asset:assetFacts,preservedLegacy:['akari','mio','nagi','kanade','tsumugi','mizuki','akamine','rival_03']},null,2)+'\n');if(result.failed)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
