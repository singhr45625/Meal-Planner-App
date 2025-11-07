import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { format } from 'date-fns';
import { MealPlan } from '../constants/Types';

interface MealPlanDayProps {
  mealPlan: MealPlan;
  onPress: (mealPlan: MealPlan) => void;
  isToday: boolean;
}

export const MealPlanDay: React.FC<MealPlanDayProps> = ({ 
  mealPlan, 
  onPress, 
  isToday 
}) => {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <TouchableOpacity 
      style={[styles.container, isToday && styles.todayContainer]}
      onPress={() => onPress(mealPlan)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.dayName, isToday && styles.todayText]}>
          {format(mealPlan.date, 'EEE')}
        </Text>
        <Text style={[styles.date, isToday && styles.todayText]}>
          {format(mealPlan.date, 'd')}
        </Text>
      </View>

      <View style={styles.mealsContainer}>
        {mealTypes.map(mealType => {
          const mealCount = mealPlan.meals.filter(meal => meal.mealType === mealType).length;
          return (
            <View key={mealType} style={styles.mealTypeRow}>
              <View style={[styles.mealTypeDot, styles[mealType]]} />
              <Text style={styles.mealTypeText}>
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </Text>
              <Text style={styles.mealCount}>{mealCount}</Text>
            </View>
          );
        })}
      </View>

      {mealPlan.totalCalories > 0 && (
        <View style={styles.caloriesContainer}>
          <Text style={styles.caloriesText}>
            {mealPlan.totalCalories} cal
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  todayContainer: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  date: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  todayText: {
    color: Colors.primary,
  },
  mealsContainer: {
    marginBottom: 12,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  breakfast: {
    backgroundColor: Colors.breakfast,
  },
  lunch: {
    backgroundColor: Colors.lunch,
  },
  dinner: {
    backgroundColor: Colors.dinner,
  },
  snack: {
    backgroundColor: Colors.snack,
  },
  mealTypeText: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  mealCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  caloriesContainer: {
    backgroundColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
});