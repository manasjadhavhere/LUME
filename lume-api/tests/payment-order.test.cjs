const { beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
let order;
let created;
require.cache[require.resolve('../dist/config/env')] = { exports: { config: { razorpay: { keyId: 'test', keySecret: 'secret' } } } };
require.cache[require.resolve('razorpay')] = { exports: class {
  orders = {
    fetch: async () => order,
    create: async options => { created = options; return { id: 'order-test', ...options }; },
  };
} };
const payments = require('../dist/modules/payments/payments.service');
beforeEach(() => {
  order = { status: 'paid', currency: 'INR', amount: 590000, amount_paid: 590000,
    notes: { bookingId: 'booking-1', clientId: 'client-1', paymentType: 'FULL' } };
});
const verify = () => payments.verifyBookingOrder('order-1', 'booking-1', 'client-1', 'FULL', 5900);

test('payment orders carry the authoritative amount and booking notes to Razorpay', async () => {
  await payments.createOrder(5900, 'receipt-1', order.notes);
  assert.deepEqual(created, { amount: 590000, currency: 'INR', receipt: 'receipt-1', notes: order.notes });
});

test('only a fully paid order for the same booking, client, type and amount can verify', async () => {
  assert.equal(await verify(), true);
  for (const patch of [
    { status: 'created' }, { status: 'attempted' }, { amount: 5900 }, { amount_paid: 100 }, { currency: 'USD' },
    { notes: { ...order.notes, bookingId: 'another-booking' } },
    { notes: { ...order.notes, clientId: 'another-client' } },
    { notes: { ...order.notes, paymentType: 'ADVANCE' } }, { notes: {} },
  ]) {
    const original = order; order = { ...order, ...patch };
    assert.equal(await verify(), false, JSON.stringify(patch)); order = original;
  }
});

test('signature verification rejects altered order, payment or signature', () => {
  const signature = crypto.createHmac('sha256', 'secret').update('order-1|payment-1').digest('hex');
  assert.equal(payments.verifySignature('order-1', 'payment-1', signature), true);
  assert.equal(payments.verifySignature('order-2', 'payment-1', signature), false);
  assert.equal(payments.verifySignature('order-1', 'payment-2', signature), false);
  assert.equal(payments.verifySignature('order-1', 'payment-1', 'bad'), false);
});
