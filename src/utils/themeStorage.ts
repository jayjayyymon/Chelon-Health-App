import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@healthapp_theme';

export async function loadThemePreference(): Promise<'light' | 'dark' | 'system' | null> {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored as 'light' | 'dark' | 'system';
    }
    return null;
  } catch (error) {
    console.error('Failed to load theme preference:', error);
    return null;
  }
}

export async function saveThemePreference(preference: 'light' | 'dark' | 'system'): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
    throw error;
  }
}