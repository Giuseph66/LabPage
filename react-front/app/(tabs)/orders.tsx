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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipos de pedidos
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requester: string;
  items: number;
  totalValue: number;
  requestDate: string;
  estimatedDelivery: string;
  description: string;
  category: string;
}

// Dados mockados para demonstração
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    status: 'pending',
    priority: 'high',
    requester: 'João Silva',
    items: 8,
    totalValue: 1250.50,
    requestDate: '2024-01-15',
    estimatedDelivery: '2024-01-25',
    description: 'Sensores DHT22, LEDs RGB, resistores 220Ω',
    category: 'Sensores',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    status: 'approved',
    priority: 'medium',
    requester: 'Maria Santos',
    items: 12,
    totalValue: 890.00,
    requestDate: '2024-01-12',
    estimatedDelivery: '2024-01-22',
    description: 'Arduino Uno R3, breadboards, jumpers',
    category: 'Microcontroladores',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    status: 'completed',
    priority: 'urgent',
    requester: 'Carlos Lima',
    items: 5,
    totalValue: 2100.00,
    requestDate: '2024-01-10',
    estimatedDelivery: '2024-01-20',
    description: 'ESP32 DevKit, módulos WiFi, antenas',
    category: 'IoT',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    status: 'rejected',
    priority: 'low',
    requester: 'Ana Costa',
    items: 3,
    totalValue: 450.00,
    requestDate: '2024-01-08',
    estimatedDelivery: '2024-01-18',
    description: 'Motores DC, rodas, chassi',
    category: 'Robótica',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    status: 'pending',
    priority: 'high',
    requester: 'Pedro Alves',
    items: 15,
    totalValue: 3200.00,
    requestDate: '2024-01-14',
    estimatedDelivery: '2024-01-24',
    description: 'Servomotores, controladores, baterias',
    category: 'Robótica',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    status: 'approved',
    priority: 'medium',
    requester: 'Lucia Ferreira',
    items: 6,
    totalValue: 750.00,
    requestDate: '2024-01-13',
    estimatedDelivery: '2024-01-23',
    description: 'Capacitores, diodos, transistores',
    category: 'Eletrônicos',
  },
];

const categories = ['Todos', 'Sensores', 'Microcontroladores', 'IoT', 'Robótica', 'Eletrônicos'];
const statusOptions = ['Todos', 'Pendente', 'Aprovado', 'Rejeitado', 'Concluído', 'Cancelado'];
const priorityOptions = ['Todos', 'Baixa', 'Média', 'Alta', 'Urgente'];

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedPriority, setSelectedPriority] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [notifications, setNotifications] = useState(3);
  
  // Estados para os comboboxes
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Filtrar pedidos
  React.useEffect(() => {
    let filtered = mockOrders;
    
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(order => order.category === selectedCategory);
    }
    
    if (selectedStatus !== 'Todos') {
      const statusMap = {
        'Pendente': 'pending',
        'Aprovado': 'approved',
        'Rejeitado': 'rejected',
        'Concluído': 'completed',
        'Cancelado': 'cancelled'
      };
      const statusValue = statusMap[selectedStatus as keyof typeof statusMap];
      filtered = filtered.filter(order => order.status === statusValue);
    }

    if (selectedPriority !== 'Todos') {
      const priorityMap = {
        'Baixa': 'low',
        'Média': 'medium',
        'Alta': 'high',
        'Urgente': 'urgent'
      };
      const priorityValue = priorityMap[selectedPriority as keyof typeof priorityMap];
      filtered = filtered.filter(order => order.priority === priorityValue);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  }, [selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B'; // Amarelo
      case 'approved': return '#22C55E'; // Verde
      case 'rejected': return '#EF4444'; // Vermelho
      case 'completed': return '#00E5FF'; // Ciano
      case 'cancelled': return '#6B7280'; // Cinza
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#22C55E'; // Verde
      case 'medium': return '#F59E0B'; // Amarelo
      case 'high': return '#F97316'; // Laranja
      case 'urgent': return '#EF4444'; // Vermelho
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE';
      case 'approved': return 'APROVADO';
      case 'rejected': return 'REJEITADO';
      case 'completed': return 'CONCLUÍDO';
      case 'cancelled': return 'CANCELADO';
      default: return 'DESCONHECIDO';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'BAIXA';
      case 'medium': return 'MÉDIA';
      case 'high': return 'ALTA';
      case 'urgent': return 'URGENTE';
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
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>R$ {item.totalValue.toFixed(2)}</Text>
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
    const total = mockOrders.length;
    const pending = mockOrders.filter(o => o.status === 'pending').length;
    const approved = mockOrders.filter(o => o.status === 'approved').length;
    const totalValue = mockOrders.reduce((sum, o) => sum + o.totalValue, 0);
    
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
                {user?.name?.charAt(0) || 'U'}
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

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />

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
}); 