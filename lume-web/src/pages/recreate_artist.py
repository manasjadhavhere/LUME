import re

filepath = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove adp-tabs-wrapper
content = re.sub(r'\{\/\* ═══ STICKY TABS ═══ \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)

# 2. Remove adp-mobile-bar
content = re.sub(r'\{\/\* Mobile Sticky Bar \*\/.*?<\/div>\s*\{\/\* SUCCESS MODAL \*\/', '{/* SUCCESS MODAL */', content, flags=re.DOTALL)

# 3. Add services to Occasion step
services_html = """
                          {artist.services && artist.services.length > 0 && (
                            <div className="adp-specific-services" style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                              <h4 style={{ fontSize: '0.85rem', color: 'var(--mid)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specific Services</h4>
                              {artist.services.filter(s => s.isActive).map(svc => {
                                const isActive = selectedServiceId === svc.id;
                                return (
                                  <button key={svc.id} type="button"
                                    onClick={() => { setSelectedServiceId(svc.id); setSelectedPriceType('OCCASION'); }}
                                    className={`adp-package-btn ${isActive ? 'adp-package-btn--active' : ''}`}
                                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: isActive ? '2px solid var(--dark)' : '1px solid #f3f4f6', background: isActive ? '#f9fafb' : '#fafafa', cursor: 'pointer', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '1rem' }}>{svc.icon}</span>
                                      <span className="adp-package-btn__label" style={{ fontSize: '0.9rem' }}>{svc.name}</span>
                                    </div>
                                    <span className="adp-package-btn__price" style={{ fontSize: '0.9rem' }}>
                                      ₹{svc.price.toLocaleString()} <span className="adp-checkout-gst">+ GST</span>
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
"""
content = content.replace(
    '                  })}</span>\n                        </span>\n                      </button>\n                    );\n                  })}\n                </div>',
    '                  })}</span>\n                        </span>\n                      </button>\n                    );\n                  })}\n' + services_html + '\n                </div>'
)

# 4. Restructure Layout
# Replace the whole structure from `adp-configurator` to the end of `adp-sidebar` with the new grid structure.

# Let's write the result back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
