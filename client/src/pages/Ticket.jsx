import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import TicketCard from '../components/TicketCard';
import Loader from '../components/Loader';
import ErrorBox from '../components/ErrorBox';

export default function Ticket() {
  const { bookingId } = useParams();
  const { t } = useTranslation();
  const { data, loading, error, reload } = useApiData(() => api.getBooking(bookingId), [bookingId]);

  const print = () => {
    if (window.museum?.printTicket) window.museum.printTicket();
    else window.print();
  };

  return (
    <div className="ticket-page">
      <header className="page-head">
        <p className="eyebrow">{bookingId}</p>
        <h1>{t('ui.ticket.title')}</h1>
        <p className="page-head__lead">{t('ui.ticket.contactNote')}</p>
      </header>

      {loading ? <Loader label={t('common.loading')} /> : null}

      {error ? (
        <div className="ticket-page__error">
          <ErrorBox error={error} onRetry={reload} />
          <Link className="btn btn--ghost" to="/lookup">
            {t('ui.ticket.lookup')}
          </Link>
        </div>
      ) : null}

      {data ? (
        <>
          {data.status === 'CANCELLED' ? <p className="notice notice--warn">{t('ui.ticket.cancelled')}</p> : null}
          {data.status === 'PENDING_PAYMENT' ? <p className="notice">{t('ui.ticket.notConfirmed')}</p> : null}
          <div className="ticket-page__card">
            <TicketCard booking={data} onPrint={print} />
          </div>
          <div className="ticket-page__actions">
            <Link className="btn btn--accent" to="/chat">
              {t('ui.ticket.bookAnother')}
            </Link>
            <Link className="btn btn--ghost" to="/lookup">
              {t('ui.ticket.lookup')}
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
