
/* Hard-only comeback events. Draw once on settlement; grant once on an explicit choice. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const keys=D.statKeys,copy=x=>JSON.parse(JSON.stringify(x));
const hash=s=>{let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h;};
const bridge=(when,place,caption='')=>'◇場面◇'+JSON.stringify({when,place,caption});
const hard=c=>c?.player?.difficulty==='hard';
function ensure(c){return c.awakening136||(c.awakening136={version:1,seed:hash(c.player.id+':awakening136'),noPodium:0,sixth:0,settled:[],entries:[]});}
function random(q){let t=q.seed+=0x6D2B79F5;q.seed>>>=0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
function chance(noPodium,sixth){if(sixth>=4)return {level:'strong',probability:Math.min(.40,.10+(sixth-4)*.06)};if(noPodium>=5)return {level:'awakening',probability:Math.min(.32,.08+(noPodium-5)*.04)};return {level:null,probability:0};}
function pending(c){return c?.awakening136?.entries.find(e=>!e.read)||null;}
function skills(c,q,strong){
 const picked=[],count=strong&&random(q)<.25?2:1;
 for(let i=0;i<count;i++){
  const rare=strong?(random(q)<.25?'UR':'SSR'):(random(q)<.25?'SSR':'SR');
  const eligible=D.abilities.filter(a=>a.rarity===rare&&!a.exclusive&&a.category!=='弱点'&&!picked.includes(a.id));
  const fresh=eligible.filter(a=>!c.player.skills.includes(a.id)),pool=fresh.length?fresh:eligible;
  if(pool.length)picked.push(pool[Math.floor(random(q)*pool.length)].id);
 }
 return picked;
}
const focusLines={speed:'速さを求めて、加速の途中から先を急いでいた。直線に入る前の準備から見直してみる。',turn:'旋回の入口と出口を別々に考えていた。同じ一本の線として、手帳に引き直してみる。',start:'時計ばかり追っていた。助走で何を揃えるか、そこから順番を書き出してみる。',accel:'遅れを取り返そうと力んでいた。艇が前へ出るまでの間を、もう一度確かめてみる。',power:'最後まで力を出そうとして、最初から固くなっていた。力を抜ける所も探してみる。'};
function body(c,e){
 const again=c.awakening136.entries.length>0,back=c.campaign?.arc==='recovery';
 if(e.level==='strong')return [bridge('レースを終えて','誰もいなくなった控室'),
  '結果表の六着に指を置く。これで'+e.sixth+'走続いた。もう見慣れた数字だと思ったのに、紙を畳む手が止まった。',
  '主人公（心の声）「次こそって、毎回言ってる。何を変えるかは、言わないままで」',
  back?'昔の表彰台より先に、復帰して初めて艇を出した日を思い出した。うまく走る以前に、もう一度ここへ来たかった。':'初めて練習の記録をつけたページを開く。着順の欄はなく、できなかったことが小さな字で並んでいた。',
  '今のページには着順しかない。ペンを取り、今日の準備から一つずつ書き足した。',
  bridge('休憩を挟んで','水面の見える通路','数字の隣に、確かめたいことが残った。'),
  focusLines[e.focus],
  '主人公「全部だめだった、で片づけてたな」',
  '一度で分かったふりはしたくない。映像を戻し、以前の練習のメモと見比べる。別々に覚えていた動きが、同じ順番でつながった。',
  again?'前にも、苦しい時期から抜け出すきっかけはあった。その時の答えをなぞるだけでは、今の相手には届かなかった。':'負けた時間を、よかったことにするつもりはない。それでも、そこに残っているものは使いたい。',
  '主人公（心の声）「勝てるって言うのは、まだ早い。でも次に試すことなら、もう言える」',
  '手帳を閉じる前に、やることを一つに絞るか、全体の順番を組み直すか考えた。'];
 return [bridge('レースのあと','宿舎の机'),
  '三着以内に届かないまま、'+e.noPodium+'走が過ぎた。連絡の返事に「惜しかった」と書きかけて、消す。誰かに言われる前から、自分で慰めようとしていた。',
  '主人公（心の声）「今日のどこが惜しかったか、ちゃんと話せるか」',
  '練習帳を開く。着順が悪かった日にも、前より揃った所や、繰り返し気になった所が書いてあった。',
  again?'前に掴んだ感覚と、今の課題は同じではない。余白に新しい線を引いた。':'一つずつでは小さくて、結果表には出ない。だからといって、何も残っていないわけでもなかった。',
  bridge('少し時間を置いて','艇庫の前','読み返したメモを、もう一度持っていく。'),
  focusLines[e.focus],
  '主人公「できた所まで、なかったことにしなくていい」',
  '焦って増やしていた注意書きを減らす。次の一走で確かめたい動きが、やっと短い言葉になった。',
  '主人公（心の声）「この一つを磨くか。それとも、ばらばらだった動きをつなぎ直すか」'];
}
function settle(c,r,z){
 if(!hard(c)||!r?.done||r.type==='exhibition'||z.raceId!==r.id||!Number.isInteger(z.place)||z.place<1||z.place>6)return null;const q=ensure(c);
 if(q.settled.includes(r.id))return null;q.settled.push(r.id);q.settled=q.settled.slice(-64);
 if(pending(c))return null;
 if(z.startFault||z.capsized||z.dnf){q.sixth=0;return null;}
 q.noPodium=z.place<=3?0:Math.min(60,q.noPodium+1);q.sixth=z.place===6?Math.min(60,q.sixth+1):0;
 const draw=chance(q.noPodium,q.sixth);if(!draw.level||random(q)>=draw.probability)return null;
 const focus=keys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0];
 const e={key:'awakening:'+r.id,raceId:r.id,stage:c.stage,at:c.stats.races,level:draw.level,noPodium:q.noPodium,sixth:q.sixth,focus,skills:skills(c,q,draw.level==='strong'),choice:null,gains:null,read:false,title:draw.level==='strong'?'強覚醒 — 六着の数字、その先へ':'覚醒 — まだ残っているもの'};
 e.body=body(c,e);q.entries.push(e);q.noPodium=0;q.sixth=0;z.awakening136={key:e.key,level:e.level};return e;
}
function rewardLines(e){return [...e.skills.map(id=>D.abilityMap[id].name+'を習得'),...keys.filter(k=>e.gains?.[k]>0).map(k=>D.stats[k]+'＋'+e.gains[k])];}
function scene(c,key){const e=c.awakening136?.entries.find(x=>x.key===key);if(!e)return null;return {key:e.key+(e.choice===null?'':':reply'),title:e.title,background:'workshop',body:e.choice===null?e.body:[e.choice===0?'手帳の一行に線を引いた。この感覚を、次の走りで使えるものにする。':'助走からゴールまでを書き直した。一つの動きで無理をしないよう、全体をつなぎ直す。',...rewardLines(e)],choices:e.choice===null?[{label:D.stats[e.focus]+'の感覚を磨く'},{label:'走り全体を組み立て直す'}]:[]};}
function choose(c,key,index,E){
 if(!hard(c)||!Number.isInteger(index)||index<0||index>1||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return null;
 const e=pending(c);if(!e||e.key!==key||e.choice!==null)return null;
 const strong=e.level==='strong',targets=index===0?[e.focus]:keys,amount=index===0?(strong?10:4):(strong?3:1),before=copy(c.player.stats);
 e.choice=index;
 const acquired=e.skills.map(id=>E.acquire(c,c.player,id,e.title,{statBonus:false}));
 for(const k of targets)c.player.stats[k]=Math.round(Math.min(D.statCeiling(c.player,k),c.player.stats[k]+amount)*100)/100;
 e.gains=Object.fromEntries(keys.map(k=>[k,Math.round((c.player.stats[k]-before[k])*100)/100]));
 const t=E.Story.ensure(c);t.log.push({index:++t.serial,stage:c.stage,kind:'event',title:e.title,note:'映像と練習の記録を見直し、次に試すことを決めた。',choice:sceneChoice(e,index),rewards:rewardLines(e),scene130:{body:e.body}});t.log=t.log.slice(-72);
 E.syncPlayerSnapshot(c);return {title:e.title,note:scene(c,key).body[0],rewards:acquired.map(a=>D.abilityMap[a.id].name+(a.duplicate?' · 習熟 Lv.'+a.level:'を習得')).concat(keys.filter(k=>e.gains[k]>0).map(k=>D.stats[k]+'＋'+e.gains[k]))};
}
function sceneChoice(e,index){return index===0?D.stats[e.focus]+'の感覚を磨く':'走り全体を組み立て直す';}
function mark(c,key){const e=c.awakening136?.entries.find(x=>x.key===key);if(!e||e.choice===null)return false;e.read=true;return true;}
function valid(q){
 if(q===undefined)return true;const n=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,max)=>typeof v==='string'&&v.length<=max;
 return !!q&&q.version===1&&n(q.seed,0,4294967295)&&n(q.noPodium,0,60)&&n(q.sixth,0,q.noPodium)&&Array.isArray(q.settled)&&q.settled.length<=64&&new Set(q.settled).size===q.settled.length&&q.settled.every(x=>str(x,160))&&Array.isArray(q.entries)&&q.entries.length<=20&&q.entries.filter(e=>!e?.read).length<=1&&new Set(q.entries.map(e=>e?.key)).size===q.entries.length&&q.entries.every(e=>e&&str(e.key,180)&&str(e.raceId,160)&&e.key==='awakening:'+e.raceId&&n(e.stage,0,8)&&n(e.at,0,9999)&&['awakening','strong'].includes(e.level)&&n(e.noPodium,0,60)&&n(e.sixth,0,e.noPodium)&&(e.level==='strong'?e.sixth>=4:e.noPodium>=5)&&keys.includes(e.focus)&&str(e.title,160)&&Array.isArray(e.body)&&e.body.length>=3&&e.body.length<=24&&e.body.every(x=>str(x,1500))&&Array.isArray(e.skills)&&e.skills.length>=1&&e.skills.length<=(e.level==='strong'?2:1)&&new Set(e.skills).size===e.skills.length&&e.skills.every(id=>{const a=D.abilityMap[id];return a&&!a.exclusive&&a.category!=='弱点'&&(e.level==='strong'?['SSR','UR']:['SR','SSR']).includes(a.rarity);})&&[null,0,1].includes(e.choice)&&typeof e.read==='boolean'&&(!e.read||e.choice!==null)&&(e.choice===null?e.gains===null:e.gains&&keys.every(k=>Number.isFinite(e.gains[k])&&e.gains[k]>=0&&e.gains[k]<=(e.choice===0?(k===e.focus?(e.level==='strong'?10:4):0):(e.level==='strong'?3:1)))));
}
const api={hard,ensure,chance,pending,settle,scene,choose,mark,valid};root.KM_AWAKENING136=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

