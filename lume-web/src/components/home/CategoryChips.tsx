import React from 'react';
import type { ServiceCategory } from '../../data/types';
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
  onCategorySelect
}) => {
  return (
    <div className="category-circles">
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
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="category-circle-img-wrapper">
              {category.image ? (
                <img src={category.image} alt={category.label} className="category-circle-img" />
              ) : (
                <span className="category-circle-icon">{category.icon}</span>
              )}
            </div>
            <span className="category-circle-label">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryChips;