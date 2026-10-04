


/* v105: finite training choices, persistent rival and recorded scenario decisions. No DOM. */
(function(root){'use strict';
const A=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);

const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const Craft=root.KM_CRAFT||(typeof require==='function'?require('./craft118.js'):null);
const paths={
 speed:{name:'伸び足の道',base:'straighten',task:'直線で伏せて横滑りを抑える・8秒以上',branches:['burst','wit_slipstream'],styles:['直線で突き放す','引き波を抜ける']},
 turn:{name:'旋回の道',base:'slice',task:'旋回で上体を起こし 5秒以上安定・境界接触1回以下',branches:['split','monkey_ssr'],styles:['出口の差し','全速旋回']},
 start:{name:'先手の道',base:'inside',task:'ST 00:25以内で有効完走・合法の早発も対象',branches:['entry','immune'],styles:['進入から先手','先頭を守る']},
 accel:{name:'出足の道',base:'wit_rudder',task:'出口3秒で1.5m/s以上再加速を2回・接触なし',branches:['wit_latebird','burst'],styles:['後半の追撃','直線への接続']},
 power:{name:'波越えの道',base:'rain',task:'強風や引き波の中で6秒以上安定・立て直しなし',branches:['anchor','storm'],styles:['接戦で踏ん張る','荒天で攻める']}
};
const rivals=[
 {id:'haruto',name:'橘 晴人',key:'speed',portraitKey:'rival_01',quote:'速さで答えよう。言葉は、そのあとだ。',skills:['push','stretch','straighten','burst']},
 {id:'ren',name:'瀬尾 蓮',key:'turn',portraitKey:'rival_04',quote:'同じ水面でも、見える出口は違うんだ。',skills:['steady','slice','wit_overtime','split']},
 {id:'izumi',name:'立花 泉',key:'start',portraitKey:'rival_07',quote:'始まる前の十二秒も、勝負のうち。',skills:['quick','inside','entry','immune']},
 {id:'sou',name:'相良 蒼',key:'accel',portraitKey:'rival_10',quote:'離されても終わりじゃない。次の出口がある。',skills:['push','wit_rudder','wake_escape','burst']},
 {id:'ibuki',name:'風間 伊吹',key:'power',portraitKey:'rival_09',quote:'荒れた日こそ、自分の走りをなくすなよ。',skills:['stout','rain','wit_slipstream','anchor']}
];
const actors={light:{id:'campaign_father',name:'父',portraitKey:'rival_08'},back:{id:'campaign_kanato',name:'奏斗',portraitKey:'rival_06'},shore:{id:'campaign_sae',name:'紗枝',portraitKey:'rival_12'}};
actors.recovery={id:'campaign_soma',name:'相馬',portraitKey:'rival_03'};
const plans={
 light:[{label:'今節の機材を仕上げる',short:'現場仕上げ',effect:'機材の状態を整える',text:"主人公「今回は、今使う機材を仕上げたい」\n父「なら、今の音を先に覚えろ。変えた後と比べる」\n主人公「同じ形にして終わり、にはしないよ」"},
 {label:'次につながる調整を学ぶ',short:'共同研究',effect:'調整の学びと 技のコツ',text:"主人公「今日は、なぜその調整をするか教えてほしい」\n父「理由まで聞くなら、先に記録を開け」\n主人公「分かった。自分で試した結果も書き足す」"}],
 back:[{label:'今の苦手を二人で直す',short:'課題克服',effect:'苦手の自主練が充実',text:"奏斗「苦手な所から見るんだな」\n主人公「うん。隠しても、本番で出るから」\n奏斗「じゃあ、俺の失敗も並べよう。何を変えるか、一つずつ決める」"},
 {label:'自分だけの得意技を磨く',short:'得意技研究',effect:'合同練習で コツを深める',text:"主人公「得意な走りを、もう少し通せるようにしたい」\n奏斗「俺の真似じゃなく、君が使いたい動きだね」\n主人公「そう。相手が変わっても使えるか、一緒に見てほしい」"}],
 shore:[{label:'最後まで走り切る姿を見せる',short:'完走の約束',effect:'有効完走3回で 苦手を補強',text:"主人公「まず最後まで、準備した走りを続けたい」\n陸「途中で離れても？」\n主人公「うん。そこで投げない所を見ててくれ」\n陸「分かった。最後まで見る」"},
 {label:'表彰台を目指すと約束する',short:'挑戦の約束',effect:'3着以内2回で 得意を強化',text:"主人公「今節は表彰台を狙いたい」\n紗枝「応援に応えなきゃ、だけで決めてない？」\n主人公「自分が立ちたいんだ。だから準備する」\n紗枝「なら、私たちも楽しみにしてる」"}]
};
plans.recovery=[
 {label:'今の走りを崩さず完走を重ねる',short:'再起の土台',effect:'有効完走3回で フィジカルを補強',text:'相馬「順位は後で確認できる。今日は最後まで、決めた準備を使えるか見よう」\n主人公「投げずに走る。無理を隠して完走する約束にはしない」'},
 {label:'新しい出口で表彰台を狙う',short:'新しい勝ち筋',effect:'3着以内2回で 加速を強化',text:'主人公「今の身体で使える出口を、勝負で試したい」\n相馬「昔と同じ形かではなく、今日前へ進んだかを見よう」'}
];
function ensure(c){if(!c.development){const def=rivals[S.hash(c.player.id+':main-rival')%rivals.length];c.development={version:1,rival:{id:'main_'+def.id,cast:def.id,met:c.stage,history:[],training:0},paths:Object.fromEntries(D.statKeys.map(k=>[k,{hints:0,practice:0,learned:false,branch:null}])),plans:[],settled:[],training:[],finals:{},readers:{},outcomes:[],archive:null};}return c.development;}
function rival(c){const t=ensure(c);return {...rivals.find(x=>x.id===t.rival.cast),id:t.rival.id,wins:t.rival.history.filter(x=>x.won).length,losses:t.rival.history.filter(x=>!x.won).length};}
function writable(c){return !!c&&!c.ending&&!['race','registration'].includes(c.status)&&!(c.series?.race?.drive&&!c.series.race.done);}
function plan(c){return ensure(c).plans.find(x=>x.stage===c.stage)||null;}
function planScene(c){const a=c.campaign?.arc||'light',last=c.history.at(-1),p=plan(c),previous=ensure(c).plans.at(-1);return {key:'plan:'+c.stage,title:'今節の約束',person:actors[a],background:a==='shore'?'harbor':'workshop',body:[c.stage===0?(a==='recovery'?'復帰シリーズの朝。今の身体で取り組むことを相談した。':'デビューの朝。今節に取り組むことを相談した。'):last?.champion?'前節は優勝。次の準備を始めた。':'前節の結果を確認して、次の準備を始めた。',...(previous&&previous.stage<c.stage?['前節の約束：'+plans[a][previous.choice].short]:[]),...({recovery:['相馬「今の走りを固めるか、新しい出口を勝負で試すか。今節はどちらを先にする？」','主人公「昔と比べて焦る前に、今できる準備から選ぶよ」'],light:['父「今日は、今の艇を仕上げるか。次も使える調整を調べるか」','主人公「どっちも欲しいけど、時間は限られてるな」','父「先に目的を決めよう。今の艇を見てからでいい」'],back:['奏斗「苦手を直すか、得意を伸ばすか。今日はどうしたい？」','主人公「自分で決めると、見たい方ばかり選びそうだ」','奏斗「それでも選ぶのは君。理由を聞いて、練習には付き合う」'],shore:['紗枝「今節は、どこを見てほしい？」','主人公「結果の約束だけじゃなく、準備して試すことを決めたい」','陸「決まったら教えて。そこを見て、後で聞くから」']})[a]],choices:p?[]:plans[a].map(x=>({label:x.label,note:x.effect}))};}
function choosePlan(c,index){if(!writable(c)||!Number.isInteger(index)||index<0||index>1||plan(c)||!['home','seriesIntro','action','preRace'].includes(c.status)||c.series&&c.series.round>0)return null;
 const a=c.campaign.arc,p={stage:c.stage,arc:a,choice:index,progress:0,completed:false,applied:false};ensure(c).plans.push(p);applyPlan(c);return {title:plans[a][index].short,note:plans[a][index].text,person:actors[a]};}
function applyPlan(c){const p=plan(c);if(!p||p.applied||!c.player.equipment||!c.series)return;p.applied=true;if(p.arc==='light'){if(p.choice===0){for(const g of ['motor','prop'])c.player.equipment[g].condition=Math.min(100,c.player.equipment[g].condition+6);}else{const key=strong(c.player);ensure(c).paths[key].hints=Math.min(12,ensure(c).paths[key].hints+1);}}}
function strong(p){return D.statKeys.slice().sort((a,b)=>p.stats[b]-p.stats[a])[0];}
function weak(p){return D.statKeys.slice().sort((a,b)=>p.stats[a]-p.stats[b])[0];}
function growth(c,key,method){const p=plan(c);return p?.arc==='back'&&p.choice===0&&method==='solo'&&key===weak(c.player)?1.12:1;}
function afterTune(c,target,api){const p=plan(c);if(p?.arc==='light'&&p.choice===1){const key=target+'Success';c.player.adjust[key]=Math.min(70,c.player.adjust[key]+.45*api.tuningLearning(c.player.adjust[key])*c.series.action.effectScale);}}
function series(c){const t=ensure(c),def=rival(c),n=c.series.npcs[0],tier=c.series.tier,base=D.tiers[tier].base+(c.stage%2?2:0),normal=c.player.difficulty!=='easy';
 n.id=def.id;n.name=def.name;n.portraitKey=def.portraitKey;n.skills=def.skills.slice(0,c.stage<2?1:c.stage<4?2:c.stage<6?3:4);n.mastery={};
 D.statKeys.forEach((k,i)=>{n.stats[k]=clamp(base+(normal?D.npcGradeStats[tier]||0:-(base-D.tiers.rookie.base)*(1-D.easyNpcGrowth))+(k===def.key?7:((i+S.hash(def.id))%3-1)*2),20,96);});
 c.story.rivals=[{id:def.id,name:def.name,portraitKey:def.portraitKey,wins:0,losses:0,met:t.rival.met}];
 c.story.duel={stage:c.stage,round:2,rivalId:def.id,rivalName:def.name,status:'scheduled',raceId:null,money:[8,12,20,25,35,45,60,75,150][c.stage]};applyPlan(c);
}
function learned(c,key,api){const q=ensure(c).paths[key];if(!q.learned&&q.hints>=2&&q.practice>=2){q.learned=true;return api.acquire(c,c.player,paths[key].base,'実践からの習得');}return null;}
function training(c,key,method,api){if(!writable(c)||c.status!=='action'||!paths[key]||!['solo','mentor','rival'].includes(method))return null;
 const def=rival(c),mentor=c.cast?.mentor&&api.Cast.map[c.cast.mentor.id];if(method==='mentor'&&(!mentor||mentor.key!==key)||method==='rival'&&key!==def.key)return null;
 const t=ensure(c),p=plan(c),result=api.train(c,key,'focus',{method,multiplier:(method==='mentor'?.66:method==='rival'?.84:1)*growth(c,key,method),mentor:method==='mentor'});if(!result)return null;
 const q=t.paths[key],scale=c.series.action.effectScale;
 q.hints=Math.min(12,q.hints+Craft.trainingHint(c,key)+(method==='mentor'?1.25:method==='rival'?.9:.35)*scale+(p?.arc==='back'&&p.choice===1&&method!=='solo'?.2*scale:0));
 let affinity=null;if(method==='rival'){t.rival.training++;affinity=A.train(c,c.series.race.id,scale);if(affinity)c.series.action.logs.push(def.name+' 好感度 '+(affinity.delta>=0?'＋':'')+affinity.delta);}
 t.training.push({key,method,raceId:c.series.race.id});t.training=t.training.slice(-100);const z=learned(c,key,api);
 c.series.action.logs.push((method==='mentor'?mentor.name+'との合同練習':method==='rival'?def.name+'との特訓':'自主練習')+' · '+paths[key].name+'のコツを蓄積');if(z)c.series.action.logs.push(D.abilityMap[z.id].name+'を習得');api.syncPlayerSnapshot(c);return {...result,learned:z,method,affinity};
}
function ready(c,key){const t=ensure(c),q=t.paths[key];return !!q&&q.learned&&q.branch===null&&q.hints>=5&&q.practice>=5&&c.stage>=4&&Object.values(t.paths).filter(x=>x.branch!==null).length<2;}
function blossom(c,key,index,api){if(!writable(c)||!ready(c,key)||!Number.isInteger(index)||![0,1].includes(index))return null;const q=ensure(c).paths[key];q.branch=index;const skill=api.acquire(c,c.player,paths[key].branches[index],'技の開花');api.syncPlayerSnapshot(c);return skill;}
function taskMet(key,b,r){const m=b?.metrics||{},q=m.craft;if(!b||b.finishTime===null||b.capsized||b.dnf||b.startFault)return false;
 if(key==='start')return b.startTime!==null&&b.startTime<=.25;
 if(!q)return false;
 return key==='speed'?q.straightGood>=8:key==='turn'?q.turnGood>=5&&m.boundaries<=1:key==='accel'?q.exitGood>=2:q.stableWater>=6&&m.rescues===0;
}
function settle(c,r,z,api){const t=ensure(c);if(t.settled.includes(r.id))return;t.settled.push(r.id);t.settled=t.settled.slice(-60);const b=r.drive?.boats.find(x=>x.isPlayer),good=!z.capsized&&!z.dnf&&!z.startFault,updates=[];
 for(const k of D.statKeys){const q=t.paths[k];if(q.hints<=0)continue;const delta=good?(taskMet(k,b,r)?.8:.25):0;q.practice=Math.min(12,q.practice+delta);const a=learned(c,k,api);if(a)z.acquired.push(a);if(delta)updates.push({key:k,delta,met:delta===.8});}z.development=updates;
 const def=rival(c),op=z.finish.find(x=>x.id===def.id);if(op){const won=good&&z.place<op.place;{t.rival.history.push({raceId:r.id,stage:c.stage,type:r.type,won,place:z.place,other:op.place});z.mainRival={won,name:def.name,firstWin:won&&t.rival.history.filter(x=>x.won).length===1,record:t.rival.history.length};}}
 const p=plan(c);if(p&&['shore','recovery'].includes(p.arc)&&!p.completed){if(good&&(p.choice===0||z.place<=3))p.progress++;const goal=p.choice===0?3:2;if(p.progress>=goal){p.completed=true;const key=p.arc==='recovery'?(p.choice===0?'power':'accel'):(p.choice===0?weak(c.player):strong(c.player)),before=Math.floor(c.player.stats[key]);api.growStat(c.player,key,(p.choice===0?.8:1.1)*1.5*api.statGrowthRate(c.player.stats[key])*api.growthFactor(c.player));c.player.popularity+=p.choice===0?3:5;z.promise={name:plans[p.arc][p.choice].short,key,gain:Math.floor(c.player.stats[key])-before};}}
 if(r.type!=='qualifier'){const f=r.finalBrief||brief(c,r);t.finals[r.id]={...f,place:z.place,won:good&&z.place===1,skills:z.activations.map(a=>a.abilityId),rivalWon:z.mainRival?.won||false};}
}
function brief(c,r){const t=ensure(c),def=rival(c),boss=r.runners.find(n=>['king','rival_final'].includes(n.racePersona))||(r.castDuel&&r.runners.find(n=>n.id===r.castDuel.id)),op=boss||r.runners.find(n=>n.id===def.id)||r.runners.filter(n=>!n.isPlayer).sort((a,b)=>b.stats[strong(b)]-a.stats[strong(a)])[0],key=strong(c.player),target=op?strong(op):'speed';
 const opened=D.statKeys.filter(k=>t.paths[k].branch!==null),focus=opened[0]||key;
 const tips={speed:'舵を戻した直線で伸び足を使う',turn:'ターン出口を空けて差しをつなぐ',start:'助走を合わせて最初の位置を取る',accel:'出口で姿勢を戻し再加速する',power:'荒れた水面でも無理なく姿勢を守る'};
 return {opponent:op?.name||'決勝の相手',opponentId:op?.id||'',weapon:D.stats[target],key:focus,tactic:tips[focus],bond:t.rival.history.length?def.name+'との対戦 '+def.wins+'勝 '+def.losses+'敗':'積み上げた準備を この一走へ',skill:opened.length?paths[focus].branches[t.paths[focus].branch]:null};}
function finale(c){const t=ensure(c),key=strong(c.player),low=weak(c.player),def=rival(c),opened=D.statKeys.filter(k=>t.paths[k].branch!==null);return {title:({speed:'直線で道を拓いた',turn:'旋回で道を拓いた',start:'先手で道を拓いた',accel:'出口から追い上げた',power:'荒波を走り抜いた'})[key]+(c.ending==='sgChampion'?'覇者':'挑戦者'),key,weak:low,rival:def.name,wins:def.wins,losses:def.losses,opened:opened.map(k=>D.abilityMap[paths[k].branches[t.paths[k].branch]].name),next:low===key?'違う水面で 自分の走りを試そう':D.stats[low]+'を補い 次の勝ち筋を作ろう',plans:t.plans.map(p=>plans[p.arc][p.choice].short)};}
function archive(c){const t=ensure(c);t.archive=finale(c);return clone(t);}
function unlocks(s){return [...new Set(s.registry.flatMap(p=>p.developmentJournal?D.statKeys.filter(k=>p.developmentJournal.paths[k].learned):[]))];}
function valid(t){const n=(v,max=1000)=>Number.isFinite(v)&&v>=0&&v<=max,str=(v,max=200)=>typeof v==='string'&&v.length<=max;
 if(!t||t.version!==1||!t.rival||!rivals.some(x=>x.id===t.rival.cast)||t.rival.id!=='main_'+t.rival.cast||!Number.isInteger(t.rival.met)||!n(t.rival.met,8)||!n(t.rival.training)||!Array.isArray(t.rival.history)||t.rival.history.length>60||!t.rival.history.every(x=>str(x.raceId)&&n(x.stage,8)&&['qualifier','championship','consolation'].includes(x.type)&&typeof x.won==='boolean'&&n(x.place,6)&&x.place>=1&&n(x.other,6)&&x.other>=1))return false;
 const N=root.KM_DRAMA||(typeof require==='function'?require('./drama.js'):null);if(!N.validRival(t.rival.drama,t.rival.cast)||t.rival.drama?.reward&&!t.rival.history.some(x=>x.won))return false;
 if(!t.paths||!D.statKeys.every(k=>{const q=t.paths[k];return q&&n(q.hints,12)&&n(q.practice,12)&&typeof q.learned==='boolean'&&[null,0,1].includes(q.branch)&&(!(q.branch!==null)||q.learned);})||Object.values(t.paths).filter(q=>q.branch!==null).length>2)return false;
 if(!Array.isArray(t.plans)||t.plans.length>9||new Set(t.plans.map(p=>p.stage)).size!==t.plans.length||!t.plans.every(p=>Number.isInteger(p.stage)&&n(p.stage,8)&&plans[p.arc]&&[0,1].includes(p.choice)&&n(p.progress,3)&&typeof p.completed==='boolean'&&typeof p.applied==='boolean'))return false;
 if(!Array.isArray(t.settled)||t.settled.length>60||!t.settled.every(x=>str(x))||!Array.isArray(t.training)||t.training.length>100||!t.training.every(x=>paths[x.key]&&['solo','mentor','rival'].includes(x.method)&&str(x.raceId)))return false;
 if(!t.readers||Array.isArray(t.readers)||Object.keys(t.readers).length>300||!Object.entries(t.readers).every(([k,v])=>str(k)&&Number.isInteger(v)&&n(v,500)))return false;
 if(!t.finals||Array.isArray(t.finals)||Object.keys(t.finals).length>9||!Object.values(t.finals).every(f=>str(f.opponent)&&str(f.opponentId)&&str(f.weapon)&&paths[f.key]&&str(f.tactic)&&str(f.bond)&&(!f.skill||D.abilityMap[f.skill])&&n(f.place,6)&&typeof f.won==='boolean'&&Array.isArray(f.skills)&&f.skills.every(k=>D.abilityMap[k])))return false;
 return t.archive===null||!!t.archive&&str(t.archive.title)&&paths[t.archive.key]&&paths[t.archive.weak]&&Array.isArray(t.archive.opened)&&t.archive.opened.every(x=>str(x))&&Array.isArray(t.archive.plans)&&t.archive.plans.every(x=>str(x));
}
const API={paths,rivals,actors,plans,ensure,rival,plan,planScene,choosePlan,applyPlan,growth,afterTune,series,training,ready,blossom,taskMet,settle,brief,finale,archive,unlocks,valid};root.KM_DEVELOPMENT=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);



