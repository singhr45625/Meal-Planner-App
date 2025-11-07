import { Ingredient, MealCategory, Difficulty } from '../constants/Types';

export class MealModel {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public category: MealCategory,
    public ingredients: Ingredient[],
    public instructions: string[],
    public cookingTime: number,
    public difficulty: Difficulty,
    public image: string,
    public calories: number,
    public servings: number,
    public isFavorite: boolean = false,
    public rating: number = 0,
    public tags: string[] = [],
    public createdAt: Date = new Date()
  ) {}

  toggleFavorite(): boolean {
    this.isFavorite = !this.isFavorite;
    return this.isFavorite;
  }

  getFormattedCookingTime(): string {
    if (this.cookingTime < 60) {
      return `${this.cookingTime}min`;
    } else {
      const hours = Math.floor(this.cookingTime / 60);
      const minutes = this.cookingTime % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  }

  calculateNutritionPerServing() {
    return {
      calories: Math.round(this.calories / this.servings),
      protein: 0, // You can add more nutrition fields
      carbs: 0,
      fat: 0,
    };
  }
}