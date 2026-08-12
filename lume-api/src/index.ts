import './config/env'; // Must be first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routers
import authRouter from './modules/auth/auth.router';
import artistsRouter from './modules/artists/artists.router';
import bookingsRouter from './modules/bookings/bookings.router';
import reviewsRouter from './modules/reviews/reviews.router';
import availabilityRouter from './modules/availability/availability.router';
import adminRouter from './modules/admin/admin.router';
import paymentsRouter from './modules/payments/payments.router';
import notificationsRouter from './modules/notifications/notifications.router';

const app = express();

// ── Security & Middleware ──────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploads
}));

app.use(cors({
  // Support multiple origins (e.g. localhost in dev + production domain)
  origin: (origin, callback) => {
    const allowed = config.clientUrl.split(',').map(u => u.trim());
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin '${origin}' is not in the allowed list:`, allowed);
      callback(null, false); // Return false instead of throwing an Error to prevent 500 Server Error on preflight
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(config.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Note: static file serving removed — all media is now served via Cloudinary CDN

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts' },
});

// Strict rate limit for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many admin requests' },
});

// In production, restrict admin API to same-host (server) requests only.
// In development, allow localhost browser access for convenience.
const adminLocalhost = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (config.isDev) return next(); // Allow all in dev
  const ip = req.ip || req.socket.remoteAddress || '';
  const allowed = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
  if (!allowed.some(a => ip.includes(a))) {
    res.status(403).json({ success: false, message: 'Admin access restricted' });
    return;
  }
  next();
};

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LUME API is running 🌟',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminLocalhost, adminLimiter, adminRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/notifications', notificationsRouter);

// Nested availability under artists
app.use('/api/artists/:artistId/availability', availabilityRouter);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────

app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  console.log(`\n🌟 LUME API running on http://localhost:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health: http://localhost:${config.port}/api/health\n`);
});

export default app;
