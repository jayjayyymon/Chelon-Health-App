import { StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useState, useRef, useEffect } from 'react';

import ChelonHeader from '@/components/chelon-header';
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

  // Map state
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

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

  // Generate HTML for Leaflet map with OpenStreetMap tiles
  const getMapHtml = (): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
          <title>Leaflet Map</title>
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <style>
            #map { height: 100%; width: 100%; margin: 0; padding: 0; }
            body { margin: 0; padding: 0; }
            .leaflet-control-attribution { font-size: 0.8rem; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            // Wait for Leaflet to load
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onerror = () => {
              window.postMessage('mapError:Failed to load Leaflet.js');
            };
            script.onload = () => {
              // Initialize map
              const map = L.map('map').setView([0, 0], 2);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              }).addTo(map);

              // Add a marker (initially at [0,0] but will be updated)
              const marker = L.marker([0, 0]).addTo(map);

              // Expose update function
              window.updateMap = (lat, lng) => {
                map.setView([lat, lng], 13);
                marker.setLatLng([lat, lng]);
              };

              // Notify React Native that map is ready
              window.postMessage('mapReady');
            };
            document.head.appendChild(script);
          </script>
        </body>
      </html>
    `;
  };

  // Handle messages from the WebView
  const handleMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === 'mapReady') {
      setMapReady(true);
      setMapLoading(false);
      setMapError(null);
    } else if (message.startsWith('mapError:')) {
      setMapLoading(false);
      setMapError(message.split(':')[1] || 'Failed to load map resources.');
    }
  };

  // Timeout for map loading
  useEffect(() => {
    let timeoutId: number;
    if (mapLoading) {
      timeoutId = window.setTimeout(() => {
        setMapLoading(false);
        setMapError('Map took too long to load. Please check your connection and try again.');
      }, 15000); // 15 seconds
    }
    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [mapLoading]);

  // Update map when coordinates change and map is ready
  useEffect(() => {
    if (latitude !== null && longitude !== null && mapReady && webViewRef.current) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      webViewRef.current.injectJavaScript(`updateMap(${lat}, ${lng})`);
    }
  }, [latitude, longitude, mapReady]);

  return (
    <ScreenContainer inTabs>
      <ChelonHeader />
      {!latitude && !longitude && !error ? (
        <SectionCard title="No location selected">
          <ThemedText>
            Tap &quot;Get current location&quot; below or enter coordinates manually to find nearby health centers.
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
        <>
          <SectionCard title="Selected Coordinates">
            <ThemedText>
              Using coordinates: {latitude}, {longitude} to find nearby health centers.
            </ThemedText>
          </SectionCard>

          <SectionCard title="Map">
            {mapLoading ? (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <ThemedText style={styles.mapLoadingText}>Loading map...</ThemedText>
              </View>
            ) : mapError ? (
              <View>
                <ThemedText type="small" themeColor="textSecondary">
                  {mapError}
                </ThemedText>
                <PlaceholderButton label="Retry map load" onPress={() => {
                  setMapLoading(true);
                  setMapError(null);
                  setMapReady(false);
                }} />
              </View>
            ) : (
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                source={{ html: getMapHtml() }}
                onMessage={handleMessage}
                onError={({ nativeEvent }) => {
                  setMapLoading(false);
                  setMapError('Failed to load map. Please check your connection and try again.');
                }}
                onLoadStart={() => {
                  setMapLoading(true);
                  setMapError(null);
                  setMapReady(false);
                }}
                onLoadEnd={() => {
                  // Map load success handled via message
                }}
                style={styles.map}
              />
            )}
          </SectionCard>
        </>
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
  mapLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: 40,
  },
  mapLoadingText: {
    fontSize: 16,
  },
  map: {
    height: 300,
    width: '100%',
    marginVertical: 12,
  },
});