import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import ResourcePage from './ResourcePage';
import StatusBadge from './components/StatusBadge';

export default function Slots() {
  const { t, i18n } = useTranslation();
  const { data: shows } = useApiData(() => api.getAdminShows(), []);

  const showOptions = (shows || []).map((show) => ({
    value: String(show.id),
    label: i18n.language === 'hi' ? show.nameHi || show.name : show.name,
  }));

  const config = {
    titleKey: 'admin.slots.title',
    leadKey: 'admin.slots.lead',
    addKey: 'admin.slots.add',
    api: {
      list: api.getAdminSlotTemplates,
      create: api.createSlotTemplate,
      update: api.updateSlotTemplate,
      remove: api.deleteSlotTemplate,
    },
    blank: { type: 'entry', refId: '', startTime: '10:00', endTime: '11:00', capacity: 100, isActive: true },
    fields: [
      {
        key: 'type',
        labelKey: 'admin.slots.type',
        type: 'select',
        required: true,
        options: ['entry', 'exhibition', 'show'].map((value) => ({
          value,
          labelKey: `admin.targets.${value}`,
        })),
      },
      {
        key: 'refId',
        labelKey: 'admin.slots.item',
        type: 'select',
        hintKey: 'admin.slots.itemHint',
        visibleWhen: (values) => values.type === 'show',
        options: [{ value: '', label: '—' }, ...showOptions],
      },
      { key: 'startTime', labelKey: 'admin.slots.start', type: 'time', required: true },
      { key: 'endTime', labelKey: 'admin.slots.end', type: 'time', required: true },
      { key: 'capacity', labelKey: 'admin.slots.capacity', type: 'number', min: 1, required: true },
      { key: 'isActive', labelKey: 'admin.slots.active', type: 'checkbox' },
    ],
    toPayload: (values) => ({
      ...values,
      capacity: Number(values.capacity),
      refId: values.type === 'show' && values.refId !== '' ? Number(values.refId) : null,
    }),
    columns: [
      {
        key: 'type',
        labelKey: 'admin.slots.type',
        render: (row) => <span className={`tag tag--${row.type}`}>{t(`admin.targets.${row.type}`)}</span>,
      },
      {
        key: 'refId',
        labelKey: 'admin.slots.item',
        render: (row) => {
          if (row.type !== 'show' || !row.refId) return <span className="cell-sub">—</span>;
          const show = (shows || []).find((entry) => entry.id === row.refId);
          if (!show) return <span className="cell-sub">—</span>;
          return i18n.language === 'hi' ? show.nameHi || show.name : show.name;
        },
      },
      { key: 'startTime', labelKey: 'admin.slots.start' },
      { key: 'endTime', labelKey: 'admin.slots.end' },
      { key: 'capacity', labelKey: 'admin.slots.capacity' },
      {
        key: 'isActive',
        labelKey: 'common.status',
        render: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
      },
    ],
  };

  return <ResourcePage config={config} />;
}
