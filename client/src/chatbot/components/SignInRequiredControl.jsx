import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SignInRequiredControl() {
  const { t } = useTranslation();

  return (
    <div className="control control--visitor" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎟️</div>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700 }}>
        {t('chat.authRequiredTitle')}
      </h4>
      <p style={{ margin: '0 0 1.25rem', opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.5 }}>
        {t('chat.authRequiredMessage')}
      </p>
      <Link
        to="/login"
        state={{ from: '/chat' }}
        className="btn btn--accent btn--block"
        style={{
          display: 'block',
          textAlign: 'center',
          textDecoration: 'none',
          padding: '0.75rem 1rem',
          fontWeight: 600,
        }}
      >
        {t('chat.authRequiredAction')}
      </Link>
    </div>
  );
}

