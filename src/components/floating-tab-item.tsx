import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { NavigationColors } from '@/constants/theme';

import { TabIcon, type TabIconName } from './tab-navigation';

type FloatingTabItemProps = {
  label: string;
  icon: TabIconName;
  focused: boolean;
};

export function FloatingTabItem({ label, icon, focused }: FloatingTabItemProps) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      friction: 7,
      tension: 120,
      useNativeDriver: Platform.OS !== 'web',
    });

    animation.start();
    return () => animation.stop();
  }, [focused, progress]);

  const activeStyle = {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
      },
      {
        scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
      },
    ],
  };
  const inactiveStyle = {
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
  };

  return (
    <>
      <Animated.View style={[styles.activeBadge, activeStyle]} pointerEvents="none">
        <Animated.View style={styles.activeBadgeInner}>
          <TabIcon name={icon} size={23} tintColor={NavigationColors.activeIcon} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.activeLabel, activeStyle]}>{label.toUpperCase()}</Animated.Text>
      <Animated.View style={[styles.inactiveIcon, inactiveStyle]}>
        <TabIcon name={icon} tintColor={NavigationColors.inactiveIcon} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  inactiveIcon: {
    marginBottom: 17,
  },
  activeBadge: {
    position: 'absolute',
    top: -18,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NavigationColors.background,
    borderColor: NavigationColors.activeRing,
    borderRadius: 30,
    borderWidth: 4,
    shadowColor: '#0B2418',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 7,
  },
  activeBadgeInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NavigationColors.activeBadge,
    borderRadius: 22,
  },
  activeLabel: {
    position: 'absolute',
    bottom: 10,
    color: NavigationColors.label,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    lineHeight: 12,
  },
});
