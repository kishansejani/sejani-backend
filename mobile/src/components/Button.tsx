import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'danger' | 'ghost' | 'success';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          btn: { backgroundColor: Colors.accentDark },
          txt: { color: '#FFFFFF' },
        };
      case 'success':
        return {
          btn: { backgroundColor: '#059669' },
          txt: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          btn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
          txt: { color: Colors.primary },
        };
      case 'danger':
        return {
          btn: { backgroundColor: Colors.danger },
          txt: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          btn: { backgroundColor: 'transparent' },
          txt: { color: Colors.primary },
        };
      case 'primary':
      default:
        return {
          btn: { backgroundColor: Colors.primary },
          txt: { color: '#FFFFFF' },
        };
    }
  };

  const st = getStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        st.btn,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={st.txt.color} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
          <Text style={[styles.text, st.txt, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
});
