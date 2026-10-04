
/* V118: recorded practice, recovery and transparent progression. No DOM or RNG. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const keys=D.statKeys,clone=x=>JSON.parse(JSON.stringify(x)),limit=(x,a,b)=>Math.max(a,Math.min(b,x));
function ensure(c,draft){
 if(!c.refinement){const grandfather=[];for(const [id,h] of Object.entries(c.bonds?.heroines||{}))if(h.step>=6||c.bonds.pending?.id===id&&c.bonds.pending.step>=5||c.affinity?.unlocked?.includes('heroine:'+id))grandfather.push(id);
  const origin=keys.includes(draft?.recoveryOrigin)?draft.recoveryOrigin:keys.slice().sort((a,b)=>c.player.stats[b]-c.player.stats[a])[0];
  c.refinement={version:1,grandfather,races:[],recovery:c.campaign?.arc==='recovery'?{origin,path:null,practice:0,completed:false}:null};
 }return c.refinement;
}
function g1Champion(c){return (c.history||[]).some(h=>[6,7].includes(h.stage)&&h.champion===true);}
function romanceGate(c,id){const h=c.bonds?.heroines[id];return !h||h.step<5||ensure(c).grandfather.includes(id)||g1Champion(c);}
function waitLength(c,id,step){const h=c.bonds.heroines[id];return h.metStage>=5?(step>=4?2:1):(step>=4?3:2);}
function romanceOutlook(c,id){const h=c.bonds?.heroines[id];if(!h?.met||h.failed||h.step>=7)return '';
 let wait=Math.max(0,c.bonds.nextAt-c.stats.races);for(let s=h.step+1;s<7;s++)wait+=waitLength(c,id,s);
 const current=c.series?(c.series.completed?0:Math.max(0,6-c.series.round-(c.series.race?.done&&c.series.race.type!=='qualifier'?1:0))):6,left=c.ending?0:Math.max(0,(8-c.stage)*6+current);
 const short=!c.bonds.shortcutUsed?2:0;
 return wait>Math.max(0,left-1)+short?'残りのレース数では、最終話まで進められない見込みです。ここまでの交流は記録に残ります。':(h.metStage>=5?'終盤に出会ったため、次に会うまでの間隔が短くなっています。':'')+'第6話以降の基本条件：今回の育成でG1前期／後期いずれかを優勝。好感度・信頼・会話の選択にも条件があります。';
}
function recoveryKey(q){return !q?null:q.path==='renew'?({speed:'accel',turn:'power',start:'turn',accel:'speed',power:'start'})[q.origin]:q.origin;}
function recoveryPath(c,path){const q=ensure(c).recovery;if(!q||q.path||c.stage<4||!['restore','renew'].includes(path)||c.ending||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return false;q.path=path;return true;}
function trainingHint(c,key){const q=ensure(c).recovery;return q&&key===recoveryKey(q)?(q.path ? .12 : .08):0;}
function summary(c){const t=ensure(c),q=t.recovery;return q?{origin:D.stats[q.origin],key:D.stats[recoveryKey(q)],path:q.path==='restore'?'経験を磨き直す':q.path==='renew'?'新しい走りを組み立てる':'今の身体で確かめる',progress:q.practice,completed:q.completed}:null;}
function observe(d,b,r,dt){
 if(b.startTime===null||b.dnf||b.capsized||b.finishTime!==null)return;
 const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null),m=b.metrics;
 const q=m.craft||(m.craft={version:1,straightGood:0,turnGood:0,stableWater:0,exitGood:0,exitWindow:0,exitSpeed:0,exitContacts:0,lastPhase:b.phase,sectors:[],current:null});
 const turn=[1,3].includes(b.phase),v=b.posture||0,clean=b.slip<2.5&&b.stress<1.5;
 if(b.speed>5&&!turn&&v<-.35&&b.slip<1.8)q.straightGood+=dt;
 if(b.speed>5&&turn&&v>.35&&clean)q.turnGood+=dt;
 if(b.speed>5&&(r.env.windSpeed>=5||b.wakeLoad>.10)&&clean&&d.elapsed-(b.lastContactAt||-10)>1)q.stableWater+=dt;
 if([1,3].includes(q.lastPhase)&&!turn){q.exitWindow=3;q.exitSpeed=b.speed;q.exitContacts=m.contacts+m.boundaries;}
 if(q.exitWindow>0){q.exitWindow=Math.max(0,q.exitWindow-dt);if(q.exitWindow===0&&b.speed>=q.exitSpeed+1.5&&v<.35&&m.contacts+m.boundaries===q.exitContacts&&clean)q.exitGood++;}
 q.lastPhase=b.phase;
 const progress=limit(b.progress,0,R.C.goal-.001),lap=Math.floor(progress/R.C.length),phase=R.phaseAt(progress%R.C.length),index=lap*4+({0:0,1:0,2:1,3:2,4:3})[phase];
 if(!q.current||index>q.current.index){
  if(q.current&&q.sectors.length<12){const x=q.current;q.sectors.push({...x,end:d.elapsed,rankEnd:R.place(d,b),gapEnd:Math.max(0,...d.boats.filter(o=>!o.dnf&&!o.capsized).map(o=>o.progress-b.progress)),contacts:m.contacts+m.boundaries-x.contacts});}
  q.current={index,start:d.elapsed,end:d.elapsed,seconds:0,speed:0,slide:0,wake:0,contacts:m.contacts+m.boundaries,rank:R.place(d,b),rankEnd:R.place(d,b),gap:Math.max(0,...d.boats.filter(o=>!o.dnf&&!o.capsized).map(o=>o.progress-b.progress)),gapEnd:0};
 }
 if(q.current){q.current.seconds+=dt;q.current.speed+=b.speed*dt;if(b.slip>2)q.current.slide+=dt;if(b.wakeLoad>.08)q.current.wake+=dt;q.current.end=d.elapsed;}
}
function sectorName(x){return (Math.floor(x.index/4)+1)+'周目・'+['第1ターンまで','向こう正面','第2ターン','ホーム直線'][x.index%4];}
function analysis(d){if(!d)return null;const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null),b=R.own(d),q=b.metrics.craft;
 const sections=(q?.sectors||[]).slice();if(q?.current?.seconds>1){const x=q.current;sections.push({...x,rankEnd:R.place(d,b),gapEnd:Math.max(0,...d.boats.filter(o=>!o.dnf&&!o.capsized).map(o=>o.progress-b.progress)),contacts:b.metrics.contacts+b.metrics.boundaries-x.contacts});}
 const sorted=sections.slice().sort((a,z)=>(z.gapEnd-z.gap)-(a.gapEnd-a.gap));const loss=sorted.find(x=>x.gapEnd-x.gap>3||x.rankEnd>x.rank),best=sections.filter(x=>x.rankEnd<x.rank).sort((a,z)=>(a.rankEnd-a.rank)-(z.rankEnd-z.rank))[0];
 const success=best?sectorName(best)+'で順位を上げた':q?.exitGood?'ターン後の再加速を'+q.exitGood+'回つないだ':q?.straightGood>=8?'直線で伏せる姿勢を保った':!b.metrics.contacts&&!b.metrics.boundaries?'艇や境界への接触は記録されていない':'走行記録を次の準備へ';
 const allowance=R.startAllowance(b),over=b.startFault==='F'?Math.max(0,-b.startTime-allowance):0;
 const detail=b.startFault==='F'?'早発許容を'+over.toFixed(3)+'秒超過':b.startFault==='L'?'スタートの制限時刻までに通過できなかった':loss?sectorName(loss)+'で順位低下、または先頭との差の拡大を記録':'記録された区間では、大きな順位低下や先頭との差の拡大は見つかりませんでした';
 const tip=b.startFault?'発進目安とスタート方針を確認する':loss?.slide>1?'次はその区間の進入を早めに緩める':loss?.wake>1?'次は前走艇の真後ろを外す':loss?.contacts?'次は進入前に艇間を確保する':q&&q.exitGood===0?'出口で舵を戻し、姿勢を伏せて加速する':'今の得意区間を生かす調整を試す';
 return {success,detail,tip,mark:loss?.start??best?.start??null,sections:sections.map(x=>({name:sectorName(x),t:x.start,rank:x.rank,rankEnd:x.rankEnd,speed:x.seconds?x.speed/x.seconds*3.6:0,slide:x.slide,wake:x.wake,gapChange:x.gapEnd-x.gap})),start:!b.startFault&&b.startTime!==null?(b.startTime<0?'早発許容を'+(-b.startTime).toFixed(3)+'秒使用':'基準時刻から'+b.startTime.toFixed(3)+'秒後に通過'):null};
}
function settle(c,r,z,api){const t=ensure(c);if(t.races.some(x=>x.id===r.id))return;
 const review=analysis(r.drive),a={id:r.id,stage:c.stage,place:z.place,fault:z.startFault||null,capsized:!!z.capsized,dnf:!!z.dnf,contacts:z.driving?.metrics.contacts||0,review:review?{success:review.success,detail:review.detail,tip:review.tip,mark:review.mark}:null};t.races.push(a);t.races=t.races.slice(-54);z.observation=review;
 const q=t.recovery;if(q?.path&&!q.completed&&z.development?.some(x=>x.key===recoveryKey(q)&&x.met)){q.practice=Math.min(3,q.practice+1);if(q.practice===3){q.completed=true;const path=c.development.paths[recoveryKey(q)];path.hints=Math.min(12,path.hints+.75);z.recovery='走り直しの課題を達成：'+D.stats[recoveryKey(q)]+'のコツ＋0.75。';}}
}
function storyBeat(c){const list=ensure(c).races.filter(x=>x.stage===c.stage);if(!list.length)return null;const a=list.at(-1);let id,text;
 if(a.fault){id='start';text='最後の一走は'+a.fault+'。次の一走に向けて、スタート方針と発進のタイミングを見直すことにした。';}
 else if(a.capsized||a.dnf){id='retire';text='最後の一走は完走できなかった。結果を受け止め、どこまで走れたのかを記録で振り返る。';}
 else if(a.contacts){id='contact';text='最後の一走では他艇との接触が記録された。どこで艇間を失ったか、映像を止めて確かめることにした。';}
 else if(a.place===1){id='win';text='最後の一走は一着だった。うれしさが冷めないうちに、今日の調整と走った感触を書き留めた。';}
 else{id='finish';text='最後の一走は'+a.place+'着で完走した。着順だけでは分からないこともある。映像を見ながら、走った感触を話すことにした。';}
 const partner=c.campaign.arc==='recovery'?'相馬':c.campaign.arc==='light'?'父':c.campaign.arc==='back'?'奏斗':'紗枝';
 return {id,body:[text,partner+'「次に試したいことはある？　一つずつ聞かせて」','主人公「一つだけ、次に試すことを決めたい。それが決まったら今日は休むよ」']};
}
function opponent(n){if(!n)return null;const id=n.castId||n.racePersona,defs={kagura:['0.30秒先行・1周目の出力','スタート後は艇間を保つ。洞口の上乗せが切れる周回を確認。'],kurose:['直線の伸び','出口で艇を前へ向け、直線に入る位置を作る。'],shirakami:['全開の鋭い旋回','全速旋回の発動を見て、出口の重ならない線を取る。'],onizuka:['強い引き波と接触圧','真後ろを長く走らず、横に出る余白を残す。'],teiou:['0.30秒先行・総合力','得意区間を一つ決め、3周で取り返す。'],rival_final:['0.30秒先行・得意技の完成','相手の主軸と自分の主軸を見比べ、同じ場所で競るかを決める。']};const q=defs[id];return q?{name:n.name,weapon:q[0],tip:q[1]}:null;}
function journey(s){const players=s.registry||[],goals=[{id:'sg',name:'最高峰の一着',done:players.some(p=>p.record?.title==='SG覇者'||p.careerLog?.highlights?.some(x=>x.includes('最高峰')&&x.includes('優勝')))},...keys.map(k=>({id:k,name:D.stats[k]+'を主軸に登録',done:players.some(p=>p.developmentJournal?.archive?.key===k)})),{id:'recovery',name:'新しい航跡を残す',done:players.some(p=>p.refinementJournal?.recovery?.completed)}];return goals;}
function epilogue(c){if(!c.ending)return [];return Object.entries(c.bonds?.heroines||{}).filter(([,h])=>h.met&&h.step<7&&!h.failed).map(([id,h])=>({id,step:h.step,text:!g1Champion(c)?'今回はG1優勝に届かなかった。二人の関係も、この育成ではここまで。出会いと交わした言葉は記録に残る。':'今回は二人の物語を最後まで進められなかった。ここまで交わした言葉と、過ごした時間は記録に残る。'}));}
function valid(t){if(t===undefined)return true;const n=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;return !!t&&t.version===1&&Array.isArray(t.grandfather)&&t.grandfather.length<=6&&t.grandfather.every(x=>['akari','mio','nagi','kanade','tsumugi','mizuki'].includes(x))&&Array.isArray(t.races)&&t.races.length<=54&&new Set(t.races.map(x=>x.id)).size===t.races.length&&t.races.every(x=>typeof x.id==='string'&&x.id.length<150&&Number.isInteger(x.stage)&&n(x.stage,0,8)&&Number.isInteger(x.place)&&n(x.place,1,6)&&[null,'F','L'].includes(x.fault)&&typeof x.capsized==='boolean'&&typeof x.dnf==='boolean'&&n(x.contacts,0,10000)&&(!x.review||['success','detail','tip'].every(k=>typeof x.review[k]==='string'&&x.review[k].length<400)&&(x.review.mark===null||n(x.review.mark,0,283))))&&(t.recovery===null||keys.includes(t.recovery.origin)&&[null,'restore','renew'].includes(t.recovery.path)&&Number.isInteger(t.recovery.practice)&&n(t.recovery.practice,0,3)&&typeof t.recovery.completed==='boolean'&&(!t.recovery.completed||t.recovery.practice===3));}
function validMetrics(q){if(q===undefined)return true;const n=x=>Number.isFinite(x)&&x>=0&&x<=1e7,seg=x=>x&&Number.isInteger(x.index)&&x.index>=0&&x.index<=11&&['start','end','seconds','speed','slide','wake','contacts','rank','rankEnd','gap','gapEnd'].every(k=>n(x[k]));return !!q&&q.version===1&&['straightGood','turnGood','stableWater','exitGood','exitWindow','exitSpeed','exitContacts','lastPhase'].every(k=>n(q[k]))&&Array.isArray(q.sectors)&&q.sectors.length<=12&&q.sectors.every(seg)&&(q.current===null||seg(q.current));}
function practice(E,kind,player,seed=118){if(!['start','turn','wake'].includes(kind))throw Error('Unknown practice');const s=E.newState(seed),p=player?clone(player):E.character(s,'練習選手',60);p.scenario='light';const c=E.createCareer(s,p);E.startSeries(s);E.prepareRace(s);const r=c.series.race;r.drill=kind;r.controlMode='manual';r.startPolicy='safe';r.env={weather:'晴れ',wind:'無風',windSpeed:0};r.buff=Object.fromEntries(keys.map(k=>[k,0]));r.itemBoost=0;
 r.runners.forEach(n=>{n.stats=Object.fromEntries(keys.map(k=>[k,60]));n.skills=[];n.mastery={};n.equipment=clone(r.runners.find(p=>p.isPlayer).equipment);n.racePersona=null;n.castId=null;n.castRole=null;});
 if(player){const b=r.runners.find(n=>n.isPlayer);b.stats=clone(player.stats);b.skills=player.skills.slice();b.mastery=clone(player.mastery||{});if(player.equipment)b.equipment=clone(player.equipment);}
 r.drive=E.R.create(r,seed,{keepCourses:true});const d=r.drive,b=E.R.own(d);r.practiceLimit=kind==='start'?40:kind==='turn'?345:160;
 if(kind!=='start'){d.elapsed=E.R.startAt(d)+1;d.started=true;d.boats.forEach((n,i)=>{const progress=kind==='turn'?35+(n.isPlayer?0:-30-i*10):20+(n.isPlayer?0:12+i*20),pt=E.R.pointAt(E.R.C.start+progress,E.R.C.inner+14);Object.assign(n,{x:pt.x,z:pt.z,heading:pt.heading,vx:Math.cos(pt.heading)*16,vz:Math.sin(pt.heading)*16,speed:16,engine:1,startTime:.08,progress,lastS:E.R.C.start+progress,checkpoints:0,posture:-1,postureTarget:-1});});d.wakes=[];}
 return {s,r,kind,seed};}
const API={ensure,g1Champion,romanceGate,romanceOutlook,waitLength,recoveryPath,recoveryKey,trainingHint,summary,observe,analysis,settle,storyBeat,opponent,journey,epilogue,valid,validMetrics,practice};root.KM_CRAFT=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);

