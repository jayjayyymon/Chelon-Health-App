import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlaceholderButton } from '@/components/placeholder-button';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export default function AppointmentConfirmationScreen() {
  const { doctorName, specialty, date, time } = useLocalSearchParams<{
    doctorName?: string;
    specialty?: string;
    date?: string;
    time?: string;
  }>() || {};

  // Handle missing parameters gracefully
  if (!doctorName || !specialty || !date || !time) {
    return (
      <ScreenContainer inTabs title="Error" subtitle="Missing appointment details">
        <ThemedText>Appointment details are missing. Please try booking again.</ThemedText>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer inTabs title="Appointment Confirmed" subtitle="Your appointment is booked">
      <SectionCard title="Appointment Details">
        <ThemedView type="backgroundSelected" style={styles.successBox}>
          <ThemedText type="smallBold" themeColor="text" style={{ color: '#000000' }}>
            Appointment Confirmed
          </ThemedText>
        </ThemedView>
        <ThemedText>Your appointment has been successfully booked.</ThemedText>
        <View style={styles.detailRow}>
          <ThemedText themeColor="textSecondary">Doctor:</ThemedText>
          <ThemedText>{doctorName}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText themeColor="textSecondary">Specialty:</ThemedText>
          <ThemedText>{specialty}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText themeColor="textSecondary">Date:</ThemedText>
          <ThemedText>{date}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText themeColor="textSecondary">Time:</ThemedText>
          <ThemedText>{time}</ThemedText>
        </View>
      </SectionCard>

      <View style={styles.buttonContainer}>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  successBox: {
    padding: Spacing.two,
    marginVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.one,
    backgroundColor: '#e6ffe6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  buttonContainer: {
    marginTop: Spacing.three,
  },
  backButton: {
    // We can adjust the button style as needed, but PlaceholderButton should handle it
  },
});