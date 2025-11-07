import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { MealModel } from '../types/Meal';

interface MealCardProps {
  meal: MealModel;
  onPress: (meal: MealModel) => void;
  onFavorite: (mealId: string) => void;
  showFavorite?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  onPress, 
  onFavorite, 
  showFavorite = true 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(meal)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: meal.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        {showFavorite && (
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => onFavorite(meal.id)}
          >
            <Ionicons 
              name={meal.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={meal.isFavorite ? Colors.primary : Colors.surface} 
            />
          </TouchableOpacity>
        )}
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{meal.difficulty}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{meal.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {meal.description}
        </Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{meal.getFormattedCookingTime()}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{meal.calories} cal</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>{meal.servings}</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {meal.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});