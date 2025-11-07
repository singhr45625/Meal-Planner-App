// types/Navigation.ts

export type RootStackParamList = {
  '(tabs)': undefined;
  'meal-detail/[id]': { id: string };
  'meal-planning': undefined;
};

export type TabParamList = {
  index: undefined;
  recipes: undefined;
  'meal-plan': undefined;
  profile: undefined;
};