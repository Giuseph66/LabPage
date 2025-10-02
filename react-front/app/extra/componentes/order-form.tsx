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
import { ComponentPicker } from '@/components/ui/ComponentPicker';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// API helper
import { API_BASE_URL } from '@/env';

// Tipos
interface OrderForm {
  // Etapa 1: Cabeçalho
  orderNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'quotation' | 'purchase' | 'transport' | 'partial_received' | 'received' | 'completed' | 'rejected' | 'cancelled';
  requester: string;
  department: string;
  projectId?: string;
  costCenter: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  desiredDate: string;
  orderType: 'external_purchase' | 'stock_withdrawal' | 'lab_transfer';
  
  // Etapa 2: Itens
  items: OrderItem[];
  
  // Etapa 3: Fornecedores
  purchaseMode: 'multiple_quotation' | 'single_supplier' | 'internal_stock';
  suppliers: Supplier[];
  selectedSupplier?: string;
  
  // Etapa 4: Anexos
  attachments: Attachment[];
  comments: Comment[];
  
  // Etapa 5: Financeiro
  subtotal: number;
  discounts: number;
  shipping: number;
  taxes: number;
  total: number;
  currency: 'BRL' | 'USD' | 'EUR';
  
  // Etapa 6: Aprovação
  approvals: Approval[];
  currentApprovalLevel: number;
}

interface OrderItem {
  id: string;
  componentId?: string;
  componentName: string;
  sku: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  availability: 'in_stock' | 'reserved' | 'out_of_stock';
  preferredSupplier: string;
  unitPrice: number;
  currency: 'BRL' | 'USD' | 'EUR';
  leadTime: number;
  taxes: number;
  subtotal: number;
  attachment?: string;
  observation: string;
  acceptsEquivalent: boolean;
  link_compra: string;
}

interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  contact: string;
  email: string;
  website?: string;
  leadTime: number;
  shippingCost: number;
  conditions: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  mentions: string[];
}

interface Approval {
  id: string;
  level: number;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  date?: string;
}

// Função para buscar componentes da API
const fetchComponents = async (): Promise<any[]> => {
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
      id: item.id?.toString(),
      name: item.name || '',
      sku: item.partNumber || '',
      description: item.description || '',
      category: item.category || '',
      unit: 'un', // Unidade padrão
      inStock: item.currentStock || 0,
      unitPrice: item.standardCost || 0,
      preferredSupplier: item.manufacturer || 'Não informado',
      leadTime: 7, // Lead time padrão
      link_compra: item.datasheet || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar componentes:', error);
    throw error;
  }
};

const mockSuppliers = [
  {
    id: '1',
    name: 'Mouser Electronics',
    cnpj: '12.345.678/0001-90',
    contact: 'João Silva',
    email: 'joao@mouser.com',
    website: 'www.mouser.com',
    leadTime: 7,
    shippingCost: 25.00,
    conditions: 'Pagamento em 30 dias',
  },
  {
    id: '2',
    name: 'Digi-Key',
    cnpj: '98.765.432/0001-10',
    contact: 'Maria Santos',
    email: 'maria@digikey.com',
    website: 'www.digikey.com',
    leadTime: 5,
    shippingCost: 30.00,
    conditions: 'Pagamento antecipado',
  },
];

const statusOptions = [
  { value: 'draft', label: 'Rascunho', color: '#6B7280' },
  { value: 'pending', label: 'Em Aprovação', color: '#F59E0B' },
  { value: 'approved', label: 'Aprovado', color: '#22C55E' },
  { value: 'quotation', label: 'Cotação', color: '#3B82F6' },
  { value: 'purchase', label: 'Compra', color: '#8B5CF6' },
  { value: 'transport', label: 'Em Transporte', color: '#F97316' },
  { value: 'received', label: 'Recebido', color: '#10B981' },
  { value: 'completed', label: 'Concluído', color: '#059669' },
  { value: 'rejected', label: 'Reprovado', color: '#EF4444' },
  { value: 'cancelled', label: 'Cancelado', color: '#6B7280' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa', color: '#22C55E' },
  { value: 'medium', label: 'Média', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#F97316' },
  { value: 'critical', label: 'Crítica', color: '#EF4444' },
];

const orderTypeOptions = [
  { value: 'external_purchase', label: 'Compra Externa' },
  { value: 'stock_withdrawal', label: 'Retirada do Estoque' },
  { value: 'lab_transfer', label: 'Transferência entre Labs' },
];

const purchaseModeOptions = [
  { value: 'multiple_quotation', label: 'Cotação Múltipla' },
  { value: 'single_supplier', label: 'Fornecedor Único' },
  { value: 'internal_stock', label: 'Estoque Interno' },
];

const units = ['un', 'pct', 'rolo', 'tubo', 'kg', 'm', 'cm'];

export default function OrderFormScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [componentsLoading, setComponentsLoading] = useState(false);
  
  const [formData, setFormData] = useState<OrderForm>({
    orderNumber: generateOrderNumber(),
    status: 'draft',
    requester: user?.nome || '',
    department: '',
    projectId: '',
    costCenter: '',
    priority: 'medium',
    createdAt: new Date().toISOString().split('T')[0],
    desiredDate: '',
    orderType: 'external_purchase',
    items: [],
    purchaseMode: 'multiple_quotation',
    suppliers: [],
    selectedSupplier: '',
    attachments: [],
    comments: [],
    subtotal: 0,
    discounts: 0,
    shipping: 0,
    taxes: 0,
    total: 0,
    currency: 'BRL',
    approvals: [],
    currentApprovalLevel: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [itemsError, setItemsError] = useState<string>('');

  const totalSteps = 5;

  // Carregar componentes ao montar o componente
  React.useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setComponentsLoading(true);
      const data = await fetchComponents();
      setComponents(data);
    } catch (error) {
      console.error('Erro ao carregar componentes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os componentes');
    } finally {
      setComponentsLoading(false);
    }
  };

  function generateOrderNumber() {
    const timestamp = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9999) + 1;
    return `PED-${timestamp}-${random.toString().padStart(4, '0')}`;
  }

  const updateFormData = (field: keyof OrderForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      componentName: '',
      sku: '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'un',
      availability: 'out_of_stock',
      preferredSupplier: '',
      unitPrice: 0,
      currency: 'BRL',
      leadTime: 0,
      taxes: 0,
      subtotal: 0,
      observation: '',
      link_compra:'',
      acceptsEquivalent: false,
    };
    
    updateFormData('items', [...formData.items, newItem]);
  };

  const removeItem = (itemId: string) => {
    updateFormData('items', formData.items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof OrderItem, value: any) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        // Recalcular subtotal
        updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
        return updatedItem;
      }
      return item;
    });
    
    updateFormData('items', updatedItems);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + formData.shipping + formData.taxes - formData.discounts;
    
    updateFormData('subtotal', subtotal);
    updateFormData('total', total);
  };

  const openComponentSelector = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowComponentModal(true);
  };

  const handleComponentSelect = (component: any) => {
    console.log('=== DEBUG COMPONENT SELECTION ===');
    console.log('Componente selecionado:', component);
    console.log('selectedItemId:', selectedItemId);
    console.log('Items antes da atualização:', formData.items);
    
    if (selectedItemId && component && component.id) {
      const updatedItems = formData.items.map(item => {
        if (item.id === selectedItemId) {
          const updatedItem = {
            ...item,
            componentId: component.id,
            componentName: component.name || '',
            sku: component.sku || '',
            description: component.description || '',
            category: component.category || '',
            unit: component.unit || 'un',
            unitPrice: component.unitPrice || 0,
            preferredSupplier: component.preferredSupplier || '',
            availability: (component.inStock || 0) > 0 ? 'in_stock' : 'out_of_stock',
            subtotal: item.quantity * (component.unitPrice || 0),
            link_compra: component.link_compra || '',
          };
          console.log('Item atualizado:', updatedItem);
          return updatedItem;
        }
        return item;
      });
      
      console.log('Items após atualização:', updatedItems);
      updateFormData('items', updatedItems as OrderItem[]);
      calculateTotals(updatedItems as OrderItem[]);
      
      // Limpar erro de validação se existir
      setItemsError('');
    } else {
      console.log('ERRO: selectedItemId ou component inválido');
      console.log('selectedItemId:', selectedItemId);
      console.log('component:', component);
    }
    
    setSelectedItemId(null);
    setShowComponentModal(false);
  };

  const navigateToComponentForm = () => {
    setShowComponentModal(false);
    router.push('/extra/componentes/component-form');
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let ok = true;
    switch (step) {
      case 1:
        if (!formData.requester.trim()) {
          newErrors.requester = 'Obrigatório';
          ok = false;
        }
        if (!formData.department.trim()) {
          newErrors.department = 'Obrigatório';
          ok = false;
        }
        if (!formData.desiredDate) {
          newErrors.desiredDate = 'Obrigatório';
          ok = false;
        }
        setErrors(prev => ({ ...prev, ...newErrors }));
        return ok;
      
      case 2:
        setItemsError('');
        if (formData.items.length === 0) {
          setItemsError('Pelo menos um item é obrigatório');
          return false;
        }
        for (const item of formData.items) {
          if (!item.componentName.trim()) {
            setItemsError('Nome do componente é obrigatório em todos os itens');
            return false;
          }
          if (item.quantity <= 0) {
            setItemsError('Quantidade deve ser maior que zero em todos os itens');
            return false;
          }
        }
        return true;
      
      case 3:
        if (formData.purchaseMode === 'single_supplier' && !formData.selectedSupplier) {
          setErrors(prev => ({ ...prev, selectedSupplier: 'Selecione um fornecedor' }));
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
        submitOrder();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        orderNumber: formData.orderNumber,
        status: formData.status,
        requester: formData.requester,
        department: formData.department,
        projectId: formData.projectId,
        costCenter: formData.costCenter,
        priority: formData.priority,
        desiredDate: formData.desiredDate,
        orderType: formData.orderType,
        items: formData.items.map(i => ({
          componentId: i.componentId,
          componentName: i.componentName,
          sku: i.sku,
          description: i.description,
          category: i.category,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
          currency: i.currency,
          preferredSupplier: i.preferredSupplier,
          leadTime: i.leadTime,
          link_compra: i.link_compra,
          acceptsEquivalent: i.acceptsEquivalent,
          observation: i.observation,
        })),
        purchaseMode: formData.purchaseMode,
        suppliers: formData.suppliers,
        selectedSupplier: formData.selectedSupplier,
        attachments: formData.attachments,
        comments: formData.comments,
        subtotal: formData.subtotal,
        discounts: formData.discounts,
        shipping: formData.shipping,
        taxes: formData.taxes,
        total: formData.total,
        currency: formData.currency,
      };

      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('@LabPage:token');

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Falha ao criar pedido');
      }

      Alert.alert('Pedido Criado!', 'Seu pedido foi criado com sucesso e está aguardando aprovação.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erro', (error as any)?.message || 'Erro ao criar pedido. Tente novamente.');
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
        1. Cabeçalho do Pedido
      </Text>
      
      {/* Número do Pedido e Status */}
      <View style={styles.headerRow}>
        <View style={styles.orderNumberContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Número do Pedido
          </Text>
          <Text style={[styles.orderNumber, { color: colors.accentPrimary }]}>
            {formData.orderNumber}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Status
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: statusOptions.find(s => s.value === formData.status)?.color + '20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: statusOptions.find(s => s.value === formData.status)?.color }
            ]}>
              {statusOptions.find(s => s.value === formData.status)?.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Solicitante e Setor */}
      <View style={styles.row}>
        <Input
          label="Solicitante *"
          value={formData.requester}
          onChangeText={(text) => updateFormData('requester', text)}
          placeholder="Nome do solicitante"
          error={errors.requester}
          style={styles.halfInput}
        />
        
        <Input
          label="Setor/Turma *"
          value={formData.department}
          onChangeText={(text) => updateFormData('department', text)}
          placeholder="Departamento ou turma"
          error={errors.department}
          style={styles.halfInput}
        />
      </View>

      {/* Projeto e Centro de Custo */}
      <View style={styles.row}>
        <Input
          label="Projeto (Opcional)"
          value={formData.projectId}
          onChangeText={(text) => updateFormData('projectId', text)}
          placeholder="Código do projeto"
          style={styles.halfInput}
        />
        
        <Input
          label="Centro de Custo"
          value={formData.costCenter}
          onChangeText={(text) => updateFormData('costCenter', text)}
          placeholder="Código do centro de custo"
          style={styles.halfInput}
        />
      </View>

      {/* Prioridade */}
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Prioridade
        </Text>
        <View style={styles.priorityGrid}>
          {priorityOptions.map((priority) => (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.priorityOption,
                {
                  backgroundColor: formData.priority === priority.value ? colors.accentPrimary + '20' : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => updateFormData('priority', priority.value)}
            >
              <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
              <Text style={[styles.priorityText, { color: colors.textPrimary }]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Datas */}
      <View style={styles.row}>
        <DateInput
          label="Data de Criação"
          value={formData.createdAt}
          onChange={(dateStr) => updateFormData('createdAt', dateStr)}
          placeholder="Data de criação"
        />
        
        <DateInput
          label="Data Desejada *"
          value={formData.desiredDate}
          onChange={(dateStr) => updateFormData('desiredDate', dateStr)}
          placeholder="Data desejada"
          error={errors.desiredDate}
        />
      </View>

      {/* Tipo de Pedido */}
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Tipo de Pedido
        </Text>
        {orderTypeOptions.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.orderType === type.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('orderType', type.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.orderType === type.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.orderType === type.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <Text style={[styles.radioText, { color: colors.textPrimary }]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        2. Itens do Pedido
      </Text>
      
      <View style={styles.itemsHeader}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Lista de Itens ({formData.items.length})
        </Text>
        <View style={styles.itemsHeaderButtons}>
          <Button
            title="Adicionar Item"
            variant="outline"
            size="small"
            onPress={addItem}
            style={styles.headerButton}
          />
        </View>
      </View>

      {formData.items.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="cart-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Nenhum item adicionado
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Adicione os componentes necessários para o pedido
          </Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {formData.items.map((item, index) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemNumber, { color: colors.accentPrimary }]}>
                  Item {index + 1}
                </Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.componentSelectorContainer}>
                <Text style={[styles.componentSelectorLabel, { color: colors.textPrimary }]}>
                    Componente *
                </Text>
                <TouchableOpacity
                  style={[styles.componentSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => openComponentSelector(item.id)}
                >
                  <View style={styles.componentSelectorContent}>
                    <Text style={[
                      styles.componentSelectorValue,
                      { color: item.componentName ? colors.textPrimary : colors.textSecondary }
                    ]}>
                      {item.componentName || 'Selecionar componente'}
                    </Text>
                    {!item.componentName && (
                      <Text style={[styles.componentHint, { color: colors.accentPrimary }]}>
                        Toque para buscar ou cadastrar
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                </View>
                <Input
                  label="SKU"
                  value={item.sku}
                  onChangeText={(text) => updateItem(item.id, 'sku', text)}
                  placeholder="Código SKU"
                  style={styles.halfInput}
                  editable={false}
                />
              </View>

              <Input
                label="Descrição"
                value={item.description}
                onChangeText={(text) => updateItem(item.id, 'description', text)}
                placeholder="Descrição do componente"
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <Input
                  label="Quantidade *"
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateItem(item.id, 'quantity', parseInt(text) || 0)}
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.quarterInput}
                />
                
                <View style={styles.unitContainer}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>
                    Unidade
                  </Text>
                  <View style={[styles.unitDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.unitText, { color: colors.textPrimary }]}>
                      {item.unit}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                  </View>
                </View>
                
                <Input
                  label="Preço Unit."
                  value={item.unitPrice.toString()}
                  onChangeText={(text) => updateItem(item.id, 'unitPrice', parseFloat(text) || 0)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={styles.quarterInput}
                />
                
                <Input
                  label="Subtotal"
                  value={`R$ ${item.subtotal.toFixed(2)}`}
                  editable={false}
                  style={styles.quarterInput}
                />
              </View>

              <View style={styles.row}>
                <Input
                  label="Fornecedor"
                  value={item.preferredSupplier}
                  onChangeText={(text) => updateItem(item.id, 'preferredSupplier', text)}
                  placeholder="Fornecedor"
                  style={styles.halfInput}
                />
                
                <Input
                  label="Prazo de entrega (dias)"
                  value={item.leadTime.toString()}
                  onChangeText={(text) => updateItem(item.id, 'leadTime', parseInt(text) || 0)}
                  placeholder="0"
                  keyboardType="numeric"
                  style={styles.halfInput}
                />
              </View>
                <Input
                  label="Link de compra"
                  value={item.link_compra}
                  onChangeText={(text) => updateItem(item.id, 'link_compra', text)}
                  placeholder="Link de compra"
                  style={styles.halfInput}
                />
              <View style={styles.switchItem}>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
                  Aceita equivalente
                </Text>
                <Switch
                  value={item.acceptsEquivalent}
                  onValueChange={(value) => updateItem(item.id, 'acceptsEquivalent', value)}
                  trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
                  thumbColor={item.acceptsEquivalent ? colors.accentPrimary : colors.textSecondary}
                />
              </View>
            </View>
          ))}
        </View>
      )}
      {!!itemsError && (
        <Text style={{ color: colors.error, marginTop: 8 }}>{itemsError}</Text>
      )}

      {/* Resumo */}
      {formData.items.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
            Resumo do Pedido
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total de itens:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {formData.items.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total de unidades:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {formData.items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Valor estimado:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.accentPrimary, fontWeight: 'bold' }]}>
              R$ {formData.subtotal.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        3. Fornecedores & Cotações
      </Text>
      
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Modo de Compra
        </Text>
        {purchaseModeOptions.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.purchaseMode === mode.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('purchaseMode', mode.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.purchaseMode === mode.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.purchaseMode === mode.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <Text style={[styles.radioText, { color: colors.textPrimary }]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.purchaseMode === 'single_supplier' && (
        <View style={styles.selectContainer}>
          <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
            Fornecedor Selecionado *
          </Text>
          {mockSuppliers.map((supplier) => (
            <TouchableOpacity
              key={supplier.id}
              style={[
                styles.supplierOption,
                {
                  backgroundColor: formData.selectedSupplier === supplier.id ? colors.accentPrimary + '20' : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => updateFormData('selectedSupplier', supplier.id)}
            >
              <View style={[
                styles.radioCircle,
                {
                  borderColor: formData.selectedSupplier === supplier.id ? colors.accentPrimary : colors.border
                }
              ]}>
                {formData.selectedSupplier === supplier.id && (
                  <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
                )}
              </View>
              <View style={styles.supplierInfo}>
                <Text style={[styles.supplierName, { color: colors.textPrimary }]}>
                  {supplier.name}
                </Text>
                <Text style={[styles.supplierDetails, { color: colors.textSecondary }]}>
                  {supplier.contact} • {supplier.email}
                </Text>
                <Text style={[styles.supplierDetails, { color: colors.textSecondary }]}>
                  Lead time: {supplier.leadTime} dias • Frete: R$ {supplier.shippingCost.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.suppliersSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Lista de Fornecedores
        </Text>
        <Button
          title="Adicionar Fornecedor"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Adicionar Fornecedor', 'Funcionalidade em desenvolvimento')}
        />
      </View>

      {mockSuppliers.map((supplier) => (
        <View key={supplier.id} style={[styles.supplierCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.supplierCardHeader}>
            <Text style={[styles.supplierCardName, { color: colors.textPrimary }]}>
              {supplier.name}
            </Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.supplierCardDetails}>
            <Text style={[styles.supplierCardText, { color: colors.textSecondary }]}>
              Contato: {supplier.contact}
            </Text>
            <Text style={[styles.supplierCardText, { color: colors.textSecondary }]}>
              Email: {supplier.email}
            </Text>
            <Text style={[styles.supplierCardText, { color: colors.textSecondary }]}>
              Lead Time: {supplier.leadTime} dias
            </Text>
            <Text style={[styles.supplierCardText, { color: colors.textSecondary }]}>
              Frete: R$ {supplier.shippingCost.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        3. Anexos e Comunicação
      </Text>
      
      <View style={styles.attachmentsSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Anexos do Pedido
        </Text>
        <Button
          title="Adicionar Anexo"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Adicionar Anexo', 'Funcionalidade em desenvolvimento')}
        />
      </View>

      {formData.attachments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="document-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Nenhum anexo adicionado
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
            Adicione documentos, justificativas ou outros arquivos
          </Text>
        </View>
      ) : (
        <View style={styles.attachmentsList}>
          {/* Lista de anexos seria renderizada aqui */}
        </View>
      )}

      <View style={styles.commentsSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Comentários
        </Text>
        <Input
          label="Adicionar Comentário"
          placeholder="Digite seu comentário..."
          multiline
          numberOfLines={3}
        />
        <Button
          title="Enviar Comentário"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Comentário', 'Funcionalidade em desenvolvimento')}
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        4. Resumo Financeiro
      </Text>
      
      <View style={[styles.financialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.financialTitle, { color: colors.textPrimary }]}>
          Resumo Financeiro
        </Text>
        
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
            Subtotal dos itens:
          </Text>
          <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
            R$ {formData.subtotal.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
            Descontos:
          </Text>
          <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
            R$ {formData.discounts.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
            Frete:
          </Text>
          <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
            R$ {formData.shipping.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>
            Impostos/Taxas:
          </Text>
          <Text style={[styles.financialValue, { color: colors.textPrimary }]}>
            R$ {formData.taxes.toFixed(2)}
          </Text>
        </View>
        
        <View style={[styles.financialRow, styles.totalRow]}>
          <Text style={[styles.financialLabel, { color: colors.textPrimary, fontWeight: 'bold' }]}>
            Total:
          </Text>
          <Text style={[styles.financialValue, { color: colors.accentPrimary, fontWeight: 'bold', fontSize: 18 }]}>
            R$ {formData.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.currencySection}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Moeda do Pedido
        </Text>
        <View style={styles.currencyOptions}>
          {['BRL', 'USD', 'EUR'].map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyOption,
                {
                  backgroundColor: formData.currency === currency ? colors.accentPrimary + '20' : colors.surface,
                  borderColor: colors.border
                }
              ]}
              onPress={() => updateFormData('currency', currency as 'BRL' | 'USD' | 'EUR')}
            >
              <Text style={[styles.currencyText, { color: colors.textPrimary }]}>
                {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        5. Fluxo de Aprovação
      </Text>
      
      <View style={styles.approvalSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Fluxo de Aprovação
        </Text>
        
        <View style={styles.approvalFlow}>
          <View style={[styles.approvalStep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.approvalStepIcon, { backgroundColor: colors.accentPrimary }]}>
              <Ionicons name="checkmark" size={16} color="#000000" />
            </View>
            <Text style={[styles.approvalStepText, { color: colors.textPrimary }]}>
              Rascunho
            </Text>
          </View>
          
          <View style={[styles.approvalStep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.approvalStepIcon, { backgroundColor: colors.border }]}>
              <Text style={[styles.approvalStepNumber, { color: colors.textSecondary }]}>
                1
              </Text>
            </View>
            <Text style={[styles.approvalStepText, { color: colors.textSecondary }]}>
              Aprovação Técnica
            </Text>
          </View>
          
          <View style={[styles.approvalStep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.approvalStepIcon, { backgroundColor: colors.border }]}>
              <Text style={[styles.approvalStepNumber, { color: colors.textSecondary }]}>
                2
              </Text>
            </View>
            <Text style={[styles.approvalStepText, { color: colors.textSecondary }]}>
              Aprovação Financeira
            </Text>
          </View>
          
          <View style={[styles.approvalStep, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.approvalStepIcon, { backgroundColor: colors.border }]}>
              <Text style={[styles.approvalStepNumber, { color: colors.textSecondary }]}>
                3
              </Text>
            </View>
            <Text style={[styles.approvalStepText, { color: colors.textSecondary }]}>
              Compra
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.workflowSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Estados do Pedido
        </Text>
        
        <View style={styles.workflowStates}>
          {statusOptions.map((status) => (
            <View key={status.value} style={[styles.workflowState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.workflowStateDot, { backgroundColor: status.color }]} />
              <Text style={[styles.workflowStateText, { color: colors.textPrimary }]}>
                {status.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep4();
      case 4: return renderStep5();
      case 5: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Novo Pedido</Text>
          </View>
        </View>

        <View style={styles.mainContainer}>
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={true}
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
              title={currentStep === totalSteps ? (loading ? "Criando..." : "Criar Pedido") : "Próximo"}
              onPress={nextStep}
              loading={loading}
              style={[styles.navButton, styles.primaryButton]}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Component Picker Modal */}
      <ComponentPicker
        visible={showComponentModal}
        onClose={() => setShowComponentModal(false)}
        onSelect={handleComponentSelect}
        components={components}
        loading={componentsLoading}
        onNavigateToComponentForm={navigateToComponentForm}
      />
    </>
  );
} const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
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
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    minWidth: '100%',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumberContainer: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  quarterInput: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
  },
  unitDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectContainer: {
    marginBottom: 20,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
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
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsHeaderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    flex: 1,
    maxWidth: '60%',
},
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  itemsList: {
    gap: 16,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  supplierOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supplierDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  suppliersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplierCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  supplierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  supplierCardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  supplierCardDetails: {
    gap: 4,
  },
  supplierCardText: {
    fontSize: 14,
  },
  attachmentsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachmentsList: {
    gap: 12,
  },
  commentsSection: {
    marginTop: 20,
  },
  financialCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  currencySection: {
    marginBottom: 20,
  },
  currencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  approvalSection: {
    marginBottom: 20,
  },
  approvalFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  approvalStep: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  approvalStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalStepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  approvalStepText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  workflowSection: {
    marginTop: 20,
  },
  workflowStates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  workflowState: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  workflowStateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  workflowStateText: {
    fontSize: 12,
    fontWeight: '500',
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
  componentSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  componentSelectorContent: {
    flex: 1,
  },
  componentSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  componentSelectorValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  componentHint: {
    fontSize: 12,
    marginTop: 2,
  },
  componentSelectorContainer: {
    flex: 1,
    maxWidth: '60%',
  },
}); 

