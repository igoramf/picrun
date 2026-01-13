// Sistema de territórios baseado em rotas fechadas
// Quando uma pessoa corre e fecha um circuito, a área interna vira território

import { Territory } from '../types';

// Calcula a distância entre dois pontos em metros (fórmula de Haversine)
export function distanceBetweenPoints(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Verifica se a rota fecha um circuito (ponto final próximo do inicial ou de algum ponto anterior)
export function findClosedLoop(
  route: [number, number][], // [lng, lat][]
  minDistance: number = 50, // Distância mínima para considerar "fechado" (metros)
  minPoints: number = 20 // Mínimo de pontos para formar um território válido
): [number, number][] | null {
  if (route.length < minPoints) return null;

  const lastPoint = route[route.length - 1];
  const [lastLng, lastLat] = lastPoint;

  // Procura um ponto anterior que esteja próximo do ponto atual
  // (começando do início para pegar o maior loop possível)
  for (let i = 0; i < route.length - minPoints; i++) {
    const [lng, lat] = route[i];
    const distance = distanceBetweenPoints(lastLat, lastLng, lat, lng);

    if (distance < minDistance) {
      // Encontrou um loop! Retorna o polígono fechado
      const loop = route.slice(i);
      // Fecha o polígono adicionando o primeiro ponto no final
      return [...loop, loop[0]];
    }
  }

  return null;
}

// Calcula a área de um polígono usando a fórmula de Shoelace
export function calculatePolygonArea(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    area += lng1 * lat2 - lng2 * lat1;
  }

  area = Math.abs(area) / 2;

  // Converte de graus² para metros² (aproximação)
  // 1 grau de latitude ≈ 111km, 1 grau de longitude ≈ 111km * cos(lat)
  const avgLat = coordinates.reduce((sum, [, lat]) => sum + lat, 0) / coordinates.length;
  const latMeters = 111000;
  const lngMeters = 111000 * Math.cos(avgLat * Math.PI / 180);

  return area * latMeters * lngMeters;
}

// Simplifica uma rota removendo pontos muito próximos (para performance)
export function simplifyRoute(
  route: [number, number][],
  tolerance: number = 0.00005 // ~5 metros
): [number, number][] {
  if (route.length < 3) return route;

  const simplified: [number, number][] = [route[0]];

  for (let i = 1; i < route.length - 1; i++) {
    const [prevLng, prevLat] = simplified[simplified.length - 1];
    const [lng, lat] = route[i];

    const dist = Math.sqrt(
      Math.pow(lng - prevLng, 2) + Math.pow(lat - prevLat, 2)
    );

    if (dist > tolerance) {
      simplified.push(route[i]);
    }
  }

  simplified.push(route[route.length - 1]);
  return simplified;
}

// Converte território para GeoJSON Feature
export function territoryToGeoJSON(territory: Territory): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: {
      id: territory.id,
      ownerId: territory.ownerId,
      color: territory.color,
      area: territory.area,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [territory.coordinates],
    },
  };
}

// Converte múltiplos territórios para GeoJSON FeatureCollection
export function territoriesToGeoJSON(territories: Territory[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: territories.map(territoryToGeoJSON),
  };
}

// Gera um ID único para território
export function generateTerritoryId(): string {
  return `territory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cria um território a partir de uma rota fechada
export function createTerritoryFromRoute(
  route: [number, number][],
  ownerId: string,
  color: string
): Territory | null {
  const closedLoop = findClosedLoop(route);

  if (!closedLoop) return null;

  const simplified = simplifyRoute(closedLoop);
  const area = calculatePolygonArea(simplified);

  // Área mínima de 1000m² (~31m x 31m) para evitar territórios muito pequenos
  if (area < 1000) return null;

  return {
    id: generateTerritoryId(),
    ownerId,
    color,
    coordinates: simplified,
    area,
    createdAt: Date.now(),
  };
}

// Calcula o progresso para fechar um loop (0-100%)
// Retorna também a distância até o ponto mais próximo do início
export function calculateLoopProgress(
  route: [number, number][],
  maxDistance: number = 200 // Distância máxima para começar a mostrar progresso
): { progress: number; distanceToClose: number; closestPointIndex: number } {
  if (route.length < 10) {
    return { progress: 0, distanceToClose: Infinity, closestPointIndex: -1 };
  }

  const lastPoint = route[route.length - 1];
  const [lastLng, lastLat] = lastPoint;

  let minDistance = Infinity;
  let closestPointIndex = -1;

  // Procura o ponto mais próximo do início da rota
  // (ignora os últimos 20 pontos para evitar false positives)
  const searchLimit = Math.max(0, route.length - 20);

  for (let i = 0; i < searchLimit; i++) {
    const [lng, lat] = route[i];
    const distance = distanceBetweenPoints(lastLat, lastLng, lat, lng);

    if (distance < minDistance) {
      minDistance = distance;
      closestPointIndex = i;
    }
  }

  // Calcula progresso (100% quando distância = 0, 0% quando distância >= maxDistance)
  const progress = Math.max(0, Math.min(100, ((maxDistance - minDistance) / maxDistance) * 100));

  return {
    progress,
    distanceToClose: minDistance,
    closestPointIndex,
  };
}

// Gera preview do território que seria formado se fechar agora
export function getTerritorPreview(
  route: [number, number][],
  closestPointIndex: number
): [number, number][] | null {
  if (closestPointIndex < 0 || route.length < 20) return null;

  // Pega a porção da rota que formaria o território
  const loop = route.slice(closestPointIndex);

  if (loop.length < 10) return null;

  // Fecha o loop
  return [...loop, loop[0]];
}
