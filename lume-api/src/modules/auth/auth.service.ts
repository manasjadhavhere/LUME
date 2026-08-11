import { z } from 'zod';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, signRefreshToken } from '../../lib/jwt';
import { createError } from '../../middleware/errorHandler';

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw createError('Email already in use', 409);

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      phone: data.phone,
      gender: data.gender as any,
      dob: data.dob ? new Date(data.dob) : undefined,
    },
  });

  // Create role-specific profile
  if (data.role === 'CLIENT') {
    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        mobileNumber: data.mobileNumber || data.phone,
        dob: data.dob ? new Date(data.dob) : undefined,
        location: data.location,
      },
    });
  } else if (data.role === 'ARTIST') {
    await prisma.artistProfile.create({
      data: {
        userId: user.id,
        location: data.location || 'Mumbai',
        bio: data.bio,
        specialties: data.specialties || [],
        experience: data.experience || 0,
      },
    });
  }

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
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: {
      artistProfile: { include: { services: { where: { isActive: true } } } },
      clientProfile: true,
    },
  });

  if (!user || !user.isActive) throw createError('Invalid email or password', 401);

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
