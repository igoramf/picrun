// Tipos principais do app

export interface GpsPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null; // m/s
  timestamp: number;
}

export interface ProcessedPoint extends GpsPoint {
  cellId: string; // H3 cell ID
}

export interface RunData {
  id: string;
  userId: string;
  startedAt: number;
  endedAt: number | null;
  points: ProcessedPoint[];
  distance: number; // metros
  duration: number; // ms
  cells: string[]; // H3 cell IDs conquistados
  averagePace: number; // segundos por km
  status: 'active' | 'paused' | 'completed';
}

export interface Cell {
  id: string; // H3 cell ID
  ownerId: string | null;
  claimedAt: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  city: string | null;
  totalDistance: number;
  totalCells: number;
  createdAt: number;
}

export interface RunStats {
  distance: number;
  duration: number;
  pace: string;
  cells: number;
  currentSpeed: number | null;
  routeCoordinates: [number, number][]; // [lng, lat][]
  claimedCellIds: string[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar: string | null;
  cellCount: number;
  rank: number;
}
