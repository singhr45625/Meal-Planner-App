import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  type = 'default',
  ...rest
}) => {
  return (
    <Text
      style={[
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: Colors.primary,
  },
});