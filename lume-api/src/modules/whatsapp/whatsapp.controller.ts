import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import {
  verifyBookingActionToken,
  notifyBookingStatusChanged,
  sendWhatsAppTextMessage,
  normalizePhoneNumber,
} from './whatsapp.service';

/**
 * Meta WhatsApp Cloud API Webhook Handshake (GET /api/webhooks/whatsapp)
 * Required by Meta to verify webhook ownership during setup in the App Dashboard.
 */
export async function verifyWebhook(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'lume_whatsapp_secret_token';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Handshake verified successfully with Meta.');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp Webhook] Verification token mismatch.');
  return res.status(403).json({ error: 'Verification token mismatch' });
}

/**
 * Meta WhatsApp Cloud API Webhook Event Receiver (POST /api/webhooks/whatsapp)
 * Processes incoming button clicks (Accept / Deny) and messages from artists or clients.
 */
export async function handleWebhookEvent(req: Request, res: Response) {
  // Always return 200 OK promptly to Meta to acknowledge receipt
  res.status(200).json({ received: true });

  try {
    const body = req.body;

    if (!body || body.object !== 'whatsapp_business_account') {
      return;
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value || !value.messages) continue;

        for (const message of value.messages) {
          const from = message.from; // Sender's phone number in E.164 (e.g. "919876543210")
          const msgType = message.type;

          let actionType: 'ACCEPT' | 'DENY' | null = null;
          let targetBookingId: string | null = null;

          // 1. Check for Interactive Button Reply
          if (msgType === 'interactive' && message.interactive?.button_reply) {
            const buttonId = message.interactive.button_reply.id; // e.g. "ACCEPT_BOOKING_cm..."
            if (buttonId.startsWith('ACCEPT_BOOKING_')) {
              actionType = 'ACCEPT';
              targetBookingId = buttonId.replace('ACCEPT_BOOKING_', '').trim();
            } else if (buttonId.startsWith('DENY_BOOKING_')) {
              actionType = 'DENY';
              targetBookingId = buttonId.replace('DENY_BOOKING_', '').trim();
            }
          }

          // 2. Fallback: Check for Text Replies (e.g., "ACCEPT <bookingId>" or "DENY <bookingId>")
          if (msgType === 'text' && message.text?.body) {
            const text = message.text.body.trim().toUpperCase();
            if (text.startsWith('ACCEPT') || text.startsWith('CONFIRM')) {
              const parts = text.split(/\s+/);
              if (parts[1]) {
                actionType = 'ACCEPT';
                targetBookingId = parts[1].toLowerCase();
              }
            } else if (text.startsWith('DENY') || text.startsWith('DECLINE') || text.startsWith('REJECT')) {
              const parts = text.split(/\s+/);
              if (parts[1]) {
                actionType = 'DENY';
                targetBookingId = parts[1].toLowerCase();
              }
            }
          }

          // If an actionable command was detected:
          if (actionType && targetBookingId) {
            await processArtistWhatsAppAction(targetBookingId, actionType, from);
          }
        }
      }
    }
  } catch (err) {
    console.error('[WhatsApp Webhook Handler Error]:', err);
  }
}

/**
 * Handle Accept / Deny business logic when triggered by the Artist from WhatsApp
 */
async function processArtistWhatsAppAction(
  bookingId: string,
  action: 'ACCEPT' | 'DENY',
  senderPhone: string
) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: bookingId },
          { id: { endsWith: bookingId } }, // Supports short ID prefixes
        ],
      },
      include: {
        artist: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        client: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!booking) {
      await sendWhatsAppTextMessage(
        senderPhone,
        `⚠️ LUME: Booking ID not found. Please review the details in your artist dashboard.`
      );
      return;
    }

    // Verify sender matches the artist's phone number on record (or admin)
    const normalizedSender = normalizePhoneNumber(senderPhone);
    const normalizedArtistPhone = normalizePhoneNumber(booking.artist.user.phone);

    if (normalizedArtistPhone && normalizedSender !== normalizedArtistPhone) {
      console.warn(
        `[WhatsApp Security Alert] Sender ${senderPhone} attempted to action booking ${booking.id} belonging to artist phone ${booking.artist.user.phone}`
      );
      await sendWhatsAppTextMessage(
        senderPhone,
        `⚠️ Security Notice: This phone number is not authorized to action booking #${booking.id.slice(-6).toUpperCase()}.`
      );
      return;
    }

    if (booking.status !== 'PENDING') {
      await sendWhatsAppTextMessage(
        senderPhone,
        `ℹ️ Booking #${booking.id.slice(-6).toUpperCase()} is already marked as ${booking.status}. No further action needed.`
      );
      return;
    }

    if (action === 'ACCEPT') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'ACCEPTED' },
      });

      // Create in-app notification for the client
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Booking Accepted! ✨',
          message: `${booking.artist.user.name} has confirmed your appointment.`,
          type: 'BOOKING_ACCEPTED',
        },
      });

      // Confirm to Artist
      await sendWhatsAppTextMessage(
        senderPhone,
        `✅ *Booking Accepted!* You have confirmed the appointment with ${booking.client.name || 'Client'}. We have notified the client.`
      );

      // Notify Client on WhatsApp
      await notifyBookingStatusChanged(booking.id, 'ACCEPTED');
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancelReason: 'Declined by artist via WhatsApp',
        },
      });

      // Create in-app notification for the client
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Booking Request Declined',
          message: `${booking.artist.user.name} was unavailable for the requested slot.`,
          type: 'BOOKING_DECLINED',
        },
      });

      // Confirm to Artist
      await sendWhatsAppTextMessage(
        senderPhone,
        `❌ *Booking Declined.* You have declined the appointment request with ${booking.client.name || 'Client'}.`
      );

      // Notify Client on WhatsApp
      await notifyBookingStatusChanged(
        booking.id,
        'CANCELLED',
        'Artist is unavailable for the selected slot'
      );
    }
  } catch (err) {
    console.error('[WhatsApp processArtistWhatsAppAction Error]:', err);
    await sendWhatsAppTextMessage(
      senderPhone,
      `⚠️ An error occurred while processing your request. Please visit your LUME Artist Dashboard.`
    );
  }
}

/**
 * Handle direct one-click link clicks from WhatsApp message
 * GET /api/bookings/whatsapp-action?id=...&action=accept|deny&token=...
 */
export async function handleOneClickWhatsAppAction(req: Request, res: Response) {
  const { id, action, token } = req.query as { id: string; action: string; token: string };

  if (!id || !action || !token) {
    return res.status(400).send(renderActionHtml('Invalid Request', 'Missing required parameters.', 'error'));
  }

  const normalizedAction = action.toLowerCase();
  if (normalizedAction !== 'accept' && normalizedAction !== 'deny') {
    return res.status(400).send(renderActionHtml('Invalid Action', 'Action must be accept or deny.', 'error'));
  }

  // Cryptographic token verification
  const isValidToken = verifyBookingActionToken(id, normalizedAction, token);
  if (!isValidToken) {
    return res.status(403).send(renderActionHtml('Unauthorized', 'This link is invalid or has expired.', 'error'));
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: { include: { user: { select: { name: true, phone: true } } } },
        client: { select: { name: true, phone: true } },
      },
    });

    if (!booking) {
      return res.status(404).send(renderActionHtml('Booking Not Found', 'Could not locate this appointment.', 'error'));
    }

    if (booking.status !== 'PENDING') {
      return res.send(
        renderActionHtml(
          `Already ${booking.status}`,
          `This booking has already been resolved as <strong>${booking.status}</strong>.`,
          'info'
        )
      );
    }

    if (normalizedAction === 'accept') {
      await prisma.booking.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });

      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Booking Accepted! ✨',
          message: `${booking.artist.user.name} has confirmed your appointment.`,
          type: 'BOOKING_ACCEPTED',
        },
      });

      // Notify Client on WhatsApp
      await notifyBookingStatusChanged(id, 'ACCEPTED');

      return res.send(
        renderActionHtml(
          'Appointment Confirmed! ✨',
          `You have successfully accepted the booking with <strong>${booking.client.name || 'the client'}</strong>.<br>The client has been notified on WhatsApp.`,
          'success'
        )
      );
    } else {
      await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: 'Declined by artist via WhatsApp quick link',
        },
      });

      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          title: 'Booking Request Declined',
          message: `${booking.artist.user.name} was unavailable for the requested slot.`,
          type: 'BOOKING_DECLINED',
        },
      });

      // Notify Client on WhatsApp
      await notifyBookingStatusChanged(id, 'CANCELLED', 'Artist is unavailable for the selected slot');

      return res.send(
        renderActionHtml(
          'Appointment Declined',
          `You have declined this booking request. The client has been politely notified to choose an alternative slot or artist.`,
          'warning'
        )
      );
    }
  } catch (err: any) {
    console.error('[WhatsApp handleOneClickWhatsAppAction Error]:', err);
    return res.status(500).send(renderActionHtml('Error', 'An internal error occurred. Please try again.', 'error'));
  }
}

/**
 * Mobile-optimized luxury branded HTML response page for WhatsApp action links
 */
function renderActionHtml(title: string, message: string, variant: 'success' | 'warning' | 'error' | 'info'): string {
  const badgeColor =
    variant === 'success' ? '#2e7d32' : variant === 'warning' ? '#d97706' : variant === 'error' ? '#c62828' : '#6b21a8';
  const badgeBg =
    variant === 'success' ? '#e8f5e9' : variant === 'warning' ? '#fef3c7' : variant === 'error' ? '#ffebee' : '#f3e8ff';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — LUME</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #faf6f7;
      color: #2b1f23;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #ffffff;
      border: 1px solid rgba(201, 81, 117, 0.15);
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(139, 32, 63, 0.08);
      max-width: 440px;
      width: 100%;
      padding: 36px 28px;
      text-align: center;
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      letter-spacing: 0.15em;
      color: #8b203f;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 999px;
      background: ${badgeBg};
      color: ${badgeColor};
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #1e1417;
      margin-bottom: 12px;
      font-weight: 600;
    }
    p {
      font-size: 15px;
      color: #635258;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: #c95175;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(201, 81, 117, 0.3);
      transition: background 0.2s;
    }
    .btn:hover {
      background: #b5385e;
    }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #9e8e93;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">LUME</div>
    <div class="badge">${variant.toUpperCase()}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/artist-dashboard/bookings" class="btn">Open Artist Dashboard</a>
    <div class="footer">India's Premier Beauty Platform</div>
  </div>
</body>
</html>`;
}
