import { Request, Response, NextFunction } from 'express';
import * as ArtistsService from './artists.service';


export async function listArtists(req: Request, res: Response, next: NextFunction) {
  try {
    const { specialty, location, search, page, limit, minPrice, maxPrice } = req.query;
    const result = await ArtistsService.getAllArtists({
      specialty: specialty as string,
      location: location as string,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getArtist(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.getArtistById(req.params.id as string);
    res.json({ success: true, data: artist });
  } catch (err) { next(err); }
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.getArtistByUserId(req.user!.userId);
    res.json({ success: true, data: artist });
  } catch (err) { next(err); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.updateArtistProfile(req.user!.userId, req.body);
    res.json({ success: true, data: artist });
  } catch (err) { next(err); }
}

export async function uploadAvatarHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    // multer-storage-cloudinary sets file.path to the full Cloudinary secure_url
    const url = req.file.path;
    const artist = await ArtistsService.updateProfileImage(req.user!.userId, url);
    res.json({ success: true, data: { url, artist } });
  } catch (err) { next(err); }
}

export async function uploadPortfolioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) { res.status(400).json({ success: false, message: 'No files uploaded' }); return; }
    // file.path is the Cloudinary secure_url
    const urls = files.map(f => f.path);
    const artist = await ArtistsService.addPortfolioImages(req.user!.userId, urls);
    res.json({ success: true, data: { urls, artist } });
  } catch (err) { next(err); }
}

export async function deletePortfolioItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    const artist = await ArtistsService.removePortfolioImage(req.user!.userId, url);
    res.json({ success: true, data: artist });
  } catch (err) { next(err); }
}

export async function uploadCertificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) { res.status(400).json({ success: false, message: 'No files uploaded' }); return; }
    // file.path is the Cloudinary secure_url
    const urls = files.map(f => f.path);
    const artist = await ArtistsService.addCertificationFiles(req.user!.userId, urls);
    res.json({ success: true, data: { urls, artist } });
  } catch (err) { next(err); }
}

export async function submitVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.submitForVerification(req.user!.userId);
    res.json({ success: true, data: artist, message: 'Profile submitted for verification' });
  } catch (err) { next(err); }
}

export async function requestEdit(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.requestEditAccess(req.user!.userId);
    res.json({ success: true, data: artist, message: 'Edit request submitted' });
  } catch (err) { next(err); }
}

export async function updatePricing(req: Request, res: Response, next: NextFunction) {
  try {
    const artist = await ArtistsService.updatePricing(req.user!.userId, req.body);
    res.json({ success: true, data: artist });
  } catch (err) { next(err); }
}

export async function addService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await ArtistsService.addService(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) { next(err); }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await ArtistsService.updateService(req.user!.userId, req.params.serviceId as string, req.body);
    res.json({ success: true, data: service });
  } catch (err) { next(err); }
}

export async function deleteService(req: Request, res: Response, next: NextFunction) {
  try {
    await ArtistsService.deleteService(req.user!.userId, req.params.serviceId as string);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await ArtistsService.getArtistStats(req.user!.userId);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { isTakingBookings } = req.body;
    const artist = await ArtistsService.updateBookingStatus(req.user!.userId, !!isTakingBookings);
    res.json({ success: true, data: artist, message: 'Booking status updated successfully' });
  } catch (err) { next(err); }
}
