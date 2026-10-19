import crypto from 'crypto';
import prisma from '../../lib/prisma';
import { config } from '../../config/env';

/**
 * WhatsApp Cloud API Service for LUME
 * Handles automated client notifications, artist booking alerts with Accept/Deny buttons,
 * and status updates.
 */

const WHATSAPP_API_VERSION = 'v21.0';

/**
 * Standardize phone numbers to international E.164 without symbols (e.g., 919876543210)
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  // Strip all non-digit characters
  let cleaned = rawPhone.replace(/\D/g, '');

  if (!cleaned) return null;

  // Handle Indian standard 10-digit numbers: 9876543210 -> 919876543210
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  // Handle leading 0 (e.g. 09876543210 -> 919876543210)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `91${cleaned.slice(1)}`;
  }

  // Already prefixed with country code (e.g. 919876543210)
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return cleaned;
  }

  return null;
}

/**
 * Generate a cryptographically signed one-click action token for the artist.
 * Allows safe 1-tap accept or deny directly from WhatsApp without requiring re-login.
 */
export function generateBookingActionToken(bookingId: string, action: 'accept' | 'deny'): string {
  const secret = config.jwt.secret;
  return crypto
    .createHmac('sha256', secret)
    .update(`${bookingId}:${action}`)
    .digest('hex');
}

/**
 * Verify a signed action token
 */
export function verifyBookingActionToken(bookingId: string, action: string, token: string): boolean {
  if (!bookingId || !action || !token) return false;
  const expected = generateBookingActionToken(bookingId, action as 'accept' | 'deny');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

/**
 * Low-level function to dispatch a message payload to Meta's WhatsApp Cloud API
 */
async function callWhatsAppApi(payload: any): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // If WhatsApp API credentials are not yet configured in .env, log gracefully for local testing
  if (!phoneNumberId || !accessToken) {
    console.log(
      `\x1b[33m[WhatsApp Service (Simulated)]\x1b[0m Recipient: ${payload.to}`,
      JSON.stringify(payload, null, 2)
    );
    return true;
  }

  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as any;

    if (!res.ok) {
      console.error('[WhatsApp Cloud API Error]:', data?.error || data);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[WhatsApp Cloud API Dispatch Exception]:', error);
    return false;
  }
}

/**
 * Send standard formatted WhatsApp text message
 */
export async function sendWhatsAppTextMessage(to: string, text: string): Promise<boolean> {
  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo) {
    console.warn(`[WhatsApp Service] Invalid phone number skipped: "${to}"`);
    return false;
  }

  return callWhatsAppApi({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedTo,
    type: 'text',
    text: { body: text },
  });
}

/**
 * Send interactive button message (e.g. [ Accept ] / [ Deny ] buttons)
 */
export async function sendWhatsAppInteractiveButtons(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
  headerText?: string,
  footerText: string = 'LUME Beauty Platform'
): Promise<boolean> {
  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo) {
    console.warn(`[WhatsApp Service] Invalid phone number skipped: "${to}"`);
    return false;
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizedTo,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      footer: { text: footerText },
      action: {
        buttons: buttons.slice(0, 3).map((btn) => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title.slice(0, 20), // WhatsApp max title limit is 20 chars
          },
        })),
      },
    },
  };

  if (headerText) {
    payload.interactive.header = {
      type: 'text',
      text: headerText,
    };
  }

  return callWhatsAppApi(payload);
}

/**
 * Format a Date object to a readable string (e.g. "Monday, 24 Oct 2026")
 */
function formatDate(date: Date | string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
}

/**
 * Notify both Client and Artist when a booking is created
 */
export async function notifyBookingCreated(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            clientProfile: { select: { mobileNumber: true } },
          },
        },
        artist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        service: true,
      },
    });

    if (!booking) {
      console.warn(`[WhatsApp Service] Booking ${bookingId} not found for notification.`);
      return;
    }

    const clientName = booking.client.name || 'Client';
    const artistName = booking.artist.user.name || 'Artist';
    const serviceName = booking.service?.name || booking.priceType;
    const formattedDate = formatDate(booking.date);
    const timeSlot = booking.time;
    const totalAmount = booking.totalPaid;
    const location = booking.address || 'Address provided by client';
    const notes = booking.notes || 'None';

    const clientPhone =
      booking.client.phone || booking.client.clientProfile?.mobileNumber;
    const artistPhone = booking.artist.user.phone;

    const serverBaseUrl =
      process.env.PUBLIC_API_URL ||
      process.env.CLIENT_URL?.split(',')[0] ||
      `http://localhost:${config.port}`;

    // ─────────────────────────────────────────────────────────────
    // 1. Send Notification to CLIENT
    // ─────────────────────────────────────────────────────────────
    if (clientPhone) {
      const clientMessage =
`✨ *LUME BOOKING CONFIRMATION* ✨

Hello *${clientName}*,
Your appointment request has been successfully submitted!

📋 *Booking Details:*
• *Artist:* ${artistName}
• *Service:* ${serviceName}
• *Date:* ${formattedDate}
• *Time:* ${timeSlot}
• *Location:* ${location}
• *Amount:* ₹${totalAmount}
• *Status:* ⏳ Pending Artist Confirmation

🔔 *What's next?*
We have alerted *${artistName}*. As soon as they confirm your appointment, you will receive an instant confirmation update right here on WhatsApp!

Thank you for choosing LUME.
_India's Premier Beauty Platform_`;

      await sendWhatsAppTextMessage(clientPhone, clientMessage);
    } else {
      console.log(`[WhatsApp Service] Client has no phone number on record for booking ${bookingId}`);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Send Interactive Notification to ARTIST with Accept/Deny
    // ─────────────────────────────────────────────────────────────
    if (artistPhone) {
      const acceptToken = generateBookingActionToken(booking.id, 'accept');
      const denyToken = generateBookingActionToken(booking.id, 'deny');

      const acceptUrl = `${serverBaseUrl}/api/bookings/whatsapp-action?id=${booking.id}&action=accept&token=${acceptToken}`;
      const denyUrl = `${serverBaseUrl}/api/bookings/whatsapp-action?id=${booking.id}&action=deny&token=${denyToken}`;

      const artistBody =
`Hello *${artistName}*, you have received a new booking request!

👤 *Client:* ${clientName}
💅 *Service:* ${serviceName}
📅 *Date:* ${formattedDate}
⏰ *Time:* ${timeSlot}
📍 *Location:* ${location}
💰 *Total Value:* ₹${totalAmount}
📝 *Client Notes:* ${notes}

👉 *Quick Links:*
• Accept: ${acceptUrl}
• Deny: ${denyUrl}

Please tap an option below to confirm or decline:`;

      const buttons = [
        { id: `ACCEPT_BOOKING_${booking.id}`, title: '✅ Accept' },
        { id: `DENY_BOOKING_${booking.id}`, title: '❌ Deny' },
      ];

      // Try sending interactive button message first
      const sentInteractive = await sendWhatsAppInteractiveButtons(
        artistPhone,
        artistBody,
        buttons,
        '🌸 NEW BOOKING REQUEST — LUME',
        'LUME Artist Portal'
      );

      // If interactive failed or fallback is needed, send as text with direct clickable action links
      if (!sentInteractive) {
        await sendWhatsAppTextMessage(
          artistPhone,
          `🌸 *NEW BOOKING REQUEST — LUME* 🌸\n\n${artistBody}`
        );
      }
    } else {
      console.log(`[WhatsApp Service] Artist ${artistName} has no phone number on record for booking ${bookingId}`);
    }
  } catch (err) {
    console.error('[WhatsApp Service notifyBookingCreated Error]:', err);
  }
}

/**
 * Notify Client and Artist when booking status is updated (e.g., Artist Accepted or Denied)
 */
export async function notifyBookingStatusChanged(
  bookingId: string,
  newStatus: string,
  cancelReason?: string
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            name: true,
            phone: true,
            clientProfile: { select: { mobileNumber: true } },
          },
        },
        artist: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        service: true,
      },
    });

    if (!booking) return;

    const clientName = booking.client.name || 'Client';
    const artistName = booking.artist.user.name || 'Artist';
    const serviceName = booking.service?.name || booking.priceType;
    const formattedDate = formatDate(booking.date);
    const timeSlot = booking.time;

    const clientPhone =
      booking.client.phone || booking.client.clientProfile?.mobileNumber;
    const artistPhone = booking.artist.user.phone;

    if (newStatus === 'ACCEPTED' || newStatus === 'CONFIRMED') {
      if (clientPhone) {
        const msg =
`🎉 *BOOKING ACCEPTED!* 🎉

Great news, *${clientName}*!
*${artistName}* has accepted your booking request!

📋 *Confirmed Appointment:*
• *Artist:* ${artistName}
• *Service:* ${serviceName}
• *Date:* ${formattedDate}
• *Time:* ${timeSlot}
• *Total:* ₹${booking.totalPaid}

Your artist is scheduled to attend to you. For any assistance, feel free to reply directly to this chat!

See you soon,
_Team LUME_`;
        await sendWhatsAppTextMessage(clientPhone, msg);
      }
    } else if (newStatus === 'CANCELLED') {
      if (clientPhone) {
        const reasonText = cancelReason ? `\n• *Reason:* ${cancelReason}` : '';
        const msg =
`⚠️ *BOOKING UPDATE — LUME* ⚠️

Hello *${clientName}*,
Unfortunately, *${artistName}* was unavailable and could not confirm your booking on *${formattedDate}* at *${timeSlot}*.${reasonText}

You can explore other verified top artists on LUME anytime at:
https://lumebeauty.com/discover

We apologize for the inconvenience,
_Team LUME_`;
        await sendWhatsAppTextMessage(clientPhone, msg);
      }

      if (artistPhone) {
        const msg =
`ℹ️ *Booking Notice:*
Booking #${booking.id.slice(-6).toUpperCase()} for ${clientName} on ${formattedDate} is now marked as DECLINED/CANCELLED.`;
        await sendWhatsAppTextMessage(artistPhone, msg);
      }
    }
  } catch (err) {
    console.error('[WhatsApp Service notifyBookingStatusChanged Error]:', err);
  }
}
