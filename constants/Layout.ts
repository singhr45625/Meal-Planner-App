import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  
  // Typography
  typography: {
    h1: { fontSize: 32, lineHeight: 40, fontWeight: 'bold' as const },
    h2: { fontSize: 24, lineHeight: 32, fontWeight: 'bold' as const },
    h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: 'normal' as const },
    caption: { fontSize: 14, lineHeight: 20, fontWeight: 'normal' as const },
    small: { fontSize: 12, lineHeight: 16, fontWeight: 'normal' as const },
  },
};