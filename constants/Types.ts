export interface Meal {
  id: string;
  title: string;
  description: string;
  category: MealCategory;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  difficulty: Difficulty;
  image: string;
  calories: number;
  servings: number;
  isFavorite: boolean;
  rating: number;
  tags: string[];
  createdAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface MealPlan {
  id: string;
  date: Date;
  meals: PlannedMeal[];
  totalCalories: number;
  completed: boolean;
}

export interface PlannedMeal {
  id: string;
  mealId: string;
  mealType: MealType;
  scheduledTime: string;
  completed: boolean;
}

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack' | 'Vegetarian' | 'Vegan';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserPreferences {
  dietaryRestrictions: string[];
  calorieTarget: number;
  preferredCuisines: string[];
  cookingTimeLimit: number;
  servings: number;
}