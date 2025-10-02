import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// API helper
const API_BASE_URL = 'http://192.168.0.25:8080';

// Tipos
interface ComponentForm {
  // Etapa 1: Identificação
  name: string;
  sku: string;
  manufacturer: string;
  categories: string[]; // Mudança: agora é um array para múltiplas categorias
  subcategory: string;
  tags: string[];
  shortDescription: string;
  detailedDescription: string;
  
  // Etapa 2: Parâmetros técnicos (dinâmicos por categoria)
  technicalParams: { [key: string]: any };
  
  // Etapa 3: Estoque e localização
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  eoq: number;
  location: string;
  multiLocations: Location[];
  
  // Etapa 4: Fornecedores e custos
  suppliers: Supplier[];
  standardCost: number;
  lastCost: number;
  avgCost: number;
  
  // Etapa 5: Conformidade e arquivos
  rohs: boolean;
  reach: boolean;
  msl: string;
  esdLevel: string;
  tempMin: number;
  tempMax: number;
  datasheet: string;
  appNotes: string[];
  
  // Etapa 6: Rastreabilidade
  barcode: string;
  generateQR: boolean;
  lotControl: boolean;
  serialization: boolean;
  lots: Lot[];
  
  // Etapa 7: Relacionamentos
  compatibleComponents: string[];
  alternativeComponents: string[];
  usedInProjects: string[];
  
  // Etapa 8: Estado
  status: 'active' | 'review' | 'obsolete' | 'blocked' | 'archived';
  statusReason: string;
}

interface Location {
  id: string;
  building: string;
  lab: string;
  shelf: string;
  drawer: string;
  box: string;
  quantity: number;
}

interface Supplier {
  id: string;
  name: string;
  partNumber: string;
  productLink: string;
  moq: number;
  leadTime: number;
  currency: string;
  priceBreaks: PriceBreak[];
}

interface PriceBreak {
  quantity: number;
  price: number;
}

interface Lot {
  id: string;
  lotNumber: string;
  entryDate: string;
  expiryDate: string;
  quantity: number;
  supplier: string;
  unitCost: number;
  notes: string;
}

// Dados mockados
const categories = [
  'Resistores', 'Capacitores', 'Indutores', 'Diodos', 'Transistores', 
  'IC', 'Conectores', 'Cabos', 'Sensores', 'Mecânicos', 'LEDs', 
  'Motores', 'Microcontroladores', 'Ferramentas'
];

const subcategoriesByCategory: { [key: string]: string[] } = {
  'Resistores': ['SMD/0603', 'SMD/0805', 'SMD/1206', 'Through-hole', 'Variável', 'Potenciômetro'],
  'Capacitores': ['Cerâmico/MLCC', 'Eletrolítico', 'Tântalo', 'Film', 'SMD', 'Variable'],
  'Transistores': ['MOSFET N-Channel', 'MOSFET P-Channel', 'BJT NPN', 'BJT PNP', 'IGBT'],
  'IC': ['MCU', 'Regulador', 'OpAmp', 'Comparador', 'Timer', 'Driver', 'Memory'],
  'Conectores': ['JST', 'Molex', 'Header', 'Terminal Block', 'USB', 'RJ45'],
  'Sensores': ['Temperatura', 'Umidade', 'Pressão', 'Movimento', 'Luz', 'Som'],
};

const technicalParamTemplates: { [key: string]: any[] } = {
  'Resistores': [
    { key: 'resistance', label: 'Resistência (Ω)', type: 'number', unit: 'Ω', required: true },
    { key: 'tolerance', label: 'Tolerância (%)', type: 'number', unit: '%', required: true },
    { key: 'power', label: 'Potência (W)', type: 'number', unit: 'W', required: true },
    { key: 'tcr', label: 'TCR (ppm/°C)', type: 'number', unit: 'ppm/°C' },
    { key: 'package', label: 'Pacote', type: 'select', options: ['0402', '0603', '0805', '1206', 'Through-hole'] },
    { key: 'technology', label: 'Tecnologia', type: 'select', options: ['Thick Film', 'Metal Film', 'Carbon Film'] }
  ],
  'Capacitores': [
    { key: 'capacitance', label: 'Capacitância (F)', type: 'number', unit: 'F', required: true },
    { key: 'tolerance', label: 'Tolerância (%)', type: 'number', unit: '%', required: true },
    { key: 'voltage', label: 'Tensão (V)', type: 'number', unit: 'V', required: true },
    { key: 'dielectric', label: 'Dielétrico', type: 'select', options: ['X7R', 'C0G', 'Y5V', 'Eletrolítico'] },
    { key: 'esr', label: 'ESR (Ω)', type: 'number', unit: 'Ω' },
    { key: 'package', label: 'Pacote', type: 'select', options: ['0402', '0603', '0805', '1206', 'Radial', 'Axial'] }
  ],
  'IC': [
    { key: 'family', label: 'Família', type: 'select', options: ['MCU', 'Regulador', 'OpAmp', 'Comparador', 'Timer'] },
    { key: 'supplyVoltage', label: 'Tensão Alimentação (V)', type: 'number', unit: 'V', required: true },
    { key: 'current', label: 'Corrente (A)', type: 'number', unit: 'A' },
    { key: 'frequency', label: 'Frequência (Hz)', type: 'number', unit: 'Hz' },
    { key: 'interface', label: 'Interface', type: 'select', options: ['I2C', 'SPI', 'UART', 'CAN', 'USB'] },
    { key: 'pins', label: 'Número de Pinos', type: 'number', required: true },
    { key: 'package', label: 'Pacote', type: 'select', options: ['SOIC', 'QFN', 'TQFP', 'DIP', 'BGA'] }
  ]
};

const statusOptions = [
  { value: 'active', label: 'Ativo', color: '#22C55E' },
  { value: 'review', label: 'Em Revisão', color: '#F59E0B' },
  { value: 'obsolete', label: 'Obsoleto', color: '#EF4444' },
  { value: 'blocked', label: 'Bloqueado', color: '#DC2626' },
  { value: 'archived', label: 'Arquivado', color: '#6B7280' }
];

const mslLevels = [
  { value: '1', label: 'MSL 1 - Unlimited' },
  { value: '2', label: 'MSL 2 - 1 Year' },
  { value: '3', label: 'MSL 3 - 168 Hours' },
  { value: '4', label: 'MSL 4 - 72 Hours' },
  { value: '5', label: 'MSL 5 - 48 Hours' },
  { value: '6', label: 'MSL 6 - 6 Hours' }
];

export default function ComponentFormScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ComponentForm>({
    name: '',
    sku: '',
    manufacturer: '',
    categories: [], // Mudança: inicializado como array vazio
    subcategory: '',
    tags: [],
    shortDescription: '',
    detailedDescription: '',
    technicalParams: {},
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    eoq: 0,
    location: '',
    multiLocations: [],
    suppliers: [],
    standardCost: 0,
    lastCost: 0,
    avgCost: 0,
    rohs: false,
    reach: false,
    msl: '1',
    esdLevel: '',
    tempMin: -40,
    tempMax: 85,
    datasheet: '',
    appNotes: [],
    barcode: '',
    generateQR: true,
    lotControl: false,
    serialization: false,
    lots: [],
    compatibleComponents: [],
    alternativeComponents: [],
    usedInProjects: [],
    status: 'active',
    statusReason: '',
  });

  const totalSteps = 8;

  const updateFormData = (field: keyof ComponentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSKU = (name: string, categories: string[]) => {
    const categoryCode = categories.length > 0 ? categories[0].substring(0, 3).toUpperCase() : 'GEN';
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `LAB-${categoryCode}-${nameCode}-${timestamp}`;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          Alert.alert('Erro', 'Nome do componente é obrigatório');
          return false;
        }
        if (!formData.sku.trim()) {
          Alert.alert('Erro', 'SKU é obrigatório');
          return false;
        }
        if (formData.categories.length === 0) {
          Alert.alert('Erro', 'Pelo menos uma categoria é obrigatória');
          return false;
        }
        return true;
      
      case 3:
        if (formData.minStock < 0 || formData.reorderPoint < 0) {
          Alert.alert('Erro', 'Valores de estoque devem ser positivos');
          return false;
        }
        if (!formData.location.trim()) {
          Alert.alert('Erro', 'Localização é obrigatória');
          return false;
        }
        return true;
      
      case 5:
        if (formData.categories.length > 0 && formData.categories.some(cat => cat === 'IC') && !formData.datasheet.trim()) {
          Alert.alert('Erro', 'Datasheet é obrigatório para ICs');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        submitComponent();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitComponent = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        manufacturer: formData.manufacturer,
        categories: formData.categories,
        subcategory: formData.subcategory,
        tags: formData.tags,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        technicalParams: formData.technicalParams,
        currentStock: formData.currentStock,
        minStock: formData.minStock,
        maxStock: formData.maxStock,
        reorderPoint: formData.reorderPoint,
        eoq: formData.eoq,
        location: formData.location,
        multiLocations: formData.multiLocations,
        suppliers: formData.suppliers,
        standardCost: formData.standardCost,
        lastCost: formData.lastCost,
        avgCost: formData.avgCost,
        rohs: formData.rohs,
        reach: formData.reach,
        msl: formData.msl,
        esdLevel: formData.esdLevel,
        tempMin: formData.tempMin,
        tempMax: formData.tempMax,
        datasheet: formData.datasheet,
        appNotes: formData.appNotes,
        barcode: formData.barcode,
        generateQR: formData.generateQR,
        lotControl: formData.lotControl,
        serialization: formData.serialization,
        lots: formData.lots,
        compatibleComponents: formData.compatibleComponents,
        alternativeComponents: formData.alternativeComponents,
        usedInProjects: formData.usedInProjects,
        status: formData.status,
        statusReason: formData.statusReason,
      };

      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('@LabPage:token');

      const res = await fetch(`${API_BASE_URL}/api/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Falha ao salvar componente');
      }

      Alert.alert(
        isEditMode ? 'Componente Atualizado!' : 'Componente Criado!',
        isEditMode ? 'As alterações foram salvas com sucesso.' : 'O componente foi criado e está disponível no sistema.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erro', (error as any)?.message || 'Erro ao salvar componente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stepIndicatorContainer}
      style={{
        backgroundColor: 'transparent',
        maxHeight: 72,
        height: 72,
      }}
    >
      <View style={styles.stepIndicator}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View key={i} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              {
                backgroundColor: i + 1 <= currentStep ? colors.accentPrimary : colors.border,
                borderColor: colors.border
              }
            ]}>
              <Text style={[
                styles.stepNumber,
                { color: i + 1 <= currentStep ? '#000000' : colors.textSecondary }
              ]}>
                {i + 1}
              </Text>
            </View>
            {i < totalSteps - 1 && (
              <View style={[
                styles.stepLine,
                { backgroundColor: i + 1 < currentStep ? colors.accentPrimary : colors.border }
              ]} />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        1. Identificação do Componente
      </Text>
      
      <Input
        label="Nome do Componente *"
        value={formData.name}
        onChangeText={(text) => {
          updateFormData('name', text);
          if (!formData.sku && formData.categories.length > 0) {
            updateFormData('sku', generateSKU(text, formData.categories));
          }
        }}
        placeholder="Ex: Resistor 10kΩ 1% 0603"
      />

      <Input
        label="Código Interno *"
        value={formData.sku}
        onChangeText={(text) => updateFormData('sku', text)}
        placeholder="LAB-RES-10K-0603"
      />

      <Input
        label="Fabricante"
        value={formData.manufacturer}
        onChangeText={(text) => updateFormData('manufacturer', text)}
        placeholder="Ex: Yageo, Vishay, STMicro"
      />

      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Categorias *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  {
                    backgroundColor: formData.categories.includes(category) ? colors.accentPrimary : colors.surface,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => {
                  const newCategories = formData.categories.includes(category)
                    ? formData.categories.filter(c => c !== category)
                    : [...formData.categories, category];
                  
                  updateFormData('categories', newCategories);
                  updateFormData('subcategory', '');
                  updateFormData('technicalParams', {});
                  
                  if (formData.name && newCategories.length > 0) {
                    updateFormData('sku', generateSKU(formData.name, newCategories));
                  }
                }}
              >
                <Text style={[
                  styles.chipText,
                  { color: formData.categories.includes(category) ? '#000000' : colors.textPrimary }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {formData.categories.length > 0 && (
          <Text style={[styles.selectedCategories, { color: colors.textSecondary }]}>
            Selecionadas: {formData.categories.join(', ')}
          </Text>
        )}
      </View>

      {formData.categories.length > 0 && formData.categories.some(cat => subcategoriesByCategory[cat]) && (
        <View style={styles.selectContainer}>
          <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
            Subcategoria
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {formData.categories
                .flatMap(cat => subcategoriesByCategory[cat] || [])
                .filter((subcat, index, arr) => arr.indexOf(subcat) === index) // Remove duplicatas
                .map((subcategory) => (
                <TouchableOpacity
                  key={subcategory}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: formData.subcategory === subcategory ? colors.accentSecondary : colors.surface,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => updateFormData('subcategory', subcategory)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: formData.subcategory === subcategory ? '#000000' : colors.textPrimary }
                  ]}>
                    {subcategory}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <Input
        label="Tags"
        value={formData.tags.join(', ')}
        onChangeText={(text) => updateFormData('tags', text.split(',').map(s => s.trim()).filter(s => s))}
        placeholder="Ex: 0603, 1%, SMD, 5V"
      />

      <Input
        label="Descrição Curta"
        value={formData.shortDescription}
        onChangeText={(text) => updateFormData('shortDescription', text)}
        placeholder="Descrição para listas e cards"
        maxLength={100}
      />

      <Input
        label="Descrição Detalhada"
        value={formData.detailedDescription}
        onChangeText={(text) => updateFormData('detailedDescription', text)}
        placeholder="Descrição completa com especificações técnicas"
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        2. Parâmetros Técnicos
      </Text>
      
      {formData.categories.length > 0 && formData.categories.some(cat => technicalParamTemplates[cat]) ? (
        formData.categories
          .filter(cat => technicalParamTemplates[cat])
          .map(category => (
            <View key={category} style={styles.categoryParamsSection}>
              <Text style={[styles.categoryTitle, { color: colors.textPrimary }]}>
                Parâmetros para {category}
              </Text>
              {technicalParamTemplates[category].map((param) => (
                <View key={`${category}-${param.key}`} style={styles.paramContainer}>
                  {param.type === 'number' ? (
                    <Input
                      label={`${param.label}${param.required ? ' *' : ''}`}
                      value={formData.technicalParams[`${category}_${param.key}`]?.toString() || ''}
                      onChangeText={(text) => {
                        const value = parseFloat(text) || 0;
                        updateFormData('technicalParams', {
                          ...formData.technicalParams,
                          [`${category}_${param.key}`]: value
                        });
                      }}
                      placeholder={`Valor em ${param.unit || ''}`}
                      keyboardType="numeric"
                    />
                  ) : param.type === 'select' ? (
                    <View style={styles.selectContainer}>
                      <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
                        {param.label}{param.required ? ' *' : ''}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.chipContainer}>
                          {param.options.map((option: string) => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: formData.technicalParams[`${category}_${param.key}`] === option ? colors.accentPrimary : colors.surface,
                                  borderColor: colors.border
                                }
                              ]}
                              onPress={() => updateFormData('technicalParams', {
                                ...formData.technicalParams,
                                [`${category}_${param.key}`]: option
                              })}
                            >
                              <Text style={[
                                styles.chipText,
                                { color: formData.technicalParams[`${category}_${param.key}`] === option ? '#000000' : colors.textPrimary }
                              ]}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="settings-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Selecione categorias na etapa anterior
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Os parâmetros técnicos serão exibidos automaticamente
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        3. Estoque e Localização
      </Text>
      
      <Input
        label="Estoque Atual"
        value={formData.currentStock.toString()}
        onChangeText={(text) => updateFormData('currentStock', parseInt(text) || 0)}
        placeholder="Quantidade atual"
        keyboardType="numeric"
        editable={!isEditMode} // Somente leitura em modo de edição
      />

      <Input
        label="Estoque Mínimo *"
        value={formData.minStock.toString()}
        onChangeText={(text) => updateFormData('minStock', parseInt(text) || 0)}
        placeholder="Quantidade mínima"
        keyboardType="numeric"
      />

      <Input
        label="Estoque Máximo"
        value={formData.maxStock.toString()}
        onChangeText={(text) => updateFormData('maxStock', parseInt(text) || 0)}
        placeholder="Quantidade máxima"
        keyboardType="numeric"
      />

      <Input
        label="Ponto de Reposição *"
        value={formData.reorderPoint.toString()}
        onChangeText={(text) => updateFormData('reorderPoint', parseInt(text) || 0)}
        placeholder="Quando reabastecer"
        keyboardType="numeric"
      />

      <Input
        label="Lote Econômico (EOQ)"
        value={formData.eoq.toString()}
        onChangeText={(text) => updateFormData('eoq', parseInt(text) || 0)}
        placeholder="Quantidade ideal de compra"
        keyboardType="numeric"
      />

      <Input
        label="Localização *"
        value={formData.location}
        onChangeText={(text) => updateFormData('location', text)}
        placeholder="Ex: Prédio A / Lab 1 / Estante B / Gaveta 3"
      />

      <View style={styles.multiLocationSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Múltiplas Localizações
        </Text>
        <Button
          title="Adicionar Localização"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Múltiplas Localizações', 'Funcionalidade em desenvolvimento')}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        4. Fornecedores e Custos
      </Text>
      
      <Input
        label="Custo Padrão"
        value={formData.standardCost.toString()}
        onChangeText={(text) => updateFormData('standardCost', parseFloat(text) || 0)}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <Input
        label="Último Custo"
        value={formData.lastCost.toString()}
        onChangeText={(text) => updateFormData('lastCost', parseFloat(text) || 0)}
        placeholder="0.00"
        keyboardType="numeric"
        editable={false} // Somente leitura
      />

      <Input
        label="Custo Médio Móvel"
        value={formData.avgCost.toString()}
        onChangeText={(text) => updateFormData('avgCost', parseFloat(text) || 0)}
        placeholder="0.00"
        keyboardType="numeric"
        editable={false} // Somente leitura
      />

      <View style={styles.suppliersSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
            Fornecedores
          </Text>
          <Button
            title="Adicionar Fornecedor"
            variant="outline"
            size="small"
            onPress={() => Alert.alert('Adicionar Fornecedor', 'Funcionalidade em desenvolvimento')}
          />
        </View>
        
        {formData.suppliers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="business-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Nenhum fornecedor cadastrado
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Adicione fornecedores para facilitar compras
            </Text>
          </View>
        ) : (
          <View style={styles.suppliersList}>
            {/* Lista de fornecedores seria renderizada aqui */}
          </View>
        )}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        5. Conformidade e Arquivos
      </Text>
      
      <View style={styles.complianceSection}>
        <View style={styles.switchItem}>
          <View style={styles.switchContent}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              RoHS Compliant
            </Text>
            <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
              Restriction of Hazardous Substances
            </Text>
          </View>
          <Switch
            value={formData.rohs}
            onValueChange={(value) => updateFormData('rohs', value)}
            trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
            thumbColor={formData.rohs ? colors.accentPrimary : colors.textSecondary}
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchContent}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              REACH Compliant
            </Text>
            <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
              Registration, Evaluation, Authorization of Chemicals
            </Text>
          </View>
          <Switch
            value={formData.reach}
            onValueChange={(value) => updateFormData('reach', value)}
            trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
            thumbColor={formData.reach ? colors.accentPrimary : colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          MSL (Moisture Sensitivity Level)
        </Text>
        {mslLevels.map((msl) => (
          <TouchableOpacity
            key={msl.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.msl === msl.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('msl', msl.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.msl === msl.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.msl === msl.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <Text style={[styles.radioText, { color: colors.textPrimary }]}>
              {msl.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Nível ESD"
        value={formData.esdLevel}
        onChangeText={(text) => updateFormData('esdLevel', text)}
        placeholder="Ex: Classe 1, 2, 3"
      />

      <View style={styles.temperatureSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Temperatura de Operação
        </Text>
        <View style={styles.temperatureInputs}>
          <Input
            label="Mín (°C)"
            value={formData.tempMin.toString()}
            onChangeText={(text) => updateFormData('tempMin', parseInt(text) || -40)}
            keyboardType="numeric"
            style={styles.halfInput}
          />
          <Input
            label="Máx (°C)"
            value={formData.tempMax.toString()}
            onChangeText={(text) => updateFormData('tempMax', parseInt(text) || 85)}
            keyboardType="numeric"
            style={styles.halfInput}
          />
        </View>
      </View>

      <Input
        label="Datasheet (URL)"
        value={formData.datasheet}
        onChangeText={(text) => updateFormData('datasheet', text)}
        placeholder="https://..."
        keyboardType="url"
      />

      <View style={styles.filesSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Notas de Aplicação
        </Text>
        <Button
          title="Adicionar Documento"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Adicionar Documento', 'Funcionalidade em desenvolvimento')}
        />
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        6. Rastreabilidade
      </Text>
      
      <Input
        label="Código de Barras (EAN/UPC)"
        value={formData.barcode}
        onChangeText={(text) => updateFormData('barcode', text)}
        placeholder="Código de barras existente"
      />

      <View style={styles.switchItem}>
        <View style={styles.switchContent}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
            Gerar QR Code
          </Text>
          <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
            Código QR com SKU e informações básicas
          </Text>
        </View>
        <Switch
          value={formData.generateQR}
          onValueChange={(value) => updateFormData('generateQR', value)}
          trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
          thumbColor={formData.generateQR ? colors.accentPrimary : colors.textSecondary}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchContent}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
            Controle por Lote
          </Text>
          <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
            Rastreamento de lotes com datas e fornecedores
          </Text>
        </View>
        <Switch
          value={formData.lotControl}
          onValueChange={(value) => updateFormData('lotControl', value)}
          trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
          thumbColor={formData.lotControl ? colors.accentPrimary : colors.textSecondary}
        />
      </View>

      <View style={styles.switchItem}>
        <View style={styles.switchContent}>
          <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
            Serialização
          </Text>
          <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
            Controle individual por número de série
          </Text>
        </View>
        <Switch
          value={formData.serialization}
          onValueChange={(value) => updateFormData('serialization', value)}
          trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
          thumbColor={formData.serialization ? colors.accentPrimary : colors.textSecondary}
        />
      </View>

      {formData.lotControl && (
        <View style={styles.lotsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
              Lotes
            </Text>
            <Button
              title="Adicionar Lote"
              variant="outline"
              size="small"
              onPress={() => Alert.alert('Adicionar Lote', 'Funcionalidade em desenvolvimento')}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderStep7 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        7. Relacionamentos
      </Text>
      
      <View style={styles.relationshipsSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Componentes Compatíveis
        </Text>
        <Input
          value={formData.compatibleComponents.join(', ')}
          onChangeText={(text) => updateFormData('compatibleComponents', text.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="SKUs de componentes compatíveis"
        />
      </View>

      <View style={styles.relationshipsSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Componentes Alternativos
        </Text>
        <Input
          value={formData.alternativeComponents.join(', ')}
          onChangeText={(text) => updateFormData('alternativeComponents', text.split(',').map(s => s.trim()).filter(s => s))}
          placeholder="SKUs de componentes substitutos"
        />
      </View>

      <View style={styles.relationshipsSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Usado em Projetos
        </Text>
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="folder-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Nenhum projeto utilizando
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Os projetos aparecerão automaticamente quando utilizarem este componente
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep8 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        8. Estado e Finalização
      </Text>
      
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Status do Componente
        </Text>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.status === status.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('status', status.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.status === status.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.status === status.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <View style={styles.statusContent}>
              <Text style={[styles.radioText, { color: colors.textPrimary }]}>
                {status.label}
              </Text>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {formData.status !== 'active' && (
        <Input
          label="Motivo/Observação"
          value={formData.statusReason}
          onChangeText={(text) => updateFormData('statusReason', text)}
          placeholder="Razão para o status atual"
          multiline
          numberOfLines={3}
        />
      )}

      <View style={styles.summarySection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Resumo do Componente
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            <Text style={styles.summaryLabel}>Nome: </Text>{formData.name || 'Não informado'}
          </Text>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            <Text style={styles.summaryLabel}>SKU: </Text>{formData.sku || 'Não informado'}
          </Text>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            <Text style={styles.summaryLabel}>Categorias: </Text>{formData.categories.length > 0 ? formData.categories.join(', ') : 'Não informado'}
          </Text>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            <Text style={styles.summaryLabel}>Estoque Mín: </Text>{formData.minStock}
          </Text>
          <Text style={[styles.summaryText, { color: colors.textPrimary }]}>
            <Text style={styles.summaryLabel}>Localização: </Text>{formData.location || 'Não informado'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>
            {isEditMode ? 'Editar Componente' : 'Novo Componente'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => Alert.alert('Ações', 'Scanner / Import')}>
          <Ionicons name="qr-code-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <Button
              title="Anterior"
              variant="secondary"
              onPress={prevStep}
              style={styles.navButton}
            />
          )}
          
          <Button
            title={currentStep === totalSteps ? (loading ? "Salvando..." : (isEditMode ? "Atualizar" : "Criar Componente")) : "Próximo"}
            onPress={nextStep}
            loading={loading}
            style={[styles.navButton, styles.primaryButton]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepIndicatorContainer: {
    maxHeight: 72,
    height: 72,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    maxHeight: 72,
    height: 72,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  selectContainer: {
    marginBottom: 20,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategories: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  paramContainer: {
    marginBottom: 16,
  },
  categoryParamsSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#00E5FF',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  multiLocationSection: {
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  suppliersSection: {
    marginTop: 20,
  },
  suppliersList: {
    // Estilos para lista de fornecedores
  },
  complianceSection: {
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 14,
  },
  temperatureSection: {
    marginBottom: 20,
  },
  temperatureInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  filesSection: {
    marginTop: 20,
  },
  lotsSection: {
    marginTop: 20,
  },
  relationshipsSection: {
    marginBottom: 20,
  },
  summarySection: {
    marginTop: 20,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
    backgroundColor: 'transparent',
  },
  navButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
}); 