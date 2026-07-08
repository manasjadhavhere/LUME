import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, User, Palette, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import './AuthPage.css';

const SPECIALTIES = ['Bridal', 'Editorial', 'Glam', 'Natural', 'Everyday', 'Fantasy', 'Runway', 'Traditional', 'Evening', 'Bold'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [step, setStep] = useState<'details' | 'artist-extra'>('details');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Artist extras
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (selectedRole === 'ARTIST') {
      setStep('artist-extra');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      await register({
        email,
        password,
        name,
        role: selectedRole,
        phone: phone || undefined,
        location: location || undefined,
        bio: bio || undefined,
        specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
        experience: experience ? parseInt(experience) : undefined,
      });

      if (selectedRole === 'ARTIST') {
        navigate('/artist-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <Link to="/" className="auth-page__logo">
          <Sparkles size={20} />
          <span>LUME</span>
        </Link>

        <div className="auth-page__card">
          {/* Role Tab Switcher */}
          <div className="auth-page__role-tabs">
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'CLIENT' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('CLIENT'); setStep('details'); setError(''); }}
            >
              <User size={15} />
              <span>Client Account</span>
            </button>

            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'ARTIST' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('ARTIST'); setStep('details'); setError(''); }}
            >
              <Palette size={15} />
              <span>Artist Studio</span>
            </button>
          </div>

          {/* Step 1: Basic Details */}
          {step === 'details' && (
            <>
              <div className="auth-page__header">
                <h1 className="auth-page__title">
                  {selectedRole === 'ARTIST' ? 'Join as an Artist' : 'Create your Account'}
                </h1>
                <p className="auth-page__subtitle">
                  {selectedRole === 'ARTIST'
                    ? 'Start taking bookings and build your luxury beauty portfolio.'
                    : 'Discover and book premier makeup artists across India.'}
                </p>
              </div>

              {error && (
                <div className="auth-page__error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form className="auth-page__form" onSubmit={handleDetailsNext}>
                <div className="auth-page__field">
                  <label className="auth-page__label">Full Name</label>
                  <input
                    type="text"
                    className="auth-page__input"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="auth-page__field">
                  <label className="auth-page__label">Email Address</label>
                  <input
                    type="email"
                    className="auth-page__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-page__field">
                  <label className="auth-page__label">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="auth-page__input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div className="auth-page__field">
                  <label className="auth-page__label">Password</label>
                  <div className="auth-page__input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-page__input"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button type="button" className="auth-page__toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-page__submit"
                  disabled={!name || !email || !password || password.length < 8 || isLoading}
                >
                  {selectedRole === 'ARTIST' ? (
                    <><span>Next: Artist Profile</span> <ArrowRight size={16} /></>
                  ) : isLoading ? (
                    <span>Creating account...</span>
                  ) : (
                    <><span>Create Client Account</span> <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="auth-page__switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-page__link">Sign In</Link>
              </p>
            </>
          )}

          {/* Step 2: Artist Studio Setup */}
          {step === 'artist-extra' && (
            <>
              <div className="auth-page__header">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mid)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    marginBottom: 4,
                  }}
                >
                  ← Back to details
                </button>
                <h1 className="auth-page__title">Studio Details</h1>
                <p className="auth-page__subtitle">
                  Help prospective clients discover your location, experience, and signature looks.
                </p>
              </div>

              {error && (
                <div className="auth-page__error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-page__form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="auth-page__field">
                    <label className="auth-page__label">City / Area</label>
                    <input
                      type="text"
                      className="auth-page__input"
                      placeholder="Bandra, Mumbai"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="auth-page__field">
                    <label className="auth-page__label">Experience (Yrs)</label>
                    <input
                      type="number"
                      className="auth-page__input"
                      placeholder="5"
                      min="0"
                      max="50"
                      value={experience}
                      onChange={e => setExperience(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-page__field">
                  <label className="auth-page__label">Short Studio Bio</label>
                  <textarea
                    className="auth-page__input"
                    placeholder="Tell clients about your bridal experience, artistic style, and skincare prep..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="auth-page__field">
                  <label className="auth-page__label">Specialties</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SPECIALTIES.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSpecialty(s)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '99px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: selectedSpecialties.includes(s) ? 'var(--rose-deep)' : 'rgba(42,26,31,0.14)',
                          background: selectedSpecialties.includes(s) ? '#fce8ec' : '#ffffff',
                          color: selectedSpecialties.includes(s) ? 'var(--rose-deep)' : 'var(--dark)',
                        }}
                      >
                        {selectedSpecialties.includes(s) && (
                          <Check size={12} style={{ marginRight: 4, display: 'inline' }} />
                        )}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="auth-page__submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? <span>Launching Studio...</span> : <span>Launch Studio Profile ✨</span>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
