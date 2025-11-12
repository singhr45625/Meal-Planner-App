import { useState, useEffect, useCallback } from 'react';
import { MealModel } from '../types/Meal';
import MealService from '../services/MealService';
import StorageService from '../services/StorageService';

const FAVORITES_KEY = 'user_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<MealModel[]>([]);
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
        const favoriteMeals = storedFavorites
          .map(id => MealService.getMealById(id))
          .filter((meal): meal is MealModel => meal !== undefined);
        setFavorites(favoriteMeals);
      } else {
        // Fallback to service
        const serviceFavorites = MealService.getFavoriteMeals();
        setFavorites(serviceFavorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  const toggleFavorite = useCallback(async (mealId: string) => {
    try {
      const isNowFavorite = MealService.toggleFavorite(mealId);
      
      if (isNowFavorite) {
        // Add to favorites
        const meal = MealService.getMealById(mealId);
        if (meal) {
          setFavorites(prev => [...(prev || []), meal]);
        }
      } else {
        // Remove from favorites
        setFavorites(prev => (prev || []).filter(fav => fav.id !== mealId));
      }

      // Update storage
      const favoriteIds = MealService.getAllMeals()
        .filter(meal => meal.isFavorite)
        .map(meal => meal.id);
      
      await StorageService.setItem(FAVORITES_KEY, favoriteIds);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, []);

  const isFavorite = useCallback((mealId: string): boolean => {
    // Add safety checks to prevent the "some is not a function" error
    if (!favorites || !Array.isArray(favorites) || !initialized) {
      return false;
    }
    return favorites.some(fav => fav && fav.id === mealId);
  }, [favorites, initialized]);

  const clearFavorites = useCallback(async () => {
    try {
      // Remove favorites from all meals
      MealService.getAllMeals().forEach(meal => {
        if (meal.isFavorite) {
          meal.toggleFavorite();
        }
      });
      
      setFavorites([]);
      await StorageService.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }, []);

  return {
    favorites: favorites || [], // Ensure we always return an array
    loading,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refreshFavorites: loadFavorites,
    initialized, // Export initialized state if needed
  };
};