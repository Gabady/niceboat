'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),E=require('../script'),U=require('../driving-ui');
function target(){const events={};return {events,addEventListener(k,f){(events[k]||=[]).push(f)},removeEventListener(k,f){events[k]=(events[k]||[]).filter(x=>x!==f)},emit(k,e={}){for(const f of events[k]||[])f({preventDefault(){},...e})}}}
function mount(r,settings={},pointer=true){
 let now=0,raf=0,saves=0;const frames=new Map(),nodes={},rt=target();
 const noop=()=>{},ctx=new Proxy({}, {get:(a,k)=>k in a?a[k]:noop});
 const classList=()=>{const s=new Set();return {add:k=>s.add(k),remove:k=>s.delete(k),toggle(k,v){v?s.add(k):s.delete(k)},contains:k=>s.has(k)}};
 const node=id=>nodes[id]||(nodes[id]={...target(),id,innerHTML:'',textContent:'',hidden:id==='modal',classList:classList(),dataset:{},style:{},clientWidth:id==='steer-pad'?188:390,clientHeight:id==='steer-pad'?113:844,setAttribute(k,v){this[k]=v},getBoundingClientRect(){return {left:16,top:690,width:188,height:113}},getContext:()=>ctx,setPointerCapture(){}});
 const document={...target(),hidden:false,getElementById:node};
 const sandbox={...rt,document,performance:{now:()=>now},requestAnimationFrame(fn){frames.set(++raf,fn);return raf},cancelAnimationFrame:i=>frames.delete(i),setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:false}),KM_DATA:E.D,KM_RACING:E.R,KM_THRILL:require('../thrill'),KM_FEEDBACK:require('../race-feedback'),KM_RACE_RENDERER:{COLORS:['white','black','red','blue','yellow','green'],freshCanvas:c=>c,create:c=>({canvas:c,mode:'canvas',draw(){},project:()=>null,destroy(){},isLost:()=>false})},console};
 if(pointer)sandbox.PointerEvent=function(){};
 sandbox.globalThis=sandbox;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../driving-ui.js'),'utf8'),sandbox);
 node('drive-shell').innerHTML=U.view(r);
 const api=sandbox.KM_DRIVE_UI.mount(r,settings,{save:()=>saves++,finish:noop,exit:noop,skip:noop});
 function advance(ms=100){const end=now+ms;while(now<end){now+=1000/60;const all=[...frames.values()];frames.clear();all.forEach(fn=>fn(now))}}
 const click=action=>node('drive-shell').emit('click',{target:{closest:()=>({dataset:{drive:action}})}});
 return {node,root:sandbox,document,api,advance,click,settings,get saves(){return saves}};
}
module.exports={mount};
