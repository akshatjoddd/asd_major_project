import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './db.js';
import { signAdminToken, requireAdmin, signUserToken, requireUser, optionalUser } from './auth.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Helper error handler
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
class HttpError extends Error {
  constructor(status, message, code = 'REQUEST_FAILED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function publicBooking(b) {
  let items = [];
  try {
    items = b.itemsJson ? JSON.parse(b.itemsJson) : [];
  } catch {
    items = [];
  }

  const latestPayment = b.payments?.[0];
  const qrToken = b.issuedTickets?.[0]?.qrToken || (b.status === 'CONFIRMED' ? `MUSEUMX:${b.bookingCode}:order` : null);
  const usedTicket = b.issuedTickets?.find((t) => t.status === 'USED' || t.scannedAt);

  return {
    id: b.id,
    bookingCode: b.bookingCode,
    qrToken,
    status: b.status,
    visitor: {
      name: b.user?.name || b.visitorName || '',
      email: b.user?.email || b.visitorEmail || '',
      phone: b.user?.phone || b.visitorPhone || '',
    },
    target: b.target || 'entry',
    refId: b.refId,
    refName: b.refName || b.ticketType?.name || 'General entry',
    refNameHi: b.refNameHi || b.ticketType?.nameHi || 'सामान्य प्रवेश',
    date: b.date || b.dailyCapacity?.visitDate?.toISOString().slice(0, 10),
    slotId: b.slotId,
    slotLabel: b.slotLabel || '10:00 – 11:00',
    items: items.length > 0 ? items : [
      {
        ticketTypeId: b.ticketTypeId,
        name: b.ticketType?.name || 'General Entry',
        nameHi: b.ticketType?.nameHi || 'सामान्य प्रवेश',
        quantity: b.quantity,
        unitPrice: b.unitPrice,
      },
    ],
    visitors: b.quantity,
    amount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
    usedAt: usedTicket ? usedTicket.scannedAt?.toISOString() : null,
  };
}

// 1. Health Check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'neon-postgresql', time: new Date().toISOString() });
});

// 2. Ticket Types
app.get('/api/ticket-types', wrap(async (_req, res) => {
  const types = await prisma.ticketType.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
  res.json(types);
}));

// 3. Exhibitions & Shows
app.get('/api/exhibitions', wrap(async (_req, res) => {
  const list = await prisma.exhibition.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
  res.json(list);
}));

app.get('/api/shows', wrap(async (_req, res) => {
  const list = await prisma.show.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });
  res.json(list);
}));

// 4. Slots
app.get('/api/slots', wrap(async (req, res) => {
  const { date, type = 'entry', refId } = req.query;
  if (!date) throw new HttpError(422, 'date query parameter is required', 'DATE_REQUIRED');

  const templates = await prisma.slotTemplate.findMany({
    where: {
      isActive: true,
      type,
      ...(type === 'show' && refId ? { refId: Number(refId) } : {}),
    },
    orderBy: { startTime: 'asc' },
  });

  const activeBookings = await prisma.booking.findMany({
    where: {
      date: String(date),
      target: String(type),
      status: { not: 'CANCELLED' },
    },
    select: { slotId: true, quantity: true },
  });

  const countsBySlot = {};
  for (const b of activeBookings) {
    if (b.slotId) {
      countsBySlot[b.slotId] = (countsBySlot[b.slotId] || 0) + b.quantity;
    }
  }

  const slots = templates.map((tpl) => {
    const id = `${tpl.id}@${date}`;
    const booked = countsBySlot[id] || 0;
    const remaining = Math.max(0, tpl.capacity - booked);
    return {
      id,
      templateId: tpl.id,
      date,
      startTime: tpl.startTime,
      endTime: tpl.endTime,
      capacity: tpl.capacity,
      booked,
      remaining,
      soldOut: remaining <= 0,
      type: tpl.type,
      refId: tpl.refId,
      label: `${tpl.startTime} – ${tpl.endTime}`,
    };
  });

  res.json(slots);
}));

// ---------- Normal User Authentication & Profile ----------
app.post('/api/user/register', wrap(async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new HttpError(400, 'Full name is required (at least 2 characters)', 'INVALID_NAME');
  }
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new HttpError(400, 'A valid email address is required', 'INVALID_EMAIL');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters', 'INVALID_PASSWORD');
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

  const passwordHash = await bcrypt.hash(password, 10);
  let user;

  if (existing) {
    const isGuest = await bcrypt.compare('museumx_guest', existing.passwordHash);
    if (!isGuest) {
      throw new HttpError(409, 'An account with this email already exists. Please log in.', 'USER_EXISTS');
    }
    user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: name.trim(),
        phone: phone ? String(phone).trim() : existing.phone,
        passwordHash,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? String(phone).trim() : null,
        passwordHash,
      },
    });
  }

  const token = signUserToken(user);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}));

app.post('/api/user/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required', 'INVALID_CREDENTIALS');
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const token = signUserToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}));

app.get('/api/user/me', requireUser, wrap(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) throw new HttpError(404, 'User not found', 'USER_NOT_FOUND');
  res.json({ user });
}));

app.get('/api/user/bookings', requireUser, wrap(async (req, res) => {
  const rows = await prisma.booking.findMany({
    where: {
      OR: [
        { userId: req.user.id },
        { user: { email: { equals: req.user.email, mode: 'insensitive' } } },
      ],
    },
    include: {
      user: true,
      ticketType: true,
      dailyCapacity: true,
      payments: true,
      issuedTickets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ bookings: rows.map(publicBooking) });
}));

// 5. Create Booking
app.post('/api/bookings', optionalUser, wrap(async (req, res) => {
  const { target = 'entry', refId, date, slotId, counts, visitor } = req.body || {};
  if (!date) throw new HttpError(422, 'Choose a visit date.', 'INVALID_DATE');
  if (!slotId) throw new HttpError(422, 'Choose a time slot.', 'INVALID_SLOT');
  if (!visitor?.name || !(visitor?.email || visitor?.phone)) {
    throw new HttpError(422, 'Name and contact (email or phone) are required.', 'INVALID_VISITOR');
  }

  const quantityByType = Object.entries(counts || {})
    .map(([ticketTypeId, quantity]) => ({ ticketTypeId: Number(ticketTypeId), quantity: Number(quantity) || 0 }))
    .filter((row) => row.quantity > 0);
  const totalVisitors = quantityByType.reduce((sum, r) => sum + r.quantity, 0);
  if (totalVisitors === 0) throw new HttpError(422, 'Select at least one visitor.', 'INVALID_COUNTS');

  const ticketTypes = await prisma.ticketType.findMany({ where: { isActive: true } });
  const items = quantityByType.map((row) => {
    const t = ticketTypes.find((entry) => entry.id === row.ticketTypeId);
    if (!t) throw new HttpError(422, 'Unknown ticket category', 'INVALID_TICKET_TYPE');
    return {
      ticketTypeId: t.id,
      name: t.name,
      nameHi: t.nameHi,
      quantity: row.quantity,
      unitPrice: t.price,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // Resolve or upsert visitor User in Neon DB
  let userId;
  if (req.user?.id) {
    userId = req.user.id;
  } else {
    const emailContact = (visitor.email || `${String(visitor.phone).replace(/\D/g, '')}@museumx.user`).toLowerCase().trim();
    const guestPassHash = await bcrypt.hash('museumx_guest', 8);
    const user = await prisma.user.upsert({
      where: { email: emailContact },
      update: { name: String(visitor.name).trim(), phone: visitor.phone ? String(visitor.phone).trim() : undefined },
      create: {
        name: String(visitor.name).trim(),
        email: emailContact,
        phone: visitor.phone ? String(visitor.phone).trim() : null,
        passwordHash: guestPassHash,
      },
    });
    userId = user.id;
  }

  // Daily capacity
  const visitDateUtc = new Date(`${date}T00:00:00.000Z`);
  const capacity = await prisma.dailyCapacity.upsert({
    where: { visitDate: visitDateUtc },
    update: {},
    create: {
      visitDate: visitDateUtc,
      capacity: 500,
      bookedCount: 0,
    },
  });

  // Details for target
  let refName = 'General entry';
  let refNameHi = 'सामान्य प्रवेश';
  if (target === 'exhibition' && refId) {
    const ex = await prisma.exhibition.findUnique({ where: { id: Number(refId) } });
    if (ex) {
      refName = ex.name;
      refNameHi = ex.nameHi;
    }
  } else if (target === 'show' && refId) {
    const sh = await prisma.show.findUnique({ where: { id: Number(refId) } });
    if (sh) {
      refName = sh.name;
      refNameHi = sh.nameHi;
    }
  }

  const primaryTicketTypeId = items[0]?.ticketTypeId || ticketTypes[0].id;
  const primaryUnitPrice = items[0]?.unitPrice || ticketTypes[0].price;
  const bookingCode = 'MX' + crypto.randomBytes(4).toString('hex').toUpperCase();

  const booking = await prisma.booking.create({
    data: {
      bookingCode,
      userId,
      ticketTypeId: primaryTicketTypeId,
      dailyCapacityId: capacity.id,
      quantity: totalVisitors,
      unitPrice: primaryUnitPrice,
      totalAmount,
      status: 'PENDING_PAYMENT',
      target,
      refId: refId ? Number(refId) : null,
      refName,
      refNameHi,
      date,
      slotId,
      itemsJson: JSON.stringify(items),
    },
    include: {
      user: true,
      ticketType: true,
      dailyCapacity: true,
      payments: true,
      issuedTickets: true,
    },
  });

  res.status(201).json(publicBooking(booking));
}));

// 6. Payments
app.post('/api/payments/order', wrap(async (req, res) => {
  const { bookingId } = req.body || {};
  const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
  if (!booking) throw new HttpError(404, 'Booking not found.', 'BOOKING_NOT_FOUND');
  if (booking.status === 'CONFIRMED') throw new HttpError(409, 'This booking is already paid.', 'ALREADY_PAID');

  res.json({
    orderId: `order_neon_${booking.id}_${Date.now().toString(36)}`,
    amount: booking.totalAmount,
    currency: 'INR',
    mock: false,
  });
}));

app.post('/api/payments/verify', wrap(async (req, res) => {
  const { bookingId, orderId, paymentId, outcome } = req.body || {};
  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
    include: { dailyCapacity: true },
  });
  if (!booking) throw new HttpError(404, 'Booking not found.', 'BOOKING_NOT_FOUND');

  const failed = outcome === 'failure' || String(paymentId || '').toLowerCase().startsWith('fail');
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      status: failed ? 'FAILED' : 'PAID',
      provider: 'SIMULATED',
      providerReference: paymentId || `pay_neon_${Date.now().toString(36)}`,
      paidAt: failed ? null : new Date(),
    },
  });

  if (failed) {
    throw new HttpError(402, 'The payment did not go through.', 'PAYMENT_FAILED');
  }

  const qrToken = `MUSEUMX:${booking.bookingCode}:${orderId || 'neon'}`;
  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
    }),
    prisma.dailyCapacity.update({
      where: { id: booking.dailyCapacityId },
      data: { bookedCount: { increment: booking.quantity } },
    }),
    prisma.issuedTicket.create({
      data: {
        bookingId: booking.id,
        qrToken,
        status: 'VALID',
      },
    }),
  ]);

  const updated = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
  });

  res.json({ booking: publicBooking(updated), payment });
}));

// 7. Booking Details & Lookup
app.get('/api/bookings/:idOrCode', wrap(async (req, res) => {
  const { idOrCode } = req.params;
  const { contact } = req.query;

  const isNumeric = /^\d+$/.test(idOrCode);
  const booking = await prisma.booking.findFirst({
    where: isNumeric
      ? { OR: [{ id: Number(idOrCode) }, { bookingCode: { equals: idOrCode, mode: 'insensitive' } }] }
      : { bookingCode: { equals: idOrCode, mode: 'insensitive' } },
    include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
  });

  if (!booking) throw new HttpError(404, 'Booking not found.', 'BOOKING_NOT_FOUND');

  if (contact) {
    const c = String(contact).toLowerCase().trim();
    const userEmail = (booking.user?.email || '').toLowerCase();
    const userPhone = (booking.user?.phone || '').toLowerCase();
    const matches = userEmail.includes(c) || userPhone.includes(c) || c.includes(userEmail);
    if (!matches) throw new HttpError(404, 'No booking matches that contact.', 'BOOKING_NOT_FOUND');
  }

  res.json(publicBooking(booking));
}));

// 8. Cancel Booking
app.post('/api/bookings/:idOrCode/cancel', wrap(async (req, res) => {
  const { idOrCode } = req.params;
  const { contact } = req.body || {};

  const isNumeric = /^\d+$/.test(idOrCode);
  const booking = await prisma.booking.findFirst({
    where: isNumeric
      ? { OR: [{ id: Number(idOrCode) }, { bookingCode: { equals: idOrCode, mode: 'insensitive' } }] }
      : { bookingCode: { equals: idOrCode, mode: 'insensitive' } },
    include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
  });

  if (!booking) throw new HttpError(404, 'Booking not found.', 'BOOKING_NOT_FOUND');

  if (contact) {
    const c = String(contact).toLowerCase().trim();
    const userEmail = (booking.user?.email || '').toLowerCase();
    const userPhone = (booking.user?.phone || '').toLowerCase();
    const matches = userEmail.includes(c) || userPhone.includes(c);
    if (!matches) throw new HttpError(404, 'Contact does not match booking.', 'CONTACT_MISMATCH');
  }

  if (booking.status === 'CANCELLED') {
    return res.json({ booking: publicBooking(booking), alreadyCancelled: true });
  }

  const usedTicket = booking.issuedTickets.find((t) => t.status === 'USED' || t.scannedAt);
  if (usedTicket) throw new HttpError(409, 'A used ticket cannot be cancelled.', 'BOOKING_USED');

  await prisma.$transaction([
    prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } }),
    prisma.dailyCapacity.update({
      where: { id: booking.dailyCapacityId },
      data: { bookedCount: { decrement: booking.quantity } },
    }),
  ]);

  const updated = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
  });

  res.json({ booking: publicBooking(updated) });
}));

// 9. QR Ticket Validation (Gate Staff)
app.post('/api/tickets/validate', wrap(async (req, res) => {
  const { code } = req.body || {};
  const normalised = String(code || '').trim();
  const codeKey = normalised.replace(/^MUSEUMX:/i, '').split(':')[0];

  const ticket = await prisma.issuedTicket.findFirst({
    where: {
      OR: [
        { qrToken: normalised },
        { booking: { bookingCode: { equals: codeKey, mode: 'insensitive' } } },
      ],
    },
    include: {
      booking: {
        include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
      },
    },
  });

  if (!ticket || ticket.booking.status !== 'CONFIRMED') {
    return res.json({ status: 'invalid', scannedAt: new Date().toISOString() });
  }

  if (ticket.status === 'USED' || ticket.scannedAt) {
    return res.json({
      status: 'used',
      scannedAt: new Date().toISOString(),
      firstScan: ticket.scannedAt?.toISOString(),
      booking: publicBooking(ticket.booking),
    });
  }

  const now = new Date();
  await prisma.issuedTicket.update({
    where: { id: ticket.id },
    data: { status: 'USED', scannedAt: now },
  });

  res.json({
    status: 'valid',
    scannedAt: now.toISOString(),
    booking: publicBooking(ticket.booking),
  });
}));

// 10. Admin Auth
app.post('/api/admin/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email and password required', 'INVALID_CREDENTIALS');

  const admin = await prisma.admin.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!admin) throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

  const token = signAdminToken(admin);
  res.json({ token, role: admin.role || 'admin', name: admin.name || 'Admin', email: admin.email });
}));

// 11. Admin Bookings & Payments
app.get('/api/admin/bookings', requireAdmin, wrap(async (req, res) => {
  const { search, status, page = 1, pageSize = 20 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Math.max(1, Number(pageSize) || 20));

  const where = {
    ...(status && status !== 'ALL' ? { status: String(status) } : {}),
    ...(search ? {
      OR: [
        { bookingCode: { contains: String(search), mode: 'insensitive' } },
        { user: { name: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ],
    } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * size,
      take: size,
    }),
  ]);

  res.json({
    items: rows.map(publicBooking),
    total,
    page: p,
    pageSize: size,
    totalPages: Math.ceil(total / size) || 1,
  });
}));

app.get('/api/admin/payments', requireAdmin, wrap(async (req, res) => {
  const { page = 1, pageSize = 20, status } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const size = Math.min(100, Math.max(1, Number(pageSize) || 20));

  const where = status && status !== 'ALL' ? { status: String(status) } : {};

  const [total, rows] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      include: { booking: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (p - 1) * size,
      take: size,
    }),
  ]);

  res.json({
    items: rows.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      bookingCode: r.booking?.bookingCode || `MX-${r.bookingId}`,
      amount: r.amount,
      status: r.status,
      provider: r.provider,
      providerReference: r.providerReference,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page: p,
    pageSize: size,
    totalPages: Math.ceil(total / size) || 1,
  });
}));

// 12. Admin Analytics
app.get('/api/admin/analytics/summary', requireAdmin, wrap(async (req, res) => {
  const [totalBookings, confirmedBookings, revenueAgg, todayBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const visitorsAgg = await prisma.booking.aggregate({
    _sum: { quantity: true },
    where: { status: 'CONFIRMED' },
  });

  res.json({
    bookings: totalBookings,
    confirmedBookings,
    visitors: visitorsAgg._sum.quantity || 0,
    revenue: revenueAgg._sum.amount || 0,
    todayBookings,
  });
}));

app.get('/api/admin/analytics/bookings-by-day', requireAdmin, wrap(async (req, res) => {
  const days = Math.max(1, Number(req.query.days) || 7);
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, quantity: true, totalAmount: true, status: true },
  });

  const map = {};
  for (let i = 0; i < days; i += 1) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { date: key, label: key.slice(5), count: 0, revenue: 0, visitors: 0 };
  }

  for (const b of bookings) {
    const key = b.createdAt.toISOString().slice(0, 10);
    if (map[key]) {
      map[key].count += 1;
      if (b.status === 'CONFIRMED') {
        map[key].revenue += b.totalAmount;
        map[key].visitors += b.quantity;
      }
    }
  }

  res.json(Object.values(map));
}));

app.get('/api/admin/analytics/peak-hours', requireAdmin, wrap(async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' },
    select: { slotLabel: true, quantity: true },
  });

  const map = {};
  for (const b of bookings) {
    const slot = b.slotLabel || 'General';
    map[slot] = (map[slot] || 0) + b.quantity;
  }

  const items = Object.entries(map).map(([slot, visitors]) => ({ slot, visitors }));
  items.sort((a, b) => b.visitors - a.visitors);
  res.json(items);
}));

app.get('/api/admin/analytics/popular', requireAdmin, wrap(async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' },
    select: { refName: true, quantity: true },
  });

  const map = {};
  for (const b of bookings) {
    const name = b.refName || 'General Entry';
    map[name] = (map[name] || 0) + b.quantity;
  }

  const items = Object.entries(map).map(([name, count]) => ({ name, count }));
  items.sort((a, b) => b.count - a.count);
  res.json(items);
}));

// 13. Admin Resource Management (CRUD)
app.get('/api/admin/exhibitions', requireAdmin, wrap(async (_req, res) => {
  res.json(await prisma.exhibition.findMany({ orderBy: { id: 'asc' } }));
}));
app.post('/api/admin/exhibitions', requireAdmin, wrap(async (req, res) => {
  const { name, nameHi, description, descriptionHi } = req.body || {};
  res.status(201).json(await prisma.exhibition.create({ data: { name, nameHi, description, descriptionHi } }));
}));
app.put('/api/admin/exhibitions/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params;
  const { name, nameHi, description, descriptionHi, isActive } = req.body || {};
  res.json(await prisma.exhibition.update({
    where: { id: Number(id) },
    data: { name, nameHi, description, descriptionHi, isActive },
  }));
}));
app.delete('/api/admin/exhibitions/:id', requireAdmin, wrap(async (req, res) => {
  await prisma.exhibition.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.status(204).end();
}));

app.get('/api/admin/shows', requireAdmin, wrap(async (_req, res) => {
  res.json(await prisma.show.findMany({ orderBy: { id: 'asc' } }));
}));
app.post('/api/admin/shows', requireAdmin, wrap(async (req, res) => {
  const { name, nameHi, description, descriptionHi, venue, venueHi } = req.body || {};
  res.status(201).json(await prisma.show.create({ data: { name, nameHi, description, descriptionHi, venue, venueHi } }));
}));
app.put('/api/admin/shows/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params;
  const { name, nameHi, description, descriptionHi, venue, venueHi, isActive } = req.body || {};
  res.json(await prisma.show.update({
    where: { id: Number(id) },
    data: { name, nameHi, description, descriptionHi, venue, venueHi, isActive },
  }));
}));
app.delete('/api/admin/shows/:id', requireAdmin, wrap(async (req, res) => {
  await prisma.show.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.status(204).end();
}));

app.get('/api/admin/slots', requireAdmin, wrap(async (_req, res) => {
  res.json(await prisma.slotTemplate.findMany({ orderBy: { id: 'asc' } }));
}));
app.post('/api/admin/slots', requireAdmin, wrap(async (req, res) => {
  const { type, refId, startTime, endTime, capacity } = req.body || {};
  res.status(201).json(await prisma.slotTemplate.create({
    data: { type, refId: refId ? Number(refId) : null, startTime, endTime, capacity: Number(capacity) || 100 },
  }));
}));
app.put('/api/admin/slots/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params;
  const { type, refId, startTime, endTime, capacity, isActive } = req.body || {};
  res.json(await prisma.slotTemplate.update({
    where: { id: Number(id) },
    data: { type, refId: refId ? Number(refId) : null, startTime, endTime, capacity: Number(capacity) || 100, isActive },
  }));
}));
app.delete('/api/admin/slots/:id', requireAdmin, wrap(async (req, res) => {
  await prisma.slotTemplate.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.status(204).end();
}));

app.get('/api/admin/ticket-types', requireAdmin, wrap(async (_req, res) => {
  res.json(await prisma.ticketType.findMany({ orderBy: { id: 'asc' } }));
}));
app.post('/api/admin/ticket-types', requireAdmin, wrap(async (req, res) => {
  const { name, nameHi, price, description, descriptionHi } = req.body || {};
  res.status(201).json(await prisma.ticketType.create({
    data: { name, nameHi, price: Number(price), description, descriptionHi },
  }));
}));
app.put('/api/admin/ticket-types/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params;
  const { name, nameHi, price, description, descriptionHi, isActive } = req.body || {};
  res.json(await prisma.ticketType.update({
    where: { id: Number(id) },
    data: { name, nameHi, price: Number(price), description, descriptionHi, isActive },
  }));
}));
app.delete('/api/admin/ticket-types/:id', requireAdmin, wrap(async (req, res) => {
  await prisma.ticketType.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
  res.status(204).end();
}));

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('[API Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MuseumX Neon DB Server running on http://localhost:${PORT}`);
});

