from pathlib import Path
import re
text=Path('index.html').read_text('utf-8',errors='replace')
bad=set(re.findall(r'(?:ðŸ[^\s<>"\']+|â[^\s<>"\']+|Ã[^\s<>"\']+|â™¡|âœ¨|âš½)', text))
print('UNIQUE BAD TOKENS:')
for tok in sorted(bad):
    print(repr(tok))
print()
print('BAD LINES:')
for i,line in enumerate(text.splitlines(),1):
    if re.search(r'ðŸ|â[^\s<>"\']|Ã[^\s<>"\']|â™¡|âœ¨|âš½', line):
        print(i, line)
