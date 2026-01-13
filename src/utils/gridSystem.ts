// Sistema de grid quadrado para territórios
// Cada célula é um quadrado de aproximadamente CELL_SIZE metros

// Tamanho da célula em graus (aproximadamente 100m)
// 1 grau de latitude ≈ 111km, então 0.001 ≈ 111m
const CELL_SIZE_LAT = 0.0009; // ~100m
const CELL_SIZE_LNG = 0.0011; // ~100m (ajustado para longitude)

export interface GridCell {
  id: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Converte coordenadas para ID da célula do grid
export function coordToGridCell(lat: number, lng: number): string {
  // Arredonda para a célula mais próxima
  const cellLat = Math.floor(lat / CELL_SIZE_LAT);
  const cellLng = Math.floor(lng / CELL_SIZE_LNG);
  return `${cellLat}_${cellLng}`;
}

// Obtém os limites (bounds) de uma célula pelo ID
export function getCellBounds(cellId: string): GridCell['bounds'] {
  const [latIdx, lngIdx] = cellId.split('_').map(Number);

  return {
    south: latIdx * CELL_SIZE_LAT,
    north: (latIdx + 1) * CELL_SIZE_LAT,
    west: lngIdx * CELL_SIZE_LNG,
    east: (lngIdx + 1) * CELL_SIZE_LNG,
  };
}

// Converte célula para polígono GeoJSON (para desenhar no mapa)
export function gridCellToPolygon(cellId: string): [number, number][] {
  const bounds = getCellBounds(cellId);

  // Formato GeoJSON: [lng, lat] - sentido anti-horário
  return [
    [bounds.west, bounds.south],
    [bounds.east, bounds.south],
    [bounds.east, bounds.north],
    [bounds.west, bounds.north],
    [bounds.west, bounds.south], // Fecha o polígono
  ];
}

// Obtém o centro de uma célula
export function getCellCenter(cellId: string): [number, number] {
  const bounds = getCellBounds(cellId);
  const lat = (bounds.north + bounds.south) / 2;
  const lng = (bounds.east + bounds.west) / 2;
  return [lng, lat]; // [lng, lat] para Mapbox
}

// Converte array de pontos GPS para células únicas
export function pointsToGridCells(points: { latitude: number; longitude: number }[]): string[] {
  const cells = new Set<string>();

  for (const point of points) {
    cells.add(coordToGridCell(point.latitude, point.longitude));
  }

  return [...cells];
}

// Obtém células vizinhas (para expandir território)
export function getNeighborCells(cellId: string, rings: number = 1): string[] {
  const [latIdx, lngIdx] = cellId.split('_').map(Number);
  const cells: string[] = [];

  for (let dLat = -rings; dLat <= rings; dLat++) {
    for (let dLng = -rings; dLng <= rings; dLng++) {
      cells.push(`${latIdx + dLat}_${lngIdx + dLng}`);
    }
  }

  return cells;
}
