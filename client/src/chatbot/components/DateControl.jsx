import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays, formatDate, todayISO } from '../../lib/format';

export default function DateControl({ value, onSubmit }) {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState(value || todayISO());
  const today = todayISO();

  const submit = (next) => {
    setDate(next);
    onSubmit(next, formatDate(next, i18n.language));
  };

  return (
    <div className="control control--date">
      <div className="control__head">
        <h4>{t('chat.dateTitle')}</h4>
        <p>{t('chat.dateHint')}</p>
      </div>

      <div className="date-quick">
        <button type="button" className="chip" onClick={() => submit(today)}>
          {t('chat.today')}
        </button>
        <button type="button" className="chip" onClick={() => submit(addDays(today, 1))}>
          {t('chat.tomorrow')}
        </button>
      </div>

      <div className="control__row">
        <label className="field">
          <span>{t('chat.dateTitle')}</span>
          <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button type="button" className="btn btn--accent" onClick={() => submit(date)}>
          {t('chat.submit')}
        </button>
      </div>
    </div>
  );
}
