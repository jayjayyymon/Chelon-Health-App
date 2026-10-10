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
};

export function DashboardTrackerCard({ href, title, icon, color }: DashboardTrackerCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
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
          <ThemedText numberOfLines={1} style={styles.title}>
            {title}
          </ThemedText>
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
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  pressed: {
    opacity: 0.82,
  },
  card: {
    width: '100%',
    height: 164,
    borderRadius: 20,
    overflow: 'hidden',
    padding: Spacing.three,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  icon: {
    fontSize: 30,
    lineHeight: 36,
  },
  title: {
    alignSelf: 'flex-end',
    maxWidth: '100%',
    color: '#FFFFFF',
    fontFamily: 'SourceSansPro_700Bold',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 0.3,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
});
