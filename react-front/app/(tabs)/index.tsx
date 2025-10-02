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

import { API_BASE_URL } from '@/env';

// Interfaces para dados reais
interface DashboardKPIs {
  reservationsToday: number;
  ordersPending: number;
  alertsCritical: number;
  lowStock: number;
}

interface RecentReservation {
  id: string;
  time: string;
  room: string;
  equipment: string;
  responsible: string;
}

interface RecentOrder {
  id: string;
  requester: string;
  item: string;
  status: string;
  statusColor: string;
}

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  resourceName: string;
  responsible: string;
  purpose: string;
}

interface Order {
  id: string;
  requester: string;
  department: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Component {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
}

// Dados mockados para KPIs (serão substituídos por dados reais)
const mockKPIs = [
  {
    id: '1',
    title: 'Reservas hoje',
    value: '12',
    subtitle: 'próximas / 15 total',
    icon: 'calendar' as const,
    color: '#00E5FF',
    trend: 'up' as const,
    trendValue: '+3',
  },
  {
    id: '2',
    title: 'Pedidos pendentes',
    value: '8',
    subtitle: '2 atrasados',
    icon: 'document-text' as const,
    color: '#F59E0B',
    trend: 'down' as const,
    trendValue: '-2',
  },
  {
    id: '3',
    title: 'Alertas críticos',
    value: '1',
    subtitle: 'manutenção',
    icon: 'warning' as const,
    color: '#EF4444',
  },
  {
    id: '4',
    title: 'Baixo estoque',
    value: '5',
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

// Filtros serão atualizados dinamicamente com os dados reais
const getFilters = (kpis: DashboardKPIs) => [
  { id: '1', label: 'Reservas', badge: kpis.reservationsToday.toString() },
  { id: '2', label: 'Pedidos', badge: kpis.ordersPending.toString() },
  { id: '3', label: 'Estoque', badge: kpis.lowStock.toString() },
  { id: '4', label: 'Projetos', badge: '0' }, // Será implementado quando tivermos endpoint de projetos
  { id: '5', label: 'Alertas', badge: kpis.alertsCritical.toString() },
];

const mockRecentReservations: RecentReservation[] = [
  {
    id: '1',
    time: '14:00',
    room: 'Bancada A',
    equipment: 'Montagem de circuitos IoT',
    responsible: 'Ana Silva',
  },
  {
    id: '2',
    time: '16:30',
    room: 'Lab de Robótica',
    equipment: 'Workshop de programação',
    responsible: 'Maria Santos',
  },
  {
    id: '3',
    time: '18:00',
    room: 'Lab de IoT',
    equipment: 'Desenvolvimento casa inteligente',
    responsible: 'Carlos Lima',
  },
];

const mockRecentOrders: RecentOrder[] = [
  {
    id: '1',
    requester: 'Patricia Rocha',
    item: 'Multímetro Digital',
    status: 'Recebido',
    statusColor: '#10B981',
  },
  {
    id: '2',
    requester: 'Fernando Dias',
    item: 'Resistores 10K',
    status: 'Concluído',
    statusColor: '#059669',
  },
  {
    id: '3',
    requester: 'Gabriela Mendes',
    item: 'IC LM358',
    status: 'Cancelado',
    statusColor: '#6B7280',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, signOut, token } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState('Reservas');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);
  
  // Estados para dados reais
  const [kpis, setKpis] = useState<DashboardKPIs>({
    reservationsToday: 0,
    ordersPending: 0,
    alertsCritical: 0,
    lowStock: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  // Carregar dados iniciais
  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados de todas as APIs
      const [reservationsResponse, ordersResponse, componentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reservations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/api/components`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      const [reservations, orders, components] = await Promise.all([
        reservationsResponse.ok ? reservationsResponse.json() : [],
        ordersResponse.ok ? ordersResponse.json() : [],
        componentsResponse.ok ? componentsResponse.json() : [],
      ]);

      // Calcular KPIs
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Reservas de hoje
      const reservationsToday = reservations.filter((reservation: Reservation) => {
        if (!reservation.date) return false;
        const reservationDate = reservation.date.split('T')[0];
        return reservationDate === today;
      }).length;

      // Pedidos pendentes
      const ordersPending = orders.filter((order: Order) => {
        const status = order.status || 'pending';
        return status === 'pending' || status === 'quotation';
      }).length;

      // Componentes com estoque baixo
      const lowStock = components.filter((component: Component) => {
        if (component.currentStock === undefined || component.minimumStock === undefined) return false;
        return component.currentStock <= component.minimumStock && component.currentStock > 0;
      }).length;

      // Alertas críticos (componentes com estoque zero)
      const alertsCritical = components.filter((component: Component) => {
        if (component.currentStock === undefined) return false;
        return component.currentStock === 0;
      }).length;

      setKpis({
        reservationsToday,
        ordersPending,
        alertsCritical,
        lowStock,
      });

      // Reservas recentes (próximas 3)
      const upcomingReservations = reservations
        .filter((reservation: Reservation) => {
          if (!reservation.date) return false;
          const reservationDate = new Date(reservation.date);
          return reservationDate >= new Date();
        })
        .sort((a: Reservation, b: Reservation) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .slice(0, 3)
        .map((reservation: Reservation) => ({
          id: reservation.id,
          time: reservation.startTime || 'N/A',
          room: reservation.resourceName || 'N/A',
          equipment: reservation.purpose || 'N/A',
          responsible: reservation.responsible || 'N/A',
        }));

      setRecentReservations(upcomingReservations);

      // Pedidos recentes (últimos 3)
      const recentOrdersData = orders
        .filter((order: Order) => order.createdAt) // Filtrar apenas pedidos com data de criação
        .sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3)
        .map((order: Order) => ({
          id: order.id,
          requester: order.requester || 'N/A',
          item: `${order.department || 'Departamento'} - Pedido`,
          status: order.status === 'pending' ? 'Pendente' : 
                 order.status === 'approved' ? 'Aprovado' :
                 order.status === 'completed' ? 'Concluído' : 'Processando',
          statusColor: order.status === 'pending' ? '#F59E0B' :
                      order.status === 'approved' ? '#10B981' :
                      order.status === 'completed' ? '#059669' : '#6B7280',
        }));

      setRecentOrders(recentOrdersData);

    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro ao carregar dados do dashboard:', err);
      
      // Definir valores padrão em caso de erro
      setKpis({
        reservationsToday: 0,
        ordersPending: 0,
        alertsCritical: 0,
        lowStock: 0,
      });
      setRecentReservations([]);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
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
        router.push('/extra/reservas/reservation-form');
        break;
      case 'Novo Pedido':
        router.push('/extra/componentes/order-form');
        break;
      case 'Estoque':
        router.push('/(tabs)/components');
        break;
      case 'Novo Projeto':
        router.push('/extra/project/project-form');
        break;
      case 'Scanner':
        Alert.alert('Scanner', 'Funcionalidade em desenvolvimento');
        break;
      case 'Relatórios':
        router.push('/(admin)/stats');
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
                {user?.nome?.charAt(0) || 'U'}
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
            colors={[colors.accentPrimary]}
          />
        }
      >
        {/* Loading/Error State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando dados do dashboard...
            </Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.accentPrimary }]}
              onPress={loadDashboardData}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!loading && !error && (
        <>
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
          {getFilters(kpis).map((filter) => (
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
            <View style={styles.kpiCardContainer}>
              <KPICard
                title="Reservas hoje"
                value={kpis.reservationsToday.toString()}
                subtitle="agendadas"
                icon="calendar"
                color="#00E5FF"
                onPress={() => router.push('/(tabs)/reservations')}
              />
            </View>
            <View style={styles.kpiCardContainer}>
              <KPICard
                title="Pedidos pendentes"
                value={kpis.ordersPending.toString()}
                subtitle="aguardando"
                icon="document-text"
                color="#F59E0B"
                onPress={() => router.push('/(tabs)/orders')}
              />
            </View>
            <View style={styles.kpiCardContainer}>
              <KPICard
                title="Alertas críticos"
                value={kpis.alertsCritical.toString()}
                subtitle="estoque zero"
                icon="warning"
                color="#EF4444"
                onPress={() => router.push('/(tabs)/components')}
              />
            </View>
            <View style={styles.kpiCardContainer}>
              <KPICard
                title="Baixo estoque"
                value={kpis.lowStock.toString()}
                subtitle="itens críticos"
                icon="cube"
                color="#FF7A1A"
                onPress={() => router.push('/(tabs)/components')}
              />
            </View>
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
            <TouchableOpacity onPress={() => router.push('/(tabs)/reservations')}>
              <Text style={[styles.seeAllText, { color: colors.accentPrimary }]}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <TouchableOpacity
                  key={reservation.id}
                  style={styles.listItem}
                  onPress={() => router.push('/(tabs)/reservations')}
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
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhuma reserva próxima
                </Text>
              </View>
            )}
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
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.listItem}
                  onPress={() => router.push('/(tabs)/orders')}
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
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhum pedido recente
                </Text>
              </View>
            )}
          </View>
        </View>
 
          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </>
    )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 