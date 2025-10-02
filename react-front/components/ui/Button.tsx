import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const isDisabled = disabled || loading;
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.accentPrimary };
      case 'secondary':
        return { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.accentPrimary, borderWidth: 1 };
      default:
        return { backgroundColor: colors.accentPrimary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#000000';
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.accentPrimary;
      default:
        return '#000000';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        getButtonStyle(),
        isDisabled && styles.disabled,
        style
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size="small" 
        />
      ) : (
        <Text style={[
          styles.text,
          styles[`${size}Text`],
          { color: getTextColor() },
          isDisabled && styles.disabledText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
}); 