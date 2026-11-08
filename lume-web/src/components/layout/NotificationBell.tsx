import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { API_BASE, useAuth } from '../../context/AuthContext';
import './NotificationBell.css';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const NotificationBell: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const requestId = useRef(0);
  const [error, setError] = useState('');
  const fetchNotifications = useCallback(async () => {
    const authToken = token || localStorage.getItem('lume_token');
    if (!isAuthenticated || !authToken) return;
    const id = ++requestId.current;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Could not load notifications.');
      const body = await res.json().catch(() => ({}));
      if (requestId.current === id && Array.isArray(body.data)) {
        setError('');
        setNotifications(body.data);
      }
    } catch {
      if (requestId.current === id) setError('Could not load updates. Try again.');
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    setOpen(false); setNotifications([]);
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    void fetchNotifications();
    const timer = window.setInterval(() => {
      void fetchNotifications();
    }, 30000);
    const onFocus = () => void fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      requestId.current++;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, fetchNotifications, location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!isAuthenticated || !user) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (item?: NotificationItem) => {
    if (!token) return;
    try {
      const path = item ? item.id + '/read' : 'read-all';
      const res = await fetch(`${API_BASE}/api/notifications/${path}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setNotifications(prev => prev.map(n => (!item || n.id === item.id) ? { ...n, isRead: true } : n));
      setError('');
    } catch { setError('Could not mark as read. Try again.'); }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) await markRead(item);
    if (item.link && /^\/(?!\/)/.test(item.link)) {
      setOpen(false); navigate(item.link);
    }
  };

  const getIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('PAYMENT')) return <CreditCard size={15} />;
    if (t.includes('REVIEW')) return <Star size={15} />;
    if (t.includes('ACCEPTED') || t.includes('CONFIRMED') || t.includes('COMPLETED'))
      return <CheckCircle2 size={15} />;
    if (t.includes('CANCEL') || t.includes('DECLINE') || t.includes('REJECT'))
      return <AlertCircle size={15} />;
    if (t.includes('WEBSITE') || t.includes('UPDATE')) return <Sparkles size={15} />;
    return <Calendar size={15} />;
  };

  return (
    <div className={`lume-notif ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`lume-notif__trigger ${open ? 'is-open' : ''}`}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void fetchNotifications();
        }}
      >
        <Bell size={19} strokeWidth={2.1} />
        {unreadCount > 0 && (
          <span className="lume-notif__badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="lume-notif__dropdown"
          role="dialog"
          aria-label="Notifications"
          data-lenis-prevent
        >
          <div className="lume-notif__header">
            <div>
              <h3>Notifications</h3>
              <span>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="lume-notif__mark-all"
                onClick={() => void markRead()}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="lume-notif__list">
            {error && <p role="alert">{error}</p>}
            {notifications.length === 0 ? (
              <div className="lume-notif__empty">
                <Bell size={24} />
                <p>{loading ? 'Checking for updates…' : 'No notifications yet'}</p>
                <span>Booking requests, approvals, payments &amp; website updates will appear here.</span>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`lume-notif__item ${item.isRead ? '' : 'is-unread'}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className={`lume-notif__icon lume-notif__icon--${(item.type || 'info').toLowerCase()}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="lume-notif__body">
                    <div className="lume-notif__title-row">
                      <strong>{item.title}</strong>
                      {!item.isRead && <span className="lume-notif__dot" />}
                    </div>
                    <p>{item.message}</p>
                    <span className="lume-notif__time">{formatRelativeTime(item.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

