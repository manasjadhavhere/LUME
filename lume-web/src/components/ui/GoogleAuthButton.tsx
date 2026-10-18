import { useState } from 'react';
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
  if (!clientId) return null;
  return <div className="auth-google">
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => setSdkFailed(true)}>
      <div className={`auth-google__button ${busy || disabled ? 'is-busy' : ''}`} inert={busy || disabled}>
        <GoogleLogin onSuccess={response => { if (response.credential) void authenticate(response.credential); }} onError={() => setError('Google sign-in was not completed. Please try again or continue with email.')}
          theme="outline" size="large" shape="pill" text="continue_with" width="300" useOneTap={false} />
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
