const E=require(process.argv[2]),out=[];
for(const value of [25,40,55,70,85,95])for(const mode of ['easy','normal']){
 const s=E.newState(12801),p=E.character(s,'成長比較');p.scenario='light';p.difficulty=mode;E.createCareer(s,p);const c=s.career;E.startSeries(s);E.prepareRace(s);for(const k of E.D.statKeys)c.player.stats[k]=value;
 c.seed=require('./growth-seeds-v128.json').find(x=>x.mode===mode).seed;const t=E.train(c,'speed');for(const k of E.D.statKeys)c.player.stats[k]=value;
 const r=c.series.race;r.type='consolation';r.phase=4;r.done=true;for(const n of r.runners)n.score=n.isPlayer?20:10;const z=E.settleRace(s);
 out.push({value,mode,training:t.gain,race:z.growth.speed});
}
console.log(JSON.stringify(out));
