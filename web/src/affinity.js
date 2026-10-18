


/* V108: relationship progression. Saved, independent random stream; no race physics changes. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const limit=x=>Math.max(0,Math.min(100,Math.round(x))),copy=x=>JSON.parse(JSON.stringify(x));
const thresholds={rival:60,mentor:60,heroine:70};
function hash(s){let n=2166136261;for(const ch of s)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return n;}
function ensure(c){
 if(!c.affinity){const d=c.development?.rival,aligned=d?.drama?.entries.filter(e=>e.decision?.aligned).length||0;
  c.affinity={version:1,rival:limit(8+(d?.history.filter(x=>x.won).length||0)*1+(d?.training||0)*1+aligned*3),mentors:{},unlocked:[],settled:[],trained:[],requests:[],rolled:[],seed:hash(c.player.id+':affinity108'),log:[]};
  const a=c.affinity,q=c.cast?.route;
  if(q&&(q.step>=5||q.pending?.step===4))a.unlocked.push('mentor:'+q.id);
  if(d?.drama?.entries.some(e=>e.index===(d.drama.version===2?7:4)))a.unlocked.push('rival');
  for(const [id,h]of Object.entries(c.bonds?.heroines||{}))if(h.step>=(c.bonds.version===3?8:7)||c.bonds.pending?.id===id&&c.bonds.pending?.step===(c.bonds.version===3?7:6))a.unlocked.push('heroine:'+id);
 }
 const a=c.affinity,m=c.cast?.mentor?.id;if(m&&a.mentors[m]===undefined){const q=c.cast?.route;a.mentors[m]=limit(10+(q?.id===m?q.log.filter(x=>x.aligned).length*3:0));}
 // Retire only unanswered paid requests. Historical purchases and money stay intact.
 for(const q of a.requests)if(q.type==='gift'&&q.status==='offer'){
  q.status='declined';q.resolved=c.stats.races;q.delta=0;q.retired133=true;
  const f=c.flow131;if(f){f.queue=f.queue.filter(x=>!(x.kind==='request'&&x.id===q.id));if(f.active?.kind==='request'&&f.active.id===q.id){f.active=null;f.reply=null;f.paused=false;}}
 }
 return a;
}
function value(c,kind,id){const a=ensure(c);return kind==='heroine'?c.bonds?.heroines[id]?.affection||0:kind==='mentor'?a.mentors[id]??10:a.rival;}
function key(kind,id){return kind==='rival'?'rival':kind+':'+id;}
function gate(c,kind,id){const a=ensure(c),current=value(c,kind,id),required=thresholds[kind],unlocked=a.unlocked.includes(key(kind,id));return {current,required,open:unlocked||current>=required,unlocked,remaining:Math.max(0,required-current)};}
function guidance(c,kind,id){const g=gate(c,kind,id);if(g.open)return '';if(kind==='heroine'){const h=c.bonds?.heroines[id];if(!h?.met||h.failed||c.bonds.completed||c.bonds.partner&&c.bonds.partner!==id)return '';return 'さらに交流を深めましょう · 会って話す／一緒に過ごす';}if(kind==='mentor'){if(!c.cast?.mentor||c.cast.route?.step>=5)return '';return '交流イベント・合同練習で信頼を育てましょう';}if(c.development?.rival.drama?.entries.filter(e=>e.decision).length>=8)return '';return '交流イベント・特訓で関係を育てましょう';}
function unlock(c,kind,id){const g=gate(c,kind,id),a=ensure(c),k=key(kind,id);if(!g.open)return false;if(!a.unlocked.includes(k))a.unlocked.push(k);return true;}
function change(c,kind,id,delta,reason){const a=ensure(c),before=value(c,kind,id),after=limit(before+delta),actual=after-before;
 if(kind==='heroine'){const q=c.bonds?.heroines[id];if(!q)return null;q.affection=after;}else if(kind==='mentor')a.mentors[id]=after;else a.rival=after;
 const z={kind,id:kind==='rival'?c.development.rival.id:id,before,after,delta:actual,reason,stage:c.stage,races:c.stats.races};a.log.push(z);a.log=a.log.slice(-60);return z;
}
function scaled(c,base){return base>=0?Math.max(1,Math.round(base*(1+c.stage*.15))):-Math.max(1,Math.round(-base*(1-c.stage*.07)));}
function train(c,raceId,scale=1){const a=ensure(c);if(a.trained.includes(raceId))return null;a.trained.push(raceId);a.trained=a.trained.slice(-60);return change(c,'rival',null,Math.max(1,Math.round(1*scale)),'ライバル特訓');}
function choice(c,kind,id,aligned){return change(c,kind,id,aligned?3:-2,'対話での返事');}
function random(a){a.seed=(Math.imul(a.seed,1664525)+1013904223)>>>0;return a.seed/4294967296;}
function offer(c){return ensure(c).requests.find(q=>q.status==='offer')||null;}
function active(c,id){return ensure(c).requests.find(q=>(!id||q.heroine===id)&&['offer','accepted'].includes(q.status))||null;}
function afterChapter(c,id){const a=ensure(c),h=c.bonds.heroines[id],stamp=id+':'+h.step;
 if(h.failed||h.step<1||h.step>6||a.rolled.includes(stamp))return null;a.rolled.push(stamp);
 if(active(c)||a.requests.filter(q=>q.heroine===id).length>=3||random(a)>=.40)return null;
 // Keep the existing race-promise frequency; paid gifts have no replacement roll.
 if(random(a)<.5)return null;
 const target=2+Math.floor(random(a)*2);
 const q={id:stamp,heroine:id,chapter:h.step,type:'race',cost:0,target,status:'offer',created:c.stats.races,deadline:null,resolved:null,delta:null};
 a.requests.push(q);return copy(q);
}
function requestScene(c,people){const q=offer(c);if(!q||q.type!=='race')return null;const h=people[q.heroine],name=h.name;
 return {key:'request:'+q.id,title:'次の一走の約束',person:h,background:'harbor',body:[name+'「次のレース、見に行けそうです。目標はもう決めました？」','主人公「'+q.target+'着以内。狙える準備はしたいと思ってる」',name+'「じゃあ、終わったら聞かせて。結果も、その前のことも」','次の公式レースで、スタート違反・転覆・棄権なく'+q.target+'着以内を目指す。'],choices:[{label:'終わったら、走りの話をしよう'},{label:'今回は着順の約束を控える'}]};
}
function reply(c,id,index){const q=offer(c);if(!q||q.type!=='race'||q.id!==id||![0,1].includes(index)||c.ending||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return null;
 const name=({akari:'灯',mio:'澪',nagi:'凪',kanade:'奏',tsumugi:'紬',mizuki:'瑞希',natsu:'なつ'})[q.heroine];
 if(index===0){q.status='accepted';q.deadline=c.stats.races+1;return {title:'次の一走の約束',heroine:q.heroine,note:'主人公「終わったら連絡する。いい報告ができるといいけど」\n'+name+'「待ってる。先に結果を見ちゃったら、ごめんね」',rewards:[]};}
 q.status='declined';q.resolved=c.stats.races;q.delta=0;return {title:'今日は約束をせずに',heroine:q.heroine,note:'主人公「今回は、目の前の準備に集中してみる」\n'+name+'「分かった。じゃあ、また会った時に」',rewards:[]};
}
function settle(c,r,z){const a=ensure(c);if(a.settled.includes(r.id))return [];a.settled.push(r.id);a.settled=a.settled.slice(-60);const changes=[],good=!z.capsized&&!z.dnf&&!z.startFault,op=z.finish.find(n=>n.id===c.development.rival.id);
 const passive=(kind,id,met,reason)=>{const seen=a.passive129||(a.passive129=[]),key=kind+':'+c.stage;if(!met||seen.includes(key)||a.log.some(q=>q.kind===kind&&q.stage===c.stage&&q.reason===reason))return;seen.push(key);changes.push(change(c,kind,id,1,reason));};
 if(op)passive('rival',null,good&&z.place<op.place,'今節の先着を評価');
 const m=c.cast?.mentor;if(m)passive('mentor',m.id,good&&z.place<=3,'今節の上位入着を評価');
 for(const q of a.requests){if(q.status!=='accepted'||c.stats.races<q.deadline)continue;const h=c.bonds.heroines[q.heroine],won=good&&z.place<=q.target;
  q.status=h.failed?'cancelled':won?'fulfilled':'missed';q.resolved=c.stats.races;
  const ch=change(c,'heroine',q.heroine,h.failed?0:scaled(c,won?10:-6),h.failed?'ルート終了により約束を終了':won?'着順の約束を達成':'着順の約束に届かず');q.delta=ch.delta;changes.push(ch);
 }
 z.affinity=changes;return changes;
}
function valid(a){if(a===undefined)return true;const n=(x,l,h)=>Number.isInteger(x)&&x>=l&&x<=h,s=(x,max)=>typeof x==='string'&&x.length<=max,ids=['akari','mio','nagi','kanade','tsumugi','mizuki','natsu'],mentors=['hayase','tsukino','kuzumi','akamine','iwase'];
 if(!a||a.version!==1||!n(a.rival,0,100)||!a.mentors||Object.entries(a.mentors).some(([id,v])=>!mentors.includes(id)||!n(v,0,100))||!n(a.seed,0,4294967295))return false;
 for(const [k,max]of [['settled',60],['trained',60],['rolled',42],['unlocked',13]])if(!Array.isArray(a[k])||a[k].length>max||new Set(a[k]).size!==a[k].length||!a[k].every(v=>s(v,150)))return false;
 if(a.passive129!==undefined&&(!Array.isArray(a.passive129)||a.passive129.length>18||new Set(a.passive129).size!==a.passive129.length||!a.passive129.every(x=>/^(rival|mentor):[0-8]$/.test(x))))return false;
 if(!a.rolled.every(v=>ids.some(id=>new RegExp('^'+id+':[1-6]$').test(v)))||!a.unlocked.every(v=>v==='rival'||mentors.some(id=>v==='mentor:'+id)||ids.some(id=>v==='heroine:'+id)))return false;
 if(!Array.isArray(a.requests)||a.requests.length>21||new Set(a.requests.map(q=>q.id)).size!==a.requests.length||a.requests.filter(q=>['offer','accepted'].includes(q.status)).length>1)return false;
 for(const q of a.requests){if(q.retired133!==undefined&&(q.retired133!==true||q.type!=='gift'||q.status!=='declined'||q.delta!==0))return false;if(q.support!==undefined&&(q.support!==true||q.type!=='gift'||q.status!=='fulfilled'))return false;if(q.deferred!==undefined&&typeof q.deferred!=='boolean')return false;if(!ids.includes(q.heroine)||!n(q.chapter,1,6)||q.id!==q.heroine+':'+q.chapter||!a.rolled.includes(q.id)||!['gift','race'].includes(q.type)||!['offer','accepted','fulfilled','declined','missed','cancelled'].includes(q.status)||!n(q.created,0,1000)||!(q.resolved===null||n(q.resolved,q.created,1000))||!(q.delta===null||n(q.delta,-100,100)))return false;
  if(q.type==='gift'?![90,100,110].includes(q.cost)||q.target!==0||q.deadline!==null||['accepted','missed','cancelled'].includes(q.status):q.cost!==0||![2,3].includes(q.target)||!(q.deadline===null||q.deadline===q.created+1))return false;
  if(['offer','accepted'].includes(q.status)?q.resolved!==null||q.delta!==null:q.resolved===null||q.delta===null)return false;
  if(q.status==='accepted'&&(q.type!=='race'||q.deadline===null)||q.status==='offer'&&q.deadline!==null)return false;
 }
 return Array.isArray(a.log)&&a.log.length<=60&&a.log.every(q=>['mentor','rival','heroine'].includes(q.kind)&&s(q.id,100)&&n(q.before,0,100)&&n(q.after,0,100)&&q.delta===q.after-q.before&&s(q.reason,100)&&n(q.stage,0,8)&&n(q.races,0,1000));
}
const API={thresholds,ensure,value,gate,guidance,unlock,change,scaled,train,choice,offer,active,afterChapter,requestScene,reply,settle,valid};root.KM_AFFINITY=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);



