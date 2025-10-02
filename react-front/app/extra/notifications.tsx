import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// API helper
import { API_BASE_URL } from '@/env';

// Interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reservation' | 'order' | 'project' | 'component' | 'system';
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  actionUrl?: string;
  metadata?: {
    reservationId?: string;
    orderId?: string;
    projectId?: string;
    componentId?: string;
  };
}

// Dados mockados
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Reserva Aprovada',
    message: 'Sua reserva do Laboratório de Eletrônica para amanhã às 14:00 foi aprovada.',
    type: 'reservation',
    status: 'unread',
    priority: 'high',
    timestamp: '2024-01-15T10:30:00Z',
    actionUrl: '/reservations',
    metadata: { reservationId: 'res_001' }
  },
  {
    id: '2',
    title: 'Pedido de Componentes',
    message: 'O pedido #ORD-2024-001 foi processado e está sendo enviado.',
    type: 'order',
    status: 'unread',
    priority: 'medium',
    timestamp: '2024-01-15T09:15:00Z',
    actionUrl: '/orders',
    metadata: { orderId: 'ord_001' }
  },
  {
    id: '3',
    title: 'Projeto Atualizado',
    message: 'O projeto "Sistema de Controle" teve uma atualização importante.',
    type: 'project',
    status: 'read',
    priority: 'low',
    timestamp: '2024-01-14T16:45:00Z',
    actionUrl: '/projects',
    metadata: { projectId: 'proj_001' }
  },
  {
    id: '4',
    title: 'Componente Disponível',
    message: 'O componente Arduino Uno está disponível no estoque.',
    type: 'component',
    status: 'unread',
    priority: 'medium',
    timestamp: '2024-01-14T14:20:00Z',
    actionUrl: '/components',
    metadata: { componentId: 'comp_001' }
  },
  {
    id: '5',
    title: 'Manutenção Programada',
    message: 'O Laboratório de Eletrônica estará em manutenção na próxima semana.',
    type: 'system',
    status: 'read',
    priority: 'urgent',
    timestamp: '2024-01-14T11:00:00Z'
  },
  {
    id: '6',
    title: 'Reserva Cancelada',
    message: 'Sua reserva de hoje foi cancelada devido a manutenção emergencial.',
    type: 'reservation',
    status: 'unread',
    priority: 'urgent',
    timestamp: '2024-01-14T08:30:00Z',
    actionUrl: '/reservations',
    metadata: { reservationId: 'res_002' }
  },
  {
    id: '7',
    title: 'Novo Projeto Criado',
    message: 'O projeto "IoT Dashboard" foi criado com sucesso.',
    type: 'project',
    status: 'read',
    priority: 'low',
    timestamp: '2024-01-13T15:20:00Z',
    actionUrl: '/projects',
    metadata: { projectId: 'proj_002' }
  },
  {
    id: '8',
    title: 'Estoque Baixo',
    message: 'O componente Resistor 10kΩ está com estoque baixo.',
    type: 'component',
    status: 'read',
    priority: 'medium',
    timestamp: '2024-01-13T12:10:00Z',
    actionUrl: '/components',
    metadata: { componentId: 'comp_002' }
  }
];

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Filtros disponíveis
  const statusOptions = [
    { id: 'all', name: 'Todas' },
    { id: 'unread', name: 'Não lidas' },
    { id: 'read', name: 'Lidas' }
  ];

  const typeOptions = [
    { id: 'all', name: 'Todas' },
    { id: 'reservation', name: 'Reservas' },
    { id: 'order', name: 'Pedidos' },
    { id: 'project', name: 'Projetos' },
    { id: 'component', name: 'Componentes' },
    { id: 'system', name: 'Sistema' }
  ];

  const priorityOptions = [
    { id: 'all', name: 'Todas' },
    { id: 'urgent', name: 'Urgente' },
    { id: 'high', name: 'Alta' },
    { id: 'medium', name: 'Média' },
    { id: 'low', name: 'Baixa' }
  ];

  // Aplicar filtros
  useEffect(() => {
    let filtered = notifications;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(notification => notification.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(notification => notification.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === selectedPriority);
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedStatus, selectedType, selectedPriority]);

  // Marcar como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'read' as const }
          : notification
      )
  );
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    Alert.alert(
      'Marcar como lidas',
      'Deseja marcar todas as notificações como lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setNotifications(prev => 
              prev.map(notification => ({ ...notification, status: 'read' as const }))
            );
          }
        }
      ]
    );
  };

  // Excluir notificação
  const deleteNotification = (id: string) => {
    Alert.alert(
      'Excluir notificação',
      'Deseja excluir esta notificação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
          }
        }
      ]
    );
  };

  // Excluir todas as notificações
  const deleteAllNotifications = () => {
    Alert.alert(
      'Excluir todas',
      'Deseja excluir todas as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir todas',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
          }
        }
      ]
    );
  };

  // Navegar para ação
  const handleNotificationPress = (notification: Notification) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  };

  // Buscar notificações do backend
  async function fetchNotifications() {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('@LabPage:token');
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
      });
      if (!res.ok) {
        throw new Error('Falha ao carregar notificações');
      }
      const data = await res.json();
      // Normaliza para o tipo local
      const mapped: Notification[] = (data || []).map((n: any) => ({
        id: String(n.id),
        title: n.title || 'Notificação',
        message: n.message || '',
        type: (n.type || 'system'),
        status: n.read === false ? 'unread' : 'read',
        priority: 'medium',
        timestamp: n.createdAt || new Date().toISOString(),
      }));
      setNotifications(mapped);
    } catch (e) {
      // Mantém silencioso; pode exibir toast se desejar
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Obter ícone por tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reservation': return 'calendar';
      case 'order': return 'cart';
      case 'project': return 'folder';
      case 'component': return 'cube';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  // Obter cor por prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.accentPrimary;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  // Formatar data
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Agora';
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Renderizar item da notificação
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: item.status === 'read' ? 0.7 : 1
        }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={getTypeIcon(item.type) as any} 
            size={20} 
            color={colors.accentPrimary} 
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            {item.status === 'unread' && (
              <View style={[styles.unreadDot, { backgroundColor: colors.accentPrimary }]} />
            )}
          </View>
          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
          <View style={styles.notificationMeta}>
            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority === 'urgent' ? 'Urgente' : 
                 item.priority === 'high' ? 'Alta' :
                 item.priority === 'medium' ? 'Média' : 'Baixa'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Renderizar filtro
  const renderFilter = (title: string, value: string, options: any[], onPress: () => void) => (
    <View style={styles.filterItem}>
      <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
        {title}:
      </Text>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
      >
        <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>
          {options.find(opt => opt.id === value)?.name || 'Todas'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Renderizar modal de filtro
  const renderFilterModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: any[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    visible && (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { backgroundColor: selectedValue === item.id ? colors.accentPrimary + '20' : 'transparent' }
                ]}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: selectedValue === item.id ? colors.accentPrimary : colors.textPrimary }
                ]}>
                  {item.name}
                </Text>
                {selectedValue === item.id && (
                  <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.textPrimary === '#000000' ? 'dark-content' : 'light-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Notificações
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.accentPrimary }]}>
            <Text style={styles.badgeText}>
              {notifications.filter(n => n.status === 'unread').length}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={deleteAllNotifications}
          >
            <Ionicons name="trash" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {renderFilter('Status', selectedStatus, statusOptions, () => setShowStatusModal(true))}
        {renderFilter('Tipo', selectedType, typeOptions, () => setShowTypeModal(true))}
        {renderFilter('Prioridade', selectedPriority, priorityOptions, () => setShowPriorityModal(true))}
      </View>

      {/* Lista de Notificações */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accentPrimary]}
            tintColor={colors.accentPrimary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Nenhuma notificação
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              {notifications.length === 0 
                ? 'Você não tem notificações ainda.'
                : 'Nenhuma notificação corresponde aos filtros selecionados.'
              }
            </Text>
          </View>
        }
      />

      {/* Modais de Filtro */}
      {renderFilterModal(
        showStatusModal,
        () => setShowStatusModal(false),
        'Filtrar por Status',
        statusOptions,
        selectedStatus,
        setSelectedStatus
      )}
      
      {renderFilterModal(
        showTypeModal,
        () => setShowTypeModal(false),
        'Filtrar por Tipo',
        typeOptions,
        selectedType,
        setSelectedType
      )}
      
      {renderFilterModal(
        showPriorityModal,
        () => setShowPriorityModal(false),
        'Filtrar por Prioridade',
        priorityOptions,
        selectedPriority,
        setSelectedPriority
      )}
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
    paddingTop: StatusBar.currentHeight,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemText: {
    fontSize: 16,
  },
});
