import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TerritoryMap } from '../../src/components/TerritoryMap';
import { Button } from '../../src/components/Button';
import { StatBox } from '../../src/components/StatBox';
import { COLORS } from '../../src/constants';
import { getCurrentPosition, requestPermissions } from '../../src/services/gpsTracker';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/api/client';
import { getUserCells } from '../../src/services/storage';

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [loading, setLoading] = useState(true);
  const [userCellIds, setUserCellIds] = useState<string[]>([]);
  const [showTerritory, setShowTerritory] = useState(true);
  const [rank, setRank] = useState<number | null>(null);

  // Recarrega dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    setLoading(true);

    try {
      // Carrega posição
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

      // Só carrega dados do backend se estiver autenticado
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Atualiza dados do usuário
      await refreshUser();

      // Carrega células conquistadas (API + local)
      try {
        const cellsGeoJSON = await api.getMyCells();
        // Extrai IDs das células do GeoJSON
        const cellIds = cellsGeoJSON.features.map(
          (f: GeoJSON.Feature) => f.properties?.cellId as string
        ).filter(Boolean);
        setUserCellIds(cellIds);
        console.log(`[Home] Carregadas ${cellIds.length} células da API`);
      } catch (error) {
        console.log('Erro ao carregar células da API:', error);
        // Fallback: carrega do storage local
        const localCells = await getUserCells();
        setUserCellIds(localCells);
        console.log(`[Home] Carregadas ${localCells.length} células do storage local`);
      }

      // Carrega rank
      try {
        const rankData = await api.getMyRank();
        setRank(rankData.rank);
      } catch (error) {
        console.log('Erro ao carregar rank:', error);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStartRun() {
    router.push('/run');
  }

  const stats = user?.stats;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <TerritoryMap
          userCells={showTerritory ? userCellIds : []}
          centerCoordinate={userLocation}
          showUserLocation={true}
          followUser={false}
          zoomLevel={14}
        />

        <SafeAreaView style={styles.statsOverlay} edges={['top']}>
          <View style={styles.statsRow}>
            <StatBox
              label="Células"
              value={stats?.totalCells?.toString() || '0'}
              size="small"
            />
            <StatBox
              label="Rank"
              value={rank ? `#${rank}` : '-'}
              size="small"
            />
            <StatBox
              label="Distância"
              value={((stats?.totalDistance || 0) / 1000).toFixed(1)}
              unit="km"
              size="small"
            />
          </View>
        </SafeAreaView>

        {/* Botão toggle território */}
        <TouchableOpacity
          style={[
            styles.territoryToggle,
            showTerritory && styles.territoryToggleActive,
          ]}
          onPress={() => setShowTerritory(!showTerritory)}
        >
          <Text style={styles.territoryToggleText}>
            {showTerritory ? '🗺️' : '🗺️'}
          </Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: COLORS.surface + 'E6',
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
  territoryToggle: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  territoryToggleActive: {
    borderColor: COLORS.primary,
    opacity: 1,
  },
  territoryToggleText: {
    fontSize: 20,
  },
});
