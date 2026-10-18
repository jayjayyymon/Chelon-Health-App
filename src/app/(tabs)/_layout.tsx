import AppTabs from '@/components/app-tabs';
import { ProfileContext } from '@/context/ProfileContext';
import { HealthDataContext } from '@/context/HealthDataContext';
import { useContext } from 'react';
import { getDefaultProfile } from '@/utils/profileStorage';

export default function TabsLayout() {
  const profileContext = useContext(ProfileContext);
  const healthDataContext = useContext(HealthDataContext);

  const defaultProfileValue = {
    profile: getDefaultProfile(),
    loading: true,
    updateProfile: () => {},
    saveProfile: async () => false,
    resetProfile: async () => false,
  };

  const defaultHealthDataValue = {
    loading: true,
    weightHistory: [],
    setWeightHistory: () => {},
    addWeight: () => {},
    waterGlasses: [],
    setWaterGlasses: () => {},
    addWaterGlass: () => {},
    sleepHistory: [],
    setSleepHistory: () => {},
    addSleep: () => {},
    stepsHistory: [],
    setStepsHistory: () => {},
    addSteps: () => {},
    dietMeals: [],
    setDietMeals: () => {},
    addDietMeal: () => {},
    updateDietMeal: () => {},
    removeDietMeal: () => {},
  };

  const profileValue = profileContext !== undefined ? profileContext : defaultProfileValue;
  const healthDataValue = healthDataContext !== undefined ? healthDataContext : defaultHealthDataValue;

  return (
    <ProfileContext.Provider value={profileValue}>
      <HealthDataContext.Provider value={healthDataValue}>
        <AppTabs />
      </HealthDataContext.Provider>
    </ProfileContext.Provider>
  );
}
