import { UserPreferences, UserStats } from '../constants/Types';

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: UserPreferences;
  stats: UserStats;
  dailyCalorieTarget?: number;
  dietaryPreferences?: string[];
  mealsCooked?: number;
  cookingStreak?: number;
  favoriteRecipes?: string[];
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}