import React, { useRef, useEffect } from 'react';
import type { Service } from '../../data/types';
import CategoryIcon from '../ui/CategoryIcon';
import './ServiceSelector.css';

interface ServiceSelectorProps {
  services: Service[];
  selectedService: string | null;
  onServiceSelect: (serviceId: string) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onServiceSelect
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected service on mount/change
  useEffect(() => {
    if (!scrollRef.current || !selectedService) return;

    const selectedElement = scrollRef.current.querySelector(
      `[data-service-id="${selectedService}"]`
    );

    if (selectedElement && typeof (selectedElement as any).scrollIntoView === 'function') {
      (selectedElement as any).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedService]);

  return (
    <div className="service-selector">
      <div
        className="service-selector__scroll"
        ref={scrollRef}
        role="listbox"
        aria-label="Select a service"
      >
        {services.map((service) => (
          <button
            key={service.id}
            data-service-id={service.id}
            className={`service-selector__card ${
              selectedService === service.id ? 'service-selector__card--selected' : ''
            }`}
            onClick={() => onServiceSelect(service.id)}
            role="option"
            aria-selected={selectedService === service.id}
            aria-label={`${service.name} - ₹${service.price.toLocaleString()}`}
            title={`${service.name} - ₹${service.price.toLocaleString()}`}
          >
            <div className="service-selector__icon-wrapper">
              <CategoryIcon icon={service.icon} name={service.name} size={22} className="service-selector__icon" />
            </div>
            
            <div className="service-selector__info">
              <div className="service-selector__name">{service.name}</div>
              <div className="service-selector__price">₹{service.price.toLocaleString()}</div>
            </div>
            
            {selectedService === service.id && (
              <div className="service-selector__check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelector;
