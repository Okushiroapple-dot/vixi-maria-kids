from pathlib import Path
path = Path('index.html')
b = path.read_bytes()
print('BOM', b.startswith(b'\xef\xbb\xbf'))
print('first bytes', b[:40])
text = path.read_text(encoding='utf-8')
bad_tokens = ['Ã', 'ðŸ', 'ï¸', 'âš½', 'âž•', 'âš¡', 'â–¼', 'âœ¨', 'â†’']
found = [tok for tok in bad_tokens if tok in text]
print('bad tokens found:', found)
print('first 200 chars:')
print(text[:200])
