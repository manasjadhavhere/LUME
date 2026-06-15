import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Heart, Calendar, Star, Award, Shield, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Discover Top Artists',
      description: 'Browse curated profiles of award-winning beauty artists with verified portfolios and specialized expertise.'
    },
    {
      icon: Calendar,
      title: 'Instant Booking',
      description: 'Real-time availability, instant confirmation, and flexible scheduling for your ultimate convenience.'
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Save favorites, track booking history, and receive tailored recommendations based on your preferences.'
    },
    {
      icon: Shield,
      title: 'Verified & Trusted',
      description: 'Every artist is thoroughly vetted with authentic reviews, ratings, and background verification.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Expert Artists' },
    { number: '50K+', label: 'Happy Clients' },
    { number: '15+', label: 'Cities Covered' },
    { number: '4.9★', label: 'Average Rating' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Bride',
      text: 'Lume made my wedding day perfect! The artist was professional, talented, and understood exactly what I wanted.',
      rating: 5
    },
    {
      name: 'Ananya Kapoor',
      role: 'Model',
      text: 'As a professional model, I need the best. Lume consistently delivers top-tier artists for my editorial shoots.',
      rating: 5
    },
    {
      name: 'Meera Patel',
      role: 'Event Organizer',
      text: 'Booking multiple artists for events is now seamless. Great platform with reliable professionals!',
      rating: 5
    }
  ];

  const benefits = [
    { icon: Award, text: 'Award-Winning Artists' },
    { icon: Clock, text: '24/7 Customer Support' },
    { icon: Shield, text: 'Secure Payments' },
    { icon: TrendingUp, text: 'Best Price Guarantee' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__orbs">
          <div className="landing-hero__orb landing-hero__orb--1"></div>
          <div className="landing-hero__orb landing-hero__orb--2"></div>
          <div className="landing-hero__orb landing-hero__orb--3"></div>
          <div className="landing-hero__orb landing-hero__orb--4"></div>
        </div>

        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <Sparkles size={16} />
            <span>India's #1 Beauty Booking Platform</span>
          </div>

          <h1 className="landing-hero__title">
            Your Canvas.<br />
            <span className="landing-hero__title-accent">Our Masterpiece.</span>
          </h1>

          <p className="landing-hero__subtitle">
            Connect with India's finest beauty artists. From bridal elegance to editorial edge, 
            discover professionals who bring your vision to life with unmatched artistry.
          </p>

          <div className="landing-hero__cta">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/home')}
              className="landing-hero__cta-primary"
            >
              Book an Artist →
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/discover')}
              className="landing-hero__cta-secondary"
            >
              Explore Artists
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="landing-hero__stats">
            {stats.map((stat, index) => (
              <div key={index} className="landing-hero__stat">
                <div className="landing-hero__stat-number">{stat.number}</div>
                <div className="landing-hero__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Banner */}
      <section className="landing-benefits">
        <div className="landing-benefits__container">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="landing-benefit">
                <Icon size={24} className="landing-benefit__icon" />
                <span className="landing-benefit__text">{benefit.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features__container">
          <div className="landing-features__header">
            <span className="landing-features__eyebrow">Why Lume</span>
            <h2 className="landing-features__title">Everything You Need in One Platform</h2>
            <p className="landing-features__subtitle">
              Seamlessly connect with verified beauty professionals and manage your bookings effortlessly
            </p>
          </div>

          <div className="landing-features__grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="landing-feature" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="landing-feature__icon-wrapper">
                    <div className="landing-feature__icon">
                      <Icon size={32} />
                    </div>
                  </div>
                  <h3 className="landing-feature__title">{feature.title}</h3>
                  <p className="landing-feature__description">{feature.description}</p>
                  <div className="landing-feature__arrow">→</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="landing-testimonials">
        <div className="landing-testimonials__container">
          <div className="landing-testimonials__header">
            <span className="landing-testimonials__eyebrow">Client Stories</span>
            <h2 className="landing-testimonials__title">Loved by Thousands</h2>
            <p className="landing-testimonials__subtitle">
              Real experiences from real clients who found their perfect beauty artist
            </p>
          </div>

          <div className="landing-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="landing-testimonial" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="landing-testimonial__stars">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="landing-testimonial__text">"{testimonial.text}"</p>
                <div className="landing-testimonial__author">
                  <div className="landing-testimonial__avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="landing-testimonial__info">
                    <div className="landing-testimonial__name">{testimonial.name}</div>
                    <div className="landing-testimonial__role">{testimonial.role}</div>
                  </div>
                  <CheckCircle className="landing-testimonial__verified" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta__container">
          <div className="landing-cta__content">
            <Sparkles className="landing-cta__icon" size={48} />
            <h2 className="landing-cta__title">Ready to Discover Your Glow?</h2>
            <p className="landing-cta__subtitle">
              Join over 50,000 satisfied clients who trust Lume for their beauty needs. 
              Start your journey to flawless beauty today.
            </p>
            <div className="landing-cta__buttons">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/home')}
                className="landing-cta__button"
              >
                Start Booking Now →
              </Button>
              <span className="landing-cta__note">✓ Secure Booking · Premium Service</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
