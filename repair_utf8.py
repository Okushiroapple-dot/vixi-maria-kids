from pathlib import Path
import ftfy

repair_mapping = {
    'âš½': '👦',
    'âž•': '➕',
    'âš¡': '⚡',
    'â–¼': '▼',
}

# Repair index.html content
path = Path('index.html')
text = path.read_text(encoding='utf-8')
fixed = ftfy.fix_text(text)
for _ in range(2):
    fixed = ftfy.fix_text(fixed)
for bad, good in repair_mapping.items():
    fixed = fixed.replace(bad, good)
# Run again to clean up any indirect remnants
fixed = ftfy.fix_text(fixed)
fixed = fixed.lstrip('\ufeff')
path.write_text(fixed, encoding='utf-8')

# Normalize all project text files to UTF-8 without BOM
extensions = ['*.html', '*.css', '*.js', '*.json', '*.php', '*.txt', '*.md']
root = Path('.')
for ext in extensions:
    for p in root.glob(ext):
        if p.name in {'index.html.bak', 'index.fixed.html', 'repair_utf8.py', 'check_encoding.py', 'inspect_encoding.py', 'test_repair.py', 'test_fix_values.py', 'test_fix_values2.py', 'inspect_bytes.py', 'show_ctx.py', 'guess_emoji.py', 'find_original_emoji.py'}:
            continue
        data = p.read_text(encoding='utf-8', errors='replace')
        if data.startswith('\ufeff'):
            data = data.lstrip('\ufeff')
        p.write_text(data, encoding='utf-8')

print('Repaired index.html and normalized text files to UTF-8 without BOM.')
