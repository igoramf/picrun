import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatBox } from '../../src/components/StatBox';
import { COLORS } from '../../src/constants';

export default function ProfileScreen() {
  // Mock data - depois vem do backend/auth
  const user = {
    name: 'Corredor',
    city: 'São Paulo',
    totalCells: 47,
    totalDistance: 23500,
    totalRuns: 12,
    rank: 12,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.city}>{user.city}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <StatBox label="Células" value={user.totalCells.toString()} size="large" />
          </View>
          <View style={styles.statCard}>
            <StatBox label="Rank" value={`#${user.rank}`} size="large" />
          </View>
          <View style={styles.statCard}>
            <StatBox
              label="Distância"
              value={(user.totalDistance / 1000).toFixed(1)}
              unit="km"
              size="large"
            />
          </View>
          <View style={styles.statCard}>
            <StatBox label="Corridas" value={user.totalRuns.toString()} size="large" />
          </View>
        </View>

        {/* Histórico placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Suas corridas aparecerão aqui</Text>
          </View>
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
  city: {
    fontSize: 16,
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
});
