import { version } from 'expo/package.json';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSharedProfile } from '@/context/ProfileContext';
import { loadNotificationsEnabled, saveNotificationsEnabled } from '@/utils/settingsStorage';
import { useAlert } from '@/hooks/use-alert';

type LocationStatus = 'loading' | 'granted' | 'not-granted' | 'unavailable';

const locationStatusText: Record<LocationStatus, string> = {
  loading: 'Checking permission…',
  granted: 'Granted',
  'not-granted': 'Not granted',
  unavailable: 'Unable to determine',
};

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { resetProfile } = useSharedProfile();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('loading');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [alertVisible, showAlert, hideAlert, AlertComponent] = useAlert();

  useEffect(() => {
    let active = true;
    void loadNotificationsEnabled().then(enabled => {
      if (active) setNotificationsEnabled(enabled);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    void Location.getForegroundPermissionsAsync()
      .then(permission => {
        if (active) setLocationStatus(permission.status === 'granted' ? 'granted' : 'not-granted');
      })
      .catch(error => {
        console.error('Failed to check location permission:', error);
        if (active) {
          setLocationStatus('unavailable');
          setLocationError('The device permission status could not be read.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleNotificationsChange = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    try {
      await saveNotificationsEnabled(enabled);
    } catch {
      setNotificationsEnabled(!enabled);
      showAlert({
        title: 'Could not save setting',
        message: 'Your notification preference could not be saved.',
        type: 'error',
      });
    }
  };

  const handleLocationPermission = async () => {
    setLocationStatus('loading');
    setLocationError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(permission.status === 'granted' ? 'granted' : 'not-granted');
    } catch (error) {
      console.error('Failed to request location permission:', error);
      setLocationStatus('unavailable');
      setLocationError('The device permission request could not be completed.');
    }
  };

  const confirmResetProfile = () => {
    showAlert({
      title: 'Reset profile?',
      message: 'This removes your saved profile. Weight, diet, water, sleep, steps, and appointment data will remain on this device.',
      type: 'confirmation',
      onConfirm: async () => {
        setResetting(true);
        const didReset = await resetProfile();
        setResetting(false);
        if (!didReset) {
          showAlert({
            title: 'Reset failed',
            message: 'Your profile could not be reset. No stored health data was changed.',
            type: 'error',
          });
        }
      },
      cancelText: 'Cancel',
      confirmText: 'Reset profile',
    });
  };

  const locationActionLabel = locationStatus === 'granted'
    ? 'Check location permission'
    : 'Allow location access';

  // Define the accordion sections
  const sections = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      content: () => (
        <View style={styles.accordionContent}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowInfo}>
              <ThemedText style={styles.settingsRowTitle}>Notifications</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                Local preference only. Push notifications are not configured yet.
              </ThemedText>
            </View>
            <Switch
              accessibilityLabel="Notifications preference"
              onValueChange={handleNotificationsChange}
              thumbColor={notificationsEnabled ? theme.background : undefined}
              trackColor={{ false: theme.backgroundSelected, true: '#4ca771' }}
              value={notificationsEnabled}
            />
          </View>
        </View>
      ),
    },
    {
      id: 'location',
      title: 'Location',
      icon: '📍',
      content: () => (
        <View style={styles.accordionContent}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowInfo}>
              <ThemedText style={styles.settingsRowTitle}>Location</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                Foreground device permission used for nearby health centers. CHELON does not store your coordinates.
              </ThemedText>
            </View>
            {locationStatus === 'loading' ? <ActivityIndicator color={theme.textSecondary} size={20} /> : null}
          </View>
          <ThemedText style={styles.statusText} themeColor="textSecondary">
            Status: {locationStatusText[locationStatus]}
          </ThemedText>
          {locationError ? <ThemedText themeColor="textSecondary" type="small">{locationError}</ThemedText> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={locationActionLabel}
            disabled={locationStatus === 'loading'}
            onPress={handleLocationPermission}
            style={({ pressed }) => [
              styles.outlineButton,
              { borderColor: theme.text },
              locationStatus === 'loading' && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.outlineButtonText}>{locationActionLabel}</ThemedText>
          </Pressable>
        </View>
      ),
    },
    {
      id: 'helpSupport',
      title: 'Help & Support',
      icon: '❓',
      content: () => (
        <View style={styles.accordionContent}>
          <ThemedText themeColor="textSecondary">
            Need help using CHELON? You can explore your health dashboard, record daily wellness activities, review your progress, and update your personal goals from the app. For health concerns or urgent symptoms, contact a qualified healthcare professional or local emergency services.
          </ThemedText>
        </View>
      ),
    },
    {
      id: 'privacyPolicy',
      title: 'Privacy Policy',
      icon: '🔒',
      content: () => (
        <View style={styles.accordionContent}>
          <ThemedText themeColor="textSecondary">
            Information entered into the app, such as profile details and wellness records, is used to display personal health summaries and track progress. This information is stored locally on your device and is not transmitted to any external servers. Please do not enter information that you do not want stored.
          </ThemedText>
        </View>
      ),
    },
    {
      id: 'termsConditions',
      title: 'Terms & Conditions',
      icon: '📄',
      content: () => (
        <View style={styles.accordionContent}>
          <ThemedText themeColor="textSecondary">
            CHELON is intended to support general wellness tracking and education. App information is not a substitute for professional medical advice, diagnosis, or treatment. Users should consult qualified healthcare professionals for medical concerns. Users are responsible for the accuracy of information they enter. Availability of app features may depend on device permissions and connectivity.
          </ThemedText>
        </View>
      ),
    },
    {
      id: 'about',
      title: 'About CHELON',
      icon: 'ℹ️',
      content: () => (
        <View style={styles.accordionContent}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.settingsRowTitle}>Version</ThemedText>
            <ThemedText themeColor="textSecondary" type="small" style={styles.infoValue}>{version}</ThemedText>
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            Prototype app using local data. No account service or remote support system is connected.
          </ThemedText>
        </View>
      ),
    },
    {
      id: 'resetProfile',
      title: 'Log Out / Reset Profile',
      icon: '🚪',
      content: () => (
        <View style={styles.accordionContent}>
          <ThemedText themeColor="textSecondary" type="small">
            Resetting your profile clears your saved profile but keeps your health tracking data on this device.
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset profile"
            disabled={resetting}
            onPress={confirmResetProfile}
            style={({ pressed }) => [styles.destructiveButton, resetting && styles.disabled, pressed && styles.pressed]}>
            {resetting ? <ActivityIndicator color="#FFFFFF" size={20} /> : <ThemedText style={styles.destructiveButtonText}>Reset profile</ThemedText>}
          </Pressable>
        </View>
      ),
    },
  ];

  // Styles that depend on theme
  const accordionItemStyle = {
    backgroundColor: theme.backgroundSelected,
    borderRadius: Spacing.three,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.one,
    borderWidth: 1,
    borderColor: theme.backgroundElement,
  };

  const accordionHeaderStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: Spacing.three,
  };

  const accordionChevronStyle = {
    fontSize: 20,
    color: theme.textSecondary,
  };

  return (
    <ScreenContainer>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <ThemedText style={styles.backIcon}>‹</ThemedText>
          </Pressable>
          <View style={styles.headerCopy}>
            <ThemedText style={styles.eyebrow}>CHELON</ThemedText>
            <ThemedText type="subtitle" style={styles.title}>Settings</ThemedText>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      {/* Accordion container */}
      <View style={styles.accordionContainer}>
        {sections.map(section => (
          <View key={section.id} style={accordionItemStyle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${section.title}, ${expandedSection === section.id ? 'expanded' : 'collapsed'}`}
              onPress={() => {
                setExpandedSection(expandedSection === section.id ? null : section.id);
              }}
              style={accordionHeaderStyle}>
              <View style={styles.accordionHeaderLeft}>
                <ThemedText style={styles.accordionIcon}>{section.icon}</ThemedText>
                <ThemedText style={styles.accordionTitle}>{section.title}</ThemedText>
              </View>
              <ThemedText style={accordionChevronStyle}>
                {expandedSection === section.id ? '▲' : '▼'}
              </ThemedText>
            </Pressable>
            {expandedSection === section.id && section.content()}
          </View>
        ))}
      </View>
      <AlertComponent />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topSafeArea: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
    padding: Spacing.one,
  },
  backIcon: {
    fontSize: 40,
    lineHeight: 40,
  },
  headerCopy: {
    alignItems: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 16,
  },
  title: {
    lineHeight: 36,
    fontWeight: '600',
  },
  accordionContainer: {
    // Add some top margin to separate from header
    marginTop: Spacing.one,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionIcon: {
    fontSize: 24,
    marginRight: Spacing.two,
  },
  accordionTitle: {
    fontWeight: '600',
    fontSize: 16,
    flexShrink: 1,
  },
  accordionContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.one,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  settingsRowInfo: {
    flex: 1,
    gap: Spacing.one,
  },
  settingsRowTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  statusText: {
    marginTop: Spacing.one,
  },
  outlineButton: {
    alignItems: 'center',
    borderRadius: Spacing.two,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  outlineButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  infoValue: {
    lineHeight: 20,
    fontWeight: '600',
  },
  destructiveButton: {
    alignItems: 'center',
    backgroundColor: '#B42318',
    borderRadius: Spacing.two,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  destructiveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.7,
  },
});