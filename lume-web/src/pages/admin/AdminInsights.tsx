import { useEffect, useState } from 'react';
import { ArrowUpRight, RefreshCw, IndianRupee, Wallet, MapPin, Clock, Activity, Star } from 'lucide-react';
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
const typeLabels: Record<string, string> = { WEDDING: 'Bridal', OCCASION: 'Occasion / party', HOURLY: 'Hourly / editorial' };

export default function AdminInsights({ onArtist, onCity, activityOnly = false, revision = 0 }: { onArtist: (id: string) => void; onCity: (city: string) => void; activityOnly?: boolean; revision?: number }) {
  const { token } = useAuth();
  const [period, setPeriod] = useState('30');
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all');
  const [ranking, setRanking] = useState('revenue');
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    setData(null);
    const load = async () => {
      if (inFlight || document.hidden) return;
      inFlight = true; setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/admin/insights/analytics?days=${period}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Could not load insights.');
        if (!controller.signal.aborted) { setData(body.data); setError(''); }
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load insights.'); }
      finally { inFlight = false; if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    const interval = setInterval(load, 60000);
    document.addEventListener('visibilitychange', load);
    return () => { controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', load); };
  }, [token, period, refresh, revision]);
  const feed = data?.activity.filter(a => feedFilter === 'all' || a.type === feedFilter) || [];
  return <section className="admin-insights" aria-label={activityOnly ? 'Operations activity' : 'Business insights'}>
    <div className="admin-insights__heading">
      <div><span className="admin-eyebrow">THE LUME PERSPECTIVE</span><h2>{activityOnly ? 'Behind every booking.' : 'Your business, in focus.'}</h2><p>{data ? `Updated ${new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · Refreshes every minute` : 'A clear view of your marketplace.'}</p></div>
      <div className="admin-toolbar">
        <select aria-label="Insights period" value={period} onChange={e => setPeriod(e.target.value)}><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option><option value="all">All time</option></select>
        <button className="admin-button" onClick={() => setRefresh(v => v + 1)} disabled={loading} aria-label="Refresh insights"><RefreshCw size={16} /></button>
      </div>
    </div>
    {error && <div className="admin-feedback admin-feedback--error" role="alert">{error} <button onClick={() => setRefresh(v => v + 1)}>Try again</button></div>}
    {!data && loading && <div className="admin-empty" role="status">Loading business insights…</div>}
    {data && <>
      {!activityOnly && <>
        <div className="admin-finance-grid">
          {[
            { label: 'Service GMV', value: money(data.financial.gmv), note: 'Collected service value · excludes GST', icon: <IndianRupee size={20} /> },
            { label: 'Platform commission', value: money(data.financial.netRevenue), note: 'Net of GST · before costs & refunds', icon: <Wallet size={20} /> },
            { label: 'Avg. collected order', value: money(data.financial.aov), note: `${data.financial.paidBookings} distinct paid bookings`, icon: <ArrowUpRight size={20} /> },
            { label: 'Outstanding artist payouts', value: money((data.payouts.pending?.amount || 0) + (data.payouts.initiated?.amount || 0) + (data.payouts.failed?.amount || 0)), note: 'Current balance · all time', icon: <Clock size={20} /> },
          ].map(card => <article className="admin-finance-card" key={card.label}><div className="admin-finance-card__top"><span>{card.label}</span>{card.icon}</div><strong>{card.value}</strong><small>{card.note}</small></article>)}
        </div>
        <div className="admin-metric-strip"><span>Customer collections <b>{money(data.financial.collections)}</b></span><span>GST collected <b>{money(data.financial.gst)}</b></span><span>Paid to artists, all time <b>{money(data.payouts.completed?.amount || 0)}</b></span><span>Failed transfers <b>{data.failedTransfers}</b></span></div>
        {data.financial.cancelledBookingCollections > 0 && <div className="admin-feedback">{money(data.financial.cancelledBookingCollections)} collected on cancelled bookings in this period. Review refunds in your payment provider; refund deductions are not recorded in this dashboard.</div>}
        <div className="admin-charts-grid">
          <article className="admin-chart-card"><div className="admin-chart-header"><h3 className="admin-chart-title">Revenue over time</h3><span className="admin-muted">GMV & commission</span></div>
            {data.trends.length ? <div className="admin-trend-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trends} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
              <defs><linearGradient id="admin-rose-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D97A8C" stopOpacity={.3} /><stop offset="100%" stopColor="#D97A8C" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#efdee3" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip formatter={v => money(Number(v))} />
              <Area name="Service GMV" dataKey="gmv" stroke="#b5687b" fill="url(#admin-rose-fill)" strokeWidth={2} /><Area name="Commission" dataKey="commission" stroke="#9b774c" fill="transparent" strokeWidth={2} />
            </AreaChart></ResponsiveContainer></div> : <div className="admin-empty">Revenue trends will appear after the first payment.</div>}
          </article>
          <article className="admin-chart-card"><div className="admin-chart-header"><h3 className="admin-chart-title">Booking & payout health</h3></div>
            <div className="admin-mini-metrics"><div><strong>{data.bookingSummary.total}</strong><span>Booking requests</span></div><div><strong>{data.bookingSummary.completed}</strong><span>Completed</span></div><div><strong>{data.bookingSummary.cancelled}</strong><span>Cancelled</span></div></div>
            <h4 className="admin-subtitle">Average collected service value</h4>{data.financial.aovByType.map(a => <div className="admin-summary-row" key={a.type}><span>{typeLabels[a.type]} <small>({a.paidBookings})</small></span><b>{money(a.value)}</b></div>)}
            <p className="admin-muted">Advance and balance payments belong to one booking. Averages reflect money collected in the selected period.</p>
            <div className="admin-payout-chips">{['pending', 'initiated', 'failed', 'completed'].map(status => <span key={status}>{status}: <b>{data.payouts[status]?.count || 0}</b></span>)}</div>
          </article>
        </div>
        <div className="admin-charts-grid">
          <article className="admin-chart-card"><div className="admin-chart-header"><h3 className="admin-chart-title"><MapPin size={18} /> Where demand meets talent</h3></div><p className="admin-muted">Bookings grouped by the artist’s base city. Active supply is verified, available and taking bookings today.</p>
            {data.cities.length ? <div className="admin-city-list">{data.cities.map(c => <button className="admin-city-row" key={c.city} onClick={() => onCity(c.city)}><div><strong>{c.city}</strong><small>{c.bookings} bookings · {c.activeArtists} active artists · {money(c.gmv)}</small></div><div className="admin-city-bar"><span style={{ width: `${Math.max(2, c.bookings / Math.max(1, ...data.cities.map(city => city.bookings)) * 100)}%` }} /></div><span className={c.underserved ? 'admin-demand-flag' : 'admin-muted'}>{c.underserved ? 'Review supply' : `${c.demandPerArtist ?? '—'} / artist`}</span></button>)}</div> : <div className="admin-empty">Cities appear as artists join and bookings arrive.</div>}
          </article>
          <article className="admin-chart-card"><div className="admin-chart-header"><h3 className="admin-chart-title">Artist excellence</h3><select aria-label="Artist ranking" value={ranking} onChange={e => setRanking(e.target.value)}><option value="revenue">By revenue</option><option value="rating">By rating</option></select></div>
            {(ranking === 'revenue' ? data.leaderboard : data.topRated).length ? (ranking === 'revenue' ? data.leaderboard : data.topRated).map((a, i) => <button key={a.id} className="admin-ranking-row" onClick={() => onArtist(a.id)}><span className="admin-ranking-number">{String(i + 1).padStart(2, '0')}</span><span><strong>{a.name}</strong><small>{a.city} · {a.rating.toFixed(1)} ★ ({a.reviewCount})</small></span><b>{ranking === 'revenue' ? money(a.gmv) : `${a.rating.toFixed(1)} ★`}</b><ArrowUpRight size={16} /></button>) : <div className="admin-empty">{ranking === 'revenue' ? 'Artist rankings appear after paid bookings.' : 'Ratings appear after the first reviews.'}</div>}
          </article>
        </div>
        <article className="admin-chart-card admin-verification"><div><span className="admin-eyebrow">KEEP GREAT TALENT MOVING</span><h3>Verification, without the wait.</h3><p className="admin-muted">48-hour review target. Review timing starts being recorded with this release.</p></div><div className="admin-mini-metrics"><div><strong>{data.verification.pending}</strong><span>Awaiting review</span></div><div><strong>{data.verification.overdue}</strong><span>Over 48 hours</span></div><div><strong>{data.verification.averageHours === null ? '—' : `${data.verification.averageHours}h`}</strong><span>Average turnaround</span></div><div><strong>{data.verification.submitted}</strong><span>Latest submissions</span></div><div><strong>{data.verification.approved} / {data.verification.rejected}</strong><span>Approved / rejected</span></div></div></article>
      </>}
      <article className="admin-chart-card admin-activity"><div className="admin-chart-header"><h3 className="admin-chart-title"><Activity size={18} /> Live operations</h3><select value={feedFilter} onChange={e => setFeedFilter(e.target.value)} aria-label="Activity type"><option value="all">All activity</option><option value="booking">Bookings</option><option value="verification">Verifications</option><option value="payout">Payouts</option><option value="review">Reviews</option><option value="admin">Admin actions</option></select></div>
        <div className="admin-feed">{feed.length ? feed.slice(0, activityOnly ? 40 : 8).map(event => <div className={`admin-feed__item admin-feed__item--${event.type}`} key={event.id}><span className="admin-feed__dot">{event.type === 'review' ? <Star size={12} /> : <Activity size={12} />}</span><div><strong>{event.title}</strong><p>{event.detail}</p>{event.artistId && <button className="admin-text-button" onClick={() => onArtist(event.artistId!)}>Manage artist <ArrowUpRight size={12} /></button>}</div><time dateTime={event.at}>{new Date(event.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div>) : <div className="admin-empty">No activity for this period and filter.</div>}</div>
        {activityOnly && <p className="admin-muted">Shows the latest 40 operational events. Admin action history starts with this release and excludes sensitive request contents.</p>}
      </article>
    </>}
  </section>;
}
