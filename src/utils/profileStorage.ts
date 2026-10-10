import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  name: string;
  age: number;
  heightCm: number;
  goalWeightKg: number;
  dailyWaterGoalL: number;
  dailyStepGoal: number;
  dailySleepGoalHours: number;
  dailyCalorieGoal: number;
  wellnessStatus?: string;
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
  dailySleepGoalHours: 8,
  dailyCalorieGoal: 2000,
  wellnessStatus: 'Okay',
});

/**
 * Load user profile from local storage
 */
export const loadProfile = async (): Promise<UserProfile> => {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (profileJson !== null) {
      const parsed = JSON.parse(profileJson) as Partial<UserProfile> | null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const defaults = getDefaultProfile();
        return {
          ...defaults,
          ...parsed,
          name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : defaults.name,
          age: typeof parsed.age === 'number' && Number.isFinite(parsed.age) ? parsed.age : defaults.age,
          heightCm: typeof parsed.heightCm === 'number' && Number.isFinite(parsed.heightCm)
            ? parsed.heightCm
            : defaults.heightCm,
          goalWeightKg: typeof parsed.goalWeightKg === 'number' && Number.isFinite(parsed.goalWeightKg)
            ? parsed.goalWeightKg
            : defaults.goalWeightKg,
          dailyWaterGoalL: typeof parsed.dailyWaterGoalL === 'number' && Number.isFinite(parsed.dailyWaterGoalL)
            ? parsed.dailyWaterGoalL
            : defaults.dailyWaterGoalL,
          dailyStepGoal: typeof parsed.dailyStepGoal === 'number' && Number.isFinite(parsed.dailyStepGoal)
            ? parsed.dailyStepGoal
            : defaults.dailyStepGoal,
          dailySleepGoalHours: typeof parsed.dailySleepGoalHours === 'number'
            && Number.isFinite(parsed.dailySleepGoalHours)
            && parsed.dailySleepGoalHours > 0
            && parsed.dailySleepGoalHours <= 24
            ? parsed.dailySleepGoalHours
            : defaults.dailySleepGoalHours,
          dailyCalorieGoal: typeof parsed.dailyCalorieGoal === 'number'
            && Number.isInteger(parsed.dailyCalorieGoal)
            && parsed.dailyCalorieGoal > 0
            && parsed.dailyCalorieGoal <= 10000
            ? parsed.dailyCalorieGoal
            : defaults.dailyCalorieGoal,
          wellnessStatus: typeof parsed.wellnessStatus === 'string'
            ? parsed.wellnessStatus
            : defaults.wellnessStatus,
        };
      }
    }
    // Return default profile if none saved or stored data is invalid
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