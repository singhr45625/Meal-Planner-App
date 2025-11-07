import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface NutritionInfoProps {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servings: number;
  showDetails?: boolean;
}

export const NutritionInfo: React.FC<NutritionInfoProps> = ({
  calories,
  protein = 0,
  carbs = 0,
  fat = 0,
  servings,
  showDetails = false,
}) => {
  const caloriesPerServing = Math.round(calories / servings);
  const proteinPerServing = Math.round(protein / servings);
  const carbsPerServing = Math.round(carbs / servings);
  const fatPerServing = Math.round(fat / servings);

  return (
    <View style={styles.container}>
      <View style={styles.caloriesContainer}>
        <Text style={styles.calories}>{caloriesPerServing}</Text>
        <Text style={styles.caloriesLabel}>calories per serving</Text>
      </View>

      {showDetails && (
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{proteinPerServing}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{carbsPerServing}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{fatPerServing}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      )}

      <Text style={styles.servings}>
        {servings} {servings === 1 ? 'serving' : 'servings'} total
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginVertical: Layout.spacing.sm,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  calories: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  caloriesLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: Layout.spacing.xs,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  servings: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});