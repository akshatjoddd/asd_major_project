
import { ApiError } from './client';

const STORAGE_KEY = 'museumx.mock.v2';

const TICKET_TYPES = [
  {
    id: 1,
    name: 'Adult',
    nameHi: 'वयस्क',
    price: 8000,
    description: 'Visitors aged 13 and above',
    descriptionHi: '13 वर्ष और उससे अधिक आयु के आगंतुक',
    isActive: true,
  },
  {
    id: 2,
    name: 'Child',
    nameHi: 'बालक',
    price: 4000,
    description: 'Children aged 3 to 12',
    descriptionHi: '3 से 12 वर्ष के बच्चे',
    isActive: true,
  },
  {
    id: 3,
    name: 'Student',
    nameHi: 'विद्यार्थी',
    price: 5000,
    description: 'Students with a valid ID card',
    descriptionHi: 'वैध पहचान पत्र वाले विद्यार्थी',
    isActive: true,
  },
];

const EXHIBITIONS = [
  {
    id: 1,
    name: 'Invention',
    nameHi: 'आविष्कार',
    description: 'Hands-on gallery tracing Indian and global inventions.',
    descriptionHi: 'भारतीय और वैश्विक आविष्कारों की प्रदर्शनी।',
    isActive: true,
  },
  {
    id: 2,
    name: 'Human Biology',
    nameHi: 'मानव जीव विज्ञान',
    description: 'Walk through the human body, from cells to senses.',
    descriptionHi: 'कोशिकाओं से इंद्रियों तक मानव शरीर की यात्रा।',
    isActive: true,
  },
  {
    id: 3,
    name: 'Dinosaur Park',
    nameHi: 'डायनासोर पार्क',
    description: 'Life-size dinosaur models in an outdoor trail.',
    descriptionHi: 'खुले रास्ते पर जीवन-आकार के डायनासोर मॉडल।',
    isActive: true,
  },
];

const SHOWS = [
  {
    id: 1,
    name: 'Taramandal Planetarium',
    nameHi: 'तारामंडल शो',
    description: 'A guided tour of the night sky, 25 minutes.',
    descriptionHi: 'रात के आकाश का निर्देशित भ्रमण, 25 मिनट।',
    venue: 'Planetarium Dome',
    venueHi: 'तारामंडल गुंबद',
    isActive: true,
  },
  {
    id: 2,
    name: 'Science on a Sphere',
    nameHi: 'स्फीयर पर विज्ञान',
    description: 'Earth and space data projected on a six-foot globe.',
    descriptionHi: 'छह फुट के ग्लोब पर पृथ्वी और अंतरिक्ष का डेटा।',
    venue: 'Innovation Hall',
    venueHi: 'नवाचार हॉल',
    isActive: true,
  },
  {
    id: 3,
    name: 'Robotics Live',
    nameHi: 'रोबोटिक्स लाइव',
    description: 'Robots built in the museum lab, demonstrated live.',
    descriptionHi: 'संग्रहालय प्रयोगशाला में बने रोबोट, लाइव प्रदर्शन।',
    venue: 'Workshop Studio',
    venueHi: 'कार्यशाला स्टूडियो',
    isActive: true,
  },
];

const SLOT_TEMPLATES = [
  { id: 1, type: 'entry', refId: null, startTime: '10:00', endTime: '11:00', capacity: 220, isActive: true },
  { id: 2, type: 'entry', refId: null, startTime: '11:00', endTime: '12:00', capacity: 220, isActive: true },
  { id: 3, type: 'entry', refId: null, startTime: '12:00', endTime: '13:00', capacity: 220, isActive: true },
  { id: 4, type: 'entry', refId: null, startTime: '13:00', endTime: '14:00', capacity: 220, isActive: true },
  { id: 5, type: 'entry', refId: null, startTime: '14:00', endTime: '15:00', capacity: 220, isActive: true },
  { id: 6, type: 'entry', refId: null, startTime: '15:00', endTime: '16:00', capacity: 220, isActive: true },
  { id: 7, type: 'entry', refId: null, startTime: '16:00', endTime: '17:00', capacity: 220, isActive: true },
  { id: 8, type: 'entry', refId: null, startTime: '17:00', endTime: '18:00', capacity: 220, isActive: true },
  { id: 9, type: 'exhibition', refId: null, startTime: '10:30', endTime: '12:00', capacity: 90, isActive: true },
  { id: 10, type: 'exhibition', refId: null, startTime: '13:00', endTime: '14:30', capacity: 90, isActive: true },
  { id: 11, type: 'exhibition', refId: null, startTime: '15:30', endTime: '17:00', capacity: 90, isActive: true },
  { id: 12, type: 'show', refId: 1, startTime: '11:30', endTime: '12:00', capacity: 60, isActive: true },
  { id: 13, type: 'show', refId: 1, startTime: '14:00', endTime: '14:30', capacity: 60, isActive: true },
  { id: 14, type: 'show', refId: 1, startTime: '16:30', endTime: '17:00', capacity: 60, isActive: true },
  { id: 15, type: 'show', refId: 2, startTime: '12:30', endTime: '13:00', capacity: 80, isActive: true },
  { id: 16, type: 'show', refId: 2, startTime: '15:00', endTime: '15:30', capacity: 80, isActive: true },
  { id: 17, type: 'show', refId: 3, startTime: '13:30', endTime: '14:15', capacity: 50, isActive: true },
  { id: 18, type: 'show', refId: 3, startTime: '17:00', endTime: '17:45', capacity: 50, isActive: true },
];

const ADMINS = [
  { email: 'admin@museumx.in', password: 'admin123', name: 'Museum Administrator', role: 'admin' },
  { email: 'gate@museumx.in', password: 'gate123', name: 'Gate Staff', role: 'gate' },
];

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vihaan', 'Isha', 'Arjun', 'Saanvi',
  'Dev', 'Riya', 'Kunal', 'Neha', 'Aditya', 'Pooja', 'Rehan', 'Tara', 'Manav', 'Sneha',
];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Iyer', 'Khan', 'Bose', 'Nair', 'Gupta', 'Rao', 'Joshi'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const latency = () => sleep(120 + Math.random() * 180);

export function isoDate(date = new Date()) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slotTemplateId(slotId) {
  return Number(String(slotId).split('@')[0]);
}

function bookingCode(rand) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MX';
  for (let i = 0; i < 8; i += 1) code += alphabet[Math.floor(rand() * alphabet.length)];
  return code;
}

function seedBookings() {
  const rand = mulberry32(20261111);
  const bookings = [];
  const payments = [];
  const today = isoDate();
  let paymentId = 1;
  let bookingId = 1;

  for (let i = 0; i < 300; i += 1) {
    const daysAgo = Math.floor(Math.pow(rand(), 1.5) * 30);
    const date = addDays(today, -daysAgo);
    const targetRoll = rand();
    const target = targetRoll < 0.62 ? 'entry' : targetRoll < 0.84 ? 'exhibition' : 'show';
    const pool = target === 'exhibition' ? EXHIBITIONS : target === 'show' ? SHOWS : [{ id: null, name: 'General entry', nameHi: 'सामान्य प्रवेश' }];
    const item = pool[Math.floor(rand() * pool.length)];
    const templates = SLOT_TEMPLATES.filter((t) => t.type === target && (target !== 'show' || t.refId === item.id));
    const template = templates[Math.floor(rand() * templates.length)];
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const hour = Number(template.startTime.split(':')[0]);
    const minute = `${Math.floor(rand() * 50) + 5}`.padStart(2, '0');
    const createdAt = new Date(`${date}T${`${hour}`.padStart(2, '0')}:${minute}:00`);
    const statusRoll = rand();
    const status = statusRoll < 0.86 ? 'CONFIRMED' : statusRoll < 0.94 ? 'CANCELLED' : 'PENDING_PAYMENT';

    const adult = 1 + Math.floor(rand() * 3);
    const child = rand() < 0.45 ? Math.floor(rand() * 3) : 0;
    const student = rand() < 0.2 ? 1 + Math.floor(rand() * 2) : 0;
    const items = [
      { ticketTypeId: 1, quantity: adult, unitPrice: 8000 },
      { ticketTypeId: 2, quantity: child, unitPrice: 4000 },
      { ticketTypeId: 3, quantity: student, unitPrice: 5000 },
    ].filter((row) => row.quantity > 0);
    const amount = items.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
    const visitors = items.reduce((sum, row) => sum + row.quantity, 0);
    const slotId = `${template.id}@${date}`;
    const code = bookingCode(rand);
    const qrToken = `QR${Math.floor(rand() * 1e9).toString(36).toUpperCase()}${bookingId}`;

    bookings.push({
      id: bookingId,
      bookingCode: code,
      qrToken,
      status,
      visitor: {
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${bookingId}@example.com`,
        phone: `98${Math.floor(10000000 + rand() * 89999999)}`,
      },
      target,
      refId: item.id,
      refName: item.name,
      refNameHi: item.nameHi,
      date,
      slotId,
      slotLabel: `${template.startTime} – ${template.endTime}`,
      items,
      visitors,
      amount,
      createdAt: createdAt.toISOString(),
      usedAt: null,
    });

    if (status === 'CONFIRMED') {
      const paidAt = new Date(createdAt.getTime() + 90 * 1000);
      payments.push({
        id: paymentId,
        bookingId,
        bookingCode: code,
        amount,
        status: 'PAID',
        provider: 'SIMULATED',
        providerReference: `pay_${Math.floor(rand() * 1e10).toString(36)}`,
        createdAt: paidAt.toISOString(),
      });
      paymentId += 1;
    } else if (status === 'PENDING_PAYMENT' && rand() < 0.5) {
      payments.push({
        id: paymentId,
        bookingId,
        bookingCode: code,
        amount,
        status: 'FAILED',
        provider: 'SIMULATED',
        providerReference: `pay_${Math.floor(rand() * 1e10).toString(36)}`,
        createdAt: new Date(createdAt.getTime() + 60 * 1000).toISOString(),
      });
      paymentId += 1;
    }

    bookingId += 1;
  }

  return {
    bookings,
    payments,
    counters: { bookingId, paymentId },
  };
}

function blankState() {
  return {
    ticketTypes: TICKET_TYPES.map((row) => ({ ...row })),
    exhibitions: EXHIBITIONS.map((row) => ({ ...row })),
    shows: SHOWS.map((row) => ({ ...row })),
    slotTemplates: SLOT_TEMPLATES.map((row) => ({ ...row })),
    ...seedBookings(),
    issued: {},
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
  }
  const fresh = blankState();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
  }
  return fresh;
}

let state = loadState();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
}

const fail = (code, message, status = 400) => {
  const error = new ApiError(message, status, code);
  throw error;
};

function nextId(rows) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function activeBookingsForSlot(slotId) {
  return state.bookings
    .filter((booking) => booking.slotId === slotId && booking.status !== 'CANCELLED')
    .reduce((sum, booking) => sum + booking.visitors, 0);
}

function buildSlots({ date, type, refId }) {
  const templates = state.slotTemplates.filter(
    (template) =>
      template.isActive &&
      template.type === type &&
      (type !== 'show' || !refId || template.refId === Number(refId)),
  );

  const slots = templates.map((template) => {
    const id = `${template.id}@${date}`;
    const baseRatio = 0.2 + hash(id) * 0.6;
    const isDead = hash(`dead:${id}`) > 0.88;
    const booked = Math.min(template.capacity, Math.floor(template.capacity * baseRatio) + activeBookingsForSlot(id));
    return {
      id,
      templateId: template.id,
      date,
      startTime: template.startTime,
      endTime: template.endTime,
      capacity: template.capacity,
      booked: isDead ? template.capacity : booked,
      remaining: isDead ? 0 : Math.max(0, template.capacity - booked),
      soldOut: isDead || booked >= template.capacity,
      type: template.type,
      refId: template.refId,
      label: `${template.startTime} – ${template.endTime}`,
    };
  });

  if (slots.length > 0 && slots.every((slot) => slot.soldOut)) {
    const first = slots[0];
    first.soldOut = false;
    first.booked = Math.max(0, first.capacity - 12);
    first.remaining = 12;
  }
  return slots;
}

function findBooking(idOrCode, contact) {
  const key = String(idOrCode || '').trim();
  const booking = state.bookings.find(
    (row) => row.bookingCode.toUpperCase() === key.toUpperCase() || String(row.id) === key,
  );
  if (!booking) fail('BOOKING_NOT_FOUND', 'No booking matches that id.', 404);
  if (contact) {
    const needle = String(contact).trim().toLowerCase();
    const matches =
      booking.visitor.email.toLowerCase() === needle ||
      String(booking.visitor.phone) === needle;
    if (!matches) fail('BOOKING_NOT_FOUND', 'No booking matches that id and contact.', 404);
  }
  return booking;
}

function publicBooking(booking) {
  return { ...booking, items: booking.items.map((item) => ({ ...item })) };
}

function startOfBookingWindow(days) {
  return addDays(isoDate(), -(days - 1));
}

function inRange(booking, days) {
  return booking.date >= startOfBookingWindow(days);
}

const revenueOf = (booking) => (booking.status === 'CONFIRMED' ? booking.amount : 0);

function matchesSearch(booking, search) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return (
    booking.bookingCode.toLowerCase().includes(needle) ||
    booking.visitor.name.toLowerCase().includes(needle) ||
    booking.visitor.email.toLowerCase().includes(needle) ||
    String(booking.visitor.phone).includes(needle)
  );
}

export async function getTicketTypes() {
  await latency();
  return state.ticketTypes.filter((row) => row.isActive).map((row) => ({ ...row }));
}

export async function getExhibitions() {
  await latency();
  return state.exhibitions.filter((row) => row.isActive).map((row) => ({ ...row }));
}

export async function getShows() {
  await latency();
  return state.shows.filter((row) => row.isActive).map((row) => ({ ...row }));
}

export async function getSlots({ date, type = 'entry', refId = null } = {}) {
  await latency();
  if (!date) fail('DATE_REQUIRED', 'A date is required.', 422);
  return buildSlots({ date, type, refId });
}

export async function createBooking(payload) {
  await latency();
  const { target, refId, date, slotId, counts, visitor } = payload || {};
  if (!['entry', 'exhibition', 'show'].includes(target)) fail('INVALID_TARGET', 'Choose what to book.', 422);
  if (!date) fail('INVALID_DATE', 'Choose a visit date.', 422);
  if (!slotId) fail('INVALID_SLOT', 'Choose a time slot.', 422);
  if (!visitor?.name || !(visitor?.email || visitor?.phone)) {
    fail('INVALID_VISITOR', 'Name and a contact are required.', 422);
  }

  const quantityByType = Object.entries(counts || {})
    .map(([ticketTypeId, quantity]) => ({ ticketTypeId: Number(ticketTypeId), quantity: Number(quantity) || 0 }))
    .filter((row) => row.quantity > 0);
  const visitors = quantityByType.reduce((sum, row) => sum + row.quantity, 0);
  if (visitors === 0) fail('INVALID_COUNTS', 'Select at least one visitor.', 422);

  const slots = buildSlots({ date, type: target, refId });
  const slot = slots.find((row) => row.id === slotId);
  if (!slot) fail('INVALID_SLOT', 'That slot is no longer available.', 409);
  if (slot.remaining < visitors) {
    fail('SLOT_SOLD_OUT', 'That slot does not have enough places left.', 409);
  }

  const items = quantityByType.map((row) => {
    const type = state.ticketTypes.find((entry) => entry.id === row.ticketTypeId);
    if (!type) fail('INVALID_TICKET_TYPE', 'Unknown ticket category.', 422);
    return {
      ticketTypeId: type.id,
      name: type.name,
      nameHi: type.nameHi,
      quantity: row.quantity,
      unitPrice: type.price,
    };
  });
  const amount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const collection = target === 'exhibition' ? state.exhibitions : target === 'show' ? state.shows : [];
  const ref = collection.find((row) => row.id === Number(refId));

  const id = state.counters.bookingId;
  state.counters.bookingId += 1;
  const code = bookingCode(mulberry32(Math.floor(hash(`${id}:${Date.now()}`) * 4294967296)));
  const booking = {
    id,
    bookingCode: code,
    qrToken: null,
    status: 'PENDING_PAYMENT',
    visitor: {
      name: String(visitor.name).trim(),
      email: visitor.email ? String(visitor.email).trim() : '',
      phone: visitor.phone ? String(visitor.phone).trim() : '',
    },
    target,
    refId: target === 'entry' ? null : Number(refId),
    refName: ref?.name || 'General entry',
    refNameHi: ref?.nameHi || 'सामान्य प्रवेश',
    date,
    slotId,
    slotLabel: slot.label,
    items,
    visitors,
    amount,
    createdAt: new Date().toISOString(),
    usedAt: null,
  };
  state.bookings.push(booking);
  persist();
  return publicBooking(booking);
}

export async function createPaymentOrder(bookingId) {
  await latency();
  const booking = state.bookings.find((row) => row.id === Number(bookingId));
  if (!booking) fail('BOOKING_NOT_FOUND', 'Booking not found.', 404);
  if (booking.status === 'CONFIRMED') fail('ALREADY_PAID', 'This booking is already paid.', 409);
  return {
    orderId: `order_mock_${booking.id}_${Date.now().toString(36)}`,
    amount: booking.amount,
    currency: 'INR',
    mock: true,
  };
}

export async function verifyPayment(payload) {
  await latency();
  const { bookingId, orderId, paymentId } = payload || {};
  const booking = state.bookings.find((row) => row.id === Number(bookingId));
  if (!booking) fail('BOOKING_NOT_FOUND', 'Booking not found.', 404);

  const failed = payload.outcome === 'failure' || String(paymentId || '').toLowerCase().startsWith('fail');
  const payment = {
    id: state.counters.paymentId,
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    amount: booking.amount,
    status: failed ? 'FAILED' : 'PAID',
    provider: 'SIMULATED',
    providerReference: paymentId || `pay_mock_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  state.counters.paymentId += 1;
  state.payments.push(payment);

  if (failed) {
    persist();
    fail('PAYMENT_FAILED', 'The payment did not go through.', 402);
  }

  booking.status = 'CONFIRMED';
  booking.qrToken = `MUSEUMX:${booking.bookingCode}:${orderId || 'order'}`;
  const issuedAt = new Date().toISOString();
  state.issued[booking.bookingCode] = { issuedAt, usedAt: null };
  persist();
  return { booking: publicBooking(booking), payment: { ...payment } };
}

export async function getBooking(idOrCode, contact) {
  await latency();
  return publicBooking(findBooking(idOrCode, contact));
}

export async function lookupTicket({ bookingCode, contact }) {
  await latency();
  if (!contact) fail('CONTACT_REQUIRED', 'Enter the email or phone used for the booking.', 422);
  return publicBooking(findBooking(bookingCode, contact));
}

export async function cancelBooking({ bookingCode, contact, id }) {
  await latency();
  const booking = findBooking(bookingCode || id, contact);
  if (booking.status === 'CANCELLED') return { booking: publicBooking(booking), alreadyCancelled: true };
  if (booking.status === 'CONFIRMED' && booking.usedAt) {
    fail('BOOKING_USED', 'A used ticket cannot be cancelled.', 409);
  }
  booking.status = 'CANCELLED';
  booking.cancelledAt = new Date().toISOString();
  persist();
  return { booking: publicBooking(booking) };
}

export async function validateTicket(code) {
  await latency();
  const normalised = String(code || '').trim();
  const key = normalised.replace(/^MUSEUMX:/i, '').split(':')[0];
  const booking = state.bookings.find(
    (row) =>
      (row.qrToken && row.qrToken === normalised) ||
      row.bookingCode.toUpperCase() === key.toUpperCase(),
  );

  if (!booking || booking.status !== 'CONFIRMED') {
    return { status: 'invalid', scannedAt: new Date().toISOString() };
  }
  if (booking.usedAt) {
    return {
      status: 'used',
      scannedAt: new Date().toISOString(),
      booking: publicBooking(booking),
      firstScan: booking.usedAt,
    };
  }
  booking.usedAt = new Date().toISOString();
  persist();
  return { status: 'valid', scannedAt: booking.usedAt, booking: publicBooking(booking) };
}

export async function login(email, password) {
  await latency();
  const admin = ADMINS.find(
    (row) => row.email.toLowerCase() === String(email).trim().toLowerCase() && row.password === password,
  );
  if (!admin) fail('INVALID_CREDENTIALS', 'Wrong email or password.', 401);
  return {
    token: `mock.${btoa(admin.email)}.${admin.role}`,
    role: admin.role,
    name: admin.name,
    email: admin.email,
  };
}

export async function getAdminBookings({ search = '', status = '', date = '', target = '', page = 1, pageSize = 10 } = {}) {
  await latency();
  const rows = state.bookings
    .filter((booking) => matchesSearch(booking, search))
    .filter((booking) => (status ? booking.status === status : true))
    .filter((booking) => (target ? booking.target === target : true))
    .filter((booking) => (date ? booking.date === date : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = rows.length;
  const start = (Number(page) - 1) * Number(pageSize);
  return {
    rows: rows.slice(start, start + Number(pageSize)).map(publicBooking),
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  };
}

export async function getAdminPayments({ search = '', status = '', page = 1, pageSize = 10 } = {}) {
  await latency();
  const rows = state.payments
    .filter((payment) => {
      if (status && payment.status !== status) return false;
      if (!search) return true;
      const needle = search.toLowerCase();
      return payment.bookingCode.toLowerCase().includes(needle) || String(payment.amount).includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = rows.length;
  const start = (Number(page) - 1) * Number(pageSize);
  return { rows: rows.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) };
}

function analyticsBookings(days) {
  return state.bookings.filter((booking) => inRange(booking, days));
}

export async function getAnalytics({ days = 7 } = {}) {
  await latency();
  const bookings = analyticsBookings(days);
  const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMED');
  const today = isoDate();

  const summary = {
    bookings: confirmed.length,
    visitors: confirmed.reduce((sum, booking) => sum + booking.visitors, 0),
    revenue: confirmed.reduce((sum, booking) => sum + revenueOf(booking), 0),
    today: state.bookings
      .filter((booking) => booking.date === today && booking.status === 'CONFIRMED')
      .reduce((sum, booking) => sum + booking.visitors, 0),
  };

  const byDayMap = new Map();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    byDayMap.set(addDays(today, -offset), { date: addDays(today, -offset), bookings: 0, visitors: 0 });
  }
  confirmed.forEach((booking) => {
    const row = byDayMap.get(booking.date);
    if (!row) return;
    row.bookings += 1;
    row.visitors += booking.visitors;
  });

  const hourMap = new Map();
  for (let hour = 10; hour <= 17; hour += 1) hourMap.set(hour, 0);
  confirmed.forEach((booking) => {
    const hour = Number(String(booking.slotLabel).slice(0, 2));
    if (hourMap.has(hour)) hourMap.set(hour, hourMap.get(hour) + booking.visitors);
  });

  const popularMap = new Map();
  confirmed.forEach((booking) => {
    const key = `${booking.target}:${booking.refId || 'entry'}`;
    const current =
      popularMap.get(key) ||
      { name: booking.refName, nameHi: booking.refNameHi, type: booking.target, bookings: 0, visitors: 0 };
    current.bookings += 1;
    current.visitors += booking.visitors;
    popularMap.set(key, current);
  });

  return {
    summary,
    bookingsByDay: [...byDayMap.values()].map((row) => ({ ...row, label: row.date.slice(5) })),
    peakHours: [...hourMap.entries()].map(([hour, visitors]) => ({
      hour: `${hour}:00`,
      visitors,
    })),
    popular: [...popularMap.values()].sort((a, b) => b.visitors - a.visitors).slice(0, 6),
  };
}

function crud(resource, key) {
  return {
    async list() {
      await latency();
      return state[key].map((row) => ({ ...row }));
    },
    async create(payload) {
      await latency();
      const row = { ...payload, id: nextId(state[key]) };
      state[key].push(row);
      persist();
      return { ...row };
    },
    async update(id, payload) {
      await latency();
      const row = state[key].find((entry) => entry.id === Number(id));
      if (!row) fail('NOT_FOUND', `${resource} not found.`, 404);
      Object.assign(row, payload, { id: row.id });
      persist();
      return { ...row };
    },
    async remove(id) {
      await latency();
      const index = state[key].findIndex((entry) => entry.id === Number(id));
      if (index === -1) fail('NOT_FOUND', `${resource} not found.`, 404);
      const row = state[key][index];
      if (key === 'slotTemplates') {
        const used = state.bookings.some(
          (booking) => slotTemplateId(booking.slotId) === row.id && booking.status !== 'CANCELLED',
        );
        if (used) fail('RESOURCE_IN_USE', 'This slot has bookings. Deactivate it instead.', 409);
      }
      state[key].splice(index, 1);
      persist();
      return { ok: true };
    },
  };
}

const exhibitionsCrud = crud('Exhibition', 'exhibitions');
const showsCrud = crud('Show', 'shows');
const slotTemplatesCrud = crud('Time slot', 'slotTemplates');
const ticketTypesCrud = crud('Ticket category', 'ticketTypes');

export const getAdminExhibitions = exhibitionsCrud.list;
export const createExhibition = exhibitionsCrud.create;
export const updateExhibition = exhibitionsCrud.update;
export const deleteExhibition = exhibitionsCrud.remove;

export const getAdminShows = showsCrud.list;
export const createShow = showsCrud.create;
export const updateShow = showsCrud.update;
export const deleteShow = showsCrud.remove;

export const getAdminSlotTemplates = slotTemplatesCrud.list;
export const createSlotTemplate = slotTemplatesCrud.create;
export const updateSlotTemplate = slotTemplatesCrud.update;
export const deleteSlotTemplate = slotTemplatesCrud.remove;

export const getAdminTicketTypes = ticketTypesCrud.list;
export const createTicketType = ticketTypesCrud.create;
export const updateTicketType = ticketTypesCrud.update;
export const deleteTicketType = ticketTypesCrud.remove;

export function resetMockData() {
  state = blankState();
  persist();
}
