import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { PlaceholderButton } from '@/components/placeholder-button';
import { Alert, View } from 'react-native';

import { useHealthData } from '@/context/HealthDataContext';
import { Appointment, getAppointments, removeAppointment } from '@/utils/appointmentStorage';
import { useProfile } from '@/hooks/useProfile';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

export default function ProfileScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const { profile, loading: profileLoading } = useProfile();
  const { weightHistory } = useHealthData();
  const router = useRouter();

  // Calculate current weight from weight history (most recent entry)
  const currentWeight = weightHistory.length > 0
    ? weightHistory[weightHistory.length - 1].kg
    : null;

  const loadAppointments = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments]),
  );

  const isLoading = appointmentsLoading || profileLoading;

  const handleCancelAppointment = async (id: string) => {
    Alert.alert(
      'Cancel appointment?',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAppointment(id);
              // Reload appointments from storage
              await loadAppointments();
            } catch (error) {
              Alert.alert(
                'Error cancelling appointment',
                'Failed to cancel appointment. Please try again.'
              );
              console.error('Failed to cancel appointment:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer inTabs title="Profile" subtitle="Manage your health details and appointments.">
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
                <ThemedText
                  style={{ color: 'red', textAlign: 'right', marginTop: 4 }}
                  onPress={() => handleCancelAppointment(appt.id)}
                >
                  Cancel appointment
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <PlaceholderButton label="Edit profile" onPress={() => router.push('/edit-profile')} />
      <PlaceholderButton label="Edit goals" onPress={() => router.push('/edit-goals')} />
    </ScreenContainer>
  );
}