import { useTranslation } from 'react-i18next';

export default function Pagination({ page, pageSize, total, onPage }) {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="pagination">
      <span>
        {t('common.page')} {page} {t('common.of')} {pages} · {total}
      </span>
      <div className="pagination__buttons">
        <button type="button" className="btn btn--small btn--ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {t('common.previous')}
        </button>
        <button type="button" className="btn btn--small btn--ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
