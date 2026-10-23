
/* Evidence-led review. Reads race records only; never grants growth or consumes RNG. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null),Review=root.KM_REVIEW||(typeof require==='function'?require('./review122.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x)),finite=Number.isFinite;
function plan(r,z,p){
 const q=Review.review(z,p);if(!q)return null;const m=z.driving?.metrics||{},facts=[],factors=[];
 if(z.startFault)facts.push(z.startFault==='F'?'フライングを記録。':'スタートで出遅れを記録。');
 else if(z.capsized)facts.push('転覆により未完走。');else if(z.dnf)facts.push('未完走。');else if(Number.isInteger(z.place))facts.push(z.place+'着でゴール。');
 if(!z.startFault&&finite(z.startTime))facts.push('スタートタイミング '+z.startTime.toFixed(3)+'秒。');
 if(finite(m.contacts)&&finite(m.boundaries))facts.push('他艇との接触 '+m.contacts+'回、境界との接触 '+m.boundaries+'回。');
 if(finite(m.slideSeconds))facts.push('横滑りを '+m.slideSeconds.toFixed(1)+'秒記録。');
 if(finite(m.wakeSeconds))facts.push('引き波内の走行を '+m.wakeSeconds.toFixed(1)+'秒記録。');
 const loss=q.sections.filter(x=>x.rankChange>0||x.gapChange>3).sort((a,b)=>b.gapChange-a.gapChange||b.rankChange-a.rankChange)[0];
 if(loss)facts.push(loss.name+'：'+(loss.rankChange>0?loss.rank+'位 → '+loss.rankEnd+'位。':'先頭との差が '+loss.gapChange.toFixed(1)+'m広がった。'));
 const notes={start:'踏み始めの時機、スタート能力、発動した特殊能力が関係する可能性があります。',capsize:'進入速度、舵角、姿勢、引き波や接触の重なりを確認する余地があります。',finish:'途中の接触や進路を確認できますが、記録だけでは未完走の原因を特定できません。',wake:'前艇との位置関係、風、フィジカルや特殊能力が関係する可能性があります。',slide:'進入速度、舵を戻す時機、旋回能力、機材や水面が関係する可能性があります。',contact:'艇間、相手の進路、風や接触時の姿勢が関係する可能性があります。',section:'加速だけでなく、前後の進路、接触、相手の走りも差に関係する可能性があります。',confirm:'目立つ損失を特定できないため、得意な流れを次走で確認する方針も選べます。'};
 factors.push(notes[q.priority]||notes.confirm);
 if(!q.sections.length)factors.push('区間記録が不足しているため、どこで着順に影響したかは判断できません。');
 const part=['turn','power'].includes(q.key)?'prop':'motor',metric=q.drill==='start'?'st':q.priority==='contact'?'contacts':q.drill==='wake'?'wake':q.key==='accel'?'exit':'slide';
 const word={wake:'引き波',slide:'横滑り',contact:'接触',start:'スタート'}[q.priority];if(word){const first=facts[0],focused=facts.filter(t=>t.includes(word));facts.splice(0,facts.length,...new Set([first,...focused,...facts].filter(Boolean)));}
 return {q,facts,factors,metric,options:[{id:'train',kind:'train',key:q.key,part,title:D.stats[q.key]+'の練習を試す',text:'次の準備で'+D.stats[q.key]+'を練習し、同じ指標の変化を見ます。'},{id:'tune',kind:'tune',key:q.key,part,title:(part==='motor'?'モーター':'プロペラ')+'の整備を試す',text:'次の準備で'+(part==='motor'?'モーター':'プロペラ')+'を整備し、同じ指標の変化を見ます。'}]};
}
function config(settings){return {postureAssist:settings?.postureAssist===true,controls:copy((root.KM_IMPROVE141||(typeof require==='function'?require('./improve141.js'):null)).controls(settings?.controls141))};}
function track(r,settings){if(!r||r.done)return;const now=config(settings);if(!r.reviewSettings145)r.reviewSettings145={initial:now,current:copy(now),changed:false};else{const q=r.reviewSettings145;if(JSON.stringify(q.current)!==JSON.stringify(now)&&r.drive?.frame>0)q.changed=true;q.current=now;}}
function context(r){const b=r.drive?R.own(r.drive):r.runners.find(n=>n.isPlayer),sig=x=>JSON.stringify(x);
 return {version:1,water:sig([r.venue.id,r.env]),course:b.course,player:sig([b.stats,b.skills,b.mastery]),gear:sig(b.equipment),setup:sig([r.strategy,R.tiltValue(r)]),opponents:sig(r.runners.filter(n=>!n.isPlayer).map(n=>[n.id,n.stats,n.skills,n.equipment]).sort((a,b)=>a[0].localeCompare(b[0]))),rules:sig([r.difficulty,r.grade,r.drive?.balanceRule140,r.drive?.cpuStartRule,r.drive?.progressRule]),controls:r.drive?.controlUse141?.auto>0&&!r.drive.controlUse141.manual?'auto':r.reviewSettings145?sig(r.reviewSettings145.current):null,changed:r.reviewSettings145?.changed===true};
}
function changes(a,b){if(!a||!b)return ['旧記録には比較条件の詳細がありません'];const names={water:'会場・天候・風',course:'コース',player:'能力・特殊能力',gear:'機材',setup:'作戦・ティルト',opponents:'対戦相手',rules:'走行ルール',controls:'操作設定・補助'};const out=Object.keys(names).filter(k=>a[k]!==b[k]).map(k=>names[k]);if(a.changed||b.changed)out.push('走行途中の操作設定変更');if(a.controls===null||b.controls===null)out.push('操作設定の記録不足');return out;}
function validContext(c){return c===undefined||!!c&&c.version===1&&Number.isInteger(c.course)&&c.course>=1&&c.course<=6&&['water','player','gear','setup','opponents','rules'].every(k=>typeof c[k]==='string'&&c[k].length<=30000)&&(c.controls===null||typeof c.controls==='string'&&c.controls.length<=2000)&&typeof c.changed==='boolean';}
function validSettings(q){if(q===undefined)return true;const I=root.KM_IMPROVE141||(typeof require==='function'?require('./improve141.js'):null);return !!q&&typeof q.changed==='boolean'&&[q.initial,q.current].every(c=>c&&typeof c.postureAssist==='boolean'&&I.validControls(c.controls)&&c.controls!==undefined);}
const api={plan,config,track,context,changes,validContext,validSettings};root.KM_REVIEW145=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

