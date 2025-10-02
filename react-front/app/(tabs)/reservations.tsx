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

// Interfaces
interface Reservation {
  id: string;
  title: string;
  resource: string;
  room: string;
  startTime: string;
  endTime: string;
  date: string;
  responsible: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled' | 'completed';
  participants: number;
  maxParticipants: number;
  resourceType: string;
  purpose: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled' | 'completed';
  resource: string;
  date: string;
  room: string;
  responsible: string;
}

// Dados mockados
const mockKPIs = [
  {
    id: '1',
    title: 'Próximas reservas',
    value: '8',
    subtitle: 'hoje',
    icon: 'calendar' as const,
    color: '#00E5FF',
  },
  {
    id: '2',
    title: 'Aguardando aprovação',
    value: '3',
    subtitle: 'pendentes',
    icon: 'time' as const,
    color: '#F59E0B',
  },
  {
    id: '3',
    title: 'Conflitos detectados',
    value: '1',
    subtitle: 'resolver',
    icon: 'warning' as const,
    color: '#EF4444',
  },
  {
    id: '4',
    title: 'Check-ins pendentes',
    value: '5',
    subtitle: 'hoje',
    icon: 'checkmark-circle' as const,
    color: '#22C55E',
  },
];

const mockFilters = [
  { id: '1', label: 'Hoje', badge: '8' },
  { id: '2', label: 'Semana', badge: '25' },
  { id: '3', label: 'Mês', badge: '120' },
  { id: '4', label: 'Confirmada', badge: '15' },
  { id: '5', label: 'Pendente', badge: '3' },
  { id: '6', label: 'Cancelada', badge: '2' },
  { id: '7', label: 'Concluída', badge: '45' },
];
const mockReservations: Reservation[] = [
  {
    id: '1',
    title: 'Aula de Eletrônica Digital',
    resource: 'Osciloscópio Tektronix',
    room: 'Lab A',
    startTime: '14:00',
    endTime: '16:00',
    date: '22/08/2025',
    responsible: 'Prof. João Silva',
    status: 'confirmed',
    participants: 25,
    maxParticipants: 30,
    resourceType: 'equipment',
    purpose: 'Aula prática de circuitos digitais',
  },
  {
    id: '2',
    title: 'Projeto Arduino',
    resource: 'Multímetro Fluke',
    room: 'Lab B',
    startTime: '16:30',
    endTime: '18:30',
    date: '22/08/2025',
    responsible: 'Maria Santos',
    status: 'pending',
    participants: 8,
    maxParticipants: 15,
    resourceType: 'equipment',
    purpose: 'Desenvolvimento de projeto final',
  },
  {
    id: '3',
    title: 'Manutenção Equipamentos',
    resource: 'Fonte de Alimentação',
    room: 'Lab C',
    startTime: '09:00',
    endTime: '11:00',
    date: '22/08/2025',
    responsible: 'Carlos Lima',
    status: 'conflict',
    participants: 3,
    maxParticipants: 5,
    resourceType: 'equipment',
    purpose: 'Manutenção preventiva',
  },
  {
    id: '4',
    title: 'Defesa de TCC',
    resource: 'Projetor Epson',
    room: 'Auditório',
    startTime: '19:00',
    endTime: '21:00',
    date: '22/08/2025',
    responsible: 'Ana Costa',
    status: 'confirmed',
    participants: 50,
    maxParticipants: 80,
    resourceType: 'multipurpose',
    purpose: 'Apresentação de trabalho de conclusão',
  },
  {
    id: '5',
    title: 'Treinamento 3D',
    resource: 'Impressora 3D',
    room: 'Sala de Prototipagem',
    startTime: '10:00',
    endTime: '12:00',
    date: '23/08/2025',
    responsible: 'Pedro Oliveira',
    status: 'confirmed',
    participants: 12,
    maxParticipants: 15,
    resourceType: '3dprinter',
    purpose: 'Treinamento de modelagem 3D',
  },
  {
    id: '6',
    title: 'Reunião de Projeto',
    resource: 'Sala de Reuniões',
    room: 'Bloco B - Sala 205',
    startTime: '15:00',
    endTime: '17:00',
    date: '23/08/2025',
    responsible: 'Fernanda Lima',
    status: 'pending',
    participants: 8,
    maxParticipants: 12,
    resourceType: 'multipurpose',
    purpose: 'Reunião de alinhamento do projeto',
  },
];

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Aula de Eletrônica',
    startTime: '14:00',
    endTime: '16:00',
    status: 'confirmed',
    resource: 'Osciloscópio',
    date: '17/08/2025',
    room: 'Lab A',
    responsible: 'Prof. João Silva',
  },
  {
    id: '2',
    title: 'Projeto Arduino',
    startTime: '16:30',
    endTime: '18:30',
    status: 'pending',
    resource: 'Multímetro',
    date: '22/08/2025',
    room: 'Lab B',
    responsible: 'Maria Santos',
  },
  {
    id: '3',
    title: 'Manutenção',
    startTime: '09:00',
    endTime: '11:00',
    status: 'conflict',
    resource: 'Fonte',
    date: '22/08/2025',
    room: 'Lab C',
    responsible: 'Carlos Lima',
  },
  {
    id: '4',
    title: 'Defesa de TCC',
    startTime: '19:00',
    endTime: '21:00',
    status: 'confirmed',
    resource: 'Projetor',
    date: '22/08/2025',
    room: 'Auditório',
    responsible: 'Ana Costa',
  },
  {
    id: '5',
    title: 'Treinamento 3D',
    startTime: '10:00',
    endTime: '12:00',
    status: 'confirmed',
    resource: 'Impressora 3D',
    date: '23/08/2025',
    room: 'Sala de Prototipagem',
    responsible: 'Pedro Oliveira',
  },
  {
    id: '6',
    title: 'Reunião de Projeto',
    startTime: '15:00',
    endTime: '17:00',
    status: 'pending',
    resource: 'Sala de Reuniões',
    date: '23/08/2025',
    room: 'Bloco B - Sala 205',
    responsible: 'Fernanda Lima',
  },
];

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
  
  const [selectedFilter, setSelectedFilter] = useState('Hoje');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notifications, setNotifications] = useState(2);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleCreateReservation = () => {
    router.push('/extra/reservas/reservation-form');
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
    return mockCalendarEvents.filter(event => event.date === dateStr);
  };

  const getEventsForTimeSlot = (time: string) => {
    const dateStr = formatDate(selectedDate);
    return mockCalendarEvents.filter(event => 
      event.date === dateStr && 
      event.startTime <= time && 
      event.endTime > time
    );
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
                  const events = mockCalendarEvents.filter(event => 
                    event.date === formatDate(date) && 
                    event.startTime <= time && 
                    event.endTime > time
                  );
                  
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
                {user?.name?.charAt(0) || 'U'}
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
            {mockKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                color={kpi.color}
                onPress={() => Alert.alert(kpi.title, 'Detalhes em desenvolvimento')}
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

        {/* Content */}
        <View style={styles.content}>
          {viewMode === 'list' ? (
            <View>
              {mockReservations.map((item) => (
                <ReservationCard
                  key={item.id}
                  {...item}
                  onPress={() => handleCalendarEventPress(item)}
                />
              ))}
            </View>
          ) : (
            renderCalendarContent()
          )}
        </View>
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
    paddingBottom: 100,
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
}); 