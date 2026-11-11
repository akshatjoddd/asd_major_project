import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney } from '../lib/format';

export default function TicketCard({ booking, showLink = false, onPrint = null }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  if (!booking) return null;

  const qrValue = booking.qrToken || `MUSEUMX:${booking.bookingCode}`;
  const status = booking.status || 'CONFIRMED';
  const cancelled = status === 'CANCELLED';

  return (
    <article className={`ticket ${cancelled ? 'ticket--cancelled' : ''}`}>
      <div className="ticket__main">
        <div className="ticket__head">
          <span className="ticket__eyebrow">{t('common.museumName')}</span>
          <span className={`badge badge--${status.toLowerCase()}`}>{t(`admin.status.${status}`)}</span>
        </div>

        <h3 className="ticket__title">
          {t('chat.target.' + (booking.target || 'entry'))}
          {booking.refName ? <span className="ticket__sub"> · {lang === 'hi' ? booking.refNameHi || booking.refName : booking.refName}</span> : null}
        </h3>

        <dl className="ticket__grid">
          <div>
            <dt>{t('ui.ticket.code')}</dt>
            <dd className="mono">{booking.bookingCode}</dd>
          </div>
          <div>
            <dt>{t('ui.ticket.visitor')}</dt>
            <dd>{booking.visitor?.name}</dd>
          </div>
          <div>
            <dt>{t('ui.ticket.date')}</dt>
            <dd>{formatDate(booking.date, lang)}</dd>
          </div>
          <div>
            <dt>{t('ui.ticket.slot')}</dt>
            <dd>{booking.slotLabel}</dd>
          </div>
        </dl>

        <ul className="ticket__items">
          {(booking.items || []).map((item) => (
            <li key={item.ticketTypeId}>
              <span>
                {lang === 'hi' ? item.nameHi || item.name : item.name} × {item.quantity}
              </span>
              <span>{formatMoney(item.unitPrice * item.quantity, lang)}</span>
            </li>
          ))}
        </ul>

        <div className="ticket__foot">
          <span className="ticket__totalLabel">{t('ui.ticket.amount')}</span>
          <strong className="ticket__total">{formatMoney(booking.amount, lang)}</strong>
        </div>

        {showLink || onPrint ? (
          <div className="ticket__actions">
            {showLink ? (
              <Link className="btn btn--small btn--ink" to={`/ticket/${booking.bookingCode}`}>
                {t('chat.viewTicket')}
              </Link>
            ) : null}
            {onPrint ? (
              <button type="button" className="btn btn--small btn--ghost" onClick={onPrint}>
                {t('common.print')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="ticket__stub">
        <div className="ticket__qr">
          <QRCodeSVG value={qrValue} size={132} level="M" bgColor="#ffffff" fgColor="#101215" title={t('ui.ticket.qrAlt')} />
        </div>
        <p className="ticket__qrHint">{t('ui.ticket.lead')}</p>
        <span className="ticket__stubCode mono">{booking.bookingCode}</span>
        <span className="ticket__perf" aria-hidden="true" />
      </div>
    </article>
  );
}
