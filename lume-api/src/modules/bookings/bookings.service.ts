import { formatSlot, sessionIntervals, slotMinutes } from './booking-time';
import type { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import { queueBookingEmail } from '../email/booking-email.service';
import {
  notifyBookingCreated,
  notifyBookingStatusChanged,
} from '../whatsapp/whatsapp.service';

export const createBookingSchema = z.object({
  artistId: z.string().min(1, 'Artist ID required'),
  serviceId: z.string().optional(),
  date: z.string().date(),
  time: z.string().min(1).max(220).refine(value => value.split(',').every(s => slotMinutes(s) !== null), 'Invalid time slot'),
  priceType: z.enum(['WEDDING', 'OCCASION', 'HOURLY']).default('OCCASION'),
  notes: z.string().optional(),
  address: z.string().trim().min(10).max(1500).regex(/\b[1-9]\d{5}$/, 'Include the full venue address and PIN code')
    .refine(value => value.split(',').filter(part => part.trim()).length >= 3, 'Include a building or venue, street and city'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export async function createBooking(clientId: string, data: CreateBookingInput) {
  // Verify artist exists and is verified
  const artist = await prisma.artistProfile.findUnique({ where: { id: data.artistId } });
  if (!artist) throw createError('Artist not found', 404);
  if (!artist.isVerified) throw createError('Artist is not yet verified', 400);
  if (artist.isTakingBookings === false) throw createError('Artist is not taking bookings', 400);

  // Calculate price based on priceType
  let totalPaid = 0;
  let duration: number | undefined;
  if (data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, artistId: data.artistId, isActive: true },
    });
    if (!service) throw createError('Service is not available for this artist', 400);
    totalPaid = service.price;
    duration = service.duration;
  } else if (data.priceType === 'WEDDING') {
    totalPaid = artist.weddingPrice || 0;
  } else if (data.priceType === 'OCCASION') {
    totalPaid = artist.occasionPrice || 0;
  } else if (data.priceType === 'HOURLY' && data.time) {
    // Calculate hours based on number of selected slots
    const slots = data.time.split(',').map(s => s.trim()).filter(Boolean);
    const hours = Math.max(1, slots.length);
    totalPaid = (artist.hourlyPrice || 0) * hours;
  }
  if (!Number.isFinite(totalPaid) || totalPaid <= 0) {
    throw createError('The selected booking option has no valid price', 400);
  }

  const date = new Date(data.date);
  const starts = data.time.split(',').map(s => slotMinutes(s));
  if (starts.some(s => s === null) || new Set(starts).size !== starts.length) {
    throw createError('Choose distinct valid time slots', 400);
  }
  const ordered = (starts as number[]).sort((a, b) => a - b);
  if (duration && ordered.length !== 1) throw createError('Choose one starting time for this service', 400);
  const time = ordered.map(formatSlot).join(', ');
  const end = duration ? ordered[0] + duration : null;
  if ((end ?? ordered[ordered.length - 1] + 60) > 1440) throw createError('Session extends beyond this day', 400);
  const endTime = end === null ? null : formatSlot(end);
  const requested = sessionIntervals({ time, endTime });
  const { booking, created } = await prisma.$transaction(async tx => {
    // Serialize reservations for this artist before reading the calendar.
    const [studio] = await tx.$queryRaw<{ isVerified: boolean; isTakingBookings: boolean }[]>
      `SELECT "isVerified", "isTakingBookings" FROM "artist_profiles" WHERE id = ${artist.id} FOR UPDATE`;
    if (!studio?.isVerified || !studio.isTakingBookings) throw createError('Artist is not taking bookings', 409);
    const reservations = await tx.booking.findMany({
      where: { artistId: artist.id, date, status: { not: 'CANCELLED' } },
    });
    const same = reservations.find(b => b.clientId === clientId && b.status === 'PENDING'
      && b.time === time && b.endTime === endTime && b.serviceId === (data.serviceId ?? null)
      && b.priceType === data.priceType && b.address === data.address && b.latitude === data.latitude
      && b.longitude === data.longitude && (b.notes || '') === (data.notes || '')
      && b.createdAt.getTime() >= Date.now() - 300000);
    if (same) return { booking: same, created: false };
    const occupied = reservations.flatMap(sessionIntervals);
    if (requested.some(i => occupied.some(b => i.start < b.end && b.start < i.end))) {
      throw createError('This slot was just booked. Choose another time.', 409);
    }
    const day = { artistId: artist.id, date };
    const [blocked, override, weekly] = await Promise.all([
      tx.blockedDate.findUnique({ where: { artistId_date: day } }),
      tx.availability.findUnique({ where: { artistId_date: day } }),
      tx.defaultSchedule.findUnique({ where: { artistId_dayOfWeek: { artistId: artist.id, dayOfWeek: date.getUTCDay() } } }),
    ]);
    const schedule = (override?.timeSlots ?? weekly?.timeSlots ?? []) as { time: string; available: boolean }[];
    const open = new Set(schedule.filter(s => s.available).map(s => slotMinutes(s.time)));
    const midnight = Date.parse(data.date + 'T00:00:00+05:30');
    for (const interval of requested) {
      if (midnight + interval.start * 60000 <= Date.now()) throw createError('Choose a future time', 400);
      for (let start = interval.start; start < interval.end; start += 60) {
        if (blocked || !open.has(start)) throw createError('The artist is unavailable at this time', 409);
      }
    }
    const booking = await tx.booking.create({
      data: { clientId, artistId: artist.id, serviceId: data.serviceId, date, time, endTime,
        priceType: data.priceType, totalPaid, notes: data.notes, address: data.address,
        latitude: data.latitude, longitude: data.longitude,
        googleMapsUrl: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`, status: 'PENDING' },
      include: {
        artist: { include: { user: { select: { name: true, avatarUrl: true } } } },
        service: true,
        client: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
    const message = `${data.date} at ${time} IST`;
    await tx.notification.createMany({ data: [
      { userId: clientId, title: 'Booking request sent', message, type: 'BOOKING_REQUESTED', link: '/profile' },
      { userId: artist.userId, title: 'New booking request', message, type: 'BOOKING_REQUESTED', link: '/artist-dashboard/bookings' },
    ] });
    return { booking, created: true };
  });
  if (!created) return booking;

  queueBookingEmail(booking, 'REQUESTED');

  // Asynchronously trigger WhatsApp notifications to both Client & Artist
  notifyBookingCreated(booking.id).catch(err => {
    console.error('[WhatsApp Trigger Failed on createBooking]:', err);
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
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          clientProfile: {
            select: { beautyPreferences: true, location: true },
          },
        },
      },
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

  const transitions: Record<string, string[]> = {
    PENDING: ['ACCEPTED', 'CANCELLED'], ACCEPTED: ['CANCELLED', 'CONFIRMED', 'NO_SHOW'],
    PARTIALLY_PAID: ['COMPLETED', 'CANCELLED', 'NO_SHOW'], CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  };
  if (status === booking.status) return booking;
  if (!transitions[booking.status]?.includes(status)) throw createError('Invalid booking status change', 409);
  const updated = await prisma.$transaction(async tx => {
    const result = await tx.booking.update({
      where: { id: bookingId, status: booking.status },
      data: { status: status as BookingStatus, cancelReason },
    });
    if (status === 'COMPLETED') {
      await tx.artistProfile.update({ where: { id: profile.id }, data: {
        totalEarnings: { increment: booking.totalPaid }, bookingCount: { increment: 1 },
      } });
    }
    const title = status === 'ACCEPTED' ? 'Booking request approved'
      : status === 'CANCELLED' && booking.status === 'PENDING' ? 'Booking request declined'
      : 'Booking ' + status.toLowerCase();
    await tx.notification.create({ data: { userId: booking.clientId, title,
      message: booking.date.toISOString().slice(0, 10) + ' at ' + booking.time + ' IST',
      type: 'BOOKING_' + status, link: '/profile' } });
    return result;
  });
  if (updated.status === 'ACCEPTED' || updated.status === 'CONFIRMED') {
    queueBookingEmail(updated, updated.status);
  } else if (updated.status === 'CANCELLED') {
    queueBookingEmail(updated, booking.status === 'PENDING' ? 'DECLINED' : 'CANCELLED');
  }

  // Asynchronously notify Client of status change via WhatsApp
  notifyBookingStatusChanged(bookingId, status, cancelReason).catch(err => {
    console.error('[WhatsApp Trigger Failed on updateBookingStatus]:', err);
  });

  return updated;
}

export async function cancelBookingAsClient(clientId: string, bookingId: string, reason?: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId },
  });
  if (!booking) throw createError('Booking not found', 404);

  if (!['PENDING', 'ACCEPTED', 'CONFIRMED'].includes(booking.status)) {
    throw createError('Cannot cancel a completed or already cancelled booking', 400);
  }

  const updated = await prisma.$transaction(async tx => {
    const result = await tx.booking.update({
      where: { id: bookingId, status: booking.status },
      data: { status: 'CANCELLED', cancelReason: reason },
    });
    const artist = await tx.artistProfile.findUniqueOrThrow({ where: { id: booking.artistId }, select: { userId: true } });
    await tx.notification.create({ data: { userId: artist.userId, title: 'Client cancelled booking',
      message: booking.date.toISOString().slice(0, 10) + ' at ' + booking.time + ' IST',
      type: 'BOOKING_CANCELLED', link: '/artist-dashboard/bookings' } });
    return result;
  });
  queueBookingEmail(updated, 'CANCELLED');

  // Notify Artist of cancellation
  notifyBookingStatusChanged(bookingId, 'CANCELLED', reason).catch(err => {
    console.error('[WhatsApp Trigger Failed on cancelBookingAsClient]:', err);
  });

  return updated;
}

