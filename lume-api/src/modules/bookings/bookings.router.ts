import { Router } from 'express';
import { createBooking, listBookings, updateStatus, cancelBooking } from './bookings.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createBookingSchema } from './bookings.service';

const router = Router();

// All booking routes require auth
router.use(authenticate);

// GET /api/bookings — list own bookings (client or artist)
router.get('/', listBookings);

// POST /api/bookings — create new booking (client only)
router.post('/', requireRole('CLIENT'), validate(createBookingSchema), createBooking);

// PATCH /api/bookings/:id/status — update status (artist only)
router.patch('/:id/status', requireRole('ARTIST'), updateStatus);

// DELETE /api/bookings/:id — cancel booking (client only)
router.delete('/:id', requireRole('CLIENT'), cancelBooking);

export default router;
