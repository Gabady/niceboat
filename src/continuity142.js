/* V142: chronological connections and saved, reward-free relationship moments. */
(function(root){'use strict';
const Memory146=root.KM_MEMORY146||(typeof require==='function'?require('./memory146.js'):null);
const Data=root.KM_CONTINUITY_DATA142||(typeof require==='function'?require('./continuity-data142.js'):null);
const N=root.KM_NARRATIVE132||(typeof require==='function'?require('./narrative132.js'):null);
const S=root.KM_SCENE131||(typeof require==='function'?require('./scene131.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x));
const phases=['出会い','再会','日常','境界','挑戦','支え合い','自覚','告白','交際後','優勝戦'];
// A third response can express a different need without being a caricatured
// wrong answer. Existing confession/parting choices keep their meaning.
const alternatives={
 akari:{3:['今日はここで聞く。手伝える範囲は、灯さんから教えて','灯「じゃあ、今は感想だけ。頼みたいことができたら、こっちから言います」'],5:['少し外へ出ようか。戻る時刻は灯さんが決めて','灯「離れると余計に気になるかも。……でも、一度お茶を飲みたいです」'],6:['帰る日は忙しいだろうし、会える時刻を教えて','灯「荷ほどきは後でできます。夕方、少しだけ顔を見たいです」'],8:['歩く前に、約束を忘れて寂しかったことだけ聞いて','灯「はい。それを聞かずに、仲直りしたことにはしたくないです」']},
 mio:{3:['ここからは、取材の返事として話し直してもいい？','澪「はい。私も、聞いたつもりの所を確かめ直します」'],5:['会いたい。ただ、担当が替わった理由も自分の言葉で聞きたい','澪「分かりました。うまい説明になるかは分かりませんが、話します」'],6:['待ってる。その後、自分の話も聞いてほしい','澪「はい。聞くだけで帰ってもらうつもりも、なかったので」'],8:['少しだけ話そう。眠くなったら、お互いに言おう','澪「分かりました。途中で黙ったら、寝てるかどうかだけ確かめてください」']},
 nagi:{3:['休んだ理由を、少し整理してから話してもいい？','凪「待ちます。話す気がないのかだけ、分からなかったから」'],5:['今は隣にいる。話すかどうかは、あとで決めよう','凪「はい。何を話すか考えなくていいなら、もう少しこうしていたいです」'],6:['今日は袋を持ち替えよう。もう少し手をつないでいたい','凪「じゃあ軽い方をください。……手を空ける方が先なんですね」'],8:['出かけるのは別の日にしよう。今日は自分も休みたい','凪「そう言ってもらえると、私も気を張らずに済みます」']},
 kanade:{3:['次に誰かへ話す前に、奏さんに確かめる','奏「お願いします。言っていい話まで、全部なくしたいわけではないので」'],5:['今日は自分の近況も聞いてほしい','奏「はい。何を聞こうか、実は考えてきました」'],6:['待つ間に、自分も言葉を考えてくる','奏「私の言葉だけ待つんじゃないんですね。……それなら、次に」'],8:['楽しかった所も、戸惑った所も、言葉で話したい','奏「両方、聞きたいです。表情だけで当てるのは、今日はもうやめます」']},
 tsumugi:{3:['いつもの席じゃなくても、会いに来たい','紬「そう言ってもらえると、椅子を空けた自分が少し恥ずかしいです」'],5:['今日は答えを出さずに聞いてもいい？','紬「その方が助かるかも。何が嫌だったのか、私もまだ途中なので」'],6:['一緒に店を見られてうれしかった。次は二人の予定を決めたい','紬「はい。鍵を返したら、その相談をしてもいいですか」'],8:['残念だったことも聞きたい。パフェの話の前でも','紬「じゃあ、両方。楽しかったからって、寂しくなかったわけではないので」']},
 mizuki:{3:['もう少し話そう。今日は自分の方が帰りたくない','瑞希「言うんだ、そういうこと。じゃあ、次の角まで遠回りしよう」'],5:['指摘を聞く時間と、試す時間を分けようか','瑞希「いいね。言われてすぐ全部直そうとすると、どれも雑になるし」'],6:['待ってる。その後で、自分からも伝えたい','瑞希「うん。順番はそれで。次に会う日、ちゃんと空けておいて」'],8:['今日は喜ぶ話と悔しい話、交互にしてみよう','瑞希「途中で混ざるかもね。それでも、隠されるよりは聞きたい」']},
 natsu:{3:['今日は、何も役に立つ話をしない日にしよう','なつ「それならできる。……何を話すか、少し迷うけど」'],5:['周りに話す前に、自分の気持ちを確かめたい','なつ「うん。私も、写真の説明だけで済ませたくない」'],6:['次は、自分から会う場所を考えてもいい？','なつ「いいよ。案内するのを任せたら、どんな道になるか楽しみ」'],8:['残念だけど、予定は変えなくていい。終わったら話そう','なつ「分かった。残念って言ってくれたのも、ちゃんと聞いたよ」']}
};
const laterMemories={
 light:{4:['子供の頃、父の手元を見ようとつま先立ちした。急に振り向かれて、工具を落としたふりでしゃがんだことがある。','主人公（心の声）「今は目の高さが近い。それでも、聞く前に分かった顔をしたくなるんだな」'],7:['昔、父と話が合わなかった夜は、工房の音を数えて眠った。静かになると、謝る機会も終わった気がした。','主人公（心の声）「機械が止まるのを待つんじゃなくて、自分で声をかけよう」']},
 back:{4:['以前は、奏斗の計算が違うと思っても、紙へ丸をつけるだけだった。自分の言葉で違うと言う方が、ずっと難しかった。','主人公（心の声）「今日も合わない所はある。そこを隠すための資料にはしたくない」'],7:['最初に奏斗とノートを広げた時、空欄を見られるのが嫌だった。今のノートには、消さずに残した疑問が増えている。','主人公（心の声）「まだ分からない、と言っても、あいつは帰らない。それはもう知ってる」']},
 shore:{4:['食堂へ初めて長居した日、食べ終わった皿を下げる時刻ばかり気にしていた。迷惑だと言われる前に立ちたかった。','主人公（心の声）「今日は忙しいか、聞けばいい。勝手に気を回して帰るのもやめよう」'],7:['陸の前で失敗の話をする時、立派な教訓を足そうとしたことがあった。途中で、何が悔しかったのか分からない話になった。','主人公（心の声）「今日は、悔しかった所から話す。聞かれたことには、その後で答えよう」']},
 recovery:{4:['道具を使う前に、昔の手順を空中で繰り返した時期があった。覚えていることと、今できることの差を見たくなかった。','主人公（心の声）「変えた手順にも、自分で決めた理由がある。相馬には、そこから話そう」'],7:['復帰の前、予定を書き込めずに手帳を閉じた夜を思い出した。書けば必ずできるわけではない。そのことが怖かった。','主人公（心の声）「消した予定もある。でも、空けたままにはしなかった。その話を持って帰ろう」']}
};
const currentThoughts={
 light:{0:'工房の戸を開ける前に、鞄から今日の紙を出した。',2:'見せたい所にだけ印をつけたことに気づき、うまくいかなかった行にも一本線を引いた。',3:'話す順番を決めすぎると、父の返事を聞けなくなる。最初の一言だけ考えて、歩き出した。',5:'ノートに書いた結論を、今日は口に出して確かめたい。父が何と言うかは、まだ分からなかった。',6:'説明の途中で反対されても、最後まで話そうと思った。同時に、父の話も最後まで聞くつもりだった。',8:'報告の紙を畳まずに持った。いい所だけを表にして渡す必要は、もうなかった。'},
 back:{0:'奏斗へ渡す紙の端を揃えた。揃っていないのは、その中の自分の考えの方だった。',2:'数字の違う欄を消さずに残した。理由を聞かれたら、分からない所から一緒に見ようと思った。',3:'奏斗の予想と違った場面を一つ選んだ。外れたと責めたいのではなく、何が違ったか知りたかった。',5:'先に答えを送ろうとして、主人公は携帯をしまった。今回は迷った順番から話してみたい。',6:'二人で決めたことでも、実際に試した感触までは同じではない。その差を説明する言葉を探した。',8:'最後の数字を、奏斗に直してもらうつもりはなかった。そこへ至った自分の話を、聞いてもらいたかった。'},
 shore:{0:'店の前で立ち止まらず、主人公は暖簾へ手を伸ばした。',2:'今日の注文は決めてある。話す内容の方は、紗枝の顔を見てからでもよい気がした。',3:'話しかける前に、店の混み具合を確かめた。待つ間に、自分から聞きたい近況も思い出した。',5:'今日は聞いてもらうだけで帰りたくなかった。紗枝と陸の話も、少し聞く時間を空けてきた。',6:'笑って話せるように言い換えるのをやめた。声が詰まったら、水を飲んで続きを話せばよかった。',8:'帰り道の角で、主人公は迷わず店の方へ曲がった。どんな顔をして入るかは、まだ決められなかった。'},
 recovery:{0:'相馬に話す紙へ、今の体調も書き足した。走りの数字だけでは伝わらない一日だった。',2:'できたことだけを数えると、無理をした場所が抜け落ちる。主人公はその箇所にも印を残した。',3:'前と違う感触を、失ったものとして書きかけた。違う理由を確かめてから呼び方を決めたい。',5:'うまく説明できない疲れも、そのまま伝えるつもりだった。言葉が足りなければ、相馬に聞き返してもらおう。',6:'以前の自分なら、と考えた箇所を一つ書いた。そのあとに、今なら何をするかも書き足した。',8:'今季の最後のページを開いた。復帰しただけでよしとする気にも、昔より劣ると閉じる気にもなれなかった。'}
};
function choices(sc,id,i){const pair=alternatives[id]?.[i];if(!sc?.continuity142||!pair)return sc;return {...sc,choices:sc.choices.map(ch=>ch.code===2?{...ch,label:pair[0],reply:pair[1],emotion:'thoughtful',trust:7,affection:6}:ch)};}
function heroine(sc,c,id,i){
 const d=Data[id];if(!sc||!d)return sc;
 const q=c.bonds?.heroines[id],C=root.KM_CHOICES133||(typeof require==='function'?require('./choices133.js'):null);
 let pre=(N.heroines[id]?.[String(i+1)]||[]).slice();
 if(i===1){const code=q?.choices?.[0];pre=['@前に話してから|'+d.place,...(d.first[code]||['前に顔を合わせた相手へ、もう一度声をかけた。話せる時刻を聞き、改めて会う日を決めた。']),...d.firstTail,'@次に会う約束の日|'+d.place];}
 // Selected consequences happen before the new episode; do not run the old
 // generic contact setup again after them. The new scene gets its own bridge.
 const memory=q?.memories133?.find(x=>x.chapter===i-1),consequence=memory&&C.beats[id]?.[memory.chapter]?.options[memory.option]?.[2];
 if(consequence){
  if(id==='nagi'&&i===5)pre=pre.slice(2); // the selected rowing day is already told
  else if(id==='natsu'&&i===5)pre=pre.slice(2); // the guide meeting has already ended
  if(pre[0]?.startsWith('@')){const place=pre[0].split('|')[1];pre[0]='@その後、次に会うまで|'+place;}
  pre=['@前の返事から続いたこと|'+d.place,...consequence.map(x=>id==='akari'&&i===5?x.replace('合格の連絡も、彼女の方から電話で届いた。',''):x),...(pre[0]?.startsWith('@')?pre:['@そのやり取りを経て|'+d.place,...pre])];
 }
 // The seventh Mio episode ends by asking to speak later. It must not resume
 // the same walk after several intervening races.
 if(id==='mio'&&i===7)pre=['@あの待ち合わせのあと|二人の連絡','帰り際に話すと言った澪は、駅で言葉をのみ込んだ。主人公は返事を急かさず、次にゆっくり会える日を聞いた。','澪「その日は、取材の話はしません。自分の話をします」','それから別々の予定を過ごした。主人公も、待つだけのつもりではいられなくなった。','@次の約束の日|駅へ向かう商店街','澪（心の声）「また帰り際まで延ばす？　今日は、自分で呼んだんでしょう」','主人公（心の声）「自分の気持ちも、ちゃんと持ってきた。聞くだけで帰らない」','@商店街を抜けて|駅前'];
 const last=q?.meeting142;
 if(last?.chapter===i-1&&c.stats.races>last.expires&&i>1&&i!==9){pre=['@予定を合わせ直して|二人の連絡','仕事と出走の予定が重なり、前に考えていた時期には会えなかった。互いに空く時間を確かめ直し、今日の約束を取り直した。',...pre];}
 let body=N.lines(pre).concat(sc.body);
 if(i===7&&q?.memories133?.length){const m=q.memories133.at(-1),o=C.beats[id]?.[m.chapter]?.options[m.option];if(o){const before=body.findIndex(x=>x.includes('主人公（心の声）'));body.splice(before<0?1:before,0,'『'+o[0]+'』。あの時はそれだけを言うのにも迷った。今日の返事を、その続きとして相手へ渡したかった。');}}
 return {...sc,readerVersion:142,continuity142:true,episodeRole142:d.roles[i],body};
}
function record(c,id,sc,ch){
 const q=c.bonds.heroines[id];if(sc.readerVersion!==142)return;
 if(sc.kind!=='chapter')return;
 q.meeting142={chapter:q.step-1,choice:ch.code,races:c.stats.races,stage:c.stage,due:c.bonds.nextAt,expires:Math.min(1000,c.bonds.nextAt+3),title:sc.title};
 const lines=Data[id]?.moments[q.step];if(q.failed||!lines)return;
 q.interludes142||=[];if(q.interludes142.some(e=>e.step===q.step))return;
 const remembered=sc.edition146?Memory146.heroineMoment(c,id,q.step):null;
 q.interludes142.push({step:q.step,due:Math.min(1000,c.stats.races+1),read:false,shown:false,withdrawn:false,title:lines[0],body:[S.bridge('会話のあと、別々の日を過ごして',Data[id].place),...lines.slice(1)],...(remembered||{})});
}
function pendingMoments(c){
 if(c.ending)return [];
 return Object.entries(c.bonds?.heroines||{}).flatMap(([id,q])=>(q.interludes142||[]).filter(e=>!e.read&&!e.withdrawn&&!q.failed&&q.step===e.step&&c.stats.races>=e.due).map(e=>({kind:'moment142',id,step:e.step,key:'moment142:'+id+':'+e.step})));
}
function moment(c,id,step){return c.bonds?.heroines?.[id]?.interludes142?.find(e=>e.step===step);}
function scene(c,id,step,B){const e=moment(c,id,step);if(!e||e.read||e.withdrawn)return null;e.shown=true;return {key:'moment142:'+c.player.id+':'+id+':'+step,title:e.title,person:B.map[id],background:id==='akari'?'workshop':id==='tsumugi'?'cafe':'harbor',body:e.body.slice(),choices:[]};}
function mark(c,id,step){const e=moment(c,id,step);if(e)e.read=true;}
function clean(c){if(c.ending)for(const r of c.affinity?.requests||[])if(r.type==='race'&&['offer','accepted'].includes(r.status)){r.status='cancelled';r.resolved=c.stats.races;r.delta=0;r.seasonEnd142=true;}for(const q of Object.values(c.bonds?.heroines||{}))for(const e of q.interludes142||[])if(!e.read&&(q.failed||q.step!==e.step||c.ending)&&!e.shown)e.withdrawn=true;}
function momentLog(t){return Object.entries(t?.heroines||{}).flatMap(([id,q])=>(q.interludes142||[]).filter(e=>e.read).map(e=>({...copy(e),id,key:'moment142:'+id+':'+e.step})));}
function main(sc,t,e){
 if(!e.edition142)return sc;
 if(!e.connection142){
  const at=t.entries.indexOf(e),previous=t.entries.slice(0,at).filter(x=>x.read).at(-1);
  // A future chapter opened for inspection must not freeze an invented past.
  if(t.entries.slice(0,at).some(x=>!x.read))return sc;
  const remembered=Memory146.main(t,e);
  if(remembered){e.connection142=remembered.body;e.memory146=remembered.memory146;return {...sc,body:[...e.connection142,...sc.body]};}
  const actor={light:'父',back:'奏斗',shore:'紗枝',recovery:'相馬'}[t.arc];
  const places={light:'工房へ続く道',back:'待ち合わせへ向かう電車',shore:'食堂のある通り',recovery:'艇庫へ向かう道'};
  let body=[];
  if(previous){
   const title=previous.prose?.title;
   body=[S.bridge('前に話してから、今回の報告まで',places[t.arc])];
   if(previous.decision&&previous.priorText!==undefined){const specs=root.KM_PRACTICE133||(typeof require==='function'?require('./practice133.js'):null),choices=previous.choiceMode==='paths133'?specs.spec(t.arc,previous.choiceSpec):null;if(choices)body.push('前に'+actor+'へ「'+choices[previous.decision.index]+'」と答えた。口にした時の気持ちを、結果に合わせて言い換えたくはなかった。');}
   else if(title)body.push('「'+title+'」の日に話したことが残っていた。次に何を報告するか、移動の間にも考えていた。');
   const recall=e.stage===1?({light:['子供の頃は、怒られそうな物だけ鞄の底へ隠した。父の足音がすると、その鞄ごと椅子の下へ押し込んだ。','主人公（心の声）「今日は持ってきた。聞かれる前に、出そう」'],back:['最初に奏斗へ見せたノートは、数字の横がほとんど空白だった。説明を求められて初めて、走っている間に迷っていたと気づいた。','主人公（心の声）「今回は、迷った所にも印をつけた。消す前に話してみよう」'],shore:['前には店の明かりを見てから、もう一つ先の角まで歩いた。いい報告がない日の、時間のつぶし方だった。','主人公（心の声）「遅く来たって結果は変わらない。温かいうちに食べたいって、今日は言える」'],recovery:['復帰を決めた頃、道具を並べるだけで昔との差を探していた。使わない物まで鞄に入れ、重さで安心しようとしていた。','主人公（心の声）「今の走りに使う物を選んだ。できなかったことも、今の自分の話としてしよう」']})[t.arc]:laterMemories[t.arc]?.[e.stage];
   body.push(...(recall||[currentThoughts[t.arc]?.[e.stage]||'前の話の続きを持って、主人公は待ち合わせへ向かった。']));
   body.push(S.bridge(recall?'思い出から目を上げて':'約束の時刻に着いて','今回の話へ'));
  }
  e.connection142=body;
 }
 return {...sc,body:[...e.connection142,...sc.body]};
}
function ending(c,id,result,fallback){
 const d=Data[id],q=c.bonds?.heroines?.[id];if(!d||!q||q.failed)return fallback;
 const partner=c.bonds.partner===id&&q.dated;
 if(partner&&q.step>=10)return fallback;
 const title=partner?'優勝戦とは別の、次の約束':q.step<3?'挨拶の先に残した話':q.step===7?'言えなかった答えも含めて':'今季の先でも、会うために';
 let body;
 if(q.step===0)body=['出会って挨拶を交わした相手へ、ゆっくり話しに行けないまま今季が終わった。','主人公（心の声）「知り合えたことと、親しくなれたことは、同じじゃない」','相手がいそうな場所を通っても、今日は立ち寄らなかった。引き留めて自分の報告だけするのも違う気がした。','初めて言葉を交わした日のことを、ノートの余白へ書いた。','次に顔を合わせる機会があれば、まず相手の近況から聞こうと思った。'];
 else if(partner){
  // A championship appearance without finishing episode ten is distinct
  // from not qualifying, and must never imply the final reward was earned.
  body=result.reason==='finish'||['startFault','capsized','dnf'].includes(result.reason)?[
   '優勝戦の日に、二人で話すはずだった時間を取れないままレースが終わった。主人公は、そのことも自分から伝えた。',
   d.call+'「次に会う時に、聞かせて。今度は、時間を確かめてから」',
   '主人公は帰着の予定を伝え、相手の空いている日を聞いた。競走場で果たせなかった約束を、なかったことにはしない。'
  ]:d.partner.slice();
  body.push('交際は続いている。特別な日に間に合わなかった話も、次に会う理由として残った。');
 }else{body=(q.step<3?d.early:d.middle).slice();if(q.step===7)body.push('伝えかけた気持ちには、まだ返事をしていない。恋人になったことにはせず、今度はその話のために会いたいと、主人公から伝えた。');}
 if(q.meeting142&&q.step>0)body.unshift(S.bridge('最後に二人で話した日のこと',d.place),'「'+q.meeting142.title+'」。あの時に交わした言葉を思い出してから、今の連絡を始めた。',S.bridge('今季を終えたあと',d.place));
 // At least five lines, within the existing epilogue schema's sixteen lines.
 if(body.length<5)body.push('報告を終えてからも、相手の返事を待つ時間は残っていた。');
 return {title,body,continuity142:true};
}
function valid(q,id){
 const n=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b,str=(x,max)=>typeof x==='string'&&x.length>0&&x.length<=max,m=q.meeting142;
 if(m!==undefined&&(!m||!n(m.chapter,0,9)||m.chapter!==q.step-1||!n(m.choice,0,2)||q.choices?.[m.chapter]!==m.choice||!n(m.races,0,1000)||!n(m.stage,0,8)||!n(m.due,m.races,1000)||!n(m.expires,m.due,1000)||!str(m.title,100)))return false;
 const es=q.interludes142;if(es===undefined)return true;
 return Array.isArray(es)&&es.length<=4&&new Set(es.map(x=>x?.step)).size===es.length&&es.every(e=>e&&Memory146.validHeroine(e.memory146,q,id||e.memory146?.actors?.[1],e.step)&&[2,4,6,9].includes(e.step)&&e.step<=q.step&&n(e.due,0,1000)&&typeof e.read==='boolean'&&typeof e.shown==='boolean'&&typeof e.withdrawn==='boolean'&&!(e.read&&(!e.shown||e.withdrawn))&&str(e.title,100)&&Array.isArray(e.body)&&e.body.length>=3&&e.body.length<=8&&e.body.every(x=>str(x,800)));
}
const api={Data,phases,choices,heroine,record,pendingMoments,moment,scene,mark,clean,momentLog,main,ending,valid};root.KM_CONTINUITY142=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
