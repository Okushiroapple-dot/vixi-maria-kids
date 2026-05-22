from pathlib import Path
text = Path('index.html').read_text(encoding='utf-8')
for s in ['Frete GrÃ¡tis', 'CartÃ£o', 'Trocas em atÃ© 30 dias', 'â†’', 'âœ¨', 'ðŸŒ¸', 'ðŸ’«', 'ðŸŒŸ', 'ðŸŽ€', 'ðŸšš', 'ðŸ’³', 'ðŸ”„', 'ðŸ’–', 'ðŸŒˆ', 'ðŸ‘§', 'ðŸ‘¦', 'ðŸ‘¶']:
    print('orig', s)
    for enc_dec in [
        ('latin1->utf8', lambda t: t.encode('latin-1', errors='replace').decode('utf-8', errors='replace')),
        ('utf8->latin1', lambda t: t.encode('utf-8', errors='replace').decode('latin-1', errors='replace')),
    ]:
        try:
            print(' ', enc_dec[0], '=>', enc_dec[1](s))
        except Exception as e:
            print(' ', enc_dec[0], 'error', e)
    print()
# apply to full file with utf8->latin1 and see snippet
try:
    fixed = text.encode('utf-8', errors='replace').decode('latin-1', errors='replace')
    print('fixed snippet', fixed[fixed.index('Frete Gr'):fixed.index('Frete Gr')+30])
except Exception as e:
    print('full fix error', e)
