import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { HealthDataProvider } from '@/context/HealthDataContext';
import { ProfileProvider } from '@/context/ProfileContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({ SourceSansPro_700Bold });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <ProfileProvider>
        <HealthDataProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="water" options={{ headerShown: false }} />
            <Stack.Screen name="diet" options={{ title: 'Diet' }} />
            <Stack.Screen name="weight" options={{ headerShown: false }} />
            <Stack.Screen name="sleep" options={{ headerShown: false }} />
            <Stack.Screen name="steps" options={{ headerShown: false }} />
            <Stack.Screen name="wellness" options={{ title: 'Wellness' }} />
          </Stack>
        </HealthDataProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}