import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavigationColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function BackToDoctorsButton() {
  return (
    <Link href="/(tabs)/doctors" asChild>
      <Pressable
        accessibilityHint="Return to the Doctors list"
        accessibilityLabel="Back to Doctors"
        accessibilityRole="button"
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <ThemedText style={styles.primaryButtonText}>BACK TO DOCTORS</ThemedText>
      </Pressable>
    </Link>
  );
}

export default function AppointmentConfirmationScreen() {
  const { doctorName, specialty, date, time } = useLocalSearchParams<{
    doctorName?: string;
    specialty?: string;
    date?: string;
    time?: string;
  }>() || {};
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const accent = isDark ? '#8bd8b0' : NavigationColors.background;

  if (!doctorName || !specialty || !date || !time) {
    return (
      <ScreenContainer inTabs title="Details unavailable" subtitle="Missing appointment information">
        <ThemedView type="backgroundElement" style={styles.errorCard}>
          <ThemedText>Appointment details are missing. Please return to Doctors and try again.</ThemedText>
          <BackToDoctorsButton />
        </ThemedView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer inTabs title="Appointment saved" subtitle="Your selection is ready">
      <ThemedView type="backgroundElement" style={styles.card}>
        <View
          accessibilityLabel="Appointment saved locally on this device"
          accessibilityRole="text"
          style={[styles.successBox, { backgroundColor: isDark ? '#214b3a' : '#e2f3e4' }]}>
          <View style={[styles.successMark, { backgroundColor: accent }]}>
            <ThemedText style={styles.successMarkText}>✓</ThemedText>
          </View>
          <View style={styles.successCopy}>
            <ThemedText style={styles.successTitle}>Saved on this device</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.successSubtitle}>
              Your local appointment selection is ready to view in Profile.
            </ThemedText>
          </View>
        </View>

        <View style={styles.headingBlock}>
          <ThemedText style={styles.cardTitle}>Appointment details</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.cardSubtitle}>
            Review the details you selected.
          </ThemedText>
        </View>

        <View style={styles.details}>
          <DetailRow label="Doctor" value={doctorName} mutedColor={theme.textSecondary} />
          <DetailRow label="Specialty" value={specialty} mutedColor={theme.textSecondary} />
          <DetailRow label="Date" value={date} mutedColor={theme.textSecondary} />
          <DetailRow label="Time" value={time} mutedColor={theme.textSecondary} />
        </View>

        <ThemedText themeColor="textSecondary" style={styles.disclaimer}>
          CHELON stores this prototype appointment locally. It does not contact or confirm with a real doctor or clinic.
        </ThemedText>
      </ThemedView>

      <BackToDoctorsButton />
    </ScreenContainer>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  mutedColor: string;
};

function DetailRow({ label, value, mutedColor }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={[styles.detailLabel, { color: mutedColor }]}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 14,
  },
  successMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  successMarkText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  successCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one / 2,
  },
  successTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  successSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  headingBlock: {
    gap: Spacing.one / 2,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  details: {
    gap: Spacing.two,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  detailLabel: {
    width: 78,
    fontSize: 14,
    lineHeight: 20,
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    backgroundColor: NavigationColors.background,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
