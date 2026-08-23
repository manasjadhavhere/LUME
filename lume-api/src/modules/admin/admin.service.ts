import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

// Get artists pending verification
export async function getPendingArtists() {
  return prisma.artistProfile.findMany({
    where: { verificationStatus: { in: ['PENDING', 'EDIT_REQUESTED'] } },
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

// Get all clients (for admin overview)
export async function getAllClients() {
  return prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
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

// Approve an edit request
export async function approveEditRequest(artistId: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  const updatedArtist = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      verificationStatus: 'EDIT_APPROVED',
      isVerified: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: artist.userId,
      title: 'Edit Request Approved',
      message: 'Your request to edit your profile has been approved. You can now make changes and submit for verification again.',
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
    prisma.artistProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
  ]);

  // Fetch data for charts (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1); // Start of that month

  const [recentUsers, recentBookings, allArtistsStatus] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, role: true }
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true }
    }),
    prisma.artistProfile.findMany({
      select: { verificationStatus: true }
    })
  ]);

  // Process User Growth Chart
  const userGrowthMap: Record<string, { month: string; clients: number; artists: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleString('default', { month: 'short' });
    userGrowthMap[monthStr] = { month: monthStr, clients: 0, artists: 0 };
  }

  recentUsers.forEach(u => {
    const monthStr = u.createdAt.toLocaleString('default', { month: 'short' });
    if (userGrowthMap[monthStr]) {
      if (u.role === 'CLIENT') userGrowthMap[monthStr].clients++;
      else if (u.role === 'ARTIST') userGrowthMap[monthStr].artists++;
    }
  });

  // Process Booking Trends Chart
  const bookingTrendsMap: Record<string, { month: string; completed: number; cancelled: number; other: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleString('default', { month: 'short' });
    bookingTrendsMap[monthStr] = { month: monthStr, completed: 0, cancelled: 0, other: 0 };
  }

  recentBookings.forEach(b => {
    const monthStr = b.createdAt.toLocaleString('default', { month: 'short' });
    if (bookingTrendsMap[monthStr]) {
      if (b.status === 'COMPLETED') bookingTrendsMap[monthStr].completed++;
      else if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') bookingTrendsMap[monthStr].cancelled++;
      else bookingTrendsMap[monthStr].other++;
    }
  });

  // Process Verification Distribution
  const verificationDist = {
    verified: 0,
    pending: 0,
    rejected: 0,
    other: 0
  };
  
  allArtistsStatus.forEach(a => {
    if (a.verificationStatus === 'VERIFIED') verificationDist.verified++;
    else if (a.verificationStatus === 'PENDING') verificationDist.pending++;
    else if (a.verificationStatus === 'REJECTED') verificationDist.rejected++;
    else verificationDist.other++;
  });

  return {
    totalUsers,
    totalArtists,
    pendingVerifications,
    totalBookings,
    verifiedArtists,
    charts: {
      userGrowth: Object.values(userGrowthMap),
      bookingTrends: Object.values(bookingTrendsMap),
      verificationDist: [
        { name: 'Verified', value: verificationDist.verified, color: '#10b981' },
        { name: 'Pending', value: verificationDist.pending, color: '#f59e0b' },
        { name: 'Rejected', value: verificationDist.rejected, color: '#ef4444' },
        { name: 'Other', value: verificationDist.other, color: '#64748b' }
      ].filter(d => d.value > 0)
    }
  };
}

export async function deleteUser(userId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Delete notifications related to user
    await tx.notification.deleteMany({
      where: { userId },
    });

    const artistProfile = await tx.artistProfile.findUnique({
      where: { userId },
    });

    if (artistProfile) {
      // Delete bookings associated with artist services (artist is provider)
      await tx.booking.deleteMany({
        where: { artistId: artistProfile.id },
      });

      // Delete services provided by artist
      await tx.service.deleteMany({
        where: { artistId: artistProfile.id },
      });

      // Delete reviews received by artist
      await tx.review.deleteMany({
        where: { artistId: artistProfile.id },
      });

      // Delete artist profile
      await tx.artistProfile.delete({
        where: { userId },
      });
    }

    // Delete bookings made by the user (as a client)
    await tx.booking.deleteMany({
      where: { clientId: userId },
    });

    // Delete reviews written by the user
    await tx.review.deleteMany({
      where: { clientId: userId },
    });

    // Delete client profile if exists
    await tx.clientProfile.deleteMany({
      where: { userId },
    });

    // Finally delete the user
    return tx.user.delete({
      where: { id: userId },
    });
  });
}

// Update booking status directly (admin override, ignores 48h limit)
export async function updateBookingStatusAdmin(artistId: string, isTakingBookings: boolean) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  return prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      isTakingBookings,
      lastBookingStatusChange: new Date(), // Optionally update the timer so artists are locked for 48h from admin's change
    },
  });
}
