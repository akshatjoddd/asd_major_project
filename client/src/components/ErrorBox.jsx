import { useTranslation } from 'react-i18next';

export default function ErrorBox({ error, onRetry }) {
  const { t } = useTranslation();
  if (!error) return null;

  const key = error.code ? `errors.${error.code}` : null;
  const message = key ? t(key, { defaultValue: error.message || t('errors.generic') }) : error.message || t('errors.generic');

  return (
    <div className="error-box" role="alert">
      <span className="error-box__icon" aria-hidden="true">
        !
      </span>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--small btn--ghost" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  );
}
