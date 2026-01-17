import { Stack } from 'expo-router';
import { View } from 'react-native';
import { palette } from '../theme/palette';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: palette.darkBg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.darkBg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="screens" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
