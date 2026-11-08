import type { ClientSavedAddress } from '../context/AuthContext';

export function parseSlotMinutes(raw?: string | null): number | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim().toUpperCase();
  const m = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3];
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatSlotMinutes(minutes: number) {
  return [Math.floor(minutes / 60) % 24, minutes % 60].map(n => String(n).padStart(2, '0')).join(':');
}

export interface SessionTime { date: string | Date; time: string; endTime?: string | null }

export function bookingIntervals(booking: Pick<SessionTime, 'time' | 'endTime'>) {
  const starts = (booking.time || '').split(',').map(parseSlotMinutes).filter((n): n is number => n !== null);
  const end = parseSlotMinutes(booking.endTime);
  if (starts.length === 1 && end !== null) return [{ start: starts[0], end: end === 0 ? 1440 : end }];
  return starts.map(start => ({ start, end: start + 60 }));
}

export function hasBookingDateTimePassed(booking: SessionTime, now = new Date()) {
  const date = new Date(booking.date);
  if (Number.isNaN(date.getTime())) return false;
  const intervals = bookingIntervals(booking);
  const end = intervals.length ? Math.max(...intervals.map(i => i.end)) : 1440;
  const midnight = Date.parse(date.toISOString().slice(0, 10) + 'T00:00:00+05:30');
  return now.getTime() >= midnight + end * 60000;
}

export function isBookingReviewEligible(booking: SessionTime & { status: string; review?: unknown }, now = new Date()) {
  return !booking.review && ['ACCEPTED', 'CONFIRMED', 'PARTIALLY_PAID', 'COMPLETED'].includes(booking.status)
    && hasBookingDateTimePassed(booking, now);
}

/**
 * Extracts latitude/longitude from Google Maps URLs or raw coordinate pairs.
 * Supports:
 * - https://www.google.com/maps/@19.0596,72.8295,17z
 * - https://www.google.com/maps?q=19.0596,72.8295
 * - https://maps.google.com/?ll=19.0596,72.8295
 * - ...!3d19.0596!4d72.8295...
 * - 19.0596, 72.8295
 */
export function parseGoogleMapsCoordinates(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  const patterns = [
    /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/i,
    /@(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/i,
    /[?&](?:q|ll|query|destination|center)=(-?\d{1,2}\.\d+)\s*(?:,|%2C)\s*(-?\d{1,3}\.\d+)/i,
    /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/,
  ];

  for (const re of patterns) {
    const match = trimmed.match(re);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      }
    }
  }
  return null;
}

export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatSavedAddressLine(addr: ClientSavedAddress): string {
  const parts = [
    addr.apartment?.trim(),
    addr.street?.trim(),
    addr.landmark?.trim() ? `Near ${addr.landmark.trim()}` : '',
    addr.city?.trim(),
    addr.pincode?.trim() ? `- ${addr.pincode.trim()}` : '',
  ].filter(Boolean);
  return parts.join(', ').replace(', - ', ' - ');
}

export function hasExactGeoAddress(addr?: Partial<ClientSavedAddress> | null): addr is ClientSavedAddress & { lat: number; lng: number } {
  if (!addr) return false;
  return (
    Boolean(addr.apartment?.trim()) && /^[1-9]\d{5}$/.test(addr.pincode || '') &&
    Boolean(addr.street?.trim()) &&
    Boolean(addr.city?.trim()) &&
    typeof addr.lat === 'number' &&
    Math.abs(addr.lat) <= 90 &&
    typeof addr.lng === 'number' &&
    Math.abs(addr.lng) <= 180
  );
}

