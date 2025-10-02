import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface IndustrialHeaderProps {
  title: string;
  subtitle?: string;
  showIndustrialElements?: boolean;
}

export function IndustrialHeader({ title, subtitle, showIndustrialElements = true }: IndustrialHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <View style={styles.container}>
      {showIndustrialElements && (
        <View style={styles.industrialElements}>
          <View style={[styles.gear, { borderColor: colors.accentSecondary }]}>
            <Text style={[styles.gearText, { color: colors.accentSecondary }]}>⚙</Text>
          </View>
          <View style={[styles.line, { backgroundColor: colors.accentSecondary }]} />
          <View style={[styles.gear, { borderColor: colors.accentSecondary }]}>
            <Text style={[styles.gearText, { color: colors.accentSecondary }]}>⚙</Text>
          </View>
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
      
      {showIndustrialElements && (
        <View style={styles.bottomElements}>
          <View style={[styles.bolt, { backgroundColor: colors.accentSecondary }]}>
            <Text style={styles.boltText}>⚡</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: colors.accentSecondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.accentSecondary }]} />
          <View style={[styles.bolt, { backgroundColor: colors.accentSecondary }]}>
            <Text style={styles.boltText}>⚡</Text>
          </View>
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
  industrialElements: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  gear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearText: {
    fontSize: 12,
  },
  line: {
    height: 2,
    flex: 1,
    borderRadius: 1,
  },
  content: {
    marginBottom: 12,
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
    gap: 8,
  },
  bolt: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boltText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
}); 