'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),B=require('../src/bonds-data.js'),D=require('../src/dialogue.js'),C=require('../src/heroine-expressions125.js'),P=require('../src/portraits.js');
const states=['calm','warm','thoughtful','determined','surprised','blush'],checks=[];
function test(name,fn){try{const detail=fn();checks.push({name,passed:true,...detail});console.log('PASS '+name);}catch(e){checks.push({name,passed:false,error:e.message.slice(0,1500)});console.error('FAIL '+name+' '+e.message.slice(0,1500));}}
function allstrings(x){if(typeof x==='string')return [x];if(Array.isArray(x))return x.flatMap(allstrings);if(x&&typeof x==='object')return Object.values(x).flatMap(allstrings);return [];}
function context(h){return {person:h,playerName:'選手',people:B.heroines};}
function emotion(h,body,index){const pages=D.pages(body),line=D.describe(pages[index],context(h)),person=line.person||(line.kind==='person'?null:h);return D.portraitEmotion(line,person,{scene:{person:h,body},index});}
test('Six identities each have authored joy, doubt, resolve, surprise and affection cues',()=>{
 let count=0;const perHeroine={};for(const h of B.heroines){assert.deepEqual(Object.keys(C.cues[h.id]).sort(),states.filter(s=>s!=='calm').sort());const actual=new Set(allstrings(h).map(x=>D.parse(x).text)),seen=new Set();let n=0;for(const [state,rows]of Object.entries(C.cues[h.id]))for(const raw of rows){assert(actual.has(raw),h.id+' missing source '+raw);assert(!seen.has(raw),h.id+' duplicate cue');seen.add(raw);assert.equal(C.get(h.id,raw),state);count++;n++;}perHeroine[h.id]=n;}return {count,perHeroine};
});
test('Main chapters, daily visits, recovery chapters and finales use authored performances',()=>{
 const counts={main:0,visits:0,recovery:0,finales:0};for(const h of B.heroines){const groups=[['main',h.chapters.map(c=>c.body)],['visits',h.visits],['recovery',(h.recoveryChapters||[]).map(c=>c.body)],['finales',[h.final,...(h.recoveryFinal?[h.recoveryFinal]:[])]]];for(const [kind,bodies]of groups)for(const body of bodies){const pages=D.pages(body);assert(pages.some((raw,i)=>emotion(h,body,i)!=='calm'),h.id+' '+kind+' has no performance');for(let i=0;i<pages.length;i++)assert(states.includes(emotion(h,body,i)));counts[kind]++;}}return counts;
});
test('Player, unknown speaker, and narration never borrow the heroine smile',()=>{
 for(const h of B.heroines){for(const raw of ['主人公「うれしい。ありがとう！」','二人で笑った。うれしい時間だった。','別の人「ありがとう！」']){const line=D.describe(raw,context(h));assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'warm',body:[raw]},index:0}),'calm');}const other=B.heroines.find(x=>x.id!==h.id),raw=other.name+'「笑えない。嬉しくない」',line=D.describe(raw,context(h));assert.equal(line.person.id,other.id);assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'warm',body:[raw]}}),'calm');assert.equal(D.portraitEmotion(line,other,{scene:{person:h,emotion:'warm',body:[raw]}}),'thoughtful');}
});
test('Negated and mixed joy never uses a smile or blush through keyword matching',()=>{
 for(const h of B.heroines)for(const words of ['笑えない','笑ってごまかしたくない','嬉しくない','うれしくない','嬉しいとは思わない','うれしいです。でも怖い','ありがとう。でも、困っています','今日は楽しくない']){const raw=h.name+'「'+words+'」',line=D.describe(raw,context(h));assert.equal(D.portraitEmotion(line,h,{scene:{person:h,body:[raw]}}),'thoughtful',h.id+' '+words);}
 const cases=[['nagi','心配したことまで笑って済まされると、何を話していいか分からなくなります','thoughtful'],['kanade','出てません。もう一度って言われると、うれしいのに逃げたくなります','thoughtful'],['mizuki','うん。うれしくないわけじゃないよ','thoughtful'],['tsumugi','うれしいです。でも、お金を出してくれた人の希望を全部聞くお店にはできません','determined'],['mizuki','うん。私も、好きだから勝たせるなんて約束はしてない','determined']];for(const[id,raw,want]of cases){const h=B.map[id];assert.equal(emotion(h,[h.name+'「'+raw+'」'],0),want);}
});
test('Each confession changes expression only on the heroine utterance',()=>{
 for(const h of B.heroines){const body=h.chapters[5].body,pages=D.pages(body);assert(pages.some((p,i)=>emotion(h,body,i)==='blush'),h.id+' confession cue missing');for(let i=0;i<pages.length;i++){const line=D.describe(pages[i],context(h));if(line.kind==='player'||line.kind==='narration')assert.equal(emotion(h,body,i),'calm');}}
});
test('Authored cues remain stable through actual long-utterance page splitting',()=>{
 const h=B.map.mizuki,text='昔の強かったあなたを見に来ているだけではありません。'.repeat(5)+'怖いけれど、今の話を聞きたいです。',body=['',h.name+'「'+text+'」'];const pages=D.pages(body);assert(pages.length>1);for(let i=0;i<pages.length;i++){assert.equal(D.parse(D.pageSource(body,i)).text,text);assert.equal(emotion(h,body,i),'thoughtful');}assert.equal(D.bookmark('a'),'dialogue118:a');
});
test('Explicit scene emotion belongs to its actual speaker and is validated',()=>{
 const h=B.map.akari,raw=h.name+'「今日は工具を片づけます」',line=D.describe(raw,context(h));assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'surprised',body:[raw]}}),'surprised');assert.equal(D.portraitEmotion(line,h,{scene:{person:h,emotion:'invalid',body:[raw]}}),'calm');
});
test('Three-by-two atlas uses all six exact positions with stable identity and accessible labels',()=>{
 const oldX=globalThis.KM_PORTRAIT_EXPRESSIONS,oldL=globalThis.KM_PORTRAIT_EXPRESSION_LAYOUTS;try{globalThis.KM_PORTRAIT_EXPRESSIONS={...oldX};globalThis.KM_PORTRAIT_EXPRESSION_LAYOUTS={...oldL};for(const h of B.heroines){globalThis.KM_PORTRAIT_EXPRESSIONS[h.id]='data:image/png;base64,c3R1Yg==';globalThis.KM_PORTRAIT_EXPRESSION_LAYOUTS[h.id]={columns:3,rows:2,states};for(let i=0;i<states.length;i++){const frame=P.expressionFrame(h.id,states[i]),html=P.render(h,true,states[i]);assert.equal(frame.x,(i%3)*50);assert.equal(frame.y,Math.floor(i/3)*100);assert(html.includes('data-portrait="'+h.id+'"'));assert(html.includes('data-emotion="'+states[i]+'"'));assert(html.includes('background-size:300% 200%'));assert(html.includes('background-position:'+frame.x+'% '+frame.y+'%'));assert(html.includes('aria-label="'+h.name+'の表情：'));}assert(P.render(h,true).startsWith('<img'));}}finally{globalThis.KM_PORTRAIT_EXPRESSIONS=oldX;globalThis.KM_PORTRAIT_EXPRESSION_LAYOUTS=oldL;}
});
test('Existing three-panel characters and base portrait fallback retain identity',()=>{
 for(const key of ['akamine','rival_03']){assert.deepEqual(P.expressionLayout(key),{columns:3,rows:1,states:['calm','thoughtful','warm']});for(const[e,x]of [['calm',0],['thoughtful',50],['warm',100]])assert.equal(P.expressionFrame(key,e).x,x);assert.equal(P.expressionFrame(key,'blush').emotion,'warm');assert.equal(P.expressionFrame(key,'determined').emotion,'thoughtful');assert.equal(P.expressionFrame(key,'"><bad>').emotion,'calm');}assert.equal(P.definition('campaign_soma').key,'rival_03');assert.equal(P.definition('akamine').key,'akamine');const oldX=globalThis.KM_PORTRAIT_EXPRESSIONS;try{globalThis.KM_PORTRAIT_EXPRESSIONS={};for(const h of B.heroines){const html=P.render(h,true,'warm');assert(html.startsWith('<img'));assert(html.includes('data-portrait="'+h.id+'"'));}}finally{globalThis.KM_PORTRAIT_EXPRESSIONS=oldX;}
});
test('Bonds story, choices and rewards remain byte-identical to V124',()=>{
 const prior=path.resolve(root,'../v124/src/bonds-data.js');if(!fs.existsSync(prior))return {skipped:'V124 source unavailable'};const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');assert.equal(digest(prior),digest(path.join(root,'src/bonds-data.js')));
});
test('Actual heroine sheets declare the required six-state layout',()=>{
 require('../src/portrait-expressions.js');const available=B.heroines.filter(h=>globalThis.KM_PORTRAIT_EXPRESSIONS?.[h.id]);if(available.length!==B.heroines.length)return {pendingAssets:true,available:available.length};for(const h of B.heroines){assert.deepEqual(P.expressionLayout(h.id),{columns:3,rows:2,states});assert(/^data:image\/(png|webp|jpeg);base64,/.test(globalThis.KM_PORTRAIT_EXPRESSIONS[h.id]));}return {available:available.length};
});
const result={version:125,scope:'Node presentation logic, authored dialogue and atlas metadata; not browser/phone rendering',checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length};fs.writeFileSync(path.join(__dirname,'expressions-v125.json'),JSON.stringify(result,null,2)+'\n');if(result.failed)process.exitCode=1;
