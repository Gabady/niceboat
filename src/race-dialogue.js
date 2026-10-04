

/* V107: presentation only. No random draws or changes to physics/results. */
(function(root){'use strict';
const R=root.KM_RACING||(typeof require==='function'?require('./racing.js'):null),P=root.KM_PORTRAITS||(typeof require==='function'?require('./portraits.js'):null);
// pass / passed / struggling / leading / own skill / player skill. Each has two authored variants.
const lines={
 hayase:['その一線は 俺がもらう|迷いが艇首に出ているぞ','いい直線だ 続けてみろ|抜いた先を見ているか','まだ舵を戻せる|一本の伸びに賭ける','この線は譲らない|出口まで気を抜くな','伸びる場所は ここだ|水を真っすぐ切る','磨いてきた足だな|見せてもらおう その伸びを'],
 tsukino:['出口は先に取った|小さな弧が差になる','いい出口を見つけたね|次の弧で取り返す','入口から描き直す|最後の出口を待つ','水面を見失わないで|この弧を崩さない','艇を起こして ここで回す|出口へつながる一瞬','その旋回 覚えたね|技の後の水面も見て'],
 kuzumi:['一瞬は待ってくれない|迷う間に先へ行く','今の判断は速かった|焦らず 次の一瞬へ','呼吸から戻す|まだ一拍 残っている','自分の刻みを守る|追われても呼吸は同じ','今だ 針より先に読む|合わせるのは自分の呼吸','その間合い 覚えておく|踏み込む時を選べたな'],
 akamine:['出口の一伸びだ|立ち上がりで前へ出る','いい加速だった|次の出口で並ぶぞ','水をつかみ直す|止まらなければ 次がある','足を使い切るぞ|まだ立ち上がれる','ここから前へ出す|水をつかんだ 今だ','その出足なら届くぞ|負けていられないな'],
 iwase:['波に押されず 前へ出る|体ごと この線を守る','いい踏ん張りだ|流されず 追い直す','崩れても終わりじゃない|艇の声を聞き直す','この荒れ方なら読める|最後まで姿勢を残す','波の向こうへ踏み込む|ここは体で支える','力みすぎるなよ|その技を支えるのは体だ'],
 kurose:['水平線はまだ遠い|今の伸びでは届かない','今は前を譲ろう|その背中を覚えた','三周目まで切らすな|まだ伸びる余地がある','ここから差を開く|最後の直線まで続くぞ','艇速は ここからだ|後半こそ俺の水面だ','速さを隠していたか|なら こちらも上げる'],
 shirakami:['その出口は私の線|外を回り過ぎだ','その弧は見事だった|次のマークで測り直す','一つのターンで戻す|まだ出口は残っている','この半径から逃がさない|最後の弧を描こう','全速で線を折る|この水面を切り返す','面白い角度だ|私の知らない線を見せて'],
 kagura:['始まる前に読んでいた|一瞬遅かったね','今の踏み込みはいい|取り返す時を測ろう','反動も計算のうち|前へ出た理由を残す','先手は渡さない|最初の一瞬を守り抜く','十二秒の外から行く|今だけは誰より早く','その瞬間を待っていたか|読み比べをしよう'],
 onizuka:['俺の波を越えてこい|並んだなら押し返す','その波を抜けたか|次は簡単に通さない','足場はまだある|流されるのはここまでだ','追ってくるなら正面からだ|この線を支え切る','波ごと前へ押し出す|体で受けて立つ','踏ん張る力があるな|なら もう一段競ろう'],
 teiou:['その先に まだ俺がいる|挑戦はここからだ','いいぞ そのまま逃げ切れ|追う側にさせたな','王座に近道はない|最後の一線まで答える','頂点は譲られる場所じゃない|ここまで来たなら追ってこい','積み重ねたものを出し切る|これが俺の最後の一手だ','そこまで育ててきたか|なら こちらも応えよう'],
 haruto:['速さで答えたぞ|今日も追わせてもらう','お前はそう来るよな|次の直線で並ぶ','ここで終われないだろ|見てろ 最後まで追う','お前が追ってくるから走れる|最後まで手は抜かない','この足を作ってきたんだ|昨日の俺とは違う','それを待ってた|見せてくれ その先も'],
 ren:['この出口なら届く|一つ違う線を見つけた','その曲がり方 覚えた|次は別の出口を試す','まだ描いていない弧がある|お前の後ろだけは嫌だ','この線は自分で見つけた|追うなら 違う出口で来い','ここで曲がり切る|何度も試した線だ','その線が答えなんだね|なら僕の答えも見せる'],
 izumi:['今の間を取った|一拍先に出るよ','その一瞬 負けた|焦らず 次を取る','まだ時計は止まってない|最後の一拍まで読む','先手は守ってみせる|追われる練習もしてきた','この間を待っていた|合わせるなら今だ','いい踏み込みだった|その読みを越えてみせる'],
 sou:['もう一度 前へ出る|出口から勝負しよう','そこから伸びるのか|また追う番だな','置いていかれるのは慣れた|追い直す足は残ってる','まだ加速できる|今度は追われる側だ','ここで立ち上がる|沈んだ分だけ 前へ出る','お前も変えてきたな|次の出口が楽しみだ'],
 ibuki:['この波なら進める|怖くても 前を向く','今のは強かった|次の波で並ぶよ','流されても 戻せる|踏ん張る理由ならある','追いつかせないよ|最後まで自分の姿勢で','体ごと水をつかむ|この荒れ方は知っている','一緒に練習した足だ|こっちも負けてないよ'],
 mizuki:['今日は私が先に行く|隣にいるために 抜くよ','今の走り ずるいくらいいい|でも 譲る約束はしてない','負けた映像は消さない|まだ私の出口がある','遠慮はしないから|この一着は自分でつかむ','私が選んだ線で行く|ここまで練習してきたの','その技 岸でまた聞かせて|知ってても 簡単には抜かれない']
};
const keys=['pass','passed','struggling','leading','skill','playerSkill'];
function actor(b){if(b.isPlayer)return null;let id=b.castId||b.id.replace(/^main_/,'');return lines[id]?id:null;}
function create(d,r){const me=R.own(d);return {race:r.id,last:d.eventSequence-1,items:[],cooldown:{},counts:{},signs:Object.fromEntries(d.boats.map(b=>[b.id,Math.sign(b.progress-me.progress)])),late:{},nextAt:0,serial:0};}
function update(q,d,r,options={}){if(!q||q.race!==r.id)q=create(d,r);if(d.paused&&!options.stepped){q.items=[];q.last=d.eventSequence-1;return q;}q.items=q.items.filter(x=>x.until>d.elapsed);const me=R.own(d),candidates=[],add=(b,event,priority,skill=null)=>{const who=actor(b);if(who&&d.elapsed>=(q.cooldown[b.id]||0))candidates.push({b,who,event,priority,skill});};
 for(const b of d.boats){if(!actor(b)||b.dnf||b.capsized||b.finishTime!==null)continue;const delta=b.progress-me.progress,sgn=Math.abs(delta)>=2?Math.sign(delta):q.signs[b.id];if(R.raceTime(d)>3&&q.signs[b.id]&&sgn!==q.signs[b.id])add(b,sgn>0?'pass':'passed',6);q.signs[b.id]=sgn;
 if(b.progress>R.C.goal*.72){const p=R.place(d,b),key=b.id+':'+(p===1?'lead':'chase');if(!q.late[key]&&(p===1||p>=4)){q.late[key]=true;add(b,p===1?'leading':'struggling',2);}}
 }
 const events=d.events.filter(e=>e.index>q.last&&d.elapsed-e.t<3.5);q.last=d.eventSequence-1;
 for(const e of events){if(e.kind!=='ability')continue;const b=d.boats.find(b=>b.id===e.athleteId);if(!b)continue;if(b.isPlayer){for(const n of d.boats)if(n.finishTime===null&&!n.dnf&&!n.capsized&&Math.abs(n.progress-b.progress)<55)add(n,'playerSkill',3);}else if(Math.abs(b.progress-me.progress)<100||b.racePersona==='king'||b.racePersona==='rival_final')add(b,'skill',5,e.abilityId);}
 if(d.elapsed>=q.nextAt){const seen=new Set(q.items.map(x=>x.athleteId));for(const c of candidates.sort((a,b)=>b.priority-a.priority||a.b.frame-b.b.frame)){if(q.items.length>=2)break;if(seen.has(c.b.id))continue;seen.add(c.b.id);const k=c.who+':'+c.event,num=q.counts[k]||0;q.counts[k]=num+1;const text=lines[c.who][keys.indexOf(c.event)].split('|')[num%2];q.items.push({id:++q.serial,athleteId:c.b.id,person:{id:c.who,name:c.b.name,portraitKey:c.b.portraitKey},frame:c.b.frame,text,event:c.event,skill:c.skill,until:d.elapsed+3.2});q.cooldown[c.b.id]=d.elapsed+9;}if(q.items.length)q.nextAt=d.elapsed+2.5;}
 return q;
}
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function html(q){return (q?.items||[]).slice(0,2).map(x=>'<div class="race-voice voice-'+x.frame+'" data-speaker="'+esc(x.athleteId)+'">'+P.render(x.person)+'<div><small><i class="mini-boat boat-'+x.frame+'">'+x.frame+'</i>'+esc(x.person.name)+'</small><p>'+esc(x.text)+'</p></div></div>').join('');}
const API={lines,keys,actor,create,update,html};root.KM_RACE_DIALOGUE=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);


