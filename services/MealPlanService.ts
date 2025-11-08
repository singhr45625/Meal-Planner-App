import ApiService from './ApiService';
import { MealPlan, PlannedMeal } from '../constants/Types';
import { format, startOfWeek, addDays } from 'date-fns';

class MealPlanService {
  // Store plans locally to handle API delays
  private localPlans: Map<string, MealPlan> = new Map();

  // Get day plan for specific date with better error handling
  async getDayPlan(date: Date): Promise<MealPlan | null> {
    const dateString = this.formatDate(date);
    
    // Check local cache first
    const localPlan = this.localPlans.get(dateString);
    if (localPlan) {
      console.log('Returning local cached plan for:', dateString);
      return localPlan;
    }

    try {
      console.log(`Fetching meal plan for date: ${dateString}`);
      
      const response = await ApiService.get(`/day-plans/date/${dateString}`);
      
      if (response.success && response.data) {
        console.log('Meal plan found from API:', response.data);
        const plan = this.mapToMealPlan(response.data);
        // Cache the plan
        this.localPlans.set(dateString, plan);
        return plan;
      }
      
      console.log('No meal plan found in API, creating empty plan');
      return this.createEmptyMealPlan(date);
    } catch (error: any) {
      // Check if it's a "No plan found" error
      if (error.message?.includes('No plan found') || 
          error.message?.includes('404') ||
          error.message?.includes('No plan found for this date')) {
        console.log('No existing meal plan in API, returning empty plan');
        return this.createEmptyMealPlan(date);
      }
      
      console.error('Failed to fetch day plan:', error);
      return this.createEmptyMealPlan(date);
    }
  }

  // Create or update day plan with better error handling
  async saveDayPlan(planData: any): Promise<MealPlan> {
    try {
      console.log('Saving day plan:', planData);
      const response = await ApiService.post('/day-plans', planData);
      
      if (response.success && response.data) {
        console.log('Day plan saved successfully:', response.data);
        const savedPlan = this.mapToMealPlan(response.data);
        
        // Update local cache
        const dateString = this.formatDate(savedPlan.date);
        this.localPlans.set(dateString, savedPlan);
        
        return savedPlan;
      }
      
      throw new Error(response.message || 'Failed to save day plan');
    } catch (error: any) {
      console.error('Failed to save day plan to API:', error);
      
      // If saving fails, create a local plan and cache it
      const fallbackPlan = this.createLocalPlan(planData);
      const dateString = this.formatDate(fallbackPlan.date);
      this.localPlans.set(dateString, fallbackPlan);
      
      console.log('Using locally cached plan due to API error');
      return fallbackPlan;
    }
  }

  // Add meal to plan with immediate UI update
  async addMealToPlan(
    date: Date,
    mealId: string,
    mealType: string,
    scheduledTime: string = '12:00'
  ): Promise<MealPlan> {
    try {
      console.log(`Adding meal ${mealId} to ${mealType} on ${this.formatDate(date)}`);
      
      // First get existing plan or create empty one
      let existingPlan = await this.getDayPlan(date);
      
      // Create the planned meal object
      const plannedMeal: PlannedMeal = {
        id: `${mealType}-${Date.now()}`,
        mealId: mealId,
        mealType: mealType as any,
        scheduledTime: scheduledTime,
        completed: false
      };

      // If no existing plan, create one with the new meal
      if (!existingPlan) {
        existingPlan = this.createEmptyMealPlan(date);
      }

      // Add the new meal to the plan (avoid duplicates)
      const existingMealIndex = existingPlan.meals.findIndex(
        meal => meal.mealType === mealType
      );

      if (existingMealIndex >= 0) {
        // Replace existing meal of same type
        existingPlan.meals[existingMealIndex] = plannedMeal;
      } else {
        // Add new meal
        existingPlan.meals.push(plannedMeal);
      }

      // Update total calories (you might want to calculate this based on actual meal data)
      existingPlan.totalCalories = existingPlan.meals.reduce((total, meal) => {
        // You would need to fetch meal details to get actual calories
        return total + 500; // Placeholder
      }, 0);

      const planData = {
        date: this.formatDate(date),
        meals: existingPlan.meals.reduce((acc, meal) => {
          acc[meal.mealType] = meal.mealId;
          return acc;
        }, {} as any),
        notes: existingPlan.notes || `Added ${mealType} meal`,
        totalCalories: existingPlan.totalCalories
      };

      // Save to backend and update local cache
      const savedPlan = await this.saveDayPlan(planData);
      
      // Also update local cache immediately
      const dateString = this.formatDate(date);
      this.localPlans.set(dateString, savedPlan);

      return savedPlan;
    } catch (error) {
      console.error('Failed to add meal to plan:', error);
      throw error;
    }
  }

  // Remove meal from plan
  async removeMealFromPlan(date: Date, mealType: string): Promise<MealPlan> {
    try {
      console.log(`Removing ${mealType} from plan on ${this.formatDate(date)}`);
      
      const existingPlan = await this.getDayPlan(date);
      if (!existingPlan) {
        console.log('No plan found to remove meal from');
        throw new Error('No plan found for this date');
      }

      // Filter out the meal to remove
      const updatedMeals = existingPlan.meals.filter(meal => meal.mealType !== mealType);

      const planData = {
        date: this.formatDate(date),
        meals: updatedMeals.reduce((acc, meal) => {
          acc[meal.mealType] = meal.mealId;
          return acc;
        }, {} as any),
        notes: existingPlan.notes,
        totalCalories: updatedMeals.reduce((total, meal) => total + 500, 0) // Placeholder
      };

      const savedPlan = await this.saveDayPlan(planData);
      
      // Update local cache
      const dateString = this.formatDate(date);
      this.localPlans.set(dateString, savedPlan);

      return savedPlan;
    } catch (error) {
      console.error('Failed to remove meal from plan:', error);
      throw error;
    }
  }

  // Helper to create a local plan from plan data
  private createLocalPlan(planData: any): MealPlan {
    const meals: PlannedMeal[] = [];
    
    if (planData.meals) {
      Object.entries(planData.meals).forEach(([mealType, mealId]: [string, any]) => {
        if (mealId) {
          meals.push({
            id: `${mealType}-${Date.now()}`,
            mealId: mealId,
            mealType: mealType as any,
            scheduledTime: this.getDefaultTimeForMealType(mealType),
            completed: false,
          });
        }
      });
    }

    return {
      id: `local-${Date.now()}`,
      date: new Date(planData.date),
      meals,
      totalCalories: planData.totalCalories || 0,
      completed: false,
      notes: planData.notes || '',
    };
  }

  // Get meal plan by date (alias for getDayPlan)
  async getMealPlanByDate(date: Date): Promise<MealPlan | null> {
    return this.getDayPlan(date);
  }

  // Get all meal plans (for local storage fallback)
  getAllMealPlans(): MealPlan[] {
    return Array.from(this.localPlans.values());
  }

  // Get week plan
  async getWeekPlan(startDate: Date): Promise<MealPlan[]> {
    try {
      const dateString = this.formatDate(startDate);
      console.log(`Fetching week plan starting from: ${dateString}`);
      
      const response = await ApiService.get(`/day-plans/week/${dateString}`);
      
      if (response.success && response.data) {
        console.log('Week plan data received:', response.data);
        const weekPlans = response.data.map((dayData: any) => {
          if (dayData.plan) {
            const plan = this.mapToMealPlan(dayData.plan);
            // Cache each plan
            this.localPlans.set(this.formatDate(plan.date), plan);
            return plan;
          } else {
            return this.createEmptyMealPlan(new Date(dayData.date));
          }
        });
        return weekPlans;
      }
      
      return this.generateEmptyWeekPlan(startDate);
    } catch (error) {
      console.error('Failed to fetch week plan, using fallback:', error);
      return this.generateEmptyWeekPlan(startDate);
    }
  }

  // Clear local cache (useful for logout)
  clearLocalCache(): void {
    this.localPlans.clear();
  }

  // Helper to format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Map backend day plan to frontend MealPlan
  private mapToMealPlan(data: any): MealPlan {
    const meals: PlannedMeal[] = [];
    
    if (data.meals) {
      Object.entries(data.meals).forEach(([mealType, mealData]: [string, any]) => {
        if (mealData && mealData._id) {
          meals.push({
            id: `${mealType}-${data._id || data.id}`,
            mealId: mealData._id,
            mealType: mealType as any,
            scheduledTime: this.getDefaultTimeForMealType(mealType),
            completed: false,
          });
        }
      });
    }

    return {
      id: data._id || data.id || `plan-${Date.now()}`,
      date: new Date(data.date),
      meals,
      totalCalories: data.totalCalories || 0,
      completed: data.completed || false,
      notes: data.notes || '',
    };
  }

  // Helper method to create an empty meal plan for a date
  private createEmptyMealPlan(date: Date): MealPlan {
    return {
      id: `temp-${date.getTime()}`,
      date,
      meals: [],
      totalCalories: 0,
      completed: false,
      notes: '',
    };
  }

  // Generate empty week plan
  private generateEmptyWeekPlan(startDate: Date): MealPlan[] {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const weekPlan: MealPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      weekPlan.push(this.createEmptyMealPlan(date));
    }

    return weekPlan;
  }

  // Get default time for meal type
  private getDefaultTimeForMealType(mealType: string): string {
    const times: { [key: string]: string } = {
      breakfast: '08:00',
      lunch: '12:00',
      dinner: '18:00',
      snack: '15:00'
    };
    return times[mealType] || '12:00';
  }
}

export default new MealPlanService();