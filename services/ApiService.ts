

class ApiService {
  private baseDelay = 500;

  private async delay(ms: number = this.baseDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getMeals(): Promise<any[]> {
    await this.delay();
    // In a real app, this would be an API call
    return [];
  }

  async searchRecipes(query: string): Promise<any[]> {
    await this.delay(300);
    // Mock search implementation
    return [];
  }

  async saveMealPlan(plan: any): Promise<boolean> {
    await this.delay();
    // Mock save implementation
    return true;
  }

  async getNutritionalInfo(ingredients: string[]): Promise<any> {
    await this.delay();
    // Mock nutrition API call
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }
}

export default new ApiService();