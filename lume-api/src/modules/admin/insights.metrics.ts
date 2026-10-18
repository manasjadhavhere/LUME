import { locationCity } from '../geo/locationMatching';

export interface InsightPayment {
  id: string; bookingId: string; razorpayPaymentId: string | null;
  totalCharged: number; basePortion: number; lumeCommission: number; gstAmount: number; artistPayout: number;
  payoutStatus: string; transferStatus: string; createdAt: Date; payoutCompletedAt: Date | null;
  booking: { priceType: string; artistId: string; status: string; artist: { location: string; user: { name: string } } };
}
export interface InsightArtist {
  id: string; location: string; rating: number; reviewCount: number; isVerified: boolean; isAvailable: boolean; isTakingBookings: boolean;
  verificationStatus: string; verificationSubmittedAt: Date | null; verificationReviewedAt: Date | null;
  user: { name: string; isActive: boolean };
}
export interface InsightBooking { id: string; status: string; artistId: string; createdAt: Date; artist: { location: string; user: { name: string } }; client: { name: string } }
export const sumMoney = (values: number[]) => values.reduce((sum, n) => sum + Math.round(n * 100), 0) / 100;
const round = (n: number) => Math.round(n * 100) / 100;

export function buildInsightMetrics(payments: InsightPayment[], artists: InsightArtist[], bookings: InsightBooking[], now: Date, since?: Date) {
  // Advance and balance payments count once each; repeat callbacks for the same gateway payment do not.
  const records = [...new Map(payments.map(p => [p.razorpayPaymentId || p.id, p])).values()];
  const paidBookingIds = new Set(records.map(p => p.bookingId));
  const gmv = sumMoney(records.map(p => p.basePortion));
  const cityMap = new Map<string, { city: string; artists: number; activeArtists: number; bookings: number; gmv: number; collections: number }>();
  const city = (location: string) => {
    const name = locationCity(location);
    if (!cityMap.has(name)) cityMap.set(name, { city: name, artists: 0, activeArtists: 0, bookings: 0, gmv: 0, collections: 0 });
    return cityMap.get(name)!;
  };
  artists.forEach(a => { const row = city(a.location); row.artists++; if (a.isVerified && a.isAvailable && a.isTakingBookings && a.user.isActive) row.activeArtists++; });
  bookings.forEach(b => { city(b.artist.location).bookings++; });
  records.forEach(p => { const row = city(p.booking.artist.location); row.gmv = sumMoney([row.gmv, p.basePortion]); row.collections = sumMoney([row.collections, p.totalCharged]); });
  const artistRevenue = new Map<string, { gmv: number; bookings: Set<string> }>();
  records.forEach(p => {
    const row = artistRevenue.get(p.booking.artistId) || { gmv: 0, bookings: new Set<string>() };
    row.gmv = sumMoney([row.gmv, p.basePortion]); row.bookings.add(p.bookingId); artistRevenue.set(p.booking.artistId, row);
  });
  const leaderboard = artists.map(a => ({ id: a.id, name: a.user.name, city: locationCity(a.location), rating: a.rating, reviewCount: a.reviewCount,
    gmv: artistRevenue.get(a.id)?.gmv || 0, paidBookings: artistRevenue.get(a.id)?.bookings.size || 0 }));
  const pending = artists.filter(a => ['PENDING', 'EDIT_REQUESTED'].includes(a.verificationStatus));
  const reviewed = artists.filter(a => a.verificationReviewedAt && a.verificationSubmittedAt && a.verificationReviewedAt >= a.verificationSubmittedAt && (!since || a.verificationReviewedAt >= since));
  const turnaround = reviewed.map(a => (a.verificationReviewedAt!.getTime() - a.verificationSubmittedAt!.getTime()) / 3600000);
  const submitted = artists.filter(a => a.verificationSubmittedAt && (!since || a.verificationSubmittedAt >= since)).length;
  const aovByType = ['WEDDING', 'OCCASION', 'HOURLY'].map(type => {
    const group = records.filter(p => p.booking.priceType === type);
    const count = new Set(group.map(p => p.bookingId)).size;
    return { type, paidBookings: count, value: count ? round(sumMoney(group.map(p => p.basePortion)) / count) : 0 };
  });
  const trendMap = new Map<string, { month: string; gmv: number; commission: number }>();
  records.forEach(p => {
    const month = new Date(p.createdAt.getTime() + 330 * 60000).toISOString().slice(0, 7);
    const row = trendMap.get(month) || { month, gmv: 0, commission: 0 };
    row.gmv = sumMoney([row.gmv, p.basePortion]); row.commission = sumMoney([row.commission, p.lumeCommission]); trendMap.set(month, row);
  });
  return {
    financial: { gmv, collections: sumMoney(records.map(p => p.totalCharged)), netRevenue: sumMoney(records.map(p => p.lumeCommission)),
      gst: sumMoney(records.map(p => p.gstAmount)), paidBookings: paidBookingIds.size,
      aov: paidBookingIds.size ? round(gmv / paidBookingIds.size) : 0,
      cancelledBookingCollections: sumMoney(records.filter(p => p.booking.status === 'CANCELLED').map(p => p.totalCharged)), aovByType },
    cities: [...cityMap.values()].map(c => ({ ...c, demandPerArtist: c.activeArtists ? round(c.bookings / c.activeArtists) : null,
      underserved: c.bookings > 0 && (c.activeArtists === 0 || c.bookings / c.activeArtists >= 5) })).sort((a, b) => b.bookings - a.bookings || b.gmv - a.gmv).slice(0, 15),
    leaderboard: leaderboard.sort((a, b) => b.gmv - a.gmv || b.paidBookings - a.paidBookings).filter(a => a.paidBookings > 0).slice(0, 8),
    topRated: [...leaderboard].filter(a => a.reviewCount > 0).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 5),
    verification: { pending: pending.length, submitted,
      overdue: pending.filter(a => a.verificationSubmittedAt && now.getTime() - a.verificationSubmittedAt.getTime() > 48 * 3600000).length,
      averageHours: turnaround.length ? round(turnaround.reduce((a, b) => a + b, 0) / turnaround.length) : null,
      reviewed: reviewed.length, approved: reviewed.filter(a => a.verificationStatus === 'VERIFIED').length, rejected: reviewed.filter(a => a.verificationStatus === 'REJECTED').length },
    trends: [...trendMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
    bookingSummary: { total: bookings.length, completed: bookings.filter(b => b.status === 'COMPLETED').length, cancelled: bookings.filter(b => b.status === 'CANCELLED').length },
  };
}
