import { MealModel } from '../types/Meal';
import { MealPlan } from './Types';

export const mockMeals: MealModel[] = [
  new MealModel(
    '1',
    'Avocado Toast',
    'Creamy avocado on whole grain toast with cherry tomatoes and microgreens',
    'Breakfast',
    [
      { id: '1', name: 'Ripe avocado', amount: '1', unit: 'piece' },
      { id: '2', name: 'Whole grain bread', amount: '2', unit: 'slices' },
      { id: '3', name: 'Cherry tomatoes', amount: '100', unit: 'g' },
      { id: '4', name: 'Lemon juice', amount: '1', unit: 'tbsp' },
      { id: '5', name: 'Microgreens', amount: '1', unit: 'handful' },
    ],
    [
      'Toast the bread until golden brown and crispy',
      'Cut avocado in half, remove pit, and scoop flesh into a bowl',
      'Mash avocado with lemon juice, salt, and pepper',
      'Spread avocado mixture evenly on toast',
      'Top with halved cherry tomatoes and microgreens',
      'Drizzle with olive oil and season with flaky sea salt',
    ],
    10,
    'Easy',
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    350,
    1,
    true,
    4.5,
    ['quick', 'healthy', 'vegetarian', 'breakfast']
  ),
  new MealModel(
    '2',
    'Greek Salad',
    'Fresh Mediterranean salad with feta cheese and olives',
    'Lunch',
    [
      { id: '1', name: 'Cucumber', amount: '1', unit: 'large' },
      { id: '2', name: 'Tomatoes', amount: '2', unit: 'medium' },
      { id: '3', name: 'Red onion', amount: '0.5', unit: 'piece' },
      { id: '4', name: 'Feta cheese', amount: '100', unit: 'g' },
      { id: '5', name: 'Kalamata olives', amount: '50', unit: 'g' },
    ],
    [
      'Chop cucumber, tomatoes, and red onion into bite-sized pieces',
      'Combine vegetables in a large bowl',
      'Add olives and crumbled feta cheese',
      'Whisk together olive oil, lemon juice, oregano, salt, and pepper',
      'Pour dressing over salad and toss gently',
      'Let sit for 5 minutes before serving',
    ],
    15,
    'Easy',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    280,
    2,
    false,
    4.2,
    ['fresh', 'mediterranean', 'vegetarian', 'lunch']
  ),
  new MealModel(
    '3',
    'Chicken Stir Fry',
    'Quick and healthy chicken stir fry with vegetables',
    'Dinner',
    [
      { id: '1', name: 'Chicken breast', amount: '2', unit: 'pieces' },
      { id: '2', name: 'Bell peppers', amount: '2', unit: 'pieces' },
      { id: '3', name: 'Broccoli', amount: '1', unit: 'head' },
      { id: '4', name: 'Soy sauce', amount: '3', unit: 'tbsp' },
      { id: '5', name: 'Ginger', amount: '1', unit: 'tbsp' },
    ],
    [
      'Cut chicken into bite-sized pieces and season',
      'Chop vegetables into uniform sizes',
      'Heat oil in a wok or large pan',
      'Stir-fry chicken until cooked through',
      'Add vegetables and stir-fry until crisp-tender',
      'Add sauce ingredients and cook until thickened',
      'Serve hot with rice or noodles',
    ],
    25,
    'Medium',
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
    450,
    4,
    true,
    4.7,
    ['quick', 'healthy', 'dinner', 'high-protein']
  ),
];

export const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    meals: [
      {
        id: 'm1',
        mealId: '1',
        mealType: 'breakfast',
        scheduledTime: '08:00',
        completed: true,
      },
      {
        id: 'm2',
        mealId: '2',
        mealType: 'lunch',
        scheduledTime: '13:00',
        completed: false,
      },
    ],
    totalCalories: 730,
    completed: false,
  },
];