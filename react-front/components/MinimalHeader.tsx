import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface MinimalHeaderProps {
  title: string;
  subtitle?: string;
  showMinimalElements?: boolean;
}

export function MinimalHeader({ title, subtitle, showMinimalElements = true }: MinimalHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.container}>
      {showMinimalElements && (
        <View style={styles.minimalElements}>
          <Text style={[styles.bracket, { color: '#00E5FF' }]}>[</Text>
          <View style={[styles.line, { backgroundColor: '#00E5FF' }]} />
          <Text style={[styles.bracket, { color: '#00E5FF' }]}>]</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showMinimalElements && (
        <View style={styles.bottomElements}>
          <View style={[styles.dot, { backgroundColor: '#00E5FF' }]} />
          <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.dot, { backgroundColor: '#00E5FF' }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalElements: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bracket: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  bottomElements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
}); 