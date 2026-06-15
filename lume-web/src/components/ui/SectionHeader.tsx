import React from 'react';
import { ChevronRight } from 'lucide-react';
import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  step?: number;
  seeAllText?: string;
  onSeeAll?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  step,
  seeAllText, 
  onSeeAll 
}) => {
  return (
    <div className="section-header">
      <h2 className="section-title">
        {step && <span className="section-step">{step}</span>}
        {title}
      </h2>
      {seeAllText && onSeeAll && (
        <button 
          className="see-all-btn" 
          onClick={onSeeAll}
          aria-label={`See all ${title}`}
        >
          <span>{seeAllText}</span>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
