import { useState } from 'react';
import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TextInput } from 'react-native';
import { Spacing } from '@/constants/theme';
import { userProfile, weightHistory } from '@/data/mock-data';

export default function WeightScreen() {
  const [weightHistoryLocal, setWeightHistoryLocal] = useState(weightHistory);
  const [currentWeight, setCurrentWeight] = useState(weightHistoryLocal[weightHistoryLocal.length - 1].kg);
  const [inputWeight, setInputWeight] = useState('');
  const [weightChangeStatus, setWeightChangeStatus] = useState<string | null>(null); // 'increased', 'decreased', or null

  const latest = weightHistoryLocal[weightHistoryLocal.length - 1];

  const handleWeightChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setInputWeight(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setInputWeight(cleaned);
    }
  };

  const handleLogWeight = () => {
    const weightValue = parseFloat(inputWeight);

    // Validate that it's a positive number
    if (isNaN(weightValue) || weightValue <= 0) {
      alert('Please enter a valid positive weight');
      return;
    }

    // Determine if weight increased or decreased
    const weightChange = weightValue - latest.kg;
    if (weightChange > 0) {
      setWeightChangeStatus('increased');
    } else if (weightChange < 0) {
      setWeightChangeStatus('decreased');
    } else {
      setWeightChangeStatus(null);
    }

    // Add new weight entry to history
    const newEntry = {
      id: `wt${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      kg: weightValue,
    };

    // Update weight history in local state
    setWeightHistoryLocal([...weightHistoryLocal, newEntry]);

    // Update current weight
    setCurrentWeight(weightValue);

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
              keyboardType="numeric"
              value={inputWeight}
              onChangeText={handleWeightChange}
            />
          </ThemedView>
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
        {weightHistoryLocal.map((entry) => (
          <InfoRow key={entry.id} label={entry.date} value={`${entry.kg} kg`} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}