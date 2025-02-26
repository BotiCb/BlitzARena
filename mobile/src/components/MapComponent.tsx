import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { LatLng, Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

import useCoordinates from '~/hooks/useCoordinates';
import { TEAM } from '~/utils/types';
import { isAreaValid } from '~/utils/utils';

// Configuration
const AREA_SIZE_KM = 0.2;
const DEGREES_PER_KM = 0.009;
const INITIAL_DELTA = AREA_SIZE_KM * DEGREES_PER_KM;

export interface MapComponentProps {
  teamBases?: { coord: LatLng; team: TEAM }[];
  gameArea: LatLng[];
  readonly?: boolean;
}

export const MapComponent = ({ teamBases, gameArea, readonly }: MapComponentProps) => {
  const { location: userLocation } = useCoordinates({
    accuracy: 5,
    timeInterval: 1000,
    distanceInterval: 1,
  });
  const [teamBaseCoordinates, setTeamBaseCoordinates] = useState<{ coord: LatLng; team: TEAM }[]>(
    []
  ); // Team base coordinates
  const [isDragging, setIsDragging] = useState(false);
  const lastValidCorners = useRef<LatLng[]>([]);
  const [version, setVersion] = useState(0); // Version counter for marker keys

  // useEffect(() => {
  //   if (userLocation) {
  //     const center = {
  //       lat: userLocation.coords.latitude,
  //       lng: userLocation.coords.longitude,
  //     };

  //     const halfDelta = INITIAL_DELTA / 2;

  //     const initialCorners = [
  //       { latitude: center.lat + halfDelta, longitude: center.lng + halfDelta },
  //       { latitude: center.lat + halfDelta, longitude: center.lng - halfDelta },
  //       { latitude: center.lat - halfDelta, longitude: center.lng - halfDelta },
  //       { latitude: center.lat - halfDelta, longitude: center.lng + halfDelta },
  //     ];
  //     const initialTeamBaseCoordinates = [
  //       { coord: { latitude: center.lat, longitude: center.lng }, team: TEAM.BLUE },
  //       { coord: { latitude: center.lat, longitude: center.lng }, team: TEAM.BLUE },
  //     ];
  //     setTeamBaseCoordinates(initialTeamBaseCoordinates);
  //     console.log(teamBaseCoordinates);
  //     lastValidCorners.current = initialCorners;
  //     setVersion((v) => v + 1); // Initialize version
  //   }
  // }, [userLocation]);

  const handleDragEnd = (index: number, newCoord: LatLng) => {
    const newCorners = [...gameArea];
    newCorners[index] = newCoord;

    if (
      userLocation &&
      isAreaValid(
        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
        newCorners
      )
    ) {
      console.log(newCorners);
      lastValidCorners.current = newCorners;
    } else {
      setVersion((v) => v + 1);
    }

    setIsDragging(false);
  };

  return (
    <View style={[styles.container, { borderWidth: 2, borderColor: 'red' }]}>
      {userLocation && gameArea.length === 4 && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          initialRegion={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: INITIAL_DELTA,
            longitudeDelta: INITIAL_DELTA,
          }}
          scrollEnabled={!isDragging}
          zoomEnabled={!isDragging}
          minZoomLevel={17}
          maxZoomLevel={20}>
          {gameArea.map((corner, index) => (
            <Marker
              key={`corner-${index}-${version}-${corner.latitude}-${corner.longitude}`}
              coordinate={corner}
              draggable
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e) => handleDragEnd(index, e.nativeEvent.coordinate)}
              title={`Corner ${index + 1}`}
              pinColor="rgba(0,255,0,0.3)"
              tracksViewChanges={false}
              zIndex={2}
            />
          ))}

          <Polygon
            key={`polygon-${version}`}
            coordinates={gameArea}
            strokeColor="#00FF00"
            fillColor="rgba(0,255,0,0.3)"
            strokeWidth={2}
            zIndex={1}
          />

          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            pinColor="#0000FF"
            zIndex={2}
          />

          {/* <Marker
            coordinate={teamBaseCoordinates[0].coord}
            title={teamBaseCoordinates[0].team}
            pinColor={TEAM.BLUE}
            zIndex={2}
          /> */}
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
