import { router } from 'expo-router';
import { useState } from 'react';
import {
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
import { GENDER_OPTIONS, HEALTH_GOAL_OPTIONS, Gender, PrimaryHealthGoal } from '@/utils/profileStorage';
import { validateAge, validateHeight, validateName, validateWeight } from '@/utils/profileValidation';
import { useAlert } from '@/hooks/use-alert';

export default function EditProfileScreen() {
  const { profile, loading, saveProfile: saveProfileToStorage } = useProfile();
  const { weightHistory, addWeight } = useHealthData();
  const [isSaving, setIsSaving] = useState(false);
  const isDark = useColorScheme() === 'dark';
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [gender, setGender] = useState<Gender | undefined>(profile.gender);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryHealthGoal | undefined>(profile.primaryHealthGoal);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [alertVisible, showAlert, hideAlert, AlertComponent] = useAlert();

  const panelGreen = isDark ? '#245c42' : NavigationColors.background;
  const pageBackground = isDark ? '#10291f' : '#f7fbf7';
  const cardColor = isDark ? '#17382e' : '#ffffff';
  const fieldColor = isDark ? '#214936' : '#f2f8f2';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const errorColor = isDark ? '#ffb4ab' : '#b3261e';
  const colors = { fieldColor, borderColor, inkColor, mutedInk, errorColor };

  const clearError = (key: string) => setErrors(previous => ({ ...previous, [key]: null }));

  const validateForm = () => {
    const nextErrors: Record<string, string | null> = {};
    if (nameInput.trim() !== '') nextErrors.name = validateName(nameInput);
    if (ageInput.trim() !== '') nextErrors.age = validateAge(ageInput).error;
    if (weightInput.trim() !== '') nextErrors.weight = validateWeight(weightInput).error;
    if (heightInput.trim() !== '') nextErrors.height = validateHeight(heightInput).error;
    const filtered = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value !== null));
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const weightValue = weightInput.trim() === '' ? null : validateWeight(weightInput).value;
      const ageValue = ageInput.trim() === '' ? profile.age : validateAge(ageInput).value;
      const heightValue = heightInput.trim() === '' ? profile.heightCm : validateHeight(heightInput).value;
      if (ageValue === null || heightValue === null || (weightInput.trim() !== '' && weightValue === null)) return;
      const latestWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
      const saved = await saveProfileToStorage({
        ...profile,
        name: nameInput.trim() || profile.name,
        age: ageValue,
        heightCm: heightValue,
        ...(gender ? { gender } : { gender: undefined }),
        ...(primaryGoal ? { primaryHealthGoal: primaryGoal } : { primaryHealthGoal: undefined }),
      });

      if (!saved) {
        showAlert({
          title: 'Error',
          message: 'Failed to save profile. Please try again.',
          type: 'error',
        });
        return;
      }
      if (weightValue !== null && latestWeight !== weightValue) {
        addWeight({
          id: `wt-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          kg: weightValue,
        });
      }
      showAlert({
        title: 'Profile saved',
        message: 'Your profile has been updated.',
        type: 'success',
        onConfirm: () => router.back(),
        confirmText: 'OK',
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save profile. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <ThemedView style={[styles.root, { backgroundColor: pageBackground }]}><ThemedText>Loading profile...</ThemedText></ThemedView>;

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].kg : null;
  const field = (label: string, value: string, onChangeText: (text: string) => void, key: string, keyboardType: 'default' | 'decimal-pad' | 'number-pad', placeholder: string, unit?: string) => (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: colors.mutedInk }]}>{label}{unit ? ` (${unit})` : ''}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: colors.fieldColor, borderColor: errors[key] ? colors.errorColor : colors.borderColor }]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedInk}
          style={[styles.input, { color: colors.inkColor }]}
          value={value}
        />
        {unit ? <ThemedText style={[styles.unit, { color: colors.mutedInk }]}>{unit}</ThemedText> : null}
      </View>
      {errors[key] ? <ThemedText style={[styles.error, { color: colors.errorColor }]}>{errors[key]}</ThemedText> : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ThemedView style={[styles.root, { backgroundColor: pageBackground }]}>
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <View style={styles.topBar}>
                  <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={[styles.backButton, { backgroundColor: cardColor, borderColor }]}><ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText></Pressable>
                  <View style={styles.heading}><ThemedText style={[styles.eyebrow, { color: panelGreen }]}>CHELON PROFILE</ThemedText><ThemedText style={[styles.title, { color: inkColor }]}>Edit Profile</ThemedText></View>
                  <View style={styles.headerSpacer} />
                </View>
                <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                  <ThemedText style={[styles.cardTitle, { color: inkColor }]}>Personal information</ThemedText>
                  <ThemedText style={[styles.cardSubtitle, { color: mutedInk }]}>Keep your saved details up to date.</ThemedText>
                  {field('NAME', nameInput, setNameInput, 'name', 'default', profile.name)}
                  {field('AGE', ageInput, setAgeInput, 'age', 'number-pad', String(profile.age), 'years')}
                  {field('CURRENT WEIGHT', weightInput, setWeightInput, 'weight', 'decimal-pad', currentWeight === null ? 'Not set' : String(currentWeight), 'kg')}
                  {field('HEIGHT', heightInput, setHeightInput, 'height', 'number-pad', String(profile.heightCm), 'cm')}
                  <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>GENDER (OPTIONAL)</ThemedText>
                  <View style={styles.options}>{GENDER_OPTIONS.map(option => <OptionButton key={option.value} label={option.label} selected={gender === option.value} onPress={() => setGender(option.value)} colors={colors} />)}</View>
                  <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>PRIMARY HEALTH GOAL</ThemedText>
                  <View style={styles.options}>{HEALTH_GOAL_OPTIONS.map(option => <OptionButton key={option.value} label={option.label} selected={primaryGoal === option.value} onPress={() => setPrimaryGoal(option.value)} colors={colors} />)}</View>
                </View>
                <View style={styles.actions}>
                  <Pressable accessibilityLabel="Cancel profile edits" accessibilityRole="button" onPress={() => router.back()} style={[styles.actionButton, styles.cancelButton, { borderColor, backgroundColor: cardColor }]}><ThemedText style={[styles.actionText, { color: inkColor }]}>CANCEL</ThemedText></Pressable>
                  <Pressable accessibilityLabel={isSaving ? 'Saving profile' : 'Save profile'} accessibilityRole="button" accessibilityState={{ disabled: isSaving }} disabled={isSaving} onPress={handleSave} style={[styles.actionButton, { backgroundColor: panelGreen, opacity: isSaving ? 0.6 : 1 }]}><ThemedText style={[styles.actionText, { color: '#ffffff' }]}>{isSaving ? 'SAVING…' : 'SAVE PROFILE'}</ThemedText></Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ThemedView>
      <AlertComponent />
    </View>
  );
}

type FormFieldProps = { label: string; unit?: string; value: string; placeholder: string; error: string | null; keyboardType: 'default' | 'decimal-pad' | 'number-pad'; onChangeText: (text: string) => void; colors: { fieldColor: string; borderColor: string; inkColor: string; mutedInk: string; errorColor: string } };
function FormField({ label, unit, value, placeholder, error, keyboardType, onChangeText, colors }: FormFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: colors.mutedInk }]}>{label}{unit ? ` (${unit})` : ''}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: colors.fieldColor, borderColor: error ? colors.errorColor : colors.borderColor }]}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedInk}
          style={[styles.input, { color: colors.inkColor }]}
          value={value}
        />
        {unit ? <ThemedText style={[styles.unit, { color: colors.mutedInk }]}>{unit}</ThemedText> : null}
      </View>
      {error ? <ThemedText style={[styles.error, { color: colors.errorColor }]}>{error}</ThemedText> : null}
    </View>
  );
}

type OptionProps = { label: string; selected: boolean; onPress: () => void; colors: { fieldColor: string; borderColor: string; inkColor: string } };
function OptionButton({ label, selected, onPress, colors }: OptionProps) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[styles.option, { backgroundColor: selected ? colors.fieldColor : 'transparent', borderColor: selected ? colors.inkColor : colors.borderColor }]}><ThemedText style={[styles.optionText, { color: colors.inkColor }]}>{label}</ThemedText></Pressable>;
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
  options: { gap: Spacing.two },
  option: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.two, borderWidth: 1, borderRadius: 13 },
  optionText: { fontSize: 14, lineHeight: 19, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, paddingHorizontal: Spacing.two },
  cancelButton: { borderWidth: 1 },
  actionText: { fontSize: 12, lineHeight: 16, fontWeight: '900', letterSpacing: 0.5 },
});