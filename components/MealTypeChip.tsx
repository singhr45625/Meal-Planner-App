import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { getMealTypeColor, getMealTypeIcon } from '../utils/helpers';

interface MealTypeChipProps {
  mealType: string;
  selected?: boolean;
  onPress?: () => void;
  showIcon?: boolean;
  size?: 'small' | 'medium';
}

export const MealTypeChip: React.FC<MealTypeChipProps> = ({
  mealType,
  selected = false,
  onPress,
  showIcon = true,
  size = 'medium',
}) => {
  const backgroundColor = getMealTypeColor(mealType);
  const iconName = getMealTypeIcon(mealType);

  const chipStyle = [
    styles.chip,
    { backgroundColor },
    selected && styles.chipSelected,
    size === 'small' && styles.chipSmall,
  ];

  const textStyle = [
    styles.text,
    size === 'small' && styles.textSmall,
  ];

  return (
    <View style={chipStyle}>
      {showIcon && (
        <Ionicons 
          name={iconName as any} 
          size={size === 'small' ? 14 : 16} 
          color={Colors.text} 
          style={styles.icon}
        />
      )}
      <Text style={textStyle}>
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.round,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  chipSmall: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
  },
  icon: {
    marginRight: Layout.spacing.xs,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  textSmall: {
    fontSize: 12,
  },
});