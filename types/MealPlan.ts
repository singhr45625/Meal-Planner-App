import { MealType } from '../constants/Types';

export interface MealPlan {
  id: string;
  date: Date;
  meals: PlannedMeal[];
  totalCalories: number;
  completed: boolean;
  notes?: string;
}

export interface PlannedMeal {
  id: string;
  mealId: string;
  mealType: MealType;
  scheduledTime: string;
  completed: boolean;
  customizations?: string[];
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