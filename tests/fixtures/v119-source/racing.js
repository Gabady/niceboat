
/* 競艇物語 v85 — fixed-step, free-position driving on an anticlockwise water course.
 * No DOM, no predetermined finish order. x/z are metres, time is seconds.
 */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const Craft=root.KM_CRAFT||(typeof require==='function'?require('./craft118.js'):null);
const TAU=Math.PI*2, DT=1/60;
const C={halfStraight:(600-TAU*36)/4,radius:36,inner:32,outer:73,laps:3,prestart:12,timeLimit:270,flyingGrace:.20,lateLimit:1.5};
C.length=600;C.start=100;C.goal=C.length*C.laps;
// Existing v86 races retain their original start instant when loaded.
const startAt=d=>Number.isFinite(d.startAt)?d.startAt:10;
const raceTime=d=>d.elapsed-startAt(d);
const kmh=v=>Math.floor(Math.max(0,v)*3.6);
const speedText=v=>(Math.round(Math.max(0,v)*36)/10)+' km/h';
// ST is seconds:hundredths, with legal early crossings displayed as 00:00.
const startText=t=>{if(!Number.isFinite(t))return '—';const n=Math.max(0,Math.round(t*100));return String(Math.floor(n/100)).padStart(2,'0')+':'+String(n%100).padStart(2,'0');};
const tiltValue=r=>Number.isFinite(r.tilt)?clamp(r.tilt,-.5,3):r.strategy==='attack'?1.5:r.strategy==='safe'?-.5:0;
// V110: the added acceleration is modest and depends on effective physical strength.
// Standard/negative tilt and the underlying engine acceleration are unchanged.
function tiltEffects(r,b,power=b.stats?.power||0){const angle=b.isPlayer?tiltValue(r):0,efficiency=.25+.75*clamp(power,0,100)/100;return {angle,efficiency,accel:Math.max(0,angle)*.12*efficiency,speed:angle<0?angle*1.6:angle*.65,grip:angle<0?-angle*1.2:-angle*.45,damping:angle<0?-angle*.3:-angle*.10};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mod=(v,m)=>(v%m+m)%m;
const wrap=a=>mod(a+Math.PI,TAU)-Math.PI;
const clone=v=>JSON.parse(JSON.stringify(v));
const floor=v=>Math.floor(Number(v)+1e-8);
const rank=v=>v>100?'SS':v>=90?'S':v>=80?'A':v>=65?'B':v>=50?'C':v>=35?'D':'E';
function gradeValue(value,range){const integer=floor(value);return {value:integer,rank:rank(range?clamp((value-range[0])/(range[1]-range[0])*100,0,100):integer)};}
function equipmentRange(part,key){return ['condition','stability'].includes(key)?null:part==='boat'?[ -2,key==='turn'?9:8 ]:[-15,key==='accel'?25:30];}
function display(value,range,signed=false){const v=gradeValue(value,range);return (signed&&v.value>=0?'+':'')+v.value+' '+v.rank;}
function random(s){let t=s.seed+=0x6D2B79F5;s.seed>>>=0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
function pointAt(distance,radius=C.radius){
  const a=C.halfStraight,R=C.radius;let s=mod(distance,C.length),x,z,heading;
  if(s<2*a){x=-a+s;z=radius;heading=0;}
  else if((s-=2*a)<Math.PI*R){const angle=Math.PI/2-s/R;x=a+radius*Math.cos(angle);z=radius*Math.sin(angle);heading=angle-Math.PI/2;}
  else if((s-=Math.PI*R)<2*a){x=a-s;z=-radius;heading=-Math.PI;}
  else{const angle=-Math.PI/2-(s-2*a)/R;x=-a+radius*Math.cos(angle);z=radius*Math.sin(angle);heading=angle-Math.PI/2;}
  return {x,z,heading:wrap(heading)};
}
function project(x,z){
  const a=C.halfStraight,R=C.radius;let s;
  if(x>=-a&&x<=a)s=z>=0?x+a:2*a+Math.PI*R+a-x;
  else if(x>a)s=2*a+(Math.PI/2-Math.atan2(z,x-a))*R;
  else{let angle=Math.atan2(z,x+a);if(angle>0)angle-=TAU;s=4*a+Math.PI*R+(-Math.PI/2-angle)*R;}
  const cx=clamp(x,-a,a);return {s:mod(s,C.length),radial:Math.hypot(x-cx,z),cx};
}
function phaseAt(progress){
  if(progress<2*C.halfStraight-C.start)return 0;
  const s=mod(C.start+progress,C.length),a=C.halfStraight,R=C.radius;
  if(s<2*a)return 4;
  if(s<2*a+Math.PI*R)return 1;
  if(s<4*a+Math.PI*R)return 2;
  return 3;
}
function ranks(d){return d.boats.slice().sort((a,b)=>Number(a.capsized||a.dnf)-Number(b.capsized||b.dnf)||
  (a.finishTime!==null&&b.finishTime!==null?a.finishTime-b.finishTime:
   a.finishTime!==null?-1:b.finishTime!==null?1:b.progress-a.progress)||a.frame-b.frame);}
const place=(d,b)=>ranks(d).findIndex(n=>n.id===b.id)+1;
const own=d=>d.boats.find(b=>b.isPlayer)||d.boats[0];
// NPC pace is explicit difficulty tuning. Steering, water, collisions and checkpoints remain shared.
const normalAI=r=>(r.difficulty||'normal')==='normal';
const requiresManual=r=>['championship','consolation'].includes(r?.type);
const spectating=r=>!!r.watch||['auto','assisted','spectator','skip'].includes(r.controlMode);
function raceGrade(r){return D.tiers[r.grade]?r.grade:'rookie';}
function npcPace(b,r){
 if(b.isPlayer&&!spectating(r))return {speed:1,accel:1,turn:1};
 const mode=r.difficulty||'normal',time=D.npcTimeScale;
 if(b.isPlayer){const p=D.npcPace[mode],a=D.spectatorAssist[mode];return {speed:p.speed*time*a.speed,accel:p.accel*time*time*a.accel,turn:time*a.turn};}
 const p=D.npcPace[mode],grade=D.gradePace[mode][raceGrade(r)];
 // Final characters do not also inherit the generic NPC speed uplift.
 if(b.racePersona==='king'||b.racePersona==='rival_final')return {speed:mode==='easy'?(b.racePersona==='rival_final'?.985:.945):1.025,accel:mode==='easy'?1:1.06,turn:1};
 if(b.racePersona?.startsWith('wall_'))return {speed:mode==='easy'?.96:1.005,accel:1,turn:1};
 if(['rival','rival_ally','heroine'].includes(b.racePersona)&&r.grade==='sg')return {speed:mode==='easy'?.975:1.01,accel:1.02,turn:1};
 if(r.grade==='sg'&&r.type==='championship'&&!b.racePersona)return {speed:mode==='easy'?.98:1.02,accel:1.04,turn:1};
 if(b.racePersona==='mentor'&&r.grade==='sg')return {speed:mode==='easy'?.975:1.015,accel:1.02,turn:1};
 return {speed:p.speed*time*grade,accel:p.accel*time*time*grade*grade,turn:time*grade};
}
function spectatorAdjustment(b,d,r){
 if(!spectating(r))return {stats:{},speed:1,accel:1,form:0};
 const cfg=D.spectatorSpread,stats={};
 for(const k of D.statKeys){const mean=d.boats.reduce((v,n)=>v+n.stats[k],0)/d.boats.length;stats[k]=clamp((mean-b.stats[k])*(1-cfg.weight),-cfg.cap,cfg.cap);}
 // Seeded temperament plus gradual race progression: never rerolled by pause/load.
 const form=Math.sin(b.aiBias*35+b.frame*7.13+clamp(b.progress,0,C.goal)/C.length*2.1);
 return {stats,speed:1+form*cfg.speed,accel:1+form*cfg.accel,form};
}
function bestSignature(b,family){return b.skills.filter(id=>D.abilityMap[id].signature?.family===family).sort((a,c)=>D.rarities.indexOf(D.abilityMap[c].rarity)-D.rarities.indexOf(D.abilityMap[a].rarity))[0]||null;}
function signatureState(b){return b.signature||(b.signature={lap:0,monkeyZones:[]});}
function updateSignatures(d,b,r,input){
  if(b.startTime===null||b.dnf||b.capsized)return;
  const st=signatureState(b),lap=Math.max(st.lap,clamp(Math.floor(Math.max(0,b.progress)/C.length)+1,1,3)),id=bestSignature(b,'doguchi');
  if(st.lap!==lap){
    st.lap=lap;b.effects=b.effects.filter(e=>D.abilityMap[e.id].signature?.family!=='doguchi');
    if(id){const a=D.abilityMap[id],stats=lap===1?a.signature.early:lap===3?a.signature.late:null;
      if(stats){b.effects.push({id,stats:clone(stats),safety:0,until:302,source:b.id,kind:lap===3?'recoil':'buff',mechanics:{}});const e=activate(d,b,id);e.variant=lap===3?'recoil':'boost';e.lap=lap;b.activations[b.activations.length-1]=clone(e);}
      log(d,b.frame+'号艇「'+a.name+'」'+(lap===1?'1周目、出力を上乗せ。':lap===2?'2周目、上乗せが終了。':'3周目、整備の反動で出力低下。'),lap===3?'weak':'ability',b.id);
    }
  }
  const monkey=bestSignature(b,'monkey'),phase=phaseAt(b.progress),zone=lap+':'+phase;
  if(!monkey||![1,3].includes(phase)||st.monkeyZones.includes(zone)||b.throttle<.98||b.steer>-.25||b.speed<6)return;
  st.monkeyZones.push(zone);const a=D.abilityMap[monkey],roll=random(d);if(roll>=a.chance)return;
  const e=activate(d,b,monkey);e.lap=lap;e.variant='pivot';b.activations[b.activations.length-1]=clone(e);
  b.effects.push({id:monkey,stats:{},safety:a.signature.pivot*.4,until:d.elapsed+a.signature.duration,source:b.id,kind:'pivot',mechanics:{pivot:a.signature.pivot}});
  log(d,b.frame+'号艇「'+a.name+'」水面をつかみ、全開のまま鋭く左へ。','ability',b.id);
}
// Gameplay weight transfer: -1 crouched, +1 raised. No RNG or automatic braking.
function postureTarget(b,r){
 if(b.startTime===null)return 0;
 const pos=project(b.x,b.z),look=clamp(12+b.speed*.85,15,34);
 const bend=Math.abs(wrap(pointAt(pos.s+look,pos.radial).heading-pointAt(pos.s,pos.radial).heading));
 const turning=bend>.13||Math.abs(b.yawRate)>.12||Math.abs(b.steer)>.38;
 if(turning)return 1;
 return r.env.weather==='雨'||r.env.windSpeed>=6||b.wakeLoad>.22?0:-1;
}
function postureEffects(b,d){
 const raw=clamp(Number(b.posture)||0,-1,1),age=b.startTime===null?0:clamp((raceTime(d)-Math.max(0,b.startTime))/1.2,0,1),value=raw*age;
 return {value,requested:clamp(Number(b.postureTarget)||0,-1,1),speed:1-value*(value<0?.028:.022),grip:1+value*.10,yaw:1+value*.08,damping:1+value*.14};
}
function postureStep(value){return Math.round(clamp(Number(value)||0,-1,1))||0;}
function movePosture(b,wanted,dt=DT){
 const target=postureStep(wanted),current=clamp(Number(b.posture)||0,-1,1);
 const rate=6+clamp(b.stats.turn,0,100)*.012+clamp(b.stats.power,0,100)*.006; // 0.13–0.17s per step, including turns
 b.postureTarget=target;b.posture=current+clamp(target-current,-rate*dt,rate*dt);
 return b.posture;
}
function steeringLimits(b,p){
  const turn=clamp(p.stats.turn,0,125),speed=Math.hypot(b.vx,b.vz),pivot=p.pivot||0;
  const water=Math.pow(clamp(speed/20,0,1.7),2)*.50;
  const corner=clamp(Math.abs(b.yawRate)*speed/Math.max(2,p.grip),0,3)*.60;
  const slide=clamp((b.slip||0)/8,0,1.5)*.35;
  const body=clamp(p.posture?.value||0,-1,1);
  const load=(1-body*.10)*(.30*(1-clamp(turn/100,0,1))+water+corner+slide)*(1-turn/160)*(1-pivot*.85)/(1+p.safety*.4);
  const instability=tiltInstability(b,p);
  return {load,instability,limit:clamp(1-load*.35,.30,1)*(1-instability*.35),rate:(.65+turn*.021)*(1+pivot*2)/(1+load*1.6)*(1-instability*.45)};
}
function moveSteering(current,wanted,limits,dt=DT){
  const target=clamp(wanted,-limits.limit,limits.limit),returning=Math.abs(target)<Math.abs(current)||current*target<0;
  const step=limits.rate*(returning?1.35:1)*dt;
  return clamp(current+clamp(target-current,-step,step),-limits.limit,limits.limit);
}
function tiltInstability(b,p){
 const angle=Math.max(0,p.tilt?.angle||0),power=clamp(p.stats.power||0,0,100),speed=Math.hypot(b.vx,b.vz);
 const load=angle/3*Math.pow(speed/20,2)*(.45+.9*(1-power/100))*Math.abs(b.steer||0);
 return clamp((load-.35)/.65,0,1);
}
function addEvent(d,e){e.t=d.elapsed;e.index=d.eventSequence++;d.events.push(e);if(d.events.length>180)d.events.shift();if(d.replay&&e.kind==='ability'){d.replay.events.push({t:d.elapsed,text:e.frame+'号艇「'+D.abilityMap[e.abilityId].name+'」発動',kind:'ability',abilityId:e.abilityId,athleteId:e.athleteId});if(d.replay.events.length>400)d.replay.events.shift();}}
function log(d,text,kind='normal',athleteId=null){const p=own(d);d.logs.push({phase:p.phase,text,kind,id:athleteId,lap:Math.min(C.laps,Math.floor(Math.max(0,p.progress)/C.length)+1),time:d.elapsed});if(d.logs.length>80)d.logs.shift();if(d.replay&&kind!=='ability'){d.replay.events.push({t:d.elapsed,text,kind});if(d.replay.events.length>400)d.replay.events.shift();}}
function recordReplay(d,force=false){
 if(!d.replay)d.replay={version:1,from:d.elapsed,frames:[],events:[]};
 const a=d.replay.frames;if(a.length&&a[a.length-1].t===d.elapsed)return;
 if(!force&&d.frame%30!==0&&a.length)return;
 const order=ranks(d),rounded=v=>Math.round(v*100)/100||0;
 a.push({t:rounded(d.elapsed),boats:d.boats.map(b=>[rounded(b.x),rounded(b.z),rounded(b.heading),rounded(b.progress),rounded(b.speed),b.startFault==='F'?4:b.startFault==='L'?5:b.capsized?2:b.dnf?3:b.finishTime!==null?1:0,order.indexOf(b)+1])});
 if(a.length>600)a.splice(1,1);
}
function validReplay(p){return p&&p.version===1&&Number.isFinite(p.from)&&p.from>=0&&p.from<=283&&Array.isArray(p.frames)&&p.frames.length<=600&&p.frames.every((f,i)=>Number.isFinite(f.t)&&f.t>=0&&f.t<=283&&(!i||f.t>=p.frames[i-1].t)&&Array.isArray(f.boats)&&f.boats.length===6&&new Set(f.boats.map(b=>b[6])).size===6&&f.boats.every(b=>Array.isArray(b)&&b.length===7&&b.every(Number.isFinite)&&Math.abs(b[0])<500&&Math.abs(b[1])<500&&Math.abs(b[2])<=3.15&&b[3]>=-1000&&b[3]<2800&&b[4]>=0&&b[4]<150&&Number.isInteger(b[5])&&b[5]>=0&&b[5]<=5&&Number.isInteger(b[6])&&b[6]>=1&&b[6]<=6))&&Array.isArray(p.events)&&p.events.length<=400&&p.events.every(e=>Number.isFinite(e.t)&&e.t>=0&&e.t<=283&&typeof e.text==='string'&&e.text.length<=2000&&typeof e.kind==='string'&&e.kind.length<30&&(!e.abilityId||D.abilityMap[e.abilityId])&&(!e.athleteId||typeof e.athleteId==='string'));}
function dramaticRace(d){
 if(!d||!d.finished)return null;const order=ranks(d),b=own(d),second=order[1];
 if(order[0]!==b||b.finishTime===null||b.dnf||b.capsized||b.startFault)return null;
 const frames=d.replay?.frames||[],index=d.boats.indexOf(b);
 if(frames.some(f=>f.boats[index][3]>=1700&&f.boats[index][5]===0&&f.boats[index][6]>1))return '最後の直線で逆転';
 const third=frames.find(f=>f.boats[index][3]>=1200);
 if(third&&third.boats[index][3]<1250&&third.boats[index][6]>=3)return '最終周、3位以下からの逆転';
 if(second&&second.finishTime!==null&&!second.dnf&&second.finishTime-b.finishTime<=.25+1e-8)return '僅差の勝負を制した';
 return null;
}
function create(r,seed,options={}){
  const d={version:2,seed:seed>>>0,frame:0,elapsed:0,startAt:C.prestart,countdown:C.prestart,started:false,finished:false,paused:true,boats:[],events:[],eventSequence:0,logs:[],
    laps:C.laps,goal:C.goal,controls:{steer:0,throttle:0,posture:0},replay:{version:1,from:0,frames:[],events:[]},lastAnnouncedLeader:null,finalized:false,wakes:[],wakeClock:0};
  r.runners.slice().sort((a,b)=>a.frame-b.frame).forEach(p=>{
    const b={id:p.id,name:p.name,frame:p.frame,course:p.course,isPlayer:!!p.isPlayer,stats:clone(p.stats),equipment:clone(p.equipment),skills:p.skills.slice(),mastery:clone(p.mastery||{}),racePersona:p.racePersona||null,castId:p.castId||null,castRole:p.castRole||null,portraitKey:p.portraitKey||null,
      x:0,z:0,heading:0,vx:0,vz:0,yawRate:0,speed:0,steer:0,throttle:0,engine:0,posture:0,postureTarget:0,
      progress:0,lastS:C.start,checkpoints:0,phase:0,lastZone:null,finishTime:null,capsized:false,dnf:false,startFault:null,startTime:null,
      stamina:100,stress:0,heel:0,slip:0,penaltyUntil:0,lane:0,reaction:0,
      effects:[],activations:[],interference:[],phaseHistory:[],statsBuff:p.isPlayer?clone(r.buff):{},itemBoost:p.isPlayer?(r.itemBoost||0):0,
      metrics:{contacts:0,boundaries:0,rescues:0,maxSpeed:0,slideSeconds:0,throttleSeconds:0,coastSeconds:0,turnSpeedSum:0,turnSamples:0,wakeSeconds:0,lineChanges:0,contactImpulse:0,lowTurnSeconds:0,highStraightSeconds:0,postureGoodSeconds:0},
      cooldownContact:0,cooldownBoundary:0,aiBias:random(d)*2-1,startRoll:random(d)*2-1,startAim:0,plan:null,nextPlan:0,wakeLoad:0,aiLane:0};
    d.boats.push(b);
  });
  d.boats.forEach(b=>{if(!options.keepCourses&&b.skills.includes('entry')&&b.course>1&&random(d)<D.abilityMap.entry.chance){const other=d.boats.find(o=>o.course===b.course-1);if(other){other.course++;b.course--;activate(d,b,'entry');}}});
  d.boats.forEach(b=>{
    b.lane=C.inner+4+(b.course-1)*5.1;b.aiLane=b.lane;
    const distance=b.course<=3?42+(b.course-1)*5:78+(b.course-4)*7;
    const start=pointAt(C.start-distance,b.lane);b.x=start.x;b.z=start.z;b.heading=start.heading;b.progress=-distance;b.lastS=C.start-distance;
  });
  if(d.boats.some(b=>earlyStart(b)))log(d,d.boats.filter(earlyStart).map(b=>b.name).join('・')+'：先駆スタート（0.30秒先行／表示ST 00:00）。','phase');
  recordReplay(d,true);log(d,'助走開始。1〜3コースはスロー、4〜6コースは後方からダッシュ。通過までは直進のみ。早発許容はスタート能力×0.002秒（最大0.20秒）。','phase');
  return d;
}
function condition(a,b,d,env){switch(a.condition){case'rough':return env.weather==='雨'||env.windSpeed>=6;case'calm':return env.weather!=='雨'&&env.windSpeed<=3;case'inner':return b.course<=2;case'outer':return b.course>=4;case'rain':return env.weather==='雨';case'cross':return env.wind==='横風';case'behind':return place(d,b)>=3;default:return true;}}
function activate(d,b,id){const a=D.abilityMap[id],e={kind:'ability',phase:b.phase,athleteId:b.id,name:b.name,frame:b.frame,abilityId:id,rarity:a.rarity,category:a.category};addEvent(d,e);b.activations.push(clone(e));if(b.activations.length>100)b.activations.shift();return e;}
function defense(b){return b.skills.filter(id=>D.abilityMap[id].type==='defense').sort((a,c)=>D.abilityMap[c].effect.reflect-D.abilityMap[a].effect.reflect)[0];}
function opponent(d,b,type){const list=d.boats.filter(o=>o!==b&&!o.capsized&&!o.dnf&&o.finishTime===null);if(!list.length)return null;
  if(type==='nearest')return list.sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z))[0];
  const ahead=list.filter(o=>o.progress>=b.progress).sort((a,c)=>a.progress-c.progress);return ahead[0]||list.sort((a,c)=>c.progress-a.progress)[0];
}
function attack(d,b,target,id){
  const a=D.abilityMap[id],e=a.effect,guard=defense(target),amount=e.amount*(1+.04*((b.mastery[id]||1)-1));
  const duration=b.phase===0?Math.max(4,startAt(d)-d.elapsed+1):4;
  const mechanics=clone(a.drive&&a.drive.mechanics||{}),event={kind:'debuff',phase:b.phase,from:b.id,to:target.id,athleteId:target.id,abilityId:id,defenseId:guard||null,stat:e.stat,amount,blocked:!!guard,reflected:guard?amount*D.abilityMap[guard].effect.reflect:0,mechanics};
  addEvent(d,event);b.interference.push(clone(event));target.interference.push(clone(event));
  if(guard){
    activate(d,target,guard);target.effects.push({id:guard,stats:{},until:d.elapsed+duration,safety:0,source:target.id,kind:'defense',mechanics:clone(D.abilityMap[guard].drive.mechanics||{})});
    if(event.reflected){const ratio=event.reflected/amount;b.effects.push({id,stats:{[e.stat]:-event.reflected},until:d.elapsed+duration,safety:0,source:target.id,kind:'reflection',mechanics:Object.fromEntries(Object.entries(mechanics).map(([k,v])=>[k,v*ratio]))});}
    log(d,target.frame+'号艇「'+D.abilityMap[guard].name+'」'+(event.reflected?' 水面効果も反射。':' 妨害を無効化。'),'reflect',target.id);
  }else{
    target.effects.push({id,stats:{[e.stat]:-amount},until:d.elapsed+duration,safety:0,source:b.id,kind:'debuff',mechanics});
    const gap=Math.hypot(b.x-target.x,b.z-target.z);
    if(id==='dump'&&gap<9){const nx=(target.x-b.x)/Math.max(1,gap),nz=(target.z-b.z)/Math.max(1,gap);const strength=b.racePersona==='wall_power'?1.25:1;target.vx+=nx*1.8*strength;target.vz+=nz*1.8*strength;target.yawRate+=.12*strength;target.stress+=.18*strength;b.vx-=nx*.65;b.vz-=nz*.65;b.stress+=.08;}
    log(d,b.frame+'号艇「'+a.name+'」→ '+target.frame+'号艇、近距離の水面効果。','debuff',target.id);
  }
}
function enterZone(d,b,r){
  const lap=Math.floor(Math.max(0,b.progress)/C.length),phase=phaseAt(b.progress),zone=lap+':'+phase;
  b.phase=phase;if(zone===b.lastZone)return;if(b.lastZone&&/:(1|3)$/.test(b.lastZone)&&[2,4].includes(phase))b.turnExitAt=d.elapsed;b.lastZone=zone;
  const checks=[];
  b.skills.forEach(id=>{const a=D.abilityMap[id];if(!a.phases.includes(phase)||['defense','convert','lapcycle','pivot','operation'].includes(a.type))return;
    const target=a.type==='debuff'?opponent(d,b,a.effect.target):null;
    const met=condition(a,b,d,r.env)&&driveCondition(a,b,d,r,target),roll=met?random(d):null,active=met&&roll<a.chance;checks.push({abilityId:id,condition:met,roll,chance:a.chance,activated:active});if(!active)return;
    activate(d,b,id);
    if(a.type==='debuff'){if(target)attack(d,b,target,id);return;}
    const convert=a.category==='弱点'&&b.skills.includes('comeback'),stats={};
    if(convert)activate(d,b,'comeback');
    Object.entries(a.effect.stats||{}).forEach(([k,v])=>{stats[k]=convert&&v<0?-v*.4:v*(1+.06*((b.mastery[id]||1)-1));});
    b.effects.push({id,stats,safety:a.effect.safety||0,until:d.elapsed+(phase===0?C.prestart+4:8),source:b.id,kind:a.category==='弱点'?'weak':'buff',mechanics:convert?{}:clone(a.drive&&a.drive.mechanics||{})});
    log(d,b.frame+'号艇「'+a.name+'」'+(convert?' 弱点を操船の力へ。':''),a.category==='弱点'?'weak':'ability',b.id);
  });
  const params=performance(b,d,r);
  b.phaseHistory.push({phase,lap:lap+1,base:D.statKeys.reduce((v,k)=>v+b.stats[k],0)/5,gear:params.gearSpeed,environment:params.wave,
    skill:params.skillSum,debuff:params.debuffSum,training:D.statKeys.reduce((v,k)=>v+(b.statsBuff[k]||0)+b.itemBoost,0)/5,
    lane:0,strategy:0,choice:0,choiceId:null,noise:0,fatigue:100-b.stamina,total:params.topSpeed,capRisk:0,capRoll:null,checks,physical:true});
  if(b.phaseHistory.length>24)b.phaseHistory.shift();
  if(b.isPlayer){const text=phase===0?'スタート。自分の手で水面へ。':phase===1?'1マーク。アクセルを緩めて左へ。':phase===3?'2マーク。滑りを抑えて立ち上がる。':phase===2?'バック直線。船首を整えて加速。':lap===C.laps-1?'ホーム直線。ゴールまで押し切れ。':'ホーム直線。次の周回へ。';log(d,text,'phase',b.id);}
}
function driveCondition(a,b,d,r,target){
  const spec=a.drive||{};
  if(a.type==='debuff')return !!target&&Math.hypot(target.x-b.x,target.z-b.z)<(spec.range||28);
  if(spec.when==='composed')return Math.abs(b.steer)<.2&&b.throttle>.6;
  if(spec.when==='turning')return Math.abs(b.steer)>.2;
  if(spec.when==='duel')return d.boats.some(o=>o!==b&&activeBoat(o)&&Math.hypot(o.x-b.x,o.z-b.z)<18);
  if(spec.when==='finalLap')return b.progress>=C.length*2;
  if(spec.when==='tired')return b.stamina<75;
  if(spec.when==='exit')return Number.isFinite(b.turnExitAt)&&d.elapsed-b.turnExitAt<=4;
  if(spec.when==='inside')return project(b.x,b.z).radial<C.inner+15;
  if(spec.when==='outside')return project(b.x,b.z).radial>C.inner+9;
  if(spec.when==='wake')return b.wakeLoad>.08||d.boats.some(o=>o!==b&&o.progress>b.progress&&o.progress-b.progress<35);
  return true;
}
function buildLinks(b){return D.synergies.map(link=>{const missing=link.groups.filter(group=>!group.some(id=>b.skills.includes(id))),stats=Object.entries(link.need).filter(([k,v])=>b.stats[k]<v);return {id:link.id,name:link.name,description:link.description,ready:!missing.length&&!stats.length,missing:missing.map(group=>group.slice()),stats:stats.map(([k,v])=>({key:k,value:v}))};});}
// Style is derived from fixed athlete identity and learned strengths, never from race position.
function racingStyle(b){
 const s=b.stats,h=Array.from(String(b.id)).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0),bias=h%4;
 const styles=[{id:'inside',name:'先マイ派',score:s.start*.55+s.turn*.45,plans:['front','defend'],tip:'好発進から内を守る'},
 {id:'sashi',name:'差し派',score:s.accel*.55+s.turn*.45,plans:['sashi','cross'],tip:'出口で舵を戻し再加速'},
 {id:'outside',name:'まくり派',score:s.speed*.65+s.accel*.35,plans:['outside'],tip:'外へ持ち出し直線で追う'},
 {id:'clear',name:'安定派',score:s.power*.7+s.turn*.3,plans:['clear','cross'],tip:'波と接触を避けて継ぐ'}];
 styles[bias].score+=7;return styles.sort((a,z)=>z.score-a.score)[0];
}
function synergyState(b,d,r){
  const phase=phaseAt(b.progress),lap=Math.min(3,Math.floor(Math.max(0,b.progress)/C.length)+1),rough=r.env.weather==='雨'||r.env.windSpeed>=6;
  const active=[],mechanics={};
  for(const link of buildLinks(b).filter(x=>x.ready)){
    let value=null;
    if(link.id==='launch'&&b.course<=2&&b.progress<200&&b.throttle>.8&&Math.abs(b.steer)<.35)value={response:.6,grip:.3,economy:-.10};
    if(link.id==='cutback'&&[2,4].includes(phase)&&Number.isFinite(b.turnExitAt)&&d.elapsed-b.turnExitAt<=4&&b.throttle>.85&&Math.abs(b.steer)<.22)value={accel:.85,response:.4,speed:-.25};
    if(link.id==='stormwall'&&rough&&b.throttle<.9)value={wakeShield:.20,waveShield:.16,economy:.14,speed:-.3};
    if(link.id==='duel'&&d.boats.some(o=>o!==b&&activeBoat(o)&&Math.hypot(o.x-b.x,o.z-b.z)<18))value={response:.45,contactShield:.15,speed:-.25};
    if(link.id==='craftline'&&lap===2)value={response:.5,economy:.18,speed:-.15};
    if(link.id==='rhythm'&&b.operation&&b.operation.used.includes('feather:'+lap)&&[2,4].includes(phase)&&b.throttle>.9&&Math.abs(b.steer)<.15&&Number.isFinite(b.turnExitAt)&&d.elapsed-b.turnExitAt<3)value={accel:.45,damping:.25,economy:-.08};
    if(value){active.push(link.id);for(const [k,v] of Object.entries(value))mechanics[k]=(mechanics[k]||0)+v;}
  }
  return {active,mechanics};
}
function performance(b,d,r){
  const spread=spectatorAdjustment(b,d,r),synergy=synergyState(b,d,r),s=Object.assign({},b.stats),buff={},debuff={},mechanics={...synergy.mechanics};let safety=0,skillSum=0,debuffSum=0;
  const unique=new Map();for(const e of b.effects)if(e.until>d.elapsed)unique.set(e.id+':'+e.kind,e);
  for(const e of unique.values()){if(e.until<=d.elapsed||(e.kind==='pivot'&&(b.throttle<.98||b.steer>=-.2||![1,3].includes(phaseAt(b.progress)))))continue;safety=Math.max(safety,e.safety||0);for(const [k,v] of Object.entries(e.stats)){if(v>=0)buff[k]=(buff[k]||0)+v;else debuff[k]=(debuff[k]||0)+v;}for(const [k,v] of Object.entries(e.mechanics||{}))mechanics[k]=(mechanics[k]||0)+v;}
  D.statKeys.forEach(k=>{let up=buff[k]||0;if(up>36)up=Math.min(48,36+(up-36)*.25);skillSum+=up/5;debuffSum+=(debuff[k]||0)/5;s[k]=clamp(s[k]+(spread.stats[k]||0)+up+(debuff[k]||0)+(b.statsBuff[k]||0)+b.itemBoost+(r.venue.stats[k]||0),0,150);});
  for(const [key,limit] of Object.entries(D.driveEffectCaps))if(mechanics[key]>limit)mechanics[key]=limit;
  // Four distinct walls: bounded mechanics, no catch-up based on the player position.
  if(b.racePersona==='wall_power'){mechanics.wakeEmit=(mechanics.wakeEmit||0)+.28;mechanics.contactShield=Math.min(.55,(mechanics.contactShield||0)+.12);}
  if(b.racePersona==='wall_speed')mechanics.speed=Math.min(D.driveEffectCaps.speed,(mechanics.speed||0)+[-.8,0,1.1][clamp(Math.floor(Math.max(0,b.progress)/C.length),0,2)]);
  if(r.finalAlliance){const ally=d.boats.find(n=>b.isPlayer?n.id===r.finalAlliance:n.isPlayer);if((b.isPlayer||b.id===r.finalAlliance)&&ally&&!ally.dnf&&Math.abs(ally.progress-b.progress)<45)mechanics.wakeShield=Math.min(.55,(mechanics.wakeShield||0)+.12);}
  const e=b.equipment,mc=e.motor.condition/100,pc=e.prop.condition/100;
  const gearSpeed=e.motor.speed*mc*.14,gearAccel=(e.motor.accel*mc+e.prop.accel*pc+e.boat.accel)*.055;
  const gearTurn=e.prop.turn*pc*.11+e.boat.turn*.085,wind=r.env.windSpeed||0,rain=r.env.weather==='雨'?1:0;
  const tilt=tiltEffects(r,b,s.power),fatigue=Math.max(0,60-b.stamina),turn=clamp(s.turn,0,125),power=clamp(s.power,0,125);
  const pace=npcPace(b,r),pivot=b.throttle>=.98&&b.steer<-.2&&[1,3].includes(phaseAt(b.progress))?clamp(mechanics.pivot||0,0,.9):0;
  const posture=postureEffects(b,d);
  const topSpeed=posture.speed*clamp((10.8+s.speed*.130+gearSpeed+tilt.speed-fatigue*.065+(mechanics.speed||0))*pace.speed*spread.speed,9,38);
  const acceleration=clamp((1.05+s.accel*.049+s.start*.009+s.power*.005+gearAccel+tilt.accel+(mechanics.accel||0))*pace.accel*spread.accel,1.2,14);
  const grip=posture.grip*clamp(2.0+turn*.052+power*.036+gearTurn+(e.boat.stability-50)*.018+safety*1.5-wind*.09-rain*.28-fatigue*.014+tilt.grip+(mechanics.grip||0),2.3,16)*(1+pivot*3.8);
  const yawMax=posture.yaw*(.42+turn*.0081+gearTurn*.02)*clamp(.78+turn*.0022,.78,1)*(1+pivot*.85);
  const wakeResistance=clamp(.10+power*.0040+safety*.35+(mechanics.wakeShield||0),0,.88);
  const wave=(.23+(100-Math.min(power,100))*.009+wind*.11+rain*.24+(r.venue.roughness||0)*.22+(mechanics.waveExtra||0))*(1-safety*.45)*(1-clamp(mechanics.waveShield||0,0,.8));
  return {stats:s,posture,tilt,topSpeed,acceleration,grip,yawMax,safety,gearSpeed,skillSum,debuffSum,wave,wakeResistance,mechanics,pace,pivot,spread,synergy:synergy.active,
    response:clamp((b.startTime===null?.35+clamp(s.start,0,125)*.055:.65+(s.accel*.55+s.start*.45)*.045)-fatigue*.006+(mechanics.response||0),.5,8),
    lateralDamping:posture.damping*Math.max(.3,(.23+turn*.011+power*.009+tilt.damping+safety*.5+(mechanics.damping||0))*(1+pivot*3.5)),mass:.65+power*.007};
}
function forwardStep(v,engine,throttle,p,dt,launch=false){
  const rev=engine+(throttle-engine)*(1-Math.exp(-p.response*dt));
  const drive=p.acceleration*rev*(launch?(.65+p.stats.start*.0085):1);
  const drag=p.acceleration*Math.pow(Math.max(0,v)/p.topSpeed,2)+(.24+(1-rev)*.52+(p.mechanics.drag||0))*Math.min(v,1);
  return {speed:clamp(v+(drive-drag)*dt,0,p.topSpeed*1.12),engine:rev};
}
// A forecast is a real throttle-only run, including engine lag. It never moves a boat.
function launchForecast(d,b,r,p=performance(b,d,r)){
  let left=Math.max(0,pointAt(C.start).x-(b.x+Math.cos(b.heading)*3.5)),v=Math.max(0,b.vx),engine=b.engine,t=0;
  const wind=r.env.wind==='向かい風'?-r.env.windSpeed*.065:r.env.wind==='追い風'?r.env.windSpeed*.065:0,perf={...p,topSpeed:p.topSpeed+wind};
  const step=earlyStart(b)?DT:1/30;while(left>0&&t<22){const q=forwardStep(v,engine,1,perf,step,true),travel=q.speed*step,fraction=left<travel?left/Math.max(travel,1e-9):1;left-=travel;v=q.speed;engine=q.engine;t+=step*fraction;}
  const uncertainty=earlyStart(b)?0:.03+Math.pow(1-clamp(p.stats.start/100,0,1),1.35)*.46;
  return {seconds:t,uncertainty,launchIn:startAt(d)-d.elapsed-t,precision:p.stats.start>=80?'精密':p.stats.start>=50?'標準':'粗め'};
}
function startTarget(b,r){if(earlyStart(b))return -.30;const stat=clamp(b.stats.start,0,100),uncertainty=.03+Math.pow(1-stat/100,1.35)*.46;
 const policy=b.isPlayer?(r.startPolicy||'safe'):(normalAI(r)&&b.aiBias>-.25?'attack':'safe');
 return policy==='attack'?-startAllowance(b)+.03+uncertainty*.42:.08+uncertainty*.35;
}
function startPilot(d,b,r,p){
  const line=pointAt(C.start).x,distance=Math.max(0,line-b.x-3.5);
  const normal=normalAI(r);
  b.startAim=startTarget(b,r)+(earlyStart(b)?0:b.startRoll*.012);
  const estimate=launchForecast(d,b,r,p),remaining=startAt(d)+b.startAim-d.elapsed;
  const throttle=remaining<=estimate.seconds?.999:0;
  const error=wrap(Math.atan2(b.lane-b.z,Math.max(15,distance))-b.heading);
  return {steer:clamp(error*2.2-b.yawRate*.45,-.65,.65),throttle,posture:0};
}
const activeBoat=b=>!b.capsized&&!b.dnf&&b.finishTime===null;
function tacticalPlan(d,b,r,p){
  const normal=normalAI(r),pos=project(b.x,b.z),phase=phaseAt(b.progress),turn=[1,3].includes(phase);
  const nearby=d.boats.filter(o=>o!==b&&activeBoat(o)&&Math.abs(o.progress-b.progress)<40);
  const ahead=nearby.filter(o=>o.progress>b.progress).sort((a,c)=>a.progress-c.progress)[0],leading=place(d,b)===1;
  const inner=C.inner+3.5+Math.max(0,70-p.stats.turn)*.065,has=id=>b.skills.includes(id),opening=b.progress<240;
  const candidates=[
    {id:leading?'defend':'front',name:leading?'内を守る':'先マイ',lane:inner,speed:.98,score:12+p.stats.turn*.025},
    {id:'sashi',name:'差し',lane:inner+2.6,speed:.99,score:6+(ahead?4:0)+p.stats.accel*.022+(has('slice')||has('split')||bestSignature(b,'monkey')?3:0)},
    {id:'outside',name:'まくり',lane:inner+9,speed:1.02,score:4+(opening&&b.course>=4?3:0)+p.stats.speed*.038+(has('sweep')||has('outside')?3:0)},
    {id:'cross',name:'まくり差し',lane:turn&&pos.s%(C.length/2)>2*C.halfStraight+Math.PI*C.radius*.40?inner+1.5:inner+6,speed:1,score:5+(ahead?3:0)+p.stats.turn*.025},
    {id:'clear',name:'引き波回避',lane:inner+13,speed:1.01,score:1+(b.wakeLoad>.30?9:0)}
  ];
  const style=racingStyle(b);
  for(const c of candidates){
    if(style.plans.includes(c.id))c.score+=3.2;
    for(const o of nearby){const gap=o.progress-b.progress,rad=project(o.x,o.z).radial;
      if(gap>-6&&gap<18&&Math.abs(rad-c.lane)<3.0)c.score-=10+(18-Math.max(0,gap))*.25;
      if(Math.abs(gap)<7&&Math.abs(rad-c.lane)<5)c.score-=3;
    }
    c.score-=(c.lane-inner)*.13+Math.abs(c.lane-pos.radial)*.08;
    c.score+=Math.sin(b.frame*3.8+c.lane)*.55;
    if(b.plan&&b.plan.id===c.id)c.score+=normal?2.6:2.2;
  }
  const plan=candidates.sort((a,c)=>c.score-a.score)[0];
  if(b.plan&&b.plan.id!==plan.id){b.metrics.lineChanges++;if((b.isPlayer||nearby.some(o=>o.isPlayer))&&d.elapsed>(b.lastPlanLog||0)+6){log(d,b.frame+'号艇、'+plan.name+'へ進路を変える。','order',b.id);b.lastPlanLog=d.elapsed;}}
  b.plan=plan;b.nextPlan=d.elapsed+(normal?.45:.60)+(100-clamp(p.stats.start,0,100))*.003;return plan;
}
function pilot(d,b,r){
  if(!activeBoat(b))return {steer:0,throttle:0,posture:0};const p=performance(b,d,r);if(b.startTime===null)return startPilot(d,b,r,p);
  const normal=normalAI(r),pos=project(b.x,b.z),plan=!b.plan||d.elapsed>=b.nextPlan?tacticalPlan(d,b,r,p):b.plan;
  const shift=normal?4.8:4.2;b.aiLane+=clamp(plan.lane-b.aiLane,-shift*DT,shift*DT);
  const lane=b.aiLane,look=clamp(12+b.speed*.72+Math.max(0,70-p.stats.turn)*.38,18,47);
  const current=pointAt(pos.s,lane),target=pointAt(pos.s+look,lane),future=pointAt(pos.s+look+16,lane);
  const isTurn=Math.abs(wrap(future.heading-current.heading))>.13,aim=Math.atan2(target.z-b.z,target.x-b.x);
  const velocityHeading=b.speed>2?Math.atan2(b.vz,b.vx):b.heading;
  const desiredYaw=2*Math.max(3,b.speed)*Math.sin(wrap(aim-velocityHeading))/look;
  const slipHeading=velocityHeading+Math.atan(desiredYaw/p.lateralDamping);
  const requestedYaw=desiredYaw+wrap(slipHeading-b.heading)*((normal?1.25:1.15)+clamp((p.stats.turn-25)/55,0,1)*.45)-(b.yawRate-desiredYaw)*.75*(1-clamp((p.stats.turn-25)/55,0,1));
  const factor=clamp(b.speed/8,.10,1.1)/(1+b.speed*b.speed/1100),rudder=clamp(.42+b.engine*.68,.42,1.1);
  const noise=Math.sin(d.elapsed*.65+b.frame)*(100-clamp(p.stats.turn,0,100))*(normal?.00020:.00035);
  let desired=isTurn?Math.min(p.topSpeed,Math.sqrt(p.grip*.87*Math.max(22,lane-2))*plan.speed*(normal?1:.97)*p.pace.turn):p.topSpeed;
  desired*=1-Math.min(.07,b.wakeLoad*.045);if(b.stress>.65)desired*=.88;
  const close=d.boats.filter(o=>o!==b&&activeBoat(o)&&o.progress>b.progress&&o.progress-b.progress<7&&Math.hypot(o.x-b.x,o.z-b.z)<8&&Math.abs(project(o.x,o.z).radial-pos.radial)<2.7).sort((a,c)=>a.progress-c.progress)[0];
  if(close){desired=Math.min(desired,Math.max(6,close.speed-.25));b.nextPlan=Math.min(b.nextPlan,d.elapsed+.10);}
  // Feed-forward cancels predictable water drag; all steering still passes through its physical travel/rate limits.
  const cruise=clamp(Math.pow(desired/p.topSpeed,2)+.28/p.acceleration,.2,1);
  let throttle=clamp(cruise+(desired-b.speed)*.68,0,1);
  // Skills ask AI to make the same brief inputs required of manual players.
  const lap=Math.min(3,1+Math.floor(Math.max(0,b.progress)/C.length));
  if(b.skills.includes('feather')&&isTurn&&Math.abs(b.steer)>.2&&!b.operation?.used.includes('feather:'+lap)&&b.speed>6)throttle=.1;
  if(racingStyle(b).id==='clear'&&(r.env.weather==='雨'||r.env.windSpeed>=6)&&b.wakeLoad>.15)throttle=Math.min(.85,throttle);
  const monkeyZone=Math.min(3,Math.floor(Math.max(0,b.progress)/C.length)+1)+':'+phaseAt(b.progress);
  if(bestSignature(b,'monkey')&&[1,3].includes(phaseAt(b.progress))&&b.steer<-.25&&b.stress<.7&&b.slip<5&&(!b.signature?.monkeyZones.includes(monkeyZone)||p.pivot>0))throttle=1;
  return {steer:clamp(requestedYaw/Math.max(.2,p.yawMax*factor*rudder)+noise,-1,1),throttle,posture:postureTarget(b,r)};
}
function sampleWake(d,b){
  let strength=0,side=0;
  for(const w of d.wakes){if(w.owner===b.id)continue;const age=d.elapsed-w.t;if(age<0||age>5)continue;
    const dx=b.x-w.x,dz=b.z-w.z,along=dx*w.fx+dz*w.fz,lateral=-dx*w.fz+dz*w.fx,width=1.2+age*1.6;
    if(Math.abs(along)>7||Math.abs(lateral)>width+4)continue;
    const hit=(1-age/5)*w.strength*Math.exp(-Math.pow((Math.abs(lateral)-width)/2,2)-Math.pow(along/5,2));
    if(hit>strength){strength=hit;side=lateral>=0?1:-1;}
  }
  return {strength:clamp(strength,0,2),side};
}
function constrain(d,b){
  const p=project(b.x,b.z);let bound=null;const inner=C.inner+.45,outer=C.outer-1.2;
  if(p.radial<inner)bound=inner;else if(p.radial>outer)bound=outer;if(bound===null)return false;b.boundaryAt=d.elapsed;b.boundaryInner=bound===inner;
  const nx=(b.x-p.cx)/Math.max(p.radial,.01),nz=b.z/Math.max(p.radial,.01);
  b.x=p.cx+nx*bound;b.z=nz*bound;
  const normalSpeed=b.vx*nx+b.vz*nz;
  if((bound===inner&&normalSpeed<0)||(bound===outer&&normalSpeed>0)){b.vx-=normalSpeed*nx*1.08;b.vz-=normalSpeed*nz*1.08;if(d.elapsed>=b.cooldownBoundary){b.vx*=.55;b.vz*=.55;}b.stress+=Math.min(.18,Math.abs(normalSpeed)*.015);}
  if(d.elapsed>=b.cooldownBoundary){b.metrics.boundaries++;b.cooldownBoundary=d.elapsed+2;
    log(d,b.frame+'号艇、'+(bound===inner?'内側':'外側')+'ブイに接触して減速。','warning',b.id);
  }return true;
}
// Three overlapping hull discs cover stern, cockpit and bow, rather than a point hitbox.
function hullContacts(a,b){
  let best=null;const fx=Math.cos(a.heading),fz=Math.sin(a.heading),gx=Math.cos(b.heading),gz=Math.sin(b.heading);
  for(const sa of [-1.25,.55,2.35])for(const sb of [-1.25,.55,2.35]){
    const dx=b.x+gx*sb-a.x-fx*sa,dz=b.z+gz*sb-a.z-fz*sa,dist=Math.hypot(dx,dz),depth=2.15-dist;
    if(depth>0&&(!best||depth>best.depth)){const nx=dist>.001?dx/dist:0,nz=dist>.001?dz/dist:1;best={nx,nz,depth,sa,sb};}
  }return best;
}
function contact(d,a,b,r){
  if(!activeBoat(a)||!activeBoat(b)||Math.hypot(b.x-a.x,b.z-a.z)>8)return false;
  const hit=hullContacts(a,b);if(!hit)return false;
  a.lastContactAt=b.lastContactAt=d.elapsed; // Presentation timestamp; no physical effect.
  const kind=contactType(a,b,hit),rule=CONTACT[kind];
  const pa=performance(a,d,r),pb=performance(b,d,r),invA=1/pa.mass,invB=1/pb.mass,total=invA+invB;
  const {nx,nz,depth,sa,sb}=hit,speedA=Math.hypot(a.vx,a.vz),speedB=Math.hypot(b.vx,b.vz);
  a.x-=nx*depth*invA/total;a.z-=nz*depth*invA/total;b.x+=nx*depth*invB/total;b.z+=nz*depth*invB/total;
  const relative=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz,impulse=Math.max(0,-relative)*rule.restitution/total*((a.racePersona==='wall_power'||b.racePersona==='wall_power')&&['side','cross'].includes(kind)?1.18:1);
  a.vx-=nx*impulse*invA;a.vz-=nz*impulse*invA;b.vx+=nx*impulse*invB;b.vz+=nz*impulse*invB;
  const shieldA=1-clamp(pa.mechanics.contactShield||0,-.4,.8),shieldB=1-clamp(pb.mechanics.contactShield||0,-.4,.8);
  a.yawRate-=clamp(sa*(Math.cos(a.heading)*nz-Math.sin(a.heading)*nx)*impulse*rule.yaw,-.38,.38)*shieldA;
  b.yawRate+=clamp(sb*(Math.cos(b.heading)*nz-Math.sin(b.heading)*nx)*impulse*rule.yaw,-.38,.38)*shieldB;
  a.stress=clamp(a.stress+contactStress(a,pa,impulse,speedA)*shieldA*rule.stress,0,3.2);b.stress=clamp(b.stress+contactStress(b,pb,impulse,speedB)*shieldB*rule.stress,0,3.2);
  a.metrics.contactImpulse+=impulse;b.metrics.contactImpulse+=impulse;
  if(d.elapsed>=Math.max(a.cooldownContact,b.cooldownContact)){
    a.metrics.contacts++;b.metrics.contacts++;a.cooldownContact=b.cooldownContact=d.elapsed+.8;
    a.vx*=rule.retain;a.vz*=rule.retain;b.vx*=rule.retain;b.vz*=rule.retain;
    addEvent(d,{kind:'contact',contactType:kind,athleteId:a.id,otherId:b.id,phase:a.phase,impulse});
    if(a.isPlayer||b.isPlayer)log(d,a.frame+'号艇と'+b.frame+'号艇：'+rule.label+'。進路と艇速が変わる。','warning',a.isPlayer?a.id:b.id);
  }
  constrain(d,a);constrain(d,b);return true;
}
function contactStress(b,p,impulse,speed=Math.hypot(b.vx,b.vz)){
  const turning=clamp(Math.abs(b.yawRate)*2,0,1);
  const highSpeed=clamp((speed/p.topSpeed-.68)/.32,0,1),weakness=1-clamp(p.stats.power,0,110)/140;
  return impulse*(.022+turning*highSpeed*weakness*.085)*(1-p.safety*.55);
}
function turnDanger(b,p,wetGrip){
  const load=Math.abs(b.yawRate)*b.speed/Math.max(1,wetGrip),power=clamp(p.stats.power,0,125);
  const excess=Math.max(0,load-(1.08+power*.003+p.safety*.25));
  return excess*Math.max(0,(b.speed-7)/12)*(1-p.safety*.65)*(1.18-power*.004);
}
// Role/identity, never a high stat alone, grants the three specified opponents their exception.
const earlyStart=b=>!b.isPlayer&&((b.id==='cast_kagura'&&b.castId==='kagura'&&b.castRole==='boss')||(b.id==='cast_teiou'&&b.castRole==='king')||b.racePersona==='rival_final');
const startAllowance=b=>earlyStart(b)?.30:.20*clamp(Number(b.stats?.start)||0,0,100)/100;
function holdStartLine(b){if(b.startTime!==null)return;b.startLane=Number.isFinite(b.startLane)?b.startLane:clamp(b.z,C.inner+.1,C.outer-.1);b.z=b.startLane;b.heading=b.yawRate=b.steer=b.vz=b.heel=b.slip=0;}
// Closed-loop throttle: predict with the same integrator and solve the first input.
// No clock/position warp or retrospective forgiveness is used to hit the target.
function eliteThrottle(d,b,p,dt){
 const remaining=startAt(d)-.30+1e-6-(d.elapsed-dt),left=pointAt(C.start).x-b.x-3.5;
 if(remaining<=0||left<=0)return 1;
 const travel=first=>{let time=0,v=b.vx,engine=b.engine,distance=0;
  while(time<remaining-1e-9){const q=forwardStep(v,engine,time===0?first:1,p,dt,true),step=Math.min(dt,remaining-time);distance+=q.speed*step;v=q.speed;engine=q.engine;time+=step;}return distance;};
 if(travel(0)>=left)return 0;if(travel(1)<=left)return 1;
 let lo=0,hi=1;for(let i=0;i<22;i++){const mid=(lo+hi)/2;if(travel(mid)>left)hi=mid;else lo=mid;}return (lo+hi)/2;
}
function startCrossing(d,b,previousX,dt){
  if(b.startTime!==null||b.startFault||!activeBoat(b))return;
  const gx=pointAt(C.start).x,bow=b.x+Math.cos(b.heading)*3.5;
  if(previousX<gx&&bow>=gx&&b.z>=C.inner&&b.z<=C.outer){
    const fraction=clamp((gx-previousX)/Math.max(.00001,bow-previousX),0,1);
    b.startTime=raceTime(d)-dt+dt*fraction;
    if(Math.abs(b.startTime)<1e-7)b.startTime=0;
    if(b.startTime < -startAllowance(b)-1e-7){b.startFault='F';b.dnf=true;}
    else if(b.startTime>=C.lateLimit-1e-7){b.startFault='L';b.dnf=true;}
    if(b.startFault){b.vx=b.vz=b.speed=0;addEvent(d,{kind:'start',athleteId:b.id,phase:0,fault:b.startFault,st:b.startTime});log(d,b.frame+'号艇 '+(b.startFault==='F'?'フライング':'出遅れ')+'（'+b.startFault+'）。このレースの賞金・ポイントは0。','warning',b.id);}
    else{addEvent(d,{kind:'start',athleteId:b.id,phase:0,fault:null,st:b.startTime});log(d,b.frame+'号艇 '+(earlyStart(b)?'先駆 ST ':'ST ')+startText(b.startTime)+'。'+(b.course>=4?'ダッシュから1マークへ。':'助走を合わせた。'),'phase',b.id);}
  }else if(raceTime(d)>=C.lateLimit-1e-7){b.startFault='L';b.dnf=true;b.vx=b.vz=b.speed=0;log(d,b.frame+'号艇、1.5秒未満にスタートできず出遅れ（L）。','warning',b.id);}
}
// Trigger from sustained player/NPC inputs, once per ability per lap, using the saved RNG.
function operationSkills(d,b,input,dt){
 if(b.startTime===null)return;
 const lap=Math.min(3,1+Math.floor(Math.max(0,b.progress)/C.length)),phase=phaseAt(b.progress);
 const op=b.operation||(b.operation={used:[],feather:0,straighten:0,wakeAt:0,wakeHeading:0});
 const turning=[1,3].includes(phase),exit=[2,4].includes(phase)&&Number.isFinite(b.turnExitAt)&&d.elapsed-b.turnExitAt<4;
 op.feather=turning&&input.throttle<.2&&Math.abs(b.steer)>.2?op.feather+dt:0;
 op.straighten=exit&&input.throttle>.98&&Math.abs(b.steer)<.15?op.straighten+dt:0;
 if(b.wakeLoad>.15){op.wakeAt=d.elapsed;op.wakeHeading=b.heading;}
 for(const id of b.skills){const a=D.abilityMap[id];if(a.type!=='operation')continue;const token=id+':'+lap;if(op.used.includes(token))continue;
 const met=id==='feather'?op.feather>=.4:id==='straighten'?op.straighten>=.4:op.wakeAt>0&&d.elapsed-op.wakeAt<2&&b.wakeLoad<.04&&Math.abs(wrap(b.heading-op.wakeHeading))>.06;
 if(!met)continue;op.used.push(token);if(random(d)>=a.chance)continue;
 activate(d,b,id);b.effects.push({id,stats:clone(a.effect.stats),safety:0,until:d.elapsed+(id==='feather'?2:id==='straighten'?3:4),source:b.id,kind:'operation',mechanics:clone(a.drive.mechanics)});
 log(d,b.frame+'号艇「'+a.name+'」操作が決まった。','ability',b.id);
 }
}
function contactType(a,b,hit){
 const alignment=Math.cos(wrap(a.heading-b.heading));
 if(alignment<-.55)return 'head';
 const longitudinal=Math.abs(hit.nx*Math.cos(a.heading)+hit.nz*Math.sin(a.heading));
 return alignment>.55&&longitudinal>.65?'rear':'side';
}
const CONTACT={side:{restitution:1.04,yaw:.065,stress:.8,retain:.98,label:'横の押し合い'},rear:{restitution:1.08,yaw:.025,stress:1,retain:.94,label:'追突'},head:{restitution:1.18,yaw:.04,stress:1.3,retain:.88,label:'正面・対向接触'}};
function spectatorPace(d){return {important:false,label:'高速進行',ticks:180};}
// Resolve the visible bow crossing, using the same gate as the renderers and start.
function finishCrossing(d,b,previousX,dt=DT){
 if(!activeBoat(b)||b.startTime===null||b.checkpoints<23||b.progress<C.goal-C.length/8)return false;
 const line=pointAt(C.start).x,bow=b.x+Math.cos(b.heading)*3.5;
 if(previousX>=line||bow<line||b.z<C.inner||b.z>C.outer)return false;
 const fraction=clamp((line-previousX)/Math.max(.00001,bow-previousX),0,1);
 b.finishTime=Math.max(0,raceTime(d)-dt+dt*fraction);b.runoutDistance=0;b.progress=C.goal;b.checkpoints=24;
 log(d,b.frame+'号艇 '+b.name+'、ゴール。','goal',b.id);return true;
}
function runOut(b,dt){
  // Finish time, checkpoints and progress are sealed; only the visible pose moves.
  b.runoutDistance=(b.runoutDistance||0)+b.speed*dt;
  const pos=project(b.x,b.z),lane=clamp(pos.radial+(C.outer-5-pos.radial)*dt*.5,C.inner+4,C.outer-3),ahead=pointAt(pos.s+Math.max(7,b.speed*.6),lane);
  const aim=Math.atan2(ahead.z-b.z,ahead.x-b.x);b.heading=wrap(b.heading+clamp(wrap(aim-b.heading),-.8*dt,.8*dt));b.speed+=(Math.min(18,b.speed)-b.speed)*dt*.3;
  b.vx=Math.cos(b.heading)*b.speed;b.vz=Math.sin(b.heading)*b.speed;b.x+=b.vx*dt;b.z+=b.vz*dt;b.heel*=Math.exp(-dt*2);b.yawRate*=Math.exp(-dt*2);
 }
function integrate(d,b,r,input,dt){
  if(b.finishTime!==null&&!b.dnf&&!b.capsized){runOut(b,dt);return;}
  if(!activeBoat(b))return;
  const startLocked=b.startTime===null;holdStartLine(b);
  movePosture(b,Number.isFinite(input.posture)?input.posture:(b.postureTarget||0),dt);
  b.phase=phaseAt(b.progress);b.throttle=clamp(Number(input.throttle)||0,0,1);updateSignatures(d,b,r,input);
  enterZone(d,b,r);operationSkills(d,b,input,dt);const p=performance(b,d,r),s=p.stats;
  b.synergyUsed=b.synergyUsed||[];for(const id of p.synergy){if(!b.synergyUsed.includes(id)){b.synergyUsed.push(id);if(b.isPlayer)log(d,'連携「'+D.synergies.find(x=>x.id===id).name+'」が走りを支える。','ability',b.id);}}
  b.effects=b.effects.filter(e=>e.until>d.elapsed);
  const steer=startLocked?0:clamp(Number(input.steer)||0,-1,1);let throttle=clamp(Number(input.throttle)||0,0,1);
  if(d.elapsed<b.penaltyUntil){b.vx=b.vz=b.speed=0;return;}

  const wake=startLocked?{strength:0,side:0}:sampleWake(d,b);b.wakeLoad=wake.strength*(1-p.wakeResistance);
  const instability=tiltInstability(b,p),steering=steeringLimits(b,p);
  b.steer=moveSteering(b.steer,steer,steering,dt);b.throttle=throttle;
  const speed=Math.hypot(b.vx,b.vz),factor=clamp(speed/8,.10,1.1)/(1+speed*speed/1100);
  const rudder=clamp(.42+b.engine*.68,.42,1.1);
  const yawTarget=(d.elapsed<(b.recoveryUntil||0)?0:b.steer)*p.yawMax*factor*rudder*(1-instability*.6);
  const wobble=(Math.sin(d.elapsed*1.8+b.x*.03+b.frame)*p.wave*.095+wake.side*b.wakeLoad*.18)*clamp(speed/8,0,1);
  b.yawRate+=(yawTarget+wobble-b.yawRate)*(1-Math.exp(-(1.1+s.turn*.025+p.safety*1.6)*dt));
  b.heading=wrap(b.heading+b.yawRate*dt);if(startLocked){b.heading=0;b.yawRate=0;b.steer=0;}
  const fx=Math.cos(b.heading),fz=Math.sin(b.heading),rx=-fz,rz=fx;
  let forward=b.vx*fx+b.vz*fz,lateral=b.vx*rx+b.vz*rz;
  const wind=r.env.wind==='向かい風'?-r.env.windSpeed*.065:r.env.wind==='追い風'?r.env.windSpeed*.065:0;
  const speedLimit=p.topSpeed+wind,launch=b.startTime===null||raceTime(d)<3,oldEngine=b.engine;
  if(startLocked&&earlyStart(b)){throttle=eliteThrottle(d,b,{...p,topSpeed:speedLimit},dt);b.throttle=throttle;b.startAim=-.30;}
  const q=forwardStep(forward,oldEngine,throttle,{...p,topSpeed:speedLimit},dt,launch);
  forward=q.speed;b.engine=q.engine;
  // At high yaw load the hull planes sideways; releasing throttle reduces speed but retains inertia.
  const slideLoad=clamp(Math.pow(speed/20,2)*.20*(1-clamp(s.turn,0,125)/180)*(1-p.pivot),0,.30);
  const wetGrip=p.grip*(1-Math.min(.26,b.wakeLoad*.19))*(1-slideLoad)*(1-instability*.45);
  const lateralForce=clamp(-lateral*p.lateralDamping,-wetGrip,wetGrip);
  const waveForce=Math.sin(d.elapsed*1.3+b.x*.065+b.z*.037)*p.wave*.65+wake.side*b.wakeLoad*1.7;
  lateral+=(lateralForce+waveForce)*dt;
  if(r.env.wind==='横風')lateral+=r.env.windSpeed*.05*(1-clamp(s.power,0,120)/150)*dt;
  if(startLocked)lateral=0;
  forward=Math.max(0,forward-(Math.abs(lateral)*.08+b.wakeLoad*.34)*dt);
  if(throttle>=.98){
    // Restore turning drag with thrust, NOT by aligning velocity with the bow.
    // Sideways inertia survives. Impacts still lose speed; recovery uses normal acceleration.
    const driven=forwardStep(speed,oldEngine,throttle,{...p,topSpeed:speedLimit},dt,launch).speed;
    const held=Math.max(Math.min(speed,speedLimit),driven);
    forward=Math.max(forward,Math.sqrt(Math.max(0,held*held-lateral*lateral)));
  }
  const radial=project(b.x,b.z),outward=instability*2.5*dt;
  b.vx=fx*forward+rx*lateral+outward*(b.x-radial.cx)/Math.max(1,radial.radial);
  b.vz=fz*forward+rz*lateral+outward*b.z/Math.max(1,radial.radial);b.x+=b.vx*dt;b.z+=b.vz*dt;
  b.speed=Math.hypot(b.vx,b.vz);b.slip=Math.abs(lateral);
  const danger=turnDanger(b,p,wetGrip);
  b.stress=clamp(b.stress+(danger*.60+b.wakeLoad*.045-.18)*dt,0,3.2);
  b.heel+=(clamp(-b.yawRate*b.speed*.032+wake.side*b.wakeLoad*.09,-.44,.44)-b.heel)*(1-Math.exp(-3*dt));
  b.stamina=clamp(b.stamina-(.12+throttle*.28+Math.abs(b.steer)*.17+b.wakeLoad*.14)*(1-clamp(s.power,0,125)/180)*(1-clamp(p.mechanics.economy||0,-.4,.65))*dt,0,100);
  if(b.startTime!==null&&b.speed>5){
    const turnPhase=[1,3].includes(b.phase),v=b.posture||0;
    if(turnPhase&&v<-.35)b.metrics.lowTurnSeconds=(b.metrics.lowTurnSeconds||0)+dt;
    if(!turnPhase&&v>.35)b.metrics.highStraightSeconds=(b.metrics.highStraightSeconds||0)+dt;
    if(turnPhase&&v>.35||!turnPhase&&v<-.35)b.metrics.postureGoodSeconds=(b.metrics.postureGoodSeconds||0)+dt;
  }
  b.metrics.maxSpeed=Math.max(b.metrics.maxSpeed,b.speed);if(b.slip>2)b.metrics.slideSeconds+=dt;
  if(b.wakeLoad>.08)b.metrics.wakeSeconds+=dt;b.metrics.throttleSeconds+=throttle*dt;b.metrics.coastSeconds+=(1-throttle)*dt;
  if(b.phase===1||b.phase===3){b.metrics.turnSpeedSum+=b.speed;b.metrics.turnSamples++;}
  const touched=constrain(d,b);b.speed=Math.hypot(b.vx,b.vz);Craft.observe(d,b,r,dt);
  const tangent=pointAt(project(b.x,b.z).s,project(b.x,b.z).radial).heading;
  const movingAlong=Math.abs(b.vx*Math.cos(tangent)+b.vz*Math.sin(tangent));
  const stuck=Number.isFinite(b.boundaryAt)&&d.elapsed-b.boundaryAt<.20&&movingAlong<2.2;
  b.boundaryStall=stuck?Math.min(10,(b.boundaryStall||0)+dt):0;
  if(canQuickRecover(d,b))quickRecover(d,b);
  if(b.stress>=2.8){b.capsized=true;b.vx=b.vz=b.speed=0;activateCapsize(d,b);return;}
  const projected=project(b.x,b.z),delta=mod(projected.s-b.lastS+C.length/2,C.length)-C.length/2;
  // A boundary projection cannot award distance; intermediate checkpoints must be crossed in order.
  if(!touched&&Math.abs(delta)<=Math.max(2,dt*60)){
    const previous=b.progress;b.progress+=delta;
    while(b.progress>=(b.checkpoints+1)*C.length/8-1e-6&&b.checkpoints<8*C.laps)b.checkpoints++;
  }
  b.lastS=projected.s;
}
function activateCapsize(d,b){addEvent(d,{kind:'capsize',phase:b.phase,athleteId:b.id,frame:b.frame});log(d,b.frame+'号艇 '+b.name+'、艇が大きく傾き転覆。','capsize',b.id);}
function tick(d,r,input,dt=DT,allAI=false){
  if(d.finished||d.paused)return false;
  if(Math.abs(dt-DT)>.000001)throw Error('Drive tick requires fixed 1/60s');
  d.frame++;d.elapsed+=dt;d.countdown=Math.max(0,startAt(d)-d.elapsed);
  if(!d.started&&d.countdown<1e-8){d.countdown=0;d.started=true;log(d,'時計が頂点。1.5秒未満にラインを通過しよう。','phase');}
  d.controls={steer:clamp(Number(input&&input.steer)||0,-1,1),throttle:clamp(Number(input&&input.throttle)||0,0,1),posture:postureStep(Number.isFinite(input?.posture)?input.posture:(own(d).postureTarget||0))};
  // All decisions see the same positions; no NPC bypasses the water physics or collisions.
  d.boats.forEach(holdStartLine);
  const previousBows=d.boats.map(b=>b.x+Math.cos(b.heading)*3.5);
  const commands=d.boats.map(b=>b.isPlayer&&!allAI?d.controls:pilot(d,b,r));
  d.boats.forEach((b,i)=>integrate(d,b,r,commands[i],dt));
  for(let i=0;i<d.boats.length;i++)for(let j=i+1;j<d.boats.length;j++)if(d.boats[i].startTime!==null&&d.boats[j].startTime!==null)contact(d,d.boats[i],d.boats[j],r);
  d.boats.forEach((b,i)=>{startCrossing(d,b,previousBows[i],dt);finishCrossing(d,b,previousBows[i],dt);});
  d.wakeClock+=dt;
  if(d.wakeClock>=.35){d.wakeClock-=.35;d.wakes=d.wakes.filter(w=>d.elapsed-w.t<5);
    for(const b of d.boats)if(activeBoat(b)&&b.speed>3){const p=performance(b,d,r);d.wakes.push({owner:b.id,x:b.x-Math.cos(b.heading)*2,z:b.z-Math.sin(b.heading)*2,fx:Math.cos(b.heading),fz:Math.sin(b.heading),t:d.elapsed,strength:clamp(b.speed/20*(1+(p.mechanics.wakeEmit||0)),.1,2)});}
    if(d.wakes.length>96)d.wakes.splice(0,d.wakes.length-96);
  }
  const leader=ranks(d)[0];if(leader.id!==d.lastAnnouncedLeader&&raceTime(d)>3){d.lastAnnouncedLeader=leader.id;log(d,leader.frame+'号艇 '+leader.name+'が先頭。','lead',leader.id);}
  if(raceTime(d)>=C.timeLimit){d.boats.forEach(b=>{if(activeBoat(b)){b.dnf=true;b.vx=b.vz=b.speed=0;}});log(d,'制限時間。未完走の艇はリタイア。','warning');}
  const player=own(d),afterGoal=player.finishTime!==null&&raceTime(d)-player.finishTime>=2.2;
  const lastFinish=Math.max(-99,...d.boats.filter(b=>b.finishTime!==null).map(b=>b.finishTime));
  if(raceTime(d)>=C.timeLimit||(allAI?d.boats.every(b=>!activeBoat(b))&&(lastFinish===-99||raceTime(d)-lastFinish>=2.2):player.dnf||player.capsized||afterGoal))d.finished=true;
  recordReplay(d,d.finished||d.boats.some(b=>b.finishTime!==null&&Math.abs(b.finishTime-raceTime(d))<=DT+.00001));
  return true;
}
// A stalled hull is turned outward in place. No teleport, distance credit or stop penalty.
function canQuickRecover(d,b=own(d)){return !d.finished&&activeBoat(b)&&!b.startFault&&typeof b.boundaryInner==='boolean'&&d.elapsed>=(b.recoveryUntil||0)&&(b.boundaryStall||0)>=.65-1e-7;}
function quickRecover(d,b=own(d)){
  if(!canQuickRecover(d,b))return false;
  const p=project(b.x,b.z),tangent=pointAt(p.s,p.radial).heading;
  // Counterclockwise course: the right of the tangent points away from the inner barrier.
  b.heading=wrap(tangent+(b.boundaryInner?.55:-.55));b.yawRate=0;b.steer=0;
  const retained=Math.hypot(b.vx,b.vz);b.vx=Math.cos(b.heading)*retained;b.vz=Math.sin(b.heading)*retained;
  b.boundaryStall=0;b.recoveryUntil=d.elapsed+.9;
  b.metrics.rescues++;log(d,b.frame+'号艇、ブイから離れる向きに自動復帰。','warning',b.id);return true;
}
function rescue(d){const b=own(d);if(b.startTime===null||d.finished||!activeBoat(b))return false;
  const p=pointAt(C.start+b.progress,C.inner+8);b.x=p.x;b.z=p.z;b.heading=p.heading;b.lastS=mod(C.start+b.progress,C.length);b.vx=b.vz=b.yawRate=b.speed=b.engine=0;b.steer=0;b.stress=0;
  b.penaltyUntil=d.elapsed+4;b.metrics.rescues++;log(d,'姿勢を立て直す。4秒停止して再発進。','warning',b.id);return true;
}
function finishOthers(d,r){
  const originalPaused=d.paused;d.paused=false;d.finished=false;let count=0;
  while(!d.finished&&count++<60*(C.timeLimit+C.prestart+1))tick(d,r,{},DT,true);
  d.finished=true;d.paused=originalPaused;return ranks(d);
}
function runAI(r,seed,maxSeconds=C.timeLimit){const d=create(r,seed);d.paused=false;let count=0;while(!d.finished&&count++<(maxSeconds+C.prestart+1)*60)tick(d,r,null,DT,true);return d;}

function valid(d,r){
  const finite=(v,lo,hi)=>Number.isFinite(v)&&v>=lo&&v<=hi;
  if(!d||d.version!==2||('startAt' in d&&![10,12].includes(d.startAt))||!Number.isInteger(d.seed)||d.seed<0||d.seed>4294967295||!Number.isInteger(d.frame)||d.frame<0||d.frame>18000||!finite(d.elapsed,0,283)||!finite(d.countdown,0,C.prestart)||!['paused','finished','started','finalized'].every(k=>typeof d[k]==='boolean')||!Array.isArray(d.boats)||d.boats.length!==6||d.laps!==C.laps||d.goal!==C.goal)return false;
  if(!Array.isArray(d.wakes)||d.wakes.length>96||!finite(d.wakeClock,0,.36)||!d.wakes.every(w=>finite(w.x,-500,500)&&finite(w.z,-500,500)&&finite(w.fx,-1.01,1.01)&&finite(w.fz,-1.01,1.01)&&finite(w.t,0,283)&&finite(w.strength,0,2)&&d.boats.some(b=>b.id===w.owner)))return false;
  if(d.replay&&!validReplay(d.replay))return false; if(r.done!==d.finalized||r.done&&!d.finished)return false;
  const ids=new Set(r.runners.map(n=>n.id)),controls=d.controls;
  if(!controls||!finite(controls.steer,-1,1)||!finite(controls.throttle,0,1)||('posture' in controls&&!finite(controls.posture,-1,1))||new Set(d.boats.map(b=>b.id)).size!==6||!d.boats.every(b=>ids.has(b.id))||new Set(d.boats.map(b=>b.course)).size!==6)return false;
  const active=e=>e&&D.abilityMap[e.abilityId]&&Number.isInteger(e.frame)&&e.frame>=1&&e.frame<=6&&Number.isInteger(e.phase)&&e.phase>=0&&e.phase<=4&&typeof e.name==='string'&&e.name.length<=30&&ids.has(e.athleteId);
  const event=e=>e&&Number.isInteger(e.index)&&finite(e.t,0,283)&&['ability','debuff','capsize','start','contact'].includes(e.kind)&&(e.kind==='ability'?active(e):e.kind==='debuff'?D.abilityMap[e.abilityId]&&(!e.defenseId||D.abilityMap[e.defenseId])&&ids.has(e.from)&&ids.has(e.to)&&D.statKeys.includes(e.stat)&&finite(e.amount,0,10000)&&finite(e.reflected,0,10000):ids.has(e.athleteId));
  if(!Array.isArray(d.events)||d.events.length>180||!d.events.every(event)||!Array.isArray(d.logs)||d.logs.length>80||!d.logs.every(l=>typeof l.text==='string'&&l.text.length<2000&&finite(l.time,0,283))||!Number.isInteger(d.eventSequence)||d.eventSequence<0)return false;
  return d.boats.every(b=>{const original=r.runners.find(n=>n.id===b.id);return (!b.racePersona||b.racePersona===original.racePersona)&&(!b.castId||b.castId===original.castId)&&(!b.castRole||b.castRole===original.castRole)&&b.name===original.name&&b.frame===original.frame&&b.isPlayer===original.isPlayer&&Number.isInteger(b.course)&&b.course>=1&&b.course<=6&&
    (!('runoutDistance' in b)||finite(b.runoutDistance,0,8000))&&
    (['posture','postureTarget'].every(k=>!(k in b)||finite(b[k],-1,1)))&&
    (['lowTurnSeconds','highStraightSeconds','postureGoodSeconds'].every(k=>!(k in (b.metrics||{}))||finite(b.metrics[k],0,300)))&&
    (!('boundaryInner' in b)||typeof b.boundaryInner==='boolean')&&
    (['boundaryAt','boundaryStall','recoveryUntil','turnExitAt'].every(k=>!(k in b)||finite(b[k],0,k==='boundaryStall'?10:300)))&&
    (!b.synergyUsed||(Array.isArray(b.synergyUsed)&&b.synergyUsed.length<=D.synergies.length&&b.synergyUsed.every(id=>D.synergies.some(x=>x.id===id))))&&
    (!b.operation||(Array.isArray(b.operation.used)&&b.operation.used.length<=9&&b.operation.used.every(x=>/^(feather|straighten|wake_escape):[123]$/.test(x))&&['feather','straighten','wakeAt'].every(k=>finite(b.operation[k],0,300))&&finite(b.operation.wakeHeading,-4,4)))&&
    (!b.signature||(Number.isInteger(b.signature.lap)&&b.signature.lap>=0&&b.signature.lap<=3&&Array.isArray(b.signature.monkeyZones)&&b.signature.monkeyZones.length<=6&&b.signature.monkeyZones.every(z=>/^[123]:[13]$/.test(z))))&&
    ['x','z','vx','vz','heading','yawRate','speed','progress','lastS','stamina','stress','heel','slip','lane','reaction','penaltyUntil','cooldownContact','cooldownBoundary','aiBias','steer','throttle','engine','itemBoost','wakeLoad','aiLane','nextPlan','startAim','startRoll'].every(k=>Number.isFinite(b[k]))&&Math.abs(b.x)<500&&Math.abs(b.z)<500&&Math.abs(b.vx)<100&&Math.abs(b.vz)<100&&Math.abs(b.progress)<C.goal+1000&&Number.isInteger(b.phase)&&b.phase>=0&&b.phase<=4&&Number.isInteger(b.checkpoints)&&b.checkpoints>=0&&b.checkpoints<=C.laps*8&&typeof b.capsized==='boolean'&&typeof b.dnf==='boolean'&&(b.finishTime===null||finite(b.finishTime,0,271))&&
    (!('startLane' in b)||finite(b.startLane,C.inner,C.outer))&&(b.startTime===null||finite(b.startTime,-C.prestart,271))&&[null,'F','L'].includes(b.startFault)&&(!b.plan||['front','defend','sashi','outside','cross','clear'].includes(b.plan.id)&&finite(b.plan.lane,C.inner,C.outer)&&finite(b.plan.speed,.1,2))&&(b.lastZone===null||typeof b.lastZone==='string'&&b.lastZone.length<20)&&Array.isArray(b.effects)&&b.effects.length<150&&b.effects.every(e=>D.abilityMap[e.id]&&finite(e.until,0,310)&&finite(e.safety,0,2)&&(!e.mechanics||Object.values(e.mechanics).every(v=>finite(v,-5,5)))&&e.stats&&Object.entries(e.stats).every(([k,v])=>D.statKeys.includes(k)&&finite(v,-10000,10000)))&&Array.isArray(b.activations)&&b.activations.length<=100&&b.activations.every(active)&&Array.isArray(b.interference)&&b.interference.length<600&&Array.isArray(b.phaseHistory)&&b.phaseHistory.length<=24&&b.metrics&&Craft.validMetrics(b.metrics.craft)&&['contacts','boundaries','rescues','maxSpeed','slideSeconds','throttleSeconds','coastSeconds','wakeSeconds','lineChanges','contactImpulse','turnSpeedSum','turnSamples'].every(k=>finite(b.metrics[k],0,1e7))&&b.stats&&D.statKeys.every(k=>finite(b.stats[k],0,D.statCeiling(b,k)))&&Array.isArray(b.skills)&&b.skills.every(id=>D.abilityMap[id])&&b.mastery&&Object.values(b.mastery).every(n=>Number.isInteger(n)&&n>0&&n<10000)&&b.statsBuff&&D.statKeys.every(k=>finite(b.statsBuff[k]||0,0,100))&&b.equipment&&['motor','prop','boat'].every(k=>b.equipment[k]&&Object.values(b.equipment[k]).every(v=>finite(v,-100,100)));});
}

const R={C,DT,startTarget,earlyStart,startAllowance,eliteThrottle,holdStartLine,runOut,postureStep,postureTarget,postureEffects,movePosture,requiresManual,racingStyle,recordReplay,validReplay,dramaticRace,tiltInstability,finishCrossing,operationSkills,contactType,CONTACT,spectatorPace,startAt,kmh,speedText,startText,tiltValue,tiltEffects,raceGrade,spectatorAdjustment,buildLinks,synergyState,spectating,canQuickRecover,quickRecover,raceTime,npcPace,bestSignature,updateSignatures,steeringLimits,moveSteering,normalAI,contactStress,turnDanger,forwardStep,launchForecast,startCrossing,sampleWake,hullContacts,contact,constrain,tacticalPlan,driveCondition,create,tick,runAI,finishOthers,rescue,pointAt,project,phaseAt,performance,pilot,ranks,place,own,valid,wrap,clamp,mod,display,gradeValue,equipmentRange,floor};
root.KM_RACING=R;if(typeof module!=='undefined'&&module.exports)module.exports=R;
})(typeof globalThis!=='undefined'?globalThis:window);

