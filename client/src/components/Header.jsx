import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import { useUserAuth } from '../user/UserAuthContext';

export default function Header() {
  const { t } = useTranslation();
  const { userSession, logout } = useUserAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label={t('common.appName')}>
        <span className="brand__mark" aria-hidden="true">
          MX
        </span>
        <span className="brand__text">
          {t('common.appName')}
          <small>{t('common.museumCity')}</small>
        </span>
      </Link>

      <nav className="site-nav" aria-label={t('common.home')}>
        <NavLink to="/" end>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/chat">{t('nav.book')}</NavLink>
        <NavLink to="/lookup">{t('nav.lookup')}</NavLink>
        {userSession && (
          <NavLink to="/my-bookings">{t('user.myBookings')}</NavLink>
        )}
        <NavLink to="/admin">{t('nav.admin')}</NavLink>
      </nav>

      <div className="site-header__aside">
        <LanguageToggle compact />
        {userSession ? (
          <>
            <span style={{ fontSize: '0.8rem', opacity: 0.7, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userSession.user?.name}
            </span>
            <button className="btn btn--small" onClick={logout}>
              {t('common.signOut')}
            </button>
          </>
        ) : (
          <Link className="btn btn--small" to="/login">
            {t('user.loginCta')}
          </Link>
        )}
        <Link className="btn btn--small btn--accent" to="/chat">
          {t('home.cta')}
        </Link>
      </div>
    </header>
  );
}
