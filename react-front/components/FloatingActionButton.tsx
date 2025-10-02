import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  label?: string;
}

export function FloatingActionButton({ onPress, icon = '+', label = '' }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.accentPrimary,
          shadowColor: colors.accentPrimary,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fabContent}>
        <Text style={styles.fabIcon}>{icon}</Text>
        {label && <Text style={styles.fabLabel}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0, 229, 255, 0.3)',
      },
      default: {
        elevation: 8,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
  },
}); 