import { Calendar, MapPin, CreditCard, User, Clock, CheckCircle } from 'lucide-react';
import './BookingSummary.css';

interface BookingData {
  id: string;
  artistName: string;
  artistAvatar: string;
  priceType: string;
  date: string;
  time: string;
  endTime?: string;
  totalPaid: number;
  status: string;
  address: string;
  notes?: string;
}

interface BookingSummaryProps {
  booking: BookingData;
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateStr + 'T00:00:00'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'WEDDING': return '💍 Wedding';
      case 'OCCASION': return '🎉 Occasion';
      case 'HOURLY': return '⏱ Hourly';
      default: return type;
    }
  };

  return (
    <div className="booking-summary glass-panel">
      <h3 className="booking-summary-title">Booking Details</h3>
      
      <div className="booking-details">
        <div className="booking-row">
          <div className="booking-icon">
            <User size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Artist</span>
            <span className="booking-value">{booking.artistName}</span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <CheckCircle size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Service</span>
            <span className="booking-value">{getPriceTypeLabel(booking.priceType)}</span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <Calendar size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Date</span>
            <span className="booking-value">{formatDate(booking.date)}</span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <Clock size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Time</span>
            <span className="booking-value">
              {booking.time} {booking.endTime ? `– ${booking.endTime}` : ''}
            </span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <MapPin size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Location</span>
            <span className="booking-value">{booking.address || 'Not provided'}</span>
          </div>
        </div>

        <div className="booking-row booking-total">
          <div className="booking-icon">
            <CreditCard size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Estimated Total</span>
            <span className="booking-value booking-amount">{formatCurrency(booking.totalPaid)}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: '2px', display: 'block' }}>Payment after service</span>
          </div>
        </div>
      </div>
    </div>
  );
}