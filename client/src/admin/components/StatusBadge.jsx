import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  if (!status) return null;
  return <span className={`badge badge--${String(status).toLowerCase()}`}>{t(`admin.status.${status}`)}</span>;
}
