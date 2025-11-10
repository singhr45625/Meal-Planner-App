import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    dailyCalorieTarget: '',
    dietaryPreferences: [] as string[],
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Common dietary preferences
  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Pescatarian',
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        dailyCalorieTarget: user.dailyCalorieTarget?.toString() || '2000',
        dietaryPreferences: user.dietaryPreferences || [],
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDietaryPreference = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference],
    }));
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
        setProfileImage(result.assets[0].uri);
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
        setProfileImage(result.assets[0].uri);
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

  const removeProfileImage = () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setProfileImage(null),
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.dailyCalorieTarget || isNaN(Number(formData.dailyCalorieTarget))) {
      Alert.alert('Error', 'Please enter a valid calorie target');
      return;
    }

    setSaving(true);
    try {
      const updates: any = {
        name: formData.name.trim(),
        dailyCalorieTarget: Number(formData.dailyCalorieTarget),
        dietaryPreferences: formData.dietaryPreferences,
      };

      // Only include profileImage if it's changed
      if (profileImage !== user?.profileImage) {
        updates.profileImage = profileImage;
      }

      const result = await updateProfile(updates);

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!user) return false;
    
    return (
      formData.name !== user.name ||
      Number(formData.dailyCalorieTarget) !== user.dailyCalorieTarget ||
      JSON.stringify(formData.dietaryPreferences) !== JSON.stringify(user.dietaryPreferences || []) ||
      profileImage !== user.profileImage
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Image Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={showImagePickerOptions}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.textLight} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          {profileImage && (
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removeProfileImage}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.textInput, styles.disabledInput]}
            value={user.email}
            editable={false}
            placeholderTextColor={Colors.textLight}
          />
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Calorie Target</Text>
          <TextInput
            style={styles.textInput}
            value={formData.dailyCalorieTarget}
            onChangeText={(value) => handleInputChange('dailyCalorieTarget', value)}
            placeholder="2000"
            keyboardType="numeric"
            placeholderTextColor={Colors.textLight}
          />
          <Text style={styles.helperText}>Your daily calorie intake goal</Text>
        </View>
      </View>

      {/* Dietary Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply to you</Text>
        
        <View style={styles.preferencesGrid}>
          {dietaryOptions.map((preference) => (
            <TouchableOpacity
              key={preference}
              style={[
                styles.preferenceChip,
                formData.dietaryPreferences.includes(preference) && styles.preferenceChipSelected,
              ]}
              onPress={() => toggleDietaryPreference(preference)}
            >
              <Text
                style={[
                  styles.preferenceText,
                  formData.dietaryPreferences.includes(preference) && styles.preferenceTextSelected,
                ]}
              >
                {preference}
              </Text>
              {formData.dietaryPreferences.includes(preference) && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges() || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  section: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Layout.spacing.md,
  },
  imageSection: {
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    padding: Layout.spacing.sm,
  },
  removeImageText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  disabledInput: {
    backgroundColor: Colors.border + '20',
    color: Colors.textLight,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Layout.spacing.xs,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  preferenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preferenceChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  preferenceText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  preferenceTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.primary,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textLight,
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
});