import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'conflict';
  resource: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventPress: (event: CalendarEvent) => void;
  viewMode: 'day' | 'week' | 'month';
}

export function CalendarView({
  events,
  selectedDate,
  onDateSelect,
  onEventPress,
  viewMode,
}: CalendarViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.textSecondary;
      case 'conflict':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <ScrollView style={styles.dayContainer}>
        {hours.map((hour) => {
          const hourEvents = events.filter(event => {
            const eventHour = parseInt(event.startTime.split(':')[0]);
            return eventHour === hour;
          });

          return (
            <View key={hour} style={styles.hourRow}>
              <View style={[styles.hourLabel, { borderColor: colors.border }]}>
                <Text style={[styles.hourText, { color: colors.textSecondary }]}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
              <View style={[styles.hourContent, { borderColor: colors.border }]}>
                {hourEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventItem,
                      { 
                        backgroundColor: getStatusColor(event.status) + '20',
                        borderLeftColor: getStatusColor(event.status),
                      }
                    ]}
                    onPress={() => onEventPress(event)}
                  >
                    <Text style={[styles.eventTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </Text>
                    <Text style={[styles.eventResource, { color: colors.textSecondary }]} numberOfLines={1}>
                      {event.resource}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderWeekView = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          {days.map((day, index) => (
            <View key={day} style={[styles.dayHeader, { borderColor: colors.border }]}>
              <Text style={[styles.dayText, { color: colors.textSecondary }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        <ScrollView style={styles.weekContent}>
          {Array.from({ length: 24 }, (_, hour) => (
            <View key={hour} style={styles.weekHourRow}>
              <View style={[styles.weekHourLabel, { borderColor: colors.border }]}>
                <Text style={[styles.weekHourText, { color: colors.textSecondary }]}>
                  {hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
              {days.map((_, dayIndex) => (
                <View key={dayIndex} style={[styles.weekDayCell, { borderColor: colors.border }]}>
                  {events
                    .filter(event => {
                      const eventHour = parseInt(event.startTime.split(':')[0]);
                      return eventHour === hour;
                    })
                    .map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        style={[
                          styles.weekEventItem,
                          { backgroundColor: getStatusColor(event.status) + '20' }
                        ]}
                        onPress={() => onEventPress(event)}
                      >
                        <Text style={[styles.weekEventTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                          {event.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMonthView = () => {
    return (
      <View style={styles.monthContainer}>
        <Text style={[styles.monthText, { color: colors.textPrimary }]}>
          Visualização mensal em desenvolvimento
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayContainer: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  hourLabel: {
    width: 60,
    borderRightWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hourContent: {
    flex: 1,
    borderBottomWidth: 1,
    padding: 4,
  },
  eventItem: {
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 10,
    marginBottom: 2,
  },
  eventResource: {
    fontSize: 10,
  },
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    height: 40,
  },
  dayHeader: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekContent: {
    flex: 1,
  },
  weekHourRow: {
    flexDirection: 'row',
    minHeight: 40,
  },
  weekHourLabel: {
    width: 60,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekHourText: {
    fontSize: 10,
    fontWeight: '500',
  },
  weekDayCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 2,
  },
  weekEventItem: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  weekEventTitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  monthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
  },
}); 