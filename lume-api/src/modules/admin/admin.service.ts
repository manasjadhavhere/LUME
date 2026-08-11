import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

// Get artists pending verification
export async function getPendingArtists() {
  return prisma.artistProfile.findMany({
    where: { verificationStatus: 'PENDING' },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      services: { where: { isActive: true } },
    },
    orderBy: { verificationSubmittedAt: 'asc' },
  });
}

// Get all artists (for admin overview)
export async function getAllArtistsAdmin() {
  return prisma.artistProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Approve an artist
export async function verifyArtist(artistId: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  return prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      isVerified: true,
      verificationStatus: 'VERIFIED',
      badge: 'VERIFIED',
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

// Reject an artist
export async function rejectArtist(artistId: string, reason?: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  return prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      isVerified: false,
      verificationStatus: 'REJECTED',
    },
  });
}

// Admin stats
export async function getAdminStats() {
  const [
    totalUsers,
    totalArtists,
    pendingVerifications,
    totalBookings,
    verifiedArtists,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.artistProfile.count(),
    prisma.artistProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.booking.count(),
    prisma.artistProfile.count({ where: { isVerified: true } }),
  ]);

  return {
    totalUsers,
    totalArtists,
    pendingVerifications,
    totalBookings,
    verifiedArtists,
  };
}
