import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { USE_MOCK } from '../api';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div>
        <span className="site-footer__mark">MX</span>
        <p>{t('ui.footer.note')}</p>
      </div>
      <div className="site-footer__meta">
        <span className={`badge badge--mode`}>{USE_MOCK ? t('ui.footer.mock') : t('ui.footer.live')}</span>
        <Link to="/admin">{t('nav.admin')}</Link>
        <Link to="/lookup">{t('nav.lookup')}</Link>
      </div>
      <p className="site-footer__copy">© {new Date().getFullYear()} MuseumX</p>
    </footer>
  );
}
