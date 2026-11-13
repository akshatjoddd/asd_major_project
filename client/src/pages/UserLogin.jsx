import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../user/UserAuthContext';
import LanguageToggle from '../components/LanguageToggle';

export default function UserLogin() {
  const { t } = useTranslation();
  const { login, register } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/my-bookings';
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
      navigate(redirectPath, { replace: true });
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
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="login__panel">
        <Link className="brand" to="/">
          <span className="brand__mark">MX</span>
          <span className="brand__text">
            {t('common.appName')}
            <small>{t('common.museumName')}</small>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0',
              marginRight: '1.5rem',
              fontWeight: tab === 'login' ? 700 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderBottom: tab === 'login' ? '2px solid currentColor' : '2px solid transparent',
              marginBottom: '-1px',
              color: 'inherit',
            }}
          >
            {t('user.loginTab')}
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 0',
              fontWeight: tab === 'register' ? 700 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              borderBottom: tab === 'register' ? '2px solid currentColor' : '2px solid transparent',
              marginBottom: '-1px',
              color: 'inherit',
            }}
          >
            {t('user.registerTab')}
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--error, #dc2626)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        {tab === 'login' ? (
          <form className="login__form" onSubmit={handleLogin}>
            <div className="login__head" style={{ marginBottom: '1.25rem' }}>
              <h1>{t('user.loginTitle')}</h1>
            </div>

            <label className="field">
              <span>{t('common.email')}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </label>

            <label className="field">
              <span>{t('user.password')}</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </label>

            <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
              {loading ? t('common.loading') : t('user.loginCta')}
            </button>

            <p className="login__hint">
              {t('user.noAccount')}{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit', color: 'inherit' }}
                onClick={() => { setTab('register'); setError(''); }}
              >
                {t('user.registerTab')}
              </button>
            </p>
          </form>
        ) : (
          <form className="login__form" onSubmit={handleRegister}>
            <div className="login__head" style={{ marginBottom: '1.25rem' }}>
              <h1>{t('user.registerTitle')}</h1>
            </div>

            <label className="field">
              <span>{t('common.name')}</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </label>

            <label className="field">
              <span>{t('common.email')}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </label>

            <label className="field">
              <span>{t('user.password')}</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </label>

            <label className="field">
              <span>
                {t('common.phone')}{' '}
                <small style={{ opacity: 0.6 }}>({t('common.optional')})</small>
              </span>
              <input
                type="tel"
                autoComplete="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </label>

            <button type="submit" className="btn btn--accent btn--block" disabled={loading}>
              {loading ? t('common.loading') : t('user.registerCta')}
            </button>

            <p className="login__hint">
              {t('user.hasAccount')}{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit', color: 'inherit' }}
                onClick={() => { setTab('login'); setError(''); }}
              >
                {t('user.loginTab')}
              </button>
            </p>
          </form>
        )}

        <div className="login__foot">
          <LanguageToggle compact />
          <Link to="/">{t('nav.home')}</Link>
        </div>
      </div>

      <div className="login__art" aria-hidden="true">
        <span className="login__artMark">MX</span>
        <p>{t('common.museumName')}</p>
      </div>
    </div>
  );
}
