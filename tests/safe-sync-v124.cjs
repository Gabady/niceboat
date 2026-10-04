// Runs the delivered inline code, without importing an alternative src build.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const scripts=html=>Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g),m=>m[1]);
const base=read('index.html'),sourceHash=hash(base),core=scripts(base);
const guard=read('tools/iphone-support.js').trim();
const report={build:'124',sourceSha256:sourceHash,gameScripts:core.length,entries:[],browserRetested:false,physicalDevicesTested:false};
const serialized=value=>JSON.stringify(value);
let baseline;
for(const [file,platform] of [['index.html',null],['index_android_safe.html','Android'],['index_iphone_safe.html','iPhone']]){
 const html=read(file),inline=scripts(html),game=platform==='iPhone'?inline.slice(1):inline;
 assert.equal(game.length,36);assert.deepEqual(game,core);
 let normalized=html;
 if(platform){
  normalized=normalized.replace(' | '+platform+' Safe</title>','</title>');
  normalized=normalized.replace('<meta name="safe-source-sha256" content="'+sourceHash+'">\n','');
 }
 if(platform==='iPhone')normalized=normalized.replace('<script>\n'+guard+'\n</script>\n','');
 assert.equal(normalized,base,'HTML, CSS, controls, images and audio must all match the canonical build');
 const context=vm.createContext({console,structuredClone,TextEncoder,TextDecoder});
 vm.runInContext('const NativeDate=Date;globalThis.Date=class extends NativeDate{constructor(...a){super(...(a.length?a:[1791067621000]));}static now(){return 1791067621000;}};',context);
 inline.forEach((code,i)=>new vm.Script(code,{filename:file+':script-'+i}).runInContext(context));
 const E=context.KM_ENGINE;assert.equal(E.D.build,'124');
 const outputs=[];
 for(const [index,arc] of ['light','back','shore','recovery'].entries()){
  const s=E.newState(120+index),p=E.character(s,'同期検証');p.scenario=arc;
  const c=E.createCareer(s,p);assert.equal(c.campaign.arc,arc);assert.ok(E.validState(s));
  assert.ok(E.startSeries(s));assert.ok(E.prepareRace(s));assert.ok(E.train(c,'accel'));
  E.tune(c,'motor');c.status='preRace';E.autoResolve(s);assert.ok(c.series.race.done);
  assert.equal(E.ordered(c.series.race).length,6);assert.ok(c.series.race.settled);assert.ok(E.validState(s));
  const restored=E.decode(serialized(s));assert.ok(E.validState(restored));
  assert.equal(serialized(restored.career.player),serialized(s.career.player));
  outputs.push({arc,player:s.career.player,result:s.career.series.race.result,raceStats:s.career.stats,report:s.career.lastResult});
 }
 for(const version of [116,117]){
  const old=JSON.parse(read('tests/v'+version+'-save.json')),s=E.decode(serialized(old));
  assert.ok(E.validState(s));assert.equal(serialized(s.career.player.stats),serialized(old.career.player.stats));
  assert.equal(serialized(s.career.player.skills),serialized(old.career.player.skills));
 }
 const resultsHash=hash(serialized(outputs));
 if(baseline)assert.equal(resultsHash,baseline,'same seeded gameplay across all entrypoints');else baseline=resultsHash;
 if(platform==='iPhone'){
  assert.equal(context.KM_IPHONE.viewportHeight({height:700,scale:1},800),700);
  assert.equal(context.KM_IPHONE.viewportHeight({height:400,scale:2},800),800);
 }
 report.entries.push({file,sha256:hash(html),allGameScriptsEqual:true,fullHtmlAndAssetsEqual:true,inlineCodeExecuted:true,scenariosTested:4,seededGameplaySha256:resultsHash,oldSaves:[116,117],passed:true});
 console.log(file+': PASS');
}
fs.writeFileSync(path.join(__dirname,'safe-sync-v124.json'),JSON.stringify(report,null,2)+'\n');
console.log('All entrypoints: identical core, complete HTML/assets, 12 scenario/race runs and legacy save compatibility passed.');
