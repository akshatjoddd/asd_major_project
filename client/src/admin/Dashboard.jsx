import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import { formatMoney } from '../lib/format';
import Loader from '../components/Loader';
import ErrorBox from '../components/ErrorBox';
import EmptyState from '../components/EmptyState';
import { DailyChart, HoursChart } from './charts/DashboardCharts';

function Stat({ label, value, accent = false }) {
  return (
    <article className={`stat ${accent ? 'stat--accent' : ''}`}>
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
    </article>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState(7);
  const { data, loading, error, reload } = useApiData(() => api.getAnalytics({ days }), [days]);

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t('admin.dashboard.title')}</h1>
          <p>{t('admin.dashboard.lead', { days })}</p>
        </div>
        <div className="segmented" role="group" aria-label={t('admin.dashboard.title')}>
          <button type="button" className={days === 7 ? 'is-active' : ''} onClick={() => setDays(7)}>
            {t('admin.dashboard.range7')}
          </button>
          <button type="button" className={days === 30 ? 'is-active' : ''} onClick={() => setDays(30)}>
            {t('admin.dashboard.range30')}
          </button>
        </div>
      </header>

      {loading ? <Loader label={t('common.loading')} /> : null}
      {error ? <ErrorBox error={error} onRetry={reload} /> : null}

      {data ? (
        <>
          <section className="stats">
            <Stat label={t('admin.dashboard.bookings')} value={data.summary.bookings} accent />
            <Stat label={t('admin.dashboard.visitors')} value={data.summary.visitors} />
            <Stat label={t('admin.dashboard.revenue')} value={formatMoney(data.summary.revenue, i18n.language)} />
            <Stat label={t('admin.dashboard.today')} value={data.summary.today} />
          </section>

          <section className="charts">
            <article className="card chart-card">
              <h2>{t('admin.dashboard.daily')}</h2>
              <DailyChart data={data.bookingsByDay} />
            </article>
            <article className="card chart-card">
              <h2>{t('admin.dashboard.hours')}</h2>
              <HoursChart data={data.peakHours} />
            </article>
          </section>

          <section className="card">
            <h2>{t('admin.dashboard.popular')}</h2>
            {!data.popular?.length ? (
              <EmptyState title={t('admin.dashboard.empty')} />
            ) : (
              <ul className="popular">
                {data.popular.map((row) => (
                  <li key={`${row.type}:${row.name}`}>
                    <span className={`tag tag--${row.type}`}>{t(`admin.targets.${row.type}`)}</span>
                    <span className="popular__name">
                      {i18n.language === 'hi' ? row.nameHi || row.name : row.name}
                    </span>
                    <span className="popular__value">
                      {row.visitors} <small>{t('admin.dashboard.visitors')}</small>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
