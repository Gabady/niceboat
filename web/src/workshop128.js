
/* V128: bounded maintenance learning and recorded scenario effects. No RNG or DOM. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),round=v=>Math.round(v*10000)/10000;
const arcs={
 light:{title:'父から受け継ぐ整備',text:'父が整備士。手を動かすほど整備を覚えやすい。物語が進むと、父の工具と音を聞く技を受け継ぐ。',skills:['sc128_tools','sc128_sound'],lines:['父は使い込んだ工具を差し出した。「もう、触る場所を自分で決められるな。これはお前が使え」','父と同じ音に耳を澄ませる。違和感を言葉にすると、父がうなずいた。「今のは、俺に聞かなくても分かっただろう」']},
 back:{title:'奏斗と見つける課題',text:'レース後に苦手能力を分析。次走まで、その能力の練習とレースでの働きを少し後押しする。',skills:['sc128_focus','sc128_plan'],lines:['奏斗が映像を止めた。「全部直そうとしなくていい。次はここだけ」二人で、ノートの一行に丸をつけた。','「数字の通りじゃない日もある」奏斗はノートを閉じた。「その時に何を試すかまで、一緒に考えよう」']},
 shore:{title:'帰りを待つ岸の声',text:'順位にかかわらず有効完走を続けると、次走のフィジカルと旋回を少し支える。支えが育つと体づくりも進めやすい。',skills:['sc128_home','sc128_flag'],lines:['紗枝が差し出したタオルを受け取る。「着順も見てたよ。でも、最後まで走ったのも見てた」帰る場所があると思えた。','陸が旗を広げた。「今日は最後のターンまで見えた！」結果だけではない走りを、ここで見てくれる人がいる。']},
 recovery:{title:'今の身体で走り直す',text:'有効完走を重ねて走る感覚を回復。体づくりと再加速を助け、走り方を選んだ後はその能力の練習を後押しする。',skills:['sc128_axis','sc128_return'],lines:['相馬が映像を巻き戻した。「ここ、無理に昔へ戻そうとしてないな」主人公は自分の姿を見直す。今の身体で走れる軸が、少し見えてきた。','「この踏み込みなら、もう一度試せる」主人公の言葉を聞き、相馬がペンを置いた。「ああ。次は、お前がつかんだ感覚から始めよう」']}
};
const parts={motor:{name:'モーター',use:'直線の伸び・加速・機関の状態を整える'},prop:{name:'プロペラ',use:'旋回とターン後の加速を整える'}};
function rank(v){return v>=90?'S':v>=80?'A':v>=65?'B':v>=50?'C':v>=35?'D':'E';}
function effective(p,part){const bonus=(p.skills||[]).reduce((sum,id)=>sum+(D.abilityMap[id]?.type==='tuning'?D.abilityMap[id].effect.success:0),0);return Math.min(100,Math.min(88,p.adjust[part+'Success'])+Math.min(18,bonus));}
function learning(v){return v>=88?0:v>=80?.45:v>=65?.9:v>=50?1.6:v>=35?2.2:2.6;}
function learn(p,part,units){const key=part+'Success',before=p.adjust[key];if(!parts[part]||!Number.isFinite(units)||units<=0||before>=88)return 0;
 let v=before,budget=units;for(const ceiling of [35,50,65,80,88]){if(v>=ceiling)continue;const rate=learning(v),cost=(ceiling-v)/rate;if(budget<cost){v+=budget*rate;break;}v=ceiling;budget-=cost;if(budget<=0)break;}p.adjust[key]=round(v);return p.adjust[key]-before;
}
function strength(v){const points=[[0,.05],[35,.13],[50,.20],[65,.28],[80,.48],[90,.80],[100,1]];for(let i=1;i<points.length;i++){const [b,y]=points[i],[a,x]=points[i-1];if(v<=b)return x+(y-x)*clamp((v-a)/(b-a),0,1);}return 1;}
function gearValue(p,part){const e=p.equipment?.[part],key=part==='motor'?'speed':'turn';return e?clamp((e[key]+15)/45*100,0,100):0;}
function drawQuality(roll,within){return roll<.003?90+within*10:roll<.03?80+within*10:roll<.25?65+within*15:roll<.65?50+within*15:roll<.90?35+within*15:12+within*23;}
function chance(p,part){const skill=effective(p,part),value=gearValue(p,part);let factor=1;if(skill<65&&value>=65)factor=clamp(1-(value-64)*.014-(65-skill)*.005,.22,.97);return (.30+skill*.005)*factor;}
function outcome(p,part,roll,quality,scale=1){const value=effective(p,part),positive=roll<chance(p,part),high=positive&&quality<.14,eff=strength(value);
 return {positive,high,label:high?'会心の整備':positive?'整備完了':'手応えは控えめ',delta:(high?1.8+.7*value/100:positive?(quality<.65?1.5:.75)*eff:-.06)*scale,tiltFactor:(positive?(high?.8:eff*.7):0)*scale};
}
const weak=p=>D.statKeys.slice().sort((a,b)=>p.stats[a]-p.stats[b])[0];
function initial(c){const arc=c.campaign?.arc||c.player.scenario||'light',list=c.refinement?.races||[];let streak=0,recovery=0;for(const r of list){const good=!r.fault&&!r.capsized&&!r.dnf;streak=good?Math.min(3,streak+1):0;if(good)recovery=Math.min(6,recovery+1);}return {version:1,arc,analysisKey:weak(c.player),streak,recovery,settled:list.map(r=>r.id).slice(-54),awarded:[]};}
function state(c){return c.scenario128||initial(c);}
function ensure(c){return c.scenario128||(c.scenario128=initial(c));}
function snapshot(c){const q=state(c);return {version:1,arc:q.arc,analysisKey:q.analysisKey,streak:q.streak,recovery:q.recovery,traits:arcs[q.arc].skills.filter(id=>c.player.skills.includes(id))};}
function training(c,key){const q=snapshot(c),n=q.traits.length;if(q.arc==='back'&&key===q.analysisKey)return 1.16+n*.03;
 if(q.arc==='shore'&&q.streak>=2&&key==='power')return 1.10+n*.02;
 if(q.arc==='recovery'){const r=c.refinement?.recovery,focus=r?.path?(r.path==='renew'?({speed:'accel',turn:'power',start:'turn',accel:'speed',power:'start'})[r.origin]:r.origin):'power';return key===focus?1.18+n*.02:key==='accel'?1.08:1;}
 return 1;
}
function learningFactor(c){return state(c).arc==='light'?1.12:1;}
function raceStats(q){const s=Object.fromEntries(D.statKeys.map(k=>[k,0]));if(!q)return s;const n=q.traits.length;
 if(q.arc==='back')s[q.analysisKey]=1.5+n*.5;
 if(q.arc==='shore'){s.power=q.streak*(1+n*.2);s.turn=q.streak*.5;}
 if(q.arc==='recovery'){s.power=q.recovery*.5;s.accel=q.recovery*(.25+n*.05);}
 return s;
}
function attach(c,r){ensure(c);r.workshop128={version:1,focus:null,quality:null,tiltFactor:0};r.tilt=0;r.tilt131={version:1};r.scenario128=snapshot(c);}
function settle(c,r,z){const q=ensure(c);if(q.settled.includes(r.id))return;const good=!z.startFault&&!z.capsized&&!z.dnf;q.settled.push(r.id);q.settled=q.settled.slice(-54);q.analysisKey=weak(c.player);q.streak=good?Math.min(3,q.streak+1):0;if(good)q.recovery=Math.min(6,q.recovery+1);z.scenario128=summary(c);}
function storyReward(c,e,api){if(e.kind!=='season'||!e.decision)return [];const q=ensure(c),spec=arcs[q.arc],out=[];for(let i=0;i<2;i++){const id=spec.skills[i];if(e.stage<[3,5][i]||q.awarded.includes(id))continue;q.awarded.push(id);if(c.player.skills.includes(id))continue;api.acquire(c,c.player,id,'物語で身につけた技');out.push({id,text:spec.lines[i]});}return out;}
function summary(c){const q=state(c);if(q.arc==='light')return '父の教え：整備の経験を少し多く積める。';if(q.arc==='back')return '次走の分析課題：'+D.stats[q.analysisKey]+'。練習と本番を少し後押し。';if(q.arc==='shore')return q.streak===0?'岸の応援：まず一走を有効完走して、次走の支えに。':q.streak<3?'岸の応援が育っている。次走の粘りと旋回を支える。':'岸の応援が充実。次走の粘り・旋回と体づくりを支える。';return q.recovery===0?'走り直し：体づくりから、一走ずつ感覚を確かめる。':q.recovery<6?'走る感覚を取り戻している。完走の経験が粘りと再加速へ。':'走る感覚が戻ってきた。今の身体に合う練習を続けよう。';}
const integer=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max,ids=(xs,allowed,max)=>Array.isArray(xs)&&xs.length<=max&&new Set(xs).size===xs.length&&xs.every(x=>allowed.includes(x));
function valid(q,arc){return q===undefined||!!q&&q.version===1&&!!arcs[q.arc]&&(!arc||q.arc===arc)&&D.statKeys.includes(q.analysisKey)&&integer(q.streak,3)&&integer(q.recovery,6)&&Array.isArray(q.settled)&&q.settled.length<=54&&new Set(q.settled).size===q.settled.length&&q.settled.every(x=>typeof x==='string'&&x.length<=120)&&ids(q.awarded,arcs[q.arc].skills,2);}
function validSnapshot(q){return q===undefined||!!q&&q.version===1&&!!arcs[q.arc]&&D.statKeys.includes(q.analysisKey)&&integer(q.streak,3)&&integer(q.recovery,6)&&ids(q.traits,arcs[q.arc].skills,2);}
function validRace(q){return q===undefined||!!q&&q.version===1&&(q.focus===null||!!parts[q.focus])&&[null,'normal','high','quiet'].includes(q.quality)&&Number.isFinite(q.tiltFactor)&&q.tiltFactor>=0&&q.tiltFactor<=1;}
const tiltAngles=Object.freeze([-1,-.5,0,.5,1]),tiltSkills=['spanner','craft','sc128_tools','sc128_sound'];
function tiltGate(p){const skill=(p.skills||[]).find(id=>tiltSkills.includes(id.replace(/^mlr_/,''))),value=effective(p,'motor');return {open:!!skill||value>=65,value,skill:skill||null,reason:skill?D.abilityMap[skill].name+'で解放':value>=65?'モーター整備力B以上で解放':'モーター整備力B以上、または熟練の手元・匠の設計・継承の工具・音を聴く整備で解放'};}
function setTilt(c,angle){const r=c?.series?.race;if(!r||r.done||r.drive||!['action','preRace'].includes(c.status)||!tiltAngles.includes(angle)||!tiltGate(c.player).open)return false;r.tilt131={version:1};r.tilt=angle;return true;}
function validTilt(r){return r.tilt131===undefined?(!('tilt' in r)||[-.5,0,.5,1.5,3].includes(r.tilt)):!!r.tilt131&&r.tilt131.version===1&&tiltAngles.includes(r.tilt);}
const W={tiltAngles,tiltSkills,tiltGate,setTilt,validTilt,gearValue,drawQuality,arcs,parts,rank,effective,learning,learn,strength,chance,outcome,state,ensure,snapshot,training,learningFactor,raceStats,attach,settle,storyReward,summary,valid,validSnapshot,validRace};root.KM_WORKSHOP128=W;if(typeof module!=='undefined'&&module.exports)module.exports=W;
})(typeof globalThis!=='undefined'?globalThis:this);

