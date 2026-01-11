// Constantes do app

// GPS
export const GPS_CONFIG = {
  MAX_ACCURACY: 20, // metros - ignora pontos com precisão maior
  MAX_SPEED: 12, // m/s (~43 km/h) - velocidade máxima realista
  MIN_SPEED: 0.3, // m/s - abaixo disso considera parado
  MIN_DISTANCE_DELTA: 2, // metros - mínimo pra considerar movimento
  DISTANCE_INTERVAL: 5, // metros - intervalo de atualização GPS
  TIME_INTERVAL: 1000, // ms - intervalo mínimo entre updates
};

// H3
export const H3_CONFIG = {
  RESOLUTION: 9, // ~100m de diâmetro por célula
};

// Cores do app
export const COLORS = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  primary: '#22c55e', // Verde
  primaryLight: '#4ade80',
  secondary: '#3b82f6', // Azul
  danger: '#ef4444', // Vermelho
  dangerLight: '#f87171',
  warning: '#f59e0b',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  textDark: '#71717a',
  border: '#27272a',
};

// Mapbox
export const MAPBOX_CONFIG = {
  styleUrl: 'mapbox://styles/mapbox/dark-v11',
  defaultZoom: 15,
  runningZoom: 16,
};
