import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const TOKEN_KEY = '@picrun/token';

class ApiClient {
  private token: string | null = null;

  async init() {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  }

  // Auth
  async register(email: string, username: string, password: string) {
    const result = await this.request<{
      success: boolean;
      data: { user: User; token: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    if (result.success) {
      await this.setToken(result.data.token);
    }

    return result.data;
  }

  async login(email: string, password: string) {
    const result = await this.request<{
      success: boolean;
      data: { user: User; token: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success) {
      await this.setToken(result.data.token);
    }

    return result.data;
  }

  async logout() {
    await this.setToken(null);
  }

  // User
  async getMe() {
    const result = await this.request<{
      success: boolean;
      data: UserWithStats;
    }>('/user/me');
    return result.data;
  }

  async updateProfile(data: { username?: string; avatarUrl?: string }) {
    const result = await this.request<{
      success: boolean;
      data: User;
    }>('/user/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.data;
  }

  // Runs
  async createRun(run: CreateRunInput) {
    const result = await this.request<{
      success: boolean;
      data: Run;
    }>('/runs', {
      method: 'POST',
      body: JSON.stringify(run),
    });
    return result.data;
  }

  async getRuns() {
    const result = await this.request<{
      success: boolean;
      data: Run[];
    }>('/runs');
    return result.data;
  }

  // Territories
  async getMyCells() {
    const result = await this.request<{
      success: boolean;
      data: GeoJSON.FeatureCollection;
    }>('/territories/cells/mine');
    return result.data;
  }

  async getCellsInArea(lat: number, lng: number, radius?: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      ...(radius && { radius: radius.toString() }),
    });

    const result = await this.request<{
      success: boolean;
      data: {
        totalCells: number;
        byOwner: Record<string, GeoJSON.Feature[]>;
      };
    }>(`/territories/cells/area?${params}`);
    return result.data;
  }

  async getMyTerritories() {
    const result = await this.request<{
      success: boolean;
      data: Territory[];
    }>('/territories/mine');
    return result.data;
  }

  // Leaderboard
  async getLeaderboard(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const result = await this.request<{
      success: boolean;
      data: LeaderboardEntry[];
    }>(`/leaderboard/cells${params}`);
    return result.data;
  }

  async getMyRank() {
    const result = await this.request<{
      success: boolean;
      data: { rank: number | null; stats: UserStats | null };
    }>('/leaderboard/me');
    return result.data;
  }
}

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface UserStats {
  totalDistance: number;
  totalRuns: number;
  totalCells: number;
  totalTerritoryArea: number;
  rank: number | null;
}

export interface UserWithStats extends User {
  createdAt: string;
  stats: UserStats | null;
}

export interface Run {
  id: string;
  userId: string;
  distance: number;
  duration: number;
  avgPace: number | null;
  startedAt: string;
  endedAt: string;
  routeCoordinates: [number, number][] | null;
  cellsClaimed: string[] | null;
  createdAt: string;
}

export interface CreateRunInput {
  distance: number;
  duration: number;
  avgPace?: number;
  startedAt: string;
  endedAt: string;
  routeCoordinates?: [number, number][];
  cellsClaimed?: string[];
}

export interface Territory {
  id: string;
  ownerId: string;
  coordinates: [number, number][];
  area: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalCells: number;
  totalDistance: number;
  totalRuns: number;
}

export const api = new ApiClient();
