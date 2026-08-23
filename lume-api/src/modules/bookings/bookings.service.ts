import { z } from 'zod';
import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const createBookingSchema = z.object({
  artistId: z.string().min(1, 'Artist ID required'),
  serviceId: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  time: z.string().min(1, 'Time required'),
  endTime: z.string().optional(),
  priceType: z.enum(['WEDDING', 'OCCASION', 'HOURLY']).default('OCCASION'),
  notes: z.string().optional(),
  address: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export async function createBooking(clientId: string, data: CreateBookingInput) {
  // Verify artist exists and is verified
  const artist = await prisma.artistProfile.findUnique({ where: { id: data.artistId } });
  if (!artist) throw createError('Artist not found', 404);
  if (!artist.isVerified) throw createError('Artist is not yet verified', 400);

  // Calculate price based on priceType
  let totalPaid = 0;
  if (data.priceType === 'WEDDING') {
    totalPaid = artist.weddingPrice || 0;
  } else if (data.priceType === 'OCCASION') {
    totalPaid = artist.occasionPrice || 0;
  } else if (data.priceType === 'HOURLY' && data.time) {
    // Calculate hours based on number of selected slots
    const slots = data.time.split(',').map(s => s.trim()).filter(Boolean);
    const hours = Math.max(1, slots.length);
    totalPaid = (artist.hourlyPrice || 0) * hours;
  } else if (data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, artistId: data.artistId, isActive: true },
    });
    if (service) totalPaid = service.price;
  }

  // Idempotency / duplicate check (prevent multiple clicks)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existingBooking = await prisma.booking.findFirst({
    where: {
      clientId,
      artistId: data.artistId,
      date: new Date(data.date),
      time: data.time,
      createdAt: { gte: fiveMinutesAgo }
    }
  });

  if (existingBooking) {
    return existingBooking; // return the existing one instead of failing or duplicating
  }

  const booking = await prisma.booking.create({
    data: {
      clientId,
      artistId: data.artistId,
      serviceId: data.serviceId || undefined,
      date: new Date(data.date),
      time: data.time,
      endTime: data.endTime,
      priceType: data.priceType as any,
      totalPaid,
      notes: data.notes,
      address: data.address,
      status: 'PENDING',
    },
    include: {
      artist: { include: { user: { select: { name: true, avatarUrl: true } } } },
      service: true,
      client: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return booking;
}

export async function getClientBookings(clientId: string, status?: string) {
  const where: any = { clientId };
  if (status) where.status = status;

  return prisma.booking.findMany({
    where,
    include: {
      artist: {
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
      service: true,
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getArtistBookings(userId: string, status?: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const where: any = { artistId: profile.id };
  if (status) where.status = status;

  return prisma.booking.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true, avatarUrl: true } },
      service: true,
      review: true,
    },
    orderBy: { date: 'asc' },
  });
}

export async function updateBookingStatus(
  userId: string,
  bookingId: string,
  status: string,
  cancelReason?: string
) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, artistId: profile.id },
  });
  if (!booking) throw createError('Booking not found', 404);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: status as any,
      cancelReason,
      ...(status === 'COMPLETED' && { /* trigger earnings update */ }),
    },
  });

  // If completed, update artist earnings
  if (status === 'COMPLETED') {
    await prisma.artistProfile.update({
      where: { id: profile.id },
      data: {
        totalEarnings: { increment: booking.totalPaid },
        bookingCount: { increment: 1 },
      },
    });
  }

  return updated;
}

export async function cancelBookingAsClient(clientId: string, bookingId: string, reason?: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId },
  });
  if (!booking) throw createError('Booking not found', 404);

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw createError('Cannot cancel a completed or already cancelled booking', 400);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED', cancelReason: reason },
  });
}
