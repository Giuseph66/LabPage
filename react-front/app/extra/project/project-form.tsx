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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// API helper
const API_BASE_URL = 'http://192.168.0.25:8080';

// Tipos
interface ProjectForm {
  // Etapa 1: Identificação
  name: string;
  code: string;
  shortDescription: string;
  detailedDescription: string;
  categories: string[]; // Mudança: agora é um array para múltiplas categorias
  tags: string[];
  visibility: 'private' | 'lab' | 'public';
  
  // Etapa 2: Equipe
  responsible: string;
  advisor: string;
  members: ProjectMember[];
  externalPartners: string;
  
  // Etapa 3: Datas e Fase
  plannedStart: string;
  plannedEnd: string;
  phase: 'ideation' | 'planning' | 'prototype' | 'testing' | 'pilot' | 'production' | 'completed';
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  milestones: Milestone[];
  
  // Etapa 4: Recursos
  laboratories: string[];
  criticalResources: string[];
  safetyChecklist: SafetyItem[];
  risks: string;
  
  // Etapa 5: Materiais
  materials: Material[];
  
  // Etapa 6: Arquivos
  gitRepository: string;
  fileStorage: string;
  documents: string[];
  
  // Etapa 7: Orçamento
  costCenter: string;
  fundingSource: string;
  budget: number;
  expenses: Expense[];
  
  // Etapa 8: Conformidade
  lgpdCompliance: boolean;
  ethicsProtocol: string;
  licenses: string[];
  policiesAccepted: boolean;
}

interface ProjectMember {
  id: string;
  name: string;
  role: string;
  workload: number;
  contact: string;
  permissions: string[];
}

interface Milestone {
  id: string;
  title: string;
  plannedDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  attachment?: string;
}

interface SafetyItem {
  id: string;
  description: string;
  required: boolean;
  checked: boolean;
}

interface Material {
  id: string;
  name: string;
  stockCode: string;
  quantity: number;
  unit: string;
  available: boolean;
  unitCost: number;
  supplier: string;
  critical: boolean;
}

interface Expense {
  id: string;
  item: string;
  value: number;
  date: string;
  category: string;
  receipt?: string;
}

// Dados mockados
const categories = [
  'Eletrônica', 'Software', 'Mecatrônica', 'IoT', 'Impressão 3D', 
  'Robótica', 'Automação', 'Sensores', 'Telecomunicações', 'Energia'
];

const phases = [
  { value: 'ideation', label: 'Ideação' },
  { value: 'planning', label: 'Planejamento' },
  { value: 'prototype', label: 'Protótipo' },
  { value: 'testing', label: 'Testes' },
  { value: 'pilot', label: 'Piloto' },
  { value: 'production', label: 'Produção' },
  { value: 'completed', label: 'Concluído' }
];

const priorities = [
  { value: 'low', label: 'Baixa', color: '#22C55E' },
  { value: 'medium', label: 'Média', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#F97316' },
  { value: 'critical', label: 'Crítica', color: '#EF4444' }
];

const visibilities = [
  { value: 'private', label: 'Privado (Equipe)' },
  { value: 'lab', label: 'Lab (Interno)' },
  { value: 'public', label: 'Público (Vitrine)' }
];

const safetyItems = [
  { id: '1', description: 'Óculos de proteção', required: true, checked: false },
  { id: '2', description: 'Luvas de segurança', required: true, checked: false },
  { id: '3', description: 'Avental de laboratório', required: false, checked: false },
  { id: '4', description: 'Capacete de segurança', required: false, checked: false },
  { id: '5', description: 'Protetor auditivo', required: false, checked: false },
];

export default function ProjectFormScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    code: '',
    shortDescription: '',
    detailedDescription: '',
    categories: [],
    tags: [],
    visibility: 'private',
    responsible: user?.name || '',
    advisor: '',
    members: [],
    externalPartners: '',
    plannedStart: '',
    plannedEnd: '',
    phase: 'ideation',
    progress: 0,
    priority: 'medium',
    milestones: [],
    laboratories: [],
    criticalResources: [],
    safetyChecklist: safetyItems,
    risks: '',
    materials: [],
    gitRepository: '',
    fileStorage: '',
    documents: [],
    costCenter: '',
    fundingSource: '',
    budget: 0,
    expenses: [],
    lgpdCompliance: false,
    ethicsProtocol: '',
    licenses: [],
    policiesAccepted: false,
  });

  const totalSteps = 8;

  const updateFormData = (field: keyof ProjectForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateProjectCode = (name: string) => {
    const timestamp = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999) + 1;
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return `${slug}-${timestamp}-${random.toString().padStart(3, '0')}`;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 3 || formData.name.length > 100) {
          Alert.alert('Erro', 'Nome do projeto deve ter entre 3 e 100 caracteres');
          return false;
        }
        if (!formData.shortDescription.trim() || formData.shortDescription.length > 160) {
          Alert.alert('Erro', 'Descrição curta é obrigatória e deve ter até 160 caracteres');
          return false;
        }
        if (formData.categories.length === 0) {
          Alert.alert('Erro', 'Pelo menos uma categoria é obrigatória');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.responsible.trim()) {
          Alert.alert('Erro', 'Responsável é obrigatório');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.plannedStart || !formData.plannedEnd) {
          Alert.alert('Erro', 'Datas de início e término são obrigatórias');
          return false;
        }
        // Validar se a data de término é posterior à data de início
        const startDate = new Date(formData.plannedStart);
        const endDate = new Date(formData.plannedEnd);
        if (endDate <= startDate) {
          Alert.alert('Erro', 'Data de término deve ser posterior à data de início');
          return false;
        }
        return true;
      
      case 4:
        if (formData.laboratories.length === 0) {
          Alert.alert('Erro', 'Pelo menos um laboratório deve ser selecionado');
          return false;
        }
        return true;
      
      case 8:
        if (!formData.policiesAccepted) {
          Alert.alert('Erro', 'Você deve aceitar as políticas do laboratório');
          return false;
        }
        if (formData.lgpdCompliance && !formData.ethicsProtocol.trim()) {
          Alert.alert('Erro', 'Protocolo de ética é obrigatório quando há coleta de dados pessoais');
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
        submitProject();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitProject = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        shortDescription: formData.shortDescription,
        detailedDescription: formData.detailedDescription,
        categories: formData.categories,
        tags: formData.tags,
        visibility: formData.visibility,
        responsible: formData.responsible,
        advisor: formData.advisor,
        members: formData.members,
        externalPartners: formData.externalPartners,
        plannedStart: formData.plannedStart,
        plannedEnd: formData.plannedEnd,
        phase: formData.phase,
        progress: formData.progress,
        priority: formData.priority,
        milestones: formData.milestones,
        laboratories: formData.laboratories,
        criticalResources: formData.criticalResources,
        safetyChecklist: formData.safetyChecklist,
        risks: formData.risks,
        materials: formData.materials,
        gitRepository: formData.gitRepository,
        fileStorage: formData.fileStorage,
        costCenter: formData.costCenter,
        fundingSource: formData.fundingSource,
        budget: formData.budget,
        lgpdCompliance: formData.lgpdCompliance,
        ethicsProtocol: formData.ethicsProtocol,
        licenses: formData.licenses,
        policiesAccepted: formData.policiesAccepted,
      };

      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('@LabPage:token');

      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Falha ao criar projeto');
      }

      Alert.alert('Projeto Criado!', 'Seu projeto foi criado com sucesso e está aguardando aprovação.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erro', (error as any)?.message || 'Erro ao criar projeto. Tente novamente.');
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
        1. Identificação do Projeto
      </Text>
      
      <Input
        label="Nome do Projeto *"
        value={formData.name}
        onChangeText={(text) => {
          updateFormData('name', text);
          if (!formData.code) {
            updateFormData('code', generateProjectCode(text));
          }
        }}
        placeholder="Digite o nome do projeto"
        maxLength={100}
      />

      <Input
        label="Código/Slug"
        value={formData.code}
        onChangeText={(text) => updateFormData('code', text)}
        placeholder="Código automático gerado"
      />

      <Input
        label="Descrição Curta *"
        value={formData.shortDescription}
        onChangeText={(text) => updateFormData('shortDescription', text)}
        placeholder="Descrição resumida (máx. 160 caracteres)"
        maxLength={160}
        multiline
        numberOfLines={3}
      />

      <Input
        label="Descrição Detalhada"
        value={formData.detailedDescription}
        onChangeText={(text) => updateFormData('detailedDescription', text)}
        placeholder="Descrição completa e objetivos do projeto"
        multiline
        numberOfLines={6}
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

      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Visibilidade
        </Text>
        {visibilities.map((visibility) => (
          <TouchableOpacity
            key={visibility.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.visibility === visibility.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('visibility', visibility.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.visibility === visibility.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.visibility === visibility.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <Text style={[styles.radioText, { color: colors.textPrimary }]}>
              {visibility.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        2. Propriedade & Equipe
      </Text>
      
      <Input
        label="Responsável *"
        value={formData.responsible}
        onChangeText={(text) => updateFormData('responsible', text)}
        placeholder="Nome do responsável pelo projeto"
      />

      <Input
        label="Orientador (Opcional)"
        value={formData.advisor}
        onChangeText={(text) => updateFormData('advisor', text)}
        placeholder="Nome do orientador, se diferente do responsável"
      />

      <Input
        label="Parceiros Externos"
        value={formData.externalPartners}
        onChangeText={(text) => updateFormData('externalPartners', text)}
        placeholder="Instituições ou parceiros externos"
        multiline
        numberOfLines={3}
      />

      <View style={styles.addMemberSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Equipe/Integrantes
        </Text>
        <Button
          title="Adicionar Membro"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Adicionar Membro', 'Funcionalidade em desenvolvimento')}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        3. Datas, Fase e Andamento
      </Text>
      
      <View style={styles.dateInputContainer}>
        <DateInput
          label="Data de Início Planejada *"
          value={formData.plannedStart}
          onChange={(dateStr) => updateFormData('plannedStart', dateStr)}
          placeholder="Selecionar data"
        />

        <DateInput
          label="Data de Término Planejada *"
          value={formData.plannedEnd}
          onChange={(dateStr) => updateFormData('plannedEnd', dateStr)}
          placeholder="Selecionar data"
        />
      </View>

      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Fase Atual
        </Text>
        {phases.map((phase) => (
          <TouchableOpacity
            key={phase.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.phase === phase.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('phase', phase.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.phase === phase.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.phase === phase.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <Text style={[styles.radioText, { color: colors.textPrimary }]}>
              {phase.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Prioridade
        </Text>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.radioOption,
              {
                backgroundColor: formData.priority === priority.value ? colors.accentPrimary + '20' : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => updateFormData('priority', priority.value)}
          >
            <View style={[
              styles.radioCircle,
              {
                borderColor: formData.priority === priority.value ? colors.accentPrimary : colors.border
              }
            ]}>
              {formData.priority === priority.value && (
                <View style={[styles.radioFill, { backgroundColor: colors.accentPrimary }]} />
              )}
            </View>
            <View style={styles.priorityContent}>
              <Text style={[styles.radioText, { color: colors.textPrimary }]}>
                {priority.label}
              </Text>
              <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Progresso: {formData.progress}%
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.accentPrimary,
                width: `${formData.progress}%`
              }
            ]} 
          />
        </View>
        <TextInput
          style={[styles.progressInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          value={formData.progress.toString()}
          onChangeText={(text) => {
            const value = parseInt(text) || 0;
            updateFormData('progress', Math.min(100, Math.max(0, value)));
          }}
          keyboardType="numeric"
          placeholder="0-100"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        4. Local, Recursos e Segurança
      </Text>
      
      <Input
        label="Laboratórios Envolvidos *"
        value={formData.laboratories.join(', ')}
        onChangeText={(text) => updateFormData('laboratories', text.split(',').map(s => s.trim()).filter(s => s))}
        placeholder="Lab A, Lab B, Lab C"
      />

      <Input
        label="Recursos Críticos"
        value={formData.criticalResources.join(', ')}
        onChangeText={(text) => updateFormData('criticalResources', text.split(',').map(s => s.trim()).filter(s => s))}
        placeholder="Osciloscópio, Impressora 3D, Bancada X"
        multiline
        numberOfLines={3}
      />

      <Input
        label="Riscos e Mitigação"
        value={formData.risks}
        onChangeText={(text) => updateFormData('risks', text)}
        placeholder="Descreva os riscos identificados e planos de mitigação"
        multiline
        numberOfLines={4}
      />

      <View style={styles.safetySection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Checklist de Segurança/EPI
        </Text>
        {formData.safetyChecklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.safetyItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => {
              const updated = formData.safetyChecklist.map(si => 
                si.id === item.id ? { ...si, checked: !si.checked } : si
              );
              updateFormData('safetyChecklist', updated);
            }}
          >
            <View style={[
              styles.checkbox,
              {
                backgroundColor: item.checked ? colors.accentPrimary : 'transparent',
                borderColor: colors.border
              }
            ]}>
              {item.checked && (
                <Ionicons name="checkmark" size={16} color="#000000" />
              )}
            </View>
            <View style={styles.safetyItemContent}>
              <Text style={[styles.safetyItemText, { color: colors.textPrimary }]}>
                {item.description}
              </Text>
              {item.required && (
                <Text style={[styles.requiredBadge, { color: colors.error }]}>
                  Obrigatório
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        5. Materiais / BOM (Bill of Materials)
      </Text>
      
      <View style={styles.materialsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
            Lista de Materiais
          </Text>
          <Button
            title="Adicionar Material"
            variant="outline"
            size="small"
            onPress={() => Alert.alert('Adicionar Material', 'Funcionalidade em desenvolvimento')}
          />
        </View>
        
        {formData.materials.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Nenhum material adicionado
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Adicione os materiais necessários para o projeto
            </Text>
          </View>
        ) : (
          <View style={styles.materialsList}>
            {/* Lista de materiais seria renderizada aqui */}
          </View>
        )}
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        6. Arquivos do Projeto
      </Text>
      
      <Input
        label="Repositório Git"
        value={formData.gitRepository}
        onChangeText={(text) => updateFormData('gitRepository', text)}
        placeholder="https://github.com/usuario/projeto"
        keyboardType="url"
      />

      <Input
        label="Pasta de Arquivos"
        value={formData.fileStorage}
        onChangeText={(text) => updateFormData('fileStorage', text)}
        placeholder="URL do Drive/Nextcloud/S3"
        keyboardType="url"
      />

      <View style={styles.filesSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Documentos
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

  const renderStep7 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        7. Orçamento e Financeiro
      </Text>
      
      <Input
        label="Centro de Custo"
        value={formData.costCenter}
        onChangeText={(text) => updateFormData('costCenter', text)}
        placeholder="Código do centro de custo"
      />

      <Input
        label="Fonte de Recurso"
        value={formData.fundingSource}
        onChangeText={(text) => updateFormData('fundingSource', text)}
        placeholder="Edital, verba interna, patrocinador"
      />

      <Input
        label="Orçamento Previsto"
        value={formData.budget.toString()}
        onChangeText={(text) => updateFormData('budget', parseFloat(text) || 0)}
        placeholder="0.00"
        keyboardType="numeric"
      />

      <View style={styles.budgetSection}>
        <Text style={[styles.sectionSubtitle, { color: colors.textPrimary }]}>
          Despesas
        </Text>
        <Button
          title="Adicionar Despesa"
          variant="outline"
          size="small"
          onPress={() => Alert.alert('Adicionar Despesa', 'Funcionalidade em desenvolvimento')}
        />
      </View>
    </View>
  );

  const renderStep8 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        8. Conformidade e Ética
      </Text>
      
      <View style={styles.complianceSection}>
        <View style={styles.switchItem}>
          <View style={styles.switchContent}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              Coleta de Dados Pessoais (LGPD)
            </Text>
            <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
              O projeto coleta dados pessoais?
            </Text>
          </View>
          <Switch
            value={formData.lgpdCompliance}
            onValueChange={(value) => updateFormData('lgpdCompliance', value)}
            trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
            thumbColor={formData.lgpdCompliance ? colors.accentPrimary : colors.textSecondary}
          />
        </View>

        {formData.lgpdCompliance && (
          <Input
            label="Protocolo de Ética *"
            value={formData.ethicsProtocol}
            onChangeText={(text) => updateFormData('ethicsProtocol', text)}
            placeholder="Número do protocolo do comitê de ética"
          />
        )}

        <View style={styles.switchItem}>
          <View style={styles.switchContent}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
              Aceitar Políticas do Laboratório *
            </Text>
            <Text style={[styles.switchSubtext, { color: colors.textSecondary }]}>
              Li e aceito as políticas e termos de uso
            </Text>
          </View>
          <Switch
            value={formData.policiesAccepted}
            onValueChange={(value) => updateFormData('policiesAccepted', value)}
            trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
            thumbColor={formData.policiesAccepted ? colors.accentPrimary : colors.textSecondary}
          />
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
          <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Novo Projeto</Text>
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
            title={currentStep === totalSteps ? (loading ? "Criando..." : "Criar Projeto") : "Próximo"}
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
  priorityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    width: 80,
    alignSelf: 'center',
  },
  addMemberSection: {
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  safetySection: {
    marginTop: 20,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  safetyItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safetyItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  materialsSection: {
    marginTop: 20,
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
  },
  materialsList: {
    // Estilos para lista de materiais
  },
  filesSection: {
    marginTop: 20,
  },
  budgetSection: {
    marginTop: 20,
  },
  complianceSection: {
    marginTop: 20,
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
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
}); 