import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { clearProfileData, getDefaultProfile, loadProfile, saveProfile, UserProfile } from '@/utils/profileStorage';

type ProfileContextType = {
  profile: UserProfile;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: (profile: UserProfile) => Promise<boolean>;
  resetProfile: () => Promise<boolean>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      const loadedProfile = await loadProfile();
      setProfile(loadedProfile);
      setLoading(false);
    };

    void loadUserProfile();
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(current => ({ ...current, ...updates }));
  };

  const saveSharedProfile = async (profileToSave: UserProfile) => {
    try {
      await saveProfile(profileToSave);
      setProfile(profileToSave);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  const resetSharedProfile = async () => {
    try {
      await clearProfileData();
      setProfile(getDefaultProfile());
      return true;
    } catch (error) {
      console.error('Error clearing profile data:', error);
      return false;
    }
  };

  return React.createElement(
    ProfileContext.Provider,
    {
      value: {
        profile,
        loading,
        updateProfile,
        saveProfile: saveSharedProfile,
        resetProfile: resetSharedProfile,
      },
    },
    children,
  );
};

export const useSharedProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useSharedProfile must be used within a ProfileProvider');
  }
  return context;
};
