import re

filepath = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

about_section_regex = re.compile(r'(<section className="adp-section adp-about">.*?</section>)', re.DOTALL)
booking_section_regex = re.compile(r'(<section className="adp-section adp-booking-section".*?</section>)', re.DOTALL)
reviews_section_regex = re.compile(r'(<section className="adp-section adp-reviews adp-tab-pane".*?</section>)', re.DOTALL)
sidebar_booking_regex = re.compile(r'(<div className="adp-sidebar__booking">.*?(?=<!-- Why Book Card -->|\{\/\* Why Book Card \*\/\}))', re.DOTALL)
sidebar_why_regex = re.compile(r'(<div className="adp-sidebar__why">.*?</aside>)', re.DOTALL)

about_match = about_section_regex.search(content)
booking_match = booking_section_regex.search(content)
reviews_match = reviews_section_regex.search(content)
sidebar_booking_match = sidebar_booking_regex.search(content)
sidebar_why_match = sidebar_why_regex.search(content)

if not (about_match and booking_match and reviews_match and sidebar_booking_match and sidebar_why_match):
    print("Could not find all sections.")
    exit(1)

about_html = about_match.group(1)
booking_html = booking_match.group(1)
reviews_html = reviews_match.group(1)
sidebar_booking_html = sidebar_booking_match.group(1).strip()
sidebar_why_html = sidebar_why_match.group(1).strip()

# Clean up sidebar_why_html
# It ends with </aside> which we need to remove since it's no longer in an aside.
sidebar_why_html = sidebar_why_html.replace('</aside>', '')
# Convert the list to horizontal
sidebar_why_html = sidebar_why_html.replace('<div className="adp-sidebar__why-list">', '<div className="adp-sidebar__why-list adp-sidebar__why-list--horizontal">')

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

body_regex = re.compile(r'<div className="adp-body">.*?\{\/\* Trust Badges \*\/\}', re.DOTALL)
content = body_regex.sub(new_body + '\n\n      {/* Trust Badges */}', content)

# Remove the mobile bar
content = re.sub(r'\{\/\* Mobile Sticky Bar \*\/.*?<\/div>\s*\{\/\* SUCCESS MODAL \*\/', '{/* SUCCESS MODAL */', content, flags=re.DOTALL)
# Remove STICKY TABS wrapper if present
content = re.sub(r'\{\/\*  ? ? ? STICKY TABS  ? ? ? \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)
# Remove conditional wraps around sections if they exist
content = re.sub(r'\{\(\!isMobileView \|\| activeTab === \'services\'\) && \(\s*<>\s*', '', content)
content = re.sub(r'\s*<\/>\s*\)\}', '', content)
content = re.sub(r'\{\(\!isMobileView \|\| activeTab === \'reviews\'\) && \(\s*', '', content)
content = re.sub(r'\s*\)\}', '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
