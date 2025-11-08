import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Button } from '../components/ui/Button';
import { useMeals } from '../hooks/useMeals';
import ApiService from '../services/ApiService';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export default function CreateRecipeScreen() {
  const { createMeal } = useMeals();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Dinner',
    cookingTime: '',
    difficulty: 'Medium',
    calories: '',
    servings: '',
    isPublic: false,
  });
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', amount: '', unit: '' }
  ]);
  
  const [instructions, setInstructions] = useState<string[]>(['']);

  // Categories and difficulties
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegetarian', 'Vegan'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  // Handle image picker
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // This is enough to get base64 data
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Upload image to backend
  const uploadImageToServer = async (imageUri: string): Promise<string> => {
    try {
      setUploadingImage(true);
      console.log('Starting image upload:', imageUri);

      // FIXED: Use the correct encoding method
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload to your backend
      const response = await ApiService.post('/upload/base64', {
        image: `data:image/jpeg;base64,${base64}`,
        fileName: `meal-${Date.now()}.jpg`,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to upload image');
      }

      console.log('Image uploaded successfully:', response.data.url);
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // SIMPLIFIED: Get image for upload - use category placeholders for now
  const getImageForUpload = async (imageUri: string): Promise<string> => {
    try {
      // If it's already a web URL, use it directly
      if (imageUri.startsWith('http')) {
        console.log('Using existing web image:', imageUri);
        return imageUri;
      }

      // For now, use category-specific placeholders until upload is fixed
      console.log('Using category placeholder instead of uploading');
      return getCategoryPlaceholder(formData.category);
      
    } catch (error) {
      console.error('Image processing failed, using placeholder:', error);
      return getCategoryPlaceholder(formData.category);
    }
  };

  // Get category-specific placeholder images
  const getCategoryPlaceholder = (category: string): string => {
    const placeholders: { [key: string]: string } = {
      'Breakfast': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400',
      'Lunch': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      'Dinner': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      'Dessert': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
      'Snack': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      'Vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    };
    
    return placeholders[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle ingredient changes
  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setIngredients(updatedIngredients);
  };

  // Add new ingredient field
  const addIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', amount: '', unit: '' }
    ]);
  };

  // Remove ingredient field
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updatedIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(updatedIngredients);
    }
  };

  // Handle instruction changes
  const handleInstructionChange = (index: number, value: string) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };

  // Add new instruction field
  const addInstruction = () => {
    setInstructions(prev => [...prev, '']);
  };

  // Remove instruction field
  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updatedInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(updatedInstructions);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a recipe title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a recipe description');
      return false;
    }
    if (ingredients.some(ing => !ing.name.trim() || !ing.amount.trim() || !ing.unit.trim())) {
      Alert.alert('Error', 'Please fill in all ingredient fields (name, amount, unit)');
      return false;
    }
    if (instructions.some(inst => !inst.trim())) {
      Alert.alert('Error', 'Please fill in all instructions');
      return false;
    }
    if (!formData.cookingTime || parseInt(formData.cookingTime) <= 0) {
      Alert.alert('Error', 'Please enter a valid cooking time');
      return false;
    }
    if (!formData.calories || parseInt(formData.calories) <= 0) {
      Alert.alert('Error', 'Please enter valid calories');
      return false;
    }
    if (!formData.servings || parseInt(formData.servings) <= 0) {
      Alert.alert('Error', 'Please enter valid number of servings');
      return false;
    }
    return true;
  };

  // UPDATED: Handle form submission with immediate state update
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('=== IMAGE UPLOAD DEBUG ===');
      console.log('Selected image:', image);
      console.log('Form category:', formData.category);

      let finalImageUrl = getCategoryPlaceholder(formData.category);

      if (image) {
        try {
          console.log('Processing image...');
          finalImageUrl = await getImageForUpload(image);
          console.log('Final image URL:', finalImageUrl);
        } catch (imageError) {
          console.error('Image processing failed, using category placeholder:', imageError);
        }
      } else {
        console.log('No image selected, using category placeholder');
      }

      const recipeData = {
        name: formData.title.trim(),
        type: formData.category.toLowerCase(),
        description: formData.description.trim(),
        recipe: instructions.filter(inst => inst.trim()).join('\n'),
        ingredients: ingredients
          .filter(ing => ing.name.trim() && ing.amount.trim() && ing.unit.trim())
          .map(ing => ({
            ingredient: ing.name.trim(),
            quantity: ing.amount.trim(),
            unit: ing.unit.trim(),
          })),
        prepTime: parseInt(formData.cookingTime) || 0,
        difficulty: formData.difficulty.toLowerCase(),
        calories: parseInt(formData.calories) || 0,
        servings: parseInt(formData.servings) || 0,
        image: finalImageUrl,
        isPublic: formData.isPublic,
      };

      console.log('Sending meal data to backend:', recipeData);

      const success = await createMeal(recipeData);
      
      if (success) {
        Alert.alert('Success', 'Recipe created successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Use replace to force refresh the recipes screen
              router.replace('/(tabs)/recipes');
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to create recipe. Please try again.');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      Alert.alert('Error', 'Failed to create recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Recipe</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipe Image</Text>
          <View style={styles.imageContainer}>
            <TouchableOpacity 
              style={styles.imagePicker} 
              onPress={pickImage}
              disabled={uploadingImage}
            >
              {image ? (
                <View style={styles.imageWithOverlay}>
                  <Image source={{ uri: image }} style={styles.image} />
                  {uploadingImage && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.uploadingText}>Uploading Image...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color={Colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>
                    {uploadingImage ? 'Uploading...' : 'Add Photo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {image && !uploadingImage && (
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
          
          {!image && (
            <Text style={styles.imageHint}>
              Add a photo of your delicious recipe (optional)
            </Text>
          )}
          
          {uploadingImage && (
            <Text style={styles.uploadingHint}>
              Uploading your image... Please wait.
            </Text>
          )}
        </View>

        {/* Rest of your form components remain exactly the same */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter recipe title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your recipe..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.pickerContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      formData.category === category && styles.categoryOptionSelected
                    ]}
                    onPress={() => handleInputChange('category', category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === category && styles.categoryTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Cooking Time (min) *</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                value={formData.cookingTime}
                onChangeText={(value) => handleInputChange('cookingTime', value)}
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Difficulty *</Text>
              <View style={styles.pickerContainer}>
                {difficulties.map(difficulty => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyOption,
                      formData.difficulty === difficulty && styles.difficultyOptionSelected
                    ]}
                    onPress={() => handleInputChange('difficulty', difficulty)}
                  >
                    <Text style={[
                      styles.difficultyText,
                      formData.difficulty === difficulty && styles.difficultyTextSelected
                    ]}>
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Calories *</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                value={formData.calories}
                onChangeText={(value) => handleInputChange('calories', value)}
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Servings *</Text>
              <TextInput
                style={styles.input}
                placeholder="2"
                value={formData.servings}
                onChangeText={(value) => handleInputChange('servings', value)}
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Make this recipe public</Text>
            <Switch
              value={formData.isPublic}
              onValueChange={(value) => handleInputChange('isPublic', value)}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients *</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={addIngredient}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 2 }]}
                  placeholder="Ingredient name *"
                  value={ingredient.name}
                  onChangeText={(value) => handleIngredientChange(index, 'name', value)}
                  placeholderTextColor={Colors.textLight}
                />
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 1 }]}
                  placeholder="Amount *"
                  value={ingredient.amount}
                  onChangeText={(value) => handleIngredientChange(index, 'amount', value)}
                  placeholderTextColor={Colors.textLight}
                />
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 1 }]}
                  placeholder="Unit *"
                  value={ingredient.unit}
                  onChangeText={(value) => handleIngredientChange(index, 'unit', value)}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              {ingredients.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions *</Text>
            <TouchableOpacity style={styles.addButtonSmall} onPress={addInstruction}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                placeholder={`Step ${index + 1} *`}
                value={instruction}
                onChangeText={(value) => handleInstructionChange(index, value)}
                placeholderTextColor={Colors.textLight}
                multiline
              />
              {instructions.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeInstruction(index)}
                >
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Button
            title={loading ? "Creating Recipe..." : "Create Recipe"}
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading || uploadingImage}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// Your styles remain exactly the same
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
    paddingTop: Layout.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    height: 200,
    overflow: 'hidden',
  },
  imageWithOverlay: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: Layout.spacing.sm,
    fontSize: 14,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  imagePlaceholderText: {
    marginTop: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.textLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 4,
  },
  imageHint: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    fontStyle: 'italic',
  },
  uploadingHint: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.border + '30',
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  difficultyOption: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.border + '30',
    flex: 1,
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: Colors.primary,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  difficultyTextSelected: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  addButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.sm,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  ingredientInput: {
    flex: 1,
    marginBottom: 0,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionInput: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 0,
  },
  removeButton: {
    padding: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  bottomPadding: {
    height: Layout.spacing.xl,
  },
});