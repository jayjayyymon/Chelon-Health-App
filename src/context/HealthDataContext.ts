import React, { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { weightHistory, waterSummary, sleepLastNight, stepsToday, dietMeals } from '@/data/mock-data';
import { loadWeightHistory, saveWeightHistory } from '@/utils/weightStorage';

export type WeightEntry = {
  id: string;
  date: string;
  kg: number;
};

export type WaterGlass = {
  id: string;
  time: string;
  amountMl: number;
};

export type SleepEntry = {
  id: string;
  date: string;
  hours: number;
  bedtime?: string;
  wakeTime?: string;
};

export type StepsEntry = {
  id: string;
  date: string;
  steps: number;
};

export type DietMeal = {
  id: string;
  name: string;
  meal: string;
  calories: number;
};

export type HealthDataContextType = {
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
  removeDietMeal: (id: string) => void;
};

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }: { children: ReactNode }) => {
  const [weightHistoryState, setWeightHistoryState] = useState<WeightEntry[]>(weightHistory);
  const [weightHistoryHydrated, setWeightHistoryHydrated] = useState(false);
  const [waterGlassesState, setWaterGlassesState] = useState<WaterGlass[]>(waterSummary.glasses);

  useEffect(() => {
    let active = true;

    loadWeightHistory().then(storedHistory => {
      if (!active) return;
      if (storedHistory !== null) setWeightHistoryState(storedHistory);
      setWeightHistoryHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (weightHistoryHydrated) {
      void saveWeightHistory(weightHistoryState);
    }
  }, [weightHistoryHydrated, weightHistoryState]);
  const [dietMealsState, setDietMealsState] = useState<DietMeal[]>(dietMeals);

  const generateMockSleepData = (): SleepEntry[] => {
    const baseDate = new Date(sleepLastNight.date);
    const baseHours = sleepLastNight.hours;
    const mockData: SleepEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const hours = baseHours + (Math.random() - 0.5) * 2;
      mockData.push({
        id: `sleep-${i}`,
        date: dateString,
        hours: parseFloat(hours.toFixed(1)),
      });
    }
    return mockData.reverse();
  };

  const [sleepHistoryState, setSleepHistoryState] = useState<SleepEntry[]>(() => {
    const mockData = generateMockSleepData();
    const actualIndex = mockData.length - 1;
    mockData[actualIndex] = {
      id: 'sleep-actual',
      date: sleepLastNight.date,
      hours: sleepLastNight.hours,
      bedtime: sleepLastNight.bedtime,
      wakeTime: sleepLastNight.wakeTime,
    };
    return mockData;
  });

  const generateMockStepsData = (): StepsEntry[] => {
    const baseDate = new Date();
    const baseSteps = stepsToday.count;
    const mockData: StepsEntry[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const steps = baseSteps + Math.floor((Math.random() - 0.5) * 2000);
      mockData.push({
        id: `steps-${i}`,
        date: dateString,
        steps: Math.max(steps, 1000),
      });
    }
    return mockData.reverse();
  };

  const [stepsHistoryState, setStepsHistoryState] = useState<StepsEntry[]>(() => {
    const mockData = generateMockStepsData();
    const actualIndex = mockData.length - 1;
    mockData[actualIndex] = {
      id: 'steps-actual',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      steps: stepsToday.count,
    };
    return mockData;
  });

  const addWeight = (entry: WeightEntry) => {
    setWeightHistoryState(prev => [...prev, entry]);
  };

  const addWaterGlass = (glass: WaterGlass) => {
    setWaterGlassesState(prev => [...prev, glass]);
  };

  const addSleep = (entry: SleepEntry) => {
    setSleepHistoryState(prev => {
      const updated = [...prev, entry];
      return updated.slice(-7);
    });
  };

  const addSteps = (entry: StepsEntry) => {
    setStepsHistoryState(prev => {
      const updated = [...prev, entry];
      return updated.slice(-7);
    });
  };

  const addDietMeal = (meal: DietMeal) => {
    setDietMealsState(prev => [...prev, meal]);
  };

  const removeDietMeal = (id: string) => {
    setDietMealsState(prev => prev.filter(meal => meal.id !== id));
  };

  return React.createElement(
    HealthDataContext.Provider,
    {
      value: {
        weightHistory: weightHistoryState,
        setWeightHistory: setWeightHistoryState,
        addWeight: addWeight,
        waterGlasses: waterGlassesState,
        setWaterGlasses: setWaterGlassesState,
        addWaterGlass: addWaterGlass,
        sleepHistory: sleepHistoryState,
        setSleepHistory: setSleepHistoryState,
        addSleep: addSleep,
        stepsHistory: stepsHistoryState,
        setStepsHistory: setStepsHistoryState,
        addSteps: addSteps,
        dietMeals: dietMealsState,
        setDietMeals: setDietMealsState,
        addDietMeal: addDietMeal,
        removeDietMeal: removeDietMeal,
      }
    },
    children
  );
};