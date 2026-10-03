import re

filepath = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove adp-tabs-wrapper (ribbon 2nd image)
content = re.sub(r'\{\/\* ═══ STICKY TABS ═══ \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)

# 2. Add services to Occasion step.
# Wait, I don't want to use regex, let's just do exact string replace.
target_occasion_btn = """                  })
                )}
              </div>
            </div>"""
services_html = """                  })
                )}
                
                {/* Specific Services */}
                {artist.services && artist.services.length > 0 && (
                  <div className="adp-specific-services" style={{ marginTop: '12px', borderTop: '1.5px solid rgba(42,26,31,0.14)', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Specific Services</h4>
                    {artist.services.filter(s => s.isActive).map(svc => {
                      const isActive = selectedServiceId === svc.id;
                      return (
                        <button key={svc.id} type="button"
                          onClick={() => { setSelectedServiceId(svc.id); setSelectedPriceType('OCCASION'); }}
                          className={`adp-package-btn ${isActive ? 'adp-package-btn--active' : ''}`}
                          style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: isActive ? '2px solid var(--dark)' : '1px solid rgba(42,26,31,0.12)', background: isActive ? 'var(--dark)' : 'white', color: isActive ? 'white' : 'var(--dark)', cursor: 'pointer', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>{svc.icon}</span>
                            <span className="adp-package-btn__label" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{svc.name}</span>
                          </div>
                          <span className="adp-package-btn__price" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                            ₹{svc.price.toLocaleString()} <span className="adp-checkout-gst" style={{ fontSize: '0.75rem', fontWeight: 500, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-soft)' }}>+ GST</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>"""
content = content.replace(target_occasion_btn, services_html)


# 3. Rename "Reviews" to "Client Testimonials"
content = content.replace("Reviews & Ratings", "Client Testimonials")
content = content.replace("({artist.reviewCount} reviews)", "({artist.reviewCount} client testimonials)")


# 4. Now we want to group "About" and "Testimonials" into one row, and "Booking" and "Why Book" into another.
# We will just rewrite the `adp-body` grid completely.
# Let's extract the raw HTML of the sections.
# To avoid missing things, we'll find them using strings.

about_section_regex = re.compile(r'(<section className="adp-section adp-about">.*?</section>)', re.DOTALL)
booking_section_regex = re.compile(r'(<section className="adp-section adp-booking-section".*?</section>)', re.DOTALL)
reviews_section_regex = re.compile(r'(<section className="adp-section adp-reviews adp-tab-pane".*?</section>)', re.DOTALL)
sidebar_regex = re.compile(r'(<aside className="adp-sidebar">.*?</aside>)', re.DOTALL)

about_html = about_section_regex.search(content).group(1)
booking_html = booking_section_regex.search(content).group(1)
reviews_html = reviews_section_regex.search(content).group(1)
sidebar_html = sidebar_regex.search(content).group(1)

# Now, we build the new layout:
new_body = f"""        <div className="adp-body">
          <div className="adp-row">
            <div className="adp-row-main">
              {booking_html}
            </div>
            <div className="adp-row-side">
              {sidebar_html}
            </div>
          </div>
          
          <div className="adp-row">
            <div className="adp-row-main">
              {about_html}
            </div>
            <div className="adp-row-side">
              {reviews_html}
            </div>
          </div>
        </div>
"""

# Replace everything from `<div className="adp-body">` down to `{/* Trust Badges */}`
body_regex = re.compile(r'<div className="adp-body">.*?\{\/\* Trust Badges \*\/\}', re.DOTALL)
content = body_regex.sub(new_body + '\n\n      {/* Trust Badges */}', content)

# Remove the mobile bar
content = re.sub(r'\{\/\* Mobile Sticky Bar \*\/.*?<\/div>\s*\{\/\* SUCCESS MODAL \*\/', '{/* SUCCESS MODAL */', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
