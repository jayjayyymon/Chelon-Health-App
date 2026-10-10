import { useSharedProfile } from '@/context/ProfileContext';

/**
 * Hook to access shared user profile data and persistence.
 */
export const useProfile = () => useSharedProfile();
