import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { userProfile } from '@/data/mock-data';

import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { getAppointments } from '@/utils/appointmentStorage';

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
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  return (
    <ScreenContainer inTabs title="Profile" subtitle="Local mock user. No authentication is used.">
      <SectionCard title="Account">
        <InfoRow label="Name" value={userProfile.name} />
        <InfoRow label="Age" value={`${userProfile.age}`} />
        <InfoRow label="Height" value={`${userProfile.heightCm} cm`} />
      </SectionCard>

      <SectionCard title="Goals">
        <InfoRow label="Weight" value={`${userProfile.goalWeightKg} kg`} />
        <InfoRow label="Water" value={`${userProfile.dailyWaterGoalL} L / day`} />
        <InfoRow label="Steps" value={`${userProfile.dailyStepGoal}`} />
      </SectionCard>

      <SectionCard title="Appointments">
        {loading ? (
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

      <PlaceholderButton label="Edit profile (placeholder)" />
    </ScreenContainer>
  );
}