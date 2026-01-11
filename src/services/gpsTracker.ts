import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GpsPoint, ProcessedPoint, RunStats } from '../types';
import { GPS_CONFIG } from '../constants';
import { haversineDistance, calculatePace } from '../utils/geo';
import { pointToCell } from '../utils/h3';
import { KalmanFilter } from './kalmanFilter';
import { isValidPoint, setLastValidPoint, resetFilter, isStationary } from './gpsFilter';

const TASK_NAME = 'STRIDE_GPS_TRACKING';

// Estado da corrida atual
let isTracking = false;
let processedPoints: ProcessedPoint[] = [];
let claimedCells = new Set<string>();
let totalDistance = 0;
let startTime: number | null = null;
let lastProcessedPoint: ProcessedPoint | null = null;

// Filtro de Kalman para suavização
const kalman = new KalmanFilter();

// Callbacks para atualizar UI
type StatsCallback = (stats: RunStats) => void;
let statsCallback: StatsCallback | null = null;

// Define a task de background
TaskManager.defineTask(TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('[GPS Task] Erro:', error);
    return;
  }

  if (!isTracking) return;

  const { locations } = data as { locations: Location.LocationObject[] };

  for (const loc of locations) {
    const point: GpsPoint = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? 999,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      timestamp: loc.timestamp,
    };

    processGpsPoint(point);
  }
});

// Processa um ponto GPS
function processGpsPoint(rawPoint: GpsPoint): void {
  // Passo 1: Filtra pontos ruins
  if (!isValidPoint(rawPoint)) {
    return;
  }

  // Passo 2: Ignora se está parado (evita drift)
  if (isStationary(rawPoint) && lastProcessedPoint) {
    return;
  }

  // Passo 3: Suaviza com Kalman
  const smoothedPoint = kalman.filter(rawPoint);
  setLastValidPoint(smoothedPoint);

  // Passo 4: Calcula célula H3
  const cellId = pointToCell(smoothedPoint);

  const processed: ProcessedPoint = {
    ...smoothedPoint,
    cellId,
  };

  // Passo 5: Calcula distância incremental
  if (lastProcessedPoint) {
    const delta = haversineDistance(lastProcessedPoint, processed);

    // Só soma se moveu pelo menos o mínimo
    if (delta >= GPS_CONFIG.MIN_DISTANCE_DELTA) {
      totalDistance += delta;
    }
  }

  // Passo 6: Registra célula
  claimedCells.add(cellId);

  // Salva ponto
  processedPoints.push(processed);
  lastProcessedPoint = processed;

  // Notifica UI
  emitStats(processed);
}

// Emite estatísticas para a UI
function emitStats(currentPoint: ProcessedPoint): void {
  if (!statsCallback || !startTime) return;

  const duration = Date.now() - startTime;

  // Converte pontos para coordenadas [lng, lat] para o mapa
  const routeCoordinates: [number, number][] = processedPoints.map((p) => [
    p.longitude,
    p.latitude,
  ]);

  statsCallback({
    distance: totalDistance,
    duration,
    pace: calculatePace(currentPoint.speed),
    cells: claimedCells.size,
    currentSpeed: currentPoint.speed,
    routeCoordinates,
    claimedCellIds: [...claimedCells],
  });
}

// Pede permissões de GPS
export async function requestPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    console.log('[GPS] Permissão foreground negada');
    return false;
  }

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    console.log('[GPS] Permissão background negada');
    return false;
  }

  return true;
}

// Inicia tracking
export async function startTracking(onStats: StatsCallback): Promise<boolean> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return false;

  // Reset estado
  processedPoints = [];
  claimedCells.clear();
  totalDistance = 0;
  lastProcessedPoint = null;
  startTime = Date.now();
  kalman.reset();
  resetFilter();

  statsCallback = onStats;
  isTracking = true;

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: GPS_CONFIG.DISTANCE_INTERVAL,
    timeInterval: GPS_CONFIG.TIME_INTERVAL,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Corrida ativa',
      notificationBody: 'Rastreando sua rota...',
      notificationColor: '#22c55e',
    },
  });

  console.log('[GPS] Tracking iniciado');
  return true;
}

// Para tracking
export async function stopTracking(): Promise<{
  points: ProcessedPoint[];
  cells: string[];
  distance: number;
  duration: number;
}> {
  isTracking = false;
  statsCallback = null;

  const hasTask = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (hasTask) {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  }

  const duration = startTime ? Date.now() - startTime : 0;

  const result = {
    points: [...processedPoints],
    cells: [...claimedCells],
    distance: totalDistance,
    duration,
  };

  console.log(`[GPS] Tracking parado. ${result.points.length} pontos, ${result.cells.length} células, ${result.distance.toFixed(0)}m`);

  return result;
}

// Verifica se está rastreando
export function isCurrentlyTracking(): boolean {
  return isTracking;
}

// Pega posição atual (útil pra centralizar mapa)
export async function getCurrentPosition(): Promise<GpsPoint | null> {
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? 999,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      timestamp: loc.timestamp,
    };
  } catch (error) {
    console.error('[GPS] Erro ao pegar posição:', error);
    return null;
  }
}
