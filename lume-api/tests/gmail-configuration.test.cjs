const { test } = require('node:test');
const assert = require('node:assert/strict');

// Startup registration is tested without loading credentials or opening sockets.
require('dotenv').config = () => ({});
for (const key of ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) {
  process.env[key] = 'unit-test-placeholder';
}
process.env.EMAIL_ENABLED = 'true';
process.env.SMTP_USER = '  lume-startup-test@gmail.com  ';
process.env.SMTP_APP_PASSWORD = 'abcd efgh ijkl mnop';
process.env.EMAIL_REPLY_TO = '';
process.env.EMAIL_FROM_NAME = 'LUME Bookings';
process.env.EMAIL_APP_URL = '';
process.env.CLIENT_URL = 'https://hellolume.in,https://www.hellolume.in';
let smtpOptions;
const delivered = [];
require('nodemailer').createTransport = options => {
  smtpOptions = options;
  return { sendMail: async message => { delivered.push(message); return {}; }, verify: async () => true };
};
const { config } = require('../dist/config/env');
const { configureBookingEmail, isEmailConfigured, sendEmail } = require('../dist/modules/email/email.service');

test('startup registers Gmail with normalized App Password and the correct frontend origin', async () => {
  assert.equal(config.email.appPassword, 'abcdefghijklmnop');
  assert.equal(config.email.appUrl, 'https://hellolume.in');
  assert.equal(configureBookingEmail(), true);
  assert.equal(isEmailConfigured(), true);
  assert.equal(smtpOptions.auth.user, 'lume-startup-test@gmail.com');
  assert.equal(smtpOptions.auth.pass, 'abcdefghijklmnop');
  await sendEmail({ to: 'client@example.test', subject: 'Test', html: '<p>Test</p>', text: 'Test', idempotencyKey: 'startup/test' });
  assert.equal(delivered.length, 1);
});

test('disabling email removes the active transport', () => {
  config.email.enabled = false;
  assert.equal(configureBookingEmail(), false);
  assert.equal(isEmailConfigured(), false);
});

test('invalid startup configuration cannot leave an old transport active', () => {
  config.email.enabled = true;
  configureBookingEmail();
  config.email.appPassword = '';
  assert.throws(() => configureBookingEmail(), /SMTP_APP_PASSWORD/);
  assert.equal(isEmailConfigured(), false);
});
