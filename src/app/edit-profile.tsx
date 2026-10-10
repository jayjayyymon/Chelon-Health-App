import { View, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlaceholderButton } from '@/components/placeholder-button';
import { useProfile } from '@/hooks/useProfile';
import { useHealthData } from '@/context/HealthDataContext';
import { Spacing } from '@/constants/theme';

export default function EditProfileScreen() {
  const { profile, loading, saveProfile: saveProfileToStorage } = useProfile();
  const { weightHistory, addWeight } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);
  const theme = useTheme();

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

    // A blank weight means keep the current measurement.
    const trimmedWeight = weightInput.trim();
    if (trimmedWeight === '') {
      setWeightError(null);
    } else if (!/^\d+(?:\.\d+)?$/.test(trimmedWeight) || !Number.isFinite(Number(trimmedWeight))) {
      setWeightError('Enter a valid weight, such as 72.5 kg');
      isValid = false;
    } else {
      const weightValue = Number(trimmedWeight);
      if (weightValue < 30 || weightValue > 300) {
        setWeightError('Weight must be between 30-300 kg');
        isValid = false;
      } else {
        setWeightError(null);
      }
    }

    // Height is a whole number; a blank value keeps the current height.
    const trimmedHeight = heightInput.trim();
    if (trimmedHeight === '') {
      setHeightError(null);
    } else if (!/^\d+$/.test(trimmedHeight) || !Number.isFinite(Number(trimmedHeight))) {
      setHeightError('Enter height as a whole number in centimeters');
      isValid = false;
    } else {
      const heightValue = Number(trimmedHeight);
      if (heightValue < 100 || heightValue > 250) {
        setHeightError('Height must be between 100-250 cm');
        isValid = false;
      } else {
        setHeightError(null);
      }
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
      const nameToSave = nameInput.trim() !== '' ? nameInput.trim() : profile.name;
      const weightValue = weightInput.trim() === '' ? null : Number(weightInput.trim());
      const heightToSave = heightInput.trim() === '' ? profile.heightCm : Number(heightInput.trim());

      // Build the profile object to save
      const profileToSave = {
        ...profile,
        name: nameToSave,
        heightCm: heightToSave,
      };

      // Save to persistent storage
      const saved = await saveProfileToStorage(profileToSave);

      if (saved) {
        // Only create a measurement when the user explicitly entered one.
        const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
        if (weightValue !== null && latestWeight !== weightValue) {
          addWeight({
            id: `wt-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            kg: weightValue,
          });
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

    router.back();
  };

  if (loading) {
    return (
      <ScreenContainer title="Edit Profile">
        <ThemedText>Loading profile...</ThemedText>
      </ScreenContainer>
    );
  }

  // Calculate current values for placeholders
  const currentWeightValue = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
  const currentHeightValue = profile.heightCm;

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
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
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
              placeholder={currentWeightValue !== null ? `${currentWeightValue} kg` : 'Not set'}
              value={weightInput}
              onChangeText={handleWeightChange}
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
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
              style={{fontSize: 16, color: theme.text}}
              placeholderTextColor={theme.textSecondary}
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
