import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, User, Palette, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import './AuthPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsLoading(true);
    setError('');
    try {
      const { role } = await register({
        email, password, name, role: selectedRole,
        phone: phone || undefined,
        gender: gender as any || undefined,
        dob: dob || undefined,
        location: location || undefined,
        mobileNumber: mobileNumber || undefined,
      });

      // Use the actual role returned from the server to guarantee correct redirection
      if (role === 'ARTIST') {
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
          <div className="auth-page__role-tabs">
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'CLIENT' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('CLIENT'); setError(''); }}
            >
              <User size={15} /><span>Client Account</span>
            </button>
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'ARTIST' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('ARTIST'); setError(''); }}
            >
              <Palette size={15} /><span>Artist Studio</span>
            </button>
          </div>

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
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__field">
              <label className="auth-page__label">Full Name</label>
              <input type="text" className="auth-page__input" placeholder="Priya Sharma"
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Email Address</label>
              <input type="email" className="auth-page__input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="auth-page__field">
                <label className="auth-page__label">Date of Birth</label>
                <input type="date" className="auth-page__input"
                  value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="auth-page__field">
                <label className="auth-page__label">Gender</label>
                <select className="auth-page__input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>

            {selectedRole === 'CLIENT' && (
              <>
                <div className="auth-page__field">
                  <label className="auth-page__label">Mobile Number</label>
                  <input type="tel" className="auth-page__input" placeholder="+91 98765 43210"
                    value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                </div>
                <div className="auth-page__field">
                  <label className="auth-page__label">Location</label>
                  <input type="text" className="auth-page__input" placeholder="Bandra, Mumbai"
                    value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </>
            )}

            {selectedRole === 'ARTIST' && (
              <div className="auth-page__field">
                <label className="auth-page__label">Phone Number</label>
                <input type="tel" className="auth-page__input" placeholder="+91 98765 43210"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}

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
              {isLoading
                ? <span>Creating account...</span>
                : <><span>{selectedRole === 'ARTIST' ? 'Create Artist Account' : 'Create Client Account'}</span> <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="auth-page__switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-page__link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
