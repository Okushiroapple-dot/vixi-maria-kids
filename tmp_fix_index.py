from pathlib import Path
import ftfy
path = Path('index.html')
text = path.read_text(encoding='utf-8')
fixed = ftfy.fix_text(text)
print('same' if text == fixed else 'changed')
Path('index.fixed.html').write_text(fixed, encoding='utf-8')
print('wrote index.fixed.html')
