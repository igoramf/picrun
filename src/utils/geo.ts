import { GpsPoint } from '../types';

// Converte graus para radianos
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Fórmula de Haversine - calcula distância entre 2 pontos GPS
export function haversineDistance(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = toRad(p2.latitude - p1.latitude);
  const dLon = toRad(p2.longitude - p1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.latitude)) *
      Math.cos(toRad(p2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Formata distância para exibição
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

// Formata duração (ms) para exibição
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Calcula pace (min/km) a partir de velocidade (m/s)
export function calculatePace(speedMs: number | null): string {
  if (!speedMs || speedMs < 0.5) return '--:--';

  const paceSecondsPerKm = 1000 / speedMs;
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Calcula pace médio a partir de distância e tempo
export function calculateAveragePace(distanceMeters: number, durationMs: number): string {
  if (distanceMeters < 100 || durationMs < 1000) return '--:--';

  const paceSecondsPerKm = (durationMs / 1000) / (distanceMeters / 1000);
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.floor(paceSecondsPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
