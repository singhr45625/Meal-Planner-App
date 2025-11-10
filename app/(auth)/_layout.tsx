import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // REMOVE headerShown: false - we want to show headers
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: { 
          backgroundColor: Colors.background 
        },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Login', // Set specific title for login
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          title: 'Create Account', // Set specific title for signup
        }}
      />
    </Stack>
  );
}