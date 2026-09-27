/* v100: seven explicit soundtrack slots. package.py embeds existing local tracks into Safe HTML. */
(function(root){
'use strict';
const tracks={
 main:{title:'メインテーマ',src:'assets/audio/main.mp3'},
 race:{title:'水飛沫のデッドヒート',src:'assets/audio/race.mp3'},
 final:{title:'栄冠へ、波を裂け',src:'assets/audio/final.mp3'},
 sgLounge:{title:'静寂を破る航跡',src:'assets/audio/sg-lounge.mp3'},
 heroine:{title:'きみと、水面に恋をして',src:'assets/audio/heroine.mp3'},
 sgRace:{title:'SG通常レース',src:null,fallback:'race'},
 sgFinal:{title:'SG優勝戦',src:null,fallback:'final'}
};
function select(info={}){
 const racing=info.page==='race',sg=racing?(info.grade==='sg'):(info.stage===8&&info.activeCareer!==false&&!['title','new','registry','rivals','exhibition','quickResult'].includes(info.page));
 if(racing)return sg?(info.type==='championship'?'sgFinal':'sgRace'):(info.type==='championship'?'final':'race');
 if(info.heroine)return 'heroine';
 return sg?'sgLounge':'main';
}
function resolve(id){const requested=tracks[id]?id:'main',slot=tracks[requested],actual=slot.src?requested:slot.fallback||'main';return {requested,id:actual,src:tracks[actual].src,title:tracks[actual].title,placeholder:actual!==requested};}
function create(options={}){
 const AudioType=options.Audio||root.Audio,notify=options.notify||(()=>{}),schedule=options.setInterval||root.setInterval,cancel=options.clearInterval||root.clearInterval;
 let player=null,current=null,wanted='main',enabled=false,volume=0,epoch=0,pending=false,blocked=false,error='',fade=null;
 function clearFade(){if(fade!==null){cancel?.(fade);fade=null;}}
 function release(){clearFade();epoch++;pending=false;if(player){player.onended=null;player.onerror=null;try{player.pause();player.removeAttribute('src');player.load();}catch(_){}player=null;}current=null;}
 function ramp(){if(!player)return;clearFade();const p=player,start=Number(p.volume)||0,target=volume;let step=0;if(!schedule||Math.abs(target-start)<.01){p.volume=target;return;}fade=schedule(()=>{if(player!==p){clearFade();return;}p.volume=Math.max(0,Math.min(1,start+(target-start)*Math.min(1,++step/8)));if(step>=8)clearFade();},40);}
 function play(){if(!player||!enabled||pending||!player.paused)return;const p=player,ticket=epoch;pending=true;blocked=false;let promise;try{promise=p.play();}catch(e){pending=false;blocked=true;error='曲を開始できません。画面をタップして再試行してください。';notify();return;}
  Promise.resolve(promise).then(()=>{if(ticket!==epoch||p!==player||!enabled){if(p!==player||!enabled)try{p.pause();}catch(_){}return;}pending=false;blocked=false;error='';ramp();notify();},()=>{if(ticket!==epoch||p!==player)return;pending=false;blocked=true;error='曲を開始できません。画面をタップして再試行してください。';notify();});
 }
 function set(id,allow,v){wanted=tracks[id]?id:'main';enabled=!!allow;volume=Math.max(0,Math.min(1,v||0));const target=resolve(wanted);
  if(!enabled){clearFade();epoch++;pending=false;if(player)try{player.pause();}catch(_){}return;}
  if(!AudioType){blocked=true;error='この環境では音楽を再生できません。';notify();return;}
  if(!player||current?.src!==target.src){release();current=target;try{player=new AudioType();player.preload='none';player.loop=true;player.volume=0;player.setAttribute?.('playsinline','');player.src=target.src;const p=player,ticket=epoch;p.onerror=()=>{if(player!==p)return;blocked=true;pending=false;error='曲を読み込めません。音をOFF→ONにして再試行できます。';notify();};}catch(_){player=null;blocked=true;error='音楽を準備できません。';notify();return;}}
  else current=target;
  if(!player.paused){ramp();return;}play();
 }
 function retry(){if(blocked)release();set(wanted,enabled,volume);}
 function stop(){enabled=false;release();}
 function diagnostics(){const q=resolve(wanted);return {requested:wanted,track:current?.id||null,title:q.title,placeholder:q.placeholder,playing:!!player&&!player.paused&&enabled,pending,blocked,error,livePlayers:player?1:0};}
 return {set,retry,stop,diagnostics};
}
const API={tracks,select,resolve,create};root.KM_MUSIC=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
