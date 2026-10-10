import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getDefaultProfile, loadProfile, saveProfile, UserProfile } from '@/utils/profileStorage';

type ProfileContextType = {
  profile: UserProfile;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: (profile: UserProfile) => Promise<boolean>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      setProfile(await loadProfile());
      setLoading(false);
    };

    loadUserProfile();
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

  return React.createElement(
    ProfileContext.Provider,
    {
      value: {
        profile,
        loading,
        updateProfile,
        saveProfile: saveSharedProfile,
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
