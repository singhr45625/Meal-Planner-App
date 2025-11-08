import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import MealCard from '../../components/MealCard';
import { useMeals } from '../../hooks/useMeals';
import { router } from 'expo-router';

export default function RecipesScreen() {
  const { 
    meals, 
    loading, 
    error,
    toggleFavorite, 
    searchMeals, 
    deleteMeal,
    refreshMeals 
  } = useMeals();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchMeals(query);
  };

  const handleMealPress = (meal: any) => {
    router.push(`/meal-detail/${meal.id}`);
  };

  const handleAddRecipe = () => {
    router.push('/create-recipe');
  };

  // Handle meal deletion
  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteMeal(mealId);
              if (!success) {
                Alert.alert('Error', 'Failed to delete recipe. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete recipe. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMeals();
    setRefreshing(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchMeals('');
  };

  // Show loading state
  if (loading && meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Ionicons name="add" size={24} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Recipe</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error && meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Ionicons name="add" size={24} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Recipe</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshMeals}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recipes</Text>
          <Text style={styles.subtitle}>
            {meals.length} {meals.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
          <Ionicons name="add" size={24} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add Recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={Colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recipes List */}
      <ScrollView 
        style={styles.scrollView} 
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
        <View style={styles.recipesContainer}>
          {meals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fast-food-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No recipes found' : 'No recipes yet'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'Try a different search term' 
                  : 'Create your first recipe to get started'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity style={styles.createButton} onPress={handleAddRecipe}>
                  <Text style={styles.createButtonText}>Create Your First Recipe</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            meals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={handleMealPress}
                onToggleFavorite={toggleFavorite}
                onDelete={handleDeleteMeal} // Add delete functionality
                showFavorite={true}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  recipesContainer: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});