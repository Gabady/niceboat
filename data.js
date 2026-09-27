/* 競艇物語 v85 — All money values are expressed in 万円. No dependencies. */
(function (root) {
  'use strict';
  var stats = { speed: '直線', turn: '旋回', start: 'スタート', accel: '加速', power: 'フィジカル' };
  var categories = ['強化', '戦術', '妨害', '防御', '整備', '育成', '人気', '環境', '弱点'];
  var ranks = ['N', 'R', 'SR', 'SSR', 'UR', 'LR'];
  var phases = ['スタート', '1マーク', 'バック直線', '2マーク', '最終直線'];
  var abilities = [];
  function a(id, name, rarity, category, phase, chance, effect, description, tags, condition) {
    abilities.push({id: id, name: name, rarity: rarity, category: category, type: effect.type || 'buff',
      phases: phase, chance: chance, condition: condition || 'always', target: effect.target || 'self',
      effect: effect, description: description, tags: [category].concat(tags || [])});
  }
  a('quick', '好スタート', 'N', '強化', [0], .48, {stats:{start:9}}, 'スタートを＋9。', ['序盤']);
  a('steady', '安定旋回', 'N', '防御', [1,3], .48, {stats:{turn:5}, safety:.38}, '旋回＋5、水面でのグリップを強め、傾きの蓄積を軽減。', ['ターン']);
  a('push', '小さな伸び', 'N', '強化', [2,4], .44, {stats:{speed:6}}, '直線を＋6。', ['直線']);
  a('grip', '水面をつかむ', 'N', '強化', [1,2], .42, {stats:{accel:7}}, '加速を＋7。', ['ターン']);
  a('stout', '体幹の基礎', 'N', '防御', [0,1,3,4], .32, {stats:{power:6}, safety:.15}, 'フィジカル＋6、水面の揺れと傾きの蓄積を軽減。', []);
  a('mechanic', '整備の心得', 'N', '整備', [], 1, {type:'tuning',success:5}, 'モーター・プロペラの調整成功率＋5。', []);
  a('practice', '積み重ね', 'N', '育成', [], 1, {type:'growth',multiplier:1.08}, 'レース後と練習の基礎成長を8%増やす。', []);
  a('smile', 'ファンサービス', 'N', '人気', [], 1, {type:'fame',value:2}, '出走ごとに人気を追加で＋2。', []);
  a('stretch', '伸び足強化', 'R', '強化', [2,4], .5, {stats:{speed:12}}, '直線を＋12。', ['直線']);
  a('grit', '粘り腰', 'R', '強化', [4], .6, {stats:{power:9,accel:8}}, '最終直線でフィジカル＋9、加速＋8。', ['直線']);
  a('rain', '荒天巧者', 'R', '環境', [0,1,2,3,4], .6, {stats:{turn:8,power:9},safety:.35}, '雨または風速21.6 km/h以上で旋回＋8、フィジカル＋9。転覆を軽減。', [], 'rough');
  a('inside', 'インの呼吸', 'R', '戦術', [0,1], .58, {stats:{start:7,turn:9}, tactic:'front'}, '進入1〜2コースでスタート＋7、旋回＋9。先マイと好相性。', ['序盤'], 'inner');
  a('slice', '差しの軌跡', 'R', '戦術', [1,3], .5, {stats:{turn:10,accel:7},tactic:'sashi'}, '旋回＋10、加速＋7。差し狙いと好相性。', ['ターン']);
  a('outside', '外の伸び', 'R', '戦術', [1,2], .55, {stats:{speed:10,accel:8},tactic:'outside'}, '進入4〜6コースで直線＋10、加速＋8。外攻めと好相性。', ['直線'], 'outer');
  a('calm', '静水の集中', 'R', '環境', [0,3], .6, {stats:{start:10,turn:8}}, '雨以外・風速10.8 km/h以下でスタート＋10、旋回＋8。', [], 'calm');
  a('mentor', '反復の才', 'R', '育成', [], 1, {type:'growth',multiplier:1.14}, 'レース後と練習の基礎成長を14%増やす。', []);
  a('spanner', '熟練の手元', 'R', '整備', [], 1, {type:'tuning',success:9}, '両機材の調整成功率＋9。', []);
  a('engineer', '整備の余白', 'SR', '整備', [], .4, {type:'extra',action:'tune'}, '各レース前40%で調整専用の追加行動を1回得る。追加分の成長・調整効果は50%。', []);
  a('student', '朝練の習慣', 'SR', '育成', [], .4, {type:'extra',action:'training'}, '各レース前40%で練習専用の追加行動を1回得る。追加分の成長・調整効果は50%。', []);
  a('speed_lock', '直線封じ', 'SR', '妨害', [2,4], .42, {type:'debuff',stat:'speed',amount:14,target:'ahead'}, '直前の相手の直線をこのフェーズだけ−14。先頭なら2位を狙う。', ['直線']);
  a('turn_press', '旋回圧', 'SR', '妨害', [1,3], .42, {type:'debuff',stat:'turn',amount:13,target:'nearest',pressure:.012}, '近い相手の旋回−13。接近時のみ接触圧を加える。', ['ターン']);
  a('start_check', 'スタート牽制', 'SR', '妨害', [0], .56, {type:'debuff',stat:'start',amount:17,target:'nearest'}, '近いコースの相手のスタートを−17。', ['序盤']);
  a('accel_lock', '加速鈍化', 'SR', '妨害', [1,2,4], .34, {type:'debuff',stat:'accel',amount:14,target:'ahead'}, '直前の相手の加速を−14。', []);
  a('power_drain', 'フィジカル削り', 'SR', '妨害', [1,3], .4, {type:'debuff',stat:'power',amount:15,target:'nearest'}, '近い相手のフィジカルを−15。', ['ターン']);
  a('sweep', '全速まくり', 'SR', '戦術', [1,3], .55, {stats:{speed:13,accel:14},tactic:'outside'}, '直線＋13、加速＋14。外を回る走行の再加速を後押し。', ['ターン','荒技']);
  a('entry', '進入の読み', 'SR', '戦術', [], .52, {type:'entry'}, 'レース開始時、52%で進入コースを1つ内へ動かす。艇番は変わらない。', ['序盤']);
  a('hero', '水面の主役', 'SR', '人気', [4], .65, {stats:{speed:8,power:8},fame:4}, '最終直線で直線・フィジカル＋8。発動すると人気＋4。', ['直線']);
  a('immune', '妨害耐性', 'SSR', '防御', [0,1,2,3,4], 1, {type:'defense',reflect:0}, '相手からの妨害を無効化。反射された妨害は防げない。', []);
  a('dump', '強襲ダンプ', 'SSR', '妨害', [1,3], .43, {type:'debuff',stat:'turn',amount:20,target:'nearest',pressure:.026}, '接近艇の旋回−20、接触圧を追加。単独先頭の艇には接触圧が届かない。', ['ターン','荒技']);
  a('split', '刹那の差し', 'SSR', '戦術', [1,3], .64, {stats:{turn:18,accel:13},safety:.2,tactic:'sashi'}, '旋回＋18、加速＋13。グリップを強め、波と傾きの蓄積を軽減。', ['ターン']);
  a('burst', '直線解放', 'SSR', '強化', [2,4], .62, {stats:{speed:22,accel:10}}, '直線＋22、加速＋10。', ['直線']);
  a('comeback', '弱さを推進力に', 'SSR', '戦術', [0,1,2,3,4], 1, {type:'convert'}, '発動した弱点の能力低下を、低下量の40%の上昇へ変える。', []);
  a('anchor', '不動のターン', 'SSR', '防御', [1,3], .7, {stats:{turn:12,power:16},safety:.7}, '旋回＋12、フィジカル＋16。グリップを強め、波と傾きの蓄積を軽減。', ['ターン']);
  a('storm', '嵐の先導者', 'SSR', '環境', [0,1,2,3,4], .65, {stats:{turn:14,power:16,speed:7},safety:.45}, '荒天時、旋回＋14、フィジカル＋16、直線＋7。転覆を軽減。', [], 'rough');
  a('reflect', '妨害返し', 'UR', '防御', [0,1,2,3,4], 1, {type:'defense',reflect:.5}, '妨害を無効化し、効果量の50%を攻撃者へ返す。再反射しない。', []);
  a('zero', '零の踏み込み', 'UR', '強化', [0,1], .72, {stats:{start:25,accel:18,turn:8}}, 'スタート＋25、加速＋18、旋回＋8。', ['序盤']);
  a('comet', '彗星航路', 'UR', '戦術', [2,4], .7, {stats:{speed:26,accel:20},tactic:'gamble'}, '直線＋26、加速＋20。直線での最高速と再加速を高める。', ['直線']);
  a('wave', '波を支配する', 'UR', '環境', [1,3], .76, {stats:{turn:24,power:22},safety:.65}, '旋回＋24、フィジカル＋22。グリップを強め、波と傾きの蓄積を軽減。', ['ターン']);
  a('craft', '匠の設計', 'UR', '整備', [], 1, {type:'tuning',success:16}, '両機材の調整成功率＋16。成功率上限は92%。', []);
  a('mirror', '鏡面水域', 'LR', '防御', [0,1,2,3,4], 1, {type:'defense',reflect:1}, '妨害を完全無効化し、効果をすべて攻撃者へ返す。再反射しない。', []);
  a('legend_start', '一閃の境地', 'LR', '強化', [0,1], .84, {stats:{start:31,turn:20,accel:20}}, 'スタート＋31、旋回・加速＋20。', ['序盤']);
  a('legend_speed', '水上の軌跡', 'LR', '強化', [2,4], .84, {stats:{speed:33,accel:25,power:14}}, '直線＋33、加速＋25、フィジカル＋14。', ['直線']);
  a('legend_turn', '王者の旋回', 'LR', '戦術', [1,3], .86, {stats:{turn:32,power:26,accel:20},safety:.8,tactic:'sashi'}, '旋回＋32、フィジカル＋26、加速＋20。転覆を大きく軽減。', ['ターン']);
  a('legend_tide', '逆潮を越えて', 'LR', '戦術', [3,4], .88, {stats:{speed:30,accel:30,power:20},tactic:'gamble'}, '3位以下で直線・加速＋30、フィジカル＋20。', [], 'behind');
  a('weak_start', '踏み込みの迷い', 'N', '弱点', [0], .7, {stats:{start:-12}}, '70%でスタート−12。1着時の克服抽選か克服手帳で除去。', ['序盤']);
  a('weak_rain', '雨への苦手意識', 'R', '弱点', [1,3], .75, {stats:{turn:-12,power:-8}}, '雨のターンで旋回−12、フィジカル−8。', [], 'rain');
  a('weak_end', '終盤の息切れ', 'R', '弱点', [4], .7, {stats:{power:-12,accel:-10}}, '最終直線でフィジカル−12、加速−10。', ['直線']);
  a('weak_out', '外枠の重圧', 'N', '弱点', [0,1], .65, {stats:{start:-8,turn:-8}}, '外進入時にスタート・旋回−8。', ['序盤'], 'outer');
  a('weak_wind', '横風の不安', 'R', '弱点', [1,3], .7, {stats:{turn:-13}}, '横風時、旋回−13。', [], 'cross');

  // Each family uses its highest owned rarity. Recoil is an equipment trade-off, not a removable weakness.
  var signatureLevels=[
    {rarity:'SR',suffix:'入門',early:{speed:2,accel:2,turn:1},late:{speed:-1,accel:-1,power:-1},pivot:.035,chance:.45,duration:.75},
    {rarity:'SSR',suffix:'熟練',early:{speed:12,accel:14,turn:7},late:{speed:-7,accel:-8,power:-5},pivot:.23,chance:.58,duration:1.15},
    {rarity:'UR',suffix:'極',early:{speed:24,accel:26,turn:12},late:{speed:-13,accel:-14,power:-8},pivot:.42,chance:.70,duration:1.35},
    {rarity:'LR',suffix:'到達点',early:{speed:38,accel:40,turn:18},late:{speed:-20,accel:-22,power:-12},pivot:.60,chance:.82,duration:1.45}
  ];
  signatureLevels.forEach(function(level){
    var id='doguchi_'+level.rarity.toLowerCase(),average={};
    Object.keys(stats).forEach(function(k){average[k]=((level.early[k]||0)+(level.late[k]||0))/3;});
    a(id,'洞口スペシャル・'+level.suffix,level.rarity,'整備',[0,1,2,3,4],1,{type:'lapcycle',stats:average},
      '有効スタート後の1周目を強化、2周目は通常、3周目は反動で能力低下。'+(level.rarity==='SR'?'入門版は強化・反動ともごく小さい。':'序盤の貯金を作る整備。')+'同系統は最上位だけ有効。',['序盤','直線']);
    abilities[abilities.length-1].signature={family:'doguchi',early:level.early,late:level.late};
    a('monkey_'+level.rarity.toLowerCase(),({SR:'モンキーターン',SSR:'Vモンキー',UR:'超絶Vモンキー',LR:'究極Vモンキー'})[level.rarity],level.rarity,'戦術',[1,3],level.chance,{type:'pivot',stats:{turn:level.pivot*18},safety:level.pivot*.4,tactic:'sashi'},
      '全開で左へ切ったターン中に抽選。短時間だけ舵の負荷を緩め、水面をつかんでV字に近い全速旋回。'+(level.rarity==='SR'?'入門版はごくわずかな補助。':'')+'同系統は最上位だけ、1つのマークで1回抽選。',['ターン','荒技']);
    abilities[abilities.length-1].signature={family:'monkey',pivot:level.pivot,duration:level.duration};
  });

  // Physical effects are separate from the legacy off-screen result approximation.
  // All IDs and rarity/category tags remain shared by both modes.
  var driving = {
    quick:{mechanics:{response:.8},text:'助走のスロットル応答を速め、スタート予測幅を狭める。'},
    steady:{mechanics:{damping:.35,wakeShield:.12},text:'ターンの横流れが収まりやすく、引き波に押されにくい。'},
    push:{mechanics:{speed:.4},text:'直線の伸び足を上乗せする。'},
    grip:{when:'wake',mechanics:{damping:.55,accel:.5},text:'前走艇が近い区間で、引き波を越えた再加速と横滑り収束を助ける。'},
    stout:{mechanics:{contactShield:.25},text:'接触で船首を振られる量を減らす。'},
    stretch:{mechanics:{speed:.8},text:'直線で上がった最高速を維持しやすい。'},
    grit:{mechanics:{economy:.4,response:.5},text:'ホーム直線で消耗を抑え、再加速の反応を保つ。'},
    rain:{mechanics:{waveShield:.35,wakeShield:.2},text:'荒天の横波と他艇の引き波を軽減する。'},
    inside:{when:'inside',mechanics:{damping:.4,response:.7},text:'内側で助走応答とターンの収まりがよくなる。'},
    slice:{when:'inside',mechanics:{grip:.6,damping:.4,accel:.4},text:'内側へ差すターンで水をつかみ、立ち上がりを強める。'},
    outside:{when:'outside',mechanics:{speed:.7,accel:.6},text:'外の進路で速度と立ち上がりを伸ばす。'},
    calm:{mechanics:{response:.7,damping:.25},text:'静水で助走応答と旋回の収束を高める。'},
    speed_lock:{range:30,mechanics:{drag:.8},text:'30m以内の相手に4秒間の抵抗増。離れた艇には届かない。'},
    turn_press:{range:13,mechanics:{grip:-1,damping:-.3},text:'13m以内の相手のグリップと横滑りの収まりを4秒間下げる。'},
    start_check:{range:52,mechanics:{response:-.65},text:'助走中、52m以内の相手のアクセル応答をスタート有効時間の終了まで鈍らせる。'},
    accel_lock:{range:26,mechanics:{response:-.7},text:'26m以内の相手に4秒間のエンジン応答遅れ。'},
    power_drain:{range:16,mechanics:{wakeShield:-.2,contactShield:-.2},text:'16m以内の相手を引き波・接触に弱くする。'},
    sweep:{when:'outside',mechanics:{speed:1.1,accel:1,grip:-.35,wakeEmit:.4},text:'外を握ると伸びと再加速が強化。引き波も強くなるが、グリップは少し落ちる。'},
    entry:{text:'抽選でコースを一つ内へ。進入後の助走距離も新しいコースに合わせる。'},
    hero:{mechanics:{response:.6,economy:.2},text:'ホーム直線で応答と持久力が上がり、発動時に人気も増える。'},
    immune:{mechanics:{contactShield:.35},text:'妨害を無効化し、直後4秒間は接触による船首の振れを軽減。'},
    dump:{range:9,mechanics:{grip:-1.3},text:'9m以内の接近艇に横向きの押しと旋回低下。反動で自艇も揺れ、離れた艇には届かない。'},
    split:{when:'inside',mechanics:{grip:1,damping:.65,wakeShield:.25,accel:.7},text:'内側の狭い進路で引き波を越え、滑りを収めて鋭く再加速。'},
    burst:{mechanics:{speed:1.5,accel:.7,economy:-.15},text:'直線の最高速と再加速を解放するぶん消耗も増える。'},
    comeback:{text:'弱点発動時、その能力低下を40%の上昇へ変え、水面ギミックの追加ペナルティを除く。'},
    anchor:{mechanics:{contactShield:.55,damping:.65,wakeShield:.25},text:'接触と引き波で振られにくい、収まりのよいターン。'},
    storm:{mechanics:{waveShield:.45,wakeShield:.3},text:'荒天時の横波・引き波の負荷を抑え、失速を軽減。'},
    reflect:{mechanics:{contactShield:.5},text:'妨害の能力低下と水面効果を50%反射。再反射しない。'},
    zero:{mechanics:{response:1.7},text:'助走時の立ち上がりと応答を強める。早く踏めばフライングにはなる。'},
    comet:{mechanics:{speed:1.25,accel:.85,wakeEmit:.65},text:'伸びと再加速を強め、通過した引き波も大きくする。'},
    wave:{mechanics:{wakeShield:.45,damping:.65},text:'ターン中に引き波の負荷を軽減し、横滑りを速く収束。'},
    mirror:{mechanics:{contactShield:.65,wakeShield:.4},text:'水面効果も完全反射し、直後4秒間の接触と引き波も軽減。再反射しない。'},
    legend_start:{mechanics:{response:2.5,damping:.5},text:'助走応答とスタート直後の艇の収まりを大幅強化。F判定は全艇共通。'},
    legend_speed:{mechanics:{speed:1.5,accel:1,wakeEmit:.65,economy:.2},text:'強い伸び・再加速・引き波を生み、消耗も抑える。'},
    legend_turn:{when:'inside',mechanics:{grip:1.2,damping:.75,wakeShield:.45,contactShield:.4},text:'内を回る高グリップ旋回。引き波と接触にも強い。'},
    legend_tide:{mechanics:{speed:1.5,accel:1.5,wakeShield:.7},text:'後方から先行艇の引き波を越える追走加速。'},
    weak_start:{mechanics:{response:-.55},text:'助走時にアクセルの反応が鈍る。'},
    weak_rain:{mechanics:{waveExtra:.35,damping:-.2},text:'雨のターンで横波と横滑りが強まる。'},
    weak_end:{mechanics:{economy:-.25,response:-.4},text:'終盤の応答と持久力が落ちる。'},
    weak_out:{mechanics:{response:-.35,damping:-.2},text:'外進入で助走応答と旋回の収まりが悪くなる。'},
    weak_wind:{mechanics:{waveExtra:.45},text:'横風ターンで船首と横流れが乱れやすい。'}
  };
  ranks.forEach(function(rarity,i){
    var names=['水面の予習','走りの予感','集中ルーティン','水面との同調','一走への研鑽','一走入魂'];
    var chance=[.16,.25,.38,.52,.68,.82][i],amount=[1,2,3,5,7,9][i];
    a('prep_'+rarity.toLowerCase(),names[i],rarity,'育成',[],chance,{type:'prep',amount:amount},
      'そのレース前の最初の練習で'+Math.round(chance*100)+'%の抽選。練習した能力を次の1レースだけ＋'+amount+'。同系統は最上位のみ。追加練習での補正は半分。',['次走']);
  });
  a('feather','抜きの手ほどき','N','戦術',[1,3],1,{type:'operation',stats:{turn:2}},'ターン中にアクセルを抜き、舵を切って0.4秒保つと発動。1周1回、2秒間だけ横滑りの収束を助ける。',['ターン']);
  a('straighten','舵戻しの基本','R','戦術',[2,4],1,{type:'operation',stats:{accel:3}},'ターン出口で舵を中央に戻し全開で0.4秒保つと発動。1周1回、3秒間だけエンジン応答を改善。',['直線']);
  a('wake_escape','引き波の抜け道','SR','環境',[0,1,2,3,4],.65,{type:'operation',stats:{accel:6,power:5}},'引き波を受けた後、進路を変えて抜けると65%で発動。1周1回、4秒間再加速と波への耐性を強化。',[]);
  driving.feather={mechanics:{damping:.65},text:'アクセルを抜いたターンを補助。低レア固有の確定発動、各周1回。'};
  driving.straighten={mechanics:{response:.9},text:'ターン出口で舵を戻す操作を支える。低レア固有の確定発動、各周1回。'};
  driving.wake_escape={mechanics:{wakeShield:.2,accel:.4},text:'引き波から進路を変えて抜けた後の再加速を支える。'};
  abilities.forEach(function(skill){skill.drive=driving[skill.id]||{text:'整備・育成・人気の効果を両モードで共通適用。'};});
  abilities.filter(function(skill){return skill.signature;}).forEach(function(skill){
    var spec=skill.signature,describe=function(values){return Object.keys(values).map(function(k){return stats[k]+(values[k]>0?'＋':'−')+Math.abs(values[k]);}).join(' / ');};
    skill.drive=spec.family==='doguchi'?{text:'1周目：'+describe(spec.early)+'。2周目：補正なし。3周目：'+describe(spec.late)+'。反動は反射・弱点克服の対象外。'}:
      {text:'実際の左舵25%以上・全開・21.6 km/h以上のターン中に'+Math.round(skill.chance*100)+'%で発動。'+spec.duration+'秒間の旋回補助。減速すると効果は止まる。ブイ・接触判定は維持。'};
  });

  var tiers = {
    rookie:{label:'新人',base:42,prize:.575,growth:1,rare:['N','N','N','R','R','SR']},
    g3:{label:'G3',base:53,prize:.875,growth:1.07,rare:['N','R','R','SR','SR','SSR']},
    g2:{label:'G2',base:63,prize:1.275,growth:1.14,rare:['R','SR','SR','SSR','SSR','UR']},
    g1:{label:'G1',base:73,prize:1.725,growth:1.22,rare:['SR','SR','SSR','SSR','UR']},
    sg:{label:'SG',base:85,prize:47.5,growth:1.35,rare:['SR','SSR','SSR','UR','UR','LR']}
  };
  var stages = [
    ['rookie','新人シリーズ 前期'],['rookie','新人シリーズ 後期'],
    ['g3','G3シリーズ 前期'],['g3','G3シリーズ 後期'],
    ['g2','G2シリーズ 前期'],['g2','G2シリーズ 後期'],
    ['g1','G1シリーズ 前期'],['g1','G1シリーズ 後期'],['sg','最高峰シリーズ']
  ].map(function(s,i){return {index:i,tier:s[0],name:s[1]};});
  var venues = [
    {id:'minato',name:'みなと水面',note:'伸び足が生きる穏やかな直線',stats:{speed:4},roughness:.1,lane:1},
    {id:'tsukikage',name:'月影水面',note:'旋回と加速が勝負を分ける',stats:{turn:4,accel:2},roughness:.16,lane:.94},
    {id:'hikari',name:'光ヶ浜水面',note:'スタートが決め手。内が粘りやすい',stats:{start:5},roughness:.1,lane:1.12},
    {id:'arashio',name:'荒潮水面',note:'風波が多く、外からの逆転も',stats:{power:5},roughness:.8,lane:.6},
    {id:'aonagi',name:'青凪水面',note:'安定水面。実力と機材が結果に出る',stats:{turn:2,power:2},roughness:0,lane:1.02}
  ];
  var growth = [
    {id:'sprinter',name:'疾走型',values:{speed:1.6,turn:.85,start:1.2,accel:1.25,power:.7}},
    {id:'artist',name:'技巧型',values:{speed:.85,turn:1.65,start:1,accel:1.35,power:.75}},
    {id:'starter',name:'先駆型',values:{speed:1.15,turn:1.15,start:1.65,accel:.9,power:.75}},
    {id:'charger',name:'瞬発型',values:{speed:1.3,turn:1,start:.8,accel:1.65,power:.85}},
    {id:'tough',name:'剛健型',values:{speed:.8,turn:1.3,start:1.05,accel:.8,power:1.65}},
    {id:'balanced',name:'晩成均衡型',values:{speed:1.12,turn:1.12,start:1.12,accel:1.12,power:1.12}}
  ];
  var choices = {
    1:[{id:'front',name:'先マイ重視',hint:'内進入・旋回・スタート。外では効果減。'},
       {id:'sashi',name:'差し狙い',hint:'旋回・加速。横風でも比較的安定。'},
       {id:'outside',name:'外から攻める',hint:'外進入・直線・加速。荒天では転覆に注意。'}],
    2:[{id:'stretch',name:'伸び勝負',hint:'直線とモーター。向かい風で効果減。'},
       {id:'position',name:'位置取り重視',hint:'旋回と体幹。接戦で力を発揮。'},
       {id:'rest',name:'体力温存',hint:'今は控えめ。終盤へ体力を残す。'}],
    4:[{id:'chase',name:'全力追走',hint:'直線・加速で押す。体力不足は失速。'},
       {id:'guard',name:'守り切る',hint:'上位と荒天に向く。下位からの追い上げは弱め。'},
       {id:'gamble',name:'一発狙い',hint:'下位から勝負。成功も失敗も大きい。'}]
  };
  var items = [
    {id:'boost',name:'集中ドリンク',price:65,description:'次の1レースだけ全基礎能力＋5。1走1本。'},
    {id:'lane',name:'1号艇指定券',price:180,description:'次走の枠番を1号艇へ変更。進入能力による移動は有効。'},
    {id:'training',name:'追加練習券',price:105,description:'次走前のトレーニングを1回追加。1走1枚。'},
    {id:'tune',name:'追加調整券',price:105,description:'次走前の機材調整を1回追加。1走1枚。'},
    {id:'growth',name:'成長型再抽選券',price:750,description:'成長型を現在と異なる型に再抽選。基礎能力は維持。'},
    {id:'cure',name:'弱点克服手帳',price:480,description:'所持している弱点を選んで1つ除去。'}
  ];
  // Two distinct abilities unlock a situational combination; no universal all-stat bonus.
  var synergies=[
    {id:'rhythm',name:'緩急自在',groups:[['feather'],['straighten']],need:{turn:35,accel:35},description:'ターンで緩めた周は、出口で舵を戻して全開にすると再加速。少し消耗が増える。'},
    {id:'launch',name:'先手必勝',groups:[['quick','zero','legend_start'],['inside','entry']],need:{start:40},description:'内進入の序盤、舵を戻して加速すると応答とグリップ上昇。消耗は少し増える。'},
    {id:'cutback',name:'差し返し',groups:[['slice','split','monkey_sr','monkey_ssr','monkey_ur','monkey_lr'],['grip','outside','sweep']],need:{accel:40},description:'ターン出口で舵を戻し、アクセルを踏むと再加速を強化。伸び足は少し控えめ。'},
    {id:'stormwall',name:'荒水の構え',groups:[['rain','storm','wave'],['stout','steady','anchor']],need:{power:40},description:'荒天でアクセルを少し緩めると波と消耗を軽減。最高速は少し控えめ。'},
    {id:'duel',name:'攻防一体',groups:[['speed_lock','turn_press','start_check','accel_lock','power_drain','dump'],['immune','reflect','mirror']],need:{start:35,power:35},description:'他艇18m以内で応答・接触耐性を強化。伸び足を少し犠牲にする。'},
    {id:'craftline',name:'整備の継走',groups:[['doguchi_sr','doguchi_ssr','doguchi_ur','doguchi_lr'],['mechanic','spanner','engineer','craft']],need:{accel:40},description:'2周目の機材応答と持久力を改善。伸び足は控えめ。洞口スペシャルの3周目の反動は残る。'}
  ];
  var D = {version:80,build:'95',driveEffectCaps:{speed:2.4,accel:1.6,response:2.5,grip:1.8,damping:1.2,wakeShield:.55,contactShield:.55,waveShield:.55},spectatorAssist:{easy:{speed:.995,accel:1.005,turn:1},normal:{speed:.968,accel:.985,turn:.99}},gradePace:{easy:{rookie:1,g3:1.008,g2:1.015,g1:1.021,sg:1.026},normal:{rookie:1,g3:1.018,g2:1.032,g1:1.045,sg:1.058}},sgNpcRarities:['SR','SR','SSR','SSR','SSR','UR'],npcGradeStats:{rookie:0,g3:.5,g2:1,g1:1.5,sg:2},easyNpcGrowth:.82,raceGrowthByPlace:{easy:[.78,.71,.63,.56,.5,.45],normal:[.78,.74,.70,.66,.62,.58]},spectatorSpread:{weight:.82,cap:4.5,speed:.012,accel:.02},synergies:synergies,npcTimeScale:.945,npcPace:{easy:{speed:1.16,accel:1.16},normal:{speed:1.265,accel:1.28}},difficulties:{
    easy:{id:'easy',name:'イージー',growth:.75,rewardDrop:1,shopMax:'SSR',ai:'easy'},
    normal:{id:'normal',name:'ノーマル',growth:1,rewardDrop:0,shopMax:'UR',ai:'normal'}
  },stats:stats,statKeys:Object.keys(stats),categories:categories,
    rarities:ranks,phases:phases,abilities:abilities,abilityMap:Object.fromEntries(abilities.map(function(x){return [x.id,x];})),
    stages:stages,tiers:tiers,venues:venues,growth:growth,choices:choices,items:items,
    prices:{N:95,R:185,SR:260,SSR:560,UR:1650,LR:99999},
    points:[10,8,6,4,2,1],prizes:{qualifier:[60,32,20,12,7,4],championship:[350,175,105,60,35,20],consolation:[105,60,35,20,12,7]},
    sgThreshold:1800,nonSG:{money:.5,raceGrowth:.6,trainingGrowth:.6,tuningGrowth:.7},
    phaseWeights:[{start:.69,power:.2,accel:.11},{turn:.5,accel:.28,power:.16,start:.06},{speed:.7,accel:.25,power:.05},{turn:.64,power:.26,accel:.1},{speed:.6,accel:.25,power:.15}],
    lastNames:['青井','水瀬','桐生','朝倉','瀬戸','小波','碧川','月城','神崎','湊','白石','真壁','相沢','橘','風間','八雲','鳴海','久遠','夏目','冬木','三浦','高瀬'],
    firstNames:['湊','玲','翔','凪','悠','真琴','颯太','律','楓','遥','大河','奏','光','志帆','蓮','蒼','千尋','海斗','陽菜','一真']};
  root.KM_DATA = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof globalThis !== 'undefined' ? globalThis : window);
