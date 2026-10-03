
/* v101: generated raster portraits. No procedural facial geometry. */
(function(root){'use strict';
const A=root.KM_PORTRAIT_ASSETS||(typeof require==='function'?require('./portrait-assets.js'):{});
const names=['akari','mio','nagi','kanade','tsumugi','hayase','tsukino','kuzumi','akamine','iwase','kurose','shirakami','kagura','raiden','onizuka','teiou','mizuki'];
const fixed=Object.fromEntries(names.map(id=>[id,{id,src:A[id]}])),pool=Array.from({length:12},(_,i)=>'rival_'+String(i+1).padStart(2,'0'));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function definition(person){if(typeof person==='string')person={id:person};const id=String(person.id||person.name||'racer').replace(/^cast_/,''),key=fixed[id]?id:pool.includes(person.portraitKey)?person.portraitKey:pool[hash(id)%pool.length];return {id,key,src:A[key],fixed:!!fixed[id]};}
function assign(person,used=[]){if(!person)return;const d=definition(person);if(d.fixed)return d.key;if(pool.includes(person.portraitKey))return person.portraitKey;const free=pool.filter(k=>!used.includes(k));const options=free.length?free:pool;person.portraitKey=options[hash(person.id)%options.length];return person.portraitKey;}
function render(person,large=false,emotion=null){if(!person)return '';if(typeof person==='string')person={id:person,name:person};const d=definition(person),cast=person.role==='cast'||!!person.castId;const X=root.KM_PORTRAIT_EXPRESSIONS||(typeof require==='function'?require('./portrait-expressions.js'):{});if(emotion&&X[d.key]){const phase=({calm:0,thoughtful:1,warm:2})[emotion]??0;return '<div role="img" class="portrait-face expression-portrait '+(cast?'cast-face':'bond-face')+(large?' large':'')+'" aria-label="'+esc(person.name||d.id)+'の表情" data-face="'+esc(d.id)+'" data-portrait="'+d.key+'" data-emotion="'+emotion+'" style="background-image:url('+X[d.key]+');background-position:'+(phase*50)+'% 50%"></div>';}return '<img class="portrait-face '+(cast?'cast-face':'bond-face')+(large?' large':'')+'" src="'+esc(d.src||A.rival_01)+'" width="512" height="512" alt="'+esc(person.name||d.id)+'の肖像" data-face="'+esc(d.id)+'" data-portrait="'+d.key+'" loading="lazy" decoding="async" draggable="false">';}
const API={fixed,pool,definition,render,assign,hash};root.KM_PORTRAITS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

