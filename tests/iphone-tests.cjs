'use strict';
// Pure viewport calculations and Web Share API stand-ins; no browser/device simulation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.existsSync(path.join(__dirname,'../dist'))?'../dist/':'../';
const I=require(source+'iphone-compat.js');
const results=[];
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,error:e.stack});}}
function environment(options={}){const captured=[];const env={isSecureContext:true,File:class{constructor(parts,name,opts){this.parts=parts;this.name=name;this.type=opts.type;}},navigator:{canShare:()=>true,share:async data=>{captured.push(data);}}};Object.assign(env,options);return {env,captured};}
(async()=>{
 await test('Safari表示領域の高さを使い、ピンチズーム時は画面を縮め直さない',()=>{assert.equal(I.viewportHeight({height:663.6,scale:1},780),664);assert.equal(I.viewportHeight({height:331,scale:2},780),780);assert.equal(I.viewportHeight(null,667),667);assert.equal(I.viewportHeight(null,NaN),null);});
 await test('JSONの内容・名前・形式を保ち、共有APIをクリック直後に呼ぶ',async()=>{const {env,captured}=environment();const pending=I.shareBackup('{"version":80}','kyotei_save.json',env);assert.equal(captured.length,1);assert.equal(await pending,'shared');const f=captured[0].files[0];assert.deepEqual(f.parts,['{"version":80}']);assert.equal(f.type,'application/json');assert.equal(f.name,'kyotei_save.json');});
 await test('非HTTPS環境やAPI非対応は例外を出さずテキスト退避へ進む',async()=>{const {env,captured}=environment({isSecureContext:false});assert.equal(await I.shareBackup('{}','save.json',env),'unsupported');assert.equal(captured.length,0);assert.equal(await I.shareBackup('{}','save.json',{}),'unsupported');env.isSecureContext=true;env.navigator.canShare=()=>false;assert.equal(await I.shareBackup('{}','save.json',env),'unsupported');});
 await test('共有キャンセルと保存失敗を区別して保存済みと誤表示しない',async()=>{const {env}=environment();env.navigator.share=async()=>{throw {name:'AbortError'};};assert.equal(await I.shareBackup('{}','save.json',env),'cancelled');env.navigator.share=async()=>{throw Error('denied');};assert.equal(await I.shareBackup('{}','save.json',env),'failed');env.navigator.canShare=()=>{throw Error('unsupported');};assert.equal(await I.shareBackup('{}','save.json',env),'failed');});
 const report={version:'85.1',passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results,iphone_device_tested:false,browser_tested:false};fs.writeFileSync(path.join(__dirname,'iphone-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failed)process.exitCode=1;
})();
