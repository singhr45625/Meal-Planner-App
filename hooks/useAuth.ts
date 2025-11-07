import { useCallback, useState } from 'react';
import { User } from '../types/User';
import { useStorage } from './useStorage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { storedValue: storedUser, setValue: setStoredUser } = useStorage<User | null>('user', null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        preferences: {
          dietaryRestrictions: [],
          calorieTarget: 2000,
          preferredCuisines: ['Mediterranean', 'Asian'],
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
        },
        stats: {
          totalMealsCooked: 47,
          favoriteRecipes: 12,
          weeklyCalories: 8500,
          cookingStreak: 5,
          goals: [
            {
              id: '1',
              title: 'Cook 5 new recipes',
              target: 5,
              current: 3,
              unit: 'recipes',
              completed: false,
            },
          ],
        },
      };

      setUser(mockUser);
      await setStoredUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, [setStoredUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      setUser(null);
      await setStoredUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, [setStoredUser]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await setStoredUser(updatedUser);
    }
  }, [user, setStoredUser]);

  return {
    user: storedUser || user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!storedUser,
  };
};