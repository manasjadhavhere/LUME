const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');

// Replace the SMTP boundary before loading the adapter: these tests never connect.
let options;
let sends;
let verifications;
let behavior;
nodemailer.createTransport = settings => {
  options = settings;
  return {
    sendMail: async message => { sends.push(message); return behavior(message); },
    verify: async () => { verifications++; return true; },
  };
};
const { createGmailTransport, describeEmailError } = require('../dist/modules/email/gmail.transport');
const settings = {
  enabled: true, user: 'lume-sender@example.test', appPassword: 'unit-test-app-password',
  fromName: 'LUME Bookings', replyTo: '', appUrl: 'https://hellolume.in',
};
// Use a fake Gmail-shaped address to exercise Gmail account validation locally.
settings.user = 'lume-smtp-test@gmail.com';
const message = {
  to: 'client@example.test', subject: 'LUME | Booking accepted', html: '<p>Booking accepted</p>',
  text: 'Booking accepted', idempotencyKey: 'booking/test-booking/ACCEPTED/client',
};
beforeEach(() => { options = undefined; sends = []; verifications = 0; behavior = async () => ({ accepted: ['client@example.test'] }); });

test('disabled Gmail does not create a connection or require credentials', () => {
  assert.equal(createGmailTransport({ ...settings, enabled: false, user: '', appPassword: '' }), undefined);
  assert.equal(options, undefined);
});

test('enabled Gmail requires credentials and rejects non-Gmail sender or invalid URLs', () => {
  assert.throws(() => createGmailTransport({ ...settings, appPassword: '' }), /SMTP_APP_PASSWORD/);
  assert.throws(() => createGmailTransport({ ...settings, user: 'bookings@hellolume.in' }), /Gmail account/);
  assert.throws(() => createGmailTransport({ ...settings, replyTo: 'two@example.test,three@example.test' }), /EMAIL_REPLY_TO/);
  assert.throws(() => createGmailTransport({ ...settings, appUrl: 'javascript:alert(1)' }), /HTTP or HTTPS/);
  assert.equal(options, undefined);
});

test('uses authenticated Gmail TLS with bounded timeouts and no protocol/content logs', () => {
  createGmailTransport(settings);
  assert.equal(options.host, 'smtp.gmail.com');
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.deepEqual(options.auth, { user: settings.user, pass: settings.appPassword });
  assert.equal(options.tls.minVersion, 'TLSv1.2');
  assert.equal(options.tls.rejectUnauthorized, undefined);
  assert.ok(options.connectionTimeout <= 10000);
  assert.ok(options.socketTimeout <= 20000);
  assert.equal(options.logger, false);
  assert.equal(options.debug, false);
  assert.equal(options.disableFileAccess, true);
  assert.equal(options.disableUrlAccess, true);
  assert.equal(sends.length, 0);
});

test('sends HTML and text from the authorized account and directs replies to it', async () => {
  const transport = createGmailTransport(settings);
  await transport.send(message);
  assert.equal(sends.length, 1);
  assert.deepEqual(sends[0].from, { name: 'LUME Bookings', address: settings.user });
  assert.equal(sends[0].to.address, message.to);
  assert.equal(sends[0].replyTo.address, settings.user);
  assert.equal(sends[0].html, message.html);
  assert.equal(sends[0].text, message.text);
  assert.match(sends[0].messageId, /^<lume\.[a-f0-9]{64}@gmail\.com>$/);
  assert.equal(sends[0].idempotencyKey, undefined);
});

test('verification checks credentials without sending a booking email', async () => {
  const transport = createGmailTransport(settings);
  await transport.verify();
  assert.equal(verifications, 1);
  assert.equal(sends.length, 0);
});

test('deduplicates concurrent and repeated sends but keeps recipients and events separate', async () => {
  const transport = createGmailTransport(settings);
  await Promise.all([transport.send(message), transport.send(message)]);
  await transport.send(message);
  assert.equal(sends.length, 1);
  await transport.send({ ...message, to: 'artist@example.test' });
  await transport.send({ ...message, idempotencyKey: 'booking/test-booking/CONFIRMED/client' });
  assert.equal(sends.length, 3);
  assert.notEqual(sends[0].messageId, sends[1].messageId);
  assert.notEqual(sends[0].messageId, sends[2].messageId);
});

test('invalid or multiple recipients cannot become an SMTP envelope', async () => {
  const transport = createGmailTransport(settings);
  await assert.rejects(transport.send({ ...message, to: 'one@example.test,two@example.test' }), /Invalid booking email recipient/);
  assert.equal(sends.length, 0);
});

test('retries explicit temporary SMTP rejection using the same message ID', async () => {
  let attempts = 0;
  behavior = async () => {
    if (++attempts === 1) throw Object.assign(new Error('Temporary rejection'), { code: 'EMESSAGE', responseCode: 451 });
    return {};
  };
  await createGmailTransport(settings).send(message);
  assert.equal(attempts, 2);
  assert.equal(sends[0].messageId, sends[1].messageId);
});

test('does not retry authentication failures or ambiguous timeouts and permits a later attempt', async () => {
  const transport = createGmailTransport(settings);
  behavior = async () => { throw Object.assign(new Error('Bad credential'), { code: 'EAUTH', responseCode: 535 }); };
  await assert.rejects(transport.send(message), /Bad credential/);
  assert.equal(sends.length, 1);
  behavior = async () => { throw Object.assign(new Error('Timeout after DATA'), { code: 'ETIMEDOUT' }); };
  await assert.rejects(transport.send(message), /Timeout after DATA/);
  assert.equal(sends.length, 2);
  behavior = async () => ({});
  await transport.send(message);
  assert.equal(sends.length, 3);
});

test('logs only safe SMTP codes and never raw error messages or addresses', () => {
  assert.equal(describeEmailError({ code: 'EAUTH', responseCode: 535, message: 'credential and address@example.test' }), 'EAUTH (SMTP 535)');
  assert.equal(describeEmailError({ code: 'secret@example.test', responseCode: 'password' }), 'DELIVERY_FAILED');
  assert.equal(describeEmailError(null), 'DELIVERY_FAILED');
});
