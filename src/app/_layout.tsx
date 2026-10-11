import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HealthDataProvider, useHealthData } from '@/context/HealthDataContext';
import { ProfileProvider, useSharedProfile } from '@/context/ProfileContext';

SplashScreen.preventAutoHideAsync();

function AppGate() {
  const { loading: profileLoading } = useSharedProfile();
  const { loading: healthDataLoading } = useHealthData();

  if (profileLoading || healthDataLoading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Loading your profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="water" options={{ headerShown: false }} />
      <Stack.Screen name="diet" options={{ headerShown: false }} />
      <Stack.Screen name="weight" options={{ headerShown: false }} />
      <Stack.Screen name="sleep" options={{ headerShown: false }} />
      <Stack.Screen name="steps" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="edit-goals" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="wellness" options={{ title: 'Wellness' }} />
      <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({ SourceSansPro_700Bold });

  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <ProfileProvider>
        <HealthDataProvider>
          <AppGate />
        </HealthDataProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}
