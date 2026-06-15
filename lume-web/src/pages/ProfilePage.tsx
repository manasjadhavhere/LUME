import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  MapPin,
  ChevronRight
} from 'lucide-react';
import './ProfilePage.css';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuItemClick = (itemId: string) => {
    // Placeholder navigation - in a real app these would go to actual pages
    console.log(`Navigating to ${itemId}`);
    
    // For demo purposes, show a toast or alert
    switch (itemId) {
      case 'bookings':
        alert('My Bookings - Coming soon!');
        break;
      case 'payments':
        alert('Payment Methods - Coming soon!');
        break;
      case 'settings':
        alert('Settings - Coming soon!');
        break;
      case 'help':
        alert('Help & Support - Coming soon!');
        break;
      case 'logout':
        // In a real app, this would clear auth state and redirect
        if (window.confirm('Are you sure you want to logout?')) {
          navigate('/');
        }
        break;
      default:
        break;
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'bookings',
      icon: <Calendar size={20} />,
      label: 'My Bookings',
      onClick: () => handleMenuItemClick('bookings')
    },
    {
      id: 'payments',
      icon: <CreditCard size={20} />,
      label: 'Payment Methods',
      onClick: () => handleMenuItemClick('payments')
    },
    {
      id: 'settings',
      icon: <Settings size={20} />,
      label: 'Settings',
      onClick: () => handleMenuItemClick('settings')
    },
    {
      id: 'help',
      icon: <HelpCircle size={20} />,
      label: 'Help & Support',
      onClick: () => handleMenuItemClick('help')
    },
    {
      id: 'logout',
      icon: <LogOut size={20} />,
      label: 'Logout',
      onClick: () => handleMenuItemClick('logout')
    }
  ];

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-page__header">
        <div className="profile-page__user-info">
          <div className="profile-page__avatar">
            <span className="profile-page__avatar-emoji">👩‍🦱</span>
          </div>
          <div className="profile-page__user-details">
            <h1 className="profile-page__name">Priya Sharma</h1>
            <div className="profile-page__location">
              <MapPin size={16} />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="profile-page__stats">
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">12</span>
          <span className="profile-page__stat-label">Bookings</span>
        </div>
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">8</span>
          <span className="profile-page__stat-label">Reviews</span>
        </div>
        <div className="profile-page__stat">
          <span className="profile-page__stat-value">3</span>
          <span className="profile-page__stat-label">Favorites</span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="profile-page__menu">
        <h2 className="profile-page__menu-title">Account</h2>
        <div className="profile-page__menu-list">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              className={`profile-page__menu-item ${
                item.id === 'logout' ? 'profile-page__menu-item--danger' : ''
              }`}
              onClick={item.onClick}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="profile-page__menu-item-content">
                <div className="profile-page__menu-item-left">
                  <span className="profile-page__menu-item-icon">
                    {item.icon}
                  </span>
                  <span className="profile-page__menu-item-label">
                    {item.label}
                  </span>
                </div>
                <ChevronRight size={16} className="profile-page__menu-item-arrow" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="profile-page__app-info">
        <p className="profile-page__app-version">Lume v1.0.0</p>
        <p className="profile-page__app-tagline">Your canvas. Our masterpiece.</p>
      </div>
    </div>
  );
};

export default ProfilePage;