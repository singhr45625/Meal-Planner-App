import { Ionicons } from '@expo/vector-icons';
import React, { useState , useEffect} from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout, updateProfile , refreshUser} = useAuth(); // Changed to updateProfile

  // Default stats since these aren't in your user schema
  const userStats = {
    mealsCooked: user?.mealsCooked || 0,
    favoriteRecipes: user?.favoriteRecipes?.length || 0,
    cookingStreak: user?.cookingStreak || 0,
  };

   // In your ProfileScreen, replace the useEffect with this:


// Remove the problematic useEffect and use useFocusEffect instead
useFocusEffect(
  React.useCallback(() => {
    let isActive = true;
    
    const refreshUserData = async () => {
      if (!isActive) return;
      
      console.log('Profile screen focused, refreshing user data...');
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error refreshing user in profile:', error);
      }
    };

    // Add a small delay to prevent immediate refresh on every focus
    const timer = setTimeout(refreshUserData, 100);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [refreshUser])
);

// Optional: Add a manual refresh function for user control
const [refreshing, setRefreshing] = useState(false);

const handleManualRefresh = async () => {
  if (refreshing) return;
  
  setRefreshing(true);
  try {
    await refreshUser(true); // force refresh
  } catch (error) {
    console.error('Manual refresh failed:', error);
  } finally {
    setRefreshing(false);
  }
};

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        
        // Update profile with the new image
        const updateResult = await updateProfile({ profileImage: selectedImage });
        
        if (updateResult.success) {
          Alert.alert('Success', 'Profile picture updated!');
        } else {
          Alert.alert('Error', updateResult.error || 'Failed to update profile picture.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const takenImage = result.assets[0].uri;
        
        // Update profile with the new image
        const updateResult = await updateProfile({ profileImage: takenImage });
        
        if (updateResult.success) {
          Alert.alert('Success', 'Profile picture updated!');
        } else {
          Alert.alert('Error', updateResult.error || 'Failed to update profile picture.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Helper function to get displayable image URL
  const getDisplayImage = () => {
    if (!user?.profileImage) return null;
    
    // If it's already a full URL or base64, use it directly
    if (user.profileImage.startsWith('http') || user.profileImage.startsWith('data:image')) {
      return user.profileImage;
    }
    
    // If it's a file URI, use it directly
    if (user.profileImage.startsWith('file://')) {
      return user.profileImage;
    }
    
    // If it's a relative path, construct full URL (adjust base URL as needed)
    return `https://your-api-domain.com${user.profileImage}`;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data found</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayImage = getDisplayImage();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Profile Image */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={showImagePickerOptions}>
          {displayImage ? (
            <Image 
              source={{ uri: displayImage }} 
              style={styles.avatarImage}
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color={Colors.textLight} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{user.name || 'User'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.mealsCooked}</Text>
          <Text style={styles.statLabel}>Meals Cooked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.favoriteRecipes}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.cookingStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color={Colors.textLight} />
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{user.name || 'Not set'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        {user.dailyCalorieTarget && (
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={20} color={Colors.textLight} />
            <Text style={styles.infoLabel}>Daily Target:</Text>
            <Text style={styles.infoValue}>{user.dailyCalorieTarget} calories</Text>
          </View>
        )}
      </View>

      {/* Preferences */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="nutrition-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Dietary Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="flame-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Calorie Target</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    paddingTop: Layout.spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.primary + '15',
    gap: Layout.spacing.xs,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Layout.spacing.lg,
    backgroundColor: Colors.surface,
    marginHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  menuSection: {
    marginTop: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: Layout.spacing.md,
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: Layout.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    margin: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: Layout.spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.xl,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});