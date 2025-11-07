import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { MealPlanDay } from '../../components/MealPlanDay';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useMeals } from '../../hooks/useMeals';
import MealPlanService from '../../services/MealPlanService';
import MealService from '../../services/MealService';

const { width: screenWidth } = Dimensions.get('window');

export default function MealPlanScreen() {
  const { meals, toggleFavorite } = useMeals();
  const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      loadWeeklyPlan();
      loadTodayMeals();
    } catch (error) {
      console.error('Error loading meal plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const loadWeeklyPlan = () => {
    try {
      const plan = MealPlanService.getWeeklyPlan(selectedDate);
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error loading weekly plan:', error);
      setWeeklyPlan([]);
    }
  };

  const loadTodayMeals = () => {
    try {
      const todayPlan = MealPlanService.getOrCreateTodayPlan();
      
      if (todayPlan && todayPlan.meals.length > 0) {
        const todayMealDetails = todayPlan.meals.map(plannedMeal => {
          const meal = MealService.getMealById(plannedMeal.mealId);
          return {
            ...plannedMeal,
            mealDetails: meal
          };
        }).filter(item => item.mealDetails !== undefined);
        
        setTodayMeals(todayMealDetails);
      } else {
        setTodayMeals([]);
      }
    } catch (error) {
      console.error('Error loading today meals:', error);
      setTodayMeals([]);
    }
  };

  const handleDayPress = (mealPlan: any) => {
    router.push(`/meal-planning?date=${format(mealPlan.date, 'yyyy-MM-dd')}`);
  };

  const handleAddMeal = () => {
    router.push('/meal-planning');
  };

  const handleRemoveMeal = (mealId: string) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal from your plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            try {
              const todayPlan = MealPlanService.getOrCreateTodayPlan();
              MealPlanService.removeMealFromPlan(todayPlan.id, mealId);
              loadTodayMeals();
              loadWeeklyPlan();
            } catch (error) {
              console.error('Error removing meal:', error);
              Alert.alert('Error', 'Failed to remove meal');
            }
          }
        }
      ]
    );
  };

  const handleToggleMealCompletion = (mealId: string) => {
    try {
      const todayPlan = MealPlanService.getOrCreateTodayPlan();
      MealPlanService.toggleMealCompletion(todayPlan.id, mealId);
      loadTodayMeals();
      loadWeeklyPlan();
    } catch (error) {
      console.error('Error toggling meal completion:', error);
    }
  };

  const handleQuickAddMeal = (meal: any) => {
    try {
      const todayPlan = MealPlanService.getOrCreateTodayPlan();
      
      const currentHour = new Date().getHours();
      let mealType: any = 'lunch';
      if (currentHour < 11) mealType = 'breakfast';
      else if (currentHour < 16) mealType = 'lunch';
      else mealType = 'dinner';
      
      const scheduledTime = `${currentHour.toString().padStart(2, '0')}:00`;
      
      MealPlanService.addMealToPlan(
        todayPlan.id, 
        meal.id, 
        mealType, 
        scheduledTime
      );
      
      loadTodayMeals();
      loadWeeklyPlan();
      
      Alert.alert('Success', `${meal.title} added to today's plan!`);
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal to plan');
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons: { [key: string]: string } = {
      breakfast: 'sunny',
      lunch: 'restaurant',
      dinner: 'moon',
      snack: 'cafe'
    };
    return icons[mealType] || 'fast-food';
  };

  const getMealTypeColor = (mealType: string) => {
    const colors: { [key: string]: string } = {
      breakfast: Colors.breakfast,
      lunch: Colors.lunch,
      dinner: Colors.dinner,
      snack: Colors.snack
    };
    return colors[mealType] || Colors.primary;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="restaurant-outline" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your meal plan...</Text>
      </View>
    );
  }

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
        <Text style={styles.title}>Weekly Meal Plan</Text>
        <Text style={styles.subtitle}>
          Plan your meals for the week ahead
        </Text>
      </View>

      {/* Weekly Plan Horizontal Scroll */}
      <View style={styles.weeklySection}>
        <Text style={styles.sectionLabel}>This Week</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.weeklyScroll}
          contentContainerStyle={styles.weeklyScrollContent}
        >
          {weeklyPlan.map((dayPlan, index) => (
            <View key={dayPlan.id || `day-${index}`} style={styles.dayCardWrapper}>
              <MealPlanDay
                mealPlan={dayPlan}
                onPress={handleDayPress}
                isToday={format(dayPlan.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Today's Meals Section */}
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <Text style={styles.sectionSubtitle}>
              {format(new Date(), 'EEEE, MMMM do')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMeal}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>

        {todayMeals.length > 0 ? (
          <View style={styles.mealsContainer}>
            {todayMeals.map((plannedMeal) => (
              <View key={plannedMeal.id} style={styles.mealItem}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealType}>
                    <View 
                      style={[
                        styles.mealTypeIcon,
                        { backgroundColor: getMealTypeColor(plannedMeal.mealType) }
                      ]}
                    >
                      <Ionicons 
                        name={getMealTypeIcon(plannedMeal.mealType) as any} 
                        size={14} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.mealTypeInfo}>
                      <Text style={styles.mealTypeText}>
                        {plannedMeal.mealType.charAt(0).toUpperCase() + plannedMeal.mealType.slice(1)}
                      </Text>
                      <Text style={styles.mealTime}>
                        {plannedMeal.scheduledTime}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.mealActions}>
                    <TouchableOpacity 
                      style={styles.completionButton}
                      onPress={() => handleToggleMealCompletion(plannedMeal.id)}
                    >
                      <Ionicons 
                        name={plannedMeal.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                        size={22} 
                        color={plannedMeal.completed ? Colors.success : Colors.textLight} 
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveMeal(plannedMeal.id)}
                    >
                      <Ionicons name="close" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {plannedMeal.mealDetails && (
                  <View style={styles.mealDetails}>
                    <Text style={styles.mealTitle}>{plannedMeal.mealDetails.title}</Text>
                    <Text style={styles.mealDescription} numberOfLines={2}>
                      {plannedMeal.mealDetails.description}
                    </Text>
                    <View style={styles.mealMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color={Colors.textLight} />
                        <Text style={styles.metaText}>
                          {plannedMeal.mealDetails.getFormattedCookingTime()}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="flame-outline" size={12} color={Colors.textLight} />
                        <Text style={styles.metaText}>
                          {plannedMeal.mealDetails.calories} cal
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={12} color={Colors.textLight} />
                        <Text style={styles.metaText}>
                          {plannedMeal.mealDetails.servings}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="fast-food-outline" size={48} color={Colors.border} />
            </View>
            <Text style={styles.emptyStateTitle}>No meals planned for today</Text>
            <Text style={styles.emptyStateText}>
              Start by adding meals to your plan to track your daily nutrition and stay organized.
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleAddMeal}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyStateButtonText}>Add Your First Meal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Add Suggestions */}
        {todayMeals.length < 3 && meals.length > 0 && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Quick Add</Text>
            <Text style={styles.suggestionsSubtitle}>Popular recipes to get started</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {meals.slice(0, 4).map(meal => (
                <TouchableOpacity 
                  key={meal.id}
                  style={styles.suggestionCard}
                  onPress={() => handleQuickAddMeal(meal)}
                >
                  <View style={styles.suggestionCardContent}>
                    <Text style={styles.suggestionCardTitle} numberOfLines={2}>
                      {meal.title}
                    </Text>
                    <View style={styles.suggestionCardMeta}>
                      <View style={styles.suggestionMetaItem}>
                        <Ionicons name="time-outline" size={10} color={Colors.textLight} />
                        <Text style={styles.suggestionMetaText}>
                          {meal.getFormattedCookingTime()}
                        </Text>
                      </View>
                      <View style={styles.suggestionMetaItem}>
                        <Ionicons name="flame-outline" size={10} color={Colors.textLight} />
                        <Text style={styles.suggestionMetaText}>
                          {meal.calories} cal
                        </Text>
                      </View>
                    </View>
                    <View style={styles.suggestionCardButton}>
                      <Text style={styles.suggestionCardButtonText}>Add to Today</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Add some bottom padding for better scrolling */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Layout.spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.xl,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 20,
  },
  weeklySection: {
    backgroundColor: Colors.surface,
    paddingVertical: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    marginHorizontal: Layout.spacing.lg,
  },
  weeklyScroll: {
    flexGrow: 0,
  },
  weeklyScrollContent: {
    paddingHorizontal: Layout.spacing.lg - 8,
    gap: 12,
  },
  dayCardWrapper: {
    marginHorizontal: 4,
  },
  todaySection: {
    padding: Layout.spacing.lg,
    minHeight: 500, // Ensure minimum height for proper scrolling
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  mealsContainer: {
    gap: Layout.spacing.md,
  },
  mealItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  mealType: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  mealTypeInfo: {
    flex: 1,
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  mealDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    paddingTop: Layout.spacing.md,
  },
  mealTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  mealDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: Layout.spacing.md,
  },
  mealMeta: {
    flexDirection: 'row',
    gap: Layout.spacing.lg,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xxl,
    minHeight: 300,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
    maxWidth: 300,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  suggestions: {
    marginTop: Layout.spacing.xl,
    paddingTop: Layout.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Layout.spacing.lg,
  },
  suggestionsScroll: {
    flexGrow: 0,
  },
  suggestionsScrollContent: {
    gap: Layout.spacing.md,
    paddingRight: Layout.spacing.lg,
  },
  suggestionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionCardContent: {
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  suggestionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
    minHeight: 36,
  },
  suggestionCardMeta: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  suggestionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionMetaText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  suggestionCardButton: {
    backgroundColor: Colors.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.xs,
  },
  suggestionCardButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: Layout.spacing.xl,
  },
});