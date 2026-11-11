import { useTranslation } from 'react-i18next';
import api from '../../api';
import { useApiData } from '../../hooks/useApiData';
import { formatDate, formatMoney } from '../../lib/format';
import Loader from '../../components/Loader';

export default function SummaryCard({ booking }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data: types, loading } = useApiData(() => api.getTicketTypes(), []);

  const rows = (types || [])
    .map((type) => ({ type, quantity: booking.counts?.[type.id] || 0 }))
    .filter((row) => row.quantity > 0);
  const amount = rows.reduce((sum, row) => sum + row.quantity * row.type.price, 0);
  const totalTickets = rows.reduce((sum, row) => sum + row.quantity, 0);
  const visitLabel = t(`chat.target.${booking.target || 'entry'}`);
  const refName = lang === 'hi' ? booking.refNameHi || booking.refName : booking.refName;

  return (
    <div className="control control--summary">
      <div className="control__head">
        <h4>{t('chat.summaryTitle')}</h4>
      </div>

      <dl className="summary">
        <div>
          <dt>{t('chat.summaryTarget')}</dt>
          <dd>
            {visitLabel}
            {refName ? ` · ${refName}` : ''}
          </dd>
        </div>
        <div>
          <dt>{t('chat.summaryDate')}</dt>
          <dd>{formatDate(booking.date, lang)}</dd>
        </div>
        <div>
          <dt>{t('chat.summarySlot')}</dt>
          <dd>{booking.slotLabel}</dd>
        </div>
        <div>
          <dt>{t('chat.summaryTickets')}</dt>
          <dd>{totalTickets}</dd>
        </div>
      </dl>

      {loading ? <Loader inline label={t('common.loading')} /> : null}

      <ul className="summary__items">
        {rows.map((row) => (
          <li key={row.type.id}>
            <span>
              {lang === 'hi' ? row.type.nameHi || row.type.name : row.type.name} × {row.quantity}
            </span>
            <span>{formatMoney(row.type.price * row.quantity, lang)}</span>
          </li>
        ))}
      </ul>

      <div className="control__foot">
        <span className="control__total">
          {t('chat.summaryTotal')} <strong>{formatMoney(amount, lang)}</strong>
        </span>
      </div>
      <p className="control__hint">{t('chat.summaryHint')}</p>
    </div>
  );
}
