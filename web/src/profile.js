
/* v98: cosmetic racer identities. IDs and competitive values never change here. */
(function(root){
'use strict';
const colors={lagoon:'#81e0d0',sunset:'#ffa584',gold:'#f2cb7e',sky:'#8fc4ff',lilac:'#c4aeff',rose:'#f4a9c3'};
const emblems={wave:'航跡',wing:'翼',star:'星',helm:'舵'};
const defaults={region:'',motto:'',color:'lagoon',emblem:'wave',favorite:false};
const clean=(s,n)=>String(s??'').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'').trim().slice(0,n);
function get(p){return {...defaults,...p?.profile};}
function valid(p){return p===undefined||!!p&&typeof p==='object'&&!Array.isArray(p)&&typeof p.region==='string'&&p.region.length<=16&&typeof p.motto==='string'&&p.motto.length<=32&&Object.prototype.hasOwnProperty.call(colors,p.color)&&Object.prototype.hasOwnProperty.call(emblems,p.emblem)&&typeof p.favorite==='boolean';}
function find(s,id){return s.career?.player.id===id?s.career.player:s.registry.find(p=>p.id===id);}
function edit(s,id,patch){
 const p=find(s,id);if(!p)return {error:'編集できる選手が見つかりません。'};
 if(s.career?.player===p&&s.career.status==='race'||s.quick&&!s.quick.race.done&&s.quick.race.runners.some(n=>n.id===id))return {error:'出走中は編集できません。レースを終えてから変更してください。'};
 const name=clean(patch.name,16);if(!name)return {error:'選手名を入力してください。'};
 const profile={region:clean(patch.region,16),motto:clean(patch.motto,32),color:patch.color,emblem:patch.emblem,favorite:get(p).favorite};
 if(!valid(profile))return {error:'設定内容を確認してください。'};
 p.name=name;p.profile=profile;
 const r=s.career?.player===p?s.career.series?.race:null;
 if(r&&!r.drive&&!r.done){const n=r.runners.find(n=>n.isPlayer);if(n){n.name=name;n.profile={...profile};}}
 return {player:p};
}
function favorite(s,id){const p=s.registry.find(n=>n.id===id);if(!p)return false;p.profile=get(p);p.profile.favorite=!p.profile.favorite;return p.profile.favorite;}
function list(people,term='',sort='recent',onlyFavorites=false){
 const q=clean(term,60).toLocaleLowerCase('ja');
 return people.filter(p=>(!onlyFavorites||get(p).favorite)&&(!q||(p.name+' '+get(p).region+' '+get(p).motto).toLocaleLowerCase('ja').includes(q))).slice().sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ja'):sort==='fame'?b.popularity-a.popularity:sort==='wins'?(b.record?.wins||0)-(a.record?.wins||0):Number(get(b).favorite)-Number(get(a).favorite)||(b.recordedAt||0)-(a.recordedAt||0));
}
const API={colors,emblems,defaults,clean,get,valid,find,edit,favorite,list};root.KM_PROFILE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

