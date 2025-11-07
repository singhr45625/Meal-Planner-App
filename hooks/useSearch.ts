import { useState, useEffect, useCallback } from 'react';
import { MealModel } from '../types/Meal';
import { MealCategory, Difficulty } from '../constants/Types';
import MealService from '../services/MealService';

interface SearchFilters {
  category?: MealCategory;
  difficulty?: Difficulty;
  maxCookingTime?: number;
  maxCalories?: number;
  tags?: string[];
}

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<MealModel[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMeals = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredMeals = MealService.getAllMeals();

    // Apply text search
    if (searchQuery.trim()) {
      filteredMeals = MealService.searchMeals(searchQuery);
    }

    // Apply filters
    if (searchFilters.category) {
      filteredMeals = filteredMeals.filter(meal => meal.category === searchFilters.category);
    }

    if (searchFilters.difficulty) {
      filteredMeals = filteredMeals.filter(meal => meal.difficulty === searchFilters.difficulty);
    }

    if (searchFilters.maxCookingTime) {
      filteredMeals = filteredMeals.filter(meal => meal.cookingTime <= searchFilters.maxCookingTime!);
    }

    if (searchFilters.maxCalories) {
      filteredMeals = filteredMeals.filter(meal => meal.calories <= searchFilters.maxCalories!);
    }

    if (searchFilters.tags && searchFilters.tags.length > 0) {
      filteredMeals = filteredMeals.filter(meal =>
        searchFilters.tags!.some(tag => meal.tags.includes(tag))
      );
    }

    setResults(filteredMeals);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query.trim() || Object.keys(filters).length > 0) {
      searchMeals(query, filters);
    } else {
      setResults(MealService.getAllMeals());
    }
  }, [query, filters, searchMeals]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults(MealService.getAllMeals());
  }, []);

  return {
    query,
    filters,
    results,
    loading,
    updateQuery,
    updateFilters,
    clearFilters,
    clearSearch,
    searchMeals,
  };
};