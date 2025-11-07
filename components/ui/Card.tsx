import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = true,
  padding = 'md',
}) => {
  const containerStyle = [
    styles.container,
    elevated && styles.elevated,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Layout.spacing.sm,
  },
  paddingMd: {
    padding: Layout.spacing.md,
  },
  paddingLg: {
    padding: Layout.spacing.lg,
  },
});