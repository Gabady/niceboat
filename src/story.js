

/* v94: deterministic career stories and one scheduled duel per series. No DOM. */
(function(root){
'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const Extra=root.KM_STORY_EXTRA||(typeof require==='function'?require('./story-extra.js'):null);
const N=root.KM_DRAMA_DATA||(typeof require==='function'?require('./drama-data.js'):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>{let v=2166136261;for(const c of String(s))v=Math.imul(v^c.charCodeAt(0),16777619);return v>>>0;};
const random=t=>{let v=t.seed+=0x6D2B79F5;t.seed>>>=0;v=Math.imul(v^v>>>15,v|1);v^=v+Math.imul(v^v>>>7,v|61);return ((v^v>>>14)>>>0)/4294967296;};
const speakers={mentor:{name:'先輩・朝倉',mark:'航',color:'teal'},mechanic:{name:'整備士・篠原',mark:'匠',color:'amber'},manager:{name:'担当・七瀬',mark:'縁',color:'coral'},fan:{name:'応援団・なつ',mark:'声',color:'pink'},press:{name:'記者・柊',mark:'筆',color:'blue'}};
const chapters=[
 ['白いヘルメット','朝倉は新品のヘルメットを軽くたたいた。「まずは一つ、自分で良くなったと言える走りをしよう」まだ硬いベルトを締め、主人公は桟橋へ向かった。'],
 ['はじめての名前','スタンドから自分の名が聞こえ、主人公は思わず振り返った。七瀬が小さく手を振る。「覚えてくれた人がいますね」次も見つけてもらえるような走りがしたくなった。'],
 ['広いピット','G3のピットには、映像で見た選手が何人もいた。手が止まった主人公へ、篠原が工具を差し出す。「相手を見すぎるな。まずは、いつもの点検からだ」'],
 ['選んだ航跡','朝倉は練習帳の書き込みをたどった。「練習するうちに、得意な形が見えてきただろう。皆と同じでなくていい。お前は、どこで勝負したい？」'],
 ['背中の距離','G2の水面へ出ると、追い続けてきた選手の艇が見えた。遠くから眺めていた頃とは違う。どのターンで追いつくか、今はその背中を見ながら考えている。'],
 ['答えのない調整','篠原の机には、仕上げの違うプロペラが二枚並んでいた。「伸びが欲しいか、出口を押してほしいか。走りたい形を聞かせてくれ」乗った感触を言葉にするのも、調整の一部だった。'],
 ['名前を背負う','取材のカメラが並び、挨拶をするだけで喉が乾いた。少し離れた場所で、なつが見慣れた横断幕を広げる。「ここにいるよ」その声に手を振ってから、主人公は準備へ戻った。'],
 ['最後の切符','七瀬と賞金の記録を確かめた。最高峰へ進めるかは、このシリーズで決まる。「先の計算は私も見ています。まず、次の一走に何が必要か決めましょう」主人公は次の出走表を開いた。'],
 ['水面に残るもの','最高峰の朝。点検を終えて顔を上げると、朝倉が桟橋で待っていた。「準備は？」主人公がうなずくと、先輩は道を空けた。「よし。行ってこい」今日は、自分で決めた走りを試す。']
];
const recoveryChapters=[
 ['再び締めるベルト','ベルトを締める指が、一度止まった。相馬は急かさずに待っている。「今の身体に合わせて、一つずつ確かめよう。昔の映像を見るのは、その後でいい」'],
 ['怖さを残す記録','怖くなって操作をためらった場面を、映像に残した。相馬が画面を止める。「ここだな。怖くないふりは要らない。次に何を確かめるか、一緒に決めよう」'],
 ['教わる側の席','後輩に頼んで、練習の映像を借りた。「ここの操作、どうして変えた？」聞く側へ座るのは落ち着かない。それでも、分からないまま帰るよりはよかった。'],
 ['頼むという仕事','整えたはずの機材が、どうしても身体に合わない。言い出せずにいると、相馬が工具を置いた。「使いにくいなら言ってくれ。そのために一緒にやってるんだ」'],
 ['今日の予定表','昔の練習予定を閉じ、今日の手順を書き直した。休む時間も、感触を確かめる時間も削らない。以前と違う予定表を、相馬は黙って受け取った。'],
 ['新しい出口へ','以前より大きく回った場面で、映像を止めた。「この角度なら、出口で身体を戻せます」遠回りに見える進路にも、今の自分なりの理由がある。相馬は続きを再生した。'],
 ['G1へ帰る朝','G1のピットで、昔よく座った場所に目が向いた。今は別の選手が支度をしている。主人公は軽く会釈し、自分の機材が置かれた場所でベルトを締めた。'],
 ['証明より一着を','取材で「復活」の二文字を何度も聞いた。ピットへ戻ると、相馬が出走表を寄せる。「その話は走った後だ。今日は、どこで競る？」主人公は一つの進路を指した。'],
 ['折れた先の水面','桟橋で、相馬に最後の確認をした。「ここまで変えてきた走りで行きます」声は、自分でも思ったより落ち着いていた。昔に戻るためではない。今日の一着を取るために、艇へ乗り込んだ。']
];
const chapter=c=>(c.campaign?.arc==='recovery'?recoveryChapters:chapters)[c.stage];
const stageName=c=>c.campaign?.arc==='recovery'&&c.stage<2?'復帰シリーズ '+(c.stage?'後期':'前期'):D.stages[c.stage].name;
const choice=(label,effect,reply)=>({label,effect,reply});
const stat=(key,value=.35)=>({stat:key,value});
const gear=(part,value=1.2)=>({gear:part,value});
const event=(id,speaker,title,text,a,b,when='any',rare=false)=>({id,speaker,title,text,choices:[a,b],when,rare});
const events=[
 event('morning','mentor','一番乗りの桟橋','まだ誰もいない水面に、朝倉が線を引いた。「今日は何を確かめる？」',choice('踏み込みを合わせる',stat('start'),'針を見る目が、少し落ち着いた。'),choice('出口の加速を試す',stat('accel'),'艇が前を向く瞬間を、体で覚えた。')),
 event('glove','mentor','手袋の擦り跡','朝倉が手袋の片側を指す。「力を入れる場所、少し偏っているな」',choice('握り方を教わる',stat('turn'),'握り込んでいた指の力を抜くと、舵を戻す動きが滑らかになった。'),choice('体幹で支える',stat('power'),'腰を落とし、腕だけに頼らず艇を支えた。練習の後も、握る手には少し余裕があった。')),
 event('line','mentor','一本の航跡','朝倉は他艇の波を指した。「消えるまで待つか、外へ出るか。何を見る？」',choice('波の切れ目を読む',stat('turn'),'水の色が変わる場所を覚えた。'),choice('抜ける加速を磨く',stat('accel'),'波を抜けたあとに前へ出る感覚をつかんだ。')),
 event('straight','mentor','伸びる背中','練習艇が遠ざかる。朝倉は笑った。「焦って舵を足すと、直線まで曲がるぞ」',choice('舵を戻して走る',stat('speed'),'真っすぐ走る時間を意識できた。'),choice('姿勢を安定させる',stat('power'),'腰で艇を支える感覚が残った。')),
 event('twelve','mentor','十二秒の間','時計の針を一周だけ見つめる。「待つ時間も、走る時間なんだ」と朝倉。',choice('合図を刻む',stat('start'),'発進までの呼吸が揃った。'),choice('発進姿勢を見直す',stat('accel'),'加速に合わせて腰が浮く癖を直した。艇を支えたまま、前へ送り出せる。')),
 event('lowturn','mentor','曲がれない理由','ターンで外へ流れた映像を朝倉と見る。「負けた場所は、次の練習場所だ」',choice('舵を早めに作る',stat('turn',.45),'旋回へ入る前に姿勢を作り直した。舵を切ってから慌てることが、少し減った。'),choice('姿勢を固める',stat('power',.4),'流されにくい支え方を練習した。'),'lowTurn'),
 event('lowpower','mentor','腕だけでは届かない','着替えの途中で腕が重い。朝倉は椅子を引いた。「今日は、支える方を覚えよう」',choice('体幹の短い練習',stat('power',.45),'腰と膝の位置を直し、腕に集まっていた負担を分散した。'),choice('力まず舵を戻す',stat('turn'),'力を抜く場所が分かった。'),'lowPower'),
 event('defeat','mentor','負けた日のノート','朝倉は着順を隠し、走行線だけを残した。「直すところは、まず一つでいい」',choice('最初の一秒を直す',stat('start',.4),'次の発進で見る場所を決めた。'),choice('ターン出口を直す',stat('accel',.4),'やり直す課題が一つに絞れた。'),'loss'),
 event('firstcheer','fan','小さな横断幕','なつが少し曲がった文字の横断幕を広げた。「遠くからでも読めるかな？」',choice('手を振って応える',{fame:3},'照れながら振った手に、歓声が返ってきた。'),choice('走りで応えると約束',stat('speed'),'次の直線で何をするか、気持ちが定まった。')),
 event('fanletter','fan','一通の手紙','手紙には、勝った日ではなく粘った日のことが書いてあった。',choice('返事を書く',{fame:3},'次の開催でも応援すると、返事が届いた。'),choice('練習帳にはさむ',stat('power'),'練習帳を開くたびに、粘った走りを見ていた人を思い出す。終盤の姿勢を支える練習にも、身が入った。')),
 event('signature','fan','初めてのサイン','サインを頼まれ、ペンが一瞬止まる。「名前だけでいいよ」となつが笑う。',choice('一人ずつ言葉を添える',{fame:4},'帰り際、また来るねという声がした。'),choice('短く書いて整備へ戻る',gear('motor'),'限られた時間で、機材の確認を済ませた。')),
 event('localfood','fan','差し入れの包み','地元の応援団から小さな差し入れ。「食べたら、よく寝てね」',choice('休息を大切にする',stat('power'),'食事の後は早めに休み、次の練習に備えた。疲れたままでは気づけなかった姿勢の癖も、確かめられた。'),choice('応援団へお礼に行く',{fame:3},'顔と名前が、一つずつつながった。')),
 event('children','fan','子どもの質問','「どうして曲がると水が白くなるの？」簡単そうで、答えるのは難しい。',choice('一緒に水面を見る',stat('turn'),'説明するうち、自分の見方も整理できた。'),choice('分かる言葉で話す',{fame:4},'小さな観客が、次のレースを楽しみにしている。')),
 event('banner','fan','遠くの声','雨のスタンドでも、同じ横断幕が揺れている。なつは濡れた手で親指を立てた。',choice('最後まで踏ん張る準備',stat('power',.4),'濡れた横断幕を思い出しながら、最後まで崩れない姿勢を練習した。'),choice('ピットから手を振る',{fame:4},'傘の向こうから、いくつもの手が上がった。'),'rain'),
 event('motorhum','mechanic','モーターの鼻歌','篠原が始動音に耳を寄せる。「同じ回転でも、機嫌は違うんだ」',choice('音を聞き分ける',{learn:'motor',value:.3},'次に触る場所を、自分で見つけられた。'),choice('点検を手伝う',gear('motor',1.5),'小さな引っ掛かりを取り除いた。')),
 event('propedge','mechanic','光るプロペラ','篠原は刃の影を机に映した。「形を見るなら、光も借りよう」',choice('輪郭を見比べる',{learn:'prop',value:.3},'僅かな違いを見つける目が育った。'),choice('表面を整える',gear('prop',1.5),'仕上がりが少し滑らかになった。')),
 event('toolbox','mechanic','古い工具箱','借りた工具には名前が何度も書き直されていた。「選手より長くここにいるかもな」',choice('道具の使い方を学ぶ',{learn:'motor',value:.3},'狙った箇所へ力を掛ける感覚を覚えた。'),choice('篠原と道具を磨く',{bond:'mechanic',value:1},'次はもう少し深い話をしてくれそうだ。')),
 event('tradeoff','mechanic','伸びか、立ち上がりか','篠原が二つの調整案を置いた。「速い、にも二通りある」',choice('直線の感覚を学ぶ',stat('speed'),'伸びが続く姿勢を確かめた。'),choice('出口の感覚を学ぶ',stat('accel'),'立ち上がりで艇が浮く瞬間を覚えた。')),
 event('scratch','mechanic','小さな傷','水から上げたプロペラに細い傷。篠原は首を振る。「今、見つけられてよかった」',choice('状態を整える',gear('prop',2),'傷の影響を小さく抑えた。'),choice('見つけ方を教わる',{learn:'prop',value:.4},'点検で見る場所が一つ増えた。')),
 event('warmup','mechanic','暖機のあいだ','エンジンが温まるまで、篠原は急がない。「待つのも整備だよ」',choice('一緒に点検する',gear('motor',2),'機材の状態が整った。'),choice('整備の記録をつける',{bond:'mechanic',value:1},'篠原は次のページに、短い助言を書き足した。')),
 event('tilttalk','mechanic','角度の誘惑','「上げれば伸びる。でも曲がる君も乗っている」篠原はティルトの目盛りをなぞる。',choice('支える姿勢を確認',stat('power'),'速度が上がった時に腰が浮かないよう、支える姿勢を繰り返し確かめた。'),choice('出口の線を確認',stat('turn'),'旋回の入口だけでなく、出口で艇が向く先まで見た。舵を戻す場所を、少し手前に変えた。')),
 event('secretcraft','mechanic','工具箱の奥','何度も手伝ったあと、篠原が古い整備帳を開いた。「ここからは、君の言葉で書いていけ」',choice('モーターの章を写す',{learn:'motor',value:.65},'積み重ねた会話が、自分の整備知識になった。'),choice('プロペラの章を写す',{learn:'prop',value:.65},'勘に頼っていたところへ、根拠が一つ加わった。'),'bondMechanic',true),
 event('windflag','mentor','旗の向き','旗が一度だけ強くはためく。「水面は同じでも、今日は同じじゃない」',choice('風を受ける姿勢',stat('power'),'横風への構えを練習した。'),choice('踏み込みを確認',stat('start'),'旗の向きと助走の速さを見比べ、大時計の針に艇の位置を合わせた。'),'wind'),
 event('rainline','mentor','雨粒の線','水面を細かい雨が覆う。朝倉は視線を遠くへ向けた。',choice('遠い目印を追う',stat('turn'),'近くの雨粒に目を取られず、旋回の先の目印を追った。舵を切る位置も見失わずに済んだ。'),choice('短い集中練習',stat('start'),'雨音の中でも大時計から目を離さず、助走の手順を繰り返した。'),'rain'),
 event('quiet','mentor','静かな水面','波の少ない水面では、わずかな舵の動きまで航跡に残る。',choice('直線を一本だけ',stat('speed',.4),'真っすぐな航跡に、少し自信がついた。'),choice('ターンを一本だけ',stat('turn',.4),'無駄な切り足しが見えた。'),'calm'),
 event('interview','press','勝因を一言で','柊が録音を止めた。「専門用語なしで、一つだけ言うなら？」',choice('整備のおかげと答える',{bond:'mechanic',value:1},'記事を読んだ篠原が、照れくさそうに笑った。'),choice('応援のおかげと答える',{fame:4},'スタンドに新しい顔が増えた。'),'win'),
 event('lossquote','press','着順のその先','柊は負けた理由だけを聞かなかった。「次はどんな走りを見せたいですか」',choice('次は前で回る',stat('start'),'言葉にした分、狙う場所がはっきりした。'),choice('出口で追いつく',stat('accel'),'負けを次の課題へ置き換えた。'),'loss'),
 event('nickname','press','呼ばれ方','柊の記事に、走りを表す短い言葉がついた。七瀬が紙面を持ってくる。',choice('自分の武器を磨く',{best:.3},'得意な走りを、もう一段確かめた。'),choice('弱いところも見直す',{worst:.4},'見られていない部分にも手を入れた。')),
 event('photo','press','一枚の写真','写真の自分は思ったより前を見ていた。「その目、いいですね」と柊。',choice('応援してくれる人へ見せる',{fame:3},'写真をきっかけに、名前を覚えてもらえた。'),choice('フォームを見返す',stat('power'),'肩に入っていた余計な力に気づいた。')),
 event('calendar','manager','余白のある予定表','七瀬は空き時間を一つ囲んだ。「全部埋めるだけが、準備じゃないですよ」',choice('不得意を一つ補う',{worst:.4},'次の走りで困りそうなところを整えた。'),choice('人に会って話を聞く',{bond:'mentor',value:1},'朝倉と、着順にない失敗の話をした。')),
 event('travel','manager','遠征先の朝','見慣れない街の空気。七瀬が地図を渡す。「桟橋まで、少し歩きましょう」',choice('軽く身体を動かす',stat('power'),'歩きながら肩と腰を動かすと、移動で固まった身体がほぐれてきた。'),choice('地元の水面の話を聞く',stat('turn'),'波が返る岸辺を教えてもらい、練習で確かめた。同じ曲がり方でも、艇の流れ方は違う。')),
 event('budget','manager','小さな支援','七瀬が支援者からの封筒を差し出す。「次も応援したい、だそうです」',choice('整備費として受け取る',{money:8},'支援金を次の整備に回し、七瀬と一緒にお礼を伝えた。※支援金は進出条件の賞金に含まれません。'),choice('応援の場を作る',{fame:5},'支援者と短い交流の時間を過ごした。'), 'any',true),
 event('routine','manager','いつもの順番','「緊張する日は、準備の順番を変えないといいですよ」と七瀬。',choice('発進までを整える',stat('start'),'慌てずに始められる手順ができた。'),choice('整備までを整える',gear('motor'),'点検漏れを一つ減らした。')),
 event('oldrace','mentor','古いレース映像','朝倉が昔の映像を止める。「ここで勝った。君なら、どこを見る？」',choice('先手を取った瞬間',stat('start',.4),'踏み出しの意味が、少し深く分かった。'),choice('差し場が開いた瞬間',stat('turn',.4),'待つことで開く進路を覚えた。')),
 event('mentortruth','mentor','先輩の黒星','何度も話した夜、朝倉が初めて大敗の話をした。「長く覚えているのは、負けた日だ」',choice('自分の課題を話す',{worst:.65},'言いにくかった弱さが、練習の課題に変わった。'),choice('勝ち方を一緒に考える',{best:.5},'朝倉と、自分だけの勝負どころを決めた。'),'bondMentor',true),
 event('sgrade','mentor','期待が集まるピット','名前を知る選手が声を掛けてくる。朝倉はいつもと同じ声で呼んだ。',choice('得意な形を守る',{best:.3},'期待より、自分の手応えを選んだ。'),choice('足りない一つを詰める',{worst:.45},'最後の穴を一つ埋めた。'),'g1'),
 event('g3wall','manager','新しい壁','速い選手が増えた。七瀬は前のシリーズの記録を隣に置く。「伸びたところも見てください」',choice('得意を武器にする',{best:.35},'相手と違う勝ち方を探した。'),choice('弱点から崩れないようにする',{worst:.4},'苦しい展開への備えを作った。'),'g3'),
 event('spareprop','mechanic','予備の一枚','「選ぶのは君だ」篠原は違う仕上げのプロペラを見せた。',choice('今の一枚を磨く',gear('prop',2.5),'使い慣れた一枚への手応えが増した。'),choice('違いを触って覚える',{learn:'prop',value:.45},'仕上げと走りを結びつけられた。'), 'any',true),
 event('bigstand','fan','遠くまで届く名前','いつもの横断幕の隣に、見知らぬ横断幕が増えていた。',choice('声に応えて礼をする',{fame:6},'顔を上げると、いくつもの笑顔が見えた。'),choice('全てを走りへ持っていく',stat('power',.5),'応援に礼をしてから、身体をほぐす時間を取った。艇へ乗る時には、肩の力も抜けていた。'),'popular',true),
 event('finalticket','manager','あと一歩の数字','七瀬と賞金の記録を見返す。数字は、焦るためではなく準備のためにある。',choice('最初の勝負を磨く',stat('start',.4),'次の一走に集中し直した。'),choice('得意な勝ち方を磨く',{best:.4},'届く可能性のある形を、もう一度確かめた。'),'late'),
 event('sgnight','mentor','最高峰の前夜','朝倉から短いメッセージ。「上手く見せなくていい。ここまで走ってきた通りに」',choice('原点のスタート練習',stat('start',.5),'初めての桟橋と、同じ呼吸を思い出した。'),choice('選んだ武器を確かめる',{best:.45},'自分が選んだ走りを信じられた。'),'sg',true)
];
const surges=[
 event('awakening','mentor','航跡が、ひとつにつながる','何度も見失った出口が、突然はっきり見えた。身体が、考えるより先に動く。',choice('武器を研ぎ澄ます',{best:2.5},'積み重ねた練習が、一つの確信に変わった。'),choice('苦手の壁を越える',{worst:3},'できなかった動きに、初めて手が届いた。'),'any',true),
 event('masterchart','mechanic','名匠の設計図','篠原が使い込まれた一枚を広げる。「今日は、惜しまず教えよう」',choice('モーターを仕上げる',gear('motor',12),'音が澄み、伸び足への期待が高まる。'),choice('プロペラを仕上げる',gear('prop',12),'水をつかむ一枚に仕上がった。'),'any',true),
 event('inheritance','mentor','受け継がれる技','朝倉は長くしまっていた練習帳を渡した。「ここから先は、お前の走りで書き足せ」',choice('秘伝を受け継ぐ',{skill:true},'受け継いだ練習帳を開き、自分の走りへ使える動きを探した。次に水面へ出るのが楽しみになった。'),choice('身体に刻みこむ',stat('power',3),'教えが、自分を支える確かな力になった。'),'g1',true),
 event('bigbacking','manager','名前を信じた人たち','支援者から、大きな横断幕と遠征支援が届く。七瀬は少し声を震わせた。',choice('遠征支援を受け取る',{money:60},'横断幕を広げ、七瀬と支援者へ報告する写真を撮った。支援は次の遠征に使う。※支援金は進出条件の賞金に含まれません。'),choice('応援を力にする',{fame:25},'スタンドの声が、ひとつになった。'),'any',true),
 event('perfectlaunch','mentor','止まって見えた十二秒針','音も波も、今だけは遠い。踏み込む瞬間が、確かな手応えになった。',choice('一瞬をつかむ',stat('start',3),'始まりの呼吸を、自分のものにした。'),choice('出口へ力をつなぐ',stat('accel',2.5),'一歩先へ艇を送り出す感覚を得た。'),'any',true),
 event('secretwave','mechanic','水面の秘密','篠原と見返した映像に、一瞬だけ他艇の波が開く。「今の、見えたか？」',choice('新しい技を覚える',{skill:true},'映像を何度も戻し、その進路が開く条件を聞いた。水面で試すために、操作の順番を書き留めた。'),choice('最速の線を刻む',stat('speed',2.5),'迷いのない直線が、武器になった。'),'any',true)
];
const setbacks=[
 event('wear','mechanic','消耗の兆し','点検で小さな摩耗が見つかった。走れるが、このままでは状態が落ちる。',choice('応急処置で準備を続ける',{gear:'motor',value:-5},'モーターの状態が下がった。整備で取り戻そう。'),choice('補修費を払う',{cost:12},'使える予算を伝え、補修を頼んだ。残った確認箇所は篠原と共有し、出走の準備へ戻った。')),
 event('chipedge','mechanic','欠けた縁','プロペラの縁に欠けがある。篠原は二つの修復案を見せた。',choice('応急処置で出走',{gear:'prop',value:-5},'プロペラの状態が下がった。次の整備が勝負だ。'),choice('補修を依頼する',{cost:12},'予算の範囲で補修を依頼した。作業後の状態を確かめ、次の走行に備える。')),
 event('transport','manager','遠征のトラブル','運搬中の揺れで機材の点検が必要になった。慌てず、次の準備を選ぼう。',choice('機材を軽く整える',{gear:'motor',value:-3},'小さな状態低下で済んだ。整備で立て直せる。'),choice('点検費を出す',{cost:8},'予算を伝えて点検を頼んだ。確認できた所と残った作業を聞き、次の準備を決めた。')),
 event('misquote','press','すれ違った言葉','取材の一言が、違う意味で伝わってしまった。柊が訂正を申し出る。',choice('自分の言葉で訂正する',{fame:-4},'説明は出せたが、全員に届いたわけではない。離れた人もいる中で、柊は訂正記事を最後まで整えてくれた。'),choice('交流会で話す',{cost:8},'使える予算の中で交流の場を設けた。相手の疑問を聞き、何を伝えたかったのか話し直した。'))
];
surges.forEach(e=>{e.tone='surge';events.push(e);});setbacks.forEach(e=>{e.tone='setback';events.push(e);});
events.push(...Extra.events);surges.push(...Extra.events.filter(e=>e.tone==='surge'));setbacks.push(...Extra.events.filter(e=>e.tone==='setback'));
Extra.arcs.push(...N.dailyArcs);events.push(...N.daily,...N.surges);surges.push(...N.surges);
for(const e of events)if(N.eventDialogue?.[e.id])e.text=N.eventDialogue[e.id];
const eventMap=Object.assign(Object.create(null),Object.fromEntries(events.map(e=>[e.id,e])));
function ensure(c){if(!c.story)c.story={version:1,seed:hash(c.player.id+':story'),chapters:[],gates:[],seen:{},bonds:{mentor:0,mechanic:0},pending:null,rivals:[],duel:null,log:[],shown:[],serial:0};if(!c.story.arcs)c.story.arcs={};if(!c.story.skillStages)c.story.skillStages=[...new Set(c.story.log.filter(l=>l.kind==='event'&&l.skill).map(l=>l.stage))];return c.story;}
function log(c,entry){const t=ensure(c);t.log.push({...entry,index:++t.serial,stage:c.stage});if(t.log.length>72)t.log.shift();}
function series(c){const t=ensure(c);if(t.chapters.includes(c.stage))return;t.chapters.push(c.stage);t.pending=null;t.duel=null;log(c,{kind:'chapter',title:chapter(c)[0],note:chapter(c)[1]});}
function lineUp(c,people){const q=c.story?.duel;if(!q||q.status!=='scheduled'||q.round!==c.series.round)return people;const rival=c.series.npcs.find(n=>n.id===q.rivalId);if(!rival||people.some(n=>n.id===rival.id))return people;return [...people.slice(0,5),rival];}
function fame(p){const value=Math.max(0,Math.floor(p.popularity||0)),i=Extra.bands.findIndex(b=>value<b.max),band=Extra.bands[i],next=Extra.bands[i+1];return {value,index:i,name:band.name,min:band.min,next:next?.min||null,progress:next?clamp((value-band.min)/(next.min-band.min),0,1):1};}
function resolve(pending){const base=eventMap[pending?.id];if(!base)return null;const b=base.branches?.[pending.variant||0];return b?{...base,...b}:base;}
function arcStatus(c){return Extra.arcs.map(a=>({...a,...(c.story?.arcs?.[a.id]||{step:0,route:0,lastStage:-1})}));}
function routeNote(c,e){if(!e?.arc||!e.step)return '';const first=events.find(x=>x.arc===e.arc&&x.step===0),route=c.story?.arcs?.[e.arc]?.route||0;return '前に選んだ「'+first.choices[route].label+'」の続き。';}
function eligible(e,c,r){
 if(!e.id.startsWith('novel_')&&e.tone!=='setback')return false;
 if(c.player.popularity<(e.minFame||0)||c.player.popularity>=(e.maxFame??Infinity)||c.stage<(e.minStage||0))return false;
 if(e.arc){const a=c.story?.arcs?.[e.arc]||{step:0,lastStage:-1};if(a.step!==e.step||a.lastStage>=c.stage)return false;}
 const w=e.when;return w==='any'||w==='rain'&&r.env.weather==='雨'||w==='wind'&&r.env.windSpeed>=5||w==='calm'&&r.env.weather!=='雨'&&r.env.windSpeed<=2||w==='loss'&&c.lastResult?.place>=4||w==='win'&&c.lastResult?.place===1&&!c.lastResult.dnf&&!c.lastResult.capsized||w==='lowTurn'&&c.player.stats.turn<65||w==='lowPower'&&c.player.stats.power<65||w==='g1'&&c.stage>=6||w==='g3'&&c.stage>=2&&c.stage<=5||w==='late'&&c.stage===7||w==='sg'&&c.stage===8||w==='popular'&&c.player.popularity>=70||w==='bondMentor'&&c.story.bonds.mentor>=2||w==='bondMechanic'&&c.story.bonds.mechanic>=2;}
function prepare(c,r){
 const t=ensure(c);if(t.gates.includes(r.id))return;t.gates.push(r.id);if(t.gates.length>60)t.gates.shift();t.pending=null;
 const q=t.duel;if(q?.status==='scheduled'&&q.round===c.series.round&&r.runners.some(n=>n.id===q.rivalId)){q.status='offered';q.raceId=r.id;t.pending={kind:'duel',key:r.id+':duel',id:'duel',raceId:r.id};return;}
 const draw=random(t);const recentBad=t.log.slice(-3).some(e=>eventMap[e.eventId]?.tone==='setback');
 let pool;if(draw<.03)pool=surges.filter(e=>eligible(e,c,r));else if(draw<.11&&!recentBad)pool=setbacks.filter(e=>eligible(e,c,r));else{if(draw>=.66)return;pool=events.filter(e=>!e.tone&&eligible(e,c,r));}const recent=t.log.filter(l=>l.kind==='event').slice(-6).map(l=>l.eventId);let fresh=pool.filter(e=>!recent.includes(e.id));if(fresh.length)pool=fresh;
 if(!pool.length)return;
 const weights=pool.map(e=>(e.arc?2.5:e.theme==='人気の物語'?1.7:e.rare?.22:1)/((t.seen[e.id]||0)+1));let roll=random(t)*weights.reduce((a,b)=>a+b,0),selected=pool[0];
 for(let i=0;i<pool.length;i++){roll-=weights[i];if(roll<=0){selected=pool[i];break;}}
 t.pending={kind:'event',key:r.id+':'+selected.id,id:selected.id,raceId:r.id,variant:selected.choiceSensitive?0:selected.arc&&selected.step?(t.arcs[selected.arc]?.route||0):selected.branches?selected.branches.reduce((v,b,i)=>c.player.popularity>=b.minFame?i:v,0):0};
}
function begin(c,r,api){const t=c.story;if(t?.pending&&eventMap[t.pending.id]?.tone==='setback'&&api){choose(c,t.pending.key,0,api,true);return;}if(!t?.pending||t.pending.raceId!==r.id)return;if(t.pending.kind==='duel'&&t.duel?.status==='offered')t.duel.status='declined';log(c,{kind:'skip',title:t.pending.kind==='duel'?'対決を見送った':eventMap[t.pending.id].title,note:'今回はレースの準備を優先した。'});t.pending=null;}
function effectLabel(e){const out=[];if(e.stat)out.push(D.stats[e.stat]+'が少し成長');if(e.best)out.push('得意能力が少し成長');if(e.worst)out.push('苦手能力が少し成長');if(e.gear)out.push((e.gear==='motor'?'モーター':'プロペラ')+'状態'+(e.value<0?'↓':'↑'));if(e.learn)out.push((e.learn==='motor'?'モーター':'プロペラ')+'整備経験');if(e.fame)out.push('人気'+(e.fame>0?'＋':'')+e.fame);if(e.bond)out.push(speakers[e.bond].name+'との信頼↑');if(e.money)out.push('支援金 '+e.money+'万円');if(e.cost)out.push('費用 '+e.cost+'万円 / 資金不足時はプロペラ状態↓');if(e.skill)out.push('特殊能力の伝授（今節1回まで）');return out.join(' · ');}
function choose(c,key,index,api,forced=false){
 const t=c.story?ensure(c):null,pending=t?.pending;if(!pending||pending.key!==key||![0,1].includes(index)||(!forced&&!['action','preRace'].includes(c.status))||pending.raceId!==c.series?.race?.id)return null;
 const p=c.player;
 if(pending.kind==='duel'){
  const q=t.duel;if(!q||q.status!=='offered')return null;q.status=index===0?'accepted':'declined';if(index===0)c.series.race.storyDuel={id:q.rivalId,name:q.rivalName};t.pending=null;
  const result={title:index===0?'対決成立':'今回は見送る',note:index===0?q.rivalName+'「先にゴールした方が勝ちだ。水面で会おう」':'相手はうなずいた。「次の機会を楽しみにしている」',rewards:[],kind:'duel'};
  log(c,result);return result;
 }
 const beforeFame=fame(p);const e=resolve(pending),ch=e?.choices[index];if(!ch)return null;let x=ch.effect;const rewards=[];const previousInsight=e.arc?(t.arcs[e.arc]?.insight||0):0;const denied=!!(e.choiceSensitive&&e.step===2&&x.skill&&previousInsight<1);if(denied)x={};
 let k=x.stat;if(x.best||x.worst)k=D.statKeys.slice().sort((a,b)=>x.best?p.stats[b]-p.stats[a]:p.stats[a]-p.stats[b])[0];
 if(k){const old=Math.floor(p.stats[k]),gain=(x.value||x.best||x.worst)*1.5*api.statGrowthRate(p.stats[k])*api.growthFactor(p);api.growStat(p,k,gain);rewards.push(D.stats[k]+'＋'+(Math.floor(p.stats[k])-old)+(Math.floor(p.stats[k])===old?'（端数蓄積）':''));}
 if(x.gear&&p.equipment){const g=p.equipment[x.gear],old=Math.floor(g.condition);g.condition=clamp(g.condition+x.value,25,100);const delta=Math.floor(g.condition)-old;rewards.push((x.gear==='motor'?'モーター':'プロペラ')+'状態'+(delta>=0?'＋':'')+delta);}
 if(x.learn){const k=x.learn+'Success',old=Math.floor(p.adjust[k]);p.adjust[k]=Math.min(70,p.adjust[k]+x.value*Math.pow(clamp((70-p.adjust[k])/20,0,1),2));rewards.push((x.learn==='motor'?'モーター':'プロペラ')+'成功率＋'+(Math.floor(p.adjust[k])-old)+(Math.floor(p.adjust[k])===old?'（経験蓄積）':''));}
 if(x.fame){const old=p.popularity;p.popularity=Math.max(0,p.popularity+x.fame);const v=p.popularity-old;rewards.push('人気'+(v>=0?'＋':'')+v);}
 if(x.bond){t.bonds[x.bond]++;rewards.push(speakers[x.bond].name+'との信頼↑');}
 if(x.money){p.money+=x.money;rewards.push('支援金 '+x.money+'万円');}
 if(x.cost){const paid=Math.min(p.money,x.cost);p.money-=paid;rewards.push('費用 −'+Math.floor(paid)+'万円');if(paid<x.cost){const g=p.equipment.prop;g.condition=Math.max(25,g.condition-2);rewards.push('不足分は応急処置：プロペラ状態−2');}}
 let gained=null;const skillGranted=t.skillStages.includes(c.stage)?1:0;
 if(x.skill&&api.acquire&&skillGranted>=1){rewards.push('このシリーズでは伝授済みです。次のシリーズで、再び伝授の機会があります。');}
 if(x.skill&&api.acquire&&skillGranted<1){const rarity=api.rewardRarity(p,c.stage>=8?'UR':c.stage>=6?'SSR':c.stage>=2?'SR':'R');let pool=D.abilities.filter(a=>!a.exclusive&&a.category!=='弱点'&&a.rarity===rarity&&!p.skills.includes(a.id));if(!pool.length)pool=D.abilities.filter(a=>!a.exclusive&&a.category!=='弱点'&&a.rarity===rarity);const id=pool[Math.floor(random(t)*pool.length)]?.id;if(id){gained=api.acquire(c,p,id,'物語の転機');t.skillStages.push(c.stage);rewards.push(D.abilityMap[id].name+(gained.duplicate?' 習熟':' 獲得'));}}
 if(e.arc){const previous=t.arcs[e.arc];t.arcs[e.arc]={step:e.step+1,route:e.step?previous.route:index,lastStage:c.stage,...(e.choiceSensitive?{insight:previousInsight+(ch.aligned?1:0)}:{})};}
 t.seen[e.id]=(t.seen[e.id]||0)+1;t.pending=null;const result={kind:'event',eventId:e.id,title:e.title,note:ch.reply+(denied?' まだ技を使うための理解が十分ではなく、今回は伝授に至らなかった。':''),choice:ch.label,rewards,rare:e.rare,tone:e.tone||'normal',skill:gained?.id||null,arc:e.arc||null,arcStep:e.arc?e.step+1:null,fameTier:fame(p).index>beforeFame.index?fame(p).name:null};log(c,result);return result;
}
function settle(c,r,result,api){
 const t=c.story,q=t?.duel;if(!q||q.status!=='accepted'||q.raceId!==r.id||q.stage!==c.stage)return null;
 const me=result.finish.find(n=>n.isPlayer),other=result.finish.find(n=>n.id===q.rivalId);q.status='settled';
 const won=!!me&&!!other&&!me.capsized&&!me.dnf&&!me.startFault&&me.place<other.place;
 const record=t.rivals.find(n=>n.id===q.rivalId);if(record)record[won?'wins':'losses']++;
 const z={won,rivalId:q.rivalId,rivalName:q.rivalName,money:0,skill:null,reason:!other?'対戦相手の記録なし':me.startFault?'スタート違反':me.capsized?'転覆':me.dnf?'未完走':won?'ライバルに先着':'ライバルが先着'};
 if(won){
  z.money=q.money;c.player.money=Math.round((c.player.money+q.money)*10)/10;c.player.totalEarnings=Math.round((c.player.totalEarnings+q.money)*10)/10;c.player.popularity+=3;result.popularity+=3;
  const roll=random(t),tier=c.stage<2?(roll<.95?'R':'SR'):c.stage<4?(roll<.8?'R':'SR'):c.stage<6?'SR':c.stage<8?(roll<.8?'SR':'SSR'):(roll<.9?'SSR':'UR'),rare=api.rewardRarity(c.player,tier);
  let pool=D.abilities.filter(a=>!a.exclusive&&a.category!=='弱点'&&a.rarity===rare&&!c.player.skills.includes(a.id));if(!pool.length)pool=D.abilities.filter(a=>!a.exclusive&&a.category!=='弱点'&&a.rarity===rare);
  const id=pool[Math.floor(random(t)*pool.length)]?.id;if(id){const acquired=api.acquire(c,c.player,id,'ライバル対決勝利');result.acquired.push(acquired);z.skill=id;}
 }
 log(c,{kind:'duelResult',title:won?'ライバル対決 勝利':'次こそ、先へ',note:q.rivalName+(won?'「今日は君の勝ちだ。次は譲らない」':'「また同じ水面で会おう。その時も、先は譲らない」'),rewards:won?[q.money+'万円',z.skill?D.abilityMap[z.skill].name:'', '人気＋3'].filter(Boolean):[]});
 result.duel=z;return z;
}
function finish(c){const t=ensure(c);if(!c.ending||t.closed)return;t.closed=c.ending;log(c,{kind:'chapter',title:c.ending==='sgChampion'?'水面に刻んだ名前':c.ending==='gate'?'まだ、物語の途中':'最高峰の、その先へ',note:c.ending==='sgChampion'?'表彰台から、あの横断幕が見えた。朝倉と篠原、七瀬もいる。勝ったのは一艇。でも、ここまで来たのは一人ではなかった。':c.ending==='gate'?'最高峰への条件には届かなかった。練習帳を開くと、最初の頃にはできなかった動きが何度も書かれている。朝倉が隣に座った。「悔しいな。落ち着いたら、次の練習を考えよう」':'最高峰の水面から戻ると、篠原はいつものように艇を受け止めた。「次は、どんな走りにしようか」物語は、まだ続いている。'});}
function valid(t){
 const str=(s,n)=>typeof s==='string'&&s.length<=n,num=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b,id=s=>str(s,110)&&/^[a-zA-Z0-9_:-]+$/.test(s);
 if(t?.skillStages&&(!Array.isArray(t.skillStages)||t.skillStages.length>9||new Set(t.skillStages).size!==t.skillStages.length||!t.skillStages.every(v=>num(v,0,8))))return false;
 if(t?.arcs&&(typeof t.arcs!=='object'||Array.isArray(t.arcs)||!Object.entries(t.arcs).every(([k,a])=>Extra.arcs.some(x=>x.id===k)&&a&&num(a.step,1,3)&&num(a.route,0,1)&&num(a.lastStage,0,8)&&(a.insight===undefined||num(a.insight,0,a.step)))))return false;
 if(t?.pending&&('variant' in t.pending)&&(!num(t.pending.variant,0,1)||t.pending.variant>0&&!eventMap[t.pending.id]?.branches?.[t.pending.variant]))return false;
 if(!t||('closed' in t&&!['sgChampion','sgFinished','gate'].includes(t.closed))||t.version!==1||!num(t.seed,0,4294967295)||!num(t.serial,0,2000)||!Array.isArray(t.chapters)||t.chapters.length>9||!t.chapters.every(v=>num(v,0,8))||new Set(t.chapters).size!==t.chapters.length||!Array.isArray(t.gates)||t.gates.length>60||!t.gates.every(id)||!t.seen||!Object.entries(t.seen).every(([k,v])=>eventMap[k]&&num(v,0,1000))||!t.bonds||!['mentor','mechanic'].every(k=>num(t.bonds[k],0,1000))||!Array.isArray(t.shown)||t.shown.length>100||!t.shown.every(s=>str(s,150))||!Array.isArray(t.rivals)||t.rivals.length>9||!t.rivals.every(r=>id(r.id)&&str(r.name,30)&&num(r.wins,0,9)&&num(r.losses,0,9)&&num(r.met,0,8)))return false;
 if(!Array.isArray(t.log)||t.log.length>72||!t.log.every(l=>num(l.index,1,2000)&&num(l.stage,0,8)&&['chapter','event','duel','duelResult','skip'].includes(l.kind)&&str(l.title,80)&&str(l.note,3000)&&(!l.rewards||Array.isArray(l.rewards)&&l.rewards.length<=6&&l.rewards.every(s=>str(s,100)))))return false;
 if(t.pending&&(!['duel','event'].includes(t.pending.kind)||!id(t.pending.key)||!id(t.pending.raceId)||!(t.pending.kind==='duel'?t.pending.id==='duel':eventMap[t.pending.id])))return false;
 const q=t.duel;if(q&&(!num(q.stage,0,8)||!num(q.round,1,4)||!['scheduled','offered','accepted','declined','settled'].includes(q.status)||!id(q.rivalId)||!str(q.rivalName,30)||!num(q.money,0,150)||(q.raceId!==null&&!id(q.raceId))||!t.rivals.some(n=>n.id===q.rivalId)))return false;
 return true;
}
function validJournal(j){return !!j&&valid({version:1,seed:0,serial:2000,chapters:[],gates:[],seen:{},bonds:{mentor:0,mechanic:0},pending:null,rivals:j.rivals,duel:null,log:j.log,shown:[],arcs:j.arcs});}
const API={chapter,stageName,Extra,fame,resolve,arcStatus,routeNote,validJournal,finish,speakers,chapters,events,eventMap,hash,ensure,series,lineUp,eligible,prepare,begin,choose,settle,valid,effectLabel};
root.KM_STORY=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

