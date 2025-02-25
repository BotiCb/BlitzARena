import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import useCoordinates from '~/hooks/useCoordinates';

export const MapComponent = () => {
  const { location } = useCoordinates({ accuracy: 5, timeInterval: 1000, distanceInterval: 1 });

  useEffect(() => {
    console.log(location);
  }, [location]);

  return (
    <View style={[styles.container, { borderWidth: 2, borderColor: 'red' }]}>
      {location && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.0005,
          }}
          scrollEnabled
          zoomEnabled
          cameraZoomRange={{
            minCenterCoordinateDistance: 0.1,
            maxCenterCoordinateDistance: 0.01,
          }}>
          {/* Marker to show the location */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description="Current location from useCoordinates"
          />
        </MapView>
      )}
      {!PROVIDER_GOOGLE && <Text>Google Maps not available</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    height: 'auto',
  },
  map: {
    height: 500,
  },
});
