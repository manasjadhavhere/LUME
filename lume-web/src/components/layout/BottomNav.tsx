import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/saved', icon: Heart, label: 'Saved' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="nav-icon" size={24} />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
