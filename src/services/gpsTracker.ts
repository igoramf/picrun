import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Vibration } from 'react-native';
import { GpsPoint, ProcessedPoint, RunStats } from '../types';
import { GPS_CONFIG, RUN_VALIDATION } from '../constants';
import { haversineDistance, calculatePace } from '../utils/geo';
import { pointToCell } from '../utils/h3';
import { KalmanFilter } from './kalmanFilter';
import { isValidPoint, setLastValidPoint, resetFilter, isStationary } from './gpsFilter';
import { gpsSimulator } from './gpsSimulator';

const TASK_NAME = 'STRIDE_GPS_TRACKING';

// Estado da corrida atual
let isTracking = false;
let processedPoints: ProcessedPoint[] = [];
let totalDistance = 0;
let startTime: number | null = null;
let lastProcessedPoint: ProcessedPoint | null = null;

// Células conquistadas nesta corrida
let claimedCells = new Set<string>(); // células que eram vazias
let stolenCells = new Set<string>(); // células roubadas de outros

// Rastreamento de tempo em cada célula (para validação)
// Map<cellId, { enteredAt: timestamp, totalTime: ms, isValid: boolean }>
let cellTimeTracking = new Map<string, {
  enteredAt: number;
  totalTime: number;
  lastSpeed: number;
  validSpeedTime: number; // tempo com velocidade válida
}>();
let currentCellId: string | null = null;

// Filtro de Kalman para suavização
const kalman = new KalmanFilter();

// Callbacks
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

// Verifica se a velocidade é válida para corrida
function isValidRunningSpeed(speedMs: number | null): boolean {
  if (speedMs === null) return false;
  return speedMs >= RUN_VALIDATION.MIN_SPEED_MS && speedMs <= RUN_VALIDATION.MAX_SPEED_MS;
}

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

  // Passo 6: Rastreia tempo na célula e valida conquista
  trackCellTime(cellId, processed);

  // Salva ponto
  processedPoints.push(processed);
  lastProcessedPoint = processed;

  // Notifica UI
  emitStats(processed);
}

// Rastreia tempo na célula e verifica se pode conquistar
function trackCellTime(cellId: string, point: ProcessedPoint): void {
  const now = Date.now();
  const speed = point.speed ?? 0;
  const isSpeedValid = isValidRunningSpeed(speed);

  // Mudou de célula?
  if (cellId !== currentCellId) {
    // Finaliza rastreamento da célula anterior
    if (currentCellId) {
      finalizeCellTracking(currentCellId);
    }

    // Inicia rastreamento da nova célula
    currentCellId = cellId;

    // Se já conquistou esta célula, não precisa rastrear
    if (claimedCells.has(cellId) || stolenCells.has(cellId)) {
      return;
    }

    cellTimeTracking.set(cellId, {
      enteredAt: now,
      totalTime: 0,
      lastSpeed: speed,
      validSpeedTime: 0, // Vai acumular no próximo update
    });

    const speedKmh = speed * 3.6;
    const speedStatus = isSpeedValid ? '✓' : '✗';
    console.log(`[GPS] 📍 Entrou na célula ${cellId.slice(-6)} | Velocidade: ${speedKmh.toFixed(1)} km/h [${speedStatus}] (válido: ${RUN_VALIDATION.MIN_SPEED_KMH}-${RUN_VALIDATION.MAX_SPEED_KMH})`);
  } else {
    // Ainda na mesma célula - atualiza tempo
    const tracking = cellTimeTracking.get(cellId);
    if (tracking) {
      const deltaTime = now - tracking.enteredAt - tracking.totalTime;
      tracking.totalTime = now - tracking.enteredAt;
      tracking.lastSpeed = speed;

      // Acumula tempo com velocidade válida
      if (isSpeedValid) {
        tracking.validSpeedTime += deltaTime;
      }
    }
  }
}

// Finaliza rastreamento de uma célula e verifica conquista
function finalizeCellTracking(cellId: string): void {
  // Se já conquistou, ignora
  if (claimedCells.has(cellId) || stolenCells.has(cellId)) {
    return;
  }

  const tracking = cellTimeTracking.get(cellId);
  if (!tracking) return;

  const validTimeSeconds = tracking.validSpeedTime / 1000;
  const totalTimeSeconds = tracking.totalTime / 1000;

  console.log(`[GPS] 🏁 Saiu da célula ${cellId.slice(-6)} | Tempo válido: ${validTimeSeconds.toFixed(1)}s / ${totalTimeSeconds.toFixed(1)}s total`);

  // Verifica se passou tempo suficiente COM VELOCIDADE VÁLIDA
  if (validTimeSeconds >= RUN_VALIDATION.MIN_TIME_IN_CELL) {
    // CONQUISTOU!
    claimedCells.add(cellId);

    // Vibra para feedback
    Vibration.vibrate(100);

    console.log(`[GPS] ✅ Célula CONQUISTADA! Total: ${claimedCells.size + stolenCells.size}`);
  } else {
    console.log(`[GPS] ❌ Célula NÃO conquistada (tempo válido insuficiente: ${validTimeSeconds.toFixed(1)}s < ${RUN_VALIDATION.MIN_TIME_IN_CELL}s)`);
  }

  // Remove do tracking
  cellTimeTracking.delete(cellId);
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

  // Combina todas as células conquistadas
  const allCells = [...claimedCells, ...stolenCells];

  statsCallback({
    distance: totalDistance,
    duration,
    pace: calculatePace(currentPoint.speed),
    currentSpeed: currentPoint.speed,
    routeCoordinates,
    cellsClaimed: claimedCells.size,
    cellsStolen: stolenCells.size,
    totalCells: allCells.length,
    claimedCellIds: allCells,
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
  // Reset estado
  processedPoints = [];
  claimedCells.clear();
  stolenCells.clear();
  cellTimeTracking.clear();
  currentCellId = null;
  totalDistance = 0;
  lastProcessedPoint = null;
  startTime = Date.now();
  kalman.reset();
  resetFilter();

  statsCallback = onStats;
  isTracking = true;

  // Modo simulação para testes no emulador
  if (GPS_CONFIG.SIMULATE_GPS) {
    console.log('[GPS] Modo SIMULAÇÃO ativado - usando rota de Campina Grande, PB');
    console.log(`[GPS] Validação: velocidade ${RUN_VALIDATION.MIN_SPEED_KMH}-${RUN_VALIDATION.MAX_SPEED_KMH} km/h, tempo mínimo ${RUN_VALIDATION.MIN_TIME_IN_CELL}s`);
    gpsSimulator.start((point) => {
      processGpsPoint(point);
    });
    return true;
  }

  // Modo real
  const hasPermission = await requestPermissions();
  if (!hasPermission) return false;

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
  cellsClaimed: string[];
  cellsStolen: string[];
  distance: number;
  duration: number;
}> {
  isTracking = false;
  statsCallback = null;

  // Finaliza célula atual se estiver em uma
  if (currentCellId) {
    finalizeCellTracking(currentCellId);
  }

  // Para simulador se estiver ativo
  if (GPS_CONFIG.SIMULATE_GPS) {
    gpsSimulator.stop();
  } else {
    const hasTask = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (hasTask) {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
    }
  }

  const duration = startTime ? Date.now() - startTime : 0;

  const result = {
    points: [...processedPoints],
    cellsClaimed: [...claimedCells],
    cellsStolen: [...stolenCells],
    distance: totalDistance,
    duration,
  };

  const totalCells = result.cellsClaimed.length + result.cellsStolen.length;
  console.log(`[GPS] Tracking parado. ${result.points.length} pontos, ${totalCells} células, ${result.distance.toFixed(0)}m`);

  return result;
}

// Verifica se está rastreando
export function isCurrentlyTracking(): boolean {
  return isTracking;
}

// Pega posição atual (útil pra centralizar mapa)
export async function getCurrentPosition(): Promise<GpsPoint | null> {
  // Modo simulação
  if (GPS_CONFIG.SIMULATE_GPS) {
    return gpsSimulator.getCurrentPosition();
  }

  // Modo real
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
