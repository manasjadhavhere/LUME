import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for managing favorites list with localStorage persistence
 * Provides functions to add, remove, check, and get favorites
 * Handles localStorage unavailable with in-memory fallback
 */
const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<string[]>('lume-favorites', []);

  /**
   * Add an artist to favorites
   */
  const addFavorite = useCallback((artistId: string) => {
    setFavorites(prev => {
      if (prev.includes(artistId)) {
        return prev; // Already in favorites
      }
      return [...prev, artistId];
    });
  }, [setFavorites]);

  /**
   * Remove an artist from favorites
   */
  const removeFavorite = useCallback((artistId: string) => {
    setFavorites(prev => prev.filter(id => id !== artistId));
  }, [setFavorites]);

  /**
   * Check if an artist is in favorites
   */
  const isFavorite = useCallback((artistId: string): boolean => {
    return favorites.includes(artistId);
  }, [favorites]);

  /**
   * Get all favorite artist IDs
   */
  const getFavorites = useCallback((): string[] => {
    return [...favorites]; // Return a copy to prevent mutations
  }, [favorites]);

  /**
   * Toggle favorite status for an artist
   */
  const toggleFavorite = useCallback((artistId: string) => {
    if (isFavorite(artistId)) {
      removeFavorite(artistId);
    } else {
      addFavorite(artistId);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  return {
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavorites,
    toggleFavorite
  };
};

export default useFavorites;