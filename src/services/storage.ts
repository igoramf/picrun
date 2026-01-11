import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunData } from '../types';

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
