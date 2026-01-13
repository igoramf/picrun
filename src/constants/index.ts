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

// Cores do app - Tema Branco e Laranja
export const COLORS = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceLight: '#fafafa',
  primary: '#f97316', // Laranja
  primaryLight: '#fb923c',
  primaryDark: '#ea580c',
  secondary: '#1f2937', // Cinza escuro
  danger: '#ef4444', // Vermelho
  dangerLight: '#f87171',
  warning: '#f59e0b',
  text: '#1f2937', // Texto escuro
  textMuted: '#6b7280',
  textDark: '#9ca3af',
  textWhite: '#ffffff',
  border: '#e5e7eb',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Cores para territórios de diferentes jogadores
export const TERRITORY_COLORS = [
  '#f97316', // Laranja (usuário)
  '#3b82f6', // Azul
  '#ec4899', // Rosa
  '#22c55e', // Verde
  '#8b5cf6', // Roxo
  '#eab308', // Amarelo
  '#06b6d4', // Ciano
  '#ef4444', // Vermelho
];

// Mapbox
export const MAPBOX_CONFIG = {
  styleUrl: 'mapbox://styles/mapbox/light-v11',
  defaultZoom: 15,
  runningZoom: 16,
};
