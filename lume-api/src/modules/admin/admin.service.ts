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
export async function verifyArtist(artistId: string, remarks?: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  const updatedArtist = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      isVerified: true,
      verificationStatus: 'VERIFIED',
      badge: 'VERIFIED',
      verificationRemarks: remarks || null,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: artist.userId,
      title: 'Profile Verified',
      message: 'Congratulations! Your artist profile has been verified.' + (remarks ? ` Admin remarks: ${remarks}` : ''),
      type: 'VERIFICATION',
    },
  });

  return updatedArtist;
}

// Reject an artist
export async function rejectArtist(artistId: string, reason?: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  const updatedArtist = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      isVerified: false,
      verificationStatus: 'REJECTED',
      verificationRemarks: reason || null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: artist.userId,
      title: 'Verification Update',
      message: 'Your verification request requires attention.' + (reason ? ` Admin remarks: ${reason}` : ''),
      type: 'VERIFICATION',
    },
  });

  return updatedArtist;
}

// Update artist fully (admin edit)
export async function updateArtistAdmin(artistId: string, data: any) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId }, include: { user: true } });
  if (!artist) throw createError('Artist not found', 404);

  const updatedArtist = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      bio: data.bio,
      location: data.location,
      experience: data.experience,
      certification: data.certification,
      badge: data.badge,
      verificationStatus: data.verificationStatus,
      isVerified: data.verificationStatus === 'VERIFIED',
      startingPrice: data.startingPrice,
      weddingPrice: data.weddingPrice,
      occasionPrice: data.occasionPrice,
      hourlyPrice: data.hourlyPrice,
      verificationRemarks: data.remarks || null,
    },
  });
  
  if (data.name) {
    await prisma.user.update({
      where: { id: artist.userId },
      data: { name: data.name },
    });
  }

  if (data.remarks) {
    await prisma.notification.create({
      data: {
        userId: artist.userId,
        title: 'Profile Updated by Admin',
        message: `Your profile has been updated by an admin. Remarks: ${data.remarks}`,
        type: 'SYSTEM',
      },
    });
  }

  return updatedArtist;
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
