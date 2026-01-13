import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatBox } from '../../src/components/StatBox';
import { Button } from '../../src/components/Button';
import { COLORS } from '../../src/constants';
import { useAuth } from '../../src/contexts/AuthContext';
import { api, Run } from '../../src/api/client';
import { formatDistance, formatDuration } from '../../src/utils/geo';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [runs, setRuns] = useState<Run[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [runsData, rankData] = await Promise.all([
        api.getRuns(),
        api.getMyRank(),
      ]);
      setRuns(runsData);
      setRank(rankData.rank);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  }

  const stats = user?.stats;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.username || 'Usuário'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <StatBox
              label="Células"
              value={stats?.totalCells?.toString() || '0'}
              size="large"
            />
          </View>
          <View style={styles.statCard}>
            <StatBox
              label="Rank"
              value={rank ? `#${rank}` : '-'}
              size="large"
            />
          </View>
          <View style={styles.statCard}>
            <StatBox
              label="Distância"
              value={((stats?.totalDistance || 0) / 1000).toFixed(1)}
              unit="km"
              size="large"
            />
          </View>
          <View style={styles.statCard}>
            <StatBox
              label="Corridas"
              value={stats?.totalRuns?.toString() || '0'}
              size="large"
            />
          </View>
        </View>

        {/* Histórico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Corridas</Text>
          {runs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {loading ? 'Carregando...' : 'Suas corridas aparecerão aqui'}
              </Text>
            </View>
          ) : (
            runs.slice(0, 10).map((run) => (
              <View key={run.id} style={styles.runCard}>
                <View style={styles.runInfo}>
                  <Text style={styles.runDistance}>
                    {formatDistance(run.distance)}
                  </Text>
                  <Text style={styles.runDate}>
                    {new Date(run.startedAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={styles.runStats}>
                  <Text style={styles.runDuration}>
                    {formatDuration(run.duration)}
                  </Text>
                  {run.cellsClaimed && (
                    <Text style={styles.runCells}>
                      {run.cellsClaimed.length} células
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            title="SAIR DA CONTA"
            onPress={handleLogout}
            variant="ghost"
            size="medium"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  runCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runInfo: {
    flex: 1,
  },
  runDistance: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  runDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  runStats: {
    alignItems: 'flex-end',
  },
  runDuration: {
    fontSize: 14,
    color: COLORS.text,
  },
  runCells: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
});
