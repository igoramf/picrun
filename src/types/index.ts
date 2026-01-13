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

// Célula do mapa (hexágono H3)
export interface Cell {
  id: string; // H3 cell ID
  ownerId: string | null;
  ownerColor: string | null;
  claimedAt: number | null;
}

// Dados de uma corrida
export interface RunData {
  id: string;
  userId: string;
  startedAt: number;
  endedAt: number | null;
  points: ProcessedPoint[];
  distance: number; // metros
  duration: number; // ms
  cellsClaimed: string[]; // IDs das células conquistadas
  cellsStolen: string[]; // IDs das células roubadas de outros
  averagePace: number; // segundos por km
  status: 'active' | 'paused' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  city: string | null;
  totalDistance: number;
  totalCells: number; // Número de células que possui
  createdAt: number;
}

// Stats em tempo real durante a corrida
export interface RunStats {
  distance: number;
  duration: number;
  pace: string;
  currentSpeed: number | null;
  routeCoordinates: [number, number][]; // [lng, lat][]
  // Células conquistadas nesta corrida
  cellsClaimed: number; // células novas (eram vazias)
  cellsStolen: number; // células roubadas de outros
  totalCells: number; // total (claimed + stolen)
  // IDs das células para mostrar no mapa
  claimedCellIds: string[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar: string | null;
  cellCount: number;
  rank: number;
}
