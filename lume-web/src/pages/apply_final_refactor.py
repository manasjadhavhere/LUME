import re
import os

filepath = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

configurator_html = """
      {/* ═══ BOOKING CONFIGURATOR ═══ */}
      <section className="adp-configurator" ref={servicesRef} id="services">
        <div className="adp-configurator__inner">
          <h2 className="adp-configurator__title">Curate Your Session</h2>
          <div className="adp-configurator__grid">
            
            {/* Step 1: Occasion */}
            <div className="adp-config-step">
              <div className="adp-config-step__header">
                <span className="adp-config-step__num">1</span>
                <h3>Occasion</h3>
              </div>
              
              {availPriceTypes.length > 0 ? (
                <div className="adp-packages" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availPriceTypes.map(pt => {
                    const prices = { WEDDING: artist.weddingPrice, OCCASION: artist.occasionPrice, HOURLY: artist.hourlyPrice };
                    const isActive = selectedPriceType === pt;
                    return (
                      <button key={pt} type="button"
                        onClick={() => { setSelectedPriceType(pt); setSelectedServiceId(null); }}
                        className={`adp-package-btn ${isActive ? 'adp-package-btn--active' : ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', border: isActive ? '2px solid var(--dark)' : '1px solid #e5e7eb', background: isActive ? '#f9fafb' : 'white', cursor: 'pointer' }}>
                        <span className="adp-package-btn__label" style={{ fontWeight: 600 }}>
                          {PRICE_TYPE_LABELS[pt]}
                        </span>
                        <span className="adp-package-btn__price" style={{ fontWeight: 700 }}>
                          ₹{(prices[pt] || 0).toLocaleString()}{pt === 'HOURLY' ? '/hr' : ''} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-soft)' }}>+ GST</span>
                        </span>
                      </button>
                    );
                  })}
                  
                  {/* Specific Services */}
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

                </div>
              ) : (
                <div style={{ padding: 16, background: 'rgba(42,26,31,0.04)', borderRadius: 12, color: 'var(--mid)', fontSize: '0.88rem' }}>
                  This artist hasn't added services yet. Contact them directly.
                </div>
              )}
            </div>

            {/* Step 2: Date & Time */}
            <div className="adp-config-step">
              <div className="adp-config-step__header">
                <span className="adp-config-step__num">2</span>
                <h3>Date & Time</h3>
              </div>
              
              <div style={{ marginBottom: 12, fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>Select Date</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                {upcomingDates.map(dateStr => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const isBlocked = availability?.blockedDates.some(b => b.date.startsWith(dateStr));
                  const slots = (() => {
                    const override = availability?.availability.find(a => a.date.startsWith(dateStr));
                    if (override) return override.timeSlots.filter((s: any) => s.available).length;
                    const dow = d.getDay();
                    const def = availability?.defaultSchedule.find(ds => ds.dayOfWeek === dow);
                    return def ? (def.timeSlots as any[]).filter((s: any) => s.available).length : 0;
                  })();
                  return (
                    <button key={dateStr} type="button" disabled={!!isBlocked || slots === 0}
                      onClick={() => { setSelectedDate(dateStr); setSelectedTimeSlots([]); }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 14px', borderRadius: 8, minWidth: 64,
                        border: selectedDate === dateStr ? '2px solid var(--dark)' : '1px solid rgba(42,26,31,0.12)',
                        background: selectedDate === dateStr ? 'var(--dark)' : (isBlocked || slots === 0) ? '#f5f5f5' : 'white',
                        color: selectedDate === dateStr ? 'white' : 'inherit',
                        cursor: (isBlocked || slots === 0) ? 'not-allowed' : 'pointer', opacity: (isBlocked || slots === 0) ? 0.4 : 1,
                      }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: selectedDate === dateStr ? 'rgba(255,255,255,0.8)' : 'var(--mid)' }}>
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <>
                  <div style={{ marginBottom: 12, fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>Available Slots</div>
                  {availableSlots.length === 0 ? (
                    <div style={{ padding: 14, background: 'rgba(239,68,68,0.06)', borderRadius: 10, color: 'var(--mid)', fontSize: '0.88rem' }}>
                      No slots available for this date.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {availableSlots.map(slot => {
                        const [startHour] = slot.split(':').map(Number);
                        const endSlot = `${(startHour + 1).toString().padStart(2, '0')}:00`;
                        const isSelected = selectedTimeSlots.includes(slot);

                        return (
                          <button key={slot} type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
                              } else {
                                setSelectedTimeSlots([...selectedTimeSlots, slot]);
                              }
                            }}
                            style={{
                              padding: '8px 12px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                              border: isSelected ? '2px solid var(--dark)' : '1px solid rgba(42,26,31,0.12)',
                              background: isSelected ? 'var(--dark)' : 'white',
                              color: isSelected ? 'white' : 'var(--dark)',
                            }}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step 3: Checkout */}
            <div className="adp-config-step">
              <div className="adp-config-step__header">
                <span className="adp-config-step__num">3</span>
                <h3>Checkout</h3>
              </div>
              
              {isBookingReady ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <input type="text" placeholder="Event location (City/Venue)" value={address} onChange={e => setAddress(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', marginBottom: 8 }} />
                    <textarea placeholder="Special requests..." value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.9rem', width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>Date & Time</span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {selectedTimeSlots[0]}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <span style={{ color: 'var(--mid)', fontSize: '0.9rem' }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--rose-deep)' }}>₹{calculatedPrice.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)' }}>+ GST</span></span>
                    </div>

                    {bookingError && (
                      <div className="booking-sidebar__error" style={{ marginBottom: 12 }}>
                        <AlertCircle size={14} /> <span>{bookingError}</span>
                      </div>
                    )}

                    {acceptedBooking ? (
                      <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #10b981', textAlign: 'center' }}>
                        <p style={{ color: '#047857', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>Booking approved!</p>
                        <Button onClick={() => navigate('/profile')} style={{ width: '100%', background: 'var(--success-color, #10b981)', color: '#fff', border: 'none' }}>Pay Now to Confirm</Button>
                      </div>
                    ) : (
                      <Button variant="primary" onClick={handleBookingConfirm} disabled={!isBookingReady || bookingLoading || showSuccessModal} style={{ width: '100%', padding: '12px' }}>
                        {bookingLoading ? <Loader2 className="spinner" size={20} /> : 'Confirm Booking'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-soft)', fontSize: '0.9rem', textAlign: 'center', padding: 20 }}>
                  Select an occasion, date, and time to proceed with your booking.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
"""

# Extract the "Why Book With Lume" card from current content
why_book_match = re.search(r'(\{\/\* Why Book Card \*\/\}.*?<\/aside>)', content, re.DOTALL)
if why_book_match:
    why_book_html = why_book_match.group(1).replace('</aside>', '')
else:
    why_book_html = ""

# Extract the "About" section
about_match = re.search(r'(\{\/\* About \*\/\}.*?<\/section>)', content, re.DOTALL)
if about_match:
    about_html = about_match.group(1)
    # Remove the <> </> wrapper if present
    about_html = re.sub(r'<\/?>', '', about_html)
else:
    about_html = ""

# Extract the "Reviews" section
reviews_match = re.search(r'(\{\/\* Reviews \*\/\}.*?<\/section>\s*\}\))', content, re.DOTALL)
if reviews_match:
    reviews_html = reviews_match.group(1)
    # Remove the {} wrapper if present
    reviews_html = re.sub(r'\{\(!isMobileView \|\| activeTab === \'reviews\'\) && \(\s*(.*?)\s*\)\}', r'\1', reviews_html, flags=re.DOTALL)
else:
    reviews_html = ""


# Combine into two rows
new_adp_body = f"""
        <div className="adp-body">
          {{/* TOP ROW: Booking Configurator & Why Book */}}
          <div className="adp-row">
            <div className="adp-row-main">
              {configurator_html}
            </div>
            <div className="adp-row-side">
              {why_book_html}
            </div>
          </div>

          {{/* BOTTOM ROW: About & Reviews */}}
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

# Now remove the old stuff and insert new_adp_body
# 1. Remove Sticky tabs
content = re.sub(r'\{\/\* ═══ STICKY TABS ═══ \*\/.*?<\/nav>\s*<\/div>', '', content, flags=re.DOTALL)
# 2. Remove Mobile bar
content = re.sub(r'\{\/\* Mobile Sticky Bar \*\/.*?<\/div>\s*\{\/\* SUCCESS MODAL \*\/', '{/* SUCCESS MODAL */', content, flags=re.DOTALL)

# 3. Replace the entire <div className="adp-body">...</div>
content = re.sub(r'<div className="adp-body">.*?<\/div>\s*<\/div>\s*\{\/\* Trust Badges \*\/', new_adp_body + '\n      </div>\n\n      {/* Trust Badges */', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Add CSS for adp-row if missing
css_path = r'c:\Users\manas\OneDrive\Desktop\LUME\LUME\lume-web\src\pages\ArtistDetailPage.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

new_css = """
.adp-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
  width: 100%;
  margin-bottom: 32px;
}
.adp-row-main {
  min-width: 0;
}
.adp-row-side {
  min-width: 0;
}

@media (max-width: 1024px) {
  .adp-row {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
"""
if '.adp-row' not in css_content:
    css_content += new_css

# Make adp-configurator a 3-col grid
if '.adp-configurator__grid' not in css_content:
    css_content += """
.adp-configurator__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 768px) {
  .adp-configurator__grid {
    grid-template-columns: 1fr;
  }
}
.adp-config-step {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}
.adp-config-step__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}
.adp-config-step__num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--rose-pale);
  color: var(--rose-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.adp-config-step__header h3 {
  font-size: 1.1rem;
  font-family: var(--font-heading);
  color: var(--dark);
  margin: 0;
}
.adp-configurator__inner {
  background: white;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #eee;
  box-shadow: 0 4px 24px rgba(0,0,0,0.02);
}
.adp-configurator__title {
  font-family: var(--font-heading);
  font-size: 2rem;
  color: var(--dark);
  margin-bottom: 24px;
  text-align: center;
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)
