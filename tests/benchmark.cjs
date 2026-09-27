'use strict';
// Immutable input fixtures are shared by old and new engines. Never use production saves.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=path.resolve(process.argv[2]||path.join(__dirname,'../dist'));
const R=require(path.join(source,'racing.js')),D=require(path.join(source,'data.js'));
const fixture=fs.readFileSync(path.join(__dirname,'benchmark-fixtures.json'));
const cases=JSON.parse(fixture),rows=[];
for(const c of cases){const r=JSON.parse(JSON.stringify(c.race)),d=R.runAI(r,c.seed),b=R.own(d),finishers=d.boats.filter(b=>b.finishTime!==null),npc=finishers.filter(b=>!b.isPlayer);
 rows.push({id:c.id,grade:r.grade,difficulty:r.difficulty,finished:d.finished,finishers:finishers.length,valid:R.valid(d,r),playerRank:R.place(d,b),playerTime:b.finishTime,npcMeanTime:npc.length?npc.reduce((n,b)=>n+b.finishTime,0)/npc.length:null,contacts:d.boats.reduce((n,b)=>n+b.metrics.contacts,0),boundaries:d.boats.reduce((n,b)=>n+b.metrics.boundaries,0)});
 console.log(c.id,rows.at(-1).playerRank,finishers.length);
}
const report={build:D.build,fixtureSHA256:crypto.createHash('sha256').update(fixture).digest('hex'),method:'fixed 3-lap spectator AI; not human driving win rate',rows};
fs.writeFileSync(process.argv[3]||path.join(__dirname,'benchmark-current.json'),JSON.stringify(report,null,2));
if(rows.some(r=>!r.finished||!r.valid||r.finishers<4))process.exitCode=1;
