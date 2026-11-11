import api from '../api';
import ResourcePage from './ResourcePage';
import StatusBadge from './components/StatusBadge';

const config = {
  titleKey: 'admin.shows.title',
  leadKey: 'admin.shows.lead',
  addKey: 'admin.shows.add',
  api: {
    list: api.getAdminShows,
    create: api.createShow,
    update: api.updateShow,
    remove: api.deleteShow,
  },
  blank: { name: '', nameHi: '', description: '', descriptionHi: '', venue: '', venueHi: '', isActive: true },
  fields: [
    { key: 'name', labelKey: 'admin.shows.name', required: true },
    { key: 'nameHi', labelKey: 'admin.shows.nameHi' },
    { key: 'venue', labelKey: 'admin.shows.venue', required: true },
    { key: 'venueHi', labelKey: 'admin.shows.venueHi' },
    { key: 'description', labelKey: 'admin.shows.description', type: 'textarea' },
    { key: 'descriptionHi', labelKey: 'admin.shows.descriptionHi', type: 'textarea' },
    { key: 'isActive', labelKey: 'admin.status.ACTIVE', type: 'checkbox' },
  ],
  columns: [
    {
      key: 'name',
      labelKey: 'admin.shows.name',
      render: (row, lang) => (lang === 'hi' ? row.nameHi || row.name : row.name),
    },
    {
      key: 'venue',
      labelKey: 'admin.shows.venue',
      render: (row, lang) => (lang === 'hi' ? row.venueHi || row.venue : row.venue),
    },
    {
      key: 'isActive',
      labelKey: 'common.status',
      render: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ],
};

export default function Shows() {
  return <ResourcePage config={config} />;
}
