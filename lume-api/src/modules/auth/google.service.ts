import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { signToken, signRefreshToken } from '../../lib/jwt';
import { createError } from '../../middleware/errorHandler';

export const googleAuthSchema = z.object({
  idToken: z.string().min(20).max(10000),
  role: z.enum(['CLIENT', 'ARTIST']).default('CLIENT'),
  password: z.string().max(256).optional(),
});
const google = new OAuth2Client();
export function validateGoogleIdentity(payload: TokenPayload | undefined) {
  if (!payload?.sub || !payload.email || payload.email_verified !== true) throw createError('A verified Google email is required.', 401);
  return { googleId: payload.sub, email: payload.email.toLowerCase(),
    authoritative: payload.email.toLowerCase().endsWith('@gmail.com') || !!payload.hd,
    name: payload.name || 'Lume Member', avatarUrl: payload.picture };
}
export async function authenticateGoogleUser(input: z.infer<typeof googleAuthSchema>) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw createError('Google sign-in is not configured yet. Please use email sign-in.', 503);
  let payload: TokenPayload | undefined;
  try { payload = (await google.verifyIdToken({ idToken: input.idToken, audience: clientId })).getPayload(); }
  catch { throw createError('Google sign-in expired or could not be verified. Please try again.', 401); }
  const identity = validateGoogleIdentity(payload);
  const include = { clientProfile: true, artistProfile: { include: { services: { where: { isActive: true } } } } } as const;
  const provision = () => prisma.$transaction(async tx => {
    const bySubject = await tx.user.findUnique({ where: { googleId: identity.googleId }, include });
    const byEmail = await tx.user.findFirst({ where: { email: { equals: identity.email, mode: 'insensitive' } }, include });
    if (bySubject && byEmail && bySubject.id !== byEmail.id) throw createError('This Google account conflicts with an existing account. Please use email sign-in.', 409);
    let user = bySubject || byEmail;
    if (user) {
      if (!user.isActive) throw createError('This account is inactive. Please contact Lume support.', 403);
      if (user.googleId && user.googleId !== identity.googleId) throw createError('A different Google account is already linked. Please use email sign-in.', 409);
      if (!user.googleId) {
        // Google is not authoritative for third-party email addresses. Admin links also require proof of the existing password.
        if (!identity.authoritative || user.role === 'ADMIN') {
          if (!input.password) {
            const error = createError('Enter your existing Lume password once to securely link this Google account.', 409);
            error.code = 'GOOGLE_LINK_REQUIRED'; throw error;
          }
          if (!user.passwordHash || !await bcrypt.compare(input.password, user.passwordHash)) throw createError('The existing account password is incorrect.', 401);
        }
        user = await tx.user.update({ where: { id: user.id }, data: { googleId: identity.googleId, authProvider: user.passwordHash ? 'LOCAL_GOOGLE' : 'GOOGLE', avatarUrl: user.avatarUrl || identity.avatarUrl }, include });
      }
      // Repair missing profiles without ever accepting a requested role change.
      if (user.role === 'CLIENT' && !user.clientProfile) await tx.clientProfile.create({ data: { userId: user.id } });
      if (user.role === 'ARTIST' && !user.artistProfile) await tx.artistProfile.create({ data: { userId: user.id, location: '', isAvailable: false, isTakingBookings: false } });
      return tx.user.findUniqueOrThrow({ where: { id: user.id }, include });
    }
    return tx.user.create({ data: {
      email: identity.email, name: identity.name, avatarUrl: identity.avatarUrl, googleId: identity.googleId, authProvider: 'GOOGLE', role: input.role,
      ...(input.role === 'ARTIST' ? { artistProfile: { create: { location: '', isAvailable: false, isTakingBookings: false } } } : { clientProfile: { create: {} } }),
    }, include });
  });
  let user;
  try { user = await provision(); }
  catch (error) {
    // Concurrent first clicks converge on the same unique email/subject account.
    if ((error as { code?: string }).code !== 'P2002') throw error;
    user = await provision();
  }
  const { passwordHash: _, googleId: __, ...safeUser } = user;
  const jwtPayload = { userId: user.id, email: user.email, role: user.role };
  return { user: safeUser, token: signToken(jwtPayload), refreshToken: signRefreshToken(jwtPayload) };
}
