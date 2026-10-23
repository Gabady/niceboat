"""Aggregate the paired measurements without interpreting them as human win rates."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
sha=hashlib.sha256((root/'src/racing.js').read_bytes()).hexdigest()
regular=json.loads((root/'tests/balance-v140.json').read_text());finals=json.loads((root/'tests/finals-v140.json').read_text())
assert len(regular['races'])==40 and len(finals['races'])==4
assert all(r['currentRacingSha256']==sha for r in [regular,finals])
rows=regular['races']
for x in rows:
 assert sum(x['stats'].values())==475 and len(x['skills'])==4
assert all(r[label]['finished'] and r[label]['finishers']>=1 for r in rows+finals['races'] for label in ['before','after'])
fields=['place','earlyLeaderGap','finalLapLeaderGap','duelSeconds','finalLapDuelSeconds','overtakes','lostPositions','faults','finishers']
def group(a):return {label:{k:round(sum(r[label][k] for r in a)/len(a),3) for k in fields} for label in ['before','after']}
groups=[{'stage':stage,'control':control,'pairs':10,**group([r for r in rows if r['stage']==stage and r['control']==control])} for stage in [7,8] for control in ['manual','spectator']]
manualSG=next(x for x in groups if x['stage']==8 and x['control']=='manual')
assert manualSG['after']['earlyLeaderGap']<manualSG['before']['earlyLeaderGap']
assert manualSG['after']['finalLapLeaderGap']<manualSG['before']['finalLapLeaderGap']
report={'build':'140','sourceSha256':sha,'pairedConditions':44,'simulatedRaces':88,'groups':groups,'finals':group(finals['races']),'allPlayerFinishers':True,'afterStartFaults':sum(r['after']['faults'] for r in rows+finals['races']),
 'limitations':['Two fixed seeds/water conditions; not a population win-rate estimate.','Manual uses existing AI as surrogate input with manual-player physics; no human input tests.','Fixed ability total 475 and N/SR/SSR/SSR loadouts, not a full career progression simulation.','Six-boat contact interactions can change individual outcomes non-monotonically.']}
(root/'tests/balance-summary-v140.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
lines=['# V140 実走比較','', '同じシード・対戦相手・機材・コースをV139とV140で走らせた比較です。G1後期と最優秀、5育成タイプ、2水面条件、手動物理と観戦を組み合わせた40条件に、最優秀優勝戦の4条件を加え、計88レースを記録しました。','',
 '手動も既存AIによる代理入力です。人間の勝率や最適操作の結果ではありません。固定能力・固定技能の比較であり、育成全体を通した到達能力の調査ではありません。','',
 '| シリーズ・走行 | 序盤の先頭との差 m | 最終周入口の差 m | 最終周の競り合い 秒 | 着順 |','|---|---:|---:|---:|---:|']
for x in groups:
 label=('G1後期' if x['stage']==7 else '最優秀')+'・'+('手動物理' if x['control']=='manual' else '観戦')
 fmt=lambda k:f"{x['before'][k]:.1f} → {x['after'][k]:.1f}"
 lines.append(f"| {label} | {fmt('earlyLeaderGap')} | {fmt('finalLapLeaderGap')} | {fmt('finalLapDuelSeconds')} | {fmt('place')} |")
lines+=['','各欄は条件群の平均、V139 → V140です。序盤は自艇300 m、最終周入口は自艇1200 m時点の先頭との差。競り合いは自艇と他の未決着艇の進行距離差が15 m以内の時間です。','',
 '## 育成タイプ別の着順','', '| 型 | G1後期・晴れ | G1後期・雨／向かい風 | 最優秀・晴れ | 最優秀・雨／向かい風 |','|---|---:|---:|---:|---:|']
labels={'balanced':'バランス','start':'スタート','straight':'直線・加速','turn':'旋回','power':'フィジカル'}
for kind,label in labels.items():
 a=[next(r for r in rows if r['build']==kind and r['stage']==stage and r['seed']==seed and r['control']=='manual') for stage in [7,8] for seed in [1401,1402]]
 lines.append('| '+label+' | '+' | '.join(str(r['before']['place'])+' → '+str(r['after']['place']) for r in a)+' |')
lines+=['','全タイプの能力合計は475。技能のレア度構成はN・SR・SSR・SSRで統一し、型に沿って技能を選んでいます。各能力・技能ID・完走・追い抜き・距離の生データは `tests/balance-v140.json` を参照してください。','',
 '## 最優秀優勝戦','', '| 条件 | 所持MLR数 | 着順 | 最終周の競り合い 秒 |','|---|---:|---:|---:|']
for r in finals['races']:
 label='晴れ' if r['seed']==1401 else '雨・向かい風'
 lines.append(f"| {label} | {len(r['playerMLR'])} | {r['before']['place']} → {r['after']['place']} | {r['before']['finalLapDuelSeconds']:.1f} → {r['after']['finalLapDuelSeconds']:.1f} |")
lines+=['','優勝戦は全基礎能力105。進出報酬で取得する1個目と、予め1個所持した状態で進出した2個目を比較しました。実際の優勝戦編成とCPUのMLRを使用しています。','',
 f"更新後44条件の自艇はすべて完走。全艇のF/Lは合計{report['afterStartFaults']}件でした。物理挙動・接触の変化により、個別の順位や競り合い時間が必ず改善するわけではありません。",'',
 '技能と基礎能力が高い最優秀の手応えは残ります。高性能選手がG1で優位になることと、最優秀でも同じように勝てることは分けて扱っています。今回のサンプルだけで人間の適正勝率や全構成の勝利可能性を確定することはできません。','']
(root/'BALANCE_V140.md').write_text('\n'.join(lines))
print(json.dumps(report,ensure_ascii=False))
