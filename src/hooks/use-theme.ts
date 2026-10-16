/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { loadThemePreference } from '@/utils/themeStorage';

export function useTheme() {
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system' | null>(null);
  const systemScheme = useColorScheme();

  // Load saved preference on initial render
  useEffect(() => {
    async function loadPreference() {
      const preference = await loadThemePreference();
      setThemePreference(preference);
    }
    loadPreference();
  }, []);

  // Determine which scheme to use: preference if set, otherwise system
  const effectiveScheme = themePreference ?? systemScheme ?? 'light';
  const theme = effectiveScheme === 'dark' ? Colors.dark : Colors.light;

  return theme;
}
