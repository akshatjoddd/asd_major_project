import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../lib/format';
import Loader from '../../components/Loader';

export default function PaymentSheet({ payment, processing, onComplete, onCancel }) {
  const { t, i18n } = useTranslation();
  if (!payment) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={t('chat.paymentTitle')}>
      <div className="payment">
        <header className="payment__head">
          <span className="payment__mark">MX</span>
          <div>
            <h2>{t('chat.paymentTitle')}</h2>
            <p>{payment.booking?.visitor?.name}</p>
          </div>
          <span className="payment__amount">{formatMoney(payment.order?.amount ?? payment.booking?.amount, i18n.language)}</span>
        </header>

        <dl className="payment__meta">
          <div>
            <dt>{t('chat.paymentOrder')}</dt>
            <dd className="mono">{payment.order?.orderId}</dd>
          </div>
          <div>
            <dt>{t('ui.ticket.code')}</dt>
            <dd className="mono">{payment.booking?.bookingCode}</dd>
          </div>
        </dl>

        {processing ? (
          <div className="payment__processing">
            <Loader label={t('chat.payVerifying')} />
          </div>
        ) : (
          <>
            <p className="payment__note">{t('chat.paymentNote')}</p>
            <div className="payment__actions">
              <button type="button" className="btn btn--accent btn--block" onClick={() => onComplete('success')}>
                {t('chat.paySuccess')}
              </button>
              <button type="button" className="btn btn--ghost btn--block" onClick={() => onComplete('failure')}>
                {t('chat.payFailure')}
              </button>
            </div>
          </>
        )}

        <button type="button" className="payment__close" onClick={onCancel} disabled={processing}>
          {t('chat.payClose')}
        </button>
      </div>
    </div>
  );
}
