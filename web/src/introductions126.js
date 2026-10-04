
/* V126: first encounters for recurring supporting characters. No DOM or RNG. */
(function(root){'use strict';
const definitions={
 asakura:{role:'mentor',names:['朝倉'],body:[
  '朝倉と初めて話したのは、練習を終えて艇を引き上げていた時だった。隣で支度をしていた先輩選手が、手を貸してくれた。',
  '朝倉「朝倉だ。ここの練習にはよく来ている。困ったら声をかけてくれ」',
  '主人公は名乗って礼を言った。朝倉は、同じ水面で練習する先輩選手だ。',
  'それから朝倉は、練習の合間に声をかけてくれるようになった。日々の走りを見守ってくれる、顔なじみの先輩だ。'
 ]},
 shinohara:{role:'mechanic',names:['篠原'],body:[
  '篠原は、機材の点検や調整の相談に乗る整備士だ。最初に作業台を訪ねた時、手を止めてこちらへ向き直った。',
  '篠原「整備士の篠原だ。機材で気になることがあったら、走った時の感触も一緒に聞かせてくれ」',
  '主人公「よろしくお願いします。まだ、どこから説明すればいいかも迷っていて」',
  '篠原は「分かる所からでいい」と記録を開いてくれた。それ以来、主人公も乗った感触を言葉にして相談するようになった。'
 ]},
 nanase:{role:'manager',names:['七瀬'],body:[
  '七瀬は、出走の手続きや遠征の予定を支える担当者だ。最初に事務所で挨拶をした時も、主人公の書類を一緒に確認してくれた。',
  '七瀬「担当の七瀬です。出走の手続きや遠征の予定を、一緒に確認していきます」',
  '主人公「手続きで分からないことも多いので、助かります。よろしくお願いします」',
  '分からないことは、先に聞いてほしい。七瀬のその言葉に、主人公は少し肩の力を抜けた。以来、予定を相談する相手になっている。'
 ]},
 natsu:{role:'fan',names:['なつ','ナツ'],body:[
  'なつは、地元の仲間とレースを見に来る応援団の一人だ。最初に声をかけてくれたのは、選手紹介を終えた観客通路だった。',
  'なつ「なつです。地元の仲間と、ここのレースを見に来ています」',
  '主人公も名乗って足を止めた。なつは出走表を開き、どの走りを見ていたかを、少し照れながら話してくれた。',
  '着順だけでなく、走りを見てくれた人がいる。その挨拶をきっかけに、なつとは会場で短く言葉を交わすようになった。'
 ]},
 hiiragi:{role:'press',names:['柊'],body:[
  '柊は、レースや選手の準備を取材する記者だ。初めて取材を申し込んだ時、名刺を渡し、今は話せるかと先に確かめてくれた。',
  '柊「レースを取材している柊です。準備の邪魔にならない範囲で、お話を聞かせてもらえますか」',
  '主人公「長くは取れませんが、少しなら。よろしくお願いします」',
  '答えにくいことまで無理に話さなくていい、と柊は付け加えた。それ以来、主人公は取材でも、自分の言葉で走りを振り返っている。'
 ]}
};
const ids=Object.keys(definitions),roles=Object.fromEntries(ids.map(id=>[definitions[id].role,id]));
const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x),unique=a=>new Set(a).size===a.length;
const sceneKey=s=>typeof s==='string'&&s.length>0&&s.length<=200;
function valid(t){return plain(t)&&Object.keys(t).every(k=>['version','known','scenes'].includes(k))&&t.version===1&&Array.isArray(t.known)&&t.known.length<=ids.length&&unique(t.known)&&t.known.every(id=>ids.includes(id))&&Array.isArray(t.scenes)&&t.scenes.length<=300&&unique(t.scenes.map(s=>s?.key))&&t.scenes.every(s=>plain(s)&&Object.keys(s).every(k=>['key','ids'].includes(k))&&sceneKey(s.key)&&Array.isArray(s.ids)&&s.ids.length>0&&s.ids.length<=ids.length&&unique(s.ids)&&s.ids.every(id=>ids.includes(id)));}
function personId(person){const id=typeof person==='string'?person:person?.id;return ids.includes(id)?id:roles[id]||null;}
function mentioned(scene){const text=(Array.isArray(scene?.body)?scene.body:[scene?.body]).join('\n'),found=new Set(),person=personId(scene?.person);if(person)found.add(person);for(const id of ids){const d=definitions[id];if(d.names.some(name=>name==='なつ'?/なつ(?=から|さん|ちゃん|[「はがのにもとへを。、！？\s]|$)/u.test(text):text.includes(name)))found.add(id);}return ids.filter(id=>found.has(id));}
function legacyKnown(c,eventMap){const found=new Set(),t=c.story||{},book=c.development?.readers||{};for(const [id,count] of Object.entries(t.seen||{})){const e=eventMap?.[id];if(count>0&&e&&e.tone!=='setback'&&roles[e.speaker])found.add(roles[e.speaker]);}
 for(const key of Object.keys(book)){if(!key.startsWith('dialogue118:event:'))continue;for(const e of Object.values(eventMap||{}))if(key.endsWith(':'+e.id)&&roles[e.speaker])found.add(roles[e.speaker]);}
 // Romance progress proves an earlier personal conversation, including imported
 // future-compatible records. A mere encounter notice does not prove a meeting.
 if((c.bonds?.heroines?.natsu?.step||0)>0)found.add('natsu');return ids.filter(id=>found.has(id));}
function ensure(c,{legacy=false,eventMap}={}){if(!c?.story)return null;if(!c.story.introductions)c.story.introductions={version:1,known:legacy?legacyKnown(c,eventMap||root.KM_STORY?.eventMap):[],scenes:[]};return c.story.introductions;}
function known(c,id){return !!c?.story?.introductions?.known.includes(personId(id)||id);}
function isRecord(sc,record){return !!record||!!sc?.record||!!sc?.registry;}
function prepare(c,sc,{book={},record=false}={}){
 if(!c?.story||!sc||isRecord(sc,record)||!sceneKey(sc.key))return {scene:sc,changed:false};
 if(sc._introductions126)return {scene:sc,changed:false};
 const existed=!!c.story.introductions,t=ensure(c),people=mentioned(sc);let changed=!existed;
 let entry=t.scenes.find(s=>s.key===sc.key);
 if(!entry){
  const missing=people.filter(id=>!t.known.includes(id));
  // Older interrupted scenes already have authored page numbers. Treat their
  // displayed character as familiar and preserve every original page offset.
  if(Object.prototype.hasOwnProperty.call(book,'dialogue118:'+sc.key)){for(const id of missing)t.known.push(id);return {scene:sc,changed:changed||missing.length>0};}
  if(!missing.length)return {scene:sc,changed};
  // There are fewer than 300 eligible live conversations in one career. Avoid
  // deleting old anchors: dropping one would move a saved reader bookmark.
  if(t.scenes.length>=300)return {scene:sc,changed};
  entry={key:sc.key,ids:missing};t.scenes.push(entry);changed=true;
 }
 const Dialogue=root.KM_DIALOGUE||(typeof require==='function'?require('./dialogue.js'):null);
 const intro=[],marks=[];let pageCount=0;
 for(const id of entry.ids){const lines=definitions[id].body;intro.push(...lines);pageCount+=Dialogue?Dialogue.pages(lines).length:lines.length;marks.push({id,through:pageCount-1});}
 const body=[...intro,...(Array.isArray(sc.body)?sc.body:[sc.body])];
 return {scene:{...sc,body,_introductions126:{key:sc.key,marks}},changed};
}
function read(c,sc,pageIndex){const meta=sc?._introductions126,t=c?.story?.introductions;if(!meta||!t||!Number.isInteger(pageIndex)||pageIndex<0)return false;const entry=t.scenes.find(s=>s.key===meta.key);if(!entry)return false;let changed=false;for(const mark of meta.marks){if(entry.ids.includes(mark.id)&&pageIndex>=mark.through&&!t.known.includes(mark.id)){t.known.push(mark.id);changed=true;}}return changed;}
const API={definitions,ids,valid,ensure,known,mentioned,prepare,read,legacyKnown};root.KM_INTRODUCTIONS126=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);

