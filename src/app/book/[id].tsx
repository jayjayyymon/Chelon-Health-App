import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pressable, StyleSheet, View, Alert } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Spacing } from '@/constants/theme';
import { doctors } from '@/data/mock-data';
import { saveAppointment } from '@/utils/appointmentStorage';

const formatTimeSlot = (slot: string) => {
  const [hours, minutes] = slot.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>() || {};
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedDoctor = doctors.find(doc => doc.id === id);

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

  if (!selectedDoctor) {
    return (
      <ScreenContainer inTabs title="Doctor not found">
        <ThemedText>Please select a doctor from the list.</ThemedText>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>
      </ScreenContainer>
    );
  }

  // Minimum date is today (prevent past dates)
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const handleDateChange = (_event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const selectedDateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      setDate(selectedDateObj);
    }
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
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
      const dateString = date ? date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) : '';

      const timeLabel = formatTimeSlot(time);
      const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: timeLabel,
      };

      await saveAppointment(appointmentData);

      // Navigate to confirmation screen with appointment details
      const queryString = new URLSearchParams({
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: timeLabel,
      }).toString();

      router.push(`/book/confirmation?${queryString}`);
    } catch (error) {
      console.error('Failed to save appointment:', error);
      Alert.alert('Error', 'Failed to save appointment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScreenContainer inTabs title="Book Appointment" subtitle={selectedDoctor.name}>
      <SectionCard title="Selected Doctor">
        <InfoRow label="Doctor" value={selectedDoctor.name} />
        <InfoRow label="Specialty" value={selectedDoctor.specialty} />
        <InfoRow label="Next available slot" value={selectedDoctor.nextSlot} />
      </SectionCard>

      <SectionCard title="Appointment Date & Time">
        <View style={styles.dateTimeSection}>
          <View style={styles.infoRow}>
            <ThemedText themeColor="textSecondary">Date:</ThemedText>
            <Pressable onPress={handleShowDatePicker}>
              <ThemedText>{date ? formatDateForDisplay(date) : 'Select Date'}</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="smallBold" style={styles.timeLabel}>Available times</ThemedText>
          <View style={styles.timeSlots}>
            {selectedDoctor.availableTimes.map((slot) => (
              <Pressable key={slot} onPress={() => setTime(slot)}>
                <ThemedView
                  type={time === slot ? 'backgroundSelected' : 'backgroundElement'}
                  style={styles.timeSlot}
                >
                  <ThemedText type="small">{formatTimeSlot(slot)}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>
        </View>
      </SectionCard>

      <View style={styles.buttonContainer}>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>

        <Pressable
          style={[styles.bookButton, (!date || !time || isSaving) ? styles.disabledButton : {}]}
          onPress={handleBookAppointment}
          disabled={!date || !time || isSaving}
        >
          <PlaceholderButton label="Book Appointment" />
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={date ?? new Date()}
          mode="date"
          display="default"
          minimumDate={minDate}
          onValueChange={handleDateChange}
        />
      )}
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
  dateTimeSection: {
    padding: Spacing.three,
  },
  timeLabel: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  timeSlot: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
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
  },
  disabledButton: {
    opacity: 0.5,
  },
  successBox: {
    padding: Spacing.two,
    marginVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: Spacing.one,
    backgroundColor: '#e6ffe6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
});