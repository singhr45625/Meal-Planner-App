import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { NutritionInfo } from '../../components/NutritionInfo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useFavorites } from '../../hooks/useFavorites';
import MealService from '../../services/MealService';
import { MealModel } from '../../types/Meal';

// Helper function to safely format cooking time
const getFormattedCookingTime = (cookingTime: number): string => {
  if (cookingTime < 60) {
    return `${cookingTime}min`;
  } else {
    const hours = Math.floor(cookingTime / 60);
    const minutes = cookingTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
};

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState<MealModel | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadMeal();
  }, [id]);

  const loadMeal = async () => {
    if (typeof id === 'string') {
      try {
        const foundMeal = await MealService.getMealById(id);
        setMeal(foundMeal || null);
      } catch (error) {
        console.error('Error loading meal:', error);
        setMeal(null);
      }
    }
    setLoading(false);
  };

  const handleShare = async () => {
    if (!meal) return;

    try {
      await Share.share({
        message: `Check out this recipe: ${meal.title}\n\n${meal.description}`,
        title: meal.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share recipe');
    }
  };

  const handleAddToPlan = () => {
    if (!meal) return;
    router.push(`/meal-planning?mealId=${id}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading recipe..." fullScreen />;
  }

  if (!meal) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={64} color={Colors.textLight} />
        <Text style={styles.errorText}>Recipe not found</Text>
        <Button
          title="Back to Recipes"
          onPress={() => router.back()}
          variant="primary"
        />
      </View>
    );
  }

  // Use safe method calls
  const formattedCookingTime = getFormattedCookingTime(meal.cookingTime);
  const nutritionPerServing = meal.calculateNutritionPerServing?.() || { calories: Math.round(meal.calories / meal.servings) };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: meal.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(meal.id)}
        >
          <Ionicons
            name={isFavorite(meal.id) ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite(meal.id) ? Colors.primary : Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Meta */}
        <Card style={styles.headerCard}>
          <Text style={styles.title}>{meal.title}</Text>
          <Text style={styles.description}>{meal.description}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{formattedCookingTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{meal.calories} cal</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textLight} />
              <Text style={styles.metaText}>{meal.servings} servings</Text>
            </View>
            <View style={[styles.metaItem, styles.difficulty]}>
              <Text style={styles.difficultyText}>{meal.difficulty}</Text>
            </View>
          </View>

          {meal.tags && meal.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {meal.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Nutrition Info */}
        <NutritionInfo
          calories={nutritionPerServing.calories}
          servings={meal.servings}
          showDetails={false}
        />

        {/* Ingredients */}
        <Card>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {meal.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientDot} />
              <Text style={styles.ingredientText}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </Text>
            </View>
          ))}
        </Card>

        {/* Instructions */}
        <Card>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {meal.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Add to Meal Plan"
            onPress={handleAddToPlan}
            variant="primary"
            fullWidth
            icon={<Ionicons name="calendar" size={20} color="#fff" />}
          />
          <Button
            title="Share Recipe"
            onPress={handleShare}
            variant="outline"
            fullWidth
            icon={<Ionicons name="share-social" size={20} color={Colors.primary} />}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: Layout.spacing.md,
  },
  headerCard: {
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
    marginBottom: Layout.spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: Layout.spacing.xs,
  },
  difficulty: {
    backgroundColor: Colors.border,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.border,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Layout.spacing.md,
  },
  ingredientText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Layout.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textLight,
    marginVertical: Layout.spacing.lg,
    textAlign: 'center',
  },
});