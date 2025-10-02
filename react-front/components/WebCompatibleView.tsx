import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

interface WebCompatibleViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  [key: string]: any;
}

export function WebCompatibleView({ children, style, ...props }: WebCompatibleViewProps) {
  return (
    <View 
      style={[
        styles.container,
        style,
        Platform.OS === 'web' && styles.webContainer
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Estilos base
  },
  webContainer: {
    // Estilos específicos para web
    cursor: 'default',
  },
}); 