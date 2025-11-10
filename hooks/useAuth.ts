import { useCallback, useState, useEffect } from 'react';
import { User } from '../types/User';
import { useStorage } from './useStorage';
import ApiService from '../services/ApiService';
import * as ImageManipulator from 'expo-image-manipulator';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
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

 // In your useAuth hook, update the updateProfile function:
// In your useAuth hook, replace the updateProfile function with this:
const updateProfile = useCallback(async (updates: Partial<User>) => {
  setLoading(true);
  try {
    console.log('🔄 Updating profile with:', updates);
    
    // Use the correct endpoint based on what your backend has
    // Try PUT /auth/profile first, if that doesn't work, we'll use POST /auth/register
    let response;
    try {
      response = await ApiService.put('/auth/profile', updates);
    } catch (error) {
      console.log('PUT /auth/profile failed, trying alternative...');
      // If PUT fails, try a different endpoint or method
      response = await ApiService.post('/auth/update-profile', updates);
    }
    
    console.log('📥 Profile update response:', response);

    if (response && response.success) {
      let updatedUserData;
      
      // Handle different response formats
      if (response.user) {
        updatedUserData = response.user;
      } else if (response.data) {
        updatedUserData = response.data;
      } else {
        // If no user data in response, merge updates with current user
        updatedUserData = { ...user, ...updates };
      }
      
      const updatedUser = mapBackendUserToFrontend(updatedUserData);
      
      console.log('✅ Updating user state with:', updatedUser);
      
      // CRITICAL: Update both state and storage
      setUser(updatedUser);
      await setStoredUser(updatedUser);
      
      console.log('🎉 Profile updated successfully');
      return { success: true, user: updatedUser };
    } else {
      const errorMessage = response?.message || 'Failed to update profile';
      console.error('❌ Profile update failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    
    // Even if backend fails, update local state for immediate UI feedback
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await setStoredUser(updatedUser);
      console.log('🔄 Updated local state despite backend error');
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to update profile' 
    };
  } finally {
    setLoading(false);
  }
}, [user, setStoredUser, mapBackendUserToFrontend]);

// Add this function to your useAuth hook
// In your useAuth hook, replace the refreshUser function with this:
// Add this at the top of your useAuth hook

const refreshUser = useCallback(async (forceRefresh = false) => {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  
  // Rate limiting: don't refresh more than once every 10 seconds
  if (!forceRefresh && timeSinceLastRefresh < 10000) {
    console.log('Refresh skipped - too soon since last refresh');
    return { success: false, error: 'Refresh too frequent' };
  }

  // Don't refresh if we don't have a token
  if (!storedToken && !forceRefresh) {
    console.log('No token available, skipping refresh');
    return { success: false, error: 'No authentication token' };
  }

  try {
    console.log('Refreshing user data...');
    setLastRefreshTime(now);
    
    // Check if token exists before making the request
    if (!storedToken) {
      throw new Error('No authentication token available');
    }

    const response = await ApiService.get('/auth/profile');
    
    console.log('User refresh response:', response);

    if (response.success && response.data) {
      const updatedUser = mapBackendUserToFrontend(response.data);
      
      // Update both state and storage
      setUser(updatedUser);
      await setStoredUser(updatedUser);
      
      console.log('User data refreshed successfully');
      return { success: true, user: updatedUser };
    } else {
      // If refresh fails, it might be due to token expiration
      console.error('Failed to refresh user data:', response.message);
      
      // If we get unauthorized, clear the token
      if (response.message?.includes('Unauthorized') || response.status === 401) {
        console.log('Token expired during refresh, logging out...');
        await logout();
      }
      
      return { 
        success: false, 
        error: response.message || 'Failed to refresh user data' 
      };
    }
  } catch (error: any) {
    console.error('Error refreshing user:', error);
    setLastRefreshTime(0); // Reset on error
    
    // Handle specific error cases
    if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
      console.log('Unauthorized error, clearing token...');
      await logout();
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to refresh user data' 
    };
  }
}, [storedToken, setStoredUser, mapBackendUserToFrontend, logout, lastRefreshTime]);
  return {
    user: storedUser || user,
    loading,
    authLoading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    refreshUser,
    isAuthenticated: !!storedToken,
  };
};