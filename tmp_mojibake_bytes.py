from pathlib import Path
text = Path('index.html').read_text(encoding='utf-8')
b = Path('index.html').read_bytes()
for s in ['Frete Gr', 'Cart', 'Trocas em at', 'â†’', 'âœ¨', 'ðŸŒ', 'ðŸ’', 'ðŸ‘']:
    i = text.find(s)
    print(repr(s), i)
    if i != -1:
        print(b[max(0, i-20):i+40])
