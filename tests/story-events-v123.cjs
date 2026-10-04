'use strict';
// V123 editorial regression: compare the authored story modules to V122.
// Optional argument: path to the V122 source directory (defaults to sibling V122).
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const baseline = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, 'fixtures/v122-events');
if (!fs.existsSync(path.join(baseline, 'story.js'))) {
  throw new Error('Pass a V122 src directory to compare preserved event rules and effects.');
}
const D = require(path.join(baseline, 'data.js'));
const clone = x => JSON.parse(JSON.stringify(x));
function load(dir) {
  const context = vm.createContext({ module: { exports: {} } });
  vm.runInContext(fs.readFileSync(path.join(dir, 'story-extra.js'), 'utf8'), context);
  const extra = context.module.exports;
  context.require = name => name === './data.js' ? D : name === './story-extra.js' ? extra : {
    dailyArcs: [], daily: [], surges: [], eventDialogue: {}
  };
  context.module = { exports: {} };
  vm.runInContext(fs.readFileSync(path.join(dir, 'story.js'), 'utf8'), context);
  return context.module.exports;
}
const old = load(baseline), current = load(path.join(root, 'src'));
const display = new Set(['title', 'text', 'label', 'reply']);
function rules(value) {
  if (Array.isArray(value)) return value.map(rules);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !display.has(key)).map(([key, v]) => [key, rules(v)]));
}
assert.deepEqual(clone(rules(current.events)), clone(rules(old.events)), 'Event IDs, order, branches, conditions and effects are unchanged');
assert.deepEqual(clone(current.Extra.arcs), clone(old.Extra.arcs), 'Arc IDs and names are unchanged');
assert.deepEqual(clone(current.Extra.bands), clone(old.Extra.bands), 'Fame thresholds are unchanged');
const api = {
  statGrowthRate: () => 1, growthFactor: () => 1,
  growStat: (p, key, gain) => p.stats[key] += gain,
  rewardRarity: (_p, rarity) => rarity,
  acquire: (_c, p, id) => { p.skills.push(id); return { id, duplicate: false }; }
};
function run(S, event, variant, index, money, capped) {
  const c = {
    player: { id: 'editorial-test', stats: Object.fromEntries(D.statKeys.map(k => [k, 65])),
      money, popularity: 100, skills: [], equipment: { motor: { condition: 75 }, prop: { condition: 75 } },
      adjust: { motorSuccess: 50, propSuccess: 50 } },
    stage: 3, status: 'preRace', series: { race: { id: 'editorial-race' }, round: 1 }
  };
  S.ensure(c);
  c.story.pending = { kind: 'event', key: 'test-key', id: event.id, variant, raceId: 'editorial-race' };
  if (event.arc && event.step) c.story.arcs[event.arc] = { step: event.step, route: variant, lastStage: 1 };
  if (capped) c.story.skillStages = [3];
  const result = S.choose(c, 'test-key', index, api);
  assert.ok(result, event.id + ' resolves');
  assert.ok(result.note.length <= 3000, event.id + ' note fits journal limit');
  assert.ok(result.title.length <= 80, event.id + ' title fits journal limit');
  delete c.story.log;
  return clone(c);
}
let choiceRuns = 0;
for (const event of old.events) {
  const next = current.events.find(e => e.id === event.id);
  for (let variant = 0; variant < Math.max(1, event.branches?.length || 0); variant++) {
    for (let index = 0; index < 2; index++) {
      for (const [money, capped] of [[100, false], [0, false], [100, true]]) {
        assert.deepEqual(run(current, next, variant, index, money, capped), run(old, event, variant, index, money, capped),
          `${event.id}, branch ${variant}, choice ${index}, money ${money}, capped ${capped}: state remains identical`);
        choiceRuns++;
      }
    }
  }
}
for (let stage = 0; stage < 9; stage++) for (const arc of ['rookie', 'recovery']) {
  const chapter = current.chapter({ stage, campaign: { arc } });
  assert.equal(chapter.length, 2);
  assert.ok(chapter[0].length <= 80);
  assert.ok(chapter[1].length <= 3000);
}
const generic = /の動作を確認し、短い練習で試した|相手に直接話し、次に会う時の予定も伝えた|気になったことを聞き、説明を最後まで確かめた/;
assert.ok(!generic.test(JSON.stringify(current.Extra.events)), 'Generic repeated result templates removed');
const report = { version: 123, passed: true, eventsReviewed: old.events.length,
  extraEvents: old.Extra.events.length, chapters: 18, choiceRuns,
  rulesPreserved: true, branchesPreserved: true, insufficientFundsAndSkillCapCovered: true,
  scope: 'story-extra.js and story.js, excluding drama-data.js dialogue overrides' };
fs.writeFileSync(path.join(__dirname, 'story-events-v123.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
