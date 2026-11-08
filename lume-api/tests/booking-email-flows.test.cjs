const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const emails = [];
const whatsapp = [];
const paymentRecords = [];
const artistUpdates = [];
let current;
let duplicate;
let validSignature;
let validToken;
let failPaymentRecord;
let failUpdate;
let selectedService;
let validOrder;
const orders = [];
const venue = { address: 'Flat 4, Hill Road, Mumbai - 400050', latitude: 19.05, longitude: 72.83 };
const date = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
const inbox = [];
const profile = { id: 'artist-profile', userId: 'artist-user', isVerified: true, occasionPrice: 5000 };
const initial = () => ({
  id: 'booking_abc123', clientId: 'client-user', artistId: profile.id, status: 'PENDING',
  date: new Date(date), time: '10:00', endTime: null, serviceId: null, createdAt: new Date(),
  priceType: 'OCCASION', totalPaid: 5000, notes: null, ...venue,
  cancelReason: null, advancePaid: 0, remainingAmount: 0,
  client: { id: 'client-user', name: 'Rhea Shah', phone: '919876543210' },
  artist: { user: { id: 'artist-user', name: 'Mira Kapoor', phone: '919999999999' } },
});
const db = {
  $queryRaw: async () => [profile],
  blockedDate: { findUnique: async () => null },
  availability: { findUnique: async () => null },
  defaultSchedule: { findUnique: async () => ({ timeSlots: ['09:00', '10:00', '11:00'].map(time => ({ time, available: true })) }) },
  service: { findFirst: async ({ where }) => selectedService?.id === where.id && selectedService?.artistId === where.artistId && selectedService?.isActive ? selectedService : null },
  artistProfile: { findUniqueOrThrow: async () => profile, findUnique: async () => profile, update: async ({ data }) => { artistUpdates.push(data); return profile; } },
  user: { update: async () => ({}) },
  booking: {
    findMany: async () => duplicate ? [current] : [],
    findUnique: async () => current && { ...current },
    findFirst: async ({ where }) => {
      if (where.createdAt) return duplicate ? { ...current } : null;
      return current && { ...current };
    },
    create: async ({ data }) => { current = { ...initial(), ...data }; return { ...current }; },
    update: async ({ data }) => {
      if (failUpdate) throw new Error('Write failed');
      current = { ...current, ...data };
      return { ...current };
    },
  },
  paymentRecord: { findFirst: async ({ where }) => paymentRecords.find(record => where.OR.some(condition => Object.entries(condition).every(([key, value]) => record[key] === value))) || null,
    create: async ({ data }) => {
    if (failPaymentRecord) throw new Error('Payment record failed');
    const record = { id: `payment-record-${paymentRecords.length + 1}`, ...data };
    paymentRecords.push(record); return record;
  } },
  $transaction: async callback => {
    const snapshot = { ...current }; const records = [...paymentRecords];
    try { return await callback(db); }
    catch (error) { current = snapshot; paymentRecords.splice(0, paymentRecords.length, ...records); throw error; }
  },
  notification: { create: async ({ data }) => { inbox.push(data); return data; },
    createMany: async ({ data }) => { inbox.push(...data); return { count: data.length }; } },
};
function stub(path, exports) {
  require.cache[require.resolve(path)] = { exports: { __esModule: true, ...exports } };
}
stub('../dist/lib/prisma', { default: db, prisma: db });
stub('../dist/modules/email/booking-email.service', {
  queueBookingEmail: (booking, event) => emails.push({ booking: { ...booking }, event }),
});
stub('../dist/modules/whatsapp/whatsapp.service', {
  notifyBookingCreated: async id => { whatsapp.push(['created', id]); },
  notifyBookingStatusChanged: async (...args) => { whatsapp.push(['status', ...args]); },
  sendWhatsAppTextMessage: async (...args) => { whatsapp.push(['text', ...args]); },
  normalizePhoneNumber: phone => phone,
  verifyBookingActionToken: () => validToken,
});
stub('../dist/modules/payments/payments.service', {
  verifySignature: () => validSignature, verifyBookingOrder: async () => validOrder,
  createOrder: async (amount, receipt, notes) => { orders.push({ amount, receipt, notes }); return { id: 'order-1', amount: Math.round(amount * 100), receipt, notes }; },
});
stub('../dist/modules/payments/razorpay-route.service', { isRouteEnabled: () => false });
const bookings = require('../dist/modules/bookings/bookings.service');
const payments = require('../dist/modules/payments/payments.controller');
const wa = require('../dist/modules/whatsapp/whatsapp.controller');
function response() {
  return { statusCode: 200, body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
}
beforeEach(() => {
  inbox.length = 0; emails.length = 0; whatsapp.length = 0; current = initial(); duplicate = false;
  paymentRecords.length = 0; artistUpdates.length = 0;
  validOrder = true; orders.length = 0;
  validSignature = true; validToken = true; failPaymentRecord = false; failUpdate = false;
  selectedService = null; profile.isTakingBookings = true; profile.occasionPrice = 5000;
  process.env.RAZORPAY_KEY_ID = 'unit-test-real-signature-path';
});

test('new request emits email and preserves the existing WhatsApp trigger', async () => {
  await bookings.createBooking('client-user', { artistId: profile.id, ...venue, date, time: '10:00 AM', priceType: 'OCCASION' });
  assert.deepEqual(emails.map(m => m.event), ['REQUESTED']);
  assert.equal(emails[0].booking.status, 'PENDING');
  assert.deepEqual(whatsapp, [['created', current.id]]);
  assert.deepEqual(inbox.map(n => n.userId).sort(), ['artist-user', 'client-user']);
});

test('duplicate booking creation does not emit another request email', async () => {
  duplicate = true;
  await bookings.createBooking('client-user', { artistId: profile.id, ...venue, date, time: '10:00 AM', priceType: 'OCCASION' });
  assert.equal(emails.length, 0);
  assert.equal(inbox.length, 0);
  assert.equal(whatsapp.length, 0);
});

test('selected service price takes precedence over the occasion package price', async () => {
  selectedService = { id: 'service-1', artistId: profile.id, isActive: true, price: 2500 };
  const booking = await bookings.createBooking('client-user', { artistId: profile.id, serviceId: 'service-1', ...venue, date, time: '09:00', priceType: 'OCCASION' });
  assert.equal(booking.totalPaid, 2500);
  assert.equal(booking.serviceId, selectedService.id);
});

test('unavailable services cannot silently use the package price', async () => {
  for (const service of [null,
    { id: 'service-1', artistId: 'other-artist', isActive: true, price: 2500 },
    { id: 'service-1', artistId: profile.id, isActive: false, price: 2500 },
  ]) {
    selectedService = service;
    await assert.rejects(bookings.createBooking('client-user', { artistId: profile.id, serviceId: 'service-1', ...venue, date, time: '09:00', priceType: 'OCCASION' }), /Service is not available/);
  }
  assert.equal(emails.length, 0);
});

test('paused artists and options without a configured price cannot create bookings', async () => {
  const input = { artistId: profile.id, ...venue, date, time: '09:00', priceType: 'OCCASION' };
  profile.isTakingBookings = false;
  await assert.rejects(bookings.createBooking('client-user', input), /not taking bookings/);
  profile.isTakingBookings = true; profile.occasionPrice = 0;
  await assert.rejects(bookings.createBooking('client-user', input), /no valid price/);
  assert.equal(emails.length, 0);
});

test('dashboard accept, pending decline and later cancellation have distinct emails', async () => {
  await bookings.updateBookingStatus('artist-user', current.id, 'ACCEPTED');
  await bookings.updateBookingStatus('artist-user', current.id, 'ACCEPTED');
  assert.deepEqual(emails.map(m => m.event), ['ACCEPTED']);
  await bookings.updateBookingStatus('artist-user', current.id, 'CANCELLED', 'Plans changed');
  assert.equal(emails.at(-1).event, 'CANCELLED');
  current = initial();
  await bookings.updateBookingStatus('artist-user', current.id, 'CANCELLED', 'Unavailable');
  assert.equal(emails.at(-1).event, 'DECLINED');
  assert.equal(emails.at(-1).booking.cancelReason, 'Unavailable');
  assert.equal(whatsapp.filter(call => call[0] === 'status').length, 3);
});

test('client cancellation is never described as the artist declining', async () => {
  await bookings.cancelBookingAsClient('client-user', current.id, 'Plans changed');
  assert.equal(emails[0].event, 'CANCELLED');
  assert.equal(emails[0].booking.cancelReason, 'Plans changed');
  assert.deepEqual(whatsapp, [['status', current.id, 'CANCELLED', 'Plans changed']]);
  await assert.rejects(bookings.cancelBookingAsClient('client-user', current.id), /Cannot cancel/);
  assert.equal(emails.length, 1);
});

test('an accepted booking can still be cancelled by its client before payment', async () => {
  current.status = 'ACCEPTED';
  await bookings.cancelBookingAsClient('client-user', current.id, 'Plans changed');
  assert.equal(current.status, 'CANCELLED');
  assert.equal(emails[0].event, 'CANCELLED');
});

test('repeating completion does not count the booking or earnings twice', async () => {
  current.status = 'CONFIRMED';
  await bookings.updateBookingStatus('artist-user', current.id, 'COMPLETED');
  await bookings.updateBookingStatus('artist-user', current.id, 'COMPLETED');
  assert.equal(artistUpdates.length, 1);
  assert.equal(artistUpdates[0].totalEarnings.increment, 5000);
});

test('a failed booking write does not trigger a success email', async () => {
  failUpdate = true;
  await assert.rejects(bookings.updateBookingStatus('artist-user', current.id, 'ACCEPTED'), /Write failed/);
  assert.equal(emails.length, 0);
});

for (const action of ['accept', 'deny']) {
  test(`WhatsApp quick-link ${action} adds an email and preserves WhatsApp status notification`, async () => {
    const res = response();
    await wa.handleOneClickWhatsAppAction({ query: { id: current.id, action, token: 'test-token' } }, res);
    assert.equal(emails[0].event, action === 'accept' ? 'ACCEPTED' : 'DECLINED');
    assert.equal(res.statusCode, 200);
    assert.equal(whatsapp.filter(call => call[0] === 'status').length, 1);
    await wa.handleOneClickWhatsAppAction({ query: { id: current.id, action, token: 'test-token' } }, response());
    assert.equal(emails.length, 1);
  });
  test(`WhatsApp interactive ${action} adds an email while retaining existing replies`, async () => {
    const id = `${action === 'accept' ? 'ACCEPT' : 'DENY'}_BOOKING_${current.id}`;
    await wa.handleWebhookEvent({ body: { object: 'whatsapp_business_account', entry: [{ changes: [{ value: {
      messages: [{ from: '919999999999', type: 'interactive', interactive: { button_reply: { id } } }],
    } }] }] } }, response());
    assert.equal(emails[0].event, action === 'accept' ? 'ACCEPTED' : 'DECLINED');
    assert.equal(whatsapp.filter(call => call[0] === 'text').length, 1);
    assert.equal(whatsapp.filter(call => call[0] === 'status').length, 1);
  });
}

test('invalid WhatsApp token never changes the booking or prepares emails', async () => {
  validToken = false;
  const res = response();
  await wa.handleOneClickWhatsAppAction({ query: { id: current.id, action: 'accept', token: 'bad-token' } }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(current.status, 'PENDING');
  assert.equal(emails.length, 0);
});

const paymentBody = paymentType => ({ bookingId: current.id, paymentType,
  razorpay_order_id: 'test-order', razorpay_payment_id: 'test-payment', razorpay_signature: 'test-signature',
});
const paymentRequest = body => ({ body, user: { userId: 'client-user', role: 'CLIENT' } });
for (const paymentType of ['ADVANCE', 'FULL', 'REMAINING']) {
  test(`${paymentType} payment generates the correct receipt after verification`, async () => {
    current.status = paymentType === 'REMAINING' ? 'PARTIALLY_PAID' : 'ACCEPTED';
    if (paymentType === 'REMAINING') { current.advancePaid = 2950; current.remainingAmount = 2950; }
    const res = response();
    await payments.verifyBookingPayment(paymentRequest(paymentBody(paymentType)), res, error => { throw error; });
    assert.equal(res.body.success, true);
    assert.equal(emails[0].event, paymentType === 'ADVANCE' ? 'ADVANCE_PAID' : 'CONFIRMED');
    assert.equal(emails[0].booking.advancePaid, paymentType === 'ADVANCE' ? 2950 : 5900);
    assert.equal(emails[0].booking.remainingAmount, paymentType === 'ADVANCE' ? 2950 : 0);
    await payments.verifyBookingPayment(paymentRequest(paymentBody(paymentType)), response(), error => { throw error; });
    assert.equal(emails.length, 1);
    assert.equal(paymentRecords.length, 1);
    assert.deepEqual(inbox.map(n => n.userId).sort(), ['artist-user', 'client-user']);
  });
}

test('invalid payment signature cannot generate a confirmation email', async () => {
  validSignature = false;
  const res = response();
  await payments.verifyBookingPayment({ body: paymentBody('FULL') }, res, error => { throw error; });
  assert.equal(res.statusCode, 400);
  assert.equal(emails.length, 0);
});

test('a failed payment record does not emit a successful receipt', async () => {
  failPaymentRecord = true;
  let failure;
  const original = console.error;
  console.error = () => {};
  try {
    current.status = 'ACCEPTED';
    await payments.verifyBookingPayment(paymentRequest(paymentBody('FULL')), response(), error => { failure = error; });
  } finally { console.error = original; }
  assert.match(failure.message, /Payment record failed/);
  assert.equal(emails.length, 0);
  assert.equal(current.status, 'ACCEPTED');
  assert.equal(paymentRecords.length, 0);
});

test('a failed booking write rolls back its payment record', async () => {
  current.status = 'ACCEPTED'; failUpdate = true;
  let failure;
  const original = console.error; console.error = () => {};
  try { await payments.verifyBookingPayment(paymentRequest(paymentBody('FULL')), response(), error => { failure = error; }); }
  finally { console.error = original; }
  assert.match(failure.message, /Write failed/);
  assert.equal(paymentRecords.length, 0);
  assert.equal(current.status, 'ACCEPTED');
  assert.equal(emails.length, 0);
});

test('all booking payment routes reject a different client without changing the booking', async () => {
  current.status = 'ACCEPTED';
  for (const handler of [payments.payBooking, payments.createBookingOrder, payments.verifyBookingPayment, payments.verifyPayment]) {
    const res = response();
    await handler({ body: paymentBody('FULL'), user: { userId: 'another-client', role: 'CLIENT' } }, res, error => { throw error; });
    assert.equal(res.statusCode, 403);
    assert.equal(current.status, 'ACCEPTED');
  }
  assert.equal(paymentRecords.length, 0); assert.equal(emails.length, 0); assert.equal(orders.length, 0);
});

test('orders use short unique receipts and carry server-owned booking metadata', async () => {
  current.id = 'cm123456789012345678901234'; current.status = 'ACCEPTED';
  for (const handler of [payments.payBooking, payments.createBookingOrder]) {
    const res = response();
    await handler(paymentRequest(paymentBody('FULL')), res, error => { throw error; });
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.receipt.length <= 40);
    assert.equal(res.body.data.notes.bookingId, current.id);
    assert.equal(res.body.data.notes.clientId, current.clientId);
  }
  assert.notEqual(orders[0].receipt, orders[1].receipt);
});

test('a valid signature for an unrelated or unpaid order cannot confirm a booking', async () => {
  current.status = 'ACCEPTED'; validOrder = false;
  for (const handler of [payments.verifyBookingPayment, payments.verifyPayment]) {
    const res = response();
    await handler(paymentRequest(paymentBody('FULL')), res, error => { throw error; });
    assert.equal(res.statusCode, 400);
  }
  assert.equal(current.status, 'ACCEPTED'); assert.equal(paymentRecords.length, 0); assert.equal(emails.length, 0);
});

test('payments cannot move a cancelled booking back to a paid state', async () => {
  current.status = 'CANCELLED';
  let failure;
  const original = console.error; console.error = () => {};
  try { await payments.verifyBookingPayment(paymentRequest(paymentBody('FULL')), response(), error => { failure = error; }); }
  finally { console.error = original; }
  assert.equal(failure.statusCode, 400);
  assert.equal(current.status, 'CANCELLED'); assert.equal(paymentRecords.length, 0);
});

test('the same order or payment cannot be reused with a different payment type', async () => {
  current.status = 'ACCEPTED';
  await payments.verifyBookingPayment(paymentRequest(paymentBody('ADVANCE')), response(), error => { throw error; });
  let failure;
  const original = console.error; console.error = () => {};
  try { await payments.verifyBookingPayment(paymentRequest(paymentBody('REMAINING')), response(), error => { failure = error; }); }
  finally { console.error = original; }
  assert.equal(failure.statusCode, 409); assert.equal(paymentRecords.length, 1);
  assert.equal(current.status, 'PARTIALLY_PAID');
});

test('legacy payment verification emits confirmation only on a status transition', async () => {
  current.status = 'ACCEPTED';
  await payments.verifyPayment(paymentRequest(paymentBody('FULL')), response(), error => { throw error; });
  await payments.verifyPayment(paymentRequest(paymentBody('FULL')), response(), error => { throw error; });
  assert.deepEqual(emails.map(m => m.event), ['CONFIRMED']);
});

test('legacy verification cannot restore a cancelled booking', async () => {
  current.status = 'CANCELLED';
  const res = response();
  await payments.verifyPayment(paymentRequest(paymentBody('FULL')), res, error => { throw error; });
  assert.equal(res.statusCode, 400); assert.equal(current.status, 'CANCELLED'); assert.equal(emails.length, 0);
});

test('invalid order amounts and oversized receipts return validation errors', async () => {
  for (const body of [{ amount: '5000' }, { amount: -1 }, { amount: Infinity }, { amount: 100, receiptId: 'x'.repeat(41) }]) {
    const res = response();
    await payments.createPaymentOrder(paymentRequest(body), res, error => { throw error; });
    assert.equal(res.statusCode, 400);
  }
  assert.equal(orders.length, 0);
});

test('a second client cannot reserve an overlapping multi-hour session', async () => {
  duplicate = true;
  current.time = '09:00 AM, 10:00 AM';
  await assert.rejects(bookings.createBooking('other-client', {
    ...venue, date, artistId: profile.id, time: '10:00', priceType: 'OCCASION',
  }), error => error.statusCode === 409);
  assert.equal(inbox.length, 0);
  assert.equal(emails.length, 0);
});
