import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
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
}

interface ComponentSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (component: Component) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  components: Component[];
}

export function ComponentSelector({
  visible,
  onClose,
  onSelect,
  searchQuery,
  onSearchChange,
  components,
}: ComponentSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [showAllComponents, setShowAllComponents] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setShowAllComponents(false);
      const filtered = components.filter(component =>
        component.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        component.sku.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        component.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredComponents(filtered);
      
      // Gerar sugestões de busca mais relevantes
      const suggestions = new Set<string>();
      components.forEach(component => {
        // Se o nome contém a busca, adicionar o nome completo
        if (component.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
          suggestions.add(component.name);
        }
        // Se o SKU contém a busca, adicionar o SKU completo
        if (component.sku.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
          suggestions.add(component.sku);
        }
        // Se a categoria contém a busca, adicionar a categoria
        if (component.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
          suggestions.add(component.category);
        }
      });
      
      // Ordenar sugestões por relevância (exata match primeiro)
      const sortedSuggestions = Array.from(suggestions).sort((a, b) => {
        const aExact = a.toLowerCase() === debouncedSearchQuery.toLowerCase();
        const bExact = b.toLowerCase() === debouncedSearchQuery.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.length - b.length; // Menor primeiro
      });
      
      setSearchSuggestions(sortedSuggestions.slice(0, 3));
    } else {
      setShowAllComponents(true);
      setFilteredComponents([]);
      setSearchSuggestions([]);
    }
  }, [debouncedSearchQuery, components]);

  const handleSelect = (component: Component) => {
    const componente = components.find(c => c.name === component as any);
    console.log(componente);
    onSelect(componente as Component);
    onClose();
  };

  const handleSearchChange = (text: string) => {
    onSearchChange(text);
  };

  const clearSearch = () => {
    onSearchChange('');
    setShowAllComponents(true);
    setFilteredComponents([]);
  };

  const handleSuggestionPress = (suggestion: string) => {
    onSearchChange(suggestion);
    // Forçar a atualização imediata do filtro
    const filtered = components.filter(component =>
      component.name.toLowerCase().includes(suggestion.toLowerCase()) ||
      component.sku.toLowerCase().includes(suggestion.toLowerCase()) ||
      component.description.toLowerCase().includes(suggestion.toLowerCase()) ||
      component.category.toLowerCase().includes(suggestion.toLowerCase())
    );
    setFilteredComponents(filtered);
    setShowAllComponents(false);
  };

  const displayComponents = showAllComponents ? components : filteredComponents;

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Text key={index} style={{ backgroundColor: colors.accentPrimary + '40', fontWeight: 'bold' }}>
          {part}
        </Text>
      ) : part
    );
  };

  // Usar debouncedSearchQuery para o destaque
  const highlightTextWithDebounce = (text: string) => highlightText(text, debouncedSearchQuery);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Selecionar Componente ({components.length} disponíveis)
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar por nome, SKU, descrição ou categoria..."
              placeholderTextColor={colors.textSecondary}
              ref={inputRef}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Indicador de resultados */}
          {debouncedSearchQuery.length > 0 && (
            <View style={styles.resultsInfo}>
              <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
                {filteredComponents.length} resultado{filteredComponents.length !== 1 ? 's' : ''} encontrado{filteredComponents.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Sugestões de busca */}
          {debouncedSearchQuery.length > 0 && searchSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
                Sugestões ({searchSuggestions.length}):
              </Text>
              <View style={styles.suggestionsList}>
                {searchSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Ionicons name="search" size={16} color={colors.textSecondary} />
                    <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>
                      {suggestion}
                    </Text>
                    <Text style={[styles.suggestionHint, { color: colors.textSecondary }]}>
                      Toque para buscar
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <ScrollView style={styles.componentsList} showsVerticalScrollIndicator={false}>
            {displayComponents.length === 0 ? (
              <View style={styles.emptyState}>
                {debouncedSearchQuery.length > 0 ? (
                  <>
                    <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      Nenhum componente encontrado
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                      Tente uma busca diferente
                    </Text>
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
                  </>
                )}
              </View>
            ) : (
              displayComponents.map((component) => (
                <TouchableOpacity
                  key={component.id}
                  style={[styles.componentItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => handleSelect(component)}
                >
                  <View style={styles.componentHeader}>
                    <Text style={[styles.componentName, { color: colors.textPrimary }]}>
                      {highlightTextWithDebounce(component.name)}
                    </Text>
                    <View style={[
                      styles.stockBadge,
                      { backgroundColor: component.inStock > 0 ? colors.success + '20' : colors.error + '20' }
                    ]}>
                      <Text style={[
                        styles.stockText,
                        { color: component.inStock > 0 ? colors.success : colors.error }
                      ]}>
                        {component.inStock > 0 ? `${component.inStock} em estoque` : 'Sem estoque'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.componentSku, { color: colors.accentPrimary }]}>
                    SKU: {highlightTextWithDebounce(component.sku)}
                  </Text>
                  
                  <Text style={[styles.componentDescription, { color: colors.textSecondary }]}>
                    {highlightTextWithDebounce(component.description)}
                  </Text>
                  
                  <View style={styles.componentFooter}>
                    <Text style={[styles.componentCategory, { color: colors.textSecondary }]}>
                      {highlightTextWithDebounce(component.category)}
                    </Text>
                    <Text style={[styles.componentPrice, { color: colors.textPrimary }]}>
                      R$ {component.unitPrice.toFixed(2)} / {component.unit}
                    </Text>
                  </View>

                  {/* Botão de Confirmar */}
                  <View style={styles.confirmButtonContainer}>
                    <TouchableOpacity
                      style={[styles.confirmButton, { backgroundColor: colors.accentPrimary }]}
                      onPress={() => handleSelect(component)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#000000" />
                      <Text style={[styles.confirmButtonText, { color: '#000000' }]}>
                        Confirmar Seleção
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.confirmHint, { color: colors.textSecondary }]}>
                      Toque para selecionar este componente
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {displayComponents.length > 0 && (
            <View style={styles.modalFooter}>
            <Button
            title="Confirmar Produto"
            variant="primary"
                onPress={() => {
                  handleSelect(searchQuery as any);
                  onClose();
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    elevation: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  componentsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  componentItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  componentSku: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
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
  modalFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  resultsInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionsList: {
    backgroundColor: 'transparent',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  suggestionHint: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 160,
  },
  confirmButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  confirmHint: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.8,
  },
}); 