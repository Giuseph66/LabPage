import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalStyles } from '@/styles/GlobalStyles';

interface ComponentCardProps {
  component: {
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    location: string;
    lastUsed: string;
    status: 'available' | 'low' | 'critical';
    description: string;
  };
  onPress?: () => void;
}

export function ComponentCard({ component, onPress }: ComponentCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'low': return colors.warning;
      case 'critical': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Em dia';
      case 'low': return 'Baixo';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  const getStockPercentage = () => {
    return Math.min((component.stock / component.minStock) * 100, 100);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        GlobalStyles.shadow
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <ThemedText style={styles.cardTitle}>{component.name}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(component.status) }]}>
            <Text style={styles.statusText}>{getStatusText(component.status)}</Text>
          </View>
        </View>
        <Text style={[styles.categoryChip, { color: colors.accentPrimary }]}>{component.category}</Text>
      </View>
      
      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{component.description}</Text>
        
        {/* Stock Progress Bar */}
        <View style={styles.stockContainer}>
          <View style={styles.stockHeader}>
            <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Estoque</Text>
            <Text style={[styles.stockValue, { color: colors.textPrimary }]}>
              {component.stock}/{component.minStock}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStatusColor(component.status),
                  width: `${getStockPercentage()}%`
                }
              ]} 
            />
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Local</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{component.location}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Último uso</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {new Date(component.lastUsed).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChip: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    gap: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  stockContainer: {
    gap: 8,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 