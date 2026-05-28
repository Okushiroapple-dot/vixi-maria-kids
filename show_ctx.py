from pathlib import Path
text = Path('index.html').read_text(encoding='utf-8')
for pat in ['âš½ Meninos','âž• Novo produto','âš¡','Roupas â–¼']:
    idx = text.find(pat)
    print('PATTERN', repr(pat), 'idx', idx)
    if idx != -1:
        start = text.rfind('\n', 0, idx) + 1
        end = text.find('\n', idx)
        print(text[start:end])
        print('---')
