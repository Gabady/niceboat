

/* V108: relationship progression. Saved, independent random stream; no race physics changes. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const limit=x=>Math.max(0,Math.min(100,Math.round(x))),copy=x=>JSON.parse(JSON.stringify(x));
const thresholds={rival:60,mentor:60,heroine:70};
const gifts={akari:'工房で使う精密測定工具',mio:'取材用のカメラと録音機',nagi:'遠征で使うケア用品一式',kanade:'演奏用の楽器と調整費',tsumugi:'新しい店で使うコーヒーマシン',mizuki:'遠征用の装備と艇の運搬ケース'};
function hash(s){let n=2166136261;for(const ch of s)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return n;}
function ensure(c){
 if(!c.affinity){const d=c.development?.rival,aligned=d?.drama?.entries.filter(e=>e.decision?.aligned).length||0;
  c.affinity={version:1,rival:limit(25+(d?.history.filter(x=>x.won).length||0)*5+(d?.training||0)*5+aligned*4),mentors:{},unlocked:[],settled:[],trained:[],requests:[],rolled:[],seed:hash(c.player.id+':affinity108'),log:[]};
  const a=c.affinity,q=c.cast?.route;
  if(q&&(q.step>=5||q.pending?.step===4))a.unlocked.push('mentor:'+q.id);
  if(d?.drama?.entries.some(e=>e.index===4))a.unlocked.push('rival');
  for(const [id,h]of Object.entries(c.bonds?.heroines||{}))if(h.step>=7||c.bonds.pending?.id===id&&c.bonds.pending?.step===6)a.unlocked.push('heroine:'+id);
 }
 const a=c.affinity,m=c.cast?.mentor?.id;if(m&&a.mentors[m]===undefined){const q=c.cast?.route;a.mentors[m]=limit(40+(q?.id===m?q.log.filter(x=>x.aligned).length*5:0));}
 return a;
}
function value(c,kind,id){const a=ensure(c);return kind==='heroine'?c.bonds?.heroines[id]?.affection||0:kind==='mentor'?a.mentors[id]??40:a.rival;}
function key(kind,id){return kind==='rival'?'rival':kind+':'+id;}
function gate(c,kind,id){const a=ensure(c),current=value(c,kind,id),required=thresholds[kind],unlocked=a.unlocked.includes(key(kind,id));return {current,required,open:unlocked||current>=required,unlocked,remaining:Math.max(0,required-current)};}
function guidance(c,kind,id){const g=gate(c,kind,id);if(g.open)return '';if(kind==='heroine'){const h=c.bonds?.heroines[id];if(!h?.met||h.failed||c.bonds.completed||c.bonds.partner&&c.bonds.partner!==id)return '';return 'さらに交流を深めましょう · 会って話す／お願いに応える';}if(kind==='mentor'){if(!c.cast?.mentor||c.cast.route?.step>=5)return '';return 'さらに信頼を深めましょう · レースで上位を重ねる';}if(c.development?.rival.drama?.entries.filter(e=>e.decision).length>=5)return '';return 'さらに交流を深めましょう · 特訓／レースで先着';}
function unlock(c,kind,id){const g=gate(c,kind,id),a=ensure(c),k=key(kind,id);if(!g.open)return false;if(!a.unlocked.includes(k))a.unlocked.push(k);return true;}
function change(c,kind,id,delta,reason){const a=ensure(c),before=value(c,kind,id),after=limit(before+delta),actual=after-before;
 if(kind==='heroine'){const q=c.bonds?.heroines[id];if(!q)return null;q.affection=after;}else if(kind==='mentor')a.mentors[id]=after;else a.rival=after;
 const z={kind,id:kind==='rival'?c.development.rival.id:id,before,after,delta:actual,reason,stage:c.stage,races:c.stats.races};a.log.push(z);a.log=a.log.slice(-60);return z;
}
function scaled(c,base){return base>=0?Math.max(1,Math.round(base*(1+c.stage*.15))):-Math.max(1,Math.round(-base*(1-c.stage*.07)));}
function train(c,raceId,scale=1){const a=ensure(c);if(a.trained.includes(raceId))return null;a.trained.push(raceId);a.trained=a.trained.slice(-60);return change(c,'rival',null,Math.max(1,Math.round(5*scale)),'ライバル特訓');}
function choice(c,kind,id,aligned){return change(c,kind,id,aligned?(kind==='mentor'?5:4):-3,'対話での返事');}
function random(a){a.seed=(Math.imul(a.seed,1664525)+1013904223)>>>0;return a.seed/4294967296;}
function offer(c){return ensure(c).requests.find(q=>q.status==='offer')||null;}
function active(c,id){return ensure(c).requests.find(q=>(!id||q.heroine===id)&&['offer','accepted'].includes(q.status))||null;}
function afterChapter(c,id){const a=ensure(c),h=c.bonds.heroines[id],stamp=id+':'+h.step;
 if(h.failed||h.step<1||h.step>6||a.rolled.includes(stamp))return null;a.rolled.push(stamp);
 if(active(c)||a.requests.filter(q=>q.heroine===id).length>=3||random(a)>=.40)return null;
 const type=random(a)<.5?'gift':'race',target=2+Math.floor(random(a)*2),cost=[90,100,110][Math.floor(random(a)*3)];
 const q={id:stamp,heroine:id,chapter:h.step,type,cost:type==='gift'?cost:0,target:type==='race'?target:0,status:'offer',created:c.stats.races,deadline:null,resolved:null,delta:null};
 a.requests.push(q);return copy(q);
}
const supportTasks={akari:'試作品の測定を手伝う',mio:'公開できる範囲の取材に協力する',nagi:'遠征準備を分担する',kanade:'教室の準備と片づけを手伝う',tsumugi:'新しい店の試運転を手伝う',mizuki:'互いの練習映像を整理する'};
function requestScene(c,people){const q=offer(c);if(!q)return null;const h=people[q.heroine],name=h.name,ask={akari:'測定工具の見積もりを取ったんです。仕事で使う物なので、簡単には頼めないんですが。',mio:'取材の機材を揃えようと思っています。少し大きなお願いなので、先に金額も話しますね。',nagi:'遠征のケア用品を揃えたいんです。無理にではありませんが、相談してもいいですか。',kanade:'楽器と調整の費用を見ていました。お願いするには高いので、迷ったんですけど。',tsumugi:'お店で使いたい機械があります。自分でも用意するつもりでしたが、一度相談したくて。',mizuki:'遠征用の装備を揃えたいんだ。安い物じゃないから、先に値段も見てほしい。'};return {key:'request:'+q.id,title:q.type==='gift'?'贈り物の相談':'次の一走の約束',person:h,background:'harbor',body:q.type==='gift'?[
 name+'「'+ask[h.id]+'」','主人公「どれを考えてる？」',(gifts[h.id]||'希望の品物')+' · '+q.cost+'万円。',
 '主人公「すぐにうなずける金額ではないね。次の準備に使うお金もあるから」',name+'「'+(h.id==='mizuki'?'うん。だから、無理ならそう言って。今できる範囲で返事してほしい。':'はい。無理なら、そう言ってください。今の都合も聞いてから、返事をもらいたいです。')+'」'
 ]:[name+'「'+(h.id==='mizuki'?'次は'+q.target+'着以内を見たい。私も楽しみにしてるから、挑戦してくれる？':'次は'+q.target+'着以内を目指してもらえますか。挑戦する所を、見ていたいです。')+'」','主人公「絶対、とは言えない。でも、狙うための準備はできる」',name+'「'+(h.id==='mizuki'?'それでいい。無茶な走りをする約束にはしないでね。':'はい。無理な走りをしてほしい、というお願いではないので。')+'」','対象は次の公式レース。有効完走で'+q.target+'着以内。'],choices:q.type==='gift'?[{label:q.cost+'万円の品物を贈る',disabled:c.player.money<q.cost},{label:'今は余裕がないと伝える'},{label:supportTasks[h.id]+'（練習1回）',disabled:!['action','preRace'].includes(c.status)||!(c.series?.action&&(c.series.action.normal+c.series.action.training)>0),note:'練習枠を1回使い、時間と協力で支える'}]:[{label:'次の一走で挑戦すると約束する'},{label:'今回は着順の約束を控える'}]};}
function reply(c,id,index,api=root.KM_ENGINE){const q=offer(c);if(!q||q.id!==id||![0,1,2].includes(index)||c.ending||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return null;
 if(index===0&&q.type==='gift'&&c.player.money<q.cost)return null;
 if(index===2&&(q.type!=='gift'||!['action','preRace'].includes(c.status)||!api?.consumeAction||!c.series?.action||c.series.action.normal+c.series.action.training<=0))return null;
 let delta=0,note;const speaker=({akari:'灯',mio:'澪',nagi:'凪',kanade:'奏',tsumugi:'紬',mizuki:'瑞希'})[q.heroine];
 if(index===2){api.consumeAction(c,'training');q.status='fulfilled';q.support=true;q.resolved=c.stats.races;q.delta=change(c,'heroine',q.heroine,Math.round(6*c.series.action.effectScale),'時間を使って協力した').delta;note='主人公「品物の代わりに、手を貸せる時間を作りたい」\n'+speaker+'「ありがとう。お願いしたい所を、先に一緒に決めよう」\n'+supportTasks[q.heroine]+'。練習枠を1回使いました。';}
 else if(index===0&&q.type==='race'){q.status='accepted';q.deadline=c.stats.races+1;note='主人公「次の一走で狙ってみる。準備も、最後までやってくる」\n'+speaker+'「'+(q.heroine==='mizuki'?'うん、見てる。終わったら、どこを変えたか聞かせて。':'楽しみにしています。終わったら、どうだったか聞かせてください。')+'」\n次の公式レースで'+q.target+'着以内を約束した。';}
 else{const paid=index===0;q.status=paid?'fulfilled':'declined';q.resolved=c.stats.races;if(paid)c.player.money-=q.cost;delta=paid?10:0;q.delta=change(c,'heroine',q.heroine,delta,paid?'贈り物を届けた':'お願いを見送った').delta;note=paid?speaker+'「'+(q.heroine==='mizuki'?'ありがとう。大事に使う。使ってみたら、ちゃんと報告するね。':'ありがとうございます。大切に使います。使った感想も、また聞いてください。')+'」\n所持賞金から'+q.cost+'万円を使いました。':'主人公「今はレースの準備に残したい。期待させて、ごめん」\n'+speaker+'「'+(q.heroine==='mizuki'?'残念だけど、事情は分かった。言いづらい返事も、ちゃんとしてくれてありがとう。':'残念ですが、事情は分かりました。無理な約束をされるより、話してもらえてよかったです。')+'」\nお願いは見送り。ルートは継続します。';}
 return {title:index!==1?'交わした約束':'今できること',heroine:q.heroine,note,rewards:q.delta!==null?['好感度 '+(q.delta>=0?'＋':'')+q.delta]:[]};
}
function settle(c,r,z){const a=ensure(c);if(a.settled.includes(r.id))return [];a.settled.push(r.id);a.settled=a.settled.slice(-60);const changes=[],good=!z.capsized&&!z.dnf&&!z.startFault,op=z.finish.find(n=>n.id===c.development.rival.id);
 if(op)changes.push(change(c,'rival',null,scaled(c,good&&z.place<op.place?5:-2),good&&z.place<op.place?'ライバルに先着':'ライバルとの一戦'));
 const m=c.cast?.mentor;if(m)changes.push(change(c,'mentor',m.id,scaled(c,[4,2,1,-1,-1,-2][good?z.place-1:5]+(good&&z.development?.some(x=>x.met&&x.key===({hayase:'speed',tsukino:'turn',kuzumi:'start',akamine:'accel',iwase:'power'})[m.id])?1:0)),good?'着順と教わった課題の実践を評価':'次走への課題'));
 for(const q of a.requests){if(q.status!=='accepted'||c.stats.races<q.deadline)continue;const h=c.bonds.heroines[q.heroine],won=good&&z.place<=q.target;
  q.status=h.failed?'cancelled':won?'fulfilled':'missed';q.resolved=c.stats.races;
  const ch=change(c,'heroine',q.heroine,h.failed?0:scaled(c,won?10:-6),h.failed?'ルート終了により約束を終了':won?'着順の約束を達成':'着順の約束に届かず');q.delta=ch.delta;changes.push(ch);
 }
 z.affinity=changes;return changes;
}
function valid(a){if(a===undefined)return true;const n=(x,l,h)=>Number.isInteger(x)&&x>=l&&x<=h,s=(x,max)=>typeof x==='string'&&x.length<=max,ids=['akari','mio','nagi','kanade','tsumugi','mizuki'],mentors=['hayase','tsukino','kuzumi','akamine','iwase'];
 if(!a||a.version!==1||!n(a.rival,0,100)||!a.mentors||Object.entries(a.mentors).some(([id,v])=>!mentors.includes(id)||!n(v,0,100))||!n(a.seed,0,4294967295))return false;
 for(const [k,max]of [['settled',60],['trained',60],['rolled',36],['unlocked',12]])if(!Array.isArray(a[k])||a[k].length>max||new Set(a[k]).size!==a[k].length||!a[k].every(v=>s(v,150)))return false;
 if(!a.rolled.every(v=>ids.some(id=>new RegExp('^'+id+':[1-6]$').test(v)))||!a.unlocked.every(v=>v==='rival'||mentors.some(id=>v==='mentor:'+id)||ids.some(id=>v==='heroine:'+id)))return false;
 if(!Array.isArray(a.requests)||a.requests.length>18||new Set(a.requests.map(q=>q.id)).size!==a.requests.length||a.requests.filter(q=>['offer','accepted'].includes(q.status)).length>1)return false;
 for(const q of a.requests){if(q.support!==undefined&&(q.support!==true||q.type!=='gift'||q.status!=='fulfilled'))return false;if(q.deferred!==undefined&&typeof q.deferred!=='boolean')return false;if(!ids.includes(q.heroine)||!n(q.chapter,1,6)||q.id!==q.heroine+':'+q.chapter||!a.rolled.includes(q.id)||!['gift','race'].includes(q.type)||!['offer','accepted','fulfilled','declined','missed','cancelled'].includes(q.status)||!n(q.created,0,1000)||!(q.resolved===null||n(q.resolved,q.created,1000))||!(q.delta===null||n(q.delta,-100,100)))return false;
  if(q.type==='gift'?![90,100,110].includes(q.cost)||q.target!==0||q.deadline!==null||['accepted','missed','cancelled'].includes(q.status):q.cost!==0||![2,3].includes(q.target)||!(q.deadline===null||q.deadline===q.created+1))return false;
  if(['offer','accepted'].includes(q.status)?q.resolved!==null||q.delta!==null:q.resolved===null||q.delta===null)return false;
  if(q.status==='accepted'&&(q.type!=='race'||q.deadline===null)||q.status==='offer'&&q.deadline!==null)return false;
 }
 return Array.isArray(a.log)&&a.log.length<=60&&a.log.every(q=>['mentor','rival','heroine'].includes(q.kind)&&s(q.id,100)&&n(q.before,0,100)&&n(q.after,0,100)&&q.delta===q.after-q.before&&s(q.reason,100)&&n(q.stage,0,8)&&n(q.races,0,1000));
}
const API={thresholds,ensure,value,gate,guidance,unlock,change,scaled,train,choice,offer,active,afterChapter,requestScene,reply,settle,valid};root.KM_AFFINITY=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);


