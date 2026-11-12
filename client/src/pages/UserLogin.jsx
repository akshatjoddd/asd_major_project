import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../user/UserAuthContext';

export default function UserLogin() {
  const { t } = useTranslation();
  const { login, register } = useUserAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name: regName, email: regEmail, password: regPassword, phone: regPhone || undefined });
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="login" style={{ width: '100%', maxWidth: 420 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--surface-2, #e5e7eb)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`btn btn--small${tab === 'login' ? ' btn--accent' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: tab === 'login' ? '2px solid var(--accent, #2563eb)' : 'none' }}
            onClick={() => { setTab('login'); setError(''); }}
          >
            {t('user.loginTab')}
          </button>
          <button
            type="button"
            className={`btn btn--small${tab === 'register' ? ' btn--accent' : ''}`}
            style={{ flex: 1, borderRadius: 0, borderBottom: tab === 'register' ? '2px solid var(--accent, #2563eb)' : 'none' }}
            onClick={() => { setTab('register'); setError(''); }}
          >
            {t('user.registerTab')}
          </button>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: '1rem', color: 'var(--error, #dc2626)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form className="form" onSubmit={handleLogin}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {t('user.loginTitle')}
            </h1>
            <div className="field">
              <label htmlFor="login-email">{t('common.email')}</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">{t('user.password')}</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button className="btn btn--accent" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? t('common.loading') : t('user.loginCta')}
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {t('user.noAccount')}{' '}
              <button type="button" className="btn btn--small" onClick={() => { setTab('register'); setError(''); }}>
                {t('user.registerTab')}
              </button>
            </p>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegister}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {t('user.registerTitle')}
            </h1>
            <div className="field">
              <label htmlFor="reg-name">{t('common.name')}</label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-email">{t('common.email')}</label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">{t('user.password')}</label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-phone">{t('common.phone')} <span style={{ opacity: 0.6 }}>({t('common.optional')})</span></label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            <button className="btn btn--accent" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? t('common.loading') : t('user.registerCta')}
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
              {t('user.hasAccount')}{' '}
              <button type="button" className="btn btn--small" onClick={() => { setTab('login'); setError(''); }}>
                {t('user.loginTab')}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
