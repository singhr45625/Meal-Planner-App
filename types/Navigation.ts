export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'meal-detail/[id]': { id: string };
  'meal-planning': { date?: string; mealId?: string };
  'index': undefined;
};

export type TabParamList = {
  index: undefined;
  recipes: undefined;
  'meal-plan': undefined;
  profile: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
};