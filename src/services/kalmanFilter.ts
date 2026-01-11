import { GpsPoint } from '../types';

// Filtro de Kalman simplificado para suavizar GPS
export class KalmanFilter {
  private variance: number;
  private lastLat: number | null = null;
  private lastLng: number | null = null;

  constructor(initialVariance: number = 3) {
    this.variance = initialVariance;
  }

  filter(point: GpsPoint): GpsPoint {
    if (this.lastLat === null || this.lastLng === null) {
      this.lastLat = point.latitude;
      this.lastLng = point.longitude;
      return point;
    }

    // Quanto menor a accuracy, mais confiamos no ponto novo
    const k = this.variance / (this.variance + point.accuracy);

    const filteredLat = this.lastLat + k * (point.latitude - this.lastLat);
    const filteredLng = this.lastLng + k * (point.longitude - this.lastLng);

    this.variance = (1 - k) * this.variance;

    this.lastLat = filteredLat;
    this.lastLng = filteredLng;

    return {
      ...point,
      latitude: filteredLat,
      longitude: filteredLng,
    };
  }

  reset(): void {
    this.lastLat = null;
    this.lastLng = null;
    this.variance = 3;
  }
}
