import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApiData } from '../hooks/useApiData';
import Loader from '../components/Loader';
import ErrorBox from '../components/ErrorBox';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

function errorText(error, t) {
  if (!error) return '';
  return error.code ? t(`errors.${error.code}`, { defaultValue: error.message }) : error.message;
}

export default function ResourcePage({ config }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, reload } = useApiData(() => config.api.list(), []);
  const [values, setValues] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(id);
  }, [notice]);

  const openCreate = () => {
    setValues({ ...config.blank });
    setEditing({});
    setFormError('');
  };

  const openEdit = (row) => {
    setValues({ ...config.blank, ...row });
    setEditing(row);
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const missing = config.fields.some(
      (field) =>
        (!field.visibleWhen || field.visibleWhen(values)) &&
        field.required &&
        field.type !== 'checkbox' &&
        String(values[field.key] ?? '').trim() === '',
    );
    if (missing) {
      setFormError(t('admin.form.required'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      let payload = { ...values };
      config.fields.forEach((field) => {
        if (field.type === 'number' || field.type === 'price') payload[field.key] = Number(payload[field.key] || 0);
      });
      if (config.toPayload) payload = config.toPayload(payload);

      if (editing?.id) await config.api.update(editing.id, payload);
      else await config.api.create(payload);

      setEditing(null);
      setNotice({ type: 'ok', text: t('admin.form.saved') });
      reload();
    } catch (requestError) {
      setFormError(errorText(requestError, t));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const name = config.nameOf ? config.nameOf(row, i18n.language) : row.name;
    if (!window.confirm(t('admin.form.deleteConfirm', { name }))) return;
    try {
      await config.api.remove(row.id);
      setNotice({ type: 'ok', text: t('admin.form.deleted') });
      reload();
    } catch (requestError) {
      setNotice({ type: 'error', text: errorText(requestError, t) });
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t(config.titleKey)}</h1>
          <p>{t(config.leadKey)}</p>
        </div>
        <button type="button" className="btn btn--accent" onClick={openCreate}>
          {t(config.addKey)}
        </button>
      </header>

      {notice ? <div className={`notice notice--${notice.type}`}>{notice.text}</div> : null}

      {loading ? <Loader label={t('common.loading')} /> : null}
      {error ? <ErrorBox error={error} onRetry={reload} /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key}>{t(column.labelKey)}</th>
                ))}
                <th aria-label={t('common.actions')} />
              </tr>
            </thead>
            <tbody>
              {(data || []).map((row) => (
                <tr key={row.id}>
                  {config.columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row, i18n.language) : row[column.key]}
                    </td>
                  ))}
                  <td className="table__actions">
                    <button type="button" className="btn btn--small btn--ghost" onClick={() => openEdit(row)}>
                      {t('common.edit')}
                    </button>
                    <button type="button" className="btn btn--small btn--danger" onClick={() => remove(row)}>
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && (!data.length || data.length === 0) ? <EmptyState title={t('admin.table.empty')} /> : null}
        </div>
      ) : null}

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `${t('common.edit')} · ${t(config.titleKey)}` : t(config.addKey)}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="submit" form="resource-form" className="btn btn--accent" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </>
        }
      >
        {editing ? (
          <form id="resource-form" className="resource-form" onSubmit={submit} noValidate>
            {config.fields.map((field) => {
              if (field.visibleWhen && !field.visibleWhen(values)) return null;
              const label = t(field.labelKey);
              const value = values[field.key];

              if (field.type === 'checkbox') {
                return (
                  <label key={field.key} className="check">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => setValues({ ...values, [field.key]: event.target.checked })}
                    />
                    <span>{label}</span>
                  </label>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <label key={field.key} className="field field--full">
                    <span>{label}</span>
                    <textarea
                      rows={3}
                      value={value ?? ''}
                      onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                    />
                  </label>
                );
              }

              if (field.type === 'select') {
                return (
                  <label key={field.key} className="field">
                    <span>{label}</span>
                    <select
                      value={value ?? ''}
                      onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                    >
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.labelKey ? t(option.labelKey) : option.label}
                        </option>
                      ))}
                    </select>
                    {field.hintKey ? <small>{t(field.hintKey)}</small> : null}
                  </label>
                );
              }

              const numeric = field.type === 'number' || field.type === 'price';
              return (
                <label key={field.key} className="field">
                  <span>{label}</span>
                  <input
                    type={numeric ? 'number' : field.type || 'text'}
                    min={numeric ? field.min ?? 0 : undefined}
                    step={field.type === 'price' ? 1 : field.step}
                    value={field.type === 'price' ? Number(value || 0) / 100 : value ?? ''}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        [field.key]:
                          field.type === 'price'
                            ? Math.round(Number(event.target.value || 0) * 100)
                            : event.target.value,
                      })
                    }
                  />
                </label>
              );
            })}

            {formError ? <p className="field__error">{formError}</p> : null}
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
