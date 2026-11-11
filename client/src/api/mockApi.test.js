import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, todayISO } from '../lib/format';
import {
  cancelBooking,
  createBooking,
  createPaymentOrder,
  getSlots,
  getTicketTypes,
  lookupTicket,
  resetMockData,
  validateTicket,
  verifyPayment,
} from './mockApi';

const date = addDays(todayISO(), 3);

const visitor = { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210' };

async function bookOne() {
  const slots = await getSlots({ date, type: 'entry' });
  const slot = slots.find((row) => !row.soldOut);
  const booking = await createBooking({
    target: 'entry',
    refId: null,
    date,
    slotId: slot.id,
    counts: { 1: 2 },
    visitor,
  });
  return { booking, slot };
}

beforeEach(() => {
  resetMockData();
});

describe('mock booking lifecycle', () => {
  it('creates a pending booking with server-side pricing', async () => {
    const { booking, slot } = await bookOne();
    expect(booking.status).toBe('PENDING_PAYMENT');
    expect(booking.amount).toBe(16000);
    expect(booking.slotLabel).toBe(slot.label);
    expect(booking.bookingCode).toMatch(/^MX[A-Z0-9]{8}$/);
  });

  it('confirms the booking after payment and issues a scannable QR', async () => {
    const { booking } = await bookOne();
    const order = await createPaymentOrder(booking.id);
    expect(order.amount).toBe(booking.amount);

    const result = await verifyPayment({
      bookingId: booking.id,
      orderId: order.orderId,
      paymentId: 'pay_test_1',
      outcome: 'success',
    });

    expect(result.booking.status).toBe('CONFIRMED');
    expect(result.payment.status).toBe('PAID');
    expect(result.booking.qrToken).toBe(`MUSEUMX:${booking.bookingCode}:${order.orderId}`);

    const first = await validateTicket(result.booking.qrToken);
    expect(first.status).toBe('valid');
    expect(first.booking.bookingCode).toBe(booking.bookingCode);

    const second = await validateTicket(booking.bookingCode);
    expect(second.status).toBe('used');
  });

  it('keeps a failed payment unconfirmed and can be retried', async () => {
    const { booking } = await bookOne();
    const order = await createPaymentOrder(booking.id);

    await expect(
      verifyPayment({ bookingId: booking.id, orderId: order.orderId, paymentId: 'fail_1', outcome: 'failure' }),
    ).rejects.toMatchObject({ code: 'PAYMENT_FAILED' });

    const retry = await verifyPayment({
      bookingId: booking.id,
      orderId: order.orderId,
      paymentId: 'pay_retry',
      outcome: 'success',
    });
    expect(retry.booking.status).toBe('CONFIRMED');
  });

  it('cancels a booking only with the matching contact', async () => {
    const { booking } = await bookOne();
    await expect(lookupTicket({ bookingCode: booking.bookingCode, contact: 'wrong@example.com' })).rejects.toMatchObject({
      code: 'BOOKING_NOT_FOUND',
    });

    const result = await cancelBooking({ bookingCode: booking.bookingCode, contact: visitor.email });
    expect(result.booking.status).toBe('CANCELLED');
  });

  it('refuses a slot that has no room left', async () => {
    const slots = await getSlots({ date, type: 'entry' });
    const soldOut = slots.find((row) => row.soldOut);
    if (!soldOut) return;

    await expect(
      createBooking({
        target: 'entry',
        refId: null,
        date,
        slotId: soldOut.id,
        counts: { 1: 1 },
        visitor,
      }),
    ).rejects.toMatchObject({ code: 'SLOT_SOLD_OUT' });
  });

  it('returns the seeded categories', async () => {
    const types = await getTicketTypes();
    expect(types.map((type) => type.id)).toEqual([1, 2, 3]);
  });
});
