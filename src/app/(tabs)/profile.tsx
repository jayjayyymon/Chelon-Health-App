import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { PlaceholderButton } from '@/components/placeholder-button';

import { useHealthData } from '@/context/HealthDataContext';
import { getAppointments } from '@/utils/appointmentStorage';
import { loadProfile } from '@/utils/profileStorage';
import type { UserProfile } from '@/utils/profileStorage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useIsFocused } from 'expo-router';

export type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  timestamp: number;
};

export default function ProfileScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { weightHistory } = useHealthData();
  const router = useRouter();
  const isFocused = useIsFocused();

  // Calculate current weight from weight history (most recent entry)
  const currentWeight = weightHistory.length > 0
    ? weightHistory[weightHistory.length - 1].kg
    : null;

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const savedAppointments = await getAppointments();
      // Sort by timestamp ascending (upcoming first)
      const sorted = [...savedAppointments].sort((a, b) => a.timestamp - b.timestamp);
      setAppointments(sorted);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    setProfileLoading(true);
    try {
      const savedProfile = await loadProfile();
      setProfile(savedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []); // load on mount

  useEffect(() => {
    if (isFocused) {
      loadUserProfile();
    }
  }, [isFocused]);

  const isLoading = appointmentsLoading || profileLoading;

  return (
    <ScreenContainer inTabs title="Profile" subtitle="Local mock user. No authentication is used.">
      <SectionCard title="Account">
        {isLoading ? (
          <ThemedText>Loading profile data...</ThemedText>
        ) : profile ? (
          <>
            <InfoRow label="Name" value={profile.name} />
            <InfoRow label="Age" value={`${profile.age}`} />
            <InfoRow label="Weight" value={currentWeight !== null ? `${currentWeight} kg` : '-- kg'} />
            <InfoRow label="Height" value={`${profile.heightCm} cm`} />
          </>
        ) : (
          <ThemedText>Error loading profile</ThemedText>
        )}
      </SectionCard>

      <SectionCard title="Goals">
        {isLoading ? (
          <ThemedText>Loading...</ThemedText>
        ) : profile ? (
          <>
            <InfoRow label="Weight" value={`${profile.goalWeightKg} kg`} />
            <InfoRow label="Water" value={`${profile.dailyWaterGoalL} L / day`} />
            <InfoRow label="Steps" value={`${profile.dailyStepGoal}`} />
          </>
        ) : (
          <ThemedText>Error loading goals</ThemedText>
        )}
      </SectionCard>

      <SectionCard title="Appointments">
        {appointmentsLoading ? (
          <ThemedText>Loading...</ThemedText>
        ) : appointments.length === 0 ? (
          <ThemedText>No upcoming appointments</ThemedText>
        ) : (
          <View>
            {appointments.map((appt) => (
              <View key={appt.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                <ThemedText themeColor="textSecondary">Doctor:</ThemedText>
                <ThemedText>{appt.doctorName}</ThemedText>
                <ThemedText themeColor="textSecondary">Specialty:</ThemedText>
                <ThemedText>{appt.specialty}</ThemedText>
                <ThemedText themeColor="textSecondary">Date:</ThemedText>
                <ThemedText>{appt.date}</ThemedText>
                <ThemedText themeColor="textSecondary">Time:</ThemedText>
                <ThemedText>{appt.time}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <PlaceholderButton label="Edit profile" onPress={() => router.push('/edit-profile')} />
    </ScreenContainer>
  );
}