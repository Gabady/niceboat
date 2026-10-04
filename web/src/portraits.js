


/* v101: generated raster portraits. No procedural facial geometry. */
(function(root){'use strict';
const A=root.KM_PORTRAIT_ASSETS||(typeof require==='function'?require('./portrait-assets.js'):{});
const names=['akari','mio','nagi','kanade','tsumugi','hayase','tsukino','kuzumi','akamine','iwase','kurose','shirakami','kagura','raiden','onizuka','teiou','mizuki','shinohara','natsu','riku'];
const fixed=Object.fromEntries(names.map(id=>[id,{id,src:A[id]}])),pool=Array.from({length:12},(_,i)=>'rival_'+String(i+1).padStart(2,'0'));
// One identity table for dialogue, journals, roster cards and final-race snapshots.
const identities={haruto:'rival_01',ren:'rival_04',izumi:'rival_07',sou:'rival_10',ibuki:'rival_09',campaign_father:'rival_08',campaign_kanato:'rival_06',campaign_sae:'rival_12',campaign_soma:'rival_03',asakura:'rival_02',nanase:'rival_05',hiiragi:'rival_11'};
const aliases={mentor:'asakura',mechanic:'shinohara',manager:'nanase',fan:'natsu',なつ:'natsu',ナツ:'natsu',press:'hiiragi',campaign_riku:'riku'};
const supporting={mentor:{id:'asakura',name:'先輩 朝倉',aliases:['朝倉']},mechanic:{id:'shinohara',name:'整備士 篠原',aliases:['篠原']},manager:{id:'nanase',name:'担当 七瀬',aliases:['七瀬']},fan:{id:'natsu',name:'なつ',aliases:['ナツ']},press:{id:'hiiragi',name:'柊'}};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function definition(person){if(typeof person==='string')person={id:person};let id=String(person.id||person.name||'racer').replace(/^cast_/, '').replace(/^main_/, '');id=aliases[id]||id;const owned=fixed[id]?id:identities[id],key=owned||((fixed[person.portraitKey]||pool.includes(person.portraitKey))?person.portraitKey:pool.includes(id)?id:pool[hash(id)%pool.length]);return {id,key,src:A[key],fixed:!!owned};}
function assign(person,used=[]){if(!person)return;const d=definition(person);if(d.fixed)return d.key;if(pool.includes(person.portraitKey))return person.portraitKey;const free=pool.filter(k=>!used.includes(k));const options=free.length?free:pool;person.portraitKey=options[hash(person.id)%options.length];return person.portraitKey;}
const emotionLabels={calm:'穏やか',warm:'笑顔',thoughtful:'思案',determined:'真剣',surprised:'驚き',blush:'照れ'};
// Older three-panel sheets keep their authored order. New sheets declare their
// own rows, columns and states rather than inheriting the old CSS geometry.
function expressionLayout(key){const declared=root.KM_PORTRAIT_EXPRESSION_LAYOUTS?.[key];if(declared&&Number.isInteger(declared.columns)&&declared.columns>0&&declared.columns<=6&&Number.isInteger(declared.rows)&&declared.rows>0&&declared.rows<=6&&Array.isArray(declared.states)&&declared.states.length<=declared.columns*declared.rows&&declared.states.includes('calm'))return declared;return {columns:3,rows:1,states:['calm','thoughtful','warm']};}
function expressionFrame(key,emotion){const layout=expressionLayout(key),fallback={determined:'thoughtful',surprised:'calm',blush:'warm'},resolved=layout.states.includes(emotion)?emotion:layout.states.includes(fallback[emotion])?fallback[emotion]:'calm',index=layout.states.indexOf(resolved),column=index%layout.columns,row=Math.floor(index/layout.columns);return {emotion:resolved,columns:layout.columns,rows:layout.rows,x:layout.columns>1?column/(layout.columns-1)*100:0,y:layout.rows>1?row/(layout.rows-1)*100:0};}
function render(person,large=false,emotion=null){if(!person)return '';if(typeof person==='string')person={id:person,name:person};const d=definition(person),cast=person.role==='cast'||!!person.castId;const X=root.KM_PORTRAIT_EXPRESSIONS||(typeof require==='function'?require('./portrait-expressions.js'):{});if(emotion&&X[d.key]){const frame=expressionFrame(d.key,emotion);return '<div role="img" class="portrait-face expression-portrait '+(cast?'cast-face':'bond-face')+(large?' large':'')+'" aria-label="'+esc(person.name||d.id)+'の表情：'+esc(emotionLabels[frame.emotion]||'穏やか')+'" data-face="'+esc(d.id)+'" data-portrait="'+esc(d.key)+'" data-emotion="'+esc(frame.emotion)+'" style="background-image:url('+esc(X[d.key])+');background-size:'+(frame.columns*100)+'% '+(frame.rows*100)+'%;background-position:'+frame.x+'% '+frame.y+'%"></div>';}return '<img class="portrait-face '+(cast?'cast-face':'bond-face')+(large?' large':'')+'" src="'+esc(d.src||A.rival_01)+'" width="512" height="512" alt="'+esc(person.name||d.id)+'の肖像" data-face="'+esc(d.id)+'" data-portrait="'+esc(d.key)+'" loading="lazy" decoding="async" draggable="false">';}
const API={fixed,pool,identities,aliases,supporting,definition,render,assign,hash,expressionLayout,expressionFrame};root.KM_PORTRAITS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

