import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface StatBoxProps {
  label: string;
  value: string;
  unit?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatBox({ label, value, unit, size = 'medium' }: StatBoxProps) {
  const valueSize = size === 'large' ? 36 : size === 'medium' ? 28 : 20;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { fontSize: valueSize }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: COLORS.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 2,
  },
});
