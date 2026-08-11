import { Router } from 'express';
import { createReview, getArtistReviews, replyToReview } from './reviews.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReviewSchema } from './reviews.service';

const router = Router();

// POST /api/reviews — client submits review
router.post('/', authenticate, requireRole('CLIENT'), validate(createReviewSchema), createReview);

// GET /api/reviews/artist/:artistId
router.get('/artist/:artistId', getArtistReviews);

// PUT /api/reviews/:id/reply — artist replies
router.put('/:id/reply', authenticate, requireRole('ARTIST'), replyToReview);

export default router;
