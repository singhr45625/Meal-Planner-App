import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const { isAuthenticated, authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (authLoading || !isReady) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <PaperProvider>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </PaperProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            // REMOVE duplicate header styles - let individual layouts handle them
            headerShown: false, // Let child layouts control headers
          }}
        >
          {isAuthenticated ? (
            // Authenticated user - show main app
            <>
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="meal-planning" 
                options={{ 
                  title: 'Meal Planning',
                  presentation: 'modal',
                  headerShown: true, // Show header for modals
                  headerStyle: {
                    backgroundColor: Colors.primary,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} 
              />
              <Stack.Screen 
                name="meal-detail/[id]" 
                options={{ 
                  title: 'Recipe Details',
                  headerShown: true, // Show header for detail pages
                  headerStyle: {
                    backgroundColor: Colors.primary,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} 
              />
              <Stack.Screen 
                name="create-recipe" 
                options={{ 
                  title: 'Create Recipe',
                  presentation: 'modal',
                  headerShown: true, // Show header for modals
                  headerStyle: {
                    backgroundColor: Colors.primary,
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} 
              />
            </>
          ) : (
            // Not authenticated - show auth screens
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false 
              }} 
            />
          )}
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});