import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="water" options={{ title: 'Water' }} />
        <Stack.Screen name="diet" options={{ title: 'Diet' }} />
        <Stack.Screen name="weight" options={{ title: 'Weight' }} />
        <Stack.Screen name="sleep" options={{ title: 'Sleep' }} />
        <Stack.Screen name="steps" options={{ title: 'Steps' }} />
        <Stack.Screen name="wellness" options={{ title: 'Wellness' }} />
      </Stack>
    </ThemeProvider>
  );
}
