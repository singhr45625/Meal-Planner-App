import { useState, useEffect, useCallback } from 'react';
import { MealModel } from '../types/Meal';
import MealService from '../services/MealService';
import StorageService from '../services/StorageService';

const FAVORITES_KEY = 'user_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<MealModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    
    // Try to load from storage first
    const storedFavorites = await StorageService.getItem<string[]>(FAVORITES_KEY);
    
    if (storedFavorites) {
      const favoriteMeals = storedFavorites
        .map(id => MealService.getMealById(id))
        .filter((meal): meal is MealModel => meal !== undefined);
      setFavorites(favoriteMeals);
    } else {
      // Fallback to service
      const serviceFavorites = MealService.getFavoriteMeals();
      setFavorites(serviceFavorites);
    }
    
    setLoading(false);
  }, []);

  const toggleFavorite = useCallback(async (mealId: string) => {
    const isNowFavorite = MealService.toggleFavorite(mealId);
    
    if (isNowFavorite) {
      // Add to favorites
      const meal = MealService.getMealById(mealId);
      if (meal) {
        setFavorites(prev => [...prev, meal]);
      }
    } else {
      // Remove from favorites
      setFavorites(prev => prev.filter(fav => fav.id !== mealId));
    }

    // Update storage
    const favoriteIds = MealService.getAllMeals()
      .filter(meal => meal.isFavorite)
      .map(meal => meal.id);
    
    await StorageService.setItem(FAVORITES_KEY, favoriteIds);
  }, []);

  const isFavorite = useCallback((mealId: string): boolean => {
    return favorites.some(fav => fav.id === mealId);
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    // Remove favorites from all meals
    MealService.getAllMeals().forEach(meal => {
      if (meal.isFavorite) {
        meal.toggleFavorite();
      }
    });
    
    setFavorites([]);
    await StorageService.removeItem(FAVORITES_KEY);
  }, []);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    refreshFavorites: loadFavorites,
  };
};