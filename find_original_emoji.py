target = b'\xc3\xa2\xc5\xa1\xc2\xa1'
import sys
res=[]
for code in range(0x2600, 0x27C0):
    ch = chr(code)
    b = ch.encode('utf-8')
    # simulate mojibake: bytes interpreted as cp1252 then re-encoded to utf-8
    mis = b.decode('cp1252', errors='replace').encode('utf-8')
    if mis == target:
        res.append(ch)
print(res)
