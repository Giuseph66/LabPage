import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterChip } from '@/components/ui/FilterChip';
import { KPICard } from '@/components/ui/KPICard';
import { Logo } from '@/components/ui/Logo';
import { ReservationCard } from '@/components/ui/ReservationCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

// Interfaces (ajustadas para dados reais da API)
interface Reservation {
  id: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  complementaryResources: string[];
  date: string;
  startTime: string;
  endTime: string;
  recurrence?: {
    type: string;
    interval: number;
    endDate?: string;
    exceptions: string[];
  };
  responsible: string;
  participants: number;
  projectId?: string;
  purpose: string;
  observations: string;
  epiChecklist: {
    glasses: boolean;
    gloves: boolean;
    labCoat: boolean;
  };
  requiredTrainings: string[];
  materials: string[];
  risks: string[];
  riskMitigation: string;
  termsAccepted: boolean;
  conflicts: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  resource: string;
  date: string;
  room: string;
  responsible: string;
}

import { API_BASE_URL } from '@/env';

// Estado inicial vazio
const initialReservations: Reservation[] = [];
const initialCalendarEvents: CalendarEvent[] = [];
const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR');
};
// Função para calcular KPIs baseados nos dados reais
const calculateKPIs = (reservations: Reservation[], selectedDate: Date) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const selectedDateStr = formatDate(selectedDate);
  
  // Reservas de hoje
  const todayReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDateStr = `${day}/${month}/${year}`;
    return reservationDateStr === todayStr;
  });
  
  // Reservas da semana (próximos 7 dias)
  const weekReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const daysDiff = Math.ceil((reservationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  });
  
  // Reservas do mês
  const monthReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate.getMonth() === today.getMonth() && reservationDate.getFullYear() === today.getFullYear();
  });
  
  // Reservas pendentes (simulado - não temos status real na API)
  const pendingReservations = reservations.filter(reservation => {
    // Simular reservas pendentes baseado em data futura
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate > today;
  });
  
  return [
    {
      id: '0',
      title: 'Todas',
      value: reservations.length.toString(),
      subtitle: 'total',
      icon: 'checkmark-circle' as const,
      color: '#22C55E',
    },
    {
      id: '1',
      title: 'Próximas reservas',
      value: todayReservations.length.toString(),
      subtitle: 'hoje',
      icon: 'calendar' as const,
      color: '#00E5FF',
    },
    {
      id: '2',
      title: 'Aguardando aprovação',
      value: pendingReservations.length.toString(),
      subtitle: 'pendentes',
      icon: 'time' as const,
      color: '#F59E0B',
    },
    {
      id: '3',
      title: 'Esta semana',
      value: weekReservations.length.toString(),
      subtitle: 'próximos dias',
      icon: 'calendar-outline' as const,
      color: '#8B5CF6',
    },
    {
      id: '4',
      title: 'Este mês',
      value: monthReservations.length.toString(),
      subtitle: 'total',
      icon: 'checkmark-circle' as const,
      color: '#22C55E',
    },
  ];
};

// Função para calcular filtros baseados nos dados reais
const calculateFilters = (reservations: Reservation[]) => {
  const today = new Date();
  const todayStr = formatDate(today);
  
  // Reservas de hoje
  const todayReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDateStr = `${day}/${month}/${year}`;
    return reservationDateStr === todayStr;
  });
  
  // Reservas da semana
  const weekReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const daysDiff = Math.ceil((reservationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff <= 7;
  });
  
  // Reservas do mês
  const monthReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate.getMonth() === today.getMonth() && reservationDate.getFullYear() === today.getFullYear();
  });
  
  // Reservas confirmadas (simulado)
  const confirmedReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate >= today;
  });
  
  // Reservas pendentes
  const pendingReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate > today;
  });
  
  // Reservas canceladas (simulado - não temos status real)
  const cancelledReservations = reservations.filter(reservation => {
    // Simular algumas reservas canceladas
    return Math.random() < 0.1; // 10% chance de ser cancelada
  });
  
  // Reservas concluídas (passadas)
  const completedReservations = reservations.filter(reservation => {
    const [year, month, day] = reservation.date.split('-');
    const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return reservationDate < today;
  });
  
  return [
    { id: '0', label: 'Todos', badge: reservations.length.toString() },
    { id: '1', label: 'Hoje', badge: todayReservations.length.toString() },
    { id: '2', label: 'Semana', badge: weekReservations.length.toString() },
    { id: '3', label: 'Mês', badge: monthReservations.length.toString() },
    { id: '4', label: 'Confirmada', badge: confirmedReservations.length.toString() },
    { id: '5', label: 'Pendente', badge: pendingReservations.length.toString() },
    { id: '6', label: 'Cancelada', badge: cancelledReservations.length.toString() },
    { id: '7', label: 'Concluída', badge: completedReservations.length.toString() },
  ];
};

// Função para buscar reservas da API
const fetchReservations = async (): Promise<Reservation[]> => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const savedToken = await AsyncStorage.getItem('@LabPage:token');

    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      headers: {
        'Content-Type': 'application/json',
        ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar reservas');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id?.toString(),
      resourceType: item.data?.resourceType || item.resourceType,
      resourceId: item.data?.resourceId || item.resourceId,
      resourceName: item.data?.resourceName || item.resourceName,
      complementaryResources: item.data?.complementaryResources || item.complementaryResources || [],
      date: item.data?.date || item.date,
      startTime: item.data?.startTime || item.startTime,
      endTime: item.data?.endTime || item.endTime,
      recurrence: item.data?.recurrence || item.recurrence,
      responsible: item.data?.responsible || item.responsible,
      participants: item.data?.participants || item.participants,
      projectId: item.data?.projectId || item.projectId,
      purpose: item.data?.purpose || item.purpose,
      observations: item.data?.observations || item.observations,
      epiChecklist: item.data?.epiChecklist || item.epiChecklist || { glasses: false, gloves: false, labCoat: false },
      requiredTrainings: item.data?.requiredTrainings || item.requiredTrainings || [],
      materials: item.data?.materials || item.materials || [],
      risks: item.data?.risks || item.risks || [],
      riskMitigation: item.data?.riskMitigation || item.riskMitigation,
      termsAccepted: item.data?.termsAccepted || item.termsAccepted,
      conflicts: item.data?.conflicts || item.conflicts || [],
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    throw error;
  }
};

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

type ViewMode = 'list' | 'calendar';
type CalendarViewMode = 'day' | 'week' | 'month';

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notifications, setNotifications] = useState(2);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Estados para KPIs e filtros calculados dinamicamente
  const [kpis, setKpis] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);

  // Carregar reservas ao montar o componente
  React.useEffect(() => {
    loadReservations();
  }, []);

  // Converter reservas para eventos do calendário e calcular KPIs/filtros
  React.useEffect(() => {
    const events: CalendarEvent[] = reservations.map(reservation => ({
      id: reservation.id,
      title: reservation.purpose,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      status: 'confirmed', // Por enquanto, todas são confirmadas
      resource: reservation.resourceName,
      date: reservation.date, // Manter formato ISO original para conversão posterior
      room: reservation.resourceName,
      responsible: reservation.responsible,
    }));
    setCalendarEvents(events);
    
    // Calcular KPIs e filtros baseados nos dados reais
    const calculatedKpis = calculateKPIs(reservations, selectedDate);
    const calculatedFilters = calculateFilters(reservations);
    
    setKpis(calculatedKpis);
    setFilters(calculatedFilters);
  }, [reservations, selectedDate]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchReservations();
      setReservations(data);
    } catch (err) {
      setError('Erro ao carregar reservas');
      console.error('Erro ao carregar reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReservations();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleCreateReservation = () => {
    router.push('/extra/reservas/reservation-form');
  };

  // Filtrar reservas baseado na busca e filtro selecionado
  const getFilteredReservations = () => {
    let filtered = reservations;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(reservation =>
        (reservation.purpose && reservation.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reservation.resourceName && reservation.resourceName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reservation.responsible && reservation.responsible.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reservation.resourceType && reservation.resourceType.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtro por categoria selecionada
    if (selectedFilter !== 'Todos') {
      const today = new Date();
      
      switch (selectedFilter) {
        case 'Hoje':
          // Filtro "Hoje" - mostrar reservas de hoje
          const todayStr = formatDate(today);
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDateStr = `${day}/${month}/${year}`;
            return reservationDateStr === todayStr;
          });
          break;
        case 'Semana':
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const daysDiff = Math.ceil((reservationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff >= 0 && daysDiff <= 7;
          });
          break;
        case 'Mês':
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return reservationDate.getMonth() === today.getMonth() && reservationDate.getFullYear() === today.getFullYear();
          });
          break;
        case 'Confirmada':
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return reservationDate >= today;
          });
          break;
        case 'Pendente':
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return reservationDate > today;
          });
          break;
        case 'Concluída':
          filtered = filtered.filter(reservation => {
            const [year, month, day] = reservation.date.split('-');
            const reservationDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return reservationDate < today;
          });
          break;
        case 'Cancelada':
          // Simular algumas reservas canceladas
          filtered = filtered.filter(reservation => Math.random() < 0.1);
          break;
        default:
          // Caso padrão - não filtrar (mostrar todos)
          break;
      }
    }
    // Se selectedFilter === 'Todos', não aplicar nenhum filtro adicional

    return filtered;
  };


  const handleCalendarEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'conflict': return colors.error;
      case 'cancelled': return colors.textSecondary;
      case 'completed': return colors.accentSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'conflict': return 'Conflito';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Concluída';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'conflict': return 'warning';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'help-circle';
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (calendarViewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarViewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarViewMode === 'month') {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const dates = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return calendarEvents.filter(event => {
      // Converter data ISO para formato brasileiro para comparação
      // Usar split para evitar problemas de timezone
      const [year, month, day] = event.date.split('-');
      const eventDateStr = `${day}/${month}/${year}`;
      return eventDateStr === dateStr;
    });
  };

  const getEventsForTimeSlot = (time: string) => {
    const dateStr = formatDate(selectedDate);
    return calendarEvents.filter(event => {
      // Converter data ISO para formato brasileiro para comparação
      // Usar split para evitar problemas de timezone
      const [year, month, day] = event.date.split('-');
      const eventDateStr = `${day}/${month}/${year}`;
      return eventDateStr === dateStr &&
        event.startTime <= time &&
        event.endTime > time;
    });
  };

  const renderDayView = () => (
    <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.dayHeader}>
        <TouchableOpacity onPress={() => navigateDate('prev')}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.dayTitleContainer}>
          <Text style={[styles.dayTitle, { color: colors.textPrimary }]}>
            {formatDate(selectedDate)}
          </Text>
          <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
            {weekDays[selectedDate.getDay()]}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigateDate('next')}>
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.todayButton, { backgroundColor: colors.accentPrimary }]}
        onPress={goToToday}
      >
        <Ionicons name="today" size={16} color="#000000" />
        <Text style={styles.todayButtonText}>Hoje</Text>
      </TouchableOpacity>

      <View style={styles.timeSlotsContainer}>
        {timeSlots.map((time) => {
          const events = getEventsForTimeSlot(time);
          return (
            <View key={time} style={styles.timeSlot}>
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                {time}
              </Text>
              <View style={styles.eventsContainer}>
                {events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventItem,
                      { backgroundColor: getStatusColor(event.status) + '20', borderColor: getStatusColor(event.status) }
                    ]}
                    onPress={() => handleCalendarEventPress(event)}
                  >
                    <View style={styles.eventHeader}>
                      <Ionicons 
                        name={getStatusIcon(event.status) as any} 
                        size={16} 
                        color={getStatusColor(event.status)} 
                      />
                      <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>
                        {event.title}
                      </Text>
                    </View>
                    <Text style={[styles.eventResource, { color: colors.textSecondary }]}>
                      {event.resource} • {event.room}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                      {event.startTime} - {event.endTime}
                    </Text>
                  </TouchableOpacity>
                ))}
                {events.length === 0 && (
                  <View style={[styles.emptySlot, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Livre
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    
    return (
      <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.weekHeader}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.weekTitle, { color: colors.textPrimary }]}>
            Semana de {formatDate(weekDates[0])} a {formatDate(weekDates[6])}
          </Text>
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.todayButton, { backgroundColor: colors.accentPrimary }]}
          onPress={goToToday}
        >
          <Ionicons name="today" size={16} color="#000000" />
          <Text style={styles.todayButtonText}>Hoje</Text>
        </TouchableOpacity>
        
        <View style={styles.weekGrid}>
          {/* Header com os dias da semana */}
          <View style={styles.weekGridHeader}>
            <View style={styles.timeColumnHeader}>
              <Text style={[styles.timeHeaderText, { color: colors.textSecondary }]}>
                Horário
              </Text>
            </View>
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDayHeader,
                  date.toDateString() === selectedDate.toDateString() && { backgroundColor: colors.accentPrimary + '20' }
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.weekDayLabel, 
                  { color: date.toDateString() === selectedDate.toDateString() ? colors.accentPrimary : colors.textSecondary }
                ]}>
                  {weekDays[index]}
                </Text>
                <Text style={[
                  styles.weekDayNumber,
                  { color: date.toDateString() === selectedDate.toDateString() ? colors.accentPrimary : colors.textPrimary }
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Grid de horários */}
          <View style={styles.weekTimeGrid}>
            {timeSlots.map((time) => (
              <View key={time} style={styles.weekTimeRow}>
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                    {time}
                  </Text>
                </View>
                {weekDates.map((date, index) => {
                  const events = calendarEvents.filter(event => {
                    // Converter data ISO para formato brasileiro para comparação
                    // Usar split para evitar problemas de timezone
                    const [year, month, day] = event.date.split('-');
                    const eventDateStr = `${day}/${month}/${year}`;
                    return eventDateStr === formatDate(date) && 
                      event.startTime <= time && 
                      event.endTime > time;
                  });
                  
                  return (
                    <View key={index} style={styles.weekEventCell}>
                      {events.map((event) => (
                        <TouchableOpacity
                          key={event.id}
                          style={[
                            styles.weekEventItem,
                            { backgroundColor: getStatusColor(event.status) + '20', borderColor: getStatusColor(event.status) }
                          ]}
                          onPress={() => handleCalendarEventPress(event)}
                        >
                          <Text style={[styles.weekEventTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                            {event.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {events.length === 0 && (
                        <View style={[styles.weekEmptySlot, { backgroundColor: colors.surface }]} />
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(selectedDate);
    
    return (
      <View style={[styles.calendarContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => navigateDate('prev')}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
            {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateDate('next')}>
            <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.todayButton, { backgroundColor: colors.accentPrimary }]}
          onPress={goToToday}
        >
          <Ionicons name="today" size={16} color="#000000" />
          <Text style={styles.todayButtonText}>Hoje</Text>
        </TouchableOpacity>
        
        <View style={styles.monthGrid}>
          {weekDays.map((day) => (
            <View key={day} style={styles.monthDayHeader}>
              <Text style={[styles.monthDayLabel, { color: colors.textSecondary }]}>
                {day}
              </Text>
            </View>
          ))}
          
          {monthDates.map((date, index) => {
            const events = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthDay,
                  { 
                    backgroundColor: isSelected 
                      ? colors.accentPrimary + '20' 
                      : isToday 
                        ? colors.accentSecondary + '20'
                        : 'transparent' 
                  }
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.monthDayNumber,
                  { 
                    color: isCurrentMonth 
                      ? (isSelected ? colors.accentPrimary : isToday ? colors.accentSecondary : colors.textPrimary)
                      : colors.textSecondary 
                  }
                ]}>
                  {date.getDate()}
                </Text>
                {events.length > 0 && (
                  <View style={styles.monthEventIndicator}>
                    <View style={[
                      styles.eventDot,
                      { backgroundColor: getStatusColor(events[0].status) }
                    ]} />
                    {events.length > 1 && (
                      <Text style={[styles.eventCount, { color: colors.textSecondary }]}>
                        +{events.length - 1}
                      </Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCalendarContent = () => {
    switch (calendarViewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      default:
        return renderDayView();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Logo size="small" />
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Reservas</Text>
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

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchText, { color: colors.textPrimary }]}
              placeholder="Buscar por sala, equipamento, responsável..."
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
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              selected={selectedFilter === filter.label}
              onPress={() => setSelectedFilter(filter.label)}
              badge={filter.badge}
            />
          ))}
        </ScrollView>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Resumo do Dia
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiContainer}
          >
            {kpis.map((kpi) => (
              <KPICard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                color={kpi.color}
                onPress={() => Alert.alert(kpi.title, `Total: ${kpi.value} ${kpi.subtitle}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* View Mode Tabs */}
        <View style={styles.viewModeContainer}>
          <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                viewMode === 'list' && { backgroundColor: colors.accentPrimary }
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? '#000000' : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                { color: viewMode === 'list' ? '#000000' : colors.textSecondary }
              ]}>
                Lista
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                viewMode === 'calendar' && { backgroundColor: colors.accentPrimary }
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={viewMode === 'calendar' ? '#000000' : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                { color: viewMode === 'calendar' ? '#000000' : colors.textSecondary }
              ]}>
                Calendário
              </Text>
            </TouchableOpacity>
          </View>

          {viewMode === 'calendar' && (
            <View style={[styles.calendarTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.calendarTab,
                  calendarViewMode === 'day' && { backgroundColor: colors.accentPrimary }
                ]}
                onPress={() => setCalendarViewMode('day')}
              >
                <Text style={[
                  styles.calendarTabText,
                  { color: calendarViewMode === 'day' ? '#000000' : colors.textSecondary }
                ]}>
                  Dia
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.calendarTab,
                  calendarViewMode === 'week' && { backgroundColor: colors.accentPrimary }
                ]}
                onPress={() => setCalendarViewMode('week')}
              >
                <Text style={[
                  styles.calendarTabText,
                  { color: calendarViewMode === 'week' ? '#000000' : colors.textSecondary }
                ]}>
                  Semana
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.calendarTab,
                  calendarViewMode === 'month' && { backgroundColor: colors.accentPrimary }
                ]}
                onPress={() => setCalendarViewMode('month')}
              >
                <Text style={[
                  styles.calendarTabText,
                  { color: calendarViewMode === 'month' ? '#000000' : colors.textSecondary }
                ]}>
                  Mês
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Loading/Error State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando reservas...
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
              onPress={loadReservations}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {!loading && !error && (
          <View style={styles.content}>
            {viewMode === 'list' ? (
              <View>
                {(() => {
                  const filteredReservations = getFilteredReservations();
                  return filteredReservations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        {searchQuery ? 'Nenhuma reserva encontrada para sua busca' : 'Nenhuma reserva encontrada'}
                      </Text>
                    </View>
                  ) : (
                    filteredReservations.map((item) => (
                      <ReservationCard
                        key={item.id}
                        id={item.id}
                        title={item.purpose}
                        resource={item.resourceName}
                        room={item.resourceName}
                        startTime={item.startTime}
                        endTime={item.endTime}
                        date={item.date}
                        responsible={item.responsible}
                        status="confirmed"
                        participants={item.participants}
                        maxParticipants={item.participants + 5}
                        resourceType={item.resourceType || ''}
                        purpose={item.purpose}
                        onPress={() => handleCalendarEventPress({
                          id: item.id,
                          title: item.purpose,
                          startTime: item.startTime,
                          endTime: item.endTime,
                          status: 'confirmed',
                          resource: item.resourceName,
                          date: item.date,
                          room: item.resourceName,
                          responsible: item.responsible,
                        })}
                      />
                    ))
                  );
                })()}
              </View>
            ) : (
              renderCalendarContent()
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onPress={handleCreateReservation}
        icon="+"
      />

      {/* Event Details Modal */}
      <Modal
        visible={showEventModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Detalhes da Reserva
              </Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textPrimary }]}>
                    {selectedEvent.title}
                  </Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Ionicons name="location" size={20} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                    {selectedEvent.resource} • {selectedEvent.room}
                  </Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Ionicons name="time" size={20} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Ionicons name="person" size={20} color={colors.textSecondary} />
                  <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                    {selectedEvent.responsible}
                  </Text>
                </View>
                
                <View style={styles.eventDetailRow}>
                  <Ionicons name={getStatusIcon(selectedEvent.status) as any} size={20} color={getStatusColor(selectedEvent.status)} />
                  <Text style={[styles.eventDetailText, { color: getStatusColor(selectedEvent.status) }]}>
                    {getStatusText(selectedEvent.status)}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accentPrimary }]}
                onPress={() => {
                  setShowEventModal(false);
                  Alert.alert('Editar Reserva', 'Funcionalidade em desenvolvimento');
                }}
              >
                <Text style={styles.modalButtonText}>Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  setShowEventModal(false);
                  Alert.alert('Cancelar Reserva', 'Funcionalidade em desenvolvimento');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: '95%',
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  kpiContainer: {
    gap: 12,
  },
  viewModeContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  calendarTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  calendarTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
  },
  calendarContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTitleContainer: {
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  daySubtitle: {
    fontSize: 14,
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 60,
  },
  timeLabel: {
    fontSize: 12,
    width: 50,
    textAlign: 'right',
    marginRight: 12,
    marginTop: 8,
  },
  eventsContainer: {
    flex: 1,
    gap: 8,
  },
  eventItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  eventResource: {
    fontSize: 12,
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
  },
  emptySlot: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekGrid: {
    flex: 1,
  },
  weekGridHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeColumnHeader: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  timeHeaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  weekDayLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekTimeGrid: {
    flex: 1,
  },
  weekTimeRow: {
    flexDirection: 'row',
    minHeight: 60,
    marginBottom: 4,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEventCell: {
    flex: 1,
    marginHorizontal: 2,
    minHeight: 60,
  },
  weekEventItem: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEventTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  weekEmptySlot: {
    width: '100%',
    minHeight: 50,
    borderRadius: 6,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
  },
  monthDayLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthDay: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 8,
  },
  monthDayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthEventIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventCount: {
    fontSize: 10,
    marginLeft: 2,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDetails: {
    width: '100%',
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
}); 