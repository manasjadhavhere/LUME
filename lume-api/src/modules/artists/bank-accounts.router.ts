import { Router } from 'express';
import { getBankAccount, saveBankAccount } from './bank-accounts.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

const artistAuth = [authenticate, requireRole('ARTIST')];

// GET  /api/artists/me/bank-account  — fetch masked details
router.get('/me/bank-account', ...artistAuth, getBankAccount);

// POST /api/artists/me/bank-account  — save / update (encrypted)
router.post('/me/bank-account', ...artistAuth, saveBankAccount);

export default router;
