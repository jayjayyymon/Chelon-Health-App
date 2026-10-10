import { useState } from 'react';
import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useHealthData } from '@/context/HealthDataContext';

const getSleepDurationMinutes = (bedtime: Date | null, wakeTime: Date | null) => {
  if (!bedtime || !wakeTime) return null;

  const bedtimeMinutes = bedtime.getHours() * 60 + bedtime.getMinutes();
  const wakeTimeMinutes = wakeTime.getHours() * 60 + wakeTime.getMinutes();
  const duration = (wakeTimeMinutes - bedtimeMinutes + 24 * 60) % (24 * 60);

  return duration > 0 ? duration : null;
};

export default function SleepScreen() {
  const { sleepHistory, addSleep } = useHealthData();
  const theme = useTheme();
  const [bedtime, setBedtime] = useState<Date | null>(null);
  const [wakeTime, setWakeTime] = useState<Date | null>(null);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const durationMinutes = getSleepDurationMinutes(bedtime, wakeTime);
  const sleepDuration = durationMinutes === null
    ? null
    : `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? ` ${durationMinutes % 60}m` : ''}`;

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
    if (!bedtime || !wakeTime || durationMinutes === null) {
      alert('Please choose a bedtime and wake time that are not the same.');
      return;
    }

    const sleepHours = parseFloat((durationMinutes / 60).toFixed(1));

    const sleepEntry = {
      id: `sleep-${Date.now()}`,
      date: bedtime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      hours: sleepHours,
      bedtime: formatTimeForDisplay(bedtime),
      wakeTime: formatTimeForDisplay(wakeTime),
    };

    addSleep(sleepEntry);

    // Clear inputs after saving
    setBedtime(null);
    setWakeTime(null);

    alert('Sleep data saved!');
  };

  return (
    <ScreenContainer subtitle={mostRecentSleep ? `Last night: ${mostRecentSleep.hours} hrs` : 'Enter your sleep times'}>
      <SectionCard title={mostRecentSleep ? mostRecentSleep.date : 'Last Night'}>
        <>
          <InfoRow
            label="Duration"
            value={sleepDuration ?? (mostRecentSleep ? `${mostRecentSleep.hours} hrs` : '--')}
          />
          <InfoRow
            label="Bedtime"
            value={bedtime ? formatTimeForDisplay(bedtime) : mostRecentSleep?.bedtime ?? '--:-- --'}
          />
          <InfoRow
            label="Wake"
            value={wakeTime ? formatTimeForDisplay(wakeTime) : mostRecentSleep?.wakeTime ?? '--:-- --'}
          />
        </>
      </SectionCard>

      <SectionCard title="Log Your Sleep">
        <ThemedView type="backgroundSelected" style={{padding: Spacing.three, marginBottom: Spacing.two}}>
          <ThemedText type="default">Bedtime:</ThemedText>
          <TouchableOpacity
            onPress={showBedtimePickerHandler}
            style={{
              borderWidth: 1,
              borderColor: theme.textSecondary,
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
              borderColor: theme.textSecondary,
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