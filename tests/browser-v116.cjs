'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),E=require('../script');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..'),results=[],errors=[];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.KM_TEST_BROWSER||'/tmp/v105-browser/chrome-headless-shell-linux64/chrome-headless-shell',env:{...process.env,FONTCONFIG_FILE:'/tmp/v105-fonts.conf'},args:['--no-sandbox']});
 for(const [file,width,mode] of [['index.html',390,'auto'],['index.html',360,'canvas'],['index_android_safe.html',390,'auto'],['index_iphone_safe.html',320,'auto']]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(String(e)));
   const s=E.newState(882);E.createCareer(s,E.character(s,'水城 遥'));E.startSeries(s);E.prepareRace(s);s.build='115';s.career.status='preRace';s.career.story.pending=null;s.settings.renderMode=mode;s.settings.guide=false;s.settings.presentation='off';s.settings.haptics=false;
   await page.addInitScript(s=>{localStorage.setItem('kyotei_monogatari_v80',JSON.stringify(s));window.__clicks={};document.addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a)window.__clicks[a]=(window.__clicks[a]||0)+1;},true);},s);
   await page.goto('file://'+path.join(root,file));await page.waitForFunction(()=>!!window.KM_APP);
   assert.equal(await page.evaluate(()=>KM_ENGINE.D.build),'116');assert.equal(await page.evaluate(()=>KM_ENGINE.validState(KM_APP.getState())),true);assert.deepEqual(await page.evaluate(()=>KM_APP.getState().career.bonds),s.career.bonds);
   const tap=async(action)=>{const before=await page.evaluate(a=>window.__clicks[a]||0,action);await page.locator('[data-action="'+action+'"]').first().tap();await page.waitForFunction(([a,n])=>(window.__clicks[a]||0)>n,[action,before]);};
   await tap('resume');
   await page.evaluate(()=>{const create=KM_RACE_RENDERER.create;KM_RACE_RENDERER.create=(...args)=>{const r=create(...args);window.__renderer=r;const draw=r.draw;r.draw=(...a)=>{draw(...a);window.__frames=(window.__frames||0)+1;};return r;};});
   await tap('start');await page.waitForFunction(()=>window.__frames>0);assert.equal(await page.evaluate(()=>window.__renderer.mode),mode==='canvas'?'canvas':'webgl');
   await page.locator('[data-drive="resume"]').tap();await page.waitForFunction(()=>{const d=KM_APP.getState().career.series.race.drive;return !d.paused&&d.elapsed>.15;});
   const canvas=page.locator('#water-canvas');assert.ok(await canvas.evaluate(n=>n.width>0&&n.height>0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.deepEqual(await page.evaluate(()=>KM_RACE_RENDERER.COLORS),['#f4f5ef','#171d24','#df2635','#125dd3','#ffd124','#179b5c']);
   const name=file==='index.html'?mode:file.includes('android')?'android':'iphone';await page.screenshot({path:path.join(root,'previews/v116-browser-'+name+'.png')});
   await page.locator('[data-drive="pause"]').tap();await page.waitForFunction(()=>KM_APP.getState().career.series.race.drive.paused===true);
   // Draw an active, close pursuit without changing the saved race; real renderer and UI remain mounted.
   const captured=await page.evaluate(()=>{const state=KM_APP.getState(),race=state.career.series.race,d=race.drive,own=KM_RACING.own(d);Object.assign(own,{x:-70,z:40,heading:0,speed:18,frame:1,posture:0,heel:0});let i=0;for(const b of d.boats)if(b!==own){Object.assign(b,{x:-61+(i%2)*6,z:40+(i-2)*3,heading:.02,speed:18,frame:i+2,posture:0});i++;}d.elapsed=35;d.started=true;window.__renderer.draw(d,race,{guide:false,motion:true});return document.getElementById('water-canvas').toDataURL('image/png');});
   fs.writeFileSync(path.join(root,'previews/v116-browser-'+name+'-canvas.png'),Buffer.from(captured.split(',')[1],'base64'));
   const stored=await page.evaluate(()=>KM_ENGINE.decode(localStorage.getItem('kyotei_monogatari_v80')));assert.equal(stored.build,'116');assert.ok(stored.career.series.race.drive);
   results.push({name:file+' '+mode+' '+width+'px 旧セーブ維持 レース描画 再開 停止 保存',passed:true});console.log('PASS',file,mode,width);
  }catch(e){results.push({name:file+' '+mode,passed:false,error:e.stack});console.error('FAIL',file,mode,e.message);}
  await context.close();
 }
 await browser.close();results.push({name:'未処理JavaScriptエラーなし',passed:errors.length===0,errors});
 const report={build:116,passed:results.filter(x=>x.passed).length,failed:results.filter(x=>!x.passed).length,results,browser:'Chromium mobile touch emulation 390/360/320px; WebGL and Canvas',androidDeviceTested:false,iphoneDeviceTested:false,safariTested:false};fs.writeFileSync(path.join(root,'tests/browser-v116-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
