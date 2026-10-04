"""Build every HTML entrypoint, then verify content parity."""
from pathlib import Path
import subprocess
import sys
import re
import json

root = Path(__file__).resolve().parents[1]
for name in ('rebuild.py', 'rebuild_web.py'):
    subprocess.run([sys.executable, str(root / 'tools' / name)], check=True)
names = iter(json.loads((root / 'tools/script_order.json').read_text()))
html = (root / 'index.html').read_text()
editable = re.sub(r'<script[^>]*>.*?</script>',
                  lambda m: '<script src="src/' + next(names) + '.js"></script>',
                  html, flags=re.S)
(root / 'index_editable.html').write_text(editable)
subprocess.run([sys.executable, str(root / 'tools/verify_all.py')], check=True)
