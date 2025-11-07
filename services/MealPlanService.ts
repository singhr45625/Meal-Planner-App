import { addDays, isSameDay, startOfWeek } from 'date-fns';
import { MealPlan, MealType, PlannedMeal } from '../constants/Types';

class MealPlanService {
  private mealPlans: MealPlan[] = [];
  private nextId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    // Create sample meal plans for the current week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const meals: PlannedMeal[] = [];
      
      // Add some sample meals for today
      if (isSameDay(date, today)) {
        meals.push({
          id: '1',
          mealId: '1', // Avocado Toast
          mealType: 'breakfast',
          scheduledTime: '08:00',
          completed: false,
        });
        meals.push({
          id: '2',
          mealId: '2', // Greek Salad
          mealType: 'lunch',
          scheduledTime: '13:00',
          completed: false,
        });
      }

      const mealPlan: MealPlan = {
        id: (this.nextId++).toString(),
        date,
        meals,
        totalCalories: meals.length * 450,
        completed: false,
      };
      
      this.mealPlans.push(mealPlan);
    }
  }

  generateWeeklyPlan(startDate: Date = new Date()): MealPlan[] {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const weeklyPlan: MealPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const existingPlan = this.getMealPlanByDate(date);
      
      if (existingPlan) {
        weeklyPlan.push(existingPlan);
      } else {
        const mealPlan: MealPlan = {
          id: (this.nextId++).toString(),
          date,
          meals: [],
          totalCalories: 0,
          completed: false,
        };
        weeklyPlan.push(mealPlan);
        this.mealPlans.push(mealPlan);
      }
    }

    return weeklyPlan;
  }

  getMealPlanByDate(date: Date): MealPlan | undefined {
    return this.mealPlans.find(plan => 
      isSameDay(plan.date, date)
    );
  }

  getMealPlanById(id: string): MealPlan | undefined {
    return this.mealPlans.find(plan => plan.id === id);
  }

  addMealToPlan(planId: string, mealId: string, mealType: MealType, scheduledTime: string): PlannedMeal {
    const plan = this.mealPlans.find(p => p.id === planId);
    if (!plan) {
      // Create a new plan if it doesn't exist
      const newPlan: MealPlan = {
        id: planId,
        date: new Date(),
        meals: [],
        totalCalories: 0,
        completed: false,
      };
      this.mealPlans.push(newPlan);
      return this.addMealToPlan(planId, mealId, mealType, scheduledTime);
    }

    const plannedMeal: PlannedMeal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mealId,
      mealType,
      scheduledTime,
      completed: false,
    };

    plan.meals.push(plannedMeal);
    this.updatePlanCalories(plan);
    return plannedMeal;
  }

  removeMealFromPlan(planId: string, mealId: string): void {
    const plan = this.mealPlans.find(p => p.id === planId);
    if (plan) {
      plan.meals = plan.meals.filter(meal => meal.id !== mealId);
      this.updatePlanCalories(plan);
    }
  }

  toggleMealCompletion(planId: string, mealId: string): boolean {
    const plan = this.mealPlans.find(p => p.id === planId);
    if (plan) {
      const meal = plan.meals.find(m => m.id === mealId);
      if (meal) {
        meal.completed = !meal.completed;
        
        // Check if all meals are completed
        plan.completed = plan.meals.length > 0 && plan.meals.every(m => m.completed);
        return meal.completed;
      }
    }
    return false;
  }

  private updatePlanCalories(plan: MealPlan): void {
    // Simple calculation - in real app, sum actual meal calories
    plan.totalCalories = plan.meals.length * 450;
  }

  getWeeklyPlan(startDate: Date): MealPlan[] {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const weeklyPlan: MealPlan[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const existingPlan = this.getMealPlanByDate(date);
      
      if (existingPlan) {
        weeklyPlan.push(existingPlan);
      } else {
        weeklyPlan.push({
          id: `temp-${i}`,
          date,
          meals: [],
          totalCalories: 0,
          completed: false,
        });
      }
    }

    return weeklyPlan;
  }

  getAllMealPlans(): MealPlan[] {
    return this.mealPlans;
  }

  // Helper to ensure we always have a plan for today
  getOrCreateTodayPlan(): MealPlan {
    const today = new Date();
    let todayPlan = this.getMealPlanByDate(today);
    
    if (!todayPlan) {
      todayPlan = {
        id: `today-${Date.now()}`,
        date: today,
        meals: [],
        totalCalories: 0,
        completed: false,
      };
      this.mealPlans.push(todayPlan);
    }
    
    return todayPlan;
  }
}

export default new MealPlanService();