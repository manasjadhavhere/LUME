import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, signRefreshToken } from '../../lib/jwt';
import { createError } from '../../middleware/errorHandler';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email').transform(v => v.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['CLIENT', 'ARTIST']).default('CLIENT'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dob: z.string().optional(),
  mobileNumber: z.string().optional(),
  // Artist-only fields
  location: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experience: z.number().int().min(0).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email').transform(v => v.toLowerCase()),
  password: z.string().min(1, 'Password required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findFirst({ where: { email: { equals: data.email, mode: 'insensitive' } } });
  if (existing) throw createError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email, passwordHash, name: data.name, role: data.role,
      phone: data.phone, gender: data.gender, dob: data.dob ? new Date(data.dob) : undefined,
      ...(data.role === 'CLIENT'
        ? { clientProfile: { create: { mobileNumber: data.mobileNumber || data.phone, dob: data.dob ? new Date(data.dob) : undefined, location: data.location } } }
        : { artistProfile: { create: { location: data.location || '', bio: data.bio, specialties: data.specialties || [], experience: data.experience || 0 } } }),
    },
  });

  const payload = { userId: user.id, email: user.email, role: user.role };
  const token = signToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Return full user with profile for immediate use
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      artistProfile: { include: { services: true } },
      clientProfile: true,
    },
  });
  const { passwordHash: _, ...userWithoutPassword } = fullUser!;

  return {
    token,
    refreshToken,
    user: userWithoutPassword,
  };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findFirst({
    where: { email: { equals: data.email, mode: 'insensitive' } },
    include: {
      artistProfile: { include: { services: { where: { isActive: true } } } },
      clientProfile: true,
    },
  });

  if (!user || !user.isActive || !user.passwordHash) throw createError('Invalid email or password. If you joined with Google, use Continue with Google.', 401);

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValidPassword) throw createError('Invalid email or password', 401);

  const payload = { userId: user.id, email: user.email, role: user.role };
  const token = signToken(payload);
  const refreshToken = signRefreshToken(payload);

  const { passwordHash, ...userWithoutPassword } = user;

  return {
    token,
    refreshToken,
    user: userWithoutPassword,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      artistProfile: {
        include: { services: true },
      },
      clientProfile: true,
    },
  });

  if (!user) throw createError('User not found', 404);

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

const savedAddress = z.object({
  id: z.string().min(1).max(120),
  label: z.string().trim().min(1).max(80),
  apartment: z.string().max(240).optional(),
  street: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(120),
  pincode: z.string().regex(/^\d{6}$/),
  landmark: z.string().max(240).optional(),
  recipientName: z.string().max(120).optional(),
  isDefault: z.boolean().optional(),
  formattedGeoAddress: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const updateMeSchema = z.object({
  previousAddresses: z.array(savedAddress).max(100).optional(),
  savedAddresses: z.array(savedAddress).max(100).optional(),
  beautyPreferences: z.object({
    styles: z.array(z.string().trim().min(1).max(100)).max(30),
    skinType: z.string().max(100),
    undertone: z.string().max(100),
    specialRequests: z.string().max(3000),
  }).optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^(\+91[\s-]?)?\d{10}$/, 'Phone number must be a valid 10-digit number').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  dob: z.string().optional().or(z.literal('')), // Should ideally be .date() or proper string, keeping it simple
  // Profile fields
  location: z.string().optional(),
  bio: z.string().optional(),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Aadhar number must be exactly 12 digits').optional().or(z.literal('')),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export async function updateMe(userId: string, data: UpdateMeInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  await prisma.$transaction(async tx => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        gender: data.gender as any,
        dob: data.dob ? new Date(data.dob) : undefined,
      },
    });

    if (user.role === 'CLIENT') {
      if (data.savedAddresses && data.previousAddresses) {
        const current = await tx.clientProfile.findUnique({ where: { userId }, select: { savedAddresses: true } });
        if (!isDeepStrictEqual(current?.savedAddresses || [], data.previousAddresses)) {
          throw createError('Your addresses changed on another device. Refresh the page and try again.', 409);
        }
      }
      await tx.clientProfile.upsert({
        where: { userId },
        update: {
          location: data.location,
          bio: data.bio,
          aadharNumber: data.aadharNumber,
          dob: data.dob ? new Date(data.dob) : undefined,
          mobileNumber: data.phone,
          savedAddresses: data.savedAddresses,
          beautyPreferences: data.beautyPreferences,
        },
        create: {
          userId,
          location: data.location,
          bio: data.bio,
          aadharNumber: data.aadharNumber,
          dob: data.dob ? new Date(data.dob) : undefined,
          mobileNumber: data.phone,
          savedAddresses: data.savedAddresses,
          beautyPreferences: data.beautyPreferences,
        },
      });
    } else if (user.role === 'ARTIST') {
      await tx.artistProfile.upsert({
        where: { userId },
        update: {
          location: data.location,
          bio: data.bio,
        },
        create: {
          userId,
          location: data.location || 'Mumbai',
          bio: data.bio,
          experience: 0,
        },
      });
    }
  });

  return getMe(userId);
}
