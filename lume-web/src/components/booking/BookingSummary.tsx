import { Calendar, MapPin, CreditCard, User } from 'lucide-react';
import { Booking } from '../../data/types';
import CategoryIcon from '../ui/CategoryIcon';
import './BookingSummary.css';

interface BookingSummaryProps {
  booking: Booking;
}

export default function BookingSummary({ booking }: BookingSummaryProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="booking-summary glass-panel">
      <h3 className="booking-summary-title">Booking Confirmed</h3>
      
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
            <CategoryIcon name={booking.service} size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Service</span>
            <span className="booking-value">{booking.service}</span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <Calendar size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Date & Time</span>
            <span className="booking-value">{formatDate(booking.date)}</span>
            <span className="booking-time">{booking.time}</span>
          </div>
        </div>

        <div className="booking-row">
          <div className="booking-icon">
            <MapPin size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Location</span>
            <span className="booking-value">{booking.location}</span>
          </div>
        </div>

        <div className="booking-row booking-total">
          <div className="booking-icon">
            <CreditCard size={20} />
          </div>
          <div className="booking-info">
            <span className="booking-label">Total Paid</span>
            <span className="booking-value booking-amount">{formatCurrency(booking.totalPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}