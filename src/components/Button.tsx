import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const backgroundColor = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    danger: COLORS.danger,
    ghost: 'transparent',
  }[variant];

  const textColor = variant === 'ghost' ? COLORS.primary : COLORS.text;

  const paddingVertical = {
    small: 8,
    medium: 14,
    large: 18,
  }[size];

  const fontSize = {
    small: 14,
    medium: 16,
    large: 18,
  }[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          paddingVertical,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: COLORS.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
  },
});
