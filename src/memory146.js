/* V146: grounded references stored with the scene; recap never advances state. */
(function(root){'use strict';
const Data=root.KM_MEMORY_DATA146||(typeof require==='function'?require('./memory-data146.js'):null);
const S=root.KM_SCENE131||(typeof require==='function'?require('./scene131.js'):null);
const P=root.KM_PRACTICE133||(typeof require==='function'?require('./practice133.js'):null);
const actors={light:'father',back:'kanato',shore:'sae',recovery:'soma'},names={light:'父',back:'奏斗',shore:'紗枝',recovery:'相馬'};
const places={light:'工房',back:'映像室',shore:'港の食堂',recovery:'艇庫'};
const roleSet=['support','boundary','consult','invite','promise'];
function ref(source,actor,role,status,usedIn){return {version:1,source,actors:['player',actor],role,status,usedIn};}
function valid(m){if(m===undefined)return true;return !!m&&m.version===1&&Object.keys(m).every(k=>['version','source','actors','role','status','usedIn'].includes(k))&&['source','usedIn'].every(k=>typeof m[k]==='string'&&/^[a-z0-9:_-]{1,100}$/.test(m[k]))&&Array.isArray(m.actors)&&m.actors.length===2&&m.actors[0]==='player'&&[...Object.keys(Data.heroines),...Object.keys(Data.rivals),...Object.values(actors)].includes(m.actors[1])&&roleSet.includes(m.role)&&['agreed','practiced','completed'].includes(m.status);}
function heroineMoment(c,id,step){
 const q=c.bonds?.heroines?.[id],chapter=step-2,m=q?.memories133?.find(x=>x.chapter===chapter);
 if(![4,6].includes(step)||!q||q.failed||q.step!==step||!m||q.choices[chapter]!==m.option)return null;
 const d=Data.heroines[id]?.[chapter]?.[m.option],source='heroine:'+id+':'+chapter+':'+m.option;
 if(!d||q.interludes142?.some(e=>e.memory146?.source===source))return null;
 return {title:d[0],body:[S.bridge('それぞれの日を過ごし、次に会った時','二人の時間'),...d.slice(2)],memory146:ref(source,id,d[1],'agreed','moment142:'+id+':'+step)};
}
function main(t,e){
 if(!e.edition146||!actors[t.arc])return null;
 const at=t.entries.indexOf(e),prior=t.entries.slice(0,at);
 if(prior.some(x=>!x.read))return null;
 const p=prior.filter(x=>x.choiceMode==='paths133'&&x.decision).at(-1);
 if(!p)return null;
 if(prior.some(x=>x.memory146?.source==='campaign:'+p.id+':'+p.decision.index))return null;
 const mode=p.decision.index,task=e.practice133,matched=task?.source===p.id&&task.mode===mode;
 const status=matched&&task.completed?'completed':matched&&task.records?.length?'practiced':'agreed';
 const line=status==='completed'?'決めたことを試し終えた記録も、分からなかった所も持ってきた。結果のいい所だけを選んで話すつもりはなかった。':status==='practiced'?'試した所には記録があり、まだ空いている欄もある。出来たことと、これからのことを分けて話そうと思った。':'前に決めたことは、まだ確かめきれていない。済ませたような顔はせず、今の所まで話そうと思った。';
 // Unattempted tasks cannot acquire completed experiments just by being read.
 const body=status!=='completed'?[
  names[t.arc]+'は、主人公が広げた紙の空欄を指した。',
  names[t.arc]+'「今日は、どこから話そうか」',
  '主人公は、前に「'+P.spec(t.arc,p.choiceSpec)[mode]+'」と答えた時のことを思い出した。',
  '主人公（心の声）「やっていない所まで、話を合わせなくていい。ここからどうするかは、自分で決める」'
 ]:Data.main[t.arc][mode].slice();
 return {body:[S.bridge('前の約束を思い出して',places[t.arc]),line,...body,S.bridge('思い出から目を上げて','今回の話へ')],memory146:ref('campaign:'+p.id+':'+mode,actors[t.arc],'promise',status,'campaign:'+e.id)};
}
function rival(c,sc,index){
 const r=c.development?.rival,q=r?.drama,p=q?.entries?.[0];
 if(index!==3||q.version!==2||q.legacy130||p?.legacy130||!p?.decision||!Data.rivals[r.cast]?.[p.decision.index])return {prose:sc};
 return {prose:{...sc,body:[S.bridge('初めて話した頃から、いくつかの出走を経て','練習後の艇庫'),...Data.rivals[r.cast][p.decision.index],S.bridge('話が今日の練習に戻って','艇庫'),...sc.body]},memory146:ref('rival:'+r.cast+':0:'+p.decision.index,r.cast,'consult','agreed','rival:'+r.cast+':3')};
}
function validHeroine(m,q,id,step){if(!valid(m))return false;if(m===undefined)return true;const ch=step-2,record=q.memories133?.find(x=>x.chapter===ch);return [4,6].includes(step)&&!!record&&q.choices?.[ch]===record.option&&m.source==='heroine:'+id+':'+ch+':'+record.option&&m.actors[1]===id&&m.usedIn==='moment142:'+id+':'+step&&m.role===Data.heroines[id]?.[ch]?.[record.option]?.[1]&&m.status==='agreed';}
function validMain(m,t,e){if(!valid(m))return false;if(m===undefined)return true;const prior=t.entries.slice(0,t.entries.indexOf(e)),p=prior.find(x=>x.choiceMode==='paths133'&&x.decision&&m.source==='campaign:'+x.id+':'+x.decision.index);if(!p||!p.read||prior.some(x=>!x.read)||!e.edition146||!e.connection142)return false;const task=e.practice133,status=task?.source===p.id&&task.mode===p.decision.index?(task.completed?'completed':task.records?.length?'practiced':'agreed'):'agreed';return m.actors[1]===actors[t.arc]&&m.usedIn==='campaign:'+e.id&&m.role==='promise'&&m.status===status;}
function validRival(m,q,cast,e){if(!valid(m))return false;if(m===undefined)return true;const p=q.entries[0];return e.index===3&&q.version===2&&!q.legacy130&&!p.legacy130&&!!p.decision&&m.source==='rival:'+cast+':0:'+p.decision.index&&m.actors[1]===cast&&m.usedIn==='rival:'+cast+':3'&&m.role==='consult'&&m.status==='agreed';}
function recap(c){
 if(!c)return {resume:null,groups:[]};
 const groups=[],add=(label,items)=>{if(items.length)groups.push({label,items});};
 add('本編', (c.campaign?.entries||[]).filter(e=>e.read&&e.prose).slice(-2).map(e=>({title:e.prose.title,detail:e.decision&&e.choiceMode==='paths133'?'選んだ返答：'+P.spec(c.campaign.arc,e.choiceSpec)[e.decision.index]:'読了した場面'})));
 // Bond log is written only after the choice; saved labels are never recreated.
 add('二人の会話',(c.bonds?.log||[]).filter(e=>e.scene130&&e.choice).slice(-2).map(e=>({title:e.scene130.title||e.title||'二人の会話',detail:'選んだ返答：'+e.choice})));
 const moments=Object.values(c.bonds?.heroines||{}).flatMap(q=>(q.interludes142||[]).filter(e=>e.read).map(e=>({title:e.title,detail:'読了した日常の一場面'}))).slice(-2);
 add('日常',moments);
 add('仲間との出来事',(c.journey134?.daily||[]).filter(e=>e.read).slice(-2).map(e=>({title:e.title,detail:'読了した場面'})));
 const r=c.development?.rival;add('ライバル',(r?.drama?.entries||[]).filter(e=>e.decision&&e.prose).slice(-2).map(e=>({title:e.prose.title,detail:'選んだ返答：'+(e.choiceLabels130?.[e.decision.index]||'記録のある返答')})));
 const f=c.flow131,a=f?.active;
 // No scene generation, clock, save, read flag or RNG access in this view.
 let resume=null;
 if(a){let title='読みかけの場面';if(f.reply)title=f.reply.title||'返答の続き';else if(a.kind==='campaign')title=c.campaign?.entries.find(e=>e.id===a.id)?.prose?.title||title;else if(a.kind==='heroine')title=c.bonds?.pending?.scene142?.title||title;else if(a.kind==='moment142')title=c.bonds?.heroines?.[a.id]?.interludes142?.find(e=>e.step===a.step)?.title||title;
  resume={title,detail:f.reply?'選択後の返答の途中です。保存したしおりから続きます。':'本文としおりを保ったまま、続きから読めます。'};}
 return {resume,groups};
}
const api={Data,valid,validHeroine,validMain,validRival,heroineMoment,main,rival,recap};root.KM_MEMORY146=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
