/* V109 shared reader: explicit speakers; each authored utterance is one tap. */
(function(root){'use strict';
const version='dialogue109';
function parse(raw){const text=String(raw||'').trim(),m=text.match(/^([^「」。！？\n]{1,24})「([\s\S]*)」$/u);return m?{speaker:m[1].trim(),text:m[2]}:{speaker:null,text};}
function split(text,limit){const chars=Array.from(text),out=[];while(chars.length>limit){let cut=limit;for(let i=limit-1;i>=Math.floor(limit*.5);i--)if(/[。！？、]/u.test(chars[i])){cut=i+1;break;}out.push(chars.splice(0,cut).join(''));}if(chars.length)out.push(chars.join(''));return out;}
function pages(body){const out=[];for(const raw of (Array.isArray(body)?body:[body]))for(const line of String(raw||'').split(/\r?\n/)){const p=parse(line);if(!p.text)continue;const prefix=p.speaker?p.speaker+'「':'';for(const part of split(p.text,Math.max(60,105-Array.from(prefix).length-(p.speaker?1:0))))out.push(p.speaker?prefix+part+'」':part);}return out.length?out:['……'];}
function describe(page,context={}){const p=parse(page),norm=s=>String(s||'').replace(/[\s・]/g,''),people=context.people||[];let speaker=p.speaker,person=null,kind='narration';if(speaker==='主人公'){speaker=context.playerName||'主人公';kind='player';}
 else if(speaker){if(speaker==='主ライバル'||speaker==='{{rival}}'){person=context.rival||null;speaker=person?.name||'あの選手';}else if(speaker==='相手'){person=context.person||null;speaker=person?.name||speaker;}else person=people.find(x=>norm(x.name)===norm(speaker))||people.find(x=>norm(x.name).includes(norm(speaker)))||null;kind='person';if(person)speaker=person.name;}
 else if(p.text.startsWith('「')&&context.person){speaker=context.person.name;person=context.person;kind='person';}
 return {speaker:speaker||'語り',text:prose(p.text,context),person,kind};}
// Display compatibility for older journal text. Never rewrite saved rewards or numeric panels.
function prose(text,context={}){return String(text||'').replace(/\{\{rival\}\}|主ライバル/g,context.rival?.name||'あの選手')
 .replace(/(?:ステータス|能力(?:値)?)(?:が|は|[:：])?\s*(?:オール|全て|すべて)?\s*[SＳ]{1,2}(?:ランク)?(?:\s*\d{2,3})?/g,'一流の実力')
 .replace(/(?:オール|全て|すべて|全)[SＳ](?:ランク)?/g,'どの走りにも隙がない')
 .replace(/(直線|旋回|スタート|加速|フィジカル)\s*[SＳ]{1,2}(?:ランク)?(?:\s*\d{2,3})?/g,(_m,k)=>({直線:'抜群の伸び足',旋回:'鋭い旋回',スタート:'冴えたスタート',加速:'力強い加速',フィジカル:'強靭な体幹'})[k])
 .replace(/[SＳ]ランク|ランク[SＳ]/g,'一流').replace(/カンスト/g,'極めた域');}
function cursor(book,key,length){return Math.max(0,Math.min(length-1,Math.max(0,Number.isInteger(book[key])?book[key]:0)));}
function move(book,key,delta,length){book[key]=Math.max(0,Math.min(length-1,(Number.isInteger(book[key])?book[key]:0)+delta));return book[key];}
function remember(book,key,index){if(!Object.prototype.hasOwnProperty.call(book,key)&&Object.keys(book).length>=290)delete book[Object.keys(book)[0]];book[key]=index;}
function bookmark(key){return version+':'+key;}
const API={pages,parse,describe,prose,cursor,move,remember,bookmark,version};root.KM_DIALOGUE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);
