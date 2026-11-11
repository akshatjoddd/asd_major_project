import { useTranslation } from 'react-i18next';
import api from '../api';
import { formatMoney } from '../lib/format';
import ResourcePage from './ResourcePage';
import StatusBadge from './components/StatusBadge';

const config = {
  titleKey: 'admin.pricing.title',
  leadKey: 'admin.pricing.lead',
  addKey: 'admin.pricing.add',
  api: {
    list: api.getAdminTicketTypes,
    create: api.createTicketType,
    update: api.updateTicketType,
    remove: api.deleteTicketType,
  },
  blank: { name: '', nameHi: '', price: 5000, description: '', descriptionHi: '', isActive: true },
  fields: [
    { key: 'name', labelKey: 'common.name', required: true },
    { key: 'nameHi', labelKey: 'admin.exhibitions.nameHi' },
    { key: 'price', labelKey: 'admin.pricing.price', type: 'price', required: true },
    { key: 'description', labelKey: 'admin.pricing.description', type: 'textarea' },
    { key: 'descriptionHi', labelKey: 'admin.pricing.descriptionHi', type: 'textarea' },
    { key: 'isActive', labelKey: 'admin.status.ACTIVE', type: 'checkbox' },
  ],
  columns: [
    {
      key: 'name',
      labelKey: 'common.name',
      render: (row, lang) => (lang === 'hi' ? row.nameHi || row.name : row.name),
    },
    { key: 'price', labelKey: 'admin.pricing.price', render: (row, lang) => formatMoney(row.price, lang) },
    {
      key: 'description',
      labelKey: 'admin.pricing.description',
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

export default function Pricing() {
  return <ResourcePage config={config} />;
}
