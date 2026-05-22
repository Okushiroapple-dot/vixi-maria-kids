import ftfy
for s in ['âš½','âž•','âš¡','â–¼']:
    b = s.encode('utf-8')
    print('s', repr(s), 'bytes', b)
    for enc in ['latin1','cp1252','utf-8']:
        try:
            dec = b.decode(enc)
            print(' decode', enc, repr(dec))
            print('  ftfy.fix_text =>', repr(ftfy.fix_text(dec)))
            print('  ftfy.fix_encoding =>', repr(ftfy.fix_encoding(dec)))
        except Exception as e:
            print(' decode', enc, 'ERR', e)
    print('---')
