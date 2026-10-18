import { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, RefreshCw, IndianRupee, Wallet, MapPin, Clock, Activity, Star, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE, useAuth } from '../../context/AuthContext';

interface Ranking { id: string; name: string; city: string; rating: number; reviewCount: number; gmv: number; paidBookings: number }
export interface Insights {
  generatedAt: string; days: number | null;
  financial: { gmv: number; collections: number; netRevenue: number; gst: number; paidBookings: number; aov: number; cancelledBookingCollections: number; aovByType: { type: string; paidBookings: number; value: number }[] };
  payouts: Record<string, { amount: number; count: number }>;
  failedTransfers: number;
  cities: { city: string; activeArtists: number; artists: number; bookings: number; gmv: number; demandPerArtist: number | null; underserved: boolean }[];
  leaderboard: Ranking[]; topRated: Ranking[];
  verification: { pending: number; submitted: number; overdue: number; averageHours: number | null; reviewed: number; approved: number; rejected: number };
  trends: { month: string; gmv: number; commission: number }[];
  bookingSummary: { total: number; completed: number; cancelled: number };
  activity: { id: string; type: string; at: string; title: string; detail: string; artistId?: string }[];
  audit: { id: string; actorName: string; action: string; targetId: string; createdAt: string }[];
}

const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const typeLabels: Record<string, string> = { WEDDING: 'Bridal Artistry', OCCASION: 'Party & Occasion', HOURLY: 'Editorial / Commercial' };

// Module-level cache to prevent any screen flashing or glitching when switching tabs or refreshing
const insightsCache: Record<string, Insights> = {};

export default function AdminInsights({ onArtist, onCity, activityOnly = false, revision = 0 }: { onArtist: (id: string) => void; onCity: (city: string) => void; activityOnly?: boolean; revision?: number }) {
  const { token } = useAuth();
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState<Insights | null>(() => insightsCache['30'] || null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(() => !insightsCache['30']);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [ranking, setRanking] = useState('revenue');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // When period changes, if cached data exists, display it immediately without waiting
  useEffect(() => {
    if (insightsCache[period]) {
      setData(insightsCache[period]);
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;

    const load = async (isBackground = false) => {
      if (inFlight) return;
      if (isBackground && typeof document !== 'undefined' && document.hidden) return;
      inFlight = true;
      if (!insightsCache[period]) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/insights/analytics?days=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Could not load insights.');

        if (!controller.signal.aborted && isMounted.current) {
          insightsCache[period] = body.data;
          setData(body.data);
          setError('');
        }
      } catch (err) {
        if (!controller.signal.aborted && isMounted.current) {
          if (!insightsCache[period]) {
            setError(err instanceof Error ? err.message : 'Could not load insights.');
          }
        }
      } finally {
        inFlight = false;
        if (!controller.signal.aborted && isMounted.current) {
          setLoading(false);
          setIsUpdating(false);
        }
      }
    };

    void load(false);
    const interval = setInterval(() => void load(true), 60000);
    const onVisibility = () => { if (document.visibilityState === 'visible') void load(false); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      controller.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [token, period, refresh, revision]);

  const feed = data?.activity.filter(a => feedFilter === 'all' || a.type === feedFilter) || [];

  return (
    <section className="admin-insights" aria-label={activityOnly ? 'Operations activity' : 'Business insights'}>
      {/* ── Executive Header Bar ── */}
      <div className="admin-insights__heading">
        <div className="admin-insights__title-wrap">
          <div className="admin-insights__badge">
            <span className="admin-insights__badge-dot" />
            <span>LUME BUSINESS TELEMETRY</span>
          </div>
          <h2>{activityOnly ? 'Behind every booking.' : 'Executive Overview'}</h2>
          <p>
            {data ? (
              <>
                Synchronized at {new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {isUpdating ? ' · Refreshing…' : ' · Live marketplace metrics'}
              </>
            ) : (
              'Real-time marketplace revenue, artist operations, and booking metrics.'
            )}
          </p>
        </div>

        <div className="admin-toolbar">
          <div className="admin-period-picker" role="radiogroup" aria-label="Insights period selection">
            {[
              { val: '30', label: '30 Days' },
              { val: '90', label: '90 Days' },
              { val: '365', label: '1 Year' },
              { val: 'all', label: 'All Time' },
            ].map(p => (
              <button
                key={p.val}
                type="button"
                className={`admin-period-btn ${period === p.val ? 'is-active' : ''}`}
                onClick={() => setPeriod(p.val)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            className={`admin-button admin-button--refresh ${isUpdating ? 'is-spinning' : ''}`}
            onClick={() => setRefresh(v => v + 1)}
            disabled={loading}
            aria-label="Refresh insights"
            title="Refresh analytics"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && !data && (
        <div className="admin-feedback admin-feedback--error" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button type="button" onClick={() => setRefresh(v => v + 1)}>Retry</button>
        </div>
      )}

      {!data && loading && (
        <div className="admin-insights__skeleton-grid">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="admin-skeleton-card" />
          ))}
        </div>
      )}

      {data && (
        <>
          {!activityOnly && (
            <>
              {/* ── Tier 1: Core Financial KPI Cards (Clean White 4-Card Grid) ── */}
              <div className="admin-finance-grid">
                <article className="admin-finance-card admin-finance-card--highlight">
                  <div className="admin-finance-card__top">
                    <span className="admin-finance-card__label">Service GMV</span>
                    <span className="admin-finance-card__icon-wrap">
                      <IndianRupee size={18} />
                    </span>
                  </div>
                  <strong className="admin-finance-card__value">{money(data.financial.gmv)}</strong>
                  <div className="admin-finance-card__footer">
                    <span className="admin-finance-card__pill admin-finance-card__pill--brand">Gross Volume</span>
                    <small>Excludes GST · 100% verified collections</small>
                  </div>
                </article>

                <article className="admin-finance-card">
                  <div className="admin-finance-card__top">
                    <span className="admin-finance-card__label">Platform Commission</span>
                    <span className="admin-finance-card__icon-wrap">
                      <Wallet size={18} />
                    </span>
                  </div>
                  <strong className="admin-finance-card__value">{money(data.financial.netRevenue)}</strong>
                  <div className="admin-finance-card__footer">
                    <span className="admin-finance-card__pill admin-finance-card__pill--success">Net 15%</span>
                    <small>Net revenue earned before processing costs</small>
                  </div>
                </article>

                <article className="admin-finance-card">
                  <div className="admin-finance-card__top">
                    <span className="admin-finance-card__label">Avg. Collected Order</span>
                    <span className="admin-finance-card__icon-wrap">
                      <TrendingUp size={18} />
                    </span>
                  </div>
                  <strong className="admin-finance-card__value">{money(data.financial.aov)}</strong>
                  <div className="admin-finance-card__footer">
                    <span className="admin-finance-card__pill admin-finance-card__pill--neutral">{data.financial.paidBookings} paid bookings</span>
                    <small>Weighted across bridal, occasion & hourly</small>
                  </div>
                </article>

                <article className="admin-finance-card">
                  <div className="admin-finance-card__top">
                    <span className="admin-finance-card__label">Outstanding Payouts</span>
                    <span className="admin-finance-card__icon-wrap">
                      <Clock size={18} />
                    </span>
                  </div>
                  <strong className="admin-finance-card__value">
                    {money((data.payouts.pending?.amount || 0) + (data.payouts.initiated?.amount || 0) + (data.payouts.failed?.amount || 0))}
                  </strong>
                  <div className="admin-finance-card__footer">
                    <span className="admin-finance-card__pill admin-finance-card__pill--warning">In Escrow</span>
                    <small>Current artist balance awaiting release</small>
                  </div>
                </article>
              </div>

              {/* ── Tier 2: Executive Financial Strip ── */}
              <div className="admin-metric-strip">
                <div className="admin-metric-strip__item">
                  <span className="admin-metric-strip__dot admin-metric-strip__dot--blue" />
                  <span>Total Customer Collections</span>
                  <b>{money(data.financial.collections)}</b>
                </div>
                <div className="admin-divider-v" />
                <div className="admin-metric-strip__item">
                  <span className="admin-metric-strip__dot admin-metric-strip__dot--purple" />
                  <span>GST Collected (18%)</span>
                  <b>{money(data.financial.gst)}</b>
                </div>
                <div className="admin-divider-v" />
                <div className="admin-metric-strip__item">
                  <span className="admin-metric-strip__dot admin-metric-strip__dot--green" />
                  <span>Paid to Artists (All Time)</span>
                  <b>{money(data.payouts.completed?.amount || 0)}</b>
                </div>
                <div className="admin-divider-v" />
                <div className="admin-metric-strip__item">
                  <span className={`admin-metric-strip__dot ${data.failedTransfers > 0 ? 'admin-metric-strip__dot--red' : 'admin-metric-strip__dot--green'}`} />
                  <span>Failed Transfers</span>
                  <b className={data.failedTransfers > 0 ? 'admin-text-danger' : 'admin-text-success'}>
                    {data.failedTransfers === 0 ? '0 (All Clear)' : data.failedTransfers}
                  </b>
                </div>
              </div>

              {data.financial.cancelledBookingCollections > 0 && (
                <div className="admin-feedback admin-feedback--info">
                  <Clock size={16} />
                  <span>{money(data.financial.cancelledBookingCollections)} collected on cancelled bookings in this period. Review refunds in your payment provider console.</span>
                </div>
              )}

              {/* ── Tier 3: Revenue Analytics & Economics (65% / 35% Grid) ── */}
              <div className="admin-charts-grid admin-charts-grid--hero">
                <article className="admin-chart-card">
                  <div className="admin-chart-header">
                    <div>
                      <h3 className="admin-chart-title">Revenue & GMV Volume</h3>
                      <p className="admin-chart-subtitle">Monthly service gross volume vs platform commission revenue</p>
                    </div>
                    <div className="admin-chart-legend">
                      <span className="admin-legend-dot admin-legend-dot--gmv" />
                      <span>Gross GMV</span>
                      <span className="admin-legend-dot admin-legend-dot--commission" />
                      <span>Commission</span>
                    </div>
                  </div>

                  {data.trends.length ? (
                    <div className="admin-trend-chart">
                      <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data.trends} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="admin-gmv-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#b85f77" stopOpacity={0.18} />
                              <stop offset="100%" stopColor="#b85f77" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="admin-commission-fill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0f172a" stopOpacity={0.12} />
                              <stop offset="100%" stopColor="#0f172a" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
                          <YAxis tickFormatter={v => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip
                            formatter={(v: any) => [money(Number(v)), '']}
                            contentStyle={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', fontSize: '0.85rem' }}
                          />
                          <Area name="Service GMV" dataKey="gmv" stroke="#b85f77" fill="url(#admin-gmv-fill)" strokeWidth={2.4} />
                          <Area name="Commission" dataKey="commission" stroke="#0f172a" fill="url(#admin-commission-fill)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="admin-empty">Revenue trends will appear after the first completed payment.</div>
                  )}
                </article>

                <article className="admin-chart-card">
                  <div className="admin-chart-header">
                    <div>
                      <h3 className="admin-chart-title">Booking & Category Economics</h3>
                      <p className="admin-chart-subtitle">Order volume breakdown by beauty service type</p>
                    </div>
                  </div>

                  <div className="admin-mini-metrics">
                    <div className="admin-mini-metric-box">
                      <strong>{data.bookingSummary.total}</strong>
                      <span>Total Requests</span>
                    </div>
                    <div className="admin-mini-metric-box admin-mini-metric-box--success">
                      <strong>{data.bookingSummary.completed}</strong>
                      <span>Completed</span>
                    </div>
                    <div className="admin-mini-metric-box admin-mini-metric-box--muted">
                      <strong>{data.bookingSummary.cancelled}</strong>
                      <span>Cancelled</span>
                    </div>
                  </div>

                  <h4 className="admin-subtitle">Average Ticket Value by Category</h4>
                  <div className="admin-aov-list">
                    {data.financial.aovByType.map(a => (
                      <div className="admin-summary-row" key={a.type}>
                        <div className="admin-summary-row__left">
                          <span className="admin-summary-row__name">{typeLabels[a.type] || a.type}</span>
                          <span className="admin-summary-row__count">{a.paidBookings} paid bookings</span>
                        </div>
                        <b className="admin-summary-row__value">{money(a.value)}</b>
                      </div>
                    ))}
                  </div>

                  <div className="admin-payout-chips">
                    {['pending', 'initiated', 'failed', 'completed'].map(status => (
                      <span key={status} className={`admin-payout-chip admin-payout-chip--${status}`}>
                        {status}: <b>{data.payouts[status]?.count || 0}</b>
                      </span>
                    ))}
                  </div>
                </article>
              </div>

              {/* ── Tier 4: Marketplace Dynamics (50% / 50% Grid) ── */}
              <div className="admin-charts-grid admin-charts-grid--dual">
                <article className="admin-chart-card">
                  <div className="admin-chart-header">
                    <div>
                      <h3 className="admin-chart-title">
                        <MapPin size={18} className="admin-title-icon" />
                        <span>Where Demand Meets Talent</span>
                      </h3>
                      <p className="admin-chart-subtitle">Bookings grouped by city. Active supply is verified and available.</p>
                    </div>
                  </div>

                  {data.cities.length ? (
                    <div className="admin-city-list">
                      {data.cities.map(c => (
                        <button type="button" className="admin-city-row" key={c.city} onClick={() => onCity(c.city)}>
                          <div className="admin-city-row__info">
                            <strong>{c.city}</strong>
                            <small>{c.bookings} bookings · {c.activeArtists} active artists · {money(c.gmv)}</small>
                          </div>
                          <div className="admin-city-bar">
                            <span style={{ width: `${Math.max(4, (c.bookings / Math.max(1, ...data.cities.map(city => city.bookings))) * 100)}%` }} />
                          </div>
                          <span className={c.underserved ? 'admin-demand-flag' : 'admin-demand-badge'}>
                            {c.underserved ? 'Needs Supply' : `${c.demandPerArtist ?? '—'} / artist`}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">Cities will populate as artists join and bookings arrive.</div>
                  )}
                </article>

                <article className="admin-chart-card">
                  <div className="admin-chart-header">
                    <div>
                      <h3 className="admin-chart-title">
                        <Star size={18} className="admin-title-icon" />
                        <span>Artist Excellence Leaderboard</span>
                      </h3>
                      <p className="admin-chart-subtitle">Top performing beauty artists across India</p>
                    </div>
                    <div className="admin-ranking-toggle">
                      <button
                        type="button"
                        className={`admin-toggle-pill ${ranking === 'revenue' ? 'is-active' : ''}`}
                        onClick={() => setRanking('revenue')}
                      >
                        By Revenue
                      </button>
                      <button
                        type="button"
                        className={`admin-toggle-pill ${ranking === 'rating' ? 'is-active' : ''}`}
                        onClick={() => setRanking('rating')}
                      >
                        By Rating
                      </button>
                    </div>
                  </div>

                  {(ranking === 'revenue' ? data.leaderboard : data.topRated).length ? (
                    <div className="admin-ranking-list">
                      {(ranking === 'revenue' ? data.leaderboard : data.topRated).slice(0, 6).map((a, i) => (
                        <button key={a.id} type="button" className="admin-ranking-row" onClick={() => onArtist(a.id)}>
                          <span className={`admin-ranking-number ${i < 3 ? 'admin-ranking-number--top' : ''}`}>
                            #{i + 1}
                          </span>
                          <div className="admin-ranking-info">
                            <span className="admin-ranking-name">{a.name}</span>
                            <span className="admin-ranking-meta">
                              {a.city} · <Star size={11} className="admin-star-icon" fill="#f59e0b" stroke="#f59e0b" /> {a.rating.toFixed(1)} ({a.reviewCount} reviews)
                            </span>
                          </div>
                          <b className="admin-ranking-value">
                            {ranking === 'revenue' ? money(a.gmv) : `${a.rating.toFixed(1)} ★`}
                          </b>
                          <ArrowUpRight size={15} className="admin-ranking-arrow" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">{ranking === 'revenue' ? 'Artist rankings appear after paid bookings.' : 'Ratings appear after the first reviews.'}</div>
                  )}
                </article>
              </div>

              {/* ── Tier 5: Trust, Safety & SLA (Verification Card) ── */}
              <article className="admin-chart-card admin-verification">
                <div className="admin-verification__head">
                  <div className="admin-verification__icon-circle">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="admin-eyebrow">QUALITY & TRUST ASSURANCE</span>
                    <h3>Artist Verification & 48h SLA Target</h3>
                    <p className="admin-muted">Maintaining swift 48-hour onboarding to keep top talent active and taking bookings.</p>
                  </div>
                </div>

                <div className="admin-mini-metrics admin-verification__metrics">
                  <div className="admin-mini-metric-box">
                    <strong>{data.verification.pending}</strong>
                    <span>Awaiting Review</span>
                  </div>
                  <div className="admin-mini-metric-box admin-mini-metric-box--alert">
                    <strong>{data.verification.overdue}</strong>
                    <span>Over 48 Hours</span>
                  </div>
                  <div className="admin-mini-metric-box">
                    <strong>{data.verification.averageHours === null ? '—' : `${data.verification.averageHours}h`}</strong>
                    <span>Avg. Turnaround</span>
                  </div>
                  <div className="admin-mini-metric-box">
                    <strong>{data.verification.submitted}</strong>
                    <span>New Applications</span>
                  </div>
                  <div className="admin-mini-metric-box admin-mini-metric-box--success">
                    <strong>{data.verification.approved} / {data.verification.rejected}</strong>
                    <span>Approved / Rejected</span>
                  </div>
                </div>
              </article>
            </>
          )}

          {/* ── Operations Activity Feed (Clean White Card) ── */}
          <article className="admin-chart-card admin-activity">
            <div className="admin-chart-header">
              <div>
                <h3 className="admin-chart-title">
                  <Activity size={18} className="admin-title-icon" />
                  <span>Live Operations</span>
                </h3>
                <p className="admin-chart-subtitle">Real-time operational activity and audit history across the platform</p>
              </div>
              <div className="admin-feed-filter-wrap">
                <select
                  value={feedFilter}
                  onChange={e => setFeedFilter(e.target.value)}
                  aria-label="Activity type"
                  className="admin-select"
                >
                  <option value="all">All activity</option>
                  <option value="booking">Bookings</option>
                  <option value="verification">Verifications</option>
                  <option value="payout">Payouts</option>
                  <option value="review">Reviews</option>
                  <option value="admin">Admin actions</option>
                </select>
              </div>
            </div>

            <div className="admin-feed">
              {feed.length ? (
                feed.slice(0, activityOnly ? 40 : 8).map(event => (
                  <div className={`admin-feed__item admin-feed__item--${event.type}`} key={event.id}>
                    <span className="admin-feed__dot">
                      {event.type === 'review' ? <Star size={13} fill="#f59e0b" stroke="#f59e0b" /> :
                       event.type === 'verification' ? <ShieldCheck size={13} /> :
                       event.type === 'payout' ? <Wallet size={13} /> :
                       <Activity size={13} />}
                    </span>
                    <div className="admin-feed__content">
                      <div className="admin-feed__title-row">
                        <strong>{event.title}</strong>
                        <time dateTime={event.at}>
                          {new Date(event.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                      <p>{event.detail}</p>
                      {event.artistId && (
                        <button type="button" className="admin-text-button" onClick={() => onArtist(event.artistId!)}>
                          Manage artist <ArrowUpRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-empty">No activity records found for this period and filter.</div>
              )}
            </div>

            {activityOnly && (
              <p className="admin-muted admin-feed-footer-note">
                Showing the latest 40 operational events. Audit records preserve complete accountability while safeguarding sensitive client information.
              </p>
            )}
          </article>
        </>
      )}
    </section>
  );
}
