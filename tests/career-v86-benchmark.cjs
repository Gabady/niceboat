const fs=require('fs'),path=require('path'),E=require(process.argv[2]||(fs.existsSync(path.join(__dirname,'../dist'))?'../dist/script.js':'../script.js')),D=E.D,rows=[];
for(const mode of ['easy','normal'])for(let trial=0;trial<Number(process.argv[4]||2);trial++){
 const s=E.newState(919+trial*317);const p=E.character(s,'育成検証');p.difficulty=mode;E.createCareer(s,p);const c=s.career;let guard=0;const series=[];
 while(!c.ending&&guard++<600){
  if(c.status==='home'){if(!E.startSeries(s))break;}
  if(c.status==='seriesIntro'||c.status==='between')E.prepareRace(s);
  if(c.status==='action'){
   const target=D.statKeys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0];E.train(c,target);c.status='preRace';
  }
  if(c.status==='preRace'||c.status==='race'){
   const r=E.prepareSpectator(s);while(!r.done)E.spectatorStep(s);
   const x=c.lastResult;let row=series.find(x=>x.stage===c.stage);if(!row){row={stage:c.stage,grade:D.stages[c.stage].tier,races:0,wins:0,top3:0};series.push(row);}row.races++;row.wins+=x.place===1&&!x.dnf?1:0;row.top3+=x.place<=3&&!x.dnf?1:0;row.average=E.average(c.player);
  }
  if(c.status==='raceResult')E.continueAfterRace(s);
  if(c.status==='seriesResult'){if(c.ending)break;E.nextSeries(s);}
 }
 const row={mode,trial,ending:c.ending,stage:c.stage,skills:c.player.skills,stats:c.player.stats,earnings:c.player.totalEarnings,series};rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(process.argv[3]||path.join(__dirname,'career-v86-benchmark.json'),JSON.stringify({build:D.build,policy:'No rerolls, no shop, lowest base stat training each race; natural gate; real 3-lap spectator',rows},null,2));
