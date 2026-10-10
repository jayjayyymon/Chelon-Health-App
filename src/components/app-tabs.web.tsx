import {
  TabList,
  TabListProps,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { NavigationColors, MaxContentWidth, Spacing } from '@/constants/theme';

import { FloatingTabItem } from './floating-tab-item';
import { TAB_ITEMS } from './tab-navigation';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          {TAB_ITEMS.map((item) => (
            <TabTrigger key={item.trigger} name={item.trigger} href={item.href} asChild>
              <TabButton icon={item.icon}>{item.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon: (typeof TAB_ITEMS)[number]['icon'];
};

function TabButton({ children, icon, isFocused, ...props }: TabButtonProps) {
  const focused = Boolean(isFocused);

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <View style={[styles.slot, focused && styles.activeSlot]}>
        <FloatingTabItem focused={focused} icon={icon} label={String(children)} />
      </View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return (
    <View {...props} pointerEvents="box-none" style={styles.tabListContainer}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: 28,
    paddingBottom: Spacing.three,
    overflow: 'visible',
  },
  innerContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
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
  pressed: {
    opacity: 0.72,
  },
});
