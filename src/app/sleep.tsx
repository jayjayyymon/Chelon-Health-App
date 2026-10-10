import { useState } from 'react';
import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { View } from 'react-native';
import { Spacing } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthData } from '@/context/HealthDataContext';

export default function SleepScreen() {
  const { sleepHistory, addSleep } = useHealthData();
  const [bedtime, setBedtime] = useState<Date | null>(null);
  const [wakeTime, setWakeTime] = useState<Date | null>(null);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [sleepDuration, setSleepDuration] = useState<string | null>(null);

  // Get the most recent sleep entry for display
  const mostRecentSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;

  const showBedtimePickerHandler = () => {
    setShowBedtimePicker(true);
  };

  const hideBedtimePickerHandler = () => {
    setShowBedtimePicker(false);
  };

  const handleBedtimeChange = (_event: any, selectedDate?: Date | null) => {
    setShowBedtimePicker(false);
    if (selectedDate) {
      setBedtime(selectedDate);
    }
  };

  const showWakeTimePickerHandler = () => {
    setShowWakeTimePicker(true);
  };

  const hideWakeTimePickerHandler = () => {
    setShowWakeTimePicker(false);
  };

  const handleWakeTimeChange = (_event: any, selectedDate?: Date | null) => {
    setShowWakeTimePicker(false);
    if (selectedDate) {
      setWakeTime(selectedDate);
    }
  };

  // Calculate sleep duration
  const calculateSleepDuration = () => {
    try {
      if (!bedtime || !wakeTime) {
        setSleepDuration(null);
        return;
      }

      // Calculate duration in minutes
      let bedtimeInMinutes = bedtime.getHours() * 60 + bedtime.getMinutes();
      let wakeTimeInMinutes = wakeTime.getHours() * 60 + wakeTime.getMinutes();

      // Calculate duration (handle crossing midnight)
      let durationInMinutes;
      if (wakeTimeInMinutes <= bedtimeInMinutes) {
        // Wake time is next day
        durationInMinutes = (24 * 60 - bedtimeInMinutes) + wakeTimeInMinutes;
      } else {
        // Wake time is same day
        durationInMinutes = wakeTimeInMinutes - bedtimeInMinutes;
      }

      // Convert to hours and minutes
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;

      // Format duration
      const durationString = minutes > 0
        ? `${hours}h ${minutes}m`
        : `${hours}h`;

      setSleepDuration(durationString);

      const formattedBedtime = formatTimeForDisplay(bedtime);
      const formattedWakeTime = formatTimeForDisplay(wakeTime);

      // Save to context as a sleep entry
      const sleepEntry = {
        id: `sleep-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: parseFloat((hours + minutes / 60).toFixed(1)), // Convert to hours as a float
      };
      addSleep(sleepEntry);

      // Clear input times after saving
      setBedtime(null);
      setWakeTime(null);
    } catch (error) {
      setSleepDuration(null);
    }
  };

  // Format time for display (HH:MM AM/PM)
  const formatTimeForDisplay = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format for display
    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  // Handle saving sleep data
  const handleSaveSleep = () => {
    if (!bedtime || !wakeTime) {
      alert('Please enter both bedtime and wake time');
      return;
    }

    if (!sleepDuration) {
      alert('Please enter valid times');
      return;
    }

    // Data is already saved in calculateSleepDuration when both times are entered
    alert('Sleep data saved!');
  };

  return (
    <ScreenContainer subtitle={mostRecentSleep ? `Last night: ${mostRecentSleep.hours} hrs` : 'Enter your sleep times'}>
      <SectionCard title={mostRecentSleep ? mostRecentSleep.date : 'Last Night'}>
        {mostRecentSleep ? (
          <>
            <InfoRow label="Duration" value={`${mostRecentSleep.hours} hrs`} />
            <InfoRow label="Bedtime" value={bedtime ? formatTimeForDisplay(bedtime) : '--:-- --'} />
            <InfoRow label="Wake" value={wakeTime ? formatTimeForDisplay(wakeTime) : '--:-- --'} />
          </>
        ) : (
          <>
            <InfoRow label="Duration" value={sleepDuration ? sleepDuration : '--'} />
            <InfoRow label="Bedtime" value={bedtime ? formatTimeForDisplay(bedtime) : '--:-- --'} />
            <InfoRow label="Wake" value={wakeTime ? formatTimeForDisplay(wakeTime) : '--:-- --'} />
          </>
        )}
      </SectionCard>

      <SectionCard title="Log Your Sleep">
        <ThemedView type="backgroundSelected" style={{padding: Spacing.three, marginBottom: Spacing.two}}>
          <ThemedText type="default">Bedtime:</ThemedText>
          <TouchableOpacity
            onPress={showBedtimePickerHandler}
            style={{
              borderWidth: 1,
              borderColor: 'border',
              borderRadius: Spacing.one,
              paddingHorizontal: Spacing.two,
              paddingVertical: Spacing.one,
              marginVertical: Spacing.two,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <ThemedText>{bedtime ? formatTimeForDisplay(bedtime) : '--:-- --'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView type="backgroundSelected" style={{padding: Spacing.three, marginBottom: Spacing.two}}>
          <ThemedText type="default">Wake-up Time:</ThemedText>
          <TouchableOpacity
            onPress={showWakeTimePickerHandler}
            style={{
              borderWidth: 1,
              borderColor: 'border',
              borderRadius: Spacing.one,
              paddingHorizontal: Spacing.two,
              paddingVertical: Spacing.one,
              marginVertical: Spacing.two,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <ThemedText>{wakeTime ? formatTimeForDisplay(wakeTime) : '--:-- --'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView type="backgroundSelected" style={{alignItems: 'center', marginTop: Spacing.two}}>
          <TouchableOpacity
            onPress={handleSaveSleep}
            style={{paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.two}}
          >
            <ThemedText type="smallBold">Save Sleep Data</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SectionCard>

      {/* DateTime Pickers */}
      {showBedtimePicker && (
        <DateTimePicker
          value={bedtime || new Date()}
          mode="time"
          display="default"
          locale="en-US"
          onValueChange={handleBedtimeChange}
          onDismiss={hideBedtimePickerHandler}
          onNeutralButtonPress={hideBedtimePickerHandler}
        />
      )}
      {showWakeTimePicker && (
        <DateTimePicker
          value={wakeTime || new Date()}
          mode="time"
          display="default"
          locale="en-US"
          onValueChange={handleWakeTimeChange}
          onDismiss={hideWakeTimePickerHandler}
          onNeutralButtonPress={hideWakeTimePickerHandler}
        />
      )}
    </ScreenContainer>
  );
}