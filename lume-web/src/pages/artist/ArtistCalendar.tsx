import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Save, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import './ArtistPages.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hr = i.toString().padStart(2, '0');
  const dHr = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i < 12 ? 'AM' : 'PM';
  return { value: `${hr}:00`, label: `${dHr}:00 ${ampm}` };
});

const formatTimeStr = (t: string) => {
  const hr = parseInt(t.split(':')[0], 10);
  const ampm = hr < 12 ? 'a' : 'p';
  const h = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${h}${ampm}`;
};

const formatTimeRange = (start: string, end: string) => {
  return `${formatTimeStr(start)}-${formatTimeStr(end)}`;
};

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

type WeekSchedule = Record<number, DaySchedule>;

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

const createDefaultWeek = (): WeekSchedule => {
  const week: WeekSchedule = {};
  for (let i = 0; i < 7; i++) {
    // Mon-Fri active by default
    week[i] = { active: i > 0 && i < 6, start: DEFAULT_START, end: DEFAULT_END };
  }
  return week;
};

// Helper: API 24h slots -> DaySchedule
const slotsToDaySchedule = (slots: { time: string, available: boolean }[]): DaySchedule => {
  const activeSlots = slots.filter(s => s.available);
  if (activeSlots.length === 0) return { active: false, start: DEFAULT_START, end: DEFAULT_END };

  const startHour = Math.min(...activeSlots.map(s => parseInt(s.time.split(':')[0], 10)));
  const endHour = Math.max(...activeSlots.map(s => parseInt(s.time.split(':')[0], 10))) + 1; // End is +1 hr from last active slot
  
  const startStr = `${startHour.toString().padStart(2, '0')}:00`;
  const endStr = endHour >= 24 ? "23:00" : `${endHour.toString().padStart(2, '0')}:00`;

  return { active: true, start: startStr, end: endStr };
};

// Helper: DaySchedule -> API 24h slots
const dayScheduleToSlots = (schedule: DaySchedule) => {
  const slots: { time: string, available: boolean }[] = [];
  const startHour = parseInt(schedule.start.split(':')[0], 10);
  let endHour = parseInt(schedule.end.split(':')[0], 10);
  
  if (endHour <= startHour) endHour = startHour; // Prevent negative blocks

  for (let i = 0; i < 24; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    const isAvailable = schedule.active && i >= startHour && i < endHour;
    slots.push({ time, available: isAvailable });
  }
  return slots;
};

const ArtistCalendar: React.FC = () => {
  const { user } = useAuth();
  const { execute } = useApi();
  const artistId = user?.artistProfile?.id;

  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(createDefaultWeek());
  const [dayOverrides, setDayOverrides] = useState<Record<string, DaySchedule>>({}); // date -> DaySchedule
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const loadAvailability = useCallback(async () => {
    if (!artistId) return;
    const res = await execute(`/api/artists/${artistId}/availability`, { method: 'GET' }) as { defaultSchedule: any[], availability: any[] };
    if (res) {
      // 1. Load defaults
      const schedule: WeekSchedule = {};
      if (res.defaultSchedule && res.defaultSchedule.length > 0) {
        res.defaultSchedule.forEach((d: any) => {
          if (d.timeSlots && Array.isArray(d.timeSlots)) {
            schedule[d.dayOfWeek] = slotsToDaySchedule(d.timeSlots);
          }
        });
      }
      for (let i = 0; i < 7; i++) {
        if (!schedule[i]) schedule[i] = { active: false, start: DEFAULT_START, end: DEFAULT_END };
      }
      setWeekSchedule(schedule);

      // 2. Load overrides
      const overrides: Record<string, DaySchedule> = {};
      if (res.availability && res.availability.length > 0) {
        res.availability.forEach((a: any) => {
          // Prisma returns a Date string, extract YYYY-MM-DD
          const dStr = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
          if (a.timeSlots && Array.isArray(a.timeSlots)) {
            overrides[dStr] = slotsToDaySchedule(a.timeSlots);
          }
        });
      }
      setDayOverrides(overrides);
    }
  }, [artistId, execute]);

  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  // Save default weekly schedule
  const saveDefaultSchedule = async () => {
    if (!artistId) return;
    setSaving(true);
    const days = Object.entries(weekSchedule).map(([dow, schedule]) => ({
      dayOfWeek: parseInt(dow),
      timeSlots: dayScheduleToSlots(schedule),
    }));
    await execute(`/api/artists/${artistId}/availability/default`, { method: 'PUT', body: { days } });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  // Save override for a specific date
  const saveDayOverride = async (dateStr: string) => {
    if (!artistId) return;
    setSaving(true);
    const schedule = dayOverrides[dateStr] || weekSchedule[new Date(dateStr + 'T00:00:00').getDay()];
    await execute(`/api/artists/${artistId}/availability`, {
      method: 'PUT',
      body: { date: dateStr, timeSlots: dayScheduleToSlots(schedule) },
    });
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateWeekDay = (dow: number, updates: Partial<DaySchedule>) => {
    setWeekSchedule(prev => ({ ...prev, [dow]: { ...prev[dow], ...updates } }));
  };

  const updateDayOverride = (dateStr: string, updates: Partial<DaySchedule>) => {
    const dow = new Date(dateStr + 'T00:00:00').getDay();
    const base = dayOverrides[dateStr] || weekSchedule[dow];
    setDayOverrides(prev => ({ ...prev, [dateStr]: { ...base, ...updates } }));
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const getScheduleForDate = (dateStr: string): DaySchedule => {
    if (dayOverrides[dateStr]) return dayOverrides[dateStr];
    const dow = new Date(dateStr + 'T00:00:00').getDay();
    return weekSchedule[dow];
  };

  const selectedSchedule = selectedDate ? getScheduleForDate(selectedDate) : null;

  return (
    <div className="artist-page">
      <div className="artist-page__header">
        <h1 className="artist-page__title">Availability</h1>
        <p className="artist-page__subtitle">Set your regular weekly hours, or click on a calendar date to create exceptions.</p>
        {user?.artistProfile?.hourlyPrice && (
          <div style={{ marginTop: 12, padding: '8px 16px', background: 'rgba(217,122,140,0.08)', border: '1px solid rgba(217,122,140,0.2)', display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, color: 'var(--rose-deep)', fontWeight: 600, fontSize: '0.9rem' }}>
            Current Rate: <span style={{ fontSize: '1rem' }}>${user.artistProfile.hourlyPrice} / hr</span>
          </div>
        )}
      </div>

      <div className="calendar-layout-grid">
        {/* Left Column: Weekly Schedule */}
        <div className="calendar-left-col">
          <div className="artist-panel">
            <div className="artist-panel__header" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="artist-panel__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color="var(--gold)" /> Weekly Template
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {saved && <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Saved!</span>}
                <button type="button" className="artist-save-btn" onClick={saveDefaultSchedule} disabled={saving}>
                  <Save size={14} style={{ marginRight: 6 }} />{saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
            
            <div className="artist-panel__body" style={{ padding: '24px 20px' }}>
              <div className="schedule-list">
                {FULL_DAYS.map((dayName, dow) => {
                  const schedule = weekSchedule[dow];
                  return (
                    <div key={dow} className={`schedule-row ${schedule.active ? 'schedule-row--active' : ''}`}>
                      <div className="schedule-row__day-wrapper">
                        <label className="schedule-toggle">
                          <input 
                            type="checkbox" 
                            checked={schedule.active}
                            onChange={(e) => updateWeekDay(dow, { active: e.target.checked })} 
                          />
                          <span className="schedule-toggle-slider"></span>
                        </label>
                        <span className="schedule-row__day-name">{dayName}</span>
                      </div>
                      
                      {schedule.active ? (
                        <div className="schedule-row__times">
                          <div className="schedule-time-select-wrapper">
                            <select 
                              className="schedule-time-select"
                              value={schedule.start}
                              onChange={(e) => updateWeekDay(dow, { start: e.target.value })}
                            >
                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                          <span className="schedule-row__to">-</span>
                          <div className="schedule-time-select-wrapper">
                            <select 
                              className="schedule-time-select"
                              value={schedule.end}
                              onChange={(e) => updateWeekDay(dow, { end: e.target.value })}
                            >
                              {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div className="schedule-row__unavailable">Unavailable</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Calendar & Overrides */}
        <div className="calendar-right-col">
          <div className="artist-panel calendar-panel">
            <div className="artist-panel__header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="artist-panel__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarIcon size={18} color="var(--rose-deep)" /> Date Specific Overrides
              </h2>
            </div>
            
            <div className="artist-panel__body" style={{ padding: '0 24px 24px' }}>
              <div className="calendar-header-nav">
                <button type="button" className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  <ChevronLeft size={18} />
                </button>
                <span className="calendar-month-title">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" className="calendar-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="calendar-grid-wrapper">
                <div className="calendar-weekdays">
                  {DAYS.map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="calendar-days">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="calendar-day calendar-day--empty" />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const dateStr = formatDate(year, month, i + 1);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const isPast = dateStr < todayStr;
                    const schedule = getScheduleForDate(dateStr);
                    const hasOverride = !!dayOverrides[dateStr];
                    
                    return (
                      <button 
                        key={i} 
                        type="button" 
                        disabled={isPast} 
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`calendar-day ${isSelected ? 'calendar-day--selected' : ''} ${isToday ? 'calendar-day--today' : ''} ${isPast ? 'calendar-day--past' : ''} ${schedule.active ? 'calendar-day--active' : 'calendar-day--off'}`}
                      >
                        <span className="calendar-day-num">{i + 1}</span>
                        {!isPast && (
                          <div className="calendar-day-indicator">
                            {schedule.active ? (
                              <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '-0.3px' }}>
                                {formatTimeRange(schedule.start, schedule.end)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--mid)', fontWeight: 600 }}>Off</span>
                            )}
                          </div>
                        )}
                        {hasOverride && !isPast && <span className="calendar-override-badge" title="Custom Schedule Set" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Date Specific Override Modal */}
          {selectedDate && selectedSchedule && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
              <div className="artist-panel override-panel fade-in" style={{ width: '100%', maxWidth: 400, margin: 0, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <div className="artist-panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <h2 className="artist-panel__title" style={{ fontSize: '1.1rem', margin: 0 }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h2>
                  <button type="button" onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--mid)', padding: 0, lineHeight: 1 }}>&times;</button>
                </div>
                <div className="artist-panel__body" style={{ padding: '20px' }}>
                  <div className={`schedule-row ${selectedSchedule.active ? 'schedule-row--active' : ''}`} style={{ borderBottom: 'none', padding: 0, flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="schedule-row__day-name" style={{ fontWeight: 600, fontSize: '1rem' }}>Accepting Bookings</span>
                      <label className="schedule-toggle">
                        <input 
                          type="checkbox" 
                          checked={selectedSchedule.active}
                          onChange={(e) => updateDayOverride(selectedDate, { active: e.target.checked })} 
                        />
                        <span className="schedule-toggle-slider"></span>
                      </label>
                    </div>
                    
                    {selectedSchedule.active ? (
                      <div className="schedule-row__times" style={{ justifyContent: 'center', padding: '12px 0', background: 'rgba(217,122,140,0.05)', borderRadius: 8, marginTop: 8 }}>
                        <div className="schedule-time-select-wrapper">
                          <select 
                            className="schedule-time-select"
                            value={selectedSchedule.start}
                            onChange={(e) => updateDayOverride(selectedDate, { start: e.target.value })}
                          >
                            {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <span className="schedule-row__to">-</span>
                        <div className="schedule-time-select-wrapper">
                          <select 
                            className="schedule-time-select"
                            value={selectedSchedule.end}
                            onChange={(e) => updateDayOverride(selectedDate, { end: e.target.value })}
                          >
                            {TIME_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="schedule-row__unavailable" style={{ textAlign: 'center', marginTop: 8 }}>Marked as Off</div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <button type="button" className="artist-save-btn artist-save-btn--secondary" style={{ width: '100%', padding: '10px' }} onClick={async () => {
                        await saveDayOverride(selectedDate);
                        setSelectedDate(null);
                      }} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Override'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistCalendar;
