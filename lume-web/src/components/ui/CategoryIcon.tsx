import React from 'react';

interface CategoryIconProps {
  icon?: string;
  name?: string;
  className?: string;
  size?: number;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon = '',
  name = '',
  className = '',
  size = 24
}) => {
  // Determine identifier from name or icon string
  const key = (name || icon || '').toLowerCase().trim();

  // 1. BRIDAL (Tiara / Crown / Ring)
  if (key.includes('bridal') || key.includes('👰') || key === 'crown') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 17h18" />
        <path d="M5 17l-2-9 5 3 4-7 4 7 5-3-2 9" />
        <circle cx="12" cy="4" r="1" fill="currentColor" />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        <circle cx="16" cy="11" r="0.75" fill="currentColor" />
      </svg>
    );
  }

  // 2. EDITORIAL (Sleek Camera / Lens)
  if (key.includes('editorial') || key.includes('📸') || key === 'camera') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3.5" />
        <path d="M17.5 10h.01" strokeWidth="3" />
      </svg>
    );
  }

  // 3. GLAM (Radiant Sparkles / Diamonds)
  if (key.includes('glam') || key.includes('✨') || key.includes('💫') || key === 'sparkles') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    );
  }

  // 4. EVENING (Crescent Moon & Stars)
  if (key.includes('evening') || key.includes('🌆') || key === 'moon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M19 3v4" />
        <path d="M21 5h-4" />
        <circle cx="15" cy="9" r="0.75" fill="currentColor" />
      </svg>
    );
  }

  // 5. NATURAL (Delicate Botanical Leaf / Stem)
  if (key.includes('natural') || key.includes('🌿') || key === 'leaf') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    );
  }

  // 6. ALL / DEFAULT (Grid / Cluster of Beauty Sparkles)
  if (key === 'all' || key === 'all services') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect width="7" height="7" x="3" y="3" rx="1.5" />
        <rect width="7" height="7" x="14" y="3" rx="1.5" />
        <rect width="7" height="7" x="14" y="14" rx="1.5" />
        <path d="M6.5 14v6" />
        <path d="M3.5 17h6" />
      </svg>
    );
  }

  // Fallback: Elegant Sparkle / Gem
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
};

export default CategoryIcon;
