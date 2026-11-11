import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { useApiData } from '../hooks/useApiData';
import { formatMoney } from '../lib/format';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { data: types } = useApiData(() => api.getTicketTypes(), []);
  const cheapest = (types || []).reduce((min, type) => (min === null || type.price < min ? type.price : min), null);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__rule" aria-hidden="true" />
            {t('home.eyebrow')}
          </p>
          <h1 className="hero__title">
            {t('home.title')}
            <em>{t('home.titleAccent')}</em>
          </h1>
          <p className="hero__lead">{t('home.lead')}</p>

          <div className="hero__actions">
            <Link className="btn btn--accent btn--large" to="/chat">
              {t('home.cta')}
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn--ghost btn--large" to="/lookup">
              {t('home.lookup')}
            </Link>
          </div>

          <ul className="hero__facts">
            <li>
              <span className="hero__factValue">10:00 – 18:00</span>
              <span>{t('home.timingsTitle')}</span>
            </li>
            <li>
              <span className="hero__factValue">{cheapest === null ? '—' : formatMoney(cheapest, i18n.language)}</span>
              <span>{t('home.ticketTitle')}</span>
            </li>
            <li>
              <span className="hero__factValue">EN · हिं</span>
              <span>{t('common.language')}</span>
            </li>
          </ul>
        </div>

        <div className="hero__art" aria-hidden="true">
          <div className="stub">
            <div className="stub__top">
              <span>National Science Centre</span>
              <span>ADMIT ONE</span>
            </div>
            <div className="stub__monogram">MX</div>
            <div className="stub__meta">
              <span>TUE – SUN</span>
              <span>10:00 – 18:00</span>
              <span>NEW DELHI</span>
            </div>
            <div className="stub__barcode" />
            <span className="stub__perf" />
          </div>
          <div className="hero__orbit" />
        </div>
      </section>

      <section className="features" aria-label={t('home.exhibitionsTitle')}>
        {[
          ['01', 'feature1Title', 'feature1Body'],
          ['02', 'feature2Title', 'feature2Body'],
          ['03', 'feature3Title', 'feature3Body'],
        ].map(([index, title, body]) => (
          <article key={index} className="feature">
            <span className="feature__index">{index}</span>
            <h2>{t(`home.${title}`)}</h2>
            <p>{t(`home.${body}`)}</p>
          </article>
        ))}
      </section>

      <section className="panels">
        <article className="panel">
          <h2>{t('home.timingsTitle')}</h2>
          <p>{t('home.timingsBody')}</p>
          <Link className="text-link" to="/chat">
            {t('home.cta')} <span aria-hidden="true">→</span>
          </Link>
        </article>
        <article className="panel panel--accent">
          <h2>{t('home.ticketTitle')}</h2>
          <p>{t('home.ticketBody', { price: cheapest === null ? '—' : formatMoney(cheapest, i18n.language) })}</p>
          <ul className="panel__list">
            {(types || []).map((type) => (
              <li key={type.id}>
                <span>{i18n.language === 'hi' ? type.nameHi || type.name : type.name}</span>
                <span>{formatMoney(type.price, i18n.language)}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>{t('home.exhibitionsTitle')}</h2>
          <p>{t('home.exhibitionsBody')}</p>
          <Link className="text-link" to="/chat">
            {t('home.cta')} <span aria-hidden="true">→</span>
          </Link>
        </article>
      </section>
    </div>
  );
}
