const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),E=require('../src/script.js');
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'v128-save.json'),'utf8')),out=E.decode(JSON.stringify(raw));
assert.equal(out.build,'129');assert.ok(E.validState(out));assert.deepEqual(out.career.player,raw.career.player);assert.deepEqual(out.career.series.race,raw.career.series.race);assert.deepEqual(out.career.affinity,raw.career.affinity);assert.deepEqual(out.career.campaign,raw.career.campaign);
fs.writeFileSync(path.join(__dirname,'legacy-v129.json'),JSON.stringify({build:'129',checks:['V128進行中レース、機材、能力、親愛度、物語を保持'],sourceBuild:raw.build},null,2)+'\n');console.log('V128 live save: PASS');
