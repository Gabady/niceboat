/* Optional relationship scenes: one answer per person per series, with a real training cost. */
(function(root){'use strict';
const A=root.KM_AFFINITY||(typeof require==='function'?require('./affinity.js'):null);
const scenes=[
 ['名前を覚えるまで','片づけの終わったピットで、相手が練習ノートを閉じかけていた。','今日は何が難しかった？　時間があるなら、一緒に映像を見たい。','自分の失敗も見せて振り返る'],
 ['負けた日の帰り道','負けたレースの映像を、相手は何度も最初へ戻している。','励ましだけで済ませたくない。自分ならどうしたか、聞いてもらえる？','残って一緒に敗因を探す'],
 ['黙っていた課題','相手のノートには、何度も消した線が残っていた。','得意なところだけ見せていた。苦手も含めて、今日は話したい。','自分の課題を打ち明ける'],
 ['一人分では足りない映像','二台の端末に、同じターンが別の角度から映っている。','こっちからは見えなかった。もう一度、同じところを比べよう。','練習時間を映像の比較に使う'],
 ['言いにくい指摘','話しかけようとして、相手の言葉が途中で止まった。','聞きたい。都合のいいことだけじゃ、次も同じ失敗をする。','指摘を聞いて一緒に試す'],
 ['雨のあとの約束','雨の止んだ岸辺で、二人分の道具を干した。','結果を出せるかは分からない。でも、教わったことは試して報告する。','試走と振り返りの時間をつくる'],
 ['忙しい日の選び方','それぞれの出走準備が重なり、話す時間はほとんどなかった。','今日は自主練習を少し減らす。今、話しておきたいことがある。','自主練習を交流の時間に替える'],
 ['次も同じ岸で','次のシリーズの予定を確かめると、相手が顔を上げた。','ここで聞いたことを、次へ持っていく。また走りを見てほしい。','積み重ねた課題を一緒に見直す'],
 ['最後の準備','最優秀シリーズの出走表の脇に、使い込んだノートが置かれた。','今日だけのためじゃない。ここまで積み重ねたことを、最後に確かめたい。','最後の合同確認に時間を使う']
];
function identity(c,kind,api){return kind==='rival'?api.Development.rival(c):kind==='mentor'&&api.Cast.introduced(c)?api.Cast.map[c.cast.mentor.id]:null;}
function stamp(c,kind,api){const p=identity(c,kind,api);return p?kind+':'+p.id+':'+c.stage:null;}
function available(c,kind,api){const id=c&&stamp(c,kind,api);return !!id&&!c.ending&&['action','preRace'].includes(c.status)&&!(c.series.race.drive&&!c.series.race.done)&&!(c.social129||[]).some(q=>q.id===id);}
function scene(c,kind,api){if(!available(c,kind,api))return null;const p=identity(c,kind,api),x=scenes[c.stage],left=c.series.action.normal+c.series.action.training;return {key:'social129:'+stamp(c,kind,api),title:x[0],person:p,background:'workshop',body:[x[1],p.name+'「少し話せるか。次の練習で確かめたいことがある」','主人公「'+x[2]+'」',p.name+'「無理に時間を作らなくてもいい。でも、一緒にやってくれるなら助かる」'],choices:[{label:x[3],note:'練習1回を使う · 好感度＋6（追加枠なら＋3）',disabled:left<=0},{label:'話を聞き、今日は自分の練習へ戻る',note:'行動消費なし · 好感度＋1'},{label:'今回は準備に集中すると伝える',note:'行動消費なし · 好感度は変わらない'}]};}
function choose(c,kind,id,index,api){if(!available(c,kind,api)||id!==stamp(c,kind,api)||![0,1,2].includes(index))return null;const p=identity(c,kind,api);let gain=index===1?1:0;if(index===0){if(!api.consumeAction(c,'training'))return null;gain=Math.round(6*c.series.action.effectScale);}const change=A.change(c,kind,kind==='mentor'?p.id:null,gain,index===0?'時間を使って交流':'交流での返事');(c.social129||(c.social129=[])).push({id,kind,stage:c.stage,choice:index,delta:change.delta});return {title:scenes[c.stage][0],note:p.name+'「'+(index===0?'付き合ってくれてありがとう。自分には見えなかったところが分かった。':index===1?'聞いてくれてありがとう。続きは、また時間があるときに。':'分かった。互いに準備して、次の一走で。')+'」',rewards:['好感度＋'+change.delta+(index===0?' · 練習1回を使用':'')],person:p};}
function valid(xs){return xs===undefined||Array.isArray(xs)&&xs.length<=18&&new Set(xs.map(x=>x.id)).size===xs.length&&xs.every(x=>x&&typeof x.id==='string'&&x.id.length<=140&&['mentor','rival'].includes(x.kind)&&Number.isInteger(x.stage)&&x.stage>=0&&x.stage<=8&&[0,1,2].includes(x.choice)&&Number.isInteger(x.delta)&&x.delta>=0&&x.delta<=6);}
const Q={available,identity,stamp,scene,choose,valid};root.KM_SOCIAL129=Q;if(typeof module!=='undefined'&&module.exports)module.exports=Q;
})(globalThis);
