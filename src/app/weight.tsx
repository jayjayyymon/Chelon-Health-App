import { useState, useEffect } from 'react';
import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput } from 'react-native';
import { Spacing } from '@/constants/theme';
import { userProfile } from '@/data/mock-data';
import { useHealthData } from '@/context/HealthDataContext';

export default function WeightScreen() {
  const { weightHistory, addWeight } = useHealthData();
  const [inputWeight, setInputWeight] = useState('');
  const [weightChangeStatus, setWeightChangeStatus] = useState<string | null>(null); // 'increased', 'decreased', or null
  const [error, setError] = useState<string | null>(null);

  // Compute latest weight and current weight from context's weightHistory
  const latest = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1] : { id: '', date: '', kg: 0 };
  const currentWeight = latest.kg;

  const handleWeightChange = (text: string) => {
    // Allow digits, decimal point, and minus sign
    let cleaned = text.replace(/[^0-9.-]/g, '');
    // Ensure at most one minus sign, and only at the beginning
    if (cleaned.indexOf('-') > 0) {
      // minus sign not at beginning
      cleaned = cleaned.replace(/-/g, '');
    }
    // If there is a minus sign, keep only the first one
    const minusIndex = cleaned.indexOf('-');
    if (minusIndex > -1) {
      cleaned = '-' + cleaned.slice(minusIndex + 1).replace(/-/g, '');
    }
    // Ensure at most one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setInputWeight(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setInputWeight(cleaned);
    }
  };

  const validateWeight = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === '') {
      return 'Please enter a weight';
    }
    if (trimmed.startsWith('-')) {
      return 'Please enter a positive weight';
    }
    if (!/^\d+(\.\d{0,1})?$/.test(trimmed)) {
      return 'Please enter a valid weight (up to one decimal place)';
    }
    const num = parseFloat(trimmed);
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

    // Determine if weight increased or decreased
    const weightChange = weightValue - latest.kg;
    if (weightChange > 0) {
      setWeightChangeStatus('increased');
    } else if (weightChange < 0) {
      setWeightChangeStatus('decreased');
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
    <ScreenContainer subtitle={`Latest weight is ${currentWeight} kg. Goal is ${userProfile.goalWeightKg} kg.`}>
      <SectionCard title="Current">
        <InfoRow label="Latest" value={`${currentWeight} kg`} />
        <InfoRow label="Goal" value={`${userProfile.goalWeightKg} kg`} />
        {weightChangeStatus && (
          <InfoRow
            label="Change"
            value={weightChangeStatus === 'increased' ? 'Increased' : 'Decreased'}
          />
        )}
        <InfoRow label="Date" value={latest.date} />
      </SectionCard>

      <SectionCard title="Log Your Weight">
        <ThemedView type="backgroundSelected" style={{padding: Spacing.three, marginBottom: Spacing.two}}>
          <ThemedText type="default">Enter your weight (kg):</ThemedText>
          <ThemedView
            type="background"
            style={{
              borderWidth: 1,
              borderColor: 'border',
              borderRadius: Spacing.one,
              paddingHorizontal: Spacing.two,
              paddingVertical: Spacing.one,
              marginVertical: Spacing.two,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <TextInput
              style={{flex: 1, fontSize: 16, color: '#FFFFFF'}}
              placeholder="Enter weight"
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