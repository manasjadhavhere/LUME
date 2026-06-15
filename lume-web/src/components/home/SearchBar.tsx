import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilter: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onFilter,
  placeholder = "Search artists, styles, or occasions..."
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Debounce the search input (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onChange]);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="search-bar">
      <div className="search-bar__container">
        <div className="search-bar__input-wrapper">
          <Search className="search-bar__icon" size={20} />
          <input
            type="text"
            className="search-bar__input"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            aria-label="Search for artists, styles, or occasions"
          />
        </div>
        <button
          className="search-bar__filter-btn"
          onClick={onFilter}
          aria-label="Open filters"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;