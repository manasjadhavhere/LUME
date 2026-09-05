import { Request, Response, NextFunction } from 'express';
import * as AdminService from './admin.service';
import { verifyAndRegisterOnRoute } from '../artists/bank-accounts.controller';

export async function getPendingArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const artists = await AdminService.getPendingArtists();
    res.json({ success: true, data: artists });
  } catch (err) { next(err); }
}

export async function getAllArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const artists = await AdminService.getAllArtistsAdmin();
    res.json({ success: true, data: artists });
  } catch (err) { next(err); }
}

export async function getAllClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await AdminService.getAllClients();
    res.json({ success: true, data: clients });
  } catch (err) { next(err); }
}

export async function verifyArtist(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await AdminService.verifyArtist(req.params.id as string, req.body.remarks);
    res.json({ success: true, data: artist, message: 'Artist verified successfully' });
  } catch (err) { next(err); }
}

export async function rejectArtist(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await AdminService.rejectArtist(req.params.id as string, req.body.reason || req.body.remarks);
    res.json({ success: true, data: artist, message: 'Artist rejected' });
  } catch (err) { next(err); }
}

export async function approveEditRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await AdminService.approveEditRequest(req.params.id as string);
    res.json({ success: true, data: artist, message: 'Edit request approved' });
  } catch (err) { next(err); }
}

export async function updateArtistAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await AdminService.updateArtistAdmin(req.params.id as string, req.body);
    res.json({ success: true, data: artist, message: 'Artist profile updated successfully' });
  } catch (err) { next(err); }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await AdminService.updateBookingStatusAdmin(req.params.id as string, !!req.body.isTakingBookings);
    res.json({ success: true, data: artist, message: 'Booking status updated successfully' });
  } catch (err) { next(err); }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await AdminService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await AdminService.deleteUser(req.params.id as string);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) { next(err); }
}

// ── Payment Tracking Endpoints ────────────────────────────────────────────────

export async function getArtistPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const summaries = await AdminService.getArtistPaymentSummaries();
    res.json({ success: true, data: summaries });
  } catch (err) { next(err); }
}

export async function getArtistPaymentDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const detail = await AdminService.getArtistPaymentDetail(req.params.artistId as string);
    res.json({ success: true, data: detail });
  } catch (err) { next(err); }
}

export async function getLumeRevenue(req: Request, res: Response, next: NextFunction) {
  try {
    const earnings = await AdminService.getLumeEarnings();
    res.json({ success: true, data: earnings });
  } catch (err) { next(err); }
}

export async function markPaymentPaid(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await AdminService.markPayoutCompleted(req.params.paymentId as string);
    res.json({ success: true, data: record, message: 'Payout marked as completed' });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/admin/bank-accounts/:bankAccountId/verify
 * Admin verifies an artist's bank account and auto-registers them on Razorpay Route.
 */
export async function adminVerifyBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const bankAccountId = req.params.bankAccountId as string;
    const result = await verifyAndRegisterOnRoute(bankAccountId);
    res.json({
      success: true,
      message: result.success
        ? `Bank account verified and registered on Razorpay Route (${result.linkedAccountId})`
        : `Bank account verified. Route registration skipped: ${result.error}`,
      routeRegistered: result.success,
      linkedAccountId: result.linkedAccountId,
    });
  } catch (err) { next(err); }
}
