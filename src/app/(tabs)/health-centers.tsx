import { Link } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useState } from 'react';

import { InfoRow } from '@/components/info-row';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { SectionCard } from '@/components/section-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function HealthCentersScreen() {
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat.toFixed(4));
      setLongitude(lng.toFixed(4));
    } catch (err: any) {
      setError(
        err.message ||
          'Unable to get location. Please ensure location services are enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  const useManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Please enter a valid latitude between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Please enter a valid longitude between -180 and 180.');
      return;
    }

    setLatitude(lat.toFixed(4));
    setLongitude(lng.toFixed(4));
    setError(null);
  };

  return (
    <ScreenContainer inTabs title="Health Centers" subtitle="Nearby clinics based on your location">
      {!latitude && !longitude && !error ? (
        <SectionCard title="No location selected">
          <ThemedText>
            Tap "Get current location" below or enter coordinates manually to find nearby health centers.
          </ThemedText>
        </SectionCard>
      ) : null}

      <SectionCard title="Current Location">
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <ThemedText style={styles.loadingText}>Getting your location...</ThemedText>
          </View>
        ) : error ? (
          <View>
            <ThemedText type="small" themeColor="textSecondary">
              {error}
            </ThemedText>
            <PlaceholderButton label="Retry location detection" onPress={getCurrentLocation} />
          </View>
        ) : (
          <View>
            <InfoRow label="Latitude" value={latitude ?? 'not available'} />
            <InfoRow label="Longitude" value={longitude ?? 'not available'} />
            <PlaceholderButton label="Retry location detection" onPress={getCurrentLocation} />
          </View>
        )}
      </SectionCard>

      <SectionCard title="Manual Entry (Fallback)">
        <ThemedView type="backgroundElement" style={styles.inputContainer}>
          <ThemedText type="smallBold">Enter coordinates manually</ThemedText>
          <TextInput
            placeholder="Latitude (-90 to 90)"
            value={manualLat}
            onChangeText={setManualLat}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Longitude (-180 to 180)"
            value={manualLng}
            onChangeText={setManualLng}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <PlaceholderButton label="Use manual coordinates" onPress={useManualCoordinates} />
        </ThemedView>
      </SectionCard>

      {latitude && longitude && !error ? (
        <SectionCard title="Selected Coordinates">
          <ThemedText>
            Using coordinates: {latitude}, {longitude} to find nearby health centers.
          </ThemedText>
          <PlaceholderButton label="Find health centers (placeholder)" />
        </SectionCard>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  loadingText: {
    fontSize: 16,
  },
  inputContainer: {
    gap: 12,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
  },
});