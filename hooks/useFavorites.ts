import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { MealModel } from '../types/Meal';
import { mealService } from '../services/MealService';
import StorageService from '../services/StorageService';

const FAVORITES_KEY = 'user_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]); // FIXED: Change to string[]
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    
    try {
      // Try to load from storage first
      const storedFavorites = await StorageService.getItem<string[]>(FAVORITES_KEY);
      
      if (storedFavorites && Array.isArray(storedFavorites)) {
        setFavorites(storedFavorites);
      } else {
        // Fallback to service - get only favorite IDs
        const allMeals = await mealService.getMeals();
        const favoriteIds = allMeals
          .filter(meal => meal.isFavorite)
          .map(meal => meal.id);
        setFavorites(favoriteIds);
        
        // Save to storage for next time
        await StorageService.setItem(FAVORITES_KEY, favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]); // Ensure it's always an array
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const toggleFavorite = useCallback(async (mealId: string) => {
    try {
      // Check if already favorited
      const isCurrentlyFavorite = favorites.includes(mealId);
      const newFavorites = isCurrentlyFavorite 
        ? favorites.filter(id => id !== mealId)
        : [...favorites, mealId];
      
      // Optimistically update UI
      setFavorites(newFavorites);
      
      // Update storage
      await StorageService.setItem(FAVORITES_KEY, newFavorites);
      
      // Try to update backend if available
      try {
        await mealService.toggleFavorite(mealId);
      } catch (apiError) {
        console.log('Backend favorite update failed, using local storage only:', apiError);
      }
      
      return { success: true, isFavorited: !isCurrentlyFavorite };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorites(prev => prev || []);
      return { success: false };
    }
  }, [favorites]);

  const isFavorite = useCallback((mealId: string): boolean => {
    // Add safety checks
    if (!favorites || !Array.isArray(favorites)) {
      return false;
    }
    return favorites.includes(mealId);
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    try {
      setFavorites([]);
      await StorageService.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }, []);

  // FIXED: Ensure we always return an array, never undefined
  return {
    favorites: favorites || [],
    loading,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refreshFavorites: loadFavorites,
    initialized,
  };
};