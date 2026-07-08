import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import './ArtistPages.css';

const DEFAULT_TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];

const ArtistCalendar: React.FC = () => {
  const { user } = useAuth();
  const { execute } = useApi();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Format date as YYYY-MM-DD
  const formatDateKey = (d: Date) => d.toISOString().split('T')[0];

  useEffect(() => {
    // Initialize default slots for selected date
    const initialSlots: Record<string, boolean> = {};
    DEFAULT_TIME_SLOTS.forEach((slot) => {
      initialSlots[slot] = true;
    });
    setAvailableSlots(initialSlots);
  }, [selectedDate]);

  const toggleSlot = (time: string) => {
    setAvailableSlots((prev) => ({
      ...prev,
      [time]: !prev[time],
    }));
  };

  const toggleBlockDate = async (dateKey: string) => {
    if (blockedDates.includes(dateKey)) {
      setBlockedDates((prev) => prev.filter((d) => d !== dateKey));
      if (user?.artistProfile?.id) {
        await execute(`/api/artists/${user.artistProfile.id}/availability/block`, {
          method: 'DELETE',
          body: { date: dateKey },
        });
      }
    } else {
      setBlockedDates((prev) => [...prev, dateKey]);
      if (user?.artistProfile?.id) {
        await execute(`/api/artists/${user.artistProfile.id}/availability/block`, {
          method: 'POST',
          body: { date: dateKey, reason: 'Vacation / Blocked' },
        });
      }
    }
  };

  const handleSaveSlots = async () => {
    if (!user?.artistProfile?.id) return;
    setSaveStatus('Saving availability...');

    const timeSlotsArray = DEFAULT_TIME_SLOTS.map((t) => ({
      time: t,
      available: !!availableSlots[t],
    }));

    try {
      await execute(`/api/artists/${user.artistProfile.id}/availability`, {
        method: 'PUT',
        body: {
          date: formatDateKey(selectedDate),
          timeSlots: timeSlotsArray,
        },
      });
      setSaveStatus('Availability saved!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Error saving availability');
    }
  };

  // Build calendar days for current month view
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="artist-page">
      <div className="artist-page__header">
        <h1 className="artist-page__title">Calendar & Availability</h1>
        <p className="artist-page__subtitle">
          Manage your schedule, open time slots for bookings, or block off dates for rest and vacations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
        {/* Month View Picker & Block Days */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                style={{ padding: 6, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(42,26,31,0.1)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                style={{ padding: 6, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(42,26,31,0.1)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="artist-panel__body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 10, fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-soft)' }}>
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {paddingDays.map((p) => (
                <div key={`pad-${p}`} style={{ height: 42 }} />
              ))}

              {daysArray.map((day) => {
                const dateObj = new Date(year, month, day);
                const dateKey = formatDateKey(dateObj);
                const isSelected = formatDateKey(selectedDate) === dateKey;
                const isBlocked = blockedDates.includes(dateKey);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(dateObj)}
                    onDoubleClick={() => toggleBlockDate(dateKey)}
                    style={{
                      height: 44,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--rose-deep)' : '1px solid rgba(42,26,31,0.08)',
                      background: isBlocked
                        ? 'rgba(239,68,68,0.12)'
                        : isSelected
                        ? 'var(--rose-light)'
                        : 'white',
                      color: isBlocked ? '#dc2626' : 'var(--dark)',
                      position: 'relative',
                    }}
                  >
                    <span>{day}</span>
                    {isBlocked && (
                      <span style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: 700 }}>BLOCKED</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-soft)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--rose-light)', border: '1px solid var(--rose-deep)' }} /> Selected
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,68,68,0.2)' }} /> Double-click to block/unblock date
              </span>
            </div>
          </div>
        </div>

        {/* Time Slot Editor for Selected Date */}
        <div className="artist-panel">
          <div className="artist-panel__header">
            <h2 className="artist-panel__title">
              Time Slots for {selectedDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              type="button"
              onClick={handleSaveSlots}
              className="artist-save-btn"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Save Schedule
            </button>
          </div>

          <div className="artist-panel__body">
            {saveStatus && (
              <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
                {saveStatus}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEFAULT_TIME_SLOTS.map((slot) => {
                const isAvailable = availableSlots[slot];
                return (
                  <div
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isAvailable ? 'white' : 'rgba(42,26,31,0.03)',
                      border: '1.5px solid',
                      borderColor: isAvailable ? 'var(--rose)' : 'rgba(42,26,31,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Clock size={16} color={isAvailable ? 'var(--rose-deep)' : 'var(--text-soft)'} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isAvailable ? 'var(--dark)' : 'var(--text-soft)' }}>
                        {slot}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isAvailable ? (
                        <>
                          <CheckCircle size={16} color="#16a34a" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#16a34a' }}>Available</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="var(--text-soft)" />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Closed</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCalendar;
