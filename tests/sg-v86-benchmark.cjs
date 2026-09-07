const fs=require('fs'),path=require('path'),E=require(fs.existsSync(path.join(__dirname,'../dist'))?'../dist/script.js':'../script.js'),D=E.D,R=E.R,rows=[];
for(const mode of ['easy','normal'])for(const ability of [85,93,100]){
 const races=[];for(let i=0;i<8;i++){
  const s=E.newState(91+113*i),p=E.character(s,'SG比較');p.difficulty=mode;E.createCareer(s,p);const c=s.career;c.stage=8;c.player.totalEarnings=1800;for(const k of D.statKeys)c.player.stats[k]=ability;
  c.player.skills=['quick','slice','grip','stout','immune','monkey_ssr'];E.startSeries(s);E.prepareRace(s);const r=c.series.race;r.watch=true;const d=R.runAI(r,733+i*107),b=R.own(d);races.push({place:R.place(d,b),time:b.finishTime,allFinish:d.boats.every(x=>x.finishTime!==null)});
 }const x={mode,ability,wins:races.filter(x=>x.place===1&&x.time!==null).length,top3:races.filter(x=>x.place<=3&&x.time!==null).length,races};rows.push(x);console.log(JSON.stringify({...x,races:undefined}));
}
fs.writeFileSync(path.join(__dirname,'sg-v86-benchmark.json'),JSON.stringify({assumptions:'SG qualifier profiles: uniform stats 85/93/100, six fixed skills including SSR V Monkey; 8 seeds each; not a measured human win rate or final-win probability.',rows},null,2));
