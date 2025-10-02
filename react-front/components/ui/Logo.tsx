import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
  onPress?: () => void;
}

export function Logo({ size = 'medium', style, onPress }: LogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'large':
        return { width: 300, height: 300 };
      default:
        return { width: 160, height: 107 };
    }
  };

  const LogoContent = (
    <Image
      source={require('@/assets/icon/Logo.png')}
      style={[styles.logo, getSize()]}
      resizeMode="contain"
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        {LogoContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {LogoContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    backgroundColor: '#0E121B',
    borderRadius: 1000,
    // Tamanho padrão será definido dinamicamente
  },
}); 