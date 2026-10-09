import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pressable, StyleSheet, View, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Spacing } from '@/constants/theme';
import { saveAppointment } from '@/utils/appointmentStorage';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>() || {};
  const router = useRouter();

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

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Minimum date is today (prevent past dates)
  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  // Generate time slots from 9:00 AM to 5:00 PM in 30-minute increments
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const handleDateChange = (_event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const selectedDateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      setDate(selectedDateObj);
      setIsDateSelected(true);
    }
  };

  const handleTimeChange = (_event: any, selectedDate: any) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const selectedDateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
      const hours = selectedDateObj.getHours();
      const minutes = selectedDateObj.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setTime(timeString);
      setIsTimeSelected(true);
    }
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleShowTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleBookAppointment = async () => {
    if (!isDateSelected || !isTimeSelected) {
      alert('Please select both date and time');
      return;
    }

    setIsSaving(true);
    try {
      const dateString = date ? date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) : '';

      const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: time || '',
      };

      await saveAppointment(appointmentData);

      // Navigate to confirmation screen with appointment details
      const queryString = new URLSearchParams({
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: dateString,
        time: time || '',
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
          <View style={styles.dateBox}>
            <View style={styles.infoRow}>
              <ThemedText themeColor="textSecondary">Date:</ThemedText>
              <Pressable onPress={handleShowDatePicker}>
                <ThemedText>{isDateSelected && date ? formatDateForDisplay(date) : 'Select Date'}</ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={styles.timeBox}>
            <View style={styles.infoRow}>
              <ThemedText themeColor="textSecondary">Time:</ThemedText>
              <Pressable onPress={handleShowTimePicker}>
                <ThemedText>{isTimeSelected && time ? time : 'Select Time'}</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Removed the success message box */}
      </SectionCard>

      <View style={styles.buttonContainer}>
        <Link href="/(tabs)/doctors" asChild>
          <Pressable style={styles.backButton}>
            <PlaceholderButton label="Back to Doctors" />
          </Pressable>
        </Link>

        <Pressable
          style={[styles.bookButton, (!isDateSelected || !isTimeSelected || isSaving) ? styles.disabledButton : {}]}
          onPress={handleBookAppointment}
        >
          <PlaceholderButton label="Book Appointment" />
        </Pressable>
      </View>

      {/* DateTime Pickers - hidden but controlled by state */}
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
      {showTimePicker && (
        <DateTimePicker
          testID="timePicker"
          value={time ? new Date(`2020-01-01T${time}`) : new Date()}
          mode="time"
          display="default"
          onValueChange={handleTimeChange}
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
  dateBox: {
    flex: 1,
    marginRight: Spacing.one,
  },
  timeBox: {
    flex: 1,
    marginLeft: Spacing.one,
  },
  pickerButton: {
    marginTop: Spacing.one,
    alignItems: 'flex-end',
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