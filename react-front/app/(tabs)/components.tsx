import { ComponentCard } from '@/components/ComponentCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
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
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipos de componentes (ajustados para dados reais da API)
interface Component {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  manufacturer?: string;
  packageType?: string;
  currentStock: number;
  minimumStock: number;
  storageLocation?: string;
  status: 'active' | 'inactive' | 'obsolete';
  datasheet?: string;
  rohs?: boolean;
  reach?: boolean;
  createdAt: string;
  updatedAt: string;
}

import { API_BASE_URL } from '@/env';

// Estado inicial vazio
const initialComponents: Component[] = [];

const categories = ['Todos', 'Resistores', 'Capacitores', 'Microcontroladores', 'Sensores', 'LEDs', 'Ferramentas', 'Motores', 'Conectores', 'Baterias', 'Displays', 'ICs', 'Transistores', 'Indutores'];

// Função para buscar componentes da API
const fetchComponents = async (): Promise<Component[]> => {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const savedToken = await AsyncStorage.getItem('@LabPage:token');

    const response = await fetch(`${API_BASE_URL}/api/components`, {
      headers: {
        'Content-Type': 'application/json',
        ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar componentes');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id?.toString() || '',
      partNumber: item.partNumber || '',
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      packageType: item.packageType || '',
      currentStock: item.currentStock || 0,
      minimumStock: item.minimumStock || 0,
      storageLocation: item.storageLocation || '',
      status: item.status || 'active',
      datasheet: item.datasheet || '',
      rohs: item.rohs || false,
      reach: item.reach || false,
      createdAt: item.createdAt || '',
      updatedAt: item.updatedAt || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar componentes:', error);
    throw error;
  }
};

export default function ComponentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();

  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>(initialComponents);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todos']);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);

  // Carregar componentes ao montar o componente
  React.useEffect(() => {
    loadComponents();
  }, []);

  // Filtrar componentes quando os filtros mudam
  React.useEffect(() => {
    filterComponents();
  }, [components, selectedCategories, searchQuery]);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchComponents();
      setComponents(data);
    } catch (err) {
      setError('Erro ao carregar componentes');
      console.error('Erro ao carregar componentes:', err);
      
      // Definir valores padrão em caso de erro
      setComponents([]);
      setFilteredComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterComponents = () => {
    let filtered = components;

    if (!selectedCategories.includes('Todos')) {
      filtered = filtered.filter(comp => {
        if (!comp.category) return false;
        return selectedCategories.includes(comp.category);
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(comp =>
        (comp.name && comp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (comp.description && comp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (comp.partNumber && comp.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (comp.manufacturer && comp.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredComponents(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadComponents();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleComponentPress = (component: Component) => {
    // Aqui você pode adicionar navegação para detalhes do componente
    console.log('Componente selecionado:', component.name);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      // Se clicar em "Todos" e não estiver selecionado, seleciona apenas "Todos"
      if (category === 'Todos') {
        return ['Todos'];
      }
      
      // Se "Todos" está selecionado e clicar em outra categoria, remove "Todos"
      if (prev.includes('Todos')) {
        return [category];
      }
      
      // Se a categoria já está selecionada, remove ela
      if (prev.includes(category)) {
        const newSelection = prev.filter(cat => cat !== category);
        // Se não sobrou nenhuma categoria, volta para "Todos"
        return newSelection.length === 0 ? ['Todos'] : newSelection;
      }
      
      // Adiciona a nova categoria
      return [...prev, category];
    });
  };

  const handleAddComponent = () => {
    router.push('/extra/componentes/component-form');
  };

  const renderComponentCard = ({ item }: { item: Component }) => {
    // Verificar se o componente tem dados válidos antes de renderizar
    if (!item.id || !item.name) {
      return null;
    }
    
    return (
      <ComponentCard 
        component={item} 
        onPress={() => handleComponentPress(item)}
      />
    );
  };

  const renderCategoryChip = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChipContainer,
        {
          backgroundColor: selectedCategories.includes(item) ? colors.accentPrimary : colors.surface,
          borderColor: selectedCategories.includes(item) ? colors.accentPrimary : colors.border,
        }
      ]}
      onPress={() => handleCategoryToggle(item)}
    >
      <Text style={[
        styles.categoryChipText,
        { color: selectedCategories.includes(item) ? colors.background : colors.textPrimary }
      ]}>
        {item}
      </Text>
      {selectedCategories.includes(item) && item !== 'Todos' && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.background }]}>
          <Text style={[styles.selectedIndicatorText, { color: colors.accentPrimary }]}>
            ✓
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getStats = () => {
    const total = filteredComponents.length;
    const available = filteredComponents.filter((component: Component) => component.status === 'active').length;
    const low = filteredComponents.filter((component: Component) => {
      if (component.currentStock === undefined || component.minimumStock === undefined) return false;
      return component.currentStock <= component.minimumStock && component.currentStock > 0;
    }).length;
    const critical = filteredComponents.filter((component: Component) => {
      if (component.currentStock === undefined) return false;
      return component.currentStock === 0;
    }).length;

    return { total, available, low, critical };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size="small" />
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Componentes</Text>
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
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.available}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Em dia</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.low}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Baixo</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.error }]}>{stats.critical}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Crítico</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar componentes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={[styles.categoriesTitle, { color: colors.textPrimary }]}>
            Filtros {selectedCategories.includes('Todos') ? '' : `(${selectedCategories.length})`}
          </Text>
          {!selectedCategories.includes('Todos') && (
            <TouchableOpacity 
              style={[styles.clearFiltersButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedCategories(['Todos'])}
            >
              <Text style={[styles.clearFiltersText, { color: colors.textSecondary }]}>
                Limpar
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Loading/Error State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando componentes...
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
            onPress={loadComponents}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Components List */}
      {!loading && !error && (
        <FlatList
          data={filteredComponents.filter(comp => comp.id && comp.name)} // Filtrar componentes válidos
          renderItem={renderComponentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.componentsList}
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
                {components.length === 0 ? 'Nenhum componente cadastrado' : 'Nenhum componente encontrado com os filtros aplicados'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onPress={handleAddComponent}
        icon="+"
      />
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
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  categoriesContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  categoriesHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearFiltersButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '500',
  },
  componentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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