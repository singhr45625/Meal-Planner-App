import { MealModel } from '../types/Meal';
import { PlannedMeal } from '../constants/Types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const calculateTotalCalories = (meals: MealModel[]): number => {
  return meals.reduce((total, meal) => total + meal.calories, 0);
};

export const filterMealsByType = (meals: PlannedMeal[], mealType: string): PlannedMeal[] => {
  return meals.filter(meal => meal.mealType === mealType);
};

export const sortMealsByTime = (meals: PlannedMeal[]): PlannedMeal[] => {
  return meals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
};

export const getMealTypeColor = (mealType: string): string => {
  const mealTypeColors: { [key: string]: string } = {
    breakfast: '#FFE66D',
    lunch: '#4ECDC4',
    dinner: '#FF6B35',
    snack: '#A78BFA',
  };
  
  return mealTypeColors[mealType] || '#E2E8F0';
};

export const getMealTypeIcon = (mealType: string): string => {
  const mealTypeIcons: { [key: string]: string } = {
    breakfast: 'sunny-outline',
    lunch: 'restaurant-outline',
    dinner: 'moon-outline',
    snack: 'cafe-outline',
  };
  
  return mealTypeIcons[mealType] || 'fast-food-outline';
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${period}`;
};