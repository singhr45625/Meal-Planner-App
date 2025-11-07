import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { MealCard } from '../../components/MealCard';
import { useMeals } from '../../constants/hooks/useMeals';
import { router } from 'expo-router';

export default function RecipesScreen() {
  const { meals, toggleFavorite, searchMeals } = useMeals();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchMeals(query);
  };

  return (
    <View style={styles.container}>
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
      </View>

      {/* Recipes List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.recipesContainer}>
          {meals.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={(meal) => router.push(`/meal-detail/${meal.id}`)}
              onFavorite={toggleFavorite}
            />
          ))}
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
});