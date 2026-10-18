import { Router } from 'express';
import {
  getPendingArtists, getAllArtists, getAllClients, verifyArtist, rejectArtist,
  getStats, updateArtistAdmin, approveEditRequest, deleteUser, updateBookingStatus,
  getArtistPayments, getArtistPaymentDetails, getLumeRevenue, markPaymentPaid,
  adminVerifyBankAccount, removeArtistDocument,
} from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { getAdvancedInsights } from './insights.service';
import { artistEditSchema } from './admin.validation';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import prisma from '../../lib/prisma';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.use(async (req, res, next) => {
  try {
    const actor = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { name: true, isActive: true, role: true } });
    if (!actor?.isActive || actor.role !== 'ADMIN') { res.status(403).json({ success: false, message: 'Active administrator access is required.' }); return; }
    // Operational history of successful actions, excluding request bodies and sensitive bank data.
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      res.once('finish', () => {
        if (res.statusCode < 400) void prisma.adminAuditLog.create({ data: {
          actorId: req.user!.userId, actorName: actor.name, action: `${req.method} ${req.path.replace(/\/[a-z0-9]{20,}/gi, '/:id')}`, targetId: req.path,
        } }).catch(() => console.error('Admin activity history could not be recorded.'));
      });
    }
    next();
  } catch (error) { next(error); }
});

router.get('/insights/analytics', async (req, res, next) => {
  const period = z.enum(['30', '90', '365', 'all']).safeParse(req.query.days || '30');
  if (!period.success) { res.status(400).json({ success: false, message: 'Choose 30, 90, 365 days or all.' }); return; }
  try { res.json({ success: true, data: await getAdvancedInsights(period.data === 'all' ? null : Number(period.data)) }); }
  catch (error) { next(error); }
});

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/artists
router.get('/artists', getAllArtists);

// GET /api/admin/clients
router.get('/clients', getAllClients);

// GET /api/admin/artists/pending
router.get('/artists/pending', getPendingArtists);

// PATCH /api/admin/artists/:id/verify
router.patch('/artists/:id/verify', verifyArtist);

// PATCH /api/admin/artists/:id/reject
router.patch('/artists/:id/reject', rejectArtist);

// PATCH /api/admin/artists/:id/approve-edit
router.patch('/artists/:id/approve-edit', approveEditRequest);

// PUT /api/admin/artists/:id
router.put('/artists/:id', validate(artistEditSchema), updateArtistAdmin);

// PATCH /api/admin/artists/:id/booking-status
router.patch('/artists/:id/booking-status', validate(z.object({ isTakingBookings: z.boolean() })), updateBookingStatus);

// DELETE /api/admin/artists/:id/documents
router.delete('/artists/:id/documents', validate(z.object({ fileUrl: z.string().min(1).max(2048), type: z.enum(['certification', 'portfolio']) })), removeArtistDocument);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// ── Payment Tracking ──────────────────────────────────────────────────────────

// GET  /api/admin/payments             — all artists payment summaries
router.get('/payments', getArtistPayments);

// GET  /api/admin/payments/lume        — Lume platform earnings
router.get('/payments/lume', getLumeRevenue);

// GET  /api/admin/payments/:artistId   — single artist full payment detail
router.get('/payments/:artistId', getArtistPaymentDetails);

// PATCH /api/admin/payments/:paymentId/mark-paid — mark payout completed
router.patch('/payments/:paymentId/mark-paid', markPaymentPaid);

// ── Bank Account Verification ─────────────────────────────────────────────
// PATCH /api/admin/bank-accounts/:bankAccountId/verify — verify + register on Razorpay Route
router.patch('/bank-accounts/:bankAccountId/verify', adminVerifyBankAccount);

export default router;
