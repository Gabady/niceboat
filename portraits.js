/* v100: original vector cast. Identity changes facial anatomy, not only color or hair. */
(function(root){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const fixed={
 akari:{sex:'f',age:24,shape:'heart',eye:'bright',brow:'raised',mouth:'grin',nose:'small',hair:'pixie',hairColor:'#6c3529',skin:'#e8b395',accent:'#e9a260',clothes:'work',detail:'clip'},
 mio:{sex:'f',age:25,shape:'long',eye:'hooded',brow:'straight',mouth:'soft',nose:'long',hair:'bob',hairColor:'#203044',skin:'#edc7b5',accent:'#9abde4',clothes:'jacket',detail:'glasses'},
 nagi:{sex:'f',age:26,shape:'round',eye:'gentle',brow:'soft',mouth:'warm',nose:'round',hair:'bun',hairColor:'#66422e',skin:'#d7a78c',accent:'#a7cdb1',clothes:'knit',detail:'freckles'},
 kanade:{sex:'f',age:23,shape:'oval',eye:'wide',brow:'worried',mouth:'shy',nose:'small',hair:'long',hairColor:'#25223d',skin:'#edd1c1',accent:'#bca6e0',clothes:'blouse',detail:'earring'},
 tsumugi:{sex:'f',age:27,shape:'square',eye:'smiling',brow:'arched',mouth:'smile',nose:'defined',hair:'waves',hairColor:'#8b5938',skin:'#dfb292',accent:'#dbb47f',clothes:'apron',detail:'mole'},
 hayase:{sex:'m',age:37,shape:'long',eye:'narrow',brow:'straight',mouth:'flat',nose:'long',hair:'side',hairColor:'#253944',skin:'#c9987d',accent:'#64bed1',clothes:'race',detail:'temples'},
 tsukino:{sex:'f',age:35,shape:'diamond',eye:'cat',brow:'arched',mouth:'knowing',nose:'defined',hair:'ponytail',hairColor:'#473449',skin:'#e0b69d',accent:'#b3a1e4',clothes:'race',detail:'earring'},
 kuzumi:{sex:'m',age:52,shape:'angular',eye:'hooded',brow:'heavy',mouth:'soft',nose:'broad',hair:'receding',hairColor:'#7a827e',skin:'#ba8c74',accent:'#d6b274',clothes:'race',detail:'lines'},
 akamine:{sex:'m',age:33,shape:'square',eye:'bright',brow:'raised',mouth:'grin',nose:'defined',hair:'spike',hairColor:'#683d2a',skin:'#cf9575',accent:'#df9178',clothes:'race',detail:'stubble'},
 iwase:{sex:'m',age:44,shape:'broad',eye:'gentle',brow:'heavy',mouth:'warm',nose:'broad',hair:'crew',hairColor:'#243c37',skin:'#bc937b',accent:'#6eb7a0',clothes:'race',detail:'beard'},
 kurose:{sex:'m',age:32,shape:'angular',eye:'icy',brow:'slant',mouth:'flat',nose:'long',hair:'slick',hairColor:'#182633',skin:'#d2b4a5',accent:'#76c8e3',clothes:'elite',detail:'silver'},
 shirakami:{sex:'f',age:29,shape:'diamond',eye:'cat',brow:'slant',mouth:'knowing',nose:'defined',hair:'silverBob',hairColor:'#d7d9e4',skin:'#edcbbf',accent:'#c8a7e7',clothes:'elite',detail:'earring'},
 kagura:{sex:'m',age:27,shape:'heart',eye:'wide',brow:'raised',mouth:'smirk',nose:'small',hair:'swept',hairColor:'#987547',skin:'#dcaf88',accent:'#e6c170',clothes:'elite',detail:'stud'},
 raiden:{sex:'m',age:34,shape:'square',eye:'narrow',brow:'slant',mouth:'teeth',nose:'defined',hair:'mohawk',hairColor:'#6b2434',skin:'#bb866e',accent:'#e98895',clothes:'elite',detail:'scar'},
 onizuka:{sex:'m',age:48,shape:'broad',eye:'hooded',brow:'heavy',mouth:'stern',nose:'broad',hair:'shaved',hairColor:'#303a37',skin:'#b28b72',accent:'#85b8a0',clothes:'elite',detail:'beard'}
};
const shapes={heart:[29,30,13,96],long:[26,25,16,102],round:[32,34,23,94],oval:[29,28,18,99],square:[32,30,28,96],diamond:[30,32,14,100],angular:[29,28,22,103],broad:[36,35,32,99]};
function definition(person){const id=String(person.id||person.name||'racer').replace(/^cast_/,''),f=fixed[id];if(f)return {...f,id,seed:hash(id),fixed:true};const seed=hash(id),sex=seed%4===0?'f':'m',names=Object.keys(shapes);return {id,seed,fixed:false,sex,age:22+(seed%29),shape:names[(seed>>>2)%names.length],eye:['narrow','bright','wide','hooded','gentle','cat'][(seed>>>5)%6],brow:['straight','slant','raised','heavy','arched','soft'][(seed>>>9)%6],mouth:['smirk','flat','warm','grin','soft','stern','smile'][(seed>>>12)%7],nose:['small','broad','long','defined','round'][(seed>>>16)%5],hair:(sex==='f'?['bob','bun','pixie','ponytail','waves','long']:['crew','spike','side','slick','receding','swept','shaved','mohawk'])[(seed>>>20)%(sex==='f'?6:8)],hairColor:['#253a3e','#593b2d','#232533','#786350','#653b42','#464c54'][(seed>>>7)%6],skin:['#dbaf93','#eccbb5','#bc8e76','#d6a285','#c49e8b'][(seed>>>14)%5],accent:(/^#[0-9a-f]{6}$/i.test(person.color)?person.color:null)||['#74bccc','#d79b77','#9bbd9c','#b3a0ce','#ca8994','#b4b3b8'][(seed>>>24)%6],clothes:'race',detail:sex==='f'?['none','earring','mole','clip'][(seed>>>28)%4]:['none','stubble','lines','scar'][(seed>>>28)%4]};}
function render(person,large=false,emotion=null){if(!person)return '';if(typeof person==='string')person={id:person,name:person};const d=definition(person),[w,cheek,jaw,chin]=shapes[d.shape],cx=60+(d.fixed?0:(d.seed%5)-2),skin=d.skin,ink='#24323c',hair=d.hairColor;
 let mouth=d.mouth,brow=d.brow,eye=d.eye;if(emotion==='thoughtful'){brow='worried';mouth='soft';}if(emotion==='sad'){brow='worried';mouth='sad';}if(emotion==='warm'){mouth='warm';brow='soft';}
 const parts=[],add=(s)=>parts.push(s),path=(s,fill,extra='')=>'<path d="'+s+'" fill="'+fill+'" '+extra+'/>';
 add('<svg class="portrait-face '+(person.role==='cast'?'cast-face':'bond-face')+(large?' large':'')+'" viewBox="0 0 120 144" role="img" aria-label="'+esc(person.name||d.id)+'の顔" data-face="'+esc(d.id)+'" data-expression="'+esc(emotion||d.mouth)+'">');
 add('<rect width="120" height="144" rx="20" fill="#102534"/><path d="M0 0H120V89L0 128Z" fill="'+d.accent+'" opacity=".2"/><circle cx="89" cy="34" r="43" fill="'+d.accent+'" opacity=".16"/><path d="M0 121L120 87V144H0Z" fill="#061c29" opacity=".55"/>');
 if(['long','waves','ponytail','bob','silverBob'].includes(d.hair))add(path('M27 43Q12 74 20 118L45 125 86 118Q108 82 94 37Z',hair));
 const shoulder=d.shape==='broad'?4:13;
 add(path(`M${shoulder} 144Q${shoulder+2} 112 42 106H79Q${121-shoulder} 112 ${122-shoulder} 144Z`,d.clothes==='elite'?'#263244':d.clothes==='knit'?d.accent:'#314759'));
 add(path(`M48 87L46 111Q${cx} 128 77 110L74 87Z`,skin));add(path('M49 97Q62 109 74 94L74 103Q60 115 48 107Z','#995d50','opacity=".23"'));
 if(['race','elite'].includes(d.clothes)){add(path('M43 105L59 122 77 104 87 111 79 144H40L33 112Z',d.clothes==='elite'?'#142331':'#203447'));add(path('M15 144L26 117 40 112 45 144ZM105 144L94 117 81 112 76 144Z',d.accent));add('<path d="M60 122V144M42 108L59 123 78 108" fill="none" stroke="'+(d.clothes==='elite'?'#dfc496':'#c9d7d4')+'" stroke-width="2"/>');}
 if(d.clothes==='work')add(path('M34 110L50 124 43 144H15L23 117ZM87 109L70 126 78 144H107L97 116Z',d.accent));
 if(d.clothes==='jacket'){add(path('M30 113L45 106 59 123 74 106 92 113 82 144H38Z','#7895b2'));add(path('M48 111L59 123 74 110 69 139 60 145 52 137Z','#ebcfaa'));}
 if(d.clothes==='blouse')add(path('M34 111L46 107 60 125 76 106 88 111 82 144H35Z',d.accent));
 if(d.clothes==='knit')add('<path d="M30 117L40 142M41 119L48 143M83 119L77 143M95 120L87 144" stroke="#425e52" opacity=".25" stroke-width="2"/>');
 if(d.clothes==='apron'){add(path('M15 144L24 116 43 107 60 123 77 107 95 116 108 144Z','#e5d7be'));add(path('M39 115L45 115V127H76V114H83V144H38Z','#9b7654'));}
 const head=`M${cx-w} 43Q${cx-w+2} 18 ${cx} 19Q${cx+w-2} 18 ${cx+w} 43L${cx+cheek} 68Q${cx+cheek-1} 82 ${cx+jaw} ${chin-10}Q${cx+9} ${chin+4} ${cx} ${chin}Q${cx-10} ${chin+3} ${cx-jaw} ${chin-10}Q${cx-cheek} 82 ${cx-cheek} 68Z`;
 add('<ellipse cx="'+(cx-cheek)+'" cy="67" rx="5" ry="10" fill="'+skin+'"/><ellipse cx="'+(cx+cheek)+'" cy="67" rx="5" ry="10" fill="'+skin+'"/>');add(path(head,skin));add(path(`M${cx-cheek} 43Q${cx-21} 77 ${cx-8} ${chin-9}L${cx+9} ${chin-4}Q${cx-8} ${chin+5} ${cx-jaw} ${chin-10}Q${cx-cheek} 83 ${cx-cheek} 67Z`,'#9a6252','opacity=".2"'));add(path(`M${cx-15} 38Q${cx+8} 27 ${cx+20} 45L${cx+14} 63Q${cx+2} 53 ${cx-12} 55Z`,'#fff3dd','opacity=".12"'));
 const hs={
 pixie:'M27 56L18 39 27 38 25 22 37 23Q52 6 80 20L95 40 86 55 78 35 67 43 54 28 43 45 32 39Z',
 bob:'M26 84Q15 57 23 32Q33 9 62 13Q91 14 96 45L94 90 81 82 83 36 59 42 36 34 37 87Z',
 bun:'M27 58Q15 30 35 21Q58 8 85 24L96 42 88 59 80 38Q55 49 34 38Z',
 long:'M23 107Q15 49 26 28Q37 9 61 13Q89 11 96 41L98 112 82 104 83 34 72 44 59 29 48 48 34 38 36 107Z',
 waves:'M25 88Q10 69 23 57Q12 41 30 25Q46 7 72 19Q99 18 96 44Q107 60 93 76L99 91 82 89 83 39 66 47 53 33 37 49 39 83Z',
 side:'M29 54L23 36Q29 15 63 17Q89 19 91 46L83 57 79 34Q58 46 37 35L36 55Z',
 ponytail:'M29 53Q15 26 44 17Q79 7 91 31L90 53 78 39Q55 30 35 40Z',
 receding:'M28 62L20 38Q27 25 37 24L34 41 33 65ZM85 64L85 41 78 25Q99 30 98 53L92 66Z',
 spike:'M25 53L17 28 34 31 37 12 54 23 67 9 75 24 94 18 98 38 88 56 78 34 61 41 46 29 33 40Z',
 crew:'M25 49L24 35Q33 15 64 18Q88 18 94 38L91 52 79 39 39 40 32 53Z',
 slick:'M28 59Q16 38 29 23Q42 7 70 17Q96 22 93 54L82 62 81 36Q59 43 34 37Z',
 silverBob:'M24 95L18 47Q23 14 57 12Q94 10 99 47L93 93 78 84 85 36 73 53 56 30 35 44 37 84Z',
 swept:'M25 56L18 34 31 34 30 20 45 27 62 11 86 14 77 26 98 25 94 44 82 54 75 33 56 47 34 37Z',
 mohawk:'M28 59L23 32 35 37 43 14 54 22 63 6 70 20 77 14 81 38 94 31 90 61 81 55 79 42 38 43 37 61Z',
 shaved:'M25 53L23 37Q38 17 65 19Q91 23 97 48L87 56 81 36Q58 29 34 41L34 57Z'};
 if(d.hair==='bun')add('<circle cx="85" cy="24" r="16" fill="'+hair+'"/>');
 if(d.hair==='ponytail')add(path('M83 28Q117 24 107 81L95 99 94 61 84 41Z',hair));
 add(path(hs[d.hair],hair));add('<path d="M33 27Q54 15 79 27" fill="none" stroke="#eee0c5" stroke-width="2.5" opacity=".18"/>');
 if(d.detail==='silver'||d.detail==='temples')add('<path d="M28 38L33 59M88 37L84 59" stroke="#bdc8c9" stroke-width="3" opacity=".75"/>');
 let ey=62+(d.shape==='long'?2:0),gap=d.shape==='broad'?24:d.shape==='heart'?18:21,ew=d.sex==='f'?10:9;
 const eh={bright:4.4,hooded:2.2,gentle:3.4,wide:5,narrow:1.8,smiling:2.6,cat:2.8,icy:2.2}[eye]||3;
 for(const side of [-1,1]){const ex=cx+gap*side,tilt=eye==='cat'||eye==='icy'?-side*2:eye==='gentle'?side*1:0;add('<g transform="rotate('+tilt*2+' '+ex+' '+ey+')">');if(eye==='smiling')add(`<path d="M${ex-ew} ${ey+1}Q${ex} ${ey-7} ${ex+ew} ${ey+1}" fill="none" stroke="${ink}" stroke-width="2.6"/>`);else{add(path(`M${ex-ew} ${ey}Q${ex} ${ey-eh*2} ${ex+ew} ${ey}Q${ex} ${ey+eh*1.8} ${ex-ew} ${ey}Z`,'#f7e8db'));add(`<ellipse cx="${ex+(d.fixed?0:(d.seed%3)-1)}" cy="${ey}" rx="${eh<3?2.5:3.3}" ry="${eh}" fill="${d.clothes==='elite'?d.accent:'#665949'}"/><ellipse cx="${ex}" cy="${ey}" rx="1.5" ry="${Math.min(3,eh)}" fill="#20303a"/><circle cx="${ex+1}" cy="${ey-1.4}" r="1" fill="#fff"/>`);add(`<path d="M${ex-ew} ${ey}Q${ex} ${ey-eh*2} ${ex+ew} ${ey}" fill="none" stroke="${ink}" stroke-width="${d.sex==='f'?2.2:1.9}"/>`);}add('</g>');
 const by=ey-9,btype=brow==='slant'?-side*4:brow==='worried'?side*3:brow==='raised'?-2:0;add(`<path d="M${ex-ew} ${by-btype}Q${ex} ${by-(brow==='arched'?5:2)} ${ex+ew} ${by+btype}" fill="none" stroke="${hair}" stroke-width="${brow==='heavy'?4.5:d.sex==='f'?2.1:3.1}" stroke-linecap="round"/>`);
 }
 if(d.nose==='broad')add(`<path d="M${cx-3} 66L${cx-8} 78Q${cx} 83 ${cx+8} 77M${cx-7} 77L${cx-3} 78M${cx+3} 78L${cx+7} 77" stroke="#8e5f50" fill="none" stroke-width="1.6"/>`);
 else if(d.nose==='small'||d.nose==='round')add(`<path d="M${cx} 70L${cx-2} 77  ${cx+2} 78" stroke="#a27261" fill="none" stroke-width="1.4"/>`);
 else add(`<path d="M${cx+1} 63L${cx-3} 79  ${cx+4} 80" stroke="#9a6958" fill="none" stroke-width="1.6"/><path d="M${cx+2} 65L${cx+4} 74" stroke="#ffe2ca" opacity=".55" stroke-width="1.7"/>`);
 const my=chin-12,mw=d.shape==='broad'?13:mouth==='shy'?5:10;
 if(mouth==='grin'||mouth==='teeth')add(path(`M${cx-mw-2} ${my-2}Q${cx} ${my+2} ${cx+mw+2} ${my-3}Q${cx+1} ${my+13} ${cx-mw-2} ${my-2}Z`,'#814d47')+path(`M${cx-mw} ${my-1}Q${cx} ${my+2} ${cx+mw} ${my-2}L${cx+mw-3} ${my+3}Q${cx} ${my+6} ${cx-mw} ${my-1}Z`,'#fff0dc'));
 else {const bend=['smile','warm','knowing','smirk'].includes(mouth)?(mouth==='warm'?7:4):mouth==='sad'?-5:mouth==='soft'||mouth==='shy'?2:-1;add(`<path d="M${cx-mw} ${my}Q${cx} ${my+bend} ${cx+mw} ${my-(mouth==='smirk'||mouth==='knowing'?3:0)}" fill="none" stroke="#88594f" stroke-width="${d.sex==='f'?2:1.8}" stroke-linecap="round"/>`);if(d.sex==='f')add(`<path d="M${cx-4} ${my+4}H${cx+4}" stroke="#ffdfcc" opacity=".5" stroke-width="1.6"/>`);}
 if(d.sex==='f')add(`<ellipse cx="${cx-23}" cy="76" rx="7" ry="2.6" fill="#cf7e79" opacity="${emotion==='warm'?.36:.16}"/><ellipse cx="${cx+23}" cy="76" rx="7" ry="2.6" fill="#cf7e79" opacity=".16"/>`);
 if(d.detail==='beard')add(path(`M${cx-jaw} 78L${cx-jaw+4} 91 ${cx-7} ${chin-1}H${cx+8}L${cx+jaw-3} 89 ${cx+jaw} 78  ${cx+jaw} 93Q${cx} ${chin+14} ${cx-jaw} 92Z`,hair,'opacity=".85"'));
 if(d.detail==='stubble')add(`<path d="M39 86L41 90M44 91L46 94M51 94L53 97M65 96L67 94M75 93L77 90M81 87L83 84" stroke="${hair}" opacity=".5"/>`);
 if(d.detail==='lines'||d.age>42)add(`<path d="M31 67L25 71M88 67L95 71M41 77L38 86M79 77L82 86M47 47Q60 44 72 47" stroke="#895e50" fill="none" opacity=".4" stroke-width="1.1"/>`);
 if(d.detail==='glasses')add('<path d="M27 58H51V70H27ZM68 58H93V70H68ZM51 61H68" fill="none" stroke="#baa47c" stroke-width="1.8"/>');
 if(d.detail==='scar')add('<path d="M83 53L79 79M82 63L88 64" fill="none" stroke="#f1c2a9" stroke-width="1.8"/>');
 if(d.detail==='freckles')add('<g fill="#aa7460" opacity=".55"><circle cx="39" cy="75" r=".8"/><circle cx="44" cy="77" r=".8"/><circle cx="78" cy="76" r=".8"/><circle cx="82" cy="74" r=".8"/></g>');
 if(d.detail==='mole')add('<circle cx="82" cy="75" r="1.1" fill="#664e47"/>');
 if(d.detail==='earring'||d.detail==='stud')add('<circle cx="'+(cx+cheek+1)+'" cy="76" r="2.3" fill="#e1c48b"/>');
 if(d.detail==='clip')add('<path d="M28 42L38 37M30 47L40 42" stroke="#e0be7a" stroke-width="2.5" stroke-linecap="round"/>');
 add('<path d="M9 20V9H21M99 135H111V123" fill="none" stroke="'+d.accent+'" opacity=".7"/></svg>');return parts.join('');
}
const API={fixed,definition,render};root.KM_PORTRAITS=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:window);
