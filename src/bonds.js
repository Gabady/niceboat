

/* V126: conditional Natsu romance, saved independent discovery and legacy relationship migration. */
(function(root){
'use strict';
const A=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);

const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),B=root.KM_BOND_DATA||(typeof require==='function'?require('./bonds-data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null);
const Romance=root.KM_ROMANCE127||(typeof require==='function'?require('./romance127.js'):null);Romance?.apply(B);
const Craft=root.KM_CRAFT||(typeof require==='function'?require('./craft118.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),copy=x=>JSON.parse(JSON.stringify(x));
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Only race preparation draws an encounter. Reading a screen never draws again.
// Per race-preparation roll: chance for ONE of the undiscovered regular heroines.
const encounterRates=Object.freeze([.004,.009,.020,.029,.042,.050,.060,.073,.090]);
// Separate roll, only after a clean first place with Mizuki in the field.
const racerEncounterRate=.18;
// Natsu remains the same supporter met in story events; romance grows from repeated conversation.
const natsuEncounterRate=.15;
const legacyOptionalHeroines=new Set(['mizuki','natsu']);
function blank(){return {met:false,metStage:null,metRace:null,step:0,trust:0,affection:0,failed:false,reason:'',dated:false,choices:[]};}
function encounterState(c){return {seed:S.hash(c.player.id+':romance-v102'),rolled:[],notice:null};}
function ensure(c){
 if(!c.bonds)c.bonds={version:2,partner:null,completed:null,nextAt:0,waitHeroine:null,shortcutUsed:false,encounters:encounterState(c),pending:null,heroines:Object.fromEntries(B.heroines.map(h=>[h.id,blank()])),training:{stages:[],rivals:{}},log:[],serial:0,reward:null};
 const t=c.bonds;for(const id of legacyOptionalHeroines)if(B.map[id]&&!t.heroines[id])t.heroines[id]=blank();if(t.version===1){
  t.version=2;t.completed=t.partner&&t.heroines[t.partner].step===7&&!t.heroines[t.partner].failed?t.partner:null;t.shortcutUsed=false;t.encounters=encounterState(c);
  for(const h of B.heroines){const q=t.heroines[h.id],met=q.step>0||q.trust>0||q.affection>0||q.failed||q.dated||t.pending?.id===h.id;q.met=met;q.metStage=met?0:null;q.metRace=met?0:null;}
  const last=t.log.at(-1);t.waitHeroine=last?.kind==='romance'?last.heroine:null;
  if(c.series?.race)t.encounters.rolled.push(c.stage+':'+c.series.round);
 }
 return t;
}
function writable(c){return !!c&&!c.ending&&c.status!=='race'&&!(c.series?.race?.drive&&!c.series.race.done);}
function record(c,entry){const t=ensure(c);t.log.push({...entry,index:++t.serial,races:c.stats.races,stage:c.stage});t.log=t.log.slice(-80);}
function encounterRandom(e){e.seed=(Math.imul(e.seed,1664525)+1013904223)>>>0;return e.seed/4294967296;}
function natsuGate(c){
 if(!c?.player)return {eligible:false,interactions:0,reason:'育成中に出会えます'};
 const t=ensure(c),q=t.heroines.natsu,interactions=Object.entries(c.story?.seen||{}).reduce((n,[id,count])=>n+(S.eventMap[id]?.speaker==='fan'?count:0),0);
 if(!q)return {eligible:false,interactions,reason:'人物が見つかりません'};
 if(q.met)return {eligible:false,interactions,reason:'すでに二人で会う約束をしています'};
 if(c.ending||c.stage<2||c.stage>6)return {eligible:false,interactions,reason:'G3前期からG1前期の間に、交流が深まることがあります'};
 if(t.partner||t.completed)return {eligible:false,interactions,reason:'大切な相手との関係を続けています'};
 if(interactions<2)return {eligible:false,interactions,reason:'まずは応援してくれるなつと、何度か話しましょう'};
 return {eligible:true,interactions,reason:'応援の後に、二人で話す機会が生まれることがあります'};
}
function natsuCandidate(c,key){
 const e=ensure(c).encounters;if(!e.natsu)e.natsu={seed:S.hash(c.player.id+':natsu-romance126'),rolled:[]};
 const n=e.natsu;if(n.rolled.includes(key))return null;n.rolled.push(key);
 // An ineligible preparation is also consumed: finishing an event or reopening a screen cannot reroll this race.
 return natsuGate(c).eligible&&encounterRandom(n)<natsuEncounterRate?B.map.natsu:null;
}
function encounter(c,r){if(!c?.player||!r||r!==c.series?.race||c.ending||r.done||r.drive||!['action','preRace'].includes(c.status))return null;const t=ensure(c),e=t.encounters,key=c.stage+':'+c.series.round;
 if(e.rolled.includes(key))return null;e.rolled.push(key);
 // Keep the ordinary random stream unchanged; at most one meeting appears in a preparation.
 const pool=B.heroines.filter(h=>!['mizuki','natsu'].includes(h.id)&&!t.heroines[h.id].met);
 const ordinary=pool.length&&encounterRandom(e)<encounterRates[c.stage]?pool[Math.floor(encounterRandom(e)*pool.length)]:null;
 const h=natsuCandidate(c,key)||ordinary;if(!h)return null;
 const q=t.heroines[h.id];q.met=true;q.metStage=c.stage;q.metRace=c.stats.races;e.notice={id:h.id,stage:c.stage,races:c.stats.races,shown:false};
 record(c,{kind:'encounter',heroine:h.id,title:h.id==='natsu'?'なつと、応援の外でも':h.name+'との出会い',note:h.intro,choice:h.id==='natsu'?'応援が終わった後、二人で会う約束をした':'水辺で言葉を交わした'});return copy(e.notice);
}
function discoverRacer(c,r,result){const t=ensure(c),q=t.heroines.mizuki;if(q.met||result.place!==1||!result.finish.some(n=>n.id==='mizuki')||result.finish.some(n=>n.isPlayer&&(n.startFault||n.dnf||n.capsized)))return null; if(encounterRandom(t.encounters)>=racerEncounterRate)return null;q.met=true;q.metStage=c.stage;q.metRace=c.stats.races;t.encounters.notice={id:'mizuki',stage:c.stage,races:c.stats.races,shown:false};record(c,{kind:'encounter',heroine:'mizuki',title:'朝凪 瑞希との出会い',note:B.map.mizuki.intro,choice:'勝負の後 ピットで言葉を交わした'});return copy(t.encounters.notice);}
function metHeroines(c){const t=ensure(c);return B.heroines.filter(h=>t.heroines[h.id].met);}
function finalLock(t,id){return (t.completed||t.partner)&&((t.completed||t.partner)!==id)?(t.completed||t.partner):null;}
const episode=(c,h,i)=>Romance?Romance.chapter(c,h,i):(c.campaign?.arc==='recovery'&&h.recoveryChapters?h.recoveryChapters:h.chapters)[i];
function finalBody(c,h,r=c.series?.race){
 const romantic=Romance?.finalBody(c,h,r);if(romantic)return romantic;
 const body=c.campaign?.arc==='recovery'&&h.recoveryFinal?h.recoveryFinal:h.final;
 const onGrid=h.id==='mizuki'&&c.stage===8&&r===c.series?.race&&r?.type==='championship'&&r.runners?.some(n=>n.id==='mizuki');
 if(!onGrid)return body;
 const together={
  '優勝戦の朝、瑞希は主人公の出走表を見ていた。顔を上げると、一着の欄を指で叩く。':'優勝戦の朝、瑞希と主人公は同じ出走表をのぞき込んだ。六艇の中には、二人の名前が並んでいる。瑞希は一着の欄を指で叩いた。',
  '瑞希「そこは、自分が勝ちたいって言ってよ。こっちは、何着でも話を聞くから」':'瑞希「そこは、自分が勝ちたいって言ってよ。私も一着を取りにいく。終わったら、何着でも話は聞くから」',
  '主人公「じゃあ、遠慮なく勝ちにいく。次に一緒に走る時も」':'主人公「じゃあ、遠慮なく勝ちにいく。今日、一緒に走るお前にも」',
  '瑞希「待たない。でも、今日は戻ってくるのを待ってる」':'瑞希「待たない。ゴールしたら、お互い無事に戻ってきて話そう」',
  '瑞希は主人公の手を短く握って離した。先に準備へ戻るよう、いつもの調子で背中を促した。':'瑞希は主人公の手を短く握って離した。二人はうなずき合い、それぞれの艇へ準備に戻った。',
  '瑞希「その返事なら安心した。次に私と走る時も、そうしてね」':'瑞希「その返事なら安心した。今日、私と走る時も遠慮しないでね」',
  '瑞希「今日は、終わったら連絡して。勝った話も、悔しかった話も、聞くから」':'瑞希「今日は同じ水面で走れるね。終わったら話そう。勝った話も、悔しかった話も、お互いに」',
  '瑞希の手を一度握り、主人公は自分の艇へ向かった。':'二人は一度手を握り、それぞれの艇へ向かった。同じ一着を目指す準備が、もうすぐ終わる。'
 };
 return body.map(line=>together[line]||line);
}
function gate(c,id){const h=B.map[id];if(!c||!h)return {open:false,reason:'人物が見つかりません'};const t=ensure(c),q=t.heroines[id],e=episode(c,h,q.step);
 if(A.offer(c))return {open:false,reason:'先におねだりへの返事を決めてください'};
 if(!q.met)return {open:false,undiscovered:true,reason:'まだ出会っていません'};
 if(q.failed)return {open:false,failed:true,reason:'ルート終了：'+q.reason};
 const lock=q.step===6&&finalLock(t,id);if(lock)return {open:false,locked:true,reason:t.completed?B.map[lock].name+'のルートを完走済みのため、最終話は進行できません':B.map[lock].name+'との交際を継続中のため、最終話は進行できません'};
 if(!writable(c))return {open:false,reason:c.ending?'今回の育成は終了しました':'レース後に会えます'};
 const affinity=A.gate(c,'heroine',id),relationshipNeeded=!!e&&(q.step===6&&!affinity.open||q.trust<e.trust||q.affection<e.affection),needs=[];
 if(!Craft.romanceGate(c,id))needs.push('今回の育成でG1前期または後期を優勝');
 if(q.step===6&&!affinity.open)needs.push('最終話まで 好感度あと'+affinity.remaining);
 if(e){if(c.stats.races<e.races)needs.push('あと'+(e.races-c.stats.races)+'走');if(c.stage<e.stage)needs.push(D.stages[e.stage].name+'以降');if(q.trust<e.trust)needs.push('信頼が不足');if(q.affection<e.affection&&!(q.step===6&&!affinity.open))needs.push('好感度が不足');}
 const hint=relationshipNeeded?'さらに交流を深める必要があります。会える日に会って話しましょう。':'';
 if(c.stats.races<t.nextAt)return {open:false,waiting:true,remaining:t.nextAt-c.stats.races,relationshipNeeded,needs,reason:'次に会えるまで あと'+(t.nextAt-c.stats.races)+'走'+(hint?' · '+hint:'')};
 return {open:true,chapter:!!e&&!needs.length,episode:e||null,needs,relationshipNeeded,completed:t.completed===id,reason:!e?'二人の時間を過ごせます':needs.length?needs.join('・')+(hint?'。'+hint:''):'第'+(q.step+1)+'話を進められます'};
}
function open(c,id){const g=gate(c,id);if(!g.open)return null;const t=ensure(c),q=t.heroines[id];if(g.chapter&&q.step===6)A.unlock(c,'heroine',id);t.pending={id,kind:g.chapter?'chapter':'visit',step:q.step,stamp:c.stats.races,key:id+':'+c.stats.races+':'+q.step+':'+t.serial};return copy(t.pending);}
const visitDialogue={"akari": ["灯「今日は、仕事の話からでもいいですか。試していて気になる所があって」", "主人公「聞くよ。答えられるかは分からないけど」", "灯「すぐに答えが欲しいわけではないので。そちらの練習の話も、後で聞かせてください」"], "mio": ["澪「今日は録音しません。最近どうしていたか、聞きたくて」", "主人公「取材じゃない方が、どこまで話すか迷うな」", "澪「話したくない所は、そう言ってください。私の近況も、少し聞いてもらえますか」"], "nagi": ["凪「今日は、ちゃんと座って話せますか」", "主人公「はい。途中で練習を一つ足す、はやめておきます」", "凪「私も仕事の連絡を置いてきました。短い時間ですが、ゆっくりしましょう」"], "kanade": ["奏「最近、教室で同じ曲ばかり弾いていて。帰り道まで頭の中で続くんです」", "主人公「こっちはエンジンの音が残る日がある。少し似てるかも」", "奏「では今日は、違う話もしてみましょう。音楽以外の近況も聞いてほしいです」"], "tsumugi": ["紬「今日はお茶を置いたら、私も座ります」", "主人公「ずっと立ったまま聞いてくれなくていいよ」", "紬「そうします。そちらの話の後で、私の一日も聞いてください」"], "natsu": ["なつ「今日は旗を置いてきたよ。レースの結果だけじゃない話も、聞きたくて」", "主人公「じゃあ、そっちの一日から聞かせて」", "なつ「うん。私ばかり聞いてたから、話すとなると少し緊張するね」"], "mizuki": ["瑞希「今日は、映像を出す前に話そう。出したら時間が足りなくなりそう」", "主人公「話したいこと、そんなにある？」", "瑞希「あるよ。レース以外のことも。そっちの近況も聞きたいし」"]};
function scene(c){const t=ensure(c),p=t.pending;if(!p)return null;const h=B.map[p.id],q=t.heroines[h.id];if(p.kind==='chapter'){
 const sc={...episode(c,h,p.step),heroine:h,kind:'chapter',key:p.key};
 if(p.step===5&&finalLock(t,h.id)){
  const line=(formal,casual)=>h.name+'「'+(['mizuki','natsu'].includes(h.id)?casual:formal)+'」';
  sc.title='別々の未来、その手前';
  sc.body=[line('大切な相手がいるのは、知っています。今日は、これからの距離を話したいです','大切な相手がいるのは知ってる。今日は、これからどう会うか話しておきたい'),
   '主人公「曖昧にしたまま会うのは、よくないよね」',
   line('はい。今までの話が全部なくなるわけではないけれど、恋人としての約束はできません','うん。今までの話がなくなるわけじゃないけど、恋人としての約束はできないよ')];
  sc.choices=sc.choices.map(ch=>ch.code===0?{...ch,label:'友人として、これからも話を聞きたい',reply:line('分かりました。これからは友人として、会って話しましょう',h.id==='natsu'?'分かった。これからは友達として、会って話そう。応援も、自分の気持ちで続けるね':'分かった。これからは友達として、会って話そう。勝負では遠慮しないけどね')}:ch.code===1?{...ch,label:'恋愛の話はここまでにして、友人として応援する',reply:line('気持ちを聞かせてくれて、ありがとうございます。寂しいですが、これからは友人として応援します','うん。寂しいけど、返事は受け取った。これからは友達として応援するね')}:{...ch,label:'今の恋人と別れず、こちらとも付き合いたい',reply:line('その約束はできません。大切な相手がいるまま私とも付き合いたいと言われても、受け入れられません','それはできない。大切な相手がいるまま私とも付き合いたいと言われても、受け入れられないよ')});
 }
 return sc;
 }const date=Romance?.visit(c,h,q,t);if(date)return {...date,heroine:h,kind:'visit',key:p.key};
 return {heroine:h,kind:'visit',key:p.key,title:q.dated?'二人の休み時間':'次の話までの、ひととき',body:(h.visits?.[t.log.filter(e=>e.kind==='romance'&&e.heroine===h.id).length%h.visits.length]||visitDialogue[h.id]).slice(),choices:[{label:'話を聞き、一緒に過ごす'},{label:'自分の近況を話し、相手の近況も聞く'}]};}
function choose(c,key,index){if(!writable(c))return null;const t=ensure(c),p=t.pending;if(!p||p.key!==key||p.stamp!==c.stats.races||c.stats.races<t.nextAt)return null;const h=B.map[p.id],q=t.heroines[p.id],sc=scene(c);if(!Number.isInteger(index)||!sc.choices[index]||!q.met||q.failed||!gate(c,h.id).open)return null;
 if(p.kind==='chapter'&&(q.step!==p.step||!gate(c,h.id).chapter))return null;
 const ch=sc.choices[index];t.pending=null;let title=sc.title,note,startedDating=false,completed=false;
 if(p.kind==='visit'){if(sc.romancePhase){q.romanceVisits||={middle:0,late:0,partner:0};q.romanceVisits[sc.romancePhase]++;}q.trust=clamp(q.trust+5,0,100);q.affection=clamp(q.affection+5,0,100);note=ch.reply||h.visitReply||({akari:'灯「聞いてもらうと、次に試すことが整理できますね。また、そちらの話も聞かせてください」',mio:'澪「話してくれてありがとう。今日は私のことも聞いてもらえて、うれしかったです」',nagi:'凪「急いで元気な顔を作らなくても話せて、よかったです。また時間を合わせましょう」',kanade:'奏「話したいこと、忘れる前に言えてよかった。次に会う日も、少し時間を空けておきます」',tsumugi:'紬「私も座って話すと、いつもと少し違いますね。今日は聞いてもらえて、うれしいです」',mizuki:'瑞希「レース以外の話もできてよかった。次は、映像を見る時間も残そうね」',natsu:'なつ「自分の話も聞いてもらえて、うれしかった。次に会う時までに、また話したいことを覚えておくね」'})[h.id];}
 else{q.trust=clamp(q.trust+ch.trust,0,100);q.affection=clamp(q.affection+ch.affection,0,100);q.choices.push(ch.code);q.step++;note=ch.reply;
  if(ch.break||ch.friend){q.failed=true;q.reason=ch.friend?'友人として歩むことを選びました':'大切な約束を守れず、交際には進めなくなりました';q.dated=false;if(t.partner===h.id)t.partner=null;title='ルート終了 · '+h.name;note=ch.reply;}
  else if(sc.resolution){t.partner=h.id;t.completed=h.id;q.dated=true;startedDating=true;completed=true;title='ルート完走 · '+h.name;}
  else if(sc.confession)title=finalLock(t,h.id)?'それぞれの未来へ':'想いを伝えました';
 }
 t.nextAt=c.stats.races+Craft.waitLength(c,h.id,q.step);t.waitHeroine=h.id;
 const z={kind:'romance',heroine:h.id,title,note,choice:ch.label,dated:q.dated,failed:q.failed,startedDating,completed,...(sc.romancePhase?{romancePhase:sc.romancePhase}:{}),...(ch.emotion?{emotion:ch.emotion}:{}),...(sc.expressionCues?{expressionCues:copy(sc.expressionCues)}:{})};record(c,z);if(p.kind==='chapter'&&!q.failed)A.afterChapter(c,h.id);return z;
}
function shortcutGate(c){if(!c?.player)return {ok:false,reason:'育成中に使用できます'};const t=ensure(c),q=t.heroines[t.waitHeroine];
 if(t.shortcutUsed)return {ok:false,reason:'この育成では使用済みです'};
 if(!writable(c))return {ok:false,reason:'レース前後に使用できます'};
 if(!q||!q.met||q.failed||q.step>=7||q.step===6&&finalLock(t,t.waitHeroine))return {ok:false,reason:'進行中のヒロインの約束に使えます'};
 if(t.pending)return {ok:false,reason:'会話への返答を先に決めてください'};
 const remaining=t.nextAt-c.stats.races;if(remaining<=0)return {ok:false,reason:'今は待ち時間がありません'};
 return {ok:true,before:remaining,after:Math.max(0,remaining-2)};
}
function shortcut(c){const g=shortcutGate(c);if(!g.ok)return {error:g.reason};const t=ensure(c);t.shortcutUsed=true;t.nextAt=c.stats.races+g.after;record(c,{kind:'shortcut',heroine:t.waitHeroine,title:'ふたりの予定手帳を使った',note:'次に会うまで '+g.before+'走 → '+g.after+'走。',choice:'一度だけ、予定を合わせた'});return g;}
function depart(c){if(c.bonds)c.bonds.pending=null;}
function final(c,r,api){if(!c||!r||c.stage!==8||r!==c.series?.race||r.type!=='championship'||r.done||r.drive)return null;const t=ensure(c),h=B.map[t.partner],q=h&&t.heroines[h.id];if(!h||!q.dated||q.step!==7||t.completed!==h.id||q.failed||t.reward||!Craft.romanceGate(c,h.id))return null;
 const skill=c.player.difficulty==='easy'?D.easyRewardMap[h.skill]:h.skill;const acquired=api.acquire(c,c.player,skill,h.name+'とのSG優勝戦の約束');t.reward={heroine:h.id,skill,raceId:r.id,shown:false};record(c,{kind:'final',heroine:h.id,title:h.finalTitle,note:finalBody(c,h,r).join('\n'),choice:'SG優勝戦へ',skill});return acquired;
}
function rivalInfo(c,id){const n=c.story?.rivals.find(x=>x.id===id);if(!n)return null;const live=c.series?.npcs.find(x=>x.id===id),key=live?D.statKeys.slice().sort((a,b)=>live.stats[b]-live.stats[a])[0]:D.statKeys[S.hash(id)%5];return {...n,key,level:live?.stats[key]||[45,47,55,57,64,67,76,78,90][c.stage]};}
function train(c,id,method,api){if(!writable(c)||!['parallel','review','duel'].includes(method))return null;const n=rivalInfo(c,id),t=ensure(c);if(!n||t.training.stages.includes(c.stage)||c.stats.races<t.nextAt)return null;
 const rec=t.training.rivals[id]||(t.training.rivals[id]={bond:0,learned:false});t.training.stages.push(c.stage);t.pending=null;t.nextAt=c.stats.races+2;t.waitHeroine=null;
 const key=method==='review'?D.statKeys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0]:n.key;
 const score=c.player.stats[key]*.8+c.player.stats.power*.2+(S.hash(c.player.id+':'+id+':'+c.stage)%17)-8;
 const won=method==='duel'&&score>=n.level*.94,amount=method==='duel'?(won?.65:.2):method==='review'?.42:.4;
 const before=Math.floor(c.player.stats[key]);api.growStat(c.player,key,amount*1.5*api.statGrowthRate(c.player.stats[key])*api.growthFactor(c.player));rec.bond+=method==='duel'&&won?2:1;
 let skill=null;if(rec.bond>=3&&!rec.learned){const id=({speed:'wit_slipstream',turn:'wit_overtime',start:'wit_afteryou',accel:'wit_rudder',power:'wit_weather'})[n.key];skill=api.acquire(c,c.player,id,n.name+'との特訓');rec.learned=true;}
 const z={kind:'training',rivalId:id,portraitKey:n.portraitKey||null,title:n.name+'との特訓',note:method==='duel'?(won?'一本勝負に先着。相手も笑って、次の挑戦を約束した。':'一本勝負では後着。それでも、相手が旋回を抜けて加速する動きから、学ぶものがあった。'):method==='review'?'互いの課題を言葉にし、苦手を一つだけ練習した。':'競いすぎず併走し、相手の得意な動きを確かめた。',choice:({parallel:'併走で学ぶ',review:'弱点を指摘し合う',duel:'一本勝負'})[method],stat:key,gain:Math.floor(c.player.stats[key])-before,skill:skill?.id||null,won};record(c,z);return z;
}
function status(c,id){const t=ensure(c),q=t.heroines[id];return !q.met?'未発見':q.failed?'ルート終了':t.completed===id?'完走・交際中':q.step===6&&finalLock(t,id)?'最終話は進行不可':finalLock(t,id)?'友人として交流':q.dated?'交際中':q.step===6?'想いを伝え合って':q.step>=4?'恋を意識する頃':q.step>=3?'近づく二人':q.step>=2?'心を開く頃':q.step?'顔なじみ':'出会ったばかり';}
function valid(t){const num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,n)=>typeof v==='string'&&v.length<=n;
 if(!t||![1,2].includes(t.version)||!(t.partner===null||B.map[t.partner])||!num(t.nextAt,0,1000)||!num(t.serial,0,500)||!t.heroines||Array.isArray(t.heroines)||Object.keys(t.heroines).some(id=>!B.map[id])||B.heroines.some(h=>!t.heroines[h.id]&&!legacyOptionalHeroines.has(h.id)))return false;
 for(const h of B.heroines){const q=t.heroines[h.id];if(q===undefined&&!Object.prototype.hasOwnProperty.call(t.heroines,h.id)&&legacyOptionalHeroines.has(h.id))continue;if(!q||!num(q.step,0,7)||!num(q.trust,0,100)||!num(q.affection,0,100)||typeof q.failed!=='boolean'||typeof q.dated!=='boolean'||!str(q.reason,100)||!Array.isArray(q.choices)||q.choices.length!==q.step||!q.choices.every(v=>num(v,0,2))||q.dated&&(q.step<6||t.partner!==h.id||q.failed))return false;}
 for(const q of Object.values(t.heroines)){const v=q.romanceVisits;if(v!==undefined&&(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==3||!['middle','late','partner'].every(k=>num(v[k],0,500))))return false;}
 if(t.partner&&!t.heroines[t.partner]?.dated)return false;
 if(t.version===2){
  if(!(t.completed===null||B.map[t.completed])||!(t.waitHeroine===null||B.map[t.waitHeroine])||typeof t.shortcutUsed!=='boolean'||t.waitHeroine!==null&&!t.heroines[t.waitHeroine])return false;
  if(t.completed&&(t.partner!==t.completed||t.heroines[t.completed]?.step!==7||t.heroines[t.completed]?.failed))return false;
  for(const h of B.heroines){const q=t.heroines[h.id];if(q===undefined&&!Object.prototype.hasOwnProperty.call(t.heroines,h.id)&&legacyOptionalHeroines.has(h.id))continue;if(typeof q.met!=='boolean'||(q.met?!(num(q.metStage,0,8)&&num(q.metRace,0,1000)):q.metStage!==null||q.metRace!==null||q.step>0||q.trust>0||q.affection>0||q.failed||q.dated))return false;if(q.step===7&&!q.failed&&t.completed!==h.id)return false;}
  const e=t.encounters;if(!e||!num(e.seed,0,4294967295)||!Array.isArray(e.rolled)||e.rolled.length>54||new Set(e.rolled).size!==e.rolled.length||!e.rolled.every(k=>/^[0-8]:[0-5]$/.test(k)))return false;
  const ns=e.natsu;if(ns!==undefined&&(!ns||!num(ns.seed,0,4294967295)||!Array.isArray(ns.rolled)||ns.rolled.length>54||new Set(ns.rolled).size!==ns.rolled.length||!ns.rolled.every(k=>/^[0-8]:[0-5]$/.test(k)&&e.rolled.includes(k))))return false;
  const n=e.notice;if(n&&(!B.map[n.id]||!t.heroines[n.id]?.met||!num(n.stage,0,8)||!num(n.races,0,1000)||typeof n.shown!=='boolean'))return false;
 }
 const p=t.pending;if(p&&(!B.map[p.id]||!['chapter','visit'].includes(p.kind)||!num(p.step,0,7)||p.step!==t.heroines[p.id]?.step||!num(p.stamp,0,1000)||!str(p.key,100)||t.heroines[p.id]?.failed||t.version===2&&!t.heroines[p.id]?.met||p.kind==='chapter'&&p.step>=7))return false;
 const a=t.training;if(!a||!Array.isArray(a.stages)||a.stages.length>9||new Set(a.stages).size!==a.stages.length||!a.stages.every(v=>num(v,0,8))||!a.rivals||Object.keys(a.rivals).length>9||!Object.entries(a.rivals).every(([id,q])=>/^[a-zA-Z0-9_-]{1,100}$/.test(id)&&q&&num(q.bond,0,18)&&typeof q.learned==='boolean'))return false;
 if(!Array.isArray(t.log)||t.log.length>80||!t.log.every(l=>num(l.index,1,500)&&num(l.races,0,1000)&&num(l.stage,0,8)&&['romance','training','final','encounter','shortcut'].includes(l.kind)&&str(l.title,100)&&str(l.note,1500)&&str(l.choice,100)&&(!l.skill||D.abilityMap[l.skill])))return false;
 const z=t.reward;if(z&&(!B.map[z.heroine]||![B.map[z.heroine].skill,D.easyRewardMap[B.map[z.heroine].skill]].includes(z.skill)||(z.heroine!==t.partner&&!(t.heroines[z.heroine]?.failed&&t.log.some(l=>l.kind==='final'&&l.heroine===z.heroine&&l.skill===z.skill)))||!str(z.raceId,110)||typeof z.shown!=='boolean'))return false;return true;
}
// Generated raster portraits: stable identity, never a gameplay random draw.
function portrait(person,large=false,emotion=null){const h=typeof person==='string'?B.map[person]:person;if(!h)return '';const P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);return P?P.render(h,large,emotion):'';}

const API={outlook:Craft.romanceOutlook,episode,finalBody,B,discoverRacer,encounterRates,racerEncounterRate,natsuEncounterRate,natsuGate,encounter,metHeroines,finalLock,shortcutGate,shortcut,ensure,gate,open,scene,choose,depart,final,rivalInfo,train,status,valid,portrait,writable};root.KM_BONDS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);


