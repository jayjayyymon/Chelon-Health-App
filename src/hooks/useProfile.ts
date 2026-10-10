import { useState, useEffect } from 'react';
import { loadProfile, saveProfile, UserProfile } from '@/utils/profileStorage';

/**
 * Hook to manage user profile data with persistence
 * Returns [profile, setProfile, saveProfileFn]
 */
export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const savedProfile = await loadProfile();
        setProfile(savedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Function to update profile state
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  // Function to persist profile to storage
  const saveProfileToStorage = async (profileToSave: UserProfile) => {
    try {
      await saveProfile(profileToSave);
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  return { profile, loading, updateProfile, saveProfile: saveProfileToStorage };
};