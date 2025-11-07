export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy', color: '#48BB78' },
  { value: 'Medium', label: 'Medium', color: '#ED8936' },
  { value: 'Hard', label: 'Hard', color: '#F56565' },
];

export const MEAL_CATEGORIES = [
  'Breakfast',
  'Lunch', 
  'Dinner',
  'Dessert',
  'Snack',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'High-Protein',
] as const;

export const INGREDIENT_CATEGORIES = [
  'Produce',
  'Protein',
  'Dairy',
  'Grains',
  'Spices',
  'Oils & Vinegars',
  'Canned Goods',
  'Frozen',
  'Bakery',
  'Beverages',
  'Other',
];

export const COOKING_TIMES = [
  { label: 'Quick (<15 min)', value: 15 },
  { label: 'Moderate (15-30 min)', value: 30 },
  { label: 'Long (>30 min)', value: 60 },
];

export const CALORIE_RANGES = [
  { label: 'Light (<300 cal)', value: 300 },
  { label: 'Moderate (300-600 cal)', value: 600 },
  { label: 'Hearty (>600 cal)', value: 1000 },
];

export const DEFAULT_USER_PREFERENCES = {
  dietaryRestrictions: [],
  calorieTarget: 2000,
  preferredCuisines: [],
  cookingTimeLimit: 60,
  servings: 2,
  mealTypes: {
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true,
  },
  notifications: {
    mealReminders: true,
    groceryReminders: true,
    weeklyPlanning: true,
  },
};