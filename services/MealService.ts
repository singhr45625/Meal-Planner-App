import { mockMeals } from '../constants/MockData';
import { Difficulty, Meal, MealCategory } from '../constants/Types';
import { MealModel } from '../types/Meal';

export class MealService {
  private meals: MealModel[] = [...mockMeals];
  private nextId = 100;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    // Data is already loaded from mockMeals
  }

  addMeal(mealData: Omit<Meal, 'id' | 'isFavorite' | 'rating' | 'createdAt'>): MealModel {
    const newMeal = new MealModel(
      (this.nextId++).toString(),
      mealData.title,
      mealData.description,
      mealData.category,
      mealData.ingredients,
      mealData.instructions,
      mealData.cookingTime,
      mealData.difficulty,
      mealData.image,
      mealData.calories,
      mealData.servings,
      false,
      0,
      mealData.tags || []
    );
    this.meals.push(newMeal);
    return newMeal;
  }

  getAllMeals(): MealModel[] {
    return this.meals;
  }

  getMealById(id: string): MealModel | undefined {
    return this.meals.find(meal => meal.id === id);
  }

  getMealsByCategory(category: MealCategory): MealModel[] {
    return this.meals.filter(meal => meal.category === category);
  }

  getFavoriteMeals(): MealModel[] {
    return this.meals.filter(meal => meal.isFavorite);
  }

  searchMeals(query: string): MealModel[] {
    const lowerQuery = query.toLowerCase();
    return this.meals.filter(meal => 
      meal.title.toLowerCase().includes(lowerQuery) ||
      meal.description.toLowerCase().includes(lowerQuery) ||
      meal.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(lowerQuery)) ||
      meal.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  toggleFavorite(id: string): boolean {
    const meal = this.getMealById(id);
    if (meal) {
      return meal.toggleFavorite();
    }
    return false;
  }

  getCategories(): MealCategory[] {
    return ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegetarian', 'Vegan'];
  }

  getDifficulties(): Difficulty[] {
    return ['Easy', 'Medium', 'Hard'];
  }

  deleteMeal(id: string): void {
    this.meals = this.meals.filter(meal => meal.id !== id);
  }

  updateMeal(id: string, updates: Partial<Meal>): MealModel | undefined {
    const meal = this.getMealById(id);
    if (meal) {
      Object.assign(meal, updates);
      return meal;
    }
    return undefined;
  }
}

// Create and export a singleton instance
export const mealService = new MealService();
export default mealService;