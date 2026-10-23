
/* V133: story decisions become small, recorded projects inside existing action slots. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const arcs={
 light:{actor:'父',place:'工房',titles:['同じ部位を詰める','二つの整備を比べる'],keys:['speed','turn'],
  choices:[['まず同じ部位を詰めて、次の一走に間に合わせる','モーターとプロペラ、両方の変化を記録する'],['手応えのあった部位を、もう一度確かめる','一度、反対側も整備して比べたい'],['父さんの得意な所を、自分の手で詰めたい','父さんと違う順番でも、記録して比べたい'],['今は同じ部位を仕上げる方に時間を使う','次の機材にも残るよう、両方の記録を取る'],['大舞台でも、まず一か所から詰めたい','大舞台の前に、二つの感触を比べたい'],['この先も、同じ部位を詰める仕事を続ける','この先は、二つの記録を並べて残したい']],
  lines:['父「お前のメモ、直した所より迷った所の方が長いな」','主人公「そこを飛ばしたら、次も同じ所で迷うだろ」','父は赤鉛筆を取ったが、書き込まずに主人公へ渡した。'],
  replies:['父「同じ所を二走、触ってみろ。一度の手応えで、分かったことにするなよ」','父「二つ比べるなら、触った順番も残せ。後で都合よく覚え直すからな、人間は」'],
  success:['父は二走分の記録を並べた。「ここ、二回目は自分で決めたんだな」。主人公は、そこだけは赤鉛筆を借りずに丸をつけた。','父がモーターの記録を指した。主人公はプロペラの紙も横に置いた。「片方だけだと、分からなかった所がある」。父は二枚とも読んだ。'],
  waiting:'父「予定どおり触れない日もある。空いた欄を、触ったことにだけはするなよ」'},
 back:{actor:'奏斗',place:'映像室',titles:['自分の課題を追う','ライバルの視点と比べる'],keys:['turn','start'],
  choices:[['自分の課題を、二走かけて確かめたい','ライバルとの特訓と自主練を比べたい'],['同じ課題で、前の自分と比べる','相手の練習を見て、自分の課題に戻る'],['人の数字を見る前に、自分の記録を揃える','数字が違う理由を、隣で練習して確かめる'],['今回は自分の苦手を、繰り返して詰めたい','今回は相手のやり方も試してみたい'],['自分の課題に絞って、大舞台へ持っていく','相手との違いを、大舞台の前に見ておく'],['これからも、自分の記録を軸にする','これからも、相手と比べて考え直す']],
  lines:['奏斗は二本の映像を同時に再生して、すぐに片方を止めた。','奏斗「比べるつもりで、また速い方だけ見てた」','主人公「見栄えがいいからな」','奏斗「君もそう思うなら、今日は見る順番から決めよう」'],
  replies:['奏斗「じゃあ課題を一つ固定する。次に弱点が変わっても、途中で丸ごと入れ替えないで試そう」','奏斗「相手との特訓を一回、自分の課題を自主練で一回。どちらが楽だったかも、後で聞く」'],
  success:['奏斗は同じ能力を練習した二走に印をつけた。「勝ち負けを分けて見る前に、同じことを試せたな」。主人公は、まだ分からなかった所を書き足した。','特訓と自主練の欄が一つずつ埋まった。奏斗は相手の速さを褒めかけ、主人公のメモへ視線を戻した。「自分でやった方は、どうだった？」'],
  waiting:'奏斗「空いてる欄があるな。別の準備を選んだなら、その理由も残そう。予定を守るためだけに走るわけじゃないし」'},
 shore:{actor:'紗枝',place:'港の食堂',titles:['帰ってくる走りを作る','前を狙う旋回を磨く'],keys:['power','turn'],
  choices:[['体づくりから始めて、一走を走り切る','旋回を磨いて、三着以内を狙う'],['完走まで崩れない身体を作りたい','次は前を狙うターンを見せたい'],['まず最後まで、自分の走りを続けたい','応援に応えるためにも、前を狙いたい'],['体づくりをして、帰ってくる走りを整える','旋回を練習して、上位を狙う'],['大舞台でも、最後まで崩れない準備をする','大舞台で、前へ出る準備をする'],['これからも、走り切る力を磨く','これからも、前へ出る旋回を磨く']],
  lines:['紗枝は店の応援札を裏返した。陸の字で、大きく「一着」と書いてあった。','紗枝「私も見たいよ、一着。でも、毎回これを持って待つのは違うかなって」','主人公「裏返さなくていい。何を目指すかは、自分で言う」'],
  replies:['紗枝「じゃあ、体づくりをして走り切るところまで。陸には、最後の周も見てって言っておく」','紗枝「旋回を磨いて、三着以内。着順は見ちゃうけど、届かなかった時も店の前を通り過ぎないでね」'],
  success:['食堂へ戻ると、陸が最後の周の話を始めた。紗枝は口を挟まず、主人公が自分の言葉で答えるのを待っていた。','紗枝は着順を知っていた。それでも、主人公が話し始めるまで言わなかった。「旋回の練習から、聞かせて」'],
  waiting:'紗枝「まだ途中なんだね。じゃあ今日は、途中の話をして。先にお茶を入れるから」'},
 recovery:{actor:'相馬',place:'艇庫',titles:['以前の武器を試す','別の軸から試す'],keys:['turn','power'],
  choices:[['まず、以前の得意技を今の身体で試す','以前とは違う能力から、走りを組んでみる'],['以前の得意技を練習して、一走で確かめる','違う能力を練習して、一走で確かめる'],['昔の手応えと、今の違いを見たい','別の軸を使った時の手応えを見たい'],['今日は以前の武器を磨き直してみる','今日は新しい主軸を試してみる'],['大舞台でも、得意だった技を確かめたい','大舞台の前に、別の軸を試したい'],['これからも、以前の技を今の走りへ直していく','これからは、新しい軸を育てていく']],
  lines:['相馬は古い映像を止めた。主人公は、止まった画面をしばらく見ていた。','主人公「見ないようにしたら、かえって思い出すな」','相馬「だったら比べればいい。ただし、今日やることは一つにしろ」'],
  replies:['相馬「以前の武器を一回練習して、有効完走まで。昔と同じ速さを出せ、とは言ってないぞ」','相馬「別の能力を一回練習して、有効完走まで。今までの技を捨てる話は、その後でいい」'],
  success:['戻ってから主人公は、以前と同じだった所より、違った所を先に話した。相馬は古い映像を消し、今日の記録を開いた。','主人公が選んだ別の能力には、まだ慣れない所があった。それも含めて一走を終えた。相馬は「次も試すか」と尋ね、返事を待った。'],
  waiting:'相馬「試してない所は、まだ分からないままでいい。昔の記憶だけで、今の身体の答えを決めるなよ」'}
};
const keys=D.statKeys,clone=x=>JSON.parse(JSON.stringify(x));
const followups={
 light:[['父「こっちの部品、まだ使うのか」','主人公「替えたら直るかもしれない。でも、どこが違ったか分からなくなる」'],['父は自分の工具箱を、主人公の前へ押した。','父「同じ工具でも、お前の手なら順番が違うんだな」'],['遠征の鞄にノートを入れると、工具が一つ入らなくなった。','主人公「全部持っていくつもりだった。……決めるか」'],['父「次は俺に聞ける時間も、短くなるな」','主人公「電話を待つだけの整備には、したくない」'],['工具を戻した場所を、父は直さなかった。','主人公（心の声）「次もこの並びで使う。その時、何を続けたいだろう」']],
 back:[['奏斗「次の比較表、項目を減らした」','主人公「増やすと思った」','奏斗「俺も。減らす方が、ずっと迷った」'],['主人公は相手の記録を伏せ、自分の練習欄を開いた。','奏斗「見ないと決めた？」','主人公「見る順番を決めてる」'],['奏斗が送ってきた映像には、説明がなかった。','奏斗「先に君の感想を聞かないと、また俺の答えを探させそうで」'],['主人公「大舞台だから、全部直したくなるな」','奏斗「全部の欄を作ることはできる。でも、練習するのは君だから」'],['奏斗は書き終えたノートの残りのページをめくった。','奏斗「まだ使う？　新しい方に移す？」','主人公「続けることを決めてからにする」']],
 shore:[['陸が応援札に、前より細い字で何か書き足していた。','紗枝「何を見るか、本人に聞いてからにしよう」'],['紗枝「応援に来た人の顔、走ってる間に分かるもの？」','主人公「細かくは見えない。でも、そこにいるとは思ってる」'],['店の予定表と、主人公の出走予定が並んだ。','紗枝「全部に顔を出さなくていいよ。来られた日に、ちゃんと喋って」'],['陸「今度は、遠くからでも見えるようにした」','旗が大きすぎて、紗枝の顔が隠れた。主人公は吹き出してから、自分の目標を話し始めた。'],['紗枝「次の応援札、まだ白紙にしてある」','主人公はペンを受け取った。人に書いてもらう前に、一行だけ自分で書きたかった。']],
 recovery:[['相馬「今日は、どっちの映像から見る？」','主人公「昔の自分に、先に答えを言わせたくない。今日の方から」'],['主人公は古い道具をしまいかけて、隣へ置き直した。','主人公「捨てたから変われる、ってわけでもないな」'],['相馬「走り方の大きな方針と、今日試すことは分けろ」','主人公「一回違う練習をしたくらいで、決めた道が消えるわけじゃないか」'],['昔の記録に近い数字を見つけた。主人公は丸をつけかけ、まず今日の条件を書いた。','相馬はその手元を見て、何も言わずに椅子を引いた。'],['相馬「もう一度、最初からやり直したいか」','主人公「最初には戻りたくない。続きは、やりたい」']]
};
function spec(arc,i){const a=arcs[arc];return [...a.choices[i],...a.keys,...a.replies];}
function goal(t){if(t.arc==='light')return t.mode===0?'別々の二走で、同じ部位を整備する':'モーターとプロペラを一度ずつ整備する';if(t.arc==='back')return t.mode===0?D.stats[t.focus]+'を別々の二走で練習する':'ライバルと特訓し、'+D.stats[t.focus]+'を自主練する';const target=t.mode===0&&t.arc==='shore'?'power':t.focus;return D.stats[target]+'を練習してから、'+(t.arc==='shore'&&t.mode===1?'三着以内で有効完走する':'一走を有効完走する');}
function select(c,e,index){const P=root.KM_PASSAGE143||(typeof require==='function'?require('./passage143.js'):null);P.archiveTask(c);const arc=c.campaign.arc,weak=keys.slice().sort((a,b)=>c.player.stats[a]-c.player.stats[b])[0],origin=c.refinement?.recovery?.origin||weak;
 const focus=arc==='back'?weak:arc==='shore'?(index===0?'power':'turn'):arc==='recovery'?(index===0?origin:({speed:'accel',turn:'power',start:'turn',accel:'speed',power:'start'})[origin]):index===0?'speed':'turn';
 c.campaign.task133={version:1,arc,source:e.id,mode:index,focus,records:[],completed:false,rewarded:false};return '\n次の実践：'+goal(c.campaign.task133)+'。練習・整備はいつもの行動枠を使います。';
}
function progress(t){if(!t)return 0;const rs=t.records;if(t.arc==='light'){if(t.mode===1)return Number(rs.some(x=>x.key==='motor'))+Number(rs.some(x=>x.key==='prop'));return Math.min(2,Math.max(...['motor','prop'].map(k=>rs.filter(x=>x.key===k).length)));}if(t.arc==='back'){if(t.mode===0)return Math.min(2,rs.length);return Number(rs.some(x=>x.kind==='joint'))+Number(rs.some(x=>x.kind==='train'));}return Number(rs.some(x=>x.kind==='train'))+Number(rs.some(x=>x.kind==='race'));}
function record(c,kind,key,raceId,result){const t=c.campaign?.task133;if(!t||t.completed||c.ending)return null;let eligible=false;
 if(t.arc==='light')eligible=kind==='tune';
 else if(t.arc==='back')eligible=t.mode===0?['train','joint','mentor'].includes(kind)&&key===t.focus:kind==='joint'||kind==='train'&&key===t.focus;
 else eligible=['train','joint','mentor'].includes(kind)&&key===t.focus||kind==='race'&&t.records.some(x=>x.kind==='train')&&result&&!result.startFault&&!result.dnf&&!result.capsized&&(t.arc!=='shore'||t.mode===0||result.place<=3);
 if(!eligible)return null;
 const normalized=t.arc!=='back'&&['joint','mentor'].includes(kind)?'train':t.arc==='back'&&t.mode===0?'train':kind;
 if(t.records.some(x=>x.raceId===raceId&&(t.arc==='light'||t.arc==='back'&&t.mode===0||x.kind===normalized)))return null;
 if((t.arc==='light'&&t.mode===1)&&t.records.some(x=>x.key===key)||(t.arc==='back'&&t.mode===1||!['light','back'].includes(t.arc))&&t.records.some(x=>x.kind===normalized))return null;
 t.records.push({kind:normalized,key:kind==='race'?t.focus:key,raceId});t.completed=progress(t)>=2;
 if(!t.completed)return '本編の実践：'+goal(t)+'（1 / 2）';
 if(!t.rewarded){t.rewarded=true;if(t.arc==='light'){const W=root.KM_WORKSHOP128||(typeof require==='function'?require('./workshop128.js'):null);for(const p of t.mode===0?[t.records.at(-1).key]:['motor','prop'])W.learn(c.player,p,.12);}else{const p=c.development.paths[t.focus];p.hints=Math.min(12,p.hints+.25);}}
 return '本編の実践を記録した：'+arcs[t.arc].titles[t.mode]+'。'+(t.arc==='light'?'整備の経験が少し増えた。':'試した能力のコツが少し深まった。');
}
function training(c,key,method){const t=c.campaign?.task133;if(!t||t.completed||t.arc==='light')return 1;return (t.arc==='back'&&t.mode===1?method==='rival':key===t.focus)?1.08:1;}
function learning(c){const t=c.campaign?.task133;return t&&!t.completed&&t.arc==='light'&&t.mode===1?1.08:1;}
function tuning(c,out,scale=1){const t=c.campaign?.task133;return t&&!t.completed&&t.arc==='light'&&t.mode===0&&out.positive?{...out,delta:out.delta+.08*scale}:out;}
function summary(c){const t=c.campaign?.task133;if(!t)return null;return {title:arcs[t.arc].titles[t.mode],text:goal(t),progress:progress(t),completed:t.completed};}
function capture(t){return t.task133?clone(t.task133):null;}
function stage(sc,t,e){const S=root.KM_SCENE131||(typeof require==='function'?require('./scene131.js'):null),a=arcs[t.arc],p=e.practice133,body=sc.body.slice();if(p){body.unshift(S.bridge('前に決めた実践を振り返る',a.place),p.completed?a.success[p.mode]:a.waiting,S.bridge('その後',a.place));}
 if(e.choiceMode==='paths133'&&e.choiceSpec!==null){const at=body.findLastIndex(x=>x.startsWith(a.actor+'「'));if(at>=0&&/返事|考え|どうしたい/.test(body[at]))body.splice(at,1);body.push(...(e.choiceSpec===0?a.lines:followups[t.arc][e.choiceSpec-1]));}
 return {...sc,body};
}
function valid(t,arc,entries){if(t===undefined||t===null)return true;return !!t&&t.version===1&&t.arc===arc&&!!arcs[t.arc]&&[0,1].includes(t.mode)&&keys.includes(t.focus)&&typeof t.source==='string'&&(!entries||Array.isArray(entries)&&entries.some(e=>e.id===t.source&&e.choiceMode==='paths133'&&e.decision?.index===t.mode))&&Array.isArray(t.records)&&t.records.length<=3&&t.records.every(x=>!!x&&(t.arc==='light'?x.kind==='tune'&&['motor','prop'].includes(x.key):t.arc==='back'?['train','joint'].includes(x.kind)&&keys.includes(x.key):['train','race'].includes(x.kind)&&x.key===t.focus)&&typeof x.raceId==='string'&&x.raceId.length<=120)&&new Set(t.records.map(x=>x.raceId+':'+x.kind)).size===t.records.length&&typeof t.completed==='boolean'&&t.completed===(progress(t)>=2)&&t.rewarded===t.completed;}
function reaction(c,z){const a=arcs[c.campaign?.arc];if(!a)return '';const bad=z.startFault||z.capsized||z.dnf,won=z.place===1;return a.actor+'「'+({light:bad?'道具を置いたら、一度座れ。順番に見よう。':won?'おう、見てた。帰ったら、お前の話を先に聞く。':'帰りに寄れよ。直す所は、飯を食ってから話そう。',back:bad?'映像は残してある。今すぐ答えを出さなくていい。':won?'一着だ。今日は、まずそれを喜ぼう。':'着順は見た。どこが悔しかったかは、君から聞きたい。',shore:bad?'席は空けてあるよ。今日は座るだけでも。':won?'一着、おめでとう。陸がもう同じ話を三回してる。':'おかえり。結果は知ってるけど、話はまだ聞いてないよ。',recovery:bad?'今日はここまで。確認することは、一つずつだ。':won?'今の一着だ。昔の記録と比べるのは、あとにしよう。':'戻ったな。今日の手応えを、忘れないうちに聞こう。'})[c.campaign.arc]+'」';}
const api={arcs,spec,select,goal,progress,record,training,learning,tuning,summary,capture,stage,valid,reaction};root.KM_PRACTICE133=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);

