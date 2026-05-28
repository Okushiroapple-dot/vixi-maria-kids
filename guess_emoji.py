for char in ['✱','✦','✨','✪','✷','✹','✰','✡','✬']:
    b = char.encode('utf-8')
    bad = b.decode('cp1252', errors='replace').encode('utf-8')
    print(char, repr(b), repr(bad), bad.decode('utf-8', errors='replace'))
