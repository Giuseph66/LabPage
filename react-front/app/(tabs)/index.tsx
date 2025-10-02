import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '@/components/ui/FilterChip';
import { KPICard } from '@/components/ui/KPICard';
import { Logo } from '@/components/ui/Logo';
import { QuickActionCard } from '@/components/ui/QuickActionCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Dados mockados
const mockKPIs = [
  {
    id: '1',
    title: 'Reservas hoje',
    value: '8',
    subtitle: 'próximas / 12 total',
    icon: 'calendar' as const,
    color: '#00E5FF',
    trend: 'up' as const,
    trendValue: '+2',
  },
  {
    id: '2',
    title: 'Pedidos pendentes',
    value: '15',
    subtitle: '3 atrasados',
    icon: 'document-text' as const,
    color: '#F59E0B',
    trend: 'down' as const,
    trendValue: '-3',
  },
  {
    id: '3',
    title: 'Alertas críticos',
    value: '2',
    subtitle: 'manutenção',
    icon: 'warning' as const,
    color: '#EF4444',
  },
  {
    id: '4',
    title: 'Baixo estoque',
    value: '7',
    subtitle: 'itens < mínimo',
    icon: 'cube' as const,
    color: '#FF7A1A',
  },
];

const mockQuickActions = [
  {
    id: '1',
    title: 'Nova Reserva',
    subtitle: 'Agendar equipamento',
    icon: 'calendar-outline' as const,
    color: '#00E5FF',
  },
  {
    id: '2',
    title: 'Novo Pedido',
    subtitle: 'Solicitar componentes',
    icon: 'cart-outline' as const,
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'Estoque',
    subtitle: 'Check-in/Check-out',
    icon: 'cube-outline' as const,
    color: '#22C55E',
  },
  {
    id: '4',
    title: 'Novo Projeto',
    subtitle: 'Criar projeto',
    icon: 'folder-outline' as const,
    color: '#8B5CF6',
  },
  {
    id: '5',
    title: 'Scanner',
    subtitle: 'QR/NFC',
    icon: 'scan-outline' as const,
    color: '#FF7A1A',
  },
  {
    id: '6',
    title: 'Relatórios',
    subtitle: 'Visualizar dados',
    icon: 'bar-chart-outline' as const,
    color: '#06B6D4',
  },
];

const mockFilters = [
  { id: '1', label: 'Reservas', badge: '8' },
  { id: '2', label: 'Pedidos', badge: '15' },
  { id: '3', label: 'Estoque', badge: '7' },
  { id: '4', label: 'Projetos', badge: '12' },
  { id: '5', label: 'Alertas', badge: '2' },
];

const mockRecentReservations = [
  {
    id: '1',
    time: '14:00',
    room: 'Lab A',
    equipment: 'Osciloscópio',
    responsible: 'João Silva',
  },
  {
    id: '2',
    time: '16:30',
    room: 'Lab B',
    equipment: 'Multímetro',
    responsible: 'Maria Santos',
  },
  {
    id: '3',
    time: '18:00',
    room: 'Lab C',
    equipment: 'Fonte de Alimentação',
    responsible: 'Carlos Lima',
  },
];

const mockRecentOrders = [
  {
    id: '1',
    requester: 'Ana Costa',
    item: 'Resistores 220Ω',
    status: 'Pendente',
    statusColor: '#F59E0B',
  },
  {
    id: '2',
    requester: 'Pedro Alves',
    item: 'LEDs RGB',
    status: 'Aprovado',
    statusColor: '#22C55E',
  },
  {
    id: '3',
    requester: 'Lucia Ferreira',
    item: 'Capacitores 100µF',
    status: 'Rejeitado',
    statusColor: '#EF4444',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, signOut } = useAuth();
  
  const [selectedFilter, setSelectedFilter] = useState('Reservas');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleQuickAction = (action: any) => {
    switch (action.title) {
      case 'Nova Reserva':
        Alert.alert('Nova Reserva', 'Funcionalidade em desenvolvimento');
        break;
      case 'Novo Pedido':
        Alert.alert('Novo Pedido', 'Funcionalidade em desenvolvimento');
        break;
      case 'Estoque':
        Alert.alert('Estoque', 'Funcionalidade em desenvolvimento');
        break;
      case 'Novo Projeto':
        Alert.alert('Novo Projeto', 'Funcionalidade em desenvolvimento');
        break;
      case 'Scanner':
        Alert.alert('Scanner', 'Funcionalidade em desenvolvimento');
        break;
      case 'Relatórios':
        Alert.alert('Relatórios', 'Funcionalidade em desenvolvimento');
        break;
      default:
        Alert.alert('Funcionalidade em desenvolvimento');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>LabPage</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/extra/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {notifications > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.notificationText}>{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/extra/profile')}>
            <View style={[styles.avatar, { backgroundColor: colors.accentPrimary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text style={[styles.statusText, { color: colors.success }]}>
          Online • Sincronizado
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchText, { color: colors.textPrimary }]}
              placeholder="Buscar reservas, pedidos, projetos..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {mockFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              selected={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}
              badge={filter.badge}
            />
          ))}
        </ScrollView>

        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Resumo do Dia
          </Text>
          <View style={styles.kpiGrid}>
            {mockKPIs.map((kpi) => (
              <View key={kpi.id} style={styles.kpiCardContainer}>
                <KPICard
                  title={kpi.title}
                  value={kpi.value}
                  subtitle={kpi.subtitle}
                  icon={kpi.icon}
                  color={kpi.color}
                  trend={kpi.trend}
                  trendValue={kpi.trendValue}
                  onPress={() => Alert.alert(kpi.title, 'Detalhes em desenvolvimento')}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Acesso Rápido
          </Text>
          <View style={styles.quickActionsGrid}>
            {mockQuickActions.map((action) => (
              <View key={action.id} style={styles.quickActionCardContainer}>
                <QuickActionCard
                  title={action.title}
                  subtitle={action.subtitle}
                  icon={action.icon}
                  color={action.color}
                  onPress={() => handleQuickAction(action)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Reservations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Próximas Reservas
            </Text>
            <TouchableOpacity onPress={() => Alert.alert('Reservas', 'Funcionalidade em desenvolvimento')}>
              <Text style={[styles.seeAllText, { color: colors.accentPrimary }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {mockRecentReservations.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                style={styles.listItem}
                onPress={() => Alert.alert('Reserva', `${reservation.equipment} - ${reservation.room}`)}
              >
                <View style={styles.listItemLeft}>
                  <Text style={[styles.listItemTime, { color: colors.accentPrimary }]}>
                    {reservation.time}
                  </Text>
                  <View>
                    <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
                      {reservation.equipment}
                    </Text>
                    <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>
                      {reservation.room} • {reservation.responsible}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Pedidos Recentes
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
              <Text style={[styles.seeAllText, { color: colors.accentPrimary }]}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {mockRecentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.listItem}
                onPress={() => Alert.alert('Pedido', `${order.item} - ${order.requester}`)}
              >
                <View style={styles.listItemLeft}>
                  <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>
                    {order.item}
                  </Text>
                  <Text style={[styles.listItemSubtitle, { color: colors.textSecondary }]}>
                    {order.requester}
                  </Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: order.statusColor + '20' }]}>
                  <Text style={[styles.statusChipText, { color: order.statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersContent: {
    gap: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listItemTime: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  kpiCardContainer: {
    flex: 1,
    minWidth: '48%',
  },
  quickActionCardContainer: {
    flex: 1,
    minWidth: '48%',
  },
}); 