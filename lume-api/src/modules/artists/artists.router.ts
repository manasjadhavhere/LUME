import { Router } from 'express';
import {
  listArtists,
  getArtist,
  getMyProfile,
  updateProfile,
  uploadAvatarHandler,
  uploadPortfolioHandler,
  deletePortfolioItem,
  uploadCertificationHandler,
  submitVerification,
  updatePricing,
  addService,
  updateService,
  deleteService,
  getDashboardStats,
  requestEdit,
} from './artists.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, addServiceSchema } from './artists.service';
import { uploadAvatar, uploadPortfolio, uploadCertification } from '../../middleware/upload';

const router = Router();

// -- Public ----------------------------------------------------
router.get('/', listArtists);
router.get('/:id', getArtist);

// -- Artist-only -----------------------------------------------
const artistAuth = [authenticate, requireRole('ARTIST')];

router.get('/me/profile', ...artistAuth, getMyProfile);
router.get('/me/stats', ...artistAuth, getDashboardStats);
router.put('/me/profile', ...artistAuth, validate(updateProfileSchema), updateProfile);

// Pricing
router.put('/me/pricing', ...artistAuth, updatePricing);

// File uploads
router.post('/me/avatar', ...artistAuth, uploadAvatar.single('avatar'), uploadAvatarHandler);
router.post('/me/portfolio', ...artistAuth, uploadPortfolio.array('photos', 10), uploadPortfolioHandler);
router.delete('/me/portfolio', ...artistAuth, deletePortfolioItem);
router.post('/me/certifications', ...artistAuth, uploadCertification.array('files', 5), uploadCertificationHandler);

// Verification
router.post('/me/submit-verification', ...artistAuth, submitVerification);
router.post('/me/request-edit', ...artistAuth, requestEdit);

// Services
router.post('/me/services', ...artistAuth, validate(addServiceSchema), addService);
router.put('/me/services/:serviceId', ...artistAuth, updateService);
router.delete('/me/services/:serviceId', ...artistAuth, deleteService);

export default router;
