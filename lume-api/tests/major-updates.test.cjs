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
  'RAZORPAY_KEY_SECRET',
]) {
  process.env[key] = process.env[key] || 'unit-test-placeholder';
}

const { createBookingSchema } = require('../dist/modules/bookings/bookings.service');
const { hasBookingDateTimePassed } = require('../dist/modules/reviews/reviews.service');
const { updateMeSchema } = require('../dist/modules/auth/auth.service');
const { artistEditSchema } = require('../dist/modules/admin/admin.validation');

test('booking schema requires exact address and Google Maps geo-location and omits phone field', () => {
  const missingLocation = createBookingSchema.safeParse({
    artistId: 'artist-1',
    date: '2026-11-12',
    time: '10:00',
    priceType: 'OCCASION',
  });
  assert.equal(missingLocation.success, false);

  const missingCoords = createBookingSchema.safeParse({
    artistId: 'artist-1',
    date: '2026-11-12',
    time: '10:00',
    priceType: 'OCCASION',
    address: 'Flat 402, Hill Road, Bandra West, Mumbai - 400050',
  });
  assert.equal(missingCoords.success, false);

  const valid = createBookingSchema.safeParse({
    artistId: 'artist-1',
    date: '2026-11-12',
    time: '10:00',
    priceType: 'OCCASION',
    address: 'Flat 402, Hill Road, Bandra West, Mumbai - 400050',
    latitude: 19.0596,
    longitude: 72.8295,
    clientPhone: '+919876543210',
  });
  assert.equal(valid.success, true);
  assert.equal('clientPhone' in valid.data, false);
});

test('hasBookingDateTimePassed accurately checks IST appointment completion boundary', () => {
  const booking = {
    date: new Date('2026-11-08T00:00:00.000Z'),
    time: '10:00, 11:00',
    endTime: null,
  };
  // 11:00 slot ends at 12:00 IST (06:30 UTC)
  assert.equal(hasBookingDateTimePassed(booking, new Date('2026-11-08T06:00:00.000Z')), false);
  assert.equal(hasBookingDateTimePassed(booking, new Date('2026-11-08T06:31:00.000Z')), true);
});

test('updateMeSchema validates beautyPreferences and savedAddresses with coordinates', () => {
  const parsed = updateMeSchema.safeParse({
    beautyPreferences: {
      styles: ['Bridal Artistry', 'Soft Glam / Minimalist'],
      skinType: 'Combination',
      undertone: 'Warm Golden',
      specialRequests: 'Fragrance-free primer preferred',
    },
    savedAddresses: [
      {
        id: 'addr-1',
        label: 'Home',
        street: 'Hill Road, Bandra West',
        apartment: '4B',
        city: 'Mumbai',
        pincode: '400050',
        isDefault: true,
        lat: 19.0596,
        lng: 72.8295,
      },
    ],
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.beautyPreferences.skinType, 'Combination');
  assert.equal(parsed.data.savedAddresses[0].lat, 19.0596);
});


test('review boundary uses the exact minute and handles a session ending at midnight', () => {
  const date = new Date('2026-11-08T00:00:00Z');
  for (const [time, endTime, boundary] of [
    ['11:00 AM', '12:30', '2026-11-08T07:00:00Z'],
    ['23:00', null, '2026-11-08T18:30:00Z'],
    ['10:00 PM', '00:00', '2026-11-08T18:30:00Z'],
  ]) {
    const end = new Date(boundary);
    assert.equal(hasBookingDateTimePassed({ date, time, endTime }, new Date(end.getTime() - 1)), false);
    assert.equal(hasBookingDateTimePassed({ date, time, endTime }, end), true);
  }
});

test('admin artist editing schema supports isHidden flag for hiding/unhiding artists', () => {
  const hiddenArtist = artistEditSchema.safeParse({ isHidden: true });
  assert.equal(hiddenArtist.success, true);
  assert.equal(hiddenArtist.data.isHidden, true);

  const visibleArtist = artistEditSchema.safeParse({ isHidden: false });
  assert.equal(visibleArtist.success, true);
  assert.equal(visibleArtist.data.isHidden, false);

  const invalidType = artistEditSchema.safeParse({ isHidden: 'yes' });
  assert.equal(invalidType.success, false);
});
