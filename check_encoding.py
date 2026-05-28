from pathlib import Path
import os
path = Path('.')
for ext in ['*.html','*.css','*.js','*.json','*.php','*.txt','*.md']:
    for p in path.glob(ext):
        data = p.read_bytes()
        bom = data.startswith(b'\xef\xbb\xbf')
        try:
            data.decode('utf-8')
            good = True
        except Exception as e:
            good = False
        print(p, 'bom' if bom else 'nobom', 'utf8' if good else 'bad', 'size', len(data))
