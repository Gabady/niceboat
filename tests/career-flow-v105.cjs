'use strict';
const E=require('../script'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),G=E.Development;
const rows=[];
for(const mode of ['easy','normal'])for(const arc of ['light','back','shore']){
 const s=E.newState(451),p=E.character(s,'一貫検証');p.difficulty=mode;p.scenario=arc;E.createCareer(s,p);const c=s.career;let races=0,finals=0;
 // Scripted equal-conditions phase results isolate career transitions from manual driving skill.
 while(!c.ending){assert.ok(E.startSeries(s));G.choosePlan(c,c.stage%2);E.prepareRace(s);
  while(c.status!=='seriesResult'){
   if(c.status==='action'){
    const r=G.rival(c),method=c.cast?.mentor?'mentor':'rival',key=method==='mentor'?E.Cast.map[c.cast.mentor.id].key:r.key;G.training(c,key,method,E);E.tune(c,'motor',c.stage%2?'accel':'balanced');
    for(const k of E.D.statKeys)if(G.ready(c,k))G.blossom(c,k,0,E);
    c.status='preRace';const race=c.series.race;if(c.story.pending?.kind==='duel')E.chooseStory(c,c.story.pending.key,0);
    E.simulate(c,race);race.runners.forEach((n,i)=>{n.score=n.isPlayer?1000:600-i;n.capsized=false;n.dnf=false;n.startFault=null;});
    if(race.type!=='qualifier')finals++;E.settleRace(s);races++;assert.ok(E.validState(E.decode(JSON.stringify(s))),arc+' '+mode+' '+c.stage);
   }
   if(c.status==='raceResult')E.continueAfterRace(s);
  }
  if(!c.ending)E.nextSeries(s);
 }
 assert.equal(c.stage,8);assert.equal(c.ending,'sgChampion');assert.equal(races,54);assert.equal(finals,9);const record=E.register(s);assert.ok(record.developmentJournal.archive);assert.ok(E.validState(E.decode(JSON.stringify(s))));rows.push({mode,arc,races,finals,registered:true});
}
const result={build:105,passed:rows.length,failed:0,method:'Scripted placement fixtures test state transitions and reward guards; not win-rate estimates.',rows};fs.writeFileSync(path.join(__dirname,'career-flow-v105-results.json'),JSON.stringify(result,null,2));console.log({passed:rows.length,failed:0,races:rows.reduce((n,r)=>n+r.races,0)});
