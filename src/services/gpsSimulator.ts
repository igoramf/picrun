import { GpsPoint } from '../types';

// Rota REAL em Campina Grande - PB (Bairro Liberdade / próximo à Rua Riachuelo)
// Coordenadas obtidas do OpenStreetMap via OSRM - seguem as ruas de verdade!
// Rota de ~3km
const SIMULATED_ROUTE: [number, number][] = [
  [-35.881069,-7.230475],
  [-35.881011,-7.230489],
  [-35.880921,-7.230547],
  [-35.880673,-7.231045],
  [-35.881821,-7.23114],
  [-35.88184,-7.230841],
  [-35.881225,-7.230449],
  [-35.881172,-7.230461],
  [-35.881119,-7.230463],
  [-35.881043,-7.230451],
  [-35.880972,-7.230421],
  [-35.880911,-7.230375],
  [-35.880863,-7.230316],
  [-35.880837,-7.230263],
  [-35.880821,-7.230207],
  [-35.880818,-7.23012],
  [-35.880839,-7.230035],
  [-35.880883,-7.229959],
  [-35.880946,-7.229899],
  [-35.881036,-7.229854],
  [-35.881136,-7.229839],
  [-35.881236,-7.229857],
  [-35.881581,-7.229486],
  [-35.88168,-7.22935],
  [-35.881792,-7.22921],
  [-35.88188,-7.229111],
  [-35.881959,-7.229033],
  [-35.882077,-7.228959],
  [-35.882254,-7.228852],
  [-35.882535,-7.228675],
  [-35.882746,-7.228526],
  [-35.882974,-7.228402],
  [-35.883084,-7.228354],
  [-35.88312,-7.228343],
  [-35.883292,-7.228282],
  [-35.883366,-7.228253],
  [-35.883582,-7.228184],
  [-35.883729,-7.228129],
  [-35.883842,-7.228072],
  [-35.883969,-7.228001],
  [-35.88403,-7.227954],
  [-35.884122,-7.227868],
  [-35.884195,-7.227781],
  [-35.884262,-7.227703],
  [-35.884439,-7.227495],
  [-35.884517,-7.227392],
  [-35.884629,-7.227249],
  [-35.884703,-7.227181],
  [-35.884717,-7.227171],
  [-35.884751,-7.227153],
  [-35.884785,-7.227139],
  [-35.884821,-7.227132],
  [-35.884848,-7.227127],
  [-35.884861,-7.227316],
  [-35.884863,-7.227338],
  [-35.884877,-7.227588],
  [-35.884872,-7.227943],
  [-35.884856,-7.228124],
  [-35.884792,-7.228391],
  [-35.884754,-7.228551],
  [-35.88471,-7.228718],
  [-35.884688,-7.228798],
  [-35.884581,-7.229204],
  [-35.884564,-7.229256],
  [-35.884533,-7.229314],
  [-35.884499,-7.229354],
  [-35.884436,-7.229372],
  [-35.884373,-7.22938],
  [-35.884266,-7.22938],
  [-35.88393,-7.229388],
  [-35.883872,-7.229287],
  [-35.883774,-7.22912],
  [-35.883687,-7.228957],
  [-35.883607,-7.228806],
  [-35.883508,-7.228667],
  [-35.883471,-7.228627],
  [-35.883399,-7.228552],
  [-35.883341,-7.22848],
  [-35.883302,-7.228406],
  [-35.883292,-7.228369],
  [-35.883293,-7.228329],
  [-35.883292,-7.228282],
  [-35.883366,-7.228253],
  [-35.883582,-7.228184],
  [-35.883729,-7.228129],
  [-35.883842,-7.228072],
  [-35.883969,-7.228001],
  [-35.88403,-7.227954],
  [-35.884122,-7.227868],
  [-35.884195,-7.227781],
  [-35.884262,-7.227703],
  [-35.884439,-7.227495],
  [-35.884517,-7.227392],
  [-35.884629,-7.227249],
  [-35.884703,-7.227181],
  [-35.884717,-7.227171],
  [-35.884751,-7.227153],
  [-35.884785,-7.227139],
  [-35.884821,-7.227132],
  [-35.884848,-7.227127],
  [-35.884861,-7.227316],
  [-35.884863,-7.227338],
  [-35.884877,-7.227588],
  [-35.884872,-7.227943],
  [-35.884856,-7.228124],
  [-35.884792,-7.228391],
  [-35.884754,-7.228551],
  [-35.88471,-7.228718],
  [-35.884688,-7.228798],
  [-35.884581,-7.229204],
  [-35.884564,-7.229256],
  [-35.884533,-7.229314],
  [-35.884499,-7.229354],
  [-35.884461,-7.229407],
  [-35.884408,-7.229481],
  [-35.884297,-7.22963],
  [-35.884246,-7.229685],
  [-35.884192,-7.229723],
  [-35.88412,-7.229759],
  [-35.884286,-7.230093],
  [-35.884296,-7.230111],
  [-35.88432,-7.230168],
  [-35.88434,-7.230251],
  [-35.884389,-7.230643],
  [-35.884465,-7.231119],
  [-35.884523,-7.231455],
  [-35.884597,-7.231777],
  [-35.884824,-7.231739],
  [-35.884845,-7.231596],
  [-35.884864,-7.231514],
  [-35.884867,-7.231499],
  [-35.884909,-7.2314],
  [-35.88497,-7.231306],
  [-35.885018,-7.231224],
  [-35.885059,-7.231147],
  [-35.885304,-7.230715],
  [-35.885237,-7.230702],
  [-35.885159,-7.230689],
  [-35.884389,-7.230643],
  [-35.88434,-7.230251],
  [-35.88432,-7.230168],
  [-35.884296,-7.230111],
  [-35.884286,-7.230093],
  [-35.88412,-7.229759],
  [-35.88393,-7.229388],
  [-35.883761,-7.229393],
  [-35.882423,-7.229763],
  [-35.882076,-7.229867],
  [-35.881892,-7.229909],
  [-35.881773,-7.229947],
  [-35.881586,-7.230017],
  [-35.881443,-7.230109],
  [-35.88144,-7.230207],
  [-35.881408,-7.230299],
  [-35.881361,-7.230365],
  [-35.881298,-7.230416],
  [-35.881225,-7.230449],
  [-35.881172,-7.230461],
  [-35.881119,-7.230463],
  [-35.881069,-7.230475],
];

// Classe do simulador
export class GpsSimulator {
  private route: [number, number][];
  private currentIndex: number = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onLocationUpdate: ((point: GpsPoint) => void) | null = null;
  private isRunning: boolean = false;

  // Configurações
  private updateIntervalMs: number = 1000; // 1 segundo entre updates
  private speedMps: number = 3.0; // ~10.8 km/h (pace de 5:30/km)

  constructor() {
    this.route = SIMULATED_ROUTE;
  }

  start(onUpdate: (point: GpsPoint) => void): void {
    if (this.isRunning) return;

    this.onLocationUpdate = onUpdate;
    this.currentIndex = 0;
    this.isRunning = true;

    // Emite primeiro ponto imediatamente
    this.emitCurrentPoint();

    // Inicia loop de simulação
    this.intervalId = setInterval(() => {
      this.advancePosition();
      this.emitCurrentPoint();
    }, this.updateIntervalMs);

    console.log('[GPS Simulator] Simulação iniciada - Campina Grande, PB (rota real pelas ruas)');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.onLocationUpdate = null;
    console.log('[GPS Simulator] Simulação parada');
  }

  private advancePosition(): void {
    this.currentIndex++;

    // Loop infinito pela rota
    if (this.currentIndex >= this.route.length) {
      this.currentIndex = 0;
    }
  }

  private emitCurrentPoint(): void {
    if (!this.onLocationUpdate || !this.isRunning) return;

    const [lng, lat] = this.route[this.currentIndex];

    // Adiciona pequena variação para simular GPS real
    const jitter = 0.00001; // ~1 metro de variação
    const jitteredLng = lng + (Math.random() - 0.5) * jitter;
    const jitteredLat = lat + (Math.random() - 0.5) * jitter;

    const point: GpsPoint = {
      latitude: jitteredLat,
      longitude: jitteredLng,
      accuracy: 5 + Math.random() * 5, // 5-10m de precisão
      altitude: 550 + Math.random() * 2, // Altitude de CG ~550m
      speed: this.speedMps + (Math.random() - 0.5) * 0.5, // Variação de velocidade
      timestamp: Date.now(),
    };

    this.onLocationUpdate(point);
  }

  getCurrentPosition(): GpsPoint {
    const [lng, lat] = this.route[this.currentIndex] || this.route[0];

    return {
      latitude: lat,
      longitude: lng,
      accuracy: 5,
      altitude: 550,
      speed: 0,
      timestamp: Date.now(),
    };
  }

  isSimulating(): boolean {
    return this.isRunning;
  }
}

// Singleton para uso global
export const gpsSimulator = new GpsSimulator();
