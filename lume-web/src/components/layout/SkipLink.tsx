import React from 'react';

const SkipLink: React.FC = () => {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      className="skip-link"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
