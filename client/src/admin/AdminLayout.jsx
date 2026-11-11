import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './auth/AuthContext';
import LanguageToggle from '../components/LanguageToggle';

const ADMIN_NAV = [
  { to: '/admin', key: 'nav.dashboard', end: true },
  { to: '/admin/bookings', key: 'nav.bookings' },
  { to: '/admin/payments', key: 'nav.payments' },
  { to: '/admin/exhibitions', key: 'nav.exhibitions' },
  { to: '/admin/shows', key: 'nav.shows' },
  { to: '/admin/slots', key: 'nav.slots' },
  { to: '/admin/pricing', key: 'nav.pricing' },
  { to: '/admin/validate', key: 'nav.validate' },
];

const GATE_NAV = [{ to: '/admin/validate', key: 'nav.validate' }];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isGate = session?.role === 'gate';

  if (isGate && location.pathname !== '/admin/validate') {
    return <Navigate to="/admin/validate" replace />;
  }

  const items = isGate ? GATE_NAV : ADMIN_NAV;

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <span className="admin__mark">MX</span>
          <div>
            <strong>{t('common.appName')}</strong>
            <small>{t('admin.layout.staff')}</small>
          </div>
        </div>

        <nav className="admin__nav" aria-label={t('common.admin')}>
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="admin__foot">
          <LanguageToggle compact />
          <div className="admin__user">
            <span className="admin__avatar">{(session?.name || 'M').slice(0, 1)}</span>
            <div>
              <strong>{session?.name}</strong>
              <small>{t(isGate ? 'admin.login.roleGate' : 'admin.login.roleAdmin')}</small>
            </div>
          </div>
          <button type="button" className="btn btn--small btn--ghost" onClick={signOut}>
            {t('common.signOut')}
          </button>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
