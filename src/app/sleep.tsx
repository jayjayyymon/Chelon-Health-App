import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrackerActionButton } from '@/components/tracker-action-button';
import {
  TRACKER_HERO_BACKGROUND_HEIGHT,
  TrackerMascot,
} from '@/components/tracker-mascot';
import { Colors, MaxContentWidth, NavigationColors, Spacing } from '@/constants/theme';
import { useHealthData } from '@/context/HealthDataContext';
import { useProfile } from '@/hooks/useProfile';

const getSleepDurationMinutes = (bedtime: Date | null, wakeTime: Date | null) => {
  if (!bedtime || !wakeTime) return null;

  const bedtimeMinutes = bedtime.getHours() * 60 + bedtime.getMinutes();
  const wakeTimeMinutes = wakeTime.getHours() * 60 + wakeTime.getMinutes();
  const duration = (wakeTimeMinutes - bedtimeMinutes + 24 * 60) % (24 * 60);

  return duration > 0 ? duration : null;
};

const formatDurationParts = (hours: number | null) => {
  if (hours === null) {
    return { value: '--', unit: '', detail: '--' };
  }

  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    value: `${wholeHours}`,
    unit: wholeHours === 1 ? 'hr' : 'hrs',
    detail: `${minutes.toString().padStart(2, '0')} min`,
  };
};

const formatDate = (date: string | null) => {
  const currentYear = new Date().getFullYear();
  const parsedDate = date ? new Date(`${date}, ${currentYear}`) : new Date();
  const displayDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  return displayDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function SleepScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const { sleepHistory, addSleep } = useHealthData();
  const { profile } = useProfile();
  const [bedtime, setBedtime] = useState<Date | null>(null);
  const [wakeTime, setWakeTime] = useState<Date | null>(null);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  const durationMinutes = getSleepDurationMinutes(bedtime, wakeTime);
  const sleepDuration = durationMinutes === null
    ? null
    : `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? ` ${durationMinutes % 60}m` : ''}`;
  const mostRecentSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;
  const displayedHours = durationMinutes === null
    ? mostRecentSleep?.hours ?? null
    : durationMinutes / 60;
  const goalHours = profile.dailySleepGoalHours;
  const progress = displayedHours === null || goalHours <= 0
    ? 0
    : Math.min(Math.round((displayedHours / goalHours) * 100), 100);
  const displayedDuration = formatDurationParts(displayedHours);
  const goalDuration = formatDurationParts(goalHours);
  const contentWidth = Math.min(Math.max(screenWidth - Spacing.three * 2, 280), Math.min(MaxContentWidth, 520));
  const accent = isDark ? '#245C42' : NavigationColors.background;
  const heroTint = isDark ? '#183B2D' : '#C9E8CA';
  const cardText = '#FFFFFF';
  const controlBackground = isDark ? '#17382E' : '#FFFFFF';
  const inkColor = isDark ? '#F1F7F2' : '#113C3B';
  const mutedInk = isDark ? '#C1D4CA' : '#607B70';
  const borderColor = isDark ? '#397258' : '#D9E7DC';

  const showBedtimePickerHandler = () => {
    setShowBedtimePicker(true);
  };

  const hideBedtimePickerHandler = () => {
    setShowBedtimePicker(false);
  };

  const handleBedtimeChange = (_event: any, selectedDate?: Date | null) => {
    setShowBedtimePicker(false);
    if (selectedDate) {
      setBedtime(selectedDate);
    }
  };

  const showWakeTimePickerHandler = () => {
    setShowWakeTimePicker(true);
  };

  const hideWakeTimePickerHandler = () => {
    setShowWakeTimePicker(false);
  };

  const handleWakeTimeChange = (_event: any, selectedDate?: Date | null) => {
    setShowWakeTimePicker(false);
    if (selectedDate) {
      setWakeTime(selectedDate);
    }
  };

  const formatTimeForDisplay = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';

    let displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSaveSleep = () => {
    if (!bedtime || !wakeTime || durationMinutes === null) {
      alert('Please choose a bedtime and wake time that are not the same.');
      return;
    }

    const sleepHours = parseFloat((durationMinutes / 60).toFixed(1));
    const sleepEntry = {
      id: `sleep-${Date.now()}`,
      date: bedtime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      hours: sleepHours,
      bedtime: formatTimeForDisplay(bedtime),
      wakeTime: formatTimeForDisplay(wakeTime),
    };

    addSleep(sleepEntry);
    setBedtime(null);
    setWakeTime(null);
    alert('Sleep data saved!');
  };

  return (
    <ThemedView style={styles.root}>
      <View pointerEvents="none" style={[styles.heroBackground, { backgroundColor: heroTint }]} />
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.hero}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                onPress={() => router.back()}
                style={[styles.iconButton, { backgroundColor: controlBackground }]}
              >
                <Text style={[styles.backIcon, { color: inkColor }]}>‹</Text>
              </Pressable>
              <ThemedText style={[styles.wordmark, { color: inkColor }]}>sleep tracker</ThemedText>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <View style={styles.dateHeader}>
              <ThemedText style={[styles.dateText, { color: mutedInk }]}>
                {formatDate(mostRecentSleep?.date ?? null)}
              </ThemedText>
              <ThemedText style={[styles.todayLabel, { color: inkColor }]}>TODAY&apos;S SLEEP</ThemedText>
            </View>

            <TrackerMascot
              accessibilityLabel="CHELON turtle sleeping"
              source={require('../../assets/icons/cutie-sleep.png')}
            />
          </View>

          <View style={[styles.summaryCard, { backgroundColor: accent }]}>
            <View style={styles.scoreHeader}>
              <ThemedText style={[styles.progressLabel, { color: cardText }]}>SLEEP SCORE</ThemedText>
              <ThemedText style={[styles.progressPercent, { color: cardText }]}>{displayedHours === null ? '--' : `${progress}%`}</ThemedText>
            </View>
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Sleep goal progress"
              accessibilityValue={{ min: 0, max: 100, now: progress }}
              style={styles.progressTrack}
            >
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statTile, { backgroundColor: controlBackground }]}>
                <ThemedText style={[styles.statCaption, { color: mutedInk }]}>TODAY</ThemedText>
                <View style={styles.statValueRow}>
                  <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: inkColor }]}>
                    {displayedDuration.value}
                  </ThemedText>
                  <ThemedText style={[styles.statUnit, { color: inkColor }]}>{displayedDuration.unit}</ThemedText>
                </View>
                <ThemedText style={[styles.statDetail, { color: mutedInk }]}>{displayedDuration.detail}</ThemedText>
              </View>
              <View style={[styles.statTile, { backgroundColor: controlBackground }]}>
                <ThemedText style={[styles.statCaption, { color: mutedInk }]}>GOAL</ThemedText>
                <View style={styles.statValueRow}>
                  <ThemedText adjustsFontSizeToFit numberOfLines={1} style={[styles.statValue, { color: inkColor }]}>
                    {goalDuration.value}
                  </ThemedText>
                  <ThemedText style={[styles.statUnit, { color: inkColor }]}>{goalDuration.unit}</ThemedText>
                </View>
                <ThemedText style={[styles.statDetail, { color: mutedInk }]}>{goalDuration.detail}</ThemedText>
              </View>
            </View>

            <TrackerActionButton
              accessibilityLabel="Save sleep data"
              backgroundColor={controlBackground}
              color={inkColor}
              icon="＋"
              label="ADD SLEEP"
              onPress={handleSaveSleep}
            />
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.background, borderColor }]}>
            <ThemedText type="smallBold">Log your sleep</ThemedText>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <ThemedText type="small" style={{ color: mutedInk }}>Bedtime</ThemedText>
                <Pressable
                  accessibilityLabel="Choose bedtime"
                  accessibilityRole="button"
                  onPress={showBedtimePickerHandler}
                  style={[styles.timeButton, { backgroundColor: controlBackground, borderColor: theme.textSecondary }]}
                >
                  <ThemedText>{bedtime ? formatTimeForDisplay(bedtime) : mostRecentSleep?.bedtime ?? '--:-- --'}</ThemedText>
                </Pressable>
              </View>
              <View style={styles.formField}>
                <ThemedText type="small" style={{ color: mutedInk }}>Wake time</ThemedText>
                <Pressable
                  accessibilityLabel="Choose wake time"
                  accessibilityRole="button"
                  onPress={showWakeTimePickerHandler}
                  style={[styles.timeButton, { backgroundColor: controlBackground, borderColor: theme.textSecondary }]}
                >
                  <ThemedText>{wakeTime ? formatTimeForDisplay(wakeTime) : mostRecentSleep?.wakeTime ?? '--:-- --'}</ThemedText>
                </Pressable>
              </View>
            </View>
            <ThemedText type="small" style={{ color: mutedInk }}>
              {sleepDuration ? `Selected duration: ${sleepDuration}` : 'Choose both times to log a night of sleep.'}
            </ThemedText>
          </View>

          <View style={[styles.tipsCard, { backgroundColor: accent }]}>
            <ThemedText style={[styles.tipsTitle, { color: cardText }]}>A gentle sleep rhythm</ThemedText>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <ThemedText style={[styles.tipText, { color: cardText }]}>A calm wind-down can help make bedtime feel more consistent.</ThemedText>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <ThemedText style={[styles.tipText, { color: cardText }]}>Keep your sleep schedule comfortable and realistic for you.</ThemedText>
            </View>
          </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {showBedtimePicker && (
        <DateTimePicker
          value={bedtime || new Date()}
          mode="time"
          display="default"
          locale="en-US"
          onValueChange={handleBedtimeChange}
          onDismiss={hideBedtimePickerHandler}
          onNeutralButtonPress={hideBedtimePickerHandler}
        />
      )}
      {showWakeTimePicker && (
        <DateTimePicker
          value={wakeTime || new Date()}
          mode="time"
          display="default"
          locale="en-US"
          onValueChange={handleWakeTimeChange}
          onDismiss={hideWakeTimePickerHandler}
          onNeutralButtonPress={hideWakeTimePickerHandler}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TRACKER_HERO_BACKGROUND_HEIGHT,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  content: {
    maxWidth: Math.min(MaxContentWidth, 520),
    minWidth: 280,
  },
  hero: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 13,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#173B2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    width: 40,
  },
  iconButtonPlaceholder: {
    height: 40,
    width: 40,
  },
  backIcon: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
    marginTop: -4,
  },
  wordmark: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -0.7,
    textTransform: 'lowercase',
  },
  dateHeader: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.two,
    marginBottom: -60,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  todayLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.15,
    lineHeight: 23,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 25,
    elevation: 4,
    position: 'relative',
    zIndex: 1,
    marginTop: -50,
    paddingHorizontal: Spacing.three,
    paddingTop: 40,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#183B2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
  },
  scoreHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(255,255,255,0.88)',
    borderRadius: 9,
    borderWidth: 2,
    height: 15,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#A9E5BC',
    borderRadius: 7,
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    alignItems: 'center',
    borderRadius: 17,
    elevation: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 91,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.two,
    shadowColor: '#12392F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCaption: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statValueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 39,
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  statDetail: {
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.three,
    padding: Spacing.three,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  formField: {
    flex: 1,
    gap: Spacing.one,
  },
  timeButton: {
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  tipsCard: {
    borderRadius: 20,
    gap: Spacing.two,
    marginBottom: Spacing.three,
    marginTop: Spacing.three,
    padding: Spacing.three,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  tipRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tipDot: {
    backgroundColor: '#C8EDCE',
    borderRadius: 3,
    height: 6,
    marginTop: 7,
    width: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
