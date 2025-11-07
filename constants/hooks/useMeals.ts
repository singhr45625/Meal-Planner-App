import { useEffect, useState } from 'react';
import MealService from '../../services/MealService';
import { MealModel } from '../../types/Meal';

export const useMeals = () => {
  const [meals, setMeals] = useState<MealModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = () => {
    setLoading(true);
    const allMeals = MealService.getAllMeals();
    setMeals(allMeals);
    setLoading(false);
  };

  const toggleFavorite = (mealId: string) => {
    MealService.toggleFavorite(mealId);
    loadMeals();
  };

  const searchMeals = (query: string) => {
    if (!query.trim()) {
      loadMeals();
    } else {
      const results = MealService.searchMeals(query);
      setMeals(results);
    }
  };

  return {
    meals,
    loading,
    toggleFavorite,
    searchMeals,
    refreshMeals: loadMeals,
  };
};