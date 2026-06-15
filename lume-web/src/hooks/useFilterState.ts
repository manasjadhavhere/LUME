import { useState, useEffect } from 'react';
import type { ServiceCategory } from '../data/types';

/**
 * Hook to persist filter and selection state across navigation
 * Maintains category selections and search queries until explicitly changed
 */
const useFilterState = () => {
  // Initialize state from sessionStorage or defaults
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>(() => {
    const saved = sessionStorage.getItem('activeCategory');
    return (saved as ServiceCategory) || 'All';
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return sessionStorage.getItem('searchQuery') || '';
  });

  // Persist category changes
  useEffect(() => {
    sessionStorage.setItem('activeCategory', activeCategory);
  }, [activeCategory]);

  // Persist search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      sessionStorage.setItem('searchQuery', searchQuery);
    } else {
      sessionStorage.removeItem('searchQuery');
    }
  }, [searchQuery]);

  // Function to clear all filter state
  const clearFilterState = () => {
    sessionStorage.removeItem('activeCategory');
    sessionStorage.removeItem('searchQuery');
    setActiveCategory('All');
    setSearchQuery('');
  };

  // Function to reset only search while keeping category
  const clearSearch = () => {
    sessionStorage.removeItem('searchQuery');
    setSearchQuery('');
  };

  // Function to reset only category while keeping search
  const resetCategory = () => {
    sessionStorage.setItem('activeCategory', 'All');
    setActiveCategory('All');
  };

  return {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    clearFilterState,
    clearSearch,
    resetCategory,
  };
};

export default useFilterState;