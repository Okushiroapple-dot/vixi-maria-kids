for s in ['âš½','âž•','âš¡','â–¼','ânci','ândi']:
    try:
        decoded = s.encode('latin1').decode('utf-8')
    except Exception as e:
        decoded = f'ERROR {e}'
    print(repr(s), '=>', repr(decoded))
