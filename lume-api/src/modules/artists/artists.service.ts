import { z } from 'zod';
import prisma from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const updateProfileSchema = z.object({
  bio: z.string().optional(),
  location: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  certification: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dob: z.string().optional(),
});

export const pricingSchema = z.object({
  weddingPrice: z.number().min(0).optional(),
  occasionPrice: z.number().min(0).optional(),
  hourlyPrice: z.number().min(0).optional(),
});

export const addServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  icon: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddServiceInput = z.infer<typeof addServiceSchema>;
export type PricingInput = z.infer<typeof pricingSchema>;

export async function getAllArtists(query: {
  specialty?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { specialty, location, search, page = 1, limit = 20, minPrice, maxPrice } = query;

  const where: any = {};

  if (specialty && specialty !== 'All') {
    where.specialties = { has: specialty };
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (minPrice || maxPrice) {
    where.startingPrice = {};
    if (minPrice) where.startingPrice.gte = minPrice;
    if (maxPrice) where.startingPrice.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { location: { contains: search, mode: 'insensitive' } },
      { specialties: { has: search } },
    ];
  }

  const [artists, total] = await Promise.all([
    prisma.artistProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        services: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.artistProfile.count({ where }),
  ]);

  return {
    artists,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getArtistById(artistId: string) {
  const artist = await prisma.artistProfile.findFirst({
    where: { id: artistId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      services: { where: { isActive: true }, orderBy: { price: 'asc' } },
      reviews: {
        include: {
          client: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!artist) throw createError('Artist not found', 404);
  return artist;
}

export async function getArtistByUserId(userId: string) {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      services: { where: { isActive: true }, orderBy: { price: 'asc' } },
    },
  });
  if (!artist) throw createError('Artist profile not found', 404);
  return artist;
}

export async function updateArtistProfile(userId: string, data: UpdateProfileInput) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const { gender, dob, ...rest } = data as any;

  return prisma.artistProfile.update({
    where: { userId },
    data: {
      ...rest,
      ...(gender ? { gender: gender as any } : {}),
      ...(dob ? { dob: new Date(dob) } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      services: { where: { isActive: true } },
    },
  });
}

export async function addService(userId: string, data: AddServiceInput) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  return prisma.service.create({
    data: {
      artistId: profile.id,
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      icon: data.icon || '✨',
    },
  });
}

export async function updateService(userId: string, serviceId: string, data: Partial<AddServiceInput>) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const service = await prisma.service.findFirst({
    where: { id: serviceId, artistId: profile.id },
  });
  if (!service) throw createError('Service not found', 404);

  return prisma.service.update({ where: { id: serviceId }, data });
}

export async function deleteService(userId: string, serviceId: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const service = await prisma.service.findFirst({
    where: { id: serviceId, artistId: profile.id },
  });
  if (!service) throw createError('Service not found', 404);

  return prisma.service.update({ where: { id: serviceId }, data: { isActive: false } });
}

export async function addPortfolioUrl(userId: string, url: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  return prisma.artistProfile.update({
    where: { userId },
    data: { portfolioUrls: { push: url } },
  });
}

export async function addPortfolioImages(userId: string, urls: string[]) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  const updated = await prisma.artistProfile.update({
    where: { userId },
    data: { portfolioUrls: { push: urls } },
  });
  return updated;
}

export async function removePortfolioImage(userId: string, url: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  return prisma.artistProfile.update({
    where: { userId },
    data: { portfolioUrls: profile.portfolioUrls.filter(u => u !== url) },
  });
}

export async function updateProfileImage(userId: string, url: string) {
  // Update both artistProfile and user avatarUrl
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
  return prisma.artistProfile.update({
    where: { userId },
    data: { profileImageUrl: url },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } }, services: true },
  });
}

export async function addCertificationFiles(userId: string, urls: string[]) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  return prisma.artistProfile.update({
    where: { userId },
    data: { certificationFiles: { push: urls } },
  });
}

export async function submitForVerification(userId: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  if (profile.verificationStatus === 'VERIFIED') {
    throw createError('Artist is already verified', 400);
  }

  return prisma.artistProfile.update({
    where: { userId },
    data: {
      verificationStatus: 'PENDING',
      verificationSubmittedAt: new Date(),
    },
  });
}

export async function requestEditAccess(userId: string) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId }, include: { user: true } });
  if (!profile) throw createError('Artist profile not found', 404);

  if (profile.verificationStatus !== 'VERIFIED') {
    throw createError('Only verified artists can request edit access', 400);
  }

  const updated = await prisma.artistProfile.update({
    where: { userId },
    data: { verificationStatus: 'EDIT_REQUESTED', verificationSubmittedAt: new Date() },
  });

  // Notify Admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map(a => ({
        userId: a.id,
        title: 'Edit Access Requested',
        message: `Artist ${profile.user.name} has requested permission to edit their verified profile.`,
        type: 'VERIFICATION',
      })),
    });
  }

  return updated;
}

export async function updatePricing(userId: string, data: PricingInput) {
  const profile = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!profile) throw createError('Artist profile not found', 404);

  // Calculate startingPrice as the minimum non-null price
  const prices = [data.weddingPrice, data.occasionPrice, data.hourlyPrice].filter(p => p != null) as number[];
  const startingPrice = prices.length > 0 ? Math.min(...prices) : profile.startingPrice;

  return prisma.artistProfile.update({
    where: { userId },
    data: {
      weddingPrice: data.weddingPrice,
      occasionPrice: data.occasionPrice,
      hourlyPrice: data.hourlyPrice,
      startingPrice,
    },
  });
}

export async function getArtistStats(userId: string) {
  const profile = await prisma.artistProfile.findUnique({
    where: { userId },
    include: { services: { where: { isActive: true } } },
  });
  if (!profile) throw createError('Artist profile not found', 404);

  const [
    pendingBookings,
    upcomingBookings,
    completedBookings,
    thisMonthEarnings,
  ] = await Promise.all([
    prisma.booking.count({ where: { artistId: profile.id, status: 'PENDING' } }),
    prisma.booking.findMany({
      where: {
        artistId: profile.id,
        status: 'CONFIRMED',
        date: { gte: new Date() },
      },
      include: {
        client: { select: { name: true, avatarUrl: true } },
        service: true,
      },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.booking.count({ where: { artistId: profile.id, status: 'COMPLETED' } }),
    prisma.booking.aggregate({
      where: {
        artistId: profile.id,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { totalPaid: true },
    }),
  ]);

  return {
    profile,
    stats: {
      pendingBookings,
      completedBookings,
      upcomingBookings,
      thisMonthEarnings: thisMonthEarnings._sum.totalPaid || 0,
      totalEarnings: profile.totalEarnings,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      responseRate: profile.responseRate,
      completionRate: profile.completionRate,
    },
  };
}
