'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),E=require('../script'),R=E.R,baseline=require('./posture-v102-baseline.json'),rows=[];
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const smoke=process.argv.includes('--smoke');
const current=d=>({place:R.place(d,R.own(d)),time:R.own(d).finishTime,finish:d.boats.filter(x=>x.finishTime!==null).length,faults:d.boats.filter(x=>x.startFault).length,capsize:d.boats.filter(x=>x.capsized).length,npcMean:mean(d.boats.filter(x=>!x.isPlayer&&x.finishTime!==null).map(x=>x.finishTime)),boundaries:d.boats.reduce((v,x)=>v+x.metrics.boundaries,0)});
for(const fixture of smoke?baseline.cases.slice(0,1):baseline.cases){
 const result=current(R.runAI(E.clone(fixture.race),fixture.driveSeed));
 if(smoke){const prior=require('./posture-v103-benchmark.json').rows.find(x=>x.mode===fixture.mode&&x.grade===fixture.grade&&x.rough===fixture.rough).samples.find(x=>x.seed===fixture.seed).current;assert.deepEqual(result,prior);console.log('Portable fixture matches recorded v103 race.');continue;}
 let row=rows.find(x=>x.mode===fixture.mode&&x.grade===fixture.grade&&x.rough===fixture.rough);
 if(!row){row={mode:fixture.mode,grade:fixture.grade,rough:fixture.rough,samples:[]};rows.push(row)}row.samples.push({seed:fixture.seed,old:fixture.old,current:result});
}
if(!smoke){for(const row of rows){const samples=row.samples;row.oldNpcTime=mean(samples.map(x=>x.old.npcMean));row.newNpcTime=mean(samples.map(x=>x.current.npcMean));row.timeChange=row.newNpcTime/row.oldNpcTime-1;row.oldFinish=samples.reduce((n,x)=>n+x.old.finish,0);row.newFinish=samples.reduce((n,x)=>n+x.current.finish,0);row.oldWins=samples.filter(x=>x.old.place===1&&x.old.time!==null).length;row.newWins=samples.filter(x=>x.current.place===1&&x.current.time!==null).length;console.log(JSON.stringify({...row,samples:undefined}))}fs.writeFileSync(path.join(__dirname,'posture-v103-benchmark.json'),JSON.stringify({build:E.D.build,assumptions:'60 paired synthetic 3-lap races, 2 difficulties, 5 grades, dry/rough and 3 seeds. Fixed v102 fixtures/baselines in posture-v102-baseline.json. All boats on AI; not human win rates.',rows},null,2))}
