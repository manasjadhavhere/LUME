import type { Booking } from '@prisma/client';

export type BookingEmailEvent = 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'ADVANCE_PAID' | 'CONFIRMED';
export type BookingEmailSnapshot = Pick<Booking,
  'id' | 'date' | 'time' | 'endTime' | 'priceType' | 'totalPaid' | 'notes' | 'address' |
  'cancelReason' | 'advancePaid' | 'remainingAmount'>;

interface Contact { name: string; email: string }
export interface BookingEmailContext {
  booking: BookingEmailSnapshot;
  client: Contact;
  artist: Contact;
  serviceName: string | null;
  event: BookingEmailEvent;
  recipient: 'artist' | 'client';
  appUrl: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]!));
}

const money = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(amount);

export function buildBookingEmail(context: BookingEmailContext) {
  const { booking, client, artist, event, recipient } = context;
  const isArtist = recipient === 'artist';
  const titles: Record<BookingEmailEvent, string> = {
    REQUESTED: isArtist ? 'New booking request' : 'Booking request received',
    ACCEPTED: 'Booking accepted — payment pending',
    DECLINED: 'Booking request declined',
    CANCELLED: 'Booking cancelled',
    ADVANCE_PAID: 'Booking secured — advance payment received',
    CONFIRMED: 'Booking confirmed',
  };
  const descriptions: Record<BookingEmailEvent, string> = {
    REQUESTED: isArtist
      ? `${client.name} has requested an appointment with you. Open your artist dashboard to accept or decline the request.`
      : `Your booking request has been sent to ${artist.name}. We will email you when the artist responds. Your appointment is awaiting approval.`,
    ACCEPTED: isArtist
      ? `You have accepted ${client.name}'s booking request. The client needs to complete payment to secure the appointment.`
      : `${artist.name} has accepted your booking request. Open your bookings on LUME to pay and secure the appointment.`,
    DECLINED: isArtist
      ? `You have declined ${client.name}'s booking request.`
      : `${artist.name} could not accept your booking request. You can choose another artist or request another date on LUME.`,
    CANCELLED: `The appointment between ${client.name} and ${artist.name} has been cancelled.`,
    ADVANCE_PAID: isArtist
      ? `${client.name}'s advance payment has been verified and the appointment is secured. A remaining balance is still due.`
      : `Your advance payment has been verified. Your appointment with ${artist.name} is secured. A remaining balance is still due.`,
    CONFIRMED: isArtist
      ? `The appointment with ${client.name} is confirmed. Please review the booking details below.`
      : `Your appointment with ${artist.name} is confirmed. Please review the booking details below.`,
  };

  const title = titles[event];
  const url = new URL(isArtist ? '/artist-dashboard/bookings' : '/profile', context.appUrl).toString();
  const serviceName = context.serviceName || ({
    WEDDING: 'Wedding service', OCCASION: 'Occasion service', HOURLY: 'Hourly service',
  }[booking.priceType]);
  const rows: [string, string][] = [
    ['Booking reference', booking.id],
    ['Status', title],
    ['Client', client.name],
    ['Artist', artist.name],
    ['Service', serviceName],
    ['Date', new Intl.DateTimeFormat('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
    }).format(booking.date)],
    ['Time (IST)', booking.endTime ? `${booking.time} – ${booking.endTime}` : booking.time],
    ['Location', booking.address || 'To be arranged with the artist'],
    // totalPaid stores the base price, not the amount actually collected.
    ['Service price (before GST)', money(booking.totalPaid)],
  ];
  if (event === 'ADVANCE_PAID' || (event === 'CONFIRMED' && booking.advancePaid > 0)) {
    rows.push(['Paid (including GST)', money(booking.advancePaid)], ['Remaining balance (including GST)', money(booking.remainingAmount)]);
  }
  const counterpart = isArtist ? client : artist;
  rows.push([isArtist ? 'Client email' : 'Artist email', counterpart.email]);
  if (booking.notes) rows.push(['Client notes', booking.notes]);
  if ((event === 'DECLINED' || event === 'CANCELLED') && booking.cancelReason) {
    rows.push(['Reason', booking.cancelReason]);
  }

  const greeting = `Hello ${isArtist ? artist.name : client.name},`;
  const description = descriptions[event];
  const text = [title, '', greeting, '', description, '', ...rows.map(([key, value]) => `${key}: ${value}`),
    '', `View your bookings: ${url}`, '', 'Team LUME',
    'This is an automated booking update. Manage your appointment on LUME.',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#fdf6f0;font-family:Arial,sans-serif;color:#2a1a1f">
<table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:24px 12px">
<table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fff;border-radius:12px"><tr><td style="padding:32px">
<div style="color:#8b203f;font-size:26px;letter-spacing:5px;font-weight:bold">LUME</div>
<h1 style="font-size:24px;line-height:1.3">${escapeHtml(title)}</h1>
<p>${escapeHtml(greeting)}</p><p style="line-height:1.6">${escapeHtml(description)}</p>
<table style="width:100%;border-collapse:collapse">${rows.map(([key, value]) => `<tr><th scope="row" style="padding:10px 8px;border-bottom:1px solid #f2e8eb;text-align:left;vertical-align:top;font-size:13px;width:38%">${escapeHtml(key)}</th><td style="padding:10px 8px;border-bottom:1px solid #f2e8eb;font-size:14px;white-space:pre-line;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join('')}</table>
<p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#8b203f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:6px">View your bookings</a></p>
<p style="font-size:12px;color:#75656b;line-height:1.6">This is an automated booking update. Manage your appointment on LUME.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject: `LUME | ${title} | #${booking.id.slice(-6).toUpperCase()}`, html, text };
}
