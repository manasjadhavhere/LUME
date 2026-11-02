import { useLayoutEffect, useRef, useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GoogleAuthButton({ role, disabled, onBusyChange }: { role: 'CLIENT' | 'ARTIST'; disabled?: boolean; onBusyChange?: (busy: boolean) => void }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [sdkFailed, setSdkFailed] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(300);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const observer = new ResizeObserver(() => {
      setButtonWidth(Math.min(300, Math.floor(button.getBoundingClientRect().width)));
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [clientId]);

  const authenticate = async (credential: string, password?: string) => {
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      const result = await loginWithGoogle(credential, role, password);
      navigate(result.role === 'ADMIN' ? '/admin' : result.role === 'ARTIST' ? '/artist-dashboard' : '/home', { replace: true });
    } catch (err) {
      if ((err as { code?: string }).code === 'GOOGLE_LINK_REQUIRED') setLinkToken(credential);
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally { setBusy(false); onBusyChange?.(false); }
  };
  if (!clientId) return <div className="auth-google">
    <button type="button" className="auth-google__fallback" disabled={disabled}
      onClick={() => setError('Google sign-in is currently unavailable. Please continue with email.')}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9l3.35-2.59Z" />
        <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.59A5.99 5.99 0 0 1 12 5.97Z" />
      </svg>
      Continue with Google
    </button>
    {error && <p className="auth-google__notice" role="status">{error}</p>}
    <div className="auth-google__divider"><span>or continue with email</span></div>
  </div>;
  return <div className="auth-google">
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => setSdkFailed(true)}>
      <div ref={buttonRef} className={`auth-google__button ${busy || disabled ? 'is-busy' : ''}`} inert={busy || disabled}>
        <GoogleLogin onSuccess={response => { if (response.credential) void authenticate(response.credential); }} onError={() => setError('Google sign-in was not completed. Please try again or continue with email.')}
          theme="outline" size="large" shape="pill" text="continue_with" width={buttonWidth} useOneTap={false} />
      </div>
    </GoogleOAuthProvider>
    {busy && <p role="status">Signing you in securely…</p>}
    {(error || sdkFailed) && <p className="auth-page__error" role="alert">{error || 'Google sign-in could not load. Please continue with email or check your connection.'}</p>}
    {linkToken && <form className="auth-google__link" onSubmit={e => { e.preventDefault(); void authenticate(linkToken, linkPassword); }}>
      <label htmlFor="google-link-password">Existing Lume password</label>
      <input id="google-link-password" className="auth-page__input" type="password" value={linkPassword} onChange={e => setLinkPassword(e.target.value)} autoComplete="current-password" required />
      <button className="auth-page__submit" type="submit" disabled={busy}>Link account and continue</button>
      <button type="button" className="auth-page__link" onClick={() => { setLinkToken(null); setLinkPassword(''); setError(''); }}>Cancel linking</button>
    </form>}
    <div className="auth-google__divider"><span>or continue with email</span></div>
  </div>;
}
