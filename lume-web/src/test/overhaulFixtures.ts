// Deterministic development/test fixtures. No connection to the production API.
import type { Insights } from '../pages/admin/AdminInsights';
export const adminUser = { id: 'qa-admin', name: 'Lume Team', email: 'qa-admin@example.test', role: 'ADMIN' as const };
export const artists = [
  { id: 'qa-artist-1', user: { id: 'qa-user-1', name: 'Ananya Mehra', email: 'ananya@example.test', createdAt: '2026-09-01' }, location: 'Bandra West, Mumbai, Maharashtra', bio: 'Bridal and editorial beauty artist.', specialties: ['Bridal', 'Editorial'], rating: 4.9, reviewCount: 42, verificationStatus: 'PENDING', verificationSubmittedAt: '2026-10-15', isTakingBookings: true, portfolioUrls: ['/images/artist-placeholder.jpg'], certificationFiles: [], experience: 7, startingPrice: 4500, weddingPrice: 15000, occasionPrice: 4500, hourlyPrice: 2500, bankAccount: { id: 'qa-bank-1', accountHolderName: 'Ananya Mehra', maskedAccountNumber: '****1234', ifscCode: 'TEST0001234', bankName: 'Test Bank', accountType: 'SAVINGS', isVerified: false, isLinkedToRazorpay: false } },
  { id: 'qa-artist-2', user: { id: 'qa-user-2', name: 'Mira Kapoor', email: 'mira@example.test', createdAt: '2026-08-01' }, location: 'Indiranagar, Bengaluru, Karnataka', bio: 'Beauty for every celebration.', specialties: ['Occasion'], rating: 4.8, reviewCount: 28, verificationStatus: 'VERIFIED', isTakingBookings: true, portfolioUrls: [], certificationFiles: [], experience: 4 },
];
const payment = { id: 'qa-payment-1', totalCharged: 17700, basePortion: 15000, lumeCommission: 750, gstAmount: 2700, lumeTotal: 3450, artistPayout: 14250, payoutStatus: 'PENDING', transferStatus: 'NOT_LINKED', createdAt: '2026-10-17T10:00:00Z' };
const booking = { id: 'qa-booking-1', date: '2026-10-25', status: 'CONFIRMED', priceType: 'WEDDING', client: { name: 'Rhea Shah', email: 'rhea@example.test' }, service: { name: 'Bridal makeup' }, artist: { user: { name: 'Ananya Mehra' } }, paymentRecords: [payment] };
export const clients = [{ id: 'qa-client-1', name: 'Rhea Shah', email: 'rhea@example.test', createdAt: '2026-09-15', clientProfile: { location: 'Mumbai' }, bookingsAsClient: [booking] }];
export const insights: Insights = {
  generatedAt: '2026-10-18T12:00:00Z', days: 30,
  financial: { gmv: 428500, collections: 505630, netRevenue: 21425, gst: 77130, paidBookings: 38, aov: 11276, cancelledBookingCollections: 0, aovByType: [{ type: 'WEDDING', paidBookings: 18, value: 16500 }, { type: 'OCCASION', paidBookings: 14, value: 7200 }, { type: 'HOURLY', paidBookings: 6, value: 5100 }] },
  payouts: { completed: { amount: 328000, count: 32 }, pending: { amount: 79075, count: 6 } }, failedTransfers: 1,
  cities: [{ city: 'Mumbai', activeArtists: 8, artists: 12, bookings: 25, gmv: 180000, demandPerArtist: 3.1, underserved: false }, { city: 'Bengaluru', activeArtists: 4, artists: 7, bookings: 22, gmv: 140000, demandPerArtist: 5.5, underserved: true }, { city: 'New Delhi', activeArtists: 6, artists: 8, bookings: 18, gmv: 108500, demandPerArtist: 3, underserved: false }],
  leaderboard: [{ id: 'qa-artist-1', name: 'Ananya Mehra', city: 'Mumbai', rating: 4.9, reviewCount: 42, gmv: 145000, paidBookings: 12 }, { id: 'qa-artist-2', name: 'Mira Kapoor', city: 'Bengaluru', rating: 4.8, reviewCount: 28, gmv: 98000, paidBookings: 10 }], topRated: [],
  verification: { pending: 4, overdue: 1, submitted: 12, averageHours: 16.5, reviewed: 8, approved: 7, rejected: 1 },
  trends: [{ month: '2026-08', gmv: 118000, commission: 5900 }, { month: '2026-09', gmv: 165000, commission: 8250 }, { month: '2026-10', gmv: 428500, commission: 21425 }],
  bookingSummary: { total: 65, completed: 43, cancelled: 3 },
  activity: [{ id: 'event1', type: 'booking', at: '2026-10-18T11:45:00Z', title: 'Booking created', detail: 'Rhea Shah booked Ananya Mehra · confirmed', artistId: 'qa-artist-1' }, { id: 'event2', type: 'verification', at: '2026-10-18T10:10:00Z', title: 'Verification submitted', detail: 'Ananya Mehra', artistId: 'qa-artist-1' }, { id: 'event3', type: 'payout', at: '2026-10-18T09:30:00Z', title: 'Payout completed', detail: 'Mira Kapoor · ₹12,500' }], audit: [],
};
insights.topRated = [...insights.leaderboard];
export async function fixtureFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(String(input), 'http://localhost');
  let data: unknown;
  if (url.pathname === '/api/auth/me') data = adminUser;
  else if (url.pathname === '/api/admin/stats') data = { totalUsers: 128, totalArtists: 27, pendingVerifications: 4, totalBookings: 65, verifiedArtists: 21, charts: { userGrowth: [{ month: 'Aug', clients: 20, artists: 4 }, { month: 'Sep', clients: 42, artists: 7 }, { month: 'Oct', clients: 66, artists: 16 }], bookingTrends: [], verificationDist: [{ name: 'Verified', value: 21, color: '#b5687b' }, { name: 'Pending', value: 4, color: '#c9956a' }] } };
  else if (url.pathname === '/api/admin/insights/analytics') data = insights;
  else if (url.pathname === '/api/admin/artists/pending') data = artists.filter(a => a.verificationStatus === 'PENDING');
  else if (url.pathname === '/api/admin/artists') data = artists;
  else if (url.pathname === '/api/admin/clients') data = clients;
  else if (url.pathname === '/api/admin/payments') data = [{ artistId: artists[0].id, user: artists[0].user, bankAccount: artists[0].bankAccount, totalBookings: 12, bookingsWithPayment: 12, totalCharged: 17700, totalLume: 3450, totalArtistDue: 14250, pendingPayout: payment.payoutStatus === 'COMPLETED' ? 0 : 14250, completedPayout: 0 }];
  else if (url.pathname === '/api/admin/payments/lume') data = { totalEarned: 21425, totalCollections: 505630, totalGst: 77130, records: [] };
  else if (url.pathname === '/api/admin/payments/qa-artist-1') data = { ...artists[0], bookings: [booking] };
  else if (url.pathname.endsWith('/mark-paid')) { payment.payoutStatus = 'COMPLETED'; data = payment; }
  else if (url.pathname.includes('/bank-accounts/')) { artists[0].bankAccount!.isVerified = true; artists[0].bankAccount!.isLinkedToRazorpay = true; data = { routeRegistered: true, linkedAccountId: 'qa-route' }; }
  else if (url.pathname.startsWith('/api/admin/artists/')) {
    const artist = artists.find(a => url.pathname.includes(a.id));
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : {};
    if (artist) { if (url.pathname.endsWith('/verify')) artist.verificationStatus = 'VERIFIED'; else if (url.pathname.endsWith('/reject')) artist.verificationStatus = 'REJECTED'; else Object.assign(artist, body); }
    data = artist || {};
  } else if (url.pathname === '/api/geo/search') data = { results: [{ city: 'Mumbai', sublocality: 'Bandra West', state: 'Maharashtra', formattedAddress: 'Bandra West, Mumbai, Maharashtra', source: 'photon' }], source: 'photon' };
  else if (url.pathname === '/api/artists') data = { artists: [], pagination: { page: 1, total: 0, totalPages: 0 } };
  else data = [];
  return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
