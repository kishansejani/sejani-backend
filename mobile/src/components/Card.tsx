import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'gold' | 'glass' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const cardStyle = [
    styles.base,
    variant === 'gold' && styles.goldCard,
    variant === 'glass' && styles.glassCard,
    variant === 'dark' && styles.darkCard,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  goldCard: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.borderGold,
    borderWidth: 1.5,
    shadowColor: Colors.accentDark,
    shadowOpacity: 0.12,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  darkCard: {
    backgroundColor: Colors.darkSurface,
    borderColor: '#334155',
  },
});
