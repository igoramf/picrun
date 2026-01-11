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
  isCurrentlyTracking,
} from '../src/services/gpsTracker';
import { saveRun } from '../src/services/storage';
import { RunStats, RunData } from '../src/types';

export default function RunScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<RunStats>({
    distance: 0,
    duration: 0,
    pace: '--:--',
    cells: 0,
    currentSpeed: null,
    routeCoordinates: [],
    claimedCellIds: [],
  });
  const [claimedCells, setClaimedCells] = useState<{ id: string; ownerId: string | null }[]>([]);

  // Timer para duração (já que o GPS não atualiza constantemente)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Inicia corrida automaticamente ao entrar na tela
    handleStart();

    return () => {
      // Cleanup ao sair da tela
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  async function handleStart() {
    setIsRunning(true);
    startTimeRef.current = Date.now();

    // Timer para atualizar duração a cada segundo
    timerRef.current = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        duration: Date.now() - startTimeRef.current,
      }));
    }, 1000);

    const started = await startTracking((newStats) => {
      // Vibra quando conquista nova célula
      if (newStats.cells > stats.cells) {
        Vibration.vibrate(50);
      }

      setStats(newStats);

      // Atualiza células no mapa
      setClaimedCells(
        newStats.claimedCellIds.map((id) => ({ id, ownerId: 'me' }))
      );
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
          onPress: async () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }

            const result = await stopTracking();

            // Vibra ao finalizar
            Vibration.vibrate([0, 100, 50, 100]);

            // Mostra resumo
            Alert.alert(
              'Corrida finalizada!',
              `Distância: ${formatDistance(result.distance)}\n` +
                `Duração: ${formatDuration(result.duration)}\n` +
                `Células conquistadas: ${result.cells.length}`,
              [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]
            );
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa com rota */}
      <View style={styles.mapContainer}>
        <TerritoryMap
          userCells={claimedCells}
          routeCoordinates={stats.routeCoordinates}
          showUserLocation={true}
          followUser={true}
        />
      </View>

      {/* Stats bar */}
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
            value={stats.cells.toString()}
            size="medium"
          />
        </View>

        {/* Botão de parar */}
        <View style={styles.buttonContainer}>
          <Button
            title="PARAR"
            onPress={handleStop}
            variant="danger"
            size="large"
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
