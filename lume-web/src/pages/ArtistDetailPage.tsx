import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Lock, Shield, Headphones, Sparkles, Clock, ThumbsUp } from 'lucide-react';
import { getArtistById } from '../data/demoData';
import useFavorites from '../hooks/useFavorites';
import ArtistHero from '../components/detail/ArtistHero';
import ServiceSelector from '../components/detail/ServiceSelector';
import DatePicker from '../components/detail/DatePicker';
import TimeSlotGrid from '../components/detail/TimeSlotGrid';
import ReviewCard from '../components/detail/ReviewCard';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import './ArtistDetailPage.css';

interface DateChip {
  date: Date;
  dayName: string;
  dayNumber: number;
}

type SortOption = 'date' | 'rating';

const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const artist = useMemo(() => getArtistById(id || ''), [id]);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [reviewSortBy, setReviewSortBy] = useState<SortOption>('date');

  const { isFavorite, toggleFavorite } = useFavorites();
  const isArtistFavorite = artist ? isFavorite(artist.id) : false;

  const dateChips: DateChip[] = useMemo(() => {
    if (!artist) return [];
    return artist.availability.dates.map(({ date }) => {
      const dateObj = new Date(date);
      return {
        date: dateObj,
        dayName: dateObj.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        dayNumber: dateObj.getDate()
      };
    });
  }, [artist]);

  const currentTimeSlots = useMemo(() => {
    if (!artist) return [];
    if (!selectedDate) return artist.availability.dates[0]?.slots || [];
    const dateString = selectedDate.toISOString().split('T')[0];
    const availability = artist.availability.dates.find((a) => {
      return new Date(a.date).toISOString().split('T')[0] === dateString;
    });
    return availability?.slots || [];
  }, [selectedDate, artist]);

  const selectedService = useMemo(
    () => artist?.services.find((s) => s.id === selectedServiceId),
    [selectedServiceId, artist]
  );

  const totalPrice = selectedService?.price || artist?.startingPrice || 0;

  const sortedReviews = useMemo(() => {
    if (!artist) return [];
    const copy = [...artist.reviews];
    return reviewSortBy === 'date'
      ? copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      : copy.sort((a, b) => b.rating - a.rating);
  }, [artist, reviewSortBy]);

  if (!artist) {
    return (
      <div className="artist-detail-page artist-detail-page--error">
        <p>Artist not found</p>
        <Button onClick={() => navigate('/home')}>Back to Home</Button>
      </div>
    );
  }

  const isBookingComplete =
    selectedServiceId !== null && selectedDate !== null && selectedTimeSlot !== null;

  const handleFavoriteToggle = () => toggleFavorite(artist.id);

  const handleBookingConfirm = () => {
    if (!isBookingComplete || !selectedService) return;
    sessionStorage.setItem(
      'currentBooking',
      JSON.stringify({
        artistId: artist.id,
        artistName: artist.name,
        service: selectedService.name,
        date: selectedDate?.toISOString(),
        time: selectedTimeSlot,
        location: artist.location,
        totalPaid: totalPrice
      })
    );
    navigate('/booking/confirm');
  };

  return (
    <div className="artist-detail-page">
      <ArtistHero
        artist={artist}
        isFavorite={isArtistFavorite}
        onBack={() => navigate(-1)}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Main Content Wrapper */}
      <div className="artist-detail-page__content">
        <div className="artist-detail-page__body">

          {/* Left / Main Column */}
          <div className="artist-detail-page__main-col">
            
            <section className="artist-detail-page__section">
              <SectionHeader title="Choose Your Service" step={1} />
              <ServiceSelector
                services={artist.services}
                selectedService={selectedServiceId}
                onServiceSelect={setSelectedServiceId}
              />
            </section>

            <section className="artist-detail-page__section">
              <SectionHeader title="Select Date" step={2} />
              <DatePicker
                dates={dateChips}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </section>

            <section className="artist-detail-page__section">
              <SectionHeader title="Select Time" step={3} />
              <TimeSlotGrid
                slots={currentTimeSlots}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={setSelectedTimeSlot}
              />
            </section>

            {/* Need Help Banner */}
            <div className="artist-detail-page__help-banner">
              <div className="artist-detail-page__help-info">
                <div className="artist-detail-page__help-icon">
                  <MessageCircle size={24} />
                </div>
                <div className="artist-detail-page__help-text">
                  <h3>Need Help Choosing?</h3>
                  <p>Chat with our team and we'll help you pick the perfect service.</p>
                </div>
              </div>
              <Button variant="primary" style={{ backgroundColor: '#a7828d', borderColor: '#a7828d' }}>
                Chat Now
              </Button>
            </div>

            <section className="artist-detail-page__section artist-detail-page__section--reviews">
              <div className="artist-detail-page__reviews-header">
                <SectionHeader title="Client Reviews" seeAllText="View All Reviews" onSeeAll={() => {}} />
              </div>
              <div className="artist-detail-page__reviews" style={{flexDirection: 'row', overflowX: 'auto', paddingBottom: '16px'}}>
                {sortedReviews.slice(0, 3).map((review) => (
                  <div key={review.id} style={{minWidth: '300px'}}>
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </section>

            {/* Footer Guarantees */}
            <div className="artist-detail-page__guarantees">
              <div className="artist-detail-page__guarantee">
                <Shield size={16} color="var(--rose-deep)" /> 100% Genuine Products
              </div>
              <div className="artist-detail-page__guarantee">
                <Clock size={16} color="var(--rose-deep)" /> Easy Reschedule
              </div>
              <div className="artist-detail-page__guarantee">
                <Lock size={16} color="var(--rose-deep)" /> Secure Payments
              </div>
              <div className="artist-detail-page__guarantee">
                <Sparkles size={16} color="var(--rose-deep)" /> Hygienic & Safe
              </div>
            </div>

          </div>

          {/* Right / Sidebar */}
          <aside className="artist-detail-page__sidebar">
            
            {/* Booking Summary Card */}
            <div className="artist-detail-page__sidebar-booking">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontFamily: 'var(--font-display)', margin: 0 }}>
                <span style={{ color: 'var(--rose-deep)'}}>📋</span> Booking Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
                <div className="artist-detail-page__booking-row">
                  <span className="artist-detail-page__booking-label">Service</span>
                  <span className="artist-detail-page__booking-val">{selectedService ? selectedService.name : '—'}</span>
                </div>
                <div className="artist-detail-page__booking-row">
                  <span className="artist-detail-page__booking-label">Date</span>
                  <span className="artist-detail-page__booking-val">
                    {selectedDate ? selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="artist-detail-page__booking-row">
                  <span className="artist-detail-page__booking-label">Time</span>
                  <span className="artist-detail-page__booking-val">{selectedTimeSlot || '—'}</span>
                </div>
                <div className="artist-detail-page__booking-row">
                  <span className="artist-detail-page__booking-label">Duration</span>
                  <span className="artist-detail-page__booking-val">2.5 Hours</span>
                </div>
                <div className="artist-detail-page__booking-row" style={{ marginTop: '16px' }}>
                  <span className="artist-detail-page__booking-label">Subtotal</span>
                  <span className="artist-detail-page__booking-val">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="artist-detail-page__booking-row">
                  <span className="artist-detail-page__booking-label">Travel (Within {artist.location})</span>
                  <span className="artist-detail-page__booking-val">FREE</span>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid rgba(0,0,0,0.05)',
                paddingTop: '16px',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600
                }}>Total</span>
                <span style={{
                  fontSize: '1.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--dark)'
                }}>₹{totalPrice.toLocaleString()}</span>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px', gap: '8px'}}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBookingConfirm}
                  disabled={!isBookingComplete}
                  style={{ width: '100%', backgroundColor: '#a7828d', borderColor: '#a7828d' }}
                >
                  <Lock size={16} style={{marginRight: '8px'}}/> Confirm Booking
                </Button>
                <span style={{fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Shield size={12} /> You won't be charged yet
                </span>
              </div>
            </div>

            {/* Why Book with Us */}
            <div className="artist-detail-page__sidebar-why">
              <h3><Sparkles size={20} color="var(--rose-deep)"/> Why Book With Us?</h3>
              
              <div className="why-item">
                <div className="why-icon"><ThumbsUp size={16} /></div>
                <div className="why-text">
                  <h4>Verified & Experienced Artist</h4>
                  <p>Trusted by thousands of clients.</p>
                </div>
              </div>
              
              <div className="why-item">
                <div className="why-icon"><Shield size={16} /></div>
                <div className="why-text">
                  <h4>Secure & Easy Booking</h4>
                  <p>Your information is safe with us.</p>
                </div>
              </div>
              
              <div className="why-item">
                <div className="why-icon"><Headphones size={16} /></div>
                <div className="why-text">
                  <h4>24/7 Support</h4>
                  <p>We're here to help anytime.</p>
                </div>
              </div>
              
              <div className="why-item">
                <div className="why-icon"><CheckCircle size={16} /></div>
                <div className="why-text">
                  <h4>Hassle-Free Experience</h4>
                  <p>From booking to your big day.</p>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>

      <div className="artist-detail-page__booking" aria-label="Booking summary">
        <div className="artist-detail-page__price-info">
          <span className="artist-detail-page__price-label">Total Price</span>
          <span className="artist-detail-page__price">₹{totalPrice.toLocaleString()}</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleBookingConfirm}
          disabled={!isBookingComplete}
          className="artist-detail-page__button"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  );
};

export default ArtistDetailPage;
