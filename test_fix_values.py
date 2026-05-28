import ftfy
for s in ['âš½','âž•','âš¡','â–¼','ânci','ândi']:
    print(repr(s), '=>', repr(ftfy.fix_text(s)))
