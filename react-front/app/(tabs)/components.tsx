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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipos de componentes
interface Component {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  location: string;
  lastUsed: string;
  status: 'available' | 'low' | 'critical';
  description: string;
}

// Dados mockados para demonstração
const mockComponents: Component[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    category: 'Microcontrolador',
    stock: 15,
    minStock: 5,
    location: 'Gaveta A1',
    lastUsed: '2024-01-15',
    status: 'available',
    description: 'Microcontrolador ATmega328P, 14 pinos digitais, 6 analógicos',
  },
  {
    id: '2',
    name: 'Resistor 220Ω',
    category: 'Resistor',
    stock: 3,
    minStock: 10,
    location: 'Gaveta B3',
    lastUsed: '2024-01-10',
    status: 'low',
    description: 'Resistor de carbono 1/4W, tolerância 5%',
  },
  {
    id: '3',
    name: 'Sensor DHT22',
    category: 'Sensor',
    stock: 0,
    minStock: 2,
    location: 'Gaveta C2',
    lastUsed: '2024-01-08',
    status: 'critical',
    description: 'Sensor de temperatura e umidade digital',
  },
  {
    id: '4',
    name: 'Capacitor 100µF',
    category: 'Capacitor',
    stock: 25,
    minStock: 15,
    location: 'Gaveta B4',
    lastUsed: '2024-01-12',
    status: 'available',
    description: 'Capacitor eletrolítico 25V',
  },
  {
    id: '5',
    name: 'LED RGB',
    category: 'LED',
    stock: 8,
    minStock: 5,
    location: 'Gaveta A2',
    lastUsed: '2024-01-14',
    status: 'available',
    description: 'LED RGB comum ânodo, 5mm',
  },
  {
    id: '6',
    name: 'Breadboard 830',
    category: 'Ferramenta',
    stock: 1,
    minStock: 3,
    location: 'Gaveta D1',
    lastUsed: '2024-01-13',
    status: 'low',
    description: 'Protoboard 830 pontos com barra de alimentação',
  },
  {
    id: '7',
    name: 'ESP32 DevKit',
    category: 'Microcontrolador',
    stock: 2,
    minStock: 3,
    location: 'Gaveta A3',
    lastUsed: '2024-01-16',
    status: 'low',
    description: 'Microcontrolador WiFi + Bluetooth, dual-core',
  },
  {
    id: '8',
    name: 'Motor DC 12V',
    category: 'Motor',
    stock: 5,
    minStock: 2,
    location: 'Gaveta E1',
    lastUsed: '2024-01-11',
    status: 'available',
    description: 'Motor DC com redução, 100RPM',
  },
];

const categories = ['Todos', 'Resistor', 'Capacitor', 'Microcontrolador', 'Sensor', 'LED', 'Ferramenta', 'Motor'];

export default function ComponentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todos']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComponents, setFilteredComponents] = useState(mockComponents);
  const [notifications, setNotifications] = useState(3);

  // Filtrar componentes
  React.useEffect(() => {
    let filtered = mockComponents;
    
    if (!selectedCategories.includes('Todos')) {
      filtered = filtered.filter(comp => selectedCategories.includes(comp.category));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredComponents(filtered);
  }, [selectedCategories, searchQuery]);

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

  const renderComponentCard = ({ item }: { item: Component }) => (
    <ComponentCard 
      component={item} 
      onPress={() => handleComponentPress(item)}
    />
  );

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
    const total = mockComponents.length;
    const available = mockComponents.filter(c => c.status === 'available').length;
    const low = mockComponents.filter(c => c.status === 'low').length;
    const critical = mockComponents.filter(c => c.status === 'critical').length;
    
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
                {user?.name?.charAt(0) || 'U'}
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

      {/* Components List */}
      <FlatList
        data={filteredComponents}
        renderItem={renderComponentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.componentsList}
        showsVerticalScrollIndicator={false}
      />

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
}); 