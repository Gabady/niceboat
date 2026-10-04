


/* v97: restrained metallic reward presentation only. Never awards prizes or runs story RNG. */
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
function medalSVG(kind='win',rarity='SR'){
 const silver=rarity==='LR',light=silver?'#f2f7fc':'#fff1c8',middle=silver?'#9fb5c7':'#c8a96a',dark=silver?'#52697c':'#715332';
 let leaves='';for(const side of [-1,1])for(let i=0;i<6;i++){const x=96+side*(49+Math.sin(i*.42)*9),y=112-i*12;leaves+='<path d="M'+x+' '+y+'q'+side*13+' -3 '+side*8+' -13q'+(-side*11)+' 3 '+(-side*8)+' 13Z" fill="url(#reward-metal)" opacity="'+(.62+i*.045)+'"/>';}
 const symbol=kind==='win'||kind==='duel'?'<path d="M73 61l7 17h32l7-17-14 9-9-18-9 18Z" fill="url(#reward-metal)"/><path d="M80 84h32M86 90h20" stroke="url(#reward-metal)" stroke-width="2.5"/>':'<path d="M71 78l47-18-11 22-29 8Z" fill="url(#reward-metal)"/><path d="M76 96q12-5 21-2t20-3M80 102q12-4 20-1" fill="none" stroke="url(#reward-metal)" stroke-width="1.5"/>';
 return '<svg class="reward-emblem" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 154" aria-hidden="true"><defs><linearGradient id="reward-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+dark+'"/><stop offset=".22" stop-color="'+light+'"/><stop offset=".45" stop-color="'+middle+'"/><stop offset=".59" stop-color="'+light+'"/><stop offset=".76" stop-color="'+dark+'"/><stop offset="1" stop-color="'+middle+'"/></linearGradient><radialGradient id="reward-enamel"><stop stop-color="#294253"/><stop offset=".75" stop-color="#102634"/><stop offset="1" stop-color="#061722"/></radialGradient></defs><circle cx="96" cy="77" r="48" fill="url(#reward-enamel)" stroke="url(#reward-metal)" stroke-width="1.8"/><circle cx="96" cy="77" r="43" fill="none" stroke="'+middle+'" stroke-width=".5" opacity=".50"/><path d="M64 32a49 49 0 0 1 64 0M64 121a49 49 0 0 0 64 0" fill="none" stroke="'+light+'" opacity=".55"/>'+leaves+'<path d="M73 127q-30-13-30-61M119 127q30-13 30-61" fill="none" stroke="'+middle+'" stroke-width=".8"/>'+symbol+'<path d="M96 17l2 5-2 5-2-5Z" fill="'+light+'"/><path d="M84 136h24" stroke="'+middle+'" stroke-width=".8"/></svg>';
}
function rewardMarkup(info,reduce=false){
 const rarity=D.rarities.includes(info.rarity)?info.rarity:'SR',high=D.rarities.indexOf(rarity)>=4,count=reduce||info.tone==='setback'?0:info.tone==='surge'?16:high?12:8;
 const foil=Array.from({length:count},(_,i)=>{const x=7+(i*37)%87,y=8+(i*23)%59,drift=(i%2?1:-1)*(22+i%4*11);return '<i style="--x:'+x+'%;--y:'+y+'%;--drift:'+drift+'px;--delay:'+(i*.055).toFixed(3)+'s;--turn:'+(i*43%150-75)+'deg;--size:'+(i%3+3)+'px"></i>';}).join('');
 return '<div class="reward-veil"></div><div class="reward-aura" aria-hidden="true"></div><div class="reward-foil" aria-hidden="true">'+foil+'</div><article class="reward-focus"><div class="reward-hairline" aria-hidden="true"></div><span class="reward-kicker">'+escape(info.kicker||'積み重ねた走り、その証')+'</span><div class="reward-mark">'+(info.portrait||medalSVG(info.kind,rarity))+'</div><h2>'+escape(info.title)+'</h2><p>'+escape(info.note||'')+'</p>'+(info.reward?'<strong class="reward-earned">'+escape(info.reward)+'</strong>':'')+'<div class="reward-rule" aria-hidden="true"></div><button type="button" class="reward-skip">閉じる</button></article>';
}

function show(info,settings={}){
 if(!root.document||!info||settings.presentation==='off'||!allowedPage(page,root.document.body.classList.contains('in-race'))||root.document.hidden)return false;
 cancel();const reduce=settings.presentation==='short'||settings.motion===false||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const rarity=D.rarities.includes(info.rarity)?info.rarity:'SR',high=D.rarities.indexOf(rarity)>=4,duration=reduce?850:info.tone==='surge'?2700:high?2300:1700;
 host=root.document.createElement('div');host.className='reward-showcase '+(reduce?'short ':'')+(high?'prestige ':'')+rarity.toLowerCase()+' '+(['surge','setback'].includes(info.tone)?info.tone:'');host.setAttribute('role','status');host.setAttribute('aria-live','polite');
 host.style?.setProperty('--duration',duration+'ms');host.innerHTML=rewardMarkup(info,reduce);
 root.document.body.appendChild(host);host.addEventListener('click',cancel,{once:true});timer=setTimeout(cancel,duration);
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
const API={medalSVG,rewardMarkup,scene,cancel,show,pulse,allowedPage,resultInfo,supported:()=>!!root.navigator?.vibrate};
root.KM_PRESENTATION=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(root.document){root.document.addEventListener('visibilitychange',()=>{if(root.document.hidden)cancel();});root.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&host)cancel();});root.addEventListener?.('pagehide',cancel);}
})(typeof globalThis!=='undefined'?globalThis:window);



