export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack' | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Low-Carb' | 'High-Protein';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  category?: string;
}

export interface PlannedMeal {
  id: string;
  mealId: string;
  mealType: MealType;
  scheduledTime: string;
  completed: boolean;
  customizations?: string[];
}

export interface MealPlan {
  id: string;
  date: Date;
  meals: PlannedMeal[];
  totalCalories: number;
  completed: boolean;
  notes?: string;
}

export interface WeeklyPlan {
  weekStart: Date;
  days: MealPlan[];
  totalCalories: number;
  groceryList: GroceryItem[];
}

export interface GroceryItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  category: string;
  purchased: boolean;
  mealIds: string[];
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  calorieTarget: number;
  preferredCuisines: string[];
  cookingTimeLimit: number;
  servings: number;
  mealTypes: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snack: boolean;
  };
  notifications: {
    mealReminders: boolean;
    groceryReminders: boolean;
    weeklyPlanning: boolean;
  };
}

export interface UserStats {
  totalMealsCooked: number;
  favoriteRecipes: number;
  weeklyCalories: number;
  cookingStreak: number;
  goals: UserGoal[];
}

export interface UserGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  completed: boolean;
}