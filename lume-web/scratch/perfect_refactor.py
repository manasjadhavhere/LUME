import re

filepath = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove adp-tabs-wrapper (ribbon 2nd image)
content = re.sub(r'\{\/\*  ? ? ? STICKY TABS  ? ? ? \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)
content = re.sub(r'\{\/\*  ? ? ? STICKY TABS  ? ? ? \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)

# 2. Extract sections
about_section_regex = re.compile(r'(<section className="adp-section adp-about">.*?</section>)', re.DOTALL)
booking_section_regex = re.compile(r'(<section className="adp-section adp-booking-section".*?</section>)', re.DOTALL)
reviews_section_regex = re.compile(r'(<section className="adp-section adp-reviews adp-tab-pane".*?</section>)', re.DOTALL)

about_html = about_section_regex.search(content).group(1)
booking_html = booking_section_regex.search(content).group(1)
reviews_html = reviews_section_regex.search(content).group(1)

# Sidebar extracting
sidebar_booking_regex = re.compile(r'(<div className="adp-sidebar__booking">.*?(?=<!-- Why Book Card -->|\{\/\* Why Book Card \*\/\}))', re.DOTALL)
sidebar_booking_html = sidebar_booking_regex.search(content).group(1).strip()

sidebar_why_regex = re.compile(r'(<div className="adp-sidebar__why">.*?</aside>)', re.DOTALL)
sidebar_why_html = sidebar_why_regex.search(content).group(1).strip()
sidebar_why_html = sidebar_why_html.replace('</aside>', '')
sidebar_why_html = sidebar_why_html.replace('adp-sidebar__why-list"', 'adp-sidebar__why-list adp-sidebar__why-list--horizontal"')

# Create the new layout block
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

# Replace the entire adp-body up to Trust Badges
body_regex = re.compile(r'<div className="adp-body">.*?\{\/\* Trust Badges \*\/\}', re.DOTALL)
content = body_regex.sub(new_body + '\n\n      {/* Trust Badges */}', content)

# Remove the mobile bar
content = re.sub(r'\{\/\* Mobile Sticky Bar \*\/.*?<\/div>\s*\{\/\* SUCCESS MODAL \*\/', '{/* SUCCESS MODAL */', content, flags=re.DOTALL)

# Now, we need to remove all the conditional renders that wrapper `about_html`, `booking_html`, `reviews_html`
# Wait, because we completely replaced the body, the old wrappers that were inside `<div className="adp-main">` are GONE!
# Because our regex pulled JUST the inner `<section>` !
# And we threw away everything else from `<div className="adp-body">` to Trust Badges.
# This means there shouldn't be any lingering `)}` from the wrappers since they were discarded!

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
