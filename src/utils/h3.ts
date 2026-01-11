import * as h3 from 'h3-js';
import { GpsPoint } from '../types';
import { H3_CONFIG } from '../constants';

// Converte ponto GPS para ID da célula H3
export function pointToCell(point: GpsPoint): string {
  return h3.latLngToCell(point.latitude, point.longitude, H3_CONFIG.RESOLUTION);
}

// Converte array de pontos GPS para set de células únicas
export function pointsToCells(points: GpsPoint[]): string[] {
  const cells = new Set<string>();

  for (const point of points) {
    cells.add(pointToCell(point));
  }

  return [...cells];
}

// Converte célula H3 para coordenadas do polígono (para desenhar no mapa)
export function cellToPolygon(cellId: string): [number, number][] {
  // h3.cellToBoundary retorna [[lat, lng], ...]
  // Mapbox precisa de [[lng, lat], ...]
  const boundary = h3.cellToBoundary(cellId, true); // true = formato GeoJSON [lng, lat]
  return boundary as [number, number][];
}

// Converte células para GeoJSON FeatureCollection (para Mapbox)
export function cellsToGeoJSON(
  cells: { id: string; ownerId: string | null }[]
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell) => {
      const boundary = cellToPolygon(cell.id);

      return {
        type: 'Feature' as const,
        properties: {
          cellId: cell.id,
          ownerId: cell.ownerId,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [boundary],
        },
      };
    }),
  };
}

// Pega centro da célula
export function cellCenter(cellId: string): [number, number] {
  const [lat, lng] = h3.cellToLatLng(cellId);
  return [lng, lat]; // Mapbox usa [lng, lat]
}

// Pega células vizinhas
export function getNeighbors(cellId: string, rings: number = 1): string[] {
  return h3.gridDisk(cellId, rings);
}
