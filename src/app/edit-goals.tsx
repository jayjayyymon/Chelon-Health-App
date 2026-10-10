import { View, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlaceholderButton } from '@/components/placeholder-button';
import { useProfile } from '@/hooks/useProfile';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function EditGoalsScreen() {
  const { profile, loading, saveProfile: saveProfileToStorage } = useProfile();
  const theme = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  // Form state as strings (user input)
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [dailyWaterGoalInput, setDailyWaterGoalInput] = useState('');
  const [dailyStepGoalInput, setDailyStepGoalInput] = useState('');
  const [sleepGoalHoursInput, setSleepGoalHoursInput] = useState('');
  const [sleepGoalMinutesInput, setSleepGoalMinutesInput] = useState('');

  useEffect(() => {
    if (!loading) {
      const totalMinutes = Math.round(profile.dailySleepGoalHours * 60);
      setSleepGoalHoursInput(String(Math.floor(totalMinutes / 60)));
      setSleepGoalMinutesInput(String(totalMinutes % 60));
    }
  }, [loading, profile.dailySleepGoalHours]);

  // Validation state
  const [goalWeightError, setGoalWeightError] = useState<string | null>(null);
  const [dailyWaterGoalError, setDailyWaterGoalError] = useState<string | null>(null);
  const [dailyStepGoalError, setDailyStepGoalError] = useState<string | null>(null);
  const [sleepGoalError, setSleepGoalError] = useState<string | null>(null);

  // Handle goal weight change
  const handleGoalWeightChange = (text: string) => {
    setGoalWeightInput(text);
    setGoalWeightError(null); // Clear error on input
  };

  // Handle daily water goal change
  const handleDailyWaterGoalChange = (text: string) => {
    setDailyWaterGoalInput(text);
    setDailyWaterGoalError(null); // Clear error on input
  };

  // Handle daily step goal change
  const handleDailyStepGoalChange = (text: string) => {
    setDailyStepGoalInput(text);
    setDailyStepGoalError(null); // Clear error on input
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    const trimmedGoalWeight = goalWeightInput.trim();
    if (trimmedGoalWeight === '') {
      setGoalWeightError(null);
    } else if (!/^\d+(?:\.\d+)?$/.test(trimmedGoalWeight) || !Number.isFinite(Number(trimmedGoalWeight))) {
      setGoalWeightError('Enter a valid goal weight, such as 68.5 kg');
      isValid = false;
    } else if (Number(trimmedGoalWeight) < 30 || Number(trimmedGoalWeight) > 300) {
      setGoalWeightError('Weight must be between 30-300 kg');
      isValid = false;
    } else {
      setGoalWeightError(null);
    }

    const trimmedWaterGoal = dailyWaterGoalInput.trim();
    if (trimmedWaterGoal === '') {
      setDailyWaterGoalError(null);
    } else if (!/^\d+(?:\.\d+)?$/.test(trimmedWaterGoal) || !Number.isFinite(Number(trimmedWaterGoal))) {
      setDailyWaterGoalError('Enter a valid water goal, such as 2.5 L');
      isValid = false;
    } else if (Number(trimmedWaterGoal) <= 0) {
      setDailyWaterGoalError('Water goal must be greater than 0 L');
      isValid = false;
    } else {
      setDailyWaterGoalError(null);
    }

    const trimmedStepGoal = dailyStepGoalInput.trim();
    if (trimmedStepGoal === '') {
      setDailyStepGoalError(null);
    } else if (!/^\d+$/.test(trimmedStepGoal) || !Number.isFinite(Number(trimmedStepGoal))) {
      setDailyStepGoalError('Enter a whole-number step goal');
      isValid = false;
    } else if (Number(trimmedStepGoal) <= 0) {
      setDailyStepGoalError('Step goal must be greater than 0');
      isValid = false;
    } else {
      setDailyStepGoalError(null);
    }

    const trimmedSleepHours = sleepGoalHoursInput.trim();
    const trimmedSleepMinutes = sleepGoalMinutesInput.trim();
    const sleepHours = Number(trimmedSleepHours);
    const sleepMinutes = Number(trimmedSleepMinutes);
    const sleepTotalMinutes = sleepHours * 60 + sleepMinutes;
    if (
      !/^\d+$/.test(trimmedSleepHours)
      || !/^\d+$/.test(trimmedSleepMinutes)
      || !Number.isFinite(sleepTotalMinutes)
      || sleepMinutes > 59
      || sleepTotalMinutes <= 0
      || sleepTotalMinutes > 24 * 60
    ) {
      setSleepGoalError('Enter a sleep goal greater than 0 and no more than 24 hours. Minutes must be 0–59.');
      isValid = false;
    } else {
      setSleepGoalError(null);
    }

    return isValid;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const goalWeightToSave = goalWeightInput.trim() === '' ? profile.goalWeightKg : Number(goalWeightInput.trim());
      const dailyWaterGoalToSave = dailyWaterGoalInput.trim() === '' ? profile.dailyWaterGoalL : Number(dailyWaterGoalInput.trim());
      const dailyStepGoalToSave = dailyStepGoalInput.trim() === '' ? profile.dailyStepGoal : Number(dailyStepGoalInput.trim());
      const dailySleepGoalToSave = (Number(sleepGoalHoursInput) * 60 + Number(sleepGoalMinutesInput)) / 60;

      // Build the profile object to save (only update goals)
      const fullProfileToSave = {
        ...profile,
        goalWeightKg: goalWeightToSave,
        dailyWaterGoalL: dailyWaterGoalToSave,
        dailyStepGoal: dailyStepGoalToSave,
        dailySleepGoalHours: dailySleepGoalToSave,
      };

      // Save to persistent storage
      const saved = await saveProfileToStorage(fullProfileToSave);

      if (saved) {
        // Show success and navigate back
        Alert.alert(
          'Success',
          'Goals saved!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to save goals. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save goals:', error);
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel: reset inputs to empty so placeholders show current values
  const handleCancel = () => {
    setGoalWeightInput('');
    setDailyWaterGoalInput('');
    setDailyStepGoalInput('');
    const totalMinutes = Math.round(profile.dailySleepGoalHours * 60);
    setSleepGoalHoursInput(String(Math.floor(totalMinutes / 60)));
    setSleepGoalMinutesInput(String(totalMinutes % 60));

    // Clear errors
    setGoalWeightError(null);
    setDailyWaterGoalError(null);
    setDailyStepGoalError(null);
    setSleepGoalError(null);

    router.back();
  };

  if (loading) {
    return (
      <ScreenContainer title="Edit Goals">
        <ThemedText>Loading profile...</ThemedText>
      </ScreenContainer>
    );
  }

  // Calculate current values for placeholders
  return (
    <ScreenContainer title="Edit Goals">
      {/* Goals Section */}
      <SectionCard title="Health Goals">
        <ThemedView style={{padding: Spacing.three}}>
          {/* Goal Weight Field */}
          <ThemedText type="smallBold">Goal Weight (kg)</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={profile.goalWeightKg.toString() + ' kg'}
              value={goalWeightInput}
              onChangeText={handleGoalWeightChange}
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </ThemedView>
          {goalWeightError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {goalWeightError}
            </ThemedText>
          )}

          {/* Daily Water Goal Field */}
          <ThemedText type="smallBold">Daily Water Goal (L)</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={profile.dailyWaterGoalL.toString() + ' L'}
              value={dailyWaterGoalInput}
              onChangeText={handleDailyWaterGoalChange}
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </ThemedView>
          {dailyWaterGoalError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {dailyWaterGoalError}
            </ThemedText>
          )}

          {/* Daily Step Goal Field */}
          <ThemedText type="smallBold">Daily Step Goal</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={profile.dailyStepGoal.toString()}
              value={dailyStepGoalInput}
              onChangeText={handleDailyStepGoalChange}
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </ThemedView>
          {dailyStepGoalError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {dailyStepGoalError}
            </ThemedText>
          )}

          <ThemedText type="smallBold">Daily Sleep Goal</ThemedText>
          <ThemedView style={{ flexDirection: 'row', gap: Spacing.two, marginVertical: Spacing.two }}>
            <ThemedView type="backgroundSelected" style={{ flex: 1, padding: Spacing.one }}>
              <TextInput
                accessibilityLabel="Sleep goal hours"
                value={sleepGoalHoursInput}
                onChangeText={text => { setSleepGoalHoursInput(text); setSleepGoalError(null); }}
                style={{ fontSize: 16, color: theme.text }}
                keyboardType="number-pad"
                placeholder="Hours"
                placeholderTextColor={theme.textSecondary}
              />
            </ThemedView>
            <ThemedView type="backgroundSelected" style={{ flex: 1, padding: Spacing.one }}>
              <TextInput
                accessibilityLabel="Sleep goal minutes"
                value={sleepGoalMinutesInput}
                onChangeText={text => { setSleepGoalMinutesInput(text); setSleepGoalError(null); }}
                style={{ fontSize: 16, color: theme.text }}
                keyboardType="number-pad"
                placeholder="Minutes"
                placeholderTextColor={theme.textSecondary}
              />
            </ThemedView>
          </ThemedView>
          {sleepGoalError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {sleepGoalError}
            </ThemedText>
          )}
        </ThemedView>
      </SectionCard>

      {/* Action Buttons */}
      <ThemedView type="backgroundSelected" style={{padding: Spacing.three, flexDirection: 'row', justifyContent: 'space-around'}}>
        <View style={{flex: 1, marginRight: Spacing.one}}>
          <PlaceholderButton
            label="Cancel"
            onPress={handleCancel}
          />
        </View>
        <View style={{flex: 1, marginLeft: Spacing.one}}>
          <PlaceholderButton
            label={isSaving ? 'Saving...' : 'Save'}
            onPress={isSaving ? undefined : handleSave}
          />
        </View>
      </ThemedView>
    </ScreenContainer>
  );
}
