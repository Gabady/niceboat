/* Authoring compiler: text only; never alters probabilities, effects, IDs or choice order. */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=n=>require(path.join(root,n)),clone=x=>structuredClone(x);
const src=fs.readFileSync(path.join(__dirname,'dialogue-v109.txt'),'utf8'),text={};let key=null;
for(const raw of src.split(/\r?\n/)){if(raw.startsWith('@@ ')){key=raw.slice(3).trim();assert(!text[key],`Duplicate ${key}`);text[key]=[];}else if(key&&raw.trim()&&!raw.startsWith('#'))text[key].push(raw.trim());}
const need=k=>{assert(text[k]?.length,`Missing ${k}`);return text[k].slice();},responses=k=>need(k).map(s=>s.split('|||'));
const drama=clone(read('drama-data.js')),bonds=clone(read('bonds-data.js').heroines),mentors=clone(read('mentor-data.js')),extra=clone(read('story-extra.js'));
for(const [id,a] of Object.entries(drama.arcs)){a.intro=need('main.'+id+'.intro');a.chapters.forEach((ch,i)=>ch[1]=need(`main.${id}.${i}`));}
for(const [id,b] of Object.entries(drama.branches))b.body=need('branch.'+id);
for(const [id,r] of Object.entries(mentors)){const replies=responses('response.mentor.'+id);assert.equal(replies.length,5);r.chapters.forEach((ch,i)=>{ch.body=need(`mentor.${id}.${i}`);ch.choices.forEach(c=>c.reply=replies[i][c.aligned?0:1]);drama.mentor[id][i].body=ch.body.join('\n');});}
for(const [id,r] of Object.entries(drama.rivals)){r.replies=responses('response.rival.'+id);r.chapters.forEach((ch,i)=>ch[1]=need(`rival.${id}.${i}`));}
for(const h of bonds){const replies=responses('response.heroine.'+h.id);assert.equal(replies.length,7);h.chapters.forEach((ch,i)=>{ch.body=need(`heroine.${h.id}.${i}`);ch.choices.forEach(c=>c.reply=replies[i][c.code]);});h.final=need(`heroine.${h.id}.final`);}


drama.mainReplies=Object.fromEntries(Object.keys(drama.arcs).map(id=>[id,responses('response.main.'+id)]));
const shortReply=effect=>effect.stat?`${read('data.js').stats[effect.stat]}の動作を確認し、短い練習で試した。`:effect.best?'得意な動きを説明し、同じ条件で試し直した。':effect.worst?'苦手な動きを一つ選び、基本から確かめた。':effect.learn?(effect.learn==='motor'?'モーターの回転と音':'プロペラの形と水の受け方')+'を、記録と比べて確かめた。':effect.gear?(effect.gear==='motor'?'モーター':'プロペラ')+'の状態を確認し、選んだ方法で整備した。':effect.fame?'相手に直接話し、次に会う時の予定も伝えた。':effect.bond?'気になったことを聞き、説明を最後まで確かめた。':'選んだ内容を相手に伝え、準備を進めた。';
function eventText(e){const k='event.'+e.id;e.text=need(k).join('\n');const replies=text['response.event.'+e.id]?.[0]?.split('|||');if(replies)e.choices.forEach(ch=>ch.reply=replies[ch.aligned?0:1]);else for(const ch of e.choices)if(/選んだことを|言葉と行動が|物語になった|経歴に残った|あの日に選んだこと/.test(ch.reply))ch.reply=shortReply(ch.effect||{});
 if(e.branches){const first=extra.events.find(x=>x.arc===e.arc&&x.step===0),memory=responses('memory.'+e.id.replace(/_\d+$/,''))[0];e.branches.forEach((b,i)=>{b.text=memory[i]+'\n'+e.text;(b.choices||[]).forEach((ch,j)=>{if(j===0&&first)ch.label=first.choices[i].label;ch.reply=shortReply(ch.effect||{});});});}
}
for(const e of [...drama.daily,...drama.surges,...extra.events])eventText(e);
// The 51 original single-scene events are declared beside their calculation functions.
// Only their text is overridden here; their effect records remain authoritative in story.js.
const original=read('story.js').events.filter(e=>!e.id.startsWith('life_')&&!e.id.startsWith('novel_'));
drama.eventDialogue={};for(const e of original)drama.eventDialogue[e.id]=need('event.'+e.id).join('\n');
function write(name,global,value,after=''){const json=JSON.stringify(value,(_k,v)=>v===Infinity?'__INFINITY__':v,2).replace(/"__INFINITY__"/g,'Infinity');fs.writeFileSync(path.join(root,name),`/* V109 authored dialogue. IDs, effects and choice ordering retained. */\n(function(root){'use strict';\nconst data=${json};\n${after}\nroot.${global}=data;if(typeof module!=='undefined'&&module.exports)module.exports=data;\n})(globalThis);\n`);}
write('drama-data.js','KM_DRAMA_DATA',drama);write('mentor-data.js','KM_MENTOR_DATA',mentors);write('bonds-data.js','KM_BOND_DATA',{heroines:bonds},'data.map=Object.fromEntries(data.heroines.map(h=>[h.id,h]));');write('story-extra.js','KM_STORY_EXTRA',extra);
const stats={main:30,mentors:25,rivals:25,heroines:42,heroineFinals:6,events:original.length+extra.events.length+drama.daily.length+drama.surges.length,branches:5,lines:Object.values(text).reduce((n,a)=>n+a.length,0),characters:src.length};
fs.writeFileSync(path.join(__dirname,'dialogue-v109-counts.json'),JSON.stringify(stats,null,2)+'\n');console.log(stats);
