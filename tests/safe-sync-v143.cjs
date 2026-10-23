// Execute the delivered reader and click handlers. This is a DOM adapter, not a browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const base=read('index.html'),core=[...base.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const report={build:'143',sourceSha256:hash(base),gameScripts:core.length,testType:'Delivered inline scripts and delegated pointer/click handlers in DOM adapter',browserTested:false,physicalDevicesTested:false,entries:[]};
for(const [file,platform] of [['index.html','base'],['index_android_safe.html','android'],['index_iphone_safe.html','iphone']]){
 const html=read(file),code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);if(platform==='iphone')code.shift();assert.deepEqual(code,core);
 const filename='progress-'+platform+'-v143.json';
 cp.execFileSync(process.execPath,['tests/progress-v143.cjs'],{cwd:root,env:{...process.env,ENTRYPOINT140:file,REPORT139:filename},stdio:'pipe'});
 const result=JSON.parse(read('tests/'+filename));assert.equal(result.failures,undefined);assert.ok(result.checks.length>=23);
 report.entries.push({file,sha256:hash(html),allGameScriptsEqual:true,inlineCodeExecuted:true,delegatedClickChecks:result.checks.length,passed:true});console.log(file+': '+result.checks.length+' click/progression checks PASS');
}
fs.writeFileSync(path.join(__dirname,'safe-sync-v143.json'),JSON.stringify(report,null,2)+'\n');
