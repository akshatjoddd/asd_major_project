import api from '../api';
import ResourcePage from './ResourcePage';
import StatusBadge from './components/StatusBadge';

const config = {
  titleKey: 'admin.exhibitions.title',
  leadKey: 'admin.exhibitions.lead',
  addKey: 'admin.exhibitions.add',
  api: {
    list: api.getAdminExhibitions,
    create: api.createExhibition,
    update: api.updateExhibition,
    remove: api.deleteExhibition,
  },
  blank: { name: '', nameHi: '', description: '', descriptionHi: '', isActive: true },
  fields: [
    { key: 'name', labelKey: 'admin.exhibitions.name', required: true },
    { key: 'nameHi', labelKey: 'admin.exhibitions.nameHi' },
    { key: 'description', labelKey: 'admin.exhibitions.description', type: 'textarea' },
    { key: 'descriptionHi', labelKey: 'admin.exhibitions.descriptionHi', type: 'textarea' },
    { key: 'isActive', labelKey: 'admin.status.ACTIVE', type: 'checkbox' },
  ],
  columns: [
    {
      key: 'name',
      labelKey: 'admin.exhibitions.name',
      render: (row, lang) => (lang === 'hi' ? row.nameHi || row.name : row.name),
    },
    {
      key: 'description',
      labelKey: 'admin.exhibitions.description',
      render: (row, lang) => (
        <span className="cell-sub">{lang === 'hi' ? row.descriptionHi || row.description : row.description}</span>
      ),
    },
    {
      key: 'isActive',
      labelKey: 'common.status',
      render: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ],
};

export default function Exhibitions() {
  return <ResourcePage config={config} />;
}
