import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemedText } from '@/components/ThemedText';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipos de pedidos (ajustados para dados reais da API)
interface Order {
  id: string;
  orderNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'quotation' | 'purchase' | 'transport' | 'received' | 'completed' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requester: string;
  department: string;
  desiredDate: string;
  orderType: 'external_purchase' | 'stock_withdrawal' | 'lab_transfer';
  purchaseMode: 'multiple_quotation' | 'single_supplier' | 'internal_stock';
  subtotal: number;
  total: number;
  currency: 'BRL' | 'USD' | 'EUR';
  createdAt: string;
  updatedAt: string;
  category: string;
  description: string;
  items: number;
  totalValue: number;
  requestDate: string;
  estimatedDelivery: string;
}

import { API_BASE_URL } from '@/env';

// Estado inicial vazio
const initialOrders: Order[] = [];

const categories = ['Todos', 'Resistores', 'Capacitores', 'Microcontroladores', 'Sensores', 'LEDs', 'Ferramentas', 'Motores', 'Conectores', 'Baterias', 'Displays', 'ICs', 'Transistores', 'Indutores'];
const statusOptions = ['Todos', 'Rascunho', 'Pendente', 'Aprovado', 'Cotação', 'Compra', 'Transporte', 'Recebido', 'Concluído', 'Rejeitado', 'Cancelado'];
const priorityOptions = ['Todos', 'Baixa', 'Média', 'Alta', 'Crítica'];

// Função para buscar pedidos da API
const fetchOrders = async (): Promise<Order[]> => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const savedToken = await AsyncStorage.getItem('@LabPage:token');

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: {
        'Content-Type': 'application/json',
        ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar pedidos');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id?.toString(),
      orderNumber: item.data?.orderNumber || item.orderNumber,
      status: item.data?.status || item.status,
      priority: item.data?.priority || item.priority,
      requester: item.data?.requester || item.requester,
      department: item.data?.department || item.department,
      desiredDate: item.data?.desiredDate || item.desiredDate,
      orderType: item.data?.orderType || item.orderType,
      purchaseMode: item.data?.purchaseMode || item.purchaseMode,
      subtotal: item.data?.subtotal || item.subtotal || 0,
      total: item.data?.total || item.total || 0,
      currency: item.data?.currency || item.currency,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      // Campos adicionais para compatibilidade com a interface
      category: item.data?.category || 'Geral',
      description: item.data?.description || 'Pedido de componentes',
      items: item.data?.items?.length || 0,
      totalValue: item.data?.total || item.total || 0,
      requestDate: item.data?.desiredDate || item.desiredDate || item.createdAt,
      estimatedDelivery: item.data?.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedPriority, setSelectedPriority] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);

  // Estados para os comboboxes
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Carregar pedidos ao montar o componente
  React.useEffect(() => {
    loadOrders();
  }, []);

  // Filtrar pedidos quando os filtros mudam
  React.useEffect(() => {
    filterOrders();
  }, [orders, selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError('Erro ao carregar pedidos');
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(order => {
        if (!order.category) return false;
        return order.category.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // Filtro por status
    if (selectedStatus !== 'Todos') {
      filtered = filtered.filter(order => {
        const orderStatus = order.status;
        if (!orderStatus) return false;
        
        // Mapear status em português para status em inglês
        const statusMap: { [key: string]: string } = {
          'Rascunho': 'draft',
          'Pendente': 'pending',
          'Aprovado': 'approved',
          'Cotação': 'quotation',
          'Compra': 'purchase',
          'Transporte': 'transport',
          'Recebido': 'received',
          'Concluído': 'completed',
          'Rejeitado': 'rejected',
          'Cancelado': 'cancelled'
        };
        
        return orderStatus === statusMap[selectedStatus];
      });
    }

    // Filtro por prioridade
    if (selectedPriority !== 'Todos') {
      filtered = filtered.filter(order => {
        const orderPriority = order.priority;
        if (!orderPriority) return false;
        
        // Mapear prioridade em português para prioridade em inglês
        const priorityMap: { [key: string]: string } = {
          'Baixa': 'low',
          'Média': 'medium',
          'Alta': 'high',
          'Crítica': 'critical'
        };
        
        return orderPriority === priorityMap[selectedPriority];
      });
    }

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(order =>
        (order.orderNumber && order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.requester && order.requester.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.department && order.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.description && order.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6B7280'; // Cinza
      case 'pending': return '#F59E0B'; // Amarelo
      case 'approved': return '#22C55E'; // Verde
      case 'quotation': return '#3B82F6'; // Azul
      case 'purchase': return '#8B5CF6'; // Roxo
      case 'transport': return '#F97316'; // Laranja
      case 'received': return '#10B981'; // Verde escuro
      case 'completed': return '#059669'; // Verde mais escuro
      case 'rejected': return '#EF4444'; // Vermelho
      case 'cancelled': return '#6B7280'; // Cinza
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#22C55E'; // Verde
      case 'medium': return '#F59E0B'; // Amarelo
      case 'high': return '#F97316'; // Laranja
      case 'critical': return '#EF4444'; // Vermelho
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'RASCUNHO';
      case 'pending': return 'PENDENTE';
      case 'approved': return 'APROVADO';
      case 'quotation': return 'COTAÇÃO';
      case 'purchase': return 'COMPRA';
      case 'transport': return 'TRANSPORTE';
      case 'received': return 'RECEBIDO';
      case 'completed': return 'CONCLUÍDO';
      case 'rejected': return 'REJEITADO';
      case 'cancelled': return 'CANCELADO';
      default: return 'DESCONHECIDO';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'BAIXA';
      case 'medium': return 'MÉDIA';
      case 'high': return 'ALTA';
      case 'critical': return 'CRÍTICA';
      default: return 'DESCONHECIDA';
    }
  };

  const handleOrderPress = (order: Order) => {
    console.log('Pedido selecionado:', order.orderNumber);
  };

  const handleAddOrder = () => {
    router.push('/extra/componentes/order-form');
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleOrderPress(item)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <ThemedText style={styles.orderNumber}>{item.orderNumber}</ThemedText>
          <Text style={[styles.categoryTag, { color: '#00E5FF' }]}>{item.category}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{getPriorityText(item.priority)}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>

      {/* Requester */}
      <View style={styles.requesterContainer}>
        <Text style={[styles.requesterLabel, { color: colors.textSecondary }]}>Solicitante:</Text>
        <Text style={[styles.requesterName, { color: colors.textPrimary }]}>{item.requester}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{item.items}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Itens</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>R$ {(item.totalValue || 0).toFixed(2)}</Text>
          <Text style={[styles.statLabel2, { color: colors.textSecondary }]}>Valor</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {new Date(item.requestDate).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Solicitado</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {new Date(item.estimatedDelivery).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Entrega</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStats = () => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === 'pending').length;
    const approved = filteredOrders.filter(o => o.status === 'approved').length;
    const totalValue = filteredOrders.reduce((sum, o) => sum + o.total, 0);

    return { total, pending, approved, totalValue };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Pedidos</Text>
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

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: '#22C55E' }]}>{stats.approved}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aprovados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: '#00E5FF' }]}>R$ {stats.totalValue.toFixed(0)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Valor Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar pedidos..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Categoria Combobox */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Categoria:</Text>
          <TouchableOpacity
            style={[styles.combobox, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.comboboxText, { color: colors.textPrimary }]}>
              {selectedCategory}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Status Combobox */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status:</Text>
          <TouchableOpacity
            style={[styles.combobox, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowStatusModal(true)}
          >
            <Text style={[styles.comboboxText, { color: colors.textPrimary }]}>
              {selectedStatus}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Prioridade Combobox */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Prioridade:</Text>
          <TouchableOpacity
            style={[styles.combobox, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowPriorityModal(true)}
          >
            <Text style={[styles.comboboxText, { color: colors.textPrimary }]}>
              {selectedPriority}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading/Error State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando pedidos...
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
            onPress={loadOrders}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
              colors={[colors.accentPrimary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhum pedido encontrado
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onPress={handleAddOrder}
        icon="+"
      />
      
      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: selectedCategory === item ? colors.accentPrimary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedCategory === item ? colors.accentPrimary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {selectedCategory === item && (
                    <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Selecionar Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={statusOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: selectedStatus === item ? colors.accentPrimary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setSelectedStatus(item);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedStatus === item ? colors.accentPrimary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {selectedStatus === item && (
                    <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Selecionar Prioridade</Text>
              <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={priorityOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: selectedPriority === item ? colors.accentPrimary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setSelectedPriority(item);
                    setShowPriorityModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedPriority === item ? colors.accentPrimary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {selectedPriority === item && (
                    <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 0,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 12,
  },
  filtersContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 5,
    marginBottom: 8,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  combobox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    minHeight: 40,
    maxWidth: 150,
    flex: 1,
  },
  comboboxText: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '80%',
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  orderCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  requesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  requesterLabel: {
    fontSize: 12,
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel2: {
    fontSize: 10,
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
  },
  fabText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
  },
}); 