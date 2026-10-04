"""Generate both mobile entrypoints from the complete canonical index.html."""
from pathlib import Path
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]


def sync_safe(root=ROOT):
    base = (root / 'index.html').read_text()
    title = re.search(r'<title>(.*?)</title>', base, re.S)
    first_script = re.search(r'<script(?:\s[^>]*)?>', base)
    if not title or not first_script:
        raise ValueError('基本HTMLのtitleまたはscriptが見つかりません')
    if 'safe-source-sha256' in base:
        raise ValueError('基本HTMLにはSafe版ではなくindex.htmlを指定してください')
    guard = (root / 'tools/iphone-support.js').read_text().strip()
    if '</script' in guard.lower():
        raise ValueError('iPhone補助処理にscript終端タグが含まれています')
    digest = hashlib.sha256(base.encode()).hexdigest()
    outputs = []
    for platform in ('Android', 'iPhone'):
        html = base
        if platform == 'iPhone':
            at = first_script.start()
            html = html[:at] + '<script>\n' + guard + '\n</script>\n' + html[at:]
        html = html.replace(title.group(), '<title>' + title[1] + ' | ' + platform + ' Safe</title>', 1)
        html = html.replace('</head>', '<meta name="safe-source-sha256" content="' + digest + '">\n</head>', 1)
        outputs.append((root / ('index_' + platform.lower() + '_safe.html'), html))
    for file, html in outputs:
        file.write_text(html)
    return digest


if __name__ == '__main__':
    print('基本HTMLからAndroid Safe・iPhone Safeを同期しました。SHA-256: ' + sync_safe())
