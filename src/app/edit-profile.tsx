import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

export default function EditProfileScreen() {
  const { profile, loading, saveProfile: saveProfileToStorage } = useProfile();
  const { weightHistory, addWeight } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);
  const isDark = useColorScheme() === 'dark';
  const [nameInput, setNameInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);

  const panelGreen = isDark ? '#245c42' : NavigationColors.background;
  const pageBackground = isDark ? '#10291f' : '#f7fbf7';
  const cardColor = isDark ? '#17382e' : '#ffffff';
  const fieldColor = isDark ? '#214936' : '#f2f8f2';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const errorColor = isDark ? '#ffb4ab' : '#b3261e';

  const validateForm = () => {
    let isValid = true;
    const nameValue = nameInput.trim();
    const trimmedWeight = weightInput.trim();
    const trimmedHeight = heightInput.trim();

    if (nameValue !== '' && nameValue.length < 2) {
      setNameError('Name must be at least 2 characters.');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (trimmedWeight !== '' && (!/^\d+(?:\.\d+)?$/.test(trimmedWeight) || !Number.isFinite(Number(trimmedWeight)))) {
      setWeightError('Enter a valid weight, such as 72.5 kg.');
      isValid = false;
    } else if (trimmedWeight !== '' && (Number(trimmedWeight) < 30 || Number(trimmedWeight) > 300)) {
      setWeightError('Weight must be between 30 and 300 kg.');
      isValid = false;
    } else {
      setWeightError(null);
    }

    if (trimmedHeight !== '' && (!/^\d+$/.test(trimmedHeight) || !Number.isFinite(Number(trimmedHeight)))) {
      setHeightError('Enter height as a whole number in centimeters.');
      isValid = false;
    } else if (trimmedHeight !== '' && (Number(trimmedHeight) < 100 || Number(trimmedHeight) > 250)) {
      setHeightError('Height must be between 100 and 250 cm.');
      isValid = false;
    } else {
      setHeightError(null);
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const weightValue = weightInput.trim() === '' ? null : Number(weightInput.trim());
      const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
      const saved = await saveProfileToStorage({
        ...profile,
        name: nameInput.trim() || profile.name,
        heightCm: heightInput.trim() === '' ? profile.heightCm : Number(heightInput.trim()),
      });

      if (!saved) {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
        return;
      }

      if (weightValue !== null && latestWeight !== weightValue) {
        addWeight({
          id: `wt-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          kg: weightValue,
        });
      }
      Alert.alert('Profile saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ThemedView style={[styles.root, { backgroundColor: pageBackground }]}><ThemedText>Loading profile...</ThemedText></ThemedView>;
  }

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;

  return (
    <ThemedView style={[styles.root, { backgroundColor: pageBackground }]}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.topBar}>
                <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={[styles.backButton, { backgroundColor: cardColor, borderColor }]}>
                  <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
                </Pressable>
                <View style={styles.heading}>
                  <ThemedText style={[styles.eyebrow, { color: panelGreen }]}>CHELON PROFILE</ThemedText>
                  <ThemedText style={[styles.title, { color: inkColor }]}>Edit Profile</ThemedText>
                </View>
                <View style={styles.headerSpacer} />
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText style={[styles.cardTitle, { color: inkColor }]}>Personal information</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: mutedInk }]}>Keep your saved details up to date.</ThemedText>
                <FormField label="NAME" value={nameInput} placeholder={profile.name} onChangeText={text => { setNameInput(text); setNameError(null); }} error={nameError} keyboardType="default" colors={{ fieldColor, borderColor, inkColor, mutedInk, errorColor }} />
                <FormField label="CURRENT WEIGHT" unit="kg" value={weightInput} placeholder={currentWeight === null ? 'Not set' : String(currentWeight)} onChangeText={text => { setWeightInput(text); setWeightError(null); }} error={weightError} keyboardType="decimal-pad" colors={{ fieldColor, borderColor, inkColor, mutedInk, errorColor }} />
                <FormField label="HEIGHT" unit="cm" value={heightInput} placeholder={String(profile.heightCm)} onChangeText={text => { setHeightInput(text); setHeightError(null); }} error={heightError} keyboardType="number-pad" colors={{ fieldColor, borderColor, inkColor, mutedInk, errorColor }} />
              </View>

              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.actionButton, styles.cancelButton, { borderColor, backgroundColor: cardColor }]}>
                  <ThemedText style={[styles.actionText, { color: inkColor }]}>CANCEL</ThemedText>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={isSaving} onPress={handleSave} style={[styles.actionButton, { backgroundColor: panelGreen, opacity: isSaving ? 0.6 : 1 }]}>
                  <ThemedText style={[styles.actionText, { color: '#ffffff' }]}>{isSaving ? 'SAVING…' : 'SAVE PROFILE'}</ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FormFieldProps = {
  label: string;
  unit?: string;
  value: string;
  placeholder: string;
  error: string | null;
  keyboardType: 'default' | 'decimal-pad' | 'number-pad';
  onChangeText: (text: string) => void;
  colors: { fieldColor: string; borderColor: string; inkColor: string; mutedInk: string; errorColor: string };
};

function FormField({ label, unit, value, placeholder, error, keyboardType, onChangeText, colors }: FormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: colors.mutedInk }]}>{label}{unit ? ` (${unit})` : ''}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: colors.fieldColor, borderColor: error ? colors.errorColor : colors.borderColor }]}>
        <TextInput autoCapitalize={keyboardType === 'default' ? 'words' : 'none'} keyboardType={keyboardType} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedInk} style={[styles.input, { color: colors.inkColor }]} value={value} />
        {unit ? <ThemedText style={[styles.unit, { color: colors.mutedInk }]}>{unit}</ThemedText> : null}
      </View>
      {error ? <ThemedText style={[styles.error, { color: colors.errorColor }]}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.three, paddingBottom: Spacing.four },
  content: { width: '100%', maxWidth: 520, gap: Spacing.three, paddingTop: Spacing.two },
  topBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 14 },
  backGlyph: { fontSize: 34, lineHeight: 38, fontWeight: '700', marginTop: -4 },
  headerSpacer: { width: 42 },
  heading: { alignItems: 'center', gap: 1 },
  eyebrow: { fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 25, lineHeight: 31, fontWeight: '900' },
  card: { gap: Spacing.two, padding: Spacing.three, borderWidth: 1, borderRadius: 22 },
  cardTitle: { fontSize: 19, lineHeight: 25, fontWeight: '900' },
  cardSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.one },
  fieldGroup: { gap: Spacing.one },
  fieldLabel: { fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 0.7 },
  inputWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 13, paddingHorizontal: Spacing.two },
  input: { flex: 1, minHeight: 48, fontSize: 16 },
  unit: { fontSize: 13, fontWeight: '700' },
  error: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, paddingHorizontal: Spacing.two },
  cancelButton: { borderWidth: 1 },
  actionText: { fontSize: 12, lineHeight: 16, fontWeight: '900', letterSpacing: 0.5 },
});
