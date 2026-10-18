import prisma from '../../lib/prisma';
import { buildInsightMetrics } from './insights.metrics';

export async function getAdvancedInsights(days: number | null) {
  const now = new Date();
  const since = days ? new Date(now.getTime() - days * 86400000) : undefined;
  const createdAt = since ? { gte: since } : undefined;
  const [payments, artists, bookings, payoutGroups, failedTransfers, recentPayouts, reviews, audit] = await Promise.all([
    prisma.paymentRecord.findMany({ where: { createdAt }, include: { booking: { select: { priceType: true, artistId: true, status: true, artist: { select: { location: true, user: { select: { name: true } } } } } } } }),
    prisma.artistProfile.findMany({ select: { id: true, location: true, rating: true, reviewCount: true, isVerified: true, isAvailable: true, isTakingBookings: true,
      verificationStatus: true, verificationSubmittedAt: true, verificationReviewedAt: true, user: { select: { name: true, isActive: true } } } }),
    prisma.booking.findMany({ where: { createdAt }, select: { id: true, status: true, artistId: true, createdAt: true,
      artist: { select: { location: true, user: { select: { name: true } } } }, client: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.paymentRecord.groupBy({ by: ['payoutStatus'], _sum: { artistPayout: true }, _count: { id: true } }),
    prisma.paymentRecord.count({ where: { transferStatus: 'FAILED', payoutStatus: { not: 'COMPLETED' } } }),
    prisma.paymentRecord.findMany({ where: { payoutStatus: 'COMPLETED', payoutCompletedAt: since ? { gte: since } : { not: null } }, take: 15, orderBy: { payoutCompletedAt: 'desc' }, select: { id: true, artistPayout: true, payoutCompletedAt: true, booking: { select: { artist: { select: { user: { select: { name: true } } } } } } } }),
    prisma.review.findMany({ where: { createdAt, rating: { gte: 5 } }, take: 15, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, client: { select: { name: true } }, artist: { select: { user: { select: { name: true } } } } } }),
    prisma.adminAuditLog.findMany({ where: { createdAt }, take: 30, orderBy: { createdAt: 'desc' } }),
  ]);
  const metrics = buildInsightMetrics(payments, artists, bookings, now, since);
  const payouts = Object.fromEntries(payoutGroups.map(g => [g.payoutStatus.toLowerCase(), { amount: Math.round((g._sum.artistPayout || 0) * 100) / 100, count: g._count.id }]));
  const activity = [
    ...bookings.slice(0, 20).map(b => ({ id: `booking-${b.id}`, type: 'booking', at: b.createdAt, title: 'Booking created', detail: `${b.client.name} booked ${b.artist.user.name} · ${b.status.replace(/_/g, ' ').toLowerCase()}`, artistId: b.artistId })),
    ...artists.filter(a => a.verificationSubmittedAt && (!since || a.verificationSubmittedAt >= since)).map(a => ({ id: `verification-${a.id}`, type: 'verification', at: a.verificationSubmittedAt!, title: 'Verification submitted', detail: a.user.name, artistId: a.id })),
    ...recentPayouts.map(p => ({ id: `payout-${p.id}`, type: 'payout', at: p.payoutCompletedAt!, title: 'Payout completed', detail: `${p.booking.artist.user.name} · ₹${p.artistPayout.toLocaleString('en-IN')}` })),
    ...reviews.map(r => ({ id: `review-${r.id}`, type: 'review', at: r.createdAt, title: 'Five-star review', detail: `${r.client.name} reviewed ${r.artist.user.name}` })),
    ...audit.map(a => ({ id: `audit-${a.id}`, type: 'admin', at: a.createdAt, title: a.action, detail: `${a.actorName} · ${a.targetId}` })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 40);
  return { ...metrics, generatedAt: now, days, payouts, failedTransfers, activity, audit };
}
