from pathlib import Path
import re, ftfy
raw = Path('index.html').read_bytes()
text = raw.decode('utf-8', errors='replace')
fixed = ftfy.fix_text(text)
for i in range(3):
    fixed = ftfy.fix_text(fixed)
patterns = set(re.findall(r'(â[^"]{1,3}|Ã[^"]{1,3}|ðŸ[^"]{1,3}|Â[^"]{1,3}|ï[^"]{1,3})', fixed))
print('num patterns', len(patterns))
for pat in sorted(patterns):
    print(repr(pat), 'count', fixed.count(pat))
print('\nSample remaining bad lines:')
for line in fixed.splitlines():
    if re.search(r'â[^"]|Ã[^"]|ðŸ|Â', line):
        print(line)
        if sum(1 for _ in re.finditer(r'â[^"]|Ã[^"]|ðŸ|Â', line))>5:
            break
