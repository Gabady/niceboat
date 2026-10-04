/* V126: a partner's words before the SG final. Presentation only; no rewards or RNG. */
(function(root){
'use strict';
const Bonds=root.KM_BONDS||(typeof require==='function'?require('./bonds.js'):null);
const Portraits=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const voices={
 akari:{emotion:'warm',line:'心配なんか……しますよ、好きなんですから。行ってきてください。帰ったら、一番に私のところへ。'},
 mio:{emotion:'determined',line:'今は記者じゃなく、あなたの恋人です。一着、取りにいって。格好いい顔、今日は私に独占させてね。'},
 nagi:{emotion:'warm',line:'大丈夫、あなたの走りを信じてる。帰ってきたら、ぎゅっとさせてね。今日は私の方が、待ちきれないの。'},
 kanade:{emotion:'warm',line:'大好きです。……今、言いたかったんです。どんな歓声の中でも、私があなたを見ていること、覚えていてください。'},
 tsumugi:{emotion:'determined',line:'今はみんなの前で、一番格好よく走ってきて。でも、帰ってきたあなたを最初に抱きしめるのは、私がいいな。'},
 mizuki:{emotion:'determined',line:'好きだからって、一着は譲らないよ。水面では全力で勝負。終わったら、どっちが先でも恋人に戻ろうね。',offGrid:'私の好きな人は、最後まで勝ちにいく人。思いきり走っておいで。帰ってきたら、照れるくらい抱きしめてあげる。'},
 natsu:{emotion:'warm',line:'行ってらっしゃい、大好き！　今だけ応援団に戻るね。終わったら恋人の番だから、いっぱい甘えさせてよ。'}
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
