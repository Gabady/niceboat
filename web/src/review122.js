
/* V122: one read-only review for results and coaching. No state writes or RNG. */
(function(root){
'use strict';
const finite=v=>Number.isFinite(v),num=v=>finite(v)?v:0,positive=v=>Math.max(0,num(v));
const modeNames={manual:'自分で操船',assisted:'途中から観戦',auto:'おまかせ走行',spectator:'観戦モード',skip:'結果へスキップ',unknown:'操作方式の記録なし'};
const sectorName=i=>(Math.floor(i/4)+1)+'周目・'+['第1ターンまで','向こう正面','第2ターン','ホーム直線'][i%4];
const stamp=v=>finite(v)&&v>=0&&v<=283?v:null;

function sectionsOf(z){
 const m=z.driving?.metrics||{},q=m.craft||{},raw=Array.isArray(q.sectors)?q.sectors.filter(x=>x&&typeof x==='object'):[];
 const observations=Array.isArray(z.observation?.sections)?z.observation.sections:[];
 // The final partial sector's closing ranks/gaps are in the observation. Its
 // raw `current` object still contains its opening values, so do not guess them.
 const source=observations.length?observations:raw;
 return source.slice(0,13).filter(x=>x&&typeof x==='object').map((x,i)=>{
  const t=stamp(x.t??x.start),r=(t!==null?raw.find(y=>stamp(y.start)===t)||(stamp(q.current?.start)===t?q.current:null):null)||x;
  const duration=positive(r.seconds)||(finite(r.end)&&t!==null?Math.max(0,r.end-t):0)||(finite(source[i+1]?.t)&&t!==null?Math.max(0,source[i+1].t-t):0);
  const rank=finite(x.rank)?x.rank:num(r.rank),rankEnd=finite(x.rankEnd)?x.rankEnd:num(r.rankEnd);
  const contacts=r===q.current?Math.max(0,num(m.contacts)+num(m.boundaries)-num(r.contacts)):positive(r.contacts);
  return {name:typeof x.name==='string'?x.name:sectorName(Number.isInteger(r.index)&&r.index>=0?r.index:i),t,index:Number.isInteger(r.index)?r.index:i,
   rank,rankEnd,rankChange:rank>=1&&rank<=6&&rankEnd>=1&&rankEnd<=6?rankEnd-rank:0,
   speed:positive(x.speed!==undefined&&observations.length?x.speed:duration?num(r.speed)/duration*3.6:0),
   slide:positive(x.slide??r.slide),wake:positive(x.wake??r.wake),contacts,seconds:duration,
   gapChange:finite(x.gapChange)?x.gapChange:finite(r.gapEnd)&&finite(r.gap)?r.gapEnd-r.gap:0};
 });
}
function exposure(name,seconds,duration){return name+' '+seconds.toFixed(1)+'秒'+(duration>0?'（記録区間の約'+Math.min(100,Math.round(seconds/duration*100))+'%）':'');}
function sectorDetail(x){const facts=[];if(x.gapChange>3)facts.push('先頭との差 ＋'+x.gapChange.toFixed(1)+'m');if(x.rankChange>0)facts.push(x.rank+'位→'+x.rankEnd+'位');return x.name+'：'+(facts.join(' / ')||'走行を確認');}
function taskFromSection(x){
 const threshold=x.seconds>0?Math.max(1,x.seconds*.08):1;
 if(x.wake>=threshold&&x.wake>=x.slide)return {priority:'wake',key:'power',drill:'wake',title:'引き波のある区間の進路を試す',tip:'前走艇の真後ろを外す進路を試す',evidence:exposure('引き波',x.wake,x.seconds)+'。その区間の進路と速度を見返します。'};
 if(x.slide>=threshold)return {priority:'slide',key:'turn',drill:'turn',title:'横滑りした区間の進入を試す',tip:'進入速度と舵を戻すタイミングを一つずつ試す',evidence:exposure('横滑り',x.slide,x.seconds)+'。進入速度・姿勢・艇間を確認します。'};
 if(x.contacts>0)return {priority:'contact',key:'power',drill:'wake',title:'接触した区間の艇間を確認',tip:'進入前に余白をつくる進路を試す',evidence:'この区間の他艇・境界への接触 '+x.contacts+'回。接触前後の進路を見返します。'};
 return {priority:'section',key:'accel',drill:'turn',title:'差が開いた区間を見返す',tip:'該当区間の出口から再加速する流れを試す',evidence:'区間の変化は確認できますが、この記録だけでは主な原因を特定できません。'};
}

function review(z,player){
 if(!z||typeof z!=='object')return null;
 const m=z.driving?.metrics||{},q=m.craft||{},sections=sectionsOf(z),controlMode=Object.prototype.hasOwnProperty.call(modeNames,z.driving?.controlMode)?z.driving.controlMode:'unknown',manual=controlMode==='manual';
 const modeNote=manual?'':controlMode==='assisted'?'手動と自動が混在した記録です。区間ごとの操作主体は特定できません。':controlMode==='unknown'?'操作方式の記録がないため、操作の評価は行いません。':'観戦・自動走行の記録です。操作の評価ではありません。';
 const losses=sections.filter(x=>x.gapChange>3||x.rankChange>0).sort((a,b)=>b.gapChange-a.gapChange||b.rankChange-a.rankChange||(a.t??0)-(b.t??0)),loss=losses[0];
 const best=sections.filter(x=>x.rankChange<0).sort((a,b)=>a.rankChange-b.rankChange||a.gapChange-b.gapChange)[0];
 const finish=finite(z.driving?.time)&&!z.startFault&&!z.capsized&&!z.dnf;
 const success=best?best.name+'で '+best.rank+'位→'+best.rankEnd+'位':num(q.exitGood)>0?'ターン後の再加速を '+q.exitGood+'回記録':finish?'3周を完走':finite(m.contacts)&&finite(m.boundaries)&&m.contacts===0&&m.boundaries===0?'他艇・境界との接触なし':'今回の出走結果を記録';
 let task,detail,mark=loss?.t??null;
 if(z.startFault==='F'||z.startFault==='L'){
  task={priority:'start',key:'start',drill:'start',title:'スタート方針を確認',tip:z.startFault==='F'?'時計の帯を見て、踏み始めを少し遅らせて試す':'助走の目安を見て、踏み始めを少し早めて試す',evidence:z.startFault==='F'?'F：早発許容より早く通過しました。':'L：有効な時間内にスタートできませんでした。'};
  detail=z.startFault==='F'?'スタートでフライング':'スタートで出遅れ';
  // A loss-sector bookmark is not evidence for a start fault. The result does
  // not retain an exact crossing bookmark, so leave this task unmarked.
  mark=null;
 }else if(z.capsized){
  task={priority:'capsize',key:'turn',drill:'turn',title:'転覆前の余白を確認',tip:'進入速度・舵角・姿勢を一つずつ抑えて試す',evidence:'転覆を記録。速度・旋回・引き波・接触などの関与を、この結果だけで断定はできません。'};
  detail='転覆により未完走';mark=null;
 }else if(z.dnf){
  task={priority:'finish',key:'turn',drill:'turn',title:'完走へ向けて走行を確認',tip:'進行ガイドと立て直しを確認し、短い区間から試す',evidence:'未完走を記録。'+(loss?sectorDetail(loss)+'。':'途中の状況を確認できる記録が不足しています。')};
  detail='ゴールまでの走行を確認';
 }else if(loss){task=taskFromSection(loss);detail=sectorDetail(loss);}
 else{
  const duration=positive(z.driving?.time)||sections.reduce((s,x)=>s+x.seconds,0),slide=positive(m.slideSeconds),wake=positive(m.wakeSeconds),threshold=duration>0?Math.max(3,duration*.1):3;
  if(wake>=threshold&&wake>=slide){task={priority:'wake',key:'power',drill:'wake',title:'引き波のある進路を試す',tip:'前走艇の真後ろを外す進路を試す',evidence:exposure('走行中の引き波',wake,duration)+'。通過位置を変えて感触を確かめます。'};}
  else if(slide>=threshold){task={priority:'slide',key:'turn',drill:'turn',title:'ターンの進入を試す',tip:'進入速度と舵を戻すタイミングを一つずつ試す',evidence:exposure('走行中の横滑り',slide,duration)+'。進入速度と姿勢を確認します。'};}
  else if(!sections.length&&(positive(m.contacts)+positive(m.boundaries)>0)){task={priority:'contact',key:'power',drill:'wake',title:'接触場面の艇間を確認',tip:'進入前に余白をつくる進路を試す',evidence:'他艇接触 '+positive(m.contacts)+'回 / 境界接触 '+positive(m.boundaries)+'回。区間記録がなく、着順への影響は判断できません。'};}
  else{task={priority:'confirm',key:'accel',drill:'turn',title:best?'得意区間をもう一度確認':'次の走りを同じ条件で試す',tip:'出口で舵を戻し、再加速する流れを確認する',evidence:sections.length?'大きく差が開いた区間は記録されていません。得意な流れを同じ条件で確かめます。':'主な課題を判断できる区間記録がありません。操作練習で走りを確かめられます。'};}
  detail=sections.length?'大きな順位低下や差の拡大は記録されていません':'区間ごとの記録が不足しています';mark=null;
 }
 // Suggestions for nonmanual runs concern preparation. An optional drill must
 // never imply that the player's input caused an AI-observed incident.
 if(!manual)task={...task,tip:task.drill==='start'?'次走のスタート方針とスタート能力を確認する':task.drill==='wake'?'次走の水面と相手、進路方針を確認する':'次走の水面とティルト、旋回・加速の準備を確認する'};
 const evidence=(modeNote?modeNote+' ':'')+(loss&&task.priority!=='start'&&task.priority!=='capsize'&&task.priority!=='finish'?detail+'。':'')+task.evidence;
 return {...task,success,detail,evidence,mark,manual,controlMode,modeLabel:modeNames[controlMode],modeNote,sections,
  start:!z.startFault&&finite(z.startTime)?'ST '+(z.startTime>=0?'+':'')+z.startTime.toFixed(3)+'秒':null,
  observed:true,trainingLabel:manual?'この課題を操作練習で試す':'操作練習を試す（任意）'};
}
const API={review};root.KM_REVIEW=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

