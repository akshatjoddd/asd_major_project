import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { formatDate, formatDateTime } from '../lib/format';
import StatusBadge from './components/StatusBadge';

export default function Validate() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      /* already stopped */
    }
  };

  useEffect(
    () => () => {
      const scanner = scannerRef.current;
      if (scanner) scanner.stop().catch(() => {});
    },
    [],
  );

  const validate = async (value) => {
    if (!value || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await api.validateTicket(value);
      setResult({ ...response, code: value });
      setScans((current) =>
        [
          {
            status: response.status,
            code: value,
            at: response.scannedAt || new Date().toISOString(),
            visitor: response.booking?.visitor?.name || '—',
          },
          ...current,
        ].slice(0, 10),
      );
    } catch (error) {
      setResult({ status: 'invalid', code: value, error });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const startScanner = async () => {
    setCameraError('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText) => {
          stopScanner();
          validate(decodedText);
        },
        () => {},
      );
      setScanning(true);
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setCameraError(t('ui.validate.cameraError'));
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;
    validate(value);
    setCode('');
  };

  return (
    <div className="admin-page">
      <header className="admin-head">
        <div>
          <p className="eyebrow">{t('common.admin')}</p>
          <h1>{t('ui.validate.title')}</h1>
          <p>{t('ui.validate.lead')}</p>
        </div>
      </header>

      <div className="validate">
        <section className="card validate__scanner">
          <div className="validate__frame">
            <div id="qr-reader" className="validate__reader" />
            {!scanning ? (
              <div className="validate__placeholder">
                <span aria-hidden="true">▣</span>
                <p>{t('ui.validate.scanning')}</p>
              </div>
            ) : null}
          </div>

          <div className="validate__controls">
            {scanning ? (
              <button type="button" className="btn btn--ink" onClick={stopScanner}>
                {t('ui.validate.stop')}
              </button>
            ) : (
              <button type="button" className="btn btn--accent" onClick={startScanner}>
                {t('ui.validate.scan')}
              </button>
            )}
          </div>

          {cameraError ? <p className="field__error">{cameraError}</p> : null}

          <form className="validate__manual" onSubmit={submit}>
            <label className="field">
              <span>{t('ui.validate.manual')}</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={t('ui.validate.manualPlaceholder')}
                autoComplete="off"
              />
            </label>
            <button type="submit" className="btn btn--ink" disabled={busy || !code.trim()}>
              {busy ? t('common.loading') : t('ui.validate.submit')}
            </button>
          </form>
        </section>

        <section className="validate__side">
          {result ? (
            <article className={`scan-result scan-result--${result.status}`}>
              <span className="scan-result__status">
                {t(`ui.validate.${result.status === 'valid' ? 'valid' : result.status === 'used' ? 'used' : 'invalid'}`)}
              </span>
              <span className="mono scan-result__code">{result.code}</span>

              {result.booking ? (
                <dl className="scan-result__meta">
                  <div>
                    <dt>{t('ui.validate.visitor')}</dt>
                    <dd>{result.booking.visitor.name}</dd>
                  </div>
                  <div>
                    <dt>{t('ui.validate.date')}</dt>
                    <dd>{formatDate(result.booking.date)}</dd>
                  </div>
                  <div>
                    <dt>{t('ui.validate.slot')}</dt>
                    <dd>{result.booking.slotLabel}</dd>
                  </div>
                  <div>
                    <dt>{t('ui.validate.scannedAt')}</dt>
                    <dd>{formatDateTime(result.scannedAt)}</dd>
                  </div>
                  {result.firstScan ? (
                    <div>
                      <dt>{t('ui.validate.firstScan')}</dt>
                      <dd>{formatDateTime(result.firstScan)}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </article>
          ) : (
            <article className="card validate__hint">
              <span aria-hidden="true">◎</span>
              <p>{t('ui.validate.scanning')}</p>
            </article>
          )}

          <article className="card">
            <h2>{t('ui.validate.recent')}</h2>
            {scans.length === 0 ? (
              <p className="validate__empty">{t('ui.validate.noRecent')}</p>
            ) : (
              <ul className="scan-list">
                {scans.map((scan) => (
                  <li key={`${scan.code}-${scan.at}`}>
                    <span className="mono">{scan.code}</span>
                    <span className="scan-list__visitor">{scan.visitor}</span>
                    <StatusBadge status={scan.status === 'valid' ? 'PAID' : scan.status === 'used' ? 'CANCELLED' : 'FAILED'} />
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}
