import { Router } from 'express';
import { register, login, me, updateMe } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { registerSchema, loginSchema, updateMeSchema } from './auth.service';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', authenticate, me);

// PUT /api/auth/me
router.put('/me', authenticate, validate(updateMeSchema), updateMe);

export default router;
