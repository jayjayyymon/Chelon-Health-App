import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FloatingTabBarInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenContainerProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  inTabs?: boolean;
};

export function ScreenContainer({ title, subtitle, children, inTabs = false }: ScreenContainerProps) {
  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          inTabs && { paddingBottom: FloatingTabBarInset + Spacing.four },
        ]}>
        <SafeAreaView edges={inTabs ? ['top', 'left', 'right'] : ['bottom', 'left', 'right']} style={styles.inner}>
          {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
          {subtitle ? (
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          ) : null}
          {children}
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.one,
  },
});
