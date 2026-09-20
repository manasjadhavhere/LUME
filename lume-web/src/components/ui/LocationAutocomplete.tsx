import React, { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import './LocationAutocomplete.css';

// Top Indian Cities + some major hubs
const INDIAN_CITIES = [
  'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
  'Chandigarh', 'Coimbatore', 'Kochi'
].sort();

interface LocationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'City (e.g. Mumbai, Delhi NCR)',
  className = '',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = INDIAN_CITIES.filter(city =>
    city.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (city: string) => {
    setInputValue(city);
    onChange(city);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className={`location-autocomplete ${className}`} ref={wrapperRef}>
      {icon}
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />
      
      {isOpen && (
        <div className="location-autocomplete__dropdown">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <div
                key={city}
                className="location-autocomplete__item"
                onClick={() => handleSelect(city)}
              >
                <MapPin size={14} className="location-autocomplete__icon" />
                {city}
              </div>
            ))
          ) : (
            <div className="location-autocomplete__empty">
              No cities found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
