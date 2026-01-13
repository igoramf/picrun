// Constantes do app

// GPS
export const GPS_CONFIG = {
  MAX_ACCURACY: 20, // metros - ignora pontos com precisão maior
  MAX_SPEED: 12, // m/s (~43 km/h) - velocidade máxima realista
  MIN_SPEED: 0.3, // m/s - abaixo disso considera parado
  MIN_DISTANCE_DELTA: 2, // metros - mínimo pra considerar movimento
  DISTANCE_INTERVAL: 5, // metros - intervalo de atualização GPS
  TIME_INTERVAL: 1000, // ms - intervalo mínimo entre updates
  // Ative para testar no emulador sem GPS real
  // A rota simulada é em Campina Grande - PB (ruas reais do OpenStreetMap)
  SIMULATE_GPS: true,
};

// H3
export const H3_CONFIG = {
  RESOLUTION: 10, // ~65m de diâmetro por célula (tamanho de quadra pequena)
  // Resolução 11 = ~25m (muito pequeno)
  // Resolução 10 = ~65m (quadra pequena) ← atual
  // Resolução 9 = ~170m (quarteirão)
  // Resolução 8 = ~460m (bairro)
};

// Validação de corrida (anti-trapaça)
export const RUN_VALIDATION = {
  // Velocidade válida para corrida (km/h)
  MIN_SPEED_KMH: 5, // Abaixo = caminhando/parado
  MAX_SPEED_KMH: 18, // Acima = bicicleta/carro
  // Convertido para m/s
  MIN_SPEED_MS: 5 / 3.6, // ~1.4 m/s
  MAX_SPEED_MS: 18 / 3.6, // ~5 m/s
  // Tempo mínimo na célula para conquistar (segundos)
  MIN_TIME_IN_CELL: 3,
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

// Cores para territórios de diferentes jogadores
export const TERRITORY_COLORS = [
  '#3b82f6', // Azul
  '#eab308', // Amarelo
  '#ec4899', // Rosa
  '#22c55e', // Verde
  '#8b5cf6', // Roxo
  '#f97316', // Laranja
  '#06b6d4', // Ciano
  '#ef4444', // Vermelho
];

// Mapbox
export const MAPBOX_CONFIG = {
  styleUrl: 'mapbox://styles/mapbox/dark-v11',
  defaultZoom: 15,
  runningZoom: 16,
};
