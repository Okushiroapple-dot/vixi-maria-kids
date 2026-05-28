from pathlib import Path
import re
print('CHECK FILES')
for ext in ['*.html','*.css','*.js','*.json','*.php','*.txt','*.md']:
    for p in Path('.').glob(ext):
        if p.name in {'index.html.bak', 'index.fixed.html'}:
            continue
        data = p.read_bytes()
        bom = data.startswith(b'\xef\xbb\xbf')
        try:
            data.decode('utf-8')
            good = True
        except Exception as e:
            good = False
        print(p, 'bom' if bom else 'nobom', 'utf8' if good else 'bad', 'size', len(data))
print('SEARCH PATTERNS')
regex = re.compile(r'Ã|â|ðŸ|ï¸|âš½|âž•|âš¡|â–¼|âœ¨|â†’')
for p in Path('.').glob('*.{html,css,js,json,php,txt,md}'):
    text = p.read_text(encoding='utf-8', errors='replace')
    if regex.search(text):
        print('BAD TEXT', p)
