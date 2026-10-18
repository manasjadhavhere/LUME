import React, { useRef, useState, useEffect } from 'react';
import type { ServiceCategory } from '../../data/types';
import CategoryIcon from '../ui/CategoryIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryChips.css';

interface Category {
  id: ServiceCategory;
  icon?: string;
  image?: string;
  label: string;
}

interface CategoryChipsProps {
  categories: Category[];
  activeCategory: ServiceCategory;
  onCategorySelect: (id: ServiceCategory) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(checkScroll, 120);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.65;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <div className="category-circles-wrapper">
      <button
        type="button"
        className={`category-scroll-arrow category-scroll-arrow--left ${canScrollLeft ? 'is-visible' : ''}`}
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        className="category-circles"
        ref={scrollContainerRef}
        onScroll={checkScroll}
      >
        <div className="category-circles__container">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className={`category-circle-btn ${
                activeCategory === category.id ? 'active' : ''
              }`}
              onClick={() => onCategorySelect(category.id)}
              aria-pressed={activeCategory === category.id}
              aria-label={`Filter by ${category.label}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="category-circle-img-wrapper">
                {category.image ? (
                  <img src={category.image} alt={category.label} className="category-circle-img" />
                ) : (
                  <CategoryIcon icon={category.icon} name={category.label} size={28} className="category-circle-icon" />
                )}
              </div>
              <span className="category-circle-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`category-scroll-arrow category-scroll-arrow--right ${canScrollRight ? 'is-visible' : ''}`}
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default CategoryChips;