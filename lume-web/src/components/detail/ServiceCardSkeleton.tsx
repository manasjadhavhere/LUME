import React from 'react';
import './ServiceCardSkeleton.css';

const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="service-card-skeleton">
      <div className="service-card-skeleton__icon skeleton" />
      <div className="service-card-skeleton__name skeleton" />
      <div className="service-card-skeleton__price skeleton" />
    </div>
  );
};

export default ServiceCardSkeleton;
