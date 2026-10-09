/* V129: hard career rules and idempotent SG rewards. */
(function(root){'use strict';
const D=root.KM_DATA||(typeof require==='function'?require('./data.js'):null);
const copy=x=>JSON.parse(JSON.stringify(x)),hard=p=>p?.difficulty==='hard';
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;};
function promote(v){const bands=[0,35,50,65,80,90,101,121];if(v>=101)return Math.min(120,v);let i=0;while(v>=bands[i+1])i++;return Math.min(120,Math.round((bands[i+1]+(v-bands[i])/(bands[i+1]-bands[i])*(bands[i+2]-bands[i+1]))*100)/100);}
function npc(c,p){if(!hard(c.player)||p.id===c.player.id)return p;const stamp=D.statKeys.map(k=>p.stats[k]).join('|');if(p.hardStats129===stamp)return p;p.difficulty='hard';for(const k of D.statKeys)p.stats[k]=promote(p.stats[k]);p.hardStats129=D.statKeys.map(k=>p.stats[k]).join('|');return p;}
function initial(p){const q=copy(p);if(hard(q))for(const k of D.statKeys)q.stats[k]=Math.min(120,Math.round(q.stats[k]*1.2*100)/100);return q;}
function pool(p){const preferred=p.skills.map(id=>D.abilityMap['mlr_'+id]).filter(Boolean);const all=D.abilities.filter(a=>a.rarity==='MLR'&&!p.skills.includes(a.id));const best=preferred.filter(a=>!p.skills.includes(a.id));return best.length?best:all;}
function award(c,key,reason,api){if(!hard(c.player))return null;const h=c.hard129||(c.hard129={awarded:[],wins:0,settled:[]});if(h.awarded.includes(key))return null;const a=pool(c.player);if(!a.length)return null;const skill=a[hash(c.player.id+':'+key)%a.length];h.awarded.push(key);return api.acquire(c,c.player,skill.id,reason);}
function finalGrid(c,people,type,api){if(!hard(c.player)||c.stage!==8||type!=='championship')return people;if(people.some(p=>p.id===c.player.id))award(c,'final','最優秀・優勝戦進出',api);return people.map(p=>{if(p.id===c.player.id)return c.player;const q=copy(p);q.skills=q.skills.filter(id=>D.abilityMap[id].rarity!=='MLR');const candidates=pool(q),chosen=candidates[hash(q.id+':sg-final')%candidates.length];q.skills.push(chosen.id);q.mastery[chosen.id]=1;return q;});}
function settle(c,r,z,api){if(!hard(c.player)||c.stage!==8)return;const h=c.hard129||(c.hard129={awarded:[],wins:0,settled:[]});if(h.settled.includes(r.id))return;h.settled.push(r.id);if(z.startFault||z.capsized||z.dnf)return;const take=(key,reason)=>{const a=award(c,key,reason,api);if(a)z.acquired.push(a);};
 if(r.type==='qualifier'&&z.place===1){h.wins++;if(h.wins>=2)take('wins','最優秀・予選2勝');}
 if(r.type==='championship'&&z.place<=3)take('podium','最優秀・優勝戦3着以内');
 if(r.type==='championship'&&z.place===1)take('champion','最優秀・シリーズ制覇');
}
function valid(h){return h===undefined||!!h&&Array.isArray(h.awarded)&&h.awarded.length<=4&&new Set(h.awarded).size===h.awarded.length&&h.awarded.every(x=>['wins','final','podium','champion'].includes(x))&&Number.isInteger(h.wins)&&h.wins>=0&&h.wins<=5&&Array.isArray(h.settled)&&h.settled.length<=6&&new Set(h.settled).size===h.settled.length&&h.settled.every(x=>typeof x==='string'&&x.length<120);}
const H={hard,promote,npc,initial,pool,award,finalGrid,settle,valid};root.KM_HARD129=H;if(typeof module!=='undefined'&&module.exports)module.exports=H;
})(globalThis);
