import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
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

const ArtistProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { execute: apiExecute, loading } = useApi();

  // Profile Form state
  const [bio, setBio] = useState(user?.artistProfile?.bio || '');
  const [location, setLocation] = useState(user?.artistProfile?.location || '');
  const [experience, setExperience] = useState(String(user?.artistProfile?.experience || 0));
  const [certification, setCertification] = useState(user?.artistProfile?.certification || '');
  const [specialties, setSpecialties] = useState<string[]>(user?.artistProfile?.specialties || []);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Services state
  const [services, setServices] = useState<ServiceItem[]>(user?.artistProfile?.services || []);
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('90');
  const [newServiceIcon, setNewServiceIcon] = useState('✨');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Portfolio Media
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80',
  ]);

  useEffect(() => {
    if (user?.artistProfile) {
      setBio(user.artistProfile.bio || '');
      setLocation(user.artistProfile.location || '');
      setExperience(String(user.artistProfile.experience || 0));
      setCertification(user.artistProfile.certification || '');
      setSpecialties(user.artistProfile.specialties || []);
      setServices(user.artistProfile.services || []);
    }
  }, [user]);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError('');

    try {
      const updated = await apiExecute('/api/artists/me/profile', {
        method: 'PUT',
        body: {
          bio,
          location,
          experience: parseInt(experience, 10) || 0,
          certification,
          specialties,
        },
      }) as any;

      if (updated) {
        setProfileSuccess(true);
        updateUser({
          ...user!,
          artistProfile: { ...user!.artistProfile!, bio, location, experience: parseInt(experience, 10) || 0, certification, specialties },
        });
        setTimeout(() => setProfileSuccess(false), 4000);
      } else {
        setProfileError('Failed to save profile changes.');
      }
    } catch (err) {
      setProfileError('An error occurred while saving.');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    try {
      const created = await apiExecute('/api/artists/me/services', {
        method: 'POST',
        body: {
          name: newServiceName,
          price: parseFloat(newServicePrice),
          duration: parseInt(newServiceDuration, 10) || 60,
          icon: newServiceIcon || '✨',
          description: newServiceDesc,
        },
      }) as ServiceItem;

      if (created) {
        setServices((prev) => [...prev, created]);
        setShowAddService(false);
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDesc('');
      }
    } catch {
      // Handle error locally if needed
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await apiExecute(`/api/artists/me/services/${serviceId}`, {
        method: 'DELETE',
      });
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch {
      // Handle error
    }
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPortfolioPhotos((prev) => [url, ...prev]);
    }
  };

  return (
    <div className="artist-page">
      <div className="artist-page__header">
        <h1 className="artist-page__title">Profile & Portfolio Builder</h1>
        <p className="artist-page__subtitle">
          Customize how clients see your profile, manage your service menu, and showcase your best looks.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
        {/* Profile General Settings */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">General Information</h2>
          </div>
          <form className="artist-panel__body artist-form" onSubmit={handleSaveProfile}>
            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <CheckCircle size={16} /> Profile saved successfully!
              </div>
            )}
            {profileError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'rgba(239,68,68,0.1)', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {profileError}
              </div>
            )}

            <div className="artist-form__row">
              <div className="artist-field">
                <label className="artist-label">Location</label>
                <input
                  type="text"
                  className="artist-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bandra, Mumbai"
                  required
                />
              </div>

              <div className="artist-field">
                <label className="artist-label">Years of Experience</label>
                <input
                  type="number"
                  className="artist-input"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="artist-field">
              <label className="artist-label">Certification / Academy</label>
              <input
                type="text"
                className="artist-input"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                placeholder="e.g. Certified Makeup Artist — VLCC Institute"
              />
            </div>

            <div className="artist-field">
              <label className="artist-label">Artist Bio</label>
              <textarea
                className="artist-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell prospective clients about your artistic style, experience, and beauty philosophy..."
                rows={4}
              />
            </div>

            <div className="artist-field">
              <label className="artist-label">Specialties</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {SPECIALTIES_LIST.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: specialties.includes(s) ? 'var(--rose-deep)' : 'rgba(42,26,31,0.12)',
                      background: specialties.includes(s) ? 'var(--rose-light)' : 'white',
                      color: specialties.includes(s) ? 'var(--rose-deep)' : 'var(--mid)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="artist-save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Service Menu Editor */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Service Menu Editor</h2>
            <button
              type="button"
              onClick={() => setShowAddService(!showAddService)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--rose-deep)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <Plus size={14} /> Add Service
            </button>
          </div>

          <div className="artist-panel__body">
            {showAddService && (
              <form
                onSubmit={handleAddService}
                style={{
                  padding: 'var(--spacing-md)',
                  background: 'rgba(42,26,31,0.03)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)',
                  border: '1px solid rgba(42,26,31,0.08)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' }}>Create New Service</div>
                <div className="artist-form__row">
                  <div className="artist-field">
                    <label className="artist-label">Service Name</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Bridal HD Makeup"
                      required
                    />
                  </div>
                  <div className="artist-field">
                    <label className="artist-label">Emoji Icon</label>
                    <input
                      type="text"
                      className="artist-input"
                      value={newServiceIcon}
                      onChange={(e) => setNewServiceIcon(e.target.value)}
                      placeholder="👰"
                    />
                  </div>
                </div>

                <div className="artist-form__row">
                  <div className="artist-field">
                    <label className="artist-label">Price (INR)</label>
                    <input
                      type="number"
                      className="artist-input"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="4999"
                      required
                    />
                  </div>
                  <div className="artist-field">
                    <label className="artist-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="artist-input"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      placeholder="120"
                    />
                  </div>
                </div>

                <div className="artist-field">
                  <label className="artist-label">Description (Optional)</label>
                  <input
                    type="text"
                    className="artist-input"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Full look including lashes, skin prep, and draping support"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-soft)', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="artist-save-btn" style={{ padding: '8px 18px' }}>
                    Save Service
                  </button>
                </div>
              </form>
            )}

            <div className="service-list">
              {services.length === 0 ? (
                <div className="artist-empty">
                  <div className="artist-empty__icon">✨</div>
                  <p className="artist-empty__text">No services listed yet. Add your first beauty package above!</p>
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-card__icon">{service.icon || '✨'}</div>
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

        {/* Portfolio Gallery Upload */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">Portfolio Showcase</h2>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gold)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} /> Upload Look
              <input type="file" accept="image/*" hidden onChange={handleFileUploadMock} />
            </label>
          </div>
          <div className="artist-panel__body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: 16 }}>
              Showcase high-resolution photos of bridal looks, editorial shoots, and party glam.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--spacing-md)',
              }}
            >
              {portfolioPhotos.map((url, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    background: '#eee',
                    border: '1px solid rgba(42,26,31,0.08)',
                  }}
                >
                  <img
                    src={url}
                    alt="Portfolio item"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setPortfolioPhotos(prev => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(42,26,31,0.7)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;
