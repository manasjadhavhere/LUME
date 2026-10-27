const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const emails = [];
const whatsapp = [];
let current;
let duplicate;
let validSignature;
let validToken;
let failPaymentRecord;
let failUpdate;
const profile = { id: 'artist-profile', isVerified: true, occasionPrice: 5000 };
const initial = () => ({
  id: 'booking_abc123', clientId: 'client-user', artistId: profile.id, status: 'PENDING',
  date: new Date('2026-11-08T00:00:00Z'), time: '10:00 AM', endTime: null,
  priceType: 'OCCASION', totalPaid: 5000, notes: null, address: 'Test venue',
  cancelReason: null, advancePaid: 0, remainingAmount: 0,
  client: { id: 'client-user', name: 'Rhea Shah', phone: '919876543210' },
  artist: { user: { id: 'artist-user', name: 'Mira Kapoor', phone: '919999999999' } },
});
const db = {
  artistProfile: { findUnique: async () => profile, update: async () => profile },
  user: { update: async () => ({}) },
  booking: {
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
  paymentRecord: { create: async () => {
    if (failPaymentRecord) throw new Error('Payment record failed');
    return { id: 'payment-record' };
  } },
  notification: { create: async () => ({}) },
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
stub('../dist/modules/payments/payments.service', { verifySignature: () => validSignature });
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
  emails.length = 0; whatsapp.length = 0; current = initial(); duplicate = false;
  validSignature = true; validToken = true; failPaymentRecord = false; failUpdate = false;
  process.env.RAZORPAY_KEY_ID = 'unit-test-real-signature-path';
});

test('new request emits email and preserves the existing WhatsApp trigger', async () => {
  await bookings.createBooking('client-user', { artistId: profile.id, date: '2026-11-08', time: '10:00 AM', priceType: 'OCCASION' });
  assert.deepEqual(emails.map(m => m.event), ['REQUESTED']);
  assert.equal(emails[0].booking.status, 'PENDING');
  assert.deepEqual(whatsapp, [['created', current.id]]);
});

test('duplicate booking creation does not emit another request email', async () => {
  duplicate = true;
  await bookings.createBooking('client-user', { artistId: profile.id, date: '2026-11-08', time: '10:00 AM', priceType: 'OCCASION' });
  assert.equal(emails.length, 0);
  assert.equal(whatsapp.length, 0);
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
  assert.equal(whatsapp.filter(call => call[0] === 'status').length, 4);
});

test('client cancellation is never described as the artist declining', async () => {
  await bookings.cancelBookingAsClient('client-user', current.id, 'Plans changed');
  assert.equal(emails[0].event, 'CANCELLED');
  assert.equal(emails[0].booking.cancelReason, 'Plans changed');
  assert.deepEqual(whatsapp, [['status', current.id, 'CANCELLED', 'Plans changed']]);
  await assert.rejects(bookings.cancelBookingAsClient('client-user', current.id), /Cannot cancel/);
  assert.equal(emails.length, 1);
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
for (const paymentType of ['ADVANCE', 'FULL', 'REMAINING']) {
  test(`${paymentType} payment generates the correct receipt after verification`, async () => {
    current.status = paymentType === 'REMAINING' ? 'PARTIALLY_PAID' : 'ACCEPTED';
    if (paymentType === 'REMAINING') { current.advancePaid = 2950; current.remainingAmount = 2950; }
    const res = response();
    await payments.verifyBookingPayment({ body: paymentBody(paymentType) }, res, error => { throw error; });
    assert.equal(res.body.success, true);
    assert.equal(emails[0].event, paymentType === 'ADVANCE' ? 'ADVANCE_PAID' : 'CONFIRMED');
    assert.equal(emails[0].booking.advancePaid, paymentType === 'ADVANCE' ? 2950 : 5900);
    assert.equal(emails[0].booking.remainingAmount, paymentType === 'ADVANCE' ? 2950 : 0);
    await payments.verifyBookingPayment({ body: paymentBody(paymentType) }, response(), error => { throw error; });
    assert.equal(emails.length, 1);
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
    await payments.verifyBookingPayment({ body: paymentBody('FULL') }, response(), error => { failure = error; });
  } finally { console.error = original; }
  assert.match(failure.message, /Payment record failed/);
  assert.equal(emails.length, 0);
});

test('legacy payment verification emits confirmation only on a status transition', async () => {
  await payments.verifyPayment({ body: paymentBody('FULL') }, response(), error => { throw error; });
  await payments.verifyPayment({ body: paymentBody('FULL') }, response(), error => { throw error; });
  assert.deepEqual(emails.map(m => m.event), ['CONFIRMED']);
});
