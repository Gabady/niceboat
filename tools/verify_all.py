"""Verify complete HTML/CSS/script/asset parity, not just build labels."""
from pathlib import Path
import re
import json
import hashlib
import base64

root = Path(__file__).resolve().parents[1]
base = (root / 'index.html').read_text()
names = json.loads((root / 'tools/script_order.json').read_text())
guard = (root / 'tools/iphone-support.js').read_text().strip()
digest = hashlib.sha256(base.encode()).hexdigest()
pattern = r'<script[^>]*>(.*?)</script>'
core = re.findall(pattern, base, re.S)
assert len(core) == len(names)
report = {'build': re.search(r"build:'(\d+)'", core[0])[1], 'sourceSha256': digest, 'entries': []}
for file, platform in [('index_android_safe.html', 'Android'), ('index_iphone_safe.html', 'iPhone')]:
    html = (root / file).read_text()
    html = html.replace(' | ' + platform + ' Safe</title>', '</title>', 1)
    html = html.replace('<meta name="safe-source-sha256" content="' + digest + '">\n', '', 1)
    if platform == 'iPhone':
        html = html.replace('<script>\n' + guard + '\n</script>\n', '', 1)
    assert html == base, file + ': full HTML mismatch'
    report['entries'].append({'file': file, 'fullContentEqual': True})

for file in ['index_editable.html', 'web/index.html']:
    location = root / file
    html = location.read_text()
    def inline(m):
        source = location.parent / m[1]
        return '<script>' + source.read_text() + '</script>'
    html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
    if file.startswith('web/'):
        inline_scripts = list(re.finditer(pattern, html, re.S))
        assert inline_scripts[0][1].strip() == guard
        html = html[:inline_scripts[0].start()] + html[inline_scripts[0].end():]
        assets = json.loads((root / 'web/assets-manifest.json').read_text())
        for name, meta in assets.items():
            raw = (root / 'web/assets' / name).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == meta['sha256']
            html = html.replace('assets/' + name, 'data:' + meta['mime'] + ';base64,' + base64.b64encode(raw).decode())
    actual = re.findall(pattern, html, re.S)
    assert [s.strip() for s in actual] == [s.strip() for s in core], file + ': script mismatch'
    # Whitespace between adjacent scripts differs in the iPhone web wrapper only.
    frame = lambda x: re.sub(r'\s+', ' ', re.sub(pattern, '<script></script>', x, flags=re.S)).strip()
    assert frame(html) == frame(base), file + ': HTML/CSS mismatch'
    report['entries'].append({'file': file, 'fullContentEqual': True})
(root / 'tests/parity-v121.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print('基本・Android Safe・iPhone Safe・編集用・素材分離版：内容一致 PASS')
