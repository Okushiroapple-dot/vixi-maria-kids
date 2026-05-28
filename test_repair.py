from pathlib import Path
import ftfy
raw = Path('index.html').read_bytes()
print('raw len', len(raw))
for name, decoded in [
    ('utf-8', raw.decode('utf-8', errors='replace')),
    ('latin1', raw.decode('latin1')),
    ('cp1252', raw.decode('cp1252', errors='replace')),
]:
    print('\n===', name, '===')
    text = decoded
    print('sample:', repr(text[120:180]))
    fixed = ftfy.fix_text(text)
    print('fixed sample:', repr(fixed[120:180]))
    print('contains â€”?', 'â€”' in fixed, 'contains —?', '—' in fixed)
    for pat in ['Ã©','Ã£','ðŸ','âš½','âž•','âœ¨','â†’','â€”','Â']:
        if pat in fixed:
            print('  still has', pat)
    print('---')
    if name == 'latin1':
        print('latin1->utf8 decode test first broken sample:')
        try:
            print(text.encode('cp1252', errors='replace').decode('utf-8', errors='replace')[120:180])
        except Exception as e:
            print('fail', e)

# Try fix_encoding separately on utf-8 decode
utf_text = raw.decode('utf-8', errors='replace')
enc_fixed = ftfy.fix_encoding(utf_text)
print('\n=== ftfy.fix_encoding on utf-8 decode ===')
print(repr(enc_fixed[120:180]))
for pat in ['Ã©','Ã£','ðŸ','âš½','âž•','âœ¨','â†’','â€”','Â']:
    if pat in enc_fixed:
        print('  still has', pat)
print('has em dash?', '—' in enc_fixed)

# Try encode cp1252 decode utf8 on utf-8 decoded text
try:
    roundfix = utf_text.encode('cp1252', errors='replace').decode('utf-8', errors='replace')
    print('\n=== cp1252 roundtrip ===')
    print(repr(roundfix[120:180]))
    for pat in ['Ã©','Ã£','ðŸ','âš½','âž•','âœ¨','â†’','â€”','Â']:
        if pat in roundfix:
            print('  still has', pat)
    print('has em dash?', '—' in roundfix)
except Exception as e:
    print('cp1252 roundtrip error', e)
