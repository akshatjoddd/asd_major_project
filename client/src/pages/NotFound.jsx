import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>{t('ui.notFound.title')}</h1>
      <p>{t('ui.notFound.body')}</p>
      <Link className="btn btn--accent" to="/">
        {t('ui.notFound.home')}
      </Link>
    </div>
  );
}
