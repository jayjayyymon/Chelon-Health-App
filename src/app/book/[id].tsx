import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavigationColors, Spacing } from '@/constants/theme';
import { doctors } from '@/data/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { saveAppointment } from '@/utils/appointmentStorage';

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
  return (
    <Link href="/(tabs)/doctors" asChild>
      <Pressable
        accessibilityLabel="Back to Doctors"
        accessibilityRole="button"
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold">Back to Doctors</ThemedText>
      </Pressable>
    </Link>
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

  // Handle missing or invalid ID gracefully.
  if (!id) {
    return (
      <ScreenContainer inTabs title="Doctor not found" subtitle="Invalid doctor selection">
        <ThemedView type="backgroundElement" style={styles.errorCard}>
          <ThemedText>Please select a valid doctor from the Doctors section.</ThemedText>
          <BackToDoctorsButton />
        </ThemedView>
      </ScreenContainer>
    );
  }

  if (!selectedDoctor) {
    return (
      <ScreenContainer inTabs title="Doctor not found">
        <ThemedView type="backgroundElement" style={styles.errorCard}>
          <ThemedText>We could not find that doctor. Please choose someone from the list.</ThemedText>
          <BackToDoctorsButton />
        </ThemedView>
      </ScreenContainer>
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
      Alert.alert('Select an appointment date', 'Choose today or a future date.');
      return;
    }

    if (!time || !selectedDoctor.availableTimes.includes(time)) {
      Alert.alert('Select an appointment time', 'Choose one of the available times.');
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

      const queryString = new URLSearchParams({
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: timeLabel,
      }).toString();

      router.push(`/book/confirmation?${queryString}`);
    } catch (error) {
      console.error('Failed to save appointment:', error);
      Alert.alert('Unable to save appointment', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer inTabs title="Book a consultation" subtitle={selectedDoctor.name}>
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
            <ThemedText style={styles.sectionTitle}>Choose a date and time</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.sectionHint}>
              Select from the mock times shown below.
            </ThemedText>
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
          <ThemedText themeColor="textSecondary" type="small">Choose one</ThemedText>
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

        <ThemedView type="backgroundSelected" style={styles.note}>
          <ThemedText type="smallBold">Prototype booking</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.noteText}>
            This saves your selection on this device. It does not verify a real clinic appointment.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <View style={styles.actions}>
        <View style={styles.actionHalf}>
          <BackToDoctorsButton />
        </View>
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
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 20,
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
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
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
  note: {
    gap: Spacing.one / 2,
    padding: Spacing.two,
    borderRadius: 10,
    marginTop: Spacing.two,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  actionHalf: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: '#9bb6a4',
    borderRadius: 10,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
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
