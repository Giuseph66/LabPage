import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReservationCardProps {
  id: string;
  title: string;
  resource: string;
  room?: string;
  startTime: string;
  endTime: string;
  date: string;
  responsible: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'conflict';
  participants?: number;
  maxParticipants?: number;
  onPress: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function ReservationCard({
  id,
  title,
  resource,
  room,
  startTime,
  endTime,
  date,
  responsible,
  status,
  participants,
  maxParticipants,
  onPress,
  onEdit,
  onCancel,
}: ReservationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getStatusColor = () => {
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

  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Concluída';
      case 'conflict':
        return 'Conflito';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'conflict':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: colors.surface,
        borderColor: colors.border
      }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={[styles.statusChip, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons name={getStatusIcon() as any} size={12} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onCancel}
            >
              <Ionicons name="close-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resource Info */}
      <View style={styles.resourceContainer}>
        <Ionicons name="cube-outline" size={16} color={colors.accentPrimary} />
        <Text style={[styles.resourceText, { color: colors.textPrimary }]}>
          {resource}
        </Text>
        {room && (
          <>
            <Text style={[styles.separator, { color: colors.textSecondary }]}>•</Text>
            <Text style={[styles.roomText, { color: colors.textSecondary }]}>
              {room}
            </Text>
          </>
        )}
      </View>

      {/* Time Info */}
      <View style={styles.timeContainer}>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.timeText, { color: colors.textPrimary }]}>
          {startTime} - {endTime}
        </Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {date}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.responsibleContainer}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.responsibleText, { color: colors.textSecondary }]}>
            {responsible}
          </Text>
        </View>
        
        {participants !== undefined && maxParticipants && (
          <View style={styles.participantsContainer}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.participantsText, { color: colors.textSecondary }]}>
              {participants}/{maxParticipants}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    fontSize: 14,
  },
  roomText: {
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responsibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  responsibleText: {
    fontSize: 14,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 14,
  },
}); 