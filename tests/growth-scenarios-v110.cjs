'use strict';
function state(E,stage=2){const s=E.newState(402);E.createCareer(s,E.character(s,'育成比較'));s.career.stage=stage;E.startSeries(s);E.prepareRace(s);const c=s.career;c.player.skills=['quick'];for(const k of E.D.statKeys)c.player.stats[k]=40.25;return s;}
function metrics(E){const rows=[];function run(name,fn){const s=state(E),c=s.career,before={...c.player.stats};const result=fn(s,c);rows.push({name,before,after:{...c.player.stats},gains:Object.fromEntries(E.D.statKeys.map(k=>[k,+(c.player.stats[k]-before[k]).toFixed(2)])),result:result||null});}
run('自主練',(s,c)=>E.train(c,'turn').gain);
run('ライバル特訓',(s,c)=>E.Development.training(c,E.Development.rival(c).key,'rival',E).gain);
run('師匠合同練習',(s,c)=>E.Development.training(c,E.Cast.map[c.cast.mentor.id].key,'mentor',E).gain);
run('本編イベント',(s,c)=>{const e=c.campaign.entries[0],i=E.Drama.B.decisions[c.campaign.arc][e.choiceSpec][2];return E.Drama.choose(c,e.id,i,E).gain;});
run('師匠イベント',(s,c)=>{const sc=E.Cast.routeOpen(c);return E.chooseMentor(c,sc.key,sc.choices.findIndex(x=>x.aligned)).gain;});
run('ライバルイベント',(s,c)=>{const sc=E.Drama.rivalScene(c,E.Development.rival(c));return E.Drama.chooseRival(c,sc.index,E.Drama.B.rivals[c.development.rival.cast].chapters[sc.index][3],E).gain;});
run('日常イベント',(s,c)=>{const e=E.Story.events.find(x=>!x.arc&&x.choices.some(q=>q.effect.stat&&q.effect.value>0&&!q.effect.skill)),i=e.choices.findIndex(q=>q.effect.stat&&q.effect.value>0);c.story.pending={kind:'event',id:e.id,key:'growth-test',raceId:c.series.race.id};E.chooseStory(c,'growth-test',i);return e.id;});
run('能力の新規獲得',(s,c)=>E.acquire(c,c.player,'stretch','試験').id);
run('レース後',(s,c)=>{const r=c.series.race;E.simulate(c,r);r.runners.forEach((n,i)=>{n.score=n.isPlayer?1000:600-i;n.capsized=false;n.dnf=false;n.startFault=null;});E.settleRace(s);return c.lastResult.growth;});
return rows;}
module.exports={state,metrics};
