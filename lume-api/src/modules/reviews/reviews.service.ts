import { z } from 'zod';
import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().min(10, 'Review must be at least 10 characters'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export async function createReview(clientId: string, data: CreateReviewInput) {
  // Verify booking belongs to client and is completed
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, clientId, status: 'COMPLETED' },
  });
  if (!booking) throw createError('Booking not found or not completed', 400);

  // Check if review already exists
  const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
  if (existing) throw createError('Review already submitted for this booking', 409);

  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      clientId,
      artistId: booking.artistId,
      rating: data.rating,
      text: data.text,
    },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Update artist rating
  const allReviews = await prisma.review.aggregate({
    where: { artistId: booking.artistId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.artistProfile.update({
    where: { id: booking.artistId },
    data: {
      rating: allReviews._avg.rating || 0,
      reviewCount: allReviews._count,
    },
  });

  return review;
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
