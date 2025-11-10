import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import MealCard from '../../components/MealCard';
import { Colors } from '../../constants/Colors';
import { useMeals } from '../../hooks/useMeals';

export default function HomeScreen() {
  const { meals, toggleFavorite, loading, refreshMeals } = useMeals();
  const [refreshing, setRefreshing] = React.useState(false);

  const featuredMeals = meals.slice(0, 3);
  const favoriteMeals = meals.filter(meal => meal.isFavorite).slice(0, 3);

  const handleMealPress = (meal: any) => {
    router.push(`/meal-detail/${meal.id}`);
  };

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMeals();
      console.log('🔄 Home screen refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh home screen:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshMeals]);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Meal Planner</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={Colors.primary} 
              style={refreshing ? styles.refreshingIcon : null}
            />
          </TouchableOpacity>
        </View>
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
          onPress={() => router.push('/meal-planning')}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.actionText}>Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <Ionicons name="cafe" size={40} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading meals...</Text>
        </View>
      )}

      {/* Featured Meals */}
      {!loading && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Recipes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredMeals.length > 0 ? (
            featuredMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={handleMealPress}
                onToggleFavorite={toggleFavorite}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fast-food" size={40} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No featured meals</Text>
              <Text style={styles.emptyStateSubtext}>Add some meals to see them here</Text>
            </View>
          )}
        </View>
      )}

      {/* Favorite Meals */}
      {!loading && favoriteMeals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/recipes?filter=favorites')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {favoriteMeals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={handleMealPress}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>
      )}

      {/* Empty Favorites State */}
      {!loading && favoriteMeals.length === 0 && meals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="heart" size={40} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No favorite meals yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the heart icon to add favorites</Text>
          </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginVertical: 10,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
});