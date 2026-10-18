const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
// Unit tests never load application credentials or open a database connection.
for (const key of ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']) process.env[key] = 'unit-test-placeholder';
process.env.GOOGLE_CLIENT_ID = 'unit-test-client';
const users = [];
const profile = { create: async () => ({}) };
const db = { user: {
  findUnique: async ({ where }) => users.find(u => Object.entries(where).every(([k, v]) => u[k] === v)) || null,
  findUniqueOrThrow: async ({ where }) => users.find(u => u.id === where.id),
  findFirst: async ({ where }) => users.find(u => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null,
  update: async ({ where, data }) => { const user = users.find(u => u.id === where.id); Object.assign(user, data); return user; },
  create: async ({ data }) => { const user = { id: `u-${users.length}`, isActive: true, passwordHash: null, ...data }; users.push(user); return user; },
}, clientProfile: profile, artistProfile: profile };
db.$transaction = async fn => fn(db);
require.cache[require.resolve('../dist/lib/prisma')] = { exports: { __esModule: true, default: db } };
require.cache[require.resolve('../dist/lib/jwt')] = { exports: { signToken: () => 'lume-token', signRefreshToken: () => 'refresh-token' } };
let tokenPayload;
const { OAuth2Client } = require('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async ({ audience }) => { assert.equal(audience, 'unit-test-client'); if (tokenPayload === null) throw Error('Invalid token'); return { getPayload: () => tokenPayload }; };
const { authenticateGoogleUser, googleAuthSchema } = require('../dist/modules/auth/google.service');
const { buildInsightMetrics } = require('../dist/modules/admin/insights.metrics');
const { locationSearchTerms, locationCity } = require('../dist/modules/geo/locationMatching');
const { fromPhoton, fromGoogle, searchLocations } = require('../dist/modules/geo/geo.service');
const { artistEditSchema } = require('../dist/modules/admin/admin.validation');
const bcrypt = require('bcryptjs');
const request = { idToken: 'test-token-long-enough', role: 'CLIENT' };
beforeEach(() => { users.length = 0; tokenPayload = { sub: 'google-subject', email: 'Member@gmail.com', email_verified: true, name: 'Member' }; });

test('Google signup provisions the client atomically and never returns a password hash', async () => {
  const result = await authenticateGoogleUser(request);
  assert.equal(users.length, 1); assert.equal(result.user.email, 'member@gmail.com'); assert.ok(users[0].clientProfile.create);
  assert.equal(result.token, 'lume-token'); assert.equal('passwordHash' in result.user, false); assert.equal('googleId' in result.user, false);
});
test('new Google artist has no invented location and is unavailable until setup', async () => {
  await authenticateGoogleUser({ ...request, role: 'ARTIST' });
  assert.equal(users[0].artistProfile.create.location, ''); assert.equal(users[0].artistProfile.create.isTakingBookings, false);
});
test('Google links an existing verified Gmail account while preserving its role', async () => {
  users.push({ id: 'artist', email: 'MEMBER@gmail.com', name: 'Artist', role: 'ARTIST', isActive: true, passwordHash: 'hash', artistProfile: {} });
  const result = await authenticateGoogleUser(request);
  assert.equal(result.user.role, 'ARTIST'); assert.equal(users[0].googleId, 'google-subject'); assert.equal(users.length, 1);
});
test('Google rejects unverified emails and cryptographically invalid tokens', async () => {
  tokenPayload.email_verified = false;
  await assert.rejects(authenticateGoogleUser(request), e => e.statusCode === 401);
  tokenPayload = null;
  await assert.rejects(authenticateGoogleUser(request), e => e.statusCode === 401);
  assert.equal(users.length, 0);
});
test('Google rejects inactive accounts and different linked subjects', async () => {
  const user = { id: 'u', email: 'member@gmail.com', role: 'CLIENT', isActive: false, googleId: null }; users.push(user);
  await assert.rejects(authenticateGoogleUser(request), e => e.statusCode === 403);
  user.isActive = true; user.googleId = 'different-subject';
  await assert.rejects(authenticateGoogleUser(request), e => e.statusCode === 409);
});
test('Google refuses conflicts between subject identity and email identity', async () => {
  users.push({ id: 'one', googleId: 'google-subject', email: 'old@gmail.com', isActive: true }, { id: 'two', email: 'member@gmail.com', isActive: true });
  await assert.rejects(authenticateGoogleUser(request), e => e.statusCode === 409);
});
test('third-party email linking requires the existing password and supports a successful retry', async () => {
  tokenPayload.email = 'member@example.com';
  users.push({ id: 'u', email: 'member@example.com', role: 'CLIENT', isActive: true, passwordHash: await bcrypt.hash('real-password', 4), clientProfile: {} });
  await assert.rejects(authenticateGoogleUser(request), e => e.code === 'GOOGLE_LINK_REQUIRED');
  await assert.rejects(authenticateGoogleUser({ ...request, password: 'wrong' }), e => e.statusCode === 401);
  await authenticateGoogleUser({ ...request, password: 'real-password' });
  assert.equal(users[0].googleId, 'google-subject');
});
test('public role validation blocks ADMIN signup', () => {
  assert.equal(googleAuthSchema.safeParse({ ...request, role: 'ADMIN' }).success, false);
});
test('locality queries ignore state/country and recognize old city names', () => {
  assert.deepEqual(locationSearchTerms('Indiranagar, Bengaluru, Karnataka, India'), ['Indiranagar', 'Bengaluru', 'Bangalore']);
  assert.ok(locationSearchTerms('Delhi NCR').includes('Gurgaon'));
  assert.equal(locationCity('Bandra West, Mumbai, Maharashtra, 400050'), 'Mumbai');
  assert.equal(locationCity('Bangalore, Karnataka'), 'Bengaluru');
  assert.equal(locationCity(''), 'Not specified');
});
test('provider normalization retains real coordinates and rejects foreign locations', () => {
  const feature = { properties: { countrycode: 'IN', name: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', postcode: '400050' }, geometry: { coordinates: [72.8, 19.05] } };
  assert.equal(fromPhoton(feature).lat, 19.05); assert.equal(fromPhoton(feature).pincode, '400050');
  feature.properties.countrycode = 'US'; assert.equal(fromPhoton(feature), null);
  assert.throws(() => fromGoogle({ formattedAddress: 'Paris', addressComponents: [{ types: ['country'], shortText: 'FR', longText: 'France' }] }));
});
test('provider failure returns an explicit offline state', async () => {
  const original = global.fetch; global.fetch = async () => { throw Error('offline'); };
  try { assert.equal((await searchLocations('offline-test', 'session')).source, 'offline'); }
  finally { global.fetch = original; }
});
test('analytics deduplicates callbacks, sums split payments and keeps GST separate from commission', () => {
  const now = new Date('2026-10-18T12:00:00Z');
  const artist = { id: 'a', location: 'Bandra, Mumbai, Maharashtra', rating: 5, reviewCount: 2, isVerified: true, isAvailable: true, isTakingBookings: true,
    verificationStatus: 'VERIFIED', verificationSubmittedAt: new Date('2026-10-10'), verificationReviewedAt: new Date('2026-10-11'), user: { name: 'Artist', isActive: true } };
  const payment = { id: 'p1', bookingId: 'b', razorpayPaymentId: 'gateway1', totalCharged: 59, basePortion: 50, lumeCommission: 2.5, gstAmount: 9, artistPayout: 47.5, payoutStatus: 'PENDING', transferStatus: 'PENDING', createdAt: now, payoutCompletedAt: null, booking: { priceType: 'WEDDING', artistId: 'a', status: 'CONFIRMED', artist: { location: artist.location, user: artist.user } } };
  const booking = { id: 'b', artistId: 'a', status: 'CONFIRMED', createdAt: now, artist: { location: artist.location, user: artist.user }, client: { name: 'Client' } };
  const result = buildInsightMetrics([payment, { ...payment, id: 'duplicate' }, { ...payment, id: 'p2', razorpayPaymentId: 'gateway2' }], [artist], [booking], now);
  assert.equal(result.financial.gmv, 100); assert.equal(result.financial.collections, 118); assert.equal(result.financial.netRevenue, 5); assert.equal(result.financial.gst, 18);
  assert.equal(result.financial.aov, 100); assert.equal(result.financial.paidBookings, 1); assert.equal(result.cities[0].city, 'Mumbai'); assert.equal(result.cities[0].bookings, 1); assert.equal(result.verification.averageHours, 24);
});
test('empty analytics has zero values and no fabricated review SLA', () => {
  const result = buildInsightMetrics([], [], [], new Date());
  assert.equal(result.financial.aov, 0); assert.equal(result.verification.averageHours, null); assert.deepEqual(result.leaderboard, []);
});
test('admin editing validates prices, status and empty optional badges', () => {
  assert.equal(artistEditSchema.safeParse({ badge: '', startingPrice: 0 }).success, true);
  assert.equal(artistEditSchema.safeParse({ weddingPrice: -1 }).success, false);
  assert.equal(artistEditSchema.safeParse({ verificationStatus: 'UNKNOWN' }).success, false);
});
