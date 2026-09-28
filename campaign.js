(function(root){
'use strict';
const B=root.KM_CAMPAIGN_DATA||(typeof require==='function'?require('./campaign-data.js'):null),D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x));
function build(p){const order=D.statKeys.slice().sort((a,b)=>p.stats[b]-p.stats[a]);return {strong:p.stats[order[0]]-p.stats[order[4]]<8?'balanced':order[0],weak:p.stats[order[0]]-p.stats[order[4]]>=15?order[4]:null};}
function ensure(c){if(!c.campaign){c.campaign={version:1,arc:B.map[c.player.scenario]?c.player.scenario:'light',origin:c.stage,entries:[{id:'opening',kind:'opening',stage:c.stage,outcome:'steady',...build(c.player),read:false,late:c.stage>0}],closed:false};}return c.campaign;}
function outcome(z){return z.champion?'win':z.finalType==='championship'||z.finalType==='consolation'&&z.finalPlace<=3?'steady':'setback';}
function capture(c,z){const t=ensure(c);if(t.closed)return t;const i=B.stages.indexOf(z.stage),id='season:'+z.stage;
 if(i>=0&&!t.entries.some(e=>e.id===id)){t.entries.push({id,kind:'season',stage:z.stage,outcome:outcome(z),...build(c.player),read:false,result:{rank:z.qualificationRank,place:z.finalPlace,type:z.finalType,champion:!!z.champion}});}
 if(c.ending==='gate')close(c,'gate');else if(z.stage===8)t.closed=true;return t;
}
function close(c,kind='early'){const t=ensure(c);if(t.closed)return t;t.entries.push({id:kind,kind,stage:c.stage,outcome:'setback',...build(c.player),read:false});t.closed=true;return t;}
function mark(t,id){const e=t?.entries.find(e=>e.id===id);if(!e)return false;e.read=true;return true;}
function scene(t,id){const a=B.map[t.arc],e=t.entries.find(e=>e.id===id);if(!a||!e)return null;
 let title,body;if(e.kind==='opening'){title='プロローグ';body=a.intro.slice();if(e.late)body.unshift('ここまでの走りを経て、デビューの日のことを思い返す。これは、この選手が水面に出た理由の物語。');}
 else if(e.kind==='season'){const i=B.stages.indexOf(e.stage),ch=a.chapters[i];title=ch.title;body=[...ch.body,ch.variants[e.outcome]];if([3,7,8].includes(e.stage)){body.push(a.craft[e.strong]);if(e.weak)body.push(D.stats[e.weak]+'には、まだ課題が残る。今ある強みだけでは届かない場所を、次に練習する理由として覚えておく。');}}
 else{title=e.kind==='gate'?'届かなかった先へ':'自分で決めた区切り';body=[a[e.kind]];}
 return {title,body,arc:a.title,stage:e.stage,kind:e.kind,result:e.result||null};}
function valid(t){const n=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b;if(!t||t.version!==1||!B.map[t.arc]||!n(t.origin,0,8)||typeof t.closed!=='boolean'||!Array.isArray(t.entries)||!t.entries.length||t.entries.length>7)return false;
 if(t.entries[0].id!=='opening'||t.entries[0].kind!=='opening'||new Set(t.entries.map(e=>e.id)).size!==t.entries.length)return false;
 let last=t.origin;return t.entries.every((e,i)=>{if(!n(e.stage,last,8)||!['win','steady','setback'].includes(e.outcome)||!['balanced',...D.statKeys].includes(e.strong)||e.weak!==null&&!D.statKeys.includes(e.weak)||typeof e.read!=='boolean')return false;last=e.stage;
 if(i===0)return e.stage===t.origin&&typeof e.late==='boolean';
 if(e.kind==='season'){const z=e.result;return B.stages.includes(e.stage)&&e.id==='season:'+e.stage&&!!z&&n(z.rank,1,20)&&['championship','consolation','eliminated'].includes(z.type)&&(z.type==='eliminated'?z.place===null:n(z.place,1,6))&&typeof z.champion==='boolean'&&(!z.champion||z.type==='championship'&&z.place===1)&&e.outcome===outcome({champion:z.champion,finalType:z.type,finalPlace:z.place});}
 return ['gate','early'].includes(e.kind)&&e.id===e.kind&&i===t.entries.length-1&&t.closed&&(e.kind!=='gate'||e.stage>=7);});}
const API={B,build,ensure,outcome,capture,close,mark,scene,valid,copy};root.KM_CAMPAIGN=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
