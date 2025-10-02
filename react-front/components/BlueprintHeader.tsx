import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface BlueprintHeaderProps {
  title: string;
  subtitle?: string;
  showBlueprintLines?: boolean;
}

export function BlueprintHeader({ title, subtitle, showBlueprintLines = true }: BlueprintHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.container}>
      {showBlueprintLines && (
        <View style={styles.blueprintLines}>
          <View style={[styles.line, { backgroundColor: colors.accentPrimary }]} />
          <View style={[styles.line, { backgroundColor: colors.accentSecondary }]} />
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
      
      {showBlueprintLines && (
        <View style={styles.bottomLines}>
          <View style={[styles.dot, { backgroundColor: colors.accentPrimary }]} />
          <View style={[styles.dot, { backgroundColor: colors.accentSecondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.accentPrimary }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  blueprintLines: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  line: {
    height: 2,
    flex: 1,
    borderRadius: 1,
  },
  content: {
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
  bottomLines: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
}); 