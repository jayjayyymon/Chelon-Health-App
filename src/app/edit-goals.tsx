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
import { useProfile } from '@/hooks/useProfile';
import { useAlert } from '@/hooks/use-alert';

export default function EditGoalsScreen() {
  const { profile, loading, saveProfile: saveProfileToStorage } = useProfile();
  const isDark = useColorScheme() === 'dark';
  const [isSaving, setIsSaving] = useState(false);
  const [goalWeightInput, setGoalWeightInput] = useState('');
  const [dailyWaterGoalInput, setDailyWaterGoalInput] = useState('');
  const [dailyStepGoalInput, setDailyStepGoalInput] = useState('');
  const [dailyCalorieGoalInput, setDailyCalorieGoalInput] = useState('');
  const initialSleepMinutes = Math.round(profile.dailySleepGoalHours * 60);
  const [sleepGoalHoursInput, setSleepGoalHoursInput] = useState(() => String(Math.floor(initialSleepMinutes / 60)));
  const [sleepGoalMinutesInput, setSleepGoalMinutesInput] = useState(() => String(initialSleepMinutes % 60));
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

  const updateError = (key: string, value: string | null) => setErrors(previous => ({ ...previous, [key]: value }));

  const validateForm = () => {
    const nextErrors: Record<string, string | null> = {};
    const goalWeight = goalWeightInput.trim();
    const waterGoal = dailyWaterGoalInput.trim();
    const stepGoal = dailyStepGoalInput.trim();
    const calorieGoal = dailyCalorieGoalInput.trim();
    const sleepHours = Number(sleepGoalHoursInput.trim());
    const sleepMinutes = Number(sleepGoalMinutesInput.trim());
    const sleepTotalMinutes = sleepHours * 60 + sleepMinutes;

    if (goalWeight !== '' && (!/^\d+(?:\.\d+)?$/.test(goalWeight) || Number(goalWeight) < 30 || Number(goalWeight) > 300)) nextErrors.goalWeight = 'Goal weight must be between 30 and 300 kg.';
    if (waterGoal !== '' && (!/^\d+(?:\.\d+)?$/.test(waterGoal) || Number(waterGoal) <= 0)) nextErrors.water = 'Water goal must be greater than 0 L.';
    if (stepGoal !== '' && (!/^\d+$/.test(stepGoal) || Number(stepGoal) <= 0)) nextErrors.steps = 'Steps must be a positive whole number.';
    if (calorieGoal !== '' && (!/^\d+$/.test(calorieGoal) || Number(calorieGoal) < 1 || Number(calorieGoal) > 10000)) nextErrors.calories = 'Calories must be between 1 and 10,000 kcal.';
    if (!/^\d+$/.test(sleepGoalHoursInput.trim()) || !/^\d+$/.test(sleepGoalMinutesInput.trim()) || sleepMinutes > 59 || sleepTotalMinutes <= 0 || sleepTotalMinutes > 24 * 60) nextErrors.sleep = 'Sleep must be 1–24 hours, with minutes from 0–59.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const saved = await saveProfileToStorage({
        ...profile,
        goalWeightKg: goalWeightInput.trim() === '' ? profile.goalWeightKg : Number(goalWeightInput.trim()),
        dailyWaterGoalL: dailyWaterGoalInput.trim() === '' ? profile.dailyWaterGoalL : Number(dailyWaterGoalInput.trim()),
        dailyStepGoal: dailyStepGoalInput.trim() === '' ? profile.dailyStepGoal : Number(dailyStepGoalInput.trim()),
        dailyCalorieGoal: dailyCalorieGoalInput.trim() === '' ? profile.dailyCalorieGoal : Number(dailyCalorieGoalInput.trim()),
        dailySleepGoalHours: (Number(sleepGoalHoursInput) * 60 + Number(sleepGoalMinutesInput)) / 60,
      });
      if (saved) {
        showAlert({
          title: 'Goals saved',
          message: 'Your daily targets have been updated.',
          type: 'success',
          onConfirm: () => router.back(),
          confirmText: 'OK',
        });
      } else {
        showAlert({
          title: 'Error',
          message: 'Failed to save goals. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Failed to save goals:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to save goals. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ThemedView style={[styles.root, { backgroundColor: pageBackground }]}><ThemedText>Loading profile...</ThemedText></ThemedView>;
  }

  return (
    <View style={{ flex: 1 }}>
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
                  <ThemedText style={[styles.title, { color: inkColor }]}>Edit Goals</ThemedText>
                </View>
                <View style={styles.headerSpacer} />
              </View>

              <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
                <ThemedText style={[styles.cardTitle, { color: inkColor }]}>Health goals</ThemedText>
                <ThemedText style={[styles.cardSubtitle, { color: mutedInk }]}>Set realistic daily targets for your trackers.</ThemedText>
                <GoalField label="GOAL WEIGHT" unit="kg" value={goalWeightInput} placeholder={String(profile.goalWeightKg)} onChangeText={text => { setGoalWeightInput(text); updateError('goalWeight', null); }} error={errors.goalWeight ?? null} keyboardType="decimal-pad" colors={colors} />
                <GoalField label="DAILY WATER" unit="L" value={dailyWaterGoalInput} placeholder={String(profile.dailyWaterGoalL)} onChangeText={text => { setDailyWaterGoalInput(text); updateError('water', null); }} error={errors.water ?? null} keyboardType="decimal-pad" colors={colors} />
                <GoalField label="DAILY STEPS" value={dailyStepGoalInput} placeholder={profile.dailyStepGoal.toLocaleString()} onChangeText={text => { setDailyStepGoalInput(text); updateError('steps', null); }} error={errors.steps ?? null} keyboardType="number-pad" colors={colors} />
                <GoalField label="DAILY CALORIES" unit="kcal" value={dailyCalorieGoalInput} placeholder={profile.dailyCalorieGoal.toLocaleString()} onChangeText={text => { setDailyCalorieGoalInput(text); updateError('calories', null); }} error={errors.calories ?? null} keyboardType="number-pad" colors={colors} />
                <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>DAILY SLEEP</ThemedText>
                <View style={styles.sleepRow}>
                  <GoalField label="HOURS" value={sleepGoalHoursInput} placeholder="0" onChangeText={text => { setSleepGoalHoursInput(text); updateError('sleep', null); }} error={null} keyboardType="number-pad" colors={colors} compact />
                  <GoalField label="MINUTES" value={sleepGoalMinutesInput} placeholder="00" onChangeText={text => { setSleepGoalMinutesInput(text); updateError('sleep', null); }} error={null} keyboardType="number-pad" colors={colors} compact />
                </View>
                {errors.sleep ? <ThemedText style={[styles.error, { color: errorColor }]}>{errors.sleep}</ThemedText> : null}
              </View>

              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.actionButton, styles.cancelButton, { borderColor, backgroundColor: cardColor }]}>
                  <ThemedText style={[styles.actionText, { color: inkColor }]}>CANCEL</ThemedText>
                </Pressable>
                <Pressable accessibilityRole="button" disabled={isSaving} onPress={handleSave} style={[styles.actionButton, { backgroundColor: panelGreen, opacity: isSaving ? 0.6 : 1 }]}>
                  <ThemedText style={[styles.actionText, { color: '#ffffff' }]}>{isSaving ? 'SAVING…' : 'SAVE GOALS'}</ThemedText>
                </Pressable>
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

type GoalFieldProps = {
  label: string;
  unit?: string;
  value: string;
  placeholder: string;
  error: string | null;
  keyboardType: 'decimal-pad' | 'number-pad';
  onChangeText: (text: string) => void;
  colors: { fieldColor: string; borderColor: string; inkColor: string; mutedInk: string; errorColor: string };
  compact?: boolean;
};

function GoalField({ label, unit, value, placeholder, error, keyboardType, onChangeText, colors, compact = false }: GoalFieldProps) {
  return (
    <View style={[styles.fieldGroup, compact && styles.compactField]}>
      <ThemedText style={[styles.fieldLabel, { color: colors.mutedInk }]}>{label}{unit ? ` (${unit})` : ''}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: colors.fieldColor, borderColor: error ? colors.errorColor : colors.borderColor }]}>
        <TextInput keyboardType={keyboardType} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedInk} style={[styles.input, { color: colors.inkColor }]} value={value} />
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
  fieldGroup: { flex: 1, gap: Spacing.one },
  compactField: { minWidth: 0 },
  fieldLabel: { fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 0.7 },
  inputWrap: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 13, paddingHorizontal: Spacing.two },
  input: { flex: 1, minHeight: 48, fontSize: 16 },
  unit: { fontSize: 13, fontWeight: '700' },
  sleepRow: { flexDirection: 'row', gap: Spacing.two },
  error: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, paddingHorizontal: Spacing.two },
  cancelButton: { borderWidth: 1 },
  actionText: { fontSize: 12, lineHeight: 16, fontWeight: '900', letterSpacing: 0.5 },
});
