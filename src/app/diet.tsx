import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DietIcon } from '@/components/icons/tracker-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData, type DietMeal } from '@/context/HealthDataContext';
import { getLocalDateKey } from '@/utils/dietStorage';
import { useProfile } from '@/hooks/useProfile';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Custom'] as const;
const accentGreen = NavigationColors.background;

export default function DietScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { dietMeals, addDietMeal, updateDietMeal, removeDietMeal } = useHealthData();
  const { profile } = useProfile();
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<(typeof mealTypes)[number]>('Custom');
  const [calories, setCalories] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todayKey = getLocalDateKey();
  const currentDate = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  );
  const todayMeals = useMemo(
    () => dietMeals
      .filter(meal => (meal.dateKey ?? todayKey) === todayKey)
      .sort((first, second) => {
        const firstTime = first.createdAt ? Date.parse(first.createdAt) : 0;
        const secondTime = second.createdAt ? Date.parse(second.createdAt) : 0;
        return secondTime - firstTime;
      }),
    [dietMeals, todayKey],
  );
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieGoal = profile.dailyCalorieGoal;
  const progress = calorieGoal > 0 ? Math.min(100, Math.max(0, (totalCalories / calorieGoal) * 100)) : 0;
  const heroTint = isDark ? '#183b2d' : '#c9e8ca';
  const panelGreen = isDark ? '#245c42' : accentGreen;
  const panelText = '#ffffff';
  const inkColor = isDark ? '#f1f7f2' : '#113c3b';
  const mutedInk = isDark ? '#c1d4ca' : '#607b70';
  const tileColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const controlColor = isDark ? '#214936' : '#f6fbf6';

  const resetForm = () => {
    setFoodName('');
    setMealType('Custom');
    setCalories('');
    setEditingId(null);
    setError(null);
  };

  const handleSaveMeal = () => {
    const name = foodName.trim();
    const trimmedCalories = calories.trim();
    if (!name) {
      setError('Enter a food name.');
      return;
    }
    if (!/^\d+$/.test(trimmedCalories)) {
      setError('Calories must be a whole number.');
      return;
    }
    const calorieValue = Number(trimmedCalories);
    if (!Number.isInteger(calorieValue) || calorieValue <= 0 || calorieValue > 10000) {
      setError('Calories must be between 1 and 10,000 kcal.');
      return;
    }

    if (editingId) {
      updateDietMeal(editingId, { name, meal: mealType, calories: calorieValue });
    } else {
      const now = new Date();
      addDietMeal({
        id: `meal-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        meal: mealType,
        calories: calorieValue,
        dateKey: getLocalDateKey(now),
        createdAt: now.toISOString(),
      });
    }
    resetForm();
  };

  const handleEditMeal = (meal: DietMeal) => {
    setEditingId(meal.id);
    setFoodName(meal.name);
    setMealType(mealTypes.includes(meal.meal as (typeof mealTypes)[number])
      ? meal.meal as (typeof mealTypes)[number]
      : 'Custom');
    setCalories(String(meal.calories));
    setError(null);
  };

  const handleRemoveMeal = (meal: DietMeal) => {
    Alert.alert('Remove meal?', `Remove ${meal.name} from today’s log?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDietMeal(meal.id) },
    ]);
  };

  return (
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: heroTint }]} />
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}>
                <ThemedText style={[styles.backGlyph, { color: inkColor }]}>‹</ThemedText>
              </Pressable>
              <ThemedText style={[styles.wordmark, { color: inkColor }]}>diet tracker</ThemedText>
              <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.heading}>
              <ThemedText style={[styles.date, { color: mutedInk }]}>{currentDate}</ThemedText>
              <ThemedText style={[styles.headingTitle, { color: inkColor }]}>TODAY&apos;S CALORIE INTAKE</ThemedText>
            </View>

            <View style={styles.iconStage}>
              <DietIcon size={166} />
            </View>

            <View style={[styles.progressCard, { backgroundColor: panelGreen }]}>
              <View style={styles.progressHeader}>
                <ThemedText style={[styles.progressLabel, { color: panelText }]}>DAILY PROGRESS</ThemedText>
                <ThemedText style={[styles.progressPercent, { color: panelText }]}>{Math.round(progress)}%</ThemedText>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel="Daily calorie goal progress"
                accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
                style={[styles.progressTrack, { borderColor: 'rgba(255,255,255,0.88)' }]}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>TODAY</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{totalCalories.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>kcal</ThemedText>
                  </View>
                  <ThemedText style={[styles.statDetail, { color: mutedInk }]}>{todayMeals.length} meal{todayMeals.length === 1 ? '' : 's'} logged</ThemedText>
                </View>
                <View style={[styles.statTile, { backgroundColor: tileColor }]}>
                  <ThemedText style={[styles.statLabel, { color: mutedInk }]}>GOAL</ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText style={[styles.statValue, { color: inkColor }]}>{calorieGoal.toLocaleString()}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: inkColor }]}>kcal</ThemedText>
                  </View>
                  <ThemedText style={[styles.statDetail, { color: mutedInk }]}>Daily target</ThemedText>
                </View>
              </View>
            </View>

            <View style={[styles.formCard, { backgroundColor: theme.background, borderColor }]}>
              <View style={styles.sectionHeading}>
                <View>
                  <ThemedText style={[styles.sectionTitle, { color: inkColor }]}>{editingId ? 'Edit meal' : 'Log a meal'}</ThemedText>
                  <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>Keep a simple record of what you eat.</ThemedText>
                </View>
                {editingId && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Cancel editing" onPress={resetForm}>
                    <ThemedText style={[styles.cancelText, { color: mutedInk }]}>Cancel</ThemedText>
                  </Pressable>
                )}
              </View>
              <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>FOOD NAME</ThemedText>
              <TextInput
                accessibilityLabel="Food name"
                placeholder="e.g. Oatmeal"
                placeholderTextColor={mutedInk}
                value={foodName}
                onChangeText={text => { setFoodName(text); setError(null); }}
                style={[styles.input, { color: inkColor, backgroundColor: controlColor, borderColor }]}
              />
              <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>MEAL TYPE</ThemedText>
              <View style={styles.mealTypeRow}>
                {mealTypes.map(type => (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mealType === type }}
                    onPress={() => setMealType(type)}
                    style={[styles.mealTypeButton, { borderColor, backgroundColor: mealType === type ? panelGreen : controlColor }]}>
                    <ThemedText style={[styles.mealTypeText, { color: mealType === type ? panelText : mutedInk }]}>{type}</ThemedText>
                  </Pressable>
                ))}
              </View>
              <ThemedText style={[styles.fieldLabel, { color: mutedInk }]}>CALORIES</ThemedText>
              <TextInput
                accessibilityLabel="Calories"
                placeholder="e.g. 420"
                placeholderTextColor={mutedInk}
                value={calories}
                onChangeText={text => { setCalories(text); setError(null); }}
                keyboardType="number-pad"
                style={[styles.input, { color: inkColor, backgroundColor: controlColor, borderColor }]}
              />
              {error && <ThemedText style={[styles.errorText, { color: isDark ? '#ffb4ab' : '#b3261e' }]}>{error}</ThemedText>}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={editingId ? 'Save meal changes' : 'Add meal'}
                onPress={handleSaveMeal}
                style={({ pressed }) => [styles.primaryButton, { backgroundColor: panelGreen, opacity: pressed ? 0.8 : 1 }]}>
                <ThemedText style={[styles.primaryButtonText, { color: panelText }]}>{editingId ? 'SAVE CHANGES' : 'ADD MEAL'}</ThemedText>
              </Pressable>
            </View>

            <View style={[styles.recentCard, { backgroundColor: theme.background, borderColor }]}>
              <View style={styles.sectionHeading}>
                <View>
                  <ThemedText style={[styles.sectionTitle, { color: inkColor }]}>Today&apos;s meals</ThemedText>
                  <ThemedText style={[styles.sectionSubtitle, { color: mutedInk }]}>Your latest food entries</ThemedText>
                </View>
              </View>
              {todayMeals.length > 0 ? todayMeals.map(meal => (
                <View key={meal.id} style={[styles.mealRow, { borderTopColor: borderColor }]}>
                  <View style={styles.mealRowText}>
                    <ThemedText style={[styles.mealName, { color: inkColor }]}>{meal.name}</ThemedText>
                    <ThemedText style={[styles.mealMeta, { color: mutedInk }]}>{meal.meal}</ThemedText>
                  </View>
                  <ThemedText style={[styles.mealCalories, { color: inkColor }]}>{meal.calories.toLocaleString()} kcal</ThemedText>
                  <View style={styles.rowActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${meal.name}`} onPress={() => handleEditMeal(meal)}>
                      <ThemedText style={[styles.actionText, { color: inkColor }]}>Edit</ThemedText>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${meal.name}`} onPress={() => handleRemoveMeal(meal)}>
                      <ThemedText style={[styles.actionText, { color: isDark ? '#ffb4ab' : '#b3261e' }]}>Remove</ThemedText>
                    </Pressable>
                  </View>
                </View>
              )) : (
                <ThemedText style={[styles.emptyText, { color: mutedInk }]}>No meals logged today. Add your first meal above.</ThemedText>
              )}
            </View>

            <View style={[styles.tipsCard, { backgroundColor: panelGreen }]}>
              <ThemedText style={[styles.tipsTitle, { color: panelText }]}>A balanced plate, one meal at a time</ThemedText>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>Include a mix of vegetables, protein, and satisfying whole-food carbohydrates.</ThemedText>
              </View>
              <View style={styles.tipRow}>
                <View style={styles.tipDot} />
                <ThemedText style={[styles.tipText, { color: panelText }]}>Use your log as a gentle guide, not a replacement for personal nutrition advice.</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.five },
  content: { width: '100%', maxWidth: Math.min(MaxContentWidth, 520) },
  topBar: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundButton: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#ffffff', elevation: 2, shadowColor: '#173b2c', shadowOpacity: 0.12, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  backGlyph: { fontSize: 36, lineHeight: 40, fontWeight: '700', marginTop: -4 },
  wordmark: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.7 },
  topBarSpacer: { width: 40 },
  heading: { alignItems: 'center', marginTop: Spacing.two, gap: Spacing.one },
  date: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  headingTitle: { fontSize: 17, lineHeight: 23, fontWeight: '900', letterSpacing: 0.15, textAlign: 'center' },
  iconStage: { height: 137, alignItems: 'center', justifyContent: 'center', position: 'relative', transform: [{ translateY: 22 }], zIndex: 2, marginTop: Spacing.one },
  progressCard: { borderRadius: 25, position: 'relative', zIndex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.five, paddingBottom: Spacing.three, marginTop: -Spacing.four, gap: Spacing.two, elevation: 4, shadowColor: '#183b2c', shadowOpacity: 0.18, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  progressPercent: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 15, borderWidth: 2, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.94)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: '#a9e5bc' },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statTile: { flex: 1, minHeight: 91, alignItems: 'center', justifyContent: 'center', borderRadius: 17, paddingVertical: Spacing.two, paddingHorizontal: Spacing.one, elevation: 2, shadowColor: '#12392f', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.one },
  statValue: { fontSize: 28, lineHeight: 36, fontWeight: '900' },
  statUnit: { fontSize: 12, fontWeight: '700' },
  statDetail: { fontSize: 11, fontWeight: '600' },
  formCard: { marginTop: Spacing.three, borderWidth: 1, borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  sectionTitle: { fontSize: 16, lineHeight: 22, fontWeight: '800' },
  sectionSubtitle: { fontSize: 12, lineHeight: 18 },
  cancelText: { fontSize: 12, fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginTop: Spacing.one },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: Spacing.two, fontSize: 15 },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  mealTypeButton: { minHeight: 34, justifyContent: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.two },
  mealTypeText: { fontSize: 12, fontWeight: '700' },
  errorText: { fontSize: 12, lineHeight: 17, fontWeight: '600' },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13, marginTop: Spacing.one },
  primaryButtonText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.4 },
  recentCard: { marginTop: Spacing.three, borderWidth: 1, borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  mealRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two, gap: Spacing.two },
  mealRowText: { flex: 1, minWidth: 0 },
  mealName: { fontSize: 14, fontWeight: '700' },
  mealMeta: { fontSize: 12, marginTop: 2 },
  mealCalories: { fontSize: 13, fontWeight: '700' },
  rowActions: { gap: Spacing.one, alignItems: 'flex-end' },
  actionText: { fontSize: 11, fontWeight: '800' },
  emptyText: { fontSize: 13, lineHeight: 19, paddingVertical: Spacing.two },
  tipsCard: { marginTop: Spacing.three, borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  tipsTitle: { fontSize: 15, fontWeight: '800', marginBottom: Spacing.one },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, backgroundColor: '#c8edce' },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.75 },
});
