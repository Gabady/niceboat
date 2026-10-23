/* V134: bounded, saved opportunities and memories. No RNG, timers, or race physics changes. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x));
const bridge=(when,place,caption='')=>'◇場面◇'+JSON.stringify({when,place,caption});
const ensure=c=>c.journey134||(c.journey134={version:1,offers:[],duels:[],daily:[],ending:null});
const met=(c,id)=>!!c.bonds?.heroines?.[id]?.met;
const good=z=>!z.startFault&&!z.capsized&&!z.dnf;
const last=c=>c.journey134?.duels.at(-1)||null;
function prepare(c,E){
 const j=ensure(c),r=c.series?.race;if(!r||j.offers.some(x=>x.raceId===r.id))return null;
 const m=last(c),mentor=E.Cast.introduced(c)?E.Cast.map[c.cast.mentor.id]:null;
 let kind,key,source=null;
 // Offers use conditions already fixed for this race; opening a screen never rerolls them.
 if(mentor&&c.series.round===3){kind='mentor';key=mentor.key;}
 else if((r.env.weather==='雨'||r.env.windSpeed>=6)&&c.series.round%2===1){kind='weather';key=r.env.windSpeed>=6?'power':'turn';}
 else if(m&&m.outcome==='behind'&&c.series.round%2===0){kind='rival';key=m.key;source=m.raceId;}
 if(!kind)return null;
 const q={raceId:r.id,stage:c.stage,kind,key,sourceRaceId:source,used:false,status:null};j.offers.push(q);return q;
}
function offer(c){const r=c.series?.race;return c.journey134?.offers.find(x=>x.raceId===r?.id)||null;}
function description(c,q,E){
 const person=q.kind==='mentor'?E.Cast.map[c.cast.mentor.id]:E.Development.rival(c);
 const titles={rival:'前の対戦を、もう一度',weather:'今日の水面で試す',mentor:'師匠の確認走'};
 const reason=q.kind==='rival'?person.name+'と前の対戦記録を並べた。今日は'+D.stats[q.key]+'を一つ確かめる時間がある。':q.kind==='weather'?(c.series.race.env.weather==='雨'?'雨が水面を叩いている。':'風が強まり、波の形が変わった。')+'この水面を見ながら、'+D.stats[q.key]+'の準備を試せる。':person.name+'が練習ノートを返してきた。「今日は一つだけ見よう。教わった後、自分で試せるか」';
 return {title:titles[q.kind],reason,task:E.Development.paths[q.key].task};
}
function train(c,E){
 const q=offer(c);if(!q||q.used||c.status!=='action'||c.series.race.drive||c.series.race.done)return null;
 const z=E.train(c,q.key,'focus',{method:'opportunity',multiplier:1.1});if(!z)return null;
 q.used=true;const path=E.Development.ensure(c).paths[q.key];path.hints=Math.min(12,path.hints+.4*c.series.action.effectScale);
 c.development.training.push({key:q.key,method:'solo',raceId:q.raceId});c.development.training=c.development.training.slice(-100);
 const learned=E.Development.learned(c,q.key,E);if(learned)c.series.action.logs.push(D.abilityMap[learned.id].name+'を習得');
 const text=description(c,q,E).title+'：'+D.stats[q.key]+'を確認した。続きは今回の一走で。';c.series.action.logs.push(text);E.syncPlayerSnapshot(c);return {...z,text,learned};
}
const voices={
 haruto:{ahead:'最後の直線、見えてたのに届かなかった。次はあそこで追いつく。',behind:'先には出たけど、まだ並べる区間はあった。そこを切り取って見よう。',again:'この前も直線の映像を止めたな。今度は出口から流してみよう。'},
 ren:{ahead:'先に出口を使われた。悔しいから、あの周はもう一度見る。',behind:'今日はこっちが先。入口だけ見て決めつけず、出口まで比べよう。',again:'前に見た場所だ。線を引くなら、今度は艇が抜ける所まで。'},
 izumi:{ahead:'着順表、見た。次も同じように行くと思わないでね。',behind:'今日は私が先だった。スタートだけで全部決まった、とは言わないけど。',again:'前の記録も持ってきた。印象で「また同じ」にするのはやめよう。'},
 sou:{ahead:'追いつくつもりでいたら、先にゴールされた。途中で終わった気になれないな。',behind:'追いかけてきたのは見えてた。次はどの出口から来る？',again:'ここ、前も気にしてた所だろ。前の周と、並べて見てみるか。'},
 ibuki:{ahead:'先へ行ったな。岸で平気な顔を作る方が、今日は難しい。',behind:'こっちが先だった。波のせいで片づける前に、二艇の通った所を見よう。',again:'似た場面でも水面は違う。前の走りを、そのまま重ねるなよ。'}
};
function memoryLines(c,m,E){
 const p=E.Development.rival(c),v=voices[c.development.rival.cast],q=m;
 const result=q.outcome==='void'?'主人公は着順表の失格欄を見た。今日は、先着を競う話をする気になれなかった。':q.outcome==='opponentFault'?p.name+'「今日は有効に走り切れなかった。決着の話は、次にさせて」':p.name+'「'+v[q.outcome]+'」';
 const proof=q.trained?(q.outcome==='void'?'練習した内容は残っている。ただ、今日は有効完走できなかった。実践できたと急いで結論を出すのはやめた。':q.applied===true?'練習で確かめた'+D.stats[q.key]+'について、本番の記録にも実践の目安が残っていた。':q.applied===false?'準備した'+D.stats[q.key]+'は、本番では実践の目安まで届かなかった。練習したことと、使えたことは別だった。':'練習した'+D.stats[q.key]+'を使えたかは、この走行記録では確かめられない。'):q.observed?'二人は'+q.task+'を開いた。着順だけでは、そこで何が起きたかまでは分からない。':'細かな区間の記録は残っていない。まずは出走と着順を、二人で確かめた。';
 return [bridge('同走したレースのあと','ピットの映像端末'),result,proof,q.manual?'主人公は自分が迷った場所で、映像を止めた。':'主人公は、操作の反省と準備の見直しを混同しないように、走行の記録を確かめてから次の準備欄を開いた。'];
}
function settle(c,r,z,E){
 const j=ensure(c),q=offer(c),b=r.drive?.boats.find(x=>x.isPlayer);
 if(q?.used&&q.status===null){q.status=!good(z)?'invalid':!b?'unverified':E.Development.taskMet(q.key,b,r)?'verified':'missed';z.opportunity134={title:description(c,q,E).title,key:q.key,status:q.status};}
 const p=E.Development.rival(c),other=z.finish.find(x=>x.id===p.id);if(!other||j.duels.some(x=>x.raceId===r.id))return;
 const previous=last(c),review=E.Review122.review(z,c.player),practice=c.development.training.filter(x=>x.raceId===r.id).at(-1);
 const trained=q?.used?q.kind:practice?({rival:'rival',mentor:'mentor',solo:'solo'}[practice.method]||'solo'):null,key=q?.used?q.key:practice?.key||review?.key||p.key;
 const outcome=!good(z)?'void':!good(other)?'opponentFault':z.place<other.place?'ahead':'behind';
 const m={raceId:r.id,stage:c.stage,place:z.place,other:other.place,outcome,key,task:review?.title||'出走記録',observed:!!review?.sections.length,trained,applied:trained&&good(z)&&b?E.Development.taskMet(key,b,r):null,manual:z.driving?.controlMode==='manual',repeat:!!previous&&previous.outcome==='behind'&&outcome==='behind'&&previous.key===key};
 j.duels.push(m);z.rival134=clone(m);
}
function rivalScene(c,sc){
 const m=last(c);if(!m)return sc;
 const E=root.KM_ENGINE||(typeof require==='function'?require('./script.js'):null);
 if(!E)return sc;const lines=memoryLines(c,m,E);
 if(m.repeat)lines.push(E.Development.rival(c).name+'「'+voices[c.development.rival.cast].again+'」');
 return {...sc,body:[...lines,bridge('その日の片づけが終わる頃','艇庫の通路'),...sc.body]};
}
function preface(c,E){const m=last(c),r=c.series?.race,p=E.Development.rival(c);if(!m||!r?.runners.some(x=>x.id===p.id)||m.raceId===r.id)return null;return {name:p.name,text:m.outcome==='ahead'?'前は、あなたが先着した。'+p.name+'は出走表に目を落とし、「今日はどう来る？」と尋ねた。':m.outcome==='behind'?'前は、'+p.name+'が先着した。「この前の映像、持ってきた？」と、相手から声がかかった。':'前の対戦は、有効に走り切れなかった艇があった。「今日は、二人とも最後まで」と言って、それぞれの艇へ向かった。',task:m.task};}
function dailyDefinitions(c,E){
 const r=E.Development.rival(c),n=r.name,defs=[];
 if(met(c,'mio'))defs.push({id:'interview',person:'mio',title:'答えのない見出し',body:[bridge('節間の取材日','競走場の外のベンチ'),'澪に取材の時間を聞かれ、主人公がベンチへ行くと、'+n+'が先に座っていた。','澪「二人の勝負、いい見出しが欲しいんです。でも、どっちかを引き立て役にはしたくなくて」',n+'「だったら、まだ見出しを決めないで。次はこっちが先に行くかもしれない」','主人公「そこは、こっちも譲るつもりないよ」','澪は二人の言葉を書いたあと、用意していた見出しを一本の線で消した。',bridge('取材が終わってから','バス乗り場'),'澪「原稿は今夜。試合のない日も、こっちは締め切りがあるんですよ」','二人とも黙ったので、澪が先に笑った。']});
 if(met(c,'tsumugi')&&met(c,'natsu'))defs.push({id:'cafe_map',person:'tsumugi',title:'お客さんのいない案内会',body:[bridge('紬から頼まれた休日','店の入口'),'店までの道が分かりにくい。紬の相談を受けて、なつが案内図の試し歩きをすることになった。主人公は、初めて来た客の役を頼まれていた。','なつ「こっちは近道。こっちは迷いにくい道」','紬「両方、同じ太さで描いたら迷わない？」','なつは地図を裏返した。試し歩きの前から、線を引き直すことになった。',bridge('三十分後','商店街の角'),'主人公は店の看板を見つけたのに、わざと一つ先の角まで歩いた。','紬「そこ、初めての人も通り過ぎるの。今の、助かった」','なつ「演技、上手いね。レースの道は間違えないでよ」']});
 if(met(c,'akari')&&c.campaign?.arc==='light')defs.push({id:'workshop',person:'akari',title:'返せなかった工具',body:[bridge('灯に借りた工具を返す日','工房'),'父は灯の直した工具を手に取り、握りを一度持ち替えた。','父「ここ、削らなくても使えただろう」','灯「使う人の手が、違うから」','二人とも主人公を見た。どちらに賛成するか、ではなく、持ってみろという顔だった。','主人公は柄を握り、元の置き場所へ戻しかけてやめた。今日は試してから返したい。',bridge('作業を終えた夕方','工房の流し'),'灯が工具の話を続けようとすると、父が先に手を洗い始めた。','父「腹が減った。続きは飯のあとだ」','灯は言い返しかけて、笑って工具をしまった。']});
 defs.push({id:'lunch',person:r.id,title:'決められない昼ごはん',body:[bridge('節間の昼休み','競走場近くの食堂'),'映像を見た帰りに、'+n+'と食堂へ寄った。卓上のメニューだけが、なかなか閉じられない。',n+'「走る前ならすぐ決めるんだけどな」','主人公「休みの日まで、正解を探さなくていいだろ」','そう言った自分も、隣の定食を見て注文を変えかけた。','店員が来ると、二人は慌てて別々の料理を指した。',bridge('食べ終えてから','店の外'),n+'は「次はあっち」と店内を指した。次に食べるものだけは、もう決まったらしい。']});
 const friend=Object.entries(c.bonds?.heroines||{}).find(([id,q])=>q.met&&q.failed&&String(q.reason||'').includes('友人'));
 if(friend){const h=E.Bonds.B.map[friend[0]],call=h.name;defs.unshift({id:'friend_'+h.id,person:h.id,title:'いつもの話の続き',body:[bridge('友人として話した日から、しばらくして','港の待合所'),call+'から、次の出走日を尋ねる連絡が来た。改まった言葉はついていなかった。','主人公は日付を送り、相手の近況も聞いた。返ってきたのは、自分のレースとは関係のない、忙しい一日の話だった。',call+'「そっちの予定だけ聞いて終わるつもりだったのに、私の方が長くなったね」','主人公「聞きたかったから、ちょうどいい」','別れ際に、次に会う日までは決めなかった。話したいことができたら、また連絡すればいい。']});}
 if(met(c,'nagi'))defs.push({id:'lost_list',person:'nagi',title:'忘れ物を取りに',body:[bridge('凪に頼まれた節間の午後','休憩室'),'凪が忘れた手帳を、主人公と'+n+'で探していた。本人は何度も、同じ引き出しを開ける。',n+'「さっきもそこ、見たよ」','凪「分かってる。でも、そこにあってほしいの」','手帳は椅子の背に掛けた上着から出てきた。開いたページには、忘れ物を防ぐための一覧があった。','凪は先に笑った。二人も、ようやく笑えた。']});
 if(met(c,'kanade'))defs.push({id:'sound',person:'kanade',title:'録音に入った笑い声',body:[bridge('奏に録音を頼まれた帰り道','港の歩道'),'水の音を録りたいという奏に付き合い、主人公は'+n+'と手すりから離れて立っていた。','奏「今から十秒、何も言わないで」','十秒がやけに長い。隣から小さく腹の音がして、主人公の肩が揺れた。','奏は録音を止めず、自分まで笑い出した。',bridge('再生してみると','港のベンチ'),'奏「これは別の名前で残す。水の音は、もう一回」','二人は今度こそ黙った。遠くのエンジン音が、さっきよりはっきり聞こえた。']});
 if(met(c,'mizuki'))defs.push({id:'schedule',person:'mizuki',title:'空いていない日',body:[bridge('節間、次の予定を決める頃','競走場の掲示板前'),'瑞希と'+n+'は、それぞれの予定表を広げていた。三人で映像を見ようという話が、なかなかまとまらない。','瑞希「その日は私が走る。そっちが空いてても、私が空いてない」','主人公は自分の予定だけに丸をつけていた紙を折り直した。',n+'「じゃあ映像だけ先に送る。感想は、返せる日に」','瑞希「それならできる。ちゃんと見るから、急かさないで」','集まる日は決まらなかった。それでも、話は一つ先へ進んだ。']});
 if(c.cast?.mentor&&E.Cast.introduced(c)){const m=E.Cast.map[c.cast.mentor.id];defs.push({id:'mentor_rival',person:m.id,title:'しまい方にも癖がある',body:[bridge('合同練習が終わった日','艇庫'),m.name+'が工具の数を数えている横で、'+n+'が台車の向きを直した。',n+'「先輩、こっち向きの方が出しやすくないですか」',m.name+'「出す時はな。今日は戻す所までやろう」','主人公が間に入る前に、二人で台車を動かし始めた。意外に、言い争いにはならなかった。','帰る頃には通路が少し広くなっていた。誰が折れたのかは、聞かないでおいた。']});}
 const extra=(root.KM_DAYS143||(typeof require==='function'?require('./days143.js'):null)).available(c,E);return [...extra,...defs];
}
function collectDaily(c,E){
 if(c.ending||c.stage<1||c.stats.races<1)return null;const j=ensure(c);
 if(j.daily.some(x=>x.stage===c.stage))return null;
 const eligible=dailyDefinitions(c,E).filter(x=>!j.daily.some(y=>y.id===x.id));const d=eligible.length?eligible[(c.stage-1)%eligible.length]:null;if(!d)return null;
 const person=E.Bonds.B.map[d.person]||E.Cast.map[d.person]||E.Development.rival(c);
 const e={...d,person:{id:person.id,name:person.name,portraitKey:person.portraitKey||''},stage:c.stage,read:false};j.daily.push(e);return e;
}
function scene(c,id){const j=c.journey134,e=id==='ending'?j?.ending:j?.daily.find(x=>x.id===id);return e?{key:'journey134:'+c.player.id+':'+id,title:e.title,body:e.body.slice(),person:e.person||null,background:'harbor',choices:[]}:null;}
function mark(c,id){const j=c.journey134,e=id==='ending'?j?.ending:j?.daily.find(x=>x.id===id);if(e)e.read=true;}
function retrospective(c,E){
 const j=ensure(c);if(j.ending)return j.ending;
 const p=c.campaign?.task133,actor=E.Development.actors[c.campaign?.arc||'light'];
 const body=[bridge('今回の育成を終えて','荷物をまとめた部屋'),'使い終わったノートを閉じかけて、主人公は最初のページへ戻った。書いた頃には、どの予定が残るかなんて分からなかった。'];
 if(p)body.push('最後に取り組んだのは「'+E.Practice133.arcs[p.arc].titles[p.mode]+'」。'+(p.completed?'実践した記録が、予定の横に残っている。':'埋まらなかった欄もある。次に持っていく課題として、そのまま残した。'));
 const promises=(c.affinity?.requests||[]).filter(x=>x.type==='race'&&['fulfilled','missed','accepted'].includes(x.status));
 if(promises.length){const q=promises.at(-1),h=E.Bonds.B.map[q.heroine];body.push(h.name+'と交わした、'+q.target+'着以内の約束。'+(q.status==='fulfilled'?'その結果を報告した日の言葉を、主人公は覚えている。':q.status==='missed'?'届かなかった結果も、話すところまでが約束だった。':'返事はしたが、まだ結果を報告できていない。'));}
 const trained=D.statKeys.map(key=>({key,count:c.development.training.filter(x=>x.key===key).length})).sort((a,b)=>b.count-a.count)[0];
 if(trained?.count)body.push('練習欄でいちばん多かったのは'+D.stats[trained.key]+'。'+trained.count+'回ぶんの印を指でたどった。今の得意不得意だけで決まった選び方ではない。');
 const m=last(c);if(m){const r=E.Development.rival(c);body.push(bridge('ノートに挟んだ着順表','最後に同走した日の記録'),r.name+'との最後の同走は、自分が'+m.place+'着、相手が'+m.other+'着。'+(m.outcome==='void'||m.outcome==='opponentFault'?'有効に走り切れなかった艇があり、この数字だけで勝負を語れなかった。':m.outcome==='ahead'?'先へ出た嬉しさと、次に追われる緊張が一緒に残った。':'届かなかった。その先を見たくて、映像を持ち帰った。'));}
 const relations=Object.entries(c.bonds?.heroines||{}).filter(([,q])=>q.met);
 if(relations.length){body.push(bridge('片づけを中断して','連絡先を開いた画面'));for(const [id,q] of relations){const h=E.Bonds.B.map[id];body.push(h.name+'――'+(c.bonds.partner===id&&q.dated?'恋人として迎えた日々。次の予定は、相手の都合も聞いてから決める。':q.failed&&String(q.reason||'').includes('友人')?'友人として話すようになった。自分の出走がない日の近況も、また聞きたい。':q.failed?'言えたことと、言えなかったことがある。今は、その距離も受け止めておく。':'出会いから'+q.step+'話ぶんの時間。話しかける前に迷った頃のことも、まだ覚えている。'));}}
 const seen=j.daily.filter(x=>x.read);if(seen.length)body.push('「'+seen.at(-1).title+'」。レースの外にも、持ち帰る話ができた。');
 body.push(bridge('翌朝','家を出る前'),actor.name+'「次は、何を試す？」','主人公はすぐには答えず、ノートの空いたページを開いた。今度は別の練習かもしれない。同じ相手に、違う言葉を返してみるのかもしれない。');
 return j.ending={title:'持ち帰ったもの',person:actor,body,read:false};
}
function valid(j){
 if(j===undefined||j===null)return true;
 const str=(x,n=180)=>typeof x==='string'&&x.length>0&&x.length<=n,integer=(x,a,b)=>Number.isInteger(x)&&x>=a&&x<=b,unique=(xs,k)=>new Set(xs.map(x=>x[k])).size===xs.length;
 const scene=x=>x&&str(x.title,100)&&typeof x.read==='boolean'&&x.person&&str(x.person.id,100)&&str(x.person.name,40)&&typeof x.person.portraitKey==='string'&&x.person.portraitKey.length<=60&&Array.isArray(x.body)&&x.body.length>=3&&x.body.length<=40&&x.body.every(v=>str(v,1500));
 if(!j||j.version!==1||!Array.isArray(j.offers)||j.offers.length>60||!Array.isArray(j.duels)||j.duels.length>60||!Array.isArray(j.daily)||j.daily.length>8)return false;
 if(!j.offers.every(q=>q&&str(q.raceId)&&integer(q.stage,0,8)&&['rival','weather','mentor'].includes(q.kind)&&D.statKeys.includes(q.key)&&(q.sourceRaceId===null||str(q.sourceRaceId))&&typeof q.used==='boolean'&&[null,'verified','missed','invalid','unverified'].includes(q.status)&&(!q.status||q.used))||!unique(j.offers,'raceId'))return false;
 if(!j.duels.every(m=>m&&str(m.raceId)&&integer(m.stage,0,8)&&integer(m.place,1,6)&&integer(m.other,1,6)&&m.place!==m.other&&['ahead','behind','void','opponentFault'].includes(m.outcome)&&(m.outcome!=='ahead'||m.place<m.other)&&(m.outcome!=='behind'||m.place>m.other)&&D.statKeys.includes(m.key)&&str(m.task)&&typeof m.observed==='boolean'&&[null,'rival','weather','mentor','solo'].includes(m.trained)&&(m.applied===null||typeof m.applied==='boolean'&&!!m.trained)&&typeof m.manual==='boolean'&&typeof m.repeat==='boolean')||!unique(j.duels,'raceId'))return false;
 return j.daily.every(e=>scene(e)&&str(e.id,100)&&integer(e.stage,1,8))&&unique(j.daily,'id')&&unique(j.daily,'stage')&&(j.ending===null||scene(j.ending));
}
const API={ensure,prepare,offer,description,train,settle,last,preface,memoryLines,rivalScene,collectDaily,dailyDefinitions,scene,mark,retrospective,valid};root.KM_JOURNEY134=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(globalThis);
