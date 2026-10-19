const { test } = require('node:test');
const assert = require('node:assert/strict');

for (const key of [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
]) {
  process.env[key] = 'unit-test-placeholder';
}

const {
  normalizePhoneNumber,
  generateBookingActionToken,
  verifyBookingActionToken
} = require('../dist/modules/whatsapp/whatsapp.service');

test('Phone normalization correctly converts Indian numbers to E.164 format', () => {
  // Standard 10 digits
  assert.equal(normalizePhoneNumber('9876543210'), '919876543210');
  
  // With spaces, dashes, parentheses
  assert.equal(normalizePhoneNumber('+91 98765-43210'), '919876543210');
  assert.equal(normalizePhoneNumber('+91 (987) 654-3210'), '919876543210');
  
  // Leading 0
  assert.equal(normalizePhoneNumber('09876543210'), '919876543210');
  
  // Already prefixed with 91
  assert.equal(normalizePhoneNumber('919876543210'), '919876543210');
  
  // Invalid inputs
  assert.equal(normalizePhoneNumber(''), null);
  assert.equal(normalizePhoneNumber(null), null);
  assert.equal(normalizePhoneNumber('123'), null); // too short
});

test('Cryptographic token generation and verification for WhatsApp one-click actions', () => {
  const bookingId = 'booking_abc123';
  
  const acceptToken = generateBookingActionToken(bookingId, 'accept');
  const denyToken = generateBookingActionToken(bookingId, 'deny');
  
  assert.ok(acceptToken);
  assert.ok(denyToken);
  assert.notEqual(acceptToken, denyToken);
  
  // Verify valid tokens
  assert.equal(verifyBookingActionToken(bookingId, 'accept', acceptToken), true);
  assert.equal(verifyBookingActionToken(bookingId, 'deny', denyToken), true);
  
  // Reject tampered tokens
  assert.equal(verifyBookingActionToken(bookingId, 'accept', denyToken), false);
  assert.equal(verifyBookingActionToken(bookingId, 'accept', 'invalid-token'), false);
  assert.equal(verifyBookingActionToken('wrong_booking', 'accept', acceptToken), false);
});
