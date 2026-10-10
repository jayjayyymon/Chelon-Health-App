import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  age: number;
  heightCm: number;
  goalWeightKg: number;
  dailyWaterGoalL: number;
  dailyStepGoal: number;
};

const STORAGE_KEY = '@healthapp_userProfile';

/**
 * Get default profile data (fallback if no saved data)
 */
export const getDefaultProfile = (): UserProfile => ({
  name: 'Alex Rivera',
  age: 28,
  heightCm: 170,
  goalWeightKg: 68,
  dailyWaterGoalL: 2.5,
  dailyStepGoal: 8000,
});

/**
 * Load user profile from local storage
 */
export const loadProfile = async (): Promise<UserProfile> => {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (profileJson !== null) {
      return JSON.parse(profileJson);
    }
    // Return default profile if none saved
    return getDefaultProfile();
  } catch (error) {
    console.error('Failed to load profile:', error);
    // Return default profile on error
    return getDefaultProfile();
  }
};

/**
 * Save user profile to local storage
 */
export const saveProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save profile:', error);
    throw error;
  }
};