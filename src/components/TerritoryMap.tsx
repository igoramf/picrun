import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox, { Camera, MapView, ShapeSource, FillLayer, LineLayer, LocationPuck } from '@rnmapbox/maps';
import { COLORS, MAPBOX_CONFIG } from '../constants';
import { cellsToGeoJSON } from '../utils/h3';

// Configura token do Mapbox (substitua pelo seu)
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'SEU_TOKEN_AQUI');

interface TerritoryMapProps {
  userCells?: { id: string; ownerId: string | null }[];
  otherCells?: { id: string; ownerId: string | null }[];
  routeCoordinates?: [number, number][];
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  followUser?: boolean;
  showUserLocation?: boolean;
}

export function TerritoryMap({
  userCells = [],
  otherCells = [],
  routeCoordinates = [],
  centerCoordinate,
  zoomLevel = MAPBOX_CONFIG.defaultZoom,
  followUser = false,
  showUserLocation = true,
}: TerritoryMapProps) {
  const cameraRef = useRef<Camera>(null);

  // GeoJSON para células do usuário
  const userCellsGeoJSON = cellsToGeoJSON(userCells);

  // GeoJSON para células de outros
  const otherCellsGeoJSON = cellsToGeoJSON(otherCells);

  // GeoJSON para rota atual
  const routeGeoJSON: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={MAPBOX_CONFIG.styleUrl}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          followUserLocation={followUser}
          followZoomLevel={MAPBOX_CONFIG.runningZoom}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Células de outros jogadores (vermelho) */}
        {otherCells.length > 0 && (
          <ShapeSource id="otherCells" shape={otherCellsGeoJSON}>
            <FillLayer
              id="otherCellsFill"
              style={{
                fillColor: COLORS.danger,
                fillOpacity: 0.35,
              }}
            />
            <LineLayer
              id="otherCellsLine"
              style={{
                lineColor: COLORS.dangerLight,
                lineWidth: 1.5,
                lineOpacity: 0.7,
              }}
            />
          </ShapeSource>
        )}

        {/* Células do usuário (verde) */}
        {userCells.length > 0 && (
          <ShapeSource id="userCells" shape={userCellsGeoJSON}>
            <FillLayer
              id="userCellsFill"
              style={{
                fillColor: COLORS.primary,
                fillOpacity: 0.45,
              }}
            />
            <LineLayer
              id="userCellsLine"
              style={{
                lineColor: COLORS.primaryLight,
                lineWidth: 2,
                lineOpacity: 0.9,
              }}
            />
          </ShapeSource>
        )}

        {/* Rota atual */}
        {routeCoordinates.length > 1 && (
          <ShapeSource id="route" shape={routeGeoJSON}>
            <LineLayer
              id="routeLine"
              style={{
                lineColor: COLORS.secondary,
                lineWidth: 4,
                lineOpacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* Localização do usuário */}
        {showUserLocation && (
          <LocationPuck
            puckBearing="heading"
            puckBearingEnabled={true}
            pulsing={{
              isEnabled: true,
              color: COLORS.primary,
              radius: 50,
            }}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
