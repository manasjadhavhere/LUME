import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import './Header.css';

const CATEGORIES = [
  'Brands',
  'Bridal',
  'Editorial',
  'Evening',
  'Natural',
  'Glam',
  'Jewellery',
  'Accessories'
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logic for search execution
    }
  };

  return (
    <header className="global-header">
      {/* Top Banner (Optional Promos) */}
      <div className="global-header__top-banner">
        <span>Premium Beauty Services - Secure Payments & Verified Professionals</span>
      </div>

      {/* Main Header Row */}
      <div className="global-header__main">
        <div className="global-header__container">
          {/* Logo */}
          <button 
            className="global-header__logo"
            onClick={() => navigate('/home')}
            aria-label="Lume - Go to home"
          >
            <span className="global-header__logo-text">LUME</span>
          </button>

          {/* Search Bar */}
          <div className="global-header__search-container">
            <form className="global-header__search-form" onSubmit={handleSearchSubmit}>
              <Search className="global-header__search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search for Brands, Categories and more..." 
                className="global-header__search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="global-header__actions">
            <button className="global-header__icon-btn" aria-label="Wishlist">
              <Heart size={24} />
            </button>
            <button className="global-header__icon-btn" aria-label="Cart">
              <ShoppingBag size={24} />
            </button>
            <button className="global-header__icon-btn" aria-label="Profile">
              <User size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Row (Categories) */}
      <div className="global-header__nav-row">
        <div className="global-header__container">
          <nav className="global-header__nav">
            {CATEGORIES.map((category) => (
              <button key={category} className="global-header__nav-item">
                {category}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
