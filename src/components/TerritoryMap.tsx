import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox, { Camera, MapView, ShapeSource, FillLayer, LineLayer, LocationPuck, CircleLayer } from '@rnmapbox/maps';
import { COLORS, MAPBOX_CONFIG, GPS_CONFIG } from '../constants';
import { cellsToGeoJSON } from '../utils/h3';

// Configura token do Mapbox
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'SEU_TOKEN_AQUI');

interface TerritoryMapProps {
  // Células conquistadas pelo usuário nesta corrida
  userCells?: string[];
  // Células de outros jogadores (para mostrar no mapa)
  otherCells?: { id: string; ownerId: string; color: string }[];
  // Rota atual sendo percorrida
  routeCoordinates?: [number, number][];
  // Configurações do mapa
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  followUser?: boolean;
  showUserLocation?: boolean;
  simulatedPosition?: [number, number];
}

export function TerritoryMap({
  userCells = [],
  otherCells = [],
  routeCoordinates = [],
  centerCoordinate,
  zoomLevel = MAPBOX_CONFIG.defaultZoom,
  followUser = false,
  showUserLocation = true,
  simulatedPosition,
}: TerritoryMapProps) {
  const cameraRef = useRef<Camera>(null);

  // Move câmera para posição simulada quando ela muda
  useEffect(() => {
    if (simulatedPosition && followUser && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: simulatedPosition,
        zoomLevel: MAPBOX_CONFIG.runningZoom,
        animationDuration: 500,
      });
    }
  }, [simulatedPosition, followUser]);

  // GeoJSON para células do usuário
  const userCellsGeoJSON = cellsToGeoJSON(
    userCells.map((id) => ({ id, ownerId: 'user' }))
  );

  // GeoJSON para células de outros jogadores
  const otherCellsGeoJSON = cellsToGeoJSON(
    otherCells.map((cell) => ({ id: cell.id, ownerId: cell.ownerId }))
  );

  // GeoJSON para rota atual
  const routeGeoJSON: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
  };

  // GeoJSON para marcador de posição simulada
  const simulatedPositionGeoJSON: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: simulatedPosition || [0, 0],
    },
  };

  // Usa simulação se tiver posição simulada
  const isSimulating = GPS_CONFIG.SIMULATE_GPS && simulatedPosition;

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
          centerCoordinate={isSimulating ? simulatedPosition : centerCoordinate}
          followUserLocation={!isSimulating && followUser}
          followZoomLevel={MAPBOX_CONFIG.runningZoom}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* Células de outros jogadores */}
        {otherCells.length > 0 && (
          <ShapeSource id="otherCells" shape={otherCellsGeoJSON}>
            <FillLayer
              id="otherCellsFill"
              style={{
                fillColor: COLORS.danger,
                fillOpacity: 0.4,
              }}
            />
            <LineLayer
              id="otherCellsLine"
              style={{
                lineColor: COLORS.danger,
                lineWidth: 1,
                lineOpacity: 0.6,
              }}
            />
          </ShapeSource>
        )}

        {/* Células conquistadas pelo usuário */}
        {userCells.length > 0 && (
          <ShapeSource id="userCells" shape={userCellsGeoJSON}>
            <FillLayer
              id="userCellsFill"
              style={{
                fillColor: COLORS.primary,
                fillOpacity: 0.5,
              }}
            />
            <LineLayer
              id="userCellsLine"
              style={{
                lineColor: COLORS.primary,
                lineWidth: 2,
                lineOpacity: 0.8,
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
                lineColor: COLORS.text,
                lineWidth: 4,
                lineOpacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* Localização do usuário - real */}
        {showUserLocation && !isSimulating && (
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

        {/* Marcador de posição simulada */}
        {isSimulating && simulatedPosition && (
          <ShapeSource id="simulatedPosition" shape={simulatedPositionGeoJSON}>
            <CircleLayer
              id="simulatedPositionCircle"
              style={{
                circleRadius: 12,
                circleColor: COLORS.primary,
                circleStrokeColor: '#ffffff',
                circleStrokeWidth: 3,
                circleOpacity: 1,
              }}
            />
            <CircleLayer
              id="simulatedPositionPulse"
              style={{
                circleRadius: 24,
                circleColor: COLORS.primary,
                circleOpacity: 0.3,
              }}
            />
          </ShapeSource>
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
