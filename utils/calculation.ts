import { MealPlan } from '../constants/Types';
import { MealModel } from '../types/Meal';

export const calculateDailyNutrition = (meals: MealModel[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} => {
  return meals.reduce((total, meal) => ({
    calories: total.calories + meal.calories,
    protein: total.protein + (meal as any).protein || 0,
    carbs: total.carbs + (meal as any).carbs || 0,
    fat: total.fat + (meal as any).fat || 0,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export const calculateWeeklyNutrition = (weeklyPlan: MealPlan[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} => {
  return weeklyPlan.reduce((total, day) => ({
    calories: total.calories + day.totalCalories,
    protein: total.protein + 0, // Would need actual protein data
    carbs: total.carbs + 0, // Would need actual carbs data
    fat: total.fat + 0, // Would need actual fat data
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const estimateCookingTime = (ingredients: string[], difficulty: string): number => {
  let baseTime = 0;
  
  switch (difficulty) {
    case 'Easy':
      baseTime = 15;
      break;
    case 'Medium':
      baseTime = 30;
      break;
    case 'Hard':
      baseTime = 45;
      break;
  }
  
  // Add time based on ingredient complexity
  const complexIngredients = ingredients.filter(ing => 
    ing.toLowerCase().includes('marinate') || 
    ing.toLowerCase().includes('roast') ||
    ing.toLowerCase().includes('bake')
  ).length;
  
  return baseTime + (complexIngredients * 10);
};

export const calculateGroceryQuantities = (meals: MealModel[], servings: number): Map<string, number> => {
  const quantities = new Map<string, number>();
  
  meals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase();
      const currentQuantity = quantities.get(key) || 0;
      const amount = parseFloat(ingredient.amount) * (servings / meal.servings);
      quantities.set(key, currentQuantity + amount);
    });
  });
  
  return quantities;
};