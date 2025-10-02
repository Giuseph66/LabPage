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

// Tipos de projetos (ajustados para dados reais da API)
interface Project {
  id: string;
  name: string;
  code: string;
  shortDescription: string;
  categories: string[];
  visibility: 'private' | 'lab' | 'public';
  responsible: string;
  plannedStart: string;
  plannedEnd: string;
  phase: 'ideation' | 'planning' | 'prototype' | 'testing' | 'pilot' | 'production' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  laboratories: string[];
  policiesAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  category: string;
  description: string;
  members: number;
  materials: number;
  budget: number;
  dueDate: string;
}

import { API_BASE_URL } from '@/env';

// Estado inicial vazio
const initialProjects: Project[] = [];

const categories = ['Todos', 'IoT', 'Robótica', 'Automação', 'Sensores', 'Eletrônica', 'Software', 'Mecatrônica', 'Telecomunicações', 'Energia'];
const statusOptions = ['Todos', 'Ideação', 'Planejamento', 'Protótipo', 'Testes', 'Piloto', 'Produção', 'Concluído'];

// Função para buscar projetos da API
const fetchProjects = async (): Promise<Project[]> => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const savedToken = await AsyncStorage.getItem('@LabPage:token');

    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Content-Type': 'application/json',
        ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar projetos');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id?.toString() || '',
      name: item.data?.name || item.name || '',
      code: item.data?.code || item.code || '',
      shortDescription: item.data?.shortDescription || item.shortDescription || '',
      categories: item.data?.categories || item.categories || [],
      visibility: item.data?.visibility || item.visibility || 'private',
      responsible: item.data?.responsible || item.responsible || '',
      plannedStart: item.data?.plannedStart || item.plannedStart || '',
      plannedEnd: item.data?.plannedEnd || item.plannedEnd || '',
      phase: item.data?.phase || item.phase || 'ideation',
      progress: item.data?.progress || item.progress || 0,
      priority: item.data?.priority || item.priority || 'medium',
      laboratories: item.data?.laboratories || item.laboratories || [],
      policiesAccepted: item.data?.policiesAccepted || item.policiesAccepted || false,
      createdAt: item.createdAt || '',
      updatedAt: item.updatedAt || '',
      // Campos adicionais para compatibilidade
      status: item.data?.phase || item.phase || 'ideation',
      category: item.data?.categories?.[0] || item.categories?.[0] || '',
      description: item.data?.shortDescription || item.shortDescription || '',
      members: 0, // Campo não disponível na API
      materials: 0, // Campo não disponível na API
      budget: 0, // Campo não disponível na API
      dueDate: item.data?.plannedEnd || item.plannedEnd || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

export default function ProjectsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(initialProjects);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);

  // Estados para os comboboxes
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Carregar projetos ao montar o componente
  React.useEffect(() => {
    loadProjects();
  }, []);

  // Filtrar projetos quando os filtros mudam
  React.useEffect(() => {
    filterProjects();
  }, [projects, selectedCategory, selectedStatus, searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError('Erro ao carregar projetos');
      console.error('Erro ao carregar projetos:', err);
      
      // Definir valores padrão em caso de erro
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(project => {
        if (!project.categories || project.categories.length === 0) return false;
        return project.categories.includes(selectedCategory);
      });
    }

    // Filtro por status/fase
    if (selectedStatus !== 'Todos') {
      filtered = filtered.filter(project => {
        const projectPhase = project.phase || project.status;
        if (!projectPhase) return false;
        
        // Mapear status em português para fase em inglês
        const statusMap: { [key: string]: string } = {
          'Ideação': 'ideation',
          'Planejamento': 'planning',
          'Protótipo': 'prototype',
          'Testes': 'testing',
          'Piloto': 'pilot',
          'Produção': 'production',
          'Concluído': 'completed'
        };
        
        return projectPhase === statusMap[selectedStatus];
      });
    }

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(project =>
        (project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.shortDescription && project.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.code && project.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (project.responsible && project.responsible.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProjects();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ideation': return '#8B5CF6'; // Roxo
      case 'planning': return '#3B82F6'; // Azul
      case 'prototype': return '#F97316'; // Laranja
      case 'testing': return '#F59E0B'; // Amarelo
      case 'pilot': return '#10B981'; // Verde escuro
      case 'production': return '#059669'; // Verde mais escuro
      case 'completed': return '#22C55E'; // Verde
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ideation': return 'Ideação';
      case 'planning': return 'Planejamento';
      case 'prototype': return 'Protótipo';
      case 'testing': return 'Testes';
      case 'pilot': return 'Piloto';
      case 'production': return 'Produção';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ideation': return '💡';
      case 'planning': return '📋';
      case 'prototype': return '🔧';
      case 'testing': return '🧪';
      case 'pilot': return '✈️';
      case 'production': return '🏭';
      case 'completed': return '✅';
      default: return '?';
    }
  };

  const handleProjectPress = (project: Project) => {
    console.log('Projeto selecionado:', project.name);
  };

  const handleAddProject = () => {
    router.push('/extra/project/project-form');
  };

  const renderProjectCard = ({ item }: { item: Project }) => {
    // Verificar se o projeto tem dados válidos antes de renderizar
    if (!item.id || !item.name) {
      return null;
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('pt-BR');
      } catch {
        return 'N/A';
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.projectTitle}>{item.name || 'Nome não disponível'}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.phase || item.status) }]}>
              <Text style={styles.statusIcon}>{getStatusIcon(item.phase || item.status)}</Text>
              <Text style={styles.statusText}>{getStatusText(item.phase || item.status)}</Text>
            </View>
          </View>
          <Text style={[styles.categoryTag, { color: colors.accentSecondary }]}>
            {item.categories?.[0] || item.category || 'Sem categoria'}
          </Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.shortDescription || item.description || 'Sem descrição disponível'}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progresso</Text>
            <Text style={[styles.progressValue, { color: colors.textPrimary }]}>
              {item.progress || 0}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getStatusColor(item.phase || item.status),
                  width: `${item.progress || 0}%`
                }
              ]} 
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {item.responsible || 'N/A'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Responsável</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatDate(item.plannedStart)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Início</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatDate(item.plannedEnd)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Prazo</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {item.laboratories?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Laboratórios</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getStats = () => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.phase === 'planning' || p.phase === 'prototype' || p.phase === 'testing' || p.phase === 'pilot' || p.phase === 'production').length;
    const completed = filteredProjects.filter(p => p.phase === 'completed').length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

    return { total, active, completed, totalBudget };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Projetos</Text>
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
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.active}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ativos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.accentPrimary }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Concluídos</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar projetos..."
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
      </View>

      {/* Loading/Error State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando projetos...
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
            onPress={loadProjects}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Projects List */}
      {!loading && !error && (
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projectsList}
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
                Nenhum projeto encontrado
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onPress={handleAddProject}
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
                    { backgroundColor: selectedCategory === item ? colors.accentSecondary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedCategory === item ? colors.accentSecondary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {selectedCategory === item && (
                    <Ionicons name="checkmark" size={20} color={colors.accentSecondary} />
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
                    { backgroundColor: selectedStatus === item ? colors.accentSecondary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    setSelectedStatus(item);
                    setShowStatusModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedStatus === item ? colors.accentSecondary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {selectedStatus === item && (
                    <Ionicons name="checkmark" size={20} color={colors.accentSecondary} />
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
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
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
    marginBottom: 15,
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
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  projectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusIcon: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
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