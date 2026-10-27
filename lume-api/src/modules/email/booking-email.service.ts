import prisma from '../../lib/prisma';
import { config } from '../../config/env';
import { isEmailConfigured, sendEmail } from './email.service';
import { describeEmailError } from './gmail.transport';
import { buildBookingEmail, BookingEmailEvent, BookingEmailSnapshot } from './booking-email.templates';

/** Use the saved booking snapshot so later status changes cannot alter this email. */
export async function notifyBookingEmail(booking: BookingEmailSnapshot, event: BookingEmailEvent): Promise<void> {
  if (!isEmailConfigured()) return;
  const details = await prisma.booking.findUnique({
    where: { id: booking.id },
    select: {
      client: { select: { name: true, email: true } },
      artist: { select: { user: { select: { name: true, email: true } } } },
      service: { select: { name: true } },
    },
  });
  if (!details) return;

  // Each recipient has a separate attempt: one failure must not suppress the other.
  const results = await Promise.allSettled((['artist', 'client'] as const).map(async recipient => {
    const contact = recipient === 'artist' ? details.artist.user : details.client;
    const message = buildBookingEmail({
      booking, event, recipient, client: details.client, artist: details.artist.user,
      serviceName: details.service?.name || null, appUrl: config.email.appUrl,
    });
    await sendEmail({ ...message, to: contact.email, idempotencyKey: `booking/${booking.id}/${event}/${recipient}` });
  }));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const role = index === 0 ? 'artist' : 'client';
      console.error(`[Email] ${event} failed for ${role}, booking ${booking.id}:`,
        describeEmailError(result.reason));
    }
  });
}

/** Fire independently of booking responses and existing WhatsApp notifications. */
export function queueBookingEmail(booking: BookingEmailSnapshot, event: BookingEmailEvent): void {
  void notifyBookingEmail(booking, event).catch(() => {
    console.error(`[Email] Could not prepare ${event} for booking ${booking.id}`);
  });
}
