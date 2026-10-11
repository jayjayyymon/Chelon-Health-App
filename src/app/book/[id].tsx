import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavigationColors, Spacing } from '@/constants/theme';
import { doctors } from '@/data/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { saveAppointment } from '@/utils/appointmentStorage';
import { useAlert } from '@/hooks/use-alert';

const formatTimeSlot = (slot: string) => {
  const [hours, minutes] = slot.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateForDisplay = (date: Date) =>
  date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

function BackToDoctorsButton() {
  const theme = useTheme();

  return (
    <Link href="/(tabs)/doctors" asChild>
      <Pressable
        accessibilityHint="Return to the Doctors list"
        accessibilityLabel="Back to Doctors"
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [
          styles.roundButton,
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={[styles.backGlyph, { color: theme.text }]}>‹</ThemedText>
      </Pressable>
    </Link>
  );
}

function BookingPageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.pageHeading}>
      <View style={styles.topBar}>
        <BackToDoctorsButton />
        <ThemedText style={styles.wordmark}>doctor booking</ThemedText>
        <View style={styles.topBarSpacer} />
      </View>
      <View style={styles.pageHeadingCopy}>
        {subtitle ? <ThemedText themeColor="textSecondary" style={styles.headingSubtitle}>{subtitle}</ThemedText> : null}
        <ThemedText style={styles.pageTitle}>{title}</ThemedText>
      </View>
    </View>
  );
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>() || {};
  const router = useRouter();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedDoctor = doctors.find(doc => doc.id === id);
  const accent = isDark ? '#8bd8b0' : NavigationColors.background;
  const cardColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const mutedColor = theme.textSecondary;

  const [alertVisible, showAlert, hideAlert, AlertComponent] = useAlert();

  // Handle missing or invalid ID gracefully.
  if (!id) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenContainer inTabs>
          <BookingPageHeading title="Doctor not found" subtitle="Invalid doctor selection" />
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText>Please select a valid doctor from the Doctors section.</ThemedText>
          </ThemedView>
        </ScreenContainer>
        <AlertComponent />
      </View>
    );
  }

  if (!selectedDoctor) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenContainer inTabs>
          <BookingPageHeading title="Doctor not found" />
          <ThemedView type="backgroundElement" style={styles.errorCard}>
            <ThemedText>We could not find that doctor. Please choose someone from the list.</ThemedText>
          </ThemedView>
        </ScreenContainer>
        <AlertComponent />
      </View>
    );
  }

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      setDate(normalizedDate);
    }
  };

  const handleBookAppointment = async () => {
    if (!date || date < minDate) {
      showAlert({
        title: 'Select an appointment date',
        message: 'Choose today or a future date.',
        type: 'warning',
      });
      return;
    }

    if (!time || !selectedDoctor.availableTimes.includes(time)) {
      showAlert({
        title: 'Select an appointment time',
        message: 'Choose one of the available times.',
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      const dateString = formatDateForDisplay(date);
      const timeLabel = formatTimeSlot(time);
      const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: timeLabel,
      };

      await saveAppointment(appointmentData);

      showAlert({
        title: 'Appointment Booked!',
        message: 'Your appointment has been booked successfully.',
        type: 'success',
        onConfirm: () => router.dismissTo('/(tabs)/doctors'),
        confirmText: 'OK',
      });
    } catch (error) {
      console.error('Failed to save appointment:', error);
      showAlert({
        title: 'Unable to save appointment',
        message: 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenContainer inTabs>
        <BookingPageHeading title="Book Appointment" />
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText style={styles.cardEyebrow}>SELECTED CARE PROFESSIONAL</ThemedText>
          <ThemedText style={styles.doctorName}>{selectedDoctor.name}</ThemedText>
          <ThemedText themeColor="textSecondary">{selectedDoctor.specialty}</ThemedText>
          <View style={styles.infoRows}>
            <InfoRow label="Next listed slot" value={selectedDoctor.nextSlot} />
            <InfoRow label="Times offered" value={`${selectedDoctor.availableTimes.length} options`} />
          </View>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingText}>
              <ThemedText style={styles.sectionTitle}>Choose a Date and Time</ThemedText>
            </View>
          </View>

          <Pressable
            accessibilityLabel={date ? `Appointment date ${formatDateForDisplay(date)}` : 'Choose appointment date'}
            accessibilityRole="button"
            accessibilityState={{ selected: date !== null }}
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              styles.dateButton,
              { backgroundColor: date ? (isDark ? '#214b3a' : '#edf8ee') : cardColor, borderColor },
              pressed && styles.pressed,
            ]}>
            <View style={styles.dateButtonText}>
              <ThemedText style={[styles.fieldLabel, { color: mutedColor }]}>APPOINTMENT DATE</ThemedText>
              <ThemedText type="smallBold">{date ? formatDateForDisplay(date) : 'Select a date'}</ThemedText>
            </View>
            <ThemedText style={[styles.dateArrow, { color: accent }]}>›</ThemedText>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={date ?? minDate}
              mode="date"
              display="default"
              minimumDate={minDate}
              onChange={handleDateChange}
            />
          )}

          <View style={styles.timeHeading}>
            <ThemedText style={styles.fieldLabel}>AVAILABLE TIMES</ThemedText>
          </View>
          <View style={styles.timeSlots}>
            {selectedDoctor.availableTimes.map(slot => {
              const selected = time === slot;
              return (
                <Pressable
                  key={slot}
                  accessibilityLabel={`${formatTimeSlot(slot)}${selected ? ', selected' : ''}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setTime(slot)}
                  style={({ pressed }) => [
                    styles.timeSlot,
                    {
                      backgroundColor: selected ? accent : cardColor,
                      borderColor: selected ? accent : borderColor,
                    },
                    pressed && styles.pressed,
                  ]}>
                <ThemedText style={{ color: selected ? '#ffffff' : theme.text, fontWeight: '700' }}>
                  {formatTimeSlot(slot)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={isSaving ? 'Saving appointment' : 'Save appointment'}
            accessibilityRole="button"
            disabled={!date || !time || isSaving}
            onPress={handleBookAppointment}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: accent },
              (!date || !time || isSaving) && styles.disabledButton,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.primaryButtonText}>{isSaving ? 'SAVING…' : 'SAVE APPOINTMENT'}</ThemedText>
          </Pressable>
        </View>
      </ScreenContainer>
      <AlertComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 20,
  },
  pageHeading: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingBottom: Spacing.one,
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    elevation: 2,
    shadowColor: '#173b2c',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backGlyph: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    marginTop: -4,
  },
  wordmark: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.7,
  },
  topBarSpacer: {
    width: 40,
  },
  pageHeadingCopy: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  headingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    letterSpacing: 0.15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  doctorName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  infoRows: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one / 2,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  dateButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: Spacing.two,
  },
  dateButtonText: {
    gap: Spacing.one / 2,
  },
  fieldLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  dateArrow: {
    fontSize: 28,
    lineHeight: 30,
  },
  timeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  timeSlot: {
    minWidth: 94,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: Spacing.two,
    borderRadius: 13,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.45,
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