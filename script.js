/* 競艇物語 v85
 * Pure calculation API: KM_ENGINE. Browser UI starts only when document exists.
 * State is serializable. Every random draw consumes the saved seed.
 */
(function (root) {
'use strict';
const D = root.KM_DATA || (typeof require === 'function' ? require('./data.js') : null);
const R = root.KM_RACING || (typeof require === 'function' ? require('./racing.js') : null);
const keys = D.statKeys;
const clone = x => JSON.parse(JSON.stringify(x));
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const round = (x, d=2) => Math.round(x * Math.pow(10,d)) / Math.pow(10,d);
function rand(ctx) { let t = ctx.seed += 0x6D2B79F5; ctx.seed >>>= 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const pick = (c,a) => a[Math.floor(rand(c)*a.length)];
const int = (c,a,b) => a + Math.floor(rand(c)*(b-a+1));
function shuffle(c,a) { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=int(c,0,i);[b[i],b[j]]=[b[j],b[i]];} return b; }
const sum = a => a.reduce((x,y)=>x+y,0);
const zeros = () => Object.fromEntries(keys.map(k=>[k,0]));
const average = a => sum(keys.map(k=>a.stats[k]))/keys.length;
const grade = n => n>=90?'S':n>=80?'A':n>=65?'B':n>=50?'C':n>=35?'D':'E';
function formatMoney(value){
  const numeric=Number(value),units=Number.isFinite(numeric)?Math.trunc(numeric):0,amount=Math.abs(units),oku=Math.floor(amount/10000),man=amount%10000,sign=units<0?'−':'';
  const digits=n=>n.toLocaleString('ja-JP',{maximumFractionDigits:0});
  return sign+(oku?digits(oku)+'億'+(man?digits(man)+'万円':'円'):digits(man)+'万円');
}
const ability = id => D.abilityMap[id];
const rarity = id => D.rarities.indexOf(ability(id).rarity);
const isWeak = id => ability(id).category==='弱点';
const has = (p,id) => p.skills.includes(id);
const uid = c => 'p'+int(c,0,0x7fffffff).toString(36)+int(c,0,0x7fffffff).toString(36);
function growthOf(p){ return D.growth.find(x=>x.id===p.growth) || D.growth[0]; }
function difficulty(p){return D.difficulties[p&&p.difficulty]||D.difficulties.normal;}
function rewardRarity(p,rare){return D.rarities[Math.max(0,D.rarities.indexOf(rare)-difficulty(p).rewardDrop)];}
function rewardSkill(c,p,id){
  if(!id||!difficulty(p).rewardDrop||isWeak(id))return id;
  const a=ability(id),rare=rewardRarity(p,a.rarity),pool=D.abilities.filter(x=>x.rarity===rare&&x.category===a.category&&!isWeak(x.id));
  return pool.length?pick(c,pool).id:randomSkill(c,[rare],p.skills)||randomSkill(c,[rare]);
}
function newState(seed=Date.now()>>>0) {return {version:D.version,build:D.build,seed:seed||127,career:null,registry:[],rivals:[],coins:1000,quick:null,settings:{speed:1},savedAt:null};}
function equipment(c){
  const e={boat:{stability:int(c,40,86),turn:int(c,-2,9),accel:int(c,-2,8)},motor:{speed:int(c,-3,13),accel:int(c,-2,10),condition:int(c,65,98),trait:int(c,0,3)},prop:{turn:int(c,-3,12),accel:int(c,-2,9),condition:int(c,65,98),trait:int(c,0,3)}};
  for(const part of ['motor','prop']){const g=e[part],key=part==='motor'?'speed':'turn';if(g.trait===1){g[key]+=3;g.accel-=1.5;g.condition-=4;}if(g.trait===2){g[key]-=1.5;g.accel+=3;}if(g.trait===3){g[key]-=1;g.accel-=.5;g.condition=Math.min(100,g.condition+5);}}
  return e;
}
function gearTrait(part,gear){return (part==='motor'?['均衡型','伸び型','出足型','安定型']:['均衡型','旋回型','立ち上がり型','安定型'])[gear.trait||0];}
function character(c,name,base=44){
  return {id:uid(c),name:(name||'水瀬 湊').trim().slice(0,16)||'水瀬 湊',stats:Object.fromEntries(keys.map(k=>[k,int(c,base-9,base+9)])),
    adjust:{motorVar:int(c,25,70),motorSuccess:int(c,18,22),propVar:int(c,25,70),propSuccess:int(c,18,22)},
    growth:pick(c,D.growth).id,skills:[],mastery:{},popularity:0,money:0,totalEarnings:0,inventory:{},equipment:null,points:0,finishes:[0,0,0,0,0,0],scoreTotal:0,tie:rand(c)};
}
function randomSkill(c,rarities,excluded=[],weak=false){const pool=D.abilities.filter(a=>(a.category==='弱点')===weak && rarities.includes(a.rarity)&&!excluded.includes(a.id)); return pool.length ? pick(c,pool).id : null;}
function createCareer(s,draft){
  const p=clone(draft);p.difficulty=difficulty(draft).id;p.popularity=0;p.skills=['quick'];p.mastery={};p.money=0;p.totalEarnings=0;
  s.career={player:p,seed:int(s,1,0x7fffffff),stage:0,status:'home',series:null,history:[],shop:null,lastShop:null,
    balance:{last:null,streak:0},stats:{races:0,wins:0,capsizes:0},lastResult:null,ending:null};
  s.quick=null;return s.career;
}
function npc(c,stage,index){
  const tier=D.tiers[stage.tier];const p=character(c,pick(c,D.lastNames)+' '+pick(c,D.firstNames),tier.base+(stage.index%2===1?2:0));
  keys.forEach(k=>p.stats[k]=clamp(p.stats[k]+int(c,-3,3)+(difficulty(c.player).id==='normal'?D.npcGradeStats[stage.tier]:-(tier.base-D.tiers.rookie.base)*(1-D.easyNpcGrowth)),15,98));p.popularity=int(c,0,60+stage.index*20);
  p.id='npc'+index+'_'+uid(c);p.skills=[];
  let count=stage.tier==='sg'?6:stage.index<2?1:stage.index<4?2:stage.index<6?3:4;
  for(let j=0;j<count;j++){const id=randomSkill(c,[rewardRarity(c.player,pick(c,stage.tier==='sg'?D.sgNpcRarities:tier.rare))],p.skills);if(id)p.skills.push(id);}
  if(stage.tier==='sg' && index%5===0){const id=randomSkill(c,[rewardRarity(c.player,'LR')],p.skills);if(id)p.skills.push(id);}
  p.equipment=equipment(c);return p;
}
function growthFactor(p){return difficulty(p).growth*Math.min(1.32,p.skills.reduce((v,id)=>v*(ability(id).type==='growth'?ability(id).effect.multiplier:1),1));}
function generateShop(c,last=false){
  const p=c.player, ranks=last?['R','SR','SSR','UR']:c.stage>=6?['N','R','SR','SSR','UR']:c.stage>=4?['N','R','SR','SSR']:['N','R','SR'];
  const stock=shuffle(c,D.abilities.filter(a=>ranks.includes(a.rarity)&&D.rarities.indexOf(a.rarity)<=D.rarities.indexOf(difficulty(p).shopMax)&&a.category!=='弱点'&&!has(p,a.id))).slice(0,last?5:4).map(a=>({id:a.id,price:Math.ceil(D.prices[a.rarity]*(last?1.35:1)),sold:false}));
  return {stage:c.stage,stock,purchases:0,limit:last?1:2,itemBuys:{}};
}
function roster(c){return [c.player].concat(c.series.npcs);}
function startSeries(s){
  const c=s.career;if(!c||c.status!=='home'||c.stage>8)return false;
  const stage=D.stages[c.stage];if(c.stage===8&&c.player.totalEarnings<D.sgThreshold){c.status='registration';c.ending='gate';c.lastShop=c.lastShop||generateShop(c,true);return false;}
  const p=c.player;p.equipment=equipment(c);p.points=0;p.finishes=[0,0,0,0,0,0];p.scoreTotal=0;p.tie=rand(c);
  const npcs=Array.from({length:19},(_,i)=>npc(c,stage,i));const names=new Set([p.name]);
  npcs.forEach(n=>{if(names.has(n.name))n.name=n.name+'・'+(names.size+1);names.add(n.name);});
  c.series={stage:c.stage,tier:stage.tier,name:stage.name,venue:clone(pick(c,D.venues)),npcs,round:0,finalType:null,ranking:null,
    otherFinals:[],race:null,action:null,startStats:clone(p.stats),startMoney:p.totalEarnings,qualificationRank:null,completed:false};
  c.shop=c.shop&&c.shop.stage===c.stage?c.shop:generateShop(c);
  c.status='seriesIntro';return true;
}
function weather(c,v){const windy=rand(c)<v.roughness;const wind=pick(c,['追い風','向かい風','横風','無風']);return {weather:pick(c,['晴れ','晴れ','曇り','雨']),wind,windSpeed:wind==='無風'?0:int(c,windy?5:0,windy?10:7)};}
function ordered(r){if(r.drive){const ids=R.ranks(r.drive).map(b=>b.id);return ids.map(id=>r.runners.find(n=>n.id===id));}return r.runners.slice().sort((a,b)=>Number(a.capsized)-Number(b.capsized) || (a.capsized&&b.capsized?(b.capsizePhase-a.capsizePhase):b.score-a.score) || a.frame-b.frame);}
function rankIn(r,id){return ordered(r).findIndex(x=>x.id===id)+1;}
function odds(r){
  const weight=r.runners.map(n=>Math.exp((average(n)+n.skills.filter(x=>!isWeak(x)).reduce((v,id)=>v+rarity(id)*1.1,0)+(7-n.course)*1.5+(n.equipment.motor.speed+n.equipment.prop.turn+n.equipment.boat.accel)*.12)/20));
  const total=sum(weight);r.runners.forEach((n,i)=>n.odds=Math.max(1,round(total/weight[i]*.84,1)));
  r.runners.slice().sort((a,b)=>a.odds-b.odds||a.frame-b.frame).forEach((n,i)=>n.favourite=i+1);
}
function makeRace(c,people,venue,env,type='qualifier',playerId=null){
  const runners=shuffle(c,people).map((p,i)=>Object.assign(clone(p),{frame:i+1,course:i+1,score:0,progress:0,previousProgress:0,capsized:false,capsizePhase:null,
    stamina:100,isPlayer:p.id===playerId,strategy:'balanced',phaseHistory:[],activations:[],debuffEvents:[],orders:[]}));
  const r={id:uid(c),type,grade:c.series?.tier||D.stages[c.stage]?.tier||'rookie',venue:clone(venue),env:clone(env),runners,phase:-1,done:false,settled:false,logs:[],events:[],cutins:[],instructions:[],result:null,
    buff:zeros(),itemBoost:0,usedItems:{},strategy:'balanced',tilt:0,prepVersion:87,auto:false,difficulty:difficulty(c.player||people.find(p=>p.id===playerId)).id};
  odds(r);return r;
}
function simulate(c,r){while(!r.done)advance(c,r,null);return r;}
function addLog(r,text,kind='normal',id=null){r.logs.push({phase:r.phase,text,kind,id});if(r.logs.length>80)r.logs.splice(0,r.logs.length-80);}
function standing(c){return roster(c).slice().sort((a,b)=>b.points-a.points || b.finishes.map((v,i)=>v-a.finishes[i]).find(v=>v!==0) || a.tie-b.tie);}
function applyNPCResult(c,r,qualifier){
  ordered(r).forEach((n,i)=>{const p=roster(c).find(x=>x.id===n.id);if(!p||p.id===c.player.id)return;
    if(qualifier){p.points+=(n.capsized||n.dnf)?0:D.points[i];p.finishes[i]++;p.scoreTotal+=n.score;}
    const money=(n.capsized||n.dnf)?0:round(D.prizes[r.type][i]*D.tiers[c.series.tier].prize,1);p.money+=money;p.totalEarnings+=money;
    p.popularity+=Math.max(0,4-i);
  });
}
function shadowQualifiers(c,mainIds){
  const remaining=shuffle(c,roster(c).filter(p=>!mainIds.includes(p.id)));
  while(remaining.length){const group=remaining.splice(0,6);let guest=0;
    while(group.length<6){const n=npc(c,D.stages[c.stage],80+guest++);n.name='補充艇';group.push(n);}
    const r=makeRace(c,group,c.series.venue,weather(c,c.series.venue),'qualifier');simulate(c,r);applyNPCResult(c,r,true);
  }
}
function invited(s,c,people){
  if(c.stage!==8)return people;
  const group=people.slice(),used=new Set(group.map(x=>x.id));
  const pools=[s.registry,s.rivals];let slot=group.length-1;
  pools.forEach((pool,type)=>{const valid=pool.filter(p=>p.id!==c.player.id&&!used.has(p.id)&&p.skills.some(id=>rarity(id)>=2&&!isWeak(id))); if(!valid.length)return;
    while(slot>=0&&group[slot].id===c.player.id)slot--;if(slot<0)return;
    const n=clone(pick(c,valid));n.special=true;n.specialType=type===0?'registered':'rival';n.sourceId=n.id;
    n.equipment=equipment(c);n.mastery=n.mastery||{};used.add(n.id);group[slot--]=n;
  });return group;
}
function prepareRace(s){
  const c=s.career;if(!c||!c.series||!['seriesIntro','between'].includes(c.status))return false;
  const ser=c.series;let people,type;
  if(ser.round<5){people=[c.player].concat(shuffle(c,ser.npcs).slice(0,5));type='qualifier';}
  else {
    const ranked=standing(c);ser.ranking=ranked.map(p=>p.id);ser.qualificationRank=ranked.findIndex(p=>p.id===c.player.id)+1;
    if(ser.qualificationRank<=6){people=invited(s,c,ranked.slice(0,6));type='championship';}
    else if(ser.qualificationRank<=12){people=ranked.slice(6,12);type='consolation';}
    else {ser.finalType='eliminated';simulateOtherFinals(s,c,null);finishSeries(s);return true;}
    ser.finalType=type;simulateOtherFinals(s,c,type);
  }
  const r=makeRace(c,people,ser.venue,weather(c,ser.venue),type,c.player.id);ser.race=r;
  ser.action={normal:0,training:1,tune:1,actionVersion:88,baseActions:{training:1,tune:1},trainingMode:'focus',halfActions:{training:0,tune:0},logs:[],debug:[],extras:[],extrasNotified:false};
  c.player.skills.forEach(id=>{const a=ability(id);if(a.type==='extra'&&rand(c)<a.chance){ser.action[a.effect.action]++;ser.action.halfActions[a.effect.action]++;ser.action.extras.push(id);ser.action.logs.push(a.name+'：'+(a.effect.action==='tune'?'調整':'練習')+'を1回追加（成長・効果50%）');}});
  c.status='action';return true;
}
function simulateOtherFinals(s,c,playerType){
  const ranked=standing(c);['championship','consolation'].forEach((type,i)=>{
    if(type===playerType)return;let group=ranked.slice(i*6,i*6+6);if(type==='championship')group=invited(s,c,group);
    const r=makeRace(c,group,c.series.venue,weather(c,c.series.venue),type);simulate(c,r);applyNPCResult(c,r,false);
    c.series.otherFinals.push({type,names:ordered(r).map(n=>n.name)});
  });
}
function consumeAction(c,kind){
  const a=c.series.action;a.effectScale=1;
  if(a.normal>0){a.normal--;return true;}
  if(a[kind]>0){a[kind]--;if(a.baseActions&&a.baseActions[kind]>0){a.baseActions[kind]--;}else if(a.halfActions&&a.halfActions[kind]>0){a.halfActions[kind]--;a.effectScale=.5;}return true;}
  return false;
}
// Only developed high stats taper. At SG, 90+ grows at 20%; a neglected stat still grows fully.
function statGrowthRate(value){return value>=90?.2:value>=80?.5:value>=65?.7:value>=50?.8:value>=35?.9:1;}
function lateGrowthFactor(c,key){return statGrowthRate(c.player.stats[key]);}
function trainingHint(p,key,mode){
 const suited=mode==='foundation'?p.stats[key]<average(p):growthOf(p).values[key]>1;
 return suited?(mode==='foundation'?'苦手補強におすすめ':'得意伸ばしにおすすめ'):'';
}
function trainingFactor(p,key,mode){
 const g=growthOf(p).values[key];
 if(mode==='foundation')return p.stats[key]<average(p)?1.30:.80;
 return g*1.10;
}
function prepBonus(c,key,scale){
  const action=c.series.action;if(action.prepRolled)return null;action.prepRolled=true;
  const skill=c.player.skills.map(ability).filter(a=>a.type==='prep').sort((a,b)=>D.rarities.indexOf(b.rarity)-D.rarities.indexOf(a.rarity))[0];
  if(!skill||rand(c)>=skill.chance)return null;
  const amount=skill.effect.amount*scale;c.series.race.buff[key]+=amount;
  const notice=skill.name+' 発動：次の1レースだけ'+D.stats[key]+'＋'+R.floor(amount)+(amount%1?'（端数も保持）':'');
  action.logs.push(notice);action.prepEvent={abilityId:skill.id,key,amount};return action.prepEvent;
}
function takeExtraNotice(a){
  if(a.extrasNotified||!a.extras.length)return null;
  a.extrasNotified=true;return a.extras.map(id=>{const x=ability(id);return x.name+' 発動！'+(x.effect.action==='tune'?'調整':'練習')+' ＋1回（成長・効果50%）';}).join(' / ');
}
function growStat(p,key,amount){const before=p.stats[key];p.stats[key]=round(clamp(before+amount,0,100));return round(p.stats[key]-before);}
function train(c,key,mode='focus'){
  if(c.status!=='action'||!keys.includes(key)||!['focus','foundation'].includes(mode)||!consumeAction(c,'training'))return null;
  const p=c.player,scale=c.stage===8?1:D.nonSG.trainingGrowth;
  const amount=(2.3+rand(c)*.5)*1.5*scale*trainingFactor(p,key,mode)*growthFactor(p)*lateGrowthFactor(c,key)*c.series.action.effectScale;
  const previous=p.stats[key],gain=growStat(p,key,amount),visibleGain=R.floor(p.stats[key])-R.floor(previous);c.balance={last:null,streak:0};
  const prep=prepBonus(c,key,c.series.action.effectScale);
  const text=D.stats[key]+'練習：＋'+visibleGain+' → '+R.display(p.stats[key])+(visibleGain===0?'（端数を蓄積）':'');c.series.action.logs.push(text);
  syncPlayerSnapshot(c);return {key,gain,text,prep};
}
function tuningChance(p,target){const base=Math.min(70,p.adjust[target+'Success'])/100,bonus=p.skills.reduce((v,id)=>v+(ability(id).type==='tuning'?ability(id).effect.success/100:0),0);return clamp(base+bonus,.05,.92);}
function tuningLearning(value){return value>=70?0:value>=60?.18:value>=50?.45:1;}
function tuningOutlook(p,target,direction){
 const e=p.equipment[target],key=target==='motor'?'speed':'turn';
 const trend=direction==='primary'?{[key]:1,accel:-1,condition:1}:direction==='accel'?{[key]:-1,accel:1,condition:1}:direction==='stability'?{[key]:-1,accel:-1,condition:1}:{[key]:1,accel:1,condition:1};
 return [key,'accel','condition'].map(k=>{const low=k==='condition'?25:-15,high=k==='condition'?100:k==='accel'?25:30;const sign=trend[k]>0&&e[k]<high?1:trend[k]<0&&e[k]>low?-1:0;return {key:k,label:k==='condition'?'状態':D.stats[k],value:e[k],sign};});
}
function tune(c,target,direction='balanced'){
 if(c.status!=='action'||!['motor','prop'].includes(target)||!['balanced','primary','accel','stability'].includes(direction)||!consumeAction(c,'tune'))return null;
 const p=c.player,e=p.equipment[target],before=clone(e),beforeAdjust=clone(p.adjust),success=tuningChance(p,target),rolled=rand(c),positive=rolled<success;
 const quality=rand(c),label=positive?(quality<.2?'大成功':quality<.65?'成功':'微成功'):(quality<.18?'大失敗':'失敗');
 const magnitude=positive?(1+success*3)*(quality<.2?1.6:quality<.65?1:.55):-(.15+(1-success)*.25)*(quality<.18?1.8:1);
 const delta=round(magnitude*(.85+p.adjust[target+'Var']*.003)*c.series.action.effectScale),key=target==='motor'?'speed':'turn';
 let primary=delta*.65,accel=delta*.5,condition=delta;
 if(direction==='primary'){primary=delta;accel=positive?-delta*.35:0;condition=delta*.6;}
 if(direction==='accel'){accel=delta;primary=positive?-delta*.35:0;condition=delta*.6;}
 if(direction==='stability'){condition=delta*3;primary=positive?-delta*.2:0;accel=positive?-delta*.15:0;}
 e[key]=round(clamp(e[key]+primary,-15,30));e.accel=round(clamp(e.accel+accel,-15,25));e.condition=round(clamp(e.condition+condition,25,100));
 c.balance.streak=c.balance.last===target?c.balance.streak+1:1;c.balance.last=target;
 // Every attempt teaches success control. Repeating the same part only reduces variation training.
 const diminish=c.balance.streak===1?1:c.balance.streak===2?.55:.22,learning=tuningLearning(p.adjust[target+'Success']);
 p.adjust[target+'Success']=round(Math.min(70,p.adjust[target+'Success']+4*learning*difficulty(p).growth*c.series.action.effectScale));
 p.adjust[target+'Var']=round(clamp(p.adjust[target+'Var']+.8*diminish*difficulty(p).growth*c.series.action.effectScale,0,100));
 const changes=Object.fromEntries([key,'accel','condition'].map(k=>[k,round(e[k]-before[k])]));
 const text=(target==='motor'?'モーター':'プロペラ')+' '+({balanced:'均衡',primary:target==='motor'?'伸び':'旋回',accel:'加速',stability:'安定'})[direction]+'調整 '+label+'／'+[key,'accel','condition'].map(k=>(k==='condition'?'状態':D.stats[k])+' '+(R.floor(e[k])-R.floor(before[k])>=0?'+':'')+(R.floor(e[k])-R.floor(before[k]))).join(' · ');
 const result={target,direction,label,positive,before,after:clone(e),changes,beforeAdjust,afterAdjust:clone(p.adjust),diminish,learning,success,rolled,effectScale:c.series.action.effectScale,text};
 c.series.action.debug.push(result);c.series.action.logs.push(text);syncPlayerSnapshot(c);return result;
}
function syncPlayerSnapshot(c){if(!c.series||!c.series.race||c.series.race.phase>=0)return;const n=c.series.race.runners.find(n=>n.isPlayer);if(n){n.stats=clone(c.player.stats);n.equipment=clone(c.player.equipment);n.skills=c.player.skills.slice();n.mastery=clone(c.player.mastery);}odds(c.series.race);}
function conditionOK(a,n,r){const rough=r.env.weather==='雨'||r.env.windSpeed>=6;switch(a.condition){case'rough':return rough;case'calm':return !rough&&r.env.windSpeed<=3;case'inner':return n.course<=2;case'outer':return n.course>=4;case'rain':return r.env.weather==='雨';case'cross':return r.env.wind==='横風';case'behind':return rankIn(r,n.id)>=3;default:return true;}}
function compatible(n,id){return n.skills.some(k=>ability(k).effect.tactic===id)?2.2:0;}
/* Evaluation is deterministic and also drives the auto recommendation. Randomness is applied only by advance(). */
function choiceProfile(r,n,id){
  const s=n.stats,w=r.env,rank=rankIn(r,n.id),rough=w.weather==='雨'||w.windSpeed>=6;
  let value=0,risk=1,stamina=0,variance=2,fail=0;const syn=compatible(n,id);
  switch(id){
    case'front':value=(s.turn+s.start)/19+(3-n.course)*2.3-3+(rank<=2?1:0);risk=.8;break;
    case'sashi':value=(s.turn+s.accel)/23+(w.wind==='横風'?2:0)+(rank>=2&&rank<=4?1.4:0)-1.6;risk=.65;variance=1;break;
    case'outside':value=(s.speed+s.accel)/17+(n.course-3)*1.4-3-(rough?4:0)-(s.turn<50?2:0);risk=1.75;stamina=-5;variance=6;break;
    case'stretch':value=(s.speed+n.equipment.motor.speed)/11+(n.equipment.motor.condition-70)/25-(w.wind==='向かい風'?5:0)-.6;stamina=-5;variance=3;break;
    case'position':value=(s.turn+s.power)/28+(rank<=3?1.2:2.2)-.4;risk=.7;variance=1;break;
    case'rest':value=-2+(rough?2:0)+(s.power<55?1:0);stamina=25;variance=.5;risk=.55;break;
    case'chase':value=(s.speed+s.accel)/18-3-(n.stamina<40?5:0)-(s.power<45?3:0);stamina=-10;variance=4;fail=s.power<45?.2:.07;break;
    case'guard':value=rank<=2?5.5+(s.power/35)+(rough?2:0):rank===3?3:0;variance=1;risk=.5;break;
    case'gamble':value=(s.speed+s.accel)/22+(rank>=4?4:0)-4;variance=13;stamina=-12;fail=.22;break;
    default:break;
  }
  return {id,value:value+syn,risk,stamina,variance,fail,synergy:syn};
}
function recommend(r,n,phase){const opts=D.choices[phase];if(!opts)return null;
  return opts.map(o=>{const p=choiceProfile(r,n,o.id);let v=p.value-p.fail*9-(p.risk-1)*Math.max(0,65-n.stats.turn)/12;
    if(o.id==='rest')v+=Math.max(0,62-n.stamina)*.25+(n.stats.power<50?3:0)+(r.env.windSpeed>=6?2:0);
    if(o.id==='gamble'&&rankIn(r,n.id)>=4)v+=3;
    return {id:o.id,value:v};}).sort((a,b)=>b.value-a.value)[0].id;
}
function defenseOf(n){return n.skills.filter(id=>ability(id).type==='defense').sort((a,b)=>ability(b).effect.reflect-ability(a).effect.reflect)[0];}
function targetOf(r,n,type){const list=ordered(r).filter(x=>x.id!==n.id&&!x.capsized);if(!list.length)return null;
  if(type==='nearest')return list.sort((a,b)=>r.phase===0?Math.abs(a.course-n.course)-Math.abs(b.course-n.course):Math.abs(a.score-n.score)-Math.abs(b.score-n.score))[0];
  const ahead=list.filter(x=>x.score>=n.score);return ahead.length?ahead[ahead.length-1]:list[0];
}
function activated(r,n,id,extra={}){const a=ability(id),event=Object.assign({phase:r.phase,athleteId:n.id,name:n.name,frame:n.frame,abilityId:id,rarity:a.rarity,category:a.category},extra);
  r.events.push(event);n.activations.push(event);if(rarity(id)>=2&&a.category!=='弱点')r.cutins.push(event);return event;
}
function advance(c,r,selected){
  if(r.done)return false;
  r.phase++;r.cutins=[];const phase=r.phase;const before=ordered(r),oldLeader=before[0].id;
  if(phase===0){
    r.runners.forEach(n=>{if(has(n,'entry')&&n.course>1&&rand(c)<ability('entry').chance){const other=r.runners.find(x=>x.course===n.course-1);if(other){other.course++;n.course--;activated(r,n,'entry');addLog(r,n.frame+'号艇 '+n.name+'、進入を'+n.course+'コースへ。','ability',n.id);}}});
  }
  addLog(r,D.phases[phase]+' — '+(phase===4?'最後の勝負。':'水面が動く。'),'phase');
  const mods=new Map(),attacks=[];
  r.runners.filter(n=>!n.capsized).forEach(n=>{
    const m={buff:zeros(),debuff:zeros(),safety:1,pressure:0,events:[],checks:[],choice:null};mods.set(n.id,m);
    n.skills.forEach(id=>{const a=ability(id);if(a.signature&&R.bestSignature(n,a.signature.family)!==id)return;if(!a.phases.includes(phase)||['defense','convert'].includes(a.type))return;
      const condition=conditionOK(a,n,r),roll=condition?rand(c):null,ok=condition&&roll<a.chance;m.checks.push({abilityId:id,condition,roll,chance:a.chance,activated:ok});if(!ok)return;
      activated(r,n,id);const e=a.effect;
      if(a.type==='debuff'){const target=targetOf(r,n,e.target);if(target)attacks.push({from:n,to:target,abilityId:id,stat:e.stat,amount:e.amount*(1+.04*((n.mastery&&n.mastery[id]||1)-1)),pressure:e.pressure||0});}
      else {
        const converted=a.category==='弱点'&&has(n,'comeback');if(converted&&!n.activations.some(e=>e.phase===phase&&e.abilityId==='comeback'))activated(r,n,'comeback');const boost=1+.06*((n.mastery&&n.mastery[id]||1)-1);
        Object.entries(e.stats||{}).forEach(([k,v])=>m.buff[k]+=converted&&v<0?-v*.4:v*boost);m.safety*=1-(e.safety||0);
        addLog(r,n.frame+'号艇「'+a.name+'」'+(converted?' 弱点を推進力に。':''),a.category==='弱点'?'weak':'ability',n.id);
      }
    });
    const opts=D.choices[phase];if(opts){const suggested=recommend(r,n,phase);const id=n.isPlayer&&opts.some(o=>o.id===selected)?selected:suggested;
      m.choice=choiceProfile(r,n,id);n.orders.push({phase,id,automatic:!(n.isPlayer&&selected),recommended:suggested});
      if(n.isPlayer){r.instructions.push({phase,id,automatic:!selected,recommended:suggested});addLog(r,n.name+'：'+opts.find(o=>o.id===id).name+(selected?'':'（自動）'),'order',n.id);}
    }
  });
  attacks.forEach(at=>{
    const defend=defenseOf(at.to);const original=mods.get(at.to.id);const attacker=mods.get(at.from.id);if(!original||!attacker)return;
    const close=Math.abs(at.from.score-at.to.score)<24;
    if(defend){const reflected=at.amount*ability(defend).effect.reflect;
      const event={phase,from:at.from.id,to:at.to.id,abilityId:at.abilityId,defenseId:defend,amount:at.amount,reflected,stat:at.stat,blocked:true};
      r.events.push(Object.assign({kind:'debuff'},event));at.to.debuffEvents.push(event);at.from.debuffEvents.push(event);
      if(!r.cutins.some(x=>x.athleteId===at.to.id&&x.abilityId===defend))activated(r,at.to,defend);
      if(reflected)attacker.debuff[at.stat]-=reflected; // Reflections bypass defense; never enter the attack queue again.
      addLog(r,at.to.frame+'号艇「'+ability(defend).name+'」'+(reflected?' 妨害を'+at.from.frame+'号艇へ反射。':' 妨害を無効化。'),'reflect',at.to.id);
    }else{
      original.debuff[at.stat]-=at.amount;if(close)original.pressure+=at.pressure;
      const event={phase,from:at.from.id,to:at.to.id,abilityId:at.abilityId,stat:at.stat,amount:at.amount,blocked:false,reflected:0};
      r.events.push(Object.assign({kind:'debuff'},event));at.to.debuffEvents.push(event);at.from.debuffEvents.push(event);
      addLog(r,at.from.frame+'号艇「'+ability(at.abilityId).name+'」→ '+at.to.frame+'号艇の'+D.stats[at.stat]+'を抑える。','debuff',at.to.id);
    }
  });
  r.runners.forEach(n=>{
    n.previousProgress=n.progress;if(n.capsized)return;const m=mods.get(n.id),w=r.env,v=r.venue;
    keys.forEach(k=>{if(m.buff[k]>36)m.buff[k]=36+(m.buff[k]-36)*.4;});
    const stats=clone(n.stats);keys.forEach(k=>stats[k]+=m.buff[k]+m.debuff[k]+(n.isPlayer?(r.buff[k]+r.itemBoost):0));
    const eq=n.equipment;const gear={speed:eq.motor.speed*1.1*eq.motor.condition/100,turn:(eq.prop.turn*eq.prop.condition/100+eq.boat.turn*.4),
      accel:(eq.motor.accel*eq.motor.condition/100+eq.prop.accel*eq.prop.condition/100+eq.boat.accel)*.38,power:(eq.boat.stability-55)*.09,start:0};
    const environment=Object.assign(zeros(),v.stats);
    if(w.wind==='追い風'){environment.speed+=w.windSpeed*.42;environment.start-=w.windSpeed*.4;}
    if(w.wind==='向かい風'){environment.start+=2;environment.accel-=w.windSpeed*.4;}
    if(w.wind==='横風'){environment.turn+=(stats.power-60)*w.windSpeed*.018;}
    if(w.weather==='雨'){environment.turn+=(stats.power-60)*.12-2;}
    if(w.windSpeed>=6){environment.power-=(100-stats.power)*w.windSpeed*.01;}
    const weights=D.phaseWeights[phase];let base=0,gearScore=0,envScore=0,skillScore=0,trainingScore=0,debuffScore=0;
    keys.forEach(k=>{const weight=weights[k]||0;base+=n.stats[k]*weight;gearScore+=gear[k]*weight;envScore+=environment[k]*weight;skillScore+=m.buff[k]*weight;debuffScore+=m.debuff[k]*weight;if(n.isPlayer)trainingScore+=(r.buff[k]+r.itemBoost)*weight;});
    const lane=(phase===0?1.15:phase===1?1.7:phase===3?.3:0)*(3.5-n.course)*v.lane;
    const strategy=n.isPlayer?r.strategy:n.strategy;
    const strategic=strategy==='attack'?2.3:strategy==='safe'?-1:0;
    let choice=0;if(m.choice){choice=m.choice.value+(rand(c)*2-1)*m.choice.variance;if(rand(c)<m.choice.fail){choice-=12;addLog(r,n.frame+'号艇、勝負の仕掛けは伸び切らず。','warning',n.id);}n.stamina=clamp(n.stamina+m.choice.stamina,0,100);}
    const noise=(rand(c)*2-1)*(6+v.roughness*4);const fatigue=Math.max(0,42-n.stamina)*.27;
    const total=clamp(base+gearScore+envScore+skillScore+debuffScore+trainingScore+lane+strategic+choice+noise-fatigue,4,155);
    let capRisk=0,capRoll=null;
    if(phase===1||phase===3){
      const near=before.filter(x=>x.id!==n.id&&!x.capsized&&Math.abs(x.score-n.score)<24);const aloneLeader=before[0].id===n.id&&before[1]&&n.score-before[1].score>24;
      capRisk=(.0004+Math.max(0,58-stats.turn)*.00013+Math.max(0,55-stats.power)*.0001+Math.max(0,w.windSpeed-4)*.00065+(w.weather==='雨'?.0015:0)+m.pressure+(near.length?Math.max(0,Math.max(...near.map(x=>x.stats.power))-stats.power)*.000035:0));
      capRisk*=m.safety*(m.choice?m.choice.risk:1)*(strategy==='attack'?1.4:strategy==='safe'?.5:1);
      if(aloneLeader)capRisk=Math.min(.0003,capRisk*.04);capRisk=clamp(capRisk,0,.095);capRoll=rand(c);
      if(capRoll<capRisk){n.capsized=true;n.capsizePhase=phase;n.progress=clamp([.11,.31,.52,.75,1][phase]+(n.score-before[0].score)*.0007,n.previousProgress,.91);addLog(r,n.frame+'号艇 '+n.name+'、ターンで転覆。以降の進行を停止。','capsize',n.id);r.events.push({kind:'capsize',phase,athleteId:n.id});}
    }
    const detail={phase,base:round(base),gear:round(gearScore),environment:round(envScore),skill:round(skillScore),debuff:round(debuffScore),training:round(trainingScore),lane:round(lane),strategy:strategic,choice:round(choice),choiceId:m.choice?m.choice.id:null,noise:round(noise),fatigue:round(fatigue),total:round(total),capRisk,capRoll,checks:m.checks};
    n.phaseHistory.push(detail);
    if(!n.capsized)n.score+=38+total*.62;
    n.stamina=round(clamp(n.stamina-(phase===1||phase===3?14:10)+stats.power/24-(strategy==='attack'?4:strategy==='safe'?-2:0),0,100));
  });
  const after=ordered(r),mean=sum(r.runners.filter(n=>!n.capsized).map(n=>n.score))/Math.max(1,r.runners.filter(n=>!n.capsized).length);
  const track=[.11,.31,.52,.75,1][phase];
  after.forEach((n,i)=>{if(n.capsized)return;n.progress=phase===4?Math.max(n.previousProgress,1-i*.024):clamp(track+(n.score-mean)*.00085,n.previousProgress,.91);});
  if(after[0].id!==oldLeader&&phase>0)addLog(r,after[0].frame+'号艇 '+after[0].name+'が先頭へ。','lead',after[0].id);
  else addLog(r,after[0].frame+'号艇 '+after[0].name+(phase===0?'、好スタート。':'、先頭を守る。'),'lead',after[0].id);
  if(after[1]&&!after[1].capsized&&after[0].score-after[1].score<7)addLog(r,'先頭争いは接戦。わずかな差で並ぶ。','warning');
  if(phase===4){r.done=true;r.auto=false;addLog(r,'ゴール！ '+after.filter(n=>!n.capsized).slice(0,3).map(n=>n.frame+'号艇').join(' → '),'goal');}
  return true;
}
function startDrive(ctx,r){
  if(r.done)return r.drive||null;
  if(!r.drive){
    const legacy=r.watch&&r.phase>=0;r.drive=R.create(r,int(ctx,1,0x7fffffff),{keepCourses:legacy});
    if(legacy){
      r.controlMode='spectator';const d=r.drive;d.elapsed=R.C.prestart+Math.max(...r.runners.map(n=>n.progress))*R.C.length/14;d.countdown=0;d.started=true;d.logs=[];
      d.boats.forEach(b=>{const n=r.runners.find(x=>x.id===b.id),progress=clamp(n.progress,0,.99)*R.C.length,pos=R.pointAt(R.C.start+progress,R.C.inner+5+(b.course-1)*3.5);
        Object.assign(b,{x:pos.x,z:pos.z,heading:pos.heading,progress,lastS:R.mod(R.C.start+progress,R.C.length),checkpoints:Math.floor(progress/(R.C.length/8)),startTime:.3,stamina:n.stamina,capsized:n.capsized,phase:R.phaseAt(progress)});
      });
      d.logs.push({phase:R.own(d).phase,kind:'phase',text:'旧観戦の位置を1周目に引き継ぎました。ここから3周のゴールまで進みます。',time:d.elapsed,lap:1});
    }
  }
  r.drive.paused=true;return r.drive;
}
function syncSpectator(r){
  if(!r.drive)return;const d=r.drive,last=r.watchedEvent===undefined?-1:r.watchedEvent;
  r.runners.forEach(n=>{const b=d.boats.find(x=>x.id===n.id);n.previousProgress=n.progress;n.previousTrackProgress=Number.isFinite(n.trackProgress)?n.trackProgress:Math.max(0,b.progress/R.C.length);n.progress=Math.max(0,b.progress/R.C.goal);n.trackProgress=Math.max(0,b.progress/R.C.length);n.score=b.progress;Object.assign(n,{capsized:b.capsized,dnf:b.dnf,startFault:b.startFault,startTime:b.startTime,finishTime:b.finishTime,course:b.course,stamina:b.stamina,activations:clone(b.activations),debuffEvents:clone(b.interference),phaseHistory:clone(b.phaseHistory)});});
  r.phase=R.own(d).phase;r.logs=clone(d.logs);r.events=clone(d.events);r.cutins=d.events.filter(e=>e.kind==='ability'&&e.index>last&&d.elapsed-e.t<3.2&&D.rarities.indexOf(e.rarity)>=2).map(clone);r.watchedEvent=d.eventSequence-1;
}
function prepareSpectator(s,quick=false){
  const c=s.career,r=quick?s.quick&&s.quick.race:c&&c.series&&c.series.race;
  if(!r||r.done)return r||null;
  if(!quick&&!['preRace','race'].includes(c.status))return null;
  r.watch=true;r.controlMode=r.drive?'assisted':'spectator';
  startDrive(quick?s:c,r);r.drive.paused=true;syncSpectator(r);if(!quick)c.status='race';return r;
}
function spectatorStep(s,quick=false,choice=null,ticks=180,adaptive=false){
  const r=quick?s.quick&&s.quick.race:s.career&&s.career.series&&s.career.series.race;
  if(!r||!r.watch||r.done)return false;
  if(!r.drive)startDrive(quick?s:s.career,r);
  const done=stepAutoRace(r,ticks,adaptive);syncSpectator(r);if(done){completeDrive(s,quick);syncSpectator(r);}
  return true;
}
function prepareAutoRace(s,quick=false){
  const c=s.career,r=quick?s.quick&&s.quick.race:c&&c.series&&c.series.race;
  if(!r)return null;if(r.done)return r;
  if(!quick&&!['preRace','race'].includes(c.status))return null;
  startDrive(quick?s:c,r);if(!quick)c.status='race';
  if(!['auto','assisted'].includes(r.controlMode))r.controlMode=r.drive.elapsed>0?'assisted':'auto';
  return r;
}
function stepAutoRace(r,maxTicks=240,adaptive=false){
  if(!r||!r.drive||r.done)return true;const d=r.drive;if(d.finished)return true;
  d.paused=false;for(let i=0;i<maxTicks&&!d.finished;i++)R.tick(d,r,{},R.DT,true);d.paused=true;return d.finished;
}
function autoResolve(s,quick=false){const r=prepareAutoRace(s,quick);if(!r)return null;while(!stepAutoRace(r,360)){}completeDrive(s,quick);return r;}
function completeDrive(s,quick=false){
  const r=quick?s.quick&&s.quick.race:s.career&&s.career.series&&s.career.series.race;
  if(!r||!r.drive||!r.drive.finished)return null;
  if(r.done){if(quick)payQuick(s);else settleRace(s);return r.result;}
  R.finishOthers(r.drive,r);
  r.drive.boats.forEach(b=>{const n=r.runners.find(x=>x.id===b.id);
    Object.assign(n,{progress:Math.max(0,b.progress/R.C.goal),previousProgress:Math.max(0,b.progress/R.C.goal),score:b.finishTime===null?Math.max(0,b.progress/R.C.goal*300):500-b.finishTime,
      capsized:b.capsized,dnf:b.dnf,startFault:b.startFault,startTime:b.startTime,capsizePhase:b.capsized?b.phase:null,finishTime:b.finishTime,course:b.course,stamina:b.stamina,
      phaseHistory:clone(b.phaseHistory),activations:clone(b.activations),debuffEvents:clone(b.interference),orders:[]});
  });
  r.phase=4;r.done=true;r.logs=clone(r.drive.logs);r.events=clone(r.drive.events);r.cutins=[];r.drive.finalized=true;r.drive.paused=true;
  if(quick){payQuick(s);r.settled=true;}else settleRace(s);return r.result;
}
function acquire(c,p,id,source){
  if(!id)return null;
  const duplicate=has(p,id);if(duplicate){p.mastery[id]=(p.mastery[id]||1)+1;}else{p.skills.push(id);p.mastery[id]=1;}
  let statBonus=null;if(!duplicate&&!isWeak(id)){const key=pick(c,keys),amount=[.3,.5,.8,1.2,1.8,2.5][rarity(id)],before=p.stats[key],gain=growStat(p,key,amount*statGrowthRate(before));statBonus={key,gain,visible:R.floor(p.stats[key])-R.floor(before)};}
  return {id,source,duplicate,level:p.mastery[id],statBonus};
}
function removeWeakness(p,id){if(!has(p,id)||!isWeak(id))return false;p.skills=p.skills.filter(x=>x!==id);delete p.mastery[id];return true;}
function settleRace(s){
  const c=s.career,r=c&&c.series&&c.series.race;if(!r||!r.done||r.settled)return null;
  const p=c.player,finish=ordered(r),n=finish.find(x=>x.isPlayer),place=finish.indexOf(n)+1;
  const won=place===1&&!n.capsized&&!n.dnf,qualifier=r.type==='qualifier';
  const money=(n.capsized||n.dnf)?0:round(D.prizes[r.type][place-1]*D.tiers[c.series.tier].prize,1);
  const points=qualifier&&!n.capsized&&!n.dnf?D.points[place-1]:0;
  p.money=round(p.money+money,1);p.totalEarnings=round(p.totalEarnings+money,1);
  if(qualifier){p.points+=points;p.finishes[place-1]++;p.scoreTotal+=n.score;}
  const beforeStats=clone(p.stats);
  const growth=Object.fromEntries(keys.map(k=>[k,growStat(p,k,(D.raceGrowthByPlace[difficulty(p).id][place-1])*(c.stage===8?1:D.nonSG.raceGrowth)*D.tiers[c.series.tier].growth*1.5*growthOf(p).values[k]*growthFactor(p)*lateGrowthFactor(c,k)*(n.capsized?.65:1))]));
  const fameBase=(n.capsized||n.dnf)?-3:[9,5,3,1,0,-1][place-1];const upset=place<n.favourite?Math.max(0,n.favourite-place)*2:0;
  const fameSkills=p.skills.reduce((a,id)=>a+(ability(id).type==='fame'?ability(id).effect.value:0),0);
  const fameActivated=n.activations.reduce((a,event)=>a+(ability(event.abilityId).effect.fame||0),0);
  const popularity=Math.max(-p.popularity,fameBase+upset+fameSkills+fameActivated);p.popularity+=popularity;
  const acquired=[],weakness={gained:null,cured:null};
  if(won){
    const sgChampion=c.stage===8&&r.type==='championship';const chance=sgChampion?1:r.type==='championship'?.85:.22;
    if(rand(c)<chance){const rare=rewardRarity(p,sgChampion?'LR':pick(c,D.tiers[c.series.tier].rare));const id=randomSkill(c,[rare],p.skills)||randomSkill(c,[rare]);if(id)acquired.push(acquire(c,p,id,(sgChampion?'SG優勝報酬':r.type==='championship'?'シリーズ優勝':'レース勝利')+(p.difficulty==='easy'?' · イージー報酬':'')));}
    const weak=p.skills.filter(isWeak);if(weak.length&&rand(c)<.22){weakness.cured=pick(c,weak);removeWeakness(p,weakness.cured);}
  }else if(place===6&&rand(c)<.13){const id=randomSkill(c,['N','R'],p.skills,true);if(id){p.skills.push(id);weakness.gained=id;}}
  if(c.stage===8&&r.type==='championship'&&!n.capsized&&!n.dnf){
    finish.filter((x,i)=>x.special&&i>place-1).forEach(other=>{const eligible=other.skills.filter(id=>!isWeak(id)&&rarity(id)>=2);
      if(eligible.length){const novel=eligible.filter(id=>!has(p,id)),pool=novel.length?novel:eligible;pool.sort((a,b)=>rarity(b)-rarity(a));const high=pool.filter(id=>rarity(id)===rarity(pool[0]));acquired.push(acquire(c,p,rewardSkill(c,p,pick(c,high)),other.name+'に先着'+(p.difficulty==='easy'?' · レア度を1段階調整':'')));}
    });
  }
  recordRace(c,r,n,place,won);c.stats.races++;if(won)c.stats.wins++;if(n.capsized)c.stats.capsizes++;
  applyNPCResult(c,r,qualifier);if(qualifier){shadowQualifiers(c,r.runners.map(n=>n.id));c.series.round++;}
  const result={raceId:r.id,type:r.type,place,capsized:n.capsized,dnf:!!n.dnf,startFault:n.startFault||null,startTime:n.startTime==null?null:n.startTime,points,money,growth,growthVisible:Object.fromEntries(keys.map(k=>[k,R.floor(p.stats[k])-R.floor(beforeStats[k])])),popularity,acquired,weakness,
    driving:r.drive?{controlMode:r.controlMode||'manual',time:R.own(r.drive).finishTime,metrics:clone(R.own(r.drive).metrics),distance:R.own(r.drive).progress,synergies:(R.own(r.drive).synergyUsed||[]).slice(),setup:r.strategy,tilt:R.tiltValue(r)}:null,
    finish:finish.map((x,i)=>({id:x.id,name:x.name,frame:x.frame,place:i+1,capsized:x.capsized,dnf:!!x.dnf,startFault:x.startFault||null,startTime:x.startTime==null?null:x.startTime,finishTime:x.finishTime,isPlayer:x.isPlayer,special:!!x.special,points:qualifier&&!x.capsized&&!x.dnf?D.points[i]:0})),
    qualificationRank:standing(c).findIndex(x=>x.id===p.id)+1,playerPhase:clone(n.phaseHistory),orders:clone(n.orders),activations:clone(n.activations),debuffEvents:clone(n.debuffEvents)};
  r.result=result;r.settled=true;c.lastResult=result;c.status='raceResult';return result;
}
function recordRace(c,r,n,place,won){
 const p=c.player;if(!p.careerLog)p.careerLog={races:0,wins:0,firstWin:null,bestST:null,venues:{},highlights:[]};const h=p.careerLog;h.races++;if(won)h.wins++;
 const v=h.venues[r.venue.id]||(h.venues[r.venue.id]={races:0,wins:0});v.races++;if(won)v.wins++;
 if(n.startTime!=null&&!n.startFault&&(h.bestST===null||Math.abs(n.startTime)<Math.abs(h.bestST)))h.bestST=n.startTime;
 let text=null;if(won&&!h.firstWin){h.firstWin=c.series.name+'・'+r.venue.name;text='初勝利：'+h.firstWin;}
 if(won&&r.type==='championship')text=c.series.name+' 優勝';
 if(won&&n.favourite>=4)text=r.venue.name+' '+n.favourite+'番人気から逆転勝利';
 if(text){h.highlights.push(text);h.highlights=h.highlights.slice(-12);}
}
function qualificationTarget(c){
 const ranked=standing(c),own=c.player,remaining=5-c.series.round;
 return {remaining,rank:ranked.findIndex(p=>p.id===own.id)+1,targets:[6,12].map(cut=>{const others=ranked.filter(p=>p.id!==own.id),line=others[cut-1]?.points||0;return {cut,line,needed:Math.max(0,line+1-own.points),maxAvailable:remaining*10};})};
}
function rememberRival(s,c){
  const seen=c.series.npcs.filter(n=>n.points>=c.player.points-4&&n.skills.some(id=>rarity(id)>=2));
  if(!seen.length)return null;const p=seen.slice().sort((a,b)=>b.points-a.points)[0];
  const record=clone(p);record.rivalReason=c.series.name+' 予選'+(standing(c).findIndex(n=>n.id===p.id)+1)+'位';record.recordedAt=Date.now();record.rating=average(p);
  if(!s.rivals.some(n=>n.id===p.id)){s.rivals.push(record);if(s.rivals.length>12)s.rivals.sort((a,b)=>(b.rating||average(b))-(a.rating||average(a))).splice(12);}
  return p.name;
}
function finishSeries(s){
  const c=s.career,ser=c.series;if(ser.completed)return c.history[c.history.length-1];
  const ranking=standing(c);ser.qualificationRank=ranking.findIndex(n=>n.id===c.player.id)+1;
  const finalPlace=ser.finalType==='eliminated'?null:c.lastResult.place;
  const summary={stage:c.stage,name:ser.name,tier:ser.tier,qualificationRank:ser.qualificationRank,finalType:ser.finalType,finalPlace,
    champion:ser.finalType==='championship'&&finalPlace===1&&!c.lastResult.capsized&&!c.lastResult.dnf,
    growthVisible:Object.fromEntries(keys.map(k=>[k,R.floor(c.player.stats[k])-R.floor(ser.startStats[k])])),
    money:round(c.player.totalEarnings-ser.startMoney,1),growth:Object.fromEntries(keys.map(k=>[k,round(c.player.stats[k]-ser.startStats[k])])),rival:rememberRival(s,c)};
  c.history.push(summary);ser.completed=true;c.status='seriesResult';
  if(c.stage===8)c.ending=summary.champion?'sgChampion':'sgFinished';
  else if(c.stage===7&&c.player.totalEarnings<D.sgThreshold)c.ending='gate';
  if(c.ending)c.lastShop=c.lastShop||generateShop(c,true);
  return summary;
}
function continueAfterRace(s){const c=s.career;if(c.status!=='raceResult')return false;if(c.series.race.type!=='qualifier'){finishSeries(s);return true;}c.status='between';prepareRace(s);return true;}
function nextSeries(s){const c=s.career;if(c.status!=='seriesResult'||c.ending)return false;c.stage++;c.series=null;c.status='home';c.shop=c.stage>=2?generateShop(c):null;return true;}
function register(s,early=false){
  const c=s.career;if(!c||s.registry.length>=50)return false;
  const record=clone(c.player);record.recordedAt=Date.now();record.record={stage:c.stage,races:c.stats.races,wins:c.stats.wins,ending:c.ending||'early',title:c.ending==='sgChampion'?'SG覇者':c.ending==='sgFinished'?'SG完走':c.ending==='gate'?'G1修了':'途中登録'};
  if(!s.registry.some(n=>n.id===record.id))s.registry.push(record);s.career=null;return record;
}
function buySkill(c,id,last=false){
  if(last&&!c.ending)return {error:'登録前ショップは育成終了時に利用できます。'};
  if(!last&&c.stage<2)return {error:'特殊能力ショップはG3前期から開店します。'};
  if(!last&&!['home','action','preRace'].includes(c.status))return {error:'レース前に購入できます。'};
  const shop=last?c.lastShop:c.shop;if(!shop)return {error:'在庫がありません。'};
  const item=shop.stock.find(x=>x.id===id);if(!item||item.sold||shop.purchases>=shop.limit||has(c.player,id))return {error:'この能力は購入できません。'};
  if(c.player.money<item.price)return {error:'所持賞金が足りません。'};
  c.player.money=round(c.player.money-item.price,1);item.sold=true;shop.purchases++;const gained=acquire(c,c.player,id,'ショップ');syncPlayerSnapshot(c);return {id,price:item.price,statBonus:gained.statBonus};
}
function buyItem(c,id){
  if(!['home','action','preRace'].includes(c.status)||c.ending)return {error:'通常のレース前に購入できます。'};
  const item=D.items.find(x=>x.id===id);if(!item)return {error:'対象がありません。'};
  if(!c.shop)c.shop=generateShop(c);
  if((c.shop.itemBuys[id]||0)>=2)return {error:'同じアイテムは1シリーズ2個までです。'};
  if(c.player.money<item.price)return {error:'所持賞金が足りません。'};
  c.player.money=round(c.player.money-item.price,1);c.shop.itemBuys[id]=(c.shop.itemBuys[id]||0)+1;c.player.inventory[id]=(c.player.inventory[id]||0)+1;return {id};
}
function useItem(c,id,weakId){
  const p=c.player;if(!p.inventory[id])return {error:'このアイテムを持っていません。'};
  if(!['home','action','preRace'].includes(c.status))return {error:'レース前に使用してください。'};
  if(id==='growth'){p.growth=pick(c,D.growth.filter(g=>g.id!==p.growth)).id;}
  else if(id==='cure'){if(!weakId||!removeWeakness(p,weakId))return {error:'克服する弱点を選んでください。'};}
  else {
    const r=c.series&&c.series.race;if(!r||r.phase>=0||!['action','preRace'].includes(c.status))return {error:'次走のレース前アクションで使用できます。'};
    if(r.usedItems[id])return {error:'このアイテムは次走分を使用済みです。'};
    if(id==='boost')r.itemBoost=5;
    else if(id==='lane'){const own=r.runners.find(n=>n.isPlayer),other=r.runners.find(n=>n.frame===1);[own.frame,other.frame]=[other.frame,own.frame];r.runners.forEach(n=>n.course=n.frame);odds(r);}
    else if(id==='training'||id==='tune'){c.series.action[id]++;c.status='action';}
    else return {error:'対象がありません。'};
    r.usedItems[id]=true;
  }
  p.inventory[id]--;syncPlayerSnapshot(c);return {id};
}
function quickRace(s,ids,betId=null,stake=0,driverId=null){
  if(s.quick&&s.quick.race&&!s.quick.race.done)return {error:'進行中の作成選手レースを終えてください。'};
  const selected=Array.from(new Set(ids));const p=selected.map(id=>s.registry.find(n=>n.id===id));
  if(p.length!==6||p.some(n=>!n))return {error:'登録選手を重複なしで6人選んでください。'};
  stake=Number(stake);if(!Number.isInteger(stake)||stake<0||stake>500||stake>s.coins||stake>0&&!selected.includes(betId))return {error:'コイン数または応援する選手を確認してください。'};
  s.coins-=stake;const venue=clone(pick(s,D.venues));const people=p.map(n=>{const b=clone(n);b.equipment=equipment(s);return b;});
  const r=makeRace(s,people,venue,weather(s,venue),'exhibition',selected.includes(driverId)?driverId:p[0].id);s.quick={race:r,stake,betId,paid:false,payout:0};return s.quick;
}
function payQuick(s){const q=s.quick;if(!q||!q.race.done||q.paid)return;const leader=ordered(q.race)[0];q.payout=!leader.capsized&&!leader.dnf&&leader.id===q.betId?q.stake*3:0;s.coins+=q.payout;q.paid=true;}
function buildInfo(p){
  const tags=p.skills.filter(id=>!isWeak(id)).map(id=>ability(id).category);const stats=p.stats;
  const build=tags.filter(x=>x==='防御'||x==='妨害').length>=3?'妨害 / 反射型':tags.filter(x=>x==='整備').length>=2?'整備型':tags.filter(x=>x==='環境').length>=2?'荒天型':tags.filter(x=>x==='人気').length>=2?'人気型':stats.turn>=stats.speed+4?'差し型':stats.start>=stats.speed&&stats.start>=stats.accel?'逃げ型':'まくり型';
  const weak=p.skills.filter(isWeak);return {name:build,plus:build==='差し型'?'旋回から加速へつなぐ':build==='逃げ型'?'踏み込みと先マイが軸':build==='まくり型'?'直線から外へ展開':'能力が働く条件を選ぶ',
    caution:weak.length?(has(p,'comeback')?'弱点を上昇へ転換できる':'弱点 '+weak.length+'種を保有'):stats.power<55?'強風と終盤の体力に注意':'相手の妨害・反射を確認',
    tactic:build==='差し型'?'ターン前に減速、内へ向けて再加速':build==='逃げ型'?'好発進から内側の短いラインへ':'直線で舵を戻し、加速時間を確保'};
}
function shopReason(p,id){const a=ability(id),b=buildInfo(p),before=R.buildLinks(p),after=R.buildLinks({...p,skills:[...p.skills,id]}),ready=after.find((x,i)=>x.ready&&!before[i].ready);if(ready)return '連携「'+ready.name+'」が成立';const target=after.find((x,i)=>x.missing.length<before[i].missing.length);if(target)return '連携「'+target.name+'」へ近づく'+(target.stats.length?'（基礎能力も育てよう）':'');if(a.category==='防御')return '妨害・荒天への備え';if(a.category==='育成')return '残りシリーズの成長を後押し';if(a.category==='整備')return '機材づくりを安定';if(a.category==='妨害')return '前を行く相手へ干渉';if(a.effect.tactic==='sashi'&&b.name==='差し型')return '旋回を生かすビルドに合う';if(a.effect.stats&&a.effect.stats.speed&&b.name==='まくり型')return '伸び足の強みを伸ばす';return a.category+'を補う選択';}
function validCareerLog(h){return h&&Number.isInteger(h.races)&&h.races>=0&&Number.isInteger(h.wins)&&h.wins>=0&&(h.firstWin===null||typeof h.firstWin==='string'&&h.firstWin.length<120)&&(h.bestST===null||Number.isFinite(h.bestST)&&h.bestST>=-.25&&h.bestST<1.5)&&h.venues&&Object.entries(h.venues).every(([id,v])=>D.venues.some(x=>x.id===id)&&v&&Number.isInteger(v.races)&&v.races>=0&&Number.isInteger(v.wins)&&v.wins>=0)&&Array.isArray(h.highlights)&&h.highlights.length<=12&&h.highlights.every(x=>typeof x==='string'&&x.length<160);}
function validPlayer(p){
  return !!p&&(!('difficulty' in p)||['easy','normal'].includes(p.difficulty))&&typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(p.id)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=30&&
    (!p.careerLog||validCareerLog(p.careerLog))&&p.stats&&keys.every(k=>Number.isFinite(p.stats[k])&&p.stats[k]>=0&&p.stats[k]<=100)&&
    p.adjust&&['motorVar','motorSuccess','propVar','propSuccess'].every(k=>Number.isFinite(p.adjust[k])&&p.adjust[k]>=0&&p.adjust[k]<=100)&&
    D.growth.some(g=>g.id===p.growth)&&Number.isFinite(p.points)&&p.points>=0&&Array.isArray(p.finishes)&&p.finishes.length===6&&p.finishes.every(n=>Number.isInteger(n)&&n>=0)&&Number.isFinite(p.scoreTotal)&&Number.isFinite(p.tie)&&(!p.record||(Number.isInteger(p.record.wins)&&Number.isInteger(p.record.races)&&['SG覇者','SG完走','G1修了','途中登録'].includes(p.record.title)))&&Array.isArray(p.skills)&&p.skills.length<=D.abilities.length&&new Set(p.skills).size===p.skills.length&&p.skills.every(id=>ability(id))&&
    p.mastery&&Object.entries(p.mastery).every(([id,n])=>ability(id)&&Number.isInteger(n)&&n>=1&&n<10000)&&
    ['money','totalEarnings','popularity'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1e12)&&p.inventory&&Object.entries(p.inventory).every(([id,n])=>D.items.some(i=>i.id===id)&&Number.isInteger(n)&&n>=0&&n<=10000);
}
function validEquipment(e){return e&&['motor','prop'].every(k=>e[k]&&(!('trait' in e[k])||[0,1,2,3].includes(e[k].trait)))&&['boat','motor','prop'].every(k=>e[k]&&Object.values(e[k]).every(Number.isFinite))&&['stability','turn','accel'].every(k=>Number.isFinite(e.boat[k]))&&['speed','accel','condition'].every(k=>Number.isFinite(e.motor[k]))&&['turn','accel','condition'].every(k=>Number.isFinite(e.prop[k]));}
function validActivation(e){return e&&ability(e.abilityId)&&Number.isInteger(e.phase)&&e.phase>=0&&e.phase<=4&&Number.isInteger(e.frame)&&e.frame>=1&&e.frame<=6&&typeof e.name==='string'&&e.name.length<=30&&typeof e.athleteId==='string';}
function validHistory(h){return Array.isArray(h)&&h.length<=24&&h.every(x=>Number.isInteger(x.phase)&&x.phase>=0&&x.phase<=4&&['base','gear','environment','skill','debuff','training','lane','strategy','choice','noise','fatigue','total','capRisk'].every(k=>Number.isFinite(x[k]))&&Array.isArray(x.checks)&&x.checks.every(e=>ability(e.abilityId)));}
function validRace(r){return r&&(!('tilt' in r)||[-.5,0,.5,1.5,3].includes(r.tilt))&&(!('grade' in r)||Object.prototype.hasOwnProperty.call(D.tiers,r.grade))&&(!('difficulty' in r)||['easy','normal'].includes(r.difficulty))&&(!('watch' in r)||typeof r.watch==='boolean')&&['qualifier','championship','consolation','exhibition'].includes(r.type)&&Array.isArray(r.runners)&&r.runners.length===6&&r.runners.every(n=>validPlayer(n)&&validEquipment(n.equipment)&&Number.isFinite(n.score)&&Number.isFinite(n.progress)&&Number.isFinite(n.stamina)&&validHistory(n.phaseHistory)&&Array.isArray(n.activations)&&n.activations.every(validActivation)&&Array.isArray(n.debuffEvents)&&Array.isArray(n.orders)&&n.orders.every(o=>D.choices[o.phase]&&D.choices[o.phase].some(x=>x.id===o.id)))&&new Set(r.runners.map(n=>n.id)).size===6&&new Set(r.runners.map(n=>n.frame)).size===6&&new Set(r.runners.map(n=>n.course)).size===6&&r.runners.every(n=>Number.isInteger(n.frame)&&n.frame>=1&&n.frame<=6&&Number.isInteger(n.course)&&n.course>=1&&n.course<=6)&&Number.isInteger(r.phase)&&r.phase>=-1&&r.phase<=4&&typeof r.done==='boolean'&&(r.drive?R.valid(r.drive,r):r.done===(r.phase===4))&&r.env&&['晴れ','曇り','雨'].includes(r.env.weather)&&['追い風','向かい風','横風','無風'].includes(r.env.wind)&&Number.isFinite(r.env.windSpeed)&&r.env.windSpeed>=0&&r.env.windSpeed<=10&&r.venue&&D.venues.some(v=>v.id===r.venue.id)&&r.venue.stats&&Object.entries(r.venue.stats).every(([k,v])=>keys.includes(k)&&Number.isFinite(v))&&Number.isFinite(r.venue.lane)&&Number.isFinite(r.venue.roughness)&&Array.isArray(r.logs)&&r.logs.length<=80&&r.logs.every(l=>typeof l.text==='string'&&l.text.length<2000&&['normal','phase','ability','order','weak','reflect','debuff','warning','capsize','lead','goal'].includes(l.kind))&&Array.isArray(r.events)&&Array.isArray(r.cutins)&&r.cutins.every(validActivation)&&Array.isArray(r.instructions)&&r.buff&&keys.every(k=>Number.isFinite(r.buff[k]))&&Number.isFinite(r.itemBoost)&&r.usedItems&&['balanced','attack','safe'].includes(r.strategy);}
function validShop(shop){return shop===null||shop&&Array.isArray(shop.stock)&&shop.stock.length<=5&&shop.stock.every(x=>ability(x.id)&&!isWeak(x.id)&&ability(x.id).rarity!=='LR'&&Number.isFinite(x.price)&&x.price>0&&typeof x.sold==='boolean')&&Number.isInteger(shop.purchases)&&shop.purchases>=0&&shop.purchases<=shop.limit&&[1,2].includes(shop.limit)&&shop.itemBuys;}
function validState(s){
  try {
    if(!s||s.version!==D.version||!Number.isInteger(s.seed)||!Number.isInteger(s.coins)||s.coins<0||!Array.isArray(s.registry)||s.registry.length>50||!s.registry.every(validPlayer)||!Array.isArray(s.rivals)||s.rivals.length>12||!s.rivals.every(validPlayer)||!s.settings||![1,2,3].includes(s.settings.speed))return false;
    if(s.quick&&(!validRace(s.quick.race)||typeof s.quick.paid!=='boolean'||!Number.isInteger(s.quick.stake)||s.quick.stake<0||s.quick.stake>500))return false;
    const c=s.career;if(!c)return true;
    if(!validPlayer(c.player)||!Number.isInteger(c.seed)||!Number.isInteger(c.stage)||c.stage<0||c.stage>8||!['home','seriesIntro','between','action','preRace','race','raceResult','seriesResult','registration'].includes(c.status)||!Array.isArray(c.history)||c.history.length>9||!c.balance||!Number.isInteger(c.balance.streak)||c.balance.streak<0||!c.stats||!['races','wins','capsizes'].every(k=>Number.isInteger(c.stats[k])&&c.stats[k]>=0)||!validShop(c.shop)||!validShop(c.lastShop))return false;
    if(c.series){const x=c.series;if(x.stage!==c.stage||!Array.isArray(x.npcs)||x.npcs.length!==19||!x.npcs.every(n=>validPlayer(n)&&validEquipment(n.equipment))||!D.tiers[x.tier]||!Number.isInteger(x.round)||x.round<0||x.round>5||!validEquipment(c.player.equipment)||!x.startStats||!keys.every(k=>Number.isFinite(x.startStats[k])))return false;
      if(x.race&&(!validRace(x.race)||x.race.type==='exhibition'||x.race.runners.filter(n=>n.isPlayer).length!==1||!x.race.runners.some(n=>n.isPlayer&&n.id===c.player.id)))return false;
      if(x.action&&((x.action.baseActions&&!['training','tune'].every(k=>Number.isInteger(x.action.baseActions[k])&&x.action.baseActions[k]>=0&&x.action.baseActions[k]<=x.action[k]))||(x.action.halfActions&&!['training','tune'].every(k=>Number.isInteger(x.action.halfActions[k])&&x.action.halfActions[k]>=0&&x.action.halfActions[k]<=x.action[k]))||('prepRolled' in x.action&&typeof x.action.prepRolled!=='boolean')||!['normal','training','tune'].every(k=>Number.isInteger(x.action[k])&&x.action[k]>=0&&x.action[k]<=8)||!Array.isArray(x.action.logs)||!Array.isArray(x.action.debug)||!Array.isArray(x.action.extras)||!x.action.extras.every(id=>ability(id)&&ability(id).type==='extra')||('extrasNotified' in x.action&&typeof x.action.extrasNotified!=='boolean')))return false;
    }
    if(['action','preRace','race','raceResult'].includes(c.status)&&(!c.series||!c.series.race||!c.series.action))return false;
    if(c.status==='raceResult'&&(!c.lastResult||!c.series.race.settled||!c.series.race.done||!Number.isInteger(c.lastResult.place)||!Array.isArray(c.lastResult.finish)||!validHistory(c.lastResult.playerPhase)))return false;
    if(c.status==='seriesResult'&&(!c.series||!c.series.completed||!c.history.length))return false;
    return true;
  }catch(e){return false;}
}
function decode(text){if(typeof text!=='string'||text.length>5000000)throw new Error('セーブデータのサイズが大きすぎます。');
  const s=JSON.parse(text,(k,v)=>['__proto__','prototype','constructor'].includes(k)?undefined:v);
  if(s&&s.version===70){s.version=D.version;
    const races=[s.career&&s.career.series&&s.career.series.race,s.quick&&s.quick.race].filter(Boolean);
    races.forEach(r=>{if(!r.done){r.phase=-1;r.logs=[];r.events=[];r.cutins=[];r.instructions=[];r.runners.forEach(n=>Object.assign(n,{score:0,progress:0,previousProgress:0,capsized:false,capsizePhase:null,stamina:100,phaseHistory:[],activations:[],debuffEvents:[],orders:[]}));}});
  }
  const oldRaces=[s.career&&s.career.series&&s.career.series.race,s.quick&&s.quick.race].filter(Boolean);
  oldRaces.forEach(r=>{if(r.drive&&r.drive.version===1){
    const old=r.drive;
    if(!Array.isArray(old.boats)||old.boats.length!==6||!old.boats.every(b=>Number.isFinite(b.x)&&Math.abs(b.x)<500&&Number.isFinite(b.z)&&Math.abs(b.z)<500))throw new Error('旧レースの座標が不正です。');
    if(!r.done){r.phase=-1;r.watch=false;r.controlMode='manual';r.logs=[];r.events=[];r.cutins=[];r.instructions=[];r.runners.forEach(n=>Object.assign(n,{score:0,progress:0,previousProgress:0,capsized:false,dnf:false,capsizePhase:null,stamina:100,phaseHistory:[],activations:[],debuffEvents:[],orders:[]}));s.migrationNotice='v87へ移行しました。コース変更のため旧版の未完了レースのみ助走から再開します。育成・機材・賞金は引き継いでいます。';}
    delete r.drive;
  }});
  if(s&&s.career&&s.career.player&&!('difficulty' in s.career.player)){s.career.player.difficulty='normal';s.migrationNotice=(s.migrationNotice?s.migrationNotice+' ':'v87へ移行しました。')+'育成報酬を維持するノーマルを適用しました。育成・機材・賞金は引き継いでいます。';}
  oldRaces.forEach(r=>{if(!('grade' in r))r.grade=s.career?.series?.race===r?(s.career.series.tier||'rookie'):'rookie';if(!('difficulty' in r))r.difficulty=difficulty(s.career&&s.career.player).id;});
  const act=s.career?.series?.action;
  if(act&&!act.halfActions){act.halfActions={};for(const k of ['training','tune'])act.halfActions[k]=Math.max(0,act[k]-(s.career.series.race?.usedItems?.[k]?1:0));}
  oldRaces.forEach(r=>{if(!('tilt' in r))r.tilt=R.tiltValue(r);if(r.prepVersion!==87){if(!r.drive&&r.phase<0)r.buff=zeros();r.prepVersion=87;}});
  if(!['88','89','90'].includes(s.build)){
   const players=[s.career?.player,...(s.registry||[]),...(s.rivals||[]),...(s.career?.series?.npcs||[]),...oldRaces.flatMap(r=>r.runners||[])].filter(Boolean);
   for(const p of players)if(p.adjust){for(const part of ['motor','prop'])p.adjust[part+'Success']=Math.min(70,p.adjust[part+'Success']);}
   s.build='88';s.migrationNotice='v88へ移行。基礎能力・賞金・走行位置を維持。整備の基礎成功率は上限70%に調整。進行中の行動残数は保持し、次走から練習1回＋調整1回。';
  }
  if(s.build!==D.build){s.build=D.build;s.migrationNotice='v90へ更新しました。育成とレースの進行を引き継いでいます。';}
  if(!validState(s))throw new Error('対応するセーブ形式ではないか、データが破損しています。');
  oldRaces.forEach(r=>{if(r.watch&&!r.drive&&!r.done){startDrive(s.career&&s.career.series&&s.career.series.race===r?s.career:s,r);syncSpectator(r);}});
  if(!validState(s))throw new Error('旧観戦データを3周形式へ移行できませんでした。');
  return s;
}

function createSafeStorage(access,key){
  const memory=Object.create(null);let persistent=true;
  try{const disk=access();disk.setItem(key+'_probe','1');disk.removeItem(key+'_probe');}catch(e){persistent=false;}
  return {get persistent(){return persistent;},
    get(k){if(persistent){try{const value=access().getItem(k);if(value!==null)memory[k]=value;return value;}catch(e){persistent=false;}}return memory[k]||null;},
    set(k,v){memory[k]=v;if(persistent){try{access().setItem(k,v);}catch(e){persistent=false;}}},
    remove(k){delete memory[k];try{access().removeItem(k);}catch(e){persistent=false;}}
  };
}
// Three independent full-state snapshots; archives preserve raw pre-migration bytes.
function createSaveSlots(storage,prefix='kyotei_slots_v1'){
 const parse=(key,fallback)=>{try{return JSON.parse(storage.get(key)||'null')||fallback;}catch(_){return fallback;}};
 const slotKey=i=>{if(!Number.isInteger(i)||i<1||i>3)throw Error('保存枠は1〜3です。');return prefix+'_'+i;};
 const archives=()=>{const a=parse(prefix+'_archives',[]);return Array.isArray(a)?a.filter(x=>x&&typeof x.raw==='string'&&typeof x.reason==='string'&&typeof x.date==='string').slice(0,4):[];};
 function archive(raw,reason){decode(raw);const entries=archives();if(entries.some(x=>x.raw===raw))return;entries.unshift({raw,reason,date:new Date().toISOString()});storage.set(prefix+'_archives',JSON.stringify(entries.slice(0,4)));}
 return {
  list(){return [1,2,3].map(i=>{const raw=storage.get(slotKey(i));if(!raw)return {id:i,empty:true};try{const s=decode(raw);return {id:i,empty:false,name:s.career?.player?.name||'育成なし',stage:s.career?.stage,savedAt:s.savedAt,registry:s.registry.length};}catch(_){return {id:i,empty:false,broken:true};}});},
  save(i,state){const key=slotKey(i),raw=JSON.stringify(state);decode(raw);const previous=storage.get(key);if(previous)archive(previous,'保存枠'+i+'の上書き前');storage.set(key,raw);},
  load(i){const raw=storage.get(slotKey(i));if(!raw)throw Error('空の保存枠です。');return decode(raw);},
  archive,archives(){const update=parse(prefix+'_update',null);return [...(update&&typeof update.raw==='string'?[update]:[]),...archives()];},
  restore(i){const entry=this.archives()[i];if(!entry)throw Error('バックアップが見つかりません。');return decode(entry.raw);},
  protect(raw){const original=JSON.parse(raw);if(String(original.build||'legacy')===D.build)return;const marker=prefix+'_protected_'+String(original.build||'legacy').replace(/[^a-z0-9.]/gi,'');if(storage.get(marker))return;decode(raw);storage.set(prefix+'_update',JSON.stringify({raw,reason:'v'+(original.build||'旧版')+'→v'+D.build+' 更新前',date:new Date().toISOString()}));storage.set(marker,'1');}
 };
}
const E={D,R,createSaveSlots,statGrowthRate,tuningOutlook,trainingHint,trainingFactor,tuningLearning,gearTrait,qualificationTarget,recordRace,lateGrowthFactor,prepBonus,consumeAction,formatMoney,startDrive,prepareSpectator,spectatorStep,syncSpectator,prepareAutoRace,stepAutoRace,autoResolve,completeDrive,createSafeStorage,newState,rand,clone,clamp,round,pick,int,shuffle,grade,average,character,equipment,createCareer,startSeries,prepareRace,train,tune,tuningChance,
  makeRace,advance,simulate,ordered,standing,settleRace,continueAfterRace,finishSeries,nextSeries,register,buySkill,buyItem,useItem,quickRace,payQuick,
  acquire,removeWeakness,growthOf,growthFactor,difficulty,rewardRarity,rewardSkill,takeExtraNotice,recommend,choiceProfile,buildInfo,shopReason,validState,decode,validRace,generateShop,invited,odds};
root.KM_ENGINE=E;
if(typeof module!=='undefined'&&module.exports)module.exports=E;
if(typeof document==='undefined')return;
/* Safe storage and presentation layer. */
const STORAGE='kyotei_monogatari_v80',BACKUP=STORAGE+'_backup',LEGACY='kyotei_monogatari_v70_1';
const safeStorage=createSafeStorage(()=>root.localStorage,STORAGE);
const slotStore=createSaveSlots(safeStorage);
let loadNotice='';let state=(function(){for(const key of [STORAGE,BACKUP,LEGACY,LEGACY+'_backup']){const raw=safeStorage.get(key);if(!raw)continue;try{const s=decode(raw);slotStore.protect(raw);if(s.migrationNotice)loadNotice=s.migrationNotice;if(key===BACKUP)loadNotice='直前のバックアップから復元しました。';if(key.startsWith(LEGACY))loadNotice='v70.1の育成データを引き継ぎました。未完了レースはスタートから操船できます。';return s;}catch(e){loadNotice='保存データを読み込めませんでした。JSONバックアップがあれば「データ管理」から復元できます。';}}return newState();})();
let ui={page:'title',returnPage:'title',draft:null,filter:'',rare:'all',category:'all',list:'registry',selection:[],auto:false,quick:false,debug:false};
let driveController=null;
let autoTimer=null,cutinTimer=null,animationFrame=null,renderId=0,toastTimer=null,confirmCallback=null;
const app=document.getElementById('app');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('ja-JP',{maximumFractionDigits:1});
const money=formatMoney;
const plus=n=>(n>=0?'+':'')+round(n,2);
const btn=(label,action,value='',klass='',disabled=false)=>'<button class="btn '+klass+'" data-action="'+action+'" data-value="'+esc(value)+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
const chip=(s,c='')=>'<span class="chip '+c+'">'+s+'</span>';
const box=(title,content,c='')=>'<section class="panel '+c+'"><h2>'+title+'</h2>'+content+'</section>';
const heading=(eyebrow,title,note='')=>'<div class="page-heading"><span class="eyebrow">'+eyebrow+'</span><h1>'+title+'</h1>'+(note?'<p class="muted">'+note+'</p>':'')+'</div>';
function save(){const old=safeStorage.get(STORAGE);state.build=D.build;state.savedAt=new Date().toISOString();if(old){try{slotStore.protect(old);}catch(_){}}safeStorage.set(STORAGE,JSON.stringify(state));if(old){try{decode(old);safeStorage.set(BACKUP,old);}catch(e){/* Preserve the last valid backup. */}}}
function toast(text){const t=document.getElementById('toast');t.textContent=text;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3500);}
function stopAuto(){ui.auto=false;clearTimeout(autoTimer);autoTimer=null;}
function navigate(page){if(driveController){driveController.destroy();driveController=null;}stopAuto();ui.page=page;render();root.scrollTo({top:0,behavior:'auto'});}
function currentRace(){return ui.quick?state.quick&&state.quick.race:state.career&&state.career.series&&state.career.series.race;}
function careerPage(){return state.career?state.career.status:'title';}
function abilityChip(id){const a=ability(id);return '<button class="skill-chip '+a.rarity.toLowerCase()+(isWeak(id)?' weak':'')+'" data-action="ability" data-value="'+id+'"><b>'+a.rarity+'</b> '+esc(a.name)+'<span class="skill-category">'+a.category+'</span></button>';}
function skills(p){return '<div class="skill-chips">'+(p.skills.length?p.skills.map(abilityChip).join(''):'<span class="muted">まだ能力を持っていません</span>')+'</div>';}
function growthArrow(v){return v>=1.5?'↑↑':v>=1.2?'↑':v>=1?'→':'↓';}
function parameter(value,range=null,signed=false){const v=R.gradeValue(value,range);return '<span class="parameter">'+(signed&&v.value>=0?'+':'')+v.value+'<i class="grade grade-'+v.rank+'">'+v.rank+'</i></span>';}
function statsPanel(p,compact=false){const g=growthOf(p);return '<div class="stats-grid'+(compact?' compact':'')+'">'+keys.map(k=>'<div class="stat"><span>'+D.stats[k]+' <em class="growth-arrow" title="成長型による伸びやすさ">'+growthArrow(g.values[k])+'</em></span><strong>'+parameter(p.stats[k])+'</strong><div class="stat-track"><span style="width:'+p.stats[k]+'%"></span></div></div>').join('')+'</div>';}

function adjustPanel(p){return '<div class="adjust-grid">'+[['motor','モーター'],['prop','プロペラ']].map(([k,label])=>'<div><span class="muted">'+label+'</span><b>成功 '+parameter(p.adjust[k+'Success'])+' / ムラ '+parameter(p.adjust[k+'Var'])+'</b><small>現在の調整成功率 '+Math.floor(tuningChance(p,k)*100)+'%</small></div>').join('')+'</div>';}

function equipmentPanel(p){if(!p.equipment)return '';return '<div class="equipment-grid">'+[['boat','BOAT','ボート'],['motor','MOTOR','モーター'],['prop','PROPELLER','プロペラ']].map(([part,en,label])=>'<div><span class="eyebrow">'+en+'</span><b>'+label+'</b>'+(part==='boat'?'':'<small>'+gearTrait(part,p.equipment[part])+'</small>')+'<p>'+Object.entries(p.equipment[part]).filter(([k])=>k!=='trait').map(([k,v])=>'<span class="gear-parameter">'+(k==='condition'?'状態':k==='stability'?'安定':D.stats[k])+' '+parameter(v,R.equipmentRange(part,k),!['condition','stability'].includes(k))+'</span>').join('')+'</p></div>').join('')+'</div>';}

function synergy(p){const b=buildInfo(p),links=R.buildLinks(p),ready=links.filter(x=>x.ready),near=links.find(x=>!x.ready&&x.missing.length<=1);return '<div class="synergy"><div>'+chip(b.name,'teal')+' <span>'+b.plus+'</span></div><p><span>注意</span>'+b.caution+'</p><p><span>戦術</span>'+b.tactic+'</p>'+ready.map(x=>'<p class="combo-line"><b>連携 '+esc(x.name)+'</b><small>'+esc(x.description)+'</small></p>').join('')+(near?'<p class="combo-hint">次の連携：'+esc(near.name)+' · '+(near.missing.length?near.missing.map(g=>g.slice(0,2).map(id=>ability(id).name).join(' / ')+(g.length>2?' など':'')).join(' ＋ '):'')+(near.stats.length?' '+near.stats.map(x=>D.stats[x.key]+x.value+'以上').join('・'):'')+'</p>':'')+'</div>';}
function gateProgress(p){const pct=Math.min(100,p.totalEarnings/D.sgThreshold*100);return '<div class="gate"><div><strong>SGへの道</strong><span>'+money(p.totalEarnings)+' <small>/ '+money(D.sgThreshold)+'</small></span></div><div class="stat-track"><span style="width:'+pct+'%"></span></div><p>'+ (pct>=100?'賞金条件達成。G1後期を終えると最高峰へ。':'G1後期終了時に判定。あと '+money(Math.max(0,D.sgThreshold-p.totalEarnings)))+'</p></div>';}
function footer(){return '<footer class="save-footer"><span>'+ (safeStorage.persistent?'自動保存'+(state.savedAt?' · '+new Date(state.savedAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):''):'一時保存中 · 終了前にJSONを書き出してください')+'</span>'+btn('データ管理','data','','text-btn')+'</footer>';}
function openAux(page){ui.backStack=ui.backStack||[];if(ui.page!==page)ui.backStack.push(ui.page);navigate(page);}
function nav(){if(!state.career)return '';return '<nav class="bottom-nav" aria-label="ゲームメニュー">'+btn('育成へ','resume','','text-btn')+btn('能力図鑑','catalog','','text-btn')+btn('データ管理','data','','text-btn')+'</nav>';}
function careerStrip(c){return '<div class="mode-line">'+chip(difficulty(c.player).name,'teal')+'<small>'+(difficulty(c.player).id==='easy'?'勝ちやすい・成長は控えめ':'手応えあり・大きく育つ')+'</small></div><div class="career-strip">'+D.stages.map((s,i)=>'<span class="'+(i===c.stage?'current':i<c.stage?'complete':'')+'" title="'+s.name+'">'+(i===8?'SG':i%2===0?D.tiers[s.tier].label:'後')+'</span>').join('')+'</div>';}
function titleView(){const c=state.career;return '<div class="title-screen"><div class="title-top"><span class="eyebrow">A CAREER ON THE WATER</span><span class="edition">育成 × 一人称レース</span></div><div class="title-layout"><div class="title-copy"><h1>競艇<span>物語</span></h1><div class="title-meta">'+chip('6艇立て')+chip('全9シリーズ')+chip('オフライン対応')+'</div></div><div class="title-course" aria-hidden="true"><div class="start-line">START</div><div class="lane-deck">'+[1,2,3,4,5,6].map(n=>'<div><span class="boat-token boat-'+n+'">'+n+'</span><i></i></div>').join('')+'</div><div class="finish-line">ROOKIE <span>→</span> SG</div></div></div><div class="title-actions">'+btn(c?'つづきから':'選手をつくる',c?'resume':'new','','primary large')+(c?'<p class="continue-info">'+esc(c.player.name)+' · '+D.stages[c.stage].name+'</p>'+btn('はじめから','new','','secondary'):'')+'</div><div class="title-menu">'+btn('特殊能力図鑑','catalog','','menu-btn')+btn('登録選手 <b>'+state.registry.length+'</b>','registry','','menu-btn')+btn('ライバル記録 <b>'+state.rivals.length+'</b>','rivals','','menu-btn')+btn('遊び方','help','','menu-btn')+'</div><div class="title-bottom">'+btn('データ管理','data','','text-btn')+btn('データリセット','reset','','text-btn danger-text')+'</div></div>';}
function difficultyPicker(p){return '<fieldset class="difficulty-picker"><legend>育成の難易度</legend>'+['easy','normal'].map(id=>'<label class="difficulty-option"><input type="radio" name="career-difficulty" value="'+id+'"'+(difficulty(p).id===id?' checked':'')+'><span><b>'+D.difficulties[id].name+'</b><small>'+(id==='easy'?'勝ちやすい · 成長と高レア獲得は控えめ':'手応えのある相手 · 大きく育ち、高レアも狙える')+'</small></span></label>').join('')+'<p class="small muted">難易度は開始後に変更できません。</p></fieldset>';}
function extraActionBanner(a){return a.extras.length?'<aside class="extra-action-notice" role="status"><span class="eyebrow">SPECIAL ABILITY</span><strong>特殊能力で行動が増えました</strong>'+a.extras.map(id=>{const x=ability(id);return '<div><b>'+esc(x.name)+'</b><span>'+(x.effect.action==='tune'?'モーター / プロペラ調整':'トレーニング')+' ＋1回（効果50%）</span></div>';}).join('')+'<p>残り：練習専用 '+a.training+'回 / 調整専用 '+a.tune+'回 / 通常 '+a.normal+'回</p></aside>':'';}
function newView(){const p=ui.draft;return heading('NEW RACER','水面に、名前を。','能力と成長型を確かめてデビューしましょう。')+'<div class="two-column"><section class="panel"><label class="field-label" for="racer-name">選手名</label><input id="racer-name" maxlength="16" value="'+esc(p.name)+'" autocomplete="off" placeholder="名前を入力"><div class="section-line"><h2>初期能力</h2>'+btn('再抽選','reroll','','text-btn')+'</div>'+statsPanel(p)+'<div class="growth-label">'+chip(growthOf(p).name,'teal')+' <span>矢印は伸びやすさ</span></div><details><summary>調整能力を見る</summary>'+adjustPanel(p)+'</details></section>'+box('育成の始め方',difficultyPicker(p)+'<ol class="steps"><li><b>練習で選手を育てる</b><span>基礎能力は次のシリーズにも引き継ぎます。</span></li><li><b>調整で機材を仕上げる</b><span>機材はシリーズごとに抽選。狙う走りに合わせて調整します。</span></li><li><b>自分で艇を操る</b><span>一人称で操舵・加減速。反時計回りに3周します。</span></li></ol><p class="muted">初期能力は何度でも再抽選できます。育成開始後の成長型変更にはアイテムが必要です。</p>'+btn('この選手でデビュー','create','','primary large'))+'</div>'+btn('戻る','title','','text-btn');}
function homeView(){const c=state.career,p=c.player;return heading('CAREER / '+String(c.stage+1).padStart(2,'0'),esc(p.name),D.stages[c.stage].name)+careerStrip(c)+'<div class="two-column"><div>'+box('選手ステータス',statsPanel(p)+'<div class="growth-label">'+chip(growthOf(p).name,'teal')+chip('人気 '+fmt(p.popularity))+'</div>'+synergy(p))+box('特殊能力',skills(p))+'</div><div>'+box('次の水面へ','<div class="wallet"><div><span>所持賞金</span><strong>'+money(p.money)+'</strong></div><div><span>累計獲得賞金</span><b>'+money(p.totalEarnings)+'</b></div></div>'+gateProgress(p)+btn(D.stages[c.stage].name+'へ','series','','primary large'))+box('育成メニュー','<div class="button-row">'+btn('ショップ','shop','','secondary')+btn('アイテム '+sum(Object.values(p.inventory)),'inventory','','secondary')+'</div><details><summary>調整能力</summary>'+adjustPanel(p)+'</details>'+btn('この選手を途中登録する','register','','text-btn'))+'</div></div>';}
function standingsTable(c,preview=false){const ranked=standing(c);return '<div class="table-wrap"><table><thead><tr><th>順位</th><th>選手 / 能力</th><th>出走</th><th>pt</th></tr></thead><tbody>'+ranked.map((p,i)=>'<tr class="'+(p.id===c.player.id?'own-row':'')+'"><td><span class="standing-number '+(i<6?'qualifying':i<12?'semi':'')+'">'+(i+1)+'</span></td><td><b>'+esc(p.name)+(p.id===c.player.id?' <span class="you">YOU</span>':'')+'</b><small>総合 '+grade(average(p))+' · 人気 '+fmt(p.popularity)+(p.skills.some(id=>rarity(id)>=4)?' · '+p.skills.filter(id=>rarity(id)>=4).map(id=>ability(id).rarity).join('/'):'')+'</small></td><td>'+sum(p.finishes)+'</td><td><b>'+p.points+'</b></td></tr>').join('')+'</tbody></table></div>';}
function seriesIntro(){const c=state.career,s=c.series;return heading('SERIES '+(c.stage+1)+' / 9',esc(s.name),esc(s.venue.name)+' · '+esc(s.venue.note))+'<div class="two-column"><div>'+box('抽選された機材',equipmentPanel(c.player)) +box('開幕前','<p>予選5走。上位6人は優勝戦、7〜12位は準優勝戦へ。各選手の出走数は同じ5走です。</p>'+btn('第1走の準備へ','prepare','','primary large'))+'</div>'+box('出場選手 20名','<details open><summary>参加者一覧</summary>'+standingsTable(c,true)+'</details>')+'</div>';}
function roundLabel(r,c){return r.type==='championship'?'優勝戦':r.type==='consolation'?'準優勝戦':r.type==='exhibition'?'作成選手レース':'予選 '+Math.min(5,(c?c.series.round:0)+1)+' / 5';}
function remainingAction(a){return '残り：練習 '+a.training+'回 · 調整 '+a.tune+'回'+(a.normal?' · 追加 '+a.normal+'回':'');}
function inventoryButtons(c){const list=D.items.filter(x=>c.player.inventory[x.id]>0);return list.length?'<div class="inventory-list">'+list.map(x=>'<div><div><b>'+x.name+' ×'+c.player.inventory[x.id]+'</b><small>'+x.description+'</small></div>'+btn('使う','use',x.id,'secondary')+'</div>').join('')+'</div>':'<p class="muted">所持アイテムはありません。</p>';}
function qualificationPanel(c){const q=qualificationTarget(c);if(q.remaining===0)return '<div class="qualification-strip">予選確定 '+q.rank+'位 · '+(q.rank<=6?'優勝戦':q.rank<=12?'準優勝戦':'敗退')+'</div>';return '<div class="qualification-strip">予選 '+q.rank+'位 · 残り'+q.remaining+'走'+q.targets.map(x=>'<div>'+x.cut+'位圏：現在の境界 '+x.line+'pt／単独で越えるまで '+x.needed+'pt'+(x.needed>x.maxAvailable?'（現在の境界にも届かない）':'')+'</div>').join('')+'<small>他選手の得点も増えます。必要点は現時点の目安で、進出保証ではありません。</small></div>';}
function actionView(){const c=state.career,a=c.series.action,p=c.player,r=c.series.race;return heading(roundLabel(r,c),'練習と整備',remainingAction(a))+extraActionBanner(a)+qualificationPanel(c)+'<div class="two-column"><div>'+box('トレーニング','<p class="small">伸ばす能力を選ぶ · 矢印は伸びやすさ</p><div class="training-grid">'+keys.map(k=>btn('<span>'+D.stats[k]+' '+growthArrow(growthOf(p).values[k])+'</span><b>'+parameter(p.stats[k])+'</b>','train',k,'training-btn',a.normal+a.training<=0)).join('')+'</div>')+box('モーター / プロペラ調整',tuningPanel(p,a))+'</div><div>'+box('機材と次走補正',equipmentPanel(p)+'<div class="chip-row">'+(keys.filter(k=>r.buff[k]).map(k=>chip(D.stats[k]+' ＋'+R.floor(r.buff[k]),'teal')).join('')||(!r.itemBoost?chip('次走補正なし'):''))+(r.itemBoost?chip('全能力 ＋'+R.floor(r.itemBoost),'gold'):'')+'</div>')+box('アクションログ','<div class="action-log" aria-live="polite">'+a.logs.map(t=>'<p>'+esc(t)+'</p>').join('')+'</div>')+btn('アイテム','inventory','','secondary')+btn('ショップ','shop','','secondary')+btn('出走表を確認する','pre','','primary large')+'<details><summary>調整デバッグ</summary><pre>'+esc(JSON.stringify(a.debug.map(t=>({direction:t.direction,result:t.label,success:t.success,learning:t.learning,extraScale:t.effectScale,before:Object.fromEntries(Object.entries(t.before).filter(([k])=>k!=='trait').map(([k,v])=>[k,R.display(v,R.equipmentRange(t.target,k))])),after:Object.fromEntries(Object.entries(t.after).filter(([k])=>k!=='trait').map(([k,v])=>[k,R.display(v,R.equipmentRange(t.target,k))]))})),null,2))+'</pre></details></div></div>';}
function tuningPanel(p,a){return '<p class="small muted">矢印は成功時の傾向。失敗すると性能が下がることがあります。</p>'+['motor','prop'].map(part=>'<section class="tune-card"><div class="section-line"><h3>'+(part==='motor'?'モーター':'プロペラ')+'</h3>'+chip('成功 '+Math.round(tuningChance(p,part)*100)+'%')+'</div><p class="small muted">'+gearTrait(part,p.equipment[part])+'</p><div class="tune-current">'+tuningOutlook(p,part,'balanced').map(x=>'<div><small>現在の'+x.label+'</small><b>'+parameter(x.value,R.equipmentRange(part,x.key),x.key!=='condition')+'</b></div>').join('')+'</div><div class="adjust-directions">'+[['balanced','バランス'],['primary',part==='motor'?'直線重視':'旋回重視'],['accel','加速重視'],['stability','状態回復']].map(([id,label])=>btn('<b>'+label+'</b><small>'+tuningOutlook(p,part,id).map(x=>x.label+(x.sign>0?'↑':x.sign<0?'↓':'→')).join(' · ')+'</small>','tune',part+':'+id,'secondary',a.normal+a.tune<=0)).join('')+'</div></section>').join('');}
function weatherBar(r){return '<div class="weather-bar"><strong>'+esc(r.venue.name)+'</strong>'+chip(r.env.weather)+chip(r.env.wind+' '+R.speedText(r.env.windSpeed))+'</div>';}
function runnersTable(r){return '<div class="table-wrap"><table class="runners-table"><thead><tr><th>艇</th><th>選手 / 能力</th><th>人気順<br>目安倍率</th></tr></thead><tbody>'+r.runners.slice().sort((a,b)=>a.frame-b.frame).map(n=>'<tr class="'+(n.isPlayer?'own-row':'')+'"><td><span class="boat-token boat-'+n.frame+'">'+n.frame+'</span></td><td><button class="name-button" data-action="racer" data-value="'+esc(n.id)+'">'+esc(n.name)+(n.isPlayer?' <span class="you">YOU</span>':'')+'</button><small>進入'+n.course+' · 総合'+grade(average(n))+' · ファン人気 '+fmt(n.popularity)+'</small><div class="tiny-skills">'+n.skills.slice(0,3).map(id=>'<span class="rarity-text '+ability(id).rarity.toLowerCase()+'">'+esc(ability(id).name)+'</span>').join(' · ')+(n.skills.length>3?' ほか'+(n.skills.length-3):'')+'</div></td><td>'+n.favourite+'番人気<strong>'+n.odds.toFixed(1)+'<small>倍</small></strong></td></tr>').join('')+'</tbody></table></div>';}
function preView(){const c=state.career,r=c.series.race,p=c.player,own=r.runners.find(n=>n.isPlayer);const rough=r.env.weather==='雨'||r.env.windSpeed>=6;return heading(roundLabel(r,c), '出走準備',esc(c.series.name))+qualificationPanel(c)+chip(difficulty(p).name,'teal')+weatherBar(r)+'<div class="two-column"><div>'+box('出走表',runnersTable(r)+'<p class="micro muted">名前を押すと選手詳細を表示します。</p>')+'</div><div>'+box('次走の見立て','<div class="pre-brief">'+chip(own.frame+'号艇 / '+own.course+'コース','teal')+'<p>'+(rough?'荒れた水面。旋回とフィジカル、守りの能力に注目。':own.course<=2?'内から主導権を狙える進入。スタートから1マークが勝負。':'外からの出走。伸び足や差しの相性を見極めたい。')+'</p></div>'+synergy(p)) +box('ティルト調整','<p class="small muted">上げると高速、下げると安定。高角度・低フィジカルでの全速旋回は舵が効きにくく、外へ流れます。</p><div class="tilt-grid">'+[-.5,0,.5,1.5,3].map(v=>'<button class="strategy '+(R.tiltValue(r)===v?'selected':'')+'" data-action="tilt" data-value="'+v+'" aria-pressed="'+(R.tiltValue(r)===v)+'"><b>'+(v>0?'+':'')+v+'°</b><small>'+(v<0?'安定':v===0?'標準':v<1?'伸び足':'高速・不安定')+'</small></button>').join('')+'</div>')+equipmentPanel(p)+'<div class="button-row">'+btn('アクションに戻る','backAction','','secondary')+btn('ショップ','shop','','secondary')+'</div>'+'<div class="race-entry-options">'+btn('自分で操船する','start','','primary large')+btn('観戦モードで進める','skipRace','','secondary large')+'<p class="small muted">操船をAIに任せます。手動で3秒ずつ進めるか、自動高速で観戦できます。育成報酬は共通です。</p></div>'+'</div></div>';}
function trackView(r){const orderedBoats=ordered(r),next=Math.min(4,r.phase+1);return '<div class="race-track" id="race-track">'+(r.drive&&R.raceTime(r.drive)<R.C.lateLimit?'<div class="spectator-start-clock">'+root.KM_DRIVE_UI.startClockView(R.raceTime(r.drive),'spectator-clock-needle')+'</div>':'')+'<svg class="course-svg" viewBox="0 0 600 380" aria-hidden="true"><defs><linearGradient id="water-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#143d4b"/><stop offset="1" stop-color="#0d2739"/></linearGradient></defs><rect width="600" height="380" fill="url(#water-gradient)"/><ellipse cx="300" cy="187" rx="262" ry="140" fill="none" stroke="#71c3ce" stroke-opacity=".16" stroke-width="40"/><ellipse cx="300" cy="187" rx="262" ry="140" fill="none" stroke="#94d5d9" stroke-opacity=".5" stroke-width="1.5"/><ellipse cx="300" cy="187" rx="226" ry="106" fill="#0a2231" stroke="#a6e4e0" stroke-opacity=".12"/><path d="M300 300V350" stroke="#f2c267" stroke-width="2" stroke-dasharray="4 3"/><text x="292" y="365" text-anchor="end">START</text><text x="309" y="365">GOAL</text><text x="24" y="191" text-anchor="middle">2M</text><text x="300" y="25" text-anchor="middle">BACK</text><text x="578" y="191" text-anchor="middle">1M</text></svg><div class="track-center"><div class="track-phase">'+(r.done?'FINISH':r.phase<0?'READY':D.phases[r.phase])+'</div><div class="center-standings">'+orderedBoats.map((n,i)=>'<div class="'+(n.isPlayer?'own':'')+'"><span class="mini-rank">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':i+1)+'</span><span class="mini-boat boat-'+n.frame+'">'+n.frame+'</span><span>'+esc(n.name)+'</span></div>').join('')+'</div></div><div class="boat-layer">'+r.runners.map(n=>{const tp=r.drive?n.trackProgress||0:n.progress;const theta=Math.PI/2-tp*Math.PI*2;const x=r.phase<0?29+(n.frame-1)*8.4:50+Math.cos(theta)*43.66,y=r.phase<0?86:49.21+Math.sin(theta)*36.84;const active=r.cutins.some(e=>e.athleteId===n.id)||n.activations.some(e=>e.phase===r.phase);return '<div class="moving-boat boat-'+n.frame+(n.capsized?' capsized':'')+(active?' activated':'')+'" data-boat="'+esc(n.id)+'" data-from="'+(r.drive?n.previousTrackProgress||0:n.previousProgress)+'" data-to="'+(r.drive?n.trackProgress||0:n.progress)+'" style="left:'+x+'%;top:'+y+'%" aria-label="'+n.frame+'号艇 '+esc(n.name)+' '+(n.capsized?'転覆':rankIn(r,n.id)+'位')+'">'+n.frame+(n.capsized?'<b>転</b>':'')+'</div>';}).join('')+'</div><div class="cutin-layer" id="cutin-layer" aria-live="polite"></div></div>';}
function raceDebug(r){return '<details class="debug" '+(ui.debug?'open':'')+' id="race-debug"><summary>レースデバッグ</summary><div class="debug-status"><span id="cutin-count">カットイン待機数：'+r.cutins.length+'</span><p>対象能力：'+(r.cutins.map(e=>ability(e.abilityId).name).join(' / ')||'なし')+'</p>'+btn('カットイン確認','testCutin','','secondary')+'</div><pre>'+esc(JSON.stringify({phase:r.phase,grade:R.raceGrade(r),difficulty:r.difficulty,physical:r.drive?{laps:r.drive.laps,goal:r.drive.goal,boats:r.drive.boats.map(b=>({frame:b.frame,progress:b.progress,steering:R.steeringLimits(b,R.performance(b,r.drive,r)),pace:R.npcPace(b,r),spectator:R.spectatorAdjustment(b,r.drive,r),signature:b.signature,plan:b.plan,activeEffects:b.effects}))}:null,instructions:r.instructions,cutins:r.cutins.map(e=>e.abilityId),scores:r.runners.map(n=>({name:n.name,frame:n.frame,course:n.course,score:round(n.score),stamina:n.stamina,capsized:n.capsized,phases:n.phaseHistory})),interference:r.events.filter(e=>e.kind==='debuff')},null,2))+'</pre></details>';}
function spectatorView(r){
  if(!r.drive&&!r.done){startDrive(ui.quick?state:state.career,r);syncSpectator(r);}
  const b=r.drive?R.own(r.drive):null,lap=b?Math.min(3,Math.floor(Math.max(0,b.progress)/R.C.length)+1):3;
  return heading('SPECTATOR / 3 LAPS',ui.quick?'作成選手レース':roundLabel(r,state.career),'600mを反時計回りに3周。操船をAIへ委任。能力差を少し和らげ、周回中の小さな調子の波も加味します。')+weatherBar(r)+
    '<div class="chip-row">'+chip(lap+' / 3周','teal')+chip('600m × 3周')+(r.drive?chip(ui.auto?'自動高速':'手動進行','teal'):'')+(b?chip('レース時間 '+root.KM_DRIVE_UI.clock(Math.max(0,R.raceTime(r.drive)))):'')+chip(r.difficulty==='easy'?'イージー':'ノーマル')+'</div>'+trackView(r)+
    '<div class="spectator-controls">'+(r.done?btn('リザルトへ','result','','primary large'):btn('3秒進める','advance','','primary',ui.auto)+btn(ui.auto?'自動を止める':'自動高速','auto','','secondary'))+'</div>'+
    '<div class="spectator-log" role="log" aria-label="レース実況">'+r.logs.slice(-18).map(l=>'<p class="'+esc(l.kind)+'">'+esc(l.text)+'</p>').join('')+'</div>'+raceDebug(r);
}
function raceView(){const r=currentRace();if(!r)return heading('RACE','レースがありません')+btn('タイトルへ','title','','primary');
  if(r.watch)return spectatorView(r);
  if(!r.drive&&!r.done)startDrive(ui.quick?state:state.career,r);
  if(!r.drive)return heading('FINISH','レース結果を引き継ぎました。')+btn('リザルトへ','result','','primary large');
  return root.KM_DRIVE_UI.view(r,ui.quick?'作成選手レース':roundLabel(r,state.career));}

function finishList(result){return '<div class="finish-list">'+result.map((n,i)=>'<div class="'+(n.isPlayer?'own-row':'')+'"><strong class="finish-place">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':i+1)+'</strong><span class="boat-token boat-'+n.frame+'">'+n.frame+'</span><b>'+esc(n.name)+(n.isPlayer?' <span class="you">YOU</span>':'')+'</b>'+(n.special?chip('特別参戦','gold'):'')+'<small>'+(n.startFault==='F'?'フライング':n.startFault==='L'?'出遅れ':n.capsized?'転覆':n.dnf?'リタイア':n.finishTime!=null?root.KM_DRIVE_UI.clock(n.finishTime)+(n.startTime!=null?' / ST '+R.startText(n.startTime):''):n.points?n.points+' pt':'')+'</small></div>').join('')+'</div>';}
function resultAnalysis(z){if(z.driving){const m=z.driving.metrics,good=[],bad=[];
  if(!m.contacts&&!m.boundaries)good.push('接触のない走行で速度を保った');
  if(z.driving.time!==null)good.push('3周を完走 · '+root.KM_DRIVE_UI.clock(z.driving.time));
  if(m.boundaries)bad.push('ブイ・外側境界への接触 '+m.boundaries+'回。ターン前の減速を早めたい');
  if(m.contacts)bad.push('他艇との接触 '+m.contacts+'回。艇間を空けて進路を選ぼう');
  if(m.slideSeconds>15)bad.push('横滑りが長め。加速を緩めて舵角を戻そう');
  if(m.rescues)bad.push('立て直し '+m.rescues+'回 · 通常4秒停止・ブイは0.7秒スタック後に自動方向復帰');
  if(z.capsized)bad.push('旋回中の傾きが限界に到達。減速と舵の戻しで抑えられる');
  if(z.startFault)bad.push(z.startFault==='F'?'F：0.09秒を超えて早く船首がラインを通過。踏み始めを遅らせよう':'L：1.5秒未満に通過できなかった。助走の目安を見て早めに踏もう');
  if(z.driving.metrics.wakeSeconds>6)bad.push('引き波に乗った時間が長め。前走艇の外へ進路をずらそう');
  if(z.startTime!=null&&!z.startFault)good.push('ST '+R.startText(z.startTime)+'で有効スタート');
  if(z.driving.synergies?.length)good.push('連携成立：'+z.driving.synergies.map(id=>D.synergies.find(x=>x.id===id)?.name||id).join('・'));
  if(z.activations.some(e=>e.variant==='boost'))good.push('洞口スペシャルで1周目の出力を強化');
  if(z.activations.some(e=>e.variant==='pivot'))good.push('モンキーターンで全速旋回を補助');
  if(z.activations.some(e=>e.variant==='recoil'))bad.push('洞口スペシャルの3周目の反動で出力が低下');
  if(z.dnf&&!z.startFault)bad.push('未完走。進行ガイドと立て直しで次のゴールを目指そう');
  return '<div class="result-analysis"><div class="chip-row">'+chip(['auto','spectator'].includes(z.driving.controlMode)?'3周観戦':z.driving.controlMode==='assisted'?'途中から観戦':'自分で操船','teal')+'</div><p class="analysis-line"><b>走行</b>最高 '+Math.floor(m.maxSpeed*3.6)+' km/h · '+('ティルト '+R.tiltValue({tilt:z.driving.tilt,strategy:z.driving.setup})+'°')+'</p><p class="analysis-line"><b>良かった点</b>'+(good.join(' / ')||'出走経験を次の育成へ')+'</p><p class="analysis-line"><b>次の一手</b>'+(bad.join(' / ')||'直線で舵を戻し、加速時間を伸ばそう')+'</p><div class="chip-row">'+[...new Set(z.activations.map(e=>e.abilityId))].map(abilityChip).join('')+'</div><p class="small muted">妨害・反射 '+z.debuffEvents.length+'件。能力は引き波・接触・助走応答などにも反映されます。</p></div>';}
  const history=z.playerPhase;
  const total=k=>sum(history.map(x=>x[k]||0));const good=[],attention=[];
  if(total('gear')>6)good.push('機材の足が進行を後押し');
  if(total('training')>0)good.push('能力・アイテムの次走補正が有効');
  if(total('skill')>5)good.push('特殊能力が要所で発動');
  if(total('choice')>8)good.push('フェーズ指示が攻め足を支えた');
  if(total('lane')>2)good.push('内進入の利を生かした');
  if(total('debuff')<0)attention.push('相手の妨害、または反射による能力低下');
  if(total('fatigue')>4)attention.push('体力消耗で終盤の伸びが低下');
  if(total('choice')<0)attention.push('仕掛けの失敗で進行が鈍った');
  if(total('lane')<0)attention.push('外進入のロスを埋める展開が必要');
  if(z.capsized)attention.unshift('ターンで転覆。旋回・体幹と強攻のリスクを確認');
  if(!good.length)good.push('走行経験を基礎能力の成長へ');if(!attention.length)attention.push('次走は水面と相手の能力を再確認');
  return '<div class="analysis-lines"><p><span class="positive">良かった点</span>'+good.slice(0,3).join(' / ')+'</p><p><span class="amber">注意点</span>'+attention.slice(0,3).join(' / ')+'</p></div><div class="order-results">'+z.orders.map(o=>{const h=history.find(h=>h.phase===o.phase);return '<div><span>'+D.phases[o.phase]+'</span><b>'+D.choices[o.phase].find(x=>x.id===o.id).name+'</b><small>'+(!h?'転覆後のため未実行':h.choice>=5?'展開を後押し':h.choice<0?'進行を抑制':'小さく寄与')+(o.automatic?' · 自動':'')+'</small></div>';}).join('')+'</div><details><summary>能力・妨害の詳細</summary><div class="skill-chips">'+Array.from(new Set(z.activations.map(x=>x.abilityId))).map(abilityChip).join('')+'</div><p class="small">'+(z.debuffEvents.length?z.debuffEvents.map(e=>ability(e.abilityId).name+'：'+(e.blocked?e.reflected?'無効化と反射':'無効化':'能力低下')).join(' / '):'妨害・反射の関与なし')+'</p></details>';
}
function resultView(){const c=state.career,z=c.lastResult;const title=z.startFault?z.startFault:z.capsized?'転覆':z.dnf?'棄権':z.place+'着';const evaluation=z.startFault==='F'?'踏み込みが、早かった。':z.startFault==='L'?'スタートに、届かなかった。':z.dnf?'次はゴールを目指そう。':z.capsized?'次につながる立て直しを。':z.place===1?'水面を制した。':z.place<=3?'上位争いに食い込んだ。':'経験を、次の一走へ。';return heading('RACE RESULT',evaluation)+'<div class="result-hero"><div class="result-number">'+title+'</div><div><span>獲得賞金</span><strong>'+money(z.money)+'</strong><div class="chip-row">'+(z.type==='qualifier'?chip(z.points+' pt'):'')+chip('人気 '+plus(z.popularity))+'</div></div></div><div class="two-column"><div>'+box('着順',finishList(z.finish))+box('このレースの要点',resultAnalysis(z))+'</div><div>'+box('能力成長','<div class="growth-results">'+keys.map(k=>'<div><span>'+D.stats[k]+'</span><b>'+plus(z.growthVisible?z.growthVisible[k]:R.floor(z.growth[k]))+'</b><small>'+parameter(c.player.stats[k])+'</small></div>').join('')+'</div>')+box('獲得と克服',z.acquired.length?z.acquired.map(x=>'<div class="acquired">'+abilityChip(x.id)+'<small>'+esc(x.source)+(x.duplicate?' · 習熟 Lv.'+x.level:' · 新規獲得')+(x.statBonus?' · '+D.stats[x.statBonus.key]+'＋'+x.statBonus.visible+(x.statBonus.visible===0?'（端数蓄積）':''):'')+'</small></div>').join(''):'<p class="muted">今回の特殊能力獲得はありません。</p>')+(z.weakness.gained?'<p class="notice warn">弱点を獲得：'+esc(ability(z.weakness.gained).name)+'</p>':'')+(z.weakness.cured?'<p class="notice">弱点を克服：'+esc(ability(z.weakness.cured).name)+'</p>':'')+(z.type==='qualifier'?'<p class="qualification-note">予選現在 <b>'+z.qualificationRank+'位</b> · '+c.player.points+' pt</p>':'')+btn(z.type!=='qualifier'?'シリーズ結果へ':c.series.round===5?'予選順位を確定する':'次のレース前アクションへ','nextRace','','primary large')+'<details><summary>予選順位を見る</summary>'+standingsTable(c)+'</details></div></div>';}
function seriesResultView(){const c=state.career,z=c.history[c.history.length-1];const ending=c.ending;return heading('SERIES RESULT',z.champion?'シリーズ制覇':z.finalType==='eliminated'?'予選敗退':z.finalType==='championship'?'優勝戦 '+z.finalPlace+'着':'準優勝戦 '+z.finalPlace+'着',esc(z.name))+'<div class="two-column"><div>'+box('シリーズの記録','<div class="result-summary"><div><span>獲得賞金</span><strong>'+money(z.money)+'</strong></div><div><span>予選順位</span><strong>'+z.qualificationRank+'位</strong></div></div><div class="growth-results">'+keys.map(k=>'<div><span>'+D.stats[k]+'</span><b>'+plus(z.growthVisible?z.growthVisible[k]:R.floor(z.growth[k]))+'</b></div>').join('')+'</div>'+(z.rival?'<p class="small muted">記憶に残った相手：'+esc(z.rival)+'</p>':''))+box('SG進出条件',gateProgress(c.player)+(ending==='gate'?'<p class="notice warn">必要賞金に届かなかったため、今回の育成はここまでです。最後の買い物をして選手を登録できます。</p>':c.stage===7?'<p class="notice">進出決定。次は最高峰シリーズ。</p>':ending?'<p class="notice">'+(ending==='sgChampion'?'SG制覇、おめでとうございます。':'最高峰シリーズを走り終えました。')+' 最後の買い物をして選手を登録できます。</p>':''))+'</div><div>'+(ending?box('登録前ラストショップ','<p class="small muted">ランダム5候補から1つだけ。通常価格の1.35倍。LR・弱点は出ません。</p>'+shopStock(c,true))+btn('選手を登録してタイトルへ','register','','primary large'):btn('次のシリーズへ','nextSeries','','primary large'))+(!ending?btn('ここで選手を登録する','register','','secondary large'):'')+'<details><summary>予選最終順位</summary>'+standingsTable(c)+'</details></div></div>';}
function shopStock(c,last=false){const s=last?c.lastShop:c.shop;if(!s)return '<p class="muted">在庫は次のシリーズで更新されます。</p>';return '<div class="shop-meta">'+chip('購入 '+s.purchases+' / '+s.limit)+chip('所持 '+money(c.player.money),'gold')+'</div><div class="shop-stock">'+(s.stock.length?s.stock.map(item=>{const a=ability(item.id);const owned=has(c.player,item.id),sold=item.sold||owned;return '<article class="shop-item"><div>'+abilityChip(a.id)+'<p>'+esc(a.description)+'</p><p class="drive-ability-note">実走：'+esc(a.drive.text)+'</p><div class="recommendation">'+esc(shopReason(c.player,a.id))+'</div><div class="chip-row">'+chip(a.category)+'</div></div><div class="shop-buy"><strong>'+money(item.price)+'</strong>'+btn(item.sold?'購入済':owned?'所持済':'購入',last?'buyLast':'buySkill',a.id,'secondary',sold||s.purchases>=s.limit||c.player.money<item.price)+'</div></article>';}).join(''):'<p class="muted">未所持の対象能力がありません。</p>')+'</div>';}
function shopView(){const c=state.career;if(!c)return '';return heading('SHOP','水辺の商店','買い物に使っても、SG条件の累計賞金は減りません。')+btn('育成に戻る','return','','text-btn')+'<div class="two-column"><div>'+box('特殊能力',c.stage<2?'<p class="muted">G3前期から開店。1シリーズ4候補、2つまで購入できます。</p>':shopStock(c))+box('所持アイテム',inventoryButtons(c))+'</div>'+box('レース前アイテム','<p class="small muted">各種1シリーズ2個まで購入。ドリンク・枠指定・追加行動券は1走につき各1個まで使用。</p><div class="item-stock">'+D.items.map(item=>'<article><div><h3>'+item.name+'</h3><p>'+item.description+'</p><small>所持 '+(c.player.inventory[item.id]||0)+'個 · 今期購入 '+(c.shop&&c.shop.itemBuys[item.id]||0)+' / 2</small></div><div><b>'+money(item.price)+'</b>'+btn('購入','buyItem',item.id,'secondary',c.player.money<item.price||(c.shop&&c.shop.itemBuys[item.id]||0)>=2)+'</div></article>').join('')+'</div>')+'</div>';}
const conditions={always:'条件なし',rough:'雨または風速6以上',calm:'雨以外・風速3以下',inner:'進入1〜2コース',outer:'進入4〜6コース',rain:'雨',cross:'横風',behind:'現在3位以下'};
function comboDetails(link){return '<details class="combo-info"><summary>連携 '+esc(link.name)+'</summary><p>'+link.groups.map(g=>g.map(id=>esc(ability(id).name)).join(' / ')).join(' ＋ ')+'</p><p>'+Object.entries(link.need).map(([k,v])=>D.stats[k]+v+'以上').join('・')+'。'+esc(link.description)+'</p></details>';}
function abilityCard(a){return '<article class="catalog-card"><div class="catalog-top">'+abilityChip(a.id)+chip(a.category)+'</div><p>'+esc(a.description)+'</p><p class="ability-drive">実走：'+esc(a.drive.text)+'</p>'+D.synergies.filter(link=>link.groups.some(g=>g.includes(a.id))).map(comboDetails).join('')+'<div class="ability-meta"><span>'+ (a.phases.length?a.phases.map(i=>D.phases[i]).join(' / '):a.type==='entry'?'レース開始時':a.type==='extra'?'レース前':'常時・育成時')+'</span><span>'+conditions[a.condition]+' · '+Math.round(a.chance*100)+'%</span></div><div class="chip-row">'+a.tags.filter(t=>t!==a.category).map(t=>chip(t)).join('')+'</div></article>';}
function catalogList(){const term=ui.filter.trim().toLowerCase();const list=D.abilities.filter(a=>(ui.rare==='all'||a.rarity===ui.rare)&&(ui.category==='all'||a.category===ui.category)&&(!term||(a.name+a.description+a.drive.text+a.tags.join(' ')).toLowerCase().includes(term)));return '<p class="muted small">'+list.length+' / '+D.abilities.length+'種</p><div class="catalog-grid">'+list.map(abilityCard).join('')+'</div>';}
function catalogView(){return heading('ABILITY ARCHIVE','特殊能力図鑑')+btn('戻る','return','','text-btn')+'<div class="filter-bar"><label>検索<input id="ability-search" type="search" value="'+esc(ui.filter)+'" placeholder="能力名・効果"></label><label>レア度<select id="rarity-filter"><option value="all">すべて</option>'+D.rarities.map(x=>'<option'+(ui.rare===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label><label>カテゴリ<select id="category-filter"><option value="all">すべて</option>'+D.categories.map(x=>'<option'+(ui.category===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div><div id="catalog-results">'+catalogList()+'</div>';}
function registryView(rivals=false){const list=rivals?state.rivals:state.registry;return heading(rivals?'RIVAL MEMORY':'RACER ARCHIVE',rivals?'ライバル記録':'登録選手',rivals?'強い相手を最大12名記憶。SG優勝戦に特別参戦することがあります。':'登録は最大50名。6名そろうと作成選手レースを遊べます。')+btn('タイトルへ','title','','text-btn')+(!rivals?'<div class="button-row">'+btn(state.quick?'作成選手レースを再開':'作成選手レース','exhibition','','primary',list.length<6&&!state.quick)+btn('ランダム6人選択','randomSix','','secondary',list.length<6)+'</div>':'')+(list.length?'<div class="registry-grid">'+list.map(p=>'<article class="panel racer-card"><div class="section-line"><h2>'+esc(p.name)+'</h2>'+chip(rivals?'記憶ライバル':p.record?esc(p.record.title):'登録選手','teal')+'</div><p class="small muted">'+(rivals?esc(p.rivalReason||'水面で出会った相手'):'累計 '+money(p.totalEarnings)+' · '+(p.record?p.record.wins:0)+'勝')+'</p>'+(rivals?'':chip(difficulty(p).name,'teal'))+statsPanel(p,true)+skills(p)+'<div class="button-row">'+btn('選手詳細','savedRacer',p.id,'text-btn')+btn('削除',rivals?'deleteRival':'deleteRacer',p.id,'text-btn danger-text')+'</div></article>').join('')+'</div>':'<div class="empty-state"><strong>'+(rivals?'まだ記憶に残る相手はいません':'まだ登録選手はいません')+'</strong><p>'+(rivals?'シリーズを走ると、好成績のライバルを記憶します。':'育成を終えるか、ホームから途中登録してください。')+'</p>'+btn(state.career?'育成に戻る':'選手をつくる',state.career?'resume':'new','','primary')+'</div>');}
function exhibitionView(){if(state.quick){const q=state.quick;return heading('EXHIBITION','作成選手レース')+'<p>進行中のレースがあります。賭けたコインは確定済みです。</p>'+btn(q.race.done?'結果を見る':'レースに戻る',q.race.done?'quickResult':'resumeQuick','','primary large')+btn('登録選手へ','registry','','text-btn');}
  return heading('EXHIBITION','6人で、もう一走。','出走する6人と操船する1人を選択。全員の成長・賞金には影響しません。')+btn('登録選手へ','registry','','text-btn')+'<div class="two-column"><div>'+box('出場選手を選択','<div class="section-line"><span>'+ui.selection.length+' / 6名</span>'+btn('ランダム6人','randomSix','','text-btn')+'</div><div class="select-racers">'+state.registry.map(p=>'<label><input type="checkbox" class="race-selection" value="'+esc(p.id)+'" '+(ui.selection.includes(p.id)?'checked':'')+' '+(!ui.selection.includes(p.id)&&ui.selection.length>=6?'disabled':'')+'><span><b>'+esc(p.name)+'</b><small>総合 '+grade(average(p))+' · '+growthOf(p).name+'</small></span></label>').join('')+'</div>')+'</div>'+box('仮想コインで応援','<div class="wallet"><span>所持コイン</span><strong>'+fmt(state.coins)+'</strong></div><p class="small muted">賭けずに出走できます。的中時は賭けたコインの3倍が戻ります。現金との交換・購入はありません。</p><label class="field-label" for="quick-driver">操船する選手</label><select id="quick-driver">'+ui.selection.map(id=>{const p=state.registry.find(n=>n.id===id);return '<option value="'+id+'">'+esc(p.name)+'</option>';}).join('')+'</select><label class="field-label" for="bet-racer">応援する選手</label><select id="bet-racer"><option value="">賭けない</option>'+ui.selection.map(id=>{const p=state.registry.find(p=>p.id===id);return '<option value="'+esc(id)+'">'+esc(p.name)+'</option>';}).join('')+'</select><label class="field-label" for="bet-stake">コイン数（0〜500）</label><input id="bet-stake" type="number" inputmode="numeric" min="0" max="'+Math.min(500,state.coins)+'" step="1" value="0">'+btn('自分で操船する','launchQuick','','primary large',ui.selection.length!==6)+btn('観戦モードで進める','launchQuick','auto','secondary large',ui.selection.length!==6)+(state.coins<100?btn('練習用コインを1,000に戻す','refill','','text-btn'):'') )+'</div>';}
function quickResultView(){const q=state.quick;if(!q||!q.race.done)return exhibitionView();const result=ordered(q.race).map(n=>({name:n.name,id:n.id,isPlayer:n.isPlayer,frame:n.frame,capsized:n.capsized,dnf:n.dnf,startFault:n.startFault,startTime:n.startTime,finishTime:n.finishTime}));return heading('EXHIBITION RESULT','作成選手レース結果')+chip(q.race.controlMode==='auto'?'おまかせ走行':q.race.controlMode==='assisted'?'途中から観戦':q.race.controlMode==='spectator'?'観戦モード':'自分で操船','teal')+box('着順',finishList(result))+'<div class="result-summary"><div><span>使用コイン</span><strong>'+q.stake+'</strong></div><div><span>戻ったコイン</span><strong>'+q.payout+'</strong></div><div><span>現在のコイン</span><strong>'+state.coins+'</strong></div></div>'+btn('もう一度選手を選ぶ','closeQuick','','primary large')+btn('登録選手へ','registry','','text-btn');}
function helpView(){return heading('HOW TO PLAY','遊び方')+btn('戻る','return','','text-btn')+'<div class="two-column">'+box('育成から登録まで','<ol class="steps"><li><b>選手を作成</b><span>名前・能力・成長型とイージー／ノーマルを確定。初期人気は0。</span></li><li><b>シリーズに出場</b><span>新人、G3、G2、G1を各2期、最後にSG。</span></li><li><b>レース前に練習1回＋調整1回</b><span>練習と、モーターかプロペラの調整を各1回。券や能力で追加も可能です。</span></li><li><b>一人称で3周のレース</b><span>左パッドで操舵、右で加速。離すと減速。600mを反時計回りに3周。操作しない場合は出走前の「観戦モードで進める」を選べます。</span></li><li><b>予選5走と最終戦</b><span>6位まで優勝戦、12位まで準優勝戦。準優勝戦は順位決定の最終戦です。</span></li><li><b>賞金条件を達成してSGへ</b><span>G1後期終了時に累計1,800万円。未達なら登録へ。</span></li><li><b>登録して再挑戦</b><span>登録選手と記憶ライバルはSG優勝戦の特別招待枠に登場。先着で相手の高レア能力を獲得。</span></li></ol>')+box('操船のポイント','<p><b>左下で操舵、右下でアクセル。</b>曲がる前にアクセルを離すと減速します。全開の急旋回や強い接触は転覆に注意。</p><p><b>時計の色帯を参考に発進。</b>針が頂点へ戻る時刻にスタートラインへ。0.09秒を超えて早いとF、1.5秒以上遅いとLです。</p><p><b>練習する能力を選ぶ。</b>矢印が上向きの能力ほど伸びやすくなります。</p><p><b>観戦は3秒ずつ、または自動高速。</b>自動を止めると、ボタンを押すまで進みません。ゴール時は途中で止まります。</p><p><b>機材はシリーズ限り。</b>選手の能力・特殊能力は次のシリーズへ引き継ぎます。</p><p><b>データ管理でバックアップ。</b>ブラウザを変える場合はJSONを書き出して引き継げます。</p>')+'</div>';}
function slotPanel(){return box('3つの保存枠',slotStore.list().map(x=>'<div class="slot-card"><b>枠'+x.id+' · '+(x.empty?'空き':x.broken?'読込不可':esc(x.name))+'</b><div class="button-row">'+btn('現在を保存','slotSave',x.id,'secondary')+btn('読み込む','slotLoad',x.id,'secondary',x.empty||x.broken)+'</div></div>').join('')+'<p class="small muted">各枠は登録選手を含む独立したスナップショット。端末外へ残すには枠を読み込み、JSONを書き出してください。</p>')+box('更新前・上書き前バックアップ',slotStore.archives().map((x,i)=>'<div class="slot-card">'+esc(x.reason)+' · '+esc(x.date.slice(0,16))+btn('復元','archiveLoad',i,'text-btn')+'</div>').join('')+'<p class="small muted">上書き前4件＋更新前専用1件。更新前は移行前のJSONを保持。復元後の走行は現行版の仕様になります。</p>');}
function dataView(){return heading('SAVE DATA','データ管理')+btn('戻る','return','','text-btn')+slotPanel()+'<div class="two-column">'+box('保存とバックアップ','<p class="notice '+(safeStorage.persistent?'':'warn')+'">'+(safeStorage.persistent?'この環境では自動保存が使えます。':'この環境では永続保存が使えません。ページを閉じる前にJSONを書き出してください。')+'</p><p class="small">現在の選手・進行中のレース・登録選手・ショップ在庫をまとめて保存します。</p>'+btn(root.KM_IPHONE?'JSONを共有・保存':'JSONファイルを書き出す','export','','primary large')+btn('コピー用テキストを表示','exportText','','secondary large')+'<p class="micro muted">ブラウザやファイルの置き場所を変えると、別のセーブ領域になる場合があります。</p>')+box('バックアップを読み込む','<label class="field-label" for="import-file">JSONファイルを選択</label><input type="file" id="import-file" accept="application/json,.json"><label class="field-label" for="import-text">またはJSONを貼り付け</label><textarea id="import-text" rows="6" spellcheck="false" placeholder="v80 / v70.1のセーブJSON"></textarea>'+btn('内容を確認して読み込む','import','','secondary large')+'<p class="small muted">読み込み時は現在の進行を置き換えます。v70.1のセーブも引き継げます。旧版の未完了レースはスタート地点から再開します。</p>')+'</div>';}
function runWithoutDriving(){
  if(driveController){driveController.destroy();driveController=null;}
  const r=prepareSpectator(state,ui.quick);if(!r)return;
  if(r.done){save();navigate(ui.quick?'quickResult':'raceResult');return;}
  save();navigate('race');
}
function render(){
  if(driveController){driveController.destroy();driveController=null;}
  const rid=++renderId;clearTimeout(cutinTimer);if(animationFrame)cancelAnimationFrame(animationFrame);
  let content='';const c=state.career;
  if(!c&&['home','seriesIntro','action','preRace','raceResult','seriesResult','shop','registration'].includes(ui.page))ui.page='title';
  switch(ui.page){case'title':content=titleView();break;case'new':content=newView();break;case'home':content=homeView();break;case'seriesIntro':content=seriesIntro();break;case'action':content=actionView();break;case'preRace':content=preView();break;case'race':content=raceView();break;case'raceResult':content=resultView();break;case'seriesResult':content=seriesResultView();break;case'shop':content=shopView();break;case'catalog':content=catalogView();break;case'registry':content=registryView();break;case'rivals':content=registryView(true);break;case'exhibition':content=exhibitionView();break;case'quickResult':content=quickResultView();break;case'help':content=helpView();break;case'data':content=dataView();break;case'registration':content=c.history.length?seriesResultView():heading('CAREER COMPLETE','今回の育成を登録する')+box('登録前ラストショップ',shopStock(c,true))+btn('選手を登録する','register','','primary large');break;default:content=titleView();}
  app.innerHTML=content+(['title','race'].includes(ui.page)?'':footer())+(['home','seriesIntro','action','preRace','raceResult','seriesResult'].includes(ui.page)?nav():'');
  document.body.classList.toggle('in-race',ui.page==='race'&&!currentRace()?.watch);
  if(ui.page==='race'&&currentRace()?.drive&&!currentRace().watch)driveController=root.KM_DRIVE_UI.mount(currentRace(),state.settings,{save,skip:runWithoutDriving,finish(){completeDrive(state,ui.quick);save();},exit(){navigate('title');}});
  if(ui.page==='action'){const notice=takeExtraNotice(c.series.action);if(notice){save();toast(notice);}}
  if(ui.page==='race'&&currentRace()?.watch){animateTrack(rid);queueCutins(currentRace().cutins.slice(),rid);const log=document.querySelector('.spectator-log');if(log)log.scrollTop=log.scrollHeight;}
}
function animateTrack(rid){if(currentRace().phase<0)return;const reduce=root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;const nodes=Array.from(document.querySelectorAll('[data-boat]'));if(reduce)return;
  const started=performance.now(),duration=700/state.settings.speed;
  function frame(now){if(rid!==renderId)return;const t=clamp((now-started)/duration,0,1),eased=1-Math.pow(1-t,3);nodes.forEach(node=>{const from=Number(node.dataset.from),to=Number(node.dataset.to),p=from+(to-from)*eased;const angle=Math.PI/2-p*2*Math.PI;node.style.left=(50+Math.cos(angle)*43.66)+'%';node.style.top=(49.21+Math.sin(angle)*36.84)+'%';});if(t<1)animationFrame=requestAnimationFrame(frame);}
  animationFrame=requestAnimationFrame(frame);
}
function queueCutins(queue,rid){clearTimeout(cutinTimer);const layer=document.getElementById('cutin-layer');if(!layer||rid!==renderId)return;layer.innerHTML='';
  const count=document.getElementById('cutin-count');if(count)count.textContent='カットイン待機数：'+queue.length;
  if(!queue.length)return;const event=queue.shift(),a=ability(event.abilityId);if(!a)return;
  const div=document.createElement('div');div.className='cutin '+a.rarity.toLowerCase();div.innerHTML='<div class="cutin-line"><span class="boat-token boat-'+event.frame+'">'+event.frame+'</span><span>'+esc(event.name)+'</span><b>'+a.rarity+'</b></div><strong>'+esc(a.name)+'</strong><small>'+root.KM_DRIVE_UI.signatureCaption(event)+'</small>';layer.appendChild(div);
  cutinTimer=setTimeout(()=>{if(rid!==renderId)return;div.remove();queueCutins(queue,rid);},1500);
}
function openModal(title,content){if(driveController)driveController.pause();stopAuto();const modal=document.getElementById('modal');ui.previousFocus=document.activeElement;modal.innerHTML='<div class="modal-backdrop" data-action="closeModal"></div><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="section-line"><h2 id="modal-title">'+title+'</h2>'+btn('閉じる','closeModal','','text-btn')+'</div>'+content+'</section>';modal.hidden=false;document.body.classList.add('modal-open');const focus=modal.querySelector('button,input,select,textarea');if(focus)focus.focus();}
function closeModal(){document.getElementById('modal').hidden=true;document.getElementById('modal').innerHTML='';document.body.classList.remove('modal-open');confirmCallback=null;if(ui.previousFocus&&ui.previousFocus.isConnected)ui.previousFocus.focus();if(ui.page==='race')render();}
function confirmAction(title,content,fn,label='実行する'){openModal(title,'<p>'+content+'</p><div class="button-row">'+btn('キャンセル','closeModal','','secondary')+btn(label,'confirm','','primary')+'</div>');confirmCallback=fn;}
function careerPanel(p){const h=p.careerLog;if(!h)return '<p class="small muted">経歴はv88以降のレースから記録します。</p>';const favored=Object.entries(h.venues).sort((a,b)=>b[1].wins-a[1].wins||b[1].races-a[1].races)[0];return '<h3>選手の経歴</h3><p class="small">記録対象 '+h.races+'走 / '+h.wins+'勝'+(h.firstWin?' · 記録内の初勝利 '+esc(h.firstWin):'')+(h.bestST!==null?' · 最良ST '+R.startText(h.bestST):'')+'</p>'+(favored?'<p class="small">最多勝水面 '+esc(D.venues.find(v=>v.id===favored[0])?.name||favored[0])+' '+favored[1].wins+'勝</p>':'')+'<ul class="career-log">'+h.highlights.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';}
function showPlayer(p){openModal(esc(p.name),statsPanel(p)+synergy(p)+skills(p)+careerPanel(p)+'<details><summary>調整能力と機材</summary>'+adjustPanel(p)+equipmentPanel(p)+'</details>');}
async function exportSave(asText=false){save();const text=JSON.stringify(state,null,2);if(asText){openModal('セーブJSON','<p class="small">全選択してコピーし、メモなどに保存できます。</p><textarea id="export-json" rows="12" readonly>'+esc(text)+'</textarea>'+btn('全選択','selectExport','','secondary large'));return;}
  if(root.KM_IPHONE){const result=await root.KM_IPHONE.shareBackup(text,'kyotei_save_'+new Date().toISOString().slice(0,10)+'.json');if(result==='shared'){toast('共有先へ渡しました。保存先を確認してください。');return;}if(result==='cancelled')return;exportSave(true);toast('共有保存が使えないため、コピー用テキストを表示しました。');return;}
  const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kyotei_save_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('JSONを書き出しました。保存されない場合はコピー用テキストをご利用ください。');
}
function doAdvance(selected=null){const r=currentRace();if(!r||r.done||!r.watch)return;
  spectatorStep(state,ui.quick,selected,180);
  if(r.done)stopAuto();save();render();if(ui.auto)scheduleAuto();
}
function scheduleAuto(){clearTimeout(autoTimer);if(!ui.auto||ui.page!=='race')return;const r=currentRace();if(r.done){stopAuto();return;}const delay=Math.max(170,500/state.settings.speed);autoTimer=setTimeout(()=>doAdvance(),delay);}
function refreshCareer(){ui.quick=false;ui.page=careerPage();save();render();}
function showInventory(){const c=state.career;if(c)openModal('所持アイテム',inventoryButtons(c));}
function startNew(){const seedHolder={seed:int(state,1,0x7fffffff)};ui.draft=character(seedHolder,'水瀬 湊');navigate('new');}
const actions={
  slotSave(v){const i=Number(v);confirmAction('枠'+i+'へ保存','この枠を現在の全データで置き換えます。以前の内容はバックアップへ残します。',()=>{save();slotStore.save(i,state);closeModal();render();toast('保存しました。');},'保存');},
  slotLoad(v){let next;try{next=slotStore.load(Number(v));}catch(e){toast(e.message);return;}confirmAction('保存枠を読み込む','現在の進行をバックアップして、この枠へ切り替えます。',()=>{save();slotStore.archive(JSON.stringify(state),'保存枠の読込前');state=next;ui.quick=false;closeModal();save();navigate('title');},'読み込む');},
  archiveLoad(v){let next;try{next=slotStore.restore(Number(v));}catch(e){toast(e.message);return;}confirmAction('バックアップを復元','現在の進行を退避して復元します。ゲームの仕様は現行版を使用します。',()=>{slotStore.archive(JSON.stringify(state),'復元前');state=next;ui.quick=false;closeModal();save();navigate('title');},'復元');},
  title(){navigate('title');},new(){if(state.career)confirmAction('新しい選手で始める','育成中の選手の進行を置き換えます。登録選手とライバルは残ります。',startNew,'作成画面へ');else startNew();},
  reroll(){const name=document.getElementById('racer-name').value,mode=document.querySelector('input[name="career-difficulty"]:checked').value;ui.draft=character(state,name);ui.draft.difficulty=mode;render();},
  create(){const name=document.getElementById('racer-name').value.trim();if(!name){toast('選手名を入力してください。');return;}ui.draft.name=name;ui.draft.difficulty=document.querySelector('input[name="career-difficulty"]:checked').value;createCareer(state,ui.draft);refreshCareer();},
  resume(){ui.quick=false;navigate(careerPage());},
  series(){if(startSeries(state))refreshCareer();},prepare(){prepareRace(state);refreshCareer();},

  train(v){const c=state.career;if(!c)return;const result=train(c,v);if(result){save();render();toast(result.text+(result.prep?' / '+ability(result.prep.abilityId).name+' 発動！次の1レースに補正':''));}},
  tune(v){const c=state.career;if(!c)return;const [part,direction]=v.split(':');const result=tune(c,part,direction||'balanced');if(result){save();render();toast(result.text);}},
  pre(){if(!state.career||state.career.status!=='action')return;state.career.status='preRace';refreshCareer();root.scrollTo(0,0);},
  backAction(){if(state.career&&state.career.status==='preRace'){state.career.status='action';refreshCareer();}},
  tilt(v){const angle=Number(v);if([-.5,0,.5,1.5,3].includes(angle)&&state.career.status==='preRace'){state.career.series.race.tilt=angle;save();render();}},
  strategy(v){if(['balanced','attack','safe'].includes(v)&&state.career.status==='preRace'){state.career.series.race.strategy=v;save();render();}},
  start(){if(state.career.status!=='preRace')return;state.career.status='race';ui.quick=false;startDrive(state.career,state.career.series.race);save();navigate('race');},
  skipRace(){ui.quick=false;runWithoutDriving();},
  advance(){doAdvance();},choice(v){if(!ui.auto&&D.choices[currentRace().phase+1]?.some(o=>o.id===v))doAdvance(v);},
  auto(){if(currentRace().done)return;ui.auto=!ui.auto;if(ui.auto){render();scheduleAuto();}else{stopAuto();render();}},
  result(){if(!currentRace().done)return;stopAuto();if(ui.quick)navigate('quickResult');else navigate('raceResult');},
  nextRace(){continueAfterRace(state);refreshCareer();root.scrollTo(0,0);},nextSeries(){nextSeries(state);refreshCareer();root.scrollTo(0,0);},
  register(){const c=state.career;if(!c)return;if(state.registry.length>=50){toast('登録上限50名です。登録選手一覧で枠を空けてください。');return;}
    confirmAction('選手を登録する',esc(c.player.name)+'を登録し、今回の育成を終了します。'+(c.ending&&c.lastShop.purchases===0?'ラストショップは未購入です。':''),()=>{register(state,true);save();navigate('registry');},'登録する');},
  shop(){if(!state.career)return;openAux('shop');},
  buySkill(v){const result=buySkill(state.career,v);if(result.error)toast(result.error);else{save();render();toast(ability(v).name+'を獲得しました。'+(result.statBonus?' '+D.stats[result.statBonus.key]+'＋'+result.statBonus.visible+(result.statBonus.visible===0?'（端数蓄積）':''):''));}},
  buyLast(v){confirmAction('最後の買い物',esc(ability(v).name)+'を購入します。購入できる能力は1つだけです。',()=>{const result=buySkill(state.career,v,true);if(result.error)toast(result.error);else{save();render();toast(ability(v).name+'を獲得しました。'+(result.statBonus?' '+D.stats[result.statBonus.key]+'＋'+result.statBonus.visible+(result.statBonus.visible===0?'（端数蓄積）':''):''));}},'購入する');},
  buyItem(v){const result=buyItem(state.career,v);if(result.error)toast(result.error);else{save();render();toast('購入しました。「使う」で適用できます。');}},
  inventory(){showInventory();},
  use(v){const c=state.career;if(!c)return;if(v==='cure'){const list=c.player.skills.filter(isWeak);if(!list.length){toast('克服する弱点がありません。');return;}openModal('克服する弱点',list.map(id=>btn(esc(ability(id).name),'cure',id,'secondary large')).join(''));return;}
    const result=useItem(c,v);if(result.error){toast(result.error);return;}save();closeModal();if(ui.page==='shop'){render();}else refreshCareer();toast(D.items.find(x=>x.id===v).name+'を使いました。');},
  cure(v){const result=useItem(state.career,'cure',v);if(result.error)toast(result.error);else{save();closeModal();render();toast('弱点を克服しました。');}},
  ability(v){const a=ability(v);if(a)openModal(esc(a.name),abilityCard(a)+(state.career&&has(state.career.player,v)?'<p class="small">所持 · 習熟 Lv.'+(state.career.player.mastery[v]||1)+'</p>':''));},
  racer(v){const p=currentRace()?.runners.find(n=>n.id===v);if(p)showPlayer(p);},savedRacer(v){const p=state.registry.concat(state.rivals).find(n=>n.id===v);if(p)showPlayer(p);},
  catalog(){ui.filter='';openAux('catalog');},registry(){ui.quick=false;navigate('registry');},rivals(){navigate('rivals');},
  deleteRacer(v){const p=state.registry.find(n=>n.id===v);if(p)confirmAction('登録選手を削除',esc(p.name)+'を削除します。',()=>{state.registry=state.registry.filter(n=>n.id!==v);ui.selection=ui.selection.filter(id=>id!==v);save();render();},'削除する');},
  deleteRival(v){const p=state.rivals.find(n=>n.id===v);if(p)confirmAction('ライバルを削除',esc(p.name)+'の記録を削除します。',()=>{state.rivals=state.rivals.filter(n=>n.id!==v);save();render();},'削除する');},
  exhibition(){navigate('exhibition');},randomSix(){if(state.quick){navigate('exhibition');return;}if(state.registry.length<6)return;ui.selection=shuffle(state,state.registry).slice(0,6).map(p=>p.id);navigate('exhibition');},
  launchQuick(mode){const stake=Number(document.getElementById('bet-stake').value),bet=document.getElementById('bet-racer').value;const result=quickRace(state,ui.selection,bet,stake,document.getElementById('quick-driver').value);if(result.error){toast(result.error);return;}ui.quick=true;if(mode==='auto'){runWithoutDriving();}else{startDrive(state,state.quick.race);save();navigate('race');}},
  resumeQuick(){ui.quick=true;navigate('race');},quickResult(){ui.quick=true;payQuick(state);save();navigate('quickResult');},closeQuick(){if(state.quick&&!state.quick.race.done)return;state.quick=null;ui.quick=false;save();navigate('exhibition');},
  refill(){if(state.coins<100&&!state.quick){state.coins=1000;save();render();}},
  help(){openAux('help');},data(){openAux('data');},return(){navigate(ui.backStack&&ui.backStack.pop()||'title');},
  export(){exportSave();},exportText(){exportSave(true);},selectExport(){document.getElementById('export-json').select();},
  import(){let imported;try{imported=decode(document.getElementById('import-text').value);}catch(e){toast(e.message);return;}
    confirmAction('セーブを読み込む',(imported.career?esc(imported.career.player.name)+' · '+D.stages[imported.career.stage].name:'育成中の選手なし')+' / 登録 '+imported.registry.length+'名。現在の進行と登録データを置き換えます。',()=>{slotStore.archive(JSON.stringify(state),'JSON読込前');state=imported;ui.quick=false;save();navigate('title');toast('セーブを読み込みました。');},'読み込む');},
  reset(){confirmAction('現在の進行をリセット','現在の育成・登録選手・ライバル・コインを初期化します。3つの保存枠とバックアップは残ります。',()=>{stopAuto();safeStorage.remove(STORAGE);safeStorage.remove(BACKUP);state=newState();ui.quick=false;ui.selection=[];save();navigate('title');},'すべて削除');},
  testCutin(){const r=currentRace();const p=r.runners.find(n=>n.isPlayer);queueCutins([{athleteId:p.id,name:p.name,frame:p.frame,abilityId:'mirror'}],renderId);},
  closeModal(){closeModal();},confirm(){const fn=confirmCallback;closeModal();if(fn)fn();}
};
document.addEventListener('click',event=>{if(ui.resolving)return;const node=event.target.closest('[data-action]');if(!node||node.disabled)return;const fn=actions[node.dataset.action];if(!fn)return;try{fn(node.dataset.value);}catch(e){console.error(e);stopAuto();toast('処理を完了できませんでした。データ管理からバックアップを保存してください。');}});
document.addEventListener('input',event=>{if(event.target.id==='ability-search'){ui.filter=event.target.value;document.getElementById('catalog-results').innerHTML=catalogList();}});
document.addEventListener('change',event=>{const t=event.target;if(t.id==='rarity-filter'||t.id==='category-filter'){ui[t.id==='rarity-filter'?'rare':'category']=t.value;document.getElementById('catalog-results').innerHTML=catalogList();}
  if(t.id==='race-speed'){state.settings.speed=Number(t.value);save();if(ui.auto)scheduleAuto();}
  if(t.classList.contains('race-selection')){if(t.checked&&ui.selection.length<6)ui.selection.push(t.value);else ui.selection=ui.selection.filter(x=>x!==t.value);render();}
  if(t.id==='import-file'&&t.files[0]){if(t.files[0].size>5000000){toast('ファイルが大きすぎます。');t.value='';return;}const reader=new FileReader();reader.onload=()=>{const area=document.getElementById('import-text');if(area)area.value=String(reader.result);};reader.onerror=()=>toast('ファイルを読み取れませんでした。');reader.readAsText(t.files[0]);}
});
document.addEventListener('keydown',event=>{const modal=document.getElementById('modal');if(modal.hidden)return;if(event.key==='Escape'){event.preventDefault();closeModal();}if(event.key==='Tab'){const nodes=Array.from(modal.querySelectorAll('button:not([disabled]),input,select,textarea,[tabindex="0"]'));const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();if(driveController)driveController.pause();if(ui.resolving)save();}});
root.addEventListener('pagehide',()=>{if(ui.resolving)save();});
render();
if(loadNotice)toast(loadNotice);
root.KM_APP={getState:()=>clone(state),export:()=>JSON.stringify(state),safeStorage};
})(typeof globalThis!=='undefined'?globalThis:window);
