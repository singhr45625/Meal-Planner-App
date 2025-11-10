import ApiService from './ApiService';
import { MealModel } from '../types/Meal';
import { MealCategory, Difficulty, Ingredient } from '../constants/Types';

class MealService {
  // Get all meals for current user
  async getMeals(): Promise<MealModel[]> {
    try {
      const response = await ApiService.get('/meals');
      console.log('Meals response:', response);
      
      if (response.success && response.data) {
        return response.data.map((meal: any) => this.mapToMealModel(meal));
      } else {
        // Fallback to sample data if API fails
        console.log('Using fallback meals data');
        return this.getSampleMeals();
      }
    } catch (error) {
      console.error('Failed to fetch meals, using fallback:', error);
      return this.getSampleMeals();
    }
  }

  // Get meal by ID
  async getMealById(id: string): Promise<MealModel | null> {
    try {
      const response = await ApiService.get(`/meals/${id}`);
      if (response.success && response.data) {
        return this.mapToMealModel(response.data);
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch meal:', error);
      // Try to find in sample data
      const sampleMeals = this.getSampleMeals();
      return sampleMeals.find(meal => meal.id === id) || null;
    }
  }

  // Create new meal - FIXED: Map frontend data to backend format
  async createMeal(mealData: any): Promise<MealModel> {
    try {
      // Map frontend field names to backend field names
      const backendMealData = this.mapToBackendFormat(mealData);
      
      console.log('Sending meal data to backend:', backendMealData);
      const response = await ApiService.post('/meals', backendMealData);
      
      if (response.success) {
        return this.mapToMealModel(response.data);
      }
      throw new Error(response.message || 'Failed to create meal');
    } catch (error) {
      console.error('Failed to create meal:', error);
      throw error;
    }
  }

  // Update meal - FIXED: Map frontend data to backend format
  async updateMeal(id: string, updates: any): Promise<MealModel> {
    try {
      const backendUpdates = this.mapToBackendFormat(updates);
      const response = await ApiService.put(`/meals/${id}`, backendUpdates);
      
      if (response.success) {
        return this.mapToMealModel(response.data);
      }
      throw new Error(response.message || 'Failed to update meal');
    } catch (error) {
      console.error('Failed to update meal:', error);
      throw error;
    }
  }

  // Delete meal
  async deleteMeal(id: string): Promise<void> {
    try {
      const response = await ApiService.delete(`/meals/${id}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete meal');
      }
    } catch (error) {
      console.error('Failed to delete meal:', error);
      throw error;
    }
  }

  // Search meals
  async searchMeals(query: string): Promise<MealModel[]> {
    try {
      const allMeals = await this.getMeals();
      const lowerQuery = query.toLowerCase();
      
      return allMeals.filter(meal => 
        meal.title.toLowerCase().includes(lowerQuery) ||
        meal.description.toLowerCase().includes(lowerQuery) ||
        meal.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        meal.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(lowerQuery)
        )
      );
    } catch (error) {
      console.error('Failed to search meals:', error);
      throw error;
    }
  }

  // Toggle favorite
  async toggleFavorite(id: string): Promise<boolean> {
    try {
      // This is a client-side only operation for now
      // You can implement backend favorite tracking later
      console.log('Toggle favorite for meal:', id);
      return true;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  // FIXED: Improved backend format mapping
  private mapToBackendFormat(mealData: any): any {
    console.log('Mapping frontend data to backend format:', mealData);
    
    // DEBUG: Log all incoming fields
    console.log('DEBUG - Incoming mealData fields:', {
      title: mealData.title,
      name: mealData.name,
      category: mealData.category,
      type: mealData.type,
      description: mealData.description,
      instructions: mealData.instructions,
      recipe: mealData.recipe,
      cookingTime: mealData.cookingTime,
      prepTime: mealData.prepTime,
      ingredients: mealData.ingredients,
      difficulty: mealData.difficulty,
      calories: mealData.calories,
      servings: mealData.servings,
      image: mealData.image,
      isPublic: mealData.isPublic
    });

    // Parse instructions - handle both string and array formats
    let recipeInstructions = '';
    if (mealData.recipe) {
      recipeInstructions = mealData.recipe;
    } else if (Array.isArray(mealData.instructions)) {
      recipeInstructions = mealData.instructions
        .filter((step: string) => step && step.trim())
        .join('\n');
    }

    // Parse ingredients - ensure proper format
    const ingredients = Array.isArray(mealData.ingredients)
      ? mealData.ingredients
          .filter((ing: any) => (ing.ingredient || ing.name) && (ing.quantity || ing.amount))
          .map((ing: any) => ({
            ingredient: ing.ingredient || ing.name || '',
            quantity: ing.quantity || ing.amount || '',
            unit: ing.unit || ''
          }))
      : [];

    // FIXED: Use the correct field mapping based on what CreateRecipeScreen sends
    const backendData = {
      name: mealData.name || mealData.title || 'Untitled Meal',
      type: (mealData.type || mealData.category?.toLowerCase() || 'dinner').toLowerCase(),
      description: mealData.description || '',
      recipe: recipeInstructions,
      ingredients: ingredients,
      prepTime: parseInt(mealData.prepTime || mealData.cookingTime || '30') || 30,
      difficulty: (mealData.difficulty || 'medium').toLowerCase(),
      calories: parseInt(mealData.calories || '0') || 0,
      servings: parseInt(mealData.servings || '1') || 1,
      image: mealData.image || '',
      isPublic: Boolean(mealData.isPublic),
    };

    console.log('Mapped backend data:', backendData);
    return backendData;
  }

  // Map backend meal data to frontend MealModel - FIXED
  private mapToMealModel(data: any): MealModel {
    // Parse ingredients from backend format
    let ingredients: Ingredient[] = [];
    if (Array.isArray(data.ingredients)) {
      ingredients = data.ingredients.map((ing: any, index: number) => ({
        id: ing._id || ing.id || `ing-${index}`,
        name: ing.ingredient?.name || ing.ingredient || ing.name || 'Unknown Ingredient',
        amount: ing.quantity?.toString() || ing.amount?.toString() || '1',
        unit: ing.unit || '',
        category: ing.category || ''
      }));
    }

    // Parse instructions from backend format
    let instructions: string[] = [];
    if (Array.isArray(data.instructions)) {
      instructions = data.instructions.filter((step: string) => step && step.trim());
    } else if (data.recipe) {
      instructions = data.recipe.split('\n').filter((step: string) => step.trim());
    } else {
      instructions = ['No instructions available'];
    }

    // Parse category and difficulty
    const category = this.mapCategory(data.type || data.category);
    const difficulty = this.mapDifficulty(data.difficulty);

    // Calculate nutrition per serving
    const calculateNutritionPerServing = () => {
      return {
        calories: Math.round((data.calories || 0) / (data.servings || 1)),
        protein: 0, // You can add these fields if available
        carbs: 0,
        fat: 0
      };
    };

    // Create MealModel instance with proper parameters
    const mealModel = new MealModel(
      data._id || data.id || `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data.name || data.title || 'Untitled Meal',
      data.description || 'No description available',
      category,
      ingredients,
      instructions,
      data.prepTime || data.cookingTime || 30,
      difficulty,
      data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      data.calories || 500,
      data.servings || 2,
      data.isFavorite || false,
      data.rating || 4.5,
      data.tags || this.generateTagsFromCategory(category),
      data.createdAt ? new Date(data.createdAt) : new Date()
    );

    // Add the calculateNutritionPerServing method
    mealModel.calculateNutritionPerServing = calculateNutritionPerServing;

    return mealModel;
  }

  // Helper to map backend category to MealCategory
  private mapCategory(category: string): MealCategory {
    const categoryMap: { [key: string]: MealCategory } = {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'dinner': 'Dinner',
      'dessert': 'Dessert',
      'snack': 'Snack',
      'vegetarian': 'Vegetarian',
      'vegan': 'Vegan',
      'gluten-free': 'Gluten-Free',
      'dairy-free': 'Dairy-Free',
      'low-carb': 'Low-Carb',
      'high-protein': 'High-Protein'
    };
    
    const normalizedCategory = (category || '').toLowerCase();
    return categoryMap[normalizedCategory] || 'Dinner';
  }

  // Helper to map backend difficulty
  private mapDifficulty(difficulty: string): Difficulty {
    const difficultyMap: { [key: string]: Difficulty } = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard',
      'beginner': 'Easy',
      'intermediate': 'Medium',
      'advanced': 'Hard'
    };
    
    const normalizedDifficulty = (difficulty || '').toLowerCase();
    return difficultyMap[normalizedDifficulty] || 'Medium';
  }

  // Generate tags based on category
  private generateTagsFromCategory(category: MealCategory): string[] {
    const tagMap: { [key: string]: string[] } = {
      'Breakfast': ['Quick', 'Morning', 'Healthy'],
      'Lunch': ['Light', 'Fresh', 'Balanced'],
      'Dinner': ['Hearty', 'Family', 'Comfort'],
      'Dessert': ['Sweet', 'Treat', 'Indulgent'],
      'Snack': ['Quick', 'Light', 'Energy'],
      'Vegetarian': ['Plant-based', 'Healthy', 'Green'],
      'Vegan': ['Plant-based', 'Healthy', 'Dairy-free'],
      'Gluten-Free': ['Allergy-friendly', 'Healthy'],
      'Dairy-Free': ['Allergy-friendly', 'Healthy'],
      'Low-Carb': ['Keto', 'Healthy', 'Weight-loss'],
      'High-Protein': ['Muscle-building', 'Filling', 'Healthy']
    };
    
    return tagMap[category] || [category];
  }

  // Sample data for fallback
  private getSampleMeals(): MealModel[] {
    const sampleMeals = [
      new MealModel(
        '1',
        'Avocado Toast with Poached Eggs',
        'Creamy avocado on whole grain toast topped with perfectly poached eggs',
        'Breakfast',
        [
          { id: '1', name: 'Avocado', amount: '1', unit: 'piece' },
          { id: '2', name: 'Whole grain bread', amount: '2', unit: 'slices' },
          { id: '3', name: 'Eggs', amount: '2', unit: 'pieces' },
        ],
        ['Toast the bread until golden', 'Mash avocado with salt and pepper', 'Poach eggs for 3-4 minutes', 'Assemble and serve'],
        15,
        'Easy',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
        350,
        2,
        false,
        4.5,
        ['Healthy', 'Quick', 'Vegetarian']
      ),
      new MealModel(
        '2',
        'Grilled Chicken Salad',
        'Fresh mixed greens with grilled chicken, vegetables, and light vinaigrette',
        'Lunch',
        [
          { id: '4', name: 'Chicken breast', amount: '200', unit: 'g' },
          { id: '5', name: 'Mixed greens', amount: '100', unit: 'g' },
          { id: '6', name: 'Cherry tomatoes', amount: '100', unit: 'g' },
        ],
        ['Grill chicken until cooked through', 'Chop vegetables', 'Mix dressing', 'Combine all ingredients'],
        20,
        'Easy',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        450,
        2,
        true,
        4.2,
        ['High-protein', 'Low-carb', 'Healthy']
      )
    ];

    // Add calculateNutritionPerServing method to sample meals
    sampleMeals.forEach(meal => {
      meal.calculateNutritionPerServing = () => ({
        calories: Math.round(meal.calories / meal.servings),
        protein: 0,
        carbs: 0,
        fat: 0
      });
    });

    return sampleMeals;
  }

  // Get available categories
  getCategories(): string[] {
    return ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein'];
  }

  // Get available difficulties
  getDifficulties(): string[] {
    return ['Easy', 'Medium', 'Hard'];
  }

  // Get meals by category
  async getMealsByCategory(category: string): Promise<MealModel[]> {
    try {
      const allMeals = await this.getMeals();
      return allMeals.filter(meal => 
        meal.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Failed to get meals by category:', error);
      throw error;
    }
  }

  // Get favorite meals
  async getFavoriteMeals(): Promise<MealModel[]> {
    try {
      const allMeals = await this.getMeals();
      return allMeals.filter(meal => meal.isFavorite);
    } catch (error) {
      console.error('Failed to get favorite meals:', error);
      throw error;
    }
  }

  // Get recent meals
  async getRecentMeals(limit: number = 10): Promise<MealModel[]> {
    try {
      const allMeals = await this.getMeals();
      return allMeals
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent meals:', error);
      throw error;
    }
  }
}

export const mealService = new MealService();
export default mealService;