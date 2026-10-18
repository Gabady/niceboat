
/* Saved automatic story queue. Rendering never chooses an answer or grants rewards. */
(function(root){'use strict';
const major=['campaign','rival','mentorIntro','mentor','heroine','daily'];
function windowKey(c,page){const group={home:'arrival',seriesIntro:'arrival',action:'prepare',preRace:'prepare',raceResult:'result',seriesResult:'return',registration:'ending'}[page];return c.stage+':'+c.stats.races+':'+group;}
function finalScene(c,item){const r=c.series?.race;return item.kind==='heroine'&&item.step>=8&&c.stage===8&&r?.type==='championship'&&!r.done&&!r.drive&&r.runners?.some(n=>n.id===c.player.id);}
const kinds=['campaign','rival','mentorIntro','mentor','heroine','event','request','epilogue','daily','retrospective'];
function ensure(c){return c.flow131||(c.flow131={version:1,visited:[],done:[],queue:[],active:null,reply:null,paused:false,returnPage:'home'});}
function checkpoint(c,page){if(!['home','seriesIntro','action','preRace','raceResult','seriesResult','registration'].includes(page))return null;return c.stage+':'+c.stats.races+':'+(['action','preRace'].includes(page)?'prepare':page);}
function offer(c,item){const f=ensure(c);if(f.done.includes(item.key)||f.active?.key===item.key||f.queue.some(x=>x.key===item.key))return false;f.queue.push(item);return true;}
function collect(c,page,E,follow=false){const stamp=checkpoint(c,page);if(!stamp||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return false;const f=ensure(c);if(!follow&&f.visited.includes(stamp))return false;if(!follow){f.visited.push(stamp);f.visited=f.visited.slice(-256);}let added=false;const add=(kind,id,step=0)=>{added=offer(c,{kind,id,step,key:kind+':'+id+':'+step})||added;};
 const request=E.Affinity.offer(c);if(request)add('request',request.key||request.id||String(c.stats.races));
 if(!follow||c.ending){
  const t=E.Campaign.ensure(c),pending=E.Drama.pending(t)[0],entry=pending||t.entries.find(x=>!x.read);
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
  heroes.sort((a,b)=>(c.bonds.heroines[b.id].step-c.bonds.heroines[a.id].step)||(c.bonds.heroines[b.id].affection-c.bonds.heroines[a.id].affection));
  if(heroes.length)add('heroine',heroes[0].id,c.bonds.heroines[heroes[0].id].step);
 }
 if(!follow&&!c.ending&&['home','seriesIntro','seriesResult'].includes(page))E.Journey134.collectDaily(c,E);
 for(const e of c.journey134?.daily||[])if(!e.read)add('daily',e.id);
 if(c.ending&&c.campaign?.entries.every(e=>e.read)&&(c.journey134?.daily||[]).every(e=>e.read)){const e=E.Journey134.retrospective(c,E);if(!e.read)add('retrospective','ending');}
 if(!follow&&c.ending&&c.epilogues126)for(const e of c.epilogues126.entries||[])add('epilogue',e.key||e.id);
 const priority=a=>finalScene(c,a)?0:a.kind==='mentorIntro'?1:2;f.queue.sort((a,b)=>priority(a)-priority(b));
 return added;
}
function begin(c,page){const f=ensure(c);if(f.active)return f.active;
 // Results remain visible; deferred scenes are delivered at the next preparation.
 if(page==='raceResult')return null;
 const spent=f.pacing133?.includes(windowKey(c,page)),flush=!!c.ending||page==='registration';
 const at=f.queue.findIndex(a=>flush||finalScene(c,a)||!major.includes(a.kind)||!spent);
 if(at>=0){f.active=f.queue.splice(at,1)[0];f.reply=null;f.returnPage=page;}return f.active;
}
function finish(c,E){const f=ensure(c),a=f.active;if(!a)return;if(a.kind==='campaign')E.Campaign.mark(c.campaign,a.id);if(a.kind==='daily'||a.kind==='retrospective')E.Journey134.mark(c,a.id);if(!f.done.includes(a.key))f.done.push(a.key);f.done=f.done.slice(-512);
 if(major.includes(a.kind)&&!(a.kind==='mentorIntro'&&a.step===0)){f.pacing133||=[];const key=windowKey(c,f.returnPage);if(!f.pacing133.includes(key))f.pacing133.push(key);f.pacing133=f.pacing133.slice(-256);}
 f.active=null;f.reply=null;f.paused=false;collect(c,f.returnPage,E,true);
}
function drop(c){const f=ensure(c);f.active=null;f.reply=null;}
function blocked(c){return !!c?.flow131?.active;}
function valid(f){if(f===undefined)return true;const str=(s,n=180)=>typeof s==='string'&&s.length<=n,item=x=>x&&kinds.includes(x.kind)&&str(x.id)&&str(x.key)&&Number.isInteger(x.step)&&x.step>=0&&x.step<=10;
 return !!f&&f.version===1&&(f.pacing133===undefined||Array.isArray(f.pacing133)&&f.pacing133.length<=256&&new Set(f.pacing133).size===f.pacing133.length&&f.pacing133.every(x=>typeof x==='string'&&/^[0-8]:\d{1,4}:(arrival|prepare|result|return|ending)$/.test(x)))&&Array.isArray(f.visited)&&f.visited.length<=256&&f.visited.every(x=>str(x))&&Array.isArray(f.done)&&f.done.length<=512&&f.done.every(x=>str(x))&&new Set(f.done).size===f.done.length&&Array.isArray(f.queue)&&f.queue.length<=24&&f.queue.every(item)&&new Set(f.queue.map(x=>x.key)).size===f.queue.length&&(f.active===null||item(f.active))&&(!f.active||!f.queue.some(x=>x.key===f.active.key))&&typeof f.paused==='boolean'&&['home','seriesIntro','action','preRace','raceResult','seriesResult','registration'].includes(f.returnPage)&&(f.reply===null||!!f.active&&f.reply&&str(f.reply.title,160)&&str(f.reply.person,80)&&str(f.reply.background,30)&&Array.isArray(f.reply.body)&&f.reply.body.length<=12&&f.reply.body.every(x=>str(x,5000)));
}
const api={ensure,checkpoint,windowKey,collect,begin,finish,drop,blocked,valid};root.KM_FLOW131=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

