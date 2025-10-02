import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    department?: string;
    studentId?: string;
    phone?: string;
  };
  onEdit?: () => void;
  onLogout?: () => void;
}

export function ProfileCard({ user, onEdit, onLogout }: ProfileCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const getRoleColor = () => {
    switch (user.role.toLowerCase()) {
      case 'admin':
        return colors.error;
      case 'professor':
      case 'docente':
        return colors.warning;
      case 'student':
      case 'discente':
        return colors.success;
      case 'technician':
      case 'técnico':
        return colors.accentPrimary;
      default:
        return colors.textSecondary;
    }
  };

  const getRoleText = () => {
    switch (user.role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'professor':
      case 'docente':
        return 'Docente';
      case 'student':
      case 'discente':
        return 'Discente';
      case 'technician':
      case 'técnico':
        return 'Técnico';
      default:
        return user.role;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentPrimary }]}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor() + '20' }]}>
            <Text style={[styles.roleText, { color: getRoleColor() }]}>
              {getRoleText()}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {onLogout && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
              onPress={onLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>
          {user.name}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user.email}
        </Text>
        {user.department && (
          <Text style={[styles.department, { color: colors.textSecondary }]}>
            {user.department}
          </Text>
        )}
      </View>

      {/* Additional Info */}
      <View style={styles.additionalInfo}>
        {user.studentId && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Matrícula: {user.studentId}
            </Text>
          </View>
        )}
        {user.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {user.phone}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  userInfo: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 2,
  },
  department: {
    fontSize: 14,
  },
  additionalInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
}); 