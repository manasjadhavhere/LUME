import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, User, Palette, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import './AuthPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    if (role === 'ARTIST') {
      setEmail('aria@lume.in');
      setPassword('password123');
    } else {
      setEmail('priya@demo.com');
      setPassword('password123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      const { role } = await login(email, password);

      if (role !== selectedRole) {
        setError(
          `This account belongs to a ${role.toLowerCase()}. Switching profile view to match your account role.`
        );
      }

      if (role === 'ARTIST') {
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
      <div className="auth-page__container">
        {/* Brand Logo */}
        <Link to="/" className="auth-page__logo">
          <Sparkles size={20} />
          <span>LUME</span>
        </Link>

        {/* Editorial Login Card */}
        <div className="auth-page__card">
          {/* Role Tab Switcher */}
          <div className="auth-page__role-tabs">
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'CLIENT' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('CLIENT'); setError(''); }}
            >
              <User size={15} />
              <span>Client Sign In</span>
            </button>

            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'ARTIST' ? 'auth-page__role-tab--active' : ''}`}
              onClick={() => { setSelectedRole('ARTIST'); setError(''); }}
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
          <form className="auth-page__form" onSubmit={handleLogin}>
            <div className="auth-page__field">
              <label className="auth-page__label">Email Address</label>
              <input
                type="email"
                className="auth-page__input"
                placeholder={selectedRole === 'ARTIST' ? 'aria@lume.in' : 'priya@demo.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
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

            <button type="submit" className="auth-page__submit" disabled={isLoading}>
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

          {/* Quick Demo Credentials Strip */}
          <div className="auth-page__demo-strip">
            <span className="auth-page__demo-label">Testing locally? Fill demo credentials instantly:</span>
            <div className="auth-page__demo-buttons">
              <button
                type="button"
                className="auth-page__demo-btn"
                onClick={() => handleFillDemo('CLIENT')}
              >
                <User size={13} /> Demo Client
              </button>
              <button
                type="button"
                className="auth-page__demo-btn"
                onClick={() => handleFillDemo('ARTIST')}
              >
                <Palette size={13} /> Demo Artist
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <p className="auth-page__switch">
            New to Lume?{' '}
            <Link to="/register" className="auth-page__link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
