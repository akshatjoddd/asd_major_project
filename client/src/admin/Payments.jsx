import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import { formatDateTime, formatMoney } from '../lib/format';
import Loader from '../components/Loader';
import ErrorBox from '../components/ErrorBox';
import EmptyState from '../components/EmptyState';
import StatusBadge from './components/StatusBadge';
import Pagination from './components/Pagination';

const PAGE_SIZE = 12;
const STATUSES = ['PAID', 'FAILED', 'REFUNDED'];

export default function Payments() {
  const { t, i18n } = useTranslation();
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(term);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  const { data, loading, error, reload } = useApiData(
    () => api.getAdminPayments({ search, status, page, pageSize: PAGE_SIZE }),
    [search, status, page],
  );

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t('admin.payments.title')}</h1>
          <p>{t('admin.payments.lead')}</p>
        </div>
      </header>

      <div className="filters">
        <input
          className="filters__search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t('admin.payments.searchPlaceholder')}
          aria-label={t('common.search')}
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label={t('common.status')}
        >
          <option value="">{t('common.all')}</option>
          {STATUSES.map((row) => (
            <option key={row} value={row}>
              {t(`admin.status.${row}`)}
            </option>
          ))}
        </select>
      </div>

      {loading ? <Loader label={t('common.loading')} /> : null}
      {error ? <ErrorBox error={error} onRetry={reload} /> : null}

      {!loading && !error ? (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('admin.payments.order')}</th>
                  <th>{t('admin.bookings.code')}</th>
                  <th>{t('admin.bookings.amount')}</th>
                  <th>{t('admin.payments.method')}</th>
                  <th>{t('admin.payments.reference')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('admin.payments.created')}</th>
                </tr>
              </thead>
              <tbody>
                {(data?.rows || []).map((payment) => (
                  <tr key={payment.id}>
                    <td className="mono">#{payment.id}</td>
                    <td className="mono">{payment.bookingCode}</td>
                    <td>{formatMoney(payment.amount, i18n.language)}</td>
                    <td>{payment.provider}</td>
                    <td className="mono cell-sub">{payment.providerReference}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td>{formatDateTime(payment.createdAt)}</td>
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
    </div>
  );
}
