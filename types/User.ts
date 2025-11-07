export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: UserPreferences;
  stats: UserStats;
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