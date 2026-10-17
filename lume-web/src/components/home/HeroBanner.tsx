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
    image: '/slideshow/1.png',
    promo: 'Premium Beauty Artists',
    title: 'Elevate Your Look with LUME',
    ctaText: 'Explore Artists',
  },
  {
    id: 2,
    image: '/slideshow/2.png',
    promo: 'Exclusive Editorial',
    title: 'Book Top Industry Professionals',
    ctaText: 'Discover Editorial',
  },
  {
    id: 3,
    image: '/slideshow/3.png',
    promo: 'Bridal Perfection',
    title: 'Your Special Day, Perfected.',
    ctaText: 'View Bridal Specialists',
  },
  {
    id: 4,
    image: '/slideshow/4.png',
    promo: 'Glamour & Grace',
    title: 'Unleash Your Inner Radiance',
    ctaText: 'Find Your Artist',
  },
  {
    id: 5,
    image: '/slideshow/5.png',
    promo: 'Studio Perfection',
    title: 'Crafted for Every Occasion',
    ctaText: 'Book Now',
  },
  {
    id: 6,
    image: '/slideshow/6.png',
    promo: 'Luxury Experience',
    title: 'Beauty That Tells Your Story',
    ctaText: 'Get Started',
  },
  {
    id: 7,
    image: '/slideshow/7.png',
    promo: 'Unforgettable Looks',
    title: 'Artistry in Every Detail',
    ctaText: 'Explore Now',
  },
];

const HeroBanner: React.FC<HeroBannerProps> = ({ promo, title, ctaText, onCtaClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlideIdx, setPrevSlideIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setPrevSlideIdx(currentSlide);
    setCurrentSlide(index);
    setTimeout(() => {
      setPrevSlideIdx(null);
      setIsTransitioning(false);
    }, 900);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentSlide + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isTransitioning]);

  const nextSlide = () => goToSlide((currentSlide + 1) % SLIDES.length);
  const prevSlide = () => goToSlide(currentSlide === 0 ? SLIDES.length - 1 : currentSlide - 1);

  return (
    <div className="hero-banner-carousel">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''} ${index === prevSlideIdx ? 'leaving' : ''}`}
          style={{ backgroundImage: `url('${slide.image}')` }}
          aria-hidden={index !== currentSlide}
        >
          <div className="hero-slide__overlay"></div>
          <div className="hero-slide__content">
            <span className="hero-slide__promo">{index === 0 && promo ? promo : slide.promo}</span>
            <h2 className="hero-slide__title">{index === 0 && title ? title : slide.title}</h2>
            <Button
              variant="primary"
              size="lg"
              onClick={onCtaClick}
              ariaLabel={index === 0 && ctaText ? ctaText : slide.ctaText}
              className="hero-slide__cta"
              tabIndex={index === currentSlide ? 0 : -1}
            >
              {index === 0 && ctaText ? ctaText : slide.ctaText}
            </Button>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <button className="hero-nav-btn prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={28} />
      </button>
      <button className="hero-nav-btn next" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={28} />
      </button>

      {/* Progress bar */}
      <div className="hero-progress">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`hero-progress-bar ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="hero-counter">
        <span className="hero-counter__current">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="hero-counter__sep"> / </span>
        <span className="hero-counter__total">{String(SLIDES.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default HeroBanner;