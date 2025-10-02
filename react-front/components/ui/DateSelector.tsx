import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DateSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  title?: string;
  minDate?: Date;
  maxDate?: Date;
}

interface DayOption {
  date: Date;
  label: string;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

export function DateSelector({
  visible,
  onClose,
  onSelectDate,
  title = 'Selecionar Data',
  minDate,
  maxDate,
}: DateSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthName = (date: Date): string => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[date.getMonth()];
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (): DayOption[] => {
    const days: DayOption[] = [];
    const today = new Date();
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Adicionar dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, -firstDay + i + 1),
        label: '',
        isToday: false,
        isSelected: false,
        isDisabled: true,
      });
    }
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      
      // Validação mais robusta de datas
      let isDisabled = false;
      if (minDate) {
        const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        const currentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        isDisabled = currentDateOnly < minDateOnly;
      }
      if (maxDate && !isDisabled) {
        const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        const currentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        isDisabled = currentDateOnly > maxDateOnly;
      }
      
      days.push({
        date,
        label: day.toString(),
        isToday,
        isSelected: false,
        isDisabled,
      });
    }
    
    return days;
  };

  const generateQuickDates = (): DayOption[] => {
    const today = new Date();
    const quickDates: DayOption[] = [];
    
    // Hoje
    quickDates.push({
      date: today,
      label: 'Hoje',
      isToday: true,
      isSelected: false,
      isDisabled: false,
    });
    
    // Amanhã
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    quickDates.push({
      date: tomorrow,
      label: 'Amanhã',
      isToday: false,
      isSelected: false,
      isDisabled: false,
    });
    
    // Próxima semana
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    quickDates.push({
      date: nextWeek,
      label: 'Próxima semana',
      isToday: false,
      isSelected: false,
      isDisabled: false,
    });
    
    // Próximo mês
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    quickDates.push({
      date: nextMonth,
      label: 'Próximo mês',
      isToday: false,
      isSelected: false,
      isDisabled: false,
    });
    
    return quickDates;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const handleDateSelect = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const calendarDays = generateCalendarDays();
  const quickDates = generateQuickDates();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Conteúdo Simples */}
          <View style={styles.simpleContent}>
            <Text style={[styles.simpleText, { color: colors.textPrimary }]}>
              Modal está funcionando!
            </Text>
            
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.accentPrimary }]}
              onPress={() => handleDateSelect(new Date())}
            >
              <Text style={[styles.testButtonText, { color: '#000000' }]}>
                Selecionar Hoje
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.accentSecondary }]}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
            >
              <Text style={[styles.testButtonText, { color: '#000000' }]}>
                Selecionar Amanhã
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContent: {
    width: '95%',
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickDatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickDateButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickDateSubtext: {
    fontSize: 12,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    margin: 1,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  customDateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  simpleContent: {
    padding: 20,
  },
  simpleText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 