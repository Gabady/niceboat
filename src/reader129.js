/* Read text is remembered across careers, never inferred just from opening a page. */
(function(root){'use strict';
function key(sc,pages){let a=2166136261,b=5381;const text=JSON.stringify([sc.title,sc.person?.id||'',pages]);for(let i=0;i<text.length;i++){a=Math.imul(a^text.charCodeAt(i),16777619)>>>0;b=(Math.imul(b,33)^text.charCodeAt(i))>>>0;}return a.toString(16)+':'+b.toString(16)+':'+text.length;}
function known(s,sc,pages){return (s.read129||[]).includes(key(sc,pages));}
function mark(s,sc,pages){const id=key(sc,pages),a=s.read129||(s.read129=[]);if(a.includes(id))return false;a.push(id);if(a.length>2000)a.shift();return true;}
function valid(a){return a===undefined||Array.isArray(a)&&a.length<=2000&&new Set(a).size===a.length&&a.every(x=>typeof x==='string'&&/^[0-9a-f]+:[0-9a-f]+:\d+$/.test(x));}
const Q={key,known,mark,valid};root.KM_READER129=Q;if(typeof module!=='undefined'&&module.exports)module.exports=Q;
})(globalThis);
