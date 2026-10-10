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

export default function EditProfileScreen() {
  const { profile, loading, updateProfile, saveProfile: saveProfileToStorage } = useProfile();
  const { weightHistory, addWeight } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);

  // Form state as strings (user input)
  const [nameInput, setNameInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');

  // Validation state
  const [nameError, setNameError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);

  // Handle name change
  const handleNameChange = (text: string) => {
    setNameInput(text);
    setNameError(null); // Clear error on input
  };

  // Handle weight change
  const handleWeightChange = (text: string) => {
    setWeightInput(text);
    setWeightError(null); // Clear error on input
  };

  // Handle height change
  const handleHeightChange = (text: string) => {
    setHeightInput(text);
    setHeightError(null); // Clear error on input
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;

    // Validate name: if not empty, must be at least 2 characters
    const nameValue = nameInput.trim();
    if (nameValue !== '') {
      if (nameValue.length < 2) {
        setNameError('Name must be at least 2 characters');
        isValid = false;
      } else {
        setNameError(null);
      }
    } else {
      // Empty means keep existing name - no error
      setNameError(null);
    }

    // Validate weight: if not empty, must be valid weight between 30-300 kg
    const weightValue = parseFloat(weightInput);
    const isWeightNumeric = !isNaN(weightValue) && weightInput.trim() !== '';
    if (isWeightNumeric) {
      if (weightValue <= 0) {
        setWeightError('Please enter a valid weight');
        isValid = false;
      } else if (weightValue < 30 || weightValue > 300) {
        setWeightError('Weight must be between 30-300 kg');
        isValid = false;
      } else {
        setWeightError(null);
      }
    } else {
      // Empty or non-numeric means keep existing weight - no error
      setWeightError(null);
    }

    // Validate height: if not empty, must be valid height between 100-250 cm
    const heightValue = parseInt(heightInput, 10);
    const isHeightValid = !isNaN(heightValue) && heightInput.trim() !== '' && heightValue > 0;
    if (isHeightValid) {
      if (heightValue < 100 || heightValue > 250) {
        setHeightError('Height must be between 100-250 cm');
        isValid = false;
      } else {
        setHeightError(null);
      }
    } else {
      // Empty or non-numeric means keep existing height - no error
      setHeightError(null);
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
      // Determine values to save: use input if valid, otherwise keep existing
      const nameToSave = nameInput.trim() !== '' ? nameInput.trim() : (profile?.name ?? '');

      const weightValue = parseFloat(weightInput);
      const isWeightValid = !isNaN(weightValue) && weightInput.trim() !== '' && weightValue > 0;
      const weightToSave = isWeightValid ? weightValue : (weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : profile?.goalWeightKg ?? 68);

      const heightValue = parseInt(heightInput, 10);
      const isHeightValid = !isNaN(heightValue) && heightInput.trim() !== '' && heightValue > 0;
      const heightToSave = isHeightValid ? heightValue : (profile?.heightCm ?? 170);

      // Build the profile object to save
      const profileToSave = {
        name: nameToSave,
        age: profile?.age ?? 28,
        heightCm: heightToSave,
        goalWeightKg: profile?.goalWeightKg ?? 68,
        dailyWaterGoalL: profile?.dailyWaterGoalL ?? 2.0,
        dailyStepGoal: profile?.dailyStepGoal ?? 8000
      };

      // Update profile in state
      updateProfile(profileToSave);

      // Save to persistent storage
      const saved = await saveProfileToStorage(profileToSave);

      if (saved) {
        // If weight changed, add to weight history
        const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
        if (latestWeight !== weightToSave) {
          const newWeightEntry = {
            id: `wt-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            kg: weightToSave
          };
          addWeight(newWeightEntry);
        }
        // Show success and navigate back
        Alert.alert(
          'Success',
          'Profile saved!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel: reset inputs to empty so placeholders show current values
  const handleCancel = () => {
    setNameInput('');
    setWeightInput('');
    setHeightInput('');

    // Clear errors
    setNameError(null);
    setWeightError(null);
    setHeightError(null);

    // Navigate back - in a real app we'd use navigation, but for now we'll just reset
    // Note: Actual navigation would be handled by the calling screen
  };

  if (loading || !profile) {
    return (
      <ScreenContainer title="Edit Profile">
        <ThemedText>Loading profile...</ThemedText>
      </ScreenContainer>
    );
  }

  // Calculate current values for placeholders
  const currentWeightValue = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : (profile?.goalWeightKg ?? 68);
  const currentHeightValue = profile?.heightCm ?? 170;

  return (
    <ScreenContainer title="Edit Profile">

      {/* Form Fields */}
      <SectionCard title="Personal Information">
        <ThemedView style={{padding: Spacing.three}}>
          {/* Name Field */}
          <ThemedText type="smallBold">Name</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={profile?.name ?? ''}
              value={nameInput}
              onChangeText={handleNameChange}
              style={{fontSize: 16}}
              autoCapitalize="words"
            />
          </ThemedView>
          {nameError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {nameError}
            </ThemedText>
          )}

          {/* Weight Field */}
          <ThemedText type="smallBold">Current Weight (kg)</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={currentWeightValue.toString() + ' kg'}
              value={weightInput}
              onChangeText={handleWeightChange}
              style={{fontSize: 16}}
              keyboardType="numeric"
            />
          </ThemedView>
          {weightError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {weightError}
            </ThemedText>
          )}

          {/* Height Field */}
          <ThemedText type="smallBold">Height (cm)</ThemedText>
          <ThemedView type="backgroundSelected" style={{padding: Spacing.one, marginVertical: Spacing.two}}>
            <TextInput
              placeholder={currentHeightValue.toString() + ' cm'}
              value={heightInput}
              onChangeText={handleHeightChange}
              style={{fontSize: 16}}
              keyboardType="numeric"
            />
          </ThemedView>
          {heightError && (
            <ThemedText type="small" style={{color: '#d32f2f', marginHorizontal: Spacing.three, marginBottom: Spacing.two}}>
              {heightError}
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