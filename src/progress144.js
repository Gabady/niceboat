/* Shared progression rules. No random draws, timers, DOM or implicit repairs. */
(function(root){
'use strict';
const states={series:['home'],prepare:['seriesIntro','between'],pre:['action'],backAction:['preRace'],start:['preRace'],skipRace:['preRace','race'],instantRace:['preRace','race'],result:['race','raceResult'],nextRace:['raceResult'],nextSeries:['seriesResult'],register:['home','seriesIntro','action','preRace','raceResult','seriesResult','registration']};
const labels={series:'シリーズへ進む',prepare:'次のレースの準備へ',pre:'出走表へ',backAction:'練習・整備に戻る',start:'自分で操船する',skipRace:'観戦モード',instantRace:'結果へスキップ',result:'レース結果へ',nextRace:'次のレースへ',nextSeries:'次のシリーズへ',register:'選手を登録する',resumeStory131:'物語の続きを読む'};
const detailKeys=['prep.player','prep.gear','prep.people','prep.logs','race.field','race.outlook','race.standing','result.finish','result.review','series.record','series.story'];
function qualifiers(c){return c?.short143?2:5;}
function decision(s,action,options={}){
 const c=s?.career,r=c?.series?.race,fail=(reason,recovery='recover139')=>({action,label:labels[action]||'現在の進行へ',allowed:false,reason,recovery});
 if(options.busy)return fail('レース結果を計算しています。');
 if(options.quick){
  const qr=s?.quick?.race,recovery=s?.quick?.challenge145?'challenge145':s?.cup143?'cup143':'exhibition';
  if(!['instantRace','result'].includes(action)||!qr)return fail('現在の大会・展示レースを確認してください。',recovery);
  if(action==='result'&&!qr.done)return fail('レースがまだ終了していません。',recovery);
  if(action==='instantRace'&&(qr.done||options.manualRequired))return fail(qr.done?'レース結果を確認してください。':'このレースは自分で操船します。',recovery);
  return {action,label:labels[action],allowed:true,reason:''};
 }
 if(!c)return fail('育成中の選手がいません。','title');
 if(action==='resumeStory131')return c.flow131?.active?{action,label:labels[action],allowed:true,reason:'中断した本文と読み位置から再開します。'}:fail('読みかけの自動会話はありません。');
 if(!states[action])return fail('この操作は現在の画面では使えません。');
 if(!states[action].includes(c.status))return fail('進行が変わりました。現在の画面へ戻ります。');
 if(c.flow131?.active)return fail('途中の物語を読み終えると進めます。','resumeStory131');
 if(action==='prepare'&&(!c.series||c.series.completed))return fail('次のレースを準備できる状態ではありません。');
 if(['pre','backAction','start','skipRace','instantRace'].includes(action)&&(!r||r.done))return fail('出走前、または走行中のレースがありません。');
 if(['skipRace','instantRace'].includes(action)&&options.manualRequired)return fail('最優秀シリーズの最終戦は自分で操船します。');
 if(action==='result'&&!r?.done)return fail('レースがまだ終了していません。');
 if(action==='nextRace'&&(!r?.done||!r.settled||c.lastResult?.raceId!==r.id))return fail('このレースの結果を確認してから進んでください。');
 if(action==='nextSeries'&&(c.ending||!c.series?.completed))return fail(c.ending?'育成は終了しています。選手を登録できます。':'シリーズ結果がまだ確定していません。');
 if(action==='register'&&s.registry.length>=50)return fail('登録上限50名です。名鑑で登録枠を空けてください。','registry');
 let label=labels[action];
 if(action==='prepare'&&c.status==='seriesIntro')label='第1走の準備へ';
 if(action==='nextRace')label=r.type!=='qualifier'?'シリーズ結果へ':c.series.round===qualifiers(c)?'予選順位を確定する':'次のレースへ';
 return {action,label,allowed:true,reason:''};
}
function primary(s,options={}){
 const c=s?.career;if(!c)return {action:'new',label:'選手をつくる',allowed:true,reason:''};
 let action=c.flow131?.active?'resumeStory131':({home:'series',seriesIntro:'prepare',between:'prepare',action:'pre',preRace:'start',race:'result',raceResult:'nextRace',seriesResult:c.ending?'register':'nextSeries',registration:'register'})[c.status];
 if(c.status==='preRace'&&!c.flow131?.active&&!options.manualRequired&&c.playMode141==='development')action='skipRace';
 const q=decision(s,action||'recover139',options),a=c.series?.action;
 if(q.allowed&&c.status==='action'&&action==='pre'&&a)q.reason=a.training+a.tune+a.normal>0?'残りの行動を使わずに進むこともできます。':'準備を終えました。出走表で相手と条件を確認できます。';
 return q;
}
function token(s){const c=s?.career,r=c?.series?.race,f=c?.flow131,a=c?.series?.action;return JSON.stringify([c?.player?.id||'',c?.transition144||0,c?.seed,c?.status,c?.stage,r?.id,c?.series?.round,!!r?.done,!!r?.settled,c?.lastResult?.raceId,a?.training,a?.tune,a?.normal,f?.active?.key||'',f?.reply?.key||'',s?.registry?.length,s?.cup143?.id,s?.cup143?.round,s?.quick?.race?.id,s?.challenge145?.id,s?.challenge145?.round,!!s?.challenge145?.complete]);}
function valid(s){const n=s?.career?.transition144,d=s?.settings?.details144;return (n===undefined||Number.isSafeInteger(n)&&n>=0)&&(d===undefined||d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).every(k=>detailKeys.includes(k)&&typeof d[k]==='boolean'));}
function detail(settings,key,open){if(!detailKeys.includes(key)||typeof open!=='boolean')return false;const d=settings.details144||{};if(!!d[key]===open)return false;settings.details144={...d,[key]:open};return true;}
// Stage changes on a copy. Commit only after the whole operation succeeds.
// Preserve existing object references used by the live race/UI and nested callers.
const drafts=new WeakSet();
function merge(target,source,seen=new WeakMap()){
 if(source===null||typeof source!=='object')return source;
 if(seen.has(source))return seen.get(source);
 if(!target||typeof target!=='object'||Array.isArray(target)!==Array.isArray(source))target=Array.isArray(source)?[]:{};
 seen.set(source,target);
 for(const k of Object.keys(target))if(!Object.hasOwn(source,k))delete target[k];
 if(Array.isArray(source))target.length=source.length;
 for(const k of Object.keys(source))target[k]=merge(target[k],source[k],seen);
 return target;
}
function transaction(s,fields,work){
 if(drafts.has(s))return work(s);
 const selected=Object.fromEntries(fields.map(k=>[k,s[k]])),before=JSON.stringify(selected),copy=JSON.parse(before),draft={...s,...copy};drafts.add(draft);
 let result;try{result=work(draft);}finally{drafts.delete(draft);}
 if(JSON.stringify(Object.fromEntries(fields.map(k=>[k,draft[k]])))===before)return result;
 if(fields.includes('career')&&draft.career)draft.career.transition144=(s.career?.transition144||0)+1;
 const seen=new WeakMap();for(const k of fields)s[k]=merge(s[k],draft[k],seen);
 return result;
}
function career(c,work){if(!c)return null;return transaction({career:c},['career'],s=>work(s.career));}
const api={states,labels,decision,primary,token,valid,detail,detailKeys,transaction,career};root.KM_PROGRESS144=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
