import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0');
  return `${h}:00`;
});

export async function getAvailability(artistIdOrSlug: string, fromDate?: string, toDate?: string) {
  let artist = await prisma.artistProfile.findUnique({ where: { id: artistIdOrSlug } });
  if (!artist) {
    const all = await prisma.artistProfile.findMany({
      include: { user: { select: { name: true } } },
    });
    const target = artistIdOrSlug.toLowerCase().trim();
    const cleanTarget = target.replace(/[^a-z0-9]/g, '');
    const found = all.find(a => {
      const s = (a.user?.name || '')
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const c = (a.user?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return s === target || c === cleanTarget || a.id.toLowerCase() === target;
    });
    if (found) artist = found;
  }

  if (!artist) throw createError('Artist not found', 404);

  const realArtistId = artist.id;
  const where: any = { artistId: realArtistId };
  if (fromDate || toDate) {
    where.date = {};
    if (fromDate) where.date.gte = new Date(fromDate);
    if (toDate) where.date.lte = new Date(toDate);
  }

  const [availability, blockedDates, defaultSchedule] = await Promise.all([
    prisma.availability.findMany({ where, orderBy: { date: 'asc' } }),
    prisma.blockedDate.findMany({ where: { artistId: realArtistId }, orderBy: { date: 'asc' } }),
    prisma.defaultSchedule.findMany({ where: { artistId: realArtistId }, orderBy: { dayOfWeek: 'asc' } }),
  ]);

  return { availability, blockedDates, defaultSchedule };
}

export async function upsertAvailability(
  userId: string,
  artistId: string,
  date: string,
  timeSlots: Array<{ time: string; available: boolean }>
) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);
  if (profile.id !== artistId) throw createError('Unauthorized', 403);

  return prisma.availability.upsert({
    where: { artistId_date: { artistId, date: new Date(date) } },
    update: { timeSlots },
    create: { artistId, date: new Date(date), timeSlots },
  });
}

export async function setDefaultSchedule(
  userId: string,
  days: Array<{ dayOfWeek: number; timeSlots: Array<{ time: string; available: boolean }> }>
) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  // Upsert each day
  const results = await Promise.all(
    days.map(day =>
      prisma.defaultSchedule.upsert({
        where: { artistId_dayOfWeek: { artistId: profile.id, dayOfWeek: day.dayOfWeek } },
        update: { timeSlots: day.timeSlots },
        create: { artistId: profile.id, dayOfWeek: day.dayOfWeek, timeSlots: day.timeSlots },
      })
    )
  );
  return results;
}

export async function getMyDefaultSchedule(userId: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);
  return prisma.defaultSchedule.findMany({
    where: { artistId: profile.id },
    orderBy: { dayOfWeek: 'asc' },
  });
}

// Override a specific date based on a default schedule template
export async function applyDefaultToDate(userId: string, artistId: string, date: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);
  if (profile.id !== artistId) throw createError('Unauthorized', 403);

  const dayOfWeek = new Date(date).getDay();
  const defaultDay = await prisma.defaultSchedule.findUnique({
    where: { artistId_dayOfWeek: { artistId, dayOfWeek } },
  });

  const timeSlots = defaultDay
    ? (defaultDay.timeSlots as any[])
    : ALL_HOURS.map(time => ({ time, available: false }));

  return prisma.availability.upsert({
    where: { artistId_date: { artistId, date: new Date(date) } },
    update: { timeSlots },
    create: { artistId, date: new Date(date), timeSlots },
  });
}

export async function blockDate(userId: string, artistId: string, date: string, reason?: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);
  if (profile.id !== artistId) throw createError('Unauthorized', 403);

  return prisma.blockedDate.upsert({
    where: { artistId_date: { artistId, date: new Date(date) } },
    update: { reason },
    create: { artistId, date: new Date(date), reason },
  });
}

export async function unblockDate(userId: string, artistId: string, date: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);
  if (profile.id !== artistId) throw createError('Unauthorized', 403);

  return prisma.blockedDate.deleteMany({ where: { artistId, date: new Date(date) } });
}
