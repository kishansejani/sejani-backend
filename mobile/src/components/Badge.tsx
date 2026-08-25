import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'accent':
        return { bg: Colors.accentLight, text: Colors.accentDark };
      case 'success':
        return { bg: Colors.successLight, text: Colors.success };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning };
      case 'danger':
        return { bg: Colors.dangerLight, text: Colors.danger };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info };
      case 'neutral':
        return { bg: Colors.surfaceSecondary, text: Colors.textSecondary };
      case 'primary':
      default:
        return { bg: Colors.primarySoft, text: Colors.primary };
    }
  };

  const colors = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
