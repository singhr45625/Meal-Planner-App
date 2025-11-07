import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  lightColor,
  darkColor,
  ...rest
}) => {
  const backgroundColor = Colors.background;

  return (
    <View
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});