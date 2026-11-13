import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChat } from '../chatbot/useChat';
import MessageList from '../chatbot/components/MessageList';
import QuickReplies from '../chatbot/components/QuickReplies';
import DateControl from '../chatbot/components/DateControl';
import CountsControl from '../chatbot/components/CountsControl';
import VisitorControl from '../chatbot/components/VisitorControl';
import SummaryCard from '../chatbot/components/SummaryCard';
import CancelControl from '../chatbot/components/CancelControl';
import PaymentSheet from '../chatbot/components/PaymentSheet';
import SignInRequiredControl from '../chatbot/components/SignInRequiredControl';

function ChatControl({ state, chat }) {
  switch (state.control) {
    case 'date':
      return <DateControl key={state.entryId} value={state.booking.date} onSubmit={chat.submitDate} />;
    case 'counts':
      return <CountsControl key={state.entryId} value={state.booking.counts} onSubmit={chat.submitCounts} />;
    case 'visitor':
      return <VisitorControl key={state.entryId} value={state.booking.visitor} onSubmit={chat.submitVisitor} />;
    case 'summary':
      return <SummaryCard booking={state.booking} />;
    case 'cancelForm':
      return <CancelControl key={state.entryId} onSubmit={chat.submitCancel} />;
    case 'signInRequired':
      return <SignInRequiredControl key={state.entryId} />;
    default:
      return null;
  }
}

export default function Chat() {
  const chat = useChat();
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.state.messages, chat.state.control, chat.pending, chat.payment]);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    chat.send(draft);
    setDraft('');
  };

  return (
    <div className="chat-page">
      <aside className="chat-aside">
        <p className="eyebrow">{t('chat.subtitle')}</p>
        <h1>
          {t('chat.title')}
          <span className="chat-aside__dot" aria-hidden="true" />
        </h1>
        <p className="chat-aside__lead">{t('home.lead')}</p>

        <dl className="chat-aside__facts">
          <div>
            <dt>{t('home.timingsTitle')}</dt>
            <dd>{t('home.glanceBody')}</dd>
          </div>
          <div>
            <dt>{t('common.language')}</dt>
            <dd>{t('common.english')} · {t('common.hindi')}</dd>
          </div>
        </dl>

        <div className="chat-aside__links">
          <Link to="/lookup">{t('home.lookup')}</Link>
          <Link to="/">{t('nav.home')}</Link>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-panel__head">
          <div className="chat-panel__identity">
            <span className="chat-panel__avatar">MX</span>
            <div>
              <strong>{t('chat.title')}</strong>
              <span className="chat-panel__online">{t('chat.online')}</span>
            </div>
          </div>
          <div className="chat-panel__actions">
            <button type="button" className="chip" onClick={chat.back}>
              {t('common.back')}
            </button>
            <button type="button" className="chip" onClick={chat.restart}>
              {t('chat.restart')}
            </button>
          </div>
        </header>

        <div className="chat-panel__scroll">
          <MessageList messages={chat.state.messages} pending={chat.pending} />
          <div className="chat-panel__interactive">
            <ChatControl state={chat.state} chat={chat} />
            <QuickReplies options={chat.state.currentOptions} onPick={chat.pick} />
          </div>
          <div ref={endRef} />
        </div>

        <form className="composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="chat-input">
            {t('chat.placeholder')}
          </label>
          <input
            id="chat-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t('chat.placeholder')}
            autoComplete="off"
          />
          <button type="submit" className="composer__send" disabled={!draft.trim()} aria-label={t('chat.send')}>
            ↑
          </button>
        </form>
        <p className="chat-panel__note">{t('chat.disclaimer')}</p>
      </section>

      <PaymentSheet
        payment={chat.payment}
        processing={chat.processing}
        onComplete={chat.completePayment}
        onCancel={chat.cancelPayment}
      />
    </div>
  );
}
