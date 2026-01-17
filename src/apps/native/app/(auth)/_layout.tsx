import { Stack } from 'expo-router';
import { palette } from '../../theme/palette';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.darkBg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="verify-car-owner" />
      <Stack.Screen name="verify-garage-owner" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
