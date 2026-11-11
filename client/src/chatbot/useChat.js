// Binds the pure state machine to the API: loads options, creates the booking,
// runs the payment and handles cancellation. Components only call these verbs.

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { formatMoney } from '../lib/format';
import { flow } from './engine/flow';
import { initialChat, reducer } from './engine/reducer';

function errorInfo(error) {
  return {
    errorKey: error?.code ? `errors.${error.code}` : null,
    errorMessage: error?.message || '',
  };
}

export function useChat() {
  const { i18n, t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, i18n.language, initialChat);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const loadedRef = useRef('');
  const bookingRef = useRef(null);
  const payEntryRef = useRef(0);

  useEffect(() => {
    dispatch({ type: 'START' });
  }, []);

  // Language changes made outside the chat (header toggle, admin) flow back in.
  useEffect(() => {
    if (i18n.language !== state.lang) i18n.changeLanguage(state.lang);
  }, [state.lang, i18n]);

  useEffect(() => {
    const handler = (language) => dispatch({ type: 'SET_LANG', lang: language });
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const loadInfo = useCallback(
    async (infoKey, language) => {
      if (infoKey === 'timings') return {};
      if (infoKey === 'prices') {
        const types = await api.getTicketTypes();
        return {
          list: types.map((type) => `${language === 'hi' ? type.nameHi : type.name} — ${formatMoney(type.price, language)}`).join('\n'),
        };
      }
      if (infoKey === 'exhibitions') {
        const rows = await api.getExhibitions();
        return { list: rows.map((row) => `• ${language === 'hi' ? row.nameHi : row.name}`).join('\n') };
      }
      const rows = await api.getShows();
      return {
        list: rows
          .map((row) => `• ${language === 'hi' ? row.nameHi : row.name} — ${language === 'hi' ? row.venueHi : row.venue}`)
          .join('\n'),
      };
    },
    [],
  );

  // Load whatever the current state needs (exhibitions, shows, slots, info).
  useEffect(() => {
    const definition = flow[state.step];
    if (!state.pending || !definition?.load) return;

    const key = `${state.step}:${state.entryId}`;
    if (loadedRef.current === key) return;
    loadedRef.current = key;

    let alive = true;
    (async () => {
      try {
        if (definition.load === 'exhibitions' || definition.load === 'shows') {
          const rows =
            definition.load === 'exhibitions' ? await api.getExhibitions() : await api.getShows();
          if (!alive) return;
          dispatch({
            type: 'LOADED',
            textKey: definition.say,
            options: rows.map((row) => ({
              id: `${definition.load}:${row.id}`,
              value: row.id,
              label: row.name,
              labelHi: row.nameHi,
              description: row.description,
              descriptionHi: row.descriptionHi,
            })),
          });
          return;
        }

        if (definition.load === 'slots') {
          const rows = await api.getSlots({
            date: state.booking.date,
            type: state.booking.target,
            refId: state.booking.refId,
          });
          if (!alive) return;
          if (!rows.length || rows.every((slot) => slot.soldOut)) {
            dispatch({ type: 'SLOT_EMPTY' });
            return;
          }
          dispatch({
            type: 'LOADED',
            textKey: definition.say,
            options: rows.map((slot) => ({
              id: `slot:${slot.id}`,
              value: slot.id,
              meta: {
                label: slot.label,
                startTime: slot.startTime,
                remaining: slot.remaining,
                soldOut: slot.soldOut,
              },
            })),
          });
          return;
        }

        if (definition.load === 'info') {
          const params = await loadInfo(state.infoKey, state.lang);
          if (!alive) return;
          dispatch({
            type: 'LOADED',
            textKey: `info.${state.infoKey}`,
            params,
            options: definition.options,
          });
        }
      } catch (error) {
        if (alive) dispatch({ type: 'LOAD_ERROR', ...errorInfo(error) });
      }
    })();

    return () => {
      alive = false;
    };
  }, [state.step, state.entryId, state.pending, state.booking.date, state.booking.target, state.booking.refId, state.infoKey, state.lang, loadInfo]);

  // A booking abandoned before payment must not be reused by the next one.
  useEffect(() => {
    if (state.step === 'start' || state.step === 'target') bookingRef.current = null;
  }, [state.step]);

  // Entering the pay state creates the booking once, then an order for it.
  // The entry guard keeps StrictMode's double effect from booking twice.
  useEffect(() => {
    if (state.step !== 'pay' || !state.pending) return undefined;
    if (payEntryRef.current === state.entryId) return undefined;
    payEntryRef.current = state.entryId;
    let alive = true;

    (async () => {
      try {
        let booking = bookingRef.current;
        if (!booking) {
          booking = await api.createBooking({
            target: state.booking.target,
            refId: state.booking.refId,
            date: state.booking.date,
            slotId: state.booking.slotId,
            counts: state.booking.counts,
            visitor: state.booking.visitor,
          });
          bookingRef.current = booking;
        }
        const order = await api.createPaymentOrder(booking.id);
        if (!alive) return;
        setPayment({ booking, order });
      } catch (error) {
        if (!alive) return;
        if (error?.code === 'SLOT_SOLD_OUT' || error?.code === 'INVALID_SLOT') {
          bookingRef.current = null;
          dispatch({ type: 'SOLD_OUT' });
          return;
        }
        dispatch({ type: 'PAY_FAILED', ...errorInfo(error) });
      }
    })();

    return () => {
      alive = false;
    };
  }, [state.step, state.entryId, state.pending, state.booking]);

  const completePayment = useCallback(
    async (outcome = 'success') => {
      if (!payment) return;
      setProcessing(true);
      try {
        const result = await api.verifyPayment({
          bookingId: payment.booking.id,
          orderId: payment.order.orderId,
          paymentId: outcome === 'success' ? undefined : 'fail_mock',
          outcome,
        });
        setPayment(null);
        bookingRef.current = null;
        dispatch({ type: 'TICKET', ticket: result.booking });
      } catch (error) {
        setPayment(null);
        dispatch({ type: 'PAY_FAILED', ...errorInfo(error) });
      } finally {
        setProcessing(false);
      }
    },
    [payment],
  );

  const cancelPayment = useCallback(() => {
    setPayment(null);
    dispatch({ type: 'PAY_FAILED', textKey: 'paymentCancelled' });
  }, []);

  const submitCancel = useCallback(
    async ({ bookingCode, contact }) => {
      try {
        const result = await api.cancelBooking({ bookingCode, contact });
        dispatch({ type: 'CANCEL_DONE', booking: result.booking });
      } catch (error) {
        dispatch({ type: 'CANCEL_FAILED', bookingCode, ...errorInfo(error) });
      }
    },
    [],
  );

  return {
    state,
    payment,
    processing,
    pending: state.pending,
    send: (text) => dispatch({ type: 'TEXT', text }),
    pick: (optionId) => dispatch({ type: 'PICK', optionId }),
    submitDate: (value, display) => dispatch({ type: 'SET_DATE', value, display }),
    submitCounts: (counts, display) => dispatch({ type: 'SET_COUNTS', counts, display }),
    submitVisitor: (visitor, display) => dispatch({ type: 'SET_VISITOR', visitor, display }),
    submitCancel,
    restart: () => dispatch({ type: 'RESTART' }),
    back: () => dispatch({ type: 'BACK' }),
    setLanguage: (lang) => dispatch({ type: 'SET_LANG', lang }),
    completePayment,
    cancelPayment,
    errorInfo,
    t,
  };
}
