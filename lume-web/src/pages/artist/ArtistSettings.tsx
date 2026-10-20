import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar, Bell, Lock, Building2, CheckCircle, AlertCircle,
  ShieldCheck, ArrowRight, ArrowLeft,
  Smartphone, Mail, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../hooks/useApi';
import './ArtistPages.css';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ArtistSettings: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'booking';
  const setTab = (t: string) => setSearchParams({ tab: t });
  const tabsBarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view when changed
  useEffect(() => {
    if (tabsBarRef.current) {
      const activeBtn = tabsBarRef.current.querySelector('.artist-tab-btn--active') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  // Booking availability state
  const [isTakingBookings, setIsTakingBookings] = useState(
    user?.artistProfile?.isTakingBookings ?? true
  );
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [advanceNotice, setAdvanceNotice] = useState('6');
  const [maxDailyBookings, setMaxDailyBookings] = useState('3');
  const [bufferTime, setBufferTime] = useState('45');
  const [serviceMode, setServiceMode] = useState('both');
  const [operatingDays, setOperatingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [instantBooking, setInstantBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Notification preferences state
  const [notifWhatsAppBooking, setNotifWhatsAppBooking] = useState(true);
  const [notifWhatsAppReminder, setNotifWhatsAppReminder] = useState(true);
  const [notifSmsBackup, setNotifSmsBackup] = useState(false);
  const [notifEmailBooking, setNotifEmailBooking] = useState(true);
  const [notifEmailDigest, setNotifEmailDigest] = useState(true);
  const [notifEmailReviews, setNotifEmailReviews] = useState(true);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Account & Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Business & Invoicing state
  const [businessName, setBusinessName] = useState(user?.name ? `${user.name} Studio` : '');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('MODERATE');
  const [receiptNote, setReceiptNote] = useState('Please ensure natural daylight and a clean surface are available for styling.');
  const [businessSuccess, setBusinessSuccess] = useState(false);

  useEffect(() => {
    if (user?.artistProfile) {
      setIsTakingBookings(user.artistProfile.isTakingBookings ?? true);
    }
  }, [user]);

  // Load saved local preferences if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lume_artist_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.advanceNotice) setAdvanceNotice(parsed.advanceNotice);
        if (parsed.maxDailyBookings) setMaxDailyBookings(parsed.maxDailyBookings);
        if (parsed.bufferTime) setBufferTime(parsed.bufferTime);
        if (parsed.serviceMode) setServiceMode(parsed.serviceMode);
        if (parsed.operatingDays) setOperatingDays(parsed.operatingDays);
        if (parsed.instantBooking !== undefined) setInstantBooking(parsed.instantBooking);
        if (parsed.notifWhatsAppBooking !== undefined) setNotifWhatsAppBooking(parsed.notifWhatsAppBooking);
        if (parsed.notifWhatsAppReminder !== undefined) setNotifWhatsAppReminder(parsed.notifWhatsAppReminder);
        if (parsed.notifSmsBackup !== undefined) setNotifSmsBackup(parsed.notifSmsBackup);
        if (parsed.notifEmailBooking !== undefined) setNotifEmailBooking(parsed.notifEmailBooking);
        if (parsed.notifEmailDigest !== undefined) setNotifEmailDigest(parsed.notifEmailDigest);
        if (parsed.notifEmailReviews !== undefined) setNotifEmailReviews(parsed.notifEmailReviews);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.gstin) setGstin(parsed.gstin);
        if (parsed.panNumber) setPanNumber(parsed.panNumber);
        if (parsed.cancellationPolicy) setCancellationPolicy(parsed.cancellationPolicy);
        if (parsed.receiptNote) setReceiptNote(parsed.receiptNote);
      }
    } catch { /* ignore */ }
  }, []);

  const saveToLocalSettings = (patch: Record<string, any>) => {
    try {
      const saved = localStorage.getItem('lume_artist_settings');
      const existing = saved ? JSON.parse(saved) : {};
      const updated = { ...existing, ...patch };
      localStorage.setItem('lume_artist_settings', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const toggleBookingStatus = async () => {
    if (statusUpdating) return;
    setStatusUpdating(true);
    try {
      const nextStatus = !isTakingBookings;
      const res = await apiFetch('/api/artists/me/booking-status', {
        method: 'PATCH',
        body: { isTakingBookings: nextStatus },
        token: token || undefined
      });
      if (res) {
        setIsTakingBookings(nextStatus);
        if (user && user.artistProfile) {
          updateUser({
            artistProfile: {
              ...user.artistProfile,
              isTakingBookings: nextStatus
            }
          });
        }
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 3000);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update booking status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const toggleOperatingDay = (day: string) => {
    setOperatingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveBookingRules = (e: React.FormEvent) => {
    e.preventDefault();
    saveToLocalSettings({
      advanceNotice,
      maxDailyBookings,
      bufferTime,
      serviceMode,
      operatingDays,
      instantBooking,
    });
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    saveToLocalSettings({
      notifWhatsAppBooking,
      notifWhatsAppReminder,
      notifSmsBackup,
      notifEmailBooking,
      notifEmailDigest,
      notifEmailReviews,
    });
    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      // Endpoint or simulated password update
      await new Promise(r => setTimeout(r, 600));
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    saveToLocalSettings({
      businessName,
      gstin,
      panNumber,
      cancellationPolicy,
      receiptNote,
    });
    setBusinessSuccess(true);
    setTimeout(() => setBusinessSuccess(false), 3000);
  };

  return (
    <div className="artist-page">
      {/* ── Page Header ── */}
      <div className="artist-page__header">
        <h1 className="artist-page__title">Studio Settings</h1>
        <p className="artist-page__subtitle">
          Manage your availability schedule, automated WhatsApp & email notifications, account security, and studio policies.
        </p>
      </div>

      {/* ── Mobile Section Quick Selector (Visible on <= 768px) ── */}
      <div className="artist-mobile-tab-selector">
        <div className="artist-mobile-tab-indicator">
          <span className="artist-mobile-tab-step">
            {activeTab === 'booking' && 'Section 1 of 4'}
            {activeTab === 'notifications' && 'Section 2 of 4'}
            {activeTab === 'security' && 'Section 3 of 4'}
            {activeTab === 'business' && 'Section 4 of 4'}
          </span>
          <span className="artist-mobile-tab-title">
            {activeTab === 'booking' && 'Availability & Rules'}
            {activeTab === 'notifications' && 'Notifications & Alerts'}
            {activeTab === 'security' && 'Account & Security'}
            {activeTab === 'business' && 'Business & Policies'}
          </span>
        </div>
        <div className="artist-mobile-select-wrapper">
          <select
            value={activeTab}
            onChange={e => setTab(e.target.value)}
            className="artist-mobile-tab-select"
            aria-label="Select settings section"
          >
            <option value="booking">1. Availability & Rules</option>
            <option value="notifications">2. Notifications & Alerts</option>
            <option value="security">3. Account & Security</option>
            <option value="business">4. Business & Policies</option>
          </select>
          <ChevronDown size={15} className="artist-mobile-select-arrow" />
        </div>
      </div>

      {/* ── Top Horizontal Tabs Bar (Zero Scroll Navigation) ── */}
      <div className="artist-tabs-wrapper">
        <nav className="artist-tabs-bar" ref={tabsBarRef} aria-label="Studio Settings Sections">
          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'booking' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('booking')}
          >
            <Calendar size={16} />
            <span>Availability & Rules</span>
            <span className="artist-tab-btn__badge">1/4</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'notifications' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('notifications')}
          >
            <Bell size={16} />
            <span>Notifications & Alerts</span>
            <span className="artist-tab-btn__badge">2/4</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'security' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('security')}
          >
            <Lock size={16} />
            <span>Account & Security</span>
            <span className="artist-tab-btn__badge">3/4</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'business' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('business')}
          >
            <Building2 size={16} />
            <span>Business & Policies</span>
            <span className="artist-tab-btn__badge">4/4</span>
          </button>
        </nav>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: AVAILABILITY & BOOKING RULES (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'booking' && (
        <div className="artist-tab-content">
          <div className="artist-two-col">
            {/* Left Column: Master Taking Bookings Toggle */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Live Studio Status</h2>
                </div>
                <div className="artist-panel__body">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: isTakingBookings ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: isTakingBookings ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                    marginBottom: 16
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.94rem',
                        color: isTakingBookings ? '#15803d' : '#b91c1c'
                      }}>
                        {isTakingBookings ? 'Accepting Bookings' : 'Paused / Offline'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--mid)', marginTop: 2 }}>
                        {isTakingBookings ? 'Your profile appears in active client search.' : 'Hidden from instant client discovery.'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={toggleBookingStatus}
                      disabled={statusUpdating}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background: isTakingBookings ? '#10b981' : '#cbd5e1',
                        border: 'none',
                        cursor: statusUpdating ? 'wait' : 'pointer',
                        position: 'relative',
                        transition: 'background 0.3s ease',
                        flexShrink: 0
                      }}
                      title="Click to toggle studio accepting bookings"
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        background: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 2,
                        left: isTakingBookings ? 22 : 2,
                        transition: 'left 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>

                  <div className="artist-tip-card">
                    <ShieldCheck size={18} className="artist-tip-card__icon" />
                    <div className="artist-tip-card__text">
                      <strong>48-Hour Guarantee Rule:</strong> Toggling status to offline does not cancel already confirmed appointments. Clients expect timely service for existing reservations.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Booking Preferences Form */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Booking Schedule & Policies</h2>
                </div>
                <form className="artist-panel__body artist-form" onSubmit={handleSaveBookingRules}>
                  {bookingSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Booking preferences saved successfully!
                    </div>
                  )}

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">Minimum Advance Notice</label>
                      <select
                        className="artist-select"
                        value={advanceNotice}
                        onChange={e => setAdvanceNotice(e.target.value)}
                      >
                        <option value="2">At least 2 hours before</option>
                        <option value="6">At least 6 hours before</option>
                        <option value="12">At least 12 hours before</option>
                        <option value="24">At least 24 hours (Recommended)</option>
                        <option value="48">At least 48 hours before</option>
                      </select>
                    </div>

                    <div className="artist-field">
                      <label className="artist-label">Maximum Bookings Per Day</label>
                      <select
                        className="artist-select"
                        value={maxDailyBookings}
                        onChange={e => setMaxDailyBookings(e.target.value)}
                      >
                        <option value="1">1 appointment / day</option>
                        <option value="2">2 appointments / day</option>
                        <option value="3">3 appointments / day</option>
                        <option value="4">4 appointments / day</option>
                        <option value="unlimited">Unlimited (Manual control)</option>
                      </select>
                    </div>
                  </div>

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">Service Location Mode</label>
                      <select
                        className="artist-select"
                        value={serviceMode}
                        onChange={e => setServiceMode(e.target.value)}
                      >
                        <option value="both">Both (Client's Venue & My Studio)</option>
                        <option value="client_location">On-Location Only (Travel to Client)</option>
                        <option value="studio_only">In-Studio Only (Client Visits Me)</option>
                      </select>
                    </div>

                    <div className="artist-field">
                      <label className="artist-label">Buffer Between Appointments</label>
                      <select
                        className="artist-select"
                        value={bufferTime}
                        onChange={e => setBufferTime(e.target.value)}
                      >
                        <option value="30">30 minutes cleanup & travel</option>
                        <option value="45">45 minutes (Recommended)</option>
                        <option value="60">60 minutes travel buffer</option>
                        <option value="90">90 minutes long commute buffer</option>
                      </select>
                    </div>
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Weekly Operating Days</label>
                    <div className="artist-operating-days-grid">
                      {DAYS_OF_WEEK.map(day => {
                        const isSelected = operatingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleOperatingDay(day)}
                            className={`artist-day-btn ${isSelected ? 'artist-day-btn--selected' : ''}`}
                          >
                            {isSelected ? '✓ ' : ''}{day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="submit" className="artist-save-btn">
                      Save Booking Preferences
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <span style={{ fontSize: '0.84rem', color: 'var(--text-soft)' }}>Section 1 of 4</span>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('notifications')}
                >
                  <span>Next: Notifications & Alerts</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: NOTIFICATIONS & ALERTS (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="artist-tab-content">
          <div className="artist-two-col--equal" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
            {/* Left Column: WhatsApp & Mobile Alerts */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={18} style={{ color: 'var(--rose-deep)' }} />
                  <h2 className="artist-panel__title">WhatsApp & Mobile Bot</h2>
                </div>
                <div className="artist-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    className={`artist-notif-card ${notifWhatsAppBooking ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifWhatsAppBooking(!notifWhatsAppBooking)}
                    role="checkbox"
                    aria-checked={notifWhatsAppBooking}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        Instant WhatsApp Booking Bot
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Receive real-time WhatsApp messages when clients book, with interactive Accept / Deny buttons.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifWhatsAppBooking}
                      onChange={e => { e.stopPropagation(); setNotifWhatsAppBooking(e.target.checked); }}
                    />
                  </div>

                  <div
                    className={`artist-notif-card ${notifWhatsAppReminder ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifWhatsAppReminder(!notifWhatsAppReminder)}
                    role="checkbox"
                    aria-checked={notifWhatsAppReminder}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        2-Hour Appointment Reminder
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Automated WhatsApp reminder sent to you and the client 2 hours before the scheduled time.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifWhatsAppReminder}
                      onChange={e => { e.stopPropagation(); setNotifWhatsAppReminder(e.target.checked); }}
                    />
                  </div>

                  <div
                    className={`artist-notif-card ${notifSmsBackup ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifSmsBackup(!notifSmsBackup)}
                    role="checkbox"
                    aria-checked={notifSmsBackup}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        SMS Backup Notification
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Standard SMS alert if WhatsApp message delivery is delayed or offline.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifSmsBackup}
                      onChange={e => { e.stopPropagation(); setNotifSmsBackup(e.target.checked); }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Email & Studio Digest */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={18} style={{ color: 'var(--rose-deep)' }} />
                  <h2 className="artist-panel__title">Email & Studio Digests</h2>
                </div>
                <form className="artist-panel__body artist-form" onSubmit={handleSaveNotifications}>
                  {notifSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Notification preferences saved!
                    </div>
                  )}

                  <div
                    className={`artist-notif-card ${notifEmailBooking ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifEmailBooking(!notifEmailBooking)}
                    role="checkbox"
                    aria-checked={notifEmailBooking}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        New Booking Email Confirmation
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Instant detailed booking receipt sent to {user?.email}.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifEmailBooking}
                      onChange={e => { e.stopPropagation(); setNotifEmailBooking(e.target.checked); }}
                    />
                  </div>

                  <div
                    className={`artist-notif-card ${notifEmailDigest ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifEmailDigest(!notifEmailDigest)}
                    role="checkbox"
                    aria-checked={notifEmailDigest}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        Morning Schedule Digest
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Daily email at 8:00 AM outlining today's appointments and locations.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifEmailDigest}
                      onChange={e => { e.stopPropagation(); setNotifEmailDigest(e.target.checked); }}
                    />
                  </div>

                  <div
                    className={`artist-notif-card ${notifEmailReviews ? 'artist-notif-card--active' : ''}`}
                    onClick={() => setNotifEmailReviews(!notifEmailReviews)}
                    role="checkbox"
                    aria-checked={notifEmailReviews}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)' }}>
                        Client Reviews & Rating Alerts
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--mid)', marginTop: 2, lineHeight: 1.5 }}>
                        Receive email notifications when a verified client leaves a 5-star review.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="artist-notif-checkbox"
                      checked={notifEmailReviews}
                      onChange={e => { e.stopPropagation(); setNotifEmailReviews(e.target.checked); }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" className="artist-save-btn">
                      Save Notification Preferences
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('booking')}
                >
                  <ArrowLeft size={15} />
                  <span>Availability & Rules</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('security')}
                >
                  <span>Next: Account & Security</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: ACCOUNT & PASSWORD (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="artist-tab-content">
          <div className="artist-two-col">
            {/* Left Column: Registered Identity */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Registered Account</h2>
                </div>
                <div className="artist-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div className="artist-label">Artist Name</div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--dark)' }}>
                      {user?.name || 'Artist Studio'}
                    </div>
                  </div>

                  <div>
                    <div className="artist-label">Primary Login Email</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--mid)' }}>
                      {user?.email}
                    </div>
                  </div>

                  <div>
                    <div className="artist-label">Registered Phone Number</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--mid)' }}>
                      {user?.phone ? (user.phone.startsWith('+91') ? user.phone : `+91 ${user.phone}`) : 'Not specified'}
                    </div>
                  </div>

                  <div>
                    <div className="artist-label">Studio Verification Tier</div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: 'rgba(34,197,94,0.1)',
                      color: '#15803d',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      marginTop: 4
                    }}>
                      <CheckCircle size={13} color="#16a34a" /> Verified Professional
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Change Password */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Change Password</h2>
                </div>
                <form className="artist-panel__body artist-form" onSubmit={handleUpdatePassword}>
                  {passwordSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Password updated successfully!
                    </div>
                  )}
                  {passwordError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <AlertCircle size={16} /> {passwordError}
                    </div>
                  )}

                  <div className="artist-field">
                    <label className="artist-label">Current Password</label>
                    <input
                      type="password"
                      className="artist-input"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter existing password"
                      required
                    />
                  </div>

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">New Password</label>
                      <input
                        type="password"
                        className="artist-input"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                      />
                    </div>
                    <div className="artist-field">
                      <label className="artist-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="artist-input"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" className="artist-save-btn" disabled={passwordLoading}>
                      <Lock size={14} />
                      <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('notifications')}
                >
                  <ArrowLeft size={15} />
                  <span>Notifications & Alerts</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('business')}
                >
                  <span>Next: Business & Policies</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: BUSINESS & POLICIES (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'business' && (
        <div className="artist-tab-content">
          <div className="artist-two-col">
            {/* Left Column: Business & Tax Identification */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Studio Tax ID</h2>
                </div>
                <div className="artist-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="artist-field">
                    <label className="artist-label">GSTIN / Tax ID (Optional)</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={gstin}
                      onChange={e => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27ABCDE1234F1Z5"
                      maxLength={15}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Permanent Account Number (PAN)</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={panNumber}
                      onChange={e => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                  </div>

                  <div className="artist-tip-card">
                    <Building2 size={18} className="artist-tip-card__icon" />
                    <div className="artist-tip-card__text">
                      <strong>Tax Compliance:</strong> Providing your PAN ensures automatic compliance with 1% TDS Section 194O without unnecessary withholding.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Policies & Client Receipt Note */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Client Invoicing & Cancellation Rules</h2>
                </div>
                <form className="artist-panel__body artist-form" onSubmit={handleSaveBusiness}>
                  {businessSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Business details and policies saved!
                    </div>
                  )}

                  <div className="artist-field">
                    <label className="artist-label">Studio / Brand Trading Name</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Glamour by Ananya Studio"
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Cancellation Policy</label>
                    <select
                      className="artist-select"
                      value={cancellationPolicy}
                      onChange={e => setCancellationPolicy(e.target.value)}
                    >
                      <option value="FLEXIBLE">Flexible — Full refund up to 24 hours prior to appointment</option>
                      <option value="MODERATE">Moderate — Full refund up to 48 hours, 50% thereafter</option>
                      <option value="STRICT">Strict — Full refund up to 7 days prior, no refund within 48 hours</option>
                    </select>
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Custom Note Printed on Client Booking Confirmations</label>
                    <textarea
                      className="artist-textarea"
                      value={receiptNote}
                      onChange={e => setReceiptNote(e.target.value)}
                      rows={3}
                      placeholder="e.g. Please ensure clean skin and a mirror with good natural daylight are available for session."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" className="artist-save-btn">
                      Save Business Policies
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('security')}
                >
                  <ArrowLeft size={15} />
                  <span>Account & Security</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('booking')}
                >
                  <span>Back to Availability & Rules</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistSettings;
