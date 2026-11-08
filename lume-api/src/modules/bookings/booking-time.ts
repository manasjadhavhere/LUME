export function slotMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  if (match[3]) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  }
  return hour <= 23 ? hour * 60 + Number(match[2] || 0) : null;
}

export function formatSlot(minutes: number) {
  return [Math.floor(minutes / 60) % 24, minutes % 60].map(n => String(n).padStart(2, '0')).join(':');
}

export interface SessionTime { time: string; endTime?: string | null }

export function sessionIntervals(booking: SessionTime) {
  const starts = booking.time.split(',').map(slotMinutes).filter((n): n is number => n !== null);
  const end = slotMinutes(booking.endTime || '');
  if (starts.length === 1 && end !== null) {
    return [{ start: starts[0], end: end === 0 ? 1440 : Math.max(starts[0] + 1, end) }];
  }
  return starts.map(start => ({ start, end: start + 60 }));
}

export function hasBookingDateTimePassed(booking: SessionTime & { date: Date }, now = new Date()) {
  const intervals = sessionIntervals(booking);
  const end = intervals.length ? Math.max(...intervals.map(i => i.end)) : 1440;
  const midnight = Date.parse(booking.date.toISOString().slice(0, 10) + 'T00:00:00+05:30');
  return now.getTime() >= midnight + end * 60000;
}
