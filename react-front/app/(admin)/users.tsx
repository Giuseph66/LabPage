import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserEditModal } from "@/components/ui/UserEditModal";

interface User {
  id: number;
  gmail: string;
  nome: string;
  senhaHash: string;
  matricula?: string;
  curso?: string;
  telefone?: string;
  ativo?: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  roles?: string[];
}

export default function UsersScreen() {
  const { user, isAdmin, token, revalidateUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [validating, setValidating] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }

      const data = await response.json();
      
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function validateAndFetch() {
      setValidating(true);
      
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }
      
      // Revalidar permissões
      const isValid = await revalidateUser();
      
      if (!isValid) {
        Alert.alert("Sessão Expirada", "Faça login novamente");
        router.replace("/(auth)/login");
        return;
      }
      
      if (!isAdmin()) {
        Alert.alert("Acesso Negado", "Você não tem permissão de administrador");
        router.replace("/(tabs)");
        return;
      }
      
      setValidating(false);
      fetchUsers();
    }
    
    validateAndFetch();
  }, []);

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingUser(null);
  };

  const handleEditSuccess = () => {
    fetchUsers(); // Recarrega a lista
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.userHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.accentPrimary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.accentPrimary }]}>
            {item.nome ? item.nome.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.nome || 'Sem nome'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {item.gmail}
          </Text>
        </View>
        <View style={[styles.indexBadge, { backgroundColor: colors.border }]}>
          <Text style={[styles.indexText, { color: colors.textSecondary }]}>
            #{index + 1}
          </Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="key-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>ID:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
            {item.id}
          </Text>
        </View>
        
        {item.matricula && (
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Matrícula:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.matricula}
            </Text>
          </View>
        )}
        
        {item.curso && (
          <View style={styles.detailRow}>
            <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Curso:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.curso}
            </Text>
          </View>
        )}
        
        {item.telefone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Telefone:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.telefone}
            </Text>
          </View>
        )}
        
        {item.roles && item.roles.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="shield-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Roles:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.roles.join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Botão de Editar */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditUser(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={20} color={colors.accentPrimary} />
        <Text style={[styles.editButtonText, { color: colors.accentPrimary }]}>
          Editar Usuário
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Nenhum usuário encontrado
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Tente recarregar a lista
      </Text>
    </View>
  );

  if (validating) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Validando permissões...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={colors.accentPrimary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {users.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Usuários
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.accentPrimary + '15' }]}
              onPress={fetchUsers}
              disabled={loading}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={colors.accentPrimary} 
                style={loading ? { transform: [{ rotate: '180deg' }] } : {}}
              />
              <Text style={[styles.refreshText, { color: colors.accentPrimary }]}>
                {loading ? 'Carregando...' : 'Atualizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando usuários...
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>

      <UserEditModal
        visible={modalVisible}
        user={editingUser}
        token={token || ''}
        onClose={handleCloseModal}
        onSuccess={handleEditSuccess}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshText: {
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
  },
  indexBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  userDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 50,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});