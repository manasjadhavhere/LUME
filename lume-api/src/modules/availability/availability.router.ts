import { Router } from 'express';
import { getAvailability, setAvailability, setDefaultSchedule, getDefaultSchedule, blockDate, unblockDate } from './availability.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router({ mergeParams: true });

// GET /api/artists/:artistId/availability  (public)
router.get('/', getAvailability);

// PUT /api/artists/:artistId/availability  (artist only — per-day override)
router.put('/', authenticate, requireRole('ARTIST'), setAvailability);

// GET/PUT /api/artists/:artistId/availability/default  (artist only — weekly template)
router.get('/default', authenticate, requireRole('ARTIST'), getDefaultSchedule);
router.put('/default', authenticate, requireRole('ARTIST'), setDefaultSchedule);

// POST/DELETE /api/artists/:artistId/availability/block
router.post('/block', authenticate, requireRole('ARTIST'), blockDate);
router.delete('/block', authenticate, requireRole('ARTIST'), unblockDate);

export default router;
