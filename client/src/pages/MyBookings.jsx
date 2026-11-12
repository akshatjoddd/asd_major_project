import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserAuth } from '../user/UserAuthContext';
import * as api from '../api/endpoints';

function statusBadge(status) {
  const map = {
    CONFIRMED: 'badge--green',
    PENDING_PAYMENT: 'badge--yellow',
    CANCELLED: 'badge--red',
    PAID: 'badge--green',
    FAILED: 'badge--red',
    REFUNDED: 'badge--grey',
  };
  return map[status] || 'badge--grey';
}

export default function MyBookings() {
  const { t } = useTranslation();
  const { userSession, logout } = useUserAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userSession) {
      navigate('/login');
      return;
    }
    setLoading(true);
    api.getUserBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => setError(err.message || t('errors.generic')))
      .finally(() => setLoading(false));
  }, [userSession, navigate, t]);

  if (!userSession) return null;

  return (
    <div className="page-shell" style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {t('user.myBookings')}
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.875rem' }}>{userSession.user?.name} · {userSession.user?.email}</p>
        </div>
        <button className="btn btn--small" onClick={logout}>
          {t('common.signOut')}
        </button>
      </div>

      {loading && <p>{t('common.loading')}</p>}
      {error && <p style={{ color: 'var(--error, #dc2626)' }}>{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.6 }}>
          <p>{t('common.noResults')}</p>
          <Link className="btn btn--accent" to="/chat" style={{ marginTop: '1rem', display: 'inline-block' }}>
            {t('home.cta')}
          </Link>
        </div>
      )}

      {!loading && bookings.map((b) => (
        <div
          key={b.id}
          className="card"
          style={{
            border: '1px solid var(--surface-2, #e5e7eb)',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            background: 'var(--surface, #fff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
                {b.bookingCode}
              </span>
              <span
                className={`badge ${statusBadge(b.status)}`}
                style={{
                  marginLeft: '0.75rem',
                  padding: '0.15em 0.6em',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: b.status === 'CONFIRMED' || b.status === 'PAID' ? '#dcfce7' : b.status === 'CANCELLED' || b.status === 'FAILED' ? '#fee2e2' : '#fef9c3',
                  color: b.status === 'CONFIRMED' || b.status === 'PAID' ? '#16a34a' : b.status === 'CANCELLED' || b.status === 'FAILED' ? '#dc2626' : '#854d0e',
                }}
              >
                {t(`admin.status.${b.status}`, b.status)}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              {b.visitDate ? new Date(b.visitDate).toLocaleDateString() : '—'}
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {b.target && (
              <span>
                <strong>{t('admin.bookings.target') || 'Type'}:</strong>{' '}
                {t(`admin.targets.${b.target}`, b.target)}
              </span>
            )}
            {b.totalAmount != null && (
              <span>
                <strong>{t('common.total')}:</strong>{' '}
                ₹{(b.totalAmount / 100).toFixed(0)}
              </span>
            )}
            {b.slot?.startTime && (
              <span>
                <strong>Slot:</strong> {b.slot.startTime}–{b.slot.endTime}
              </span>
            )}
          </div>

          {b.items && b.items.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.65 }}>
              {b.items.map((item, i) => (
                <span key={i}>
                  {item.ticketType?.name || item.ticketTypeId} × {item.quantity}
                  {i < b.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: '0.75rem' }}>
            <Link
              to={`/ticket/${b.bookingCode}`}
              className="btn btn--small"
              style={{ fontSize: '0.8rem' }}
            >
              {t('common.view')} →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
