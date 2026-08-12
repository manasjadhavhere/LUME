import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, CheckCircle, AlertCircle, Clock, Upload,
  Camera, Send, ShieldCheck, ShieldAlert, Shield, BadgeCheck, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { API_BASE } from '../../context/AuthContext';
import './ArtistPages.css';

const SPECIALTIES_LIST = [
  'Bridal', 'Editorial', 'Glam', 'Natural', 'Everyday',
  'Fantasy', 'Runway', 'Traditional', 'Evening', 'Bold',
];

interface ServiceItem {
  id: string; name: string; price: number; duration: number;
  icon: string; description?: string; isActive: boolean;
}

const VerificationBanner: React.FC<{ status: string, remarks?: string }> = ({ status, remarks }) => {
  if (status === 'VERIFIED') return (
    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 20px',background:'rgba(34,197,94,0.12)',color:'#16a34a',borderRadius:12,marginBottom:24,fontWeight:600 }}>
      <BadgeCheck size={20} /> Your profile is verified! You can now accept bookings.
    </div>
  );
  if (status === 'PENDING') return (
    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 20px',background:'rgba(234,179,8,0.12)',color:'#92400e',borderRadius:12,marginBottom:24,fontWeight:600 }}>
      <Shield size={20} /> Your profile is under review. We'll notify you once verified.
    </div>
  );
  if (status === 'REJECTED') return (
    <div style={{ padding:'14px 20px',background:'rgba(239,68,68,0.1)',color:'#dc2626',borderRadius:12,marginBottom:24 }}>
      <div style={{ display:'flex',alignItems:'center',gap:10,fontWeight:600 }}>
        <ShieldAlert size={20} /> Verification was rejected. Please update your profile and resubmit.
      </div>
      {remarks && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 8, fontSize: '0.9rem', borderLeft: '3px solid #dc2626' }}>
          <strong>Admin Remarks:</strong> {remarks}
        </div>
      )}
    </div>
  );
  return null;
};

const ArtistProfile: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { execute: apiExecute, loading } = useApi();

  const profile = user?.artistProfile;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Profile Form
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [experience, setExperience] = useState(String(profile?.experience || 0));
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

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || ''); setLocation(profile.location || '');
      setExperience(String(profile.experience || 0)); setCertification(profile.certification || '');
      setSpecialties(profile.specialties || []); setGender(profile.gender || '');
      setWeddingPrice(String(profile.weddingPrice || '')); setOccasionPrice(String(profile.occasionPrice || ''));
      setHourlyPrice(String(profile.hourlyPrice || '')); setServices(profile.services || []);
      setAvatarPreview(profile.profileImageUrl || user?.avatarUrl || '');
      setPortfolioPhotos(profile.portfolioUrls || []); setCertFiles(profile.certificationFiles || []);
    }
  }, [user, profile]);

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileSuccess(false); setProfileError('');
    try {
      await apiExecute('/api/artists/me/profile', {
        method: 'PUT',
        body: { bio, location, experience: parseInt(experience, 10) || 0, certification, specialties, gender: gender || undefined },
      });
      setProfileSuccess(true); await refreshUser();
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch { setProfileError('An error occurred while saving.'); }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault(); setPricingSuccess(false);
    await apiExecute('/api/artists/me/pricing', {
      method: 'PUT',
      body: {
        weddingPrice: weddingPrice ? parseFloat(weddingPrice) : undefined,
        occasionPrice: occasionPrice ? parseFloat(occasionPrice) : undefined,
        hourlyPrice: hourlyPrice ? parseFloat(hourlyPrice) : undefined,
      },
    });
    setPricingSuccess(true); await refreshUser();
    setTimeout(() => setPricingSuccess(false), 3000);
  };

  const uploadFile = async (endpoint: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
    });
    return res.json();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData(); fd.append('avatar', e.target.files[0]);
      const data = await uploadFile('/api/artists/me/avatar', fd);
      if (data.success) { setAvatarPreview(data.data.url); await refreshUser(); }
      else { alert(data.message || 'Upload failed'); }
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
      if (data.success) { setPortfolioPhotos(prev => [...prev, ...data.data.urls]); await refreshUser(); }
      else { alert(data.message || 'Upload failed'); }
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
      if (data.success) { setCertFiles(prev => [...prev, ...data.data.urls]); await refreshUser(); }
      else { alert(data.message || 'Upload failed'); }
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

  const handleSubmitVerification = async () => {
    setSubmitting(true); setVerifyMsg('');
    try {
      await apiExecute('/api/artists/me/submit-verification', { method: 'POST' });
      setVerifyMsg('Profile submitted for verification! You will be notified once reviewed.');
      await refreshUser();
    } catch (err) {
      setVerifyMsg(err instanceof Error ? err.message : 'Submission failed');
    }
    setSubmitting(false);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newServiceName || !newServicePrice) return;
    const created = await apiExecute('/api/artists/me/services', {
      method: 'POST',
      body: { name: newServiceName, price: parseFloat(newServicePrice), duration: parseInt(newServiceDuration, 10) || 60, icon: newServiceIcon || '', description: newServiceDesc },
    }) as ServiceItem | null;
    if (created) { setServices(prev => [...prev, created]); setShowAddService(false); setNewServiceName(''); setNewServicePrice(''); setNewServiceDesc(''); }
  };

  const handleDeleteService = async (serviceId: string) => {
    await apiExecute(`/api/artists/me/services/${serviceId}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const verStatus = profile?.verificationStatus || 'NOT_SUBMITTED';

  return (
    <div className="artist-page">
      <div className="artist-page__header">
        <h1 className="artist-page__title">Profile & Portfolio Builder</h1>
        <p className="artist-page__subtitle">Set up your profile, pricing, and portfolio to start accepting bookings.</p>
      </div>

      <VerificationBanner status={verStatus} remarks={profile?.verificationRemarks} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

        {/* Profile Image */}
        <div className="artist-panel">
          <div className="artist-panel__header"><h2 className="artist-panel__title">Profile Photo</h2></div>
          <div className="artist-panel__body" style={{ display:'flex',alignItems:'center',gap:24 }}>
            <div style={{ position:'relative',width:96,height:96,borderRadius:'50%',overflow:'hidden',background:'var(--rose-pale)',border:'2px solid var(--rose-light)',cursor:'pointer' }}
              onClick={() => avatarInputRef.current?.click()}>
              {avatarPreview
                ? <img src={avatarPreview.startsWith('/') ? `${API_BASE}${avatarPreview}` : avatarPreview} alt="Profile" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                : <Camera size={32} style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',color:'var(--rose-deep)' }} />
              }
              <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity .2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity='1')} onMouseLeave={e => (e.currentTarget.style.opacity='0')}>
                <Camera size={20} color="white" />
              </div>
            </div>
            <div>
              <p style={{ fontSize:'0.88rem',color:'var(--mid)',marginBottom:8 }}>Upload a clear, professional photo of yourself.</p>
              <button type="button" className="artist-save-btn" style={{ padding:'8px 16px' }} onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}>
                <Camera size={14} style={{ marginRight:6 }} />{uploadingAvatar ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
        </div>

        {/* General Info */}
        <div className="artist-panel">
          <div className="artist-panel__header"><h2 className="artist-panel__title">General Information</h2></div>
          <form className="artist-panel__body artist-form" onSubmit={handleSaveProfile}>
            {profileSuccess && <div style={{ display:'flex',alignItems:'center',gap:8,padding:12,background:'rgba(34,197,94,0.1)',color:'#16a34a',borderRadius:'var(--radius-sm)',fontSize:'0.85rem' }}><CheckCircle size={16} /> Profile saved!</div>}
            {profileError && <div style={{ display:'flex',alignItems:'center',gap:8,padding:12,background:'rgba(239,68,68,0.1)',color:'#dc2626',borderRadius:'var(--radius-sm)',fontSize:'0.85rem' }}><AlertCircle size={16} /> {profileError}</div>}

            <div className="artist-form__row">
              <div className="artist-field">
                <label className="artist-label">Location</label>
                <input type="text" className="artist-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bandra, Mumbai" required />
              </div>
              <div className="artist-field">
                <label className="artist-label">Years of Experience</label>
                <input type="number" className="artist-input" value={experience} onChange={e => setExperience(e.target.value)} min="0" max="50" />
              </div>
            </div>

            <div className="artist-form__row">
              <div className="artist-field">
                <label className="artist-label">Gender</label>
                <select className="artist-input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="artist-field">
                <label className="artist-label">Certification / Academy</label>
                <input type="text" className="artist-input" value={certification} onChange={e => setCertification(e.target.value)} placeholder="e.g. Certified Makeup Artist — VLCC" />
              </div>
            </div>

            <div className="artist-field">
              <label className="artist-label">Artist Bio</label>
              <textarea className="artist-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell clients about your style, experience, and beauty philosophy..." rows={4} />
            </div>

            <div className="artist-field">
              <label className="artist-label">Specialties</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:6 }}>
                {SPECIALTIES_LIST.map(s => (
                  <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                    style={{ padding:'6px 14px',borderRadius:'999px',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',border:'1.5px solid',
                      borderColor: specialties.includes(s) ? 'var(--rose-deep)' : 'rgba(42,26,31,0.12)',
                      background: specialties.includes(s) ? 'var(--rose-light)' : 'white',
                      color: specialties.includes(s) ? 'var(--rose-deep)' : 'var(--mid)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex',justifyContent:'flex-end',marginTop:8 }}>
              <button type="submit" className="artist-save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Pricing */}
        <div className="artist-panel">
          <div className="artist-panel__header"><h2 className="artist-panel__title">Pricing</h2></div>
          <form className="artist-panel__body artist-form" onSubmit={handleSavePricing}>
            {pricingSuccess && <div style={{ display:'flex',alignItems:'center',gap:8,padding:12,background:'rgba(34,197,94,0.1)',color:'#16a34a',borderRadius:'var(--radius-sm)',fontSize:'0.85rem' }}><CheckCircle size={16} /> Pricing saved!</div>}
            <p style={{ fontSize:'0.84rem',color:'var(--mid)',marginBottom:12 }}>Set your pricing. You can use flat rates for specific occasions or an hourly rate. You can set all three — clients will choose at booking.</p>
            <div className="artist-form__row">
              <div className="artist-field">
                <label className="artist-label">Wedding Makeup (₹)</label>
                <input type="number" className="artist-input" placeholder="e.g. 15000" min="0" value={weddingPrice} onChange={e => setWeddingPrice(e.target.value)} />
              </div>
              <div className="artist-field">
                <label className="artist-label">Any Other Occasion (₹)</label>
                <input type="number" className="artist-input" placeholder="e.g. 5000" min="0" value={occasionPrice} onChange={e => setOccasionPrice(e.target.value)} />
              </div>
              <div className="artist-field">
                <label className="artist-label">Hourly Rate (₹/hr)</label>
                <input type="number" className="artist-input" placeholder="e.g. 2000" min="0" value={hourlyPrice} onChange={e => setHourlyPrice(e.target.value)} />
              </div>
            </div>
            <div style={{ display:'flex',justifyContent:'flex-end',marginTop:8 }}>
              <button type="submit" className="artist-save-btn" disabled={loading}>Save Pricing</button>
            </div>
          </form>
        </div>

        {/* Portfolio Gallery */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Portfolio Showcase</h2>
            <button type="button" className="artist-save-btn" style={{ padding:'8px 14px',background:'var(--gold)' }}
              onClick={() => portfolioInputRef.current?.click()} disabled={uploadingPortfolio}>
              <Upload size={14} style={{ marginRight:6 }} />{uploadingPortfolio ? 'Uploading...' : 'Upload Looks'}
            </button>
          </div>
          <div className="artist-panel__body">
            <p style={{ fontSize:'0.85rem',color:'var(--text-soft)',marginBottom:16 }}>Showcase high-resolution photos of your best work. These will be visible to clients.</p>
            <input ref={portfolioInputRef} type="file" accept="image/*" multiple hidden onChange={handlePortfolioChange} />
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))',gap:'var(--spacing-md)' }}>
              {portfolioPhotos.map((url, idx) => (
                <div key={idx} style={{ position:'relative',borderRadius:'var(--radius-md)',overflow:'hidden',aspectRatio:'1',background:'#eee',border:'1px solid rgba(42,26,31,0.08)' }}>
                  <img src={url.startsWith('/') ? `${API_BASE}${url}` : url} alt="Portfolio" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                  <button type="button" onClick={() => handleRemovePortfolio(url)}
                    style={{ position:'absolute',top:8,right:8,width:28,height:28,borderRadius:'50%',background:'rgba(42,26,31,0.7)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {portfolioPhotos.length === 0 && (
                <div style={{ gridColumn:'1/-1',textAlign:'center',padding:32,color:'var(--mid)',fontSize:'0.88rem' }}>
                  No portfolio photos yet. Click "Upload Looks" to add your work.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Certifications & Documents</h2>
            <button type="button" className="artist-save-btn" style={{ padding:'8px 14px' }}
              onClick={() => certInputRef.current?.click()} disabled={uploadingCert}>
              <Upload size={14} style={{ marginRight:6 }} />{uploadingCert ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </div>
          <div className="artist-panel__body">
            <p style={{ fontSize:'0.85rem',color:'var(--mid)',marginBottom:12 }}>Upload certificates, diplomas, or other credentials. These are reviewed by our admin team for verification.</p>
            <input ref={certInputRef} type="file" accept="image/*,.pdf" multiple hidden onChange={handleCertChange} />
            <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
              {certFiles.map((url, idx) => (
                <a key={idx} href={url.startsWith('/') ? `${API_BASE}${url}` : url} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'var(--rose-pale)',borderRadius:8,fontSize:'0.82rem',fontWeight:600,color:'var(--rose-deep)',border:'1px solid var(--rose-light)',textDecoration:'none' }}>
                  Document {idx + 1}
                </a>
              ))}
              {certFiles.length === 0 && <p style={{ color:'var(--mid)',fontSize:'0.85rem' }}>No documents uploaded yet.</p>}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Service Menu</h2>
            <button type="button" onClick={() => setShowAddService(!showAddService)}
              style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:'var(--radius-md)',background:'var(--rose-deep)',color:'white',fontSize:'0.8rem',fontWeight:600,border:'none',cursor:'pointer' }}>
              <Plus size={14} /> Add Service
            </button>
          </div>
          <div className="artist-panel__body">
            {showAddService && (
              <form onSubmit={handleAddService} style={{ padding:'var(--spacing-md)',background:'rgba(42,26,31,0.03)',borderRadius:'var(--radius-md)',marginBottom:'var(--spacing-lg)',display:'flex',flexDirection:'column',gap:'var(--spacing-md)',border:'1px solid rgba(42,26,31,0.08)' }}>
                <div style={{ fontWeight:600,fontSize:'0.9rem',color:'var(--dark)' }}>New Service</div>
                <div className="artist-form__row">
                  <div className="artist-field"><label className="artist-label">Service Name</label><input type="text" className="artist-input" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="e.g. Bridal HD Makeup" required /></div>
                  <div className="artist-field"><label className="artist-label">Icon</label><input type="text" className="artist-input" value={newServiceIcon} onChange={e => setNewServiceIcon(e.target.value)} placeholder="e.g. Bridal" /></div>
                </div>
                <div className="artist-form__row">
                  <div className="artist-field"><label className="artist-label">Price (₹)</label><input type="number" className="artist-input" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="4999" required /></div>
                  <div className="artist-field"><label className="artist-label">Duration (mins)</label><input type="number" className="artist-input" value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value)} placeholder="120" /></div>
                </div>
                <div className="artist-field"><label className="artist-label">Description (Optional)</label><input type="text" className="artist-input" value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} placeholder="Full look including lashes..." /></div>
                <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowAddService(false)} style={{ padding:'8px 16px',background:'transparent',color:'var(--text-soft)',fontSize:'0.85rem',border:'none',cursor:'pointer' }}>Cancel</button>
                  <button type="submit" className="artist-save-btn" style={{ padding:'8px 18px' }}>Save Service</button>
                </div>
              </form>
            )}
            <div className="service-list">
              {services.length === 0 ? (
                <div className="artist-empty"><div className="artist-empty__icon"><Sparkles size={40} strokeWidth={1} /></div><p className="artist-empty__text">No services listed yet. Add your first beauty package above!</p></div>
              ) : services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-card__icon">{service.icon || <Sparkles size={24} />}</div>
                  <div className="service-card__info">
                    <div className="service-card__name">{service.name}</div>
                    <div className="service-card__meta"><Clock size={12} style={{ display:'inline',marginRight:4 }} />{service.duration || 60} mins {service.description ? `• ${service.description}` : ''}</div>
                  </div>
                  <div className="service-card__price">₹{service.price?.toLocaleString()}</div>
                  <div className="service-card__actions">
                    <button type="button" className="service-card__btn service-card__btn--danger" onClick={() => handleDeleteService(service.id)} title="Delete Service"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit for Verification */}
        {verStatus !== 'VERIFIED' && (
          <div className="artist-panel" style={{ background:'linear-gradient(135deg,#fff0f3,#fce8ec)',border:'1px solid var(--rose-light)' }}>
            <div className="artist-panel__header"><h2 className="artist-panel__title">Submit for Verification</h2></div>
            <div className="artist-panel__body">
              <p style={{ fontSize:'0.9rem',color:'var(--mid)',marginBottom:16,lineHeight:1.6 }}>
                Once you're happy with your profile, portfolio, and certifications, submit for review.
                Our admin team will verify your profile, and you'll receive a <strong>green verified badge</strong> once approved — after which you can start accepting bookings.
              </p>
              {verifyMsg && (
                <div style={{ padding:12,borderRadius:8,marginBottom:12,background: verifyMsg.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',color: verifyMsg.includes('failed') ? '#dc2626' : '#16a34a',fontSize:'0.88rem',fontWeight:500 }}>
                  {verifyMsg}
                </div>
              )}
              <button type="button" className="artist-save-btn"
                style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'12px 24px',fontSize:'0.92rem' }}
                onClick={handleSubmitVerification}
                disabled={submitting || verStatus === 'PENDING'}>
                {submitting ? 'Submitting...' : verStatus === 'PENDING' ? <><ShieldCheck size={16} /> Submitted — Awaiting Review</> : <><Send size={16} /> Send for Verification</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;
