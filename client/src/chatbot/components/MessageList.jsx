import { useTranslation } from 'react-i18next';
import TicketCard from '../../components/TicketCard';
import Loader from '../../components/Loader';

function Bubble({ message }) {
  const { t } = useTranslation();
  const text = message.text ?? (message.textKey ? t(`chat.${message.textKey}`, message.params) : '');
  const isTicket = Boolean(message.ticket);

  return (
    <div className={`bubble bubble--${message.from}`}>
      {message.from === 'bot' ? <span className="bubble__avatar">MX</span> : null}
      <div className="bubble__content">
        {text ? <p className="bubble__text">{text}</p> : null}
        {message.errorKey ? (
          <p className="bubble__error">{t(message.errorKey, { defaultValue: message.errorMessage })}</p>
        ) : null}
        {isTicket ? <TicketCard booking={message.ticket} showLink /> : null}
      </div>
    </div>
  );
}

export default function MessageList({ messages, pending }) {
  const { t } = useTranslation();

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((message) => (
        <Bubble key={message.id} message={message} />
      ))}
      {pending ? (
        <div className="bubble bubble--bot">
          <span className="bubble__avatar">MX</span>
          <div className="bubble__content">
            <Loader inline label={t('chat.typing')} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
