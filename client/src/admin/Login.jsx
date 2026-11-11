import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth/AuthContext';
import LanguageToggle from '../components/LanguageToggle';
import ErrorBox from '../components/ErrorBox';

export default function Login() {
  const { t } = useTranslation();
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (session) {
    return <Navigate to={session.role === 'gate' ? '/admin/validate' : '/admin'} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await login(form.email.trim(), form.password);
      const fallback = location.state?.from || '/admin';
      navigate(result.role === 'gate' ? '/admin/validate' : fallback, { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login__panel">
        <Link className="brand brand--light" to="/">
          <span className="brand__mark">MX</span>
          <span className="brand__text">
            {t('common.appName')}
            <small>{t('common.museumName')}</small>
          </span>
        </Link>

        <div className="login__head">
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t('admin.login.title')}</h1>
          <p>{t('admin.login.lead')}</p>
        </div>

        <form className="login__form" onSubmit={submit}>
          <label className="field">
            <span>{t('admin.login.email')}</span>
            <input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>

          <label className="field">
            <span>{t('admin.login.password')}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>

          <ErrorBox error={error} />

          <button type="submit" className="btn btn--accent btn--block" disabled={busy}>
            {busy ? t('common.loading') : t('admin.login.submit')}
          </button>

          <p className="login__hint">{t('admin.login.hint')}</p>
        </form>

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
