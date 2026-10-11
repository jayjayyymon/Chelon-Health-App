import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WeightEntry } from '@/context/HealthDataContext';

const STORAGE_KEY = '@healthapp_weightHistory';

function isWeightEntry(value: unknown): value is WeightEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<WeightEntry>;
  return typeof entry.id === 'string'
    && typeof entry.date === 'string'
    && typeof entry.kg === 'number'
    && Number.isFinite(entry.kg)
    && entry.kg > 0
    && entry.kg <= 500;
}

export async function loadWeightHistory(): Promise<WeightEntry[] | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;

    const entries = parsed.filter(isWeightEntry);
    return entries.length === parsed.length ? entries : null;
  } catch (error) {
    console.error('Failed to load weight history:', error);
    return null;
  }
}

export async function saveWeightHistory(history: WeightEntry[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Failed to save weight history:', error);
    return false;
  }
}
