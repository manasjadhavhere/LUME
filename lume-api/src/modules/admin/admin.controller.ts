import { Request, Response, NextFunction } from 'express';
import * as AdminService from './admin.service';

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

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await AdminService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}
