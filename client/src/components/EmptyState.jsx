import { useTranslation } from 'react-i18next';

export default function EmptyState({ title, children }) {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <span className="empty-state__glyph" aria-hidden="true">
        ✦
      </span>
      <p>{title || t('common.noResults')}</p>
      {children}
    </div>
  );
}
