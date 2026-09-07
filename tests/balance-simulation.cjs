'use strict';
const fs=require('fs'),path=require('path'),E=require(require('fs').existsSync(require('path').join(__dirname,'../dist/script.js'))?'../dist/script.js':'../script.js'),D=E.D;
const N=Number(process.argv[2]||80);
function runPolicy(policy){const list=[];const decisions={};
  for(let trial=1;trial<=N;trial++){
    const s=E.newState(trial*671+3456);E.createCareer(s,E.character(s,'試走'+trial));const c=s.career;let finals=0,races=0,wins=0,caps=0;
    while(true){
      if(c.status==='home'){if(!E.startSeries(s))break;}
      if(c.status==='seriesIntro'||c.status==='between')E.prepareRace(s);
      if(c.status==='action'){
        const p=c.player;const target=D.statKeys.slice().sort((a,b)=>p.stats[a]-p.stats[b])[0];
        if(policy==='training'||policy==='mixed'&&c.series.round%3!==0)E.train(c,target);
        else E.tune(c,c.series.round%2?'prop':'motor');c.status='race';
      }
      if(c.status==='race'){
        const r=c.series.race;
        while(!r.done)E.advance(c,r);
        r.instructions.forEach(o=>decisions[o.id]=(decisions[o.id]||0)+1);
        const z=E.settleRace(s);races++;if(z.place===1&&!z.capsized)wins++;if(z.capsized)caps++;
        if(r.type==='championship')finals++;
      }
      if(c.status==='raceResult')E.continueAfterRace(s);
      if(c.status==='seriesResult'){
        if(c.ending)break;E.nextSeries(s);
      }
    }
    const g1=c.history.find(h=>h.stage===7);
    list.push({trial,sg:c.stage===8,champion:c.ending==='sgChampion',earningsBeforeSG:c.history.filter(h=>h.stage<8).reduce((a,b)=>a+b.money,0),
      races,wins,caps,finals,averageStats:E.average(c.player),ending:c.ending});
  }
  const total=k=>list.reduce((v,x)=>v+x[k],0);const sg=list.filter(x=>x.sg).length;
  const quantile=(array,q)=>{const a=array.slice().sort((a,b)=>a-b);return a[Math.floor((a.length-1)*q)];};
  return {policy,trials:N,sgReached:sg,sgRate:sg/N,sgChampions:list.filter(x=>x.champion).length,
    sgWinConditional:sg?list.filter(x=>x.champion).length/sg:0,playerWinRate:total('wins')/total('races'),capsizeRate:total('caps')/total('races'),
    qualificationFinalRate:total('finals')/(N*8+sg),g1EarningsMedian:quantile(list.map(x=>x.earningsBeforeSG),.5),g1EarningsP10:quantile(list.map(x=>x.earningsBeforeSG),.1),g1EarningsP90:quantile(list.map(x=>x.earningsBeforeSG),.9),
    finalAverageStats:total('averageStats')/N,races:total('races'),decisions};
}
const policies=['training','tuning','mixed'].map(runPolicy);
const skillCatalogCount=D.abilities.length;
const output={trialsPerPolicy:N,seeds:'trial × 671 + 3456',skillCatalogCount,assumptions:['新規選手、再抽選なし','ショップ・アイテム未使用','自動指示','training: 最低能力を毎回練習','tuning: 毎回調整（モーター/プロペラ交互）','mixed: 3走に1回調整、残りは最低能力を練習','登録・ライバルの持越しなし（同育成内の記憶ライバルは有効）'],policies};
fs.writeFileSync(path.join(__dirname,'balance-results.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
