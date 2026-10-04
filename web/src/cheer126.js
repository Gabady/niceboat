
/* V126: a partner's words before the SG final. Presentation only; no rewards or RNG. */
(function(root){
'use strict';
const Bonds=root.KM_BONDS||(typeof require==='function'?require('./bonds.js'):null);
const Portraits=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const voices={
 akari:{emotion:'warm',line:'帰ったら、今日の走りを聞かせてください。一着って書けるように、私も最後まで応援しています。'},
 mio:{emotion:'determined',line:'今日は手帳を出しません。勝った話を聞きたいです。一着、取りにいってください。'},
 nagi:{emotion:'warm',line:'一度、ゆっくり息を吐きましょう。ここまで来た走りを、信じています。帰ってからの話も、聞かせてくださいね。'},
 kanade:{emotion:'warm',line:'最初の音の後にも、続きがあります。いいスタートも、その先の走りも、最後まで見ていますから。'},
 tsumugi:{emotion:'determined',line:'私もここで見たくて、来たんです。一着を取りにいってください。帰ったら、まず私の感想も聞いてくださいね。'},
 mizuki:{emotion:'determined',line:'今日は私も、一着を取りに行く。あなたも、自分の走りを最後まで。水面では、遠慮しないからね。',offGrid:'あなたの勝ちたい気持ち、同じ選手だからわかるよ。最後の出口まで、自分で選んで走ってきて。'},
 natsu:{emotion:'warm',line:'いつもの「行ってらっしゃい」だけど、今日は少し特別。あなたが帰ってくるまで、ちゃんと見てるから。'}
};
function map(){return (root.KM_BONDS||Bonds)?.B?.map||{};}
function ready(c,r){
 if(!c||!r||c.stage!==8||r!==c.series?.race||r.type!=='championship'||r.grade&&r.grade!=='sg'||r.done||r.drive&&(r.drive.elapsed>0||r.drive.started||r.drive.finished))return null;
 const t=c.bonds,id=t?.completed,h=map()[id],q=t?.heroines?.[id];
 return h&&voices[id]&&t.partner===id&&q?.step===7&&q.dated&&!q.failed?h:null;
}
function prepare(c,r){
 if(r?.cheer126)return valid(r.cheer126,r)?r.cheer126:null;
 const h=ready(c,r);if(!h)return null;
 return r.cheer126={version:1,raceId:r.id,heroine:h.id,state:'pending'};
}
function valid(value,r){
 if(value===undefined||value===null)return true;
 return !!(value&&value.version===1&&typeof value.raceId==='string'&&value.raceId.length<=110&&value.raceId===r?.id&&r.type==='championship'&&(!r.grade||r.grade==='sg')&&map()[value.heroine]&&voices[value.heroine]&&['pending','shown'].includes(value.state));
}
function take(r,settings={}){
 const q=r?.cheer126,d=r?.drive;if(!q||!valid(q,r)||q.state!=='pending'||r.done||!d||d.finished||d.started||d.elapsed>0||!d.paused||r.drill)return null;
 const person=map()[q.heroine],voice=voices[q.heroine],onGrid=(r.runners||[]).some(p=>p.id===q.heroine||p.castId===q.heroine);
 q.state='shown';
 const mode=settings.presentation==='off'?'plain':settings.presentation==='short'||settings.motion===false?'short':'full';
 return {heroine:q.heroine,person,emotion:voice.emotion,line:q.heroine==='mizuki'&&!onGrid?voice.offGrid:voice.line,place:q.heroine==='mizuki'&&onGrid?'それぞれの艇へ向かう前に':'出走前に届いた声',mode};
}
function markup(info){
 if(!info)return '';
 const mode=['full','short','plain'].includes(info.mode)?info.mode:'short';
 return '<article class="final-cheer126 '+mode+'" aria-label="'+esc(info.person.name)+'の応援">'+(mode==='plain'?'':Portraits.render(info.person,false,info.emotion))+'<div><small>'+esc(info.place)+'</small><b>'+esc(info.person.name)+'</b><p>「'+esc(info.line)+'」</p></div></article>';
}
const API={voices,ready,prepare,valid,take,markup};root.KM_CHEER126=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

