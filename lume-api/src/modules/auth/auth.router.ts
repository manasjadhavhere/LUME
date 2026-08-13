import { Router } from 'express';
import { register, login, me, updateMe, uploadAvatar as uploadAvatarController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { registerSchema, loginSchema, updateMeSchema } from './auth.service';
import { uploadAvatar } from '../../middleware/upload';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', authenticate, me);

// PUT /api/auth/me
router.put('/me', authenticate, validate(updateMeSchema), updateMe);

// POST /api/auth/me/avatar
router.post('/me/avatar', authenticate, uploadAvatar.single('avatar'), uploadAvatarController);

export default router;
