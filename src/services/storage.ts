import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunData } from '../types';
import { Territory } from '../utils/territory';

const KEYS = {
  RUNS: '@stride/runs',
  USER_CELLS: '@stride/user_cells',
  USER_STATS: '@stride/user_stats',
};

export interface UserStats {
  totalDistance: number;
  totalCells: number;
  totalRuns: number;
}

// === CORRIDAS ===

export async function saveRun(run: RunData): Promise<void> {
  const runs = await getRuns();
  runs.unshift(run); // Mais recente primeiro
  await AsyncStorage.setItem(KEYS.RUNS, JSON.stringify(runs));

  // Atualiza células do usuário
  await addUserCells(run.cells);

  // Atualiza stats
  await updateUserStats(run);
}

export async function getRuns(): Promise<RunData[]> {
  const data = await AsyncStorage.getItem(KEYS.RUNS);
  return data ? JSON.parse(data) : [];
}

export async function getRecentRuns(limit: number = 10): Promise<RunData[]> {
  const runs = await getRuns();
  return runs.slice(0, limit);
}

// === CÉLULAS DO USUÁRIO ===

export async function getUserCells(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.USER_CELLS);
  return data ? JSON.parse(data) : [];
}

export async function addUserCells(newCells: string[]): Promise<void> {
  const existingCells = await getUserCells();
  const cellSet = new Set([...existingCells, ...newCells]);
  await AsyncStorage.setItem(KEYS.USER_CELLS, JSON.stringify([...cellSet]));
}

// === STATS DO USUÁRIO ===

export async function getUserStats(): Promise<UserStats> {
  const data = await AsyncStorage.getItem(KEYS.USER_STATS);
  if (data) {
    return JSON.parse(data);
  }
  return {
    totalDistance: 0,
    totalCells: 0,
    totalRuns: 0,
  };
}

async function updateUserStats(run: RunData): Promise<void> {
  const stats = await getUserStats();
  const allCells = await getUserCells();

  stats.totalDistance += run.distance;
  stats.totalCells = allCells.length; // Células únicas
  stats.totalRuns += 1;

  await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
}

// === UTILITÁRIOS ===

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.RUNS, KEYS.USER_CELLS, KEYS.USER_STATS]);
}

// === SIMULAÇÃO PARA TESTES ===

export interface SimulatedTerritories {
  userTerritories: Territory[];
  otherTerritories: Territory[];
}

// Cria um polígono fechado (território) a partir de coordenadas relativas
function createPolygonTerritory(
  centerLat: number,
  centerLng: number,
  offsets: { dLat: number; dLng: number }[], // Offsets relativos ao centro
  ownerId: string,
  color: string
): Territory {
  // Cria as coordenadas do polígono [lng, lat]
  const coordinates: [number, number][] = offsets.map(offset => [
    centerLng + offset.dLng,
    centerLat + offset.dLat,
  ]);
  // Fecha o polígono
  coordinates.push(coordinates[0]);

  // Calcula área aproximada
  let area = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    area += coordinates[i][0] * coordinates[i + 1][1];
    area -= coordinates[i + 1][0] * coordinates[i][1];
  }
  area = Math.abs(area) / 2 * 111000 * 111000; // Conversão aproximada para m²

  return {
    id: `territory_${ownerId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    ownerId,
    color,
    coordinates,
    area,
    createdAt: Date.now(),
  };
}

// Gera territórios simulados como polígonos (áreas cercadas por corridas)
export function generateSimulatedTerritories(lat: number, lng: number): SimulatedTerritories {
  const colors = {
    user: '#3b82f6',    // Azul (você)
    rival1: '#eab308',  // Amarelo
    rival2: '#ec4899',  // Rosa
    rival3: '#22c55e',  // Verde
    rival4: '#8b5cf6',  // Roxo
    rival5: '#f97316',  // Laranja
  };

  const userTerritories: Territory[] = [];
  const otherTerritories: Territory[] = [];

  // Território do usuário - retângulo ao redor da posição atual
  userTerritories.push(createPolygonTerritory(lat, lng, [
    { dLat: 0.002, dLng: -0.0015 },   // Noroeste
    { dLat: 0.002, dLng: 0.002 },     // Nordeste
    { dLat: -0.001, dLng: 0.002 },    // Sudeste
    { dLat: -0.001, dLng: -0.0015 },  // Sudoeste
  ], 'user', colors.user));

  // Segundo território do usuário - mais ao sul
  userTerritories.push(createPolygonTerritory(lat - 0.004, lng + 0.001, [
    { dLat: 0.0015, dLng: -0.001 },
    { dLat: 0.0015, dLng: 0.0025 },
    { dLat: -0.0015, dLng: 0.003 },
    { dLat: -0.0015, dLng: -0.001 },
  ], 'user', colors.user));

  // Rival 1 - Grande território ao nordeste (forma irregular)
  otherTerritories.push(createPolygonTerritory(lat + 0.006, lng + 0.005, [
    { dLat: 0.003, dLng: -0.002 },
    { dLat: 0.004, dLng: 0.001 },
    { dLat: 0.002, dLng: 0.004 },
    { dLat: -0.001, dLng: 0.003 },
    { dLat: -0.002, dLng: 0.0 },
    { dLat: 0.0, dLng: -0.002 },
  ], 'rival1', colors.rival1));

  // Rival 2 - Território ao sul (retângulo largo)
  otherTerritories.push(createPolygonTerritory(lat - 0.008, lng - 0.002, [
    { dLat: 0.002, dLng: -0.004 },
    { dLat: 0.002, dLng: 0.006 },
    { dLat: -0.002, dLng: 0.006 },
    { dLat: -0.002, dLng: -0.004 },
  ], 'rival2', colors.rival2));

  // Rival 3 - Território a oeste (formato de L invertido)
  otherTerritories.push(createPolygonTerritory(lat + 0.002, lng - 0.008, [
    { dLat: 0.004, dLng: -0.003 },
    { dLat: 0.004, dLng: 0.001 },
    { dLat: 0.001, dLng: 0.001 },
    { dLat: 0.001, dLng: 0.003 },
    { dLat: -0.002, dLng: 0.003 },
    { dLat: -0.002, dLng: -0.003 },
  ], 'rival3', colors.rival3));

  // Rival 4 - Pequeno território ao leste
  otherTerritories.push(createPolygonTerritory(lat - 0.001, lng + 0.008, [
    { dLat: 0.0015, dLng: -0.001 },
    { dLat: 0.0015, dLng: 0.002 },
    { dLat: -0.0015, dLng: 0.002 },
    { dLat: -0.0015, dLng: -0.001 },
  ], 'rival4', colors.rival4));

  // Rival 5 - Território triangular ao noroeste
  otherTerritories.push(createPolygonTerritory(lat + 0.005, lng - 0.004, [
    { dLat: 0.003, dLng: 0.0 },
    { dLat: -0.001, dLng: 0.003 },
    { dLat: -0.001, dLng: -0.002 },
  ], 'rival5', colors.rival5));

  return { userTerritories, otherTerritories };
}
