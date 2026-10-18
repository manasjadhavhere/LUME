import GoogleAuthButton from '../../components/ui/GoogleAuthButton';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Palette, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import './AuthPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'ADMIN'>>(() => new URLSearchParams(window.location.search).get('role') === 'ARTIST' ? 'ARTIST' : 'CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || googleBusy || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const { role } = await login(email, password);

      if (role !== selectedRole) {
        setError(
          `This account belongs to a ${role.toLowerCase()}. Switching profile view to match your account role.`
        );
      }

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'ARTIST') {
        navigate('/artist-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button 
        className="auth-page__back-btn" 
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="auth-page__container">
        {/* Brand Logo */}
        <Link to="/" className="lume-brand" aria-label="Lume home" style={{ margin: '0 auto', textDecoration: 'none' }}>
          <span className="lume-brand__mark">
            <img src="/logo.png" alt="Lume logo" />
          </span>
          <span className="lume-brand__name">LUME</span>
        </Link>

        {/* Editorial Login Card */}
        <div className="auth-page__card">
          {/* Role Tab Switcher */}
          <div className="auth-page__role-tabs">
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'CLIENT' ? 'auth-page__role-tab--active' : ''}`}
              disabled={isLoading || googleBusy} onClick={() => { setSelectedRole('CLIENT'); setError(''); }}
            >
              <User size={15} />
              <span>Client Sign In</span>
            </button>

            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'ARTIST' ? 'auth-page__role-tab--active' : ''}`}
              disabled={isLoading || googleBusy} onClick={() => { setSelectedRole('ARTIST'); setError(''); }}
            >
              <Palette size={15} />
              <span>Artist Studio</span>
            </button>
          </div>

          {/* Title Header */}
          <div className="auth-page__header">
            <h1 className="auth-page__title">
              {selectedRole === 'ARTIST' ? 'Artist Studio Portal' : 'Welcome back to Lume'}
            </h1>
            <p className="auth-page__subtitle">
              {selectedRole === 'ARTIST'
                ? 'Sign in to manage your appointments, availability, and studio portfolio.'
                : 'Sign in to discover and book premier beauty artists across India.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="auth-page__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <GoogleAuthButton key={selectedRole} role={selectedRole} disabled={isLoading || googleBusy} onBusyChange={setGoogleBusy} />

          <form className="auth-page__form" onSubmit={handleLogin}>
            <div className="auth-page__field">
              <label className="auth-page__label">Email Address</label>
              <input
                type="email"
                className="auth-page__input"
              placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Password</label>
              <div className="auth-page__input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-page__input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-page__toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={isLoading || googleBusy}>
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to {selectedRole === 'ARTIST' ? 'Artist Studio' : 'Lume'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <p className="auth-page__switch">
            New to Lume?{' '}
            <Link to={`/register?role=${selectedRole}`} className="auth-page__link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
