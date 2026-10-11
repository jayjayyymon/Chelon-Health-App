import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'female' | 'male' | 'non_binary' | 'prefer_not_to_say';

export type PrimaryHealthGoal =
  | 'improve_fitness'
  | 'maintain_weight'
  | 'lose_weight'
  | 'gain_weight'
  | 'improve_sleep';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const HEALTH_GOAL_OPTIONS: { value: PrimaryHealthGoal; label: string }[] = [
  { value: 'improve_fitness', label: 'Improve fitness' },
  { value: 'maintain_weight', label: 'Maintain weight' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'gain_weight', label: 'Gain weight' },
  { value: 'improve_sleep', label: 'Improve sleep' },
];

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
  gender?: Gender;
  primaryHealthGoal?: PrimaryHealthGoal;
};

const STORAGE_KEY = '@healthapp_userProfile';

const isGender = (value: unknown): value is Gender => (
  value === 'female'
  || value === 'male'
  || value === 'non_binary'
  || value === 'prefer_not_to_say'
);

const isPrimaryHealthGoal = (value: unknown): value is PrimaryHealthGoal => (
  value === 'improve_fitness'
  || value === 'maintain_weight'
  || value === 'lose_weight'
  || value === 'gain_weight'
  || value === 'improve_sleep'
);

/** Get default profile data for legacy screens and incomplete records. */
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

const isInRange = (value: unknown, minimum: number, maximum: number): value is number => (
  typeof value === 'number'
  && Number.isFinite(value)
  && value >= minimum
  && value <= maximum
);

const normalizeProfile = (value: Partial<UserProfile>): UserProfile => {
  const defaults = getDefaultProfile();
  return {
    ...defaults,
    name: typeof value.name === 'string' && value.name.trim() ? value.name.trim() : defaults.name,
    age: isInRange(value.age, 13, 120) ? Math.round(value.age) : defaults.age,
    heightCm: isInRange(value.heightCm, 100, 250) ? Math.round(value.heightCm) : defaults.heightCm,
    goalWeightKg: isInRange(value.goalWeightKg, 30, 300) ? value.goalWeightKg : defaults.goalWeightKg,
    dailyWaterGoalL: isInRange(value.dailyWaterGoalL, 0.5, 10) ? value.dailyWaterGoalL : defaults.dailyWaterGoalL,
    dailyStepGoal: isInRange(value.dailyStepGoal, 1, 100000) ? Math.round(value.dailyStepGoal) : defaults.dailyStepGoal,
    dailySleepGoalHours: isInRange(value.dailySleepGoalHours, 1, 24)
      ? value.dailySleepGoalHours
      : defaults.dailySleepGoalHours,
    dailyCalorieGoal: isInRange(value.dailyCalorieGoal, 1, 10000) && Number.isInteger(value.dailyCalorieGoal)
      ? value.dailyCalorieGoal
      : defaults.dailyCalorieGoal,
    wellnessStatus: typeof value.wellnessStatus === 'string' ? value.wellnessStatus : defaults.wellnessStatus,
    gender: isGender(value.gender) ? value.gender : undefined,
    primaryHealthGoal: isPrimaryHealthGoal(value.primaryHealthGoal) ? value.primaryHealthGoal : undefined,
  };
};

/** Load and normalize the shared user profile from local storage. */
export const loadProfile = async (): Promise<UserProfile> => {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (profileJson !== null) {
      const parsed = JSON.parse(profileJson) as Partial<UserProfile> | null;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return normalizeProfile(parsed);
      }
    }
    return getDefaultProfile();
  } catch (error) {
    console.error('Failed to load profile:', error);
    return getDefaultProfile();
  }
};

/** Save the shared user profile to local storage. */
export const saveProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
  } catch (error) {
    console.error('Failed to save profile:', error);
    throw error;
  }
};

/** Remove only profile data during an explicit profile reset. */
export const clearProfileData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear profile data:', error);
    throw error;
  }
};