// Real Express implementation of the contract in section 18 of the TRD.
// Every function here has a twin in mockApi.js with the same signature.

import { request, query } from './client';

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body });
const put = (path, body) => request(path, { method: 'PUT', body });
const del = (path) => request(path, { method: 'DELETE' });

export const getTicketTypes = () => get('/api/ticket-types');
export const getExhibitions = () => get('/api/exhibitions');
export const getShows = () => get('/api/shows');
export const getSlots = ({ date, type, refId }) => get(`/api/slots${query({ date, type, refId })}`);

export const createBooking = (payload) => post('/api/bookings', payload);
export const createPaymentOrder = (bookingId) => post('/api/payments/order', { bookingId });
export const verifyPayment = (payload) => post('/api/payments/verify', payload);

export const getBooking = (id, contact) => get(`/api/bookings/${encodeURIComponent(id)}${query({ contact })}`);
export const lookupTicket = ({ bookingCode, contact }) =>
  get(`/api/bookings/${encodeURIComponent(bookingCode)}${query({ contact })}`);
export const cancelBooking = (payload) =>
  post(`/api/bookings/${encodeURIComponent(payload.bookingCode || payload.id)}/cancel`, {
    contact: payload.contact,
  });
export const validateTicket = (code) => post('/api/tickets/validate', { code });

export const login = (email, password) => post('/api/admin/login', { email, password });

export const userLogin = (email, password) => post('/api/user/login', { email, password });
export const userRegister = (payload) => post('/api/user/register', payload);
export const getUserProfile = () => get('/api/user/me');
export const getUserBookings = () => get('/api/user/bookings');

export const getAdminBookings = async (params) => {
  const res = await get(`/api/admin/bookings${query(params)}`);
  return {
    ...res,
    rows: res?.rows || res?.items || [],
  };
};

export const getAdminPayments = async (params) => {
  const res = await get(`/api/admin/payments${query(params)}`);
  return {
    ...res,
    rows: res?.rows || res?.items || [],
  };
};

export async function getAnalytics({ days = 7 } = {}) {
  const params = query({ days });
  const [summary, bookingsByDay, peakHours, popular] = await Promise.all([
    get(`/api/admin/analytics/summary${params}`),
    get(`/api/admin/analytics/bookings-by-day${params}`),
    get(`/api/admin/analytics/peak-hours${params}`),
    get(`/api/admin/analytics/popular${params}`),
  ]);

  const safeSummary = {
    bookings: summary?.bookings ?? 0,
    confirmedBookings: summary?.confirmedBookings ?? 0,
    visitors: summary?.visitors ?? 0,
    revenue: summary?.revenue ?? 0,
    today: summary?.today ?? summary?.todayBookings ?? 0,
    ...summary,
  };

  const safeBookingsByDay = Array.isArray(bookingsByDay)
    ? bookingsByDay.map((row) => ({
        ...row,
        bookings: row.bookings ?? row.count ?? 0,
        label: row.label || String(row.date).slice(5),
      }))
    : [];

  const safePeakHours = Array.isArray(peakHours)
    ? peakHours.map((row) => ({
        ...row,
        hour: row.hour || row.slot || '10:00',
        visitors: row.visitors ?? 0,
      }))
    : [];

  const safePopular = Array.isArray(popular)
    ? popular.map((row) => ({
        ...row,
        name: row.name || 'General Entry',
        nameHi: row.nameHi || row.name || 'सामान्य प्रवेश',
        type: row.type || 'entry',
        visitors: row.visitors ?? row.count ?? 0,
      }))
    : [];

  return {
    summary: safeSummary,
    bookingsByDay: safeBookingsByDay,
    peakHours: safePeakHours,
    popular: safePopular,
  };
}

export const getAdminExhibitions = () => get('/api/admin/exhibitions');
export const createExhibition = (payload) => post('/api/admin/exhibitions', payload);
export const updateExhibition = (id, payload) => put(`/api/admin/exhibitions/${id}`, payload);
export const deleteExhibition = (id) => del(`/api/admin/exhibitions/${id}`);

export const getAdminShows = () => get('/api/admin/shows');
export const createShow = (payload) => post('/api/admin/shows', payload);
export const updateShow = (id, payload) => put(`/api/admin/shows/${id}`, payload);
export const deleteShow = (id) => del(`/api/admin/shows/${id}`);

export const getAdminSlotTemplates = () => get('/api/admin/slots');
export const createSlotTemplate = (payload) => post('/api/admin/slots', payload);
export const updateSlotTemplate = (id, payload) => put(`/api/admin/slots/${id}`, payload);
export const deleteSlotTemplate = (id) => del(`/api/admin/slots/${id}`);

export const getAdminTicketTypes = () => get('/api/admin/ticket-types');
export const createTicketType = (payload) => post('/api/admin/ticket-types', payload);
export const updateTicketType = (id, payload) => put(`/api/admin/ticket-types/${id}`, payload);
export const deleteTicketType = (id) => del(`/api/admin/ticket-types/${id}`);
