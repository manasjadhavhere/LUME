import { z } from 'zod';
export const artistEditSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(), bio: z.string().max(5000).optional(), location: z.string().trim().max(300).optional(),
  experience: z.number().int().min(0).max(80).optional(), certification: z.string().max(1000).optional(),
  badge: z.enum(['TOP_PICK', 'NEW', 'VERIFIED', 'FEATURED', '']).optional(),
  verificationStatus: z.enum(['NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EDIT_REQUESTED', 'EDIT_APPROVED']).optional(),
  startingPrice: z.number().min(0).max(10000000).optional(), weddingPrice: z.number().min(0).max(10000000).optional(),
  occasionPrice: z.number().min(0).max(10000000).optional(), hourlyPrice: z.number().min(0).max(10000000).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', '']).optional(),
  dob: z.string().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)), 'Invalid date').optional(),
  instagramUrl: z.string().url().refine(v => v.startsWith('https://'), 'Use an HTTPS link').or(z.literal('')).optional(),
  remarks: z.string().trim().max(2000).optional(),
});
