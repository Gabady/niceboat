const fs=require('fs'),path=require('path'),E=require(process.argv[2]||(fs.existsSync(path.join(__dirname,'../dist'))?'../dist/script.js':'../script.js')),D=E.D,R=E.R;
const rows=[],N=Number(process.argv[4]||6),modeRun=process.argv[5]||'watch';
for(const mode of ['easy','normal'])for(const stage of (process.argv[6]?process.argv[6].split(',').map(Number):[0,2,4,6,8])){
 const out=[];
 for(let i=0;i<N;i++){
  const s=E.newState(91+i*113),p=E.character(s,'比較');p.difficulty=mode;E.createCareer(s,p);const c=s.career;c.stage=stage;c.player.totalEarnings=1800;
  // Matched growth budget, with the existing easy 75% multiplier.
  for(const k of D.statKeys)c.player.stats[k]=Math.min(98,p.stats[k]+stage*5.3*(mode==='easy'?.75:1));
  c.player.skills=['quick',...(stage>=2?['slice']:[]),...(stage>=4?['grip','stout']:[]),...(stage>=6?['immune']:[])];
  E.startSeries(s);E.prepareRace(s);c.status='preRace';const r=c.series.race;r.watch=modeRun==='watch';const d=R.runAI(r,733+i*107),b=R.own(d),rank=R.ranks(d),first=rank[0],second=rank[1];
  out.push({seed:91+i*113,place:R.place(d,b),finish:b.finishTime,stats:E.average(c.player),npcStats:r.runners.filter(x=>!x.isPlayer).reduce((n,x)=>n+E.average(x),0)/5,gap:first.finishTime!==null&&second.finishTime!==null?second.finishTime-first.finishTime:null,behind:b.finishTime!==null&&first.finishTime!==null?b.finishTime-first.finishTime:null,allFinish:d.boats.every(x=>x.finishTime!==null)});
 }
 const result={mode,grade:D.stages[stage].tier,runs:N,wins:out.filter(x=>x.place===1&&x.finish!==null).length,top3:out.filter(x=>x.place<=3&&x.finish!==null).length,finish:out.filter(x=>x.finish!==null).length,meanPlace:out.reduce((n,x)=>n+x.place,0)/N,meanWinnerGap:out.reduce((n,x)=>n+(x.gap||0),0)/N,rows:out};rows.push(result);console.log(JSON.stringify({...result,rows:undefined}));
}
fs.writeFileSync(process.argv[3]||path.join(__dirname,'grade-v86-benchmark.json'),JSON.stringify({build:D.build,modeRun,assumptions:'Synthetic matched growth budget, 5.3 stat/stage times difficulty growth, fixed acquired skills, not a full career or human driving test.',rows},null,2));
