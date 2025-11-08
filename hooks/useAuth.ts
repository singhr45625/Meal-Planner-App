import { useCallback, useState, useEffect } from 'react';
import { User } from '../types/User';
import { useStorage } from './useStorage';
import ApiService from '../services/ApiService';
import * as ImageManipulator from 'expo-image-manipulator';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const { storedValue: storedUser, setValue: setStoredUser } = useStorage<User | null>('user', null);
  const { storedValue: storedToken, setValue: setStoredToken } = useStorage<string | null>('auth_token', null);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth with token:', storedToken ? 'Token exists' : 'No token');
      
      if (storedToken) {
        ApiService.setToken(storedToken);
        console.log('Token synced with ApiService');
      } else {
        ApiService.setToken(null);
      }
      
      setAuthLoading(false);
    };

    initializeAuth();
  }, [storedToken]);

  // Helper function to compress and convert image to base64
  const compressAndConvertImage = async (uri: string): Promise<string> => {
    try {
      console.log('Compressing image...');
      
      // Compress the image first
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }], // Resize to 300x300
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!compressedImage.base64) {
        throw new Error('Failed to compress image');
      }

      const base64String = `data:image/jpeg;base64,${compressedImage.base64}`;
      console.log('Image compressed, base64 length:', base64String.length);
      
      return base64String;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  // Helper function to map backend user data to frontend User type
  const mapBackendUserToFrontend = useCallback((userData: any): User => {
    return {
      id: userData.id || userData._id,
      name: userData.name,
      email: userData.email,
      profileImage: userData.profileImage,
      preferences: {
        dietaryRestrictions: userData.dietaryPreferences || [],
        calorieTarget: userData.dailyCalorieTarget || 2000,
        preferredCuisines: userData.preferredCuisines || [],
        cookingTimeLimit: userData.cookingTimeLimit || 60,
        servings: userData.servings || 2,
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
        totalMealsCooked: userData.mealsCooked || 0,
        favoriteRecipes: userData.favoriteRecipes?.length || 0,
        weeklyCalories: userData.weeklyCalories || 0,
        cookingStreak: userData.cookingStreak || 0,
        goals: userData.goals || [],
      },
      dailyCalorieTarget: userData.dailyCalorieTarget,
      dietaryPreferences: userData.dietaryPreferences,
      mealsCooked: userData.mealsCooked,
      cookingStreak: userData.cookingStreak,
      favoriteRecipes: userData.favoriteRecipes,
      createdAt: userData.createdAt,
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login for:', email);
      
      ApiService.setToken(null);
      
      const response = await ApiService.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response);

      if (response.success) {
        const { token, user: userData } = response;
        
        console.log('Login successful, setting token:', token);
        
        ApiService.setToken(token);
        
        const user = mapBackendUserToFrontend(userData);

        setUser(user);
        await setStoredUser(user);
        await setStoredToken(token);
        
        console.log('User data stored, login complete');
        
        return { success: true, user };
      } else {
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  }, [setStoredUser, setStoredToken, mapBackendUserToFrontend]);

  const register = useCallback(async (name: string, email: string, password: string, dailyCalorieTarget?: number, profileImage?: string | null) => {
    setLoading(true);
    try {
      console.log('Attempting registration for:', email);
      
      ApiService.setToken(null);
      
      let profileImageData = null;
      
      // If profile image is provided and it's a local file URI, compress and convert to base64
      if (profileImage && profileImage.startsWith('file://')) {
        console.log('Compressing and converting local image...');
        profileImageData = await compressAndConvertImage(profileImage);
        console.log('Image compressed and converted, length:', profileImageData.length);
      } else if (profileImage) {
        // If it's already a URL or base64, use as is
        profileImageData = profileImage;
      }

      const registrationData: any = {
        name,
        email,
        password,
        dailyCalorieTarget: dailyCalorieTarget || 2000
      };

      // Only include profileImage if we have one and it's not too large
      if (profileImageData && profileImageData.length < 500000) { // Limit to ~500KB
        registrationData.profileImage = profileImageData;
        console.log('Profile image included in registration');
      } else if (profileImageData) {
        console.log('Profile image too large, skipping:', profileImageData.length);
        // Don't include the image if it's too large
      }

      console.log('Sending registration data...');
      
      const response = await ApiService.post('/auth/register', registrationData);

      console.log('Registration response:', response);

      if (response.success) {
        const { token, user: userData } = response;
        
        console.log('Registration successful, setting token:', token);
        
        ApiService.setToken(token);
        
        const user = mapBackendUserToFrontend(userData);

        setUser(user);
        await setStoredUser(user);
        await setStoredToken(token);
        
        console.log('User data stored, registration complete');
        console.log('User profile image:', user.profileImage);
        
        return { success: true, user };
      } else {
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, [setStoredUser, setStoredToken, mapBackendUserToFrontend]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Logging out user');
      setUser(null);
      ApiService.setToken(null);
      await setStoredUser(null);
      await setStoredToken(null);
      console.log('Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setStoredUser, setStoredToken]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await setStoredUser(updatedUser);
    }
  }, [user, setStoredUser]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    setLoading(true);
    try {
      const response = await ApiService.put('/auth/profile', updates);
      
      if (response.success) {
        const updatedUser = mapBackendUserToFrontend(response.user);
        setUser(updatedUser);
        await setStoredUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.message || 'Failed to update profile' };
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    } finally {
      setLoading(false);
    }
  }, [setStoredUser, mapBackendUserToFrontend]);

  return {
    user: storedUser || user,
    loading,
    authLoading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isAuthenticated: !!storedToken,
  };
};