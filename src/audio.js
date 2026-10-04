

/* v114: one MP3 player, title-only change notification and gesture-unlocked effects. */
(function(root){
'use strict';
if(typeof document==='undefined')return;
const Music=root.KM_MUSIC;
let prefs={muted:true,bgm:true,sfx:true,engine:true,volume:.35,bgmVolume:1,sfxVolume:1,engineVolume:1};
try{const p=JSON.parse(localStorage.getItem('km_audio_v92'));if(p)for(const k of ['muted','bgm','sfx','engine'])if(typeof p[k]==='boolean')prefs[k]=p[k];if(p)for(const k of ['volume','bgmVolume','sfxVolume','engineVolume'])if(Number.isFinite(p[k]))prefs[k]=Math.max(0,Math.min(1,p[k]));}catch(_){}
let context=null,loading=null,unlocked=false,gestureRequired=false,blocked=false,scene='main',drive=null,lastDrive=null,lastTime=0,lastContact=0,lastAbility=0,finishPlayed=false;
let noticeTimer=null,noticeTrack=null;
const buffers={},tracks={},voices=new Set(),music=Music?.create({notify:paint,onTrackChange:showSong});
function hideSong(){if(noticeTimer!==null){root.clearTimeout(noticeTimer);noticeTimer=null;}noticeTrack=null;const n=document.getElementById('sound-notice');if(n){n.classList.remove('visible');n.setAttribute('aria-hidden','true');}}
function showSong(track){if(!allowed('bgm')||prefs.volume*prefs.bgmVolume<=0)return;const n=document.getElementById('sound-notice');if(!n)return;hideSong();noticeTrack=track.id;n.textContent=track.title;n.setAttribute('aria-hidden','false');n.classList.add('visible');noticeTimer=root.setTimeout(hideSong,4200);}
function allowed(kind){return unlocked&&!gestureRequired&&!prefs.muted&&prefs[kind]&&!document.hidden;}
function stop(id){const a=tracks[id];if(a){try{a.source.stop();}catch(_){}a.source.disconnect();a.gain.disconnect();}delete tracks[id];}
function start(id,loop,volume){if(!context||context.state!=='running'||!buffers[id])return null;const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[id];source.loop=loop;gain.gain.value=volume;source.connect(gain);gain.connect(context.destination);const a={source,gain};source.start();return a;}
function sync(){
 if(!allowed('bgm')||prefs.volume*prefs.bgmVolume<=0||(noticeTrack&&noticeTrack!==Music?.resolve(scene).id))hideSong();
 music?.set(scene,allowed('bgm'),prefs.volume*.72*prefs.bgmVolume);
 // A missing music module may use the old tiny generated loop, never a second BGM.
 const fallback=scene==='race'||scene==='final'||scene==='sgRace'||scene==='sgFinal'?'race':'harbor';
 for(const id of Object.keys(tracks))if(id!=='engine'&&(music||id!==fallback||!allowed('bgm')))stop(id);
 if(!music&&allowed('bgm')){if(!tracks[fallback])tracks[fallback]=start(fallback,true,prefs.volume*.55*prefs.bgmVolume);if(tracks[fallback])tracks[fallback].gain.gain.value=prefs.volume*.55*prefs.bgmVolume;}
 if(!allowed('engine')||!drive||drive.paused||drive.finished)stop('engine');
 if(!allowed('sfx')){voices.forEach(a=>{try{a.source.stop();}catch(_){}});voices.clear();}
 if(context&&(document.hidden||prefs.muted||gestureRequired))context.suspend().catch(()=>{});
}
function unlock(){unlocked=true;gestureRequired=false;blocked=false;
 // play() is called in the user-gesture stack, before waiting for effect decoding.
 sync();music?.retry();
 try{if(!context){const Context=root.AudioContext||root.webkitAudioContext;if(!Context)throw Error('unavailable');context=new Context();}
  context.resume().then(sync).catch(()=>{blocked=true;paint();});
  if(!loading)loading=Promise.all(Object.entries(root.KM_AUDIO_ASSETS||{}).filter(([id])=>!music||!['harbor','race'].includes(id)).map(async([id,uri])=>{let bytes;if(uri.startsWith('data:')){const raw=atob(uri.split(',')[1]),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);bytes=a.buffer;}else{const response=await fetch(uri);if(!response.ok)throw Error('音源を読み込めません');bytes=await response.arrayBuffer();}buffers[id]=await context.decodeAudioData(bytes);})).then(sync).catch(()=>{loading=null;blocked=true;paint();});
 }catch(_){blocked=true;paint();}
}
function effect(id){if(!allowed('sfx')||voices.size>=4)return;const a=start(id,false,prefs.volume*prefs.sfxVolume);if(!a)return;voices.add(a);a.source.onended=()=>{a.source.disconnect();a.gain.disconnect();voices.delete(a);};}
function save(){try{localStorage.setItem('km_audio_v92',JSON.stringify(prefs));}catch(_){}sync();paint();}
function paint(){const b=document.getElementById('sound-toggle');if(!b)return;b.textContent=prefs.muted?'♪ 音 OFF':'♪ 音 ON';b.setAttribute('aria-pressed',String(!prefs.muted));const m=music?.diagnostics(),status=document.getElementById('sound-status'),title=document.getElementById('sound-track');if(status)status.textContent=m?.error||(blocked?'効果音を開始できません。OFF→ONで再試行できます。':gestureRequired&&!prefs.muted?'画面をタップすると音声を再開します。':'');if(title)title.textContent='♪ '+(m?.title||'メインテーマ')+(m?.placeholder?'（SG曲の追加待ち・代用）':'');}
function update(d){drive=d;if(!d){stop('engine');return;}const b=root.KM_RACING.own(d);
 if(lastDrive!==d){lastDrive=d;lastTime=d.elapsed;lastContact=b.metrics.contacts+b.metrics.boundaries;lastAbility=b.activations.length;finishPlayed=d.finished;}
 if(!d.paused){if(lastTime<root.KM_RACING.startAt(d)&&d.elapsed>=root.KM_RACING.startAt(d))effect('start');
  const contacts=b.metrics.contacts+b.metrics.boundaries;if(contacts>lastContact)effect('contact');lastContact=contacts;
  if(b.activations.length>lastAbility)effect('skill');lastAbility=b.activations.length;
 }
 if(d.finished&&!finishPlayed){effect('finish');finishPlayed=true;}
 lastTime=d.elapsed;
 if(allowed('engine')&&!d.paused&&!d.finished){if(!tracks.engine)tracks.engine=start('engine',true,0);const a=tracks.engine;if(a){a.gain.gain.value=prefs.volume*prefs.engineVolume*(.08+Math.min(1,b.speed/30)*.17);a.source.playbackRate.value=.6+Math.min(1,b.speed/30)*1.2;}}else stop('engine');
}
function mount(){const host=document.createElement('div');host.className='sound-controls';host.innerHTML='<div id="sound-notice" class="sound-notice" role="status" aria-live="polite" aria-atomic="true" aria-hidden="true"></div><button id="sound-toggle" type="button" aria-label="全音声のオン・オフ">♪ 音 OFF</button><details><summary aria-label="音声設定">♫</summary><div class="sound-panel"><b id="sound-track" class="sound-track"></b><label><input id="sound-bgm" type="checkbox"> BGM</label><label><input id="sound-sfx" type="checkbox"> 効果音</label><label><input id="sound-engine" type="checkbox"> エンジン音</label><label>全体 <input id="sound-volume" type="range" min="0" max="1" step=".05" aria-label="全体音量"></label><label>BGM <input id="sound-bgmVolume" type="range" min="0" max="1" step=".05" aria-label="BGM音量"></label><label>効果音 <input id="sound-sfxVolume" type="range" min="0" max="1" step=".05" aria-label="効果音音量"></label><label>エンジン <input id="sound-engineVolume" type="range" min="0" max="1" step=".05" aria-label="エンジン音量"></label><small id="sound-status" role="status"></small></div></details>';document.body.appendChild(host);
 for(const k of ['bgm','sfx','engine'])document.getElementById('sound-'+k).checked=prefs[k];for(const k of ['volume','bgmVolume','sfxVolume','engineVolume'])document.getElementById('sound-'+k).value=prefs[k];
 document.getElementById('sound-toggle').onclick=()=>{prefs.muted=!prefs.muted;if(!prefs.muted)unlock();save();};
 host.addEventListener('change',e=>{const k=e.target.id.replace('sound-','');if(['bgm','sfx','engine'].includes(k))prefs[k]=e.target.checked;if(['volume','bgmVolume','sfxVolume','engineVolume'].includes(k))prefs[k]=Math.max(0,Math.min(1,Number(e.target.value)));if(!prefs.muted)unlock();save();});
 document.addEventListener('click',e=>{if(!prefs.muted&&(!unlocked||gestureRequired||context?.state==='suspended'||music?.diagnostics().blocked))unlock();if(e.target.closest('button')&&!host.contains(e.target))effect('click');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gestureRequired=true;sync();paint();});
 root.addEventListener('pagehide',()=>{gestureRequired=true;hideSong();music?.stop();Object.keys(tracks).forEach(stop);voices.forEach(a=>{try{a.source.stop();}catch(_){}});voices.clear();context?.suspend().catch(()=>{});});paint();
}
root.KM_AUDIO={scene(value,d,info={}){scene=Music?Music.select({...info,page:value}):(value==='race'?'race':'main');sync();update(d);paint();},update,effect,
 diagnostics(){const m=music?.diagnostics();return {...prefs,ready:Object.keys(buffers).length,context:context?.state||'idle',tracks:[...Object.keys(tracks).filter(k=>tracks[k]),...(m?.playing?['mp3:'+m.track]:[])],voices:voices.size,blocked:blocked||!!m?.blocked,music:m,gestureRequired};}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(globalThis);


