import re

with open(r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

config_start = r'\{\/\* ═══ BOOKING CONFIGURATOR ═══ \*\/\}'
config_end = r'<\/section>'
# find all matches
matches = list(re.finditer(f"{config_start}.*?{config_end}", content, re.DOTALL))

if len(matches) > 1:
    # remove the second one
    match_2 = matches[1]
    content = content[:match_2.start()] + content[match_2.end():]
    
with open(r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Removed {len(matches) - 1} extra configurators.")
