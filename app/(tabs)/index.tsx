import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TerritoryMap } from '../../src/components/TerritoryMap';
import { Button } from '../../src/components/Button';
import { StatBox } from '../../src/components/StatBox';
import { COLORS } from '../../src/constants';
import { getCurrentPosition, requestPermissions } from '../../src/services/gpsTracker';

export default function HomeScreen() {
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [loading, setLoading] = useState(true);

  // Mock data - depois vem do backend
  const [stats] = useState({
    totalCells: 47,
    rank: 12,
    totalDistance: 23500, // metros
  });

  // Mock cells - depois vem do backend
  const [userCells] = useState<{ id: string; ownerId: string | null }[]>([]);
  const [otherCells] = useState<{ id: string; ownerId: string | null }[]>([]);

  useEffect(() => {
    loadInitialPosition();
  }, []);

  async function loadInitialPosition() {
    const hasPermission = await requestPermissions();

    if (!hasPermission) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso ao GPS para mostrar o mapa e rastrear suas corridas.',
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }

    const position = await getCurrentPosition();

    if (position) {
      setUserLocation([position.longitude, position.latitude]);
    }

    setLoading(false);
  }

  function handleStartRun() {
    router.push('/run');
  }

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <TerritoryMap
          userCells={userCells}
          otherCells={otherCells}
          centerCoordinate={userLocation}
          showUserLocation={true}
          followUser={false}
        />

        {/* Overlay com stats */}
        <SafeAreaView style={styles.statsOverlay} edges={['top']}>
          <View style={styles.statsRow}>
            <StatBox label="Células" value={stats.totalCells.toString()} size="small" />
            <StatBox label="Rank" value={`#${stats.rank}`} size="small" />
            <StatBox
              label="Distância"
              value={(stats.totalDistance / 1000).toFixed(1)}
              unit="km"
              size="small"
            />
          </View>
        </SafeAreaView>
      </View>

      {/* Botão de iniciar */}
      <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
        <Button
          title="INICIAR CORRIDA"
          onPress={handleStartRun}
          size="large"
          loading={loading}
        />
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
  statsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface + 'E6', // 90% opacity
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.background,
  },
});
