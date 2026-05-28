from pathlib import Path
import re
patterns = ['âš½','âž•','âš¡','â–¼','ânci','ândi']
raw = Path('index.html').read_bytes()
for p in patterns:
    b = p.encode('utf-8')
    idx = raw.find(b)
    print('PATTERN', p, 'idx', idx, 'bytes', b)
    if idx != -1:
        print(' surrounding bytes', raw[max(0,idx-10):idx+len(b)+10])
        print('decoded as utf-8 around:', raw[max(0,idx-10):idx+len(b)+10].decode('utf-8', errors='replace'))
        try:
            print('decoded as cp1252 around:', raw[max(0,idx-10):idx+len(b)+10].decode('cp1252'))
        except Exception as e:
            print('cp1252 decode err', e)
    print()
