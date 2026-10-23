
/* V146: local, bounded, whitelisted diagnostics. Never contains a save payload. */
(function(root){'use strict';
const pages=['title','new','home','action','preRace','race','raceResult','seriesResult','seriesIntro','quickResult','campaign','bonds','development','challenge145','cup143','exhibition','novel','registry','rivals','catalog','data','help','registration','cup','practice'];
const kinds=['campaign','rival','mentorIntro','mentor','heroine','event','request','epilogue','daily','retrospective','awakening','moment142','short143'];
const errors=['TypeError','RangeError','ReferenceError','SyntaxError','QuotaExceededError','SecurityError','AbortError'];
const actions=['series','prepare','ready','start','skipRace','instantRace','nextRace','endSeries','nextSeries','register','novelExit','resumeStory131','backAction','retrySave','closeModal','resume','progress144','startSeries','nextSeries','nextRace','prepareRace','train','tune','novelNext','novelPrev','novelClose','flowResume131','flowPause131','bondChoice','campaignChoice','rivalChoice','storyChoice','mentorChoice','requestChoice','awakeningChoice136','recover139','export','exportText','import','retrySave','memory146','support146','diagnostic146','diagnosticCopy146','diagnosticDownload146','diagnosticSave146','challengeStart145','raceStart','autoRace'];
const pick=(a,x,fallback='other')=>a.includes(x)?x:fallback;
const count=(x,max=1000)=>Number.isInteger(x)&&x>=0?Math.min(max,x):0;
function journal(){const recent=[],faults=[];return {
 action(name,page){recent.push({action:pick(actions,name),screen:pick(pages,page)});if(recent.length>12)recent.shift();},
 error(error,scope='action'){faults.push({type:pick(errors,error?.name,'Error'),scope:pick(['action','async','load','save','window','promise','import'],scope)});if(faults.length>3)faults.shift();},
 snapshot(s,page,health={},env={}){const c=s?.career,f=c?.flow131,r=env.activeQuick?s?.quick?.race:c?.series?.race;return {
  format:1,build:'147',screen:pick(pages,page),environment:{device:pick(['android','iphone','desktop'],env.device,'unknown'),entry:pick(['basic','android-safe','iphone-safe','editable','web'],env.entry,'unknown'),protocol:pick(['file:','https:','http:'],env.protocol,'other')},
  progress:{career:!!c,status:pick(['home','action','preRace','race','raceResult','seriesResult','seriesIntro','registration','ended'],c?.status,'none'),stage:count(c?.stage,8),races:count(c?.stats?.races),round:count(c?.series?.round,6),ending:!!c?.ending,registered:count(s?.registry?.length,1000)},
  story:{active:pick(kinds,f?.active?.kind,'none'),paused:!!f?.paused,reply:!!f?.reply,queued:count(f?.queue?.length,100),readCampaign:count(c?.campaign?.entries?.filter(e=>e.read).length,12)},
  race:{present:!!r,done:!!r?.done,mode:pick(['manual','auto','spectator','skip'],r?.controlMode,'none'),phase:typeof r?.phase==='number'?Math.max(-1,Math.min(100,r.phase)):null,physics:{driveVersion:count(r?.drive?.version,999),progressRule:count(r?.drive?.progressRule,999),cpuStartRule:count(r?.drive?.cpuStartRule,999),balanceRule:count(r?.drive?.balanceRule140,999)},context:env.activeQuick?'registered':'career'},
  storage:{main:health.main===true?'saved':health.main===false?'not-durable':'unknown',pending:count(health.pending?.length,100),otherPending:!!health.other?.length,failureKinds:[...new Set((health.pending||[]).map(x=>pick(['capacity','unavailable'],x.kind)))].slice(0,3)},
  recent:recent.map(x=>({...x})),errors:faults.map(x=>({...x}))
 };}
};}
function environment(location={},navigator={}){const ua=String(navigator.userAgent||''),path=String(location.pathname||'');return {device:/Android/i.test(ua)?'android':/iPhone|iPad|iPod/i.test(ua)||/Macintosh/.test(ua)&&navigator.maxTouchPoints>1?'iphone':'desktop',entry:/index_android_safe\.html$/.test(path)?'android-safe':/index_iphone_safe\.html$/.test(path)?'iphone-safe':/index_editable\.html$/.test(path)?'editable':/\/web\/index\.html$/.test(path)?'web':'basic',protocol:location.protocol};}
const impacts=[['新しい育成','通常シリーズの優勝戦・準優勝戦も観戦・結果スキップが可能です。能力・難易度の計算はV146と同じです。'],['育成中のデータ','開いている本文・返答・しおり、能力・機材・賞金を保持します。'],['登録選手','登録選手と過去の記録を保持します。手動の固定挑戦でスキップした新規記録は参考記録になり、自己ベストと表彰には含めません。'],['途中のレース','条件・位置・経過・失格は引き継ぎます。最優秀シリーズの最終戦は両プレイスタイルで手動必須となり、一時停止から再開します。']];
const api={journal,environment,impacts};root.KM_SUPPORT146=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

