import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../../user/UserAuthContext';

export default function VisitorControl({ value, onSubmit }) {
  const { t } = useTranslation();
  const { userSession } = useUserAuth();
  const currentUser = userSession?.user;

  const [form, setForm] = useState({
    name: value?.name || currentUser?.name || '',
    email: value?.email || currentUser?.email || '',
    phone: value?.phone || currentUser?.phone || '',
  });
  const [error, setError] = useState('');

  if (!userSession) {
    return (
      <div className="control control--visitor" style={{ textAlign: 'center', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{t('chat.authRequiredTitle')}</h4>
        <p style={{ margin: '0 0 1.25rem', opacity: 0.75, fontSize: '0.9rem' }}>
          {t('chat.authRequiredMessage')}
        </p>
        <Link
          to="/login"
          state={{ from: '/chat' }}
          className="btn btn--accent btn--block"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          {t('chat.authRequiredAction')}
        </Link>
      </div>
    );
  }

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError(t('chat.invalidVisitor'));
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t('chat.invalidVisitor'));
      return;
    }
    if (!form.email.trim() && form.phone.replace(/\D/g, '').length < 10) {
      setError(t('chat.invalidVisitor'));
      return;
    }
    setError('');
    onSubmit({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }, form.name.trim());
  };

  return (
    <form className="control control--visitor" onSubmit={submit} noValidate>
      <div className="control__head">
        <h4>{t('chat.visitorTitle')}</h4>
        <p>{t('chat.visitorHint')}</p>
      </div>

      <label className="field">
        <span>{t('chat.visitorName')}</span>
        <input value={form.name} onChange={change('name')} autoComplete="name" required />
      </label>
      <div className="control__grid">
        <label className="field">
          <span>{t('chat.visitorEmail')}</span>
          <input type="email" value={form.email} onChange={change('email')} autoComplete="email" />
        </label>
        <label className="field">
          <span>{t('chat.visitorPhone')}</span>
          <input type="tel" value={form.phone} onChange={change('phone')} autoComplete="tel" />
        </label>
      </div>

      {error ? <p className="field__error">{error}</p> : null}

      <button type="submit" className="btn btn--accent control__submit">
        {t('chat.submit')}
      </button>
    </form>
  );
}
