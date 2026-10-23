/* Saved automatic story queue. Rendering never chooses an answer or grants rewards. */
(function(root){'use strict';
const Continuity=root.KM_CONTINUITY142||(typeof require==='function'?require('./continuity142.js'):null);
const major=['campaign','rival','mentorIntro','mentor','heroine','daily'];
function windowKey(c,page){const group={home:'arrival',seriesIntro:'arrival',action:'prepare',preRace:'prepare',raceResult:'result',seriesResult:'return',registration:'ending'}[page];return c.stage+':'+c.stats.races+':'+group;}
function finalScene(c,item){const r=c.series?.race;return item.kind==='heroine'&&item.step>=8&&c.stage===8&&r?.type==='championship'&&!r.done&&!r.drive&&r.runners?.some(n=>n.id===c.player.id);}
const kinds=['campaign','rival','mentorIntro','mentor','heroine','event','request','epilogue','daily','retrospective','awakening','moment142','short143'];
function ensure(c){const f=c.flow131||(c.flow131={version:1,visited:[],done:[],queue:[],active:null,reply:null,paused:false,returnPage:'home'});if(!f.active)f.paused=false;return f;}
function checkpoint(c,page){if(!['home','seriesIntro','action','preRace','raceResult','seriesResult','registration'].includes(page))return null;return c.stage+':'+c.stats.races+':'+(['action','preRace'].includes(page)?'prepare':page);}
function offer(c,item){const f=ensure(c);if(f.done.includes(item.key)||f.active?.key===item.key||f.queue.some(x=>x.key===item.key))return false;if(f.queue.length>=24)return false;f.queue.push({...item,timing142:{offered:c.stats.races,stage:c.stage}});return true;}
function collect(c,page,E,follow=false){const stamp=checkpoint(c,page);if(!stamp||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return false;const f=ensure(c);Continuity.clean(c);prune(c,E);const repair=E.Drama.pending(c.campaign)[0];if(repair?.read){repair.read=false;f.done=f.done.filter(k=>k!=='campaign:'+repair.id+':0');f.visited=f.visited.filter(k=>k!==stamp);}if(!follow&&f.visited.includes(stamp))return false;if(!follow){f.visited.push(stamp);f.visited=f.visited.slice(-256);}let added=false;const add=(kind,id,step=0)=>{added=offer(c,{kind,id,step,key:kind+':'+id+':'+step})||added;};
 if(c.short143){const t=E.Campaign.ensure(c),entry=t.entries.find(x=>!x.read||E.Drama.pending(t).some(y=>y.id===x.id));if(entry)add('campaign',entry.id);if(c.stats.races===1&&!c.short143.middleRead&&!c.ending)add('short143','middle');order(c,E);return added;}
 const awakening=E.Awakening136.pending(c);if(awakening)add('awakening',awakening.key);
 const request=E.Affinity.offer(c);if(request)add('request',request.key||request.id||String(c.stats.races));
 {
  const t=E.Campaign.ensure(c),pending=E.Drama.pending(t),entry=t.entries.find(x=>!x.read||pending.some(y=>y.id===x.id));
  if(entry)add('campaign',entry.id);
 }
 if(!c.ending){
  const intro=E.Cast.introductionScene(c);if(intro)add('mentorIntro',intro.mentor.id,intro.step);
  if(!follow){
   if(c.story?.pending)add('event',c.story.pending.key);
   if(E.Drama.rivalGate(c).open){const d=E.Drama.rivalState(c);add('rival',c.development.rival.cast,d.entries.filter(x=>x.decision).length);}
   if(!intro&&E.Cast.routeGate(c).open){const q=E.Cast.routeState(c);add('mentor',q.id,q.step);}
  }
  const heroes=E.Bonds.metHeroines(c).filter(h=>E.Bonds.gate(c,h.id).chapter&&(!follow||c.bonds.heroines[h.id].step===9));
  for(const h of heroes)add('heroine',h.id,c.bonds.heroines[h.id].step);
 }
 if(!follow&&!c.ending&&['home','seriesIntro','seriesResult'].includes(page))E.Journey134.collectDaily(c,E);
 if(!follow)for(const e of Continuity.pendingMoments(c))added=offer(c,e)||added;
 for(const e of c.journey134?.daily||[])if(!e.read)add('daily',e.id);
 if(c.ending&&c.campaign?.entries.every(e=>e.read)&&(c.journey134?.daily||[]).every(e=>e.read)){const e=E.Journey134.retrospective(c,E);if(!e.read)add('retrospective','ending');}
 if(!follow&&c.ending&&c.epilogues126)for(const e of c.epilogues126.entries||[])add('epilogue',e.key||e.id);
 order(c,E);
 return added;
}
// Gates may close temporarily while another conversation sets a shared wait.
// Such entries remain queued. Only truly superseded entries are removed.
function stale(c,a,E){
 if(a.kind==='short143')return !c.short143||c.short143.middleRead||c.stats.races!==1||!!c.ending;
 if(a.kind==='heroine'){const q=c.bonds?.heroines[a.id];return !q?.met||q.failed||q.step!==a.step||!!c.ending;}
 if(a.kind==='moment142'){const q=c.bonds?.heroines[a.id],e=Continuity.moment(c,a.id,a.step);return !e||e.read||e.withdrawn||q.failed||q.step!==a.step;}
 if(a.kind==='campaign'){const e=c.campaign?.entries.find(x=>x.id===a.id);return !e||e.read&&!E.Drama.pending(c.campaign).some(x=>x.id===a.id);}
 if(a.kind==='rival')return !!c.ending||E.Drama.rivalState(c).entries.filter(x=>x.decision).length!==a.step;
 if(a.kind==='mentorIntro'){const x=E.Cast.introductionScene(c);return !!c.ending||!x||x.mentor.id!==a.id||x.step!==a.step;}
 if(a.kind==='mentor'){const x=E.Cast.routeState(c);return !!c.ending||!x||x.id!==a.id||x.step!==a.step;}
 if(a.kind==='request'){const x=E.Affinity.offer(c);return !x||(x.key||x.id)!==a.id;}
 if(a.kind==='event')return c.story?.pending?.key!==a.id;
 if(a.kind==='daily')return !c.journey134?.daily.some(e=>e.id===a.id&&!e.read);
 if(a.kind==='retrospective')return !!c.journey134?.ending?.read;
 if(a.kind==='awakening')return E.Awakening136.pending(c)?.key!==a.id;
 return false;
}
function prune(c,E){const f=ensure(c);if(!E)return;f.queue=f.queue.filter(a=>!stale(c,a,E));}
function ready(c,a,E){
 if(!E)return true;
 if(a.kind==='heroine')return !!E.Bonds.gate(c,a.id).chapter;
 if(a.kind==='rival')return !!E.Drama.rivalGate(c).open;
 if(a.kind==='mentor')return !!E.Cast.routeGate(c).open;
 if(a.kind==='moment142')return !c.ending&&c.stats.races>=Continuity.moment(c,a.id,a.step).due;
 if(a.kind==='campaign'){const first=c.campaign.entries.find(e=>!e.read||E.Drama.pending(c.campaign).some(x=>x.id===e.id));return first?.id===a.id;}
 if(a.kind==='epilogue'||a.kind==='retrospective')return !!c.ending&&c.campaign?.entries.every(e=>e.read)&&(c.journey134?.daily||[]).every(e=>e.read);
 return true;
}
function due(c,a){const m=a.kind==='heroine'&&c.bonds?.heroines[a.id]?.meeting142;return m?.expires??Math.min(1000,(a.timing142?.offered??c.stats.races)+3);}
function order(c,E){const f=ensure(c);
 for(const a of f.queue)if(!a.timing142)a.timing142={offered:c.stats.races,stage:c.stage};
 const priority=a=>a.kind==='awakening'?-4:finalScene(c,a)?-3:a.kind==='request'?-2:a.kind==='mentorIntro'?-1:a.kind==='epilogue'?3:a.kind==='retrospective'?4:due(c,a)<c.stats.races?0:1;
 f.queue.sort((a,b)=>priority(a)-priority(b)||due(c,a)-due(c,b)||a.timing142.offered-b.timing142.offered);
}
function begin(c,page,E=root.KM_ENGINE){const f=ensure(c);if(f.active)return f.active;
 if(page==='raceResult')return null;
 prune(c,E);order(c,E);
 const key=windowKey(c,page),spent=f.pacing133?.includes(key),brief=f.brief142?.includes(key),flush=!!c.ending||page==='registration';
 const at=f.queue.findIndex(a=>ready(c,a,E)&&(a.kind!=='moment142'||!brief)&&(flush||finalScene(c,a)||!major.includes(a.kind)||!spent));
 if(at>=0){f.active=f.queue.splice(at,1)[0];f.reply=null;f.returnPage=page;}return f.active;
}
function finish(c,E){const f=ensure(c),a=f.active;if(!a)return;if(a.kind==='short143')c.short143.middleRead=true;if(a.kind==='awakening')E.Awakening136.mark(c,a.id);if(a.kind==='moment142'){Continuity.mark(c,a.id,a.step);f.brief142||=[];const k=windowKey(c,f.returnPage);if(!f.brief142.includes(k))f.brief142.push(k);f.brief142=f.brief142.slice(-256);}if(a.kind==='campaign')E.Campaign.mark(c.campaign,a.id);if(a.kind==='daily'||a.kind==='retrospective')E.Journey134.mark(c,a.id);if(!f.done.includes(a.key))f.done.push(a.key);f.done=f.done.slice(-512);
 if(major.includes(a.kind)&&!(a.kind==='mentorIntro'&&a.step===0)){f.pacing133||=[];const key=windowKey(c,f.returnPage);if(!f.pacing133.includes(key))f.pacing133.push(key);f.pacing133=f.pacing133.slice(-256);}
 f.active=null;f.reply=null;f.paused=false;collect(c,f.returnPage,E,true);
}
function drop(c){const f=ensure(c);f.active=null;f.reply=null;f.paused=false;}
function blocked(c){return !!c?.flow131?.active;}
function valid(f){if(f===undefined)return true;const str=(s,n=180)=>typeof s==='string'&&s.length<=n,item=x=>x&&kinds.includes(x.kind)&&str(x.id)&&str(x.key)&&Number.isInteger(x.step)&&x.step>=0&&x.step<=10&&(x.timing142===undefined||x.timing142&&Number.isInteger(x.timing142.offered)&&x.timing142.offered>=0&&x.timing142.offered<=1000&&Number.isInteger(x.timing142.stage)&&x.timing142.stage>=0&&x.timing142.stage<=8);
 if(f?.brief142!==undefined&&(!Array.isArray(f.brief142)||f.brief142.length>256||new Set(f.brief142).size!==f.brief142.length||!f.brief142.every(x=>typeof x==='string'&&/^[0-8]:\d{1,4}:(arrival|prepare|result|return|ending)$/.test(x))))return false;
 return !!f&&f.version===1&&(f.pacing133===undefined||Array.isArray(f.pacing133)&&f.pacing133.length<=256&&new Set(f.pacing133).size===f.pacing133.length&&f.pacing133.every(x=>typeof x==='string'&&/^[0-8]:\d{1,4}:(arrival|prepare|result|return|ending)$/.test(x)))&&Array.isArray(f.visited)&&f.visited.length<=256&&f.visited.every(x=>str(x))&&Array.isArray(f.done)&&f.done.length<=512&&f.done.every(x=>str(x))&&new Set(f.done).size===f.done.length&&Array.isArray(f.queue)&&f.queue.length<=24&&f.queue.every(item)&&new Set(f.queue.map(x=>x.key)).size===f.queue.length&&(f.active===null||item(f.active))&&(!f.active||!f.queue.some(x=>x.key===f.active.key))&&typeof f.paused==='boolean'&&['home','seriesIntro','action','preRace','raceResult','seriesResult','registration'].includes(f.returnPage)&&(f.reply===null||!!f.active&&f.reply&&str(f.reply.title,160)&&str(f.reply.person,80)&&str(f.reply.background,30)&&Array.isArray(f.reply.body)&&f.reply.body.length<=12&&f.reply.body.every(x=>str(x,5000)));
}
const api={offer,ensure,checkpoint,windowKey,collect,prune,ready,order,due,begin,finish,drop,blocked,valid};root.KM_FLOW131=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
