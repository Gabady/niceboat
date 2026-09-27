/* v94: reward presentation only. Never awards prizes or runs story RNG. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const escape=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let page='title',host=null,timer=null,lastPulse=-1e9,lastPriority=0,busyUntil=0;const pulseTimes=Object.create(null);
const patterns={contact:[18],boundary:[35],skill:[18,45,24],win:[30,65,35,65,70],rare:[35,70,35,100,90],duel:[30,70,50],speed:[12,35,12],ultra:[40,65,40,65,80],legend:[55,55,55,80,110],overtake:[20,35,45],exit:[18,35,22],finalLap:[24,50,55],setback:[22,90,22],surge:[35,50,35,80,100]};
function allowedPage(p,inRace=false){return !inRace&&!['race','replay','title','new'].includes(p);}
function pulse(kind,settings={},now=root.performance?.now?.()??Date.now()){
 if(!settings.haptics||!root.navigator?.vibrate||root.document?.hidden)return false;
 const priority=['legend','ultra','rare','surge'].includes(kind)?4:['contact','boundary'].includes(kind)?3:kind==='speed'?1:2;
 const gap=['contact','boundary'].includes(kind)?380:kind==='speed'?2400:['legend','ultra'].includes(kind)?1200:900;
 if(now-(pulseTimes[kind]??-1e9)<gap||(now<busyUntil&&priority<=lastPriority)||now-lastPulse<80&&priority<=lastPriority)return false;
 try{const pattern=patterns[kind]||patterns.skill,success=root.navigator.vibrate(pattern);if(success){lastPulse=now;pulseTimes[kind]=now;lastPriority=priority;busyUntil=now+pattern.reduce((a,b)=>a+b,0)+80;}return !!success;}catch(_){return false;}
}
function cancel(){if(timer){clearTimeout(timer);timer=null;}if(host){host.remove();host=null;}try{root.navigator?.vibrate?.(0);}catch(_){} }
function scene(value){if(value!==page)cancel();page=value;}
function show(info,settings={}){
 if(!root.document||!info||settings.presentation==='off'||!allowedPage(page,root.document.body.classList.contains('in-race'))||root.document.hidden)return false;
 cancel();const reduce=settings.presentation==='short'||settings.motion===false||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const rarity=info.rarity||'SR',high=D.rarities.indexOf(rarity)>=4;
 host=root.document.createElement('div');host.className='reward-showcase '+(reduce?'short ':'')+(high?'prestige ':'')+rarity.toLowerCase()+' '+(info.tone||'');host.setAttribute('role','status');host.setAttribute('aria-live','polite');
 host.innerHTML='<div class="reward-veil"></div><div class="reward-rays"></div><div class="reward-shards" aria-hidden="true">'+Array.from({length:reduce?0:info.tone==='surge'?30:18},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</div><article class="reward-focus"><span class="reward-kicker">'+escape(info.kicker||'水面がつないだ、次の一歩')+'</span>'+(info.portrait||'<div class="reward-medallion" aria-hidden="true">✦</div>')+'<h2>'+escape(info.title)+'</h2><p>'+escape(info.note||'')+'</p>'+(info.reward?'<strong class="reward-earned">'+escape(info.reward)+'</strong>':'')+'<button type="button" class="reward-skip">閉じる</button></article>';
 root.document.body.appendChild(host);host.addEventListener('click',cancel,{once:true});timer=setTimeout(cancel,reduce?850:info.tone==='surge'?2700:high?2300:1700);
 if(!reduce)pulse(info.kind||'win',settings);root.KM_AUDIO?.effect(info.kind==='win'?'finish':'skill');return true;
}
function resultInfo(z,dramatic){
 if(!z)return null;
 const best=(z.acquired||[]).slice().sort((a,b)=>D.rarities.indexOf(D.abilityMap[b.id]?.rarity)-D.rarities.indexOf(D.abilityMap[a.id]?.rarity))[0],a=best&&D.abilityMap[best.id];
 if(z.castDuel?.won)return {kind:'rare',kicker:z.castDuel.kind==='boss'?'最強の壁、突破':'師匠との約束',title:z.castDuel.name+'に先着',note:'積み重ねた走りが、届いた。',reward:z.castDuel.money+'万円 ＋ '+(D.abilityMap[z.castDuel.skill]?.name||''),rarity:z.castDuel.kind==='boss'?'LR':'UR'};
 if(z.duel?.won)return {kind:'duel',kicker:'好敵手との一戦',title:'ライバルに先着',note:z.duel.rivalName+'との対決に勝利',reward:z.duel.money+'万円'+(z.duel.skill?' ＋ '+D.abilityMap[z.duel.skill].name:''),rarity:a?.rarity||'SR'};
 if(a)return {kind:D.rarities.indexOf(a.rarity)>=4?'rare':'skill',kicker:a.rarity+' / '+(best.duplicate?'熟練が深まる':'新しい力'),title:a.name,note:best.source,reward:best.duplicate?'習熟 Lv.'+best.level:'特殊能力を獲得',rarity:a.rarity};
 if(dramatic)return {kind:'win',kicker:'最後まで、譲らなかった。',title:'DramaticRace',note:dramatic,rarity:'SSR'};
 if(z.place===1&&!z.capsized&&!z.dnf&&!z.startFault)return {kind:'win',kicker:z.type==='championship'?'シリーズ制覇':'水面に、名前を刻む。',title:z.type==='championship'?'優勝':'1着',note:'走りと準備が、結果につながった。',rarity:z.type==='championship'?'SSR':'SR'};
 if(z.weakness?.cured)return {kind:'skill',title:'弱点を克服',note:D.abilityMap[z.weakness.cured]?.name||'',rarity:'SR'};
 return null;
}
const API={scene,cancel,show,pulse,allowedPage,resultInfo,supported:()=>!!root.navigator?.vibrate};
root.KM_PRESENTATION=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(root.document){root.document.addEventListener('visibilitychange',()=>{if(root.document.hidden)cancel();});root.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&host)cancel();});root.addEventListener?.('pagehide',cancel);}
})(typeof globalThis!=='undefined'?globalThis:window);
