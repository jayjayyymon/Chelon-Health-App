import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';

import ChelonHeader from '@/components/chelon-header';
import { PlaceholderButton } from '@/components/placeholder-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { healthCenters } from '@/data/mock-data';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, NavigationColors } from '@/constants/theme';

const DEFAULT_CENTER = healthCenters[0];

function getMapHtml(backgroundColor: string, textColor: string): string {
  const facilities = JSON.stringify(healthCenters);
  const safeBackgroundColor = JSON.stringify(backgroundColor);
  const safeTextColor = JSON.stringify(textColor);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
        <title>Healthcare facilities map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
          body { background: ${safeBackgroundColor}; }
          .leaflet-control-attribution { font-size: 0.7rem; }
          .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: ${safeBackgroundColor}; color: ${safeTextColor}; }
          .facility-popup { color: ${safeTextColor}; line-height: 1.4; }
          .facility-popup strong { font-size: 1rem; }
          .facility-popup small { display: block; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const facilities = ${facilities};
          const script = document.createElement('script');
          const sendMessage = (message) => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(message);
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onerror = () => sendMessage('mapError:Unable to load map resources.');
          script.onload = () => {
            const map = L.map('map', { zoomControl: true });
            const markerById = {};
            const sampleIcon = L.divIcon({
              className: 'facility-marker',
              html: '<div style="width:18px;height:18px;border-radius:50%;background:#4ca771;border:3px solid #ffffff;box-shadow:0 1px 5px #0008"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: '<div style="width:18px;height:18px;border-radius:50%;background:#3478f6;border:3px solid #ffffff;box-shadow:0 1px 5px #0008"></div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
            tileLayer.on('tileerror', () => sendMessage('mapError:Map tiles could not be loaded.'));

            facilities.forEach((facility) => {
              const marker = L.marker([facility.latitude, facility.longitude], { icon: sampleIcon }).addTo(map);
              marker.bindPopup(
                '<div class="facility-popup"><strong>' + facility.name + '</strong>' +
                '<small>' + facility.type + '</small><small>' + facility.address + '</small></div>'
              );
              marker.on('click', () => sendMessage('facilitySelected:' + facility.id));
              markerById[facility.id] = marker;
            });

            const facilityBounds = L.latLngBounds(facilities.map((facility) => [facility.latitude, facility.longitude]));
            map.fitBounds(facilityBounds, { padding: [24, 24], maxZoom: 14 });
            let userMarker = null;

            window.updateUserLocation = (lat, lng) => {
              if (!userMarker) {
                userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
                userMarker.bindPopup('Your selected location');
              } else {
                userMarker.setLatLng([lat, lng]);
              }
              map.setView([lat, lng], 13);
            };

            window.selectFacility = (id) => {
              const marker = markerById[id];
              if (!marker) return;
              map.setView(marker.getLatLng(), 15);
              marker.openPopup();
            };

            sendMessage('mapReady');
          };
          document.head.appendChild(script);
        </script>
      </body>
    </html>
  `;
}

export default function HealthCentersScreen() {
  const theme = useTheme();
  const mapHtml = useMemo(() => getMapHtml(theme.background, theme.text), [theme.background, theme.text]);
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState(DEFAULT_CENTER.id);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const selectedCenter = healthCenters.find((center) => center.id === selectedCenterId) ?? DEFAULT_CENTER;
  const displayAddress = React.useMemo(() => {
    return selectedCenter.address.replace(' (sample address)', '');
  }, [selectedCenter.address]);

  const getCurrentLocation = async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission was denied. You can still browse the facilities below.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat.toFixed(4));
      setLongitude(lng.toFixed(4));
    } catch (err: unknown) {
      setLocationError(
        err instanceof Error
          ? err.message
          : 'Unable to get location. Please ensure location services are enabled.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = event.nativeEvent.data;
    if (message === 'mapReady') {
      setMapReady(true);
      setMapLoading(false);
      setMapError(null);
    } else if (message.startsWith('facilitySelected:')) {
      setSelectedCenterId(message.replace('facilitySelected:', ''));
    } else if (message.startsWith('mapError:')) {
      setMapLoading(false);
      setMapError(message.replace('mapError:', '') || 'Failed to load map resources.');
    }
  };

  useEffect(() => {
    if (!mapLoading) return;

    const timeoutId = window.setTimeout(() => {
      setMapLoading(false);
      setMapError('Map took too long to load. Please check your connection and try again.');
    }, 15000);

    return () => window.clearTimeout(timeoutId);
  }, [mapLoading, mapRetryKey]);

  useEffect(() => {
    if (latitude === null || longitude === null || !mapReady || !webViewRef.current) return;

    webViewRef.current.injectJavaScript(
      `window.updateUserLocation(${parseFloat(latitude)}, ${parseFloat(longitude)}); true;`
    );
  }, [latitude, longitude, mapReady]);

  useEffect(() => {
    if (!mapReady || !webViewRef.current) return;

    webViewRef.current.injectJavaScript(
      `window.selectFacility(${JSON.stringify(selectedCenterId)}); true;`
    );
  }, [selectedCenterId, mapReady]);

  const retryMap = () => {
    setMapError(null);
    setMapLoading(true);
    setMapReady(false);
    setMapRetryKey((key) => key + 1);
  };

  return (
    <ScreenContainer inTabs>
      <ChelonHeader />


      <View style={{ flex: 1 }}>
        {locationError ? (
          <View style={[styles.locationErrorBanner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" themeColor="textSecondary">
              {locationError}
            </ThemedText>
          </View>
        ) : null}
        {mapError ? (
          <View style={styles.mapErrorContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              {mapError}
            </ThemedText>
            <PlaceholderButton label="Retry map load" onPress={retryMap} />
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <WebView
              key={mapRetryKey}
              ref={webViewRef}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              source={{ html: mapHtml }}
              onMessage={handleMessage}
              onError={() => {
                setMapLoading(false);
                setMapError('Failed to load the map. Please check your connection and try again.');
              }}
              onLoadStart={() => {
                setMapLoading(true);
                setMapReady(false);
              }}
              style={styles.map}
            />
            {mapLoading ? (
              <View style={[styles.mapLoadingOverlay, { backgroundColor: theme.backgroundElement }]}>
                <ActivityIndicator size="large" color={theme.text} />
                <ThemedText style={styles.mapLoadingText}>Loading map...</ThemedText>
              </View>
            ) : null}
            {/* Floating button for current location */}
            <Pressable
              accessibilityLabel={loading ? 'Getting your location' : 'Use my location'}
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: loading }}
              disabled={loading}
              onPress={getCurrentLocation}
              style={styles.locationButton}>
              <ActivityIndicator size={loading ? 20 : 16} color={loading ? theme.textSecondary : theme.text} style={{ marginRight: 8 }} />
              <ThemedText type="smallBold" style={{ marginLeft: 0 }}>
                {loading ? 'Getting...' : 'My Location'}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      <ThemedText type="small" themeColor="textSecondary" accessibilityRole="text">
        Example locations for demonstration only. Verify provider details before visiting.
      </ThemedText>
      <View style={[styles.selectedFacilityContainer, { backgroundColor: theme.backgroundElement, borderRadius: Spacing.two }]}>
          <View style={styles.facilityNameContainer}>
            <View style={styles.facilityNameIcon}>
              <Text style={{ fontSize: 24, color: NavigationColors.background }}>🏥</Text>
            </View>
            <ThemedText type="smallBold" style={styles.facilityNameText}>
              {selectedCenter.name}
            </ThemedText>
          </View>
          <View style={styles.facilityDetails}>
            {selectedCenter.type?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🏢</Text>
                <ThemedText type="small" style={styles.detailText}>
                  {selectedCenter.type.trim()}
                </ThemedText>
              </View>
            )}
            {displayAddress?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <ThemedText type="small" style={styles.detailText}>
                  {displayAddress.trim()}
                </ThemedText>
              </View>
            )}
            {selectedCenter.distance?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📏</Text>
                <ThemedText type="small" style={styles.detailText}>
                  {selectedCenter.distance.trim()}
                </ThemedText>
              </View>
            )}
            {selectedCenter.hours?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>⏰</Text>
                <ThemedText type="small" style={styles.detailText}>
                  {selectedCenter.hours.trim()}
                </ThemedText>
              </View>
            )}
          </View>
      </View>

      <View accessible accessibilityLabel="Available health centers" style={styles.facilityList}>
        <ThemedText type="smallBold">Available health centers</ThemedText>
        {healthCenters.map(center => (
          <Pressable
            key={center.id}
            accessibilityRole="button"
            accessibilityLabel={`Select ${center.name}`}
            accessibilityState={{ selected: center.id === selectedCenterId }}
            onPress={() => setSelectedCenterId(center.id)}
            style={({ pressed }) => [
              styles.facilityRow,
              { backgroundColor: center.id === selectedCenterId ? theme.backgroundSelected : theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <View style={styles.facilityRowContent}>
              <ThemedText type="smallBold">{center.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{center.type}</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">{center.distance}</ThemedText>
          </Pressable>
        ))}
      </View>
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
  locationError: {
    marginBottom: Spacing.two,
  },
  coordinateRows: {
    marginBottom: Spacing.two,
  },
  inputContainer: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.one,
    padding: Spacing.two,
  },
  mapFrame: {
    height: 300,
    width: '100%',
    overflow: 'hidden',
    borderRadius: Spacing.two,
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  mapLoadingText: {
    fontSize: 16,
  },
  mapErrorContainer: {
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  facilityList: {
    gap: Spacing.one,
  },
  facilityRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  facilityRowContent: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    overflow: 'hidden',
    borderRadius: Spacing.two,
    marginHorizontal: Spacing.two,
    marginTop: Spacing.two,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedFacilityContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginBottom: Spacing.two,
  },
  locationErrorBanner: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    marginHorizontal: Spacing.two,
    marginTop: Spacing.two,
    borderRadius: Spacing.two,
  },
  facilityNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  facilityNameIcon: {
    width: 24,
    height: 24,
    marginRight: Spacing.one,
  },
  facilityNameText: {
    flex: 1,
  },
  facilityDetails: {
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.half,
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: Spacing.one,
  },
  detailText: {
    flex: 1,
  },
  emptyStateText: {
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
});
