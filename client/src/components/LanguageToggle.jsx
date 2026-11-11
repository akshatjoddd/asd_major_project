import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

const LABELS = { en: 'EN', hi: 'हिं' };

export default function LanguageToggle({ compact = false }) {
  const { i18n, t } = useTranslation();

  return (
    <div className={`lang ${compact ? 'lang--compact' : ''}`} role="group" aria-label={t('common.language')}>
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang__button ${i18n.language === code ? 'is-active' : ''}`}
          aria-pressed={i18n.language === code}
          title={t(`common.${code === 'en' ? 'english' : 'hindi'}`)}
          onClick={() => i18n.changeLanguage(code)}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
