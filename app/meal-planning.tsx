import { Ionicons } from '@expo/vector-icons';
import { addDays, format, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useMeals } from '../hooks/useMeals';
import { useMealPlan } from '../hooks/useMealPlan';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function MealPlanningScreen() {
  const params = useLocalSearchParams();
  const { meals, toggleFavorite, searchMeals } = useMeals();
  const { 
    weeklyPlan, 
    selectedDate,
    setSelectedDate,
    addMealToPlan, 
    removeMealFromPlan,
    loading: planLoading,
    refresh
  } = useMealPlan();
  
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMealModal, setShowMealModal] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [lastAddedMeal, setLastAddedMeal] = useState<string | null>(null);

  // Memoize stable values
  const mealTypes = useMemo(() => [
    { type: 'breakfast' as MealType, label: 'Breakfast', icon: 'sunny-outline' },
    { type: 'lunch' as MealType, label: 'Lunch', icon: 'restaurant-outline' },
    { type: 'dinner' as MealType, label: 'Dinner', icon: 'moon-outline' },
    { type: 'snack' as MealType, label: 'Snack', icon: 'cafe-outline' },
  ], []);

  const timeSlots = useMemo(() => [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00'
  ], []);

  // Get today's planned meals from weeklyPlan
  const plannedMeals = useMemo(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const todayPlan = weeklyPlan.find(plan => {
      const planDateStr = format(plan.date, 'yyyy-MM-dd');
      return planDateStr === selectedDateStr;
    });
    
    const meals = todayPlan?.meals || [];
    console.log('📅 Planned meals for', selectedDateStr, ':', meals.length, 'meals');
    return meals;
  }, [weeklyPlan, selectedDate]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('=== MEAL PLANNING DEBUG ===');
    console.log('Selected Date:', format(selectedDate, 'yyyy-MM-dd'));
    console.log('Weekly Plan Length:', weeklyPlan.length);
    console.log('Planned Meals Length:', plannedMeals.length);
    plannedMeals.forEach((meal, index) => {
      console.log(`Meal ${index + 1}:`, meal.mealType, meal.mealId, meal.scheduledTime);
    });
    console.log('=== END DEBUG ===');
  }, [weeklyPlan, plannedMeals, selectedDate]);

  // Track when a meal was just added
  useEffect(() => {
    if (lastAddedMeal) {
      console.log('🎯 Last added meal tracking:', lastAddedMeal);
      // Clear after 3 seconds
      const timer = setTimeout(() => {
        setLastAddedMeal(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedMeal]);

  // Initialize from URL params
  useEffect(() => {
    if (params.date) {
      try {
        const date = parseISO(params.date as string);
        setSelectedDate(date);
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    
    if (params.mealId) {
      setShowMealModal(true);
    }
  }, [params.date, params.mealId, setSelectedDate]);

  // Filter meals based on search
  const filteredMeals = useMemo(() => {
    if (searchQuery.trim()) {
      return meals.filter(meal =>
        meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return meals;
  }, [searchQuery, meals]);

  const handleAddMeal = useCallback(async (meal: any) => {
    try {
      setLocalLoading(true);
      setLastAddedMeal(`${meal.id}-${selectedMealType}-${Date.now()}`);
      
      console.log('🚀 Starting to add meal:', {
        date: format(selectedDate, 'yyyy-MM-dd'),
        mealId: meal.id,
        mealType: selectedMealType,
        scheduledTime: scheduledTime,
        mealTitle: meal.title
      });

      const result = await addMealToPlan(
        selectedDate,
        meal.id,
        selectedMealType,
        scheduledTime
      );

      if (result.success) {
        console.log('✅ Meal added successfully, closing modal');
        setShowMealModal(false);
        setSearchQuery('');
        
        // Show success but don't reload data
        Alert.alert('Success', `${meal.title} added to ${selectedMealType} on ${format(selectedDate, 'MMM dd')}`);
        
        // Verify the meal is still there after a delay
        setTimeout(() => {
          console.log('🔍 Verifying meal persistence...');
          const currentPlannedMeals = plannedMeals;
          const addedMealExists = currentPlannedMeals.some(
            m => m.mealId === meal.id && m.mealType === selectedMealType
          );
          console.log('✅ Meal still exists in state:', addedMealExists);
        }, 1000);
      } else {
        Alert.alert('Error', result.error || 'Failed to add meal to plan');
      }
    } catch (error) {
      console.error('❌ Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal to plan. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  }, [selectedDate, selectedMealType, scheduledTime, addMealToPlan, plannedMeals]);

  const handleRemoveMeal = useCallback(async (mealId: string) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal from your plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find the meal type to remove
              const mealToRemove = plannedMeals.find(meal => meal.id === mealId);
              if (mealToRemove) {
                const result = await removeMealFromPlan(selectedDate, mealToRemove.mealType);
                
                if (result.success) {
                  console.log('✅ Meal removed successfully');
                } else {
                  Alert.alert('Error', result.error || 'Failed to remove meal');
                }
              }
            } catch (error) {
              console.error('❌ Error removing meal:', error);
              Alert.alert('Error', 'Failed to remove meal');
            }
          }
        }
      ]
    );
  }, [selectedDate, plannedMeals, removeMealFromPlan]);

  const getMealsByType = useCallback((mealType: MealType) => {
    const meals = plannedMeals.filter(meal => meal.mealType === mealType);
    console.log(`📊 Meals for ${mealType}:`, meals.length);
    return meals;
  }, [plannedMeals]);

  const getMealTypeColor = useCallback((mealType: MealType) => {
    const colors = {
      breakfast: Colors.breakfast,
      lunch: Colors.lunch,
      dinner: Colors.dinner,
      snack: Colors.snack,
    };
    return colors[mealType];
  }, []);

  const navigateToDate = useCallback((days: number) => {
    const newDate = addDays(selectedDate, days);
    setSelectedDate(newDate);
  }, [selectedDate, setSelectedDate]);

  const getMealDetails = useCallback((mealId: string) => {
    return meals.find(meal => meal.id === mealId);
  }, [meals]);

  // Helper function to safely format cooking time
  const getFormattedCookingTime = useCallback((cookingTime: number): string => {
    if (cookingTime < 60) {
      return `${cookingTime}min`;
    } else {
      const hours = Math.floor(cookingTime / 60);
      const minutes = cookingTime % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  }, []);

  // Render function for meal type sections
  const renderMealTypeSection = useCallback((mealType: typeof mealTypes[0]) => {
    const typeMeals = getMealsByType(mealType.type);
    
    console.log(`🎨 Rendering ${mealType.type} section with ${typeMeals.length} meals`);
    
    return (
      <View key={mealType.type} style={styles.mealTypeSection}>
        <View style={styles.mealTypeHeader}>
          <View style={styles.mealTypeTitle}>
            <Ionicons 
              name={mealType.icon as any} 
              size={20} 
              color={getMealTypeColor(mealType.type)} 
            />
            <Text style={styles.mealTypeLabel}>{mealType.label}</Text>
            <Text style={styles.mealCount}>({typeMeals.length})</Text>
          </View>
          <TouchableOpacity 
            style={styles.addTypeButton}
            onPress={() => {
              setSelectedMealType(mealType.type);
              setShowMealModal(true);
            }}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {typeMeals.length > 0 ? (
          <View style={styles.plannedMealsList}>
            {typeMeals.map(plannedMeal => {
              const mealDetails = getMealDetails(plannedMeal.mealId);
              if (!mealDetails) {
                console.log('❌ Meal details not found for:', plannedMeal.mealId);
                return null;
              }

              return (
                <View key={plannedMeal.id} style={styles.plannedMealItem}>
                  <View style={styles.plannedMealInfo}>
                    <Text style={styles.mealTime}>{plannedMeal.scheduledTime}</Text>
                    <Text style={styles.mealName}>{mealDetails.title}</Text>
                    <Text style={styles.mealMeta}>
                      {getFormattedCookingTime(mealDetails.cookingTime)} • {mealDetails.calories} cal
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removePlannedMeal}
                    onPress={() => handleRemoveMeal(plannedMeal.id)}
                  >
                    <Ionicons name="close" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyMealType}>
            <Text style={styles.emptyMealTypeText}>
              No meals planned for {mealType.label.toLowerCase()}
            </Text>
            <Text style={styles.emptyMealTypeSubtext}>
              Tap the + button to add a meal
            </Text>
          </View>
        )}
      </View>
    );
  }, [getMealsByType, getMealTypeColor, getMealDetails, handleRemoveMeal, getFormattedCookingTime]);

  const loading = planLoading || localLoading;

  if (loading && weeklyPlan.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="restaurant-outline" size={48} color={Colors.primary} />
        <Text style={styles.loadingText}>Loading meal plan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Meal Planning</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => {
            console.log('🔄 Manual refresh triggered');
            refresh();
          }}
        >
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Date</Text>
          <View style={styles.dateSelector}>
            <TouchableOpacity 
              style={styles.dateNavButton}
              onPress={() => navigateToDate(-1)}
            >
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {format(selectedDate, 'EEEE, MMMM do')}
              </Text>
              <Text style={styles.dateSubtext}>
                {format(selectedDate, 'yyyy')}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.dateNavButton}
              onPress={() => navigateToDate(1)}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Debug Info */}
        {lastAddedMeal && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>Last added: {lastAddedMeal}</Text>
            <Text style={styles.debugText}>Total meals: {plannedMeals.length}</Text>
          </View>
        )}

        {/* Add Meal Button */}
        <TouchableOpacity 
          style={styles.addMealButton}
          onPress={() => setShowMealModal(true)}
          disabled={loading}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addMealButtonText}>
            {loading ? 'Adding...' : 'Add Meal to Plan'}
          </Text>
        </TouchableOpacity>

        {/* Planned Meals by Type */}
        {mealTypes.map(renderMealTypeSection)}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Meal Selection Modal */}
      <Modal
        visible={showMealModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !loading && setShowMealModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => !loading && setShowMealModal(false)}
              style={styles.modalCloseButton}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Meal to Plan</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Meal Type Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Meal Type</Text>
              <View style={styles.mealTypeGrid}>
                {mealTypes.map(type => (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.mealTypeOption,
                      selectedMealType === type.type && styles.mealTypeOptionSelected
                    ]}
                    onPress={() => setSelectedMealType(type.type)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={selectedMealType === type.type ? '#fff' : getMealTypeColor(type.type)} 
                    />
                    <Text style={[
                      styles.mealTypeOptionText,
                      selectedMealType === type.type && styles.mealTypeOptionTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeSlotsContainer}>
                  {timeSlots.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        scheduledTime === time && styles.timeSlotSelected
                      ]}
                      onPress={() => setScheduledTime(time)}
                      disabled={loading}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        scheduledTime === time && styles.timeSlotTextSelected
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Search and Meal Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Select Meal</Text>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={Colors.textLight}
                  editable={!loading}
                />
              </View>

              {/* Meal List */}
              <View style={styles.mealList}>
                {filteredMeals.length > 0 ? (
                  filteredMeals.map(meal => (
                    <TouchableOpacity
                      key={meal.id}
                      style={styles.mealOption}
                      onPress={() => handleAddMeal(meal)}
                      disabled={loading}
                    >
                      <View style={styles.mealOptionContent}>
                        <Text style={styles.mealOptionTitle}>{meal.title}</Text>
                        <Text style={styles.mealOptionDescription} numberOfLines={2}>
                          {meal.description}
                        </Text>
                        <View style={styles.mealOptionMeta}>
                          <Text style={styles.mealOptionMetaText}>
                            {getFormattedCookingTime(meal.cookingTime)} • {meal.calories} cal
                          </Text>
                        </View>
                      </View>
                      {loading ? (
                        <Ionicons name="time-outline" size={24} color={Colors.textLight} />
                      ) : (
                        <Ionicons name="add-circle" size={24} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={48} color={Colors.border} />
                    <Text style={styles.noResultsText}>No recipes found</Text>
                    <Text style={styles.noResultsSubtext}>
                      {searchQuery ? 'Try a different search term' : 'Add some recipes first'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  refreshButton: {
    padding: Layout.spacing.xs,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: Layout.spacing.lg,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateNavButton: {
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.border + '30',
  },
  dateDisplay: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Layout.spacing.md,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  dateSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  debugInfo: {
    margin: Layout.spacing.lg,
    marginTop: 0,
    padding: Layout.spacing.md,
    backgroundColor: Colors.warning + '20',
    borderRadius: Layout.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  debugText: {
    fontSize: 12,
    color: Colors.warning,
    fontFamily: 'monospace',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    gap: Layout.spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addMealButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTypeSection: {
    margin: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  mealTypeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  mealCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  addTypeButton: {
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: Colors.border + '30',
  },
  plannedMealsList: {
    gap: Layout.spacing.sm,
  },
  plannedMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plannedMealInfo: {
    flex: 1,
  },
  mealTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  mealMeta: {
    fontSize: 12,
    color: Colors.textLight,
  },
  removePlannedMeal: {
    padding: Layout.spacing.xs,
  },
  emptyMealType: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyMealTypeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Layout.spacing.xs,
  },
  emptyMealTypeSubtext: {
    fontSize: 12,
    color: Colors.textLight + '80',
  },
  bottomPadding: {
    height: Layout.spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: Layout.spacing.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  modalSection: {
    marginBottom: Layout.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  mealTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.border + '30',
    gap: Layout.spacing.xs,
    minWidth: 110,
  },
  mealTypeOptionSelected: {
    backgroundColor: Colors.primary,
  },
  mealTypeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  mealTypeOptionTextSelected: {
    color: '#fff',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  timeSlot: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.border + '30',
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  mealList: {
    gap: Layout.spacing.sm,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealOptionContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  mealOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  mealOptionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: Layout.spacing.xs,
  },
  mealOptionMeta: {
    flexDirection: 'row',
  },
  mealOptionMetaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textLight + '80',
    textAlign: 'center',
  },
});