
/* V141: review -> preparation -> next run. No rewards, career RNG or DOM writes. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null);
const V=()=>root.KM_REVIEW145||(typeof require==='function'?require('./review145.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x)),own=r=>r?.runners?.find(n=>n.isPlayer);
const review=(z,p)=>(root.KM_REVIEW||(typeof require==='function'?require('./review122.js'):null)).review(z,p);
const finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
const text=(s,n=180)=>typeof s==='string'&&s.length<=n;
const kinds=['start','turn','wake'],modes=['manual','auto','mixed','unknown'];
const modeNames={manual:'手動',auto:'観戦・自動',mixed:'手動＋観戦',unknown:'方式不明（旧記録など）'};
function mode(r){const q=r?.drive?.controlUse141;if(!q)return 'unknown';return q.manual>0?(q.auto>0?'mixed':'manual'):q.auto>0?'auto':'unknown';}
function setMode(c,value){if(!c||!['drive','development'].includes(value))return false;
 c.playMode141=value;const r=c.series?.race;if(r&&!r.done&&!r.drive?.frame)r.finalSpectator141=value==='development';return true;}
function record(p,r,z){const k=mode(r);p.controlRecord141=p.controlRecord141||Object.fromEntries(modes.map(m=>[m,{races:0,wins:0,podiums:0}]));
 const x=p.controlRecord141[k];x.races++;if(!z.startFault&&!z.capsized&&!z.dnf){if(z.place===1)x.wins++;if(z.place<=3)x.podiums++;}z.controlRecord141=k;}
function validRecords(q){return q===undefined||!!q&&modes.every(k=>q[k]&&['races','wins','podiums'].every(n=>Number.isInteger(q[k][n])&&finite(q[k][n],0,100000))&&q[k].wins<=q[k].podiums&&q[k].podiums<=q[k].races);}
function conditions(r){const b=r.drive?R.own(r.drive):own(r);return r.venue.name+' / '+r.env.weather+'・'+r.env.wind+' '+r.env.windSpeed+'m/s / '+b.course+'コース';}
const metricNames={st:'ST',slide:'横滑りの時間割合',wake:'引き波内の時間割合',contacts:'他艇・境界接触',exit:'再加速をつないだ回数'};
function metricFor(q){return q.drill==='start'?'st':q.priority==='contact'?'contacts':q.drill==='wake'?'wake':q.key==='accel'?'exit':'slide';}
function measurement(r,z,key,stat){const m=z.driving?.metrics,seconds=z.driving?.time||((r.drive?.elapsed||0)-R.startAt(r.drive||{})),boat=r.drive?R.own(r.drive):own(r);
 let value=null;
 if(key==='st'){if(!z.startFault&&Number.isFinite(z.startTime))value=z.startTime;}
 else if(m){if(key==='contacts')value=m.contacts+m.boundaries;else if(key==='exit')value=m.craft?.exitGood??null;else if(seconds>0&&!z.dnf&&!z.capsized&&!z.startFault)value=Math.min(100,(key==='wake'?m.wakeSeconds:m.slideSeconds)/seconds*100);}
 return {metric:key,value:Number.isFinite(value)?Math.round(value*1000)/1000:null,mode:mode(r),condition:conditions(r),stat:boat.stats[stat],gear:clone({motor:boat.equipment.motor.speed,prop:boat.equipment.prop.turn}),context145:V().context(r)};}
function select(c,choice){const r=c?.series?.race,z=c?.lastResult;if(!r?.settled||z?.raceId!==r.id||c.ending)return false;
 if(c.reviewGoal141?.source===r.id&&(choice===undefined||c.reviewGoal141.trial145===choice))return true;
 const q=review(z,c.player);if(!q||choice!==undefined&&!['train','tune'].includes(choice))return false;
 c.reviewGoal141={version:1,source:r.id,key:q.key,drill:q.drill,title:q.title,part:['turn','power'].includes(q.key)?'prop':'motor',baseline:measurement(r,z,metricFor(q),q.key),actions:[],target:null,after:null};if(choice!==undefined){c.reviewGoal141.trial145=choice;c.reviewGoal141.title=V().plan(r,z,c.player).options.find(o=>o.id===choice).title;}return true;}
function prepared(c,action,key){const g=c?.reviewGoal141,r=c?.series?.race;if(!g||g.target||g.source===r?.id)return;
 if((!g.trial145||g.trial145===action)&&(action==='train'&&key===g.key||action==='tune'&&key===g.part)){const label=action==='train'?D.stats[key]+'の練習':key==='motor'?'モーター整備':'プロペラ整備';if(g.actions.length<8)g.actions.push(label);}}
function settle(c,r,z){record(c.player,r,z);const g=c.reviewGoal141;if(!g||g.target||g.source===r.id)return;
 g.target=r.id;g.after=measurement(r,z,g.baseline.metric,g.key);z.reviewComparison141=clone(g);}
function formatMeasure(m){if(m.value===null)return '比較できる完走記録なし';return m.metric==='st'?m.value.toFixed(3)+'秒':m.value.toFixed(['contacts','exit'].includes(m.metric)?0:1)+(['wake','slide'].includes(m.metric)?'%':'回');}
function comparison(g){if(!g?.after)return null;const a=g.baseline,b=g.after,comparable=a.mode===b.mode&&a.mode!=='unknown'&&a.value!==null&&b.value!==null;
 const differences=V().changes(a.context145,b.context145),delta=comparable?b.value-a.value:null;return {differences,label:metricNames[a.metric],before:formatMeasure(a),after:formatMeasure(b),delta,
 note:!comparable?'操作方式が違うか、比較できる記録が不足しています。':a.metric==='st'?'STの変化です。早いほど安全とは限りません。':Math.abs(delta)<.05?'今回の記録はほぼ同じでした。':(a.metric==='exit'?delta>0:delta<0)?'記録上、'+(a.metric==='exit'?'回数が増えました。':'数値が減りました。'):'記録上、'+(a.metric==='exit'?'回数が減りました。':'数値が増えました。'),
 conditions:(differences.length?'異なる条件・不足している記録：'+differences.join('、')+'。':'保存した比較条件は一致しています。')+' 一走ずつの比較です。展開や確率発動も影響し、練習・整備による効果とは断定できません。'};}
function validMeasure(m){return !!m&&V().validContext(m.context145)&&Object.hasOwn(metricNames,m.metric)&&(m.value===null||finite(m.value,-12,100000))&&modes.includes(m.mode)&&text(m.condition,240)&&finite(m.stat,0,150)&&m.gear&&['motor','prop'].every(k=>finite(m.gear[k],-100,100));}
function validGoal(g){return g===undefined||!!g&&g.version===1&&(g.trial145===undefined||['train','tune'].includes(g.trial145))&&text(g.source,150)&&D.statKeys.includes(g.key)&&kinds.includes(g.drill)&&text(g.title)&&['motor','prop'].includes(g.part)&&validMeasure(g.baseline)&&Array.isArray(g.actions)&&g.actions.length<=8&&g.actions.every(x=>text(x,40))&&((g.target===null&&g.after===null)||(text(g.target,150)&&g.target!==g.source&&validMeasure(g.after)&&g.after.metric===g.baseline.metric));}
// Replay frames retain positions, not a full physics snapshot. Restore nearby
// positions/speeds and rebuild wake trails; transient loads/effects restart.
function repeat(E,source,z){if(!source?.drive||!source.done||!z)return null;
 const q=review(z,own(source)),sd=source.drive,idx=sd.boats.findIndex(b=>b.isPlayer);if(idx<0)return null;
 let kind=q.drill,mark=q.mark;
 if(kind!=='start'&&mark===null){const incident=sd.events?.find(e=>e.athleteId===sd.boats[idx].id&&e.kind==='capsize');mark=incident?.t??q.sections.find(x=>x.index%4===0)?.t??R.startAt(sd)+5;}
 const frames=sd.replay?.frames||[],candidates=frames.filter(f=>f.t<=Math.max(0,(mark||0)-1.5)&&f.boats[idx][5]===0&&f.boats[idx][3]>=0&&f.boats[idx][3]<1750);
 const frame=kind==='start'?null:candidates.at(-1);if(!frame)kind='start';
 const r=clone(source);delete r.drive;delete r.result;delete r.cheer126;
 Object.assign(r,{phase:-1,done:false,settled:false,watch:false,auto:false,controlMode:'manual',drill:kind,practiceLimit:40,events:[],logs:[],cutins:[],instructions:[]});
 for(const n of r.runners){const b=sd.boats.find(b=>b.id===n.id);Object.assign(n,{course:b.course,stats:clone(b.stats),equipment:clone(b.equipment),skills:b.skills.slice(),mastery:clone(b.mastery),capsized:false,dnf:false,startFault:null,progress:0,score:0,phaseHistory:[],activations:[],debuffEvents:[],orders:[]});}
 r.drive=R.create(r,(sd.seed^141)>>>0,{keepCourses:true});const d=r.drive;d.startAt=R.startAt(sd);d.countdown=d.startAt;
 for(const k of ['balanceRule140','cpuStartRule','progressRule'])if(sd[k]===undefined)delete d[k];else d[k]=sd[k];
 if(frame){d.elapsed=frame.t;d.frame=Math.round(frame.t/R.DT);d.startAt=R.startAt(sd);d.countdown=Math.max(0,d.startAt-d.elapsed);d.started=d.elapsed>=d.startAt;
  d.boats.forEach((b,i)=>{const a=frame.boats[i],old=sd.boats[i],p=R.project(a[0],a[1]);Object.assign(b,{x:a[0],z:a[1],heading:a[2],progress:a[3],speed:a[4],vx:Math.cos(a[2])*a[4],vz:Math.sin(a[2])*a[4],engine:1,lastS:p.s,checkpoints:Math.max(0,Math.min(24,Math.floor(a[3]/75))),phase:R.phaseAt(R.mod(a[3],600)),startTime:old.startTime??.08,lane:p.radial||b.lane,posture:0,postureTarget:0});
   if(a[5]!==0){b.dnf=true;b.speed=b.vx=b.vz=0;}b.activations=[];b.effects=[];b.interference=[];
  });
  r.practiceLimit=Math.min(1800,R.own(d).progress+180);
  d.wakes=[];for(const f of frames.filter(f=>f.t<frame.t&&f.t>=frame.t-4))f.boats.forEach((a,i)=>{if(a[5]===0&&a[4]>3)d.wakes.push({owner:d.boats[i].id,x:a[0]-Math.cos(a[2])*2,z:a[1]-Math.sin(a[2])*2,fx:Math.cos(a[2]),fz:Math.sin(a[2]),t:f.t,strength:R.wakeStrength(a[4],R.performance(d.boats[i],d,r))});});d.wakes=d.wakes.slice(-96);
  d.events=[];d.eventSequence=0;d.logs=[];d.replay={version:1,from:frame.t,frames:[],events:[]};R.recordReplay(d,true);
 }
 r.practiceStart141=d.elapsed;r.repeat141={raceId:source.id,at:d.elapsed,approximate:!!frame};
 return {r,kind,seed:d.seed,initial:clone(r),repeat:true};}
function opponent(r,n){const p=own(r);if(!p||n.isPlayer)return null;
 const strength=D.statKeys.slice().sort((a,b)=>n.stats[b]-n.stats[a])[0],ours=D.statKeys.slice().sort((a,b)=>p.stats[b]-p.stats[a])[0],rough=r.env.weather==='雨'||r.env.windSpeed>=6;
 const skills=n.skills.map(id=>D.abilityMap[id]).filter(a=>a&&a.category!=='弱点'),water=skills.find(a=>a.condition==='rough'&&rough||a.condition==='calm'&&!rough||a.condition==='rain'&&r.env.weather==='雨'||a.condition==='cross'&&r.env.wind==='横風'||a.condition==='inner'&&n.course<=2||a.condition==='outer'&&n.course>=4),special=water||skills.find(a=>a.cpuStartBurst||a.signature||a.type==='debuff'||a.drive?.mechanics?.wakeEmit)||skills.find(a=>a.category!=='弱点');
 const early=R.cpuStartProfile(n).eligible,course=n.course<p.course?'相手が内側。第1ターンで艇間を詰めすぎず、出口の空いた線を探す。':'相手は同じか外のコース。進入で外へ広がりすぎず、出口の余白を残す。';
 const skillTip=special?.cpuStartBurst?'相手の踏み込みにつられず、自分の発進帯を見る。':special?.signature?.family==='doguchi'?'1周目の出力と終盤の反動を見比べ、3周で競る。':special?.signature?.family==='monkey'?'全速旋回の発動を見たら、出口で進路を重ねない。':special?.drive?.mechanics?.wakeEmit?'強い引き波を残す能力がある。真後ろの追走を短くする。':special?.type==='debuff'?'妨害能力がある。近距離で並び続けない進路も試す。':'';
 const target={speed:'直線へ入る前に船首を向け、伸びを使う',turn:'ターンの進入を整え、出口で舵を戻す',start:'助走の帯を確かめ、合法のスタートをそろえる',accel:'出口で舵を戻してから踏み直す',power:'波の中でも艇間を保ち、姿勢を中立から試す'}[ours];
 return {name:n.name,weapon:D.stats[strength]+' '+R.display(n.stats[strength])+(early?'・鋭いスタート':''),tip:course+' '+skillTip+' '+(rough?'雨風で艇が流れやすい。減速できる余白を取る。':'穏やかな水面でも前艇の引き波を長く踏まない。')+' 自分の'+D.stats[ours]+'を生かし、'+target+'。',skill:special?special.name+(water?'（今回のコース・水面に合う条件）':'（所持能力。発動は条件・確率による）'):'該当する特殊能力なし'};}
const defaults=Object.freeze({swap:false,size:1,y:0,inset:0,sensitivity:1,throttle:'hold',steer:'drag'});
function controls(q={}){return {swap:q.swap===true,size:finite(q.size,.8,1.3)?q.size:1,y:finite(q.y,0,80)?q.y:0,inset:finite(q.inset,0,60)?q.inset:0,sensitivity:finite(q.sensitivity,.5,1.8)?q.sensitivity:1,throttle:q.throttle==='toggle'?'toggle':'hold',steer:q.steer==='buttons'?'buttons':'drag'};}
function validControls(q){return q===undefined||!!q&&Object.keys(defaults).every(k=>q[k]===controls(q)[k]);}
function setControl(settings,key,value){if(!Object.hasOwn(defaults,key))return false;const q=controls(settings.controls141);q[key]=key==='swap'?value===true:['size','y','inset','sensitivity'].includes(key)?Number(value):value;
 if(!validControls(q))return false;settings.controls141=q;return true;}
function controlPanel(settings,prefix='control141-'){const q=controls(settings.controls141),select=(k,label,options)=>'<label>'+label+'<select id="'+prefix+k+'">'+options.map(([v,t])=>'<option value="'+v+'"'+(String(q[k])===String(v)?' selected':'')+'>'+t+'</option>').join('')+'</select></label>';
 return '<details class="controls141"><summary>操作の配置・押し方</summary><div class="control-fields141"><label><input id="'+prefix+'swap" type="checkbox"'+(q.swap?' checked':'')+'> 舵とアクセルを左右交換</label>'+select('size','ボタンの大きさ',[[.8,'小'],[1,'標準'],[1.15,'大'],[1.3,'最大']])+select('y','下端からの位置',[[0,'標準'],[24,'少し上'],[48,'上'],[80,'さらに上']])+select('inset','左右の位置',[[0,'外側'],[24,'少し内側'],[60,'内側']])+select('sensitivity','舵の感度',[[.5,'ゆっくり'],[.75,'ややゆっくり'],[1,'標準'],[1.4,'速め'],[1.8,'速い']])+select('steer','操舵', [['drag','ドラッグ'],['buttons','タップで左・中央・右を保持']])+select('throttle','アクセル',[['hold','押している間加速'],['toggle','タップで加速／減速を切替']])+'</div><p class="micro muted">一時停止・画面を離れたときは加速と舵を解除します。設定はレースの一時停止中にも変更できます。</p></details>';}
function controlHint(settings){const q=controls(settings.controls141);return (q.swap?'右が舵・左がアクセル。':'左が舵・右がアクセル。')+(q.steer==='buttons'?'舵は左・中央・右をタップ。':'舵は左右にドラッグ。')+(q.throttle==='toggle'?'加速はタップで入／切。':'押している間加速。');}
const tutorial=[{kind:'start',name:'スタート',goal:'時計の色帯を目安に加速し、有効な時間にラインを越えよう。'},{kind:'turn',name:'ターン',goal:'進入前に起こし、必要なら減速。出口で舵を戻して伏せよう。'},{kind:'wake',name:'引き波を避ける',goal:'前艇の真後ろから横へ。波のない側へ移り、進路を保とう。'}];
function tutorialPassed(t,summary){if(!summary?.completed)return false;const m=summary.metrics;return t.kind==='start'?true:t.kind==='turn'?m.contacts===0&&m.boundaries===0:m.contacts===0&&m.boundaries===0&&m.wakeSeconds<=Math.max(1,m.time*.3);}
function notices(d){const b=R.own(d);return {event:d.eventSequence-1,contacts:b.metrics.contacts+b.metrics.boundaries,wake:b.wakeLoad>.08,until:0,text:''};}
function notice(q,d){const b=R.own(d),fresh=d.events.filter(e=>e.index>q.event),touch=b.metrics.contacts+b.metrics.boundaries,wake=b.wakeLoad>.08,skill=fresh.filter(e=>e.kind==='ability'&&e.athleteId===b.id).at(-1);
 let s=touch>q.contacts?'接触 · いったん艇間を確保':wake&&!q.wake?'引き波に入った · 横の余白を探す':!wake&&q.wake?'引き波を抜けた':skill?'能力発動 · '+(D.abilityMap[skill.abilityId]?.name||''):'';
 q.event=d.eventSequence-1;q.contacts=touch;q.wake=wake;if(s){q.text=s;q.until=d.elapsed+2.2;}return d.elapsed<q.until?q.text:'';}
const API={mode,modeNames,setMode,record,validRecords,conditions,select,prepared,settle,comparison,validGoal,repeat,opponent,controls,validControls,setControl,controlPanel,controlHint,tutorial,tutorialPassed,notices,notice};root.KM_IMPROVE141=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);

