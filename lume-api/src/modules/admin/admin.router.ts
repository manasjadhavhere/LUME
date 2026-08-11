import { Router } from 'express';
import { getPendingArtists, getAllArtists, verifyArtist, rejectArtist, getStats } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/artists
router.get('/artists', getAllArtists);

// GET /api/admin/artists/pending
router.get('/artists/pending', getPendingArtists);

// PATCH /api/admin/artists/:id/verify
router.patch('/artists/:id/verify', verifyArtist);

// PATCH /api/admin/artists/:id/reject
router.patch('/artists/:id/reject', rejectArtist);

export default router;
