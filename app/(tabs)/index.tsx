import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MealCard } from '../../components/MealCard';
import { Colors } from '../../constants/Colors';
import { useMeals } from '../../constants/hooks/useMeals';

export default function HomeScreen() {
  const { meals, toggleFavorite } = useMeals();
  const featuredMeals = meals.slice(0, 3);
  const favoriteMeals = meals.filter(meal => meal.isFavorite).slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.subtitle}>Plan your meals, eat better</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/meal-planning')}
        >
          <Ionicons name="calendar" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Meal Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/recipes')}
        >
          <Ionicons name="restaurant" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/meal-plan')}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Meals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Recipes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {featuredMeals.map(meal => (
          <MealCard
            key={meal.id}
            meal={meal}
            onPress={(meal) => router.push(`/meal-detail/${meal.id}`)}
            onFavorite={toggleFavorite}
          />
        ))}
      </View>

      {/* Favorite Meals */}
      {favoriteMeals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
          </View>
          {favoriteMeals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={(meal) => router.push(`/meal-detail/${meal.id}`)}
              onFavorite={toggleFavorite}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});