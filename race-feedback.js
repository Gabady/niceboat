/* v92: observational coaching and a short-horizon water forecast. No RNG or mutations. */
(function(root){
'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const clamp=(v)=>Math.max(0,Math.min(1,v));
function forecast(d,r){
 const b=R.own(d),p=R.performance(b,d,r),pos=R.project(b.x,b.z),ahead=R.pointAt(pos.s+Math.max(12,b.speed*1.5),pos.radial);
 const bend=Math.abs(R.wrap(ahead.heading-R.pointAt(pos.s,pos.radial).heading));
 const required=b.speed*b.speed/Math.max(24,pos.radial)*clamp(bend/.45);
 const turn=clamp(required/Math.max(1,p.grip)*.55+Math.abs(b.slip)/9+R.tiltInstability(b,p)*.45);
 const weatherLoad=p.wave*.13*clamp(b.speed/12);let wake=Math.max(b.wakeLoad,weatherLoad),traffic=0;
 for(const o of d.boats){if(o===b||o.dnf||o.capsized||o.finishTime!==null)continue;
  const dx=o.x-b.x,dz=o.z-b.z,along=dx*Math.cos(b.heading)+dz*Math.sin(b.heading),side=Math.abs(-dx*Math.sin(b.heading)+dz*Math.cos(b.heading));
  if(along>0&&along<36&&side<7)wake=Math.max(wake,(1-along/42)*(1-side/9)*(1-p.wakeResistance));
  const vx=o.vx-b.vx,vz=o.vz-b.vz,t=Math.max(0,Math.min(1.5,-(dx*vx+dz*vz)/(vx*vx+vz*vz||1)));
  traffic=Math.max(traffic,clamp(1-Math.hypot(dx+vx*t,dz+vz*t)/12));
 }
 const values=[{id:'turn',icon:'↶',name:'旋回負荷',value:turn,tip:(b.posture||0)<-.35?'上へスライドして旋回に備える':'入口でアクセルを緩める'},{id:'wake',icon:'≈',name:'前方の波',value:clamp(wake),tip:wake<=weatherLoad+.01?'アクセルを少し緩める':'前走艇と進路をずらす'},{id:'traffic',icon:'⇄',name:'接近',value:traffic,tip:'艇間を空ける'}];
 return values.map(x=>({...x,level:x.value>=.68?2:x.value>=.35?1:0}));
}
function review(d){
 if(!d)return null;const b=R.own(d),m=b.metrics,rank=R.place(d,b),duration=Math.max(1,b.finishTime||R.raceTime(d)),c=[];
 const add=(id,icon,label,value,weight,tip)=>c.push({id,icon,label,value,weight,tip});
 if(b.dnf&&!b.startFault)add('retire','⚑','完走できなかった','棄権',90,'接触を避け、まずは3周をつなぐ');
 if(b.startFault)add('start','◷',b.startFault==='F'?'踏み込みが早い':'助走の遅れ',b.startFault,100,b.startFault==='F'?'時計の帯を目安に、踏み始めを少し遅く':'スタートを鍛え、時計の帯から助走');
 if(m.boundaries)add('boundary','◉','境界への接触',m.boundaries+'回',Math.min(85,35+m.boundaries*10),'ブイ手前で緩め、艇1隻分の余白を');
 if(b.capsized)add('capsize','↶','安定を失った','転覆',95,'ティルトを下げ、旋回前にアクセルを緩める');
 if(m.contacts)add('contact','⇄','他艇との接触',m.contacts+'回',Math.min(80,20+m.contacts*5),'艇間を空ける。フィジカルで接触に備える');
 if(m.slideSeconds/duration>.06)add('slide','↗','横滑り',Math.floor(m.slideSeconds)+'秒',Math.min(75,25+m.slideSeconds/duration*80),(m.lowTurnSeconds||0)>4?'旋回前に左指を上へ。速度が高ければアクセルも緩める':'旋回を鍛え、入口で舵を早めに動かす');
 if(m.wakeSeconds/duration>.06)add('wake','≈','引き波の中',Math.floor(m.wakeSeconds)+'秒',Math.min(65,20+m.wakeSeconds/duration*70),'前走艇の真後ろを外す。フィジカルも有効');
 if(b.startTime>.35&&!b.startFault)add('start','◷','スタートの遅れ',b.startTime.toFixed(2)+'秒',30+b.startTime*20,'スタートを鍛え、発進の帯から助走');
 if((m.lowTurnSeconds||0)>4&&m.slideSeconds>3)add('posture_turn','↑','低い姿勢で旋回',Math.floor(m.lowTurnSeconds)+'秒',54,'旋回前に左指を上へ。速度が高ければアクセルも緩める');
 if((m.highStraightSeconds||0)>8)add('posture_straight','↓','直線で上体が高い',Math.floor(m.highStraightSeconds)+'秒',22,'直線では左指を下へ動かして伏せる');
 const ranked=R.ranks(d),winner=ranked[0];
 if(!c.length){const keys=['speed','turn','start','accel','power'],names={speed:'直線',turn:'旋回',start:'スタート',accel:'加速',power:'フィジカル'},key=keys.slice().sort((a,z)=>b.stats[a]-b.stats[z])[0];
  add('pace','↗',rank===1?'きれいに完走':'大きな操作ロスなし',b.finishTime!==null&&winner.finishTime!==null&&rank>1?'先頭差 '+(b.finishTime-winner.finishTime).toFixed(1)+'秒':'走行を積み重ねた',1,rank===1?'今の走りを土台に、次のグレードへ':names[key]+'を補い、機材の長所を伸ばす');
 }
 c.sort((a,z)=>z.weight-a.weight);
 return {rank,title:rank===1?'勝ちを磨く':'次の一手',primary:c[0],chips:c.slice(0,3),note:'走行記録から見た振り返り'};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function reviewHTML(d){const x=review(d);if(!x)return '';return '<section class="race-coach"><div class="coach-heading"><b>'+x.title+'</b><small>'+x.note+'</small></div><div class="coach-chips">'+x.chips.map(c=>'<span><i>'+c.icon+'</i>'+esc(c.label)+'<b>'+esc(c.value)+'</b></span>').join('')+'</div><p><b>→</b> '+esc(x.primary.tip)+'</p></section>';}
function meterHTML(values){return values.map(v=>'<div class="water-meter level-'+v.level+'" aria-label="'+v.name+' '+['低','注意','高'][v.level]+'"><span>'+v.icon+' '+v.name+'</span><i><b style="width:'+Math.floor(v.value*100)+'%"></b></i><small>'+['余裕','注意','高負荷'][v.level]+'</small></div>').join('');}
const API={forecast,review,reviewHTML,meterHTML};root.KM_FEEDBACK=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
