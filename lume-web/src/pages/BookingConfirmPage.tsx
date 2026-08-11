import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmationRing from '../components/booking/ConfirmationRing';
import BookingSummary from '../components/booking/BookingSummary';
import Button from '../components/ui/Button';
import './BookingConfirmPage.css';

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

const BookingConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    // Load booking data from sessionStorage
    const bookingDataStr = sessionStorage.getItem('currentBooking');
    if (!bookingDataStr) {
      navigate('/home');
      return;
    }

    try {
      const bookingData = JSON.parse(bookingDataStr);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error parsing booking data:', error);
      navigate('/home');
    }
  }, [navigate]);

  const handleBackToHome = () => {
    sessionStorage.removeItem('currentBooking');
    navigate('/home');
  };

  if (!booking) {
    return (
      <div className="booking-confirm-page booking-confirm-page--loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="booking-confirm-page">
      {/* Background with gradient matching splash screen */}
      <div className="booking-confirm-background">
        <div className="floating-orb floating-orb--1" />
        <div className="floating-orb floating-orb--2" />
        <div className="floating-orb floating-orb--3" />
      </div>

      {/* Main content */}
      <div className="booking-confirm-content">
        {/* Confirmation ring animation */}
        <div className="booking-confirm-ring-container">
          <ConfirmationRing />
        </div>

        {/* Header */}
        <div className="booking-confirm-header">
          <h1 className="booking-confirm-heading">
            {booking.status === 'PENDING' ? 'Booking Sent!' : 'All Set!'}
          </h1>
          <p className="booking-confirm-subheading" style={{ color: booking.status === 'PENDING' ? 'var(--gold)' : 'inherit', fontWeight: 600 }}>
            {booking.status === 'PENDING' 
              ? 'Your booking request is pending artist approval.' 
              : 'Your appointment has been confirmed.'}
          </p>
        </div>

        {/* Booking summary */}
        <div className="booking-confirm-summary-container">
          <BookingSummary booking={booking} />
        </div>

        {/* Back to home button */}
        <div className="booking-confirm-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleBackToHome}
            ariaLabel="Return to home screen"
            className="booking-confirm-button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmPage;
