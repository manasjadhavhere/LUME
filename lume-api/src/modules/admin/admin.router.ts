import { Router } from 'express';
import {
  getPendingArtists, getAllArtists, getAllClients, verifyArtist, rejectArtist,
  getStats, updateArtistAdmin, approveEditRequest, deleteUser, updateBookingStatus,
  getArtistPayments, getArtistPaymentDetails, getLumeRevenue, markPaymentPaid,
  adminVerifyBankAccount,
} from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

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
router.put('/artists/:id', updateArtistAdmin);

// PATCH /api/admin/artists/:id/booking-status
router.patch('/artists/:id/booking-status', updateBookingStatus);

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
