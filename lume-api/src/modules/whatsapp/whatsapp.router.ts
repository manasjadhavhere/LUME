import { Router } from 'express';
import {
  verifyWebhook,
  handleWebhookEvent,
  handleOneClickWhatsAppAction,
} from './whatsapp.controller';

const router = Router();

// Meta WhatsApp Cloud API Webhook handshake and event receiver
router.get('/webhooks/whatsapp', verifyWebhook);
router.post('/webhooks/whatsapp', handleWebhookEvent);

// Secure one-click accept / deny action link for artists
router.get('/bookings/whatsapp-action', handleOneClickWhatsAppAction);

export default router;
