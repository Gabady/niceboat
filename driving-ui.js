/* 競艇物語 v85 — mobile controls, fixed-step loop, HUD and first-person race view (v80.1 Android fallback). */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=t=>t===null?'—':Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')+'.'+Math.floor(t*10%10);
const button=(text,action,cls='')=>'<button type="button" class="drive-button '+cls+'" data-drive="'+action+'">'+text+'</button>';
// One clockwise revolution takes 12 seconds; zero is exactly at the upper tick.
const startClockAngle=t=>t*30;
function startClockView(t,id='start-clock-needle'){
 const ticks=Array.from({length:12},(_,i)=>'<line x1="60" y1="12" x2="60" y2="'+(i%3===0?23:18)+'" transform="rotate('+i*30+' 60 60)"/>').join('');
 return '<svg class="start-clock" viewBox="0 0 120 120" role="img" aria-label="12秒針。針が頂点へ戻るとスタート"><circle cx="60" cy="60" r="55" class="clock-face"/><g class="clock-ticks">'+ticks+'</g><path d="M55 6L60 14L65 6" class="clock-zero"/><text x="60" y="34">START</text><text x="94" y="64">3</text><text x="60" y="99">6</text><text x="26" y="64">9</text><g id="'+id+'" transform="rotate('+startClockAngle(t)+' 60 60)"><path d="M60 68V17" class="clock-hand"/><path d="M56 23L60 15L64 23" class="clock-zero"/></g><circle cx="60" cy="60" r="4" class="clock-hub"/><text x="60" y="81">12秒針</text></svg>';
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
function steeringDisplay(b,p,wanted){const limits=R.steeringLimits(b,p);return {actual:b.steer,requested:R.clamp(wanted,-1,1),limit:limits.limit,load:limits.load,label:limits.load>1.1?'舵が重い':limits.load>.45?'水圧あり':'舵は軽め'};}
function signatureCaption(event){return event.variant==='boost'?'1周目 · 出力上昇':event.variant==='recoil'?'3周目 · 反動':event.variant==='pivot'?(event.lap||1)+'周目 · 全速旋回':'';}
const FX_THRESHOLDS={speedKmh:55,wind:6,rain:.6};
function effectLevels(d,r){
 const b=R.own(d),kmh=b.speed*3.6,wind=r.env.windSpeed||0,rain=r.env.weather==='雨'?.65+wind*.025:0;
 return {speed:kmh>=FX_THRESHOLDS.speedKmh?R.clamp(.15+(kmh-55)/35,0,1):0,
  wind:wind>=FX_THRESHOLDS.wind?R.clamp(.2+(wind-6)*.2,0,1):0,rain:rain>=FX_THRESHOLDS.rain?rain:0,
  side:r.env.wind==='横風'?1:r.env.wind==='向かい風'?-.3:.25};
}
// Visual-only streaks: deterministic, no game RNG, no physics mutations, no image assets.
function paintWeather(ctx,w,h,levels,time,motion=true){
 ctx.clearRect(0,0,w,h);const t=motion?time:0,frac=n=>n-Math.floor(n);let count=0;
 function line(x,y,dx,dy,alpha,width=1){ctx.strokeStyle='rgba(214,245,251,'+alpha+')';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke();count++;}
 if(levels.rain){const n=motion?Math.floor(22+levels.rain*18):12;
  for(let i=0;i<n;i++){const y=frac(i*.618+t*(.48+frac(i*.71)*.22)),x=frac(i*.381966+t*.055*levels.side);line(x*w,y*h,-levels.side*(5+levels.wind*13),18+levels.rain*17,.12+levels.rain*.16);}
 }
 if(levels.wind){const n=motion?Math.floor(5+levels.wind*7):4;
  for(let i=0;i<n;i++){const side=i%2?-1:1,x=side>0?w*.92:w*.08,y=(.25+frac(i*.618+t*.18)*.46)*h;line(x,y,-side*(10+levels.wind*22),5+levels.wind*7,.13+levels.wind*.12);}
 }
 if(levels.speed){const n=motion?Math.floor(8+levels.speed*12):6;
  for(let i=0;i<n;i++){const side=i%2?-1:1,p=frac(i*.618+t*(.5+levels.speed*.7)),x=w*.5+side*w*(.34+p*.18),y=h*(.38+frac(i*.417)*.36);line(x,y,side*(9+levels.speed*26),(y-h*.4)*.18,.10+levels.speed*.18);}
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
  const packet=t=>({pointerId:'touch-'+t.identifier,clientX:t.clientX});
  on(el,'touchstart',e=>{if(e.changedTouches.length&&begin(packet(e.changedTouches[0])))e.preventDefault();},{passive:false});
  on(el,'touchmove',e=>{let used=false;Array.from(e.changedTouches).forEach(t=>{if(move(packet(t)))used=true;});if(used)e.preventDefault();},{passive:false});
  ['touchend','touchcancel'].forEach(type=>on(inputRoot,type,e=>Array.from(e.changedTouches).forEach(t=>release(packet(t)))));
  on(el,'mousedown',e=>{if(begin({pointerId:'mouse',clientX:e.clientX}))e.preventDefault();});
  on(inputRoot,'mousemove',e=>move({pointerId:'mouse',clientX:e.clientX}));on(inputRoot,'mouseup',()=>release({pointerId:'mouse'}));
 }
}
function view(r,title){const b=R.own(r.drive);return '<section class="drive-shell" id="drive-shell" aria-label="一人称ボートレース">'+
 '<canvas id="water-canvas" aria-label="船首から見た水面。左で操舵、右で加速。離すと水の抵抗で減速。"></canvas><div class="drive-vignette"></div><canvas id="weather-fx" aria-hidden="true"></canvas><span class="weather-fx-label" id="weather-fx-label"></span>'+
 '<div class="drive-top"><div><span class="drive-eyebrow">'+esc(title)+' · '+esc(r.venue.name)+' · '+(r.difficulty==='easy'?'EASY':'NORMAL')+'</span><b><span class="mini-boat boat-'+b.frame+'">'+b.frame+'</span> '+esc(b.name)+'</b></div>'+button('Ⅱ','pause','pause-button')+'</div>'+
 '<div class="drive-metrics"><div><span>POSITION</span><strong id="drive-rank">—<small> / 6</small></strong></div><div><span>LAP</span><strong id="drive-lap">1<small> / 3</small></strong></div><div><span>SPEED</span><strong id="drive-speed">0<small> km/h</small></strong></div><div><span>TIME</span><b id="drive-time">0:00.0</b></div></div>'+
 '<div class="drive-standings" id="drive-standings"></div><div class="drive-map" id="drive-map"><svg viewBox="0 0 200 124" aria-label="反時計回りのコースと6艇の現在順位"><path d="'+mapPath()+'" fill="none" stroke="#80c8c7" stroke-opacity=".35" stroke-width="15"/><path d="'+mapPath()+'" fill="none" stroke="#a9ded3" stroke-opacity=".75"/><text x="87" y="115" text-anchor="middle">START / GOAL →</text><text x="183" y="63" text-anchor="middle">1M</text><text x="100" y="20" text-anchor="middle">← BACK</text><text x="16" y="63" text-anchor="middle">2M</text><g id="map-leaders"></g><g id="map-markers"></g></svg><div class="map-ranking" id="map-ranking"></div><div class="drive-cutins" id="drive-cutins" aria-live="polite"></div></div>'+
 '<div class="opponent-labels" id="opponent-labels"></div><div class="drive-countdown" id="drive-countdown">'+startClockView(R.raceTime(r.drive))+'</div><div class="drive-warning" id="drive-warning"></div><div class="start-readout" id="start-readout" aria-live="polite"></div>'+
 '<div class="drive-telemetry"><span id="drive-zone">スタート</span><div class="stability-meter"><i id="stability-fill"></i></div><span id="drive-stability">安定</span></div>'+
 '<div id="drive-combos" class="drive-combos"></div><div class="drive-live"><span class="live-dot"></span><span id="drive-live-text" role="status">12秒針が頂点に戻るとスタート。早過ぎ・出遅れに注意。</span></div>'+
 '<div id="steer-hit-zone" class="steer-hit-zone" aria-hidden="true"></div><div class="drive-controls"><div class="steer-pad" id="steer-pad" role="slider" tabindex="0" aria-label="操舵。広いパッドのどこからでも左右へドラッグ" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"><span class="steer-left">←</span><span class="steer-right">→</span><div class="steer-groove"></div><div class="steer-range" id="steer-range"></div><div class="steer-request" id="steer-request"></div><div class="steer-knob" id="steer-knob"></div><small id="steer-load">舵は軽め</small></div><div class="pedals"><button class="pedal throttle" id="throttle-pedal" aria-label="押している間加速、離すと減速">加速<span>離すと減速</span></button></div></div>'+
 '<div class="drive-overlay" id="drive-overlay"></div></section>';}
function mount(r,settings,callbacks){
 const d=r.drive,shell=document.getElementById('drive-shell');if(!shell)return {destroy(){}};
 let canvas=document.getElementById('water-canvas'),renderer=null,raf=0,previous=0,accumulator=0,lastHUD=0,lastSave=0,lastPaint=0,disposed=false,finalizing=false,cutinUntil=0,cutinQueue=[],cutinShown=null,lastEvent=d.eventSequence-1,logCount=-1;
 const input={steer:0,throttle:0},keys=new Set(),pointers={steer:null,throttle:null},cleanups=[];
 const node=id=>document.getElementById(id),on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);cleanups.push(()=>target.removeEventListener(type,fn,opts));};
 const fxCanvas=node('weather-fx');let fxContext=null,lastFX=0;
 try{fxContext=fxCanvas.getContext('2d');}catch(_){/* Optional effects never block the water renderer. */}
 function weatherPaint(now){
  if(!fxContext||now-lastFX<32)return;lastFX=now;
  const w=shell.clientWidth,h=shell.clientHeight;if(!w||!h)return;
  const scale=Math.min(1.5,root.devicePixelRatio||1),rw=Math.round(w*scale),rh=Math.round(h*scale);
  if(fxCanvas.width!==rw||fxCanvas.height!==rh){fxCanvas.width=rw;fxCanvas.height=rh;}
  fxContext.setTransform(scale,0,0,scale,0,0);
  if(d.paused||d.finished)fxContext.clearRect(0,0,w,h);else paintWeather(fxContext,w,h,effectLevels(d,r),d.elapsed,motion);
 }
 let motion=settings.motion!==false&&!(settings.motion===undefined&&root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
 function resetInput(){input.steer=input.throttle=0;keys.clear();Object.keys(pointers).forEach(k=>pointers[k]=null);d.controls={steer:0,throttle:0};node('throttle-pedal').classList.remove('held');}
 function pause(){if(disposed)return;d.paused=true;resetInput();cutinQueue=[];node('drive-cutins').innerHTML='';cutinShown=null;cutinUntil=0;callbacks.save();overlay();}
 function debugHTML(){const p=R.own(d),perf=R.performance(p,d,r);return '<details class="drive-debug"><summary>実況・操船デバッグ</summary><p>カットイン待機数: '+cutinQueue.length+' / 対象能力: '+esc(cutinQueue.map(e=>D.abilityMap[e.abilityId].name).join(' / ')||'なし')+'</p>'+button('カットイン確認','cutin')+'<div class="drive-full-log">'+d.logs.slice(-24).map(l=>'<p><time>'+clock(l.time)+'</time> '+esc(l.text)+'</p>').join('')+'</div><pre>'+esc(JSON.stringify({renderer:renderer?renderer.mode:'unavailable',rendererDiagnostic:renderer?.diagnostic||null,difficulty:r.difficulty||'normal',visualThresholds:{speedKmh:FX_THRESHOLDS.speedKmh,windKmh:R.kmh(FX_THRESHOLDS.wind),rain:FX_THRESHOLDS.rain},visualLevels:effectLevels(d,r),wakeResistance:perf.wakeResistance,turnDanger:R.turnDanger(p,perf,perf.grip*(1-Math.min(.26,p.wakeLoad*.19))),synergy:perf.synergy,steering:steeringDisplay(p,perf,d.controls.steer),signature:p.signature,grade:R.raceGrade(r),pace:perf.pace,spectatorSpread:perf.spread,npcPace:D.npcPace,elapsed:d.elapsed,controls:d.controls,heading:p.heading,position:{x:p.x,z:p.z},progress:p.progress,checkpoints:p.checkpoints,speedKmh:R.kmh(p.speed),tilt:perf.tilt,grip:perf.grip,sideSpeedKmh:R.kmh(p.slip),wakeLoad:p.wakeLoad,startTime:p.startTime,startFault:p.startFault,launchForecast:R.launchForecast(d,p,r),stress:p.stress,phase:p.phase,activeEffects:p.effects,cutins:d.events.filter(e=>e.kind==='ability'&&D.rarities.indexOf(e.rarity)>=2).slice(-12).map(e=>({id:e.abilityId,boat:e.frame,time:e.t})),boats:d.boats.map(b=>({frame:b.frame,progress:b.progress,finishTime:b.finishTime,capsized:b.capsized,dnf:b.dnf,startTime:b.startTime,startFault:b.startFault,plan:b.plan,contacts:b.metrics.contacts,wakeSeconds:b.metrics.wakeSeconds})),interference:d.events.filter(e=>e.kind==='debuff').slice(-8)},null,2))+'</pre></details>';}
 function overlay(error){
  const area=node('drive-overlay');if(!d.paused&&!error&&!r.done){area.hidden=true;return;}area.hidden=false;
  const b=R.own(d);if(error){area.innerHTML='<div class="drive-dialog"><span class="drive-eyebrow">描画の準備</span><h2>レースは一時停止中</h2><p>'+esc(error)+'</p>'+button('描画を再開','retry','primary')+(r.done?'<button class="btn primary large" data-action="result">リザルトへ</button>':button('観戦モードに切り替える','skip'))+button('タイトルへ戻る','exit')+'</div>';return;}
  if(r.done){area.innerHTML='<div class="drive-dialog finish-dialog"><span class="drive-eyebrow">FINISH</span><h2>'+(b.capsized?'転覆':b.startFault==='F'?'フライング（F）':b.startFault==='L'?'出遅れ（L）':b.dnf?'リタイア':R.place(d,b)+'着')+'</h2><p>'+esc(b.name)+' · '+clock(b.finishTime)+'</p><button class="btn primary large" data-action="result">リザルトへ</button>'+debugHTML()+'</div>';return;}
  area.innerHTML='<div class="drive-dialog"><span class="drive-eyebrow">'+(d.started?'PAUSED':'FIRST PERSON / 3 LAPS')+'</span><h2>'+(d.started?'水面で、ひと息。':'自分の手で、3周。')+'</h2><p class="drive-instructions">画面左側の下半分のどこからでも指を置いて、左右にドラッグして操舵。細い印は指の指定位置、丸い舵は水圧で遅れて動きます。光る範囲が現在の可動域。旋回中ほど重く、旋回能力で軽減します。右手で加速。押し続けると旋回中も速度を維持します。曲がる前に離して減速してください。ブイで0.7秒以上動けないと船首が自動で外を向きます。加速して復帰してください。全速旋回は横滑りと転覆の危険があります。助走中も操船でき、12秒針の頂点を目安に船首でラインを通過。ゲーム内では0.25秒を超えて早いとF、1.5秒以上遅いとLです。</p><div class="drive-mini-guide"><span>← 左回り</span><span>600m × 3周 · ブイの外を回る</span></div>'+button(d.started?'操船を再開':'水面へ出る','resume','primary')+'<div class="drive-options"><label><input id="drive-guide-setting" type="checkbox"'+(settings.guide!==false?' checked':'')+'> 水面の進行ガイド</label><label><input id="drive-motion-setting" type="checkbox"'+(motion?' checked':'')+'> 視点の揺れ・雨風の動き</label><label><input id="drive-render-setting" type="checkbox"'+(renderer?.mode==='canvas'?' checked':'')+'> 軽量表示</label></div>'+(d.started?button('立て直す · 4秒停止','rescue'):'')+button(d.started?'ここから観戦に切り替える':'観戦モードに切り替える','skip')+'<div class="drive-menu-row">'+button('タイトルへ','exit')+(d.started?button('このレースをリタイア','retire'):'')+'</div><p class="drive-key-hint">PC: ← → / A D 操舵 · ↑ / W 加速 · アクセルを離して減速 · Esc 一時停止</p>'+debugHTML()+'</div>';
 }
 function setUpRenderer(forcedMode){
  if(renderer){renderer.destroy();renderer=null;}canvas=root.KM_RACE_RENDERER.freshCanvas(canvas);
  try{renderer=root.KM_RACE_RENDERER.create(canvas,{mode:forcedMode||settings.renderMode||'auto'});canvas=renderer.canvas;
   on(canvas,'webglcontextlost',e=>{e.preventDefault();d.paused=true;resetInput();setUpRenderer('canvas');callbacks.save();});
   overlay();return true;
  }catch(e){canvas=node('water-canvas');overlay(e.message);return false;}
 }

 function syncInput(){const keyboardSteer=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);return {steer:pointers.steer!==null?input.steer:keyboardSteer,throttle:pointers.throttle!==null||keys.has('ArrowUp')||keys.has('w')?1:0};}
 function bindPointer(el,kind){
  let originX=0,originSteer=0;
  const update=e=>{if(kind==='steer'){input.steer=steerDrag(originSteer,e.clientX-originX,node('steer-pad').getBoundingClientRect().width);}else{input[kind]=1;el.classList.add('held');}};
  const begin=e=>{if(d.paused||d.finished||pointers[kind]!==null)return false;pointers[kind]=e.pointerId;if(kind==='steer'){originX=e.clientX;originSteer=R.own(d).steer;}update(e);return true;};
  const move=e=>{if(pointers[kind]!==e.pointerId)return false;update(e);return true;};
  const release=e=>{if(pointers[kind]!==e.pointerId)return;pointers[kind]=null;input[kind]=0;el.classList.remove('held');};
  attachControlEvents(root,el,{begin,move,release},on);
 }

 bindPointer(node('steer-hit-zone'),'steer');bindPointer(node('steer-pad'),'steer');bindPointer(node('throttle-pedal'),'throttle');
 on(root,'keydown',e=>{if(disposed||!document.getElementById('modal').hidden)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(key==='Escape'){e.preventDefault();pause();return;}if(['ArrowLeft','ArrowRight','ArrowUp','a','d','w'].includes(key)&&!d.paused){e.preventDefault();keys.add(key);}});
 on(root,'keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));on(root,'blur',pause);
 on(document,'visibilitychange',()=>{if(document.hidden)pause();});on(root,'pagehide',pause);
 on(shell,'contextmenu',e=>e.preventDefault());
 on(shell,'click',e=>{const action=e.target.closest('[data-drive]')?.dataset.drive;if(!action)return;
  if(action==='pause'){pause();return;}
  if(action==='resume'){if(!renderer||renderer.isLost())return;d.paused=false;resetInput();accumulator=0;previous=0;overlay();callbacks.save();}
  if(action==='rescue'){R.rescue(d);d.paused=false;resetInput();overlay();callbacks.save();}
  if(action==='exit'){pause();callbacks.exit();}
  if(action==='skip'){d.paused=true;resetInput();callbacks.skip();}
  if(action==='retire'){node('drive-overlay').innerHTML='<div class="drive-dialog"><h2>このレースをリタイアしますか？</h2><p>賞金とポイントは0になります。次のレースへ進めます。</p>'+button('レースへ戻る','pause','primary')+button('リタイアする','confirmRetire')+'</div>';}
  if(action==='confirmRetire'){const b=R.own(d);b.dnf=true;b.vx=b.vz=b.speed=0;d.finished=true;finish();}
  if(action==='retry'){setUpRenderer();}
  if(action==='cutin'){const b=R.own(d);node('drive-overlay').hidden=true;showCutin({abilityId:'mirror',frame:b.frame,name:b.name,t:d.elapsed});setTimeout(()=>{if(!disposed){overlay();}},1400);}
 });
 on(shell,'change',e=>{if(e.target.id==='drive-guide-setting'){settings.guide=e.target.checked;callbacks.save();}if(e.target.id==='drive-motion-setting'){motion=settings.motion=e.target.checked;callbacks.save();}if(e.target.id==='drive-render-setting'){settings.renderMode=e.target.checked?'canvas':'auto';setUpRenderer();callbacks.save();}});
 function showCutin(event){const a=D.abilityMap[event.abilityId];if(!a)return;node('drive-cutins').innerHTML='<div class="drive-cutin '+a.rarity.toLowerCase()+'"><div><span class="mini-boat boat-'+event.frame+'">'+event.frame+'</span><span>'+esc(event.name)+'</span><b>'+a.rarity+'</b></div><strong>'+esc(a.name)+'</strong><small>'+signatureCaption(event)+'</small></div>';cutinUntil=performance.now()+1200;cutinShown=event;}
 function updateEvents(now){
  const fresh=d.events.filter(e=>e.index>lastEvent);if(fresh.length)lastEvent=fresh[fresh.length-1].index;
  fresh.filter(e=>e.kind==='ability'&&D.rarities.indexOf(e.rarity)>=2).forEach(e=>cutinQueue.push(e));
  cutinQueue=cutinQueue.filter(e=>d.elapsed-e.t<2.5).sort((a,b)=>Number(b.athleteId===R.own(d).id)-Number(a.athleteId===R.own(d).id)).slice(0,3);
  if(now>=cutinUntil){node('drive-cutins').innerHTML='';cutinShown=null;if(cutinQueue.length)showCutin(cutinQueue.shift());}
 }
 function hud(now){
  const b=R.own(d),ranked=R.ranks(d),place=ranked.indexOf(b)+1,lap=Math.min(3,Math.floor(Math.max(0,b.progress)/R.C.length)+1);
  const steering=steeringDisplay(b,R.performance(b,d,r),d.controls.steer),pad=node('steer-pad');
  node('steer-knob').style.left=(50+steering.actual*34)+'%';node('steer-request').style.left=(50+steering.requested*34)+'%';
  node('steer-range').style.left=(50-steering.limit*34)+'%';node('steer-range').style.width=(steering.limit*68)+'%';
  node('steer-load').textContent=steering.label;pad.classList.toggle('heavy',steering.load>1.1);
  pad.setAttribute('aria-valuenow',String(Math.round(steering.actual*100)));pad.setAttribute('aria-valuetext',steering.label+'。実際の舵 '+Math.round(steering.actual*100)+'、可動域 左右'+Math.floor(steering.limit*100));
  node('drive-rank').innerHTML=(b.startFault|| (b.capsized?'転':place))+'<small> / 6</small>';node('drive-lap').innerHTML=lap+'<small> / 3</small>';node('drive-speed').innerHTML=Math.floor(b.speed*3.6)+'<small> km/h</small>';node('drive-time').textContent=clock(b.finishTime===null?Math.max(0,R.raceTime(d)):b.finishTime);
  const phase=b.phase===4&&lap<3?'ホーム直線':D.phases[b.phase];node('drive-zone').textContent=(d.countdown>0?'助走':phase)+' · '+r.env.weather+' / '+r.env.wind+' '+R.speedText(r.env.windSpeed);
  const activeLinks=R.performance(b,d,r).synergy;node('drive-combos').textContent=activeLinks.length?'連携 '+activeLinks.map(id=>D.synergies.find(x=>x.id===id).name).join(' / '):'';node('drive-zone').title=activeLinks.map(id=>D.synergies.find(x=>x.id===id).name).join(' / ');
  const load=R.clamp(b.stress/2.8,0,1);node('stability-fill').style.width=(100-load*100)+'%';node('stability-fill').style.background=load>.45?'#ff9676':'#83e9cc';node('drive-stability').textContent=load>.6?'傾き大':b.slip>2.5?'滑り':'安定';
  node('drive-countdown').hidden=d.paused||R.raceTime(d)>=R.C.lateLimit;node('start-clock-needle').setAttribute('transform','rotate('+startClockAngle(R.raceTime(d))+' 60 60)');
  const startPanel=node('start-readout');
  if(b.startTime===null&&!b.startFault){const f=R.launchForecast(d,b,r);startPanel.hidden=false;startPanel.innerHTML='<b>'+b.course+'コース · '+(b.course>=4?'ダッシュ':'スロー')+'</b><span>ラインまで '+Math.max(0,Math.ceil(R.pointAt(R.C.start).x-b.x-3.5))+'m</span><small>'+(f.launchIn>.25?'見込み：全開はまだ早い':f.launchIn<-.45?'見込み：今からでは遅れ気味':'見込み：全開を合わせる頃')+' · 読み '+f.precision+'</small>'; }else{startPanel.hidden=false;startPanel.innerHTML='<b>'+(b.startFault==='F'?'F · フライング':b.startFault==='L'?'L · 出遅れ':'ST '+R.startText(b.startTime))+'</b>';if(R.raceTime(d)>5)startPanel.hidden=true;}
  const ideal=R.pointAt(R.C.start+b.progress),wrong=Math.abs(R.wrap(b.heading-ideal.heading))>Math.PI*.65;
  node('drive-warning').textContent=d.elapsed<(b.recoveryUntil||0)?'船首を外へ復帰 · アクセルで進もう':b.penaltyUntil>d.elapsed?'立て直し中 '+Math.ceil(b.penaltyUntil-d.elapsed)+'秒':wrong?'逆向き · 減速して進路を戻そう':load>.6?'転覆注意 · 減速して舵を戻そう':b.slip>4?'外へ流れています · アクセルを緩めよう':'';
  node('drive-standings').innerHTML=ranked.map((n,i)=>'<div class="'+(n.isPlayer?'own':'')+'"><span class="mini-boat boat-'+n.frame+'">'+n.frame+'</span><b>'+esc(n.name)+'</b><small>'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':n.finishTime!==null?'完':i===0?'1位':Math.floor(Math.max(0,ranked[0].progress-n.progress))+'m')+'</small></div>').join('');
  const labels=mapLabels(d);node('map-leaders').innerHTML=labels.map(l=>'<line x1="'+l.px+'" y1="'+l.py+'" x2="'+l.x+'" y2="'+l.y+'" stroke="#badbd1" stroke-width=".7" opacity=".6"/>').join('');
  node('map-markers').innerHTML=labels.map(l=>'<g transform="translate('+l.x+' '+l.y+')"><circle r="7" fill="'+root.KM_RACE_RENDERER.COLORS[l.frame-1]+'" stroke="'+(l.isPlayer?'#fff':'#0d2d35')+'" stroke-width="'+(l.isPlayer?2:1)+'"/><text y="3" text-anchor="middle" fill="'+([2,3,4,6].includes(l.frame)?'#fff':'#152a2d')+'" font-size="9" font-weight="800">'+(l.startFault?l.startFault:l.capsized?'転':l.dnf?'棄':l.frame)+'</text></g>').join('');
  node('map-ranking').innerHTML=ranked.map((n,i)=>'<span><small>'+(i+1)+'</small><i class="mini-boat boat-'+n.frame+'">'+(n.startFault?n.startFault:n.capsized?'転':n.dnf?'棄':n.frame)+'</i></span>').join('');
  const recent=d.logs.filter(l=>['phase','lead','capsize','debuff','reflect','warning','goal','ability','weak'].includes(l.kind)).slice(-1)[0]||d.logs[d.logs.length-1];if(recent&&logCount!==recent.text){node('drive-live-text').textContent=recent.text;logCount=recent.text;}
  if(renderer){const visible=ranked.filter(n=>!n.isPlayer).map(n=>({n,p:renderer.project(n.x,n.capsized?.5:2,n.z)})).filter(x=>x.p&&x.p.visible&&x.p.depth<120).sort((a,b)=>a.p.x-b.p.x);const placed=[];
   node('opponent-labels').innerHTML=visible.map(({n,p})=>{let y=p.y;for(const q of placed)if(Math.abs(p.x-q.x)<46&&Math.abs(y-q.y)<26)y=q.y-27;placed.push({x:p.x,y});return '<span class="world-boat-label" style="left:'+p.x+'px;top:'+y+'px"><i class="mini-boat boat-'+n.frame+'">'+n.frame+'</i>'+(n.capsized?'転':R.place(d,n)+'位')+'</span>';}).join('');}
  const fx=effectLevels(d,r);node('weather-fx-label').textContent=[fx.speed?'速度風':null,fx.wind?'強風':null,fx.rain?'雨脚':null].filter(Boolean).join(' / ');
  updateEvents(now);
 }
 function finish(){if(finalizing||r.done)return;finalizing=true;d.paused=true;resetInput();node('drive-overlay').hidden=false;node('drive-overlay').innerHTML='<div class="drive-dialog"><h2>ゴール順を確定しています…</h2></div>';
  // Remaining NPCs continue with the same fixed-step physics; the player is already stopped.
  setTimeout(()=>{if(disposed)return;try{callbacks.finish();d.paused=true;hud(performance.now());overlay();}catch(e){overlay('結果の保存を完了できませんでした。'+e.message);}finally{finalizing=false;}},30);
 }
 function frame(now){
  if(disposed)return;raf=requestAnimationFrame(frame);
  const delta=previous?Math.min((now-previous)/1000,.12):0;previous=now;
  if(renderer&&!renderer.isLost()&&!d.paused&&!d.finished){accumulator+=delta;let steps=0;while(accumulator>=R.DT&&steps++<8){R.tick(d,r,syncInput());accumulator-=R.DT;if(d.finished)break;}if(d.finished)finish();}else accumulator=0;
  if(renderer&&(renderer.mode!=='canvas'||now-lastPaint>=32)){try{renderer.draw(d,r,{guide:settings.guide,motion});lastPaint=now;}catch(error){d.paused=true;resetInput();if(renderer.mode==='webgl'){setUpRenderer('canvas');}else{renderer.destroy();renderer=null;overlay(error.message);}callbacks.save();}}
  weatherPaint(now);
  if(now-lastHUD>80){hud(now);lastHUD=now;}
  if(!d.paused&&now-lastSave>2000){callbacks.save();lastSave=now;}
 }
 d.paused=true;setUpRenderer();hud(performance.now());if(d.finished&&!r.done)finish();raf=requestAnimationFrame(frame);
 return {pause,destroy(){if(disposed)return;d.paused=true;resetInput();disposed=true;cancelAnimationFrame(raf);cleanups.forEach(fn=>fn());if(renderer)renderer.destroy();callbacks.save();},getDebug(){return {pending:cutinQueue.length,abilities:cutinQueue.map(e=>e.abilityId),shown:cutinShown?.abilityId||null};}};
}
const API={startClockAngle,startClockView,steerDrag,steeringDisplay,signatureCaption,FX_THRESHOLDS,effectLevels,paintWeather,view,mount,attachControlEvents,clock,minimapPoint,mapLabels,steerFromPointer};root.KM_DRIVE_UI=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
