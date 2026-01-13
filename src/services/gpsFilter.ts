import { GpsPoint } from '../types';
import { GPS_CONFIG } from '../constants';
import { haversineDistance } from '../utils/geo';

let lastValidPoint: GpsPoint | null = null;

// Valida se um ponto GPS é confiável
export function isValidPoint(point: GpsPoint): boolean {
  // Em modo simulação, aceita todos os pontos
  if (GPS_CONFIG.SIMULATE_GPS) {
    return true;
  }

  // Precisão muito ruim
  if (point.accuracy > GPS_CONFIG.MAX_ACCURACY) {
    console.log(`[GPS] Descartado: precisão ruim (${point.accuracy}m)`);
    return false;
  }

  // Velocidade impossível (GPS spoofing ou erro)
  if (point.speed && point.speed > GPS_CONFIG.MAX_SPEED) {
    console.log(`[GPS] Descartado: velocidade impossível (${point.speed} m/s)`);
    return false;
  }

  // Se temos ponto anterior, verifica teleporte
  if (lastValidPoint) {
    const distance = haversineDistance(lastValidPoint, point);
    const timeDelta = (point.timestamp - lastValidPoint.timestamp) / 1000;

    // Evita divisão por zero
    if (timeDelta > 0) {
      const calculatedSpeed = distance / timeDelta;

      // "Teleportou" - velocidade calculada impossível
      if (calculatedSpeed > GPS_CONFIG.MAX_SPEED) {
        console.log(`[GPS] Descartado: teleporte detectado (${calculatedSpeed.toFixed(1)} m/s)`);
        return false;
      }
    }
  }

  return true;
}

// Atualiza último ponto válido
export function setLastValidPoint(point: GpsPoint): void {
  lastValidPoint = point;
}

// Reseta filtro
export function resetFilter(): void {
  lastValidPoint = null;
}

// Verifica se está parado (para ignorar drift de GPS)
export function isStationary(point: GpsPoint): boolean {
  if (!point.speed) return false;
  return point.speed < GPS_CONFIG.MIN_SPEED;
}
