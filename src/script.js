

/* 競艇物語 v105
 * Pure calculation API: KM_ENGINE. Browser UI starts only when document exists.
 * State is serializable. Every random draw consumes the saved seed.
 */
(function (root) {
'use strict';
const Memory146=root.KM_MEMORY146||(typeof require==='function'?require('./memory146.js'):null);
const Support146=root.KM_SUPPORT146||(typeof require==='function'?require('./support146.js'):null);
const Review145=root.KM_REVIEW145||(typeof require==='function'?require('./review145.js'):null);
const Challenge145=root.KM_CHALLENGE145||(typeof require==='function'?require('./challenge145.js'):null);
const Progress144=root.KM_PROGRESS144||(typeof require==='function'?require('./progress144.js'):null);
const D = root.KM_DATA || (typeof require === 'function' ? require('./data.js') : null);
const Awakening136=root.KM_AWAKENING136||(typeof require==='function'?require('./awakening136.js'):null);
const Journey134=root.KM_JOURNEY134||(typeof require==='function'?require('./journey134.js'):null);
const Practice133=root.KM_PRACTICE133||(typeof require==='function'?require('./practice133.js'):null);
const Hard=root.KM_HARD129||(typeof require==='function'?require('./hard129.js'):null);
const Social=root.KM_SOCIAL129||(typeof require==='function'?require('./social129.js'):null);
const Reader=root.KM_READER129||(typeof require==='function'?require('./reader129.js'):null);
const Workshop=root.KM_WORKSHOP128||(typeof require==='function'?require('./workshop128.js'):null);
const R = root.KM_RACING || (typeof require === 'function' ? require('./racing.js') : null);
const Story=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const Campaign=root.KM_CAMPAIGN||(typeof require==='function'?require('./campaign.js'):null);
const Cast=root.KM_CAST||(typeof require==='function'?require('./cast.js'):null);
const Profile=root.KM_PROFILE||(typeof require==='function'?require('./profile.js'):null);
const Bonds=root.KM_BONDS||(typeof require==='function'?require('./bonds.js'):null);
const Development=root.KM_DEVELOPMENT||(typeof require==='function'?require('./development.js'):null);
const Finale=root.KM_FINALE||(typeof require==='function'?require('./finale.js'):null);
const Introductions126=root.KM_INTRODUCTIONS126||(typeof require==='function'?require('./introductions126.js'):null);
const Cheer126=root.KM_CHEER126||(typeof require==='function'?require('./cheer126.js'):null);
const Epilogues126=root.KM_EPILOGUES126||(typeof require==='function'?require('./epilogues126.js'):null);
const Affinity=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);
const Drama=root.KM_DRAMA||(typeof require==='function'?require('./drama.js'):null);
const Dialogue=root.KM_DIALOGUE||(typeof require==='function'?require('./dialogue.js'):null);
const Craft=root.KM_CRAFT||(typeof require==='function'?require('./craft118.js'):null);
const Storage122=root.KM_STORAGE||(typeof require==='function'?require('./storage122.js'):null);
const Review122=root.KM_REVIEW||(typeof require==='function'?require('./review122.js'):null);
const Practice122=root.KM_PRACTICE122||(typeof require==='function'?require('./practice122.js'):null);
const Coaching=root.KM_COACHING||(typeof require==='function'?require('./coaching121.js'):null);
const Flow=root.KM_FLOW131||(typeof require==='function'?require('./flow131.js'):null);
const Scenes=root.KM_SCENE131||(typeof require==='function'?require('./scene131.js'):null);
const Improve141=root.KM_IMPROVE141||(typeof require==='function'?require('./improve141.js'):null);
const After143=root.KM_AFTER143||(typeof require==='function'?require('./after143.js'):null);
const Passage143=root.KM_PASSAGE143||(typeof require==='function'?require('./passage143.js'):null);
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
const grade = n => n>100?'SS':n>=90?'S':n>=80?'A':n>=65?'B':n>=50?'C':n>=35?'D':'E';
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
  const a=ability(id),rare=rewardRarity(p,a.rarity),pool=D.abilities.filter(x=>!x.exclusive&&x.rarity===rare&&x.category===a.category&&!isWeak(x.id));
  return pool.length?pick(c,pool).id:randomSkill(c,[rare],p.skills)||randomSkill(c,[rare]);
}
function newState(seed=Date.now()>>>0) {return {version:D.version,build:D.build,seed:seed||127,career:null,registry:[],rivals:[],coins:1000,quick:null,settings:{speed:1,postureAssist:false,haptics:true,raceFX:'full',textSize:'normal',contrast:'standard'},savedAt:null};}
function equipment(c){
  const e={boat:{stability:int(c,40,86),turn:int(c,-2,9),accel:int(c,-2,8)},motor:{speed:int(c,-3,13),accel:int(c,-2,10),condition:int(c,65,98),trait:int(c,0,3)},prop:{turn:int(c,-3,12),accel:int(c,-2,9),condition:int(c,65,98),trait:int(c,0,3)}};
  for(const part of ['motor','prop']){const g=e[part],key=part==='motor'?'speed':'turn';if(g.trait===1){g[key]+=3;g.accel-=1.5;g.condition-=4;}if(g.trait===2){g[key]-=1.5;g.accel+=3;}if(g.trait===3){g[key]-=1;g.accel-=.5;g.condition=Math.min(100,g.condition+5);}}
  for(const part of ['motor','prop']){const quality=Workshop.drawQuality(rand(c),rand(c)),key=part==='motor'?'speed':'turn';e[part][key]=round(-15+quality*.45,4);}
  return e;
}
function gearTrait(part,gear){return (part==='motor'?['均衡型','伸び型','出足型','安定型']:['均衡型','旋回型','立ち上がり型','安定型'])[gear.trait||0];}
function character(c,name,base=44){
  return {id:uid(c),name:(name||'水瀬 湊').trim().slice(0,16)||'水瀬 湊',stats:Object.fromEntries(keys.map(k=>[k,int(c,base-9,base+9)])),
    adjust:{motorVar:int(c,25,70),motorSuccess:int(c,18,22),propVar:int(c,25,70),propSuccess:int(c,18,22)},
    growth:pick(c,D.growth).id,skills:[],mastery:{},popularity:0,money:0,totalEarnings:0,inventory:{},equipment:null,points:0,finishes:[0,0,0,0,0,0],scoreTotal:0,tie:rand(c)};
}
function randomSkill(c,rarities,excluded=[],weak=false){const pool=D.abilities.filter(a=>!a.exclusive&&(a.category==='弱点')===weak && rarities.includes(a.rarity)&&!excluded.includes(a.id)); return pool.length ? pick(c,pool).id : null;}
function createCareer(s,draft){
  const p=Hard.initial(draft);p.scenario=Drama.B.arcs[draft.scenario]?draft.scenario:pick(s,Object.keys(Drama.B.arcs));p.profile=Profile.get(p);p.difficulty=difficulty(draft).id;p.popularity=0;p.skills=[Development.unlocks(s).includes(draft.curriculum)?({speed:'push',turn:'steady',start:'quick',accel:'push',power:'stout'})[draft.curriculum]:'quick'];p.mastery={};p.money=0;p.totalEarnings=0;
  if(p.difficulty==='hard'){p.skills=[randomSkill(s,['SSR'])];p.mastery[p.skills[0]]=1;}
  s.career={player:p,playMode141:draft.playMode141==='development'?'development':'drive',seed:int(s,1,0x7fffffff),stage:0,status:'home',series:null,history:[],shop:null,lastShop:null,
    balance:{last:null,streak:0},stats:{races:0,wins:0,capsizes:0},lastResult:null,ending:null};
  Development.ensure(s.career);Campaign.ensure(s.career);Story.ensure(s.career);Bonds.ensure(s.career);Finale.ensure(s.career);Affinity.ensure(s.career);Craft.ensure(s.career,draft);Workshop.ensure(s.career);if(draft.length143==='short')Passage143.init(s.career);return s.career;
}
function npc(c,stage,index){
  const tier=D.tiers[stage.tier];const p=character(c,pick(c,D.lastNames)+' '+pick(c,D.firstNames),tier.base+(stage.index%2===1?2:0));
  keys.forEach(k=>p.stats[k]=clamp(p.stats[k]+int(c,-3,3)+(difficulty(c.player).id!=='easy'?D.npcGradeStats[stage.tier]:-(tier.base-D.tiers.rookie.base)*(1-D.easyNpcGrowth)),15,98));p.popularity=int(c,0,60+stage.index*20);
  p.id='npc'+index+'_'+uid(c);p.skills=[];
  let count=stage.tier==='sg'?6:stage.index<2?1:stage.index<4?2:stage.index<6?3:4;
  for(let j=0;j<count;j++){const id=randomSkill(c,[rewardRarity(c.player,pick(c,stage.tier==='sg'?D.sgNpcRarities:tier.rare))],p.skills);if(id)p.skills.push(id);}
  if(stage.tier==='sg' && index%5===0){const id=randomSkill(c,[rewardRarity(c.player,'LR')],p.skills);if(id)p.skills.push(id);}
  p.equipment=equipment(c);return p;
}
function growthFactor(p){return difficulty(p).growth*Math.min(p.skills.some(id=>ability(id).rarity==='MLR')?1.8:1.32,p.skills.reduce((v,id)=>v*(ability(id).type==='growth'?ability(id).effect.multiplier:1),1));}
function generateShop(c,last=false){
  const p=c.player, ranks=last?['R','SR','SSR','UR']:c.stage>=6?['N','R','SR','SSR','UR']:c.stage>=4?['N','R','SR','SSR']:['N','R','SR'];
  const stock=shuffle(c,D.abilities.filter(a=>!a.exclusive&&ranks.includes(a.rarity)&&D.rarities.indexOf(a.rarity)<=D.rarities.indexOf(difficulty(p).shopMax)&&a.category!=='弱点'&&!has(p,a.id))).slice(0,last?5:4).map(a=>({id:a.id,price:Math.ceil(D.prices[a.rarity]*(last?1.35:1.12)),sold:false}));
  return {stage:c.stage,stock,purchases:0,limit:last?1:2,itemBuys:{}};
}
function roster(c){return [c.player].concat(c.series.npcs);}
function startSeries(s){if(!s.career||s.career.status!=='home'||s.career.stage>8)return false;return Progress144.transaction(s,["career"],d=>startSeriesCore144(d));}
function startSeriesCore144(s){
  const c=s.career;if(!c||c.status!=='home'||c.stage>8)return false;
  const stage={...D.stages[c.stage],name:Story.stageName(c)};if(c.stage===8&&!c.sgQualifiedLegacy129&&c.player.totalEarnings<D.sgThreshold){c.status='registration';c.ending='gate';c.lastShop=c.lastShop||generateShop(c,true);Story.finish(c);Epilogues126.capture(c);return false;}
  const p=c.player;p.equipment=equipment(c);p.points=0;p.finishes=[0,0,0,0,0,0];p.scoreTotal=0;p.tie=rand(c);
  const npcs=Array.from({length:19},(_,i)=>npc(c,stage,i));const names=new Set([p.name]);
  npcs.forEach(n=>{if(names.has(n.name))n.name=n.name+'・'+(names.size+1);names.add(n.name);});
  c.series={stage:c.stage,tier:stage.tier,name:stage.name,venue:clone(pick(c,D.venues)),npcs,round:0,finalType:null,ranking:null,
    otherFinals:[],race:null,action:null,startStats:clone(p.stats),startMoney:p.totalEarnings,qualificationRank:null,completed:false};
  c.shop=c.shop&&c.shop.stage===c.stage?c.shop:generateShop(c);
  Story.series(c);Development.series(c);Cast.setup(c);Finale.series(c);c.series.npcs.forEach(n=>Hard.npc(c,n));c.status='seriesIntro';return true;
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
  people=people.map(p=>Hard.npc(c,clone(p)));
  const runners=shuffle(c,people).map((p,i)=>Object.assign(clone(p),{frame:i+1,course:i+1,score:0,progress:0,previousProgress:0,capsized:false,capsizePhase:null,
    stamina:100,isPlayer:p.id===playerId,strategy:'balanced',phaseHistory:[],activations:[],debuffEvents:[],orders:[]}));
  const r={id:uid(c),type,finalSpectator141:c.playMode141==='development',grade:c.series?.tier||D.stages[c.stage]?.tier||'rookie',venue:clone(venue),env:clone(env),runners,phase:-1,done:false,settled:false,logs:[],events:[],cutins:[],instructions:[],result:null,
    buff:zeros(),itemBoost:0,usedItems:{},strategy:'balanced',startRule129:true,tilt:0,prepVersion:87,auto:false,difficulty:difficulty(c.player||people.find(p=>p.id===playerId)).id};
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
  pools.forEach((pool,type)=>{const valid=pool.filter(p=>p.id!==c.player.id&&!used.has(p.id)&&p.id!=='cast_'+c.cast?.boss?.id&&p.skills.some(id=>rarity(id)>=2&&!isWeak(id))); if(!valid.length)return;
    while(slot>=0&&group[slot].id===c.player.id)slot--;if(slot<0)return;
    const n=clone(pick(c,valid));n.special=true;n.specialType=type===0?'registered':'rival';n.sourceId=n.id;
    n.equipment=equipment(c);n.mastery=n.mastery||{};used.add(n.id);group[slot--]=n;
  });return group;
}
function prepareRace(s){if(!s.career?.series||!['seriesIntro','between'].includes(s.career.status))return false;return Progress144.transaction(s,["career", "rivals"],d=>prepareRaceCore144(d));}
function prepareRaceCore144(s){
  const c=s.career;if(!c||!c.series||!['seriesIntro','between'].includes(c.status))return false;
  const ser=c.series;let people,type;
  if(ser.round<Passage143.qualifiers(c)){people=Story.lineUp(c,[c.player].concat(shuffle(c,ser.npcs).slice(0,5)));type='qualifier';}
  else {
    const ranked=standing(c);ser.ranking=ranked.map(p=>p.id);ser.qualificationRank=ranked.findIndex(p=>p.id===c.player.id)+1;
    if(ser.qualificationRank<=6){people=invited(s,c,ranked.slice(0,6));type='championship';}
    else if(ser.qualificationRank<=12){people=ranked.slice(6,12);type='consolation';}
    else {ser.finalType='eliminated';simulateOtherFinals(s,c,null);finishSeries(s);return true;}
    ser.finalType=type;simulateOtherFinals(s,c,type);
  }
  people=Finale.lineUp(c,Cast.lineUp(c,people,type),type);people=Hard.finalGrid(c,people,type,E);
  const r=makeRace(c,people,ser.venue,weather(c,ser.venue),type,c.player.id);ser.race=r;Workshop.attach(c,r);Cast.attach(c,r);Finale.attach(c,r);
  ser.action={normal:0,training:1,tune:1,actionVersion:88,baseActions:{training:1,tune:1},trainingMode:'focus',halfActions:{training:0,tune:0},logs:[],debug:[],extras:[],extrasNotified:false};
  c.player.skills.forEach(id=>{const a=ability(id);if(a.type==='extra'&&rand(c)<a.chance){ser.action[a.effect.action]++;ser.action.halfActions[a.effect.action]++;ser.action.extras.push(id);ser.action.logs.push(a.name+'：'+(a.effect.action==='tune'?'調整':'練習')+'を1回追加（成長・効果50%）');}});
  if(!c.short143)Story.prepare(c,r);c.status='action';Journey134.prepare(c,E);if(!c.short143){Bonds.encounter(c,r);Bonds.final(c,r,{acquire});}syncPlayerSnapshot(c);return true;
}
function simulateOtherFinals(s,c,playerType){
  const ranked=standing(c);['championship','consolation'].forEach((type,i)=>{
    if(type===playerType)return;let group=ranked.slice(i*6,i*6+6);if(type==='championship')group=invited(s,c,group);
    group=Hard.finalGrid(c,group,type,E);const r=makeRace(c,group,c.series.venue,weather(c,c.series.venue),type);simulate(c,r);applyNPCResult(c,r,false);
    c.series.otherFinals.push({type,names:ordered(r).map(n=>n.name)});
  });
}
function consumeAction(c,kind){
  const a=c.series.action;a.effectScale=1;
  if(a.normal>0){a.normal--;return true;}
  if(a[kind]>0){a[kind]--;if(a.baseActions&&a.baseActions[kind]>0){a.baseActions[kind]--;}else if(a.halfActions&&a.halfActions[kind]>0){a.halfActions[kind]--;a.effectScale=.5;}return true;}
  return false;
}
// V128: lower early growth as well; preserve the stronger B/A/S tapers.
function statGrowthRate(value){return value>=100?.05:value>=90?.07:value>=80?.20:value>=65?.45:value>=50?.52:value>=35?.62:.68;}
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
function growStat(p,key,amount){
 const before=p.stats[key],cap=D.statCeiling(p,key);
 if(amount<=0){p.stats[key]=round(clamp(before+amount,0,cap));return round(p.stats[key]-before);}
 if(before>=cap)return 0;
 // Callers already apply the rate at the starting value exactly once. Recover that
 // budget, then spend it in each band so a large reward cannot skip the next taper.
 let budget=amount*D.permanentGrowthScale/statGrowthRate(before),value=before;
 for(const ceiling of [35,50,65,80,90,100,...(cap>100?[cap]:[])]){
  if(value>=ceiling)continue;
  const rate=statGrowthRate(value),needed=(ceiling-value)/rate;
  if(budget<needed){value+=budget*rate;break;}
  value=ceiling;budget-=needed;if(budget<=0)break;
 }
 p.stats[key]=round(value);return round(p.stats[key]-before);
}
function train(c,key,mode='focus',options={}){
  if(c.status!=='action'||!keys.includes(key)||!['focus','foundation'].includes(mode)||!consumeAction(c,'training'))return null;
  const p=c.player,scale=c.stage===8?1:D.nonSG.trainingGrowth;
  const roll=rand(c),base=Hard.hard(p)?2.05+roll:2.3+roll*.5,form=Hard.hard(p)?(roll<.2?'手探り':roll>.8?'手応えあり':'通常'):null;
  const amount=base*1.5*scale*trainingFactor(p,key,mode)*growthFactor(p)*lateGrowthFactor(c,key)*c.series.action.effectScale*(options.multiplier||1)*(options.mentor?Cast.growth(c,key):1)*Workshop.training(c,key)*Practice133.training(c,key,options.method);
  const previous=p.stats[key],gain=growStat(p,key,amount),visibleGain=R.floor(p.stats[key])-R.floor(previous);c.balance={last:null,streak:0};
  const prep=prepBonus(c,key,c.series.action.effectScale);
  const text=(form?'練習の調子：'+form+' · ':'')+D.stats[key]+'練習：＋'+visibleGain+' → '+R.display(p.stats[key])+(visibleGain===0?'（端数を蓄積）':'');c.series.action.logs.push(text);
  const mentor=options.mentor?Cast.train(c,key):null;if(mentor)c.series.action.logs.push(mentor.name+'の指導：'+D.stats[key]+'の練習が充実');
  Improve141.prepared(c,'train',key);
  const storyNote=Practice133.record(c,options.method==='rival'?'joint':options.method==='mentor'?'mentor':'train',key,c.series.race.id);if(storyNote)c.series.action.logs.push(storyNote);syncPlayerSnapshot(c);return {key,gain,text,form,trainingRoll:Hard.hard(p)?base/2.55:null,prep,mentor:mentor?.id||null,storyNote};
}
function tuningChance(p,target){return Workshop.chance(p,target);}
function tuningLearning(value){return Workshop.learning(value);}

function tuningOutlook(p,target,direction){
 const e=p.equipment[target],key=target==='motor'?'speed':'turn';
 const trend=direction==='primary'?{[key]:1,accel:-1,condition:1}:direction==='accel'?{[key]:-1,accel:1,condition:1}:direction==='stability'?{[key]:-1,accel:-1,condition:1}:{[key]:1,accel:1,condition:1};
 return [key,'accel','condition'].map(k=>{const low=k==='condition'?25:-15,high=k==='condition'?100:k==='accel'?25:30;const sign=trend[k]>0&&e[k]<high?1:trend[k]<0&&e[k]>low?-1:0;return {key:k,label:k==='condition'?'状態':D.stats[k],value:e[k],sign};});
}
function tune(c,target,direction='balanced'){
 if(c.status!=='action'||!['motor','prop'].includes(target)||!['balanced','primary','accel','stability'].includes(direction)||!consumeAction(c,'tune'))return null;
 const p=c.player,e=p.equipment[target],r=c.series.race,before=clone(e),beforeAdjust=clone(p.adjust),success=tuningChance(p,target),rolled=rand(c),quality=rand(c),scale=c.series.action.effectScale;
 const out=Practice133.tuning(c,Workshop.outcome(p,target,rolled,quality,scale),scale),delta=out.delta,key=target==='motor'?'speed':'turn';
 e[key]=round(clamp(e[key]+delta*(target==='motor'?.8:.65),-15,30));e.accel=round(clamp(e.accel+delta*(target==='motor'?.2:.5),-15,25));e.condition=round(clamp(e.condition+delta*.7,25,100));
 if(!r.workshop128)Workshop.attach(c,r);
 // Motor maintenance no longer changes the independent tilt setting.
 r.workshop128.focus=target;r.workshop128.quality=out.high?'high':out.positive?'normal':'quiet';
 c.balance.streak=c.balance.last===target?c.balance.streak+1:1;c.balance.last=target;
 const learning=Workshop.learn(p,target,scale*Workshop.learningFactor(c)*Practice133.learning(c));Development.afterTune(c,target,{Workshop});
 const changes=Object.fromEntries([key,'accel','condition'].map(k=>[k,round(e[k]-before[k])]));
 const text=Workshop.parts[target].name+'：'+out.label+'。'+(out.high?'狙いがかみ合い、仕上がりが一段よくなった。':out.positive?'小さな調整を積み重ねた。':'大きな変化はない。手を動かした経験は残った。');
 const result={target,direction:'balanced',label:out.label,positive:out.positive,high:out.high,before,after:clone(e),changes,beforeAdjust,afterAdjust:clone(p.adjust),learning,success,rolled,quality,effectScale:scale,text};
 Improve141.prepared(c,'tune',target);
 c.series.action.debug.push(result);c.series.action.logs.push(text);const storyNote=Practice133.record(c,'tune',target,r.id);if(storyNote)c.series.action.logs.push(storyNote);syncPlayerSnapshot(c);return {...result,storyNote};
}

function syncPlayerSnapshot(c){if(!c.series||!c.series.race||c.series.race.phase>=0)return;const n=c.series.race.runners.find(n=>n.isPlayer);if(c.series.race.scenario128)c.series.race.scenario128=Workshop.snapshot(c);if(n){n.name=c.player.name;n.profile=Profile.get(c.player);n.stats=clone(c.player.stats);n.equipment=clone(c.player.equipment);n.skills=c.player.skills.slice();n.mastery=clone(c.player.mastery);}odds(c.series.race);}
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
  if(ctx.quick?.race===r&&ctx.quick.cup143&&ctx.cup143?.id===ctx.quick.cup143.id)ctx=ctx.cup143;
  if(ctx.series?.race===r&&Affinity.offer(ctx))return null;
  if(ctx.series?.race===r){Bonds.final(ctx,r,{acquire});Cheer126.prepare(ctx,r);Bonds.depart(ctx);Cast.routeDepart(ctx);Story.begin(ctx,r,{statGrowthRate,growthFactor,growStat,rewardRarity,acquire});syncPlayerSnapshot(ctx);}
  if(r.done)return r.drive||null;
  if(!r.drive){
    if(ctx.series?.race===r&&r.type!=='qualifier')r.finalBrief=Development.brief(ctx,r);
    const legacy=r.watch&&r.phase>=0;r.drive=R.create(r,int(ctx,1,0x7fffffff),{keepCourses:legacy||r.courseLock143===true});
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
  r.runners.forEach(n=>{const b=d.boats.find(x=>x.id===n.id);n.previousProgress=n.progress;n.previousTrackProgress=Number.isFinite(n.trackProgress)?n.trackProgress:Math.max(0,b.progress/R.C.length);n.progress=Math.max(0,b.progress/R.C.goal);n.trackProgress=Math.max(0,(b.progress+(b.runoutDistance||0))/R.C.length);n.score=b.progress;Object.assign(n,{capsized:b.capsized,dnf:b.dnf,startFault:b.startFault,startTime:b.startTime,finishTime:b.finishTime,course:b.course,stamina:b.stamina,activations:clone(b.activations),debuffEvents:clone(b.interference),phaseHistory:clone(b.phaseHistory)});});
  r.phase=R.own(d).phase;r.logs=clone(d.logs);r.events=clone(d.events);r.cutins=d.events.filter(e=>e.kind==='ability'&&e.index>last&&d.elapsed-e.t<3.2&&D.rarities.indexOf(e.rarity)>=2).map(clone);r.watchedEvent=d.eventSequence-1;
}
function takeControl(s,quick=false){
 const c=s.career,r=quick?s.quick?.race:c?.series?.race;if(!r||r.done||!quick&&!['preRace','race'].includes(c.status))return null;
 if(r.challenge145?.mode==='auto')return null;
 if(!startDrive(quick?s:c,r))return null;r.watch=false;r.controlMode='manual';r.drive.paused=true;r.drive.controls={steer:0,throttle:0,posture:R.own(r.drive).postureTarget||0};if(!quick)c.status='race';return r;
}
function prepareSpectator(s,quick=false){
  const c=s.career,r=quick?s.quick&&s.quick.race:c&&c.series&&c.series.race;
  if(!r||r.done)return r||null;if(!quick&&Affinity.offer(c))return null;if(R.requiresManual(r))return null;
  if(!quick&&!['preRace','race'].includes(c.status))return null;
  r.watch=true;r.controlMode=r.drive?'assisted':'spectator';
  if(!startDrive(quick?s:c,r))return null;r.drive.paused=true;syncSpectator(r);if(!quick)c.status='race';return r;
}
function spectatorStep(s,quick=false,choice=null,ticks=180,adaptive=false){
  const r=quick?s.quick&&s.quick.race:s.career&&s.career.series&&s.career.series.race;
  if(!r||!r.watch||r.done||R.requiresManual(r))return false;
  if(!r.drive)startDrive(quick?s:s.career,r);
  const done=stepAutoRace(r,ticks,adaptive);syncSpectator(r);if(done){completeDrive(s,quick);syncSpectator(r);}
  return true;
}
function prepareAutoRace(s,quick=false){
  const c=s.career,r=quick?s.quick&&s.quick.race:c&&c.series&&c.series.race;
  if(!r)return null;if(r.done)return r;if(R.requiresManual(r))return null;
  if(!quick&&!['preRace','race'].includes(c.status))return null;
  if(!startDrive(quick?s:c,r))return null;if(!quick)c.status='race';
  if(!['auto','assisted','skip'].includes(r.controlMode))r.controlMode=r.drive.elapsed>0?'assisted':'auto';
  return r;
}
function stepAutoRace(r,maxTicks=240,adaptive=false){
  if(!r||!r.drive||r.done||R.requiresManual(r))return true;const d=r.drive;if(d.finished)return true;
  d.paused=false;for(let i=0;i<maxTicks&&!d.finished;i++)R.tick(d,r,{},R.DT,true);d.paused=true;return d.finished;
}
function prepareSkip(s,quick=false){const r=prepareAutoRace(s,quick);if(!r||r.done)return r;r.watch=false;r.controlMode='skip';return r;}
function skipToResult(s,quick=false){const r=prepareSkip(s,quick);if(!r)return null;while(!stepAutoRace(r,360)){}completeDrive(s,quick);return r;}
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
function acquire(c,p,id,source,options={}){
  if(p.difficulty==='easy'&&ability(id)?.rarity==='LR')id=D.easyRewardMap[id]||'comet';
  if(!id)return null;
  const duplicate=has(p,id);if(duplicate){p.mastery[id]=(p.mastery[id]||1)+1;}else{p.skills.push(id);p.mastery[id]=1;}
  let statBonus=null;if(options.statBonus!==false&&!duplicate&&!isWeak(id)){const key=pick(c,keys),amount=[.3,.5,.8,1.2,1.8,2.5,3.5][rarity(id)],before=p.stats[key],gain=growStat(p,key,amount*statGrowthRate(before));statBonus={key,gain,visible:R.floor(p.stats[key])-R.floor(before)};}
  return {id,source,duplicate,level:p.mastery[id],statBonus};
}
function removeWeakness(p,id){if(!has(p,id)||!isWeak(id))return false;p.skills=p.skills.filter(x=>x!==id);delete p.mastery[id];return true;}
function settleRace(s){if(!s.career?.series?.race?.done||s.career.series.race.settled)return null;return Progress144.transaction(s,["career"],d=>settleRaceCore144(d));}
function settleRaceCore144(s){
  const c=s.career,r=c&&c.series&&c.series.race;if(!r||!r.done||r.settled)return null;
  const p=c.player,finish=ordered(r),n=finish.find(x=>x.isPlayer),place=finish.indexOf(n)+1;
  const won=place===1&&!n.capsized&&!n.dnf,qualifier=r.type==='qualifier';
  const money=(n.capsized||n.dnf)?0:round(D.prizes[r.type][place-1]*D.tiers[c.series.tier].prize,1);
  const points=qualifier&&!n.capsized&&!n.dnf?D.points[place-1]:0;
  p.money=round(p.money+money,1);p.totalEarnings=round(p.totalEarnings+money,1);
  if(qualifier){p.points+=points;p.finishes[place-1]++;p.scoreTotal+=n.score;}
  const beforeStats=clone(p.stats);
  const growth=Object.fromEntries(keys.map(k=>[k,growStat(p,k,(D.raceGrowthByPlace[difficulty(p).id][place-1])*D.raceGrowthScale*(c.stage===8?1:D.nonSG.raceGrowth)*D.tiers[c.series.tier].growth*1.5*growthOf(p).values[k]*growthFactor(p)*lateGrowthFactor(c,k)*(n.capsized?.65:1))]));
  const fameBase=(n.capsized||n.dnf)?-3:[9,5,3,1,0,-1][place-1];const upset=place<n.favourite?Math.max(0,n.favourite-place)*2:0;
  const fameSkills=p.skills.reduce((a,id)=>a+(ability(id).type==='fame'?ability(id).effect.value:0),0);
  const fameActivated=n.activations.reduce((a,event)=>a+(ability(event.abilityId).effect.fame||0),0);
  const popularity=Math.max(-p.popularity,fameBase+upset+fameSkills+fameActivated);p.popularity+=popularity;
  const acquired=[],weakness={gained:null,cured:null};
  if(won){
    const sgChampion=c.stage===8&&r.type==='championship';const chance=sgChampion?1:r.type==='championship'?.70:.16;
    if(rand(c)<chance){const rare=rewardRarity(p,sgChampion?'LR':pick(c,D.tiers[c.series.tier].rare));const id=randomSkill(c,[rare],p.skills)||randomSkill(c,[rare]);if(id)acquired.push(acquire(c,p,id,(sgChampion?'SG優勝報酬':r.type==='championship'?'シリーズ優勝':'レース勝利')+(p.difficulty==='easy'?' · イージー報酬':'')));}
    const weak=p.skills.filter(isWeak);if(weak.length&&rand(c)<.22){weakness.cured=pick(c,weak);removeWeakness(p,weakness.cured);}
  }else if(place===6&&rand(c)<.13){const id=randomSkill(c,['N','R'],p.skills,true);if(id){p.skills.push(id);weakness.gained=id;}}
  if(c.stage===8&&r.type==='championship'&&!n.capsized&&!n.dnf){
    finish.filter((x,i)=>x.special&&i>place-1).forEach(other=>{const eligible=other.skills.filter(id=>!isWeak(id)&&rarity(id)>=2&&!['story','scenario128','hard129'].includes(ability(id).exclusive));
      if(eligible.length){const novel=eligible.filter(id=>!has(p,id)),pool=novel.length?novel:eligible;pool.sort((a,b)=>rarity(b)-rarity(a));const high=pool.filter(id=>rarity(id)===rarity(pool[0]));acquired.push(acquire(c,p,rewardSkill(c,p,pick(c,high)),other.name+'に先着'+(p.difficulty==='easy'?' · レア度を1段階調整':'')));}
    });
  }
  recordRace(c,r,n,place,won);c.stats.races++;if(won)c.stats.wins++;if(n.capsized)c.stats.capsizes++;
  applyNPCResult(c,r,qualifier);if(qualifier){shadowQualifiers(c,r.runners.map(n=>n.id));c.series.round++;}
  const result={raceId:r.id,type:r.type,place,capsized:n.capsized,dnf:!!n.dnf,startFault:n.startFault||null,startTime:n.startTime==null?null:n.startTime,points,money,growth,growthVisible:Object.fromEntries(keys.map(k=>[k,R.floor(p.stats[k])-R.floor(beforeStats[k])])),popularity,acquired,weakness,
    driving:r.drive?{controlMode:r.drive.controlUse141?Improve141.mode(r):(r.controlMode||'unknown'),time:R.own(r.drive).finishTime,metrics:clone(R.own(r.drive).metrics),distance:R.own(r.drive).progress,synergies:(R.own(r.drive).synergyUsed||[]).slice(),setup:r.strategy,tilt:R.tiltValue(r)}:null,
    finish:finish.map((x,i)=>({id:x.id,name:x.name,frame:x.frame,place:i+1,capsized:x.capsized,dnf:!!x.dnf,startFault:x.startFault||null,startTime:x.startTime==null?null:x.startTime,finishTime:x.finishTime,isPlayer:x.isPlayer,special:!!x.special,points:qualifier&&!x.capsized&&!x.dnf?D.points[i]:0})),
    qualificationRank:standing(c).findIndex(x=>x.id===p.id)+1,playerPhase:clone(n.phaseHistory),orders:clone(n.orders),activations:clone(n.activations),debuffEvents:clone(n.debuffEvents)};
  Story.settle(c,r,result,{rewardRarity,acquire});Cast.settle(c,r,result,{rewardRarity,acquire});
  Development.settle(c,r,result,{acquire,growStat,statGrowthRate,growthFactor});
  Finale.settle(c,r,result,{rewardRarity,acquire});Affinity.settle(c,r,result);Workshop.settle(c,r,result);Hard.settle(c,r,result,E);Craft.settle(c,r,result,E);
  Improve141.settle(c,r,result);
  result.practice133=Practice133.record(c,'race',null,r.id,result);Journey134.settle(c,r,result,E);Awakening136.settle(c,r,result);r.result=result;r.settled=true;c.lastResult=result;c.status='raceResult';return result;
}
function recordRace(c,r,n,place,won){
 const p=c.player;if(!p.careerLog)p.careerLog={races:0,wins:0,firstWin:null,bestST:null,venues:{},highlights:[]};const h=p.careerLog;h.races++;if(won)h.wins++;
 const v=h.venues[r.venue.id]||(h.venues[r.venue.id]={races:0,wins:0});v.races++;if(won)v.wins++;
 if(n.startTime!=null&&!n.startFault&&(h.bestST===null||n.startTime<h.bestST))h.bestST=n.startTime;
 let text=null;if(won&&!h.firstWin){h.firstWin=c.series.name+'・'+r.venue.name;text='初勝利：'+h.firstWin;}
 if(won&&r.type==='championship')text=c.series.name+' 優勝';
 if(won&&n.favourite>=4)text=r.venue.name+' '+n.favourite+'番人気から逆転勝利';
 if(text){h.highlights.push(text);h.highlights=h.highlights.slice(-12);}
}
function qualificationTarget(c){
 const ranked=standing(c),own=c.player,remaining=Passage143.qualifiers(c)-c.series.round;
 return {remaining,rank:ranked.findIndex(p=>p.id===own.id)+1,targets:[6,12].map(cut=>{const others=ranked.filter(p=>p.id!==own.id),line=others[cut-1]?.points||0;return {cut,line,needed:Math.max(0,line+1-own.points),maxAvailable:remaining*10};})};
}
function rememberRival(s,c){
 const d=Development.rival(c),n=c.series.npcs.find(x=>x.id===d.id);if(!n)return d.name;
 const rec=clone(n);rec.rivalReason='ライバル '+d.wins+'勝 '+d.losses+'敗';rec.recordedAt=Date.now();rec.rating=average(n);
 const index=s.rivals.findIndex(x=>x.id===n.id);if(index>=0)s.rivals[index]=rec;else{s.rivals.push(rec);if(s.rivals.length>12)s.rivals.shift();}return d.name;
}
function finishSeries(s){if(!s.career?.series)return false;return Progress144.transaction(s,["career", "rivals"],d=>finishSeriesCore144(d));}
function finishSeriesCore144(s){
  const c=s.career,ser=c.series;if(ser.completed)return c.history[c.history.length-1];
  const ranking=standing(c);ser.qualificationRank=ranking.findIndex(n=>n.id===c.player.id)+1;
  const finalPlace=ser.finalType==='eliminated'?null:c.lastResult.place;
  const summary={stage:c.stage,name:ser.name,tier:ser.tier,qualificationRank:ser.qualificationRank,finalType:ser.finalType,finalPlace,
    champion:ser.finalType==='championship'&&finalPlace===1&&!c.lastResult.capsized&&!c.lastResult.dnf&&!c.lastResult.startFault,
    growthVisible:Object.fromEntries(keys.map(k=>[k,R.floor(c.player.stats[k])-R.floor(ser.startStats[k])])),
    money:round(c.player.totalEarnings-ser.startMoney,1),growth:Object.fromEntries(keys.map(k=>[k,round(c.player.stats[k]-ser.startStats[k])])),rival:rememberRival(s,c)};
  c.history.push(summary);ser.completed=true;c.status='seriesResult';
  if(c.short143)c.ending='short';
  else if(c.stage===8)c.ending=summary.champion?'sgChampion':'sgFinished';
  else if(c.stage===7&&c.player.totalEarnings<D.sgThreshold)c.ending='gate';
  Story.finish(c);Campaign.capture(c,summary);if(c.short143)Passage143.ending(c);else Epilogues126.capture(c);if(c.ending)c.lastShop=c.lastShop||generateShop(c,true);
  return summary;
}
function continueAfterRace(s){if(s.career?.status!=='raceResult')return false;return Progress144.transaction(s,["career", "rivals"],d=>continueAfterRaceCore144(d));}
function continueAfterRaceCore144(s){const c=s.career;if(c.status!=='raceResult')return false;if(c.series.race.type!=='qualifier'){finishSeries(s);return true;}c.status='between';prepareRace(s);return true;}
function nextSeries(s){if(s.career?.status!=='seriesResult'||s.career.ending)return false;return Progress144.transaction(s,["career"],d=>nextSeriesCore144(d));}
function nextSeriesCore144(s){const c=s.career;if(c.status!=='seriesResult'||c.ending)return false;c.stage++;c.series=null;c.status='home';c.shop=c.stage>=2?generateShop(c):null;return true;}
function register(s,early=false){if(!s.career||s.registry.length>=50)return false;return Progress144.transaction(s,["career", "registry"],d=>registerCore144(d,early));}
function registerCore144(s,early=false){
  const c=s.career;if(!c||s.registry.length>=50)return false;
  Passage143.archiveTask(c);if(!Campaign.ensure(c).closed)Campaign.close(c,c.ending==='gate'?'gate':'early');
  Epilogues126.capture(c);
  Journey134.retrospective(c,E);const record=clone(c.player);if(c.awakening136)record.awakeningJournal=clone(c.awakening136);record.journeyJournal=clone(c.journey134);if(c.epilogues126)record.epilogueJournal=clone(c.epilogues126);record.affinityJournal=clone(Affinity.ensure(c));record.finaleJournal=clone(Finale.ensure(c));record.developmentJournal=Development.archive(c);record.campaignJournal=clone(c.campaign);if(c.bonds){record.bondJournal=clone(c.bonds);record.bondJournal.pending=null;}if(c.cast){record.castJournal=clone(c.cast);if(record.castJournal.route)record.castJournal.route.pending=null;}if(c.story)record.storyJournal=clone({log:c.story.log,rivals:c.story.rivals,arcs:c.story.arcs||{},introductions:c.story.introductions});record.recordedAt=Date.now();record.pathNotes143=clone(c.pathNotes143||[]);record.record={mode143:c.short143?'short':'full',stage:c.stage,races:c.stats.races,wins:c.stats.wins,ending:c.ending||'early',title:c.short143?(c.ending==='short'?'短編修了':'短編・途中登録'):c.ending==='sgChampion'?'SG覇者':c.ending==='sgFinished'?'SG完走':c.ending==='gate'?'G1修了':'途中登録'};
  record.refinementJournal=clone(Craft.ensure(c));
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
  if((id==='bond_shortcut'?!Bonds.writable(c):!['home','action','preRace'].includes(c.status))||c.ending)return {error:'通常のレース前後に購入できます。'};
  const item=D.items.find(x=>x.id===id);if(!item)return {error:'対象がありません。'};
  if(id==='bond_shortcut'&&(Bonds.ensure(c).shortcutUsed||c.player.inventory[id]>0))return {error:'ふたりの予定手帳は1育成につき1枚です。'};
  if(!c.shop)c.shop=generateShop(c);
  if((c.shop.itemBuys[id]||0)>=2)return {error:'同じアイテムは1シリーズ2個までです。'};
  if(c.player.money<item.price)return {error:'所持賞金が足りません。'};
  c.player.money=round(c.player.money-item.price,1);c.shop.itemBuys[id]=(c.shop.itemBuys[id]||0)+1;c.player.inventory[id]=(c.player.inventory[id]||0)+1;return {id};
}
function useItem(c,id,weakId){
  const p=c.player;if(!p.inventory[id])return {error:'このアイテムを持っていません。'};
  if(id==='bond_shortcut'){const result=Bonds.shortcut(c);if(result.error)return result;p.inventory[id]--;return {id,...result};}
  if(!['home','action','preRace'].includes(c.status))return {error:'レース前に使用してください。'};
  if(id==='growth'){p.growth=pick(c,D.growth.filter(g=>g.id!==p.growth)).id;}
  else if(id==='cure'){if(!weakId||!removeWeakness(p,weakId))return {error:'克服する弱点を選んでください。'};}
  else {
    const r=c.series&&c.series.race;if(!r||r.phase>=0||!['action','preRace'].includes(c.status))return {error:'次走のレース前アクションで使用できます。'};
    if(r.usedItems[id])return {error:'このアイテムは次走分を使用済みです。'};
    if(id==='boost')r.itemBoost=5;
    else if(id==='lane'){const own=r.runners.find(n=>n.isPlayer),other=r.runners.find(n=>n.frame===1);[own.frame,other.frame]=[other.frame,own.frame];r.runners.forEach(n=>n.course=n.frame);odds(r);}
    else if(id==='training'||id==='tune'){c.series.action[id]++;if(id==='tune'){const a=c.series.action;a.halfActions=a.halfActions||{training:0,tune:0};a.halfActions.tune++;}c.status='action';}
    else return {error:'対象がありません。'};
    r.usedItems[id]=true;
  }
  p.inventory[id]--;syncPlayerSnapshot(c);return {id};
}
function quickRace(s,ids,betId=null,stake=0,driverId=null){
  if(s.challenge145&&!s.challenge145.complete)return {error:'固定挑戦を終えてから展示レースを開始してください。'};
  if(s.cup143)return {error:'大会画面から開催中の大会を閉じてください。'};
  if(s.quick&&s.quick.race&&!s.quick.race.done)return {error:'進行中の作成選手レースを終えてください。'};
  const selected=Array.from(new Set(ids));const p=selected.map(id=>s.registry.find(n=>n.id===id));
  if(p.length!==6||p.some(n=>!n))return {error:'登録選手を重複なしで6人選んでください。'};
  stake=Number(stake);if(!Number.isInteger(stake)||stake<0||stake>500||stake>s.coins||stake>0&&!selected.includes(betId))return {error:'コイン数または応援する選手を確認してください。'};
  s.coins-=stake;const venue=clone(pick(s,D.venues));const people=p.map(n=>{const b=clone(n);b.equipment=equipment(s);return b;});
  const r=makeRace(s,people,venue,weather(s,venue),'exhibition',selected.includes(driverId)?driverId:p[0].id);s.quick={race:r,stake,betId,paid:false,payout:0};return s.quick;
}
function payQuick(s){if(s.quick?.challenge145){Challenge145.settle(s,E);return;}After143.settle(s,E);const q=s.quick;if(!q||!q.race.done||q.paid)return;const leader=ordered(q.race)[0];q.payout=!leader.capsized&&!leader.dnf&&leader.id===q.betId?q.stake*3:0;s.coins+=q.payout;q.paid=true;}
function buildInfo(p){
  const tags=p.skills.filter(id=>!isWeak(id)).map(id=>ability(id).category);const stats=p.stats;
  const build=tags.filter(x=>x==='防御'||x==='妨害').length>=3?'妨害 / 反射型':tags.filter(x=>x==='整備').length>=2?'整備型':tags.filter(x=>x==='環境').length>=2?'荒天型':tags.filter(x=>x==='人気').length>=2?'人気型':stats.turn>=stats.speed+4?'差し型':stats.start>=stats.speed&&stats.start>=stats.accel?'逃げ型':'まくり型';
  const weak=p.skills.filter(isWeak);return {name:build,plus:build==='差し型'?'旋回から加速へつなぐ':build==='逃げ型'?'踏み込みと先マイが軸':build==='まくり型'?'直線から外へ展開':'能力が働く条件を選ぶ',
    caution:weak.length?(has(p,'comeback')?'弱点を上昇へ転換できる':'弱点 '+weak.length+'種を保有'):stats.power<55?'強風と終盤の体力に注意':'相手の妨害・反射を確認',
    tactic:build==='差し型'?'ターン前に減速、内へ向けて再加速':build==='逃げ型'?'好発進から内側の短いラインへ':'直線で舵を戻し、加速時間を確保'};
}
function shopReason(p,id){const a=ability(id),b=buildInfo(p),before=R.buildLinks(p),after=R.buildLinks({...p,skills:[...p.skills,id]}),ready=after.find((x,i)=>x.ready&&!before[i].ready);if(ready)return '連携「'+ready.name+'」が成立';const target=after.find((x,i)=>x.missing.length<before[i].missing.length);if(target)return '連携「'+target.name+'」へ近づく'+(target.stats.length?'（基礎能力も育てよう）':'');if(a.category==='防御')return '妨害・荒天への備え';if(a.category==='育成')return '残りシリーズの成長を後押し';if(a.category==='整備')return '機材づくりを安定';if(a.category==='妨害')return '前を行く相手へ干渉';if(a.effect.tactic==='sashi'&&b.name==='差し型')return '旋回を生かすビルドに合う';if(a.effect.stats&&a.effect.stats.speed&&b.name==='まくり型')return '伸び足の強みを伸ばす';return a.category+'を補う選択';}
function validCareerLog(h){return h&&Number.isInteger(h.races)&&h.races>=0&&Number.isInteger(h.wins)&&h.wins>=0&&(h.firstWin===null||typeof h.firstWin==='string'&&h.firstWin.length<120)&&(h.bestST===null||Number.isFinite(h.bestST)&&h.bestST>=-.300001&&h.bestST<1.5)&&h.venues&&Object.entries(h.venues).every(([id,v])=>D.venues.some(x=>x.id===id)&&v&&Number.isInteger(v.races)&&v.races>=0&&Number.isInteger(v.wins)&&v.wins>=0)&&Array.isArray(h.highlights)&&h.highlights.length<=12&&h.highlights.every(x=>typeof x==='string'&&x.length<160);}
function validPlayer(p){
  return !!p&&Passage143.valid({pathNotes143:p.pathNotes143})&&Profile.valid(p.profile)&&(!('difficulty' in p)||['easy','normal','hard'].includes(p.difficulty))&&typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(p.id)&&typeof p.name==='string'&&p.name.length>0&&p.name.length<=30&&
    Improve141.validRecords(p.controlRecord141)&&(p.hardReduction138===undefined||[0,5].includes(p.hardReduction138))&&Awakening136.valid(p.awakeningJournal)&&Journey134.valid(p.journeyJournal)&&Epilogues126.valid(p.epilogueJournal)&&Craft.valid(p.refinementJournal)&&(!p.affinityJournal||Affinity.valid(p.affinityJournal))&&(!p.finaleJournal||Finale.valid(p.finaleJournal))&&(!p.developmentJournal||Development.valid(p.developmentJournal))&&(!p.campaignJournal||Campaign.valid(p.campaignJournal))&&(!p.bondJournal||Bonds.valid(p.bondJournal))&&(!p.castJournal||Cast.valid(p.castJournal))&&(!p.storyJournal||Story.validJournal(p.storyJournal))&&(!p.careerLog||validCareerLog(p.careerLog))&&p.stats&&keys.every(k=>Number.isFinite(p.stats[k])&&p.stats[k]>=0&&p.stats[k]<=D.statCeiling(p,k))&&
    p.adjust&&['motorVar','motorSuccess','propVar','propSuccess'].every(k=>Number.isFinite(p.adjust[k])&&p.adjust[k]>=0&&p.adjust[k]<=100)&&
    D.growth.some(g=>g.id===p.growth)&&Number.isFinite(p.points)&&p.points>=0&&Array.isArray(p.finishes)&&p.finishes.length===6&&p.finishes.every(n=>Number.isInteger(n)&&n>=0)&&Number.isFinite(p.scoreTotal)&&Number.isFinite(p.tie)&&(!p.record||(Number.isInteger(p.record.wins)&&Number.isInteger(p.record.races)&&['SG覇者','SG完走','G1修了','途中登録','短編修了','短編・途中登録'].includes(p.record.title)&&(p.record.mode143===undefined||['full','short'].includes(p.record.mode143))&&(!p.record.title.startsWith('短編')||p.record.mode143==='short'&&p.record.stage===0&&p.record.races<=3)))&&Array.isArray(p.skills)&&p.skills.length<=D.abilities.length&&new Set(p.skills).size===p.skills.length&&p.skills.every(id=>ability(id))&&
    p.mastery&&Object.entries(p.mastery).every(([id,n])=>ability(id)&&Number.isInteger(n)&&n>=1&&n<10000)&&
    ['money','totalEarnings','popularity'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1e12)&&p.inventory&&Object.entries(p.inventory).every(([id,n])=>D.items.some(i=>i.id===id)&&Number.isInteger(n)&&n>=0&&n<=10000);
}
function validEquipment(e){return e&&['motor','prop'].every(k=>e[k]&&(!('trait' in e[k])||[0,1,2,3].includes(e[k].trait)))&&['boat','motor','prop'].every(k=>e[k]&&Object.values(e[k]).every(Number.isFinite))&&['stability','turn','accel'].every(k=>Number.isFinite(e.boat[k]))&&['speed','accel','condition'].every(k=>Number.isFinite(e.motor[k]))&&['turn','accel','condition'].every(k=>Number.isFinite(e.prop[k]));}
function validActivation(e){return e&&ability(e.abilityId)&&Number.isInteger(e.phase)&&e.phase>=0&&e.phase<=4&&Number.isInteger(e.frame)&&e.frame>=1&&e.frame<=6&&typeof e.name==='string'&&e.name.length<=30&&typeof e.athleteId==='string';}
function validHistory(h){return Array.isArray(h)&&h.length<=24&&h.every(x=>Number.isInteger(x.phase)&&x.phase>=0&&x.phase<=4&&['base','gear','environment','skill','debuff','training','lane','strategy','choice','noise','fatigue','total','capRisk'].every(k=>Number.isFinite(x[k]))&&Array.isArray(x.checks)&&x.checks.every(e=>ability(e.abilityId)));}
function validRace(r){if(!Review145.validSettings(r?.reviewSettings145))return false;return r&&(r.finalSpectator141===undefined||typeof r.finalSpectator141==='boolean')&&(r.startRule129===undefined||typeof r.startRule129==='boolean')&&Workshop.validRace(r.workshop128)&&Workshop.validSnapshot(r.scenario128)&&Cheer126.valid(r.cheer126,r)&&(!('startPolicy' in r)||['safe','attack'].includes(r.startPolicy))&&Finale.validGrid(r.finalGrid)&&(!r.finalGrid||r.type==='championship'&&r.grade==='sg'&&r.finalGrid.ids.every(id=>r.runners.some(n=>n.id===id)))&&(!r.finalAlliance||r.finalGrid?.ally&&r.runners.some(n=>n.id===r.finalAlliance&&n.racePersona==='rival_ally'))&&(!r.castDuel||Cast.map[r.castDuel.castId]&&(r.castDuel.kind==='boss'?[...Cast.walls,...Cast.retired]:Cast.mentors).some(x=>x.id===r.castDuel.castId)&&['mentor','boss'].includes(r.castDuel.kind)&&r.runners?.some(n=>n.id===r.castDuel.id))&&(!r.storyDuel||typeof r.storyDuel.id==='string'&&typeof r.storyDuel.name==='string'&&r.storyDuel.name.length<=30&&r.runners?.some(n=>n.id===r.storyDuel.id))&&Workshop.validTilt(r)&&(!('grade' in r)||Object.prototype.hasOwnProperty.call(D.tiers,r.grade))&&(!('difficulty' in r)||['easy','normal','hard'].includes(r.difficulty))&&(!('watch' in r)||typeof r.watch==='boolean')&&['qualifier','championship','consolation','exhibition'].includes(r.type)&&Array.isArray(r.runners)&&r.runners.length===6&&r.runners.every(n=>validPlayer(n)&&validEquipment(n.equipment)&&Number.isFinite(n.score)&&Number.isFinite(n.progress)&&Number.isFinite(n.stamina)&&validHistory(n.phaseHistory)&&Array.isArray(n.activations)&&n.activations.every(validActivation)&&Array.isArray(n.debuffEvents)&&Array.isArray(n.orders)&&n.orders.every(o=>D.choices[o.phase]&&D.choices[o.phase].some(x=>x.id===o.id)))&&new Set(r.runners.map(n=>n.id)).size===6&&new Set(r.runners.map(n=>n.frame)).size===6&&new Set(r.runners.map(n=>n.course)).size===6&&r.runners.every(n=>Number.isInteger(n.frame)&&n.frame>=1&&n.frame<=6&&Number.isInteger(n.course)&&n.course>=1&&n.course<=6)&&Number.isInteger(r.phase)&&r.phase>=-1&&r.phase<=4&&typeof r.done==='boolean'&&(r.drive?R.valid(r.drive,r):r.done===(r.phase===4))&&r.env&&['晴れ','曇り','雨'].includes(r.env.weather)&&['追い風','向かい風','横風','無風'].includes(r.env.wind)&&Number.isFinite(r.env.windSpeed)&&r.env.windSpeed>=0&&r.env.windSpeed<=10&&r.venue&&D.venues.some(v=>v.id===r.venue.id)&&r.venue.stats&&Object.entries(r.venue.stats).every(([k,v])=>keys.includes(k)&&Number.isFinite(v))&&Number.isFinite(r.venue.lane)&&Number.isFinite(r.venue.roughness)&&Array.isArray(r.logs)&&r.logs.length<=80&&r.logs.every(l=>typeof l.text==='string'&&l.text.length<2000&&['normal','phase','ability','order','weak','reflect','debuff','warning','capsize','lead','goal'].includes(l.kind))&&Array.isArray(r.events)&&Array.isArray(r.cutins)&&r.cutins.every(validActivation)&&Array.isArray(r.instructions)&&r.buff&&keys.every(k=>Number.isFinite(r.buff[k]))&&Number.isFinite(r.itemBoost)&&r.usedItems&&['balanced','attack','safe'].includes(r.strategy);}
function validShop(shop){return shop===null||shop&&Array.isArray(shop.stock)&&shop.stock.length<=5&&shop.stock.every(x=>ability(x.id)&&!isWeak(x.id)&&!['LR','MLR'].includes(ability(x.id).rarity)&&Number.isFinite(x.price)&&x.price>0&&typeof x.sold==='boolean')&&Number.isInteger(shop.purchases)&&shop.purchases>=0&&shop.purchases<=shop.limit&&[1,2].includes(shop.limit)&&shop.itemBuys;}
function validState(s){
  try {
    if(!s||!Reader.valid(s.read129)||s.version!==D.version||!Number.isInteger(s.seed)||!Number.isInteger(s.coins)||s.coins<0||!Array.isArray(s.registry)||s.registry.length>50||!s.registry.every(validPlayer)||!Array.isArray(s.rivals)||s.rivals.length>12||!s.rivals.every(validPlayer)||!s.settings||![1,2,3].includes(s.settings.speed))return false;
    if(!Progress144.valid(s)||!After143.valid(s,validPlayer,validEquipment)||!Challenge145.valid(s,validPlayer,validEquipment,Improve141))return false;
    if(!Improve141.validControls(s.settings.controls141)||(s.settings.tutorial141!==undefined&&(!Number.isInteger(s.settings.tutorial141)||s.settings.tutorial141<0||s.settings.tutorial141>3)))return false;
    if(s.quick&&(!validRace(s.quick.race)||typeof s.quick.paid!=='boolean'||!Number.isInteger(s.quick.stake)||s.quick.stake<0||s.quick.stake>500))return false;
    if(s.settings.spacing143!==undefined&&!['normal','wide'].includes(s.settings.spacing143))return false;
    if('postureAssist' in s.settings&&typeof s.settings.postureAssist!=='boolean')return false;
    if(('presentation' in s.settings&&!['full','short','off'].includes(s.settings.presentation))||('haptics' in s.settings&&typeof s.settings.haptics!=='boolean')||('raceFX' in s.settings&&!['full','soft','off'].includes(s.settings.raceFX)))return false;
    if(('textSize' in s.settings&&!['normal','large'].includes(s.settings.textSize))||('contrast' in s.settings&&!['standard','high'].includes(s.settings.contrast)))return false;
    const c=s.career;if(!c)return true;if(!Passage143.valid(c))return false;
    if(!Improve141.validGoal(c.reviewGoal141)||(c.playMode141!==undefined&&!['drive','development'].includes(c.playMode141)))return false;
    if(!Awakening136.valid(c.awakening136)||c.awakening136&&!Hard.hard(c.player)||!Journey134.valid(c.journey134)||!Flow.valid(c.flow131))return false;
    if(!Workshop.valid(c.scenario128,c.campaign?.arc)||!Craft.valid(c.refinement)||!Epilogues126.valid(c.epilogues126))return false;
    if(c.development&&!Development.valid(c.development))return false;
    if(c.campaign&&!Campaign.valid(c.campaign))return false;
    if(c.bonds&&!Bonds.valid(c.bonds))return false;
    if(c.cast&&!Cast.valid(c.cast))return false;
    if(c.story&&(!Story.valid(c.story)||c.story.pending&&c.story.pending.raceId!==c.series?.race?.id))return false;
    if(!validPlayer(c.player)||!Number.isInteger(c.seed)||!Number.isInteger(c.stage)||c.stage<0||c.stage>8||!['home','seriesIntro','between','action','preRace','race','raceResult','seriesResult','registration'].includes(c.status)||!Array.isArray(c.history)||c.history.length>9||!c.balance||!Number.isInteger(c.balance.streak)||c.balance.streak<0||!c.stats||!['races','wins','capsizes'].every(k=>Number.isInteger(c.stats[k])&&c.stats[k]>=0)||!validShop(c.shop)||!validShop(c.lastShop))return false;
    if((c.sgQualifiedLegacy129!==undefined&&typeof c.sgQualifiedLegacy129!=='boolean')||!Hard.valid(c.hard129)||!Social.valid(c.social129)||!Finale.valid(c.finale)||!Affinity.valid(c.affinity))return false;
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
function decode(text){Storage122.assertSize(text);
  const s=JSON.parse(text,(k,v)=>['__proto__','prototype','constructor'].includes(k)?undefined:v);
  if(s?.build===D.build)delete s.migrationNotice;
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
  if(s?.career&&Number(s.build)<129&&s.career.stage>=8&&s.career.player?.totalEarnings>=1800)s.career.sgQualifiedLegacy129=true;
  if(s&&s.career&&s.career.player&&!('difficulty' in s.career.player)){s.career.player.difficulty='normal';s.migrationNotice=(s.migrationNotice?s.migrationNotice+' ':'v87へ移行しました。')+'育成報酬を維持するノーマルを適用しました。育成・機材・賞金は引き継いでいます。';}
  oldRaces.forEach(r=>{if(!('grade' in r))r.grade=s.career?.series?.race===r?(s.career.series.tier||'rookie'):'rookie';if(!('difficulty' in r))r.difficulty=difficulty(s.career&&s.career.player).id;});
  const act=s.career?.series?.action;
  if(act&&!act.halfActions){act.halfActions={};for(const k of ['training','tune'])act.halfActions[k]=Math.max(0,act[k]-(s.career.series.race?.usedItems?.[k]?1:0));}
  oldRaces.forEach(r=>{if(!('tilt' in r))r.tilt=R.tiltValue(r);if(r.prepVersion!==87){if(!r.drive&&r.phase<0)r.buff=zeros();r.prepVersion=87;}});
  if(!['88','89','90','91','92','93','94','95','96','97','98','99','100','101','102','103','104','105','106','107','108','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124','125','126','127','128','129','130','131','132','133','134','135','136','137','138','139','140','141','142','143','144','145','146',D.build].includes(s.build)){
   const players=[s.career?.player,...(s.registry||[]),...(s.rivals||[]),...(s.career?.series?.npcs||[]),...oldRaces.flatMap(r=>r.runners||[])].filter(Boolean);
   for(const p of players)if(p.adjust){for(const part of ['motor','prop'])p.adjust[part+'Success']=Math.min(70,p.adjust[part+'Success']);}
   s.build='88';s.migrationNotice='v88へ移行。基礎能力・賞金・走行位置を維持。整備の基礎成功率は上限70%に調整。進行中の行動残数は保持し、次走から練習1回＋調整1回。';
  }
  if(s.build!==D.build){
    const legacyBoats=[...(s.rivals||[]),...(s.career?.series?.npcs||[]),...oldRaces.flatMap(r=>[...(r.runners||[]),...(r.drive?.boats||[])])];
    if(Number(s.build)<125)legacyBoats.forEach(p=>R.migrateStartSkills(p));
    s.build=D.build;s.migrationNotice='V147：レース中も結果へスキップできます。最優秀シリーズの最終戦のみ手動必須です。読みかけの物語・育成・走行位置は引き継ぎ、途中の最優秀最終戦は一時停止から再開します。';
  }
  if(!validState(s))throw new Error('対応するセーブ形式ではないか、データが破損しています。');
  if(s.career){Story.ensure(s.career);Craft.ensure(s.career);Affinity.ensure(s.career);Finale.ensure(s.career);Development.ensure(s.career);Cast.assignMentor(s.career);Bonds.ensure(s.career);Drama.rivalState(s.career);if(s.career.campaign)Campaign.ensure(s.career);if(!s.career.campaign){Campaign.ensure(s.career);const z=s.career.history.at(-1);if(z&&z.stage===s.career.stage)Campaign.capture(s.career,z);}}
  if(s.career){if(Hard.migrate(s.career))odds(s.career.series.race);Epilogues126.capture(s.career);}
  oldRaces.forEach(r=>{if(r.watch&&!r.drive&&!r.done){startDrive(s.career&&s.career.series&&s.career.series.race===r?s.career:s,r);syncSpectator(r);}});
  oldRaces.forEach(r=>{if(!r.done&&r.controlMode==='skip'){r.watch=true;r.controlMode='spectator';}if(!r.done&&R.requiresManual(r)){r.watch=false;r.controlMode='manual';if(r.drive){r.drive.paused=true;r.drive.controls={steer:0,throttle:0,posture:R.own(r.drive).postureTarget||0};}}});
  oldRaces.forEach(r=>{if(r.drive&&!r.done)R.migrateProgress(r.drive);});
  if(s.settings.haptics===undefined)s.settings.haptics=true;if(!s.settings.raceFX)s.settings.raceFX='full';
  if(!validState(s))throw new Error('旧観戦データを3周形式へ移行できませんでした。');
  return s;
}

function createSafeStorage(access,key){return Coaching.createStorage(access,key);}
// Three independent full-state snapshots; archives preserve raw pre-migration bytes.
function createSaveSlots(storage,prefix='kyotei_slots_v1'){
 const parse=(key,fallback)=>{try{return JSON.parse(storage.get(key)||'null')||fallback;}catch(_){return fallback;}};
 const slotKey=i=>{if(!Number.isInteger(i)||i<1||i>3)throw Error('保存枠は1〜3です。');return prefix+'_'+i;};
 const archives=()=>{const a=parse(prefix+'_archives',[]);return Array.isArray(a)?a.filter(x=>x&&typeof x.raw==='string'&&typeof x.reason==='string'&&typeof x.date==='string').slice(0,4):[];};
 function archive(raw,reason){decode(raw);const entries=archives();if(entries.some(x=>x.raw===raw))return;entries.unshift({raw,reason,date:new Date().toISOString()});storage.set(prefix+'_archives',JSON.stringify(entries.slice(0,4)));}
 return {
  list(){return [1,2,3].map(i=>{const raw=storage.get(slotKey(i));if(!raw)return {id:i,empty:true};try{const s=decode(raw);return {id:i,empty:false,name:s.career?.player?.name||'育成なし',stage:s.career?.stage,savedAt:s.savedAt,registry:s.registry.length};}catch(_){return {id:i,empty:false,broken:true};}});},
  save(i,state){const key=slotKey(i),raw=JSON.stringify(state);decode(raw);const previous=storage.get(key);if(previous)archive(previous,'保存枠'+i+'の上書き前');return storage.set(key,raw);},
  load(i){const raw=storage.get(slotKey(i));if(!raw)throw Error('空の保存枠です。');return decode(raw);},
  archive,archives(){const update=parse(prefix+'_update',null);return [...(update&&typeof update.raw==='string'?[update]:[]),...archives()];},
  restore(i){const entry=this.archives()[i];if(!entry)throw Error('バックアップが見つかりません。');return decode(entry.raw);},
  protect(raw){const original=JSON.parse(raw);if(String(original.build||'legacy')===D.build)return;const marker=prefix+'_protected_'+String(original.build||'legacy').replace(/[^a-z0-9.]/gi,'');const updateKey=prefix+'_update',existing=parse(updateKey,null);if(storage.get(marker)&&existing?.raw){try{if(JSON.parse(existing.raw).build===original.build&&storage.status(updateKey).durable)return;}catch(_){}}decode(raw);if(storage.set(updateKey,JSON.stringify({raw,reason:'v'+(original.build||'旧版')+'→v'+D.build+' 更新前',date:new Date().toISOString()})))storage.set(marker,'1');}
 };
}
function chooseStory(c,key,index){return Progress144.career(c,d=>chooseStoryCore144(d,key,index));}
function chooseStoryCore144(c,key,index){const z=Story.choose(c,key,index,{statGrowthRate,growthFactor,growStat,rewardRarity,acquire});if(z)syncPlayerSnapshot(c);return z;}
function chooseMentor(c,key,index){return Progress144.career(c,d=>chooseMentorCore144(d,key,index));}
function chooseMentorCore144(c,key,index){const z=Cast.routeChoose(c,key,index,{acquire,growStat,statGrowthRate,growthFactor});if(z)syncPlayerSnapshot(c);return z;}
function chooseBond(c,key,index){return Progress144.career(c,d=>chooseBondCore144(d,key,index));}
function chooseBondCore144(c,key,index){const z=Bonds.choose(c,key,index);if(z){if(!Affinity.offer(c))Bonds.final(c,c.series?.race,{acquire});syncPlayerSnapshot(c);}return z;}
function trainRival(c,id,method){const r=Development.rival(c),z=id===r.id?Development.training(c,r.key,'rival',E):null;return z?{...z,stat:r.key,skill:z.learned?.id||null}:null;}
const Continuity142=root.KM_CONTINUITY142||(typeof require==='function'?require('./continuity142.js'):null);
const E={Memory146,Support146,Review145,Challenge145,Progress144,After143,Passage143,Continuity142,Improve141,Awakening136,Journey134,Practice133,D,R,Flow,Scenes,Hard,Social,Reader,Workshop,Introductions126,Cheer126,Epilogues126,Craft,Coaching,Storage122,Review122,Practice122,Affinity,Finale,Development,Dialogue,Drama,syncPlayerSnapshot,Story,Campaign,Cast,Profile,Bonds,chooseMentor,chooseBond,trainRival,takeControl,prepareSkip,skipToResult,chooseStory,growStat,createSaveSlots,statGrowthRate,tuningOutlook,trainingHint,trainingFactor,tuningLearning,gearTrait,qualificationTarget,recordRace,lateGrowthFactor,prepBonus,consumeAction,formatMoney,startDrive,prepareSpectator,spectatorStep,syncSpectator,prepareAutoRace,stepAutoRace,autoResolve,completeDrive,createSafeStorage,newState,rand,clone,clamp,round,pick,int,shuffle,grade,average,character,equipment,createCareer,startSeries,prepareRace,train,tune,tuningChance,
  makeRace,advance,simulate,ordered,standing,settleRace,continueAfterRace,finishSeries,nextSeries,register,buySkill,buyItem,useItem,quickRace,payQuick,
  acquire,removeWeakness,growthOf,growthFactor,difficulty,rewardRarity,rewardSkill,takeExtraNotice,recommend,choiceProfile,buildInfo,shopReason,validState,decode,validRace,generateShop,invited,odds};
root.KM_ENGINE=E;
if(typeof module!=='undefined'&&module.exports)module.exports=E;
if(typeof document==='undefined')return;
/* Safe storage and presentation layer. */
const STORAGE='kyotei_monogatari_v80',BACKUP=STORAGE+'_backup',LEGACY='kyotei_monogatari_v70_1';
const diagnostics146=Support146.journal();
const safeStorage=createSafeStorage(()=>root.localStorage,STORAGE);
const PRACTICE_STORAGE122='kyotei_practice_v122';
let practiceRecords122;try{practiceRecords122=Practice122.sanitize(JSON.parse(safeStorage.get(PRACTICE_STORAGE122)||'null'));}catch(_){practiceRecords122=Practice122.sanitize(null);}
const slotStore=createSaveSlots(safeStorage);
let loadNotice='';let state=(function(){for(const key of [STORAGE,BACKUP,LEGACY,LEGACY+'_backup']){const raw=safeStorage.get(key);if(!raw)continue;try{const s=decode(raw);slotStore.protect(raw);if(s.migrationNotice)loadNotice=s.migrationNotice;if(key===BACKUP)loadNotice='直前のバックアップから復元しました。';if(key.startsWith(LEGACY))loadNotice='v70.1の育成データを引き継ぎました。未完了レースはスタートから操船できます。';return s;}catch(e){diagnostics146.error(e,'load');loadNotice='保存データを読み込めませんでした。JSONバックアップがあれば「データ管理」から復元できます。';}}return newState();})();
let ui={page:'title',returnPage:'title',draft:null,filter:'',rare:'all',category:'all',list:'registry',selection:[],auto:false,quick:false,debug:false};
let driveController=null;
let autoTimer=null,cutinTimer=null,animationFrame=null,renderId=0,toastTimer=null,confirmCallback=null;
let resolveEpoch139=0;
let replayTimer=null,replayPlaying=false,replayRace=null;
function stopReplay(){clearTimeout(replayTimer);replayTimer=null;replayPlaying=false;}
function replayResultPanel(r,review=true){const reason=R.dramaticRace(r?.drive);return (review?root.KM_FEEDBACK.reviewHTML(r?.drive):'')+(reason?'<aside class="dramatic-race"><span>逆転と接戦の、その先へ</span><strong>DramaticRace</strong><p>'+esc(reason)+'</p></aside>':'')+(r?.drive?.replay?.frames?.length?btn('このレースを振り返る','replayOpen','','secondary large'):'<p class="small muted">このレースにはリプレイ記録がありません。</p>');}
function openReplay(){root.KM_PRESENTATION?.cancel();const r=currentRace();if(!r?.done||!r.drive?.replay?.frames?.length)return;replayRace=r;ui.replayIndex=0;ui.replaySpeed=1;openModal('レースリプレイ','<div id="replay-view"></div><div class="replay-controls">'+btn('−5秒','replayJump','-5','secondary')+btn('再生','replayPlay','','primary')+btn('＋5秒','replayJump','5','secondary')+btn('1倍','replaySpeed','','secondary')+'</div><label class="field-label" for="replay-seek">再生位置</label><input id="replay-seek" type="range" min="0" max="'+(r.drive.replay.frames.length-1)+'" value="0" step="1"><p class="small muted">'+(r.drive.replay.from>.1?'途中からの記録です。':'助走からの走行記録です。')+'次のレースへ進むと、この記録は置き換わります。</p><div id="replay-log" class="action-log" aria-live="off"></div>');paintReplay();}
function paintReplay(){
 const host=document.getElementById('replay-view');if(!host||!replayRace)return;
 const d=replayRace.drive,p=d.replay,f=p.frames[ui.replayIndex],coords=(x,z)=>[300+x*1.55,180+z*1.75];
 const outline=radius=>Array.from({length:121},(_,i)=>{const v=R.pointAt(i*R.C.length/120,radius);return coords(v.x,v.z).join(',');}).join(' ');
 const marks=f.boats.map((b,i)=>{const n=d.boats[i],xy=coords(b[0],b[1]);return '<g transform="translate('+xy.join(' ')+')"><circle r="12" fill="'+['#fafafa','#293540','#ff6858','#51b3ff','#ffd856','#45dba0'][n.frame-1]+'" stroke="'+(n.isPlayer?'#ffe79b':'#102e3a')+'" stroke-width="'+(n.isPlayer?4:2)+'"/><text text-anchor="middle" y="5" fill="'+(n.frame===2?'white':'#102e3a')+'" font-size="15" font-weight="800">'+(b[5]===2?'転':n.frame)+'</text></g>';}).join('');
 host.innerHTML='<div class="section-line"><strong>'+root.KM_DRIVE_UI.clock(Math.max(0,f.t-R.startAt(d)))+'</strong><span>'+ (f.t<R.startAt(d)?'助走':Math.min(3,1+Math.floor(Math.max(0,f.boats[d.boats.indexOf(R.own(d))][3])/600)))+(f.t<R.startAt(d)?'':' / 3周')+'</span></div><svg class="replay-course" viewBox="0 0 600 360" role="img" aria-label="記録された6艇の位置"><rect width="600" height="360" rx="18" fill="#103744"/><polygon points="'+outline(R.C.outer)+'" fill="#20647a" stroke="#98dacf"/><polygon points="'+outline(R.C.inner)+'" fill="#0c2836" stroke="#efc46b"/><path d="M'+coords(R.pointAt(R.C.start).x,R.C.inner).join(' ')+' L'+coords(R.pointAt(R.C.start).x,R.C.outer).join(' ')+'" stroke="white" stroke-dasharray="4 4"/>'+marks+'</svg><div class="replay-standings">'+f.boats.map((b,i)=>({b,n:d.boats[i]})).sort((a,b)=>a.b[6]-b.b[6]).map(({b,n})=>'<div><span class="mini-boat boat-'+n.frame+'">'+n.frame+'</span><b>'+b[6]+'位 '+esc(n.name)+'</b><small>'+(['','完走','転覆','棄権','F','L'][b[5]]||Math.floor(b[4]*3.6)+' km/h')+'</small></div>').join('')+'</div>';
 document.getElementById('replay-log').innerHTML=p.events.filter(e=>e.t<=f.t+.005).slice(-8).map(e=>'<p>'+esc(e.text)+'</p>').join('')||'<p>走行記録を再生します。</p>';
 const seek=document.getElementById('replay-seek');seek.value=ui.replayIndex;seek.setAttribute('aria-valuetext',f.t.toFixed(1)+'秒');
 document.querySelector('[data-action="replayPlay"]').textContent=replayPlaying?'停止':'再生';document.querySelector('[data-action="replaySpeed"]').textContent=ui.replaySpeed+'倍';
}
function scheduleReplay(){clearTimeout(replayTimer);if(!replayPlaying||!replayRace)return;const frames=replayRace.drive.replay.frames;if(ui.replayIndex>=frames.length-1){stopReplay();paintReplay();return;}const delay=Math.max(16,(frames[ui.replayIndex+1].t-frames[ui.replayIndex].t)*1000/ui.replaySpeed);replayTimer=setTimeout(()=>{if(!replayPlaying||!document.getElementById('replay-view'))return;ui.replayIndex++;paintReplay();scheduleReplay();},delay);}
const app=document.getElementById('app');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('ja-JP',{maximumFractionDigits:1});
const money=formatMoney;
const plus=n=>(n>=0?'+':'')+round(n,2);
const btn=(label,action,value='',klass='',disabled=false)=>'<button data-view144="'+renderId+'" data-target144="'+esc(Progress144.token(state))+'" class="btn '+klass+'" data-action="'+action+'" data-value="'+esc(value)+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
const chip=(s,c='')=>'<span class="chip '+c+'">'+s+'</span>';
const box=(title,content,c='')=>'<section class="panel '+c+'"><h2>'+title+'</h2>'+content+'</section>';
const heading=(eyebrow,title,note='')=>'<div class="page-heading"><span class="eyebrow">'+eyebrow+'</span><h1>'+title+'</h1>'+(note?'<p class="muted">'+note+'</p>':'')+'</div>';
let verifiedBackupRaw=null;
const serializeSave121=Coaching.createSerializer();
const saveMetrics121={writes:0,serializeMs:0,writeMs:0,chars:0,lastDurableAt:state.savedAt||null};
let saveWarningShown121=false;
function save(periodic=false){
 const old=periodic?null:safeStorage.get(STORAGE);state.build=D.build;state.savedAt=new Date().toISOString();
 if(old&&!periodic){try{slotStore.protect(old);}catch(_){}}
 const now=()=>root.performance?.now?.()??Date.now(),start=now(),raw=serializeSave121(state,periodic),serialized=now();
 const durable=safeStorage.set(STORAGE,raw),written=now();
 Object.assign(saveMetrics121,{writes:saveMetrics121.writes+1,serializeMs:serialized-start,writeMs:written-serialized,chars:raw.length});
 if(durable)saveMetrics121.lastDurableAt=state.savedAt;
 if(old&&!periodic){try{if(old!==verifiedBackupRaw){decode(old);verifiedBackupRaw=old;}safeStorage.set(BACKUP,old);}catch(e){/* Preserve the last valid backup. */}}
 paintSaveHealth121();return durable;
}
function saveKeyName122(key){return key===STORAGE?'進行データ':key===BACKUP?'直前のバックアップ':key===PRACTICE_STORAGE122?'操作練習の記録':/kyotei_slots_v1_[123]$/.test(key)?'保存枠 '+key.slice(-1):key.endsWith('_archives')?'復元用バックアップ':key.endsWith('_update')?'更新前のバックアップ':'保存管理情報';}
function saveHealth122(){const pending=safeStorage.failures(),main=safeStorage.persistent;return {main,pending,other:pending.filter(x=>x.key!==STORAGE)};}
function paintSaveHealth121(){
 const banner=document.getElementById('save-health121');if(!banner)return;
 const health=saveHealth122(),bad=!health.main,warn=bad||health.other.length>0;banner.hidden=!warn;
 const racing=ui.page==='race'||ui.page==='practiceRace',kind=safeStorage.failure?.kind,labels=[...new Set(health.other.map(x=>saveKeyName122(x.key)))].join('・'),signature=bad+':'+racing+':'+kind+':'+labels;
 if(warn&&banner.dataset.saveSignature!==signature){banner.dataset.saveSignature=signature;banner.classList.toggle('racing',racing);banner.classList.toggle('partial',!bad);banner.innerHTML='<strong>'+(bad?'進行が一時保存中':'進行は保存済み')+'</strong><span>'+(bad?(racing?'終了後にJSONを書き出してください。':kind==='capacity'?'保存容量が足りません。閉じる前にJSONを書き出してください。':'端末へ保存できません。閉じる前にJSONを書き出してください。'):(racing?'一部のバックアップ・記録が未保存です。':esc(labels)+'の更新が未完了です。'))+'</span>'+(racing?'':btn('JSONを書き出す','export','','secondary')+btn('未保存分を再試行','retrySave','','text-btn'));}
 for(const node of document.querySelectorAll('[data-save-status121]'))node.textContent=bad?'進行が一時保存中 · 終了前にJSONを書き出してください':(health.other.length?'進行は保存済み · バックアップ・記録に未保存あり':'自動保存')+(saveMetrics121.lastDurableAt?' · '+new Date(saveMetrics121.lastDurableAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'}):'');
 if(bad&&!saveWarningShown121){saveWarningShown121=true;toast('進行を端末へ保存できません。終了前にJSONを書き出してください。');}
 if(!bad)saveWarningShown121=false;
}
function saveStatusPanel121(){const health=saveHealth122();return '<section class="craft-card"><h3>保存の状態</h3><p data-save-status121></p>'+([STORAGE,BACKUP,PRACTICE_STORAGE122,...health.other.map(x=>x.key)].filter((k,i,a)=>a.indexOf(k)===i).map(key=>{const q=safeStorage.status(key);return '<p class="save-row122"><b>'+saveKeyName122(key)+'</b><span>'+(q.pending?'未保存 · 再試行できます':q.failure?'読出しを確認してください':q.lastDurableAt?'保存済み':'次回の保存時に確認')+'</span></p>';}).join(''))+(!health.main||health.other.length?btn('未保存分を再試行','retrySave','','secondary'):'')+'<details><summary>保存の診断情報</summary><p>直近のデータ量 '+Storage122.byteLength(serializeSave121(state,true)).toLocaleString('ja-JP')+' バイト / 整形 '+saveMetrics121.serializeMs.toFixed(1)+' ms / 書込 '+saveMetrics121.writeMs.toFixed(1)+' ms</p><small>この端末での直近1回の計測です。保存容量上限や端末間の速度比較を示す値ではありません。JSONの読み込み上限はファイル・貼り付けとも15 MBです。</small></details></section>';}

function toast(text){const t=document.getElementById('toast');t.textContent=text;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),3500);}
function stopAuto(){ui.auto=false;clearTimeout(autoTimer);autoTimer=null;}
function navigate(page){dismissModal139();root.KM_PRESENTATION?.cancel();stopReplay();if(driveController){driveController.destroy();driveController=null;}stopAuto();ui.page=page;render();root.scrollTo({top:0,behavior:'auto'});}
function currentRace(){return ui.quick?state.quick&&state.quick.race:state.career&&state.career.series&&state.career.series.race;}
function careerPage(){return state.career?state.career.status:'title';}
function abilityChip(id){const a=ability(id);return '<button class="skill-chip '+a.rarity.toLowerCase()+(isWeak(id)?' weak':'')+'" data-action="ability" data-value="'+id+'"><b>'+a.rarity+'</b> '+esc(a.name)+'<span class="skill-category">'+a.category+'</span></button>';}
function skills(p){return '<div class="skill-chips">'+(p.skills.length?p.skills.map(abilityChip).join(''):'<span class="muted">まだ能力を持っていません</span>')+'</div>';}
function growthArrow(v){return v>=1.5?'↑↑':v>=1.2?'↑':v>=1?'→':'↓';}
function parameter(value,range=null,signed=false){const v=R.gradeValue(value,range);return '<span class="parameter">'+(signed&&v.value>=0?'+':'')+v.value+'<i class="grade grade-'+v.rank+'">'+v.rank+'</i></span>';}
function statsPanel(p,compact=false){const g=growthOf(p);return '<div class="stats-grid'+(compact?' compact':'')+'">'+keys.map(k=>'<div class="stat"><span>'+D.stats[k]+' <em class="growth-arrow" title="成長型による伸びやすさ">'+growthArrow(g.values[k])+'</em></span><strong>'+parameter(p.stats[k])+'</strong><div class="stat-track"><span style="width:'+Math.min(100,p.stats[k]/D.statCeiling(p,k)*100)+'%"></span></div></div>').join('')+'</div>';}

function adjustPanel(p){return '<div class="adjust-grid">'+['motor','prop'].map(k=>'<div><span class="muted">'+Workshop.parts[k].name+'整備</span><b>整備力 '+Workshop.rank(Workshop.effective(p,k))+'</b><small>基礎 '+Workshop.rank(Math.min(88,p.adjust[k+'Success']))+(Workshop.effective(p,k)>Math.min(88,p.adjust[k+'Success'])?' · 特殊能力で補正':' · 経験で育つ')+'</small></div>').join('')+'</div>';}

function equipmentPanel(p){if(!p.equipment)return '';return '<div class="equipment-grid">'+[['boat','BOAT','ボート'],['motor','MOTOR','モーター'],['prop','PROPELLER','プロペラ']].map(([part,en,label])=>'<div>'+equipmentArt(part)+'<span class="eyebrow">'+en+'</span><b>'+label+'</b>'+(part==='boat'?'':'<small>'+gearTrait(part,p.equipment[part])+'</small>')+'<p>'+Object.entries(p.equipment[part]).filter(([k])=>k!=='trait').map(([k,v])=>'<span class="gear-parameter">'+(k==='condition'?'状態':k==='stability'?'安定':D.stats[k])+' '+parameter(v,R.equipmentRange(part,k),!['condition','stability'].includes(k))+'</span>').join('')+'</p></div>').join('')+'</div>';}

function synergy(p){const b=buildInfo(p),links=R.buildLinks(p),ready=links.filter(x=>x.ready),near=links.find(x=>!x.ready&&x.missing.length<=1);return '<div class="synergy"><div>'+chip(b.name,'teal')+' <span>'+b.plus+'</span></div><p><span>注意</span>'+b.caution+'</p><p><span>戦術</span>'+b.tactic+'</p>'+ready.map(x=>'<p class="combo-line"><b>連携 '+esc(x.name)+'</b><small>'+esc(x.description)+'</small></p>').join('')+(near?'<p class="combo-hint">次の連携：'+esc(near.name)+' · '+(near.missing.length?near.missing.map(g=>g.slice(0,2).map(id=>ability(id).name).join(' / ')+(g.length>2?' など':'')).join(' ＋ '):'')+(near.stats.length?' '+near.stats.map(x=>D.stats[x.key]+x.value+'以上').join('・'):'')+'</p>':'')+'</div>';}
function gateProgress(p){const pct=Math.min(100,p.totalEarnings/D.sgThreshold*100);return '<div class="gate"><div><strong>SGへの道</strong><span>'+money(p.totalEarnings)+' <small>/ '+money(D.sgThreshold)+'</small></span></div><div class="stat-track"><span style="width:'+pct+'%"></span></div><p>'+ (pct>=100?'賞金条件達成。G1後期を終えると最高峰へ。':'G1後期終了時に判定。あと '+money(Math.max(0,D.sgThreshold-p.totalEarnings)))+'</p></div>';}
function footer(){return '<footer class="save-footer"><span data-save-status121></span></footer>';}

function openAux(page){ui.backStack=ui.backStack||[];if(ui.page!==page)ui.backStack.push(ui.page);navigate(page);}
function nav(){
 if(!state.career)return '';
 const groups={resume:['home','action','preRace','seriesIntro','raceResult','seriesResult','development','shop'],stories:['stories','campaign','bonds','mentor'],profile:['profile'],data:['data']};
 return '<nav class="bottom-nav app-dock" aria-label="ゲームメニュー">'+[['resume','helm','育成'],['stories','book','物語'],['profile','person','選手'],['data','gear','設定']].map(([action,icon,label])=>{const current=groups[action].includes(ui.page);return '<button class="btn text-btn '+(current?'active':'')+'" data-action="'+action+'" data-value="'+(action==='profile'?esc(state.career.player.id):'')+'"'+(current?' aria-current="page"':'')+'>'+icon98(icon)+'<span>'+label+'</span>'+'</button>';}).join('')+'</nav>';
}

// v105: shared story stage and compact development panels.
let novelCurrent=null;
function readerBook(){if(ui.novelRegistry){const p=Profile.find(state,ui.novelRegistry);if(p?.developmentJournal)return p.developmentJournal.readers;return ui.guestReaders||(ui.guestReaders={});}return state.career?Development.ensure(state.career).readers:(ui.guestReaders||(ui.guestReaders={}));}
function novelContext(sc){const archived=ui.novelRegistry?Profile.find(state,ui.novelRegistry):ui.page==='campaign'&&ui.campaignPlayer?Profile.find(state,ui.campaignPlayer):null,p=archived||state.career?.player,j=archived?.developmentJournal,baseRival=j?Development.rivals.find(r=>r.id===j.rival.cast):state.career?Development.rival(state.career):null,rival=sc.person&&baseRival&&sc.person.name===baseRival.name?sc.person:baseRival;return {person:sc.person,playerName:p?.name||'主人公',rival,people:[sc.person,rival,...Object.values(Development.actors),...Object.values(Cast.map),...Bonds.B.heroines,...Object.values(root.KM_PORTRAITS.supporting),{id:'riku',name:'陸'},Finale.king].filter(Boolean)};}

function flowScene131(c,a){
 const f=Flow.ensure(c);if(f.reply){const p=f.reply.person;return {key:'flow-reply:'+a.key,...f.reply,person:Bonds.B.map[p]||Cast.map[p]||Object.values(Development.actors).find(x=>x.id===p)||(Development.rival(c).id===p?Development.rival(c):null),choices:[],flowKey:a.key};}
 let sc=null;
 if(a.kind==='campaign'){const t=Campaign.ensure(c),e=t.entries.find(x=>x.id===a.id);if(e&&!e.read){const q=Campaign.scene(t,e.id);sc={...q,key:'campaign:'+c.player.id+':'+e.id,person:Development.actors[t.arc],background:t.arc==='shore'?'harbor':'workshop',choices:(q.choices||[]).map((label,i)=>({label,action:'campaignChoice',value:e.id+'|'+i}))};}}
 if(a.kind==='heroine'){const q=c.bonds?.heroines[a.id];if(q?.step===a.step&&Bonds.gate(c,a.id).chapter){if(c.bonds.pending?.id!==a.id||c.bonds.pending.step!==a.step)Bonds.open(c,a.id);const x=Bonds.scene(c);if(x)sc={...x,key:'bond:'+x.key+(x.readerVersion?':'+x.readerVersion:''),person:x.heroine,background:a.id==='akari'?'workshop':a.id==='tsumugi'?'cafe':'harbor',choices:x.choices.map((x,i)=>({label:x.label,action:'bondChoice',value:c.bonds.pending.key+'|'+i}))};}}
 if(a.kind==='rival'&&Drama.rivalGate(c).open&&Drama.rivalGate(c).index===a.step){const x=Drama.rivalScene(c,Development.rival(c));sc={...x,choices:x.choices.map((label,i)=>({label,action:'rivalChoice',value:x.index+'|'+i}))};}
 if(a.kind==='mentorIntro'){const x=Cast.introductionScene(c);if(x&&x.mentor.id===a.id&&x.step===a.step)sc={...x,choices:[{label:x.actionLabel,action:'mentorIntroAdvance',value:x.key}]};}
 if(a.kind==='mentor'&&Cast.routeGate(c).open){const q=Cast.routeState(c);if(q.id===a.id&&q.step===a.step){const x=Cast.routeScene(c)||Cast.routeOpen(c);if(x)sc={...x,key:'mentor:'+x.key,person:x.mentor,background:'workshop',choices:x.choices.map((x,i)=>({label:x.label,action:'mentorChoice',value:q.pending.key+'|'+i}))};}}
 if(a.kind==='event'&&c.story?.pending?.key===a.id)sc=eventScene131();
 if(a.kind==='request'&&Affinity.offer(c)?.id===a.id)sc=requestNovel(c);
 if(a.kind==='short143')sc=Passage143.middle(c);
 if(a.kind==='moment142')sc=Continuity142.scene(c,a.id,a.step,Bonds.B);
 if(a.kind==='epilogue')sc=Epilogues126.scene(c,a.id);
 if(a.kind==='daily'||a.kind==='retrospective')sc=Journey134.scene(c,a.id);
 if(a.kind==='awakening'){const x=Awakening136.scene(c,a.id),e=Awakening136.pending(c);if(x&&e?.key===a.id)sc={...x,choices:x.choices.map((ch,i)=>({...ch,action:'awakeningChoice136',value:a.id+'|'+i}))};}
 return sc?{...sc,flowKey:a.key}:null;
}
function advanceFlow131(page){const c=state.career;if(!c||!Flow.checkpoint(c,page)||ui.quick)return false;const f=Flow.ensure(c);Flow.collect(c,page,E);if(f.paused){save();return false;}for(let i=0;i<25;i++){const a=Flow.begin(c,page,E);if(!a){save();return false;}const sc=flowScene131(c,a);if(sc){ui.novelRegistry=null;ui.novelBack=f.returnPage;ui.novel=sc;ui.page='novel';save();return true;}Flow.drop(c);}return false;}
function resumeFlow131(){const c=state.career;if(!c)return;const f=Flow.ensure(c);f.paused=false;ui.page=Flow.checkpoint(c,careerPage())?careerPage():f.returnPage;render();}
// An absent key is never ownership: manual readers must use their own completion handler.
function ownsFlow135(sc){return !!sc?.flowKey&&sc.flowKey===state.career?.flow131?.active?.key;}
function finishFlow131(advance){if(!ownsFlow135(novelCurrent))return;const c=state.career,f=Flow.ensure(c),page=Flow.checkpoint(c,c.status)?c.status:f.returnPage;f.returnPage=page;if(advance)Flow.finish(c,E);else f.paused=true;novelCurrent=null;ui.novel=null;ui.novelRegistry=null;ui.novelBack=null;ui.page=page;closeModal();save();render();}

function novelChoices136(sc){return '<div class="novel-choice-heading123">返答を選ぶ <small>'+sc.choices.length+'つの選択肢</small></div><div class="novel-choices">'+sc.choices.map((ch,j)=>btn('<span class="novel-choice-index123" aria-hidden="true">'+(j+1)+'</span><b>'+esc(ch.label)+'</b>'+(ch.note?'<small>'+esc(ch.note)+'</small>':''),ch.action,ch.value,'novel-choice',!!ch.disabled)).join('')+'</div>';}
function novelView(sc){
 const original=sc,book=readerBook(),introduced=Introductions126.prepare(state.career,sc,{book,record:!!ui.novelRegistry||!!sc.record});sc=introduced.scene;
 const pages=Dialogue.pages(sc.body),key=Dialogue.bookmark(sc.key),i=Dialogue.cursor(book,key,pages.length),context=novelContext(sc),line=Dialogue.describe(pages[i],context),reading=Dialogue.readingState({index:i,total:pages.length,choices:sc.choices});
 const introductionRead=Introductions126.read(state.career,sc,i);if(introduced.changed||introductionRead)save();
 novelCurrent={...sc,key,pages,index:i,context};
 if(i===pages.length-1){const marked=Reader.mark(state,sc,pages),baseMarked=Reader.mark(state,original,Dialogue.pages(original.body));if(marked||baseMarked)save();}

 if(line.kind==='bridge')return '<section class="novel-stage novel-bridge131'+(reading.awaitingChoice?' has-choices':'')+'" aria-label="場面転換"><div class="novel-top"><h2>'+esc(sc.title)+'</h2>'+btn('中断して戻る','novelExit','','novel-close')+'</div><div class="bridge-card131"><small>場面転換</small><p class="bridge-time131">'+esc(line.when)+'</p><h3>'+esc(line.place)+'</h3>'+(line.caption?'<p>'+esc(line.caption)+'</p>':'')+'</div><div class="novel-bottom"><div class="novel-tools">'+btn('前へ','novelPrev','','text-btn',i===0)+'<span>'+reading.pageText+'</span>'+btn('履歴','novelHistory','','text-btn')+'</div>'+(reading.awaitingChoice?novelChoices136(sc):btn(reading.nextLabel,'novelNext','','primary novel-next123'))+'</div></section>';
 const person=line.person||(line.kind==='person'||line.inner?null:sc.person),portrait=person?Bonds.portrait(person,true,Dialogue.portraitEmotion(line,person,{scene:sc,index:i})).replace('loading="lazy"','loading="eager"'):'',awaiting=reading.awaitingChoice;
 const compact=person?'<div class="novel-compact-cast128" aria-label="'+esc((line.inner?'心の声：':line.person?'話し手：':'聞き手：')+person.name)+'">'+portrait+'<span>'+esc(person.name)+(line.person?'':' · 聞き手')+'</span></div>':'';
 const boxTag=awaiting?'div':'button',boxAttrs=awaiting?' role="group" aria-label="返答を選ぶ前の文章"':' type="button" data-action="novelNext" aria-label="'+reading.nextLabel+'"';
 return '<section class="novel-stage novel-'+(sc.background||'harbor')+(awaiting?' has-choices':'')+(sc.romanceLabel?' novel-romance127':'')+'" aria-label="'+esc(sc.title)+'"><div class="novel-backdrop"></div><div class="novel-top'+(person?' has-compact128':'')+'">'+compact+'<div class="novel-title128"><small>'+esc(sc.romanceLabel||'水面の物語')+'</small><h2>'+esc(sc.title)+'</h2></div>'+btn('中断して戻る','novelExit','','novel-close')+'</div><div class="novel-cast '+(line.inner?'is-thinking':line.person?'is-speaking':'is-listening')+'">'+portrait+(person?'<span>'+esc(person.name)+'</span>':'')+'</div><div class="novel-bottom novel-reader123"><div class="novel-tools">'+btn('前へ','novelPrev','','text-btn',i===0)+'<div class="novel-progress123"><span>'+reading.pageText+'</span><progress value="'+reading.current+'" max="'+reading.total+'" aria-label="会話の進み具合"></progress></div>'+(sc.finish==='campaignFinish'?btn('章一覧','campaignChapters',ui.campaignPlayer,'text-btn'):'')+btn('履歴','novelHistory','','text-btn')+(Reader.known(state,sc,pages)&&i<pages.length-1?btn('既読スキップ','novelSkip129','','text-btn novel-skip129'):'')+'</div>'+(reading.hasChoices?'<p class="novel-status123">'+reading.phaseLabel+'</p>':'')+'<'+boxTag+boxAttrs+' class="novel-box speaker-'+line.kind+(line.inner?' is-monologue132':'')+'"><span class="novel-speaker">'+esc(line.speaker)+'<small class="novel-speaker-role123">'+esc(line.roleLabel)+'</small></span><span class="novel-text" aria-live="polite">'+esc(line.text)+'</span>'+(!awaiting?'<span class="novel-hint">'+reading.nextHint+'</span>':'')+'</'+boxTag+'>'+(awaiting?'<div class="novel-choice-heading123">返答を選ぶ <small>'+reading.choiceCount+'つの選択肢</small></div><div class="novel-choices">'+sc.choices.map((ch,j)=>btn('<span class="novel-choice-index123" aria-hidden="true">'+(j+1)+'</span><b>'+esc(ch.label)+'</b>'+(ch.note?'<small>'+esc(ch.note)+'</small>':''),ch.action,ch.value,'novel-choice',!!ch.disabled)).join('')+'</div>':btn(reading.nextLabel+' '+icon98('arrow'),'novelNext','','primary novel-next123'))+'</div></section>';
}
function openNovel(sc){if(ui.page!=='novel')ui.novelBack=ui.page;ui.novelRegistry=sc.registry||null;ui.novel=sc;navigate('novel');}
// Closing dismisses the reader. Only reading to the end may open a following scene.
function endNovel(advance=false){
 const sc=novelCurrent;if(!sc)return;const c=state.career;if(ownsFlow135(sc)){finishFlow131(advance);return;}const activeScene=!!c&&!ui.novelRegistry&&!sc.record,q=activeScene&&Affinity.offer(c);
 if(!advance&&q)q.deferred=true;
 let page=ui.page==='novel'?ui.novelBack:ui.page;
 if(sc.exit==='mentorBack')page='mentor';
 if(sc.exit==='bondBack'||sc.exit==='requestTalk')page='bonds';
 if(sc.exit==='campaignExit'||sc.finish==='campaignFinish'){page=ui.campaignPlayer===c?.player.id?'stories':'profile';if(page==='profile')ui.profileId=ui.campaignPlayer;}
 if(!page||['novel','campaign'].includes(page))page=careerPage();
 if(activeScene&&page==='mentor')Cast.routeDepart(c);
 if(activeScene&&page==='bonds')Bonds.depart(c);
 novelCurrent=null;ui.novel=null;ui.novelBack=null;ui.novelRegistry=null;ui.bondOutcome=null;ui.mentorOutcome=null;
 ui.backStack=(ui.backStack||[]).filter(p=>!['novel','campaign'].includes(p));ui.page=page;
 closeModal();save();ui.closingNovel=!advance;
 const next=advance&&(sc.finish||sc.exit);if(next&&actions[next])actions[next]();else navigate(page);
}
function eventScene131(){const c=state.career,p=c?.story?.pending;if(!p)return;if(p.kind==='duel'){const q=c.story.duel,main=Development.rival(c),r=q.rivalId===main.id?main:c.story.rivals.find(x=>x.id===q.rivalId)||{id:q.rivalId,name:q.rivalName,wins:0,losses:0};return ({key:'event:'+p.key,title:q.rivalName+'からの挑戦',person:r,background:'harbor',body:[r.wins+r.losses?'これまでの対戦は '+r.wins+'勝 '+r.losses+'敗。':'同じ出走表を見ながら、対決の話をした。',r.name+'「今日、勝負しない？　この一戦に向けて、練習してきた」','主人公「どこを変えたか、聞いても教えないだろ」',r.name+'「そこは走って確かめて。こっちも、今の走りを見たい」','主人公「自分も準備はしてきた。受けるかどうか、ここで返事する」'],choices:[{label:'勝負を受ける',action:'storyChoice',value:p.key+'|0'},{label:'今回は見送る',action:'storyChoice',value:p.key+'|1'}]});}else{const e=Story.resolve(p);return ({key:'event:'+p.key,title:(e.arc?e.arcName+' · '+(e.step+1)+' / 3話 · ':'')+e.title,person:speaker105(e.speaker),background:'workshop',body:[e.text,...(Story.routeNote(c,e)?[Story.routeNote(c,e)]:[])],choices:e.choices.map((ch,i)=>({label:ch.label,action:'storyChoice',value:p.key+'|'+i}))});}}
function requestBeforeRace(){if(!ui.quick&&state.career&&Affinity.offer(state.career)){actions.requestTalk();return true;}return false;}

function outcomeNovel(z,person,background='workshop'){if(!z)return;const source=novelCurrent,body=[z.note,...(z.failed?['この相手とのルートは終了しました。今回の育成では再開できません。']:[]),...(z.rewards?.length?[z.rewards.join(' / ')]:[])],sc={key:'reply:'+(source?.key||state.career?.stats.races+':'+(z.title||'')),title:z.title||'交わした言葉',body,person,background,emotion:z.emotion,expressionCues:z.expressionCues,romanceLabel:source?.romanceLabel,exit:z.exit||source?.exit};if(ownsFlow135(source)){sc.flowKey=source.flowKey;sc.key='flow-reply:'+source.flowKey;state.career.flow131.reply={title:sc.title,body,person:person?.id||'',background};save();}openNovel(sc);}

function socialButton129(c,kind){return Social.available(c,kind,E)?btn('今節の交流を読む','socialTalk129',kind,'secondary large'):'';}
function affinityMeter(c,kind,id){const g=Affinity.gate(c,kind,id),label=g.unlocked?(kind==='heroine'?'交際の好感度条件 達成':'最終話 解放済み'):g.open?'好感度条件 達成':(kind==='heroine'?'交際の約束まで あと':'最終話まで あと')+g.remaining;return '<div class="affinity-meter '+(g.open?'ready':'')+'"><div><span>好感度 <b>'+g.current+'</b><small> / 100</small></span><strong>'+label+'</strong></div><div class="affinity-track" role="meter" aria-label="好感度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+g.current+'"><i style="width:'+g.current+'%"></i><em style="left:'+g.required+'%" aria-hidden="true"></em></div>'+(Affinity.guidance(c,kind,id)?'<p class="affinity-guidance">'+esc(Affinity.guidance(c,kind,id))+'</p>':'')+'</div>';}
function affinityName(q,c){return q.kind==='rival'?Development.rival(c).name:q.kind==='mentor'?Cast.map[q.id]?.name:Bonds.B.map[q.id]?.name;}
function affinityChanges(c,z){return z.affinity?.length?'<div class="affinity-result" aria-label="好感度の変化">'+z.affinity.map(q=>'<div><span>'+esc(affinityName(q,c))+'<small>'+esc(q.reason)+'</small></span><b class="'+(q.delta<0?'down':'up')+'">'+(q.delta>=0?'＋':'')+q.delta+'<small>好感度 '+q.after+'</small></b></div>').join('')+'</div>':'';}
function requestPanel(c){const q=Affinity.active(c);if(!q)return '';const h=Bonds.B.map[q.heroine];return '<aside class="relationship-promise">'+Bonds.portrait(h.id)+'<div><small>'+h.name+'との約束</small><b>'+(q.status==='offer'?'次の一走について、返事を待っています':'次の公式レースで '+q.target+'着以内')+'</b><span>'+(q.status==='offer'?'出走前に返答してください':'有効完走で達成 · あと1走')+'</span></div>'+(q.status==='offer'?btn('返事する','requestTalk','','primary'):'')+'</aside>';}
function requestNovel(c){const sc=Affinity.requestScene(c,Bonds.B.map);return sc?{...sc,mandatory:true,choices:sc.choices.map((ch,i)=>({...ch,note:ch.note,action:'requestChoice',value:Affinity.offer(c).id+'|'+i}))}:null;}

function developmentStrip(c){const t=Development.ensure(c),p=Development.plan(c),r=Development.rival(c),canPlan=!p&&!c.ending&&['home','seriesIntro','action','preRace'].includes(c.status)&&(!c.series||c.series.round===0);return '<section class="development-strip"><div class="development-person">'+Bonds.portrait(r)+'<div><small>ライバル</small><b>'+r.name+'</b><span>'+r.wins+'勝 '+r.losses+'敗 · '+D.stats[r.key]+'の使い手</span><small>対話 '+(t.rival.drama?.entries.filter(e=>e.decision).length||0)+' / 8話</small></div>'+btn('話す','mainRival','','secondary')+'</div>'+affinityMeter(c,'rival')+socialButton129(c,'rival')+'<div class="development-links">'+btn('技の成長','development','','secondary')+(canPlan?btn('今節の約束を決める','planOpen','','primary'):p?'<span>'+chip(Development.plans[p.arc][p.choice].short,'teal')+(p.arc==='shore'?' '+p.progress+' / '+(p.choice?2:3):'')+'</span>':'')+'</div></section>';}
function opportunity134(c){const q=Journey134.offer(c);if(!q||q.used)return '';const d=Journey134.description(c,q,E),off=c.status!=='action'||c.series.action.normal+c.series.action.training<=0;return '<aside class="opportunity134"><small>今回の出走前まで</small><h3>'+esc(d.title)+'</h3><p>'+esc(d.reason)+'</p><p class="small">'+esc(d.task)+'</p><p class="micro muted">練習1回を使用 · 賞金の消費なし · '+D.stats[q.key]+'の能力と技のコツを育てる</p>'+btn('この練習を試す','opportunity134','','secondary large',off)+'</aside>';}
function opportunityResult134(z){const q=z.opportunity134;if(!q)return '';const text={verified:'練習した内容の実践を、走行記録で確認できました。',missed:'有効完走しましたが、練習した内容の実践条件には届きませんでした。',invalid:'有効完走できなかったため、実践の達成には数えていません。',unverified:'練習は記録しました。今回は実践を確かめる走行記録がありません。'};return '<details class="opportunity134"><summary>'+esc(q.title)+'の振り返り</summary><p>'+D.stats[q.key]+'：'+text[q.status]+'</p></details>';}
function rivalMemory134(c){const p=Journey134.preface(c,E);return p?'<details class="rival-memory134"><summary>'+esc(p.name)+'との前の一走</summary><p>'+esc(p.text)+'</p><p class="small">前に確認したこと：'+esc(p.task)+'</p></details>':'';}
function journeyJournal134(source,id){const j=source.journey134||source.journeyJournal,b=source.bonds||source.bondJournal,t=source.campaign||source.campaignJournal,rows=[];for(const e of t?.entries||[])if(e.read&&e.decision){const sc=Campaign.scene(t,e.id);rows.push('<li><b>'+esc(sc.title)+'</b><span>'+esc(sc.body.find(x=>x.startsWith('選んだ返答：'))?.slice('選んだ返答：'.length)||'この話で返答を選んだ')+'</span></li>');}for(const [hid,q] of Object.entries(b?.heroines||{}))for(const m of q.memories133||[]){const beat=root.KM_CHOICES133.beats[hid]?.[m.chapter];if(beat&&m.chapter<q.step)rows.push('<li><b>'+esc(Bonds.B.map[hid].name)+' 第'+(m.chapter+1)+'話</b><span>'+esc(beat.options[m.option][0])+'</span></li>');}const scenes=(j?.daily||[]).filter(x=>x.read),ending=!!j?.ending;if(!rows.length&&!scenes.length&&!ending)return '';return '<section class="journey-journal134"><h2>選んだ道の記録</h2>'+(ending?btn('持ち帰ったものを読む','journeyRead134',id+'|ending','secondary large'):'')+(rows.length?'<details><summary>これまでに選んだ言葉</summary><p class="small muted">読んだ話と、実際に選んだ返答だけを残しています。</p><ol class="choice-history134">'+rows.join('')+'</ol></details>':'')+(scenes.length?'<details><summary>レースのない日の話</summary>'+scenes.map(x=>btn(esc(x.title),'journeyRead134',id+'|'+x.id,'secondary large')).join('')+'</details>':'')+'</section>';}
function training105(c){
 const a=c.series.action,p=c.player,m=c.cast?.mentor&&Cast.map[c.cast.mentor.id],r=Development.rival(c),off=a.normal+a.training<=0;
 const growthLabel=v=>v>=1.5?'とても伸びやすい':v>=1.2?'伸びやすい':v>=1?'標準の伸び':'伸びは控えめ';
 return opportunity134(c)+'<p class="action-budget123">'+(off?'✓ 今回の練習は使い切りました':'1回の練習で、選んだ能力を伸ばします')+'</p><p class="small muted">自主練は能力を、合同練習は能力と技のコツを育てます。</p><div class="training-grid">'+keys.map(k=>btn('<span>'+D.stats[k]+'</span><small class="training-value123">現在値</small><b>'+parameter(p.stats[k])+'</b><small class="training-growth123">'+growthArrow(growthOf(p).values[k])+' '+growthLabel(growthOf(p).values[k])+'</small>','train',k,'training-btn',off)).join('')+'</div><div class="training-partners">'+(m?(Cast.introduced(c)?btn(Cast.portrait(m.id)+'<span><b>'+m.name+'と合同練習</b><small>'+D.stats[m.key]+'の能力・コツを育てる</small></span>','jointTrain','mentor|'+m.key,'secondary',off):btn(Cast.portrait(m.id)+'<span><b>'+m.name+'に話を聞く</b><small>出会いと入門の相談 · 行動回数は使いません</small></span>','mentorIntro','','secondary')):'<p class="micro muted">G3から師匠との合同練習が開きます。</p>')+btn(Bonds.portrait(r)+'<span><b>'+r.name+'と特訓</b><small>'+D.stats[r.key]+'の能力・コツを育てる</small></span>','jointTrain','rival|'+r.key,'secondary',off)+'</div>'+btn('技の成長を見る','development','','text-btn');
}
function developmentView(){const c=state.career;if(!c)return heading('技の成長','育成を始めてください');const t=Development.ensure(c),count=Object.values(t.paths).filter(q=>q.branch!==null).length;return heading('技の成長','積み上げた走りを 自分の技へ')+recoveryPanel118(c)+btn('戻る','return','','text-btn')+'<p class="small muted">コツを学び レースで実践。G2から主軸にする技を2つまで開花できます。</p>'+keys.map(k=>{const p=Development.paths[k],q=t.paths[k];return '<article class="technique-card"><div class="section-line"><h3>'+p.name+'</h3>'+chip(q.branch!==null?'開花':q.learned?'習得済み':'練習中',q.branch!==null?'gold':'teal')+'</div><div class="technique-meter"><span>コツ '+Math.floor(q.hints)+' / 5</span><progress max="5" value="'+Math.min(5,q.hints)+'"></progress><span>実践 '+Math.floor(q.practice)+' / 5</span><progress max="5" value="'+Math.min(5,q.practice)+'"></progress></div><p class="small">'+p.task+'</p><p>'+abilityChip(q.branch!==null?p.branches[q.branch]:p.base)+'</p>'+(q.branch===null?'<div class="button-row">'+p.branches.map((id,i)=>btn('<b>'+ability(id).name+'</b><small>'+p.styles[i]+'</small>','blossom',k+'|'+i,'secondary',!Development.ready(c,k))).join('')+'<small class="muted">'+(count>=2?'今回の主軸2つは決まりました':!q.learned?'コツ2・実践2で基礎技を習得':c.stage<4?'G2から開花できます':q.hints<5||q.practice<5?'コツ5・実践5で開花':'開花する技を選べます')+'</small>':'')+'</article>';}).join('');}
function final105(c){const r=c.series?.race;if(!r||r.type==='qualifier')return '';const f=Development.brief(c,r);return '<aside class="final-preparation"><small>この一戦の勝ち筋</small><h3>'+esc(f.opponent)+'との決勝</h3><div class="chip-row">'+chip('相手の武器 '+f.weapon)+chip('自分の軸 '+D.stats[f.key],'teal')+'</div><p>'+esc(f.tactic)+'</p>'+btn('決勝前のひととき','finalTalk','','secondary')+'</aside>';}
function identity105(c,journal=null){const z=journal?.archive||Development.finale(c);return '<section class="career-identity"><small>あなたが育てた選手</small><h3>'+esc(z.title)+'</h3><div class="chip-row">'+chip(D.stats[z.key]+'が武器','teal')+chip(esc(z.rival)+'に '+z.wins+'勝 '+z.losses+'敗')+'</div>'+(z.opened.length?'<p>'+z.opened.map(esc).join(' · ')+'</p>':'')+'<p class="small">'+esc(z.next)+'</p></section>';}

function careerStrip(c){if(c.short143)return '<p class="notice">短編育成 · 一節で完結 · '+c.stats.races+'走終了</p>';return '<div class="mode-line">'+chip(difficulty(c.player).name,'teal')+'<small>'+(difficulty(c.player).id==='easy'?'勝ちやすい・成長は控えめ':difficulty(c.player).id==='hard'?'強化CPU・SS120・最優秀でMLR':'手応えあり・大きく育つ')+'</small></div><div class="career-strip">'+D.stages.map((s,i)=>'<span class="'+(i===c.stage?'current':i<c.stage?'complete':'')+'" title="'+s.name+'">'+(i===8?'SG':i%2===0?D.tiers[s.tier].label:'後')+'</span>').join('')+'</div>';}
function equipmentArt(part){const shared='<svg class="gear-art" viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="91" cy="87" rx="61" ry="6" fill="#061626" opacity=".35"/>';const shapes={
 boat:'<path d="M17 68L133 34 167 54 134 77 44 87Z" fill="#fff0d3" stroke="#071f32" stroke-width="3"/><path d="M17 68L44 87 134 77 167 54 138 85 46 95Z" fill="#388eae" stroke="#071f32" stroke-width="3"/><path d="M41 66L121 44 143 54 74 74Z" fill="#f07559"/><path d="M50 55L74 48 97 62 72 70Z" fill="#102e42"/><path d="M39 51L52 44 59 53 49 60Z" fill="#9bcac9" stroke="#071f32" stroke-width="3"/>',
 motor:'<path d="M68 17L113 11 132 27 128 58 104 67 104 91 82 94 81 66 61 52Z" fill="#8accc9" stroke="#071f32" stroke-width="3"/><path d="M68 17L85 32 132 27 113 11Z" fill="#e5f4df"/><path d="M85 32L82 61 104 67 128 58 132 27Z" fill="#36708b"/><path d="M88 38L124 33M88 45L122 40M88 52L120 47" stroke="#bdded9" stroke-width="3"/><path d="M82 83L66 78 73 92 101 91" fill="#ec775c" stroke="#071f32" stroke-width="3"/>',
 prop:'<path d="M91 52C44 64 30 34 49 18 75 17 81 37 91 52Z" fill="#d9eeec" stroke="#071f32" stroke-width="3"/><path d="M91 52C113 13 144 26 148 49 133 71 112 60 91 52Z" fill="#84b8c3" stroke="#071f32" stroke-width="3"/><path d="M91 52C122 86 92 103 72 92 59 72 80 61 91 52Z" fill="#4685a0" stroke="#071f32" stroke-width="3"/><circle cx="91" cy="52" r="16" fill="#f6c982" stroke="#071f32" stroke-width="3"/><circle cx="91" cy="52" r="6" fill="#18394d"/>'};return shared+shapes[part]+'</svg>';}
function pilotArt(){return '<svg class="pilot-art" viewBox="0 0 100 120" aria-hidden="true"><path d="M4 120L16 87 42 76 64 76 88 94 97 120" fill="#ed7458" stroke="#102c40" stroke-width="3"/><path d="M17 120L24 90 41 84 53 119M88 120L78 93 66 85 53 119" fill="#fff1d6"/><path d="M26 62Q13 19 46 9 80 4 86 41L78 75 48 87Z" fill="#fff2d9" stroke="#102c40" stroke-width="3"/><path d="M27 34Q49 25 82 33L80 55 56 71 33 61Z" fill="#153d57" stroke="#102c40" stroke-width="3"/><path d="M35 38L69 33 57 60 36 55Z" fill="#5ca4bd"/><path d="M44 10L56 9 69 28 55 27Z" fill="#ed7458"/><path d="M50 76L69 67" stroke="#ed7458" stroke-width="4"/></svg>';}
function castPanel(c,selectable=false){
 const t=c.cast;if(!t?.mentor&&!t?.boss)return '';const rows=[['mentor',t.mentor],['boss',t.boss]].filter(x=>x[1]);
 return '<div class="cast-roster">'+rows.map(([kind,x])=>{const d=Cast.map[x.id];return '<article class="cast-card '+kind+'">'+Cast.portrait(x.id)+'<div><small>'+(kind==='boss'?'最強の壁':Cast.introduced(c)?'あなたの師匠':'ピットで出会う先輩')+' · '+d.title+'</small><h3>'+d.name+'</h3><span class="cast-specialty">'+D.stats[d.key]+(kind==='boss'?' '+R.display(Cast.loadouts[d.id].stats[D.statKeys.indexOf(d.key)]):'を導く')+'</span><p>「'+d.quote+'」</p><small>'+(kind==='boss'?'予選の一戦と、進出した優勝戦で対決':x.wins?'師匠に先着 '+x.wins+'回':'G1から対決の機会あり')+'</small></div></article>';}).join('')+(t.mentor?'<p class="micro muted">G3で出会う先輩は、主ライバルと異なる得意分野から抽選されます。話をして、教わる約束を交わしましょう。</p>':'')+(c.player?btn(Cast.introduced(c)?'師匠の物語':'出会いから読む','mentor','','secondary large'):'')+'</div>';
}
function finalePanel(c){const f=Finale.ensure(c),r=c.series?.race,route=f.rival.route,ready=Finale.routeGate(c);return (ready?'<aside class="final-preparation"><small>ライバルとの約束</small><h3>この先も 競い合うために</h3>'+btn('二人の道を決める','rivalPath','','primary')+'</aside>':'')+(c.stage===8?'<section class="finale-roster"><div class="section-line"><h3>頂点への航路</h3>'+chip(f.wallDefeated?'前哨の壁を突破':'予選で前哨の壁へ挑む',f.wallDefeated?'gold':'teal')+'</div><p class="small">'+(f.wallDefeated?(route==='duel'?'優勝戦の最後の相手は、育ち続けたライバル。':route==='ally'?'優勝戦でライバルと挺王へ挑む。一着は譲り合わない。':'優勝戦へ進めば、挺王が待つ。'):'予選で前哨の壁に先着すると、優勝戦の相手が変わります。')+'</p>'+(r?.type==='championship'?'<div class="finale-grid">'+r.runners.filter(n=>!n.isPlayer&&n.racePersona).map(n=>'<div>'+Bonds.portrait(n)+'<span><small>'+esc(Finale.roleNames[n.racePersona]||'招待選手')+'</small><b>'+esc(n.name)+'</b></span></div>').join('')+'</div>':'')+'</section>':'');}
function castRacePanel(c){const r=c.series?.race,q=r?.castDuel;if(!q)return '';const p=Cast.map[q.castId];return '<aside class="cast-match '+q.kind+'">'+Cast.portrait(p.id)+'<div><small>'+(q.kind==='boss'?'最強の壁との対決':'師匠との対決')+'</small><h3>'+p.name+'</h3><span>'+D.stats[p.key]+(q.kind==='boss'?' '+R.display(Cast.loadouts[p.id].stats[D.statKeys.indexOf(p.key)]):'の名手')+'</span><p>'+Cast.loadouts[p.id].note+'</p><p>有効完走で先着すると賞金＋特殊能力</p></div><b>VS</b></aside>';}
function castResultPanel(z){const q=z.castDuel;if(!q)return '';return '<aside class="cast-match '+(q.won?'won':'')+'">'+Cast.portrait(q.id)+'<div><small>'+(q.kind==='boss'?'最強の壁':'師匠')+'</small><h3>'+q.name+'に'+(q.won?'先着！':'届かず')+'</h3><p>'+(q.won?money(q.money)+' ＋ '+esc(D.abilityMap[q.skill]?.name||''):'次の育成へ、航跡が残る。対決による罰則なし。')+'</p></div></aside>';}

function modePicker141(value,id='play-mode141'){return '<label class="field-label" for="'+id+'">レースの楽しみ方</label><select id="'+id+'"><option value="drive"'+(value!=='development'?' selected':'')+'>操船中心 · 自分で走る</option><option value="development"'+(value==='development'?' selected':'')+'>育成中心 · 観戦で進める</option></select><p class="micro muted">どちらでも操船・観戦・結果スキップを選べます。最優秀シリーズの最終戦だけは手動です。能力・報酬は同じで、成績は実際の操作方式別に記録します。</p>';}
function goalPanel141(c,full=false){const g=c?.reviewGoal141;if(!g)return '';const v=Improve141.comparison(g);
 if(!full)return '<aside class="goal-strip141"><span>'+esc(v?'前回の課題 · '+v.label+' '+v.before+' → '+v.after:'次走の課題 · '+g.title)+'</span>'+btn('見る','reviewGoal141','','text-btn')+'</aside>';
 const a=g.baseline,b=g.after;return '<h3>'+esc(g.title)+'</h3><p>'+esc(g.actions.length?g.actions.join('、')+'を実施':g.after?'課題に沿った準備の実施記録はありません。':'この課題に沿った練習・整備はまだ行っていません。')+'</p>'+(v?'<div class="table-wrap"><table><thead><tr><th></th><th>課題を決めたレース</th><th>次のレース</th></tr></thead><tbody><tr><th>'+esc(v.label)+'</th><td>'+esc(v.before)+'</td><td>'+esc(v.after)+'</td></tr><tr><th>'+D.stats[g.key]+'</th><td>'+R.display(a.stat)+'</td><td>'+R.display(b.stat)+'</td></tr><tr><th>モーター / プロペラ</th><td>'+R.display(a.gear.motor,R.equipmentRange('motor','speed'))+' / '+R.display(a.gear.prop,R.equipmentRange('prop','turn'))+'</td><td>'+R.display(b.gear.motor,R.equipmentRange('motor','speed'))+' / '+R.display(b.gear.prop,R.equipmentRange('prop','turn'))+'</td></tr><tr><th>操作</th><td>'+esc(Improve141.modeNames[a.mode])+'</td><td>'+esc(Improve141.modeNames[b.mode])+'</td></tr></tbody></table></div><p>'+esc(v.note)+'</p><p class="small muted">'+esc(a.condition)+'<br>→ '+esc(b.condition)+'<br>'+esc(v.conditions)+'</p>':'<p>次の準備で '+(g.trial145==='train'?D.stats[g.key]+'の練習':g.trial145==='tune'?Workshop.parts[g.part].name+'の整備':D.stats[g.key]+'練習、または'+Workshop.parts[g.part].name+'整備')+'を試せます。通常の行動回数を使います。</p><p class="small muted">課題の設定だけでは行動を消費しません。何もしなくても次走へ進めます。</p>');}
function goalActions141(c,q){const p=Review145.plan(c.series?.race,c.lastResult,c.player);if(!p)return '';return '<div class="review-choices145">'+p.options.map(o=>{const selected=c.reviewGoal141?.source===c.lastResult?.raceId&&c.reviewGoal141.trial145===o.id;return btn(esc(o.title)+(selected?' · 設定済み':''),'selectGoal141',o.id,selected?'secondary selected145':'secondary',selected||!!c.ending);}).join('')+'</div><p class="micro muted">選ぶだけでは行動を使いません。実際の練習・整備は次の準備で選べます。課題を決めずに進むこともできます。</p>'+(c.series?.race?.drive?btn('前走に近い条件で再練習','repeat141','','text-btn'):'');}
function beginPractice141(t){if(!t)return false;t.initial=t.initial||clone(t.r);t.practiceSettings=clone(state.settings);t.assistUsed=!!state.settings.postureAssist;t.controlsAt141=JSON.stringify(Improve141.controls(t.practiceSettings.controls141));ui.practice118=t;navigate('practiceRace');return true;}
function tutorialPanel141(){const n=state.settings.tutorial141||0;return '<section class="quiet-panel139"><div class="section-line"><h2>3つの操作を体験</h2><small>'+n+' / 3</small></div><p>スタート → ターン → 引き波。短い区間で一つずつ確かめます。</p>'+btn(n===3?'はじめから試す':n?'続きから試す':'操作を覚える','tutorial141',String(n===3?0:n),'primary')+'</section>';}
function tutorialResult141(t){if(!Number.isInteger(t.tutorial141))return '';const clear=Improve141.tutorialPassed(t,Practice122.summarize(t)),n=t.tutorial141;return '<p class="notice">'+(clear?'この操作をクリアしました。':t.kind==='wake'?'引き波内を区間時間の30%以内（最低1秒の余裕）に抑え、接触なしで抜けてみましょう。':t.kind==='turn'?'他艇・境界への接触なしで区間を走ってみましょう。':'F・Lを出さずにラインを越えてみましょう。')+'</p>'+(clear&&n<2?btn('次へ · '+Improve141.tutorial[n+1].name,'tutorial141',String(n+1),'primary large'):clear?'<p>3つの操作を体験しました。操作設定から押し方や配置も変えられます。</p>':'');}
function modeRecords141(p){const q=p.controlRecord141;return '<details class="mode-records141"><summary>操作方式ごとの成績</summary><p class="micro muted">V141以降に確定した育成レースを集計。切替を含むレースは別枠です。以前の成績は総合経歴に残ります。</p>'+(q?'<div class="table-wrap"><table><thead><tr><th>操作方式</th><th>出走</th><th>勝利</th><th>3着以内</th></tr></thead><tbody>'+Object.entries(Improve141.modeNames).map(([k,name])=>'<tr><td>'+name+'</td><td>'+q[k].races+'</td><td>'+q[k].wins+'</td><td>'+q[k].podiums+'</td></tr>').join('')+'</tbody></table></div>':'<p>記録はまだありません。</p>')+'</details>';}

function entryOptions(r){
 const choice=(title,note,action,icon,klass)=>btn('<span class="entry-icon123" aria-hidden="true">'+icon98(icon)+'</span><span><b>'+title+'</b><small>'+note+'</small></span><span aria-hidden="true">→</span>',action,'','entry-choice123 '+klass);
 return '<section class="race-entry-options entry-options123" aria-label="レースの進め方"><h2>レースの進め方を選ぶ</h2>'+choice('自分で操船する',esc(Improve141.controlHint(state.settings)),'start','helm','primary')+(R.requiresManual(r)?'<p class="final-entry-note">最優秀シリーズの最終戦は自分で操船します。</p>':choice('観戦モード','自動操船を観戦。途中から操作もできます','skipRace','eye','secondary')+choice('結果へスキップ','3周分の自動走行を計算して結果へ','instantRace','arrow','secondary'))+'</section>';
}
function playStoryPresentation(c){
 if(c?.bonds?.reward&&!c.bonds.reward.shown&&['action','preRace','bonds'].includes(ui.page)){const z=c.bonds.reward,h=Bonds.B.map[z.heroine];z.shown=true;save();root.KM_PRESENTATION?.show({kind:'skill',rarity:ability(z.skill).rarity,kicker:'二人で迎える、最高峰',title:h.finalTitle,note:h.name+'との約束が、この一走へ。',portrait:Bonds.portrait(h.id,true),reward:ability(z.skill).name+' 獲得'},state.settings);return;}
 if(c?.bonds?.encounters?.notice&&!c.bonds.encounters.notice.shown&&['action','preRace','bonds'].includes(ui.page)){const n=c.bonds.encounters.notice,h=Bonds.B.map[n.id];n.shown=true;save();root.KM_PRESENTATION?.show({kind:'skill',rarity:'SR',kicker:'水辺の出会い',title:h.name,note:h.intro,portrait:Bonds.portrait(h.id,true),reward:'「人物」から話せます'},state.settings);return;}
 if(!c||!['action','preRace','seriesIntro'].includes(ui.page))return;const t=Story.ensure(c),p=t.pending,e=p&&Story.eventMap[p.id];let id,info;
 if(e?.tone==='surge'){id='reveal:'+p.key;info={kind:'surge',tone:'surge',rarity:'UR',kicker:'物語が、大きく動く',title:e.title,note:'手にした機会を、自分の力に。',reward:'特別イベント発生'};}
 else if(c.series?.race?.castDuel&&ui.page==='action'){const q=c.series.race.castDuel,d=Cast.map[q.castId];id='cast:'+c.series.race.id;info={kind:'duel',rarity:q.kind==='boss'?'LR':'SSR',kicker:q.kind==='boss'?'最強の壁':'師匠との一戦',title:d.name,note:d.quote,portrait:Cast.portrait(d.id,true),reward:D.stats[d.key]+(q.kind==='boss'?' '+R.display(Cast.loadouts[d.id].stats[D.statKeys.indexOf(d.key)]):'の名手')};}
 if(!id||t.shown.includes(id))return;t.shown.push(id);t.shown=t.shown.slice(-100);save();root.KM_PRESENTATION?.show(info,state.settings);
}
function recordLink105(l,person,body){ui.sceneRecords=ui.sceneRecords||{};const registry=ui.page==='profile'&&ui.profileId!==state.career?.player.id?ui.profileId:null,key='journal:'+Story.hash(JSON.stringify([registry,l.title,l.note,l.index,l.stage,l.choice]));ui.sceneRecords[key]={key,title:l.title,person,registry,body:body||(l.scene130?[...l.scene130.body,...(l.choice?['選んだ言葉：'+l.choice]:[]),l.note]:null)||[l.note,...(l.choice?['選んだ言葉：'+l.choice]:[]),...(l.rewards||[])],background:l.kind==='romance'||l.heroine?'harbor':'workshop'};return btn('<small>'+esc(D.stages[l.stage]?.name||'記録')+'</small><b>'+esc(l.title)+'</b>','recordRead',key,'secondary story-record-link');}
function chapterPerson(c){return c.campaign?.arc==='recovery'?Development.actors.recovery:speaker105(['mentor','manager','mechanic','mentor',null,'mechanic','fan','manager','mentor'][c.stage]);}
function journalPerson(l){const e=Story.eventMap[l.eventId];if(e)return speaker105(e.speaker);if(l.kind!=='chapter'||!D.stages[l.stage])return null;for(const arc of ['light','recovery']){const c={stage:l.stage,campaign:{arc}};if(Story.chapter(c)[0]===l.title)return chapterPerson(c);}return null;}
function journalRows(log){return '<div class="story-journal">'+(log||[]).slice().reverse().map(l=>recordLink105(l,journalPerson(l))).join('')+'</div>';}

function chapterPanel(c){const q=Story.chapter(c);return recordLink105({title:q[0],note:q[1],stage:c.stage,kind:'chapter'},chapterPerson(c));}

function endingStoryPanel(c){const l=c.ending&&c.story?.log.slice().reverse().find(x=>x.kind==='chapter');return l?recordLink105(l,journalPerson(l)):'';}

function chroniclePanel(c){const t=c.story;if(!t)return '';const q=t.rivals.at(-1);return '<div class="chronicle-strip"><div><small>あなたの物語 · 第'+(c.stage+1)+'章</small><b>'+Story.chapter(c)[0]+'</b>'+(q?'<span>'+esc(q.name)+'との対決 '+q.wins+'勝 '+q.losses+'敗</span>':'')+'</div>'+btn('物語の記録','stories','','secondary')+'</div>';}
function rivalStrip(c){const q=c?.story?.duel;if(!q||q.status!=='accepted'||q.raceId!==c.series?.race?.id)return '';return '<aside class="rival-strip">'+Bonds.portrait(c.story.rivals.find(n=>n.id===q.rivalId)||{id:q.rivalId,name:q.rivalName})+'<div><b>'+esc(q.rivalName)+'</b><small>先着＋有効完走で '+money(q.money)+' / 特殊能力1つ</small></div>'+chip('対決中','gold')+'</aside>';}
function storyPanel(c){const p=c.story?.pending;if(!p)return rivalStrip(c);const e=p.kind==='duel'?null:Story.resolve(p);return '<article class="story-invitation"><small>'+(p.kind==='duel'?'ライバルからの挑戦':'ピットのひととき')+'</small><h3>'+esc(e?.title||c.story.duel.rivalName+'との約束')+'</h3>'+btn('会話を読む','eventTalk','','secondary large')+'</article>'; }

function duelResultPanel(z){const q=z.duel;if(!q)return castResultPanel(z);return castResultPanel(z)+'<aside class="duel-result '+(q.won?'won':'lost')+'"><span class="rival-vs">'+(q.won?'勝利':'次へ')+'</span><div><h2>'+esc(q.rivalName)+'との対決</h2><p>'+esc(q.reason)+'</p>'+(q.won?'<div class="chip-row">'+chip(money(q.money),'gold')+(q.skill?abilityChip(q.skill):'')+'</div>':'<small>対決による罰金・成長減少はありません。</small>')+'</div></aside>';}
function presentationPanel(){return box('演出と振動','<label class="field-label" for="race-fx-setting">レース中の爽快演出</label><select id="race-fx-setting">'+[['full','鮮烈 · 速度線・水しぶき・決め演出'],['soft','控えめ · 短い通知のみ'],['off','追加演出なし']].map(([v,l])=>'<option value="'+v+'"'+((state.settings.raceFX||'full')===v?' selected':'')+'>'+l+'</option>').join('')+'</select><label class="field-label" for="presentation-setting">レース外の報酬演出</label><select id="presentation-setting">'+[['full','標準 · 光とメタリックの祝福'],['short','短縮 · 暗転なし'],['off','演出なし']].map(([v,l])=>'<option value="'+v+'"'+((state.settings.presentation||'full')===v?' selected':'')+'>'+l+'</option>').join('')+'</select><label class="setting-toggle"><input id="haptics-setting" type="checkbox"'+(state.settings.haptics?' checked':'')+'> 振動を使う</label><p class="micro muted">'+(root.KM_PRESENTATION?.supported()?'端末・ブラウザの設定によって振動しない場合があります。':'この環境では振動APIを利用できません。画面と音の演出で遊べます。')+' 暗転はレース中には出ません。</p>');}
function playResultPresentation(c){
 if(ui.page!=='raceResult'||!c?.lastResult)return;const t=Story.ensure(c),id='result:'+c.lastResult.raceId;if(t.shown.includes(id))return;t.shown.push(id);if(t.shown.length>100)t.shown.shift();save();
 const info=root.KM_PRESENTATION?.resultInfo(c.lastResult,R.dramaticRace(c.series.race.drive));if(info)root.KM_PRESENTATION.show(info,state.settings);
}

function icon98(name){const paths={eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',wave:'M3 9c3-6 5 6 9 0s6 6 9 0M3 16c3-6 5 6 9 0s6 6 9 0',wing:'M3 19 9 5l12-2-8 8-10 8m6-14 4 6',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',helm:'M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z',person:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21v-2a8 8 0 0 1 16 0v2',book:'M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3Zm9 2v15',gear:'M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',arrow:'M4 12h16m-6-6 6 6-6 6',edit:'m4 16-1 5 5-1L20 8l-4-4ZM13 7l4 4',cup:'M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v6m-4 1h8'};return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(paths[name]||paths.wave)+'"/></svg>';}
function identityMark(p,small=false){const q=Profile.get(p);return '<span class="identity-mark '+(small?'small':'')+'" style="--pilot-accent:'+Profile.colors[q.color]+'">'+icon98(q.emblem)+'</span>';}
function famePanel(p,compact=false){const f=Story.fame(p);return '<section class="fame-panel '+(compact?'compact':'')+'"><div>'+icon98('star')+'<span><small>ファン人気</small><b>'+f.name+'</b></span><strong>'+fmt(f.value)+'</strong></div><div class="fame-track" role="progressbar" aria-label="人気の段階" aria-valuemin="'+f.min+'" aria-valuemax="'+(f.next||Math.max(f.value,400))+'" aria-valuenow="'+f.value+'"><i style="width:'+(f.progress*100)+'%"></i></div>'+(compact?'':'<p>'+(f.next?'次の人気帯まで '+(f.next-f.value)+' · 出会いの幅が広がります':'声援が広がり、看板選手の物語が届きます')+'</p>')+'</section>';}
function pilotCard(p){const q=Profile.get(p);return '<section class="pilot-card identity-card" style="--pilot-accent:'+Profile.colors[q.color]+'">'+identityMark(p)+'<div class="identity-copy"><span class="eyebrow">'+esc(q.region||'あなたのレーサー')+'</span><h2>'+esc(p.name)+'</h2><p>'+esc(q.motto||'この航跡を、自分だけの物語に。')+'</p><div>'+chip(growthOf(p).name)+chip(difficulty(p).name)+'</div></div>'+btn(icon98('edit')+'<span>編集</span>','editPlayer',p.id,'identity-edit')+'</section>';}
function bondJournal(t,rivals=[]){const moments=Continuity142.momentLog(t);return (moments.length?'<details class="settings-section"><summary>会話のあいだの日々</summary>'+moments.map(e=>recordLink105({title:e.title,note:'',stage:t.heroines[e.id].meeting142?.stage||0,index:'moment142:'+e.id+':'+e.step,kind:'romance'},Bonds.B.map[e.id],e.body)).join('')+'</details>':'')+'<div class="bond-journal">'+(t.log||[]).slice().reverse().map(l=>recordLink105(l,Bonds.B.map[l.heroine]||rivals.find(n=>n.id===l.rivalId))).join('')+'</div>';}

function bondStrip(c){if(!c)return '';const t=Bonds.ensure(c),people=Bonds.metHeroines(c),h=Bonds.B.map[t.partner],ready=people.filter(x=>Bonds.gate(c,x.id).chapter),active=people.filter(x=>!t.heroines[x.id].failed),remaining=Math.max(0,t.nextAt-c.stats.races);const headline=h?h.name+'と歩く日々':ready.length?'続きの物語が届いています':!people.length?'まだ知らない、誰かとの出会い':!active.length?'水辺に残った、出会いの記録':'水辺のつながり';const hint=!people.length?'出会いはレース前に。後半ほど訪れやすくなります。':ready.length?ready.length+'人のエピソードを進められます':remaining?'次の交流まで あと'+remaining+'走':'人物と選んだ言葉を振り返る';return '<aside class="bond-strip">'+(people.length?'<div class="bond-mini-faces">'+(h?Bonds.portrait(h.id):people.slice(0,3).map(x=>Bonds.portrait(x.id)).join(''))+'</div>':'<span class="bond-unseen" aria-hidden="true">✦</span>')+'<div><b>'+headline+'</b><small>'+hint+'</small></div>'+btn('人物','bonds','','secondary')+'</aside>';}
function bondFinalPanel(c){const z=c.bonds?.reward;if(!z||z.raceId!==c.series?.race?.id)return '';const h=Bonds.B.map[z.heroine];return '<article class="bond-final"><div class="bond-profile">'+Bonds.portrait(h.id)+'<div><small>最高峰の朝</small><h3>'+h.finalTitle+'</h3>'+abilityChip(z.skill)+'</div></div>'+recordLink105({title:h.finalTitle,note:Bonds.finalBody(c,h).join('\n'),stage:8,kind:'romance'},h,Bonds.finalBody(c,h))+'</article>';}

function bondSceneView(c){const sc=Bonds.scene(c);if(!sc)return '';return novelView({key:'bond:'+sc.key+(sc.readerVersion?':'+sc.readerVersion:''),title:sc.title,body:sc.body,expressionCues:sc.expressionCues,romanceLabel:sc.readerVersion?(sc.romanceLabel||'二人の物語'):null,person:sc.heroine,background:sc.heroine.id==='akari'?'workshop':sc.heroine.id==='tsumugi'?'cafe':'harbor',exit:'bondBack',choices:sc.choices.map((x,i)=>({label:x.label,action:'bondChoice',value:sc.key+'|'+i}))});}

function mentorJournal(q){return '<div class="bond-journal">'+(q?.log||[]).slice().reverse().map(l=>recordLink105(l,Cast.map[l.mentor])).join('')+'</div>';}

function mentorIntroductionPanel125(c){
 const sc=Cast.introductionScene(c);if(!sc)return '';const p=sc.person;
 return '<aside class="mentor-invitation mentor-introduction125">'+Cast.portrait(p.id,true)+'<div><small>'+(sc.step===0?'教わる人との出会い':'入門の相談')+'</small><h3>'+esc(p.name)+'</h3><p>'+esc(sc.step===0?'ピットで交わした言葉から、教わるきっかけが生まれます。':'この人に何を教わりたいのか。自分の言葉で伝え、稽古の約束を交わします。')+'</p>'+btn(sc.step===0?'出会いを読む':'入門の相談をする','mentorIntro','','primary')+'<small>行動回数は使いません。中断しても続きから読めます。</small></div></aside>';
}
function mentorStrip(c){if(Cast.introductionScene(c))return mentorIntroductionPanel125(c);const q=c?.cast?.mentor;if(!q)return '<p class="small muted">G3から師匠との物語が始まります。</p>';const p=Cast.map[q.id],g=Cast.routeGate(c),t=Cast.routeState(c);return '<aside class="mentor-invitation">'+Cast.portrait(p.id,true)+'<div><small>師匠と歩む道 · '+t.step+' / 5話</small><h3>'+p.name+'</h3><p>'+esc(g.reason)+'</p>'+btn('師匠の物語','mentor','','secondary')+'</div></aside>';}
function mentorView(){const c=state.career;if(Cast.introductionScene(c))return heading('先輩との出会い','教わる理由を、言葉にする')+btn('戻る','return','','text-btn')+mentorIntroductionPanel125(c);if(!c?.cast?.mentor)return heading('師匠との物語','G3から、教わる人に出会う')+btn('戻る','return','','secondary');const q=Cast.routeState(c),p=Cast.map[q.id],route=Cast.routes[q.id],g=Cast.routeGate(c),scene=Cast.routeScene(c),reward=Cast.routeReward(c);let h=heading('師匠との物語',route.title)+btn('戻る','return','','text-btn');
 if(scene)return novelView({key:'mentor:'+scene.key,title:scene.title,body:scene.body,person:p,background:'workshop',exit:'mentorBack',choices:scene.choices.map((ch,i)=>({label:ch.label,action:'mentorChoice',value:scene.key+'|'+i}))});
 const out=ui.mentorOutcome;if(out)h+='<div class="bond-outcome" role="status"><b>'+esc(out.title)+'</b><p>'+esc(out.note)+'</p>'+chip(D.stats[out.stat]+'を学んだ','teal')+(out.skill?'<p>'+abilityChip(out.skill)+'</p>':'')+'</div>';
 h+='<article class="bond-card mentor-card" style="--bond-color:'+p.color+'"><div class="bond-profile">'+Cast.portrait(p.id,true)+'<div><small>'+p.title+'</small><h2>'+p.name+'</h2><p>「'+p.quote+'」</p></div></div><div class="bond-progress">'+route.chapters.map((_,i)=>'<i class="'+(i<q.step?'complete':'')+'"></i>').join('')+'<small>'+q.step+' / 5</small></div>'+affinityMeter(c,'mentor',p.id)+socialButton129(c,'mentor')+'<p class="bond-gate">'+esc(g.reason)+'</p>'+btn(g.completed?(q.reward?'伝授を受けました':'対話は終了しました'):g.open?'第'+(q.step+1)+'話 · '+g.episode.title:'次の物語を待つ','mentorMeet','','primary large',!g.open)+'<div class="mentor-reward"><small>好感度と 対話での理解・最後の決断で伝授</small>'+abilityChip(q.reward?.skill||reward)+'<p>レース報酬など、従来の方法でも獲得できます。</p></div></article>';
 if(q.log.length)h+='<details class="bond-record"><summary>師匠と選んだ道 · '+q.log.length+'話</summary>'+mentorJournal(q)+'</details>';return h;
}

function bondShortcutPanel(c){const t=Bonds.ensure(c),g=Bonds.shortcutGate(c),owned=c.player.inventory.bond_shortcut||0;if(!Bonds.metHeroines(c).length)return '';return '<aside class="bond-shortcut"><div><b>ふたりの予定手帳</b><small>'+(t.shortcutUsed?'この育成では使用済み':g.ok?'待ち時間 '+g.before+'走 → '+g.after+'走':g.reason)+'</small></div>'+(t.shortcutUsed?chip('使用済み'):owned?btn('2走短縮','use','bond_shortcut','secondary',!g.ok):btn('商店へ','shop','','secondary'))+'</aside>';}
function bondsView(){const c=state.career;if(!c)return heading('RELATIONSHIPS','物語は、育成の先に')+btn('育成を始める','new','','primary');const t=Bonds.ensure(c),scene=Bonds.scene(c),out=ui.bondOutcome,people=Bonds.metHeroines(c);let html=heading('WATERFRONT LETTERS','水辺のつながり','出会いから始まる、あなただけの物語。')+btn('戻る','return','','text-btn');if(scene)return bondSceneView(c);if(out)html+='<div class="bond-outcome '+(out.failed?'route-failed':out.completed?'route-complete':'')+'" role="status"><b>'+esc(out.title)+'</b><p>'+esc(out.note)+'</p>'+(out.failed?'<strong class="route-terminal-note">この相手のルートは終了しました。今回の育成では再開できません。</strong>':'')+(out.stat?chip(D.stats[out.stat]+'を練習','teal'):'')+(out.skill?abilityChip(out.skill):'')+'</div>';html+=requestPanel(c)+mentorStrip(c)+bondFinalPanel(c)+'<p class="bond-cadence">'+(t.partner?'交際中 · '+Bonds.B.map[t.partner].name:people.length?'通常2走ごと。G2後期以降に出会った相手とは1走ごと。第10話は優勝戦出走前。':'出会いはレース前の抽選。後半ほど訪れやすくなります。')+'</p>'+bondShortcutPanel(c)+'<div class="bond-roster">';
 if(!people.length)html+='<article class="bond-mystery"><span aria-hidden="true">✦</span><h3>まだ、物語の始まりを知らない。</h3><p>レースを重ねる日々の中で、誰かに出会うことがあります。出会わないまま終える育成もあります。</p></article>';
 for(const h of people){const q=t.heroines[h.id],g=Bonds.gate(c,h.id);html+='<article class="bond-card '+(q.failed?'route-failed':g.locked?'route-locked':t.completed===h.id?'route-complete':'')+'" style="--bond-color:'+h.color+'"><div class="bond-profile">'+Bonds.portrait(h.id,true)+'<div><small>'+h.age+'歳 · '+h.job+'</small><h2>'+h.name+'</h2><span class="bond-status '+(q.failed?'ended':g.locked?'locked':q.dated?'dating':'')+'">'+Bonds.status(c,h.id)+'</span></div></div><p class="bond-theme">'+h.theme+'</p><p class="bond-intro">'+h.intro+'</p>'+(h.romancePersona&&q.step>=3&&!q.failed&&!Bonds.finalLock(t,h.id)?'<p class="bond-romance127">'+esc(h.romancePersona)+'</p>':'')+'<div class="bond-meters">'+[['trust','信頼']].map(([k,l])=>'<div><span>'+l+'</span><div role="meter" aria-label="'+h.name+'の'+l+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+q[k]+'"><i style="width:'+q[k]+'%"></i></div></div>').join('')+'</div>'+affinityMeter(c,'heroine',h.id)+'<div class="bond-progress" aria-label="全10話中'+q.step+'話完了">'+h.chapters.map((_,i)=>'<i class="'+(i<q.step?'complete':'')+'"></i>').join('')+'<small>'+q.step+' / 10</small></div><p class="bond-gate">'+esc(g.reason)+'<br><small>'+esc(Bonds.outlook(c,h.id))+'</small>'+'</p>'+btn(q.failed?'ルート終了':g.locked?'交際には進行不可':g.chapter?'第'+(q.step+1)+'話 · '+esc(g.episode.title):g.relationshipNeeded?'会って交流を深める':q.dated?'二人の時間を過ごす':'会って話す','meet',h.id,g.chapter?'primary large':'secondary large',!g.open)+'</article>';}
 html+='</div>'+developmentStrip(c)+'<details class="bond-record"><summary>二人で選んだ道 · '+t.log.length+'件</summary>'+bondJournal(t,c.story?.rivals||[])+'</details>';return html;}

function scenarioOverview119(p){const selected=Drama.B.arcs[p.scenario];return '<div id="scenario-overview" class="scenario-overview"><p class="scenario-selection" role="status">'+(selected?'選択中：'+esc(selected.title):'ランダム：育成開始時に4本から1本を抽選')+'</p><p class="small muted">概要を読んでから選べます。能力の再抽選では物語の選択は変わりません。開始後は変更できません。</p><div class="scenario-cards">'+Object.entries(Drama.B.arcs).map(([id,a])=>{const x=a.overview,active=p.scenario===id;return '<article class="scenario-card'+(active?' selected':'')+'"><span class="eyebrow">'+esc(x.genre)+'</span><h3>'+esc(a.title)+'</h3><p>'+esc(x.premise)+'</p><dl><dt>主人公の葛藤</dt><dd>'+esc(x.conflict)+'</dd><dt>描かれる関係</dt><dd>'+esc(x.relationship)+'</dd></dl><p class="scenario-feature128"><b>育成の特色</b>'+esc(Workshop.arcs[id].text)+'</p><p class="scenario-reading">序章＋全9章 · '+esc(x.focus)+'</p><button type="button" class="btn secondary" data-action="scenario" data-value="'+id+'" aria-pressed="'+active+'">'+(active?'このシナリオを選択中':'このシナリオを選ぶ')+'</button></article>';}).join('')+'</div>'+btn('ランダムに戻す','scenario','random','text-btn',!selected)+'</div>';}
function campaignPicker(p){const unlocked=Development.unlocks(state);return (unlocked.length?'<fieldset class="campaign-picker"><legend>受け継ぐ練習ノート</legend>'+btn('好スタートで始める','curriculum','', 'secondary')+unlocked.map(k=>btn(D.stats[k]+'の基礎技で始める','curriculum',k,'secondary'+(p.curriculum===k?' selected':''))).join('')+'</fieldset>':'')+'<label class="field-label" for="scenario-select">メインシナリオ</label><select id="scenario-select"><option value="random"'+(!Drama.B.arcs[p.scenario]?' selected':'')+'>ランダム（4ルートから抽選）</option>'+Object.entries(Drama.B.arcs).map(([id,a])=>'<option value="'+id+'"'+(p.scenario===id?' selected':'')+'>'+esc(a.title)+'</option>').join('')+'</select>'+'<details class="settings-section"><summary>シナリオのあらすじ</summary>'+scenarioOverview119(p)+'</details>';}
function captureDraft119(){if(!ui.draft)return;ui.draft.name=document.getElementById('racer-name')?.value??ui.draft.name;ui.draft.difficulty=document.querySelector('input[name="career-difficulty"]:checked')?.value||ui.draft.difficulty||'normal';ui.draft.recoveryOrigin=document.getElementById('recovery-origin')?.value||ui.draft.recoveryOrigin||'turn';ui.draft.length143=document.getElementById('draft-length143')?.value||ui.draft.length143||'full';ui.draft.playMode141=document.getElementById('draft-mode141')?.value||ui.draft.playMode141||'drive';ui.draft.scenario=document.getElementById('scenario-select')?.value||ui.draft.scenario||'random';}
function campaignPanel(c){const t=Campaign.ensure(c),unread=t.entries.filter(e=>!e.read),a=t.version===2?Drama.B.arcs[t.arc]:Campaign.B.map[t.arc];return '<aside class="campaign-strip" style="--story-accent:'+(a.color||'#f6c888')+'"><div><small>MAIN STORY'+(unread.length?' · 未読 '+unread.length:'')+'</small><b>'+a.title+'</b><span>'+Campaign.scene(t,(unread[0]||t.entries.at(-1)).id).title+'</span></div>'+btn(unread.length?'続きを読む':'読み返す','campaign',c.player.id,'secondary')+btn('章一覧','campaignChapters',c.player.id,'text-btn')+'</aside>';}
function campaignSource(){const c=state.career;if(c&&ui.campaignPlayer===c.player.id)return Campaign.ensure(c);return Profile.find(state,ui.campaignPlayer)?.campaignJournal||null;}
function campaignView(){const t=campaignSource();if(!t)return heading('物語','記録はありません')+btn('戻る','return');const entry=t.entries.find(e=>e.id===ui.campaignEntry)||t.entries[0],sc=Campaign.scene(t,entry.id),p=Profile.find(state,ui.campaignPlayer),active=p===state.career?.player;ui.novelRegistry=active?null:p?.id;const next=Drama.pending(t)[0],can=active&&sc.choices?.length&&next===entry;return novelView({key:'campaign:'+ui.campaignPlayer+':'+entry.id,title:sc.title,person:Development.actors[t.arc],background:t.arc==='shore'?'harbor':'workshop',body:[...sc.body,...(active&&sc.choices?.length&&!can?['先に残っている章の返事を選ぶと、この章でも決断できます。']:[])],choices:can?sc.choices.map((label,i)=>({label,action:'campaignChoice',value:entry.id+'|'+i})):[],finish:'campaignFinish',exit:'campaignExit'});}

function opportunityTray(c){const all=Drama.opportunities(c,E);if(!all.length)return '';ui.opportunities=all;const urgent=all.some(x=>x.when==='出走まで');return '<aside class="opportunity-tray" aria-label="未回収の育成イベント"><div><span class="opportunity-dot" aria-hidden="true">＋</span><div><strong>育成イベント '+all.length+'件</strong><small>'+(urgent?'出走すると過ぎる機会があります':'選択や交流で学べる機会があります')+'</small></div></div>'+btn('確認する','opportunities','','primary')+'</aside>';}
function recoveryPanel118(c){const q=Craft.summary(c);if(!q)return '';return '<section class="craft-card"><small>折れた航跡 · 技術の再構築</small><h3>'+esc(q.path)+'</h3><p>以前の武器：'+q.origin+' / 今の課題：'+q.key+'</p>'+(q.completed?'<p class="notice">3走の実践を達成。今の走りを記録しました。</p>':'<p>課題を満たして有効完走 '+q.progress+' / 3。達成時はコツ＋0.75。</p>')+(c.stage>=4&&!c.refinement.recovery.path&&!c.ending?'<div class="button-row">'+btn('経験を磨き直す','recoveryPath','restore','secondary')+btn('新しい走りを組む','recoveryPath','renew','secondary')+'</div>':!c.refinement.recovery.path?'<small>G2で、以前の武器を磨き直すか、新しい主軸を選べます。</small>':'')+'</section>';}
function supportPanel121(p){
 const v=Coaching.support(p),limited=v.loss>.05,key=p.stats.accel<=p.stats.power?'accel':'power';
 return '<details class="driving-tip124"><summary>走りのヒント：直線を活かす力</summary><p>'+(limited?'今の直線の伸びを引き出すには、'+D.stats[key]+'を育てる余地がありそうです。':'加速とフィジカルが、直線の伸びをしっかり支えています。')+'</p><p class="small muted">加速はターン出口から速度を戻す力、フィジカルは荒れた水面でも姿勢を保つ力。直線だけでなく、この二つも育てると強みを活かしやすくなります。</p></details>';
}
function reviewPanel122(c){
 const v=Review145.plan(c.series?.race,c.lastResult,c.player);if(!v)return '';const q=v.q;
 return '<section class="review122 review145"><div class="section-line"><h2>次の一走へ</h2>'+chip(q.modeLabel,'teal')+'</div>'+(q.modeNote?'<p class="micro muted">'+esc(q.modeNote)+'</p>':'')+'<div class="review-facts145"><h3>記録された事実</h3><ul>'+v.facts.slice(0,3).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+(v.facts.length>3?'<details><summary>ほかの計測値</summary><ul>'+v.facts.slice(3).map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></details>':'')+'</div><div class="review-factors145"><h3>考えられる要因</h3>'+v.factors.map(t=>'<p>'+esc(t)+'</p>').join('')+'<small>この記録だけで敗因や、各要因の影響の大きさは断定できません。</small></div><div class="review-trial145"><h3>次に試す変更</h3><p>'+esc(q.tip)+'</p>'+goalActions141(c,q)+'<div class="quiet-links139">'+(q.mark!==null?btn('場面をリプレイで見る','replayMark',q.mark,'text-btn'):'')+btn(q.trainingLabel,'practiceReview',q.drill,'text-btn')+'</div></div>'+(q.sections.length?'<details><summary>区間の記録</summary><div class="table-wrap"><table><thead><tr><th>区間</th><th>順位</th><th>平均速度</th><th>横滑り</th><th>引き波</th></tr></thead><tbody>'+q.sections.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.rank+'→'+x.rankEnd+'</td><td>'+x.speed.toFixed(1)+' km/h</td><td>'+x.slide.toFixed(1)+'秒</td><td>'+x.wake.toFixed(1)+'秒</td></tr>').join('')+'</tbody></table></div></details>':'')+'</section>';
}
function advicePanel121(c,review=false){
 const a=Coaching.advice(c);if(review)return reviewPanel122(c)+'<details class="prep-details121"><summary>長期の育成</summary><b>'+esc(a.long.title)+'</b><p>'+esc(a.long.evidence)+'</p>'+btn('技の成長を見る','development','','text-btn')+'</details>';
 return '<section class="advice121"><div class="section-line"><h3>育成の選び方</h3><small>選ぶのはあなた</small></div><div class="advice-options121"><div><small>次走に向けて · '+esc(a.short.modeLabel||(a.short.observed?'前走の記録':'能力と操作'))+'</small><b>'+esc(a.short.title)+'</b><p>'+esc(a.short.evidence)+'</p>'+btn(a.short.trainingLabel||'この操作を練習','practiceReview',a.short.drill,'secondary')+'</div><div><small>長期の育成</small><b>'+esc(a.long.title)+'</b><p>'+esc(a.long.evidence)+'</p>'+btn('技の成長を見る','development','','text-btn')+'</div></div><small class="muted">操作練習は育成の行動回数・進行・能力を変えません。</small></section>';
}
function resultGrowthStrip122(z){return '<div class="result-growth122" aria-label="今回の能力成長">'+keys.map(k=>'<div><small>'+D.stats[k]+'</small><b>'+plus(z.growthVisible?z.growthVisible[k]:R.floor(z.growth[k]))+'</b></div>').join('')+'</div>';}
function prepGoal121(c){
 const r=c.series?.race,q=Affinity.active(c);
 if(q?.status==='accepted')return '今回の約束：有効完走で '+q.target+'着以内';
 if(r?.castDuel)return Cast.map[r.castDuel.castId].name+'へ有効完走で先着';
 if(r?.type==='championship')return '優勝戦：準備した走りで一着を狙う';
 if(r?.type==='consolation')return '準優勝戦：自分の技を最後まで使う';
 return '予選：有効完走でポイントを積み重ねる';
}
function prepHub121(c){
 const a=c.series.action,op=Drama.opportunities(c,E),urgent=op.filter(x=>x.when==='出走まで'),step=ui.page==='preRace'?1:0;
 const flow='<ol class="prep-flow123" aria-label="一走の流れ">'+['練習・整備','出走表','レース','結果'].map((label,i)=>'<li class="'+(i===step?'current':i<step?'complete':'')+'"'+(i===step?' aria-current="step"':'')+'><span aria-hidden="true">'+(i<step?'✓':i+1)+'</span><b>'+label+'</b></li>').join('')+'</ol>';
 const counts='<div class="prep-resources123">'+[['training','練習'],['tune','整備']].map(([key,label])=>'<div class="'+(a[key]+a.normal>0?'ready':'done')+'"><span>'+label+'</span><strong>'+(a.normal?'専用 '+a[key]+' 回':a[key]>0?'残り '+a[key]+' 回':'✓ 残り 0 回')+'</strong>'+(a.normal?'<small>この行動専用の回数</small>':'')+'</div>').join('')+'</div>';
 return flow+'<section class="prep-hub121"><small>今回の目標</small><h2>'+esc(prepGoal121(c))+'</h2>'+counts+(a.normal?'<p class="prep-shared123">共通の追加行動 <b>'+a.normal+'回</b><small>練習・整備のどちらかに使えます。行動すると共通分から1回使います。</small></p>':'<p class="micro muted">残り回数を使い切らずに出走することもできます。</p>')+(op.length?'<div class="prep-opportunities121"><span>'+(urgent.length?'出走までの機会 '+urgent.length+'件':'今回の育成イベント '+op.length+'件')+'</span>'+btn('確認する','opportunities','','secondary')+'</div>':'<p class="micro muted">今回の新しい育成イベントはありません。</p>')+'</section>';
}
function prepDetails121(c,id,title,body){const key=c.series.race.id+':'+id;return '<details class="prep-details121" data-prep-detail="'+esc(key)+'"'+(ui.prepOpen121?.[key]?' open':'')+'><summary>'+title+'</summary>'+body+'</details>';}
function seriesRecap121(c){const z=c.history.at(-1);if(!z)return '';const best=keys.slice().sort((a,b)=>z.growth[b]-z.growth[a])[0];return '<section class="series-recap121"><small>今節の区切り</small><h3>'+D.stats[best]+' ＋'+z.growth[best].toFixed(1)+' を積み重ねました</h3><p>'+(c.ending?'次は今回の選手を登録し、航跡を残せます。':'次節は '+D.stages[c.stage+1].name+'。能力と習得した技を引き継ぎ、機材を新しく抽選します。')+'</p><p class="small" data-save-status121></p>'+btn('設定・バックアップ','data','','text-btn')+'</section>';}

function focusPanel118(c){const a=c.series?.action,p=Development.plan(c),pending=Drama.opportunities(c,E),label=c.ending?'今回の航跡を登録する':c.player.totalEarnings<D.sgThreshold?'SG進出まで累計 '+money(Math.max(0,D.sgThreshold-c.player.totalEarnings)):'自分の主軸を決勝へ';return '<aside class="focus118"><div><small>いまの目標</small><strong>'+label+'</strong><span>'+(a&&['action','preRace'].includes(c.status)?'残り 練習 '+(a.normal+a.training)+' / 調整 '+(a.normal+a.tune)+' · ':'')+(p?Development.plans[p.arc][p.choice].short+(p.progress?' '+p.progress+' / '+(p.choice===0?3:2):''):'今節の約束を選べます')+'</span></div>'+btn('操作練習','practice','','text-btn')+'</aside>';}
function startPolicyPanel118(r){const p=r.runners.find(x=>x.isPlayer),qualified=R.startAllowance(p)>0;return '<details class="driving-tip124"><summary>スタートのヒント</summary><p>発進目安は能力に応じて自動調整します。方針を選ぶ必要はありません。</p><p>'+(qualified?'能力や特殊能力によって、早めの通過にも少し余裕があります。それでも攻め過ぎればフライングになります。':'B以下は時刻より前にラインを通過するとフライングです。時計を見て、余裕を持って発進しましょう。')+'</p><small>通常の早発許容はA以上。B以下は時刻後に通過しますが、零の踏み込み・一閃の境地・先駆の心得を持つ場合は例外があります。</small></details>';}

function opponentPanel118(r){const list=r.runners.filter(n=>!n.isPlayer).sort((a,b)=>average(b)-average(a)).map(n=>Improve141.opponent(r,n)).filter(Boolean);return list.length?'<details class="craft-opponents"><summary>強敵の武器と攻略の手がかり</summary>'+list.map(x=>'<p><b>'+esc(x.name)+' · '+esc(x.weapon)+'</b><br>'+esc(x.tip)+'<br><small>'+esc(x.skill)+'</small></p>').join('')+'</details>':'';}
function observationPanel118(z){const q=z.observation;if(!q)return '';return '<section class="craft-review"><div><small>今回できたこと</small><strong>'+esc(q.success)+'</strong></div><div><small>確かめたい場面</small><strong>'+esc(q.detail)+'</strong></div><p><b>次の一手</b> '+esc(q.tip)+'</p>'+(q.start?'<small>'+esc(q.start)+'</small>':'')+(q.mark!==null?btn('この場面をリプレイで見る','replayMark',q.mark,'secondary'):'')+'<details><summary>区間ごとの走行記録</summary><div class="table-wrap"><table><thead><tr><th>区間</th><th>順位</th><th>平均速度</th><th>横滑り</th></tr></thead><tbody>'+q.sections.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.rank+'→'+x.rankEnd+'</td><td>'+x.speed.toFixed(1)+' km/h</td><td>'+x.slide.toFixed(1)+'秒</td></tr>').join('')+'</tbody></table></div><small>観測した変化です。各要因による損失秒数を断定するものではありません。</small></details></section>';}
function epiloguePanel126(source,playerId){
 const entries=Epilogues126.list(source);if(!entries.length)return '';
 const main=entries.filter(x=>x.kind!=='heroine'||x.relationship==='partner'),others=entries.filter(x=>x.kind==='heroine'&&x.relationship!=='partner');
 const labels={heroine:'ヒロイン',mentor:'師匠',rival:'ライバル'},relation=x=>x.relationship==='senior'?'出会った先輩':x.relationship==='apart'?'残された言葉':labels[x.kind];
 const card=x=>'<button type="button" class="epilogue-person126" data-action="epilogueRead" data-value="'+esc(playerId+'|'+x.key)+'">'+Bonds.portrait(x.person)+'<span><small>'+relation(x)+' · '+esc(x.person.name)+'</small><b>'+esc(x.title)+'</b><em>エピソードを読む '+icon98('arrow')+'</em></span></button>';
 return '<section class="epilogue-panel126" aria-label="結果に応じたエンディング"><div class="section-line"><div><small>エンディング</small><h2>水面の、その先へ</h2></div>'+chip(entries[0].outcome==='win'?'優勝のあとで':entries[0].outcome==='placed'?'優勝戦を終えて':'次の季節へ','teal')+'</div><p>今季の結果を胸に、出会った人たちと交わす言葉。</p><div class="epilogue-cards126">'+main.map(card).join('')+'</div>'+(others.length?'<details class="epilogue-others126"'+(!main.length?' open':'')+'><summary>出会った人たちとの後日談 · '+others.length+'人</summary><div class="epilogue-cards126">'+others.map(card).join('')+'</div></details>':'')+'<small class="muted">選手を登録した後も、プロフィールから読み返せます。</small></section>';
}
function epiloguePanel118(c){const items=Craft.epilogue(c);return items.length?'<details class="craft-card"><summary>水辺に残った約束</summary>'+items.map(x=>'<p><b>'+Bonds.B.map[x.id].name+' · 第'+x.step+'話まで</b><br>'+x.text+'</p>').join('')+'<small>未完走の記録です。交際成立・特殊能力の獲得にはなりません。</small></details>':'';}
function journeyPanel118(){const goals=Craft.journey(state);return '<section class="craft-card"><h3>次の航跡</h3><p>登録した選手の歩み。能力加算の報酬はなく、次の育成の目標になります。</p><div class="journey118">'+goals.map(x=>'<span class="'+(x.done?'complete':'')+'">'+(x.done?'✓ ':'○ ')+x.name+'</span>').join('')+'</div>'+btn('操作練習へ','practice','','secondary')+'</section>';}
function practiceView118(){return heading('PRACTICE','短い区間を、もう一度。','成績・賞金・好感度・能力獲得に影響しない操作練習です。')+btn('戻る','practiceBack','','text-btn')+tutorialPanel141()+(state.career?.series?.race?.done&&state.career.series.race.drive?btn('前走に近い条件で再練習','repeat141','','secondary'):'')+'<div class="practice-grid">'+[['start','スタート','時計の帯から発進。ライン通過まで直進のみ。'],['turn','第1ターン','旋回前に起こす。出口で舵を戻して伏せ、再加速。'],['wake','引き波の脱出','前の艇の真後ろを避け、横へ出る余白を探す。']].map(([id,name,text])=>'<article class="craft-card"><small>同じ条件ですぐ再挑戦</small><h3>'+name+'</h3><p>'+text+'</p>'+btn('この区間を練習','practiceStart',id,'primary')+'</article>').join('')+'</div><p class="muted">育成中なら今の能力・技能を使います。機材が未配備なら練習用機材です。育成していない場合は能力60の練習選手です。</p>';}
function recordPractice122(t){
 if(t.controlsChanged141)return null;
 if(t.comparison122)return t.comparison122;
 if(!t.r.drive.finished)return Practice122.compare(practiceRecords122,t);
 const result=Practice122.record(practiceRecords122,t);practiceRecords122=result.store;t.comparison122=result.comparison;
 if(result.comparison)safeStorage.set(PRACTICE_STORAGE122,JSON.stringify(practiceRecords122));
 return result.comparison;
}
function practiceValue122(def,value){return Number.isFinite(value)?(def.id==='st'&&value>=0?'+':'')+value.toFixed(def.precision)+' '+def.unit:'—';}
function practiceComparison122(t){
 if(t.controlsChanged141)return '<p class="notice">途中で操作設定を変更したため、同条件の比較記録には加えていません。</p>';
 const q=recordPractice122(t);if(!q)return '<p class="notice">この条件の比較記録は作成できませんでした。今回の走行結果は下に表示します。</p>';
 const defs=Practice122.metrics(t.kind),status={complete:'区間クリア',F:'F · 比較対象外',L:'L · 比較対象外',capsized:'転覆 · 比較対象外',dnf:'中断 · 比較対象外',unfinished:'区間未達 · 比較対象外'},bests=q.personalBests.filter(id=>!q.first&&q.bestBefore?.[id]!==undefined).map(id=>defs.find(x=>x.id===id).label);
 return '<section class="practice-comparison122"><div class="section-line"><h2>同じ条件での比較</h2>'+chip(status[q.current.status]||'今回の記録',q.current.completed?'teal':'gold')+'</div><p class="small">'+(q.first?'この条件では今回が最初の記録です。':'この条件で '+q.attempts+'回目。前回と項目別ベストを比べられます。')+'</p>'+(bests.length?'<p class="practice-bests122">項目別ベスト更新：'+bests.join('・')+'</p>':'')+'<div class="table-wrap"><table><thead><tr><th>記録</th><th>今回</th><th>前回</th><th>項目別ベスト</th></tr></thead><tbody>'+defs.map(def=>{const delta=q.deltas.previous[def.id],improved=Number.isFinite(delta)&&(def.better==='lower'?delta<-.00001:delta>.00001);return '<tr><th>'+def.label+'</th><td class="'+(improved?'improved':'')+'">'+practiceValue122(def,q.current.metrics[def.id])+(Number.isFinite(delta)?'<small class="delta">前回比 '+(delta>=0?'+':'')+delta.toFixed(def.precision)+' '+def.unit+'</small>':'')+'</td><td>'+practiceValue122(def,q.previous?.metrics[def.id])+'</td><td>'+practiceValue122(def,q.best?.[def.id])+'</td></tr>';}).join('')+'</tbody></table></div>'+(q.previous&&!q.previous.completed?'<p class="small muted">前回は '+(status[q.previous.status]||'未完了')+'。差分の判定は行いません。</p>':'')+'<p class="practice-note122">'+(t.assistUsed?'姿勢補助を使用した記録です。':'姿勢補助を使わない記録です。')+' 能力・技能・機材・天候・コースなどが同じ条件だけを比較します。ベストは有効に区間を終えた走行の項目ごとの値で、同じ1回の走行とは限りません。'+(t.kind==='start'?'STは合法の早発を含む実測秒数です。':'')+'</p><p class="practice-note122">比較記録は育成と別にこのブラウザーへ保存します。育成JSONには含まれません。最大12条件、各3回と項目別ベストを保持します。</p>'+(!safeStorage.status(PRACTICE_STORAGE122).durable?'<p class="notice warn">比較記録は一時保存中です。設定から再試行できます。</p>':'')+'</section>';
}
function practiceResult118(){const t=ui.practice118,d=t.r.drive,b=R.own(d),q=Craft.analysis(d),names={start:'スタート',turn:'第1ターン',wake:'引き波の脱出'};return heading('PRACTICE RESULT',names[t.kind]+'の振り返り')+tutorialResult141(t)+(t.repeat?'<p class="small muted">前走の機材・水面を使用。記録上の近い位置・速度から再構成しています。負荷や発動中の能力はリセットされるため、完全な再現ではありません。</p>':'')+practiceComparison122(t)+box('今回の記録','<p><b>'+(b.startFault?b.startFault:b.capsized?'転覆':b.dnf?'中断':Practice122.summarize(t)?.completed?'区間クリア':'区間未達')+'</b> · 公式ST '+R.startText(b.startTime)+'</p><p>接触 '+b.metrics.contacts+'回 / 境界 '+b.metrics.boundaries+'回 / 横滑り '+b.metrics.slideSeconds.toFixed(1)+'秒</p><p>'+esc(q?.tip||'同じ条件でもう一度試しましょう')+'</p>')+'<div class="button-row">'+btn('同じ条件でもう一度','practiceRetry','','primary large')+btn('練習を選び直す','practice','','secondary')+'</div>'+btn('元の画面へ戻る','practiceBack','','text-btn');}



function profileView(){const p=Profile.find(state,ui.profileId);if(!p)return heading('RACER','選手が見つかりません')+btn('戻る','return');const active=state.career?.player===p;return heading('RACER PROFILE','選手プロフィール')+btn('戻る','return','','text-btn')+pilotCard(p)+famePanel(p)+(p.pathNotes143?.length?'<details><summary>本編で試した育成</summary>'+p.pathNotes143.map(x=>'<p>'+esc(Practice133.arcs[x.arc].titles[x.mode])+' · '+(x.completed?'実践済み':'未達の課題')+'</p>').join('')+'</details>':'')+journeyJournal134(active?state.career:p,p.id)+epiloguePanel126(active?state.career:p,p.id)+'<div class="lounge-grid"><div>'+box('能力と走り',statsPanel(p)+synergy(p))+supportPanel121(p)+box('特殊能力',skills(p))+'</div><div>'+box('経歴',(p.developmentJournal?identity105(null,p.developmentJournal):'')+careerPanel(p))+rivalJournal106(p,p.developmentJournal)+finaleHistory(p)+(p.campaignJournal?btn('メインシナリオを読む','campaign',p.id,'secondary large'):'')+(p.bondJournal?box('大切な人との記録',bondJournal(p.bondJournal,p.storyJournal?.rivals||[])):'' )+(p.castJournal?.route?box('師匠との記録',mentorJournal(p.castJournal.route)):'')+(p.storyJournal?box('水面の物語',journalRows(p.storyJournal.log)):'')+(active?btn('物語の記録','stories','','secondary large'):'')+'</div></div>';}
function editPlayerView(id){const p=Profile.find(state,id);if(!p)return;const q=Profile.get(p);ui.editPlayerId=id;openModal('選手を編集', '<div class="profile-editor"><div class="profile-editor-lead">'+identityMark(p)+'<p>カードの装いを、自分らしく。</p></div><label class="field-label" for="profile-name">選手名</label><input id="profile-name" maxlength="16" value="'+esc(p.name)+'" autocomplete="off"><div class="edit-pair"><div><label class="field-label" for="profile-region">出身地</label><input id="profile-region" maxlength="16" placeholder="例：瀬戸内" value="'+esc(q.region)+'"></div><div><label class="field-label" for="profile-emblem">エンブレム</label><select id="profile-emblem">'+Object.entries(Profile.emblems).map(([v,l])=>'<option value="'+v+'"'+(v===q.emblem?' selected':'')+'>'+l+'</option>').join('')+'</select></div></div><label class="field-label" for="profile-motto">ひと言</label><input id="profile-motto" maxlength="32" placeholder="自分だけの言葉を" value="'+esc(q.motto)+'"><fieldset class="color-options"><legend>カードカラー</legend>'+Object.keys(Profile.colors).map((v,i)=>'<label style="--swatch:'+Profile.colors[v]+'"><input type="radio" name="profile-color" value="'+v+'"'+(v===q.color?' checked':'')+'><span>'+['青緑','珊瑚','金','空','藤','桜'][i]+'</span></label>').join('')+'</fieldset><p class="micro muted">成績・能力はそのまま。レースの艇番色は変わりません。</p>'+btn('変更を保存する','saveProfile','','primary large')+'</div>');}
function finaleHistory(p){const f=state.career?.player.id===p.id?state.career.finale:p.finaleJournal;return f?.log.length?box('頂点への記録',f.log.map((q,i)=>btn(esc(q.title),'finaleRecord',p.id+'|'+i,'secondary large')).join('')):'';}
function rivalJournal106(p,t){const entries=t?.rival.drama?.entries.filter(e=>e.decision)||[];if(!entries.length)return '';return box('ライバルとの対話',entries.map(e=>btn('第'+(e.index+1)+'話 · '+esc(e.prose?.title||Drama.B.rivals[t.rival.cast].chapters[e.index][0]),'rivalRecord',p.id+'|'+e.index,'secondary large')).join(''));}
function storiesView(){const c=state.career;if(!c)return heading('STORIES','物語はこれから')+btn('育成を始める','new','','primary');const key='history139';return heading('STORIES','物語')+campaignPanel(c)+'<div class="story-routes139">'+btn('ライバル','mainRival','','secondary')+btn('ヒロイン','bonds','','secondary')+btn('師匠','mentor','','secondary')+'</div><details class="settings-section" data-prep-detail="'+key+'"'+(ui.prepOpen121?.[key]?' open':'')+'><summary>これまでの記録</summary>'+storyArchive139()+'</details>';}
function storyArchive139(){const c=state.career;if(!c)return heading('STORIES','物語はこれから')+btn('育成を始める','new','','primary');const t=Story.ensure(c),arcs=Story.arcStatus(c).filter(a=>a.step>0),filter=ui.storyFilter||'all',logs=filter==='current'?t.log.filter(l=>l.stage===c.stage):filter==='events'?t.log.filter(l=>l.kind==='event'):t.log;return heading('WATERFRONT STORIES','水面の物語','出会いと、あなたが選んだ道。')+btn('戻る','return','','text-btn')+journeyJournal134(c,c.player.id)+epiloguePanel126(c,c.player.id)+campaignPanel(c)+rivalJournal106(c.player,c.development)+finaleHistory(c.player)+bondStrip(c)+famePanel(c.player)+box('つながる物語',arcs.length?'<div class="arc-grid">'+arcs.map(a=>'<article><span class="arc-symbol">'+icon98(a.step===3?'cup':'book')+'</span><div><b>'+esc(a.name)+'</b><small>'+(a.step===3?'完結':a.step+' / 3話 · 続きは次のシリーズ以降')+'</small><div class="arc-steps">'+[1,2,3].map(v=>'<i class="'+(v<=a.step?'filled':'')+'"></i>').join('')+'</div></div></article>').join('')+'</div>':'<p class="muted">ピットでの出会いから、物語が始まります。</p>')+'<div class="segmented" aria-label="記録の絞り込み">'+[['all','すべて'],['current','今シリーズ'],['events','出会い']].map(([v,l])=>'<button class="btn '+(filter===v?'selected':'')+'" data-action="storyFilter" data-value="'+v+'" aria-pressed="'+(filter===v)+'">'+l+'</button>').join('')+'</div>'+journalRows(logs)+(logs.length?'':'<p class="empty-state">まだこの記録はありません。</p>');}
function registryCards(rivals=false){const all=rivals?state.rivals:state.registry,list=rivals?all:Profile.list(all,ui.registrySearch||'',ui.registrySort||'recent',!!ui.favoritesOnly),shown=list.slice(0,rivals?12:(ui.registryLimit143||12));return (list.length?'<div class="registry-grid">'+shown.map(p=>{const q=Profile.get(p);return '<article class="panel racer-card registry-card" style="--pilot-accent:'+Profile.colors[q.color]+'"><div class="registry-heading">'+(rivals?Bonds.portrait(p):identityMark(p,true))+'<div><h2>'+esc(p.name)+'</h2><small>'+esc(q.region|| (rivals?'水面の記憶':p.record?.title||'登録選手'))+'</small></div>'+(!rivals?'<button class="favorite-toggle '+(q.favorite?'selected':'')+'" data-action="favorite" data-value="'+esc(p.id)+'" aria-label="'+esc(p.name)+'のお気に入り" aria-pressed="'+q.favorite+'">'+icon98('star')+'</button>':'')+'</div>'+(q.motto?'<p class="racer-motto">'+esc(q.motto)+'</p>':'')+'<div class="registry-record">'+chip(difficulty(p).name)+chip('人気 '+Math.floor(p.popularity))+chip((p.record?.wins||0)+'勝')+'</div>'+statsPanel(p,true)+'<div class="button-row">'+btn('詳細',rivals?'savedRacer':'profile',p.id,'secondary')+(!rivals?btn('編集','editPlayer',p.id,'secondary'):'')+'<details class="racer-more"><summary>管理</summary>'+btn('削除',rivals?'deleteRival':'deleteRacer',p.id,'text-btn danger-text')+'</details></div></article>';}).join('')+'</div>'+(shown.length<list.length?btn('さらに12人表示 · 残り'+(list.length-shown.length)+'人','registryMore143','','secondary large'):''):'<div class="empty-state"><strong>'+(all.length?'条件に合う選手はいません':'まだ選手の記録がありません')+'</strong><p>'+(all.length?'検索やお気に入りの条件を変えてください。':'育成を終えた選手を、ここへ登録できます。')+'</p></div>');}
function registryView(rivals=false){const list=rivals?state.rivals:state.registry;return heading(rivals?'RIVAL MEMORY':'RACER ARCHIVE',rivals?'ライバル記録':'選手名鑑',rivals?'水面で出会った好敵手たち。':'一人ずつ違う、あなたの航跡。')+btn('タイトルへ','title','','text-btn')+(!rivals?'<div class="archive-toolbar"><div class="button-row">'+btn(state.cup143?'大会の続き':'登録選手の大会','cup143','','primary',!list.length&&!state.cup143)+btn(state.challenge145&&!state.challenge145.complete?'固定挑戦の続き':'固定挑戦大会','challenge145','','secondary',!list.length&&!state.challenge145)+btn(state.quick?'作成選手レースを再開':'作成選手レース','exhibition','','primary',list.length<6&&!state.quick)+btn('ランダム6人','randomSix','','secondary',list.length<6)+'</div><div class="archive-filters"><label>選手を探す<input id="registry-search" type="search" value="'+esc(ui.registrySearch||'')+'" placeholder="名前・出身地・ひと言"></label><label>並び順<select id="registry-sort">'+[['recent','お気に入り・新着'],['name','名前'],['fame','人気'],['wins','勝利数']].map(([v,l])=>'<option value="'+v+'"'+((ui.registrySort||'recent')===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label></div><label class="setting-toggle"><input id="favorites-only" type="checkbox"'+(ui.favoritesOnly?' checked':'')+'> お気に入りだけ表示</label></div>':'')+'<div id="registry-results">'+registryCards(rivals)+'</div>';}
function playSettingsPanel140(){return (state.career?box('レースの楽しみ方',modePicker141(state.career.playMode141)):'')+box('操船の補助',Improve141.controlPanel(state.settings)+'<label class="setting-toggle"><input id="posture-assist-setting" type="checkbox"'+(state.settings.postureAssist?' checked':'')+'> 姿勢を自動で切り替える</label><p class="small muted">姿勢だけを補助します。舵とアクセルは自分で操作します。CPUの能力・成長量・獲得報酬は変わりません。</p><p class="micro muted">CPUの難易度は育成開始時に選択。文字と演出は下の「表示・演出」で別々に変更できます。</p>');}
function raceBalancePanel140(r){
 const legacy=r.drive&&!R.balance140(r.drive),pct=v=>((v-1)*100>=0?'+':'')+((v-1)*100).toFixed(1)+'％';
 return '<details class="craft-opponents"><summary>相手の能力と補正</summary><p class="small muted">'+(legacy?'この中断レースは開始時のルールで再開します。':'能力・機材・技能で決まる性能に、以下の走行補正がかかります。')+' 数値は最高速度と加速の計算用です。着順や実際の速度を保証するものではありません。</p><div class="table-scroll"><table><thead><tr><th>選手</th><th>能力平均</th><th>速度補正</th><th>加速補正</th></tr></thead><tbody>'+r.runners.map(n=>{const pace=R.npcPace(n,r);return '<tr><td>'+n.frame+' '+esc(n.name)+(n.isPlayer?'（自分）':'')+'</td><td>'+Math.floor(average(n))+'</td><td>'+pct(pace.speed)+'</td><td>'+pct(pace.accel)+'</td></tr>';}).join('')+'</tbody></table></div><p class="small muted">'+(r.difficulty==='hard'?'最優秀以外のCPU基礎能力−5は、この能力平均に反映済み。最優秀では基礎能力と技能が強くなります。':'')+(legacy?'発進とMLRの重ねがけも開始時のルールを保ちます。':'強い踏み込みは素のスタートS以上、または「零・一閃・先駆」系の所持者だけ。S以上の上乗せは数値に沿って徐々に強くなります。')+'</p>'+(!legacy?'<p class="micro muted">MLRの単独の常時能力は＋50／他＋18。複数所持時は能力ごとの最大値＋残りの25％、各65まで。CPUと自分に同じ制限がかかります。</p>':'')+'</details>';
}
function displayPanel(){return box('表示の見やすさ','<div class="edit-pair"><label>文字の大きさ<select id="text-size-setting"><option value="normal"'+(state.settings.textSize!=='large'?' selected':'')+'>標準</option><option value="large"'+(state.settings.textSize==='large'?' selected':'')+'>大きめ</option></select></label><label>コントラスト<select id="contrast-setting"><option value="standard"'+(state.settings.contrast!=='high'?' selected':'')+'>標準</option><option value="high"'+(state.settings.contrast==='high'?' selected':'')+'>くっきり</option></select></label></div><label>会話の行間<select id="spacing143"><option value="normal"'+(state.settings.spacing143!=='wide'?' selected':'')+'>標準</option><option value="wide"'+(state.settings.spacing143==='wide'?' selected':'')+'>ゆったり</option></select></label><p class="micro muted">音と音量は画面右上の ♪ から。文字の設定は物語とメニューに反映します。</p>');}
function prepChecklist(c){const a=c.series.action,t=c.story?.pending;return '<div class="prep-checklist" aria-label="出走準備"><span class="'+(a.training?'pending':'complete')+'">'+(a.training?'○':'✓')+' 練習 '+a.training+'</span><span class="'+(a.tune?'pending':'complete')+'">'+(a.tune?'○':'✓')+' 整備 '+a.tune+'</span><span class="'+(t?'pending':'complete')+'">'+(t?'○ 出会い':'✓ 確認済み')+'</span></div>';}

// V139: concise views. Detailed content is constructed only when requested.
const phaseNames139={home:'次節の開幕前',seriesIntro:'シリーズ開幕',between:'次走の準備前',action:'練習・整備',preRace:'出走前',race:'レース途中',raceResult:'レース結果',seriesResult:'シリーズ結果',registration:'選手登録'};
function phaseLabel139(c){return c?.flow131?.active?'物語の途中':phaseNames139[c?.status]||'育成中';}
function savePreview139(s){const c=s.career;return (c?esc(c.player.name)+' · '+esc(Story.stageName(c))+' · '+phaseLabel139(c):'育成中の選手なし')+(s.savedAt?'<br><small>保存日時 '+esc(new Date(s.savedAt).toLocaleString('ja-JP'))+'</small>':'')+'<br><small>登録選手 '+s.registry.length+'名</small>';}
function more139(label,key){return btn(label,'detail139',key,'secondary');}
function holdButton139(label,action,value,key,disabled){return btn(label,action,value,'quiet-choice139',disabled).replace('<button ','<button data-help139="'+esc(key)+'" ');}
function opportunityMini139(c){const all=Drama.opportunities(c,E);if(!all.length)return '';const n=all.filter(x=>x.when==='出走まで').length;return '<div class="opportunity-mini139">'+btn(n?'出走までの機会 '+n+'件':'育成イベント '+all.length+'件','opportunities','','text-btn')+'</div>';}
function budget139(a){return '<div class="budget139" aria-label="残り行動"><span>練習 <b>'+a.training+'</b></span><span>整備 <b>'+a.tune+'</b></span>'+(a.normal?'<span>共通追加 <b>'+a.normal+'</b></span>':'')+'</div>';}

function disclosure144(key,title,body){return '<details class="disclosure144" data-detail144="'+key+'"'+(state.settings.details144?.[key]?' open':'')+'><summary>'+title+'</summary><div class="disclosure-body144">'+body+'</div></details>';}
function progressBar144(){
 const q=Progress144.primary(state,progressOptions144()),c=state.career,pre=c?.status==='preRace'&&!c.flow131?.active;
 let extra='';if(pre){const choices=['start','skipRace','instantRace'].filter(a=>a!==q.action).map(a=>progressDecision144(a)).filter(a=>a.allowed);extra='<div class="progress-options144">'+choices.map(x=>btn(x.label,x.action,'','secondary')).join('')+btn('練習・整備に戻る','backAction','','text-btn')+'</div>';}
 const reason=pre&&q.allowed?(R.requiresManual(c.series.race)?'最優秀シリーズの最終戦は自分で操船します。':q.action==='skipRace'?'育成中心：観戦で進みます。操船・結果スキップも選べます。':'操船・観戦・結果スキップから選べます。'):q.reason;
 return '<section class="progress-bar144" aria-label="次の進行">'+btn(q.label,q.action,'','primary large',!q.allowed)+(reason?'<p class="progress-note144"'+(!q.allowed?' role="status"':'')+'>'+esc(reason)+'</p>':'')+(!q.allowed&&q.recovery?btn(q.recovery==='registry'?'名鑑で登録枠を確認':'現在の進行を確認',q.recovery,'','secondary'):'')+(q.action==='resumeStory131'?btn('前回の出来事','memory146','','text-btn'):'')+extra+'</section>';
}
function prepContext144(c){const r=c.series.race,p=r.runners.find(n=>n.isPlayer);return '<div class="race-meta139"><b>'+p.frame+'号艇</b><span>'+esc(r.venue.name)+'</span><span>'+esc(r.env.weather)+' · '+esc(r.env.wind)+' '+R.speedText(r.env.windSpeed)+'</span></div><div class="prep-goal144"><span>今回の目標</span><p>'+esc(prepGoal121(c))+'</p></div>';}
function resultRewards144(z){return (z.acquired.length?'<div class="reward-summary139">'+z.acquired.map(x=>abilityChip(x.id)).join('')+'</div>':'')+(z.weakness.gained?'<p class="notice warn">弱点を獲得：'+esc(ability(z.weakness.gained).name)+'</p>':'')+(z.weakness.cured?'<p class="notice">弱点を克服：'+esc(ability(z.weakness.cured).name)+'</p>':'')+(z.awakening136?'<p class="notice">'+(z.awakening136.level==='strong'?'強覚醒':'覚醒')+'のきっかけが訪れました。</p>':'');}

function homeView(){const c=state.career;return heading('PIT LOUNGE',esc(c.player.name))+careerStrip(c)+'<section class="next-voyage"><div><span class="eyebrow">NEXT SERIES</span><h2>'+esc(Story.stageName(c))+'</h2></div>'+progressBar144()+'</section><div class="quiet-links139">'+more139('人物・今節の約束','people')+more139('選手の状態','player')+(c.short143?'':more139('SGへの道','gate'))+btn('ショップ','shop','','secondary')+btn('アイテム','inventory','','secondary')+'</div>'+opportunityMini139(c);}

function seriesIntro(){const c=state.career,s=c.series;return heading(c.short143?'SHORT STORY':'SERIES '+(c.stage+1)+' / 9',esc(s.name),esc(s.venue.name))+'<section class="quiet-panel139"><p>予選'+Passage143.qualifiers(c)+'走。上位6人が優勝戦へ。</p></section>'+progressBar144()+'<div class="quiet-links139">'+more139('抽選された機材','gear')+more139('出場選手','standing')+more139('人物・今節の約束','people')+'</div>'+opportunityMini139(c);}

function actionView(){const c=state.career,a=c.series.action,p=c.player,r=c.series.race;
 return '<div class="career-screen144">'+heading(esc(c.series.name),roundLabel(r,c)+' · 育成')+prepContext144(c)+budget139(a)+(a.normal?'<p class="shared-note144">共通追加は練習・整備のどちらかに使えます。共通分から消費します。</p>':'')+opportunityMini139(c)+(c.reviewGoal141&&!c.reviewGoal141.target?goalPanel141(c):'')+'<div class="preparation-grid144"><section class="quiet-panel139"><div class="section-line"><h2>練習</h2>'+btn('説明','detail139','training','text-btn')+'</div><div class="train-grid139">'+keys.map(k=>holdButton139('<span>'+D.stats[k]+(c.reviewGoal141&&!c.reviewGoal141.target&&c.reviewGoal141.trial145!=='tune'&&c.reviewGoal141.key===k?' · 課題':'')+'</span><b>'+parameter(p.stats[k])+'</b>','train',k,'train:'+k,a.training+a.normal<=0)).join('')+'</div><div class="quiet-links139">'+more139('合同練習','partners')+btn('技の成長','development','','text-btn')+'</div></section><section class="quiet-panel139"><div class="section-line"><h2>整備</h2>'+btn('説明','detail139','tuning','text-btn')+'</div><div class="tune-grid139">'+['motor','prop'].map(part=>holdButton139('<span>'+Workshop.parts[part].name+(c.reviewGoal141&&!c.reviewGoal141.target&&c.reviewGoal141.trial145!=='train'&&c.reviewGoal141.part===part?' · 課題':'')+'</span><b>'+parameter(Workshop.gearValue(p,part))+'</b>','tune',part+':balanced','tune:'+part,a.tune+a.normal<=0)).join('')+'</div><div class="quiet-links139">'+more139('ティルト '+(R.tiltValue(r)>0?'+':'')+R.tiltValue(r).toFixed(1)+'°','tilt')+'</div></section></div>'+(a.logs.length?'<p class="receipt139" role="status">'+esc(a.logs.at(-1))+'</p>':'')+progressBar144()+disclosure144('prep.player','選手の能力・特殊能力',statsPanel(p)+synergy(p)+skills(p))+disclosure144('prep.gear','機材の状態',equipmentPanel(p)+adjustPanel(p)+workshopFinish128(c))+disclosure144('prep.people','育成の方針・人物・持ち物','<div class="quiet-links139">'+more139('育成のヒント','advice')+btn('物語の育成方針','path143','','secondary')+more139('人物・約束','people')+btn('アイテム','inventory','','secondary')+btn('ショップ','shop','','secondary')+'</div>')+disclosure144('prep.logs','行動の記録','<div class="action-log">'+(a.logs.length?a.logs.map(x=>'<p>'+esc(x)+'</p>').join(''):'<p>このレースの準備はこれからです。</p>')+'</div>')+'</div>';
}

function preView(){const c=state.career,r=c.series.race;return '<div class="career-screen144">'+heading(esc(c.series.name),roundLabel(r,c)+' · 出走')+prepContext144(c)+budget139(c.series.action)+opportunityMini139(c)+progressBar144()+disclosure144('race.field','出走表 · 6艇',runnersTable(r))+disclosure144('race.outlook','次走の見立て・操作','<p>'+esc(Improve141.controlHint(state.settings))+'</p>'+startPolicyPanel118(r)+opponentPanel118(r)+'<div class="quiet-links139">'+more139('能力と補正の詳細','pre')+more139('機材・ティルト','tilt')+more139('人物・約束','people')+btn('操作練習','practice','','secondary')+'</div>')+disclosure144('race.standing','予選順位',standingsTable(c)+qualificationPanel(c))+'</div>';}

function resultView(){const c=state.career,z=c.lastResult,title=z.startFault||(z.capsized?'転覆':z.dnf?'棄権':z.place+'着');return '<div class="career-screen144">'+heading('RACE RESULT','レース結果')+chip(Improve141.modeNames[z.controlRecord141||'unknown'],'teal')+'<div class="result-hero"><div class="result-number">'+title+'</div><div><span>獲得賞金</span><strong>'+money(z.money)+'</strong>'+(z.type==='qualifier'?'<small>'+z.points+' pt · 予選 '+z.qualificationRank+'位</small>':'')+'</div></div>'+resultGrowthStrip122(z)+resultRewards144(z)+progressBar144()+disclosure144('result.finish','着順・獲得の詳細',finishList(z.finish)+growthResult105(c,z)+(z.acquired.length?'<div class="acquisition-list144">'+z.acquired.map(x=>'<p><b>'+esc(ability(x.id).name)+'</b> · '+esc(x.source)+(x.duplicate?' · 習熟 Lv.'+x.level:' · 新規獲得')+'</p>').join('')+'</div>':'')+more139('記録を詳しく見る','result'))+disclosure144('result.review','走行の振り返り',goalPanel141(c)+reviewPanel122(c)+'<div class="quiet-links139">'+more139('分析の詳細','review')+(c.series.race.drive?.replay?.frames?.length?btn('リプレイ','replayOpen','','secondary'):'')+'</div>')+'</div>';}

function seriesResultView(){const c=state.career,z=c.history.at(-1);return '<div class="career-screen144">'+heading('SERIES RESULT',z.champion?'シリーズ制覇':z.finalType==='eliminated'?'予選敗退':z.finalType==='championship'?'優勝戦 '+z.finalPlace+'着':'準優勝戦 '+z.finalPlace+'着',esc(z.name))+'<section class="quiet-panel139"><div class="series-numbers139"><span>獲得賞金 <b>'+money(z.money)+'</b></span><span>予選順位 <b>'+z.qualificationRank+'位</b></span></div>'+resultGrowthStrip122(z)+'</section>'+(c.ending?'<p class="notice">'+(c.ending==='gate'?'SGの賞金条件に届かず、今回の育成はここまでです。':c.short143?'短編の一節を終えました。選手を登録すると、大会でも使えます。':'今回の育成を終えました。')+'</p>':'')+progressBar144()+disclosure144('series.record','今節の記録',standingsTable(c)+'<div class="quiet-links139">'+more139('今節の記録を詳しく見る','series')+(c.short143?'':more139('SGへの道','gate'))+'</div>')+disclosure144('series.story',c.ending?'物語・エンディング':'物語の記録',journeyJournal134(c,c.player.id)+epiloguePanel126(c,c.player.id)+more139('物語の記録を詳しく見る','journal'))+'<div class="quiet-links139">'+(c.ending?more139('最後の買い物','lastShop'):btn('ここで選手を登録','register','','text-btn'))+'</div></div>';}

function runnersTable(r){return '<div class="table-wrap"><table class="runners-table"><thead><tr><th>艇</th><th>選手</th><th>総合</th></tr></thead><tbody>'+r.runners.slice().sort((a,b)=>a.frame-b.frame).map(n=>'<tr class="'+(n.isPlayer?'own-row':'')+'"><td><span class="boat-token boat-'+n.frame+'">'+n.frame+'</span></td><td><button class="name-button" data-action="racer" data-value="'+esc(n.id)+'">'+esc(n.name)+(n.isPlayer?' <span class="you">YOU</span>':'')+'</button>'+(n.course!==n.frame?'<small>進入 '+n.course+'コース</small>':'')+(!n.isPlayer&&R.cpuStartProfile(n).eligible?'<small class="cpu-start-note137">鋭いスタート</small>':'')+'</td><td>'+grade(average(n))+'</td></tr>').join('')+'</tbody></table></div>';}
function partners139(c){const a=c.series.action,off=a.training+a.normal<=0,r=Development.rival(c),m=c.cast?.mentor&&Cast.map[c.cast.mentor.id];return opportunity134(c)+'<div class="training-partners">'+(m?(Cast.introduced(c)?btn(Cast.portrait(m.id)+'<span>'+esc(m.name)+'と合同練習</span>','jointTrain','mentor|'+m.key,'secondary',off):btn('先輩に話を聞く','mentorIntro','','secondary')):'')+btn(Bonds.portrait(r)+'<span>'+esc(r.name)+'と特訓</span>','jointTrain','rival|'+r.key,'secondary',off)+'</div>';}
function detail139(key){const c=state.career;if(!c)return;const p=c.player,r=c.series?.race,a=c.series?.action;let title='詳細',body='';
 if(key.startsWith('train:')){const k=key.slice(6);if(!keys.includes(k))return;title=D.stats[k]+'の練習';body='<p>現在 '+parameter(p.stats[k])+' · 成長の傾向 '+growthArrow(growthOf(p).values[k])+'</p><p>練習を1回使い、この能力を育てます。高いランクほど成長は緩やかになります。</p><p>ハードの成長補正は1.4倍。練習には上振れ・下振れがあります。</p>';}
 else if(key.startsWith('tune:')){const k=key.slice(5);if(!Workshop.parts[k])return;title=Workshop.parts[k].name+'の整備';body='<p>'+esc(Workshop.parts[k].use)+'</p><p>性能 '+parameter(Workshop.gearValue(p,k))+' · 整備力 '+Workshop.rank(Workshop.effective(p,k))+'</p><p>整備を1回使います。機材の変化は今シリーズ限り、整備の経験は育成中ずっと残ります。</p>';}
 else switch(key){
 case'training':title='練習について';body='<p>能力のボタンを押すと自主練を1回行います。長押しは説明だけを開きます。</p><p>合同練習は「合同練習」から選べます。追加行動があるときは共通分から使います。</p>'+hardPanel129(c);break;
 case'tuning':title='整備について';body='<p>モーター・プロペラのどちらかを押すと1回整備します。長押しは説明だけを開きます。</p><p>毎走続けると、ひとつに集中してA、半々ならそれぞれB程度が目安。基礎の上限はA、特殊能力の補正があればSまで届きます。</p><p>整備力がC以下の場合、高性能の機材は成功しにくくなります。</p>';break;
 case'partners':title='合同練習';body=r?partners139(c):'';break;
 case'gear':title='機材の状態';body=equipmentPanel(p)+adjustPanel(p)+(r?workshopFinish128(c):'');break;
 case'tilt':title='機材・ティルト';body=r?tiltPanel131(c)+workshopFinish128(c):'';break;
 case'player':title='選手の状態';body=statsPanel(p)+synergy(p)+skills(p)+famePanel(p)+btn('選手プロフィール','profile',p.id,'secondary');break;
 case'people':title='人物・今節の約束';body=developmentStrip(c)+finalePanel(c)+bondStrip(c)+castPanel(c)+(r?final105(c)+castRacePanel(c)+bondFinalPanel(c)+storyPanel(c):'')+requestPanel(c);break;
 case'gate':title='SGへの道';body=gateProgress(p)+hardPanel129(c);break;
 case'standing':title='順位とポイント';body=c.series?standingsTable(c)+(r?qualificationPanel(c):''):'';break;
 case'advice':title='育成のヒント';body=advicePanel121(c)+supportPanel121(p)+scenarioPanel128(c)+rivalMemory134(c);break;
 case'logs':title='今回の行動記録';body='<div class="action-log">'+(a?.logs||[]).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>';break;
 case'pre':title='次走の見立て';body=r?startPolicyPanel118(r)+raceBalancePanel140(r)+opponentPanel118(r)+synergy(p)+supportPanel121(p)+hardPanel129(c):'';break;
 case'result':title='レースの記録';body=c.lastResult?fullResult139():'';break;
 case'review':title='走行の振り返り';body=c.lastResult?advicePanel121(c,true)+resultAnalysis(c.lastResult):'';break;
 case'series':title='シリーズの記録';body=c.history.length?fullSeriesResult139():'';break;
 case'journal':title='物語の記録';body=journeyJournal134(c,p.id)+epiloguePanel126(c,p.id)+endingStoryPanel(c)+campaignPanel(c)+chroniclePanel(c);break;
 case'lastShop':title='最後の買い物';body=c.ending?shopStock(c,true):'';break;
 default:return;
 }
 openModal(title,body||'<p>まだ記録がありません。</p>');
}
function memoryPanel146(){
 const r=Memory146.recap(state.career);
 return '<p class="small">読了した場面と、実際に選んだ返答だけを表示します。</p>'+(r.resume?'<section class="memory-resume146"><small>読みかけ</small><h3>'+esc(r.resume.title)+'</h3><p>'+esc(r.resume.detail)+'</p></section>':'')+r.groups.map(g=>'<section class="memory-group146"><h3>'+esc(g.label)+'</h3>'+g.items.map(x=>'<article><b>'+esc(x.title)+'</b><p>'+esc(x.detail)+'</p></article>').join('')+'</section>').join('')+(!r.groups.length?'<p>まだ読了した出来事はありません。</p>':'')+'<p class="small">確認して閉じても、本文・しおり・育成は進みません。</p>';
}
function supportPanel146(){
 const env=Support146.environment(root.location,root.navigator),device=env.device==='iphone'?'iPhone / iPad':env.device==='android'?'Android':'PC';
 return '<p class="support-build146">競艇物語 V147 · '+device+'</p><details class="settings-section" open><summary>起動する</summary><p>ZIPを展開し、START.htmlの「ゲームを開く」を押してください。単体HTMLを保存した場合は、そのファイルを開きます。</p><p>Androidはindex_android_safe.html、iPhone / iPadはindex_iphone_safe.html、PCはindex.htmlが目安です。いずれも同じゲーム内容です。</p><p>ファイルのプレビューにしかならない場合は、JavaScriptを実行できるHTML閲覧環境で開いてください。iPhoneの「ファイル」のプレビューでは実行・保存が制限される場合があります。公開URL版はこの配布には含まれません。</p></details><details class="settings-section"><summary>更新・端末変更で引き継ぐ</summary><ol><li>旧版の「設定・セーブ」→「ファイルへ保存・読み込み」でJSONを書き出します。iPhoneでは共有先へ保存します。</li><li>JSONが保存できたことを確かめ、新版を開きます。</li><li>タイトルの「旧版のセーブを引き継ぐ」からJSONを読み込み、内容を確認して復元します。</li><li>「つづきから」で確認できるまで、旧版とJSONを残してください。</li></ol><p>同じ端末でも、ブラウザーやファイルの保存場所が変わると自動保存を共有できない場合があります。データが見えなくても、旧版を消さずにJSONから移してください。</p>'+btn('引き継ぎ画面へ','transfer143','','secondary')+'</details><details class="settings-section"><summary>V147の変更と影響</summary><p>走行中の「リタイア」を「結果へスキップ」に変更しました。途中の位置から自動操船で計算します。通常シリーズの最終戦もスキップでき、最優秀シリーズの最終戦だけは手動です。</p>'+Support146.impacts.map(([t,b])=>'<h4>'+esc(t)+'</h4><p>'+esc(b)+'</p>').join('')+'</details><details class="settings-section"><summary>保存に失敗した・進めなくなった</summary><p>保存の表示が「未保存」の時は、ページを閉じる前にJSONを書き出してください。「設定・セーブ」で未保存分を再試行できます。復元は同画面の保存枠か、手元のJSONから行えます。</p><p>不具合の診断は、画面・進行状態・最近の操作・保存成否をまとめます。人物名と会話全文は含めず、自動送信もしません。</p>'+btn('診断内容を確認','diagnostic146','','secondary')+'</details>';
}
function diagnosticText146(){return JSON.stringify(diagnostics146.snapshot(state,ui.page,saveHealth122(),{...Support146.environment(root.location,root.navigator),activeQuick:!!ui.quick}),null,2);}
function diagnosticPanel146(){
 openModal('不具合の診断','<p>人物名・会話全文・セーブ本体を含まない、この起動中の記録です。内容を確認してから、必要な場合だけ共有してください。自動送信はしません。</p><label class="field-label" for="diagnostic146-text">診断内容</label><textarea id="diagnostic146-text" rows="12" readonly spellcheck="false">'+esc(diagnosticText146())+'</textarea><div class="button-row">'+btn('コピー','diagnosticCopy146','','primary')+btn('ファイルへ保存','diagnosticDownload146','','secondary')+'</div><p class="small">コピーできない場合は、選択されたテキストを手動でコピーできます。</p><details class="settings-section"><summary>セーブ本体も必要な場合</summary><p>こちらには選手名・物語の履歴・育成内容が含まれます。通常の診断とは別のファイルです。</p>'+btn('セーブJSONの書き出しを確認','diagnosticSave146','','secondary')+'</details>');
}
async function copyDiagnostic146(){const area=document.getElementById('diagnostic146-text');if(!area)return;const text=area.value;try{if(!root.navigator?.clipboard?.writeText)throw new Error();await root.navigator.clipboard.writeText(text);toast('診断内容をコピーしました。');}catch(_){if(document.getElementById('diagnostic146-text')!==area)return;area.focus?.();area.select?.();toast('テキストを選択しました。端末のコピー操作を使ってください。');}}
function downloadDiagnostic146(){const area=document.getElementById('diagnostic146-text');if(!area)return;const url=URL.createObjectURL(new Blob([area.value],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kyotei_diagnostic_v147.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function actionError146(e,scope){diagnostics146.error(e,scope);stopAuto();openModal('進行を確認してください','<p>処理を完了できませんでした。現在の進行に戻るか、診断内容を確認できます。</p><div class="button-row">'+btn('現在の進行へ戻る','recover139','','primary')+btn('診断内容を確認','diagnostic146','','secondary')+btn('JSONを書き出す','export','','secondary')+'</div>');}

function dataView(){return heading('SETTINGS','設定・セーブ')+(state.career?btn('現在の進行へ戻る','recover139','','primary large'):btn('戻る','return','','secondary'))+'<div class="button-row support-links146">'+btn('起動・更新ガイド','support146','','text-btn')+btn('不具合の診断','diagnostic146','','text-btn')+'</div><p data-save-status121></p><details class="settings-section"><summary>保存の状態</summary>'+saveStatusPanel121()+'</details><details class="settings-section"><summary>レース・操作</summary>'+playSettingsPanel140()+'</details><details class="settings-section"><summary>表示・演出</summary>'+displayPanel()+presentationPanel()+'</details><details class="settings-section"><summary>保存枠・復元</summary>'+slotPanel()+'</details><details class="settings-section"><summary>ファイルへ保存・読み込み</summary>'+box('バックアップ',btn(root.KM_IPHONE?'JSONを共有・保存':'JSONを書き出す','export','','primary large')+btn('コピー用テキスト','exportText','','secondary')+'<p class="small">ブラウザや保存場所を変える前に、JSONを保存してください。</p><label class="field-label" for="import-file">JSONファイル</label><input id="import-file" type="file" accept="application/json,.json"><label class="field-label" for="import-text">JSONを貼り付け</label><textarea id="import-text" rows="5" spellcheck="false"></textarea>'+btn('内容を確認して読み込む','import','','secondary large'))+'</details>';}

function titleView(){const c=state.career;return '<div class="title-screen"><section class="title-hero"><div class="hero-shade"></div><div class="hero-copy"><span class="hero-kicker">育てた強さを、水面へ。</span><h1>競艇<span>物語</span></h1><p>自分だけの選手で、<br>最高峰の水面を駆け抜けろ。</p></div><span class="hero-corner">育成 × 操船</span></section><div class="title-actions">'+btn(c?'つづきから':'選手をつくる',c?'resume':'new','','primary large')+(c?'<p class="continue-info">'+esc(c.player.name)+' · '+Story.stageName(c)+' · '+phaseLabel139(c)+'</p>'+btn('新しい選手をつくる','new','','secondary'):'<p class="title-invitation">6艇の駆け引き。9シリーズの物語。</p>')+'</div><div class="title-menu">'+btn('<span class="menu-symbol">✦</span>特殊能力図鑑','catalog','','menu-btn')+btn('<span class="menu-symbol">⚑</span>登録選手 <b>'+state.registry.length+'</b>','registry','','menu-btn')+btn('<span class="menu-symbol">◇</span>ライバル記録 <b>'+state.rivals.length+'</b>','rivals','','menu-btn')+btn('<span class="menu-symbol">?</span>遊び方','help','','menu-btn')+'</div><div class="title-bottom">'+btn('設定・セーブ','data','','text-btn')+(c?btn('前回の出来事','memory146','','text-btn'):'')+btn('起動・更新ガイド','support146','','text-btn')+btn('旧版のセーブを引き継ぐ','transfer143','','text-btn')+btn('データリセット','reset','','text-btn danger-text')+'</div></div>';}
function difficultyPicker(p){return '<fieldset class="difficulty-picker"><legend>育成の難易度</legend>'+['easy','normal','hard'].map(id=>'<label class="difficulty-option"><input type="radio" name="career-difficulty" value="'+id+'"'+(difficulty(p).id===id?' checked':'')+'><span><b>'+D.difficulties[id].name+'</b><small>'+(id==='hard'?'CPU思考強化・SS120解放。最優秀以外は従来よりCPU各能力−5。初期能力1.2倍・成長1.4倍、初期SSR1個。不振時に覚醒の機会。最優秀でMLR獲得。':id==='easy'?'勝ちやすい · 成長と高レア獲得は控えめ':'手応えのある相手 · 大きく育ち、高レアも狙える')+'</small></span></label>').join('')+'<p class="small muted">難易度は開始後に変更できません。</p></fieldset>';}
function extraActionBanner(a){return a.extras.length?'<aside class="extra-action-notice" role="status"><span class="eyebrow">SPECIAL ABILITY</span><strong>特殊能力で行動が増えました</strong>'+a.extras.map(id=>{const x=ability(id);return '<div><b>'+esc(x.name)+'</b><span>'+(x.effect.action==='tune'?'モーター / プロペラ整備':'トレーニング')+' ＋1回（効果50%）</span></div>';}).join('')+'<p>残り：練習専用 '+a.training+'回 / 調整専用 '+a.tune+'回 / 通常 '+a.normal+'回</p></aside>':'';}
function newView(){const p=ui.draft;return heading('NEW RACER','水面に、名前を。','能力・成長型・物語を選んで育成を始めましょう。')+'<div class="two-column"><section class="panel"><label class="field-label" for="racer-name">選手名</label><input id="racer-name" maxlength="16" value="'+esc(p.name)+'" autocomplete="off" placeholder="名前を入力"><div class="section-line"><h2>初期能力</h2>'+btn('再抽選','reroll','','text-btn')+'</div>'+statsPanel(Hard.initial(p))+'<div class="growth-label">'+chip(growthOf(p).name,'teal')+' <span>矢印は伸びやすさ</span></div><details><summary>調整能力を見る</summary>'+adjustPanel(p)+'</details></section>'+box('育成の始め方',lengthPicker143(p)+difficultyPicker(p)+modePicker141(p.playMode141,'draft-mode141')+'<ol class="steps"><li><b>練習で選手を育てる</b><span>基礎能力は次のシリーズにも引き継ぎます。</span></li><li><b>調整で機材を仕上げる</b><span>機材はシリーズごとに抽選。狙う走りに合わせて調整します。</span></li><li><b>レースで確かめる</b><span>手動で操船、または観戦で成長を確かめます。600mを反時計回りに3周。</span></li></ol><p class="muted">初期能力は何度でも再抽選できます。育成開始後の成長型変更にはアイテムが必要です。</p>')+'</div>'+box('物語の出発点',campaignPicker(p)+'<label class="field-label" for="recovery-origin">再起編での以前の武器</label><select id="recovery-origin">'+keys.map(k=>'<option value="'+k+'"'+((p.recoveryOrigin||'turn')===k?' selected':'')+'>'+D.stats[k]+'</option>').join('')+'</select><p class="micro muted">再起編を指定した場合、またはランダムで再起編が選ばれた場合に使います。</p>'+btn(p.scenario==='recovery'?'この選手で再起を始める':'この選手で育成を始める','create','','primary large'))+btn('戻る','title','','text-btn');}
function standingsTable(c,preview=false){const ranked=standing(c);return '<div class="table-wrap"><table><thead><tr><th>順位</th><th>選手 / 能力</th><th>出走</th><th>pt</th></tr></thead><tbody>'+ranked.map((p,i)=>'<tr class="'+(p.id===c.player.id?'own-row':'')+'"><td><span class="standing-number '+(i<6?'qualifying':i<12?'semi':'')+'">'+(i+1)+'</span></td><td><b>'+esc(p.name)+(p.id===c.player.id?' <span class="you">YOU</span>':'')+'</b><small>総合 '+grade(average(p))+' · 人気 '+fmt(p.popularity)+(p.skills.some(id=>rarity(id)>=4)?' · '+p.skills.filter(id=>rarity(id)>=4).map(id=>ability(id).rarity).join('/'):'')+'</small></td><td>'+sum(p.finishes)+'</td><td><b>'+p.points+'</b></td></tr>').join('')+'</tbody></table></div>';}


function roundLabel(r,c){return r.type==='championship'?'優勝戦':r.type==='consolation'?'準優勝戦':r.type==='exhibition'?'作成選手レース':'予選 '+Math.min(Passage143.qualifiers(c),(c?c.series.round:0)+1)+' / '+Passage143.qualifiers(c);}
function remainingAction(a){return '残り：練習 '+a.training+'回 · 調整 '+a.tune+'回'+(a.normal?' · 追加 '+a.normal+'回':'');}
function inventoryButtons(c){const list=D.items.filter(x=>c.player.inventory[x.id]>0);return list.length?'<div class="inventory-list">'+list.map(x=>'<div><div><b>'+x.name+' ×'+c.player.inventory[x.id]+'</b><small>'+x.description+'</small></div>'+btn('使う','use',x.id,'secondary')+'</div>').join('')+'</div>':'<p class="muted">所持アイテムはありません。</p>';}
function qualificationPanel(c){const q=qualificationTarget(c);if(q.remaining===0)return '<div class="qualification-strip">予選確定 '+q.rank+'位 · '+(q.rank<=6?'優勝戦':q.rank<=12?'準優勝戦':'敗退')+'</div>';return '<div class="qualification-strip">予選 '+q.rank+'位 · 残り'+q.remaining+'走'+q.targets.map(x=>'<div>'+x.cut+'位圏：現在の境界 '+x.line+'pt／単独で越えるまで '+x.needed+'pt'+(x.needed>x.maxAvailable?'（現在の境界にも届かない）':'')+'</div>').join('')+'<small>他選手の得点も増えます。必要点は現時点の目安で、進出保証ではありません。</small></div>';}


function scenarioPanel128(c){const task=Practice133.summary(c);const q=Workshop.state(c),spec=Workshop.arcs[q.arc],owned=spec.skills.filter(id=>c.player.skills.includes(id));return '<aside class="scenario-feature128"><b>'+esc(spec.title)+'</b><p>'+esc(Workshop.summary(c))+'</p>'+(task?'<p><b>'+esc(task.title)+'</b><br>'+esc(task.text)+' · '+task.progress+' / 2'+(task.completed?' ✓ 記録済み':'')+'</p>':'')+'<small>'+(owned.length?owned.map(id=>esc(ability(id).name)).join(' · '):'G3後期・G2後期の本編で返答すると、物語の技を習得')+'</small></aside>';}
function gearPanel129(p){return '<div class="gear-summary129">'+['motor','prop'].map(k=>'<div><small>'+Workshop.parts[k].name+'性能</small><b>'+parameter(Workshop.gearValue(p,k))+'</b><span>整備力 '+Workshop.rank(Workshop.effective(p,k))+'</span><small>'+(Workshop.effective(p,k)<65&&Workshop.gearValue(p,k)>=65?'高性能機材：今の整備力では成功しにくい':'性能は整備で少しずつ変化')+'</small></div>').join('')+'</div>';}
function tuningPanel(p,a){
 const off=a.normal+a.tune<=0;
 return '<p class="action-budget123">'+(off?'✓ 今回の整備は使い切りました':'今回手を入れる場所を、ひとつ選びます')+'</p><div class="workshop-choices128">'+['motor','prop'].map(part=>'<section class="tune-card"><div class="section-line"><h3>'+Workshop.parts[part].name+'</h3>'+chip('整備力 '+Workshop.rank(Workshop.effective(p,part)))+'</div><p class="small muted">'+Workshop.parts[part].use+'</p>'+btn('<b>'+Workshop.parts[part].name+'を整える</b>','tune',part+':balanced','secondary',off)+'</section>').join('')+'</div><p class="small muted">ティルト角度は下の設定で別に選びます。経験は育成中ずっと残り、機材の改善は今シリーズ限りです。</p><details class="workshop-tip128"><summary>整備の育ち方</summary><p>毎走続けると、ひとつに集中してA、半々ならそれぞれB程度が目安。基礎の上限はAで、特殊能力の補正があればSまで届きます。B以下では普段の変化は控えめですが、会心の整備でよい仕上がりを引き出すことがあります。追加行動は経験も効果も控えめです。</p></details>';
}
function tiltPanel131(c){const r=c.series.race,g=Workshop.tiltGate(c.player),angle=v=>(v>0?'+':'')+v.toFixed(1)+'°';return '<section class="tilt-panel131"><div class="section-line"><h3>ティルト角度</h3>'+chip(angle(R.tiltValue(r)))+'</div><p class="small">'+esc(g.reason)+'</p><div class="tilt-options131" role="group" aria-label="ティルト角度">'+Workshop.tiltAngles.map(v=>'<button class="btn secondary '+(r.tilt===v?'selected':'')+'" data-action="tilt" data-value="'+v+'" aria-pressed="'+(r.tilt===v)+'"'+(!g.open||r.done||r.drive?' disabled':'')+'>'+angle(v)+'</button>').join('')+'</div><p class="micro muted">マイナス：旋回の安定を重視／プラス：直線の伸びを重視。0°が標準。変更で整備回数は使いません。</p>'+(!r.tilt131?'<p class="micro">このレースは旧版の設定を保持。変更すると新しい角度設定へ切り替わります。</p>':'')+'</section>';}
function workshopFinish128(c){const r=c.series.race,w=r.workshop128;return gearPanel129(c.player)+box('今回の仕上がり','<p>'+(!w?'読み込んだレースの調整を保持しています。':!w.focus?'標準の仕上がり。整備画面で今回手を入れる場所を選べます。':Workshop.parts[w.focus].name+'を整備済み。'+(w.quality==='high'?'会心の仕上がりです。':w.quality==='quiet'?'変化は控えめ。経験を次へつなげます。':'少しずつ仕上がりを整えています。'))+'</p><small class="muted">'+'整備はモーター・プロペラ。ティルト角度は独立した設定です。'+'</small>');}

function weatherBar(r){return '<div class="weather-bar"><strong>'+esc(r.venue.name)+'</strong>'+chip(r.env.weather)+chip(r.env.wind+' '+R.speedText(r.env.windSpeed))+(root.KM_RACE_RENDERER?chip('観客：'+root.KM_RACE_RENDERER.audience(r).label):'')+'</div>';}
function cpuStartNote137(n){if(n.isPlayer)return '';const q=R.cpuStartProfile(n);return q.eligible?'<small class="cpu-start-note137">鋭い踏み込み · '+esc(q.skill?ability(q.skill).name:'スタート '+q.rank)+'</small>':'';}


function hardPanel129(c){if(!Hard.hard(c.player))return '';const support='<details class="panel hard-recovery136"><summary>ハードの成長と覚醒</summary><p>練習・イベント・レース後の成長補正は1.4倍。練習には平均を中心に約±20%の振れ幅があります。高能力帯の伸びにくさとSS120上限は継続します。</p><p>3着以内なしが5走続くと覚醒、6着が4走続くと強覚醒の抽選が始まります。有効完走が対象です。強覚醒を優先し、同じ一走では一度だけ抽選します。</p><p>覚醒はSR／SSRを1個と、1能力＋4または全能力＋1。強覚醒はSSR／URを1〜2個と、1能力＋10または全能力＋3。能力上限を超える分は加算しません。</p><p>抽選率は覚醒8%から1走ごとに4ポイント（上限32%）、強覚醒10%から6ポイント（上限40%）。発生すると両方の蓄積が0に戻ります。F・L・転覆・棄権は蓄積せず、6着の連続も途切れます。</p></details>';if(c.stage!==8)return support;const ids=c.player.skills.filter(id=>ability(id).rarity==='MLR');return support+'<details class="panel hard-rewards129"><summary>最優秀で獲得するMLR · 現在'+ids.length+'個</summary><p>予選2勝・優勝戦進出・優勝戦3着以内・優勝で、それぞれ1個を獲得。優勝戦のCPUも1個ずつ所持します。</p><p>常時の能力・機動補正と、元の技を引き継ぐ極限の特殊能力です。</p>'+ids.map(abilityChip).join('')+'</details>';}


function trackView(r){const orderedBoats=ordered(r),next=Math.min(4,r.phase+1);return '<div class="race-track" id="race-track">'+(r.drive&&R.raceTime(r.drive)<R.C.lateLimit?'<div class="spectator-start-clock">'+root.KM_DRIVE_UI.startClockView(R.raceTime(r.drive),'spectator-clock-needle')+'</div>':'')+'<svg class="course-svg" viewBox="0 0 600 380" aria-hidden="true"><defs><linearGradient id="water-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#143d4b"/><stop offset="1" stop-color="#0d2739"/></linearGradient></defs><rect width="600" height="380" fill="url(#water-gradient)"/><ellipse cx="300" cy="187" rx="262" ry="140" fill="none" stroke="#71c3ce" stroke-opacity=".16" stroke-width="40"/><ellipse cx="300" cy="187" rx="262" ry="140" fill="none" stroke="#94d5d9" stroke-opacity=".5" stroke-width="1.5"/><ellipse cx="300" cy="187" rx="226" ry="106" fill="#0a2231" stroke="#a6e4e0" stroke-opacity=".12"/><path d="M300 300V350" stroke="#f2c267" stroke-width="2" stroke-dasharray="4 3"/><text x="292" y="365" text-anchor="end">START</text><text x="309" y="365">GOAL</text><text x="24" y="191" text-anchor="middle">2M</text><text x="300" y="25" text-anchor="middle">BACK</text><text x="578" y="191" text-anchor="middle">1M</text></svg><div class="track-center"><div class="track-phase">'+(r.done?'FINISH':r.phase<0?'READY':D.phases[r.phase])+'</div><div class="center-standings">'+orderedBoats.map((n,i)=>'<div class="'+(n.isPlayer?'own':'')+'"><span class="mini-rank">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':i+1)+'</span><span class="mini-boat boat-'+n.frame+'">'+n.frame+'</span><span>'+esc(n.name)+'</span></div>').join('')+'</div></div><div class="boat-layer">'+r.runners.map(n=>{const tp=r.drive?n.trackProgress||0:n.progress;const theta=Math.PI/2-tp*Math.PI*2;const x=r.phase<0?29+(n.frame-1)*8.4:50+Math.cos(theta)*43.66,y=r.phase<0?86:49.21+Math.sin(theta)*36.84;const active=r.cutins.some(e=>e.athleteId===n.id)||n.activations.some(e=>e.phase===r.phase);return '<div class="moving-boat boat-'+n.frame+(n.capsized?' capsized':'')+(active?' activated':'')+'" data-boat="'+esc(n.id)+'" data-from="'+(r.drive?n.previousTrackProgress||0:n.previousProgress)+'" data-to="'+(r.drive?n.trackProgress||0:n.progress)+'" style="left:'+x+'%;top:'+y+'%" aria-label="'+n.frame+'号艇 '+esc(n.name)+' '+(n.capsized?'転覆':rankIn(r,n.id)+'位')+'">'+n.frame+(n.capsized?'<b>転</b>':'')+'</div>';}).join('')+'</div><div class="cutin-layer" id="cutin-layer" aria-live="polite"></div></div>';}
function raceDebug(r){return '<details class="debug" '+(ui.debug?'open':'')+' id="race-debug"><summary>レースデバッグ</summary><div class="debug-status"><span id="cutin-count">カットイン待機数：'+r.cutins.length+'</span><p>対象能力：'+(r.cutins.map(e=>ability(e.abilityId).name).join(' / ')||'なし')+'</p>'+btn('カットイン確認','testCutin','','secondary')+'</div><pre>'+esc(JSON.stringify({phase:r.phase,grade:R.raceGrade(r),difficulty:r.difficulty,physical:r.drive?{laps:r.drive.laps,goal:r.drive.goal,boats:r.drive.boats.map(b=>({frame:b.frame,progress:b.progress,steering:R.steeringLimits(b,R.performance(b,r.drive,r)),pace:R.npcPace(b,r),spectator:R.spectatorAdjustment(b,r.drive,r),signature:b.signature,plan:b.plan,activeEffects:b.effects}))}:null,instructions:r.instructions,cutins:r.cutins.map(e=>e.abilityId),scores:r.runners.map(n=>({name:n.name,frame:n.frame,course:n.course,score:round(n.score),stamina:n.stamina,capsized:n.capsized,phases:n.phaseHistory})),interference:r.events.filter(e=>e.kind==='debuff')},null,2))+'</pre></details>';}
function spectatorNotice141(r){if(!r.drive)return '';if(ui.noticeRace141!==r.id){ui.noticeRace141=r.id;ui.notice141=Improve141.notices(r.drive);}const text=Improve141.notice(ui.notice141,r.drive);return text?'<p class="receipt139" role="status">'+esc(text)+'</p>':'';}
function spectatorView(r){
  if(!r.drive&&!r.done){startDrive(ui.quick?state:state.career,r);syncSpectator(r);}
  if(r.drive&&root.KM_RACE_DIALOGUE){ui.raceTalk=root.KM_RACE_DIALOGUE.update(ui.raceTalk,r.drive,r,{stepped:true});}
  const b=r.drive?R.own(r.drive):null,lap=b?Math.min(3,Math.floor(Math.max(0,b.progress)/R.C.length)+1):3;
  return heading('SPECTATOR / 3 LAPS',ui.quick?(state.quick?.challenge145?state.challenge145.pack.name:'作成選手レース'):roundLabel(r,state.career),'600mを反時計回りに3周。操船をAIへ委任。能力差を少し和らげ、周回中の小さな調子の波も加味します。')+weatherBar(r)+
    '<div class="chip-row">'+chip(lap+' / 3周','teal')+chip('600m × 3周')+(r.drive?chip(ui.auto?'自動高速':'手動進行','teal'):'')+(b?chip('レース時間 '+root.KM_DRIVE_UI.clock(Math.max(0,R.raceTime(r.drive)))):'')+chip(D.difficulties[r.difficulty||'normal'].name)+'</div><div class="spectator-stage">'+trackView(r)+'<div class="race-voices">'+(root.KM_RACE_DIALOGUE?.html(ui.raceTalk)||'')+'</div></div>'+
    spectatorNotice141(r)+'<div class="spectator-controls">'+(r.done?btn('リザルトへ','result','','primary large'):btn('3秒進める','advance','','primary',ui.auto)+btn(ui.auto?'自動を止める':'自動高速','auto','','secondary')+(r.challenge145?.mode==='auto'?'':btn('ここから操船する','takeControl','','primary'))+btn('結果へスキップ','instantRace','','secondary'))+'</div>'+
    '<div class="spectator-log" role="log" aria-label="レース実況">'+r.logs.slice(-18).map(l=>'<p class="'+esc(l.kind)+'">'+esc(l.text)+'</p>').join('')+'</div>'+raceDebug(r);
}
function raceView(){const r=currentRace();if(!r)return heading('RACE','レースがありません')+btn('タイトルへ','title','','primary');
  if(r.watch)return spectatorView(r);
  if(!r.drive&&!r.done)startDrive(ui.quick?state:state.career,r);
  if(!r.drive)return heading('FINISH','レース結果を引き継ぎました。')+btn('リザルトへ','result','','primary large');
  return root.KM_DRIVE_UI.view(r,ui.quick?(state.quick?.challenge145?state.challenge145.pack.name:'作成選手レース'):roundLabel(r,state.career));}

function finishList(result){return '<div class="finish-list">'+result.map((n,i)=>'<div class="'+(n.isPlayer?'own-row':'')+'"><strong class="finish-place">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':i+1)+'</strong><span class="boat-token boat-'+n.frame+'">'+n.frame+'</span><b>'+esc(n.name)+(n.isPlayer?' <span class="you">YOU</span>':'')+'</b>'+(n.special?chip('特別参戦','gold'):'')+'<small>'+(n.startFault==='F'?'フライング':n.startFault==='L'?'出遅れ':n.capsized?'転覆':n.dnf?'リタイア':n.finishTime!=null?root.KM_DRIVE_UI.clock(n.finishTime)+(n.startTime!=null?' / ST '+R.startText(n.startTime):''):n.points?n.points+' pt':'')+'</small></div>').join('')+'</div>';}
function resultAnalysis(z){
 const q=Review122.review(z),activations=z.activations||[],effects='<div class="chip-row">'+[...new Set(activations.map(e=>e.abilityId))].filter(id=>D.abilityMap[id]).map(abilityChip).join('')+'</div><p class="small muted">妨害・反射 '+(z.debuffEvents||[]).length+'件。</p>';
 if(z.driving){const m=z.driving.metrics||{},n=v=>Number.isFinite(v)?v:0;return '<div class="result-analysis"><div class="chip-row">'+chip(q.modeLabel,'teal')+'</div><p class="analysis-line"><b>走行</b>最高 '+Math.floor(n(m.maxSpeed)*3.6)+' km/h · ティルト '+R.tiltValue({tilt:z.driving.tilt,strategy:z.driving.setup})+'°</p><p class="analysis-line"><b>計測</b>他艇接触 '+n(m.contacts)+'回 / 境界接触 '+n(m.boundaries)+'回 / 横滑り '+n(m.slideSeconds).toFixed(1)+'秒 / 引き波 '+n(m.wakeSeconds).toFixed(1)+'秒</p><p class="analysis-line"><b>完走</b>'+(Number.isFinite(z.driving.time)?root.KM_DRIVE_UI.clock(z.driving.time):'未完走')+' · 立て直し '+n(m.rescues)+'回</p>'+(z.driving.synergies?.length?'<p>連携成立：'+esc(z.driving.synergies.map(id=>D.synergies.find(x=>x.id===id)?.name||id).join('・'))+'</p>':'')+effects+'</div>';}
 const history=z.playerPhase||[];return '<p class="small muted">旧形式の区間記録です。手動操作の良し悪しは判定しません。</p><div class="order-results">'+(z.orders||[]).map(o=>{const h=history.find(h=>h.phase===o.phase),choice=D.choices[o.phase]?.find(x=>x.id===o.id);return '<div><span>'+esc(D.phases[o.phase]||'記録')+'</span><b>'+esc(choice?.name||o.id)+'</b><small>'+(!h?'未実行':'指示の記録あり')+(o.automatic?' · 自動':'')+'</small></div>';}).join('')+'</div>'+effects;
}
function growthResult105(c,z){const challenge=z.finalChallenge?'<aside class="final-preparation"><small>最後の対決</small><h3>'+(z.finalChallenge.champion?'王座をつかんだ':z.finalChallenge.won?'最後の相手に先着':'最後の壁に届かず')+'</h3>'+btn('岸へ戻ってから','finalOutcome','','secondary')+'</aside>':'';const finaleNotice=z.finaleNotice?'<p class="notice">'+esc(z.finaleNotice)+'</p>':'';const gains=z.development||[],r=z.mainRival;return challenge+finaleNotice+(r?'<aside class="final-preparation"><small>ライバルとの航跡</small><h3>'+esc(r.name)+'に'+(z.rival134?.outcome==='void'||z.rival134?.outcome==='opponentFault'?'との対戦を記録':r.won?'先着':'届かず')+'</h3><p>'+(z.rival134?Journey134.memoryLines(c,z.rival134,E).slice(1).map(esc).join('</p><p>'):'自分 '+z.place+'着。対戦の着順を記録しました。')+'</p>'+btn('レース後のひととき','mainRival','','secondary')+'</aside>':'')+(gains.length?'<div class="chip-row">'+gains.filter(x=>x.met).map(x=>chip(D.stats[x.key]+'の実践が進んだ','teal')).join('')+'</div>':'')+(z.promise?'<p class="notice">'+esc(z.promise.name)+' 達成 · '+D.stats[z.promise.key]+'＋'+z.promise.gain+'</p>':'')+(z.type!=='qualifier'&&c.series.race.finalBrief?'<aside class="final-preparation"><small>準備を振り返る</small><p>'+esc(c.series.race.finalBrief.tactic)+'</p><div class="chip-row">'+[...new Set(z.activations.map(x=>x.abilityId))].filter(id=>Object.values(Development.paths).some(p=>p.branches.includes(id)||p.base===id)).map(id=>chip(esc(ability(id).name)+' 発動','gold')).join('')+'</div></aside>':'');}

function fullResult139(){const c=state.career,z=c.lastResult;const title=z.startFault?z.startFault:z.capsized?'転覆':z.dnf?'棄権':z.place+'着';const evaluation=z.startFault==='F'?'踏み込みが、早かった。':z.startFault==='L'?'スタートに、届かなかった。':z.dnf?'次はゴールを目指そう。':z.capsized?'次につながる立て直しを。':z.place===1?'水面を制した。':z.place<=3?'上位争いに食い込んだ。':'経験を、次の一走へ。';return heading('RACE RESULT',evaluation)+'<div class="result-hero"><div class="result-number">'+title+'</div><div><span>獲得賞金</span><strong>'+money(z.money)+'</strong><div class="chip-row">'+(z.type==='qualifier'?chip(z.points+' pt'):'')+chip('人気 '+plus(z.popularity))+'</div></div></div>'+'<p class="scenario-result128">'+esc(Practice133.reaction(c,z))+'</p>'+resultGrowthStrip122(z)+(z.practice133?'<p class="scenario-result128">'+esc(z.practice133)+'</p>':'')+(z.scenario128?'<p class="scenario-result128">'+esc(z.scenario128)+'</p>':'')+opportunityResult134(z)+(z.awakening136?'<p class="notice">'+(z.awakening136.level==='strong'?'強覚醒':'覚醒')+'のきっかけが訪れました。次へ進むと、映像を見直す場面が始まります。</p>':'')+advicePanel121(c,true)+btn(z.type!=='qualifier'?'シリーズ結果へ':c.series.round===Passage143.qualifiers(c)?'予選順位を確定する':'次のレース前アクションへ','nextRace','','primary large')+'<div class="two-column"><div>'+growthResult105(c,z)+(z.recovery?'<p class="notice">'+esc(z.recovery)+'</p>':'')+affinityChanges(c,z)+duelResultPanel(z)+replayResultPanel(c.series.race,false)+box('着順',finishList(z.finish))+'<details class="result-details"><summary>詳しい走行記録</summary>'+resultAnalysis(z)+'</details>'+'</div><div>'+box('能力成長','<div class="growth-results">'+keys.map(k=>'<div><span>'+D.stats[k]+'</span><b>'+plus(z.growthVisible?z.growthVisible[k]:R.floor(z.growth[k]))+'</b><small>'+parameter(c.player.stats[k])+'</small></div>').join('')+'</div>')+box('獲得と克服',z.acquired.length?z.acquired.map(x=>'<div class="acquired">'+abilityChip(x.id)+'<small>'+esc(x.source)+(x.duplicate?' · 習熟 Lv.'+x.level:' · 新規獲得')+(x.statBonus?' · '+D.stats[x.statBonus.key]+'＋'+x.statBonus.visible+(x.statBonus.visible===0?'（端数蓄積）':''):'')+'</small></div>').join(''):'<p class="muted">今回の特殊能力獲得はありません。</p>')+(z.weakness.gained?'<p class="notice warn">弱点を獲得：'+esc(ability(z.weakness.gained).name)+'</p>':'')+(z.weakness.cured?'<p class="notice">弱点を克服：'+esc(ability(z.weakness.cured).name)+'</p>':'')+(z.type==='qualifier'?'<p class="qualification-note">予選現在 <b>'+z.qualificationRank+'位</b> · '+c.player.points+' pt</p>':'')+''+'<details><summary>予選順位を見る</summary>'+standingsTable(c)+'</details></div></div>';}
function fullSeriesResult139(){const c=state.career,z=c.history[c.history.length-1];const ending=c.ending;return heading('SERIES RESULT',z.champion?'シリーズ制覇':z.finalType==='eliminated'?'予選敗退':z.finalType==='championship'?'優勝戦 '+z.finalPlace+'着':'準優勝戦 '+z.finalPlace+'着',esc(z.name))+seriesRecap121(c)+journeyJournal134(c,c.player.id)+epiloguePanel126(c,c.player.id)+(ending?identity105(c):'')+epiloguePanel118(c)+endingStoryPanel(c)+campaignPanel(c)+chroniclePanel(c)+castPanel(c)+'<div class="two-column"><div>'+box('シリーズの記録','<div class="result-summary"><div><span>獲得賞金</span><strong>'+money(z.money)+'</strong></div><div><span>予選順位</span><strong>'+z.qualificationRank+'位</strong></div></div><div class="growth-results">'+keys.map(k=>'<div><span>'+D.stats[k]+'</span><b>'+plus(z.growthVisible?z.growthVisible[k]:R.floor(z.growth[k]))+'</b></div>').join('')+'</div>'+(z.rival?'<p class="small muted">記憶に残った相手：'+esc(z.rival)+'</p>':''))+box('SG進出条件',gateProgress(c.player)+(ending==='gate'?'<p class="notice warn">必要賞金に届かなかったため、今回の育成はここまでです。最後の買い物をして選手を登録できます。</p>':c.stage===7?'<p class="notice">進出決定。次は最高峰シリーズ。</p>':ending?'<p class="notice">'+(ending==='sgChampion'?'SG制覇、おめでとうございます。':'最高峰シリーズを走り終えました。')+' 最後の買い物をして選手を登録できます。</p>':''))+'</div><div>'+(ending?box('登録前ラストショップ','<p class="small muted">ランダム5候補から1つだけ。通常価格の1.35倍。LR・弱点は出ません。</p>'+shopStock(c,true))+btn('選手を登録してタイトルへ','register','','primary large'):btn('次のシリーズへ','nextSeries','','primary large'))+(!ending?btn('ここで選手を登録する','register','','secondary large'):'')+'<details><summary>予選最終順位</summary>'+standingsTable(c)+'</details></div></div>';}
function shopStock(c,last=false){const s=last?c.lastShop:c.shop;if(!s)return '<p class="muted">在庫は次のシリーズで更新されます。</p>';return '<div class="shop-meta">'+chip('購入 '+s.purchases+' / '+s.limit)+chip('所持 '+money(c.player.money),'gold')+'</div><div class="shop-stock">'+(s.stock.length?s.stock.map(item=>{const a=ability(item.id);const owned=has(c.player,item.id),sold=item.sold||owned;return '<article class="shop-item"><div>'+abilityChip(a.id)+'<p>'+esc(a.description)+'</p><p class="drive-ability-note">実走：'+esc(a.drive.text)+'</p><div class="recommendation">'+esc(shopReason(c.player,a.id))+'</div><div class="chip-row">'+chip(a.category)+'</div></div><div class="shop-buy"><strong>'+money(item.price)+'</strong>'+btn(item.sold?'購入済':owned?'所持済':'購入',last?'buyLast':'buySkill',a.id,'secondary',sold||s.purchases>=s.limit||c.player.money<item.price)+'</div></article>';}).join(''):'<p class="muted">未所持の対象能力がありません。</p>')+'</div>';}
function shopView(){const c=state.career;if(!c)return '';return heading('SHOP','水辺の商店','買い物に使っても、SG条件の累計賞金は減りません。')+btn('育成に戻る','return','','text-btn')+'<div class="two-column"><div>'+box('特殊能力',c.stage<2?'<p class="muted">G3前期から開店。1シリーズ4候補、2つまで購入できます。</p>':shopStock(c))+box('所持アイテム',inventoryButtons(c))+'</div>'+box('レース前アイテム','<p class="small muted">通常品は1シリーズ2個まで。予定手帳は1育成に1枚。</p><div class="item-stock">'+D.items.map(item=>'<article><div><h3>'+item.name+'</h3><p>'+item.description+'</p><small>所持 '+(c.player.inventory[item.id]||0)+'個 · '+(item.onceCareer?(Bonds.ensure(c).shortcutUsed?'使用済み':'1育成1枚'):'今期購入 '+(c.shop&&c.shop.itemBuys[item.id]||0)+' / 2')+'</small></div><div><b>'+money(item.price)+'</b>'+btn('購入','buyItem',item.id,'secondary',c.player.money<item.price||(item.onceCareer?(Bonds.ensure(c).shortcutUsed||(c.player.inventory[item.id]||0)>0):(c.shop&&c.shop.itemBuys[item.id]||0)>=2))+'</div></article>').join('')+'</div>')+'</div>';}
const conditions={always:'条件なし',rough:'雨または風速6以上',calm:'雨以外・風速3以下',inner:'進入1〜2コース',outer:'進入4〜6コース',rain:'雨',cross:'横風',behind:'現在3位以下'};
function comboDetails(link){return '<details class="combo-info"><summary>連携 '+esc(link.name)+'</summary><p>'+link.groups.map(g=>g.map(id=>esc(ability(id).name)).join(' / ')).join(' ＋ ')+'</p><p>'+Object.entries(link.need).map(([k,v])=>D.stats[k]+v+'以上').join('・')+'。'+esc(link.description)+'</p></details>';}
function abilityCard(a){return '<article class="catalog-card"><div class="catalog-top">'+abilityChip(a.id)+chip(a.category)+'</div><p>'+esc(a.description)+'</p><p class="ability-drive">実走：'+esc(a.drive.text)+'</p>'+D.synergies.filter(link=>link.groups.some(g=>g.includes(a.id))).map(comboDetails).join('')+'<div class="ability-meta"><span>'+ (a.phases.length?a.phases.map(i=>D.phases[i]).join(' / '):a.type==='entry'?'レース開始時':a.type==='extra'?'レース前':'常時・育成時')+'</span><span>'+conditions[a.condition]+' · '+Math.round(a.chance*100)+'%</span></div><div class="chip-row">'+a.tags.filter(t=>t!==a.category).map(t=>chip(t)).join('')+'</div></article>';}
function catalogList(){const term=ui.filter.trim().toLowerCase();const list=D.abilities.filter(a=>(ui.rare==='all'||a.rarity===ui.rare)&&(ui.category==='all'||a.category===ui.category)&&(!term||(a.name+a.description+a.drive.text+a.tags.join(' ')).toLowerCase().includes(term)));return '<p class="muted small">'+list.length+' / '+D.abilities.length+'種</p><div class="catalog-grid">'+list.map(abilityCard).join('')+'</div>';}
function catalogView(){return heading('ABILITY ARCHIVE','特殊能力図鑑')+btn('戻る','return','','text-btn')+'<div class="filter-bar"><label>検索<input id="ability-search" type="search" value="'+esc(ui.filter)+'" placeholder="能力名・効果"></label><label>レア度<select id="rarity-filter"><option value="all">すべて</option>'+D.rarities.map(x=>'<option'+(ui.rare===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label><label>カテゴリ<select id="category-filter"><option value="all">すべて</option>'+D.categories.map(x=>'<option'+(ui.category===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div><div id="catalog-results">'+catalogList()+'</div>';}
function lengthPicker143(p){return '<label class="field-label" for="draft-length143">育成の長さ</label><select id="draft-length143"><option value="full"'+(p.length143!=='short'?' selected':'')+'>本編 · 全9シリーズ</option><option value="short"'+(p.length143==='short'?' selected':'')+'>短編 · 一節で完結</option></select><p class="small muted">'+(p.length143==='short'?'予選2走＋進出時の最終戦。短編専用の会話と育成記録を持ち帰れます。ヒロイン10話・最優秀シリーズは本編で進めます。':'これまでの育成期間で、ヒロインや本編の物語を進めます。')+'</p>';}
function cupTable143(rows){return '<div class="table-scroll"><table><thead><tr><th>順位</th><th>選手</th><th>得点</th><th>1着</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+x.rank+'</td><td>'+esc(x.name)+'</td><td>'+x.points+'</td><td>'+x.wins+'</td></tr>').join('')+'</tbody></table></div>';}
function cupView143(){
 if(state.challenge145&&!state.challenge145.complete)return heading('RACER CUP','固定挑戦を開催中')+btn('固定挑戦の続き','challenge145','','primary large')+btn('選手名鑑へ','registry','','secondary');
 const c=state.cup143,records=state.cupRecords143||[];
 const archive=records.length?'<details class="settings-section"><summary>大会の記録 · '+records.length+'件</summary>'+records.map(x=>'<section><h3>'+After143.formats[x.format].name+'</h3><p>'+esc(x.standings.find(p=>p.id===x.driverId)?.name||'')+' · '+x.standings.find(p=>p.id===x.driverId)?.rank+'位</p>'+cupTable143(x.standings)+'<small>'+x.results.map(r=>Improve141.modeNames[r.mode]||({auto:'観戦',spectator:'観戦',assisted:'途中切替',skip:'結果スキップ'})[r.mode]||r.mode).join(' / ')+'</small></section>').join('')+'</details>':'';
 if(c){const q=state.quick?.cup143?.id===c.id?state.quick:null,finished=q?.race.done,ready=c.results.length===c.round+1,total=After143.formats[c.format].races;
  return heading('RACER CUP',After143.formats[c.format].name,c.complete?'大会終了':(c.round+1)+' / '+total+'戦')+btn('選手名鑑へ','registry','','text-btn')+box(c.complete?'総合結果':'ここまでの順位',cupTable143(After143.standings(c)))+(finished?'<details><summary>第'+(c.round+1)+'戦の着順</summary>'+finishList(ordered(q.race).map(p=>({name:p.name,id:p.id,isPlayer:p.isPlayer,frame:p.frame,capsized:p.capsized,dnf:p.dnf,startFault:p.startFault,startTime:p.startTime,finishTime:p.finishTime})))+replayResultPanel(q.race).replaceAll('data-action="replayOpen"','data-action="cupReplay143"')+'</details>':'')+(c.complete?btn('別の大会を開く','cupLeave143','','primary large'):ready?btn('次のレースへ','cupNext143','','primary large'):'<section class="quiet-panel139"><p>'+esc(c.entrants.find(p=>p.id===c.driverId).name)+'で出走</p>'+btn(q?'操船で再開':'自分で操船する','cupRace143','manual','primary large')+btn(q?'観戦で再開':'観戦・結果まで進める','cupRace143','auto','secondary large')+'</section>')+'<details class="settings-section"><summary>大会ルール・出場選手</summary><p>'+After143.formats[c.format].description+'</p><p>1〜6着に10・8・6・4・2・1点。F・L・転覆・未完走は0点。同点は上位着順の回数、有効完走数で比較し、なお並べば同順位。</p><p>ノーマルの走行ルール。能力・技能は登録時のまま、機材は大会の開始時に抽選して固定。招待選手は選んだ登録選手の能力平均を基準に生成します。</p>'+(c.format==='rotation'?'<p>進入を固定し、コースを動かす能力はこの大会では発動しません。</p>':'')+c.entrants.map(p=>'<p>'+esc(p.name)+' · 総合 '+grade(average(p))+'</p>').join('')+'<p>賞金・成長・コインの増減はありません。大会記録は最新20件。途中の大会はセーブJSONに含まれます。</p></details>'+(!c.complete?btn('この大会を終了する','cupLeave143','','text-btn danger-text'):'')+archive;
 }
 return heading('RACER CUP','育てた選手で、次の水面へ。','登録選手1人から参加できます。空いた枠には招待選手が出場。')+btn('選手名鑑へ','registry','','text-btn')+(!state.registry.length?'<p class="notice">育成を終えて選手を登録すると、大会へ出場できます。</p>'+btn('選手をつくる','new','','primary'):box('大会を選ぶ','<label>形式<select id="cup-format143">'+Object.entries(After143.formats).map(([id,f])=>'<option value="'+id+'">'+f.name+' · '+f.races+'戦</option>').join('')+'</select></label><details><summary>形式の違い</summary>'+Object.values(After143.formats).map(f=>'<p><b>'+f.name+'</b> '+f.description+'</p>').join('')+'</details><label>操船する選手<select id="cup-driver143">'+state.registry.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('')+'</select></label><p class="small muted">出場させる選手を1〜6人選択。操船する選手にもチェックしてください。</p><div class="select-racers">'+state.registry.map((p,i)=>'<label><input type="checkbox" class="cup-selection143" value="'+esc(p.id)+'"'+(i===0?' checked':'')+'><span>'+esc(p.name)+'</span></label>').join('')+'</div>'+btn('このメンバーで大会を始める','cupStart143','','primary large')))+archive;
}
function challengeSettings145(config){if(!config)return '';const q=config.controls;return '<p class="small muted">開始時：姿勢補助 '+(config.postureAssist?'あり':'なし')+'。'+esc(Improve141.controlHint({controls141:q}))+'<br>大きさ '+Math.round(q.size*100)+'% · 下端 '+q.y+'px · 内側 '+q.inset+'px · 感度 '+q.sensitivity+'倍</p>';}
function challengeRules145(c){const p=c.pack;return '<details class="settings-section"><summary>固定条件・開始時の選手</summary><p>'+esc(p.name)+' · 大会ID '+esc(p.id)+' · 条件版'+p.version+'</p><p>会場 '+esc(p.venue.name)+'。全員同じ貸与機材、ティルト0°、作戦は均衡。進入は固定し、コースを動かす能力は発動しません。</p><div class="table-wrap"><table><thead><tr><th>戦</th><th>自艇</th><th>水面</th></tr></thead><tbody>'+p.races.map((r,i)=>'<tr><td>'+(i+1)+'</td><td>'+r.course+'コース</td><td>'+esc(r.env.weather+'・'+r.env.wind)+' '+r.env.windSpeed+'m/s</td></tr>').join('')+'</tbody></table></div><p>操作方式：'+Challenge145.modeNames[c.mode]+'。手動で始めたレースも結果へスキップできます。自動走行を含む手動部門の挑戦や、操作設定・姿勢補助を途中で変更した挑戦は参考記録です。観戦・自動部門は自動操船で統一します。</p>'+(c.mode==='manual'?challengeSettings145(c.initialConfig):'')+'<p>機材：モーター '+R.display(p.gear.motor.speed,R.equipmentRange('motor','speed'))+' / プロペラ '+R.display(p.gear.prop.turn,R.equipmentRange('prop','turn'))+'。能力・技能は開始時の登録選手を複製しています。</p><h3>'+esc(c.snapshot.name)+' · 開始時</h3>'+statsPanel(c.snapshot)+skills(c.snapshot)+'<details><summary>固定CPU 5人の能力・技能</summary>'+p.cpus.map(n=>'<section><h4>'+esc(n.name)+'</h4>'+statsPanel(n)+skills(n)+'</section>').join('')+'</details><p class="micro muted">1〜6着に10・8・6・4・2・1点。F・L・転覆・未完走は0点。同点は上位着順回数、有効完走数を比較し、なお並べば同順位。賞金・能力・コインは変わりません。</p></details>';}
function challengeComparison145(c){const previous=Challenge145.previous(state,c),score=Challenge145.summary(c),record=state.challengeRecords145?.find(r=>r.id===c.id);if(!c.complete)return '';return '<section class="quiet-panel139"><div class="section-line"><h2>'+Challenge145.medals[record?.medal||0]+'</h2>'+chip(record?.eligible?'比較対象':'参考記録',record?.eligible?'gold':'teal')+'</div><p>'+esc(c.snapshot.name)+' · 総合 '+score.rank+'位 · '+score.points+'点 · 有効完走 '+score.valid+' / '+c.pack.races.length+'</p>'+(!record?.eligible?'<p class="small muted">操作方式・操作設定の変更、または記録不足があるため、自己ベストと表彰には含めません。</p>':previous?'<p>同じ条件・操作設定の前回：'+esc(previous.snapshot.name)+' '+previous.score.points+'点 → 今回 '+score.points+'点（'+plus(score.points-previous.score.points)+'）</p><details><summary>前回と今回の育成を比べる</summary><div class="table-wrap"><table><thead><tr><th>能力</th><th>'+esc(previous.snapshot.name)+'</th><th>'+esc(c.snapshot.name)+'</th></tr></thead><tbody>'+keys.map(k=>'<tr><td>'+D.stats[k]+'</td><td>'+parameter(previous.snapshot.stats[k])+'</td><td>'+parameter(c.snapshot.stats[k])+'</td></tr>').join('')+'</tbody></table></div><p>前回の技能</p>'+skills(previous.snapshot)+'<p>今回の技能</p>'+skills(c.snapshot)+'<small>条件は固定ですが、相互作用や確率発動もあります。一つの能力だけの効果とは断定できません。</small></details>':'<p class="small muted">この条件と操作設定では初めての比較対象記録です。</p>')+'</section>';}
function challengeArchive145(){const records=state.challengeRecords145||[],honors=state.challengeHonors145||[];return (honors.length?'<details class="settings-section"><summary>自己ベスト・獲得した証</summary>'+honors.map(h=>'<article class="challenge-record145"><b>'+esc(h.best.pack.name)+' · '+Challenge145.modeNames[h.mode]+'</b><p>'+Challenge145.medals[h.medal]+' / '+h.best.score.points+'点 · '+esc(h.best.snapshot.name)+'</p><small>条件版1'+(h.mode==='manual'?' · 姿勢補助 '+(h.best.initialConfig.postureAssist?'あり':'なし'):'')+'</small>'+btn('ベストの条件・記録','challengeRecord145',h.best.id,'text-btn')+'</article>').join('')+'</details>':'')+(records.length?'<details class="settings-section"><summary>固定挑戦の履歴 · '+records.length+'件</summary>'+records.map(r=>'<article class="challenge-record145"><b>'+esc(r.pack.name)+' · '+r.score.points+'点</b><p>'+esc(r.snapshot.name)+' / '+Challenge145.modeNames[r.mode]+' / '+(r.eligible?Challenge145.medals[r.medal]:'参考記録')+'</p>'+btn('条件・選手・各戦を見る','challengeRecord145',r.id,'text-btn')+'</article>').join('')+'</details>':'');}
function challengeView145(){const c=state.challenge145;
 if(c){const q=state.quick?.challenge145?.id===c.id?state.quick:null,ready=c.results.length===c.round+1,total=c.pack.races.length,rule=c.pack.races[c.round];return '<div class="career-screen144">'+heading('FIXED CHALLENGE',c.pack.name,c.complete?'挑戦終了':(c.round+1)+' / '+total+'戦 · '+Challenge145.modeNames[c.mode])+btn('選手名鑑へ','registry','','text-btn')+challengeComparison145(c)+(!c.complete?'<div class="prep-goal144"><span>今回の固定条件</span><p>'+rule.course+'コース · '+esc(c.pack.venue.name)+' · '+esc(rule.env.wind)+' '+rule.env.windSpeed+'m/s</p></div>':'')+(c.complete?btn('大会を選び直す','challengeLeave145','','primary large'):ready?btn('次のレースへ','challengeNext145','','primary large'):btn(q?'レースを再開':Challenge145.modeNames[c.mode]+'で出走','challengeRace145','','primary large'))+(q?.race.done?'<details class="settings-section"><summary>第'+(c.round+1)+'戦の着順</summary>'+finishList(ordered(q.race))+btn('リプレイ','challengeReplay145','','text-btn')+'</details>':'')+'<details class="settings-section"><summary>総合順位</summary>'+cupTable143(Challenge145.standings(c))+'</details>'+challengeRules145(c)+(!c.complete?btn('この挑戦を終了する','challengeLeave145','','text-btn danger-text'):'')+challengeArchive145()+'</div>';}
 const block=state.cup143&&!state.cup143.complete||state.quick&&!state.quick.race.done;
 return '<div class="career-screen144">'+heading('FIXED CHALLENGE','育てた強さを、同じ水面で。','相手・機材・風・コースを固定した大会です。')+btn('選手名鑑へ','registry','','text-btn')+(!state.registry.length?'<p class="notice">選手を登録すると挑戦できます。</p>'+btn('選手をつくる','new','','primary'):block?'<p class="notice">進行中の大会・レースを終えてから挑戦できます。</p>'+btn('進行中のレースへ',state.cup143?'cup143':'resumeQuick','','primary large'):'<section class="quiet-panel139"><label>挑戦する選手<select id="challenge-driver145">'+state.registry.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('')+'</select></label><label>操作方式<select id="challenge-mode145"><option value="auto">観戦・自動で育成成果を比べる</option><option value="manual">手動で操船も含めて挑む</option></select></label><p class="small muted">方式は大会中固定。手動は開始時の操作設定も記録します。</p></section><div class="challenge-grid145">'+Object.entries(Challenge145.formats).map(([id,f])=>'<article class="quiet-panel139"><span class="eyebrow">'+f.courses.length+'戦 · 条件版1</span><h2>'+f.name+'</h2><p>'+f.description+'</p><p class="small muted">CPU基礎能力 '+(f.base-4)+'〜'+(f.base+4)+'。参加選手に応じた強化はありません。</p>'+btn('条件を確認','challengePreview145',id,'secondary')+btn('この大会に挑む','challengeStart145',id,'primary large')+'</article>').join('')+'</div><p class="small muted">全戦有効完走で「完走の証」、総合3位以内で「入賞の盾」、総合1位で「制覇の杯」。報酬は記録と表彰です。</p>')+challengeArchive145()+'</div>';}

function exhibitionView(){if(state.challenge145&&!state.challenge145.complete)return challengeView145();if(state.cup143)return cupView143();if(state.quick){const q=state.quick;return heading('EXHIBITION','作成選手レース')+'<p>進行中のレースがあります。賭けたコインは確定済みです。</p>'+btn(q.race.done?'結果を見る':'レースに戻る',q.race.done?'quickResult':'resumeQuick','','primary large')+btn('登録選手へ','registry','','text-btn');}
  return heading('EXHIBITION','6人で、もう一走。','出走する6人と操船する1人を選択。全員の成長・賞金には影響しません。')+btn('登録選手へ','registry','','text-btn')+'<div class="two-column"><div>'+box('出場選手を選択','<div class="section-line"><span>'+ui.selection.length+' / 6名</span>'+btn('ランダム6人','randomSix','','text-btn')+'</div><div class="select-racers">'+state.registry.map(p=>'<label><input type="checkbox" class="race-selection" value="'+esc(p.id)+'" '+(ui.selection.includes(p.id)?'checked':'')+' '+(!ui.selection.includes(p.id)&&ui.selection.length>=6?'disabled':'')+'><span><b>'+esc(p.name)+'</b><small>総合 '+grade(average(p))+' · '+growthOf(p).name+'</small></span></label>').join('')+'</div>')+'</div>'+box('仮想コインで応援','<div class="wallet"><span>所持コイン</span><strong>'+fmt(state.coins)+'</strong></div><p class="small muted">賭けずに出走できます。的中時は賭けたコインの3倍が戻ります。現金との交換・購入はありません。</p><label class="field-label" for="quick-driver">操船する選手</label><select id="quick-driver">'+ui.selection.map(id=>{const p=state.registry.find(n=>n.id===id);return '<option value="'+id+'">'+esc(p.name)+'</option>';}).join('')+'</select><label class="field-label" for="bet-racer">応援する選手</label><select id="bet-racer"><option value="">賭けない</option>'+ui.selection.map(id=>{const p=state.registry.find(p=>p.id===id);return '<option value="'+esc(id)+'">'+esc(p.name)+'</option>';}).join('')+'</select><label class="field-label" for="bet-stake">コイン数（0〜500）</label><input id="bet-stake" type="number" inputmode="numeric" min="0" max="'+Math.min(500,state.coins)+'" step="1" value="0">'+btn('自分で操船する','launchQuick','','primary large',ui.selection.length!==6)+btn('観戦モードで進める','launchQuick','auto','secondary large',ui.selection.length!==6)+(state.coins<100?btn('練習用コインを1,000に戻す','refill','','text-btn'):'') )+'</div>';}
function quickResultView(){if(state.quick?.challenge145)return challengeView145();if(state.quick?.cup143)return cupView143();const q=state.quick;if(!q||!q.race.done)return exhibitionView();const result=ordered(q.race).map(n=>({name:n.name,id:n.id,isPlayer:n.isPlayer,frame:n.frame,capsized:n.capsized,dnf:n.dnf,startFault:n.startFault,startTime:n.startTime,finishTime:n.finishTime}));return heading('EXHIBITION RESULT','作成選手レース結果')+replayResultPanel(q.race)+chip(Improve141.modeNames[Improve141.mode(q.race)],'teal')+box('着順',finishList(result))+'<div class="result-summary"><div><span>使用コイン</span><strong>'+q.stake+'</strong></div><div><span>戻ったコイン</span><strong>'+q.payout+'</strong></div><div><span>現在のコイン</span><strong>'+state.coins+'</strong></div></div>'+btn('もう一度選手を選ぶ','closeQuick','','primary large')+btn('登録選手へ','registry','','text-btn');}
function helpView(){return heading('HOW TO PLAY','遊び方')+btn('戻る','return','','text-btn')+'<div class="two-column">'+box('育成から登録まで','<ol class="steps"><li><b>選手を作成</b><span>名前・能力・成長型とイージー／ノーマル／ハードを確定。初期人気は0。</span></li><li><b>シリーズに出場</b><span>新人、G3、G2、G1を各2期、最後にSG。</span></li><li><b>レース前に練習1回＋調整1回</b><span>練習と、モーターかプロペラの調整を各1回。券や能力で追加も可能です。</span></li><li><b>一人称で3周のレース</b><span>基本は左で舵、右で加速。配置・感度・タップ操作は設定で変更できます。通常の優勝戦・準優勝戦も観戦・結果スキップが可能です。最優秀シリーズの最終戦だけは手動です。成績は手動・観戦・混在に分けて記録します。</span></li><li><b>予選5走と最終戦</b><span>6位まで優勝戦、12位まで準優勝戦。準優勝戦は順位決定の最終戦です。</span></li><li><b>賞金条件を達成してSGへ</b><span>G1後期終了時に累計3,200万円。未達なら登録へ。</span></li><li><b>登録して再挑戦</b><span>登録選手と記憶ライバルはSG優勝戦の特別招待枠に登場。先着で相手の高レア能力を獲得。</span></li></ol>')+box('操船のポイント','<p><b>左下で操舵、右下でアクセル。</b>曲がる前にアクセルを離すと減速します。全開の急旋回や強い接触は転覆に注意。</p><p><b>時計の色帯を参考に発進。</b>針が頂点へ戻る時刻にスタートラインへ。通過までは直進のみ。スタート能力がA以上になると早発に少し余裕が生まれます。B以下では時刻前の通過がFです。零の踏み込み・一閃の境地・先駆の心得の所持者には例外があります。許容内の早発はST 00:00と表示し、早過ぎるとF、大きく遅れるとLになります。</p><p><b>相手のスタートを見る。</b>強い踏み込みができるCPUは、素のスタート能力がS・SSか、零の踏み込み・一閃の境地・先駆の心得（各MLR版を含む）の所持者です。出走表に理由を表示します。通常のCPUのスタート時の上乗せは控えめです。</p><p><b>姿勢と水面を見る。</b>起こすと遠くを見渡しやすく、伏せると水面に近い視点になります。高速・荒波では揺れが強まり、フィジカルが高いほど落ち着きます。低フィジカルの艇は引き波を強く受け、後続へもやや強い波を残します。視点の揺れは一時停止中の設定で止められます。</p><p><b>練習する能力を選ぶ。</b>矢印が上向きの能力ほど伸びやすくなります。Bから成長は緩やかになり、A以上は一度の伸びが小さくなります。画面の整数が変わらなくても端数は蓄積します。</p><p><b>観戦は3秒ずつ、または自動高速。</b>自動を止めると、ボタンを押すまで進みません。ゴール時は途中で止まります。</p><p><b>機材はシリーズ限り。</b>選手の能力・特殊能力は次のシリーズへ引き継ぎます。</p><p><b>データ管理でバックアップ。</b>ブラウザを変える場合はJSONを書き出して引き継げます。</p>')+box('人物とのつながり','<p><b>なつとの関係。</b>G3からG1前期までに、応援イベントで何度か会話を交わすと、二人で会う機会が訪れることがあります。交際中の相手がいる場合は、その関係を大切にします。</p><p><b>最優秀シリーズの応援。</b>ヒロインの物語を完走して優勝戦へ進むと、出走前に応援の言葉が届き、専用の特殊能力を獲得できます。</p><p><b>結果の先に続く物語。</b>最後のシリーズを終えると、結果とそれまでの関係に合ったエンディングを読めます。登録後も選手プロフィールから読み返せます。</p>')+'</div>';}
function slotPanel(){return box('3つの保存枠',slotStore.list().map(x=>'<div class="slot-card"><b>枠'+x.id+' · '+(x.empty?'空き':x.broken?'読込不可':esc(x.name))+'</b><div class="button-row">'+btn('現在を保存','slotSave',x.id,'secondary')+btn('読み込む','slotLoad',x.id,'secondary',x.empty||x.broken)+'</div></div>').join('')+'<p class="small muted">各枠は登録選手を含む独立したスナップショット。端末外へ残すには枠を読み込み、JSONを書き出してください。</p>')+box('更新前・上書き前バックアップ',slotStore.archives().map((x,i)=>'<div class="slot-card">'+esc(x.reason)+' · '+esc(x.date.slice(0,16))+btn('復元','archiveLoad',i,'text-btn')+'</div>').join('')+'<p class="small muted">上書き前4件＋更新前専用1件。更新前は移行前のJSONを保持。復元後の走行は現行版の仕様になります。</p>');}


function runWithoutDriving(){
  if(requestBeforeRace())return;
  if(R.requiresManual(currentRace())){toast('最優秀シリーズの最終戦は自分で操船します。');return;}
  if(driveController){driveController.destroy();driveController=null;}
  const r=prepareSpectator(state,ui.quick);if(!r)return;
  if(r.done){save();navigate(ui.quick?'quickResult':'raceResult');return;}
  save();navigate('race');
}
function runInstant(){
 if(ui.resolving)return;if(ui.page==='preRace')ui.quick=false;if(requestBeforeRace())return;const source=currentRace();if(!source||R.requiresManual(source)){toast('最優秀シリーズの最終戦はスキップできません。');return;}
 stopAuto();root.KM_PRESENTATION?.scene('race');if(driveController){driveController.destroy();driveController=null;}const r=prepareSkip(state,ui.quick);if(!r)return;
 if(r.done){save();navigate(ui.quick?'quickResult':'raceResult');return;}ui.resolving=true;const epoch=++resolveEpoch139;save();
 app.innerHTML='<section class="skip-resolving" role="status"><span class="skip-orbit">↻</span><h2>レース結果を計算中</h2><p>現在の位置から残りを自動操船で進めています。</p></section>';
 const batch=()=>{if(epoch!==resolveEpoch139||!ui.resolving)return;try{if(document.hidden){ui.resolving=false;r.watch=true;r.controlMode='spectator';save();navigate('race');return;}
  const done=stepAutoRace(r,360);if(done){completeDrive(state,ui.quick);ui.resolving=false;save();navigate(ui.quick?'quickResult':'raceResult');}else setTimeout(batch,0);
 }catch(e){ui.resolving=false;r.watch=true;r.controlMode='spectator';save();navigate('race');toast('中断した位置から観戦・操船を再開できます。');console.error(e);}};setTimeout(batch,0);
}
function audioSceneInfo(){const c=state.career,r=ui.page==='race'?currentRace():null;return {stage:c?.stage,activeCareer:!!c,grade:r?.grade,type:r?.type,heroine:!!(c&&(ui.page==='novel'&&Bonds.B.map[ui.novel?.person?.id]||ui.page==='bonds'&&(c.bonds?.pending||ui.bondOutcome?.kind==='romance')||['action','preRace'].includes(ui.page)&&c.bonds?.reward?.raceId===c.series?.race?.id&&c.bonds?.reward))};}
function syncAudioScene(){root.KM_AUDIO?.scene(ui.page,ui.page==='practiceRace'?ui.practice118.r.drive:ui.page==='race'?currentRace()?.drive:null,audioSceneInfo());}
function render(){
  dismissModal139();
  const closingNovel=!!ui.closingNovel;ui.closingNovel=false;
  novelCurrent=null;
  if(driveController){driveController.destroy();driveController=null;}
  const rid=++renderId;clearTimeout(cutinTimer);if(animationFrame)cancelAnimationFrame(animationFrame);
  let content='';const c=state.career;
  if(['home','seriesIntro','between','action','preRace','raceResult','seriesResult','registration'].includes(ui.page))ui.quick=false;
  if(!c&&['home','seriesIntro','action','preRace','raceResult','seriesResult','shop','registration'].includes(ui.page))ui.page='title';
  // Old reader exits could leave the lobby visible after a series had already started.
  if(c&&!ui.quick&&(Flow.checkpoint(c,ui.page)||ui.page==='race')&&(Flow.checkpoint(c,c.status)||c.status==='race'))ui.page=c.status;
  if(ui.page==='novel'&&!ui.novel)ui.page=careerPage();
  if(c)advanceFlow131(ui.page);
  switch(ui.page){case'title':content=titleView()+journeyPanel118();break;case'practice':content=practiceView118();break;case'practiceRace':content=root.KM_DRIVE_UI.view(ui.practice118.r,'操作練習');break;case'practiceResult':content=practiceResult118();break;case'new':content=newView();break;case'home':content=homeView();break;case'seriesIntro':content=seriesIntro();break;case'between':content=heading('NEXT RACE','次の出走へ')+progressBar144();break;case'action':content=actionView();break;case'preRace':content=preView();break;case'race':content=raceView();break;case'raceResult':content=resultView();break;case'seriesResult':content=seriesResultView();break;case'shop':content=shopView();break;case'catalog':content=catalogView();break;case'registry':content=journeyPanel118()+registryView();break;case'rivals':content=registryView(true);break;case'cup143':content=cupView143();break;case'challenge145':content=challengeView145();break;case'exhibition':content=exhibitionView();break;case'quickResult':content=quickResultView();break;case'help':content=helpView();break;case'data':content=dataView();break;case'profile':content=profileView();break;case'stories':content=storiesView();break;case'campaign':content=campaignView();break;case'novel':content=novelView(ui.novel);break;case'development':content=developmentView();break;case'bonds':content=bondsView();break;case'mentor':content=mentorView();break;case'registration':content=c.history.length?seriesResultView():heading('CAREER COMPLETE','今回の育成を登録する')+epiloguePanel126(c,c.player.id)+box('登録前ラストショップ',shopStock(c,true))+progressBar144();break;default:content=titleView();}
  if(c&&Flow.checkpoint(c,ui.page)&&Flow.blocked(c)&&!content.includes('class="progress-bar144"'))content='<aside class="flow-resume131"><div><b>途中の物語があります</b><p>続きから読めます。会話が終わると、育成の画面へ戻ります。</p></div>'+btn('物語の続きを読む','resumeStory131','','primary')+'</aside>'+content;
  document.body.classList.toggle('wide-reading143',state.settings.spacing143==='wide');document.body.classList.toggle('large-type',state.settings.textSize==='large');document.body.classList.toggle('high-contrast',state.settings.contrast==='high');
  if(c&&['stories','bonds','mentor','development'].includes(ui.page)&&!content.includes('class="novel-stage'))content=opportunityMini139(c)+content;


  const reading=content.includes('class="novel-stage');if(c&&!reading&&Affinity.offer(c)?.deferred&&!['title','new','action','preRace','bonds','race','practice','practiceRace','practiceResult','exhibition','quickResult','catalog','registry','rivals'].includes(ui.page))content=requestPanel(c)+content;document.body.classList.toggle('reading-novel',reading);document.documentElement.style.scrollBehavior=reading?'auto':'';
  app.innerHTML=content+(reading?'':(['title','race','practiceRace'].includes(ui.page)?'':footer())+(['home','seriesIntro','action','preRace','raceResult','seriesResult','profile','stories','campaign','bonds','mentor','shop','data','catalog','registry'].includes(ui.page)?nav():''));
  paintSaveHealth121();
  syncAudioScene();
  document.body.classList.toggle('in-race',ui.page==='practiceRace'||ui.page==='race'&&!currentRace()?.watch);
  if(ui.page==='race'&&currentRace()?.drive&&!currentRace().watch){const mountedRace147=currentRace();const settings=ui.quick&&state.quick?.challenge145?state.challenge145.settings:state.settings;Review145.track(currentRace(),settings);driveController=root.KM_DRIVE_UI.mount(currentRace(),settings,{save(){Review145.track(currentRace(),settings);if(ui.quick&&state.quick?.challenge145)Challenge145.settingsChanged(state.challenge145,E);save();},skip(){if(currentRace()===mountedRace147&&ui.page==='race'&&!mountedRace147.done)runWithoutDriving();},instant(){if(currentRace()===mountedRace147&&ui.page==='race'&&!mountedRace147.done)runInstant();},finish(){Review145.track(currentRace(),settings);if(ui.quick&&state.quick?.challenge145)Challenge145.settingsChanged(state.challenge145,E);completeDrive(state,ui.quick);save();},exit(){navigate('title');}});}
  if(ui.page==='practiceRace'){const t=ui.practice118;driveController=root.KM_DRIVE_UI.mount(t.r,t.practiceSettings,{save(){t.assistUsed=t.assistUsed||!!t.practiceSettings.postureAssist;const signature=JSON.stringify(Improve141.controls(t.practiceSettings.controls141));if(signature!==t.controlsAt141){if(t.r.drive.elapsed>t.initial.drive.elapsed)t.controlsChanged141=true;t.controlsAt141=signature;}},skip(){navigate('practice');},finish(){recordPractice122(t);if(Number.isInteger(t.tutorial141)&&Improve141.tutorialPassed(t,Practice122.summarize(t))){state.settings.tutorial141=Math.max(state.settings.tutorial141||0,t.tutorial141+1);save();}setTimeout(()=>navigate('practiceResult'),0);},exit(){navigate('practice');}});}
  root.KM_PRESENTATION?.scene(ui.page);if(!reading&&!closingNovel){playResultPresentation(c);playStoryPresentation(c);}
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
  if(ui.page==='race'&&Number.isInteger(event.index)&&rarity(a.id)>=4)root.KM_PRESENTATION?.pulse(a.rarity==='LR'?'legend':'ultra',state.settings);
  const div=document.createElement('div');div.className='cutin '+a.rarity.toLowerCase();div.innerHTML='<div class="cutin-line"><span class="boat-token boat-'+event.frame+'">'+event.frame+'</span><span>'+esc(event.name)+'</span><b>'+a.rarity+'</b></div><strong>'+esc(a.name)+'</strong><small>'+root.KM_DRIVE_UI.signatureCaption(event)+'</small>';layer.appendChild(div);
  cutinTimer=setTimeout(()=>{if(rid!==renderId)return;div.remove();queueCutins(queue,rid);},1500);
}
function openModal(title,content){stopReplay();if(driveController)driveController.pause();stopAuto();const modal=document.getElementById('modal');if(modal.hidden)ui.previousFocus=document.activeElement;modal.innerHTML='<div class="modal-backdrop" data-action="closeModal"></div><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="section-line"><h2 id="modal-title">'+title+'</h2>'+btn('閉じる','closeModal','','text-btn')+'</div>'+content+'</section>';modal.hidden=false;document.body.classList.add('modal-open');const focus=modal.querySelector('button,input,select,textarea');if(focus)focus.focus();}
function dismissModal139(){const m=document.getElementById('modal');if(!m)return;m.hidden=true;m.innerHTML='';document.body.classList.remove('modal-open');confirmCallback=null;}
function closeModal(){stopReplay();dismissModal139();const target=ui.previousFocus;ui.previousFocus=null;if(target?.isConnected)target.focus();if(ui.page==='race')render();}

function confirmAction(title,content,fn,label='実行する'){openModal(title,'<p>'+content+'</p><div class="button-row">'+btn('キャンセル','closeModal','','secondary')+btn(label,'confirm','','primary')+'</div>');confirmCallback=fn;}
function careerPanel(p){return modeRecords141(p)+careerTotal141(p);}
function careerTotal141(p){const h=p.careerLog;if(!h)return '<p class="small muted">経歴はv88以降のレースから記録します。</p>';const favored=Object.entries(h.venues).sort((a,b)=>b[1].wins-a[1].wins||b[1].races-a[1].races)[0];return '<h3>選手の経歴</h3><p class="small">記録対象 '+h.races+'走 / '+h.wins+'勝'+(h.firstWin?' · 記録内の初勝利 '+esc(h.firstWin):'')+(h.bestST!==null?' · 最良ST '+R.startText(h.bestST):'')+'</p>'+(favored?'<p class="small">最多勝水面 '+esc(D.venues.find(v=>v.id===favored[0])?.name||favored[0])+' '+favored[1].wins+'勝</p>':'')+'<ul class="career-log">'+h.highlights.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';}
function showPlayer(p){openModal(esc(p.name),'<div class="profile-editor-lead">'+identityMark(p)+ '<p>'+esc(Profile.get(p).motto||Profile.get(p).region)+'</p></div>'+statsPanel(p)+cpuStartNote137(p)+synergy(p)+skills(p)+careerPanel(p)+(p.bondJournal?'<details><summary>大切な人との記録</summary>'+bondJournal(p.bondJournal,p.storyJournal?.rivals||[])+'</details>':'')+(p.castJournal?castPanel({cast:p.castJournal})+(p.castJournal.route?mentorJournal(p.castJournal.route):''):'')+(p.storyJournal?'<details><summary>この選手の物語</summary>'+journalRows(p.storyJournal.log)+'</details>':'')+'<details><summary>調整能力と機材</summary>'+adjustPanel(p)+equipmentPanel(p)+'</details>');}
async function exportSave(asText=false){save();const text=JSON.stringify(state);if(Storage122.byteLength(text)>Storage122.SAVE_MAX_BYTES&&!asText){exportSave(true);toast('データが読み込み上限15 MBを超えています。全内容をコピーして退避できます。');return;}if(asText){openModal('セーブJSON','<p class="small">全選択してコピーし、メモなどに保存できます。</p><textarea id="export-json" rows="12" readonly>'+esc(text)+'</textarea>'+btn('全選択','selectExport','','secondary large'));return;}
  if(root.KM_IPHONE){const result=await root.KM_IPHONE.shareBackup(text,'kyotei_save_'+new Date().toISOString().slice(0,10)+'.json');if(result==='shared'){toast('共有先へ渡しました。保存先を確認してください。');return;}if(result==='cancelled')return;exportSave(true);toast('共有保存が使えないため、コピー用テキストを表示しました。');return;}
  const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kyotei_save_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('JSONを書き出しました。保存されない場合はコピー用テキストをご利用ください。');
}
function doAdvance(selected=null){const r=currentRace();if(!r||r.done||!r.watch)return;
  spectatorStep(state,ui.quick,selected,180);
  if(r.done)stopAuto();save();render();if(ui.auto)scheduleAuto();
}
function scheduleAuto(){clearTimeout(autoTimer);if(!ui.auto||ui.page!=='race')return;const r=currentRace();if(r.done){stopAuto();return;}const delay=Math.max(170,500/state.settings.speed);autoTimer=setTimeout(()=>doAdvance(),delay);}
function refreshCareer(){dismissModal139();ui.quick=false;ui.page=careerPage();save();render();}
function showInventory(){const c=state.career;if(c)openModal('所持アイテム',inventoryButtons(c));}
function startNew(){const seedHolder={seed:int(state,1,0x7fffffff)};ui.draft=character(seedHolder,'水瀬 湊');ui.draft.scenario='random';navigate('new');}
const speaker105=id=>root.KM_PORTRAITS.supporting[id];
const actions105={
 opportunities(){const all=Drama.opportunities(state.career,E);openModal('残っている育成イベント','<p class="small muted">成長や伝授は、会話での選択と条件によって変わります。</p><div class="opportunity-list">'+all.map(x=>btn('<small>'+esc(x.kind)+' · '+esc(x.when)+'</small><b>'+esc(x.label)+'</b>','opportunityGo',x.id,'secondary large')).join('')+'</div>');},
 opportunityGo(id){const x=Drama.opportunities(state.career,E).find(z=>z.id===id);closeModal();if(x)actions[x.action](x.value);},
 development(){ui.novelRegistry=null;openAux('development');},
 jointTrain(v){const [method,key]=v.split('|'),c=state.career;if(method==='mentor'&&c&&!Cast.introduced(c)){actions.mentorIntro();return;}const z=c&&Development.training(c,key,method,E);if(z){save();render();toast(z.text+(z.affinity?' · 好感度＋'+z.affinity.delta:'')+(z.learned?' · '+ability(z.learned.id).name+'を習得':''));}},
 blossom(v){const [key,index]=v.split('|'),c=state.career,z=c&&Development.blossom(c,key,Number(index),E);if(z){save();render();root.KM_PRESENTATION?.show({kind:'skill',rarity:ability(z.id).rarity,title:'技が開花した',note:Development.paths[key].name+'で積み上げた練習と実践',reward:ability(z.id).name},state.settings);}},
 planOpen(){const c=state.career;if(!c)return;const sc=Development.planScene(c);openNovel({...sc,choices:sc.choices.map((ch,i)=>({...ch,action:'planChoice',value:String(i)}))});},
 planChoice(v){const c=state.career,z=Progress144.career(c,d=>Development.choosePlan(d,Number(v)));if(z){syncPlayerSnapshot(c);save();ui.novel={key:'planReply:'+c.stage,title:z.title,body:[z.note],person:z.person,background:c.campaign.arc==='shore'?'harbor':'workshop'};render();}},
 curriculum(v){if(!ui.draft||v&&!Development.unlocks(state).includes(v))return;captureDraft119();ui.draft.curriculum=v||null;render();},
 eventTalk(){const sc=eventScene131();if(sc)openNovel(sc);},
 rivalRecord(v){const [id,i]=v.split('|'),p=Profile.find(state,id),t=p?.developmentJournal||(state.career?.player===p?state.career.development:null);if(!t?.rival.drama?.entries.find(e=>e.index===Number(i)&&e.decision))return;const person=Development.rival({player:p,development:t}),sc=Drama.rivalRead(t,person,Number(i));openNovel({...sc,key:sc.key+':record',registry:p.developmentJournal?p.id:null});},
 finaleRecord(v){const [id,num]=v.split('|'),p=Profile.find(state,id),f=state.career?.player.id===id?state.career.finale:p?.finaleJournal,q=f?.log[Number(num)];if(q){openNovel({key:'final-record:'+id+':'+num,title:q.title,body:[q.text],background:'harbor',registry:p!==state.career?.player?id:null});}},
 finalOutcome(){const sc=Finale.outcomeScene(state.career);if(sc)openNovel(sc);},
 rivalPath(){const c=state.career;if(!c||!Finale.routeGate(c))return;const sc=Finale.routeScene(c);openNovel({...sc,choices:sc.choices.map((x,i)=>({...x,action:'rivalPathChoice',value:String(i)}))});},
 rivalPathChoice(v){const c=state.career,z=Progress144.career(c,d=>Finale.chooseRoute(d,Number(v)));if(z){syncPlayerSnapshot(c);save();outcomeNovel(z,Development.rival(c));}},
 mainRival(){const c=state.career;if(!c)return;const gate=Drama.rivalGate(c);if(gate.affinity&&!gate.open){toast(gate.reason);return;}const person=Development.rival(c),sc=Drama.rivalScene(c,person);if(!sc){toast(Drama.rivalGate(c).reason);return;}save();openNovel({...sc,choices:sc.choices.map((label,i)=>({label,action:'rivalChoice',value:sc.index+'|'+i}))});},
 rivalChoice(v){const [i,ch]=v.split('|').map(Number),c=state.career,z=Progress144.career(c,d=>Drama.chooseRival(d,i,ch,E));if(z){syncPlayerSnapshot(c);save();outcomeNovel(z,Development.rival(c));}},
 campaignChoice(v){const sep=v.lastIndexOf('|'),c=state.career,z=Progress144.career(c,d=>Drama.choose(d,v.slice(0,sep),Number(v.slice(sep+1)),E));if(z){syncPlayerSnapshot(c);save();outcomeNovel(z,Development.actors[c.campaign.arc]);}},

 finalTalk(){const c=state.career,r=c?.series?.race;if(!r||r.type==='qualifier')return;const scene=Finale.finalScene(c);if(scene){openNovel(scene);return;}const f=Development.brief(c,r),person=r.castDuel?Cast.map[r.castDuel.castId]:r.runners.find(n=>n.id===f.opponentId);openNovel({key:'final:'+r.id,title:'水面に出る前に',person,background:'workshop',body:[f.opponent+'が、艇の準備を終えた。','主人公「'+f.weapon+'を使う所、映像で見てきた。簡単には先へ出さないつもりだ」',f.opponent+'「対策したなら、試してみて。こちらも、同じ走りをするとは限らない」',f.skill?'主人公「'+ability(f.skill).name+'も練習してきた。使う場所を選んで競る」':'主人公「まず、自分が準備した動きを使う。最初から無理に全部合わせるつもりはない」',f.tactic,'主人公「終わったら、今日の映像を見せてほしい。勝っても負けても、確認したいから」']});},
 novelNext(){const sc=novelCurrent;if(!sc)return;const book=readerBook();if(sc.index<sc.pages.length-1){Dialogue.remember(book,sc.key,sc.index+1);save();render();}else if(!sc.choices?.length)endNovel(true);},
 novelPrev(){const sc=novelCurrent;if(!sc)return;Dialogue.remember(readerBook(),sc.key,Math.max(0,sc.index-1));save();render();},
 novelHistory(){const sc=novelCurrent;if(sc)openModal('会話の履歴',btn('前回の出来事を確認','memory146','','text-btn')+sc.pages.slice(0,sc.index+1).map(p=>{const q=Dialogue.describe(p,sc.context);return '<p class="novel-log"><b>'+esc(q.speaker)+(q.inner?'（心の声）':'')+'</b><span>'+esc(q.text)+'</span></p>';}).join(''));},
 novelExit(){endNovel(false);},
 campaignFinish(){const t=campaignSource();if(t){Campaign.mark(t,ui.campaignEntry);save();}actions.campaignExit();},
 campaignExit(){const t=campaignSource();ui.novelRegistry=null;ui.novel=null;ui.page='stories';if(ui.campaignPlayer!==state.career?.player.id){ui.profileId=ui.campaignPlayer;ui.page='profile';}render();},
 campaignChapters(id){if(id)ui.campaignPlayer=id;const t=campaignSource();if(t)openModal('物語の章',t.entries.map(e=>btn((e.read?'既読 · ':'未読 · ')+esc(Campaign.scene(t,e.id).title),'openChapter',e.id,'secondary large')).join(''));},
 openChapter(id){closeModal();ui.campaignEntry=id;navigate('campaign');},
 epilogueRead(value){const separator=value.indexOf('|'),id=value.slice(0,separator),key=value.slice(separator+1),p=Profile.find(state,id);if(!p)return;const source=p===state.career?.player?state.career:p,sc=Epilogues126.scene(source,key);if(sc)openNovel({...sc,registry:p===state.career?.player?null:id});},
 recordRead(id){const sc=ui.sceneRecords?.[id];if(sc)openNovel(sc);}
};

const actions={
 memory146(){openModal('前回の出来事',memoryPanel146());},
 support146(){openModal('起動・更新ガイド',supportPanel146());},
 diagnostic146(){diagnosticPanel146();},
 diagnosticCopy146(){return copyDiagnostic146();},
 diagnosticDownload146(){downloadDiagnostic146();},
 diagnosticSave146(){confirmAction('セーブ本体を書き出す','このJSONには選手名・物語の履歴・育成内容が含まれます。自動送信はしません。共有する場合は相手と内容を確かめてください。',()=>exportSave(),'書き出す');},
 challenge145(){if(state.quick?.challenge145)payQuick(state);ui.quick=false;save();navigate('challenge145');},
 challengePreview145(id){const pack=Challenge145.fixture(id,E),p=state.registry.find(p=>p.id===document.getElementById('challenge-driver145')?.value);if(!pack||!p)return;const mode=document.getElementById('challenge-mode145')?.value||'auto';openModal('挑戦条件',challengeRules145({pack,snapshot:p,mode,initialConfig:Review145.config(state.settings)}));},
 challengeStart145(id){const z=Challenge145.start(state,id,document.getElementById('challenge-driver145')?.value,document.getElementById('challenge-mode145')?.value,E);if(z.error){toast(z.error);return;}ui.quick=false;save();navigate('challenge145');},
 challengeRace145(){const q=Challenge145.prepare(state,E);if(q.error){toast(q.error);return;}if(q.race.done){payQuick(state);save();navigate('challenge145');return;}ui.quick=true;save();if(state.challenge145.mode==='auto')runWithoutDriving();else{takeControl(state,true);save();navigate('race');}},
 challengeNext145(){if(Challenge145.next(state,E)){ui.quick=false;save();navigate('challenge145');}},
 challengeLeave145(){const c=state.challenge145;if(!c)return;const id=c.id,leave=()=>{if(state.challenge145?.id!==id)return;Challenge145.leave(state);ui.quick=false;save();navigate('challenge145');};if(c.complete)leave();else confirmAction('固定挑戦を終了する','この大会の途中記録を終了します。登録選手・育成中の選手・過去の大会記録は残ります。',leave,'終了する');},
 challengeReplay145(){if(!state.quick?.challenge145||!state.quick.race.done)return;ui.quick=true;openReplay();},
 challengeRecord145(id){const r=state.challengeRecords145?.find(r=>r.id===id)||state.challengeHonors145?.map(h=>h.best).find(r=>r.id===id);if(!r)return;openModal(r.pack.name,challengeRules145(r)+cupTable143(Challenge145.standings(r))+'<div class="table-wrap"><table><thead><tr><th>戦</th><th>コース</th><th>着順</th><th>得点</th></tr></thead><tbody>'+r.results.map(z=>{const n=z.finish.find(p=>p.id===r.player.id);return '<tr><td>'+(z.round+1)+'</td><td>'+n.course+'</td><td>'+(n.fault||(n.capsized?'転覆':n.dnf?'未完走':n.place+'着'))+'</td><td>'+n.points+'</td></tr>';}).join('')+'</tbody></table></div>');},

  registryMore143(){ui.registryLimit143=Math.min(50,(ui.registryLimit143||12)+12);document.getElementById('registry-results').innerHTML=registryCards();},
  cup143(){if(state.quick?.cup143)payQuick(state);ui.quick=false;save();navigate('cup143');},
  cupStart143(){const ids=[...document.querySelectorAll('.cup-selection143:checked')].map(x=>x.value),driver=document.getElementById('cup-driver143').value,format=document.getElementById('cup-format143').value;const z=After143.start(state,ids,driver,format,E);if(z.error){toast(z.error);return;}save();navigate('cup143');},
  cupReplay143(){if(!state.quick?.cup143||!state.quick.race.done)return;ui.quick=true;openReplay();},
  cupRace143(mode){const q=After143.prepare(state,E);if(q.error){toast(q.error);return;}if(q.race.done){payQuick(state);save();navigate('cup143');return;}ui.quick=true;save();if(mode==='auto')runWithoutDriving();else{takeControl(state,true);save();navigate('race');}},
  cupNext143(){if(After143.next(state,E)){save();ui.quick=false;navigate('cup143');}},
  cupLeave143(){if(!state.cup143)return;const leave=()=>{After143.leave(state);ui.quick=false;save();navigate('cup143');};if(state.cup143.complete)leave();else confirmAction('大会を終了する','途中の大会を終了します。登録選手と育成のデータはそのまま残ります。',leave,'大会を終了');},
  path143(){const c=state.career;if(!c)return;const q=Passage143.route(c,E);openModal(q.title,'<p>'+esc(q.text)+'</p><p>'+esc(q.effects)+'</p>'+(q.task?'<p>'+esc(q.task.title)+' · '+q.task.progress+' / 2'+(q.task.completed?' 達成':'')+'</p>':'')+'<details><summary>これまでの取り組み</summary>'+((q.notes.length?q.notes.map(x=>'<p>'+esc(Practice133.arcs[x.arc].titles[x.mode])+' · '+(x.completed?'実践済み':'次へ持ち越した課題')+'</p>').join(''):'<p>本編で次の方針を選ぶと、前の取り組みを残します。</p>'))+'</details>');},
  transfer143(){openModal('旧版のセーブを引き継ぐ','<ol><li>旧版の「設定・セーブ」でJSONを書き出す。</li><li>下の欄でそのファイルを選ぶ。</li><li>選手名と進行を確認して読み込む。</li></ol><input id="import-file" type="file" accept=".json,application/json"><textarea id="import-text" rows="3" placeholder="JSONを貼り付けても読み込めます"></textarea>'+btn('内容を確認して読み込む','import','','primary large'));},
 detail139,
 selectGoal141(v){if(Improve141.select(state.career,v||'train')){save();detail139('review');toast('次走の課題として引き継ぎます。');}},
 reviewGoal141(){if(state.career?.reviewGoal141)openModal('次走で確かめること',goalPanel141(state.career,true));},
 repeat141(){const c=state.career,t=Improve141.repeat(E,c?.series?.race,c?.lastResult);if(!t){toast('このレースには再練習に使える走行記録がありません。');return;}if(!['practice','practiceRace','practiceResult'].includes(ui.page))ui.practiceReturn121=ui.page;beginPractice141(t);},
 tutorial141(value){const n=Number(value);if(!Number.isInteger(n)||n<0||n>2||n>(state.settings.tutorial141||0))return;const t=Craft.practice(E,Improve141.tutorial[n].kind,null,141);t.tutorial141=n;t.r.tutorial141=n;beginPractice141(t);},
 recover139(){resolveEpoch139++;ui.resolving=false;ui.quick=false;dismissModal139();if(Flow.blocked(state.career))resumeFlow131();else navigate(careerPage());},
 awakeningChoice136(value){const at=value.lastIndexOf('|'),c=state.career,z=Progress144.career(c,d=>Awakening136.choose(d,value.slice(0,at),Number(value.slice(at+1)),E));if(z){save();outcomeNovel(z,null,'workshop');}},
 opportunity134(){const c=state.career,z=Journey134.train(c,E);if(z){save();render();toast(z.text);}},
 journeyRead134(v){const at=v.indexOf('|'),id=v.slice(0,at),key=v.slice(at+1),p=Profile.find(state,id);if(!p)return;const c=p===state.career?.player?state.career:{player:p,journey134:p.journeyJournal};const e=key==='ending'?c.journey134?.ending:c.journey134?.daily.find(x=>x.id===key);if(!e||key!=='ending'&&!e.read)return;const sc=Journey134.scene(c,key);if(sc)openNovel({...sc,record:true,registry:p===state.career?.player?null:id});},
 resumeStory131(){resumeFlow131();},
 socialTalk129(kind){const sc=Social.scene(state.career,kind,E);if(sc)openNovel({...sc,choices:sc.choices.map((x,i)=>({...x,action:'socialChoice129',value:kind+'|'+Social.stamp(state.career,kind,E)+'|'+i}))});},
 socialChoice129(v){const [kind,id,index]=v.split('|'),z=Progress144.career(state.career,d=>Social.choose(d,kind,id,Number(index),E));if(z){save();outcomeNovel({...z,exit:'resume'},z.person);}},
 novelSkip129(){const sc=novelCurrent;if(!sc||!Reader.known(state,sc,sc.pages))return;Dialogue.remember(readerBook(),sc.key,sc.pages.length-1);Introductions126.read(ui.novelRegistry||sc.record?null:state.career,sc,sc.pages.length-1);if(sc.choices?.length){save();render();}else endNovel(true);},
 retrySave(){save();const result=safeStorage.retry();paintSaveHealth121();if(ui.page==='data')render();toast(!result.mainDurable?'まだ進行を保存できません。JSONを書き出して残してください。':result.ok?'端末への保存を再開しました。':'進行は保存済みです。一部のバックアップ・記録は未保存です。');},
 practiceReview(kind){if(!['start','turn','wake'].includes(kind))return;ui.practiceReturn121=ui.page;actions.practiceStart(kind);},
 requestTalk(){const sc=requestNovel(state.career);if(sc)openNovel(sc);else navigate(careerPage());},
 requestChoice(v){const sep=v.lastIndexOf('|'),c=state.career,z=Progress144.career(c,d=>Affinity.reply(d,v.slice(0,sep),Number(v.slice(sep+1))));if(z){syncPlayerSnapshot(c);save();z.exit='resume';outcomeNovel(z,Bonds.B.map[z.heroine],'harbor');}},
...actions105,
  profile(id){ui.profileId=id||state.career?.player.id;openAux('profile');},
  editPlayer(id){editPlayerView(id);},
  saveProfile(){const value=id=>document.getElementById(id).value;const result=Profile.edit(state,ui.editPlayerId,{name:value('profile-name'),region:value('profile-region'),motto:value('profile-motto'),emblem:value('profile-emblem'),color:document.querySelector('input[name="profile-color"]:checked')?.value});if(result.error){toast(result.error);return;}save();closeModal();render();toast('選手プロフィールを更新しました。');},
  favorite(id){Profile.favorite(state,id);save();const host=document.getElementById('registry-results');if(host)host.innerHTML=registryCards();},
  mentor(){ui.mentorOutcome=null;openAux('mentor');},
  mentorIntro(){const c=state.career,sc=Cast.introductionScene(c);if(!sc)return;if(ui.page!=='mentor')openAux('mentor');openNovel({...sc,exit:'mentorBack',choices:[{label:sc.actionLabel,action:'mentorIntroAdvance',value:sc.key}]});},
  mentorIntroAdvance(key){const c=state.career,z=Cast.introductionAdvance(c,key);if(!z)return;syncPlayerSnapshot(c);if(ownsFlow135(novelCurrent)){finishFlow131(true);return;}novelCurrent=null;ui.novel=null;ui.novelBack=null;ui.novelRegistry=null;ui.mentorOutcome=null;save();navigate('mentor');},
  mentorMeet(){if(Cast.introductionScene(state.career)){actions.mentorIntro();return;}if(Cast.routeOpen(state.career)){ui.mentorOutcome=null;save();render();}},
  mentorChoice(v){const i=v.lastIndexOf('|'),z=chooseMentor(state.career,v.slice(0,i),Number(v.slice(i+1)));if(z){ui.mentorOutcome=z;save();outcomeNovel({...z,rewards:[...(z.rewards||[]),...(z.skill?[ability(z.skill).name+'を伝授']:[])]},Cast.map[z.mentor]);}},
  mentorBack(){Cast.routeDepart(state.career);save();navigate('mentor');},
  bonds(){ui.bondOutcome=null;openAux('bonds');},
  meet(id){if(Bonds.open(state.career,id)){ui.bondOutcome=null;save();if(ui.page!=='bonds')openAux('bonds');else render();}},
  bondChoice(v){const i=v.lastIndexOf('|'),z=chooseBond(state.career,v.slice(0,i),Number(v.slice(i+1)));if(z){ui.bondOutcome=z;save();outcomeNovel({...z,exit:Affinity.offer(state.career)?'requestTalk':undefined},Bonds.B.map[z.heroine],'harbor');}},
  bondBack(){if(state.career?.bonds){state.career.bonds.pending=null;save();navigate('bonds');}},
  rivalTrain(v){const [id,method]=v.split('|'),z=state.career&&trainRival(state.career,id,method);if(z){ui.bondOutcome=z;save();render();toast(D.stats[z.stat]+'を練習しました'+(z.skill?' · '+ability(z.skill).name+'を獲得':''));}},
  scenario(v){if(!ui.draft||v!=='random'&&!Drama.B.arcs[v])return;captureDraft119();ui.draft.scenario=v;const y=root.scrollY||0,fromSelect=document.activeElement?.id==='scenario-select';render();document.querySelector(v==='random'||fromSelect?'#scenario-select':'[data-action="scenario"][data-value="'+v+'"]')?.focus({preventScroll:true});root.scrollTo(0,y);},
  campaign(id){const p=Profile.find(state,id);if(!p)return;ui.campaignPlayer=id;const t=p===state.career?.player?Campaign.ensure(state.career):p.campaignJournal;if(!t)return;ui.campaignEntry=(Drama.pending(t)[0]||t.entries.find(e=>!e.read)||t.entries.at(-1)).id;ui.novelRegistry=null;save();openAux('campaign');},
  campaignRead(id){const t=campaignSource();if(t?.entries.some(e=>e.id===id)){ui.campaignEntry=id;save();render();root.scrollTo(0,0);}},
  stories(){openAux('stories');},storyFilter(value){if(['all','current','events'].includes(value)){ui.storyFilter=value;render();}},

  selectMentor(id){if(Cast.select(state.career,id)){save();render();}},
  takeControl(){stopAuto();if(takeControl(state,ui.quick)){save();navigate('race');}},
  instantRace(){runInstant();},
  storyChoice(v){const i=v.lastIndexOf('|'),c=state.career,person=novelCurrent?.person,z=chooseStory(c,v.slice(0,i),Number(v.slice(i+1)));if(z){ui.storyOutcome={...z,raceId:c.series.race.id};save();if(novelCurrent?.flowKey){outcomeNovel(z,person);return;}ui.novel={key:'outcome:'+c.series.race.id,title:z.title,body:[z.note,...z.rewards],person,background:'workshop'};navigate('novel');}},
  storyLog(){const t=state.career?.story;if(t)openModal('水面の物語',journalRows(t.log)+'<div class="story-rival-history">'+t.rivals.map(r=>'<p>'+esc(r.name)+' <b>'+r.wins+'勝 '+r.losses+'敗</b></p>').join('')+'</div>');},
  slotSave(v){const i=Number(v);confirmAction('枠'+i+'へ保存','この枠を現在の全データで置き換えます。以前の内容はバックアップへ残します。',()=>{save();const ok=slotStore.save(i,state);closeModal();render();toast(ok?'保存枠 '+i+'へ保存しました。':'この保存枠は一時保存中です。JSONを書き出して残してください。');},'保存');},
  slotLoad(v){let next;try{next=slotStore.load(Number(v));}catch(e){toast(e.message);return;}confirmAction('保存枠を読み込む',savePreview139(next)+'<br>現在の進行をバックアップして切り替えます。',()=>{save();slotStore.archive(JSON.stringify(state),'保存枠の読込前');state=next;ui.quick=false;closeModal();save();navigate('title');},'読み込む');},
  archiveLoad(v){let next;try{next=slotStore.restore(Number(v));}catch(e){toast(e.message);return;}confirmAction('バックアップを復元',savePreview139(next)+'<br>現在の進行を退避して復元します。',()=>{slotStore.archive(JSON.stringify(state),'復元前');state=next;ui.quick=false;closeModal();save();navigate('title');},'復元');},
  practice(){if(!['practice','practiceRace','practiceResult'].includes(ui.page))ui.practiceReturn121=ui.page;openAux('practice');},practiceBack(){const target=ui.practiceReturn121;ui.practiceReturn121=null;navigate(target&&['home','action','preRace','raceResult','seriesResult','title','data','profile','registry','quickResult'].includes(target)?target:state.career?careerPage():'title');},practiceStart(kind){if(!['start','turn','wake'].includes(kind))return;beginPractice141(Craft.practice(E,kind,state.career?.player));},practiceRetry(){if(!ui.practice118)return;ui.practice118.r=clone(ui.practice118.initial);ui.practice118.comparison122=null;ui.practice118.controlsChanged141=false;ui.practice118.controlsAt141=JSON.stringify(Improve141.controls(ui.practice118.practiceSettings.controls141));ui.practice118.assistUsed=!!ui.practice118.practiceSettings.postureAssist;navigate('practiceRace');},
  recoveryPath(v){if(state.career&&Craft.recoveryPath(state.career,v)){save();render();}},
  replayMark(v){openReplay();if(replayRace){const n=replayRace.drive.replay.frames.findIndex(f=>f.t>=Number(v));ui.replayIndex=Math.max(0,n);paintReplay();}},
  title(){navigate('title');},new(){if(state.career)confirmAction('新しい選手で始める','育成中の選手の進行を置き換えます。登録選手とライバルは残ります。',startNew,'作成画面へ');else startNew();},
  reroll(){captureDraft119();const {name,difficulty,scenario,curriculum,recoveryOrigin,playMode141,length143}=ui.draft;ui.draft=character(state,name);Object.assign(ui.draft,{difficulty,scenario,curriculum,recoveryOrigin,playMode141,length143});render();},
  create(){captureDraft119();const name=document.getElementById('racer-name').value.trim();if(!name){toast('選手名を入力してください。');return;}ui.draft.name=name;ui.draft.recoveryOrigin=document.getElementById('recovery-origin')?.value||'turn';ui.draft.difficulty=document.querySelector('input[name="career-difficulty"]:checked').value;createCareer(state,ui.draft);refreshCareer();},
  replayOpen(){openReplay();},replayPlay(){if(!replayRace)return;if(replayPlaying)stopReplay();else{if(ui.replayIndex>=replayRace.drive.replay.frames.length-1)ui.replayIndex=0;replayPlaying=true;scheduleReplay();}paintReplay();},replayJump(v){if(!replayRace)return;stopReplay();const frames=replayRace.drive.replay.frames,target=frames[ui.replayIndex].t+Number(v);const i=frames.findIndex(f=>f.t>=target);ui.replayIndex=i<0?frames.length-1:i;paintReplay();},replaySpeed(){ui.replaySpeed=ui.replaySpeed===4?1:ui.replaySpeed*2;paintReplay();if(replayPlaying)scheduleReplay();},resume(){ui.quick=false;navigate(careerPage());},
  series(){if(!state.career)return;startSeries(state);refreshCareer();},prepare(){prepareRace(state);refreshCareer();},

  train(v){const c=state.career;if(!c)return;const result=Development.training(c,v,'solo',E);if(result){save();render();toast(result.text+(result.prep?' / '+ability(result.prep.abilityId).name+' 発動！次の1レースに補正':''));}},
  tune(v){const c=state.career;if(!c)return;const [part,direction]=v.split(':');const result=tune(c,part,direction||'balanced');if(result){save();render();toast(result.text);}},
  pre(){if(!state.career||state.career.status!=='action')return;state.career.status='preRace';refreshCareer();root.scrollTo(0,0);},
  backAction(){if(state.career&&state.career.status==='preRace'){state.career.status='action';refreshCareer();}},
  tilt(v){if(Workshop.setTilt(state.career,Number(v))){save();render();}else toast('角度を変更できる条件を満たしていません。');},
  strategy(v){if(['balanced','attack','safe'].includes(v)&&state.career.status==='preRace'){state.career.series.race.strategy=v;save();render();}},
  start(){if(state.career.status!=='preRace')return;ui.quick=false;if(requestBeforeRace()||!takeControl(state,false))return;save();navigate('race');},
  skipRace(){ui.quick=false;runWithoutDriving();},
  advance(){doAdvance();},choice(v){if(!ui.auto&&D.choices[currentRace().phase+1]?.some(o=>o.id===v))doAdvance(v);},
  auto(){if(currentRace().done)return;ui.auto=!ui.auto;if(ui.auto){render();scheduleAuto();}else{stopAuto();render();}},
  result(){if(!currentRace()?.done)return;stopAuto();if(ui.quick){payQuick(state);save();navigate('quickResult');}else{settleRace(state);save();navigate('raceResult');}},
  nextRace(){continueAfterRace(state);refreshCareer();root.scrollTo(0,0);},nextSeries(){nextSeries(state);refreshCareer();root.scrollTo(0,0);},
  register(){const c=state.career;if(!c)return;if(state.registry.length>=50){toast('登録上限50名です。登録選手一覧で枠を空けてください。');return;}
    const target144=Progress144.token(state);confirmAction('選手を登録する',esc(c.player.name)+'を登録し、今回の育成を終了します。'+(c.ending&&c.lastShop?.purchases===0?'ラストショップは未購入です。':''),()=>{if(target144!==Progress144.token(state)){recoverProgress144('進行が変わったため、登録内容を確認し直してください。');return;}const q=progressDecision144('register');if(!q.allowed){recoverProgress144(q.reason,q.recovery);return;}if(register(state,true)){save();navigate('registry');}},'登録する');},
  shop(){if(!state.career)return;openAux('shop');},
  buySkill(v){const result=buySkill(state.career,v);if(result.error)toast(result.error);else{save();render();toast(ability(v).name+'を獲得しました。'+(result.statBonus?' '+D.stats[result.statBonus.key]+'＋'+result.statBonus.visible+(result.statBonus.visible===0?'（端数蓄積）':''):''));}},
  buyLast(v){confirmAction('最後の買い物',esc(ability(v).name)+'を購入します。購入できる能力は1つだけです。',()=>{const result=buySkill(state.career,v,true);if(result.error)toast(result.error);else{save();render();toast(ability(v).name+'を獲得しました。'+(result.statBonus?' '+D.stats[result.statBonus.key]+'＋'+result.statBonus.visible+(result.statBonus.visible===0?'（端数蓄積）':''):''));}},'購入する');},
  buyItem(v){const result=buyItem(state.career,v);if(result.error)toast(result.error);else{save();render();toast('購入しました。「使う」で適用できます。');}},
  inventory(){showInventory();},
  use(v){const c=state.career;if(!c)return;if(v==='cure'){const list=c.player.skills.filter(isWeak);if(!list.length){toast('克服する弱点がありません。');return;}openModal('克服する弱点',list.map(id=>btn(esc(ability(id).name),'cure',id,'secondary large')).join(''));return;}
    const result=useItem(c,v);if(result.error){toast(result.error);return;}save();closeModal();if(ui.page==='shop'||v==='bond_shortcut'){render();}else refreshCareer();toast(v==='bond_shortcut'?'次に会うまで '+result.before+'走 → '+result.after+'走。':D.items.find(x=>x.id===v).name+'を使いました。');},
  cure(v){const result=useItem(state.career,'cure',v);if(result.error)toast(result.error);else{save();closeModal();render();toast('弱点を克服しました。');}},
  ability(v){const a=ability(v);if(a)openModal(esc(a.name),abilityCard(a)+(state.career&&has(state.career.player,v)?'<p class="small">所持 · 習熟 Lv.'+(state.career.player.mastery[v]||1)+'</p>':''));},
  racer(v){const p=currentRace()?.runners.find(n=>n.id===v);if(p)showPlayer(p);},savedRacer(v){const p=state.registry.concat(state.rivals).find(n=>n.id===v);if(p)showPlayer(p);},
  catalog(){ui.filter='';openAux('catalog');},registry(){ui.quick=false;navigate('registry');},rivals(){navigate('rivals');},
  deleteRacer(v){const p=state.registry.find(n=>n.id===v);if(p)confirmAction('登録選手を削除',esc(p.name)+(Profile.get(p).favorite?'はお気に入り選手です。削除しますか？':'を削除します。'),()=>{state.registry=state.registry.filter(n=>n.id!==v);ui.selection=ui.selection.filter(id=>id!==v);save();render();},'削除する');},
  deleteRival(v){const p=state.rivals.find(n=>n.id===v);if(p)confirmAction('ライバルを削除',esc(p.name)+'の記録を削除します。',()=>{state.rivals=state.rivals.filter(n=>n.id!==v);save();render();},'削除する');},
  exhibition(){navigate('exhibition');},randomSix(){if(state.cup143){ui.quick=false;navigate('cup143');return;}if(state.quick){navigate('exhibition');return;}if(state.registry.length<6)return;ui.selection=shuffle(state,state.registry).slice(0,6).map(p=>p.id);navigate('exhibition');},
  launchQuick(mode){const stake=Number(document.getElementById('bet-stake').value),bet=document.getElementById('bet-racer').value;const result=quickRace(state,ui.selection,bet,stake,document.getElementById('quick-driver').value);if(result.error){toast(result.error);return;}ui.quick=true;if(mode==='auto'){runWithoutDriving();}else{startDrive(state,state.quick.race);save();navigate('race');}},
  resumeQuick(){ui.quick=true;navigate('race');},quickResult(){ui.quick=true;payQuick(state);save();navigate('quickResult');},closeQuick(){if(state.quick?.challenge145){ui.quick=false;navigate('challenge145');return;}if(state.cup143){ui.quick=false;navigate('cup143');return;}if(state.quick&&!state.quick.race.done)return;state.quick=null;ui.quick=false;save();navigate('exhibition');},
  refill(){if(state.coins<100&&!state.quick){state.coins=1000;save();render();}},
  help(){openAux('help');},data(){openAux('data');},return(){let page=ui.backStack&&ui.backStack.pop()||'title';if(page==='novel'&&!ui.novel)page=careerPage();navigate(page);},
  export(){return exportSave();},exportText(){return exportSave(true);},selectExport(){document.getElementById('export-json').select();},
  import(){let imported;try{imported=decode(document.getElementById('import-text').value);}catch(e){diagnostics146.error(e,'import');toast(e.message);return;}
    confirmAction('セーブを読み込む',savePreview139(imported)+'<br>現在の進行と登録データを置き換えます。',()=>{slotStore.archive(JSON.stringify(state),'JSON読込前');state=imported;ui.quick=false;save();navigate('title');toast('セーブを読み込みました。');},'読み込む');},
  reset(){confirmAction('現在の進行をリセット','現在の育成・登録選手・ライバル・コインを初期化します。3つの保存枠とバックアップは残ります。',()=>{stopAuto();safeStorage.remove(STORAGE);safeStorage.remove(BACKUP);state=newState();ui.quick=false;ui.selection=[];save();navigate('title');},'すべて削除');},
  testCutin(){const r=currentRace();const p=r.runners.find(n=>n.isPlayer);queueCutins([{athleteId:p.id,name:p.name,frame:p.frame,abilityId:'mirror'}],renderId);},
  closeModal(){closeModal();},confirm(){const fn=confirmCallback;closeModal();if(fn)return fn();}
};
// Reject stale screen actions before any state mutation, then restore the real location.
function progressOptions144(){const r=currentRace();return {quick:!!ui.quick,busy:!!ui.resolving,manualRequired:!!r&&R.requiresManual(r)};}
function progressDecision144(action){return Progress144.decision(state,action,progressOptions144());}
function recoverProgress144(reason,recovery='recover139'){
 if(recovery==='resumeStory131'){resumeFlow131();return;}
 if(recovery==='registry'){navigate('registry');toast(reason);return;}
 if(recovery==='cup143'||recovery==='exhibition'||recovery==='challenge145'){navigate(recovery);toast(reason);return;}
 if(!ui.resolving)navigate(careerPage());toast(reason);
}
for(const id of Object.keys(Progress144.states)){const run=actions[id];if(!run)continue;actions[id]=function(...args){
 let q=progressDecision144(id);
 if(!q.allowed&&q.recovery==='resumeStory131'){
  resumeFlow131();if(ui.page==='novel'||Flow.blocked(state.career))return;
  // A legacy completed flow may be pruned; proceed only if the same action is now valid.
  q=progressDecision144(id);
 }
 if(!q.allowed){recoverProgress144(q.reason,q.recovery);return;}
 return run.apply(this,args);
};}

// A gesture that scrolls, selects text or operates a control must never turn the page.
let readerGesture120=null,actionGesture139=null,holdTimer139=null;
function cancelHold139(moved=false){clearTimeout(holdTimer139);holdTimer139=null;if(moved&&actionGesture139)actionGesture139.moved=true;}
document.addEventListener('pointerdown',event=>{
 cancelHold139();actionGesture139=null;
 const node=event.target.closest('[data-action]');
 if(node){const g=actionGesture139={node,x:event.clientX,y:event.clientY,scroll:window.scrollY,moved:false,held:false};
  if(node.dataset.help139&&!node.disabled)holdTimer139=setTimeout(()=>{if(actionGesture139!==g||g.moved||node.isConnected===false)return;g.held=true;detail139(node.dataset.help139);},550);}
 if(!event.target.closest('.novel-stage')||!novelCurrent){readerGesture120=null;return;}
 readerGesture120={key:novelCurrent.key,index:novelCurrent.index,x:event.clientX,y:event.clientY,scroll:window.scrollY,moved:false};
},{passive:true});
document.addEventListener('pointermove',event=>{if(actionGesture139&&Math.hypot(event.clientX-actionGesture139.x,event.clientY-actionGesture139.y)>10)cancelHold139(true);if(readerGesture120&&Math.hypot(event.clientX-readerGesture120.x,event.clientY-readerGesture120.y)>10)readerGesture120.moved=true;},{passive:true});
document.addEventListener('pointerup',()=>cancelHold139(),{passive:true});
document.addEventListener('pointercancel',()=>{cancelHold139(true);if(readerGesture120)readerGesture120.moved=true;},{passive:true});
document.addEventListener('scroll',()=>{cancelHold139(true);if(readerGesture120)readerGesture120.moved=true;},{capture:true,passive:true});
document.addEventListener('contextmenu',event=>{if(event.target.closest('[data-help139]'))event.preventDefault();});
document.addEventListener('click',event=>{
 if(ui.resolving)return;
 const node=event.target.closest('[data-action]'),stage=event.target.closest('.novel-stage');
 if(node?.disabled||node?.isConnected===false)return;
 if(node?.dataset.view144!==undefined&&(String(node.dataset.view144)!==String(renderId)||node.dataset.target144!==undefined&&node.dataset.target144!==Progress144.token(state))){toast('画面が更新されています。現在の操作を選び直してください。');return;}
 const g139=actionGesture139;actionGesture139=null;cancelHold139();
 if(event.detail!==0&&g139&&g139.node===node&&(g139.moved||g139.held||g139.scroll!==window.scrollY)){event.preventDefault?.();return;}
 const modal139=document.getElementById('modal');if(!modal139.hidden&&!event.target.closest('#modal'))return;
 const outside=!!stage&&!node&&!event.target.closest('button,a,input,select,textarea,summary,[role="button"],.novel-tools,.novel-choices');
 const action=node?.dataset.action||(outside?'novelNext':null),fn=actions[action];if(!fn)return;
 if(action==='novelNext'&&stage){
  const g=readerGesture120;readerGesture120=null;
  if(window.getSelection()?.isCollapsed===false||event.detail!==0&&g&&(g.moved||g.scroll!==window.scrollY||g.key!==novelCurrent?.key||g.index!==novelCurrent?.index))return;
 }
 if(['awakeningChoice136','socialChoice129','bondChoice','mentorChoice','mentorIntroAdvance','storyChoice','planChoice','campaignChoice','rivalChoice','rivalPathChoice','requestChoice'].includes(action)&&(!novelCurrent||novelCurrent.index<novelCurrent.pages.length-1||!novelCurrent.choices?.some(ch=>ch.action===action&&String(ch.value)===String(node.dataset.value))))return;
 diagnostics146.action(action,ui.page);
 try{const pending=fn(node?.dataset.value);if(pending&&typeof pending.then==='function')pending.catch(e=>actionError146(e,'async'));}catch(e){actionError146(e,'action');}
});

document.addEventListener('input',event=>{if(event.target.id==='registry-search'){ui.registrySearch=event.target.value;ui.registryLimit143=12;document.getElementById('registry-results').innerHTML=registryCards();return;}if(event.target.id==='replay-seek'){stopReplay();ui.replayIndex=Number(event.target.value);paintReplay();return;}if(event.target.id==='ability-search'){ui.filter=event.target.value;document.getElementById('catalog-results').innerHTML=catalogList();}});
document.addEventListener('change',event=>{const t=event.target;if(t.id==='spacing143'){if(!['normal','wide'].includes(t.value))return;state.settings.spacing143=t.value;save();document.body.classList.toggle('wide-reading143',t.value==='wide');return;}if(t.id==='play-mode141'){if(Improve141.setMode(state.career,t.value))save();return;}if(t.id==='draft-length143'){captureDraft119();render();return;}if(t.id==='draft-mode141'){captureDraft119();return;}if(t.id?.startsWith('control141-')){if(Improve141.setControl(state.settings,t.id.slice(11),t.type==='checkbox'?!!t.checked:t.value))save();return;}if(t.id==='posture-assist-setting'){state.settings.postureAssist=!!t.checked;save();return;}if(t.id==='registry-sort'||t.id==='favorites-only'){ui.registryLimit143=12;if(t.id==='registry-sort')ui.registrySort=t.value;else ui.favoritesOnly=t.checked;document.getElementById('registry-results').innerHTML=registryCards();return;}if(t.id==='text-size-setting'||t.id==='contrast-setting'){state.settings[t.id==='text-size-setting'?'textSize':'contrast']=t.value;save();document.body.classList.toggle('large-type',state.settings.textSize==='large');document.body.classList.toggle('high-contrast',state.settings.contrast==='high');return;}if(t.id==='rarity-filter'||t.id==='category-filter'){ui[t.id==='rarity-filter'?'rare':'category']=t.value;document.getElementById('catalog-results').innerHTML=catalogList();}
  if(t.id==='race-fx-setting'){state.settings.raceFX=t.value;save();}
  if(t.id==='presentation-setting'){state.settings.presentation=t.value;root.KM_PRESENTATION?.cancel();save();}
  if(t.id==='scenario-select')actions.scenario(t.value);
  if(t.name==='career-difficulty'){captureDraft119();render();}
  if(t.id==='haptics-setting'){state.settings.haptics=t.checked;if(!t.checked)root.KM_PRESENTATION?.cancel();save();if(t.checked)root.KM_PRESENTATION?.pulse('skill',state.settings);}
  if(t.id==='race-speed'){state.settings.speed=Number(t.value);save();if(ui.auto)scheduleAuto();}
  if(t.classList.contains('race-selection')){if(t.checked&&ui.selection.length<6)ui.selection.push(t.value);else ui.selection=ui.selection.filter(x=>x!==t.value);render();}
  if(t.id==='import-file'&&t.files[0]){if(t.files[0].size>Storage122.SAVE_MAX_BYTES){toast('読み込み上限は15 MBです。');t.value='';return;}const reader=new FileReader();reader.onload=()=>{const area=document.getElementById('import-text');if(area)area.value=String(reader.result);};reader.onerror=()=>toast('ファイルを読み取れませんでした。');reader.readAsText(t.files[0]);}
});
document.addEventListener('keydown',event=>{const modal=document.getElementById('modal');if(modal.hidden)return;if(event.key==='Escape'){event.preventDefault();closeModal();}if(event.key==='Tab'){const nodes=Array.from(modal.querySelectorAll('button:not([disabled]),input,select,textarea,[tabindex="0"]'));const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
function suspend139(){cancelHold139(true);stopReplay();stopAuto();if(driveController)driveController.pause();if(ui.resolving){resolveEpoch139++;ui.resolving=false;const r=currentRace();if(r&&!r.done){r.watch=true;r.controlMode='spectator';ui.page='race';}}save(true);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend139();else if(ui.page==='race')render();});
root.addEventListener('pagehide',suspend139);
root.addEventListener('pageshow',event=>{if(event.persisted){ui.resolving=false;resolveEpoch139++;render();}});
 document.addEventListener('toggle',event=>{const detail=event.target?.dataset?.detail144;if(detail&&event.target.isConnected!==false){if(Progress144.detail(state.settings,detail,!!event.target.open))save();return;}const key=event.target?.dataset?.prepDetail;if(key){ui.prepOpen121=ui.prepOpen121||{};ui.prepOpen121[key]=event.target.open;}},true);
 root.addEventListener('error',event=>diagnostics146.error(event.error,'window'));
 root.addEventListener('unhandledrejection',event=>diagnostics146.error(event.reason,'promise'));
 safeStorage.subscribe(()=>paintSaveHealth121());
render();
if(loadNotice)toast(loadNotice);
root.KM_APP={diagnostics:()=>JSON.parse(diagnosticText146()),getState:()=>clone(state),export:()=>JSON.stringify(state),safeStorage,saveDiagnostics:()=>({...saveMetrics121,persistent:safeStorage.persistent}),getPage:()=>ui.page};
})(typeof globalThis!=='undefined'?globalThis:window);
