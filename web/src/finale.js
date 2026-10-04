


/* V107: persistent final opponents, growing rival and racer heroine. Pure state transitions. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null),S=root.KM_STORY||(typeof require==='function'?require('./story.js'):null),Dev=root.KM_DEVELOPMENT||(typeof require==='function'?require('./development.js'):null),Cast=root.KM_CAST||(typeof require==='function'?require('./cast.js'):null),Bonds=root.KM_BONDS||(typeof require==='function'?require('./bonds.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const king={id:'teiou',name:'挺王',key:'speed',title:'頂点に残る者',quote:'ここまで来た理由を 最後の一周で見せろ',color:'#e2c68c',role:'cast'};
const roleNames={mentor:'師匠',wall_speed:'前哨の壁',wall_turn:'前哨の壁',wall_start:'前哨の壁',wall_power:'前哨の壁',wall_accel:'旧前哨の壁',king:'挺王',rival_final:'宿命のライバル',rival_ally:'共闘のライバル',rival:'ライバル',heroine:'朝凪 瑞希'};
function ensure(c){if(!c.finale)c.finale={version:1,wallDefeated:null,rival:{route:'open',chosenAt:null,growth:Math.min(54,c.stats.races)},settled:[],log:[],finalGrid:null};return c.finale;}
function note(c,title,text){const f=ensure(c);f.log.push({title,text,races:c.stats.races,stage:c.stage});f.log=f.log.slice(-24);}
function rivalSkills(c,final=false){const p=Dev.rival(c),n=final?Math.max(38,ensure(c).rival.growth):ensure(c).rival.growth,skills=p.skills.slice(0,n>=28?4:n>=16?3:n>=6?2:1);if(n>=38)skills.push(({speed:'comet',turn:'monkey_ur',start:'zero',accel:'wit_latefee',power:'wit_harbor'})[p.key]);if(final)skills.push('pioneer_start',({speed:'legend_speed',turn:'monkey_lr',start:'doguchi_lr',accel:'legend_tide',power:'wit_norefund'})[p.key]);return [...new Set(skills)];}
function growRival(c,n,final=false){const f=ensure(c),p=Dev.rival(c),base=[42,46,51,55,61,65,71,75,82][c.stage];n.racePersona=final?'rival_final':f.rival.route==='ally'?'rival_ally':'rival';n.skills=rivalSkills(c,final);n.mastery={};D.statKeys.forEach((k,i)=>n.stats[k]=final?(k===p.key?100:96):clamp(base+(k===p.key?7:((i+S.hash(p.id))%3-1)*2)+f.rival.growth*(k===p.key?.30:.18)-(c.player.difficulty==='easy'?4:0),20,96));return n;}
function female(c,template){const n=clone(template);n.id='mizuki';n.name='朝凪 瑞希';delete n.castId;delete n.castRole;n.special=false;n.racePersona='heroine';n.portraitKey='mizuki';n.mastery={};const base=[43,46,54,56,63,66,75,78,89][c.stage]-(c.player.difficulty==='easy'?4:0);D.statKeys.forEach((k,i)=>n.stats[k]=clamp(base+[0,5,-2,3,0][i],25,97));n.skills=['steady','slice','feather','monkey_ur','wit_harbor'].slice(0,1+Math.floor(c.stage/2));return n;}
function series(c){ensure(c);const n=c.series.npcs.find(n=>n.id===Dev.rival(c).id);if(n)growRival(c,n);c.series.npcs[1]=female(c,c.series.npcs[1]);}
function gate(c){const f=ensure(c),q=c.bonds?.heroines?.mizuki;return {king:!!f.wallDefeated&&f.rival.route!=='duel',nemesis:!!f.wallDefeated&&f.rival.route==='duel',ally:!!f.wallDefeated&&f.rival.route==='ally',heroine:!!q&&!q.failed&&q.step>=5&&q.choices[4]===0};}
function putRoster(c,people){const ids=new Set(people.map(p=>p.id));for(const n of people){if(n.id===c.player.id)continue;let i=c.series.npcs.findIndex(p=>p.id===n.id);if(i<0)i=c.series.npcs.findIndex(p=>!ids.has(p.id));if(i>=0)c.series.npcs[i]=clone(n);}}
function lineUp(c,people,type){const f=ensure(c);if(c.stage!==8||type!=='championship'){
 if(type==='qualifier'&&c.series.round===1&&!people.some(n=>n.id==='mizuki')){const n=c.series.npcs.find(n=>n.id==='mizuki');if(n){people=people.slice();const i=people.findLastIndex(p=>p.id!==c.player.id&&!p.special&&!p.castRole&&p.id!==Dev.rival(c).id);if(i>=0)people[i]=n;}}return people;
 }
 const g=gate(c),template=c.series.npcs.find(p=>!p.castRole)||c.series.npcs[0],mentor=Cast.profile(c,'mentor',c.series.npcs.find(p=>p.id==='cast_'+c.cast.mentor.id)||template),wall=Cast.profile(c,'boss',c.series.npcs.find(p=>p.id==='cast_'+c.cast.boss.id)||template),group=[c.player,mentor,wall];
 if(g.nemesis||g.ally){let n=clone(c.series.npcs.find(p=>p.id===Dev.rival(c).id)||template),p=Dev.rival(c);Object.assign(n,{id:p.id,name:p.name,portraitKey:p.portraitKey,special:false});delete n.castId;delete n.castRole;growRival(c,n,g.nemesis);group.push(n);}
 if(g.king){const n=clone(template);Object.assign(n,{id:'cast_teiou',name:king.name,castId:'teiou',castRole:'king',racePersona:'king',special:false,stats:Object.fromEntries(D.statKeys.map(k=>[k,96])),skills:['legend_speed','monkey_ur','wit_harbor','zero','straighten','pioneer_start'],mastery:{}});group.push(n);}
 if(g.heroine)group.push(female(c,c.series.npcs.find(p=>p.id==='mizuki')||template));
 const reserved=new Set([Dev.rival(c).id,'mizuki','cast_teiou']);for(const n of [...people,...c.series.npcs]){if(group.length===6)break;if(!group.some(p=>p.id===n.id)&&!reserved.has(n.id)&&!n.castRole)group.push(n);}
 if(group.length!==6)throw Error('Final grid must contain six unique boats');putRoster(c,group);f.finalGrid={ids:group.map(n=>n.id),king:g.king,nemesis:g.nemesis,ally:g.ally,heroine:g.heroine};return group;
}
function attach(c,r){if(c.stage===8&&r.type==='championship'){r.finalGrid=clone(ensure(c).finalGrid);r.finalAlliance=r.finalGrid?.ally?Dev.rival(c).id:null;}}
function settle(c,r,result,api){const f=ensure(c);if(f.settled.includes(r.id))return;f.settled.push(r.id);f.settled=f.settled.slice(-54);f.rival.growth=Math.min(54,f.rival.growth+1);
 const n=c.series.npcs.find(n=>n.id===Dev.rival(c).id);if(n&&r.type==='qualifier')growRival(c,n);
 if(c.stage===8&&r.type==='qualifier'&&result.castDuel?.kind==='boss'&&result.castDuel.won&&!f.wallDefeated){f.wallDefeated={raceId:r.id,id:result.castDuel.id};note(c,'頂点への招待','前哨の壁を越えた。優勝戦へ進めば、'+(f.rival.route==='duel'?Dev.rival(c).name:'挺王')+'が最後の相手になる。');result.finaleNotice=f.log.at(-1).text;}
 const meet=Bonds.discoverRacer(c,r,result);if(meet){result.finaleNotice='朝凪 瑞希がピットで待っています。物語から会いに行けます。';note(c,'勝負のあとで','朝凪 瑞希との物語が始まった。');}
 if(r.type==='championship'&&c.stage===8){const target=result.finish.find(n=>['cast_teiou',Dev.rival(c).id].includes(n.id)&&r.runners.find(p=>p.id===n.id)?.racePersona?.match(/king|rival_final/)),me=result.finish.find(n=>n.isPlayer);if(target){const won=!!me&&!me.dnf&&!me.capsized&&!me.startFault&&me.place<target.place;result.finalChallenge={id:target.id,won,champion:won&&me.place===1};if(won){const skill=api.acquire(c,c.player,api.rewardRarity(c.player,'LR')==='UR'?'comet':'legend_speed','最後の壁を越えた');result.acquired.push(skill);}note(c,won?'その背中の先へ':'次の航跡へ',won?(me.place===1?'最後の相手に先着し、優勝をつかんだ。':'最後の相手に先着した。優勝は別の艇へ。次は一着で、この岸に戻る。'):'最後の相手に先着できなかった。悔しさを抱えたまま、ピットで言葉を交わした。');}}
}
function routeGate(c){const f=ensure(c),n=Dev.rival(c);return !!c&&!c.ending&&!['race','registration'].includes(c.status)&&!(c.series?.race?.drive&&!c.series.race.done)&&!(c.stage===8&&c.series?.race?.type==='championship')&&c.stage>=4&&n.wins+n.losses>=2&&f.rival.route==='open';}
function routeScene(c){const n=Dev.rival(c),t=ensure(c),ahead=n.wins>=n.losses;return {key:'rival-path:'+n.id,person:n,title:'頂点へ向かう約束',background:'harbor',body:[
 '二人の対戦表を広げた。自分の先着は'+n.wins+'回、後着は'+n.losses+'回。',
 n.name+'「'+(ahead?'負けた後、お前の映像を何度も見た。次にどこで抜くか、ずっと考えてた。':'先に出ても、後ろが気になった。お前が追ってくるから、勝った日も練習を変えた。')+'」',
 '主人公「自分も、出走表で真っ先に名前を探してたよ」',
 n.name+'「ここから先も、互いを一番倒したい相手として走るか。それとも、弱点まで見せて一緒に頂点へ挑むか」',
 '主人公「教え合っても、一着を譲る気はないぞ」',
 n.name+'「それは同じ。譲られて取る一着なら、欲しくない」',
 t.wallDefeated?'主人公「壁は越えた。次の優勝戦で、どう競うか決めよう」':'主人公「まずは最高峰の壁を越える。その先のためにも、今決めたい」'
 ],choices:[{label:'最後は互いを倒すために 競い続けよう',note:'宿命のライバル'},{label:'弱点を教え合い 一緒に頂点へ挑もう',note:'頂点への共闘'}]};}
function chooseRoute(c,index){if(!routeGate(c)||![0,1].includes(index))return null;const f=ensure(c);f.rival.route=index===0?'duel':'ally';f.rival.chosenAt=c.stats.races;const n=c.series?.npcs.find(p=>p.id===Dev.rival(c).id);if(n)growRival(c,n);const z={title:index===0?'最後の相手は お前だ':'二人で頂点へ挑む',note:index===0?'{{rival}}「分かった。次に並ぶまでに、もっと強くなっておく」\n主人公「こっちもだ。今日より簡単に勝てると思うなよ」':'{{rival}}「じゃあ、見せたくなかった失敗から出す。先に笑うなよ」\n主人公「こっちのも見せる。直した上で競おう。その方が勝ちたい」'};note(c,z.title,z.note);return z;}
function finalScene(c){const r=c.series?.race;if(!r||c.stage!==8||r.type!=='championship')return null;const target=r.runners.find(n=>['king','rival_final'].includes(n.racePersona));if(!target)return null;const ally=ensure(c).rival.route==='ally',rival=Dev.rival(c),nemesis=target.racePersona==='rival_final';return {key:'final-promise:'+r.id,person:nemesis?rival:king,title:nemesis?'最後の相手は お前だ':'挺王との優勝戦',background:'workshop',body:[
 '優勝戦の出走表に、'+target.name+'の名前がある。',
 ...(nemesis?[rival.name+'「最初に競った頃より、ずいぶんできることが増えたな」','主人公「前の癖を狙っても、もう通らないぞ」',rival.name+'「分かってる。負けた日も、教え合ったことも、今日は全部使う」','主人公「こっちも全部使う。最後の一着は譲らないからな」']:[
 '挺王「前哨を越えたそうだな。次は俺か」','主人公「はい。ここで満足して帰るつもりはありません」','挺王「なら、準備したことを使え。名前を見て走りを変えるな」','主人公「無視できる名前でもないですけど」','挺王「それなら最後まで追ってこい。俺も、後ろを確認する」']),
 ...(ally?[rival.name+'「映像で調べた出口、同じ場所だけを取りに行くなよ」','主人公「分かってる。相談はここまでだ。先に出た方も一着を狙う」']:[]),
 ...(r.runners.some(n=>n.id==='mizuki')?['瑞希「特別な対決の途中でも、私が先に出たらそのまま行くよ」','主人公「忘れてない。六艇、全部相手だ」']:['ほかの艇も、出走の準備を終えた。']),
 '主人公「終わったら、今日の話をしよう。まずは走ってくる」'
 ]};}
function outcomeScene(c){const z=c.lastResult,r=c.series?.race,target=z?.finalChallenge&&r?.runners.find(n=>n.id===z.finalChallenge.id);if(!target)return null;const nemesis=target.racePersona==='rival_final',person=nemesis?Dev.rival(c):king,q=z.finalChallenge;return {key:'last-shore:'+r.id,person,title:q.champion?'優勝を確かめて':q.won?'先着した相手と 次の課題':'届かなかった一戦',background:'harbor',body:[
 q.champion?'結果表の一番上に、自分の名前がある。':q.won?'対決の相手には先着した。優勝したのは、別の選手だった。':'結果表を確かめ、先に戻っていた相手へ歩み寄った。',
 ...(nemesis?(q.won?[person.name+'「悔しい。今すぐ、いい勝負だったって顔はできない」','主人公「しなくていい。こっちだって逆なら、そうなる」',person.name+'「でも映像は見る。どこを変えたか、後で聞かせろ」']:[person.name+'「次は何を変える？」','主人公「今は、悔しいって言うので精いっぱいだ」',person.name+'「分かった。少し待つ。でも、次の話も聞きたい」']):(q.won?[
 '挺王「今日は、お前が先だった。この勝負は、お前の勝ちだ」','主人公「勝つために、何度も映像を見ました」','挺王「次はこちらが見る。今日の走りを、同じままで終わらせるなよ」']:[
 '挺王「何が足りなかった？」','主人公「まだ、うまく言えません。映像を見直してから答えたいです」','挺王「なら、見つけてまた来い。俺も同じままでは待たない」'])),
 ...(ensure(c).rival.route==='ally'?['{{rival}}「二人分の映像、持ってきた。落ち着いたら一緒に見よう」','主人公「ありがとう。後で見せてくれ。今は少し、気持ちを落ち着けたい」']:[]),
 q.champion?'主人公「まずは、勝ったって報告してくる。今日は、ありがとう」':'主人公「今すぐ平気な顔はできない。でも、この映像は取っておく。次の準備に使いたい」'
 ]};}
function validGrid(g){return !g||Array.isArray(g.ids)&&g.ids.length===6&&new Set(g.ids).size===6&&g.ids.every(id=>typeof id==='string'&&id.length<=110)&&['king','nemesis','ally','heroine'].every(k=>typeof g[k]==='boolean')&&!(g.king&&g.nemesis);}
function valid(f){if(f==null)return true;const n=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,str=(v,k)=>typeof v==='string'&&v.length<=k;if(f.version!==1||!f.rival||!['open','duel','ally'].includes(f.rival.route)||!(f.rival.chosenAt===null||n(f.rival.chosenAt,0,54))||!n(f.rival.growth,0,54)||!Array.isArray(f.settled)||f.settled.length>54||new Set(f.settled).size!==f.settled.length||!f.settled.every(id=>str(id,110)))return false;
 if(f.wallDefeated&&(!str(f.wallDefeated.raceId,110)||!Cast.map[f.wallDefeated.id]||!['kurose','shirakami','kagura','onizuka','raiden'].includes(f.wallDefeated.id)))return false;
 if(!Array.isArray(f.log)||f.log.length>24||!f.log.every(q=>str(q.title,100)&&str(q.text,1000)&&n(q.races,0,54)&&n(q.stage,0,8)))return false;
 return validGrid(f.finalGrid);}

const API={finalScene,outcomeScene,validGrid,king,roleNames,ensure,series,lineUp,attach,settle,gate,routeGate,routeScene,chooseRoute,growRival,rivalSkills,valid};root.KM_FINALE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);



