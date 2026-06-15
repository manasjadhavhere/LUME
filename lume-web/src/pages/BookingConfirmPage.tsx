import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../data/types';
import ConfirmationRing from '../components/booking/ConfirmationRing';
import BookingSummary from '../components/booking/BookingSummary';
import Button from '../components/ui/Button';
import './BookingConfirmPage.css';

const BookingConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    // Load booking data from sessionStorage
    const bookingDataStr = sessionStorage.getItem('currentBooking');
    if (!bookingDataStr) {
      // No booking data found, redirect to home
      navigate('/home');
      return;
    }

    try {
      const bookingData = JSON.parse(bookingDataStr);
      const bookingObj: Booking = {
        id: `booking_${Date.now()}`, // Generate unique ID
        artistId: bookingData.artistId,
        artistName: bookingData.artistName,
        service: bookingData.service,
        date: new Date(bookingData.date),
        time: bookingData.time,
        location: bookingData.location,
        totalPaid: bookingData.totalPaid,
        status: 'confirmed'
      };
      setBooking(bookingObj);
    } catch (error) {
      console.error('Error parsing booking data:', error);
      navigate('/home');
    }
  }, [navigate]);

  const handleBackToHome = () => {
    // Clear booking data and reset state
    sessionStorage.removeItem('currentBooking');
    // Navigate to home
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
          <h1 className="booking-confirm-heading">All Set!</h1>
          <p className="booking-confirm-subheading">Your appointment has been confirmed</p>
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
