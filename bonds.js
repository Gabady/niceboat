/* v99: deterministic relationships. No clock or race RNG; each meeting consumes a saved slot. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),B=root.KM_BOND_DATA||(typeof require==='function'?require('./bonds-data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),copy=x=>JSON.parse(JSON.stringify(x));
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function blank(){return {step:0,trust:0,affection:0,failed:false,reason:'',dated:false,choices:[]};}
function ensure(c){if(!c.bonds)c.bonds={version:1,partner:null,nextAt:0,pending:null,heroines:Object.fromEntries(B.heroines.map(h=>[h.id,blank()])),training:{stages:[],rivals:{}},log:[],serial:0,reward:null};return c.bonds;}
function writable(c){return !!c&&!c.ending&&c.status!=='race'&&!(c.series?.race?.drive&&!c.series.race.done);}
function record(c,entry){const t=ensure(c);t.log.push({...entry,index:++t.serial,races:c.stats.races,stage:c.stage});t.log=t.log.slice(-80);}
function gate(c,id){const h=B.map[id];if(!c||!h)return {open:false,reason:'人物が見つかりません'};const t=ensure(c),q=t.heroines[id],e=h.chapters[q.step];
 if(!writable(c))return {open:false,reason:c.ending?'今回の育成は終了しました':'レース後に会えます'};
 if(q.failed)return {open:false,reason:q.reason||'友人として見守る関係になりました'};
 if(t.partner&&t.partner!==id)return {open:false,reason:'交際相手との時間を進められます'};
 if(c.stats.races<t.nextAt)return {open:false,reason:'あと'+(t.nextAt-c.stats.races)+'走で交流できます'};
 const needs=[];if(e){if(c.stats.races<e.races)needs.push('あと'+(e.races-c.stats.races)+'走');if(c.stage<e.stage)needs.push(D.stages[e.stage].name+'以降');if(q.trust<e.trust)needs.push('信頼を深める');if(q.affection<e.affection)needs.push('親しさを深める');if(e.dating&&t.partner!==id)needs.push('交際している');}
 return {open:true,chapter:!!e&&!needs.length,episode:e||null,needs,reason:!e?'二人の時間を過ごせます':needs.length?needs.join('・'):'第'+(q.step+1)+'話を進められます'};
}
function open(c,id){const g=gate(c,id);if(!g.open)return null;const t=ensure(c),q=t.heroines[id];t.pending={id,kind:g.chapter?'chapter':'visit',step:q.step,stamp:c.stats.races,key:id+':'+c.stats.races+':'+q.step+':'+t.serial};return copy(t.pending);}
function scene(c){const t=ensure(c),p=t.pending;if(!p)return null;const h=B.map[p.id],q=t.heroines[p.id];if(p.kind==='chapter')return {...h.chapters[p.step],heroine:h,kind:'chapter',key:p.key};return {heroine:h,kind:'visit',key:p.key,title:q.dated?'二人の休み時間':'次の話までの、ひととき',body:[q.dated?h.name+'と、忙しい日々の合間に会った。今日の話をし、相手の話も聞く。特別な出来事がなくても、約束を守って会う時間が二人をつないでいる。':h.name+'と短い時間を過ごす。話の続きを急がず、相手が今日、何を大切にしているかを聞いてみよう。',h.hint],choices:[{label:'話を聞き、一緒に過ごす'},{label:'自分の近況を話し、相手の近況も聞く'}]};}
function choose(c,key,index){if(!writable(c))return null;const t=ensure(c),p=t.pending;if(!p||p.key!==key||p.stamp!==c.stats.races||c.stats.races<t.nextAt)return null;const h=B.map[p.id],q=t.heroines[p.id],sc=scene(c);if(!Number.isInteger(index)||!sc.choices[index]||q.failed||t.partner&&t.partner!==h.id)return null;
 if(p.kind==='chapter'&&(q.step!==p.step||!gate(c,h.id).chapter))return null;
 const ch=sc.choices[index];t.pending=null;t.nextAt=c.stats.races+2;
 let title=sc.title,note,reward=null;
 if(p.kind==='visit'){q.trust=clamp(q.trust+5,0,100);q.affection=clamp(q.affection+5,0,100);note='急がず話す時間が、信頼と親しさにつながった。';}
 else{q.trust=clamp(q.trust+ch.trust,0,100);q.affection=clamp(q.affection+ch.affection,0,100);q.choices.push(ch.code);q.step++;note=ch.reply;
  if(ch.break||ch.friend){q.failed=true;q.reason=ch.friend?'友人として歩むことを選びました':'大切な約束を越えたため、交際には進めません';note=ch.friend?'恋人としてではなく、友人として応援し合う道を選んだ。':ch.reply;}
  else if(sc.confession){t.partner=h.id;q.dated=true;title='交際が始まりました';}
 }
 const z={kind:'romance',heroine:h.id,title,note,choice:ch.label,dated:q.dated,failed:q.failed,startedDating:!!sc.confession&&q.dated};record(c,z);return z;
}
function depart(c){if(c.bonds)c.bonds.pending=null;}
function final(c,r,api){if(!c||!r||c.stage!==8||r!==c.series?.race||r.type!=='championship'||r.done||r.drive)return null;const t=ensure(c),h=B.map[t.partner],q=h&&t.heroines[h.id];if(!h||!q.dated||q.failed||t.reward)return null;
 const acquired=api.acquire(c,c.player,h.skill,h.name+'とのSG優勝戦の約束');t.reward={heroine:h.id,skill:h.skill,raceId:r.id,shown:false};record(c,{kind:'final',heroine:h.id,title:h.finalTitle,note:h.final.join('\n'),choice:'SG優勝戦へ',skill:h.skill});return acquired;
}
function rivalInfo(c,id){const n=c.story?.rivals.find(x=>x.id===id);if(!n)return null;const live=c.series?.npcs.find(x=>x.id===id),key=live?D.statKeys.slice().sort((a,b)=>live.stats[b]-live.stats[a])[0]:D.statKeys[S.hash(id)%5];return {...n,key,level:live?.stats[key]||[45,47,55,57,64,67,76,78,90][c.stage]};}
function train(c,id,method,api){if(!writable(c)||!['parallel','review','duel'].includes(method))return null;const n=rivalInfo(c,id),t=ensure(c);if(!n||t.training.stages.includes(c.stage)||c.stats.races<t.nextAt)return null;
 const rec=t.training.rivals[id]||(t.training.rivals[id]={bond:0,learned:false});t.training.stages.push(c.stage);t.pending=null;t.nextAt=c.stats.races+2;
 const key=method==='review'?D.statKeys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0]:n.key;
 const score=c.player.stats[key]*.8+c.player.stats.power*.2+(S.hash(c.player.id+':'+id+':'+c.stage)%17)-8;
 const won=method==='duel'&&score>=n.level*.94,amount=method==='duel'?(won?.65:.2):method==='review'?.42:.4;
 const before=Math.floor(c.player.stats[key]);api.growStat(c.player,key,amount*1.5*api.statGrowthRate(c.player.stats[key])*api.growthFactor(c.player));rec.bond+=method==='duel'&&won?2:1;
 let skill=null;if(rec.bond>=3&&!rec.learned){const id=({speed:'wit_slipstream',turn:'wit_overtime',start:'wit_afteryou',accel:'wit_rudder',power:'wit_weather'})[n.key];skill=api.acquire(c,c.player,id,n.name+'との特訓');rec.learned=true;}
 const z={kind:'training',rivalId:id,title:n.name+'との特訓',note:method==='duel'?(won?'一本勝負に先着。相手も笑って、次の挑戦を約束した。':'一本勝負には届かず。それでも、相手の出口から学ぶものがあった。'):method==='review'?'互いの課題を言葉にし、苦手を一つだけ練習した。':'競いすぎず併走し、相手の得意な動きを確かめた。',choice:({parallel:'併走で学ぶ',review:'弱点を指摘し合う',duel:'一本勝負'})[method],stat:key,gain:Math.floor(c.player.stats[key])-before,skill:skill?.id||null,won};record(c,z);return z;
}
function status(c,id){const t=ensure(c),q=t.heroines[id];return q.failed?'友人の道':q.dated?'交際中':q.step>=4?'大切な存在':q.step>=2?'心を開く頃':q.step?'顔なじみ':'まだ出会っていない';}
function valid(t){const num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,n)=>typeof v==='string'&&v.length<=n;
 if(!t||t.version!==1||!(t.partner===null||B.map[t.partner])||!num(t.nextAt,0,1000)||!num(t.serial,0,500)||!t.heroines||Object.keys(t.heroines).length!==B.heroines.length)return false;
 for(const h of B.heroines){const q=t.heroines[h.id];if(!q||!num(q.step,0,7)||!num(q.trust,0,100)||!num(q.affection,0,100)||typeof q.failed!=='boolean'||typeof q.dated!=='boolean'||!str(q.reason,100)||!Array.isArray(q.choices)||q.choices.length!==q.step||!q.choices.every(v=>num(v,0,2))||q.dated&&(q.step<6||t.partner!==h.id||q.failed))return false;}
 if(t.partner&&!t.heroines[t.partner].dated)return false;
 const p=t.pending;if(p&&(!B.map[p.id]||!['chapter','visit'].includes(p.kind)||!num(p.step,0,7)||p.step!==t.heroines[p.id].step||!num(p.stamp,0,1000)||!str(p.key,100)||t.heroines[p.id].failed||p.kind==='chapter'&&p.step>=7))return false;
 const a=t.training;if(!a||!Array.isArray(a.stages)||a.stages.length>9||new Set(a.stages).size!==a.stages.length||!a.stages.every(v=>num(v,0,8))||!a.rivals||Object.keys(a.rivals).length>9||!Object.entries(a.rivals).every(([id,q])=>/^[a-zA-Z0-9_-]{1,100}$/.test(id)&&q&&num(q.bond,0,18)&&typeof q.learned==='boolean'))return false;
 if(!Array.isArray(t.log)||t.log.length>80||!t.log.every(l=>num(l.index,1,500)&&num(l.races,0,1000)&&num(l.stage,0,8)&&['romance','training','final'].includes(l.kind)&&str(l.title,100)&&str(l.note,1500)&&str(l.choice,100)&&(!l.skill||D.abilityMap[l.skill])))return false;
 const z=t.reward;if(z&&(!B.map[z.heroine]||z.skill!==B.map[z.heroine].skill||z.heroine!==t.partner||!str(z.raceId,110)||typeof z.shown!=='boolean'))return false;return true;
}
// Original vector portraits: stable faces from identity, never a gameplay random draw.
function portrait(person,large=false,emotion=null){const h=typeof person==='string'?B.map[person]:person;if(!h)return '';const P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);return P?P.render(h,large,emotion):'';}

const API={B,ensure,gate,open,scene,choose,depart,final,rivalInfo,train,status,valid,portrait,writable};root.KM_BONDS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
