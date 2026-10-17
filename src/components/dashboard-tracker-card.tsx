import { Link, type Href } from 'expo-router';
import { createElement, type ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type TrackerIconProps } from '@/components/icons/tracker-icons';
import { Spacing } from '@/constants/theme';

type DashboardTrackerCardProps = {
  href: Href;
  title: string;
  icon: ComponentType<TrackerIconProps> | string;
  color: string;
  value?: string;
  detail?: string;
};

export function DashboardTrackerCard({ href, title, icon, color, value, detail }: DashboardTrackerCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title} tracker`}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        <View style={[styles.card, { backgroundColor: color }]}>
          <View style={styles.ripples} pointerEvents="none">
            <View style={[styles.ripple, styles.rippleOuter]} />
            <View style={[styles.ripple, styles.rippleMiddle]} />
            <View style={[styles.ripple, styles.rippleInner]} />
            <View style={styles.iconWrap}>
              {typeof icon === 'string' ? (
                <ThemedText style={styles.icon}>{icon}</ThemedText>
              ) : (
                createElement(icon, { size: 32 })
              )}
            </View>
          </View>
          <View style={styles.content}>
            <ThemedText numberOfLines={1} style={styles.title}>
              {title}
            </ThemedText>
            {value && (
              <ThemedText style={styles.value}>
                {value}
              </ThemedText>
            )}
            {detail && (
              <ThemedText style={styles.detail}>
                {detail}
              </ThemedText>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pressed: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  card: {
    width: '100%',
    height: 164,
    borderRadius: 16,
    overflow: 'hidden',
    padding: Spacing.four,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ripples: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
  },
  rippleOuter: {
    width: 100,
    height: 100,
  },
  rippleMiddle: {
    width: 76,
    height: 76,
  },
  rippleInner: {
    width: 52,
    height: 52,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: Spacing.two,
  },
  icon: {
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'SourceSansPro_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: Spacing.two,
  },
  value: {
    color: '#FFFFFF',
    fontFamily: 'SourceSansPro_700Bold',
    fontSize: 22,
    lineHeight: 26,
    marginBottom: Spacing.one,
  },
  detail: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'SourceSansPro_400Regular',
    fontSize: 13,
    lineHeight: 16,
  },
});
