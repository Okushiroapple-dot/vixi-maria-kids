from pathlib import Path
p = Path('index.html')
text = p.read_text(encoding='utf-8')
for token in ['Frete GrÃ¡tis', 'CartÃ£o', 'Trocas em atÃ© 30 dias', 'O que a sua crianÃ§a vai adorar ðŸŒˆ', 'â†’', 'âœ¨', 'ðŸŒ¸', 'ðŸ’«', 'ðŸšš', 'ðŸ’³', 'ðŸ”„', 'ðŸ’–']:
    print(repr(token), '=>', token.encode('latin-1').decode('utf-8'))

sample = text[text.index('Frete GrÃ¡tis')-20:text.index('Frete GrÃ¡tis')+40]
print('sample', repr(sample))
print('sample fixed', sample.encode('latin-1').decode('utf-8'))

fixed = text.encode('latin-1').decode('utf-8')
print('fixed contains Grátis?', 'Grátis' in fixed)
print('fixed contains Cartão?', 'Cartão' in fixed)
print('fixed contains Trocas em até 30 dias?', 'Trocas em até 30 dias' in fixed)
print('fixed has 🌸?', '🌸' in fixed)
print('fixed has ✨?', '✨' in fixed)
print('fixed has 🛍️?', '🛍️' in fixed)
print('fixed snippet', fixed[fixed.index('Frete Grátis')-20:fixed.index('Frete Grátis')+40])
