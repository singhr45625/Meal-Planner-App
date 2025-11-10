import ApiService from './ApiService';
import { MealPlan, PlannedMeal } from '../constants/Types';
import { format, startOfWeek, addDays } from 'date-fns';

class MealPlanService {
  private localPlans: Map<string, MealPlan> = new Map();

  // Get day plan - FIXED to match your backend response
  async getDayPlan(date: Date): Promise<MealPlan> {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check local cache first
    const localPlan = this.localPlans.get(dateString);
    if (localPlan) {
      console.log('📦 Returning cached plan for:', dateString);
      return localPlan;
    }

    try {
      console.log(`🌐 Fetching day plan for: ${dateString}`);
      
      const response = await ApiService.get(`/day-plans/date/${dateString}`);
      console.log('📥 API Response:', response);
      
      // Your backend returns { success: true, data: dayPlan }
      if (response && response.success && response.data) {
        console.log('✅ Day plan found in API');
        const plan = this.mapApiToMealPlan(response.data);
        this.localPlans.set(dateString, plan);
        return plan;
      }
      
      console.log('📭 No day plan found in API');
      return this.createEmptyMealPlan(date);
    } catch (error: any) {
      // Handle 404 as "no plan exists"
      if (error.status === 404 || error.message?.includes('404')) {
        console.log('📭 No day plan exists (404)');
        return this.createEmptyMealPlan(date);
      }
      
      console.error('❌ Error fetching day plan:', error);
      return this.createEmptyMealPlan(date);
    }
  }

  // Save day plan - UPDATED with meal validation
  async saveDayPlan(planData: any): Promise<any> {
    try {
      console.log('💾 Saving day plan:', planData);
      
      // VALIDATE MEAL IDs BEFORE SENDING
      const validatedData = {
        date: planData.date,
        breakfast: await this.validateMealId(this.getMealIdByType(planData.meals, 'breakfast')),
        lunch: await this.validateMealId(this.getMealIdByType(planData.meals, 'lunch')),
        dinner: await this.validateMealId(this.getMealIdByType(planData.meals, 'dinner')),
        notes: planData.notes || ''
      };

      console.log('📤 Validated backend data:', validatedData);

      let response;
      if (planData.id && planData.id.startsWith('temp-')) {
        console.log('🆕 Creating new day plan');
        response = await ApiService.post('/day-plans', validatedData);
      } else {
        console.log('📝 Updating existing day plan:', planData.id);
        response = await ApiService.put(`/day-plans/${planData.id}`, validatedData);
      }
      
      console.log('✅ Day plan saved successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Failed to save day plan:', error);
      
      // Handle specific meal not found error
      if (error.message?.includes('One or more meals not found')) {
        throw new Error('One or more selected meals were not found. Please refresh your meals and try again.');
      }
      
      throw error;
    }
  }

  // Add meal validation method
  private async validateMealId(mealId: string | null): Promise<string | null> {
    if (!mealId) return null;
    
    // Check if it's a temporary ID (from local creation)
    if (mealId.startsWith('temp-') || mealId.startsWith('breakfast-') || 
        mealId.startsWith('lunch-') || mealId.startsWith('dinner-')) {
      console.warn('⚠️ Temporary meal ID detected:', mealId);
      return null;
    }
    
    // Basic validation - check if it looks like a MongoDB ID
    if (!mealId.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn('⚠️ Invalid meal ID format:', mealId);
      return null;
    }
    
    return mealId;
  }

  // Add meal to plan - UPDATED with validation
  async addMealToPlan(
    date: Date,
    mealId: string,
    mealType: string,
    scheduledTime: string = '12:00'
  ): Promise<any> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      console.log(`🍽️ Adding meal:`, { date: dateString, mealId, mealType });

      // Validate meal ID before proceeding
      const validatedMealId = await this.validateMealId(mealId);
      if (!validatedMealId) {
        throw new Error('Invalid meal ID. Please select a valid meal.');
      }

      // Get existing plan or create empty one
      let existingPlan = await this.getDayPlan(date);
      console.log('📋 Existing plan:', existingPlan);

      // Create planned meal object for frontend
      const plannedMeal: PlannedMeal = {
        id: `${mealType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mealId: validatedMealId, // Use validated ID
        mealType: mealType as any,
        scheduledTime: scheduledTime,
        completed: false
      };

      // Update meals array
      const existingMealIndex = existingPlan.meals.findIndex(
        meal => meal.mealType === mealType
      );

      const updatedMeals = [...existingPlan.meals];
      if (existingMealIndex >= 0) {
        updatedMeals[existingMealIndex] = plannedMeal;
        console.log('🔄 Replaced existing', mealType);
      } else {
        updatedMeals.push(plannedMeal);
        console.log('➕ Added new', mealType);
      }

      // Prepare data for backend
      const planData = {
        id: existingPlan.id,
        date: dateString,
        meals: updatedMeals,
        totalCalories: updatedMeals.length * 500, // Placeholder
        notes: existingPlan.notes || `Added ${mealType} meal`
      };

      console.log('💾 Saving to backend...');
      const result = await this.saveDayPlan(planData);
      
      // Update local cache
      const updatedPlan: MealPlan = {
        ...existingPlan,
        meals: updatedMeals,
        totalCalories: planData.totalCalories
      };
      this.localPlans.set(dateString, updatedPlan);

      console.log('✅ Meal added successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to add meal:', error);
      throw error;
    }
  }

  // Remove meal from plan
  async removeMealFromPlan(date: Date, mealType: string): Promise<any> {
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      console.log(`🗑️ Removing meal:`, { date: dateString, mealType });

      const existingPlan = await this.getDayPlan(date);
      
      // Filter out the meal
      const updatedMeals = existingPlan.meals.filter(meal => meal.mealType !== mealType);

      const planData = {
        id: existingPlan.id,
        date: dateString,
        meals: updatedMeals,
        totalCalories: updatedMeals.length * 500,
        notes: existingPlan.notes
      };

      console.log('💾 Saving after removal...');
      const result = await this.saveDayPlan(planData);
      
      // Update local cache
      const updatedPlan: MealPlan = {
        ...existingPlan,
        meals: updatedMeals,
        totalCalories: planData.totalCalories
      };
      this.localPlans.set(dateString, updatedPlan);

      console.log('✅ Meal removed successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to remove meal:', error);
      throw error;
    }
  }

  // Get week plan
  async getWeekPlan(startDate: Date): Promise<MealPlan[]> {
    try {
      const dateString = format(startDate, 'yyyy-MM-dd');
      console.log(`📅 Fetching week plan starting: ${dateString}`);
      
      const response = await ApiService.get(`/day-plans/week/${dateString}`);
      console.log('📦 Week plan response:', response);
      
      if (response && response.success && response.data) {
        // Your backend returns array of { date, plan, totalCalories }
        const weekPlans: MealPlan[] = response.data.map((dayData: any) => {
          if (dayData.plan) {
            const plan = this.mapApiToMealPlan(dayData.plan);
            // Cache each plan
            this.localPlans.set(format(plan.date, 'yyyy-MM-dd'), plan);
            return plan;
          } else {
            return this.createEmptyMealPlan(new Date(dayData.date));
          }
        });
        
        console.log('✅ Week plan loaded:', weekPlans.length, 'days');
        return weekPlans;
      }
      
      console.log('📭 No week plan data, using fallback');
      return this.generateEmptyWeekPlan(startDate);
    } catch (error) {
      console.error('❌ Failed to fetch week plan:', error);
      return this.generateEmptyWeekPlan(startDate);
    }
  }

  // Helper to get meal ID by type from frontend meals array
  private getMealIdByType(meals: PlannedMeal[], mealType: string): string | null {
    const meal = meals.find(m => m.mealType === mealType);
    return meal ? meal.mealId : null;
  }

  // Map backend API response to frontend format
  private mapApiToMealPlan(apiData: any): MealPlan {
    console.log('🔄 Mapping API data:', apiData);
    
    const meals: PlannedMeal[] = [];
    
    // Your backend has meals as object with breakfast, lunch, dinner
    if (apiData.meals) {
      if (apiData.meals.breakfast && apiData.meals.breakfast._id) {
        meals.push({
          id: `breakfast-${apiData._id}`,
          mealId: apiData.meals.breakfast._id,
          mealType: 'breakfast',
          scheduledTime: '08:00',
          completed: false
        });
      }
      
      if (apiData.meals.lunch && apiData.meals.lunch._id) {
        meals.push({
          id: `lunch-${apiData._id}`,
          mealId: apiData.meals.lunch._id,
          mealType: 'lunch',
          scheduledTime: '12:00',
          completed: false
        });
      }
      
      if (apiData.meals.dinner && apiData.meals.dinner._id) {
        meals.push({
          id: `dinner-${apiData._id}`,
          mealId: apiData.meals.dinner._id,
          mealType: 'dinner',
          scheduledTime: '18:00',
          completed: false
        });
      }
    }

    const mealPlan: MealPlan = {
      id: apiData._id,
      date: new Date(apiData.date),
      meals: meals,
      totalCalories: apiData.totalCalories || 0,
      completed: false,
      notes: apiData.notes || ''
    };

    console.log('✅ Mapped to frontend. Meals:', meals.length);
    return mealPlan;
  }

  // Create empty meal plan
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

  // Clear local cache
  clearLocalCache(): void {
    this.localPlans.clear();
  }
}

export default new MealPlanService();