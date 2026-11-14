
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './db.js';
import { signAdminToken, requireAdmin, signUserToken, requireUser, optionalUser } from './auth.js';

var app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));


function publicBooking(b) {
  var items = [];
  if (b.itemsJson) {
    try {
      items = JSON.parse(b.itemsJson);
    } catch (e) {
      items = [];
    }
  }

  var qrToken = null;
  if (b.issuedTickets && b.issuedTickets.length > 0 && b.issuedTickets[0].qrToken) {
    qrToken = b.issuedTickets[0].qrToken;
  } else {
    if (b.status == 'CONFIRMED') {
      qrToken = 'MUSEUMX:' + b.bookingCode + ':order';
    }
  }

  var usedTicket = null;
  if (b.issuedTickets) {
    for (var i = 0; i < b.issuedTickets.length; i++) {
      if (b.issuedTickets[i].status == 'USED' || b.issuedTickets[i].scannedAt) {
        usedTicket = b.issuedTickets[i];
      }
    }
  }

  var name = '';
  var email = '';
  var phone = '';
  if (b.user) {
    name = b.user.name;
    email = b.user.email;
    phone = b.user.phone;
  }
  if (!name) name = b.visitorName || '';
  if (!email) email = b.visitorEmail || '';
  if (!phone) phone = b.visitorPhone || '';

  var refName = b.refName;
  if (!refName) {
    if (b.ticketType) {
      refName = b.ticketType.name;
    } else {
      refName = 'General entry';
    }
  }
  var refNameHi = b.refNameHi;
  if (!refNameHi) {
    if (b.ticketType) {
      refNameHi = b.ticketType.nameHi;
    } else {
      refNameHi = 'सामान्य प्रवेश';
    }
  }

  var date = b.date;
  if (!date) {
    if (b.dailyCapacity && b.dailyCapacity.visitDate) {
      date = b.dailyCapacity.visitDate.toISOString().slice(0, 10);
    }
  }

  var finalItems = items;
  if (items.length == 0) {
    var tName = 'General Entry';
    var tNameHi = 'सामान्य प्रवेश';
    if (b.ticketType) {
      tName = b.ticketType.name;
      tNameHi = b.ticketType.nameHi;
    }
    finalItems = [
      {
        ticketTypeId: b.ticketTypeId,
        name: tName,
        nameHi: tNameHi,
        quantity: b.quantity,
        unitPrice: b.unitPrice,
      },
    ];
  }

  var usedAt = null;
  if (usedTicket && usedTicket.scannedAt) {
    usedAt = usedTicket.scannedAt.toISOString();
  }

  return {
    id: b.id,
    bookingCode: b.bookingCode,
    qrToken: qrToken,
    status: b.status,
    visitor: {
      name: name,
      email: email,
      phone: phone,
    },
    target: b.target || 'entry',
    refId: b.refId,
    refName: refName,
    refNameHi: refNameHi,
    date: date,
    slotId: b.slotId,
    slotLabel: b.slotLabel || '10:00 – 11:00',
    items: finalItems,
    visitors: b.quantity,
    amount: b.totalAmount,
    createdAt: b.createdAt.toISOString(),
    usedAt: usedAt,
  };
}

// health check
app.get('/api/health', function (req, res) {
  res.json({ ok: true, database: 'neon-postgresql', time: new Date().toISOString() });
});

// ---------- PUBLIC STUFF ----------

app.get('/api/ticket-types', async function (req, res) {
  try {
    var types = await prisma.ticketType.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    res.json(types);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/exhibitions', async function (req, res) {
  try {
    var list = await prisma.exhibition.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/shows', async function (req, res) {
  try {
    var list = await prisma.show.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/slots', async function (req, res) {
  try {
    var date = req.query.date;
    var type = req.query.type;
    var refId = req.query.refId;

    if (!type) {
      type = 'entry';
    }
    if (!date) {
      res.status(422).json({ error: 'date query parameter is required', code: 'DATE_REQUIRED' });
      return;
    }

    var whereClause = { isActive: true, type: type };
    if (type == 'show') {
      if (refId) {
        whereClause.refId = Number(refId);
      }
    }

    var templates = await prisma.slotTemplate.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
    });

    var activeBookings = await prisma.booking.findMany({
      where: {
        date: String(date),
        target: String(type),
        status: { not: 'CANCELLED' },
      },
      select: { slotId: true, quantity: true },
    });

    var countsBySlot = {};
    for (var i = 0; i < activeBookings.length; i++) {
      var b = activeBookings[i];
      if (b.slotId) {
        if (countsBySlot[b.slotId]) {
          countsBySlot[b.slotId] = countsBySlot[b.slotId] + b.quantity;
        } else {
          countsBySlot[b.slotId] = b.quantity;
        }
      }
    }

    var slots = [];
    for (var j = 0; j < templates.length; j++) {
      var tpl = templates[j];
      var id = tpl.id + '@' + date;
      var booked = countsBySlot[id] || 0;
      var remaining = tpl.capacity - booked;
      if (remaining < 0) {
        remaining = 0;
      }
      var soldOut = false;
      if (remaining <= 0) {
        soldOut = true;
      }
      slots.push({
        id: id,
        templateId: tpl.id,
        date: date,
        startTime: tpl.startTime,
        endTime: tpl.endTime,
        capacity: tpl.capacity,
        booked: booked,
        remaining: remaining,
        soldOut: soldOut,
        type: tpl.type,
        refId: tpl.refId,
        label: tpl.startTime + ' – ' + tpl.endTime,
      });
    }

    res.json(slots);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ---------- USER STUFF ----------

app.post('/api/user/register', async function (req, res) {
  try {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var phone = req.body.phone;

    if (!name || typeof name != 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Full name is required (at least 2 characters)', code: 'INVALID_NAME' });
      return;
    }
    if (!email || typeof email != 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).json({ error: 'A valid email address is required', code: 'INVALID_EMAIL' });
      return;
    }
    if (!password || typeof password != 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters', code: 'INVALID_PASSWORD' });
      return;
    }

    var cleanEmail = email.trim().toLowerCase();
    var existing = await prisma.user.findUnique({ where: { email: cleanEmail } });

    var passwordHash = await bcrypt.hash(password, 10);
    var user;

    if (existing) {
      // guest accounts have this password
      var isGuest = await bcrypt.compare('museumx_guest', existing.passwordHash);
      if (isGuest == false) {
        res.status(409).json({ error: 'An account with this email already exists. Please log in.', code: 'USER_EXISTS' });
        return;
      }
      var newPhone = existing.phone;
      if (phone) {
        newPhone = String(phone).trim();
      }
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          phone: newPhone,
          passwordHash: passwordHash,
        },
      });
    } else {
      var phoneToSave = null;
      if (phone) {
        phoneToSave = String(phone).trim();
      }
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phoneToSave,
          passwordHash: passwordHash,
        },
      });
    }

    var token = signUserToken(user);
    res.status(201).json({
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/user/login', async function (req, res) {
  try {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var cleanEmail = String(email).trim().toLowerCase();
    var user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var token = signUserToken(user);
    res.json({
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/user/me', requireUser, async function (req, res) {
  try {
    var user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }
    res.json({ user: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/user/bookings', requireUser, async function (req, res) {
  try {
    var rows = await prisma.booking.findMany({
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

    var result = [];
    for (var i = 0; i < rows.length; i++) {
      result.push(publicBooking(rows[i]));
    }

    res.json({ bookings: result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ---------- BOOKING STUFF ----------

app.post('/api/bookings', requireUser, async function (req, res) {
  try {
    var target = req.body.target;
    var refId = req.body.refId;
    var date = req.body.date;
    var slotId = req.body.slotId;
    var counts = req.body.counts;
    var visitor = req.body.visitor;

    if (!target) {
      target = 'entry';
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'Please sign in to book tickets.', code: 'UNAUTHORIZED' });
      return;
    }
    if (!date) {
      res.status(422).json({ error: 'Choose a visit date.', code: 'INVALID_DATE' });
      return;
    }
    if (!slotId) {
      res.status(422).json({ error: 'Choose a time slot.', code: 'INVALID_SLOT' });
      return;
    }
    if (!visitor || !visitor.name || (!visitor.email && !visitor.phone)) {
      res.status(422).json({ error: 'Name and contact (email or phone) are required.', code: 'INVALID_VISITOR' });
      return;
    }

    // figure out how many of each ticket
    var quantityByType = [];
    var totalVisitors = 0;
    if (counts) {
      var keys = Object.keys(counts);
      for (var i = 0; i < keys.length; i++) {
        var qty = Number(counts[keys[i]]) || 0;
        if (qty > 0) {
          quantityByType.push({ ticketTypeId: Number(keys[i]), quantity: qty });
          totalVisitors = totalVisitors + qty;
        }
      }
    }
    if (totalVisitors == 0) {
      res.status(422).json({ error: 'Select at least one visitor.', code: 'INVALID_COUNTS' });
      return;
    }

    var ticketTypes = await prisma.ticketType.findMany({ where: { isActive: true } });

    var items = [];
    var totalAmount = 0;
    for (var k = 0; k < quantityByType.length; k++) {
      var found = null;
      for (var m = 0; m < ticketTypes.length; m++) {
        if (ticketTypes[m].id == quantityByType[k].ticketTypeId) {
          found = ticketTypes[m];
        }
      }
      if (!found) {
        res.status(422).json({ error: 'Unknown ticket category', code: 'INVALID_TICKET_TYPE' });
        return;
      }
      items.push({
        ticketTypeId: found.id,
        name: found.name,
        nameHi: found.nameHi,
        quantity: quantityByType[k].quantity,
        unitPrice: found.price,
      });
      totalAmount = totalAmount + quantityByType[k].quantity * found.price;
    }

    var userId = req.user.id;

    // make sure there is a capacity row for this day
    var visitDateUtc = new Date(date + 'T00:00:00.000Z');
    var capacity = await prisma.dailyCapacity.upsert({
      where: { visitDate: visitDateUtc },
      update: {},
      create: {
        visitDate: visitDateUtc,
        capacity: 500,
        bookedCount: 0,
      },
    });

    var refName = 'General entry';
    var refNameHi = 'सामान्य प्रवेश';
    if (target == 'exhibition' && refId) {
      var ex = await prisma.exhibition.findUnique({ where: { id: Number(refId) } });
      if (ex) {
        refName = ex.name;
        refNameHi = ex.nameHi;
      }
    } else if (target == 'show' && refId) {
      var sh = await prisma.show.findUnique({ where: { id: Number(refId) } });
      if (sh) {
        refName = sh.name;
        refNameHi = sh.nameHi;
      }
    }

    var primaryTicketTypeId = ticketTypes[0].id;
    var primaryUnitPrice = ticketTypes[0].price;
    if (items.length > 0) {
      primaryTicketTypeId = items[0].ticketTypeId;
      primaryUnitPrice = items[0].unitPrice;
    }

    var bookingCode = 'MX' + crypto.randomBytes(4).toString('hex').toUpperCase();

    var refIdToSave = null;
    if (refId) {
      refIdToSave = Number(refId);
    }

    var booking = await prisma.booking.create({
      data: {
        bookingCode: bookingCode,
        userId: userId,
        ticketTypeId: primaryTicketTypeId,
        dailyCapacityId: capacity.id,
        quantity: totalVisitors,
        unitPrice: primaryUnitPrice,
        totalAmount: totalAmount,
        status: 'PENDING_PAYMENT',
        target: target,
        refId: refIdToSave,
        refName: refName,
        refNameHi: refNameHi,
        date: date,
        slotId: slotId,
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ---------- PAYMENT STUFF ----------

app.post('/api/payments/order', async function (req, res) {
  try {
    var bookingId = req.body.bookingId;
    var booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
      return;
    }
    if (booking.status == 'CONFIRMED') {
      res.status(409).json({ error: 'This booking is already paid.', code: 'ALREADY_PAID' });
      return;
    }

    res.json({
      orderId: 'order_neon_' + booking.id + '_' + Date.now().toString(36),
      amount: booking.totalAmount,
      currency: 'INR',
      mock: false,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/payments/verify', async function (req, res) {
  try {
    var bookingId = req.body.bookingId;
    var orderId = req.body.orderId;
    var paymentId = req.body.paymentId;
    var outcome = req.body.outcome;

    var booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
      include: { dailyCapacity: true },
    });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
      return;
    }

    var failed = false;
    if (outcome == 'failure') {
      failed = true;
    }
    if (String(paymentId || '').toLowerCase().startsWith('fail')) {
      failed = true;
    }

    var paymentStatus = 'PAID';
    var paidAt = new Date();
    if (failed) {
      paymentStatus = 'FAILED';
      paidAt = null;
    }

    var ref = paymentId;
    if (!ref) {
      ref = 'pay_neon_' + Date.now().toString(36);
    }

    var payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        status: paymentStatus,
        provider: 'SIMULATED',
        providerReference: ref,
        paidAt: paidAt,
      },
    });

    if (failed) {
      res.status(402).json({ error: 'The payment did not go through.', code: 'PAYMENT_FAILED' });
      return;
    }

    var orderPart = orderId;
    if (!orderPart) {
      orderPart = 'neon';
    }
    var qrToken = 'MUSEUMX:' + booking.bookingCode + ':' + orderPart;

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
    });
    await prisma.dailyCapacity.update({
      where: { id: booking.dailyCapacityId },
      data: { bookedCount: { increment: booking.quantity } },
    });
    await prisma.issuedTicket.create({
      data: {
        bookingId: booking.id,
        qrToken: qrToken,
        status: 'VALID',
      },
    });

    var updated = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
    });

    res.json({ booking: publicBooking(updated), payment: payment });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// get one booking
app.get('/api/bookings/:idOrCode', async function (req, res) {
  try {
    var idOrCode = req.params.idOrCode;
    var contact = req.query.contact;

    var isNumeric = /^\d+$/.test(idOrCode);
    var whereThing;
    if (isNumeric) {
      whereThing = { OR: [{ id: Number(idOrCode) }, { bookingCode: { equals: idOrCode, mode: 'insensitive' } }] };
    } else {
      whereThing = { bookingCode: { equals: idOrCode, mode: 'insensitive' } };
    }

    var booking = await prisma.booking.findFirst({
      where: whereThing,
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
      return;
    }

    if (contact) {
      var c = String(contact).toLowerCase().trim();
      var userEmail = '';
      var userPhone = '';
      if (booking.user) {
        userEmail = (booking.user.email || '').toLowerCase();
        userPhone = (booking.user.phone || '').toLowerCase();
      }
      var matches = false;
      if (userEmail.includes(c) || userPhone.includes(c) || c.includes(userEmail)) {
        matches = true;
      }
      if (!matches) {
        res.status(404).json({ error: 'No booking matches that contact.', code: 'BOOKING_NOT_FOUND' });
        return;
      }
    }

    res.json(publicBooking(booking));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// cancel a booking
app.post('/api/bookings/:idOrCode/cancel', async function (req, res) {
  try {
    var idOrCode = req.params.idOrCode;
    var contact = req.body.contact;

    var isNumeric = /^\d+$/.test(idOrCode);
    var whereThing;
    if (isNumeric) {
      whereThing = { OR: [{ id: Number(idOrCode) }, { bookingCode: { equals: idOrCode, mode: 'insensitive' } }] };
    } else {
      whereThing = { bookingCode: { equals: idOrCode, mode: 'insensitive' } };
    }

    var booking = await prisma.booking.findFirst({
      where: whereThing,
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found.', code: 'BOOKING_NOT_FOUND' });
      return;
    }

    if (contact) {
      var c = String(contact).toLowerCase().trim();
      var userEmail = '';
      var userPhone = '';
      if (booking.user) {
        userEmail = (booking.user.email || '').toLowerCase();
        userPhone = (booking.user.phone || '').toLowerCase();
      }
      var matches = false;
      if (userEmail.includes(c) || userPhone.includes(c)) {
        matches = true;
      }
      if (!matches) {
        res.status(404).json({ error: 'Contact does not match booking.', code: 'CONTACT_MISMATCH' });
        return;
      }
    }

    if (booking.status == 'CANCELLED') {
      res.json({ booking: publicBooking(booking), alreadyCancelled: true });
      return;
    }

    var usedTicket = null;
    for (var i = 0; i < booking.issuedTickets.length; i++) {
      var t = booking.issuedTickets[i];
      if (t.status == 'USED' || t.scannedAt) {
        usedTicket = t;
      }
    }
    if (usedTicket) {
      res.status(409).json({ error: 'A used ticket cannot be cancelled.', code: 'BOOKING_USED' });
      return;
    }

    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
    await prisma.dailyCapacity.update({
      where: { id: booking.dailyCapacityId },
      data: { bookedCount: { decrement: booking.quantity } },
    });

    var updated = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
    });

    res.json({ booking: publicBooking(updated) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// scan the ticket at the gate
app.post('/api/tickets/validate', async function (req, res) {
  try {
    var code = req.body.code;
    var normalised = String(code || '').trim();
    var codeKey = normalised.replace(/^MUSEUMX:/i, '').split(':')[0];

    var ticket = await prisma.issuedTicket.findFirst({
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

    if (!ticket || ticket.booking.status != 'CONFIRMED') {
      res.json({ status: 'invalid', scannedAt: new Date().toISOString() });
      return;
    }

    if (ticket.status == 'USED' || ticket.scannedAt) {
      var firstScan = null;
      if (ticket.scannedAt) {
        firstScan = ticket.scannedAt.toISOString();
      }
      res.json({
        status: 'used',
        scannedAt: new Date().toISOString(),
        firstScan: firstScan,
        booking: publicBooking(ticket.booking),
      });
      return;
    }

    var now = new Date();
    await prisma.issuedTicket.update({
      where: { id: ticket.id },
      data: { status: 'USED', scannedAt: now },
    });

    res.json({
      status: 'valid',
      scannedAt: now.toISOString(),
      booking: publicBooking(ticket.booking),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ---------- ADMIN STUFF ----------

app.post('/api/admin/login', async function (req, res) {
  try {
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var admin = await prisma.admin.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!admin) {
      res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      res.status(401).json({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });
      return;
    }

    var token = signAdminToken(admin);
    res.json({ token: token, role: admin.role || 'admin', name: admin.name || 'Admin', email: admin.email });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/bookings', requireAdmin, async function (req, res) {
  try {
    var search = req.query.search;
    var status = req.query.status;
    var page = Number(req.query.page) || 1;
    var pageSize = Number(req.query.pageSize) || 20;

    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > 100) pageSize = 100;

    var where = {};
    if (status && status != 'ALL') {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { bookingCode: { contains: String(search), mode: 'insensitive' } },
        { user: { name: { contains: String(search), mode: 'insensitive' } } },
        { user: { email: { contains: String(search), mode: 'insensitive' } } },
      ];
    }

    var total = await prisma.booking.count({ where: where });
    var rows = await prisma.booking.findMany({
      where: where,
      include: { user: true, ticketType: true, dailyCapacity: true, payments: true, issuedTickets: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    var mappedRows = [];
    for (var i = 0; i < rows.length; i++) {
      mappedRows.push(publicBooking(rows[i]));
    }

    var totalPages = Math.ceil(total / pageSize);
    if (!totalPages) totalPages = 1;

    res.json({
      rows: mappedRows,
      items: mappedRows,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/payments', requireAdmin, async function (req, res) {
  try {
    var status = req.query.status;
    var page = Number(req.query.page) || 1;
    var pageSize = Number(req.query.pageSize) || 20;

    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 1;
    if (pageSize > 100) pageSize = 100;

    var where = {};
    if (status && status != 'ALL') {
      where.status = String(status);
    }

    var total = await prisma.payment.count({ where: where });
    var rows = await prisma.payment.findMany({
      where: where,
      include: { booking: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    var mappedRows = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var code = 'MX-' + r.bookingId;
      if (r.booking && r.booking.bookingCode) {
        code = r.booking.bookingCode;
      }
      mappedRows.push({
        id: r.id,
        bookingId: r.bookingId,
        bookingCode: code,
        amount: r.amount,
        status: r.status,
        provider: r.provider,
        providerReference: r.providerReference,
        createdAt: r.createdAt.toISOString(),
      });
    }

    var totalPages = Math.ceil(total / pageSize);
    if (!totalPages) totalPages = 1;

    res.json({
      rows: mappedRows,
      items: mappedRows,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/analytics/summary', requireAdmin, async function (req, res) {
  try {
    var totalBookings = await prisma.booking.count();
    var confirmedBookings = await prisma.booking.count({ where: { status: 'CONFIRMED' } });
    var revenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });

    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    var todayBookings = await prisma.booking.count({
      where: { createdAt: { gte: startOfToday } },
    });

    var visitorsAgg = await prisma.booking.aggregate({
      _sum: { quantity: true },
      where: { status: 'CONFIRMED' },
    });

    res.json({
      bookings: totalBookings,
      confirmedBookings: confirmedBookings,
      visitors: visitorsAgg._sum.quantity || 0,
      revenue: revenueAgg._sum.amount || 0,
      today: todayBookings,
      todayBookings: todayBookings,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/analytics/bookings-by-day', requireAdmin, async function (req, res) {
  try {
    var days = Number(req.query.days) || 7;
    if (days < 1) days = 1;

    var since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    var bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, quantity: true, totalAmount: true, status: true },
    });

    var map = {};
    for (var i = 0; i < days; i++) {
      var d = new Date(since);
      d.setDate(d.getDate() + i);
      var key = d.toISOString().slice(0, 10);
      map[key] = { date: key, label: key.slice(5), bookings: 0, count: 0, revenue: 0, visitors: 0 };
    }

    for (var j = 0; j < bookings.length; j++) {
      var b = bookings[j];
      var bKey = b.createdAt.toISOString().slice(0, 10);
      if (map[bKey]) {
        map[bKey].count = map[bKey].count + 1;
        map[bKey].bookings = map[bKey].bookings + 1;
        if (b.status == 'CONFIRMED') {
          map[bKey].revenue = map[bKey].revenue + b.totalAmount;
          map[bKey].visitors = map[bKey].visitors + b.quantity;
        }
      }
    }

    res.json(Object.values(map));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/analytics/peak-hours', requireAdmin, async function (req, res) {
  try {
    var bookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: { slotLabel: true, quantity: true },
    });

    var map = {};
    for (var i = 0; i < bookings.length; i++) {
      var slot = bookings[i].slotLabel || 'General';
      if (map[slot]) {
        map[slot] = map[slot] + bookings[i].quantity;
      } else {
        map[slot] = bookings[i].quantity;
      }
    }

    var items = [];
    var slotNames = Object.keys(map);
    for (var j = 0; j < slotNames.length; j++) {
      items.push({ hour: slotNames[j], slot: slotNames[j], visitors: map[slotNames[j]] });
    }
    items.sort(function (a, b) {
      return b.visitors - a.visitors;
    });
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.get('/api/admin/analytics/popular', requireAdmin, async function (req, res) {
  try {
    var bookings = await prisma.booking.findMany({
      where: { status: 'CONFIRMED' },
      select: { refName: true, quantity: true, target: true },
    });

    var map = {};
    for (var i = 0; i < bookings.length; i++) {
      var name = bookings[i].refName || 'General Entry';
      var target = bookings[i].target || 'entry';
      if (!map[name]) {
        map[name] = { count: 0, target: target };
      }
      map[name].count = map[name].count + bookings[i].quantity;
    }

    var items = [];
    var names = Object.keys(map);
    for (var j = 0; j < names.length; j++) {
      var data = map[names[j]];
      items.push({
        name: names[j],
        nameHi: names[j],
        type: data.target || 'entry',
        count: data.count,
        visitors: data.count,
      });
    }
    items.sort(function (a, b) {
      return b.count - a.count;
    });
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ----- admin exhibitions -----
app.get('/api/admin/exhibitions', requireAdmin, async function (req, res) {
  try {
    var list = await prisma.exhibition.findMany({ orderBy: { id: 'asc' } });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/admin/exhibitions', requireAdmin, async function (req, res) {
  try {
    var created = await prisma.exhibition.create({
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.put('/api/admin/exhibitions/:id', requireAdmin, async function (req, res) {
  try {
    var updated = await prisma.exhibition.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
        isActive: req.body.isActive,
      },
    });
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.delete('/api/admin/exhibitions/:id', requireAdmin, async function (req, res) {
  try {
    // dont actually delete, just hide it
    await prisma.exhibition.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ----- admin shows -----
app.get('/api/admin/shows', requireAdmin, async function (req, res) {
  try {
    var list = await prisma.show.findMany({ orderBy: { id: 'asc' } });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/admin/shows', requireAdmin, async function (req, res) {
  try {
    var created = await prisma.show.create({
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
        venue: req.body.venue,
        venueHi: req.body.venueHi,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.put('/api/admin/shows/:id', requireAdmin, async function (req, res) {
  try {
    var updated = await prisma.show.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
        venue: req.body.venue,
        venueHi: req.body.venueHi,
        isActive: req.body.isActive,
      },
    });
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.delete('/api/admin/shows/:id', requireAdmin, async function (req, res) {
  try {
    await prisma.show.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ----- admin slots -----
app.get('/api/admin/slots', requireAdmin, async function (req, res) {
  try {
    var list = await prisma.slotTemplate.findMany({ orderBy: { id: 'asc' } });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/admin/slots', requireAdmin, async function (req, res) {
  try {
    var refId = null;
    if (req.body.refId) {
      refId = Number(req.body.refId);
    }
    var created = await prisma.slotTemplate.create({
      data: {
        type: req.body.type,
        refId: refId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        capacity: Number(req.body.capacity) || 100,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.put('/api/admin/slots/:id', requireAdmin, async function (req, res) {
  try {
    var refId = null;
    if (req.body.refId) {
      refId = Number(req.body.refId);
    }
    var updated = await prisma.slotTemplate.update({
      where: { id: Number(req.params.id) },
      data: {
        type: req.body.type,
        refId: refId,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        capacity: Number(req.body.capacity) || 100,
        isActive: req.body.isActive,
      },
    });
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.delete('/api/admin/slots/:id', requireAdmin, async function (req, res) {
  try {
    await prisma.slotTemplate.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// ----- admin ticket types -----
app.get('/api/admin/ticket-types', requireAdmin, async function (req, res) {
  try {
    var list = await prisma.ticketType.findMany({ orderBy: { id: 'asc' } });
    res.json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.post('/api/admin/ticket-types', requireAdmin, async function (req, res) {
  try {
    var created = await prisma.ticketType.create({
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        price: Number(req.body.price),
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
      },
    });
    res.status(201).json(created);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.put('/api/admin/ticket-types/:id', requireAdmin, async function (req, res) {
  try {
    var updated = await prisma.ticketType.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        nameHi: req.body.nameHi,
        price: Number(req.body.price),
        description: req.body.description,
        descriptionHi: req.body.descriptionHi,
        isActive: req.body.isActive,
      },
    });
    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

app.delete('/api/admin/ticket-types/:id', requireAdmin, async function (req, res) {
  try {
    await prisma.ticketType.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    res.status(204).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong', code: 'SERVER_ERROR' });
  }
});

// start the server
var PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
  console.log('MuseumX Neon DB Server running on http://localhost:' + PORT);
});
