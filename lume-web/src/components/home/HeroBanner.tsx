import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import './HeroBanner.css';

interface HeroBannerProps {
  promo?: string;
  title?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1512496015851-a908f2604245?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    promo: 'Premium Beauty Artists',
    title: 'Elevate Your Look with LUME',
    ctaText: 'Explore Artists',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    promo: 'Exclusive Editorial',
    title: 'Book Top Industry Professionals',
    ctaText: 'Discover Editorial',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    promo: 'Bridal Perfection',
    title: 'Your Special Day, Perfected.',
    ctaText: 'View Bridal Specialists',
  }
];

const HeroBanner: React.FC<HeroBannerProps> = ({ onCtaClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));

  return (
    <div className="hero-banner-carousel">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          <div className="hero-slide__overlay"></div>
          <div className="hero-slide__content">
            <span className="hero-slide__promo">{slide.promo}</span>
            <h2 className="hero-slide__title">{slide.title}</h2>
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
              ariaLabel={slide.ctaText}
              className="hero-slide__cta"
            >
              {slide.ctaText}
            </Button>
          </div>
        </div>
      ))}
      
      {/* Navigation Controls */}
      <button className="hero-nav-btn prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={32} />
      </button>
      <button className="hero-nav-btn next" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={32} />
      </button>

      {/* Dots */}
      <div className="hero-dots">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;