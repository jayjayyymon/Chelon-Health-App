import { useState } from 'react';
import { InfoRow } from '@/components/info-row';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/hooks/useProfile';
import { useHealthData } from '@/context/HealthDataContext';

export default function WeightScreen() {
  const { weightHistory, addWeight } = useHealthData();
  const { profile } = useProfile();
  const theme = useTheme();
  const [inputWeight, setInputWeight] = useState('');
  const [weightChangeStatus, setWeightChangeStatus] = useState<string | null>(null); // 'increased', 'decreased', or null
  const [error, setError] = useState<string | null>(null);

  // Compute latest weight and current weight from context's weightHistory
  const latest = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : null;
  const currentWeight = latest?.kg ?? null;

  const handleWeightChange = (text: string) => {
    setInputWeight(text);
    setError(null);
  };

  const validateWeight = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === '') {
      return 'Please enter a weight';
    }
    if (trimmed.startsWith('-')) {
      return 'Please enter a positive weight';
    }
    if (!/^\d+(?:\.\d)?$/.test(trimmed)) {
      return 'Please enter a valid weight (up to one decimal place)';
    }
    const num = Number(trimmed);
    if (num < 1 || num > 500) {
      return 'Weight must be between 1 kg and 500 kg';
    }
    return null;
  };

  const handleLogWeight = () => {
    const validationError = validateWeight(inputWeight);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    const weightValue = parseFloat(inputWeight.trim());

    // Determine if weight increased or decreased when a previous entry exists
    if (latest) {
      const weightChange = weightValue - latest.kg;
      if (weightChange > 0) {
        setWeightChangeStatus('increased');
      } else if (weightChange < 0) {
        setWeightChangeStatus('decreased');
      } else {
        setWeightChangeStatus(null);
      }
    } else {
      setWeightChangeStatus(null);
    }

    // Add new weight entry to history via context
    const newEntry = {
      id: `wt${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      kg: weightValue,
    };
    addWeight(newEntry);

    // Clear input
    setInputWeight('');
  };

  return (
    <ScreenContainer subtitle={`Latest weight is ${currentWeight !== null ? `${currentWeight} kg` : 'not set'}. Goal is ${profile.goalWeightKg} kg.`}>
      <SectionCard title="Current">
        <InfoRow label="Latest" value={currentWeight !== null ? `${currentWeight} kg` : '--'} />
        <InfoRow label="Goal" value={`${profile.goalWeightKg} kg`} />
        {weightChangeStatus && (
          <InfoRow
            label="Change"
            value={weightChangeStatus === 'increased' ? 'Increased' : 'Decreased'}
          />
        )}
        <InfoRow label="Date" value={latest?.date ?? 'No entry yet'} />
      </SectionCard>

      <SectionCard title="Log Your Weight">
        <ThemedView type="backgroundSelected" style={{padding: Spacing.three, marginBottom: Spacing.two}}>
          <ThemedText type="default">Enter your weight (kg):</ThemedText>
          <ThemedView
            type="background"
            style={{
              borderWidth: 1,
              borderColor: theme.textSecondary,
              borderRadius: Spacing.one,
              paddingHorizontal: Spacing.two,
              paddingVertical: Spacing.one,
              marginVertical: Spacing.two,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <TextInput
              style={{flex: 1, fontSize: 16, color: theme.text}}
              placeholder="Enter weight"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={inputWeight}
              onChangeText={handleWeightChange}
            />
          </ThemedView>
          {error && (
            <ThemedText type="small" style={{color: '#FF6B6B', marginTop: 4}}>
              {error}
            </ThemedText>
          )}
        </ThemedView>

        <ThemedView type="backgroundSelected" style={{alignItems: 'center', marginTop: Spacing.two}}>
          <TouchableOpacity
            onPress={handleLogWeight}
            style={{paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.two}}
          >
            <ThemedText type="smallBold">Log Weight</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SectionCard>

      <SectionCard title="History">
        {weightHistory.map((entry) => (
          <InfoRow key={entry.id} label={entry.date} value={`${entry.kg} kg`} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}