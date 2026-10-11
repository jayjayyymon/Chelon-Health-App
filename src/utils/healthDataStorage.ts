import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SleepEntry, StepsEntry, WaterGlass } from '@/context/HealthDataContext';
import { getLocalDateKey } from '@/utils/dietStorage';

const WATER_STORAGE_KEY = '@healthapp_waterGlasses';
const SLEEP_STORAGE_KEY = '@healthapp_sleepHistory';
const STEPS_STORAGE_KEY = '@healthapp_stepsHistory';

let writeQueue = Promise.resolve();

const queueWrite = (key: string, value: unknown): Promise<void> => {
  writeQueue = writeQueue.then(async () => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  });
  return writeQueue;
};

const isDateKey = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && getLocalDateKey(date) === value;
};

const legacyDateKey = (value: unknown): string => {
  if (isDateKey(value)) return value;
  if (typeof value === 'string') {
    const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
    if (!Number.isNaN(parsed.getTime())) return getLocalDateKey(parsed);
  }
  return getLocalDateKey();
};

const normalizeWaterGlass = (value: unknown): WaterGlass | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const glass = value as Partial<WaterGlass>;
  if (
    typeof glass.id !== 'string'
    || typeof glass.time !== 'string'
    || typeof glass.amountMl !== 'number'
    || !Number.isFinite(glass.amountMl)
    || glass.amountMl <= 0
    || glass.amountMl > 5000
  ) return null;

  return {
    id: glass.id,
    time: glass.time,
    amountMl: glass.amountMl,
    dateKey: legacyDateKey(glass.dateKey),
  };
};

const normalizeSleepEntry = (value: unknown): SleepEntry | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Partial<SleepEntry>;
  if (
    typeof entry.id !== 'string'
    || typeof entry.hours !== 'number'
    || !Number.isFinite(entry.hours)
    || entry.hours <= 0
    || entry.hours > 24
  ) return null;

  const dateKey = legacyDateKey(entry.dateKey ?? entry.date);
  return {
    id: entry.id,
    date: dateKey,
    dateKey,
    hours: entry.hours,
    bedtime: typeof entry.bedtime === 'string' ? entry.bedtime : undefined,
    wakeTime: typeof entry.wakeTime === 'string' ? entry.wakeTime : undefined,
  };
};

const normalizeStepsEntry = (value: unknown): StepsEntry | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entry = value as Partial<StepsEntry>;
  if (
    typeof entry.id !== 'string'
    || typeof entry.steps !== 'number'
    || !Number.isFinite(entry.steps)
    || entry.steps < 0
    || entry.steps > 200000
  ) return null;

  const dateKey = legacyDateKey(entry.dateKey ?? entry.date);
  return {
    id: entry.id,
    date: dateKey,
    dateKey,
    steps: Math.floor(entry.steps),
  };
};

async function loadArray<T>(key: string, normalize: (value: unknown) => T | null): Promise<T[] | null> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalize).filter((item): item is T => item !== null);
  } catch (error) {
    console.error(`Failed to load health data (${key}):`, error);
    return null;
  }
}

export const loadWaterGlasses = () => loadArray(WATER_STORAGE_KEY, normalizeWaterGlass);
export const loadSleepHistory = () => loadArray(SLEEP_STORAGE_KEY, normalizeSleepEntry);
export const loadStepsHistory = () => loadArray(STEPS_STORAGE_KEY, normalizeStepsEntry);

export const saveWaterGlasses = (value: WaterGlass[]) => queueWrite(WATER_STORAGE_KEY, value);
export const saveSleepHistory = (value: SleepEntry[]) => queueWrite(SLEEP_STORAGE_KEY, value);
export const saveStepsHistory = (value: StepsEntry[]) => queueWrite(STEPS_STORAGE_KEY, value);
