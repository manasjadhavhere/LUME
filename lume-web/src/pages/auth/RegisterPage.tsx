import GoogleAuthButton from '../../components/ui/GoogleAuthButton';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Palette, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import LocationAutocomplete from '../../components/ui/LocationAutocomplete';
import PhoneInput from '../../components/ui/PhoneInput';
import './AuthPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'ADMIN'>>(() =>
    new URLSearchParams(window.location.search).get('role') === 'ARTIST' ? 'ARTIST' : 'CLIENT'
  );
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
  const [googleBusy, setGoogleBusy] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (googleBusy || isLoading) return;
    if (step < 3) {
      setError('');
      setStep(step + 1);
      return;
    }
    if (!name || !email || !password || googleBusy || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const formattedPhone = phone ? (phone.startsWith('+91') ? phone : `+91${phone}`) : undefined;
      const formattedMobile = mobileNumber ? (mobileNumber.startsWith('+91') ? mobileNumber : `+91${mobileNumber}`) : undefined;

      const { role } = await register({
        email, password, name, role: selectedRole,
        phone: formattedPhone,
        gender: gender || undefined,
        dob: dob || undefined,
        location: location || undefined,
        mobileNumber: formattedMobile,
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
    <div className="auth-page auth-page--login auth-page--register">
      <button 
        className="auth-page__back-btn" 
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="auth-page__container">
        <Link to="/" className="lume-brand" aria-label="Lume home" style={{ margin: '0 auto', textDecoration: 'none' }}>
          <span className="lume-brand__mark">
            <img src="/logo.png" alt="Lume logo" />
          </span>
          <span className="lume-brand__name">LUME</span>
        </Link>

        <div className="auth-page__card">
          <div className="auth-page__role-tabs">
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'CLIENT' ? 'auth-page__role-tab--active' : ''}`}
              disabled={isLoading || googleBusy} onClick={() => { setSelectedRole('CLIENT'); setError(''); }}
            >
              <User size={15} /><span>Client Account</span>
            </button>
            <button
              type="button"
              className={`auth-page__role-tab ${selectedRole === 'ARTIST' ? 'auth-page__role-tab--active' : ''}`}
              disabled={isLoading || googleBusy} onClick={() => { setSelectedRole('ARTIST'); setError(''); }}
            >
              <Palette size={15} /><span>Artist Studio</span>
            </button>
          </div>

          <div className="auth-page__header">
            <h1 className="auth-page__title">
              {step === 2 ? 'Your contact details' : step === 3 ? 'Personalize your profile' : selectedRole === 'ARTIST' ? 'Join as an Artist' : 'Create your Account'}
            </h1>
            <p className="auth-page__subtitle">
              Step {step} of 3 · {step === 1 ? 'Account' : step === 2 ? 'Contact' : 'Profile'}
            </p>
            <div className="auth-page__progress" aria-label={`Registration step ${step} of 3`}>
              {[1, 2, 3].map(item => <span key={item} className={item <= step ? 'is-complete' : ''} />)}
            </div>
          </div>

          {error && (
            <div className="auth-page__error">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          {step === 1 && <GoogleAuthButton key={selectedRole} role={selectedRole} disabled={isLoading || googleBusy} onBusyChange={setGoogleBusy} />}

          <form className="auth-page__form" onSubmit={handleSubmit}>
            {step === 2 && <div className="auth-page__field">
              <label htmlFor="register-name" className="auth-page__label">Full Name</label>
              <input id="register-name" type="text" className="auth-page__input" placeholder="Priya Sharma"
                value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            </div>}

            {step === 1 && <div className="auth-page__field">
              <label htmlFor="register-email" className="auth-page__label">Email Address</label>
              <input id="register-email" type="email" className="auth-page__input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>}

            {step === 2 && selectedRole === 'CLIENT' && (
              <div className="auth-page__field">
                <label htmlFor="register-mobile" className="auth-page__label">Mobile Number</label>
                <PhoneInput
                  id="register-mobile"
                  value={mobileNumber}
                  onChange={setMobileNumber}
                  placeholder="98765 43210"
                />
              </div>
            )}

            {step === 2 && selectedRole === 'ARTIST' && (
              <div className="auth-page__field">
                <label htmlFor="register-phone" className="auth-page__label">Phone Number</label>
                <PhoneInput
                  id="register-phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="98765 43210"
                />
              </div>
            )}

            {step === 3 && <div className="auth-page__field">
              <label htmlFor="register-location" className="auth-page__label">Location</label>
              <LocationAutocomplete
                id="register-location"
                value={location}
                onChange={setLocation}
                placeholder="City, neighbourhood or pincode"
                className="auth-page__input"
              />
            </div>}

            {step === 3 && <div className="auth-page__field-row">
              <div className="auth-page__field">
                <label htmlFor="register-dob" className="auth-page__label">Date of Birth</label>
                <input id="register-dob" type="date" className="auth-page__input"
                  value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="auth-page__field">
                <label htmlFor="register-gender" className="auth-page__label">Gender</label>
                <select id="register-gender" className="auth-page__input" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>}

            {step === 1 && <div className="auth-page__field">
              <label htmlFor="register-password" className="auth-page__label">Password</label>
              <div className="auth-page__input-wrap">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-page__input"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-page__toggle-pw" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>}

            <div className="auth-page__actions">
            {step > 1 && <button type="button" className="auth-page__previous" disabled={isLoading || googleBusy}
              onClick={() => { setStep(step - 1); setError(''); }}>
              <ArrowLeft size={16} /> Back
            </button>}
            <button
              key={step}
              type="submit"
              className="auth-page__submit"
              disabled={isLoading || googleBusy || (step === 1 && (!email || password.length < 8)) || (step === 2 && !name)}
            >
              {isLoading
                ? <span>Creating account...</span>
                : <><span>{step < 3 ? 'Continue' : selectedRole === 'ARTIST' ? 'Create Artist Account' : 'Create Client Account'}</span> <ArrowRight size={16} /></>
              }
            </button>
            </div>
          </form>

          <p className="auth-page__switch">
            Already have an account?{' '}
            <Link to={`/login?role=${selectedRole}`} className="auth-page__link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
