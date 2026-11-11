import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { useApiData } from '../../hooks/useApiData';
import { formatMoney } from '../../lib/format';
import Loader from '../../components/Loader';
import ErrorBox from '../../components/ErrorBox';

export default function CountsControl({ value, onSubmit }) {
  const { t, i18n } = useTranslation();
  const { data: types, loading, error, reload } = useApiData(() => api.getTicketTypes(), []);
  const [counts, setCounts] = useState(value || {});

  if (loading) return <Loader inline label={t('common.loading')} />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const update = (id, delta) => {
    setCounts((current) => {
      const next = Math.max(0, Math.min(20, (current[id] || 0) + delta));
      return { ...current, [id]: next };
    });
  };

  const total = Object.values(counts).reduce((sum, quantity) => sum + quantity, 0);
  const amount = (types || []).reduce((sum, type) => sum + (counts[type.id] || 0) * type.price, 0);

  return (
    <div className="control control--counts">
      <div className="control__head">
        <h4>{t('chat.countsTitle')}</h4>
        <p>{t('chat.countsHint')}</p>
      </div>

      <ul className="counts">
        {(types || []).map((type) => (
          <li key={type.id}>
            <div className="counts__label">
              <strong>{i18n.language === 'hi' ? type.nameHi || type.name : type.name}</strong>
              <span>{formatMoney(type.price, i18n.language)}</span>
            </div>
            <div className="stepper">
              <button type="button" onClick={() => update(type.id, -1)} aria-label={`– ${type.name}`}>
                −
              </button>
              <span aria-live="polite">{counts[type.id] || 0}</span>
              <button type="button" onClick={() => update(type.id, 1)} aria-label={`+ ${type.name}`}>
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="control__foot">
        <span className="control__total">
          {t('common.total')} <strong>{formatMoney(amount, i18n.language)}</strong>
        </span>
        <button
          type="button"
          className="btn btn--accent"
          disabled={total === 0}
          onClick={() => {
            const clean = Object.fromEntries(Object.entries(counts).filter(([, quantity]) => quantity > 0));
            onSubmit(clean, String(total));
          }}
        >
          {t('chat.submit')}
        </button>
      </div>
    </div>
  );
}
