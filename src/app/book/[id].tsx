import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Spacing } from '@/constants/theme';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>() || {};

  // Mock doctor data - in a real app, this would come from a database or context
  const doctors = [
    { id: 'd1', name: 'Dr. Maya Chen', specialty: 'General practice', nextSlot: 'Tomorrow, 10:30 AM' },
    { id: 'd2', name: 'Dr. Omar Hassan', specialty: 'Nutrition', nextSlot: 'Fri, 2:00 PM' },
    { id: 'd3', name: 'Dr. Priya Nair', specialty: 'Sleep medicine', nextSlot: 'Mon, 9:15 AM' },
  ];

  // Handle missing or invalid ID gracefully
  if (!id) {
    return (
      <ScreenContainer inTabs title="Error" subtitle="Invalid doctor selection">
        <ThemedText>Please select a valid doctor from the list.</ThemedText>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>
      </ScreenContainer>
    );
  }

  const selectedDoctor = doctors.find(doc => doc.id === id) || {
    id,
    name: 'Doctor not found',
    specialty: 'Not specified',
    nextSlot: 'Not available'
  };

  return (
    <ScreenContainer inTabs title="Book Appointment" subtitle={selectedDoctor.name}>
      <SectionCard title="Selected Doctor">
        <InfoRow label="Doctor" value={selectedDoctor.name} />
        <InfoRow label="Specialty" value={selectedDoctor.specialty} />
        <InfoRow label="Next available slot" value={selectedDoctor.nextSlot} />
      </SectionCard>

      <SectionCard title="Appointment Date & Time">
        <ThemedView type="backgroundElement" style={styles.placeholderBox}>
          <ThemedText>Date and time selection controls</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            (Implementation coming in future update)
          </ThemedText>
        </ThemedView>
        <PlaceholderButton label="Select Date and Time" />
      </SectionCard>

      <View style={styles.buttonContainer}>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>

        <Pressable style={[styles.bookButton, styles.disabledButton]}>
          <PlaceholderButton label="Book Appointment" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  placeholderBox: {
    padding: Spacing.three,
    textAlign: 'center',
    marginVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  buttonContainer: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  backButton: {
    flex: 1,
    marginRight: Spacing.one / 2,
  },
  bookButton: {
    flex: 1,
    marginLeft: Spacing.one / 2,
    opacity: 0.5, // Disabled look
  },
  disabledButton: {
    opacity: 0.5,
  },
});