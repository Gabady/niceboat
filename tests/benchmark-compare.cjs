'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const a=require('./benchmark-v91.json'),b=require('./benchmark-v92.json');
assert.equal(a.fixtureSHA256,b.fixtureSHA256,'Conditions must not change between releases');
assert.equal(a.rows.length,20);assert.equal(b.rows.length,20);
const rows=b.rows.map((r,i)=>{const old=a.rows[i];assert.equal(old.id,r.id);assert.ok(r.valid&&r.finished&&r.finishers===6);const delta=(r.npcMeanTime/old.npcMeanTime-1)*100;assert.ok(Math.abs(delta)<=8,'Review pace regression: '+r.id);return {id:r.id,npcTimeChangePercent:Math.round(delta*100)/100,oldPlayerRank:old.playerRank,newPlayerRank:r.playerRank};});
fs.writeFileSync(path.join(__dirname,'benchmark-comparison.json'),JSON.stringify({fixtureSHA256:b.fixtureSHA256,allConditionsPassed:true,criteria:'same 20 inputs; 6 finishers; NPC mean time within ±8% of v91',rows},null,2));
console.log('20 fixed conditions passed; this is not a human win-rate estimate.');
