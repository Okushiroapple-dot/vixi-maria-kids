from pathlib import Path
text = Path('index.html').read_text(encoding='utf-8')
for bad in ['âš½','âž•','âš¡','â–¼']:
    i = text.find(bad)
    if i>=0:
        print(bad, [hex(ord(c)) for c in bad], 'found at', i)
        print(repr(text[i-4:i+4]))
