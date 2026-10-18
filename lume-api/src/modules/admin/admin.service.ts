import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';
import crypto from 'crypto';
import { z } from 'zod';
import { artistEditSchema } from './admin.validation';

// ── Safe bank account mask helper (no routes/imports needed) ─────
const ALGORITHM = 'aes-256-cbc';
function _safeDecryptLast4(encryptedHex: string): string {
  try {
    const keyHex = process.env.BANK_ENCRYPTION_KEY || '';
    if (!keyHex || keyHex.length < 32) return '****';
    const key = Buffer.from(keyHex.substring(0, 32), 'utf8');
    const [ivHex, encHex] = encryptedHex.split(':');
    if (!ivHex || !encHex) return '****';
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    return plain.length <= 4 ? '****' : '****' + plain.slice(-4);
  } catch {
    return '****';
  }
}

// Get artists pending verification
export async function getPendingArtists() {
  const artists = await prisma.artistProfile.findMany({
    where: { verificationStatus: { in: ['PENDING', 'EDIT_REQUESTED'] } },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      services: { where: { isActive: true } },
      bankAccount: {
        select: {
          id: true,
          accountHolderName: true,
          encryptedAccountNumber: true,
          ifscCode: true,
          bankName: true,
          accountType: true,
          isVerified: true,
          razorpayLinkedAccountId: true,
          isLinkedToRazorpay: true,
          createdAt: true,
        },
      },
    },
    orderBy: { verificationSubmittedAt: 'asc' },
  });
  // Mask encrypted account numbers before returning
  return artists.map(a => ({
    ...a,
    bankAccount: a.bankAccount ? {
      id: a.bankAccount.id,
      accountHolderName: a.bankAccount.accountHolderName,
      maskedAccountNumber: _safeDecryptLast4(a.bankAccount.encryptedAccountNumber),
      ifscCode: a.bankAccount.ifscCode,
      bankName: a.bankAccount.bankName,
      accountType: a.bankAccount.accountType,
      isVerified: a.bankAccount.isVerified,
      razorpayLinkedAccountId: a.bankAccount.razorpayLinkedAccountId,
      isLinkedToRazorpay: a.bankAccount.isLinkedToRazorpay,
      createdAt: a.bankAccount.createdAt,
    } : null,
  }));
}

// Get all artists (for admin overview)
export async function getAllArtistsAdmin() {
  const artists = await prisma.artistProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      services: { where: { isActive: true } },
      bankAccount: {
        select: {
          id: true,
          accountHolderName: true,
          encryptedAccountNumber: true,
          ifscCode: true,
          bankName: true,
          accountType: true,
          isVerified: true,
          razorpayLinkedAccountId: true,
          isLinkedToRazorpay: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  // Mask encrypted account numbers before returning
  return artists.map(a => ({
    ...a,
    bankAccount: a.bankAccount ? {
      id: a.bankAccount.id,
      accountHolderName: a.bankAccount.accountHolderName,
      maskedAccountNumber: _safeDecryptLast4(a.bankAccount.encryptedAccountNumber),
      ifscCode: a.bankAccount.ifscCode,
      bankName: a.bankAccount.bankName,
      accountType: a.bankAccount.accountType,
      isVerified: a.bankAccount.isVerified,
      razorpayLinkedAccountId: a.bankAccount.razorpayLinkedAccountId,
      isLinkedToRazorpay: a.bankAccount.isLinkedToRazorpay,
      createdAt: a.bankAccount.createdAt,
    } : null,
  }));
}

// Get all clients (for admin overview)
export async function getAllClients() {
  return prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true, phone: true, isActive: true,
      clientProfile: { select: { location: true, mobileNumber: true } },
      bookingsAsClient: { orderBy: { createdAt: 'desc' }, select: { id: true, date: true, status: true, priceType: true,
        artist: { select: { user: { select: { name: true } } } }, paymentRecords: { select: { id: true, totalCharged: true } } } },
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
      verificationReviewedAt: new Date(),
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
      verificationReviewedAt: new Date(),
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
export async function updateArtistAdmin(artistId: string, data: z.infer<typeof artistEditSchema>) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId }, include: { user: true } });
  if (!artist) throw createError('Artist not found', 404);

  const updatedArtist = await prisma.artistProfile.update({
    where: { id: artistId },
    data: {
      bio: data.bio,
      location: data.location,
      experience: data.experience,
      certification: data.certification,
      badge: data.badge === '' ? null : data.badge,
      verificationStatus: data.verificationStatus,
      isVerified: data.verificationStatus ? data.verificationStatus === 'VERIFIED' : undefined,
      verificationReviewedAt: data.verificationStatus && ['VERIFIED', 'REJECTED'].includes(data.verificationStatus) && data.verificationStatus !== artist.verificationStatus ? new Date() : undefined,
      gender: data.gender === '' ? null : data.gender,
      dob: data.dob === '' ? null : data.dob ? new Date(data.dob) : undefined,
      instagramUrl: data.instagramUrl,
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

// Remove an artist document (admin)
export async function removeArtistDocument(artistId: string, fileUrl: string, type: 'certification' | 'portfolio') {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw createError('Artist not found', 404);

  if (type === 'certification') {
    const updatedFiles = artist.certificationFiles.filter(f => f !== fileUrl);
    return prisma.artistProfile.update({
      where: { id: artistId },
      data: { certificationFiles: updatedFiles },
      include: { user: { select: { id: true, name: true } } }
    });
  } else {
    const updatedUrls = artist.portfolioUrls.filter(u => u !== fileUrl);
    return prisma.artistProfile.update({
      where: { id: artistId },
      data: { portfolioUrls: updatedUrls },
      include: { user: { select: { id: true, name: true } } }
    });
  }
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
  return prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id: userId }, include: { artistProfile: true } });
    if (!user) throw createError('User not found', 404);
    if (user.role === 'ADMIN') throw createError('Administrator accounts cannot be deleted here.', 403);
    const bookings = await tx.booking.count({ where: { OR: [{ clientId: userId }, ...(user.artistProfile ? [{ artistId: user.artistProfile.id }] : [])] } });
    if (bookings) throw createError('This account has booking history. Its bookings and financial records must be retained; deletion is unavailable.', 409);
    await tx.user.delete({ where: { id: userId } });
    return { deleted: true };
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
      lastBookingStatusChange: new Date(),
    },
  });
}

// ── Admin Payment Tracking ─────────────────────────────────────────────────────

/**
 * Returns all artists that have at least one booking with PaymentRecords.
 * Includes aggregated payout summary per artist.
 */
export async function getArtistPaymentSummaries() {
  const artists = await prisma.artistProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      bankAccount: {
        select: {
          id: true,
          accountHolderName: true,
          ifscCode: true,
          bankName: true,
          accountType: true,
          isVerified: true,
          isLinkedToRazorpay: true,
          razorpayLinkedAccountId: true,
        },
      },
      bookings: {
        include: {
          paymentRecords: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return artists.map(artist => {
    const allRecords = artist.bookings.flatMap(b => b.paymentRecords);
    const totalCharged     = allRecords.reduce((s, r) => s + r.totalCharged, 0);
    const totalLume        = allRecords.reduce((s, r) => s + r.lumeCommission, 0);
    const totalArtist      = allRecords.reduce((s, r) => s + r.artistPayout, 0);
    const pendingPayout    = allRecords.filter(r => r.payoutStatus !== 'COMPLETED').reduce((s, r) => s + r.artistPayout, 0);
    const completedPayout  = allRecords.filter(r => r.payoutStatus === 'COMPLETED').reduce((s, r) => s + r.artistPayout, 0);
    const bookingsWithPayment = artist.bookings.filter(b => b.paymentRecords.length > 0).length;

    return {
      artistId: artist.id,
      user: artist.user,
      bankAccount: artist.bankAccount,
      totalBookings: artist.bookings.length,
      bookingsWithPayment,
      totalCharged,
      totalLume,
      totalArtistDue: totalArtist,
      pendingPayout,
      completedPayout,
    };
  });
}

/**
 * Returns all bookings + PaymentRecords for a single artist.
 */
export async function getArtistPaymentDetail(artistId: string) {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      bankAccount: { select: { id: true, accountHolderName: true, ifscCode: true, bankName: true, accountType: true, isVerified: true, isLinkedToRazorpay: true, razorpayLinkedAccountId: true } },
      bookings: {
        orderBy: { createdAt: 'desc' },
        include: {
          paymentRecords: { orderBy: { createdAt: 'asc' } },
          client: { select: { id: true, name: true, email: true } },
          service: { select: { name: true, price: true } },
        },
      },
    },
  });

  if (!artist) throw createError('Artist not found', 404);
  return artist;
}

/**
 * Returns the Lume platform's total earnings from commissions + GST.
 * Only counts COMPLETED payouts as "received".
 */
export async function getLumeEarnings() {
  const allRecords = await prisma.paymentRecord.findMany({
    include: {
      booking: {
        include: {
          artist: { include: { user: { select: { name: true } } } },
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarned    = allRecords.reduce((s, r) => s + r.lumeTotal, 0);
  const totalReceived  = allRecords.filter(r => r.payoutStatus === 'COMPLETED').reduce((s, r) => s + r.lumeTotal, 0);
  const totalPending   = allRecords.filter(r => r.payoutStatus === 'PENDING').reduce((s, r) => s + r.lumeTotal, 0);

  return { totalEarned, totalReceived, totalPending, totalCollections: allRecords.reduce((s, r) => s + r.totalCharged, 0), totalGst: allRecords.reduce((s, r) => s + r.gstAmount, 0), records: [] };
}

/**
 * Marks a PaymentRecord's payout status as COMPLETED (admin confirms transfer was done).
 */
export async function markPayoutCompleted(paymentRecordId: string) {
  const record = await prisma.paymentRecord.findUnique({ where: { id: paymentRecordId } });
  if (!record) throw createError('Payment record not found', 404);
  if (record.payoutStatus === 'COMPLETED') return record;
  if (record.payoutStatus === 'INITIATED') throw createError('This payout is already in progress. Confirm its gateway status before marking it paid.', 409);

  return prisma.paymentRecord.update({
    where: { id: paymentRecordId },
    data: {
      payoutStatus: 'COMPLETED',
      payoutCompletedAt: new Date(),
    },
  });
}
