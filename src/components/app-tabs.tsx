import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { NavigationColors, Spacing } from '@/constants/theme';

import { FloatingTabItem } from './floating-tab-item';
import { TAB_ITEMS } from './tab-navigation';

function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}
      pointerEvents="box-none">
      <View style={styles.bar}>
        {TAB_ITEMS.map((item) => {
          const route = state.routes.find(({ name }) => name === item.route);

          if (!route) return null;

          const isFocused = state.index === state.routes.indexOf(route);
          const options = descriptors[route.key]?.options;
          const accessibilityLabel = options?.tabBarAccessibilityLabel ?? item.label;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const handleLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={item.route}
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              onLongPress={handleLongPress}
              onPress={handlePress}
              testID={options?.tabBarButtonTestID}
              style={styles.pressable}>
              <View style={[styles.slot, isFocused && styles.activeSlot]}>
                <FloatingTabItem focused={isFocused} icon={item.icon} label={item.label} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="chatbot" options={{ title: 'Chat' }} />
      <Tabs.Screen name="health-centers" options={{ title: 'Centers' }} />
      <Tabs.Screen name="doctors" options={{ title: 'Doctors' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: 28,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  bar: {
    width: '100%',
    maxWidth: 800,
    height: 72,
    paddingHorizontal: Spacing.one,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: NavigationColors.background,
    borderRadius: 28,
    overflow: 'visible',
    shadowColor: '#0B2418',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 9,
    elevation: 9,
  },
  pressable: {
    flex: 1,
    minWidth: 44,
  },
  slot: {
    flex: 1,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    overflow: 'visible',
  },
  activeSlot: {
    paddingTop: 25,
  },
});
