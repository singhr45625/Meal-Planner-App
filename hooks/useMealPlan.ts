import { useState, useEffect, useCallback } from 'react';
import { MealPlan, PlannedMeal } from '../constants/Types';
import MealPlanService from '../services/MealPlanService';
import { format, startOfWeek, addDays } from 'date-fns';
import { useMeals } from './useMeals';

export const useMealPlan = (initialDate: Date = new Date()) => {
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  
  // Get meals data to calculate actual calories
  const { meals } = useMeals();

  useEffect(() => {
    loadWeeklyPlan();
  }, [selectedDate]);

  // Calculate actual calories from meals
  const calculateTotalCalories = useCallback((plannedMeals: PlannedMeal[]): number => {
    let total = 0;
    
    plannedMeals.forEach(plannedMeal => {
      const mealDetails = meals.find(meal => meal.id === plannedMeal.mealId);
      if (mealDetails && mealDetails.calories) {
        total += mealDetails.calories;
      }
    });
    
    console.log('🔥 Calculated calories:', total, 'from', plannedMeals.length, 'meals');
    return total;
  }, [meals]);

  // Add meal validation helper
  const validateMealBeforeAdding = useCallback((mealId: string): boolean => {
    // Check if meal exists in local meals
    const mealExists = meals.some(meal => meal.id === mealId);
    
    // Check if it's a valid MongoDB ID format (if using real backend)
    const isValidFormat = mealId.match(/^[0-9a-fA-F]{24}$/) !== null;
    
    if (!mealExists) {
      console.warn('⚠️ Meal not found in local cache:', mealId);
      return false;
    }
    
    if (!isValidFormat) {
      console.warn('⚠️ Meal ID has invalid format:', mealId);
      return false;
    }
    
    return true;
  }, [meals]);

  const loadWeeklyPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading weekly plan for date:', format(selectedDate, 'yyyy-MM-dd'));
      
      const plan = await MealPlanService.getWeekPlan(selectedDate);
      console.log('✅ Weekly plan loaded:', plan.length, 'days');
      
      // Calculate actual calories for each day plan
      const planWithCalories = plan.map(dayPlan => ({
        ...dayPlan,
        totalCalories: calculateTotalCalories(dayPlan.meals)
      }));
      
      setWeeklyPlan(planWithCalories);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load meal plan';
      setError(errorMessage);
      console.error('❌ Failed to load meal plan:', err);
      
      // Set empty weekly plan as fallback
      const fallbackPlan = generateEmptyWeekPlan(selectedDate);
      setWeeklyPlan(fallbackPlan);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, calculateTotalCalories]);

  const getDayPlan = useCallback((date: Date): MealPlan | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return weeklyPlan.find(plan => 
      format(plan.date, 'yyyy-MM-dd') === dateStr
    );
  }, [weeklyPlan]);

  const addMealToPlan = useCallback(async (
    date: Date,
    mealId: string,
    mealType: any,
    scheduledTime: string = '12:00'
  ) => {
    // Prevent multiple simultaneous additions
    if (isAddingMeal) {
      console.log('⏳ Already adding a meal, please wait...');
      return { success: false, error: 'Already adding a meal' };
    }

    try {
      setIsAddingMeal(true);
      setError(null);
      
      const dateStr = format(date, 'yyyy-MM-dd');
      console.log('🚀 Starting to add meal:', {
        date: dateStr,
        mealId,
        mealType,
        scheduledTime
      });

      // Validate meal exists locally first
      if (!validateMealBeforeAdding(mealId)) {
        throw new Error('Selected meal not found or invalid. Please refresh your meals list.');
      }

      const mealDetails = meals.find(meal => meal.id === mealId);
      if (!mealDetails) {
        throw new Error('Selected meal not found. Please refresh your meals list.');
      }

      const mealCalories = mealDetails?.calories || 0;
      console.log('🍽️ Meal calories:', mealCalories);

      // Create the new meal object for immediate UI update
      const newMeal: PlannedMeal = {
        id: `${mealType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mealId: mealId,
        mealType: mealType,
        scheduledTime: scheduledTime,
        completed: false
      };

      console.log('📝 New meal object:', newMeal);

      // UPDATE LOCAL STATE IMMEDIATELY - WITH PROPER CALORIE CALCULATION
      setWeeklyPlan(prevWeeklyPlan => {
        const dateStr = format(date, 'yyyy-MM-dd');
        console.log('🔄 Updating local state with new meal...');
        
        let planFound = false;
        const updatedPlan = prevWeeklyPlan.map(plan => {
          const planDateStr = format(plan.date, 'yyyy-MM-dd');
          
          if (planDateStr === dateStr) {
            planFound = true;
            console.log('📅 Found matching plan for date:', planDateStr);
            
            // Check if meal type already exists
            const existingMealIndex = plan.meals.findIndex(
              meal => meal.mealType === mealType
            );

            const updatedMeals = [...plan.meals];
            
            if (existingMealIndex >= 0) {
              // Replace existing meal - calculate calorie difference
              const existingMeal = updatedMeals[existingMealIndex];
              const existingMealDetails = meals.find(meal => meal.id === existingMeal.mealId);
              const existingCalories = existingMealDetails?.calories || 0;
              
              console.log('🔄 Replacing existing meal at index:', existingMealIndex);
              console.log('🔥 Calorie change:', existingCalories, '->', mealCalories);
              
              updatedMeals[existingMealIndex] = newMeal;
              
              const updatedPlanItem = {
                ...plan,
                meals: updatedMeals,
                // Calculate actual total calories
                totalCalories: Math.max(0, plan.totalCalories - existingCalories + mealCalories)
              };

              console.log('✅ Updated plan item with calories:', updatedPlanItem.totalCalories);
              return updatedPlanItem;
            } else {
              // Add new meal
              console.log('➕ Adding new meal to empty slot');
              updatedMeals.push(newMeal);
              
              const updatedPlanItem = {
                ...plan,
                meals: updatedMeals,
                // Add actual meal calories
                totalCalories: plan.totalCalories + mealCalories
              };

              console.log('✅ Updated plan item with calories:', updatedPlanItem.totalCalories);
              return updatedPlanItem;
            }
          }
          return plan;
        });

        // If no plan found for this date, create one
        if (!planFound) {
          console.log('📭 No plan found for date, creating new one');
          const newPlan: MealPlan = {
            id: `temp-${date.getTime()}`,
            date: date,
            meals: [newMeal],
            // Use actual meal calories
            totalCalories: mealCalories,
            completed: false,
            notes: ''
          };
          updatedPlan.push(newPlan);
        }

        console.log('🎯 Final updated weekly plan:', updatedPlan);
        return updatedPlan;
      });

      // Wait for React state update to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Save to backend - BUT DON'T RELOAD DATA
      console.log('💾 Saving to backend...');
      await MealPlanService.addMealToPlan(date, mealId, mealType, scheduledTime);
      console.log('✅ Successfully saved to backend');

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add meal to plan';
      setError(errorMessage);
      console.error('❌ Failed to add meal to plan:', err);
      
      // Revert local state on error to stay in sync with backend
      console.log('🔄 Reverting local state due to backend error');
      await loadWeeklyPlan(); // Reload from server to sync state
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsAddingMeal(false);
    }
  }, [isAddingMeal, meals, validateMealBeforeAdding, loadWeeklyPlan]);

  const removeMealFromPlan = useCallback(async (date: Date, mealType: string) => {
    try {
      setError(null);
      const dateStr = format(date, 'yyyy-MM-dd');
      console.log('🗑️ Removing meal:', { date: dateStr, mealType });

      // UPDATE LOCAL STATE IMMEDIATELY WITH PROPER CALORIE CALCULATION
      setWeeklyPlan(prevWeeklyPlan => {
        return prevWeeklyPlan.map(plan => {
          const planDateStr = format(plan.date, 'yyyy-MM-dd');
          if (planDateStr === dateStr) {
            // Find the meal being removed to get its calories
            const mealToRemove = plan.meals.find(meal => meal.mealType === mealType);
            let caloriesToRemove = 0;
            
            if (mealToRemove) {
              const mealDetails = meals.find(meal => meal.id === mealToRemove.mealId);
              caloriesToRemove = mealDetails?.calories || 0;
              console.log('🔥 Removing calories:', caloriesToRemove);
            }
            
            const updatedMeals = plan.meals.filter(meal => meal.mealType !== mealType);
            console.log('✅ Removed meal locally, remaining meals:', updatedMeals.length);
            
            return {
              ...plan,
              meals: updatedMeals,
              // Subtract actual calories
              totalCalories: Math.max(0, plan.totalCalories - caloriesToRemove)
            };
          }
          return plan;
        });
      });

      // Save to backend
      await MealPlanService.removeMealFromPlan(date, mealType);
      console.log('✅ Successfully removed from backend');

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove meal from plan';
      setError(errorMessage);
      console.error('❌ Failed to remove meal from plan:', err);
      
      // Revert on error
      await loadWeeklyPlan();
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [meals, loadWeeklyPlan]);

  // Update calories when meals data changes
  useEffect(() => {
    if (weeklyPlan.length > 0 && meals.length > 0) {
      console.log('🔄 Recalculating calories based on updated meals data...');
      
      setWeeklyPlan(prevWeeklyPlan => {
        return prevWeeklyPlan.map(plan => ({
          ...plan,
          totalCalories: calculateTotalCalories(plan.meals)
        }));
      });
    }
  }, [meals, calculateTotalCalories]);

  const saveDayPlan = useCallback(async (planData: any) => {
    try {
      setError(null);
      await MealPlanService.saveDayPlan(planData);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save day plan';
      setError(errorMessage);
      console.error('Failed to save day plan:', err);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, []);

  const toggleMealCompletion = useCallback((planId: string, mealId: string) => {
    setWeeklyPlan(prevWeeklyPlan => {
      return prevWeeklyPlan.map(plan => {
        if (plan.id === planId) {
          const updatedMeals = plan.meals.map(meal => {
            if (meal.id === mealId) {
              return { ...meal, completed: !meal.completed };
            }
            return meal;
          });
          return { ...plan, meals: updatedMeals };
        }
        return plan;
      });
    });
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 7));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weeklyPlan,
    selectedDate,
    setSelectedDate,
    loading: loading || isAddingMeal,
    error,
    getDayPlan,
    addMealToPlan,
    removeMealFromPlan,
    saveDayPlan,
    toggleMealCompletion,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    refresh: loadWeeklyPlan,
    clearError,
  };
};

// Helper function to generate empty week plan
const generateEmptyWeekPlan = (startDate: Date): MealPlan[] => {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  const weekPlan: MealPlan[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    weekPlan.push({
      id: `empty-${date.getTime()}`,
      date,
      meals: [],
      totalCalories: 0,
      completed: false,
      notes: ''
    });
  }

  return weekPlan;
};