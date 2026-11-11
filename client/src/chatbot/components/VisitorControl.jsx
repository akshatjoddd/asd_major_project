import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function VisitorControl({ value, onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', ...(value || {}) });
  const [error, setError] = useState('');

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
