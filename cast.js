/* v101: mentors, five-chapter routes, final rivals and raster portrait delegation. */
(function(root){
'use strict';
const A=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);

const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const routes=root.KM_MENTOR_DATA||(typeof require==='function'?require('./mentor-data.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x));
const mentors=[
 {id:'hayase',name:'早瀬 怜',key:'speed',title:'直線の求道者',color:'#35bbdf',hair:0,quote:'速さは、迷わない一線から生まれる。'},
 {id:'tsukino',name:'月野 環',key:'turn',title:'弧を描く名手',color:'#b49bff',hair:1,quote:'入口より先に、出口を見なさい。'},
 {id:'kuzumi',name:'久住 刻',key:'start',title:'一瞬を読む眼',color:'#ffbf60',hair:2,quote:'針を追うな。自分の呼吸を刻め。'},
 {id:'akamine',name:'赤嶺 隼',key:'accel',title:'立ち上がりの匠',color:'#ff8875',hair:3,quote:'水をつかんだ一瞬で、前へ出ろ。'},
 {id:'iwase',name:'岩瀬 岳',key:'power',title:'荒波の守り手',color:'#57d4ab',hair:4,quote:'流されても、艇を見失うな。'}
];
const walls=[
 {id:'kurose',name:'黒瀬 零',key:'speed',title:'水平線の彼方',color:'#58cfff',hair:2,quote:'届くなら、追いかけてこい。'},
 {id:'shirakami',name:'白神 凛',key:'turn',title:'水面の支配者',color:'#d2a8ff',hair:1,quote:'この水面に、私の知らない線はない。'},
 {id:'kagura',name:'神楽 瞬',key:'start',title:'零秒の王者',color:'#ffda85',hair:0,quote:'始まる前に、勝負は始まっている。'},
 {id:'raiden',name:'雷堂 迅',key:'accel',title:'波を裂く閃光',color:'#ff828f',hair:3,quote:'並んだ瞬間が、お前の最後のチャンスだ。'},
 {id:'onizuka',name:'鬼塚 巌',key:'power',title:'不動の砦',color:'#78efc7',hair:4,quote:'どんな波でも、俺はここにいる。'}
];
// Retain the retired identity for saves and archives; never draw it in a new season.
const retired=walls.splice(walls.findIndex(x=>x.id==='raiden'),1);
const all=[...mentors,...walls,...retired],map=Object.fromEntries(all.map(x=>[x.id,x]));
function ensure(c){if(!c.cast)c.cast={version:1,mentor:null,boss:null,mentorLocked:false,stages:[],schedule:null,duels:[],trained:0};return c.cast;}
function record(id){return {id,wins:0,losses:0};}
function select(c,id){const t=ensure(c);if(c.stage<2||t.mentorLocked||c.status!=='seriesIntro'||!mentors.some(x=>x.id===id))return false;t.mentor=record(id);t.route=null;A.ensure(c);return true;}
function setup(c){
 const t=ensure(c);if(c.stage>=2&&!t.mentor)t.mentor=record(mentors[S.hash(c.player.id+':mentor')%5].id);
 if(c.stage===8&&!t.boss)t.boss=record(walls[S.hash(c.player.id+':wall')%walls.length].id);
 A.ensure(c);if(t.stages.includes(c.stage))return;t.stages.push(c.stage);t.schedule=null;
 if(c.stage>=6&&c.stage<=7&&S.hash(c.player.id+':challenge:'+c.stage)%100<48){let round=3;if(c.story?.duel?.round===round)round=2;t.schedule={kind:'mentor',round};}
 if(c.stage===8){let round=4;if(c.story?.duel?.round===round)round=3;t.schedule={kind:'boss',round};}
}
function growth(c,key){const m=c.cast?.mentor;return m&&map[m.id].key===key?1.25:1;}
function train(c,key){if(growth(c,key)===1)return null;c.cast.trained++;return map[c.cast.mentor.id];}
// Fixed identities: no random skill lottery and no position-based catch-up power.
const loadouts={
 hayase:{stats:[97,82,80,88,82],skills:['comet','burst','straighten','push'],note:'舵を戻し 直線で伸ばす'},
 tsukino:{stats:[81,97,84,87,83],skills:['monkey_ur','split','slice','feather'],note:'小さく回り 出口で差す'},
 kuzumi:{stats:[83,86,97,87,81],skills:['zero','immune','inside','start_check'],note:'踏み込みから先手を守る'},
 akamine:{stats:[87,83,81,97,84],skills:['wit_latefee','burst','wake_escape','wit_rudder'],note:'引き波を抜け 再加速する'},
 iwase:{stats:[82,87,81,83,97],skills:['reflect','storm','anchor','rain'],note:'荒水面で姿勢を崩さない'},
 kurose:{stats:[120,82,82,88,84],skills:['legend_speed','wit_reply','straighten'],note:'直線 SS120 · 周回ごとに伸びを増す'},
 shirakami:{stats:[75,120,83,100,86],skills:['monkey_lr','split','feather'],note:'旋回 SS120 · 加速 S100 · 究極Vモンキー'},
 kagura:{stats:[84,88,120,89,83],skills:['doguchi_lr','inside','immune'],note:'スタート SS120 · 固有の先駆 −0.20秒 · 3周目は反動'},
 raiden:{stats:[98,93,89,100,94],skills:['legend_tide','wit_unposted','wit_latefee','burst','accel_lock','wake_escape'],note:'出口と終盤で追い詰める追撃型'},
 onizuka:{stats:[85,89,82,85,120],skills:['dump','wit_elbow','anchor','power_drain'],note:'フィジカル SS120 · 強い引き波と接触圧'}
};
function profile(c,kind,template){
 const entry=kind==='boss'?c.cast.boss:c.cast.mentor,def=map[entry.id],n=copy(template),easy=c.player.difficulty==='easy',spec=loadouts[def.id];
 n.id='cast_'+def.id;n.name=def.name;n.castId=def.id;n.castRole=kind;n.special=false;n.racePersona=kind==='boss'?'wall_'+def.key:'mentor';
 D.statKeys.forEach((k,i)=>n.stats[k]=spec.stats[i]-(easy&&k!==def.key?(kind==='boss'?5:4):0));
 n.skills=spec.skills.slice();n.mastery={};n.popularity=kind==='boss'?600:260;return n;
}
function lineUp(c,people,type){
 setup(c);const t=c.cast;if(t.mentor&&!t.mentorLocked){const st=S.ensure(c),p=map[t.mentor.id];st.log.push({index:++st.serial,stage:c.stage,kind:'event',title:'師匠との出会い',note:p.name+'「'+p.quote+'」',rewards:[D.stats[p.key]+'の練習を指導']});st.log=st.log.slice(-72);}t.mentorLocked=!!t.mentor;
 const kind=c.stage===8&&type==='championship'?'boss':type==='qualifier'&&t.schedule?.round===c.series.round?t.schedule.kind:null;
 if(!kind)return people;
 // Keep the player, registered guests and the scheduled rival; replace one ordinary NPC.
 const group=people.slice(),lastIndex=test=>{for(let i=group.length-1;i>=0;i--)if(test(group[i]))return i;return -1;};let slot=lastIndex(n=>n.id!==c.player.id&&!n.special&&n.id!==c.story?.duel?.rivalId);
 if(slot<0)slot=lastIndex(n=>n.id!==c.player.id&&!n.special);if(slot<0)return people;
 const original=group[slot],def=map[(kind==='boss'?t.boss:t.mentor).id],existing=c.series.npcs.find(n=>n.id==='cast_'+def.id);if(group.some(n=>n.id==='cast_'+def.id)){const gi=group.findIndex(n=>n.id==='cast_'+def.id),n=profile(c,kind,group[gi]),ri=c.series.npcs.findIndex(p=>p.id===n.id);group[gi]=n;if(ri>=0)c.series.npcs[ri]=copy(n);return group;}const n=profile(c,kind,existing||original);group[slot]=n;
 // The selected cast member occupies the same roster slot, preserving 20 participants / 5 starts.
 const ri=c.series.npcs.findIndex(p=>p.id===(existing?existing.id:original.id));if(ri>=0)c.series.npcs[ri]=copy(n);
 return group;
}
function attach(c,r){const n=r.runners.filter(x=>!x.special&&x.castRole&&map[x.castId]&&c.cast?.[x.castRole==='boss'?'boss':'mentor']?.id===x.castId).sort((a,b)=>Number(b.castRole==='boss')-Number(a.castRole==='boss'))[0];if(!n)return;
 const t=ensure(c);if(t.duels.some(x=>x.raceId===r.id))return;
 const z={raceId:r.id,id:n.castId,kind:n.castRole,status:'active'};t.duels.push(z);r.castDuel={id:n.id,castId:n.castId,kind:n.castRole};
}
function settle(c,r,result,api){
 const t=c.cast,q=t?.duels.find(x=>x.raceId===r.id);if(!q||q.status!=='active')return null;q.status='settled';
 const def=map[q.id],me=result.finish.find(x=>x.isPlayer),op=result.finish.find(x=>x.id==='cast_'+q.id);
 const won=!!me&&!!op&&!me.startFault&&!me.capsized&&!me.dnf&&me.place<op.place,entry=q.kind==='boss'?t.boss:t.mentor;entry[won?'wins':'losses']++;
 const z={kind:q.kind,id:q.id,name:def.name,won,money:0,skill:null};
 if(won){z.money=q.kind==='boss'?(r.type==='championship'?300:120):60;const p=c.player;p.money+=z.money;p.totalEarnings+=z.money;
  const rar=api.rewardRarity(p,q.kind==='boss'?(r.type==='championship'?'LR':'UR'):'SSR');let pool=D.abilities.filter(a=>!a.exclusive&&a.rarity===rar&&a.category!=='弱点'&&!p.skills.includes(a.id));if(!pool.length)pool=D.abilities.filter(a=>!a.exclusive&&a.rarity===rar&&a.category!=='弱点');
  const id=pool[S.hash(r.id+':castReward')%pool.length]?.id;if(id){z.skill=id;result.acquired.push(api.acquire(c,p,id,q.kind==='boss'?'最強の壁に先着':'師匠に先着'));}
 }
 result.castDuel=z;const st=S.ensure(c);st.log.push({index:++st.serial,stage:c.stage,kind:'duelResult',title:(q.kind==='boss'?'最強の壁':'師匠')+(won?'を越えた':'との一戦'),note:def.name+'「'+(won?'今日の航跡は、お前のものだ。':def.quote)+'」',rewards:[]});
 st.log[st.log.length-1].rewards=won?[z.money+'万円',D.abilityMap[z.skill]?.name].filter(Boolean):[];st.log=st.log.slice(-72);return z;
}
function routeState(c){const t=ensure(c),id=t.mentor?.id;if(!id)return null;if(!t.route)t.route={id,step:0,nextAt:0,choices:[],log:[],pending:null,reward:null,rules:2,legacySteps:0};else if(!t.route.rules&&t.route.step<5){t.route.rules=2;t.route.legacySteps=t.route.step;}return t.route;}
function routeReward(c){const q=routeState(c),r=q&&routes[q.id];return r?(c.player.difficulty==='easy'?r.easyReward:r.reward):null;}
function routeGate(c){if(!c?.player||!c.cast?.mentor)return {open:false,reason:'G3から師匠に出会えます'};const q=routeState(c),r=routes[q.id],episode=r.chapters[q.step];
 if(!episode)return {open:false,completed:true,reason:q.reward?'伝授を受け 全5話を修了しました':'全5話終了 · 教えを受け継ぐ条件には届かず 今回の伝授はありません'};
 if(c.ending||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return {open:false,reason:c.ending?'今回の育成は終了しました':'レース後に話せます'};
 if(c.stage<episode.stage)return {open:false,reason:D.stages[episode.stage].name+'から続きが届きます'};
 if(c.stats.races<q.nextAt)return {open:false,reason:'あと'+(q.nextAt-c.stats.races)+'走で続きが届きます'};
 const affinity=A.gate(c,'mentor',q.id);if(q.step===4&&!affinity.open)return {open:false,affinity,reason:'最終話まで 好感度あと'+affinity.remaining+'。さらに信頼を深める必要があります。レースで上位を重ねましょう。'};
 return {open:true,episode,reason:'第'+(q.step+1)+'話を進められます'};
}
function routeOpen(c){const g=routeGate(c);if(!g.open)return null;const t=ensure(c),q=routeState(c);t.mentorLocked=true;if(q.step===4)A.unlock(c,'mentor',q.id);q.pending={key:q.id+':mentor:'+q.step+':'+c.stats.races,step:q.step,stamp:c.stats.races};return routeScene(c);}
function routeScene(c){const q=routeState(c),p=q?.pending;if(!p)return null;const ep=routes[q.id].chapters[p.step];return {...ep,key:p.key,mentor:map[q.id],step:p.step,previous:q.log.at(-1)||null};}
function routeChoose(c,key,index,api){const q=routeState(c),p=q?.pending,g=routeGate(c);if(!p||!g.open||p.key!==key||p.step!==q.step||p.stamp!==c.stats.races||!Number.isInteger(index))return null;const ch=g.episode.choices[index];if(!ch)return null;
 const person=map[q.id],stat=ch.key||person.key,before=Math.floor(c.player.stats[stat]);if(ch.aligned)api.growStat(c.player,stat,.25*1.5*api.statGrowthRate(c.player.stats[stat])*api.growthFactor(c.player));q.pending=null;q.choices.push(index);q.step++;q.nextAt=c.stats.races+2;
 let skill=null;const understood=q.choices.filter((v,i)=>i<(q.legacySteps||0)||routes[q.id].chapters[i].choices[v].aligned).length;if(q.step===5&&!q.reward&&ch.aligned&&understood>=4){const acquired=api.acquire(c,c.player,routeReward(c),person.name+'からの伝授');skill=acquired.id;q.reward={skill,stage:c.stage};}
 const z={kind:'mentorRoute',mentor:q.id,title:g.episode.title,note:ch.reply+(q.step===5?(skill?'\n教わった技を獲得した。':' 五話を終えたが、理解を積み重ねて最後の問いに答える条件には届かなかった。今回は伝授なし。この育成での師匠ルートは終了した。'):''),aligned:!!ch.aligned,choice:ch.label,stat,gain:Math.floor(c.player.stats[stat])-before,skill,races:c.stats.races,stage:c.stage};const affection=A.choice(c,'mentor',q.id,!!ch.aligned);z.affinity=affection;z.rewards=['好感度 '+(affection.delta>=0?'＋':'')+affection.delta];q.log.push(z);return copy(z);
}
function routeDepart(c){if(c.cast?.route)c.cast.route.pending=null;}
function validRoute(q,mentor){if(q===null||q===undefined)return true;const num=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b,str=(x,n)=>typeof x==='string'&&x.length<=n,r=routes[q.id];
 if(!r||q.id!==mentor?.id||!num(q.step,0,5)||!num(q.nextAt,0,1000)||!Array.isArray(q.choices)||q.choices.length!==q.step||!q.choices.every(v=>num(v,0,1))||!Array.isArray(q.log)||q.log.length!==q.step)return false;
 if(!q.log.every((l,i)=>l.mentor===q.id&&l.kind==='mentorRoute'&&l.title===r.chapters[i].title&&str(l.note,3000)&&str(l.choice,200)&&D.statKeys.includes(l.stat)&&num(l.gain,0,5)&&num(l.races,0,1000)&&num(l.stage,0,8)&&(!l.skill||[r.reward,r.easyReward].includes(l.skill))))return false;
 if(q.rules!==undefined&&(q.rules!==2||!num(q.legacySteps,0,Math.min(4,q.step))))return false;const score=q.choices.filter((v,i)=>i<(q.legacySteps||0)||r.chapters[i].choices[v].aligned).length,earned=q.step===5&&r.chapters[4].choices[q.choices[4]].aligned&&score>=4;if(q.reward?!(q.step===5&&[r.reward,r.easyReward].includes(q.reward.skill)&&num(q.reward.stage,0,8)&&(!q.rules||earned)):q.step===5&&(!q.rules||earned))return false;
 const p=q.pending;if(p&&(!str(p.key,120)||p.step!==q.step||q.step>=5||!num(p.stamp,0,1000)))return false;return true;
}

function valid(t){const count=v=>Number.isInteger(v)&&v>=0&&v<=60,entry=(v,list)=>v===null||v&&list.some(x=>x.id===v.id)&&count(v.wins)&&count(v.losses);
 return !!t&&validRoute(t.route,t.mentor)&&t.version===1&&typeof t.mentorLocked==='boolean'&&entry(t.mentor,mentors)&&entry(t.boss,[...walls,...retired])&&Number.isInteger(t.trained)&&t.trained>=0&&t.trained<=1000&&Array.isArray(t.stages)&&t.stages.length<=9&&t.stages.every(x=>Number.isInteger(x)&&x>=0&&x<=8)&&(!t.schedule||['mentor','boss'].includes(t.schedule.kind)&&[1,2,3,4].includes(t.schedule.round))&&Array.isArray(t.duels)&&t.duels.length<=12&&new Set(t.duels.map(x=>x.raceId)).size===t.duels.length&&t.duels.every(x=>typeof x.raceId==='string'&&x.raceId.length<110&&(x.kind==='boss'?[...walls,...retired]:mentors).some(d=>d.id===x.id)&&['mentor','boss'].includes(x.kind)&&['active','settled'].includes(x.status));
}
function portrait(id,large=false){const p=map[id];if(!p)return '';const P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);return P?P.render({...p,role:'cast'},large):'';}

const API={loadouts,routes,routeState,routeGate,routeReward,routeOpen,routeScene,routeChoose,routeDepart,validRoute,mentors,walls,retired,map,ensure,setup,select,growth,train,profile,lineUp,attach,settle,valid,portrait};root.KM_CAST=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
