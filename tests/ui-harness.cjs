'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict'),E=require('../script');
function classes(){const x=new Set();return {add:s=>x.add(s),remove:s=>x.delete(s),contains:s=>x.has(s),toggle(s,on){if(on===undefined)on=!x.has(s);on?x.add(s):x.delete(s);}};}
function env(){const nodes={},events={},pulses=[],timers=new Map();let last=0;const doc={hidden:false,body:{classList:classes(),appendChild(n){n.parentNode=this;nodes.overlay=n;}},getElementById(id){return nodes[id]||(nodes[id]={innerHTML:'',hidden:id==='modal',classList:classes(),querySelector:()=>null,focus(){},setAttribute(){}});},querySelector:()=>null,querySelectorAll:()=>[],createElement(){return {className:'',innerHTML:'',setAttribute(){},addEventListener(){},remove(){delete nodes.overlay;}};},addEventListener(k,f){(events[k]||=([])).push(f);}};
 const s={document:doc,navigator:{vibrate(x){pulses.push(x);return true;}},matchMedia:()=>({matches:false}),addEventListener(){},setTimeout(fn){timers.set(++last,fn);return last;},clearTimeout(i){timers.delete(i);},console,KM_DATA:E.D};s.globalThis=s;return {s,nodes,events,pulses,timers};
}
function app(state,options={}){const e=env(),store={kyotei_monogatari_v80:JSON.stringify(state)},errors=[],shown=[];
 Object.assign(e.s,{KM_RACING:E.R,KM_STORY:E.Story,KM_PROFILE:E.Profile,KM_BONDS:E.Bonds,KM_CAST:E.Cast,KM_RACE_RENDERER:require('../race-renderer'),KM_FEEDBACK:require('../race-feedback'),KM_AUDIO:options.audio||{scene(){},effect(){}},KM_PRESENTATION:{scene:p=>{e.page=p;},cancel(){},show:x=>shown.push(x),resultInfo:require('../presentation').resultInfo,supported:()=>true,pulse(){}},KM_DRIVE_UI:{...require('../driving-ui'),mount:()=>({destroy(){},pause(){}})},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]},scrollTo(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},console:{...console,error:x=>errors.push(String(x))},performance:{now:()=>0}});
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../script.js'),'utf8'),e.s);
 const click=(action,value='')=>{for(const fn of e.events.click||[])fn({target:{closest:()=>({disabled:false,dataset:{action,value}})}});assert.deepEqual(errors,[]);};
 return {...e,get page(){return e.page;},click,shown,state:()=>e.s.KM_APP.getState()};
}

module.exports={app,env};
