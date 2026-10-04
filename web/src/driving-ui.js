


/* 競艇物語 V125 — mobile controls, fixed-step loop, concise HUD and peripheral water spray. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const T=root.KM_THRILL||(typeof require==='function'?require('./thrill.js'):null);
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=t=>t===null?'—':Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+'.'+Math.floor(t*10%10);
const button=(text,action,cls='')=>'<button type="button" class="drive-button '+cls+'" data-drive="'+action+'">'+text+'</button>';
// One clockwise revolution takes 12 seconds; zero is exactly at the upper tick.
const startClockAngle=t=>t*30;
function clockGuide(d,b,r){const f=R.launchForecast(d,b,r);return {center:(R.raceTime(d)+f.launchIn+R.startTarget(b,r))*30,width:Math.max(2,f.uncertainty*30),precision:f.precision};}
function guidePath(center,width){const pt=a=>{const r=a*Math.PI/180;return [60+46*Math.sin(r),60-46*Math.cos(r)];},a=pt(center-width/2),b=pt(center+width/2);return 'M'+a.join(' ')+' A46 46 0 0 1 '+b.join(' ');}
function startClockView(t,id='start-clock-needle',guide=null){
 const ticks=Array.from({length:12},(_,i)=>'<line x1="60" y1="12" x2="60" y2="'+(i%3===0?23:18)+'" transform="rotate('+i*30+' 60 60)"/>').join('');
 return '<svg class="start-clock" viewBox="0 0 120 120" role="img" aria-label="12秒針。針が頂点へ戻るとスタート"><circle cx="60" cy="60" r="55" class="clock-face"/><g class="clock-ticks">'+ticks+'</g><path class="clock-guide" id="'+id+'-guide" d="'+(guide?guidePath(guide.center,guide.width):'')+'"/><path d="M55 6L60 14L65 6" class="clock-zero"/><text x="60" y="34">START</text><text x="94" y="64">3</text><text x="60" y="99">6</text><text x="26" y="64">9</text><g id="'+id+'" transform="rotate('+startClockAngle(t)+' 60 60)"><path d="M60 68V17" class="clock-hand"/><path d="M56 23L60 15L64 23" class="clock-zero"/></g><circle cx="60" cy="60" r="4" class="clock-hub"/><text x="60" y="81">12秒針</text></svg>';
}
function minimapPoint(x,z){return {x:100+x*85/(R.C.halfStraight+R.C.outer),y:62+z*48/R.C.outer};}
function mapPath(){return Array.from({length:81},(_,i)=>{const p=R.pointAt(R.C.length*i/80,R.C.inner+10),m=minimapPoint(p.x,p.z);return (i?'L':'M')+m.x+' '+m.y;}).join(' ')+'Z';}
function mapLabels(d){
 const used=[];return R.ranks(d).map((b,index)=>{const p=minimapPoint(b.x,b.z);let x=p.x,y=p.y;
  // Place upright labels outside the central standings, then separate close labels.
  if(x>54&&x<146&&y>39&&y<84)y=y<62?32:94;
  for(let k=0;k<12;k++){const close=used.find(a=>Math.abs(a.x-x)<14&&Math.abs(a.y-y)<14);if(!close)break;y+=y<62?-13:13;if(y<10||y>114){x+=x<100?-13:13;y=R.clamp(p.y,12,112);}}
  x=R.clamp(x,8,192);y=R.clamp(y,9,115);used.push({x,y});return {id:b.id,frame:b.frame,x,y,px:p.x,py:p.y,rank:index+1,startFault:b.startFault,capsized:b.capsized,dnf:b.dnf,isPlayer:b.isPlayer};
 });
}
function steerFromPointer(clientX,rect,sensitivity=1){return R.clamp((clientX-(rect.left+rect.width/2))/(rect.width*.39)*sensitivity,-1,1);}
function steerDrag(initial,delta,width){return R.clamp(initial+delta/Math.max(48,width*.32),-1,1);}
function postureDrag(initial,deltaY,height){
 return R.clamp(R.postureStep(initial)-(Number.isFinite(deltaY)?Math.trunc(deltaY/24):0),-1,1);
}
function postureDisplay(b,r,assist=false){
 const actual=R.clamp(Number(b.posture)||0,-1,1),target=R.clamp(Number(b.postureTarget)||0,-1,1),recommended=R.postureTarget(b,r);
 return {actual,target,label:actual<-.35?'伏せ':actual>.35?'起こす':'中立',guide:b.startTime===null?'助走中':recommended>0?'旋回は起こす':recommended<0?'直線は伏せる':'荒水面は中立',assist};
}
function steeringDisplay(b,p,wanted){const limits=R.steeringLimits(b,p);return {actual:b.steer,requested:R.clamp(wanted,-1,1),limit:limits.limit,load:limits.load,label:limits.load>1.1?'舵が重い':limits.load>.45?'水圧あり':'舵は軽め'};}
function signatureCaption(event){return event.variant==='boost'?'1周目 · 出力上昇':event.variant==='recoil'?'3周目 · 反動':event.variant==='pivot'?(event.lap||1)+'周目 · 全速旋回':'';}
const FX_THRESHOLDS={speedKmh:48,wind:6,rain:.6};
function effectLevels(d,r){
 const b=R.own(d),kmh=b.speed*3.6,wind=r.env.windSpeed||0,rain=r.env.weather==='雨'?.65+wind*.025:0;
 const rough=R.clamp(wind*.06+(rain?.24:0)+(r.venue?.roughness||0)*.28+R.clamp(b.wakeLoad||0,0,1)*.36,0,1);
 const ramp=R.clamp((kmh-24)/52,0,1),planing=ramp*ramp*(3-2*ramp),fast=R.clamp((kmh-FX_THRESHOLDS.speedKmh)/40,0,1);
 return {speed:fast*fast*(3-2*fast),
  wind:wind>=FX_THRESHOLDS.wind?R.clamp(.2+(wind-6)*.2,0,1):0,rain:rain>=FX_THRESHOLDS.rain?rain:0,
  spray:planing*(.35+rough*.65),rough,
  side:r.env.wind==='横風'?1:r.env.wind==='向かい風'?-.3:.25};
}
// Rain and hull spray only: deterministic, no screen-space speed lines or neon edges.
function paintWeather(ctx,w,h,levels,time,motion=true,quality='full'){
 ctx.clearRect(0,0,w,h);if(quality==='off')return 0;
 const t=Number.isFinite(time)?time:0,frac=n=>n-Math.floor(n),soft=quality==='soft';let count=0;
 function line(x,y,dx,dy,alpha,width=1){ctx.strokeStyle='rgba(216,232,234,'+alpha+')';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();count++;}
 // Reduced motion keeps the overcast sky and wet water; frozen lines would resemble scratches.
 if(!motion)return count;
 if(levels.rain){const density=R.clamp(levels.rain,0,1),drift=R.clamp(levels.side||0,-1,1)*(6+(levels.wind||0)*12),area=R.clamp(w*h/(393*852),.7,1.8);
  // Separate far, middle and near rain with different lengths/speeds. Soften the sight line.
  for(let layer=0;layer<3;layer++){const n=Math.floor(([26,20,11][layer]+density*7)*area*(soft?.55:1));
   for(let i=0;i<n;i++){const seed=i+layer*173,p=frac(seed*.754877+Math.sin(seed*1.7)*.11),fall=.34+layer*.33+frac(seed*.56984)*.13;
    const x=frac(seed*.618034-t*drift*.0011*(.65+layer*.4))*w,y=frac(p+t*fall)*(h+48)-24;
    const focus=(x>w*.24&&x<w*.76&&y>h*.30&&y<h*.64)?.34:1,edge=layer===2&&Math.abs(x/w-.5)<.28?.35:1;
    line(x,y,-drift*(.4+layer*.32),(5+layer*7+frac(seed*.4142)*6)*(.8+density*.35),[.10,.16,.23][layer]*focus*edge*(soft?.8:1),[.55,.75,1.05][layer]);
   }
  }
 }
 if(levels.spray>0){
  // A thin, short-lived spray sheds from the hull into the lower outer edges.
  // Keep droplets away from the racing line; no opaque screen-sized foam or stored particles.
  const energy=R.clamp(levels.spray,0,1),n=soft?10:24,scale=R.clamp(Math.min(w,h)/393,.8,1.55);
  for(let i=0;i<n;i++){
   const side=i%2?1:-1,seed=i+31,life=.30+frac(seed*.56984)*.22,age=frac(t/life+seed*.618034);
   const fade=Math.sin(age*Math.PI)*(soft?.62:1)*energy,spread=.31+frac(seed*.754877)*.06+age*.14;
   const lift=.43+frac(seed*.41421)*.16,x=w*(.5+side*spread),y=h*(.92-lift*age+.46*age*age);
   if(x<0||x>w||fade<.003)continue;
   const size=(.8+frac(seed*.27183)*1.55)*scale,dx=side*size*(.6+age),dy=size*(-.9+age*2.2);
   line(x,y,dx,dy,.32*fade,(.55+frac(seed*.14142)*.60)*scale);
  }
 }
 return count;
}
function attachControlEvents(inputRoot,el,handlers,on){
 const {begin,move,release}=handlers;
 if(inputRoot.PointerEvent){
  on(el,'pointerdown',e=>{if(!begin(e))return;e.preventDefault();try{el.setPointerCapture?.(e.pointerId);}catch(_){/* Global release clears input even without capture. */}},{passive:false});
  on(el,'pointermove',e=>{if(move(e))e.preventDefault();},{passive:false});
  ['pointerup','pointercancel'].forEach(t=>on(inputRoot,t,release));on(el,'lostpointercapture',release);
 }else{
  const packet=t=>({pointerId:'touch-'+t.identifier,clientX:t.clientX,clientY:t.clientY});
  on(el,'touchstart',e=>{if(e.changedTouches.length&&begin(packet(e.changedTouches[0])))e.preventDefault();},{passive:false});
  on(el,'touchmove',e=>{let used=false;Array.from(e.changedTouches).forEach(t=>{if(move(packet(t)))used=true;});if(used)e.preventDefault();},{passive:false});
  ['touchend','touchcancel'].forEach(type=>on(inputRoot,type,e=>Array.from(e.changedTouches).forEach(t=>release(packet(t)))));
  on(el,'mousedown',e=>{if(begin({pointerId:'mouse',clientX:e.clientX,clientY:e.clientY}))e.preventDefault();});
  on(inputRoot,'mousemove',e=>move({pointerId:'mouse',clientX:e.clientX,clientY:e.clientY}));on(inputRoot,'mouseup',()=>release({pointerId:'mouse'}));
 }
}
function view(r,title){const b=R.own(r.drive);return '<section class="drive-shell" id="drive-shell" aria-label="一人称ボートレース">'+
 '<canvas id="water-canvas" aria-label="船首から見た水面。左で左右に操舵し上下に姿勢を動かす。右で加速。離すと水の抵抗で減速。"></canvas><div class="drive-vignette"></div><canvas id="weather-fx" aria-hidden="true"></canvas><span class="weather-fx-label" id="weather-fx-label"></span>'+
 '<div class="drive-top"><div><span class="drive-eyebrow">'+esc(title)+' · '+esc(r.venue.name)+' · '+(r.difficulty==='easy'?'EASY':'NORMAL')+'</span><b><span class="mini-boat boat-'+b.frame+'">'+b.frame+'</span> '+esc(b.name)+'</b></div>'+button('Ⅱ','pause','pause-button')+'</div>'+
 '<div class="drive-metrics"><div><span>POSITION</span><strong id="drive-rank">—<small> / 6</small></strong></div><div><span>LAP</span><strong id="drive-lap">1<small> / 3</small></strong></div><div><span>SPEED</span><strong id="drive-speed">0<small> km/h</small></strong></div><div><span>TIME</span><b id="drive-time">0:00.0</b></div></div>'+
 '<div class="race-voices" id="race-voices" aria-live="polite"></div><div class="drive-duel" id="drive-duel"></div><div class="thrill-callout" id="thrill-callout" aria-live="polite"></div><div class="contact-feedback" id="contact-feedback" aria-hidden="true"></div><div class="drive-standings" id="drive-standings"></div><div class="drive-map" id="drive-map"><svg viewBox="0 0 200 124" aria-label="反時計回りのコースと6艇の現在順位"><path d="'+mapPath()+'" fill="none" stroke="#80c8c7" stroke-opacity=".35" stroke-width="15"/><path d="'+mapPath()+'" fill="none" stroke="#a9ded3" stroke-opacity=".75"/><text x="87" y="115" text-anchor="middle">START / GOAL →</text><text x="183" y="63" text-anchor="middle">1M</text><text x="100" y="20" text-anchor="middle">← BACK</text><text x="16" y="63" text-anchor="middle">2M</text><g id="map-leaders"></g><g id="map-markers"></g></svg><div class="map-ranking" id="map-ranking"></div><div class="drive-cutins" id="drive-cutins" aria-live="polite"></div></div>'+
 '<div class="opponent-labels" id="opponent-labels"></div><div class="drive-countdown" id="drive-countdown">'+startClockView(R.raceTime(r.drive),'start-clock-needle',clockGuide(r.drive,b,r))+'</div><div class="drive-warning" id="drive-warning"></div><div class="start-readout" id="start-readout" aria-live="polite"></div>'+
 '<div class="drive-telemetry"><span id="drive-zone">スタート</span><div class="stability-meter"><i id="stability-fill"></i></div><span id="drive-stability">安定</span></div>'+
 '<div id="water-forecast" class="water-forecast" aria-label="水面の予兆"></div><div id="drive-combos" class="drive-combos"></div><div class="drive-live"><span class="live-dot"></span><span id="drive-live-text" role="status">12秒針が頂点に戻るとスタート。早過ぎ・出遅れに注意。</span></div>'+
 '<div id="steer-hit-zone" class="steer-hit-zone" aria-hidden="true"></div><div id="throttle-hit-zone" class="throttle-hit-zone" aria-hidden="true"></div><div class="drive-controls"><div class="posture-panel" role="group" aria-label="姿勢を3段階で切り替え"><span class="posture-state" id="posture-state">姿勢 中立</span><span id="posture-guide"></span><i id="posture-mark"></i><i id="posture-request"></i><button id="posture-low" data-drive="posture:-1" aria-pressed="false">↓ 伏せる</button><button id="posture-neutral" data-drive="posture:0" aria-pressed="true">中立</button><button id="posture-high" data-drive="posture:1" aria-pressed="false">↑ 起こす</button></div><div class="steer-pad" id="steer-pad" role="slider" tabindex="0" aria-label="左右に操舵。上下に短く動かすと姿勢を1段切り替える" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"><span class="steer-left">←</span><span class="steer-right">→</span><div class="steer-groove"></div><div class="steer-range" id="steer-range"></div><div class="steer-request" id="steer-request"></div><div class="steer-knob" id="steer-knob"></div><small id="steer-load">舵は軽め</small></div><div class="pedals"><button class="pedal throttle" id="throttle-pedal" aria-label="押している間加速、離すと減速">加速<span>離すと減速</span></button></div></div>'+
 '<div class="drive-overlay" id="drive-overlay"></div></section>';}
function mount(r,settings,callbacks){
 const d=r.drive,shell=document.getElementById('drive-shell');if(!shell)return {destroy(){}};
 let canvas=document.getElementById('water-canvas'),renderer=null,raf=0,previous=0,accumulator=0,lastHUD=0,lastSave=0,lastPaint=0,disposed=false,finalizing=false,cutinUntil=0,cutinQueue=[],cutinShown=null,lastEvent=d.eventSequence-1,logCount=-1,lastHapticContact=R.own(d).metrics.contacts+R.own(d).metrics.boundaries,lastHapticSkill=R.own(d).activations.length;
 const thrillState=T.create(d);let thrillVisual={active:false},bannerKey='';
 let postureRevision=0;
 const input={steer:0,throttle:0,posture:R.postureStep(R.own(d).postureTarget)},keys=new Set(),pointers={steer:null,throttle:null},cleanups=[];
 const node=id=>document.getElementById(id),on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);cleanups.push(()=>target.removeEventListener(type,fn,opts));};
 const fxCanvas=node('weather-fx');let fxContext=null,lastFX=0;
 try{fxContext=fxCanvas.getContext('2d');}catch(_){/* Optional effects never block the water renderer. */}
 function weatherPaint(now){
  if(!fxContext||now-lastFX<32)return;lastFX=now;
  const w=shell.clientWidth,h=shell.clientHeight;if(!w||!h)return;
  const scale=Math.min(1.5,root.devicePixelRatio||1),rw=Math.round(w*scale),rh=Math.round(h*scale);
  if(fxCanvas.width!==rw||fxCanvas.height!==rh){fxCanvas.width=rw;fxCanvas.height=rh;}
  fxContext.setTransform(scale,0,0,scale,0,0);
  if(d.paused||d.finished)fxContext.clearRect(0,0,w,h);else paintWeather(fxContext,w,h,effectLevels(d,r),d.elapsed,motion,settings.raceFX||'full');
 }
 let motion=settings.motion!==false&&!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
 function resetInput(){input.steer=input.throttle=0;input.posture=R.postureStep(R.own(d).postureTarget);keys.clear();Object.keys(pointers).forEach(k=>pointers[k]=null);d.controls={steer:0,throttle:0,posture:input.posture};node('throttle-pedal').classList.remove('held');}
 function pause(){if(disposed)return;const changed=!d.paused;accumulator=0;previous=0;if(talkState)talkState.items=[];shell.classList.remove('speaking');talkKey='';node('race-voices').innerHTML='';root.KM_PRESENTATION?.cancel();d.paused=true;resetInput();cutinQueue=[];node('drive-cutins').innerHTML='';cutinShown=null;cutinUntil=0;if(changed)callbacks.save();overlay();}
 function debugHTML(){const p=R.own(d),perf=R.performance(p,d,r);return '<details class="drive-debug"><summary>実況・操船デバッグ</summary><p>カットイン待機数: '+cutinQueue.length+' / 対象能力: '+esc(cutinQueue.map(e=>D.abilityMap[e.abilityId].name).join(' / ')||'なし')+'</p>'+button('カットイン確認','cutin')+'<div class="drive-full-log">'+d.logs.slice(-24).map(l=>'<p><time>'+clock(l.time)+'</time> '+esc(l.text)+'</p>').join('')+'</div><pre>'+esc(JSON.stringify({audio:root.KM_AUDIO?.diagnostics(),waterForecast:root.KM_FEEDBACK.forecast(d,r),style:R.racingStyle(p),renderer:renderer?renderer.mode:'unavailable',rendererDiagnostic:renderer?.diagnostic||null,difficulty:r.difficulty||'normal',visualThresholds:{speedKmh:FX_THRESHOLDS.speedKmh,windKmh:R.kmh(FX_THRESHOLDS.wind),rain:FX_THRESHOLDS.rain},visualLevels:effectLevels(d,r),wakeResistance:perf.wakeResistance,turnDanger:R.turnDanger(p,perf,perf.grip*(1-Math.min(.26,p.wakeLoad*.19))),synergy:perf.synergy,posture:postureDisplay(p,r,settings.postureAssist),postureEffects:perf.posture,steering:steeringDisplay(p,perf,d.controls.steer),signature:p.signature,grade:R.raceGrade(r),pace:perf.pace,spectatorSpread:perf.spread,npcPace:D.npcPace,elapsed:d.elapsed,controls:d.controls,heading:p.heading,position:{x:p.x,z:p.z},progress:p.progress,checkpoints:p.checkpoints,speedKmh:R.kmh(p.speed),tilt:perf.tilt,grip:perf.grip,sideSpeedKmh:R.kmh(p.slip),wakeLoad:p.wakeLoad,startTime:p.startTime,startFault:p.startFault,launchForecast:R.launchForecast(d,p,r),stress:p.stress,phase:p.phase,activeEffects:p.effects,cutins:d.events.filter(e=>e.kind==='ability'&&D.rarities.indexOf(e.rarity)>=2).slice(-12).map(e=>({id:e.abilityId,boat:e.frame,time:e.t})),boats:d.boats.map(b=>({frame:b.frame,progress:b.progress,finishTime:b.finishTime,capsized:b.capsized,dnf:b.dnf,startTime:b.startTime,startFault:b.startFault,plan:b.plan,contacts:b.metrics.contacts,wakeSeconds:b.metrics.wakeSeconds})),interference:d.events.filter(e=>e.kind==='debuff').slice(-8)},null,2))+'</pre></details>';}
 function overlay(error){
  const area=node('drive-overlay');if(!d.paused&&!error&&!r.done){area.hidden=true;return;}area.hidden=false;
  const b=R.own(d);if(error){area.innerHTML='<div class="drive-dialog"><span class="drive-eyebrow">描画の準備</span><h2>レースは一時停止中</h2><p>'+esc(error)+'</p>'+button('描画を再開','retry','primary')+(r.done?'<button class="btn primary large" data-action="result">リザルトへ</button>':(R.requiresManual(r)?button('軽量表示で再開','light'):button('観戦モードに切り替える','skip')))+button('タイトルへ戻る','exit')+'</div>';return;}
  if(r.done){area.innerHTML='<div class="drive-dialog finish-dialog"><span class="drive-eyebrow">FINISH</span>'+(R.dramaticRace(d)?'<div class="dramatic-race"><strong>DramaticRace</strong><p>'+esc(R.dramaticRace(d))+'</p></div>':'')+'<h2>'+(b.capsized?'転覆':b.startFault==='F'?'フライング（F）':b.startFault==='L'?'出遅れ（L）':b.dnf?'リタイア':R.place(d,b)+'着')+'</h2><p>'+esc(b.name)+' · '+clock(b.finishTime)+'</p><button class="btn primary large" data-action="result">リザルトへ</button>'+debugHTML()+'</div>';return;}
  area.innerHTML='<div class="drive-dialog"><span class="drive-eyebrow">'+(r.drill?'PRACTICE':d.started?'PAUSED':'FIRST PERSON / 3 LAPS')+'</span><h2>'+(r.drill?'短い区間を、もう一度。':d.started?'水面で、ひと息。':'自分の手で、3周。')+'</h2><p class="drive-instructions"><b>左下を左右に動かして舵　姿勢は3段階</b><br>直線は伏せる、旋回は起こす。姿勢ボタンをタップ、または左下を上下に短く動かすと1段切り替え。指を離しても維持します。<br><b>右下を押し続けて加速</b><br>全開中は旋回でも速度を維持。姿勢だけで曲がれないときは、手前でアクセルを離します。ライン通過までは直進固定。時計が頂点でスタート、色帯は踏み始めの目安です。</p><details class="drive-start-tips"><summary>スタートのコツ</summary><p>スタート能力がA以上なら、早めの通過に少し余裕があります。B以下は時計が頂点に戻る前の通過でフライングです。ただし、早発を支える特殊能力がある場合は例外です。A以上でも、早すぎる通過はフライングになります。</p></details><div class="drive-mini-guide"><span>← 左回り</span><span>'+(r.drill?'練習区間で終了 · 成績には反映なし':'600m × 3周 · ブイの外を回る')+'</span></div>'+button(d.started?'操船を再開':'水面へ出る','resume','primary')+'<div class="drive-options"><label><input id="drive-posture-setting" type="checkbox"'+(settings.postureAssist?' checked':'')+'> 姿勢を自動で補助</label><label><input id="drive-haptics-setting" type="checkbox"'+(settings.haptics?' checked':'')+'> 接触・高速・能力の振動</label><label><input id="drive-guide-setting" type="checkbox"'+(settings.guide!==false?' checked':'')+'> 水面の進行ガイド</label><label><input id="drive-motion-setting" type="checkbox"'+(motion?' checked':'')+'> 視点の揺れ・雨風の動き</label><label><input id="drive-render-setting" type="checkbox"'+(renderer?.mode==='canvas'?' checked':'')+'> 軽量表示</label></div>'+(d.started?button('立て直す · 4秒停止','rescue'):'')+(r.drill?'<p>練習の結果は育成に反映されません。</p>':R.requiresManual(r)?'<p class="final-entry-note">決勝・準優勝戦は自分で操船します。</p>':button(d.started?'ここから観戦に切り替える':'観戦モードに切り替える','skip'))+'<div class="drive-menu-row">'+button(r.drill?'練習を選び直す':'タイトルへ','exit')+(d.started&&!r.drill?button('このレースをリタイア','retire'):'')+'</div><p class="drive-key-hint">PC: ← → / A D 操舵 · ↑ ↓ 姿勢 · W / Space 加速 · Esc 一時停止</p>'+debugHTML()+'</div>';
 }
 function setUpRenderer(forcedMode){
  if(renderer){renderer.destroy();renderer=null;}canvas=root.KM_RACE_RENDERER.freshCanvas(canvas);
  try{renderer=root.KM_RACE_RENDERER.create(canvas,{mode:forcedMode||settings.renderMode||'auto'});canvas=renderer.canvas;
   on(canvas,'webglcontextlost',e=>{e.preventDefault();d.paused=true;resetInput();setUpRenderer('canvas');callbacks.save();});
   overlay();return true;
  }catch(e){canvas=node('water-canvas');overlay(e.message);return false;}
 }

 function syncInput(){
  const keyboardSteer=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);

  return {steer:pointers.steer!==null?input.steer:keyboardSteer,posture:settings.postureAssist?R.postureTarget(R.own(d),r):input.posture,throttle:pointers.throttle!==null||keys.has(' ')||keys.has('w')?1:0};
 }
 function bindPointer(el,kind){
  let originX=0,originY=0,originSteer=0,originPosture=0,revision=0;
  const update=e=>{if(kind==='steer'){if(revision!==postureRevision){revision=postureRevision;originY=e.clientY;originPosture=input.posture;}input.steer=steerDrag(originSteer,e.clientX-originX,node('steer-pad').getBoundingClientRect().width);const dy=e.clientY-originY;if(Math.abs(dy)>=24){if(settings.postureAssist){settings.postureAssist=false;callbacks.save();}input.posture=postureDrag(originPosture,dy,shell.clientHeight||700);}}else{input[kind]=1;node('throttle-pedal').classList.add('held');}};
  const begin=e=>{if(d.paused||d.finished||pointers[kind]!==null||Object.values(pointers).includes(e.pointerId))return false;pointers[kind]=e.pointerId;if(kind==='steer'){revision=postureRevision;originX=e.clientX;originY=e.clientY;originSteer=R.own(d).steer;originPosture=settings.postureAssist?R.postureStep(R.own(d).postureTarget):input.posture;}update(e);return true;};
  const move=e=>{if(pointers[kind]!==e.pointerId)return false;update(e);return true;};
  const release=e=>{if(pointers[kind]!==e.pointerId)return;pointers[kind]=null;input[kind]=0;if(kind==='throttle')node('throttle-pedal').classList.remove('held');};
  attachControlEvents(root,el,{begin,move,release},on);
 }

 bindPointer(node('steer-hit-zone'),'steer');bindPointer(node('steer-pad'),'steer');bindPointer(node('throttle-pedal'),'throttle');bindPointer(node('throttle-hit-zone'),'throttle');
 on(root,'keydown',e=>{if(disposed||!document.getElementById('modal').hidden)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(key==='Escape'){e.preventDefault();pause();return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w',' '].includes(key)&&!d.paused){e.preventDefault();if((key==='ArrowUp'||key==='ArrowDown')&&settings.postureAssist){settings.postureAssist=false;callbacks.save();}if((key==='ArrowUp'||key==='ArrowDown')&&!e.repeat)input.posture=R.clamp(R.postureStep(input.posture)+(key==='ArrowUp'?1:-1),-1,1);keys.add(key);}});
 on(root,'keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));on(root,'blur',pause);
 on(document,'visibilitychange',()=>{if(document.hidden)pause();});on(root,'pagehide',pause);on(root,'orientationchange',pause);
 on(shell,'contextmenu',e=>e.preventDefault());
 on(shell,'click',e=>{const action=e.target.closest('[data-drive]')?.dataset.drive;if(!action)return;
  if(action.startsWith('posture:')){const value=Number(action.split(':')[1]);if(!d.paused&&!d.finished&&[-1,0,1].includes(value)){input.posture=value;postureRevision++;R.own(d).postureTarget=value;if(settings.postureAssist){settings.postureAssist=false;callbacks.save();}}return;}
  if(action==='pause'){pause();return;}
  if(action==='sound'){return;}
  if(action==='resume'){root.KM_PRESENTATION?.pulse('skill',settings);if(!renderer||renderer.isLost())return;d.paused=false;resetInput();accumulator=0;previous=0;overlay();callbacks.save();}
  if(action==='rescue'){R.rescue(d);d.paused=false;resetInput();overlay();callbacks.save();}
  if(action==='exit'){pause();callbacks.exit();}
  if(action==='light'){settings.renderMode='canvas';setUpRenderer('canvas');callbacks.save();}
  if(action==='skip'&&!R.requiresManual(r)){d.paused=true;resetInput();callbacks.skip();}
  if(action==='retire'){node('drive-overlay').innerHTML='<div class="drive-dialog"><h2>このレースをリタイアしますか？</h2><p>賞金とポイントは0になります。次のレースへ進めます。</p>'+button('レースへ戻る','pause','primary')+button('リタイアする','confirmRetire')+'</div>';}
  if(action==='confirmRetire'){const b=R.own(d);b.dnf=true;b.vx=b.vz=b.speed=0;d.finished=true;finish();}
  if(action==='retry'){setUpRenderer();}
  if(action==='cutin'){const b=R.own(d);node('drive-overlay').hidden=true;showCutin({abilityId:'mirror',frame:b.frame,name:b.name,t:d.elapsed});setTimeout(()=>{if(!disposed){overlay();}},1400);}
 });
 on(shell,'change',e=>{if(e.target.id==='drive-posture-setting'){settings.postureAssist=e.target.checked;input.posture=R.postureStep(R.own(d).postureTarget);callbacks.save();}if(e.target.id==='drive-haptics-setting'){settings.haptics=e.target.checked;if(!settings.haptics)root.KM_PRESENTATION?.cancel();callbacks.save();}if(e.target.id==='drive-guide-setting'){settings.guide=e.target.checked;callbacks.save();}if(e.target.id==='drive-motion-setting'){settings.motion=e.target.checked;motion=settings.motion&&!root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;callbacks.save();}if(e.target.id==='drive-render-setting'){settings.renderMode=e.target.checked?'canvas':'auto';setUpRenderer();callbacks.save();}});
 function showCutin(event){const a=D.abilityMap[event.abilityId];if(!a)return;node('drive-cutins').innerHTML='<div class="drive-cutin '+a.rarity.toLowerCase()+'"><div><span class="mini-boat boat-'+event.frame+'">'+event.frame+'</span><span>'+esc(event.name)+'</span><b>'+a.rarity+'</b></div><strong>'+esc(a.name)+'</strong><small>'+signatureCaption(event)+'</small></div>';cutinUntil=performance.now()+1200;cutinShown=event;}
 function updateEvents(now){
  const fresh=d.events.filter(e=>e.index>lastEvent);if(fresh.length)lastEvent=fresh[fresh.length-1].index;
  fresh.filter(e=>e.kind==='ability'&&D.rarities.indexOf(e.rarity)>=2).forEach(e=>cutinQueue.push(e));
  if(!d.paused&&fresh.some(e=>e.kind==='ability'&&e.athleteId===R.own(d).id&&D.rarities.indexOf(e.rarity)<4))root.KM_PRESENTATION?.pulse('skill',settings,now);
  cutinQueue=cutinQueue.filter(e=>d.elapsed-e.t<2.5).sort((a,b)=>Number(b.athleteId===R.own(d).id)-Number(a.athleteId===R.own(d).id)).slice(0,3);
  if(now>=cutinUntil){node('drive-cutins').innerHTML='';cutinShown=null;if(cutinQueue.length)showCutin(cutinQueue.shift());}
 }
 let talkState=null,talkKey='';
 function hud(now){shell.classList.toggle('start-phase',R.own(d).startTime===null);shell.classList.toggle('turn-phase',[1,3].includes(R.own(d).phase));
  const b=R.own(d),ranked=R.ranks(d),place=ranked.indexOf(b)+1,lap=Math.min(3,Math.floor(Math.max(0,b.progress)/R.C.length)+1);
  const hazards=root.KM_FEEDBACK.forecast(d,r);node('water-forecast').innerHTML=root.KM_FEEDBACK.meterHTML(hazards);root.KM_AUDIO?.update(d);
  thrillVisual=T.update(thrillState,d,r,settings,now);const banner=thrillVisual.banner,show=!!banner&&settings.raceFX!=='off',key=show?banner.title+thrillState.until:'';
  if(key!==bannerKey){bannerKey=key;const el=node('thrill-callout');el.className='thrill-callout '+(show?banner.tone:'')+(!motion||settings.raceFX==='soft'?' soft':'');el.innerHTML=show?'<small>'+esc(banner.note)+'</small><strong>'+esc(banner.title)+'</strong>':'';}
  node('contact-feedback').classList.toggle('touching',thrillVisual.active&&(thrillVisual.contact||thrillVisual.boundary)&&settings.raceFX!=='off');
  node('drive-speed').classList.toggle('speed-hot',thrillVisual.active&&thrillVisual.high&&settings.raceFX!=='off');
  const duel=r.castDuel||r.storyDuel,opponent=duel&&d.boats.find(n=>n.id===duel.id);node('drive-duel').innerHTML=opponent?(r.castDuel&&root.KM_CAST?root.KM_CAST.portrait(r.castDuel.castId):'')+'<span>'+esc(opponent.name)+'<small>'+(R.place(d,b)<R.place(d,opponent)?'あなたが先行':'追走中')+'</small></span>':'';

  const steering=steeringDisplay(b,R.performance(b,d,r),d.controls.steer),pad=node('steer-pad'),posture=postureDisplay(b,r,settings.postureAssist);
  for(const [id,value] of [['low',-1],['neutral',0],['high',1]])node('posture-'+id).setAttribute('aria-pressed',String(R.postureStep(posture.target)===value));
  node('posture-state').textContent=(posture.assist?'自動 ':'姿勢 ')+posture.label;node('posture-guide').textContent=posture.guide;node('posture-mark').style.top=(50-posture.actual*40)+'%';node('posture-request').style.top=(50-posture.target*40)+'%';pad.dataset.posture=posture.actual>.35?'high':posture.actual<-.35?'low':'neutral';
  node('steer-knob').style.left=(50+steering.actual*34)+'%';node('steer-request').style.left=(50+steering.requested*34)+'%';
  node('steer-range').style.left=(50-steering.limit*34)+'%';node('steer-range').style.width=(steering.limit*68)+'%';
  node('steer-load').textContent=b.startTime===null?'通過まで直進固定':steering.label;pad.classList.toggle('heavy',steering.load>1.1);
  pad.setAttribute('aria-valuenow',String(Math.round(steering.actual*100)));pad.setAttribute('aria-valuetext',steering.label+'。姿勢 '+posture.label+'。実際の舵 '+Math.round(steering.actual*100)+'、可動域 左右'+Math.floor(steering.limit*100));
  node('drive-rank').innerHTML=(b.startFault|| (b.capsized?'転':place))+'<small> / 6</small>';node('drive-lap').innerHTML=lap+'<small> / 3</small>';node('drive-speed').innerHTML=Math.floor(b.speed*3.6)+'<small> km/h</small>';node('drive-time').textContent=clock(b.finishTime===null?Math.max(0,R.raceTime(d)):b.finishTime);
  const phase=b.phase===4&&lap<3?'ホーム直線':D.phases[b.phase];node('drive-zone').textContent=(d.countdown>0?'助走':phase)+' · '+r.env.weather+' / '+r.env.wind+' '+R.speedText(r.env.windSpeed);
  const activeLinks=R.performance(b,d,r).synergy;node('drive-combos').textContent=activeLinks.length?'連携 '+activeLinks.map(id=>D.synergies.find(x=>x.id===id).name).join(' / '):'';node('drive-zone').title=activeLinks.map(id=>D.synergies.find(x=>x.id===id).name).join(' / ');
  const load=R.clamp(b.stress/2.8,0,1);node('stability-fill').style.width=(100-load*100)+'%';node('stability-fill').style.background=load>.45?'#ff9676':'#83e9cc';node('drive-stability').textContent=load>.6?'傾き大':b.slip>2.5?'滑り':'安定';
  node('drive-countdown').hidden=d.paused||R.raceTime(d)>=R.C.lateLimit;node('start-clock-needle').setAttribute('transform','rotate('+startClockAngle(R.raceTime(d))+' 60 60)');
  const startPanel=node('start-readout');
  const showStart=R.raceTime(d)<R.C.lateLimit;node('drive-map').style.visibility=showStart?'hidden':'';node('drive-map').classList.toggle('start-map',showStart);
  if(b.startTime===null&&!b.startFault){const g=clockGuide(d,b,r);node('start-clock-needle-guide').setAttribute('d',guidePath(g.center,g.width));startPanel.hidden=d.paused;startPanel.innerHTML='<b>通過まで直進のみ</b><small>'+((r.startPolicy||'safe')==='attack'?'先行を狙う':'余裕を持つ')+'<br><span>踏み始めは色帯が目安</span></small>';node('drive-countdown').setAttribute('aria-label','12秒針。色帯は全開を始める目安。読み '+g.precision);}
  else{startPanel.hidden=R.raceTime(d)>4||d.paused;startPanel.innerHTML='<b>'+(b.startFault||'ST '+R.startText(b.startTime))+'</b>'+(!b.startFault&&R.raceTime(d)-b.startTime<1?'<small>操舵できます</small>':'');}
  const ideal=R.pointAt(R.C.start+b.progress),wrong=Math.abs(R.wrap(b.heading-ideal.heading))>Math.PI*.65;
  node('drive-warning').textContent=d.elapsed<(b.recoveryUntil||0)?'船首を外へ復帰 · アクセルで進もう':b.penaltyUntil>d.elapsed?'立て直し中 '+Math.ceil(b.penaltyUntil-d.elapsed)+'秒':wrong?'逆向き · 減速して進路を戻そう':load>.6?'転覆注意 · 減速して舵を戻そう':b.slip>4?'外へ流れています · アクセルを緩めよう':'';
  if(!node('drive-warning').textContent){const warning=hazards.filter(x=>x.level===2).sort((a,b)=>b.value-a.value)[0];if(warning)node('drive-warning').textContent=warning.icon+' '+warning.tip;}
  node('drive-standings').innerHTML=ranked.map((n,i)=>'<div class="'+(n.isPlayer?'own':'')+'"><span class="mini-boat boat-'+n.frame+'">'+n.frame+'</span><b>'+esc(n.name)+'</b><small>'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':n.finishTime!==null?'完':i===0?'1位':Math.floor(Math.max(0,ranked[0].progress-n.progress))+'m')+'</small></div>').join('');
  const labels=mapLabels(d);node('map-leaders').innerHTML=labels.map(l=>'<line x1="'+l.px+'" y1="'+l.py+'" x2="'+l.x+'" y2="'+l.y+'" stroke="#badbd1" stroke-width=".7" opacity=".6"/>').join('');
  node('map-markers').innerHTML=labels.map(l=>'<g transform="translate('+l.x+' '+l.y+')"><circle r="7" fill="'+root.KM_RACE_RENDERER.COLORS[l.frame-1]+'" stroke="'+(l.isPlayer?'#fff':'#0d2d35')+'" stroke-width="'+(l.isPlayer?2:1)+'"/><text y="3" text-anchor="middle" fill="'+([2,3,4,6].includes(l.frame)?'#fff':'#152a2d')+'" font-size="9" font-weight="800">'+(l.startFault?l.startFault:l.capsized?'転':l.dnf?'棄':l.frame)+'</text></g>').join('');
  node('map-ranking').innerHTML=ranked.map((n,i)=>'<span><small>'+(i+1)+'</small><i class="mini-boat boat-'+n.frame+'">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':n.frame)+'</i></span>').join('');
  const recent=d.logs.filter(l=>['phase','lead','capsize','debuff','reflect','warning','goal','ability','weak'].includes(l.kind)).slice(-1)[0]||d.logs[d.logs.length-1];if(recent&&logCount!==recent.text){node('drive-live-text').textContent=recent.text;logCount=recent.text;}
  if(renderer){const visible=ranked.filter(n=>!n.isPlayer).map(n=>({n,p:renderer.project(n.x,n.capsized?.5:2,n.z)})).filter(x=>x.p&&x.p.visible&&x.p.depth<120).sort((a,b)=>a.p.x-b.p.x);const placed=[];
   node('opponent-labels').innerHTML=visible.map(({n,p})=>{let y=p.y;for(const q of placed)if(Math.abs(p.x-q.x)<46&&Math.abs(y-q.y)<26)y=q.y-27;placed.push({x:p.x,y});return '<span class="world-boat-label" style="left:'+p.x+'px;top:'+y+'px"><i class="mini-boat boat-'+n.frame+'">'+n.frame+'</i>'+(n.capsized?'転':R.place(d,n)+'位')+'</span>';}).join('');}
  const fx=effectLevels(d,r);node('weather-fx-label').textContent=[fx.wind?'強風':null,fx.rain?'雨脚':null,R.tiltInstability(b,R.performance(b,d,r))>.15?'ティルト不安定':null].filter(Boolean).join(' / ');
  updateEvents(now);
  if(root.KM_RACE_DIALOGUE&&!r.drill){talkState=root.KM_RACE_DIALOGUE.update(talkState,d,r);shell.classList.toggle('speaking',talkState.items.length>0&&!cutinShown);const key=(cutinShown?'hidden:':'shown:')+talkState.items.map(x=>x.id).join(':');if(key!==talkKey){talkKey=key;node('race-voices').innerHTML=cutinShown?'':root.KM_RACE_DIALOGUE.html(talkState);}}
  if(b.finishTime!==null)node('drive-warning').textContent='FINISH · '+place+'着 · '+clock(b.finishTime);
 }
 function finish(){if(finalizing||r.done)return;finalizing=true;d.paused=true;resetInput();node('drive-overlay').hidden=false;node('drive-overlay').innerHTML='<div class="drive-dialog"><h2>'+(R.own(d).finishTime!==null?'FINISH':'レース終了')+'</h2><p>結果を準備しています…</p></div>';
  // Remaining NPCs continue with the same fixed-step physics; finish times are already sealed; finished boats run clear of the course.
  setTimeout(()=>{if(disposed)return;try{callbacks.finish();d.paused=true;hud(performance.now());overlay();}catch(e){overlay('結果の保存を完了できませんでした。'+e.message);}finally{finalizing=false;}},30);
 }
 function frame(now){
  if(disposed)return;raf=requestAnimationFrame(frame);
  const delta=previous?Math.min((now-previous)/1000,.12):0;previous=now;
  if(renderer&&!renderer.isLost()&&!d.paused&&!d.finished){accumulator+=delta;let steps=0;while(accumulator>=R.DT&&steps++<8){R.tick(d,r,syncInput());if(r.drill){const b=R.own(d);if(b.startFault||b.capsized||b.dnf||b.progress>=r.practiceLimit||R.raceTime(d)>(r.drill==='start'?12:65)){d.finished=true;d.paused=true;}}accumulator-=R.DT;if(d.finished)break;}if(d.finished)finish();}else accumulator=0;
  if(renderer&&(renderer.mode!=='canvas'||now-lastPaint>=32)){try{renderer.draw(d,r,{guide:settings.guide,motion,raceFX:settings.raceFX||'full'});lastPaint=now;}catch(error){d.paused=true;resetInput();if(renderer.mode==='webgl'){setUpRenderer('canvas');}else{renderer.destroy();renderer=null;overlay(error.message);}callbacks.save();}}
  weatherPaint(now);
  if(now-lastHUD>80){hud(now);lastHUD=now;}
  if(!d.paused&&now-lastSave>2000){callbacks.save(true);lastSave=now;}
 }
 d.paused=true;setUpRenderer();hud(performance.now());if(d.finished&&!r.done)finish();raf=requestAnimationFrame(frame);
 return {pause,destroy(){if(disposed)return;root.KM_PRESENTATION?.cancel();d.paused=true;resetInput();disposed=true;cancelAnimationFrame(raf);cleanups.forEach(fn=>fn());if(renderer)renderer.destroy();callbacks.save();},getDebug(){return {pending:cutinQueue.length,abilities:cutinQueue.map(e=>e.abilityId),shown:cutinShown?.abilityId||null};}};
}
const API={postureDrag,postureDisplay,clockGuide,guidePath,startClockAngle,startClockView,steerDrag,steeringDisplay,signatureCaption,FX_THRESHOLDS,effectLevels,paintWeather,view,mount,attachControlEvents,clock,minimapPoint,mapLabels,steerFromPointer};root.KM_DRIVE_UI=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);


