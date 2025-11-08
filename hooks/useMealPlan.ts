import { useState, useEffect, useCallback } from 'react';
import { MealPlan, PlannedMeal } from '../constants/Types';
import MealPlanService from '../services/MealPlanService';
import { format, startOfWeek, addDays } from 'date-fns';

export const useMealPlan = (initialDate: Date = new Date()) => {
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);

  useEffect(() => {
    loadWeeklyPlan();
  }, [selectedDate]);

  const loadWeeklyPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading weekly plan for date:', format(selectedDate, 'yyyy-MM-dd'));
      
      const plan = await MealPlanService.getWeekPlan(selectedDate);
      console.log('✅ Weekly plan loaded:', plan.length, 'days');
      setWeeklyPlan(plan);
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
  }, [selectedDate]);

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
      console.log('🍽️ Adding meal:', {
        date: dateStr,
        mealId,
        mealType,
        scheduledTime
      });

      // Create the new meal object
      const newMeal: PlannedMeal = {
        id: `${mealType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mealId: mealId,
        mealType: mealType,
        scheduledTime: scheduledTime,
        completed: false
      };

      console.log('📝 New meal object:', newMeal);

      // UPDATE LOCAL STATE IMMEDIATELY using functional update
      setWeeklyPlan(prevWeeklyPlan => {
        console.log('🔄 Updating local state with new meal...');
        
        const updatedPlan = prevWeeklyPlan.map(plan => {
          const planDateStr = format(plan.date, 'yyyy-MM-dd');
          
          if (planDateStr === dateStr) {
            console.log('📅 Found matching plan for date:', planDateStr);
            console.log('📊 Current meals in plan:', plan.meals);

            // Check if meal type already exists
            const existingMealIndex = plan.meals.findIndex(
              meal => meal.mealType === mealType
            );

            const updatedMeals = [...plan.meals];
            
            if (existingMealIndex >= 0) {
              // Replace existing meal
              console.log('🔄 Replacing existing meal at index:', existingMealIndex);
              updatedMeals[existingMealIndex] = newMeal;
            } else {
              // Add new meal
              console.log('➕ Adding new meal to empty slot');
              updatedMeals.push(newMeal);
            }

            const updatedPlanItem = {
              ...plan,
              meals: updatedMeals,
              totalCalories: plan.totalCalories + 500 // Placeholder calories
            };

            console.log('✅ Updated plan item:', updatedPlanItem);
            return updatedPlanItem;
          }
          return plan;
        });

        console.log('🎯 Final updated weekly plan:', updatedPlan);
        return updatedPlan;
      });

      // Wait a bit to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Save to backend WITHOUT triggering a reload
      console.log('💾 Saving to backend...');
      await MealPlanService.addMealToPlan(date, mealId, mealType, scheduledTime);
      console.log('✅ Successfully saved to backend');

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add meal to plan';
      setError(errorMessage);
      console.error('❌ Failed to add meal to plan:', err);
      
      // Revert local state on error
      console.log('🔄 Reverting local state due to error');
      loadWeeklyPlan(); // Reload from backend to revert changes
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsAddingMeal(false);
    }
  }, [isAddingMeal, loadWeeklyPlan]);

  const removeMealFromPlan = useCallback(async (date: Date, mealType: string) => {
    try {
      setError(null);
      const dateStr = format(date, 'yyyy-MM-dd');
      console.log('🗑️ Removing meal:', { date: dateStr, mealType });

      // UPDATE LOCAL STATE IMMEDIATELY
      setWeeklyPlan(prevWeeklyPlan => {
        return prevWeeklyPlan.map(plan => {
          const planDateStr = format(plan.date, 'yyyy-MM-dd');
          if (planDateStr === dateStr) {
            const updatedMeals = plan.meals.filter(meal => meal.mealType !== mealType);
            console.log('✅ Removed meal locally, remaining meals:', updatedMeals.length);
            return {
              ...plan,
              meals: updatedMeals,
              totalCalories: Math.max(0, plan.totalCalories - 500)
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
      loadWeeklyPlan(); // Reload from backend on error
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [loadWeeklyPlan]);

  // ... rest of the hook remains the same ...

  const saveDayPlan = useCallback(async (planData: any) => {
    try {
      setError(null);
      await MealPlanService.saveDayPlan(planData);
      await loadWeeklyPlan();
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
  }, [loadWeeklyPlan]);

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

  // Helper to generate empty week plan
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