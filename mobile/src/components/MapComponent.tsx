import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { LatLng, Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

import useCoordinates from '~/hooks/useCoordinates';
import { GameArea } from '~/utils/types/types';

const AREA_SIZE_KM = 0.2;
const DEGREES_PER_KM = 0.009;
const INITIAL_DELTA = AREA_SIZE_KM * DEGREES_PER_KM;

export interface MapComponentProps {
  gameArea: GameArea | null;
  readonly: boolean;
  onGameAreaChange: (gameArea: GameArea) => void;
}

export const MapComponent = ({ gameArea, readonly, onGameAreaChange }: MapComponentProps) => {
  const { location: userLocation } = useCoordinates({
    accuracy: 5,
    timeInterval: 0, 
    distanceInterval: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handlePoligonDragEnd = (index: number, newCoord: LatLng) => {
    if (!gameArea) {
      return;
    }
    const newCorners = [...gameArea.edges];
    newCorners[index] = newCoord;
    gameArea.edges = newCorners;
    console.log(gameArea);

    onGameAreaChange(gameArea);
    setIsDragging(false);
  };

  const handleTeamBaseDragEnd = (index: number, newCoord: LatLng) => {
    if (!gameArea) {
      return;
    }
    const newBaseCoordinates = [...gameArea.teamBases];
    newBaseCoordinates[index].coordinates = newCoord;
    gameArea.teamBases = newBaseCoordinates;

    console.log(gameArea);

    onGameAreaChange(gameArea);
    setIsDragging(false);
  };

  return (
    <View style={[styles.container, { borderWidth: 2, borderColor: 'red' }]}>
      {gameArea && userLocation && gameArea.edges.length === 4 && (
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
          {!readonly &&
            gameArea.edges.map((corner, index) => (
              <Marker
                key={`corner-${index}-${corner.latitude}-${corner.longitude}`}
                coordinate={corner}
                draggable
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e) => handlePoligonDragEnd(index, e.nativeEvent.coordinate)}
                title={`Corner ${index + 1}`}
                pinColor="rgba(0,255,0,0.3)"
                tracksViewChanges={false}
                zIndex={2}
              />
            ))}

          <Polygon
            key={`polygon-${gameArea.edges[0].latitude}-${gameArea.edges[0].longitude}`}
            coordinates={gameArea.edges}
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
            pinColor="yellow"
            zIndex={2}
          />

          {gameArea.teamBases.map((teamBase, index) => (
            <Marker
              draggable={!readonly}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e) => handleTeamBaseDragEnd(index, e.nativeEvent.coordinate)}
              key={`team-base-${index}-${teamBase.coordinates.latitude}-${teamBase.coordinates.longitude}`}
              coordinate={teamBase.coordinates}
              title={teamBase.team}
              pinColor={teamBase.team}
              zIndex={3}
              tracksViewChanges={false}
            />
          ))}
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
