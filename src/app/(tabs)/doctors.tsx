import { Link } from 'expo-router';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import ChelonHeader from '@/components/chelon-header';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavigationColors, Spacing } from '@/constants/theme';
import { doctors } from '@/data/mock-data';
import { useTheme } from '@/hooks/use-theme';

function getInitials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export default function DoctorsScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const accent = isDark ? '#8bd8b0' : NavigationColors.background;
  const cardColor = isDark ? '#17382e' : '#ffffff';
  const borderColor = isDark ? '#397258' : '#d9e7dc';
  const mutedColor = theme.textSecondary;

  return (
    <ScreenContainer inTabs>
      <ChelonHeader />
      <View style={[styles.intro, { backgroundColor: isDark ? '#1b4633' : '#dff1df' }]}>
        <ThemedText style={[styles.introEyebrow, { color: accent }]}>CARE TEAM</ThemedText>
        <ThemedText style={styles.introTitle}>Find the right support for your wellbeing.</ThemedText>
        <ThemedText style={[styles.introBody, { color: mutedColor }]}>
          Browse the available care team and choose a time that works for you.
        </ThemedText>
      </View>


      {doctors.length === 0 ? (
        <ThemedView type="backgroundElement" style={styles.emptyState}>
          <ThemedText type="smallBold">No doctors available yet</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
            Please check back later for available consultation options.
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.doctorList}>
          {doctors.map(doctor => (
            <View
              key={doctor.id}
              style={[styles.doctorCard, { backgroundColor: cardColor, borderColor }]}>
              <Link href={`/book/${doctor.id}`} asChild>
                <Pressable
                  accessibilityHint={`Open booking details for ${doctor.name}`}
                  accessibilityLabel={`${doctor.name}, ${doctor.specialty}. Next slot ${doctor.nextSlot}`}
                  accessibilityRole="button"
                  style={({ pressed }) => [pressed && styles.pressed]}>
                  <View style={styles.doctorContent}>
                    <View style={styles.doctorHeader}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#2f7655' : '#c5e7ce' }]}>
                  <ThemedText style={[styles.avatarText, { color: isDark ? '#f1f7f2' : '#1d6044' }]}>
                    {getInitials(doctor.name)}
                  </ThemedText>
                </View>
                <View style={styles.doctorIdentity}>
                  <ThemedText numberOfLines={1} style={styles.doctorName}>
                    {doctor.name}
                  </ThemedText>
                  <ThemedText style={[styles.specialty, { color: mutedColor }]}>
                    {doctor.specialty}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.chevron, { color: accent }]}>›</ThemedText>
              </View>

              <View style={[styles.metaPanel, { backgroundColor: isDark ? '#214b3a' : '#f1f8f1' }]}>
                <View style={styles.metaItem}>
                  <ThemedText style={[styles.metaLabel, { color: mutedColor }]}>NEXT SLOT</ThemedText>
                  <ThemedText type="smallBold">{doctor.nextSlot}</ThemedText>
                </View>
                <View style={[styles.metaDivider, { backgroundColor: borderColor }]} />
                <View style={styles.metaItem}>
                  <ThemedText style={[styles.metaLabel, { color: mutedColor }]}>TIMES</ThemedText>
                  <ThemedText type="smallBold">{doctor.availableTimes.length} available</ThemedText>
                </View>
              </View>

                    <View style={[styles.action, { backgroundColor: accent }]}>
                      <ThemedText style={styles.actionText}>VIEW DETAILS & BOOK</ThemedText>
                    </View>
                  </View>
                </Pressable>
              </Link>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius:20,
  },
  introEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  introTitle: {
    maxWidth: 330,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  introBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  doctorList: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
    marginHorizontal: -8,
    marginBottom: Spacing.four,
    paddingTop: 0,
    paddingBottom: 100,
  },
  doctorCard: {
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#173b2c',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  doctorContent: {
    gap: 12,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },
  doctorIdentity: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  doctorName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
  },
  specialty: {
    fontSize: 14,
    lineHeight: 19,
  },
  chevron: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
  metaPanel: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: Spacing.two,
    borderRadius: 12,
  },
  metaItem: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  metaDivider: {
    width: 1,
    marginHorizontal: Spacing.two,
  },
  metaLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  action: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 10,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyState: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 16,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.72,
  },
});
