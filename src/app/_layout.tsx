import { SourceSansPro_700Bold } from '@expo-google-fonts/source-sans-pro';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Move useEffect above conditional returns to ensure hooks are called in same order
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!loading) setLoading(false);
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading screen while checking fonts OR session
  // Original logic: return null only when !fontsLoaded && !fontError
  // We'll show loading screen in that case instead of returning null
  if ((!fontsLoaded && !fontError) || loading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ThemedText>Loading...</ThemedText>
        </ThemedView>
      </ThemeProvider>
    );
  }

  // If we have a session, show the main app
  if (session) {
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

  // If no session, show auth screen
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="auth/email-confirmation" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
