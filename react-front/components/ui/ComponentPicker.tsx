import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Component {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unit: string;
  inStock: number;
  unitPrice: number;
  preferredSupplier: string;
  leadTime: number;
  link_compra: string;
}

interface ComponentPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (component: Component) => void;
  components: Component[];
  loading?: boolean;
  onNavigateToComponentForm?: () => void;
}

export function ComponentPicker({
  visible,
  onClose,
  onSelect,
  components,
  loading = false,
  onNavigateToComponentForm,
}: ComponentPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = components.filter(component =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredComponents(filtered);
    } else {
      setFilteredComponents(components);
    }
  }, [searchQuery, components]);

  const handleSelect = (component: Component) => {
    onSelect(component);
    onClose();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderComponentItem = ({ item }: { item: Component }) => (
    <TouchableOpacity
      style={[styles.componentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.componentHeader}>
        <View style={styles.componentInfo}>
          <Text style={[styles.componentName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.componentSku, { color: colors.accentPrimary }]}>
            SKU: {item.sku}
          </Text>
        </View>
        <View style={[
          styles.stockBadge,
          { backgroundColor: item.inStock > 0 ? colors.success + '20' : colors.error + '20' }
        ]}>
          <Text style={[
            styles.stockText,
            { color: item.inStock > 0 ? colors.success : colors.error }
          ]}>
            {item.inStock > 0 ? `${item.inStock}` : '0'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.componentDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.componentFooter}>
        <Text style={[styles.componentCategory, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
        <Text style={[styles.componentPrice, { color: colors.textPrimary }]}>
          R$ {item.unitPrice.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {loading ? (
        <>
          <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Carregando componentes...
          </Text>
        </>
      ) : searchQuery.trim() ? (
        <>
          <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum componente encontrado
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tente uma busca diferente
          </Text>
          <Button
            title="Cadastrar Novo Componente"
            variant="outline"
            size="small"
            onPress={() => {
              onClose();
              onNavigateToComponentForm?.();
            }}
            style={styles.newComponentButton}
          />
        </>
      ) : (
        <>
          <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum componente cadastrado
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Cadastre componentes para começar
          </Text>
          <Button
            title="Cadastrar Primeiro Componente"
            variant="primary"
            size="small"
            onPress={() => {
              onClose();
              onNavigateToComponentForm?.();
            }}
            style={styles.newComponentButton}
          />
        </>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  Selecionar Componente
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {components.length} componentes disponíveis
                </Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por nome, SKU, categoria..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Count */}
          {searchQuery.trim() && (
            <View style={styles.resultsInfo}>
              <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                {filteredComponents.length} resultado{filteredComponents.length !== 1 ? 's' : ''} encontrado{filteredComponents.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Components List */}
          <FlatList
            data={filteredComponents}
            renderItem={renderComponentItem}
            keyExtractor={(item) => item.id}
            style={styles.componentsList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  resultsInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  componentsList: {
    flex: 1,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  componentItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  componentInfo: {
    flex: 1,
    marginRight: 12,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  componentSku: {
    fontSize: 14,
    fontWeight: '500',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  componentDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  componentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  componentPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  newComponentButton: {
    marginTop: 8,
  },
});
