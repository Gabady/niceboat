// Runs the actual reader renderer with data-only fixtures. CSS checks inspect
// source safeguards only: no browser layout, pointer hit-testing or device claim.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),D=require('../src/dialogue.js'),source=fs.readFileSync(path.join(root,'src/script.js'),'utf8'),htmlSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
const report={build:'123',testType:'Reader metadata and actual novelView HTML generation; static CSS inspection only',limitations:['No browser layout or screenshot verification','No actual 320px viewport, device touch, font zoom or hit-testing verification'],checks:[]};
function test(name,fn){fn();report.checks.push(name)}
const fragment=source.slice(source.indexOf('function novelView(sc){'),source.indexOf('\nfunction openNovel(sc){'));
assert.ok(fragment.includes('Dialogue.readingState'));
const helpers=source.split('\n').filter(line=>line.startsWith('const esc=')||line.startsWith('const btn=')).join('\n');
const book={},people=[{id:'guide',name:'水野 灯'}];
const context=vm.createContext({Dialogue:D,readerBook:()=>book,novelContext:sc=>({playerName:'風間',person:sc.person,people}),Bonds:{portrait:()=>'<img class="portrait-face fixture-portrait" loading="lazy" alt="人物">'},ui:{campaignPlayer:'fixture-player'},icon98:()=>'<svg class="ui-icon" aria-hidden="true"></svg>'});
vm.runInContext(helpers+'\nlet novelCurrent=null;\n'+fragment+'\nglobalThis.view=novelView;',context);
function render(sc,index=0){book[D.bookmark(sc.key)]=index;return context.view(sc)}
const base={key:'fixture',title:'読み方の確認',body:['主人公「もう一度、走ってみよう。」','水面に朝の光が差した。']};
test('しおりの名前空間と途中位置をV122から維持',()=>{assert.equal(D.bookmark('fixture'),'dialogue118:fixture');book[D.bookmark('fixture')]=1;assert.equal(D.cursor(book,D.bookmark('fixture'),2),1)});
test('最初の頁では進行数と次ボタンを示す',()=>{const r=D.readingState({index:0,total:5});assert.equal(r.pageText,'1 / 5');assert.equal(r.progress,.2);assert.equal(r.nextLabel,'次を読む');assert.equal(r.last,false)});
test('最後の通常頁は読み終える操作になる',()=>{const r=D.readingState({index:4,total:5});assert.equal(r.nextLabel,'読み終える');assert.equal(r.awaitingChoice,false);assert.match(r.nextHint,/読み終え/)});
test('返答は最終頁だけで開き、途中では後に選択があると予告',()=>{const choices=[{},{}],first=D.readingState({index:1,total:3,choices}),last=D.readingState({index:2,total:3,choices});assert.equal(first.phaseLabel,'最後に返答を選びます');assert.equal(first.awaitingChoice,false);assert.equal(last.phaseLabel,'返答を選ぶ');assert.equal(last.choiceCount,2);assert.equal(last.awaitingChoice,true)});
test('壊れた進行数と範囲外の頁を安全な範囲へ収める',()=>{let r=D.readingState({index:Infinity,total:NaN,choices:null});assert.deepEqual([r.current,r.total,r.choiceCount],[1,1,0]);r=D.readingState({index:99,total:3});assert.equal(r.current,3);assert.equal(D.readingState({index:-5,total:3}).current,1)});
test('話者区分を色に加えて文字で示す',()=>{assert.equal(D.describe('主人公「行こう。」',{playerName:'風間'}).roleLabel,'あなた');assert.equal(D.describe('灯「待ってる。」').roleLabel,'会話');assert.equal(D.describe('波の音が響く。').roleLabel,'情景')});
test('通常頁の実マークアップに進行・話者・次・中断がある',()=>{const h=render(base);assert.match(h,/<progress value="1" max="2" aria-label="会話の進み具合"/);assert.match(h,/novel-speaker-role123">あなた/);assert.match(h,/novel-close[^>]*>中断して戻る/);assert.match(h,/class="btn primary novel-next123"/);assert.match(h,/data-action="novelPrev"[^>]* disabled/);assert.equal((h.match(/data-action="novelNext"/g)||[]).length,2);assert.doesNotMatch(h,/novel-status123/)});
test('最終通常頁の本文と次操作が同じ完了ラベルになる',()=>{const h=render(base,1);assert.match(h,/aria-label="読み終える"/);assert.match(h,/data-action="novelNext"[^>]*>読み終える/);assert.match(h,/<progress value="2" max="2"/)});
test('選択肢の前には本文のみで返答ボタンを出さない',()=>{const h=render({...base,choices:[{label:'聞く',action:'storyChoice',value:'one'}]});assert.match(h,/最後に返答を選びます/);assert.doesNotMatch(h,/data-action="storyChoice"/)});
test('最終選択頁は非クリック本文と番号付きの返答を示す',()=>{const h=render({...base,choices:[{label:'もう一度、今日の走りを一緒に振り返る。'.repeat(4),note:'次の会話へ <進む>',action:'storyChoice',value:'1'},{label:'今は休む',action:'storyChoice',value:'2',disabled:true}]},1);assert.match(h,/<div role="group" aria-label="返答を選ぶ前の文章" class="novel-box/);assert.doesNotMatch(h,/data-action="novelNext"/);assert.equal((h.match(/class="novel-choice-index123"/g)||[]).length,2);assert.match(h,/次の会話へ &lt;進む&gt;/);assert.match(h,/data-action="storyChoice" data-value="2" disabled/);assert.match(h,/2つの選択肢/)});
test('章一覧を持つ会話にも本文と履歴と前操作を維持',()=>{const h=render({...base,finish:'campaignFinish'});for(const action of ['campaignChapters','novelHistory','novelPrev','novelExit'])assert.ok(h.includes('data-action="'+action+'"'))});
test('不明な話者に別の人物の肖像を当てない',()=>{const h=render({...base,person:people[0],body:['知らない選手「明日も走る。」']});assert.doesNotMatch(h,/fixture-portrait/);assert.match(h,/知らない選手/)});
test('長い発話を分割しても本文を失わない',()=>{const text='艇の音が近づく。'.repeat(45),pages=D.pages('主人公「'+text+'」');assert.ok(pages.length>1);assert.equal(pages.map(p=>D.parse(p).text).join(''),text)});
const css=htmlSource.split('<style>')[1].split('</style>')[0],styles=css.slice(css.indexOf('/* V123: clear destinations'));
function rule(selector){const prefix=selector+'{',at=styles.indexOf(prefix);assert.ok(at>=0,'Missing CSS: '+selector);return styles.slice(at+prefix.length,styles.indexOf('}',at))}
test('会話本文領域は縮小と縦スクロールを明示し固定切り捨てを避ける',()=>{const body=rule('.reading-novel .novel-stage .novel-bottom');assert.match(body,/flex:0 1 auto/);assert.match(body,/min-height:0/);assert.match(body,/overflow-y:auto/);const stage=rule('.reading-novel .novel-stage');assert.match(stage,/height:100vh;height:100svh;height:100dvh/);assert.match(stage,/display:flex/);assert.match(rule('.reading-novel .novel-stage .novel-cast'),/min-height:0/)});
test('狭幅・低画面高・大文字・高コントラスト用のルールを持つ',()=>{assert.match(styles,/@media\(max-width:380px\)/);assert.match(styles,/@media\(max-height:650px\)/);assert.match(styles,/\.reading-novel\.large-type \.novel-text\{font-size:21px/);assert.match(styles,/\.high-contrast \.novel-choice small\{color:#24434c!important/);assert.match(styles,/\.large-type:not\(\.in-race\) #app \.app-dock small.current-label123\{font-size:10px/)});
test('長い返答と補足は折り返し、本文と別の番号列を持つ',()=>{assert.match(rule('.reading-novel .novel-choice'),/grid-template-columns:28px minmax\(0,1fr\)/);assert.match(rule('.reading-novel .novel-choice'),/white-space:normal/);assert.match(rule('.reading-novel .novel-choice>b,.reading-novel .novel-choice>small'),/overflow-wrap:anywhere/);assert.match(rule('.novel-status123'),/margin:0/)});
report.passed=report.checks.length;fs.writeFileSync(path.join(__dirname,'gui-reader-v123.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
