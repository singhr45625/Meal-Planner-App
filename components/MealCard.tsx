import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { MealModel } from '../types/Meal';

interface MealCardProps {
  meal: MealModel;
  onPress: (meal: MealModel) => void;
  onToggleFavorite?: (mealId: string) => void;
  onDelete?: (mealId: string) => void; // Add delete handler
  showFavorite?: boolean;
}

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

export default function MealCard({ 
  meal, 
  onPress, 
  onToggleFavorite,
  onDelete, // Add onDelete prop
  showFavorite = true 
}: MealCardProps) {
  const handleFavoritePress = () => {
    if (onToggleFavorite) {
      onToggleFavorite(meal.id);
    }
  };

  // Handle long press for delete
  const handleLongPress = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Recipe',
        `Are you sure you want to delete "${meal.title}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(meal.id),
          },
        ]
      );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Breakfast: Colors.breakfast,
      Lunch: Colors.lunch,
      Dinner: Colors.dinner,
      Dessert: Colors.dessert,
      Snack: Colors.snack,
      Vegetarian: Colors.vegetarian,
      Vegan: Colors.vegan,
    };
    return colors[category] || Colors.primary;
  };

  // Use safe method call
  const formattedCookingTime = getFormattedCookingTime(meal.cookingTime);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(meal)}
      onLongPress={handleLongPress} // Add long press handler
      delayLongPress={500} // 500ms delay for long press
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {meal.title}
          </Text>
          {showFavorite && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
            >
              <Ionicons 
                name={meal.isFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={meal.isFavorite ? Colors.error : Colors.textLight} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {meal.description}
        </Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>
              {formattedCookingTime}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>
              {meal.calories} cal
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>
              {meal.servings}
            </Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: getCategoryColor(meal.category) }]}>
            <Text style={styles.tagText}>{meal.category}</Text>
          </View>
          <View style={[styles.tag, styles.difficultyTag]}>
            <Text style={styles.tagText}>{meal.difficulty}</Text>
          </View>
        </View>

        {/* Long press hint */}
        <View style={styles.hintContainer}>
          <Ionicons name="information-circle-outline" size={12} color={Colors.textLight} />
          <Text style={styles.hintText}>Long press to delete</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Layout.spacing.sm,
    lineHeight: 24,
  },
  favoriteButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  tag: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.md,
  },
  difficultyTag: {
    backgroundColor: Colors.border,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Layout.spacing.sm,
    opacity: 0.6,
  },
  hintText: {
    fontSize: 10,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});