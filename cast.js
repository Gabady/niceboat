/* v95: career mentors and the final wall. Pure calculations, original SVG portraits. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
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
const all=[...mentors,...walls],map=Object.fromEntries(all.map(x=>[x.id,x]));
function ensure(c){if(!c.cast)c.cast={version:1,mentor:null,boss:null,mentorLocked:false,stages:[],schedule:null,duels:[],trained:0};return c.cast;}
function record(id){return {id,wins:0,losses:0};}
function select(c,id){const t=ensure(c);if(c.stage<2||t.mentorLocked||c.status!=='seriesIntro'||!mentors.some(x=>x.id===id))return false;t.mentor=record(id);return true;}
function setup(c){
 const t=ensure(c);if(c.stage>=2&&!t.mentor)t.mentor=record(mentors[S.hash(c.player.id+':mentor')%5].id);
 if(c.stage===8&&!t.boss)t.boss=record(walls[S.hash(c.player.id+':wall')%5].id);
 if(t.stages.includes(c.stage))return;t.stages.push(c.stage);t.schedule=null;
 if(c.stage>=6&&c.stage<=7&&S.hash(c.player.id+':challenge:'+c.stage)%100<48){let round=3;if(c.story?.duel?.round===round)round=2;t.schedule={kind:'mentor',round};}
 if(c.stage===8){let round=4;if(c.story?.duel?.round===round)round=3;t.schedule={kind:'boss',round};}
}
function growth(c,key){const m=c.cast?.mentor;return m&&map[m.id].key===key?1.25:1;}
function train(c,key){if(growth(c,key)===1)return null;c.cast.trained++;return map[c.cast.mentor.id];}
function profile(c,kind,template){
 const entry=kind==='boss'?c.cast.boss:c.cast.mentor,def=map[entry.id],n=copy(template),easy=c.player.difficulty==='easy';
 n.id='cast_'+def.id;n.name=def.name;n.castId=def.id;n.castRole=kind;n.special=false;
 for(const [i,k] of D.statKeys.entries())n.stats[k]=k===def.key?(kind==='boss'?100:94):(kind==='boss'?(easy?79:85)+(S.hash(def.id+k)%6):Math.min(90,Math.max(easy?69:75,n.stats[k])));
 const phases={speed:[2,4],turn:[1,3],start:[0],accel:[1,2,4],power:[0,1,3,4]}[def.key];
 const usable=D.abilities.filter(a=>!a.exclusive&&a.category!=='弱点'&&a.type!=='extra'&&a.type!=='growth'&&a.type!=='tuning'&&a.type!=='prep');
 n.skills=[];for(const rarity of kind==='boss'?['LR','UR','SSR','SR']:['UR','SSR','SR']){
  let pool=usable.filter(a=>a.rarity===(easy&&rarity==='UR'?'SSR':rarity)&&!n.skills.includes(a.id));
  const suited=pool.filter(a=>(a.phases||[]).some(p=>phases.includes(p)));if(suited.length)pool=suited;
  if(pool.length)n.skills.push(pool[S.hash(def.id+rarity)%pool.length].id);
 }
 n.mastery={};n.popularity=kind==='boss'?600:260;return n;
}
function lineUp(c,people,type){
 setup(c);const t=c.cast;if(t.mentor&&!t.mentorLocked){const st=S.ensure(c),p=map[t.mentor.id];st.log.push({index:++st.serial,stage:c.stage,kind:'event',title:'師匠との出会い',note:p.name+'「'+p.quote+'」',rewards:[D.stats[p.key]+'の練習を指導']});st.log=st.log.slice(-72);}t.mentorLocked=!!t.mentor;
 const kind=c.stage===8&&type==='championship'?'boss':type==='qualifier'&&t.schedule?.round===c.series.round?t.schedule.kind:null;
 if(!kind)return people;
 // Keep the player, registered guests and the scheduled rival; replace one ordinary NPC.
 const group=people.slice(),lastIndex=test=>{for(let i=group.length-1;i>=0;i--)if(test(group[i]))return i;return -1;};let slot=lastIndex(n=>n.id!==c.player.id&&!n.special&&n.id!==c.story?.duel?.rivalId);
 if(slot<0)slot=lastIndex(n=>n.id!==c.player.id&&!n.special);if(slot<0)return people;
 const original=group[slot],def=map[(kind==='boss'?t.boss:t.mentor).id],existing=c.series.npcs.find(n=>n.id==='cast_'+def.id);if(group.some(n=>n.id==='cast_'+def.id))return group;const n=existing||profile(c,kind,original);group[slot]=n;
 // The selected cast member occupies the same roster slot, preserving 20 participants / 5 starts.
 const ri=c.series.npcs.findIndex(p=>p.id===original.id);if(ri>=0&&!existing)c.series.npcs[ri]=copy(n);
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
function valid(t){const count=v=>Number.isInteger(v)&&v>=0&&v<=60,entry=(v,list)=>v===null||v&&list.some(x=>x.id===v.id)&&count(v.wins)&&count(v.losses);
 return !!t&&t.version===1&&typeof t.mentorLocked==='boolean'&&entry(t.mentor,mentors)&&entry(t.boss,walls)&&Number.isInteger(t.trained)&&t.trained>=0&&t.trained<=1000&&Array.isArray(t.stages)&&t.stages.length<=9&&t.stages.every(x=>Number.isInteger(x)&&x>=0&&x<=8)&&(!t.schedule||['mentor','boss'].includes(t.schedule.kind)&&[1,2,3,4].includes(t.schedule.round))&&Array.isArray(t.duels)&&t.duels.length<=12&&new Set(t.duels.map(x=>x.raceId)).size===t.duels.length&&t.duels.every(x=>typeof x.raceId==='string'&&x.raceId.length<110&&(x.kind==='boss'?walls:mentors).some(d=>d.id===x.id)&&['mentor','boss'].includes(x.kind)&&['active','settled'].includes(x.status));
}
function portrait(id,large=false){const p=map[id];if(!p)return '';const P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);return P?P.render({...p,role:'cast'},large):'';}

const API={mentors,walls,map,ensure,setup,select,growth,train,profile,lineUp,attach,settle,valid,portrait};root.KM_CAST=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
