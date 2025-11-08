// hooks/useMeals.ts - UPDATED
import { useEffect, useState } from 'react';
import { mealService } from '../services/MealService';
import { MealModel } from '../types/Meal';

export const useMeals = () => {
  const [meals, setMeals] = useState<MealModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const allMeals = await mealService.getMeals();
      setMeals(allMeals);
    } catch (err: any) {
      setError(err.message || 'Failed to load meals');
      console.error('Failed to load meals:', err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Immediately add new meal to state
  const createMeal = async (mealData: any): Promise<boolean> => {
    try {
      console.log('Creating meal with data:', mealData);
      
      const newMeal = await mealService.createMeal(mealData);
      console.log('Meal created successfully:', newMeal);
      
      // Immediately add the new meal to the local state
      setMeals(prevMeals => [newMeal, ...prevMeals]);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create meal');
      console.error('Failed to create meal:', err);
      return false;
    }
  };

  const toggleFavorite = async (mealId: string) => {
    try {
      await mealService.toggleFavorite(mealId);
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.id === mealId 
            ? { ...meal, isFavorite: !meal.isFavorite }
            : meal
        )
      );
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const searchMeals = async (query: string) => {
    try {
      setLoading(true);
      if (!query.trim()) {
        await loadMeals();
      } else {
        const results = await mealService.searchMeals(query);
        setMeals(results);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search meals');
      console.error('Failed to search meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMeal = async (id: string, updates: any): Promise<boolean> => {
    try {
      const updatedMeal = await mealService.updateMeal(id, updates);
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.id === id ? updatedMeal : meal
        )
      );
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update meal');
      console.error('Failed to update meal:', err);
      return false;
    }
  };

  const deleteMeal = async (id: string): Promise<boolean> => {
    try {
      await mealService.deleteMeal(id);
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete meal');
      console.error('Failed to delete meal:', err);
      return false;
    }
  };

  return {
    meals,
    loading,
    error,
    toggleFavorite,
    searchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    refreshMeals: loadMeals,
  };
};