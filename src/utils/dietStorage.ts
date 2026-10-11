import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DietMeal } from '@/context/HealthDataContext';

export const DIET_STORAGE_KEY = '@healthapp_dietMeals';

export const getLocalDateKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidDateKey = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && getLocalDateKey(date) === value;
};

const normalizeMeal = (value: unknown): DietMeal | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const meal = value as Partial<DietMeal>;
  if (
    typeof meal.id !== 'string' ||
    typeof meal.name !== 'string' ||
    meal.name.trim() === '' ||
    typeof meal.meal !== 'string' ||
    meal.meal.trim() === '' ||
    typeof meal.calories !== 'number' ||
    !Number.isInteger(meal.calories) ||
    !Number.isFinite(meal.calories) ||
    meal.calories <= 0
  ) {
    return null;
  }

  return {
    id: meal.id,
    name: meal.name,
    meal: meal.meal,
    calories: meal.calories,
    dateKey: isValidDateKey(meal.dateKey) ? meal.dateKey : getLocalDateKey(),
    createdAt: typeof meal.createdAt === 'string' ? meal.createdAt : new Date().toISOString(),
  };
};

export const loadDietMeals = async (): Promise<DietMeal[] | null> => {
  try {
    const stored = await AsyncStorage.getItem(DIET_STORAGE_KEY);
    if (stored === null) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMeal).filter((meal): meal is DietMeal => meal !== null);
  } catch (error) {
    console.error('Failed to load diet meals:', error);
    return null;
  }
};

export const saveDietMeals = async (meals: DietMeal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(DIET_STORAGE_KEY, JSON.stringify(meals));
  } catch (error) {
    console.error('Failed to save diet meals:', error);
  }
};
