import React from 'react';
import { Star, Sparkles, Award } from 'lucide-react';
import './Badge.css';

export type BadgeVariant = 'top-pick' | 'new' | 'certified';

interface BadgeProps {
  variant: BadgeVariant;
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, text }) => {
  const getIcon = () => {
    switch (variant) {
      case 'top-pick':
        return <Star size={14} fill="currentColor" />;
      case 'new':
        return <Sparkles size={14} />;
      case 'certified':
        return <Award size={14} />;
      default:
        return null;
    }
  };

  return (
    <span className={`badge badge-${variant}`}>
      {getIcon()}
      <span className="badge-text">{text}</span>
    </span>
  );
};

export default Badge;
