import { StyleSheet, View, Text, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { InfoRow } from '@/components/info-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlaceholderButton } from '@/components/placeholder-button';
import { useProfile } from '@/hooks/useProfile';
import { useHealthData } from '@/context/HealthDataContext';
import { Spacing } from '@/constants/theme';

export type UserProfile = {
  name: string;
  age: number;
  heightCm: number;
  goalWeightKg: number;
  dailyWaterGoalL: number;
  dailyStepGoal: number;
};

export default function EditGoalsScreen() {
  const { profile, loading, updateProfile, saveProfile: saveProfileToStorage } = useProfile();
  const { weightHistory, addWeight } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);

  // Form state as strings (user input)
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [dailyWaterGoalInput, setDailyWaterGoalInput] = useState('');
  const [dailyStepGoalInput, setDailyStepGoalInput] = useState('');

  // Validation state
  const [goalWeightError, setGoalWeightError] = useState<string | null>(null);
  const [dailyWaterGoalError, setDailyWaterGoalError] = useState<string | null>(null);
  const [dailyStepGoalError, setDailyStepGoalError] = useState<string | null>(null);

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

    // Validate goal weight: if not empty, must be valid weight between 30-300 kg
    const goalWeightValue = parseFloat(goalWeightInput);
    const isGoalWeightValid = !isNaN(goalWeightValue) && goalWeightInput.trim() !== '' && goalWeightValue > 0;
    if (isGoalWeightValid) {
      if (goalWeightValue < 30 || goalWeightValue > 300) {
        setGoalWeightError('Weight must be between 30-300 kg');
        isValid = false;
      } else {
        setGoalWeightError(null);
      }
    } else {
      // Empty or non-numeric means keep existing goal weight - no error
      setGoalWeightError(null);
    }

    // Validate daily water goal: if not empty, must be positive number
    const dailyWaterGoalValue = parseFloat(dailyWaterGoalInput);
    const isDailyWaterGoalValid = !isNaN(dailyWaterGoalValue) && dailyWaterGoalInput.trim() !== '' && dailyWaterGoalValue > 0;
    if (isDailyWaterGoalValid) {
      setDailyWaterGoalError(null);
    } else {
      // Empty or non-numeric means keep existing water goal - no error
      setDailyWaterGoalError(null);
    }

    // Validate daily step goal: if not empty, must be positive number
    const dailyStepGoalValue = parseInt(dailyStepGoalInput, 10);
    const isDailyStepGoalValid = !isNaN(dailyStepGoalValue) && dailyStepGoalInput.trim() !== '' && dailyStepGoalValue > 0;
    if (isDailyStepGoalValid) {
      setDailyStepGoalError(null);
    } else {
      // Empty or non-numeric means keep existing step goal - no error
      setDailyStepGoalError(null);
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
      // Goal weight validation
      const goalWeightValue = parseFloat(goalWeightInput);
      const isGoalWeightValid = !isNaN(goalWeightValue) && goalWeightInput.trim() !== '' && goalWeightValue > 0;
      const goalWeightToSave = isGoalWeightValid ? goalWeightValue : (profile?.goalWeightKg ?? 68);

      // Daily water goal validation
      const dailyWaterGoalValue = parseFloat(dailyWaterGoalInput);
      const isDailyWaterGoalValid = !isNaN(dailyWaterGoalValue) && dailyWaterGoalInput.trim() !== '' && dailyWaterGoalValue > 0;
      const dailyWaterGoalToSave = isDailyWaterGoalValid ? dailyWaterGoalValue : (profile?.dailyWaterGoalL ?? 2.5);

      // Daily step goal validation
      const dailyStepGoalValue = parseInt(dailyStepGoalInput, 10);
      const isDailyStepGoalValid = !isNaN(dailyStepGoalValue) && dailyStepGoalInput.trim() !== '' && dailyStepGoalValue > 0;
      const dailyStepGoalToSave = isDailyStepGoalValid ? dailyStepGoalValue : (profile?.dailyStepGoal ?? 8000);

      // Build the profile object to save (only update goals)
      const profileToSave = {
        goalWeightKg: goalWeightToSave,
        dailyWaterGoalL: dailyWaterGoalToSave,
        dailyStepGoal: dailyStepGoalToSave
      };

      // Update profile in state
      updateProfile(profileToSave);

      // Build full profile object for storage
      const fullProfileToSave = {
        name: profile?.name ?? '',
        age: profile?.age ?? 28,
        heightCm: profile?.heightCm ?? 170,
        ...profileToSave
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

    // Clear errors
    setGoalWeightError(null);
    setDailyWaterGoalError(null);
    setDailyStepGoalError(null);

    // Navigate back - in a real app we'd use navigation, but for now we'll just reset
    // Note: Actual navigation would be handled by the calling screen
  };

  if (loading || !profile) {
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
              placeholder={(profile?.goalWeightKg ?? 68).toString() + ' kg'}
              value={goalWeightInput}
              onChangeText={handleGoalWeightChange}
              style={{fontSize: 16}}
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
              placeholder={(profile?.dailyWaterGoalL ?? 2.5).toString() + ' L'}
              value={dailyWaterGoalInput}
              onChangeText={handleDailyWaterGoalChange}
              style={{fontSize: 16}}
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
              placeholder={(profile?.dailyStepGoal ?? 8000).toString()}
              value={dailyStepGoalInput}
              onChangeText={handleDailyStepGoalChange}
              style={{fontSize: 16}}
              keyboardType="numeric"
            />
          </ThemedView>
          {dailyStepGoalError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {dailyStepGoalError}
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

// We need to import TextInput here since it's used above
import { TextInput } from 'react-native';