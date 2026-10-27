import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus, Trash2, CheckCircle, AlertCircle, Clock, Upload,
  Camera, Send, ShieldCheck, ShieldAlert, Shield, BadgeCheck, Sparkles,
  Lock, Eye, EyeOff, Building2, X, User, ExternalLink, ArrowRight, ArrowLeft, ChevronDown
} from 'lucide-react';
import GeoLocationInput from '../../components/ui/GeoLocationInput';
import PhoneInput from '../../components/ui/PhoneInput';
import { useAuth } from '../../context/AuthContext';
import { useApi, apiFetch } from '../../hooks/useApi';
import { API_BASE } from '../../context/AuthContext';
import './ArtistPages.css';

const SPECIALTIES_LIST = [
  'Bridal', 'Editorial', 'Glam', 'Natural', 'Everyday',
  'Fantasy', 'Runway', 'Traditional', 'Evening', 'Bold',
];

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
  icon: string;
  description?: string;
  isActive: boolean;
}

const VerificationBanner: React.FC<{ status: string; remarks?: string }> = ({ status, remarks }) => {
  if (status === 'VERIFIED') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        background: 'rgba(34,197,94,0.1)', color: '#15803d', borderRadius: 12,
        marginBottom: 20, border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600, fontSize: '0.9rem'
      }}>
        <BadgeCheck size={20} color="#16a34a" />
        <span>Your profile is <strong>Verified</strong>. You are live on the Lume directory and accepting bookings.</span>
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        background: 'rgba(234,179,8,0.1)', color: '#92400e', borderRadius: 12,
        marginBottom: 20, border: '1px solid rgba(234,179,8,0.25)', fontWeight: 600, fontSize: '0.9rem'
      }}>
        <Shield size={20} color="#ca8a04" />
        <span>Your profile is currently under review by the Lume editorial team. We will notify you once verified.</span>
      </div>
    );
  }
  if (status === 'REJECTED') {
    return (
      <div style={{
        padding: '16px 20px', background: 'rgba(239,68,68,0.08)', color: '#b91c1c',
        borderRadius: 12, marginBottom: 20, border: '1px solid rgba(239,68,68,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.92rem' }}>
          <ShieldAlert size={20} color="#dc2626" />
          <span>Verification was not approved. Please review the admin remarks below and update your submission.</span>
        </div>
        {remarks && (
          <div style={{
            marginTop: 10, padding: '10px 14px', background: '#ffffff',
            borderRadius: 8, fontSize: '0.88rem', borderLeft: '3px solid #dc2626', color: '#4A5568'
          }}>
            <strong style={{ color: '#dc2626' }}>Editorial Feedback:</strong> {remarks}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const ArtistProfile: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { execute: apiExecute, loading } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state via query param
  const activeTab = searchParams.get('tab') || 'general';
  const setTab = (t: string) => setSearchParams({ tab: t });

  const profile = user?.artistProfile;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
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

  // Profile Form
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [experience, setExperience] = useState(String(profile?.experience || 0));
  const [phone, setPhone] = useState(user?.phone || '');
  const [certification, setCertification] = useState(profile?.certification || '');
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties || []);
  const [gender, setGender] = useState(profile?.gender || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Pricing
  const [weddingPrice, setWeddingPrice] = useState(String(profile?.weddingPrice || ''));
  const [occasionPrice, setOccasionPrice] = useState(String(profile?.occasionPrice || ''));
  const [hourlyPrice, setHourlyPrice] = useState(String(profile?.hourlyPrice || ''));
  const [pricingSuccess, setPricingSuccess] = useState(false);

  // Bank Account
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankConfirmAccount, setBankConfirmAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankType, setBankType] = useState('SAVINGS');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [savedBankAccount, setSavedBankAccount] = useState<any>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankError, setBankError] = useState('');

  // Services
  const [services, setServices] = useState<ServiceItem[]>(profile?.services || []);
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('90');
  const [newServiceIcon, setNewServiceIcon] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // File state
  const [avatarPreview, setAvatarPreview] = useState(profile?.profileImageUrl || user?.avatarUrl || '');
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>(profile?.portfolioUrls || []);
  const [certFiles, setCertFiles] = useState<string[]>(profile?.certificationFiles || []);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  const isInitialized = useRef(false);

  useEffect(() => {
    if (profile && !isInitialized.current) {
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setExperience(String(profile.experience || 0));
      setCertification(profile.certification || '');
      setSpecialties(profile.specialties || []);
      setGender(profile.gender || '');
      setWeddingPrice(String(profile.weddingPrice || ''));
      setOccasionPrice(String(profile.occasionPrice || ''));
      setHourlyPrice(String(profile.hourlyPrice || ''));
      setServices(profile.services || []);
      setAvatarPreview(profile.profileImageUrl || user?.avatarUrl || '');
      setPortfolioPhotos(profile.portfolioUrls || []);
      setCertFiles(profile.certificationFiles || []);
      isInitialized.current = true;
    } else if (profile) {
      setServices(profile.services || []);
      setAvatarPreview(profile.profileImageUrl || user?.avatarUrl || '');
      setPortfolioPhotos(profile.portfolioUrls || []);
      setCertFiles(profile.certificationFiles || []);
    }
  }, [user, profile]);

  // Load saved bank account on mount
  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await apiExecute('/api/artists/me/bank-account', { method: 'GET' }) as any;
        if (res) setSavedBankAccount(res);
      } catch { /* ignore */ }
    };
    fetchBankAccount();
  }, []);

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankError('');
    setBankSuccess(false);
    if (bankAccountNumber !== bankConfirmAccount) {
      setBankError('Account numbers do not match');
      return;
    }
    setBankLoading(true);
    try {
      const res = await apiFetch('/api/artists/me/bank-account', {
        method: 'POST',
        token: token || undefined,
        body: {
          accountHolderName: bankHolderName,
          accountNumber: bankAccountNumber,
          ifscCode: bankIfsc,
          bankName,
          accountType: bankType,
        },
      }) as any;

      setSavedBankAccount(res);
      setBankSuccess(true);
      setBankAccountNumber('');
      setBankConfirmAccount('');
      setTimeout(() => setBankSuccess(false), 4000);
    } catch (err: any) {
      setBankError(err?.message || 'Failed to save bank account');
    } finally {
      setBankLoading(false);
    }
  };

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');
    try {
      const res = await apiExecute('/api/artists/me/profile', {
        method: 'PUT',
        body: {
          bio,
          location,
          experience: parseInt(experience, 10) || 0,
          certification,
          specialties,
          gender: gender || undefined,
        },
      });
      if (phone !== user?.phone) {
        const cleanDigits = phone.replace(/\D/g, '');
        const formattedPhone = cleanDigits
          ? (cleanDigits.startsWith('91') && cleanDigits.length === 12
              ? `+${cleanDigits}`
              : `+91${cleanDigits.slice(-10)}`)
          : '';
        await apiExecute('/api/auth/me', {
          method: 'PUT',
          body: { phone: formattedPhone },
        });
      }
      if (!res) {
        setProfileError('Failed to save profile. Please check if all fields are valid.');
        return;
      }
      setProfileSuccess(true);
      await refreshUser();
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch {
      setProfileError('An error occurred while saving.');
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingSuccess(false);
    const res = await apiExecute('/api/artists/me/pricing', {
      method: 'PUT',
      body: {
        weddingPrice: weddingPrice ? parseFloat(weddingPrice) : undefined,
        occasionPrice: occasionPrice ? parseFloat(occasionPrice) : undefined,
        hourlyPrice: hourlyPrice ? parseFloat(hourlyPrice) : undefined,
      },
    });
    if (!res) return;
    setPricingSuccess(true);
    await refreshUser();
    setTimeout(() => setPricingSuccess(false), 3000);
  };

  const uploadFile = async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', e.target.files[0]);
      const data = await uploadFile('/api/artists/me/avatar', fd);
      if (data.success) {
        setAvatarPreview(data.data.url);
        await refreshUser();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Network or server error during upload.');
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePortfolioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingPortfolio(true);
    try {
      const fd = new FormData();
      Array.from(e.target.files).forEach(f => fd.append('photos', f));
      const data = await uploadFile('/api/artists/me/portfolio', fd);
      if (data.success) {
        setPortfolioPhotos(prev => [...prev, ...data.data.urls]);
        await refreshUser();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Network or server error during upload.');
      console.error(err);
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handleCertChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingCert(true);
    try {
      const fd = new FormData();
      Array.from(e.target.files).forEach(f => fd.append('files', f));
      const data = await uploadFile('/api/artists/me/certifications', fd);
      if (data.success) {
        setCertFiles(prev => [...prev, ...data.data.urls]);
        await refreshUser();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Network or server error during upload.');
      console.error(err);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleRemovePortfolio = async (url: string) => {
    await apiExecute('/api/artists/me/portfolio', { method: 'DELETE', body: { url } });
    setPortfolioPhotos(prev => prev.filter(u => u !== url));
  };

  const handleRemoveCert = async (url: string) => {
    await apiExecute('/api/artists/me/certifications', { method: 'DELETE', body: { url } });
    setCertFiles(prev => prev.filter(u => u !== url));
  };

  const handleSubmitVerification = async () => {
    setSubmitting(true);
    setVerifyMsg('');
    try {
      await apiExecute('/api/artists/me/submit-verification', { method: 'POST' });
      setVerifyMsg('Profile submitted for verification! You will be notified once reviewed.');
      await refreshUser();
    } catch (err) {
      setVerifyMsg(err instanceof Error ? err.message : 'Submission failed');
    }
    setSubmitting(false);
  };

  const handleRequestEdit = async () => {
    setSubmitting(true);
    setVerifyMsg('');
    try {
      await apiExecute('/api/artists/me/request-edit', { method: 'POST' });
      setVerifyMsg('Edit request submitted. Please wait for admin approval.');
      await refreshUser();
    } catch (err) {
      setVerifyMsg(err instanceof Error ? err.message : 'Request failed');
    }
    setSubmitting(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;
    const created = await apiExecute('/api/artists/me/services', {
      method: 'POST',
      body: {
        name: newServiceName,
        price: parseFloat(newServicePrice),
        duration: parseInt(newServiceDuration, 10) || 60,
        icon: newServiceIcon || '',
        description: newServiceDesc,
      },
    }) as ServiceItem | null;
    if (created) {
      setServices(prev => [...prev, created]);
      setShowAddService(false);
      setNewServiceName('');
      setNewServicePrice('');
      setNewServiceDesc('');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    await apiExecute(`/api/artists/me/services/${serviceId}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const verStatus = profile?.verificationStatus || 'NOT_SUBMITTED';
  const isLocked = verStatus === 'VERIFIED' || verStatus === 'EDIT_REQUESTED';

  return (
    <div className="artist-page">
      {/* ── Page Header ── */}
      <div className="artist-page__header">
        <h1 className="artist-page__title">Profile & Portfolio Builder</h1>
        <p className="artist-page__subtitle">
          Configure your studio identity, service pricing, portfolio gallery, and verification credentials.
        </p>
      </div>

      <VerificationBanner status={verStatus} remarks={profile?.verificationRemarks} />

      {/* ── Mobile Section Quick Selector (Visible on <= 768px) ── */}
      <div className="artist-mobile-tab-selector">
        <div className="artist-mobile-tab-indicator">
          <span className="artist-mobile-tab-step">
            {activeTab === 'general' && 'Step 1 of 5'}
            {activeTab === 'services' && 'Step 2 of 5'}
            {activeTab === 'portfolio' && 'Step 3 of 5'}
            {activeTab === 'bank' && 'Step 4 of 5'}
            {activeTab === 'verification' && 'Step 5 of 5'}
          </span>
          <span className="artist-mobile-tab-title">
            {activeTab === 'general' && 'General & Bio'}
            {activeTab === 'services' && 'Services & Pricing'}
            {activeTab === 'portfolio' && 'Portfolio & Badges'}
            {activeTab === 'bank' && 'Bank & Payouts'}
            {activeTab === 'verification' && 'Verification Status'}
          </span>
        </div>
        <div className="artist-mobile-select-wrapper">
          <select
            value={activeTab}
            onChange={e => setTab(e.target.value)}
            className="artist-mobile-tab-select"
            aria-label="Select section"
          >
            <option value="general">1. General & Bio</option>
            <option value="services">2. Services & Pricing</option>
            <option value="portfolio">3. Portfolio & Badges</option>
            <option value="bank">4. Bank & Payouts</option>
            <option value="verification">5. Verification Status</option>
          </select>
          <ChevronDown size={15} className="artist-mobile-select-arrow" />
        </div>
      </div>

      {/* ── Top Horizontal Tabs Bar (Zero Scroll Navigation) ── */}
      <div className="artist-tabs-wrapper">
        <nav className="artist-tabs-bar" ref={tabsBarRef} aria-label="Profile Sections">
          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'general' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('general')}
          >
            <User size={16} />
            <span>General & Bio</span>
            <span className="artist-tab-btn__badge">1/5</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'services' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('services')}
          >
            <Sparkles size={16} />
            <span>Services & Pricing</span>
            <span className="artist-tab-btn__badge">2/5</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'portfolio' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('portfolio')}
          >
            <Upload size={16} />
            <span>Portfolio & Badges</span>
            <span className="artist-tab-btn__badge">3/5</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'bank' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('bank')}
          >
            <Building2 size={16} />
            <span>Bank & Payouts</span>
            <span className="artist-tab-btn__badge">4/5</span>
          </button>

          <button
            type="button"
            className={`artist-tab-btn ${activeTab === 'verification' ? 'artist-tab-btn--active' : ''}`}
            onClick={() => setTab('verification')}
          >
            <ShieldCheck size={16} />
            <span>Verification Status</span>
            <span className="artist-tab-btn__badge">5/5</span>
          </button>
        </nav>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: GENERAL INFORMATION & BIO (Ergonomic Left-to-Right 2-Col)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div className="artist-tab-content">
          <div className="artist-two-col">
            {/* Left Column: Profile Photo Card & Client Preview */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Profile Portrait</h2>
                </div>
                <div className="artist-portrait-card-body">
                  <div
                    className="artist-portrait-avatar-wrapper"
                    onClick={() => !isLocked && avatarInputRef.current?.click()}
                    title={isLocked ? 'Photo locked (Verified)' : 'Click to change photo'}
                    style={{ opacity: isLocked ? 0.75 : 1 }}
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview.startsWith('/') ? `${API_BASE}${avatarPreview}` : avatarPreview}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Camera size={36} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'var(--rose-deep)' }} />
                    )}
                    {!isLocked && (
                      <div
                        style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity .2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                      >
                        <Camera size={22} color="white" />
                      </div>
                    )}
                  </div>

                  <div className="artist-portrait-info">
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-soft)', marginBottom: 12, lineHeight: 1.5 }}>
                      Upload a high-definition portrait with good studio lighting. Square ratio recommended.
                    </p>

                    <button
                      type="button"
                      className="artist-secondary-btn"
                      style={{ width: '100%', padding: '9px 16px' }}
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar || isLocked}
                    >
                      <Camera size={15} />
                      <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                  </div>
                </div>
              </div>

              {/* Mini Client Search Preview */}
              <div className="artist-tip-card">
                <Sparkles size={18} className="artist-tip-card__icon" />
                <div className="artist-tip-card__text">
                  <strong>Client Directory Tip:</strong> Profiles with detailed bios and verified academy credentials attract <strong>3.2x more bookings</strong> on Lume.
                </div>
              </div>
            </div>

            {/* Right Column: General Information Form */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Studio & Artist Information</h2>
                  {isLocked && (
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={13} /> Locked & Verified
                    </span>
                  )}
                </div>

                <form className="artist-panel__body artist-form" onSubmit={handleSaveProfile}>
                  {profileSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Profile details saved successfully!
                    </div>
                  )}
                  {profileError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <AlertCircle size={16} /> {profileError}
                    </div>
                  )}

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">Operating Location / City</label>
                      <GeoLocationInput value={location} onChange={setLocation} required disabled={isLocked} />
                    </div>
                    <div className="artist-field">
                      <label className="artist-label">WhatsApp / Contact Phone</label>
                      <PhoneInput value={phone} onChange={setPhone} placeholder="98765 43210" disabled={isLocked} />
                    </div>
                  </div>

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">Years of Experience</label>
                      <input
                        type="number"
                        className="artist-input"
                        value={experience}
                        onChange={e => setExperience(e.target.value)}
                        min="0"
                        max="50"
                        disabled={isLocked}
                      />
                    </div>
                    <div className="artist-field">
                      <label className="artist-label">Gender</label>
                      <select
                        className="artist-select"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        disabled={isLocked}
                      >
                        <option value="">Prefer not to say</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Certification / Academy</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={certification}
                      onChange={e => setCertification(e.target.value)}
                      placeholder="e.g. Certified Bridal & HD Makeup Artist — VLCC Institute"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Artist Bio & Philosophy</label>
                    <textarea
                      className="artist-textarea"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Introduce your artistic philosophy, makeup techniques, signature aesthetics, and client experience..."
                      rows={4}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Specialties & Signature Styles</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                      {SPECIALTIES_LIST.map(s => {
                        const isSelected = specialties.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => !isLocked && toggleSpecialty(s)}
                            disabled={isLocked}
                            style={{
                              padding: '7px 15px',
                              borderRadius: '99px',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              fontFamily: 'var(--font-body)',
                              cursor: isLocked ? 'default' : 'pointer',
                              border: isSelected ? '1.5px solid var(--rose-deep)' : '1px solid rgba(226, 214, 217, 0.8)',
                              background: isSelected ? 'linear-gradient(135deg, rgba(217,122,140,0.14) 0%, rgba(217,122,140,0.06) 100%)' : '#ffffff',
                              color: isSelected ? 'var(--rose-deep)' : 'var(--mid)',
                              transition: 'all 0.15s ease',
                              opacity: isLocked ? 0.8 : 1
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="submit" className="artist-save-btn" disabled={loading || isLocked}>
                      {loading ? 'Saving...' : (isLocked ? 'Locked (Verified Profile)' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <span style={{ fontSize: '0.84rem', color: 'var(--text-soft)' }}>Step 1 of 5</span>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('services')}
                >
                  <span>Next: Services & Pricing</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: SERVICES & PRICING (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div className="artist-tab-content">
          <div className="artist-two-col--equal" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
            {/* Left Column: Standard Flat Event Rates */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Standard Event Rates</h2>
                </div>
                <form className="artist-panel__body artist-form" onSubmit={handleSavePricing}>
                  {pricingSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Pricing saved successfully!
                    </div>
                  )}

                  <p style={{ fontSize: '0.86rem', color: 'var(--mid)', lineHeight: 1.5 }}>
                    Set your flat package pricing. Clients booking bridal or party occasions directly select these standard baseline rates.
                  </p>

                  <div className="artist-field">
                    <label className="artist-label">Wedding Makeup Package (₹)</label>
                    <input
                      type="number"
                      className="artist-input"
                      placeholder="e.g. 15000"
                      min="0"
                      value={weddingPrice}
                      onChange={e => setWeddingPrice(e.target.value)}
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Occasion / Party Makeup (₹)</label>
                    <input
                      type="number"
                      className="artist-input"
                      placeholder="e.g. 5000"
                      min="0"
                      value={occasionPrice}
                      onChange={e => setOccasionPrice(e.target.value)}
                    />
                  </div>

                  <div className="artist-field">
                    <label className="artist-label">Hourly Consultation / Shoot Rate (₹/hr)</label>
                    <input
                      type="number"
                      className="artist-input"
                      placeholder="e.g. 2000"
                      min="0"
                      value={hourlyPrice}
                      onChange={e => setHourlyPrice(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" className="artist-save-btn" disabled={loading}>
                      Save Event Rates
                    </button>
                  </div>
                </form>
              </div>

              <div className="artist-tip-card">
                <Sparkles size={18} className="artist-tip-card__icon" />
                <div className="artist-tip-card__text">
                  <strong>Pricing Recommendation:</strong> Transparent upfront pricing prevents client drop-offs. You can add specific customized treatments in the Service Menu on the right.
                </div>
              </div>
            </div>

            {/* Right Column: Custom Services Menu */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <div>
                    <h2 className="artist-panel__title">Custom Service Menu</h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                      {services.length} {services.length === 1 ? 'service listed' : 'services listed'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddService(!showAddService)}
                    className="artist-save-btn"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <Plus size={15} />
                    <span>{showAddService ? 'Cancel' : 'Add Service'}</span>
                  </button>
                </div>

                <div className="artist-panel__body">
                  {showAddService && (
                    <form
                      onSubmit={handleAddService}
                      style={{
                        padding: 18,
                        background: 'rgba(255, 240, 243, 0.45)',
                        borderRadius: 12,
                        marginBottom: 20,
                        border: '1px solid rgba(242, 164, 176, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--dark)' }}>
                        Add New Beauty Package
                      </div>
                      <div className="artist-form__row">
                        <div className="artist-field">
                          <label className="artist-label">Service Title</label>
                          <input
                            type="text"
                            className="artist-input"
                            value={newServiceName}
                            onChange={e => setNewServiceName(e.target.value)}
                            placeholder="e.g. Bridal HD Airbrush Makeup"
                            required
                          />
                        </div>
                        <div className="artist-field">
                          <label className="artist-label">Category / Icon Tag</label>
                          <input
                            type="text"
                            className="artist-input"
                            value={newServiceIcon}
                            onChange={e => setNewServiceIcon(e.target.value)}
                            placeholder="e.g. Bridal, Editorial, Glam"
                          />
                        </div>
                      </div>

                      <div className="artist-form__row">
                        <div className="artist-field">
                          <label className="artist-label">Price (₹)</label>
                          <input
                            type="number"
                            className="artist-input"
                            value={newServicePrice}
                            onChange={e => setNewServicePrice(e.target.value)}
                            placeholder="e.g. 6999"
                            required
                          />
                        </div>
                        <div className="artist-field">
                          <label className="artist-label">Duration (minutes)</label>
                          <input
                            type="number"
                            className="artist-input"
                            value={newServiceDuration}
                            onChange={e => setNewServiceDuration(e.target.value)}
                            placeholder="90"
                          />
                        </div>
                      </div>

                      <div className="artist-field">
                        <label className="artist-label">Description (Optional)</label>
                        <input
                          type="text"
                          className="artist-input"
                          value={newServiceDesc}
                          onChange={e => setNewServiceDesc(e.target.value)}
                          placeholder="Includes lash application, hairstyling, and draping..."
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => setShowAddService(false)}
                          className="artist-secondary-btn"
                          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="artist-save-btn" style={{ padding: '8px 20px', fontSize: '0.84rem' }}>
                          Save Service
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="service-list">
                    {services.length === 0 ? (
                      <div className="artist-empty">
                        <div className="artist-empty__icon"><Sparkles size={36} strokeWidth={1.5} color="var(--rose-deep)" /></div>
                        <p className="artist-empty__text">No custom packages listed yet.</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: 2 }}>
                          Click "+ Add Service" above to list specialized bridal or hair packages.
                        </p>
                      </div>
                    ) : (
                      services.map(service => (
                        <div key={service.id} className="service-card">
                          <div className="service-card__icon">
                            {service.icon || <Sparkles size={20} color="var(--rose-deep)" />}
                          </div>
                          <div className="service-card__info">
                            <div className="service-card__name">{service.name}</div>
                            <div className="service-card__meta">
                              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                              {service.duration || 60} mins {service.description ? `• ${service.description}` : ''}
                            </div>
                          </div>
                          <div className="service-card__price">₹{service.price?.toLocaleString()}</div>
                          <div className="service-card__actions">
                            <button
                              type="button"
                              className="service-card__btn service-card__btn--danger"
                              onClick={() => handleDeleteService(service.id)}
                              title="Delete Service"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('general')}
                >
                  <ArrowLeft size={15} />
                  <span>General & Bio</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('portfolio')}
                >
                  <span>Next: Portfolio & Badges</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: PORTFOLIO & CREDENTIALS (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'portfolio' && (
        <div className="artist-tab-content">
          <div className="artist-two-col--portfolio" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
            {/* Left Column: Portfolio Showcase */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <div>
                    <h2 className="artist-panel__title">Portfolio Showcase</h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                      {portfolioPhotos.length} {portfolioPhotos.length === 1 ? 'look uploaded' : 'looks uploaded'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="artist-save-btn"
                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                    onClick={() => portfolioInputRef.current?.click()}
                    disabled={uploadingPortfolio}
                  >
                    <Upload size={14} />
                    <span>{uploadingPortfolio ? 'Uploading...' : 'Upload Looks'}</span>
                  </button>
                </div>
                <div className="artist-panel__body">
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-soft)', marginBottom: 16 }}>
                    Showcase high-resolution photos of your best makeup, styling, and hair transformations.
                  </p>
                  <input ref={portfolioInputRef} type="file" accept="image/*" multiple hidden onChange={handlePortfolioChange} />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
                    {portfolioPhotos.map((url, idx) => {
                      let finalUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;
                      if (finalUrl.includes('cloudinary.com') && finalUrl.includes('/image/upload/') && finalUrl.endsWith('.pdf')) {
                        finalUrl = finalUrl.replace('.pdf', '.jpg');
                      }
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: 10,
                            overflow: 'hidden',
                            aspectRatio: '1',
                            background: '#f1f5f9',
                            border: '1px solid rgba(226, 214, 217, 0.7)'
                          }}
                        >
                          <img src={finalUrl} alt={`Portfolio look ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleRemovePortfolio(url)}
                              style={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: 'rgba(239,68,68,0.92)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                              }}
                              title="Remove image"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {portfolioPhotos.length === 0 && (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '36px 20px', color: 'var(--mid)', fontSize: '0.88rem' }}>
                        No portfolio photos uploaded yet. Click "Upload Looks" above to showcase your artistry.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('services')}
                >
                  <ArrowLeft size={15} />
                  <span>Services & Pricing</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('bank')}
                >
                  <span>Next: Bank & Payouts</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Right Column: Certifications & Diplomas */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Certifications & Badges</h2>
                  <button
                    type="button"
                    className="artist-secondary-btn"
                    style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                    onClick={() => certInputRef.current?.click()}
                    disabled={uploadingCert || isLocked}
                  >
                    <Upload size={13} />
                    <span>{uploadingCert ? 'Uploading...' : 'Add Doc'}</span>
                  </button>
                </div>
                <div className="artist-panel__body">
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-soft)', marginBottom: 14 }}>
                    Upload training academy diplomas or masterclass certificates (PDF or Image). Verified by Lume admins.
                  </p>
                  <input ref={certInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleCertChange} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {certFiles.map((url, idx) => {
                      const finalUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'rgba(255, 240, 243, 0.4)',
                            borderRadius: 10,
                            border: '1px solid rgba(242, 164, 176, 0.5)'
                          }}
                        >
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: 'var(--rose-deep)',
                              textDecoration: 'none'
                            }}
                          >
                            <span>📄 Document #{idx + 1}</span>
                            <ExternalLink size={13} />
                          </a>
                          {!isLocked && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCert(url)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: 4
                              }}
                              title="Remove Document"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {certFiles.length === 0 && (
                      <p style={{ color: 'var(--text-soft)', fontSize: '0.84rem', textAlign: 'center', padding: '16px 0' }}>
                        No credential documents uploaded yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="artist-tip-card">
                <BadgeCheck size={18} className="artist-tip-card__icon" />
                <div className="artist-tip-card__text">
                  <strong>Verification Impact:</strong> Verified certificates unlock the prestigious green verified badge displayed across all search filters.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: BANK & PAYOUTS (Left-to-Right 2-Col Grid)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'bank' && (
        <div className="artist-tab-content">
          <div className="artist-two-col">
            {/* Left Column: Payout Security & Guarantee */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Direct Payouts</h2>
                </div>
                <div className="artist-panel__body">
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                    background: 'rgba(52,152,219,0.08)', borderRadius: 10, marginBottom: 16,
                    border: '1px solid rgba(52,152,219,0.2)'
                  }}>
                    <Lock size={18} style={{ color: '#2980b9', marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: '0.84rem', color: '#2c3e50', lineHeight: 1.55 }}>
                      <strong>AES-256 Bank Encryption:</strong> Account numbers are encrypted end-to-end. Only masked digits are ever visible in the UI.
                    </div>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: 'var(--mid)', lineHeight: 1.6 }}>
                    <p style={{ marginBottom: 8 }}>
                      • <strong>Settlement Cycle:</strong> Earnings from completed appointments are transferred automatically via IMPS/NEFT within 24 hours.
                    </p>
                    <p>
                      • <strong>Zero Platform Deduction:</strong> What you quote is what you receive in full directly to your registered bank account.
                    </p>
                  </div>

                  {savedBankAccount && (
                    <div style={{
                      marginTop: 18,
                      padding: '12px 14px',
                      background: 'rgba(34,197,94,0.08)',
                      borderRadius: 10,
                      border: '1px solid rgba(34,197,94,0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.86rem', color: '#166534' }}>
                        <CheckCircle size={15} color="#16a34a" /> Saved & Active Account
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#166534' }}>
                        {savedBankAccount.bankName} · A/C {savedBankAccount.maskedAccountNumber}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                        IFSC: {savedBankAccount.ifscCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Bank Account Form */}
            <div className="artist-col-main">
              <div className="artist-panel">
                <div className="artist-panel__header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} style={{ color: 'var(--rose-deep)' }} />
                  <h2 className="artist-panel__title">Bank Account Details</h2>
                </div>

                <form className="artist-panel__body artist-form" onSubmit={handleSaveBankAccount}>
                  {bankSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <CheckCircle size={16} /> Bank account information encrypted and saved!
                    </div>
                  )}
                  {bankError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 10, fontSize: '0.88rem', fontWeight: 600 }}>
                      <AlertCircle size={16} /> {bankError}
                    </div>
                  )}

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">Account Holder Name</label>
                      <input
                        type="text"
                        className="artist-input"
                        value={bankHolderName}
                        onChange={e => setBankHolderName(e.target.value)}
                        placeholder="As printed on bank passbook / cheque"
                        required
                        disabled={savedBankAccount?.isVerified}
                      />
                    </div>
                    <div className="artist-field">
                      <label className="artist-label">Bank Name</label>
                      <input
                        type="text"
                        className="artist-input"
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                        required
                        disabled={savedBankAccount?.isVerified}
                      />
                    </div>
                  </div>

                  <div className="artist-form__row">
                    <div className="artist-field" style={{ position: 'relative' }}>
                      <label className="artist-label">Account Number</label>
                      <input
                        type={showAccountNumber ? 'text' : 'password'}
                        className="artist-input"
                        value={bankAccountNumber}
                        onChange={e => setBankAccountNumber(e.target.value)}
                        placeholder="Enter full account number"
                        autoComplete="off"
                        required
                        disabled={savedBankAccount?.isVerified}
                        style={{ paddingRight: 42 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccountNumber(v => !v)}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: 35,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--mid)',
                          padding: 0
                        }}
                        title={showAccountNumber ? 'Hide account number' : 'Show account number'}
                      >
                        {showAccountNumber ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="artist-field">
                      <label className="artist-label">Confirm Account Number</label>
                      <input
                        type="password"
                        className="artist-input"
                        value={bankConfirmAccount}
                        onChange={e => setBankConfirmAccount(e.target.value)}
                        placeholder="Re-enter account number"
                        autoComplete="off"
                        required
                        disabled={savedBankAccount?.isVerified}
                      />
                    </div>
                  </div>

                  <div className="artist-form__row">
                    <div className="artist-field">
                      <label className="artist-label">IFSC Code</label>
                      <input
                        type="text"
                        className="artist-input"
                        value={bankIfsc}
                        onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                        placeholder="e.g. HDFC0001234"
                        required
                        maxLength={11}
                        disabled={savedBankAccount?.isVerified}
                        style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
                      />
                    </div>
                    <div className="artist-field">
                      <label className="artist-label">Account Type</label>
                      <select
                        className="artist-select"
                        value={bankType}
                        onChange={e => setBankType(e.target.value)}
                        disabled={savedBankAccount?.isVerified}
                      >
                        <option value="SAVINGS">Savings Account</option>
                        <option value="CURRENT">Current Account</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="submit"
                      className="artist-save-btn"
                      disabled={bankLoading || savedBankAccount?.isVerified}
                    >
                      <Lock size={14} />
                      <span>
                        {bankLoading
                          ? 'Encrypting & Saving...'
                          : savedBankAccount?.isVerified
                          ? 'Account Verified & Locked'
                          : savedBankAccount
                          ? 'Update Bank Account'
                          : 'Save Bank Account'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('portfolio')}
                >
                  <ArrowLeft size={15} />
                  <span>Portfolio & Badges</span>
                </button>
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('verification')}
                >
                  <span>Next: Verification Status</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 5: VERIFICATION STATUS (Stepper Pipeline & Actions)
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'verification' && (
        <div className="artist-tab-content">
          <div className="artist-two-col--equal" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
            {/* Left Column: Verification Stepper Journey */}
            <div className="artist-col-side">
              <div className="artist-panel">
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">Verification Milestones</h2>
                </div>
                <div className="artist-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: location && phone ? '#dcfce7' : '#f1f5f9',
                      color: location && phone ? '#16a34a' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.84rem'
                    }}>
                      {location && phone ? '✓' : '1'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>General Info & Bio</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {location && phone ? 'Completed' : 'Requires location & phone number'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: weddingPrice || services.length > 0 ? '#dcfce7' : '#f1f5f9',
                      color: weddingPrice || services.length > 0 ? '#16a34a' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.84rem'
                    }}>
                      {weddingPrice || services.length > 0 ? '✓' : '2'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Pricing & Services Menu</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {weddingPrice || services.length > 0 ? 'Completed' : 'Requires standard rates or packages'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: portfolioPhotos.length > 0 ? '#dcfce7' : '#f1f5f9',
                      color: portfolioPhotos.length > 0 ? '#16a34a' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.84rem'
                    }}>
                      {portfolioPhotos.length > 0 ? '✓' : '3'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Portfolio Work Samples</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {portfolioPhotos.length > 0 ? `${portfolioPhotos.length} looks uploaded` : 'Requires at least 1 photo'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: savedBankAccount ? '#dcfce7' : '#f1f5f9',
                      color: savedBankAccount ? '#16a34a' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.84rem'
                    }}>
                      {savedBankAccount ? '✓' : '4'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Bank Payout Account</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        {savedBankAccount ? 'Linked securely' : 'Requires bank details for client payouts'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: verStatus === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                      color: verStatus === 'VERIFIED' ? '#16a34a' : '#d97706',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.84rem'
                    }}>
                      {verStatus === 'VERIFIED' ? '✓' : '5'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--dark)' }}>Lume Verification Approval</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                        Status: <strong>{verStatus.replace('_', ' ')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Submission & Review Action */}
            <div className="artist-col-main">
              <div className="artist-panel" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff7f8 100%)' }}>
                <div className="artist-panel__header">
                  <h2 className="artist-panel__title">
                    {verStatus === 'VERIFIED' || verStatus === 'EDIT_REQUESTED' ? 'Edit Permissions' : 'Submit for Verification'}
                  </h2>
                </div>
                <div className="artist-panel__body">
                  <p style={{ fontSize: '0.9rem', color: 'var(--mid)', lineHeight: 1.6, marginBottom: 18 }}>
                    {verStatus === 'VERIFIED' ? (
                      'Your profile is verified and live on the Lume public directory. To maintain authenticity and trust with high-value clients, profile updates require a quick administrative edit request.'
                    ) : verStatus === 'EDIT_REQUESTED' ? (
                      'Your edit request has been submitted and is currently pending admin review. You will receive an instant notification once edit mode is unlocked.'
                    ) : (
                      'Once you have filled out your general information, set your package rates, uploaded portfolio looks, and saved your bank account, submit your studio profile for editorial review.'
                    )}
                  </p>

                  {verifyMsg && (
                    <div style={{
                      padding: 12,
                      borderRadius: 10,
                      marginBottom: 16,
                      background: verifyMsg.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: verifyMsg.includes('failed') ? '#dc2626' : '#16a34a',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}>
                      {verifyMsg}
                    </div>
                  )}

                  {verStatus === 'VERIFIED' ? (
                    <button
                      type="button"
                      className="artist-save-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
                      onClick={handleRequestEdit}
                      disabled={submitting}
                    >
                      {submitting ? 'Requesting...' : <><ShieldCheck size={16} /> Request Edit Access</>}
                    </button>
                  ) : verStatus === 'EDIT_REQUESTED' ? (
                    <button
                      type="button"
                      className="artist-save-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', opacity: 0.7 }}
                      disabled
                    >
                      <ShieldCheck size={16} /> Edit Request Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="artist-save-btn"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
                      onClick={handleSubmitVerification}
                      disabled={submitting || verStatus === 'PENDING'}
                    >
                      {submitting ? 'Submitting...' : verStatus === 'PENDING' ? (
                        <><ShieldCheck size={16} /> Submitted — Awaiting Review</>
                      ) : (
                        <><Send size={16} /> Send for Verification</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Step Navigation Footer */}
              <div className="artist-tab-nav-footer">
                <button
                  type="button"
                  className="artist-secondary-btn"
                  onClick={() => setTab('bank')}
                >
                  <ArrowLeft size={15} />
                  <span>Bank & Payouts</span>
                </button>
                <Link
                  to="/discover"
                  className="artist-secondary-btn"
                >
                  <span>View Public Directory Listing</span>
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfile;
