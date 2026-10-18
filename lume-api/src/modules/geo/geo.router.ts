import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { searchLocations, resolvePlace, reverseLocation } from './geo.service';

const router = Router();
router.use(rateLimit({ windowMs: 60_000, max: 45, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Please pause for a moment before searching again.' } }));
const session = z.string().uuid();

router.get('/search', async (req, res) => {
  const input = z.object({ q: z.string().trim().min(2).max(160), sessionToken: session }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ success: false, message: 'Enter at least two characters and a valid search session.' }); return; }
  res.json({ success: true, data: await searchLocations(input.data.q, input.data.sessionToken) });
});
router.get('/place', async (req, res) => {
  const input = z.object({ placeId: z.string().min(1).max(256), sessionToken: session }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ success: false, message: 'Invalid location selection.' }); return; }
  try { res.json({ success: true, data: await resolvePlace(input.data.placeId, input.data.sessionToken) }); }
  catch { res.status(503).json({ success: false, message: 'Could not confirm this location. Please search again.' }); }
});
router.get('/reverse', async (req, res) => {
  const input = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }).safeParse(req.query);
  if (!input.success) { res.status(400).json({ success: false, message: 'Invalid coordinates.' }); return; }
  try { res.json({ success: true, data: await reverseLocation(input.data.lat, input.data.lng) }); }
  catch { res.status(503).json({ success: false, message: 'Could not find your location. Please search for your city or neighbourhood.' }); }
});
export default router;
