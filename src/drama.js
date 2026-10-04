

/* V106: recorded story branches and thematic decisions. No DOM or random draws on reads. */
(function(root){'use strict';
const A=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);

const B=root.KM_DRAMA_DATA||(typeof require==='function'?require('./drama-data.js'):null),D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x)),keys=D.statKeys,whole=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b,str=(x,n=3000)=>typeof x==='string'&&x.length<=n;
const Craft=root.KM_CRAFT||(typeof require==='function'?require('./craft118.js'):null);
const specFor=(t,e)=>e.choiceMode==='paths'?B.paths118[t.arc][e.choiceSpec]:B.decisions[t.arc][e.choiceSpec];
const decisions=[-1,1,3,5,7,8],rivalStages=[0,2,4,6,8];
function gain(c,key,value,api){const before=Math.floor(c.player.stats[key]);api.growStat(c.player,key,value*1.5*api.statGrowthRate(c.player.stats[key])*api.growthFactor(c.player));return Math.floor(c.player.stats[key])-before;}
function entry(c,kind,stage,result){const t=c.campaign,prev=t.entries.filter(x=>x.decision).at(-1),di=decisions.indexOf(kind==='opening'?-1:stage),hasChoice=kind==='opening'||kind==='season'&&di>=0;let branch='contest';const last=t.entries.filter(x=>x.kind==='season').at(-1),wins=c.stats.wins,races=c.stats.races;
 if(kind==='season'){
  if(stage>=2&&wins>=8&&races>=10&&wins/races>=.60)t.dominance=true;
  branch=t.dominance?(result.outcome==='setback'?'fracture':last?.branch==='fracture'?'rebound':'crown'):result.outcome==='setback'?'pressure':last?.outcome==='setback'?'rebound':'contest';
 }
 return {choiceMode:t.edition>=118?'paths':'legacy',observation:kind==='season'?Craft.storyBeat(c):null,id:kind==='season'?'season:'+stage:kind,kind,stage,outcome:result?.outcome||'steady',strong:keys.slice().sort((a,b)=>c.player.stats[b]-c.player.stats[a])[0],weak:null,read:false,late:kind==='opening'&&stage>0,legacy:false,branch,wins,races,prior:prev?.decision?prev.decision.index:null,priorText:prev?.decision?specFor(t,prev)[prev.decision.index]:'',priorAligned:prev?.decision?prev.decision.aligned:null,choiceSpec:hasChoice?di:null,decision:null,...(kind==='season'?{result:{rank:result.rank,place:result.place,type:result.type,champion:result.champion}}:{})};
}
function ensure(c,legacy){
 if(!c.campaign){c.campaign={version:2,arc:B.arcs[c.player.scenario]?c.player.scenario:'light',edition:119,origin:c.stage,entries:[],closed:false,dominance:false};c.campaign.entries.push(entry(c,'opening',c.stage));freezeScene(c.campaign,c.campaign.entries[0]);}
 else if(c.campaign.version===1&&!c.campaign.closed){c.campaign.version=2;c.campaign.dominance=false;c.campaign.entries.forEach(e=>e.legacy=true);}
 return c.campaign;
}
function capture(c,z,legacy){const t=ensure(c);if(t.version===1)return legacy.capture(c,z);if(t.closed)return t;const id='season:'+z.stage;if(!t.entries.some(e=>e.id===id))t.entries.push(entry(c,'season',z.stage,{outcome:legacy.outcome(z),rank:z.qualificationRank,place:z.finalPlace,type:z.finalType,champion:!!z.champion}));const fresh=t.entries.find(e=>e.id===id);if(fresh&&!fresh.legacy)freezeScene(t,fresh);if(c.ending==='gate')close(c,'gate',legacy);else if(z.stage===8)t.closed=true;return t;}
function close(c,kind,legacy){const t=ensure(c);if(t.version===1)return legacy.close(c,kind);if(!t.closed){t.entries.push(entry(c,kind,c.stage));freezeScene(t,t.entries.at(-1));t.closed=true;}return t;}
function scene(t,id,legacy){const e=t?.entries.find(x=>x.id===id);if(!e)return null;if(t.version===1||e.legacy)return legacy.scene(t,id);const a=B.arcs[t.arc],actor=B.actors[t.arc];let title,body;
 if(e.kind==='opening'){title='序章 · '+a.title;body=a.intro.slice();}
 else if(e.kind==='season'){const ch=a.chapters[e.stage];title=ch[0];body=ch[1].slice();
  body.push(e.result.champion?'今節の結果は優勝。':e.result.type==='eliminated'?'今節は予選敗退となった。':'最終戦は'+e.result.place+'着だった。');
  body.push(B.outcomes[t.arc][e.outcome]);if(e.observation)body.push(...e.observation.body);
  body.push(...(t.arc==='recovery'?B.recoveryBranches[e.branch]:B.branches[e.branch].body));
  if(e.prior!==null){body.push('前回の返答：'+e.priorText);body.push(actor+'「'+(e.priorAligned?({light:'前に決めた準備、今回はどう使えた？',back:'前に決めたこと、今回も試せた？　できた所から聞こう。',shore:'前に話したこと、どうだった？　できなかった所も聞かせて。',recovery:'前に決めたこと、今日の身体と走りでどう使えた？'})[t.arc]:({light:'前は、そこをうまく話せなかったな。今日はお前の考えを聞きたい。',back:'前の返事は覚えてる。今回のレースを見て、考えが変わった所はある？',shore:'前の話、まだ気になってる。急いで約束し直す前に、今の気持ちを聞かせて。',recovery:'前の答えは覚えてる。今も同じ考えか、変わった所があるか、聞かせてくれ。'})[t.arc])+'」');}
 }else{title=e.kind==='gate'?'最高峰へ届かなかった日':'育成の区切り';body=[e.kind==='gate'?'SG進出の必要賞金には届かなかった。':'今回は、ここで育成を区切ることにした。',...({recovery:B.recoveryClose,light:[
 '父「予定表、片づけるのか」','主人公「うん。まだ見ていたい気もするけど」','父「急いで捨てることはない。今日のうちに、何ができたか話しておこう」','主人公「駄目だった話も長くなるぞ」','父「聞くと言っただろ。飯を食ってから、最初から頼む」'],back:[
 '奏斗「今日は何から話す？」','主人公「今すぐ次の話をされると、少し困る」','奏斗「じゃあ今日の話。悔しい、からでもいい」','主人公「悔しいよ。予想してても、実際に終わると違う」','奏斗「分かった。ノートはそのまま持ってきて。俺も聞く」'],shore:[
 '紗枝「おかえり。いつもの席、空いてるよ」','主人公「いい報告ばかりにはならないけど」','紗枝「最初から、そういう約束でしょ」','陸「僕も今日ミスした。先にどっちが話す？」','主人公「じゃあ、自分から。最後まで聞いてくれ」']})[t.arc]];}
 if(e.choiceSpec!==null&&e.choiceSpec!==undefined&&!e.decision)body.push(actor+'「'+({light:'それで、今はどう考えてる？　お前の返事を聞かせてくれ。',back:'君はどうしたい？　俺の予想じゃなく、本人の答えを聞きたい。',shore:'今、どうしたいか聞かせて。できそうなことから、一緒に考えよう。',recovery:'今の考えを聞かせてくれ。昔と違う答えでも、構わない。'})[t.arc]+'」');
 if(e.prose){title=e.prose.title;body=e.prose.body.slice();}
 if(e.decision)body.push('選んだ返答：'+specFor(t,e)[e.decision.index],e.decision.note);
 return {title,body,arc:a.title,stage:e.stage,kind:e.kind,result:e.result||null,branch:B.branches[e.branch]?.name||'',choices:e.choiceSpec!==null&&e.choiceSpec!==undefined&&!e.decision?specFor(t,e).slice(0,2):[]};
}
function freezeScene(t,e){const sc=scene(t,e.id);if(sc&&!e.prose)e.prose={title:sc.title,body:sc.body.slice()};}
function pending(t){return t?.version===2?t.entries.filter(e=>!e.legacy&&e.choiceSpec!==null&&!e.decision):[];}
function choose(c,id,index,api){const t=c.campaign,e=t?.entries.find(x=>x.id===id);if(t?.version!==2||!e||pending(t)[0]!==e||!whole(index,0,1)||c.status==='race'||c.series?.race?.drive&&!c.series.race.done)return null;
 const spec=specFor(t,e),modern=e.choiceMode==='paths',aligned=modern||index===spec[2],key=modern?spec[2+index]:spec[3],amount=aligned?gain(c,key,modern?.16:.32,api):0;let skill=null;const score=t.entries.filter(x=>x.decision?.aligned).length+(aligned?1:0);
 if(e.kind==='season'&&e.stage===8&&aligned&&score>=4&&(!modern||Craft.g1Champion(c)&&Object.values(c.development.paths).some(p=>p.branch!==null))){const id=B.rewardSkills[t.arc];skill=api.acquire(c,c.player,id,'物語で選び抜いた道').id;}
 const note=(modern?spec[4+index]:B.mainReplies[t.arc][e.choiceSpec][aligned?0:1])+(modern&&e.stage===8&&!skill?'\nこの物語で技の伝授を受けるには、本編で4回以上返答を選ぶこと、G1での優勝経験、いずれかの技の開花が必要です。今回は技の伝授はありません。選択と会話は記録に残りました。':'');
 e.decision={index,aligned,key,gain:amount,skill,note};e.read=true;return {title:aligned?'言葉を走りへ':'残った問い',note,stat:key,gain:amount,skill,rewards:[...(aligned?[D.stats[key]+'＋'+amount+(amount===0?'（端数蓄積）':'')]:['今回は成長・伝授なし']),...(skill?[D.abilityMap[skill].name+'を獲得']:[])]};
}
function valid(t,legacy){if(t?.version===1)return legacy.valid(t);if(!t||t.version!==2||!B.arcs[t.arc]||!whole(t.origin,0,8)||typeof t.closed!=='boolean'||typeof t.dominance!=='boolean'||!Array.isArray(t.entries)||!t.entries.length||t.entries.length>12||t.entries[0].kind!=='opening'||new Set(t.entries.map(e=>e.id)).size!==t.entries.length)return false;
 let last=t.origin;return t.entries.every((e,i)=>{if(!whole(e.stage,last,8)||!['opening','season','gate','early'].includes(e.kind)||typeof e.read!=='boolean'||!['win','steady','setback'].includes(e.outcome)||!['balanced',...keys].includes(e.strong)||e.weak!==null&&!keys.includes(e.weak))return false;last=e.stage;
 if(i===0?(e.id!=='opening'||e.stage!==t.origin):e.kind==='opening')return false;
 if(e.kind==='season'){const z=e.result;if(!z||e.id!=='season:'+e.stage||!whole(z.rank,1,20)||!['championship','consolation','eliminated'].includes(z.type)||(z.type==='eliminated'?z.place!==null:!whole(z.place,1,6))||typeof z.champion!=='boolean'||e.outcome!==legacy.outcome({champion:z.champion,finalType:z.type,finalPlace:z.place})||z.champion&&(z.type!=='championship'||z.place!==1))return false;}
 if(['gate','early'].includes(e.kind)&&(e.id!==e.kind||i!==t.entries.length-1||!t.closed))return false;
 if(e.prose&&(!str(e.prose.title,160)||!Array.isArray(e.prose.body)||e.prose.body.length>100||!e.prose.body.every(v=>str(v,3000))))return false;
 if(e.legacy===true)return true;
 if(e.legacy!==false||!str(e.priorText,200)||![null,true,false].includes(e.priorAligned)||!B.branches[e.branch]||!whole(e.wins,0,60)||!whole(e.races,e.wins,60)||!([null,0,1].includes(e.prior))||!(e.choiceSpec===null||whole(e.choiceSpec,0,5)))return false;
 const expected=e.kind==='opening'?0:e.kind==='season'?decisions.indexOf(e.stage):-1;if(e.choiceSpec!==(expected<0?null:expected))return false;
 if(e.choiceMode!==undefined&&!['legacy','paths'].includes(e.choiceMode))return false;if(e.observation&&(!['start','retire','contact','win','finish'].includes(e.observation.id)||!Array.isArray(e.observation.body)||e.observation.body.length>4||!e.observation.body.every(v=>str(v))))return false;
 const q=e.decision;if(!q)return q===null;const spec=specFor(t,e),modern=e.choiceMode==='paths';return !!spec&&whole(q.index,0,1)&&q.aligned===(modern||q.index===spec[2])&&q.key===(modern?spec[2+q.index]:spec[3])&&whole(q.gain,0,5)&&str(q.note)&&(!q.aligned?q.gain===0&&!q.skill:true)&&(!q.skill||e.stage===8&&q.aligned&&q.skill===B.rewardSkills[t.arc]&&t.entries.filter(x=>x.decision?.aligned).length>=4);});}
function rivalState(c){const r=c.development.rival;if(!r.drama)r.drama={version:1,entries:[],reward:null};return r.drama;}
function rivalGate(c){const q=rivalState(c),i=q.entries.filter(e=>e.decision).length,affinity=A.gate(c,'rival');if(i===4&&!affinity.open)return {index:i,open:false,affinity,reason:'最終話まで 好感度あと'+affinity.remaining+'。さらに交流を深める必要があります。特訓やレースでの先着を重ねましょう。'};return {index:i,open:i<5&&c.stage>=rivalStages[i]&&!c.ending&&c.status!=='race'&&!(c.series?.race?.drive&&!c.series.race.done),reason:i>=5?'ライバルの全5話を読了':c.stage<rivalStages[i]?D.stages[rivalStages[i]].name+'から次の話へ':'次の話を読めます'};}
function rivalRead(t,person,index){const e=t.rival.drama?.entries.find(x=>x.index===index);if(!e)return null;const ch=B.rivals[t.rival.cast].chapters[e.index];let title=ch[0],body=ch[1].slice();if(e.record)body.push(e.record.won?'直近の対戦では、自分が先着した。':'直近の対戦では、相手が先着した。',e.record.won?person.name+'「次は同じ所で負けないから、油断しないでくれよ」':'主人公「次は追いつきたい。今日の映像も、後で見せてくれる？」');if(e.prose){title=e.prose.title;body=e.prose.body.slice();}
 if(e.decision)body.push('選んだ返答：'+ch[2][e.decision.index],e.decision.note);return {key:'rival106:'+person.id+':'+e.index,title,person,background:'harbor',body,choices:[],index:e.index};}
function rivalScene(c,person){const q=rivalState(c),g=rivalGate(c);let e=q.entries.find(x=>!x.decision);if(!e&&g.open){if(g.index===4)A.unlock(c,'rival');const last=c.development.rival.history.at(-1);e={index:g.index,stage:c.stage,record:last?{won:last.won,place:last.place,other:last.other}:null,decision:null};q.entries.push(e);}if(!e)e=q.entries.at(-1);if(!e)return null;const sc=rivalRead(c.development,person,e.index);if(!e.decision&&g.open)sc.choices=B.rivals[c.development.rival.cast].chapters[e.index][2];return sc;}
function chooseRival(c,index,choice,api){const q=rivalState(c),g=rivalGate(c),e=q.entries.find(x=>x.index===index);if(!g.open||!e||e.decision||index!==g.index||!whole(choice,0,1))return null;const def=B.rivals[c.development.rival.cast],ch=def.chapters[index],person=api.Development.rival(c),aligned=choice===ch[3],amount=aligned?gain(c,person.key,.35,api):0;let skill=null;
 const score=q.entries.filter(x=>x.decision?.aligned).length+(aligned?1:0),won=c.development.rival.history.some(x=>x.won);
 if(index===4&&aligned&&score>=4&&won){const id={speed:'burst',turn:'split',start:'entry',accel:'wit_latebird',power:'anchor'}[person.key];skill=api.acquire(c,c.player,id,person.name+'と磨いた技').id;q.reward=skill;}
 const note=def.replies[index][aligned?0:1]+(index===4&&!skill?'\n今回は伝授なし。これまでの対話と先着の条件には届かなかった。':'');
 e.decision={index:choice,aligned,key:person.key,gain:amount,skill,note};const affection=A.choice(c,'rival',null,aligned);return {title:ch[0],note,skill,rewards:[...(aligned?[D.stats[person.key]+'＋'+amount+(amount===0?'（端数蓄積）':'')]:['今回は成長なし']), '好感度 '+(affection.delta>=0?'＋':'')+affection.delta]};}
function validRival(q,cast){if(q===undefined)return true;const def=B.rivals[cast];if(!def||q.version!==1||!Array.isArray(q.entries)||q.entries.length>5||!(q.reward===null||D.abilityMap[q.reward]))return false;if(q.reward&&(q.entries.length!==5||q.entries.at(-1)?.decision?.skill!==q.reward||q.entries.filter(x=>x.decision?.aligned).length<4))return false;let open=false;return q.entries.every((e,i)=>{if(e.index!==i||!whole(e.stage,rivalStages[i],8)||open)return false;if(e.record&&(!whole(e.record.place,1,6)||!whole(e.record.other,1,6)||typeof e.record.won!=='boolean'))return false;if(!e.decision){open=true;return e.decision===null;}const d=e.decision;return whole(d.index,0,1)&&d.aligned===(d.index===def.chapters[i][3])&&keys.includes(d.key)&&whole(d.gain,0,5)&&str(d.note)&&(!d.skill||i===4&&d.aligned&&D.abilityMap[d.skill]);});}
function opportunities(c,api){if(!c||c.status==='race'||c.status==='registration'&& !c.ending)return [];const out=[],t=c.campaign,p=c.story?.pending;
 if(p&&p.kind==='event'){const e=api.Story.resolve(p);if(e.choices.some(x=>x.effect&&(x.effect.stat||x.effect.best||x.effect.worst||x.effect.skill||x.effect.learn)))out.push({id:'event',label:e.title,kind:'成長の機会',when:'出走まで',action:'eventTalk',value:''});}
 const m=api.Cast.routeGate(c);if(m.open)out.push({id:'mentor',label:api.Cast.map[c.cast.mentor.id].name+' 第'+(api.Cast.routeState(c).step+1)+'話',kind:'学びの機会',when:'会話できます',action:'mentor',value:''});
 const e=pending(t)[0];if(e)out.push({id:'main',label:'メインシナリオで返答を選べます',kind:'成長の機会',when:'育成の登録まで',action:'campaign',value:c.player.id});
 if(api.Finale?.routeGate(c))out.push({id:'rival-path',label:api.Development.rival(c).name+'との道を決める',kind:'物語の分岐',when:'会話できます',action:'rivalPath',value:''});
 const r=rivalGate(c);if(r.open)out.push({id:'rival',label:api.Development.rival(c).name+'との対話',kind:'学びの機会',when:'会話できます',action:'mainRival',value:''});
 for(const k of keys)if(api.Development.ready(c,k))out.push({id:'bloom:'+k,label:D.stats[k]+'の技を開花できます',kind:'習得可能',when:'技を選ぶ',action:'development',value:''});
 for(const h of api.Bonds.metHeroines(c)){const gate=api.Bonds.gate(c,h.id);if(gate.open&&gate.chapter)out.push({id:'bond:'+h.id,label:h.name+'からの連絡',kind:'交流の機会',when:'会話できます',action:'bonds',value:''});}
 return out;
}
const API={B,freezeScene,gain,ensure,capture,close,scene,pending,choose,valid,rivalState,rivalGate,rivalScene,rivalRead,chooseRival,validRival,opportunities};root.KM_DRAMA=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);


