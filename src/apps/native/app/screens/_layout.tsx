import { Stack } from 'expo-router';
import { palette } from '../../theme/palette';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.darkBg },
        animation: 'slide_from_right',
      }}
    />
  );
}
