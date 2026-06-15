import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { fc } from '@fast-check/vitest';
import useGreeting from './useGreeting';
import useLocalStorage from './useLocalStorage';

/**
 * Property 1: Time-appropriate greeting
 * For any time of day, the home screen greeting should display "Good morning", 
 * "Good afternoon", or "Good evening" based on the hour 
 * (morning: 5-11, afternoon: 12-17, evening: 18-4)
 * Validates: Requirements 2.1
 */

/**
 * Property 15: Favorites persistence round-trip
 * For any artist favorited, refreshing the application or closing and reopening 
 * it should restore that artist in the favorites list (localStorage round-trip)
 * Validates: Requirements 19.1, 19.2, 19.3
 */

describe('Hook Properties', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  test('Property 1: Time-appropriate greeting - greetings match time of day correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // Hour of day (0-23)
        fc.string({ minLength: 1, maxLength: 20 }), // User name
        (hour, userName) => {
          // Mock the current time to the test hour
          const mockDate = new Date();
          mockDate.setHours(hour, 0, 0, 0);
          vi.setSystemTime(mockDate);

          const { result } = renderHook(() => useGreeting(userName));
          
          const greeting = result.current;
          
          // Verify greeting contains the user name
          expect(greeting).toContain(userName);
          
          // Verify greeting matches expected time range
          if (hour >= 5 && hour < 12) {
            expect(greeting).toContain('Good morning');
          } else if (hour >= 12 && hour < 18) {
            expect(greeting).toContain('Good afternoon'); 
          } else {
            // Evening: 18-23 and 0-4
            expect(greeting).toContain('Good evening');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 15: Favorites persistence round-trip - localStorage operations preserve data correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }), // Storage key
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }), // Array of values to store
        (storageKey, initialValues) => {
          // First hook instance - simulates initial app load
          const { result: firstResult } = renderHook(() => 
            useLocalStorage(storageKey, initialValues)
          );
          
          // Verify initial value is set correctly
          expect(firstResult.current[0]).toEqual(initialValues);
          
          // Generate new values to store
          const newValues = [...initialValues, 'new-item-' + Math.random()];
          
          // Update the value in first hook instance
          act(() => {
            firstResult.current[1](newValues);
          });
          
          // Verify the value was updated in first instance
          expect(firstResult.current[0]).toEqual(newValues);
          
          // Second hook instance - simulates app restart/reload
          const { result: secondResult } = renderHook(() => 
            useLocalStorage(storageKey, initialValues)
          );
          
          // Verify the value persisted across "restarts" - should load the updated value
          expect(secondResult.current[0]).toEqual(newValues);
          
          // Test removal functionality
          act(() => {
            secondResult.current[2](); // Call remove function
          });
          
          // Should revert to initial value after removal
          expect(secondResult.current[0]).toEqual(initialValues);
          
          // Third hook instance - verify removal persisted
          const { result: thirdResult } = renderHook(() => 
            useLocalStorage(storageKey, initialValues)
          );
          
          expect(thirdResult.current[0]).toEqual(initialValues);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 15 extension: localStorage fallback behavior when storage unavailable', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }), // Storage key
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }), // Initial values
        (storageKey, initialValues) => {
          // Mock localStorage to throw errors (simulating unavailable storage)
          const originalSetItem = localStorage.setItem;
          const originalGetItem = localStorage.getItem;
          
          vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
          });
          vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage unavailable');
          });
          
          const { result } = renderHook(() => 
            useLocalStorage(storageKey, initialValues)
          );
          
          // Should fall back to initial value when storage unavailable
          expect(result.current[0]).toEqual(initialValues);
          
          // Should still allow in-memory updates
          const newValue = [...initialValues, 'memory-item'];
          act(() => {
            result.current[1](newValue);
          });
          
          // Value should update in memory even without storage
          expect(result.current[0]).toEqual(newValue);
          
          // Restore original methods
          localStorage.setItem = originalSetItem;
          localStorage.getItem = originalGetItem;
        }
      ),
      { numRuns: 25 }
    );
  });
});