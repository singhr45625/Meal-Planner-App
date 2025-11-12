import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { isAuthenticated, authLoading } = useAuth();

  // Show loading indicator while checking auth status
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // This file just redirects to the appropriate screen based on auth status
  // The actual auth logic is handled in _layout.tsx
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}