with open(r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_block(start_str, end_str, start_idx=0):
    start = -1
    for i in range(start_idx, len(lines)):
        if start_str in lines[i]:
            start = i
            break
    if start == -1: return None, -1, -1
    end = -1
    for i in range(start, len(lines)):
        if end_str in lines[i]:
            end = i
            break
    return "".join(lines[start:end+1]), start, end

about_html, _, _ = get_block('<section className="adp-section adp-about">', '</section>')
booking_html, _, _ = get_block('<section className="adp-section adp-booking-section"', '</section>')
reviews_html, _, _ = get_block('<section className="adp-section adp-reviews', '</section>')
sidebar_booking_html, _, _ = get_block('<div className="adp-sidebar__booking">', '<!-- Why Book Card -->')
if not sidebar_booking_html:
    sidebar_booking_html, _, _ = get_block('<div className="adp-sidebar__booking">', '{/* Why Book Card */}')

# Remove the line containing the next comment from sidebar_booking_html
sidebar_booking_html = "\n".join([l for l in sidebar_booking_html.split("\n") if "Why Book Card" not in l and l.strip() != ""])

sidebar_why_html, _, _ = get_block('<div className="adp-sidebar__why">', '</aside>')
sidebar_why_html = "\n".join([l for l in sidebar_why_html.split("\n") if "</aside>" not in l])
sidebar_why_html = sidebar_why_html.replace('adp-sidebar__why-list"', 'adp-sidebar__why-list adp-sidebar__why-list--horizontal"')

# Let's find adp-body start and Trust Badges start
adp_body_start, _, _ = get_block('<div className="adp-body">', '<div className="adp-body">')
_, body_start_idx, _ = get_block('<div className="adp-body">', '<div className="adp-body">')
_, trust_badges_idx, _ = get_block('{/* Trust Badges */}', '{/* Trust Badges */}')

new_body = f"""        <div className="adp-body">
          <div className="adp-row">
            <div className="adp-row-main">
{about_html}
{reviews_html}
            </div>
            <div className="adp-row-side">
{booking_html}
              <aside className="adp-sidebar">
{sidebar_booking_html}
              </aside>
            </div>
          </div>
{sidebar_why_html}
        </div>
"""

new_lines = lines[:body_start_idx] + [new_body] + lines[trust_badges_idx:]
with open(r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
