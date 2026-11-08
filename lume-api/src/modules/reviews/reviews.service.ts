import { hasBookingDateTimePassed } from '../bookings/booking-time';
export { hasBookingDateTimePassed } from '../bookings/booking-time';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10, 'Review must be at least 10 characters').max(5000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export async function createReview(clientId: string, data: CreateReviewInput) {
  return prisma.$transaction(async tx => {
    const booking = await tx.booking.findFirst({ where: { id: data.bookingId, clientId } });
    if (!booking || !['ACCEPTED', 'PARTIALLY_PAID', 'CONFIRMED', 'COMPLETED'].includes(booking.status)
      || !hasBookingDateTimePassed(booking)) {
      throw createError('Reviews open after your appointment ends', 400);
    }
    await tx.$queryRaw`SELECT id FROM "artist_profiles" WHERE id = ${booking.artistId} FOR UPDATE`;
    const existing = await tx.review.findUnique({ where: { bookingId: booking.id } });
    if (existing) throw createError('Review already submitted for this booking', 409);
    const review = await tx.review.create({
      data: { ...data, clientId, artistId: booking.artistId },
      include: { client: { select: { id: true, name: true, avatarUrl: true } } },
    });
    const stats = await tx.review.aggregate({ where: { artistId: booking.artistId }, _avg: { rating: true }, _count: true });
    const artist = await tx.artistProfile.update({
      where: { id: booking.artistId }, data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
    });
    await tx.notification.create({ data: { userId: artist.userId, title: 'New client review',
      message: review.client.name + ' rated their appointment ' + review.rating + '/5.',
      type: 'REVIEW', link: '/artist-dashboard/ratings' } });
    return review;
  });
}

export async function getArtistReviews(artistId: string) {
  const [reviews, stats] = await Promise.all([
    prisma.review.findMany({
      where: { artistId },
      include: {
        client: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { artistId },
      _count: true,
    }),
  ]);

  // Build rating distribution (1-5 stars)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of stats) {
    distribution[Math.round(s.rating)] = (distribution[Math.round(s.rating)] || 0) + s._count;
  }

  return { reviews, distribution };
}

export async function replyToReview(userId: string, reviewId: string, reply: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const review = await prisma.review.findFirst({
    where: { id: reviewId, artistId: profile.id },
  });
  if (!review) throw createError('Review not found', 404);

  return prisma.review.update({
    where: { id: reviewId },
    data: { reply },
  });
}
