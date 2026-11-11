import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import ErrorBox from '../components/ErrorBox';

export default function Lookup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ bookingCode: '', contact: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.bookingCode.trim() || !form.contact.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const booking = await api.lookupTicket({
        bookingCode: form.bookingCode.trim(),
        contact: form.contact.trim(),
      });
      navigate(`/ticket/${booking.bookingCode}`);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lookup">
      <div className="lookup__intro">
        <p className="eyebrow">{t('nav.lookup')}</p>
        <h1>{t('ui.lookup.title')}</h1>
        <p>{t('ui.lookup.lead')}</p>
        <p className="lookup__hint">{t('ui.lookup.hint')}</p>
      </div>

      <form className="card lookup__form" onSubmit={submit}>
        <label className="field">
          <span>{t('ui.lookup.code')}</span>
          <input
            value={form.bookingCode}
            onChange={(event) => setForm({ ...form, bookingCode: event.target.value.toUpperCase() })}
            placeholder="MX7K2P9QD"
            autoComplete="off"
            required
          />
        </label>

        <label className="field">
          <span>{t('ui.lookup.contact')}</span>
          <input
            value={form.contact}
            onChange={(event) => setForm({ ...form, contact: event.target.value })}
            autoComplete="email"
            required
          />
        </label>

        <ErrorBox error={error} />

        <button type="submit" className="btn btn--accent btn--block" disabled={busy}>
          {busy ? t('common.loading') : t('ui.lookup.submit')}
        </button>
      </form>
    </div>
  );
}
