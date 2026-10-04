/* V127: authored romance overlays. Progress, rewards and random streams stay in Bonds. */
(function(root){'use strict';
const modules=['akari-mio','nagi-kanade','tsumugi','mizuki-natsu'];
const data=root.KM_ROMANCE127_DATA||(root.KM_ROMANCE127_DATA={});
if(typeof require==='function')for(const name of modules)Object.assign(data,require('./romance127-'+name+'.js'));
const copy=x=>JSON.parse(JSON.stringify(x)),originals={},applied=new WeakSet(),cues={};
function gather(id,scene){
 if(!scene||typeof scene!=='object')return;
 if(scene.expressionCues)for(const [emotion,words] of Object.entries(scene.expressionCues))for(const word of words)(cues[id]||(cues[id]={}))[word]=emotion;
 if(Array.isArray(scene.choices))for(const choice of scene.choices){const m=String(choice.reply||'').match(/^[^「]+「([\s\S]*)」$/u);if(m&&choice.emotion)(cues[id]||(cues[id]={}))[m[1]]=choice.emotion;}
}
function patchChapter(ch,patch){
 if(!ch||!patch)return;
 for(const field of ['title','body','expressionCues'])if(patch[field])ch[field]=copy(patch[field]);
 ch.choices=ch.choices.map(choice=>{const text=patch.choices?.[choice.code]||{},next={...choice};for(const field of ['label','reply','emotion'])if(text[field])next[field]=text[field];return next;});
 ch.readerVersion='romance127';
}
function apply(B){
 if(!B||applied.has(B))return B;
 for(const h of B.heroines){const d=data[h.id];if(!d)continue;
  originals[h.id]={chapters:copy(h.chapters),recoveryChapters:h.recoveryChapters?copy(h.recoveryChapters):null};
  h.romancePersona=d.persona;
  for(const [i,patch] of Object.entries(d.chapters||{})){patchChapter(h.chapters[i],patch);gather(h.id,patch);}
  if(h.recoveryChapters)for(const [i,patch] of Object.entries(d.recoveryChapters||d.chapters||{})){patchChapter(h.recoveryChapters[i],patch);gather(h.id,patch);}
  for(const group of Object.values(d.romanceVisits||{}))for(const sc of group)gather(h.id,sc);
  for(const sc of Object.values(d.endings||{}))gather(h.id,sc);
  for(const key of ['final','recoveryFinal','finalOnGrid','recoveryFinalOnGrid'])gather(h.id,d[key]);
  if(d.final?.title)h.finalTitle=d.final.title;
 }
 applied.add(B);return B;
}
function locked(t,id){const partner=t?.completed||t?.partner;return !!partner&&partner!==id;}
function chapter(c,h,i){
 const old=locked(c.bonds,h.id)&&originals[h.id],recovery=c.campaign?.arc==='recovery';
 return old?(recovery&&old.recoveryChapters||old.chapters)[i]:(recovery&&h.recoveryChapters||h.chapters)[i];
}
function stage(q,t,id){
 if(!q?.met||q.failed||locked(t,id))return null;
 if(q.step===7&&q.dated&&t?.completed===id&&t?.partner===id)return 'partner';
 if(q.step>=5&&q.step<7)return 'late';
 return q.step>=3&&q.step<5?'middle':null;
}
const labels={middle:'近づく想い',late:'伝えたい気持ち',partner:'恋人との時間'};
function visit(c,h,q,t){
 const phase=stage(q,t,h.id),scenes=data[h.id]?.romanceVisits?.[phase];if(!scenes?.length)return null;
 // Only choosing advances this saved cursor; rendering/reloading and log eviction do not.
 const count=q.romanceVisits?.[phase]||0;
 return {...copy(scenes[count%scenes.length]),readerVersion:'romance127',romancePhase:phase,romanceLabel:labels[phase]};
}
function ending(id,outcome){const sc=data[id]?.endings?.[outcome];return sc?copy(sc):null;}
function expression(id,text){return cues[id]?.[text]||null;}
function finalBody(c,h,r){
 const d=data[h.id];if(!d)return null;
 const onGrid=h.id==='mizuki'&&c.stage===8&&r===c.series?.race&&r?.type==='championship'&&r.runners?.some(n=>n.id==='mizuki');
 const recovery=c.campaign?.arc==='recovery';
 const sc=onGrid?(recovery?d.recoveryFinalOnGrid||d.finalOnGrid:d.finalOnGrid):(recovery?d.recoveryFinal||d.final:d.final);
 return sc?.body?copy(sc.body):null;
}
const API={data,apply,chapter,stage,labels,visit,ending,expression,finalBody,locked};
root.KM_ROMANCE127=API;apply(root.KM_BOND_DATA);
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);
