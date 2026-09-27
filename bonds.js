/* v102: saved random encounters, exclusive final chapter, late-route risk and one-use schedule item. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),B=root.KM_BOND_DATA||(typeof require==='function'?require('./bonds-data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),copy=x=>JSON.parse(JSON.stringify(x));
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Only race preparation draws an encounter. Reading a screen never draws again.
const encounterRates=[.002,.004,.009,.013,.019,.023,.028,.035,.045];
function blank(){return {met:false,metStage:null,metRace:null,step:0,trust:0,affection:0,failed:false,reason:'',dated:false,choices:[]};}
function encounterState(c){return {seed:S.hash(c.player.id+':romance-v102'),rolled:[],notice:null};}
function ensure(c){
 if(!c.bonds)c.bonds={version:2,partner:null,completed:null,nextAt:0,waitHeroine:null,shortcutUsed:false,encounters:encounterState(c),pending:null,heroines:Object.fromEntries(B.heroines.map(h=>[h.id,blank()])),training:{stages:[],rivals:{}},log:[],serial:0,reward:null};
 const t=c.bonds;if(t.version===1){
  t.version=2;t.completed=t.partner&&t.heroines[t.partner].step===7&&!t.heroines[t.partner].failed?t.partner:null;t.shortcutUsed=false;t.encounters=encounterState(c);
  for(const h of B.heroines){const q=t.heroines[h.id],met=q.step>0||q.trust>0||q.affection>0||q.failed||q.dated||t.pending?.id===h.id;q.met=met;q.metStage=met?0:null;q.metRace=met?0:null;}
  const last=t.log.at(-1);t.waitHeroine=last?.kind==='romance'?last.heroine:null;
  if(c.series?.race)t.encounters.rolled.push(c.stage+':'+c.series.round);
 }
 return t;
}
function writable(c){return !!c&&!c.ending&&c.status!=='race'&&!(c.series?.race?.drive&&!c.series.race.done);}
function record(c,entry){const t=ensure(c);t.log.push({...entry,index:++t.serial,races:c.stats.races,stage:c.stage});t.log=t.log.slice(-80);}
function encounterRandom(e){e.seed=(Math.imul(e.seed,1664525)+1013904223)>>>0;return e.seed/4294967296;}
function encounter(c,r){if(!c?.player||!r||r!==c.series?.race||c.ending||r.done||r.drive||!['action','preRace'].includes(c.status))return null;const t=ensure(c),e=t.encounters,key=c.stage+':'+c.series.round;
 if(e.rolled.includes(key))return null;e.rolled.push(key);
 const pool=B.heroines.filter(h=>!t.heroines[h.id].met);if(!pool.length||encounterRandom(e)>=encounterRates[c.stage])return null;
 const h=pool[Math.floor(encounterRandom(e)*pool.length)],q=t.heroines[h.id];q.met=true;q.metStage=c.stage;q.metRace=c.stats.races;e.notice={id:h.id,stage:c.stage,races:c.stats.races,shown:false};
 record(c,{kind:'encounter',heroine:h.id,title:h.name+'との出会い',note:h.intro,choice:'水辺で言葉を交わした'});return copy(e.notice);
}
function metHeroines(c){const t=ensure(c);return B.heroines.filter(h=>t.heroines[h.id].met);}
function finalLock(t,id){return (t.completed||t.partner)&&((t.completed||t.partner)!==id)?(t.completed||t.partner):null;}
function gate(c,id){const h=B.map[id];if(!c||!h)return {open:false,reason:'人物が見つかりません'};const t=ensure(c),q=t.heroines[id],e=h.chapters[q.step];
 if(!q.met)return {open:false,undiscovered:true,reason:'まだ出会っていません'};
 if(q.failed)return {open:false,failed:true,reason:'ルート終了：'+q.reason};
 const lock=q.step===6&&finalLock(t,id);if(lock)return {open:false,locked:true,reason:t.completed?B.map[lock].name+'のルートを完走済みのため、最終話は進行できません':B.map[lock].name+'との交際を継続中のため、最終話は進行できません'};
 if(!writable(c))return {open:false,reason:c.ending?'今回の育成は終了しました':'レース後に会えます'};
 if(c.stats.races<t.nextAt)return {open:false,waiting:true,remaining:t.nextAt-c.stats.races,reason:'次に会えるまで あと'+(t.nextAt-c.stats.races)+'走'};
 const needs=[];if(e){if(c.stats.races<e.races)needs.push('あと'+(e.races-c.stats.races)+'走');if(c.stage<e.stage)needs.push(D.stages[e.stage].name+'以降');if(q.trust<e.trust)needs.push('信頼を深める');if(q.affection<e.affection)needs.push('親しさを深める');}
 return {open:true,chapter:!!e&&!needs.length,episode:e||null,needs,completed:t.completed===id,reason:!e?'二人の時間を過ごせます':needs.length?needs.join('・'):'第'+(q.step+1)+'話を進められます'};
}
function open(c,id){const g=gate(c,id);if(!g.open)return null;const t=ensure(c),q=t.heroines[id];t.pending={id,kind:g.chapter?'chapter':'visit',step:q.step,stamp:c.stats.races,key:id+':'+c.stats.races+':'+q.step+':'+t.serial};return copy(t.pending);}
function scene(c){const t=ensure(c),p=t.pending;if(!p)return null;const h=B.map[p.id],q=t.heroines[h.id];if(p.kind==='chapter'){
 const sc={...h.chapters[p.step],heroine:h,kind:'chapter',key:p.key};
 if(p.step===5&&finalLock(t,h.id)){sc.title='別々の未来、その手前';sc.body=[h.name+'は、あなたに大切な相手がいることを知っていた。これまで話してきた悩みも、一緒に見つけた答えも、それで消えるわけではない。','恋人としての約束を重ねることはできない。それでも、相手の未来を応援する言葉は選べる。二人は、これからの距離について話し始めた。'];sc.choices=sc.choices.map(ch=>ch.code===0?{...ch,label:'友人として、これからも話を聞きたい',reply:'相手は静かに頷いた。恋人の約束ではなく、互いの未来を応援する言葉を交わした。'}:ch.code===1?{...ch,label:'ここで関係に区切りをつける'}:{...ch,label:'恋人より自分を優先してほしいと言う'});}
 return sc;
 }return {heroine:h,kind:'visit',key:p.key,title:q.dated?'二人の休み時間':'次の話までの、ひととき',body:[q.dated?h.name+'と、忙しい日々の合間に会った。今日の話をし、相手の話も聞く。特別な出来事がなくても、約束を守って会う時間が二人をつないでいる。':h.name+'と短い時間を過ごす。話の続きを急がず、相手が今日、何を大切にしているかを聞いてみよう。',h.hint],choices:[{label:'話を聞き、一緒に過ごす'},{label:'自分の近況を話し、相手の近況も聞く'}]};}
function choose(c,key,index){if(!writable(c))return null;const t=ensure(c),p=t.pending;if(!p||p.key!==key||p.stamp!==c.stats.races||c.stats.races<t.nextAt)return null;const h=B.map[p.id],q=t.heroines[p.id],sc=scene(c);if(!Number.isInteger(index)||!sc.choices[index]||!q.met||q.failed||!gate(c,h.id).open)return null;
 if(p.kind==='chapter'&&(q.step!==p.step||!gate(c,h.id).chapter))return null;
 const ch=sc.choices[index];t.pending=null;let title=sc.title,note,startedDating=false,completed=false;
 if(p.kind==='visit'){q.trust=clamp(q.trust+5,0,100);q.affection=clamp(q.affection+5,0,100);note='急がず話す時間が、信頼と親しさにつながった。';}
 else{q.trust=clamp(q.trust+ch.trust,0,100);q.affection=clamp(q.affection+ch.affection,0,100);q.choices.push(ch.code);q.step++;note=ch.reply;
  if(ch.break||ch.friend){q.failed=true;q.reason=ch.friend?'友人として歩むことを選びました':'大切な約束を守れず、交際には進めなくなりました';q.dated=false;if(t.partner===h.id)t.partner=null;title='ルート終了 · '+h.name;note=ch.friend?'恋人としてではなく、友人として応援し合う道を選んだ。':ch.reply;}
  else if(sc.resolution){t.partner=h.id;t.completed=h.id;q.dated=true;startedDating=true;completed=true;title='ルート完走 · '+h.name;}
  else if(sc.confession)title=finalLock(t,h.id)?'それぞれの未来へ':'想いを伝えました';
 }
 t.nextAt=c.stats.races+(q.step>=4?3:2);t.waitHeroine=h.id;
 const z={kind:'romance',heroine:h.id,title,note,choice:ch.label,dated:q.dated,failed:q.failed,startedDating,completed};record(c,z);return z;
}
function shortcutGate(c){if(!c?.player)return {ok:false,reason:'育成中に使用できます'};const t=ensure(c),q=t.heroines[t.waitHeroine];
 if(t.shortcutUsed)return {ok:false,reason:'この育成では使用済みです'};
 if(!writable(c))return {ok:false,reason:'レース前後に使用できます'};
 if(!q||!q.met||q.failed||q.step>=7||q.step===6&&finalLock(t,t.waitHeroine))return {ok:false,reason:'進行中のヒロインの約束に使えます'};
 if(t.pending)return {ok:false,reason:'会話への返答を先に決めてください'};
 const remaining=t.nextAt-c.stats.races;if(remaining<=0)return {ok:false,reason:'今は待ち時間がありません'};
 return {ok:true,before:remaining,after:Math.max(0,remaining-2)};
}
function shortcut(c){const g=shortcutGate(c);if(!g.ok)return {error:g.reason};const t=ensure(c);t.shortcutUsed=true;t.nextAt=c.stats.races+g.after;record(c,{kind:'shortcut',heroine:t.waitHeroine,title:'ふたりの予定手帳を使った',note:'次に会うまで '+g.before+'走 → '+g.after+'走。',choice:'一度だけ、予定を合わせた'});return g;}
function depart(c){if(c.bonds)c.bonds.pending=null;}
function final(c,r,api){if(!c||!r||c.stage!==8||r!==c.series?.race||r.type!=='championship'||r.done||r.drive)return null;const t=ensure(c),h=B.map[t.partner],q=h&&t.heroines[h.id];if(!h||!q.dated||q.failed||t.reward)return null;
 const skill=c.player.difficulty==='easy'?D.easyRewardMap[h.skill]:h.skill;const acquired=api.acquire(c,c.player,skill,h.name+'とのSG優勝戦の約束');t.reward={heroine:h.id,skill,raceId:r.id,shown:false};record(c,{kind:'final',heroine:h.id,title:h.finalTitle,note:h.final.join('\n'),choice:'SG優勝戦へ',skill});return acquired;
}
function rivalInfo(c,id){const n=c.story?.rivals.find(x=>x.id===id);if(!n)return null;const live=c.series?.npcs.find(x=>x.id===id),key=live?D.statKeys.slice().sort((a,b)=>live.stats[b]-live.stats[a])[0]:D.statKeys[S.hash(id)%5];return {...n,key,level:live?.stats[key]||[45,47,55,57,64,67,76,78,90][c.stage]};}
function train(c,id,method,api){if(!writable(c)||!['parallel','review','duel'].includes(method))return null;const n=rivalInfo(c,id),t=ensure(c);if(!n||t.training.stages.includes(c.stage)||c.stats.races<t.nextAt)return null;
 const rec=t.training.rivals[id]||(t.training.rivals[id]={bond:0,learned:false});t.training.stages.push(c.stage);t.pending=null;t.nextAt=c.stats.races+2;t.waitHeroine=null;
 const key=method==='review'?D.statKeys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0]:n.key;
 const score=c.player.stats[key]*.8+c.player.stats.power*.2+(S.hash(c.player.id+':'+id+':'+c.stage)%17)-8;
 const won=method==='duel'&&score>=n.level*.94,amount=method==='duel'?(won?.65:.2):method==='review'?.42:.4;
 const before=Math.floor(c.player.stats[key]);api.growStat(c.player,key,amount*1.5*api.statGrowthRate(c.player.stats[key])*api.growthFactor(c.player));rec.bond+=method==='duel'&&won?2:1;
 let skill=null;if(rec.bond>=3&&!rec.learned){const id=({speed:'wit_slipstream',turn:'wit_overtime',start:'wit_afteryou',accel:'wit_rudder',power:'wit_weather'})[n.key];skill=api.acquire(c,c.player,id,n.name+'との特訓');rec.learned=true;}
 const z={kind:'training',rivalId:id,portraitKey:n.portraitKey||null,title:n.name+'との特訓',note:method==='duel'?(won?'一本勝負に先着。相手も笑って、次の挑戦を約束した。':'一本勝負には届かず。それでも、相手の出口から学ぶものがあった。'):method==='review'?'互いの課題を言葉にし、苦手を一つだけ練習した。':'競いすぎず併走し、相手の得意な動きを確かめた。',choice:({parallel:'併走で学ぶ',review:'弱点を指摘し合う',duel:'一本勝負'})[method],stat:key,gain:Math.floor(c.player.stats[key])-before,skill:skill?.id||null,won};record(c,z);return z;
}
function status(c,id){const t=ensure(c),q=t.heroines[id];return !q.met?'未発見':q.failed?'ルート終了':t.completed===id?'完走・交際中':q.step===6&&finalLock(t,id)?'最終話は進行不可':q.dated?'交際中':q.step===6?'最終話を待つ':q.step>=4?'物語の終盤':q.step>=2?'心を開く頃':q.step?'顔なじみ':'出会ったばかり';}
function valid(t){const num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,n)=>typeof v==='string'&&v.length<=n;
 if(!t||![1,2].includes(t.version)||!(t.partner===null||B.map[t.partner])||!num(t.nextAt,0,1000)||!num(t.serial,0,500)||!t.heroines||Object.keys(t.heroines).length!==B.heroines.length)return false;
 for(const h of B.heroines){const q=t.heroines[h.id];if(!q||!num(q.step,0,7)||!num(q.trust,0,100)||!num(q.affection,0,100)||typeof q.failed!=='boolean'||typeof q.dated!=='boolean'||!str(q.reason,100)||!Array.isArray(q.choices)||q.choices.length!==q.step||!q.choices.every(v=>num(v,0,2))||q.dated&&(q.step<6||t.partner!==h.id||q.failed))return false;}
 if(t.partner&&!t.heroines[t.partner].dated)return false;
 if(t.version===2){
  if(!(t.completed===null||B.map[t.completed])||!(t.waitHeroine===null||B.map[t.waitHeroine])||typeof t.shortcutUsed!=='boolean')return false;
  if(t.completed&&(t.partner!==t.completed||t.heroines[t.completed].step!==7||t.heroines[t.completed].failed))return false;
  for(const h of B.heroines){const q=t.heroines[h.id];if(typeof q.met!=='boolean'||(q.met?!(num(q.metStage,0,8)&&num(q.metRace,0,1000)):q.metStage!==null||q.metRace!==null||q.step>0||q.trust>0||q.affection>0||q.failed||q.dated))return false;if(q.step===7&&!q.failed&&t.completed!==h.id)return false;}
  const e=t.encounters;if(!e||!num(e.seed,0,4294967295)||!Array.isArray(e.rolled)||e.rolled.length>54||new Set(e.rolled).size!==e.rolled.length||!e.rolled.every(k=>/^[0-8]:[0-5]$/.test(k)))return false;
  const n=e.notice;if(n&&(!B.map[n.id]||!t.heroines[n.id].met||!num(n.stage,0,8)||!num(n.races,0,1000)||typeof n.shown!=='boolean'))return false;
 }
 const p=t.pending;if(p&&(!B.map[p.id]||!['chapter','visit'].includes(p.kind)||!num(p.step,0,7)||p.step!==t.heroines[p.id].step||!num(p.stamp,0,1000)||!str(p.key,100)||t.heroines[p.id].failed||t.version===2&&!t.heroines[p.id].met||p.kind==='chapter'&&p.step>=7))return false;
 const a=t.training;if(!a||!Array.isArray(a.stages)||a.stages.length>9||new Set(a.stages).size!==a.stages.length||!a.stages.every(v=>num(v,0,8))||!a.rivals||Object.keys(a.rivals).length>9||!Object.entries(a.rivals).every(([id,q])=>/^[a-zA-Z0-9_-]{1,100}$/.test(id)&&q&&num(q.bond,0,18)&&typeof q.learned==='boolean'))return false;
 if(!Array.isArray(t.log)||t.log.length>80||!t.log.every(l=>num(l.index,1,500)&&num(l.races,0,1000)&&num(l.stage,0,8)&&['romance','training','final','encounter','shortcut'].includes(l.kind)&&str(l.title,100)&&str(l.note,1500)&&str(l.choice,100)&&(!l.skill||D.abilityMap[l.skill])))return false;
 const z=t.reward;if(z&&(!B.map[z.heroine]||![B.map[z.heroine].skill,D.easyRewardMap[B.map[z.heroine].skill]].includes(z.skill)||(z.heroine!==t.partner&&!(t.heroines[z.heroine].failed&&t.log.some(l=>l.kind==='final'&&l.heroine===z.heroine&&l.skill===z.skill)))||!str(z.raceId,110)||typeof z.shown!=='boolean'))return false;return true;
}
// Generated raster portraits: stable identity, never a gameplay random draw.
function portrait(person,large=false,emotion=null){const h=typeof person==='string'?B.map[person]:person;if(!h)return '';const P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);return P?P.render(h,large,emotion):'';}

const API={B,encounterRates,encounter,metHeroines,finalLock,shortcutGate,shortcut,ensure,gate,open,scene,choose,depart,final,rivalInfo,train,status,valid,portrait,writable};root.KM_BONDS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
