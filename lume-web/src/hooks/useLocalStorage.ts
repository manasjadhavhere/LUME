import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * Gracefully handles storage unavailable scenarios with in-memory fallback
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Check if localStorage is available
  const isStorageAvailable = (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  };

  const storageAvailable = isStorageAvailable();

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function (same API as useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);

        // Save to localStorage if available
        if (storageAvailable) {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, storageAvailable]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (storageAvailable) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, storageAvailable]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (!storageAvailable) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storageAvailable]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
