import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = '@healthapp_notificationsEnabled';

export async function loadNotificationsEnabled(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load notification preference:', error);
    return false;
  }
}

export async function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
  } catch (error) {
    console.error('Failed to save notification preference:', error);
    throw error;
  }
}
