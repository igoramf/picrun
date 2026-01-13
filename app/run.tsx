import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Vibration } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TerritoryMap } from '../src/components/TerritoryMap';
import { Button } from '../src/components/Button';
import { StatBox } from '../src/components/StatBox';
import { COLORS } from '../src/constants';
import { formatDistance, formatDuration } from '../src/utils/geo';
import {
  startTracking,
  stopTracking,
} from '../src/services/gpsTracker';
import { api } from '../src/api/client';
import { useAuth } from '../src/contexts/AuthContext';
import { RunStats } from '../src/types';

export default function RunScreen() {
  const { refreshUser } = useAuth();
  const [stats, setStats] = useState<RunStats>({
    distance: 0,
    duration: 0,
    pace: '--:--',
    currentSpeed: null,
    routeCoordinates: [],
    cellsClaimed: 0,
    cellsStolen: 0,
    totalCells: 0,
    claimedCellIds: [],
  });
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const prevCellsRef = useRef<number>(0);

  useEffect(() => {
    handleStart();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  async function handleStart() {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        duration: Date.now() - startTimeRef.current,
      }));
    }, 1000);

    const started = await startTracking((newStats) => {
      setStats(newStats);
    });

    if (!started) {
      Alert.alert('Erro', 'Não foi possível iniciar o rastreamento GPS.');
      router.back();
    }
  }

  async function handleStop() {
    Alert.alert(
      'Parar corrida?',
      'Tem certeza que deseja encerrar a corrida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Parar',
          style: 'destructive',
          onPress: finishRun,
        },
      ]
    );
  }

  async function finishRun() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSaving(true);
    const result = await stopTracking();

    // Vibra ao finalizar
    Vibration.vibrate([0, 100, 50, 100]);

    // Salva no backend
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - result.duration);

      await api.createRun({
        distance: result.distance,
        duration: result.duration,
        avgPace: result.distance > 0
          ? (result.duration / 60000) / (result.distance / 1000)
          : undefined,
        startedAt: startTime.toISOString(),
        endedAt: endTime.toISOString(),
        routeCoordinates: result.points.map(p => [p.longitude, p.latitude]),
        cellsClaimed: result.cellsClaimed,
      });

      // Atualiza stats do usuário
      await refreshUser();

      const totalCells = result.cellsClaimed.length + result.cellsStolen.length;
      Alert.alert(
        'Corrida salva!',
        `Distância: ${formatDistance(result.distance)}\n` +
          `Duração: ${formatDuration(result.duration)}\n` +
          `Células conquistadas: ${totalCells}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro ao salvar corrida:', error);
      const totalCells = result.cellsClaimed.length + result.cellsStolen.length;
      Alert.alert(
        'Corrida finalizada',
        `Distância: ${formatDistance(result.distance)}\n` +
          `Duração: ${formatDuration(result.duration)}\n` +
          `Células: ${totalCells}\n\n` +
          '(Erro ao sincronizar com servidor)',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setSaving(false);
    }
  }

  // Posição atual para centralizar o mapa
  const currentPosition = stats.routeCoordinates.length > 0
    ? stats.routeCoordinates[stats.routeCoordinates.length - 1]
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <TerritoryMap
          routeCoordinates={stats.routeCoordinates}
          userCells={stats.claimedCellIds}
          showUserLocation={true}
          followUser={true}
          simulatedPosition={currentPosition}
        />
      </View>

      <SafeAreaView style={styles.statsContainer} edges={['bottom']}>
        <View style={styles.statsRow}>
          <StatBox
            label="Distância"
            value={formatDistance(stats.distance)}
            size="large"
          />
          <StatBox label="Pace" value={stats.pace} unit="/km" size="large" />
        </View>

        <View style={styles.statsRow}>
          <StatBox
            label="Tempo"
            value={formatDuration(stats.duration)}
            size="medium"
          />
          <StatBox
            label="Células"
            value={stats.totalCells.toString()}
            size="medium"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'SALVANDO...' : 'PARAR'}
            onPress={handleStop}
            variant="danger"
            size="large"
            loading={saving}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    marginTop: -24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
});
