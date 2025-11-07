import { useState, useEffect, useCallback } from 'react';
import { MealPlan, PlannedMeal } from '../constants/Types';
import MealPlanService from '../services/MealPlanService';
import { format, startOfWeek, addDays } from 'date-fns';

export const useMealPlan = (initialDate: Date = new Date()) => {
  const [weeklyPlan, setWeeklyPlan] = useState<MealPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyPlan();
  }, [selectedDate]);

  const loadWeeklyPlan = useCallback(() => {
    setLoading(true);
    const plan = MealPlanService.getWeeklyPlan(selectedDate);
    setWeeklyPlan(plan);
    setLoading(false);
  }, [selectedDate]);

  const getDayPlan = useCallback((date: Date): MealPlan | undefined => {
    return weeklyPlan.find(plan => 
      format(plan.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  }, [weeklyPlan]);

  const addMealToPlan = useCallback((
    date: Date,
    mealId: string,
    mealType: any,
    scheduledTime: string
  ) => {
    const dayPlan = getDayPlan(date);
    if (dayPlan && dayPlan.id.startsWith('temp-')) {
      // Create new plan for this day
      MealPlanService.generateWeeklyPlan(date);
    }
    
    MealPlanService.addMealToPlan(
      dayPlan?.id || '',
      mealId,
      mealType,
      scheduledTime
    );
    loadWeeklyPlan();
  }, [getDayPlan, loadWeeklyPlan]);

  const removeMealFromPlan = useCallback((planId: string, mealId: string) => {
    MealPlanService.removeMealFromPlan(planId, mealId);
    loadWeeklyPlan();
  }, [loadWeeklyPlan]);

  const toggleMealCompletion = useCallback((planId: string, mealId: string) => {
    const plan = weeklyPlan.find(p => p.id === planId);
    if (plan) {
      const meal = plan.meals.find(m => m.id === mealId);
      if (meal) {
        meal.completed = !meal.completed;
        setWeeklyPlan([...weeklyPlan]);
      }
    }
  }, [weeklyPlan]);

  const goToPreviousWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 7));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  return {
    weeklyPlan,
    selectedDate,
    loading,
    getDayPlan,
    addMealToPlan,
    removeMealFromPlan,
    toggleMealCompletion,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    refresh: loadWeeklyPlan,
  };
};