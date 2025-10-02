import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalStyles } from '@/styles/GlobalStyles';

interface ComponentCardProps {
  component: {
    id: string;
    partNumber: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    manufacturer?: string;
    packageType?: string;
    currentStock: number;
    minimumStock: number;
    storageLocation?: string;
    status: 'active' | 'inactive' | 'obsolete';
    datasheet?: string;
    rohs?: boolean;
    reach?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onPress?: () => void;
}

export function ComponentCard({ component, onPress }: ComponentCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getStockStatus = () => {
    if (component.currentStock === undefined || component.minimumStock === undefined) {
      return { status: 'unknown', color: colors.textSecondary, text: 'Desconhecido' };
    }
    
    if (component.currentStock === 0) {
      return { status: 'critical', color: colors.error, text: 'Crítico' };
    }
    
    if (component.currentStock <= component.minimumStock) {
      return { status: 'low', color: colors.warning, text: 'Baixo' };
    }
    
    return { status: 'available', color: colors.success, text: 'Em dia' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.warning;
      case 'obsolete': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'obsolete': return 'Obsoleto';
      default: return 'Desconhecido';
    }
  };

  const getStockPercentage = () => {
    if (component.currentStock === undefined || component.minimumStock === undefined || component.minimumStock === 0) {
      return 0;
    }
    return Math.min((component.currentStock / component.minimumStock) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
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
          <View style={styles.titleContainer}>
            <ThemedText style={styles.cardTitle}>{component.name || 'Nome não disponível'}</ThemedText>
            {component.partNumber && (
              <Text style={[styles.partNumber, { color: colors.textSecondary }]}>
                {component.partNumber}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(component.status) }]}>
            <Text style={styles.statusText}>{getStatusText(component.status)}</Text>
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={[styles.categoryChip, { color: colors.accentPrimary }]}>
            {component.category || 'Sem categoria'}
          </Text>
          {component.subcategory && (
            <Text style={[styles.subcategoryChip, { color: colors.textSecondary }]}>
              • {component.subcategory}
            </Text>
          )}
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {component.description || 'Sem descrição disponível'}
        </Text>
        
        {/* Stock Progress Bar */}
        <View style={styles.stockContainer}>
          <View style={styles.stockHeader}>
            <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Estoque</Text>
            <Text style={[styles.stockValue, { color: colors.textPrimary }]}>
              {component.currentStock || 0}/{component.minimumStock || 0}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStockStatus().color,
                  width: `${getStockPercentage()}%`
                }
              ]} 
            />
          </View>
          <View style={styles.stockStatusContainer}>
            <View style={[styles.stockStatusBadge, { backgroundColor: getStockStatus().color }]}>
              <Text style={styles.stockStatusText}>{getStockStatus().text}</Text>
            </View>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Local</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {component.storageLocation || 'Não informado'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fabricante</Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {component.manufacturer || 'Não informado'}
            </Text>
          </View>
        </View>

        {/* Compliance */}
        {(component.rohs || component.reach) && (
          <View style={styles.complianceContainer}>
            <Text style={[styles.complianceLabel, { color: colors.textSecondary }]}>Conformidade:</Text>
            <View style={styles.complianceBadges}>
              {component.rohs && (
                <View style={[styles.complianceBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.complianceText, { color: colors.success }]}>RoHS</Text>
                </View>
              )}
              {component.reach && (
                <View style={[styles.complianceBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.complianceText, { color: colors.success }]}>REACH</Text>
                </View>
              )}
            </View>
          </View>
        )}
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  partNumber: {
    fontSize: 12,
    marginTop: 2,
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    fontSize: 12,
    fontWeight: '500',
  },
  subcategoryChip: {
    fontSize: 11,
    marginLeft: 4,
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
  stockStatusContainer: {
    alignItems: 'flex-start',
  },
  stockStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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
  complianceContainer: {
    gap: 6,
  },
  complianceLabel: {
    fontSize: 12,
  },
  complianceBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  complianceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '600',
  },
}); 