import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CancelControl({ onSubmit }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ bookingCode: '', contact: '' });
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!form.bookingCode.trim() || !form.contact.trim()) {
      setError(t('errors.INVALID_INPUT'));
      return;
    }
    setError('');
    onSubmit({ bookingCode: form.bookingCode.trim(), contact: form.contact.trim() });
  };

  return (
    <form className="control control--cancel" onSubmit={submit} noValidate>
      <div className="control__head">
        <h4>{t('chat.cancelTitle')}</h4>
        <p>{t('chat.cancelAsk')}</p>
      </div>

      <div className="control__grid">
        <label className="field">
          <span>{t('chat.cancelCode')}</span>
          <input
            value={form.bookingCode}
            onChange={(event) => setForm({ ...form, bookingCode: event.target.value.toUpperCase() })}
            placeholder="MX7K2P9QD"
            autoComplete="off"
          />
        </label>
        <label className="field">
          <span>{t('chat.cancelContact')}</span>
          <input
            value={form.contact}
            onChange={(event) => setForm({ ...form, contact: event.target.value })}
            autoComplete="email"
          />
        </label>
      </div>

      {error ? <p className="field__error">{error}</p> : null}

      <button type="submit" className="btn btn--ink control__submit">
        {t('chat.cancelSubmit')}
      </button>
    </form>
  );
}
