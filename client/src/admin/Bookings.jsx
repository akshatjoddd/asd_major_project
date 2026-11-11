import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import { formatDate, formatDateTime, formatMoney } from '../lib/format';
import Loader from '../components/Loader';
import ErrorBox from '../components/ErrorBox';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from './components/StatusBadge';
import Pagination from './components/Pagination';

const PAGE_SIZE = 10;
const STATUSES = ['CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED'];

function BookingDetail({ booking }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, loading } = useApiData(
    () => api.getAdminPayments({ search: booking.bookingCode, pageSize: 10 }),
    [booking.bookingCode],
  );

  return (
    <div className="detail">
      <dl className="detail__grid">
        <div>
          <dt>{t('admin.bookings.code')}</dt>
          <dd className="mono">{booking.bookingCode}</dd>
        </div>
        <div>
          <dt>{t('admin.bookings.visitor')}</dt>
          <dd>{booking.visitor.name}</dd>
        </div>
        <div>
          <dt>{t('admin.bookings.contact')}</dt>
          <dd>
            {booking.visitor.email}
            {booking.visitor.phone ? <span className="detail__muted"> · {booking.visitor.phone}</span> : null}
          </dd>
        </div>
        <div>
          <dt>{t('admin.bookings.visit')}</dt>
          <dd>
            {formatDate(booking.date, lang)} · {booking.slotLabel}
          </dd>
        </div>
        <div>
          <dt>{t('admin.bookings.bookedAt')}</dt>
          <dd>{formatDateTime(booking.createdAt)}</dd>
        </div>
        <div>
          <dt>{t('admin.bookings.status')}</dt>
          <dd>
            <StatusBadge status={booking.status} />
          </dd>
        </div>
      </dl>

      <h3 className="detail__subtitle">{t('admin.bookings.items')}</h3>
      <ul className="detail__items">
        {booking.items.map((item) => (
          <li key={item.ticketTypeId}>
            <span>
              {lang === 'hi' ? item.nameHi || item.name : item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.unitPrice * item.quantity, lang)}</span>
          </li>
        ))}
        <li className="detail__total">
          <span>{t('common.total')}</span>
          <strong>{formatMoney(booking.amount, lang)}</strong>
        </li>
      </ul>

      <h3 className="detail__subtitle">{t('admin.bookings.payment')}</h3>
      {loading ? <Loader inline label={t('common.loading')} /> : null}
      {!loading && (!data?.rows?.length ? <p className="detail__muted">{t('admin.bookings.noPayments')}</p> : (
        <ul className="detail__payments">
          {data.rows.map((payment) => (
            <li key={payment.id}>
              <span className="mono">{payment.providerReference}</span>
              <StatusBadge status={payment.status} />
              <span>{formatMoney(payment.amount, lang)}</span>
              <span className="detail__muted">{formatDateTime(payment.createdAt)}</span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default function Bookings() {
  const { t, i18n } = useTranslation();
  const [term, setTerm] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', target: '', date: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setFilters((current) => ({ ...current, search: term }));
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  const { data, loading, error, reload } = useApiData(
    () => api.getAdminBookings({ ...filters, page, pageSize: PAGE_SIZE }),
    [filters.search, filters.status, filters.target, filters.date, page],
  );

  const update = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }));
    setPage(1);
  };

  const clear = () => {
    setTerm('');
    setFilters({ search: '', status: '', target: '', date: '' });
    setPage(1);
  };

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t('admin.bookings.title')}</h1>
          <p>{t('admin.bookings.lead')}</p>
        </div>
        <span className="admin-head__count">{data ? data.total : '—'}</span>
      </header>

      <div className="filters">
        <input
          className="filters__search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t('admin.bookings.searchPlaceholder')}
          aria-label={t('common.search')}
        />
        <select value={filters.status} onChange={update('status')} aria-label={t('common.status')}>
          <option value="">{t('common.all')}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(`admin.status.${status}`)}
            </option>
          ))}
        </select>
        <select value={filters.target} onChange={update('target')} aria-label={t('admin.bookings.target')}>
          <option value="">{t('common.all')}</option>
          {['entry', 'exhibition', 'show'].map((target) => (
            <option key={target} value={target}>
              {t(`admin.targets.${target}`)}
            </option>
          ))}
        </select>
        <input type="date" value={filters.date} onChange={update('date')} aria-label={t('common.date')} />
        <button type="button" className="btn btn--small btn--ghost" onClick={clear}>
          {t('common.clear')}
        </button>
      </div>

      {loading ? <Loader label={t('common.loading')} /> : null}
      {error ? <ErrorBox error={error} onRetry={reload} /> : null}

      {!loading && !error ? (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('admin.bookings.code')}</th>
                  <th>{t('admin.bookings.visitor')}</th>
                  <th>{t('admin.bookings.visit')}</th>
                  <th>{t('admin.bookings.target')}</th>
                  <th>{t('admin.bookings.items')}</th>
                  <th>{t('admin.bookings.amount')}</th>
                  <th>{t('common.status')}</th>
                  <th aria-label={t('common.actions')} />
                </tr>
              </thead>
              <tbody>
                {(data?.rows || []).map((booking) => (
                  <tr key={booking.id}>
                    <td className="mono">{booking.bookingCode}</td>
                    <td>
                      <strong>{booking.visitor.name}</strong>
                      <span className="cell-sub">{booking.visitor.email || booking.visitor.phone}</span>
                    </td>
                    <td>
                      {formatDate(booking.date, i18n.language)}
                      <span className="cell-sub">{booking.slotLabel}</span>
                    </td>
                    <td>
                      <span className={`tag tag--${booking.target}`}>{t(`admin.targets.${booking.target}`)}</span>
                    </td>
                    <td>{booking.visitors}</td>
                    <td>{formatMoney(booking.amount, i18n.language)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="table__actions">
                      <button type="button" className="btn btn--small btn--ghost" onClick={() => setSelected(booking)}>
                        {t('common.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.rows.length === 0 ? <EmptyState title={t('admin.table.empty')} /> : null}
          </div>

          {data && data.total > 0 ? (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />
          ) : null}
        </>
      ) : null}

      <Modal open={Boolean(selected)} title={t('admin.bookings.detail')} onClose={() => setSelected(null)} wide>
        {selected ? <BookingDetail booking={selected} /> : null}
      </Modal>
    </div>
  );
}
