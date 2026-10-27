const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

for (const key of ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) {
  process.env[key] = 'unit-test-placeholder';
}
process.env.CLIENT_URL = 'https://lume.example,https://www.lume.example';
process.env.EMAIL_APP_URL = '';
process.env.EMAIL_ENABLED = 'false';
let lookups = 0;
let failLookup = false;
const contacts = {
  client: { name: 'Rhea Shah', email: 'rhea@example.test' },
  artist: { user: { name: 'Mira Kapoor', email: 'mira@example.test' } },
  service: { name: 'Bridal makeup' },
};
const db = { booking: { findUnique: async () => {
  lookups++;
  if (failLookup) throw new Error('Database unavailable');
  return contacts;
} } };
require.cache[require.resolve('../dist/lib/prisma')] = { exports: { __esModule: true, default: db, prisma: db } };
const { buildBookingEmail } = require('../dist/modules/email/booking-email.templates');
const { registerEmailTransport, isEmailConfigured } = require('../dist/modules/email/email.service');
const { notifyBookingEmail, queueBookingEmail } = require('../dist/modules/email/booking-email.service');
const booking = {
  id: 'booking_abc123', date: new Date('2026-11-08T00:00:00Z'), time: '10:00 AM', endTime: '12:00 PM',
  priceType: 'WEDDING', totalPaid: 5000, notes: 'Natural makeup', address: 'Test venue, Mumbai',
  cancelReason: null, advancePaid: 0, remainingAmount: 0,
};
function context(event, recipient = 'client', changes = {}) {
  return { booking: { ...booking, ...changes }, client: contacts.client, artist: contacts.artist.user,
    serviceName: contacts.service.name, event, recipient, appUrl: 'https://lume.example' };
}
beforeEach(() => { lookups = 0; failLookup = false; });

test('unconfigured delivery does no contact lookup and sends nothing', async () => {
  assert.equal(isEmailConfigured(), false);
  await notifyBookingEmail(booking, 'REQUESTED');
  assert.equal(lookups, 0);
});

test('all six events have HTML/text, appointment details and correct recipient links', () => {
  for (const event of ['REQUESTED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'ADVANCE_PAID', 'CONFIRMED']) {
    for (const recipient of ['artist', 'client']) {
      const message = buildBookingEmail(context(event, recipient));
      for (const value of ['booking_abc123', 'Bridal makeup', '8 November 2026', '10:00 AM', '12:00 PM', 'Test venue, Mumbai', 'Natural makeup']) {
        assert.ok(message.text.includes(value), `${event}/${recipient} missing ${value}`);
      }
      const path = recipient === 'artist' ? '/artist-dashboard/bookings' : '/profile';
      assert.ok(message.html.includes(`https://lume.example${path}`));
      assert.ok(message.text.includes(`https://lume.example${path}`));
      assert.ok(message.html.includes('<html lang="en">'));
      assert.match(message.subject, /^LUME \| .+ \| #ABC123$/);
    }
  }
});

test('acceptance asks for payment and does not claim a confirmed appointment', () => {
  const accepted = buildBookingEmail(context('ACCEPTED'));
  assert.match(accepted.subject, /payment pending/);
  assert.match(accepted.text, /pay and secure/);
  assert.doesNotMatch(accepted.text, /appointment.+is confirmed/);
  assert.match(buildBookingEmail(context('CONFIRMED')).text, /appointment.+is confirmed/);
});

test('declines and cancellations include reasons and distinguish client cancellation', () => {
  const declined = buildBookingEmail(context('DECLINED', 'client', { cancelReason: 'Unavailable for this slot' }));
  assert.match(declined.text, /Reason: Unavailable for this slot/);
  assert.match(declined.subject, /declined/);
  const cancelled = buildBookingEmail(context('CANCELLED', 'artist', { cancelReason: 'Client plans changed' }));
  assert.match(cancelled.text, /Reason: Client plans changed/);
  assert.doesNotMatch(cancelled.text, /You have declined/);
});

test('escapes all user HTML and preserves original content in the plain-text message', () => {
  const input = context('DECLINED', 'artist', {
    notes: '<script>alert("notes")</script>', address: '<img src=x onerror=alert(1)>', cancelReason: 'Busy <b>today</b>',
  });
  input.client = { name: '<svg onload=alert(1)>', email: 'client@example.test' };
  input.serviceName = '<iframe src="evil">';
  const message = buildBookingEmail(input);
  assert.doesNotMatch(message.html, /<script|<img|<svg|<iframe|<b>today/);
  assert.ok(message.html.includes('&lt;script&gt;'));
  assert.ok(message.text.includes(input.booking.notes));
});

test('uses readable fallback services and never invents paid amounts or a venue', () => {
  const input = context('REQUESTED', 'client', { address: null, notes: null });
  input.serviceName = null;
  const message = buildBookingEmail(input);
  assert.match(message.text, /Service: Wedding service/);
  assert.match(message.text, /Location: To be arranged/);
  assert.match(message.text, /Service price \(before GST\): ₹5,000/);
  assert.doesNotMatch(message.text, /Paid \(including GST\)/);
});

test('advance and full receipts label amounts and remaining balances accurately', () => {
  const advance = buildBookingEmail(context('ADVANCE_PAID', 'client', { advancePaid: 2950, remainingAmount: 2950 }));
  assert.match(advance.text, /Paid \(including GST\): ₹2,950/);
  assert.match(advance.text, /Remaining balance \(including GST\): ₹2,950/);
  const full = buildBookingEmail(context('CONFIRMED', 'client', { advancePaid: 5900 }));
  assert.match(full.text, /Paid \(including GST\): ₹5,900/);
  assert.match(full.text, /Remaining balance \(including GST\): ₹0/);
});

test('local recording adapter receives one private message per party and stable event keys', async () => {
  const messages = [];
  registerEmailTransport({ send: async message => { messages.push(message); } });
  await notifyBookingEmail(booking, 'REQUESTED');
  assert.equal(lookups, 1);
  assert.equal(messages.length, 2);
  assert.deepEqual(messages.map(m => m.to), ['mira@example.test', 'rhea@example.test']);
  assert.deepEqual(messages.map(m => m.idempotencyKey), [
    'booking/booking_abc123/REQUESTED/artist', 'booking/booking_abc123/REQUESTED/client',
  ]);
  assert.match(messages[0].text, /Hello Mira Kapoor/);
  assert.match(messages[1].text, /Hello Rhea Shah/);
  assert.ok(messages[0].html.includes('https://lume.example/artist-dashboard/bookings'));
});

test('artist delivery failure still attempts the client and redacts logged content', async () => {
  const sent = [];
  const logs = [];
  registerEmailTransport({ send: async message => {
    sent.push(message.to);
    if (message.to === contacts.artist.user.email) throw new Error('secret address or provider credential');
  } });
  const original = console.error;
  console.error = (...args) => { logs.push(args.join(' ')); };
  try { await notifyBookingEmail(booking, 'ACCEPTED'); } finally { console.error = original; }
  assert.equal(sent.length, 2);
  assert.equal(logs.length, 1);
  assert.doesNotMatch(logs[0], /secret address|credential|@/);
});

test('preparation failures cannot reject the booking response', async () => {
  failLookup = true;
  const logs = [];
  const original = console.error;
  console.error = (...args) => { logs.push(args.join(' ')); };
  try {
    assert.equal(queueBookingEmail(booking, 'REQUESTED'), undefined);
    await new Promise(resolve => setImmediate(resolve));
  } finally { console.error = original; }
  assert.equal(logs.length, 1);
  assert.match(logs[0], /Could not prepare REQUESTED/);
});
