from pathlib import Path
import re

def inspect(path, patterns):
    data = Path(path).read_bytes()
    print('FILE', path, 'bytes', len(data))
    try:
        txt = data.decode('utf-8')
    except Exception as e:
        print('  utf-8 decode failed:', e)
        txt = None
    try:
        cp = data.decode('cp1252')
    except Exception as e:
        print('  cp1252 decode failed:', e)
        cp = None
    for pat in patterns:
        print('\nPATTERN', pat)
        if txt is not None:
            i = txt.find(pat)
            print(' utf8 index', i)
            if i != -1:
                print('  utf8 chars:', repr(txt[i:i+20]))
                print('  bytes:', data[max(0,i-20):i+40])
        if cp is not None:
            i2 = cp.find(pat)
            print(' cp1252 index', i2)
            if i2 != -1:
                print('  cp1252 chars:', repr(cp[i2:i2+20]))
                print('  bytes:', data[max(0,i2-20):i2+40])

patterns = ['â€”','Ã©','ðŸ','Ã£','Â','âš½','âž•','âœ¨','â†’','â€º']
inspect('index.html', patterns)
print('\n' + '='*80 + '\n')
inspect('index.html.bak', patterns)
