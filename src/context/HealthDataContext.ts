import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { waterSummary, sleepLastNight, stepsToday, dietMeals } from '@/data/mock-data';
import { loadWeightHistory, saveWeightHistory } from '@/utils/weightStorage';
import { getLocalDateKey, loadDietMeals, saveDietMeals } from '@/utils/dietStorage';
import {
  loadSleepHistory,
  loadStepsHistory,
  loadWaterGlasses,
  saveSleepHistory,
  saveStepsHistory,
  saveWaterGlasses,
} from '@/utils/healthDataStorage';

export type WeightEntry = {
  id: string;
  date: string;
  kg: number;
};

export type WaterGlass = {
  id: string;
  time: string;
  amountMl: number;
  dateKey?: string;
};

export type SleepEntry = {
  id: string;
  date: string;
  dateKey?: string;
  hours: number;
  bedtime?: string;
  wakeTime?: string;
};

export type StepsEntry = {
  id: string;
  date: string;
  dateKey?: string;
  steps: number;
};

export type DietMeal = {
  id: string;
  name: string;
  meal: string;
  calories: number;
  dateKey?: string;
  createdAt?: string;
};

export type HealthDataContextType = {
  loading: boolean;
  weightHistory: WeightEntry[];
  setWeightHistory: Dispatch<SetStateAction<WeightEntry[]>>;
  addWeight: (entry: WeightEntry) => void;
  waterGlasses: WaterGlass[];
  setWaterGlasses: Dispatch<SetStateAction<WaterGlass[]>>;
  addWaterGlass: (glass: WaterGlass) => void;
  sleepHistory: SleepEntry[];
  setSleepHistory: Dispatch<SetStateAction<SleepEntry[]>>;
  addSleep: (entry: SleepEntry) => void;
  stepsHistory: StepsEntry[];
  setStepsHistory: Dispatch<SetStateAction<StepsEntry[]>>;
  addSteps: (entry: StepsEntry) => void;
  dietMeals: DietMeal[];
  setDietMeals: Dispatch<SetStateAction<DietMeal[]>>;
  addDietMeal: (meal: DietMeal) => void;
  updateDietMeal: (id: string, updates: Partial<Omit<DietMeal, 'id'>>) => void;
  removeDietMeal: (id: string) => void;
};

export const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

const seedWaterGlasses = (): WaterGlass[] => waterSummary.glasses.map(glass => ({
  ...glass,
  dateKey: getLocalDateKey(),
}));

const seedSleepHistory = (): SleepEntry[] => {
  const today = new Date();
  const hours = [6.8, 7.4, 6.5, 7.1, 7.8, 6.9, sleepLastNight.hours];
  return hours.map((value, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (hours.length - 1 - index));
    const dateKey = getLocalDateKey(date);
    return {
      id: `sleep-seed-${dateKey}`,
      date: dateKey,
      dateKey,
      hours: value,
      ...(index === hours.length - 1
        ? { bedtime: sleepLastNight.bedtime, wakeTime: sleepLastNight.wakeTime }
        : {}),
    };
  });
};

const seedStepsHistory = (): StepsEntry[] => {
  const today = new Date();
  const steps = [4200, 5100, 3800, 6240, 4700, 5600, stepsToday.count];
  return steps.map((value, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (steps.length - 1 - index));
    const dateKey = getLocalDateKey(date);
    return {
      id: `steps-seed-${dateKey}`,
      date: dateKey,
      dateKey,
      steps: Math.max(0, value),
    };
  });
};

export const HealthDataProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [weightHistoryState, setWeightHistoryState] = useState<WeightEntry[]>([]);
  const [waterGlassesState, setWaterGlassesState] = useState<WaterGlass[]>(seedWaterGlasses);
  const [sleepHistoryState, setSleepHistoryState] = useState<SleepEntry[]>(seedSleepHistory);
  const [stepsHistoryState, setStepsHistoryState] = useState<StepsEntry[]>(seedStepsHistory);
  const [dietMealsState, setDietMealsState] = useState<DietMeal[]>(dietMeals);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadWeightHistory(),
      loadDietMeals(),
      loadWaterGlasses(),
      loadSleepHistory(),
      loadStepsHistory(),
    ]).then(([storedWeight, storedDiet, storedWater, storedSleep, storedSteps]) => {
      if (!active) return;
      if (storedWeight !== null) setWeightHistoryState(storedWeight);
      if (storedDiet !== null) setDietMealsState(storedDiet);
      if (storedWater !== null) setWaterGlassesState(storedWater);
      if (storedSleep !== null) setSleepHistoryState(storedSleep);
      if (storedSteps !== null) setStepsHistoryState(storedSteps);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to hydrate health data:', error);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) void saveWeightHistory(weightHistoryState);
  }, [loading, weightHistoryState]);

  useEffect(() => {
    if (!loading) void saveDietMeals(dietMealsState);
  }, [loading, dietMealsState]);

  useEffect(() => {
    if (!loading) void saveWaterGlasses(waterGlassesState);
  }, [loading, waterGlassesState]);

  useEffect(() => {
    if (!loading) void saveSleepHistory(sleepHistoryState);
  }, [loading, sleepHistoryState]);

  useEffect(() => {
    if (!loading) void saveStepsHistory(stepsHistoryState);
  }, [loading, stepsHistoryState]);

  const addWeight = (entry: WeightEntry) => {
    setWeightHistoryState(prev => [...prev, entry]);
  };

  const addWaterGlass = (glass: WaterGlass) => {
    setWaterGlassesState(prev => [...prev, { ...glass, dateKey: glass.dateKey ?? getLocalDateKey() }]);
  };

  const addSleep = (entry: SleepEntry) => {
    const dateKey = entry.dateKey ?? getLocalDateKey();
    setSleepHistoryState(prev => {
      const updated = [
        ...prev.filter(item => (item.dateKey ?? item.date) !== dateKey),
        { ...entry, date: dateKey, dateKey },
      ];
      return updated.sort((a, b) => (a.dateKey ?? a.date).localeCompare(b.dateKey ?? b.date)).slice(-7);
    });
  };

  const addSteps = (entry: StepsEntry) => {
    const dateKey = entry.dateKey ?? getLocalDateKey();
    setStepsHistoryState(prev => {
      const updated = [
        ...prev.filter(item => (item.dateKey ?? item.date) !== dateKey),
        { ...entry, date: dateKey, dateKey, steps: Math.max(0, Math.floor(entry.steps)) },
      ];
      return updated.sort((a, b) => (a.dateKey ?? a.date).localeCompare(b.dateKey ?? b.date)).slice(-7);
    });
  };

  const addDietMeal = (meal: DietMeal) => {
    setDietMealsState(prev => [
      ...prev,
      {
        ...meal,
        dateKey: meal.dateKey ?? getLocalDateKey(),
        createdAt: meal.createdAt ?? new Date().toISOString(),
      },
    ]);
  };

  const updateDietMeal = (id: string, updates: Partial<Omit<DietMeal, 'id'>>) => {
    setDietMealsState(prev => prev.map(meal => (
      meal.id === id ? { ...meal, ...updates, id: meal.id } : meal
    )));
  };

  const removeDietMeal = (id: string) => {
    setDietMealsState(prev => prev.filter(meal => meal.id !== id));
  };

  return React.createElement(
    HealthDataContext.Provider,
    {
      value: {
        loading,
        weightHistory: weightHistoryState,
        setWeightHistory: setWeightHistoryState,
        addWeight,
        waterGlasses: waterGlassesState,
        setWaterGlasses: setWaterGlassesState,
        addWaterGlass,
        sleepHistory: sleepHistoryState,
        setSleepHistory: setSleepHistoryState,
        addSleep,
        stepsHistory: stepsHistoryState,
        setStepsHistory: setStepsHistoryState,
        addSteps,
        dietMeals: dietMealsState,
        setDietMeals: setDietMealsState,
        addDietMeal,
        updateDietMeal,
        removeDietMeal,
      },
    },
    children,
  );
};
