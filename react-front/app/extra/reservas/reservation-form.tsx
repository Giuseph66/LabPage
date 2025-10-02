import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';
import { Input } from '@/components/ui/Input';
import TimeSelector from '@/components/ui/TimeSelector';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView, StatusBar, StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// API helper
import { API_BASE_URL } from '@/env';

// Interfaces
interface ReservationForm {
  id?: string;
  status: 'draft' | 'pending' | 'approved' | 'conflict' | 'cancelled';
  resourceType: string;
  resourceId: string;
  resourceName: string;
  complementaryResources: string[];
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  recurrence: {
    type: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    occurrences?: number;
    exceptions: string[];
  };
  responsible: string;
  participants: number;
  projectId?: string;
  purpose: string;
  observations: string;
  epiChecklist: {
    glasses: boolean;
    gloves: boolean;
    labCoat: boolean;
  };
  requiredTrainings: string[];
  materials: string[];
  risks: string[];
  riskMitigation: string;
  termsAccepted: boolean;
  conflicts: Conflict[];
}

interface Conflict {
  id: string;
  resourceName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  responsible: string;
  type: 'time' | 'capacity' | 'maintenance';
}

interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  available: number;
  location: string;
  restrictions: string[];
  maintenance: boolean;
}

// Dados mockados
const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Laboratório de Eletrônica',
    type: 'laboratory',
    capacity: 20,
    available: 15,
    location: 'Bloco A - Sala 101',
    restrictions: ['Treinamento obrigatório', 'EPI obrigatório'],
    maintenance: false,
  },
  {
    id: '2',
    name: 'Bancada A',
    type: 'workbench',
    capacity: 8,
    available: 6,
    location: 'Laboratório de Eletrônica',
    restrictions: ['Máximo 4h por reserva'],
    maintenance: false,
  },
  {
    id: '3',
    name: 'Impressora 3D',
    type: 'equipment',
    capacity: 1,
    available: 1,
    location: 'Sala de Prototipagem',
    restrictions: ['Treinamento nível 1', 'Máximo 4h'],
    maintenance: false,
  },
  {
    id: '4',
    name: 'Osciloscópio Tektronix',
    type: 'equipment',
    capacity: 1,
    available: 0,
    location: 'Bancada B',
    restrictions: ['Técnico responsável'],
    maintenance: true,
  },
];

const resourceTypes = [
  { id: 'laboratory', name: 'Laboratório (sala)', icon: 'business' },
  { id: 'workbench', name: 'Bancada', icon: 'desktop' },
  { id: 'multipurpose', name: 'Sala em conjunto', icon: 'people' },
];

const complementaryResources = [
  'Projetor', 'Kits de componentes', 'EPI completo', 'Computadores',
  'Ferramentas', 'Multímetros', 'Fontes de alimentação',
];

const riskTypes = [
  { id: 'chemical', name: 'Químico', icon: 'flask' },
  { id: 'electrical', name: 'Elétrico', icon: 'flash' },
  { id: 'thermal', name: 'Térmico', icon: 'thermometer' },
];

const recurrenceTypes = [
  { id: 'none', name: 'Sem recorrência' },
  { id: 'daily', name: 'Diária' },
  { id: 'weekly', name: 'Semanal' },
  { id: 'monthly', name: 'Mensal' },
];

export default function ReservationFormScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showComplementaryModal, setShowComplementaryModal] = useState(false);
  const [showRisksModal, setShowRisksModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  const [formData, setFormData] = useState<ReservationForm>({
    status: 'draft',
    resourceType: '',
    resourceId: '',
    resourceName: '',
    complementaryResources: [],
    date: '',
    startTime: '08:00',
    endTime: '10:00',
    duration: 120,
    recurrence: {
      type: 'none',
      interval: 1,
      exceptions: [],
    },
    responsible: user?.nome || '',
    participants: 1,
    purpose: '',
    observations: '',
    epiChecklist: {
      glasses: false,
      gloves: false,
      labCoat: false,
    },
    requiredTrainings: [],
    materials: [],
    risks: [],
    riskMitigation: '',
    termsAccepted: false,
    conflicts: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [filteredResources, setFilteredResources] = useState(mockResources);

  // Filtrar recursos por tipo
  useEffect(() => {
    if (formData.resourceType) {
      setFilteredResources(mockResources.filter(r => r.type === formData.resourceType));
    } else {
      setFilteredResources(mockResources);
    }
  }, [formData.resourceType]);

  // Calcular duração
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      setFormData(prev => ({ ...prev, duration: diffMinutes }));
    }
  }, [formData.startTime, formData.endTime]);

  const updateFormData = (field: keyof ReservationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    switch (step) {
      case 1:
        if (!formData.resourceType) newErrors.resourceType = 'Obrigatório';
        if (!formData.resourceId) newErrors.resourceId = 'Obrigatório';
        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
      case 2:
        if (!formData.date) newErrors.date = 'Obrigatório';
        if (!formData.startTime) newErrors.startTime = 'Obrigatório';
        if (!formData.endTime) newErrors.endTime = 'Obrigatório';
        // Validar data de fim para recorrência
        if (formData.recurrence.type !== 'none' && !formData.recurrence.endDate) {
          newErrors.recurrenceEnd = 'Informe a data de fim da recorrência';
          setErrors(prev => ({ ...prev, ...newErrors }));
          return false;
        }
        // Validar se a data de fim é posterior à data de início
        if (formData.recurrence.type !== 'none' && formData.recurrence.endDate) {
          const startDate = new Date(formData.date.split('/').reverse().join('-'));
          const endDate = new Date(formData.recurrence.endDate.split('/').reverse().join('-'));
          if (endDate <= startDate) {
            newErrors.recurrenceEnd = 'Deve ser após a data inicial';
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
          }
        }
        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
      case 3:
        if (!formData.responsible) newErrors.responsible = 'Obrigatório';
        if (!formData.purpose) newErrors.purpose = 'Obrigatório';
        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
      case 4:
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'Aceite os termos';
          setErrors(prev => ({ ...prev, ...newErrors }));
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 5) { // totalSteps was removed, so hardcode to 5
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Monta payload conforme API /api/reservations (POST)
      const payload = {
        resourceType: formData.resourceType,
        resourceId: formData.resourceId,
        resourceName: formData.resourceName,
        complementaryResources: formData.complementaryResources,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        recurrence: formData.recurrence.type === 'none' ? null : {
          type: formData.recurrence.type,
          interval: formData.recurrence.interval,
          endDate: formData.recurrence.endDate || undefined,
          exceptions: formData.recurrence.exceptions
        },
        responsible: formData.responsible,
        participants: formData.participants,
        projectId: formData.projectId,
        purpose: formData.purpose,
        observations: formData.observations,
        epiChecklist: formData.epiChecklist,
        requiredTrainings: formData.requiredTrainings,
        materials: formData.materials,
        risks: formData.risks,
        riskMitigation: formData.riskMitigation,
        termsAccepted: formData.termsAccepted
      };

      const token = await (async () => {
        try {
          const { token } = (await import('@/context/AuthContext')).useAuth();
          // useAuth não pode ser chamado fora de React; então basta pegar do AsyncStorage
        } catch {}
        return null;
      })();

      // Usa AsyncStorage direto para token
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedToken = await AsyncStorage.getItem('@LabPage:token');

      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Falha ao criar reserva');
      }

      Alert.alert('Sucesso', 'Reserva enviada para aprovação!');
      router.back();
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Erro ao enviar reserva');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return colors.textSecondary;
      case 'pending': return colors.warning;
      case 'approved': return colors.success;
      case 'conflict': return colors.error;
      case 'cancelled': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  // Função para calcular duração em dias
  const calculateDurationInDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate.split('/').reverse().join('-'));
    const end = new Date(endDate.split('/').reverse().join('-'));
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Função para calcular número de ocorrências
  const calculateOccurrences = (startDate: string, endDate: string, type: string, interval: number): number => {
    const days = calculateDurationInDays(startDate, endDate);
    
    switch (type) {
      case 'daily':
        return Math.floor(days / interval) + 1;
      case 'weekly':
        return Math.floor(days / (interval * 7)) + 1;
      case 'monthly':
        return Math.floor(days / (interval * 30)) + 1;
      default:
        return 1;
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
        {Array.from({ length: 5 }, (_, i) => ( // totalSteps was removed, so hardcode to 5
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
            {i < 4 && ( // totalSteps was removed, so hardcode to 4
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
        1. Seleção do Recurso
      </Text>
      
      {/* Tipo de Recurso */}
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Tipo de Recurso *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {resourceTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: formData.resourceType === type.id ? colors.accentPrimary : colors.surface,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormData('resourceType', type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={20} 
                  color={formData.resourceType === type.id ? '#000000' : colors.textSecondary} 
                />
                <Text style={[
                  styles.chipText,
                  { color: formData.resourceType === type.id ? '#000000' : colors.textPrimary }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Laboratório/Local */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Laboratório/Local *
        </Text>
        <TouchableOpacity
          style={[styles.resourceSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowResourceModal(true)}
        >
          <View style={styles.resourceSelectorContent}>
            <Text style={[
              styles.resourceSelectorValue,
              { color: formData.resourceName ? colors.textPrimary : colors.textSecondary }
            ]}>
              {formData.resourceName || 'Selecionar recurso...'}
            </Text>
            {!formData.resourceName && (
              <Text style={[styles.resourceHint, { color: colors.accentPrimary }]}>
                Toque para selecionar
              </Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Recursos Complementares */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Recursos Complementares
        </Text>
        <TouchableOpacity
          style={[styles.resourceSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowComplementaryModal(true)}
        >
          <Text style={[styles.resourceSelectorText, { color: colors.textPrimary }]}>
            {formData.complementaryResources.length > 0 
              ? `${formData.complementaryResources.length} selecionado(s)`
              : 'Selecionar recursos...'
            }
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Capacidade e Restrições */}
      {formData.resourceId && (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Capacidade e Restrições
          </Text>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Capacidade: {mockResources.find(r => r.id === formData.resourceId)?.capacity} pessoas
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Disponível: {mockResources.find(r => r.id === formData.resourceId)?.available} lugares
              </Text>
            </View>
            {mockResources.find(r => r.id === formData.resourceId)?.restrictions.map((restriction, index) => (
              <View key={index} style={styles.infoRow}>
                <Ionicons name="warning-outline" size={16} color={colors.warning} />
                <Text style={[styles.infoText, { color: colors.warning }]}>
                  {restriction}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        2. Data & Horário
      </Text>
      
      {/* Data de Início */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Data *
        </Text>
        <DateInput
          value={formData.date}
          onChange={(text: string) => updateFormData('date', text)}
          placeholder="DD/MM/AAAA"
          label="Data *"
          error={errors.date}
        />
      </View>

      {/* Horário */}
      <View style={styles.timeContainer}>
        <View style={styles.timeField}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Horário de Início *
          </Text>
          <TouchableOpacity
            style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowStartTimeModal(true)}
          >
            <Text style={[styles.timeInputText, { color: formData.startTime ? colors.textPrimary : colors.textSecondary }]}>
              {formData.startTime || 'Selecionar horário'}
            </Text>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {!!errors.startTime && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.startTime}</Text>
          )}
        </View>
        <View style={styles.timeField}>
          <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
            Horário de Fim *
          </Text>
          <TouchableOpacity
            style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowEndTimeModal(true)}
          >
            <Text style={[styles.timeInputText, { color: formData.endTime ? colors.textPrimary : colors.textSecondary }]}>
              {formData.endTime || 'Selecionar horário'}
            </Text>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {!!errors.endTime && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.endTime}</Text>
          )}
        </View>
      </View>

      {/* Duração */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Duração
        </Text>
        <View style={[styles.durationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.durationText, { color: colors.accentPrimary }]}>
            {Math.floor(formData.duration / 60)}h {formData.duration % 60}min
          </Text>
        </View>
      </View>

      {/* Recorrência */}
      <View style={styles.selectContainer}>
        <Text style={[styles.selectLabel, { color: colors.textPrimary }]}>
          Recorrência
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {recurrenceTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: formData.recurrence.type === type.id ? colors.accentSecondary : colors.surface,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => updateFormData('recurrence', { ...formData.recurrence, type: type.id })}
              >
                <Text style={[
                  styles.chipText,
                  { color: formData.recurrence.type === type.id ? '#000000' : colors.textPrimary }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {formData.recurrence.type !== 'none' && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Intervalo
            </Text>
            <TextInput
              style={[styles.timeInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              value={formData.recurrence.interval.toString()}
              onChangeText={(text) => updateFormData('recurrence', { 
                ...formData.recurrence, 
                interval: parseInt(text) || 1 
              })}
              placeholder="1"
              keyboardType="numeric"
            />
          </View>
        )}
        
        {/* Data de Fim da Reserva */}
        {formData.recurrence.type !== 'none' && (
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
              Data de Fim da Reserva *
            </Text>
            <DateInput
              value={formData.recurrence.endDate || ''}
              onChange={(text: string) => updateFormData('recurrence', { 
                ...formData.recurrence, 
                endDate: text 
              })}
              placeholder="DD/MM/AAAA"
            />
            <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
              Até quando a reserva deve se repetir
            </Text>
          </View>
        )}
        
        {/* Informações da Recorrência */}
        {formData.recurrence.type !== 'none' && formData.recurrence.endDate && (
          <View style={styles.fieldContainer}>
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.accentPrimary} />
                <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                  Recorrência: {recurrenceTypes.find(t => t.id === formData.recurrence.type)?.name}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="repeat-outline" size={16} color={colors.accentPrimary} />
                <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                  Intervalo: A cada {formData.recurrence.interval} {formData.recurrence.type === 'daily' ? 'dia(s)' : 
                    formData.recurrence.type === 'weekly' ? 'semana(s)' : 'mês(es)'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="flag-outline" size={16} color={colors.accentPrimary} />
                <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                  Finaliza em: {formData.recurrence.endDate}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Período Total da Reserva */}
        {formData.recurrence.type !== 'none' && formData.recurrence.endDate && (
          <View style={styles.fieldContainer}>
            <View style={[styles.periodCard, { backgroundColor: colors.accentPrimary + '10', borderColor: colors.accentPrimary }]}>
              <View style={styles.periodHeader}>
                <Ionicons name="time-outline" size={20} color={colors.accentPrimary} />
                <Text style={[styles.periodTitle, { color: colors.accentPrimary }]}>
                  Período Total da Reserva
                </Text>
              </View>
              <View style={styles.periodContent}>
                <Text style={[styles.periodText, { color: colors.textPrimary }]}>
                  <Text style={{ fontWeight: '600' }}>Início:</Text> {formData.date} às {formData.startTime}
                </Text>
                <Text style={[styles.periodText, { color: colors.textPrimary }]}>
                  <Text style={{ fontWeight: '600' }}>Fim:</Text> {formData.recurrence.endDate} às {formData.endTime}
                </Text>
                <Text style={[styles.periodText, { color: colors.textPrimary }]}>
                  <Text style={{ fontWeight: '600' }}>Duração:</Text> {calculateDurationInDays(formData.date, formData.recurrence.endDate)} dia(s)
                </Text>
                <Text style={[styles.periodText, { color: colors.textPrimary }]}>
                  <Text style={{ fontWeight: '600' }}>Ocorrências:</Text> {calculateOccurrences(
                    formData.date, 
                    formData.recurrence.endDate, 
                    formData.recurrence.type, 
                    formData.recurrence.interval
                  )} vez(es)
                </Text>
                <Text style={[styles.periodText, { color: colors.accentPrimary, fontWeight: '600' }]}>
                  Total: {formData.recurrence.type === 'daily' ? 'Diária' : 
                    formData.recurrence.type === 'weekly' ? 'Semanal' : 'Mensal'} até {formData.recurrence.endDate}
                </Text>
              </View>
            </View>
            
            {/* Card de Estatísticas */}
            <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="calendar" size={24} color={colors.accentPrimary} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {calculateDurationInDays(formData.date, formData.recurrence.endDate)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dias</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="repeat" size={24} color={colors.accentPrimary} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {calculateOccurrences(
                      formData.date, 
                      formData.recurrence.endDate, 
                      formData.recurrence.type, 
                      formData.recurrence.interval
                    )}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ocorrências</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={24} color={colors.accentPrimary} />
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {formData.duration}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Min/Reserva</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        3. Pessoas & Finalidade
      </Text>
      
      {/* Responsável */}
      <Input
        label="Responsável *"
        value={formData.responsible}
        onChangeText={(text) => updateFormData('responsible', text)}
        placeholder="Nome do responsável"
        error={errors.responsible}
      />

      {/* Participantes */}
      <Input
        label="Número de Participantes"
        value={formData.participants.toString()}
        onChangeText={(text) => updateFormData('participants', parseInt(text) || 1)}
        placeholder="1"
        keyboardType="numeric"
      />

      {/* Projeto Vinculado */}
      <Input
        label="Projeto Vinculado (opcional)"
        value={formData.projectId || ''}
        onChangeText={(text) => updateFormData('projectId', text)}
        placeholder="ID ou nome do projeto"
      />

      {/* Finalidade */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Finalidade/Descrição *
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          value={formData.purpose}
          onChangeText={(text) => updateFormData('purpose', text)}
          placeholder="Descreva a finalidade da reserva..."
          multiline
          numberOfLines={4}
        />
        {!!errors.purpose && (
          <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.purpose}</Text>
        )}
      </View>

      {/* Observações */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Observações ao Técnico
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          value={formData.observations}
          onChangeText={(text) => updateFormData('observations', text)}
          placeholder="Observações especiais..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        4. Requisitos & Segurança
      </Text>
      
      {/* Checklist EPI */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Checklist EPI *
        </Text>
        <View style={styles.checklistContainer}>
          {Object.entries(formData.epiChecklist).map(([key, value]) => (
            <View key={key} style={styles.checklistItem}>
              <Switch
                value={value}
                onValueChange={(newValue) => 
                  updateFormData('epiChecklist', { ...formData.epiChecklist, [key]: newValue })
                }
                trackColor={{ false: colors.border, true: colors.accentSecondary }}
                thumbColor={value ? colors.accentPrimary : colors.textSecondary}
              />
              <Text style={[styles.checklistText, { color: colors.textPrimary }]}>
                {key === 'glasses' ? 'Óculos de Proteção' :
                 key === 'gloves' ? 'Luvas' : 'Jaleco'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Riscos */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
          Riscos Identificados
        </Text>
        <TouchableOpacity
          style={[styles.resourceSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowRisksModal(true)}
        >
          <Text style={[styles.resourceSelectorText, { color: colors.textPrimary }]}>
            {formData.risks.length > 0 
              ? `${formData.risks.length} risco(s) selecionado(s)`
              : 'Selecionar riscos...'
            }
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Termos e Políticas */}
      <View style={styles.fieldContainer}>
        <View style={styles.termsContainer}>
          <Switch
            value={formData.termsAccepted}
            onValueChange={(value) => updateFormData('termsAccepted', value)}
            trackColor={{ false: colors.border, true: colors.accentSecondary }}
            thumbColor={formData.termsAccepted ? colors.accentPrimary : colors.textSecondary}
          />
          <Text style={[styles.termsText, { color: colors.textPrimary }]}>
            Aceito os termos e políticas de uso *
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
        5. Revisão & Envio
      </Text>
      
      {/* Resumo */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
          Resumo da Reserva
        </Text>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Recurso:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.resourceName}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Data:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {formData.date}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Horário:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
            {formData.startTime} - {formData.endTime}
          </Text>
        </View>
        
        {/* Data de Fim para Recorrência */}
        {formData.recurrence.type !== 'none' && formData.recurrence.endDate && (
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Recorrência:</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {recurrenceTypes.find(t => t.id === formData.recurrence.type)?.name} até {formData.recurrence.endDate}
            </Text>
          </View>
        )}
        
        {/* Duração Total para Recorrência */}
        {formData.recurrence.type !== 'none' && formData.recurrence.endDate && (
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Duração Total:</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {calculateDurationInDays(formData.date, formData.recurrence.endDate)} dia(s)
            </Text>
          </View>
        )}
        
        {/* Número de Ocorrências */}
        {formData.recurrence.type !== 'none' && formData.recurrence.endDate && (
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total de Ocorrências:</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
              {calculateOccurrences(
                formData.date, 
                formData.recurrence.endDate, 
                formData.recurrence.type, 
                formData.recurrence.interval
              )} vez(es)
            </Text>
          </View>
        )}
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Responsável:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.responsible}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Participantes:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.participants}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Finalidade:</Text>
          <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{formData.purpose}</Text>
        </View>
      </View>

      {/* Conflitos */}
      {formData.conflicts.length > 0 && (
        <View style={[styles.conflictsCard, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
          <Text style={[styles.conflictsTitle, { color: colors.error }]}>
            ⚠️ Conflitos Detectados
          </Text>
          {formData.conflicts.map((conflict, index) => (
            <Text key={index} style={[styles.conflictText, { color: colors.error }]}>
              • {conflict.resourceName} - {conflict.startDate} {conflict.startTime}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Nova Reserva
          </Text>
          {formData.recurrence.type !== 'none' && (
            <View style={[styles.recurrenceBadge, { backgroundColor: colors.accentPrimary }]}>
              <Ionicons name="repeat" size={12} color="#000000" />
              <Text style={styles.recurrenceBadgeText}>Recorrente</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => Alert.alert('Ajuda', 'Políticas de uso')}>
            <Ionicons name="help-circle-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.actionButtons}>
            {currentStep > 1 && (
              <Button
                title="Anterior"
                onPress={handlePrevious}
                variant="secondary"
                style={styles.actionButton}
              />
            )}
            
            {currentStep < 5 ? ( // totalSteps was removed, so hardcode to 5
              <Button
                title="Próximo"
                onPress={handleNext}
                style={styles.actionButton}
              />
            ) : (
              <Button
                title="Enviar para Aprovação"
                onPress={handleSubmit}
                loading={loading}
                style={styles.actionButton}
              />
            )}
          </View>
        
        </View>
      </View>

      {/* Resource Selection Modal */}
      <Modal
        visible={showResourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Selecionar Recurso</Text>
              <TouchableOpacity onPress={() => setShowResourceModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredResources}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.resourceId === item.id ? colors.accentSecondary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    updateFormData('resourceId', item.id);
                    updateFormData('resourceName', item.name);
                    setShowResourceModal(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[styles.modalItemTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.modalItemSubtitle, { color: colors.textSecondary }]}>{item.location}</Text>
                    <Text style={[styles.modalItemCapacity, { color: colors.textSecondary }]}>
                      Capacidade: {item.capacity} • Disponível: {item.available}
                    </Text>
                  </View>
                  {formData.resourceId === item.id && (
                    <Ionicons name="checkmark" size={20} color={colors.accentSecondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Complementary Resources Modal */}
      <Modal
        visible={showComplementaryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowComplementaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Recursos Complementares</Text>
              <TouchableOpacity onPress={() => setShowComplementaryModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={complementaryResources}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.complementaryResources.includes(item) ? colors.accentSecondary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    const newSelection = formData.complementaryResources.includes(item)
                      ? formData.complementaryResources.filter(r => r !== item)
                      : [...formData.complementaryResources, item];
                    updateFormData('complementaryResources', newSelection);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: formData.complementaryResources.includes(item) ? colors.accentSecondary : colors.textPrimary }
                  ]}>
                    {item}
                  </Text>
                  {formData.complementaryResources.includes(item) && (
                    <Ionicons name="checkmark" size={20} color={colors.accentSecondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Risks Modal */}
      <Modal
        visible={showRisksModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRisksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Riscos Identificados</Text>
              <TouchableOpacity onPress={() => setShowRisksModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={riskTypes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { backgroundColor: formData.risks.includes(item.id) ? colors.accentSecondary + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    const newSelection = formData.risks.includes(item.id)
                      ? formData.risks.filter(r => r !== item.id)
                      : [...formData.risks, item.id];
                    updateFormData('risks', newSelection);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                    <Text style={[
                      styles.modalItemText,
                      { color: formData.risks.includes(item.id) ? colors.accentSecondary : colors.textPrimary }
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {formData.risks.includes(item.id) && (
                    <Ionicons name="checkmark" size={20} color={colors.accentSecondary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Time Selector Modals */}
      <TimeSelector
        visible={showStartTimeModal}
        onClose={() => setShowStartTimeModal(false)}
        onSelect={(time: string) => updateFormData('startTime', time)}
        value={formData.startTime}
        title="Selecionar Horário de Início"
      />
      
      <TimeSelector
        visible={showEndTimeModal}
        onClose={() => setShowEndTimeModal(false)}
        onSelect={(time: string) => updateFormData('endTime', time)}
        value={formData.endTime}
        title="Selecionar Horário de Fim"
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
    paddingTop: StatusBar.currentHeight,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  mainContainer: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  capacityText: {
    fontSize: 12,
  },
  stepIndicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  selectContainer: {
    marginBottom: 20,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  resourceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resourceSelectorContent: {
    flex: 1,
  },
  resourceSelectorValue: {
    fontSize: 16,
  },
  resourceHint: {
    fontSize: 14,
    marginTop: 4,
  },
  resourceSelectorText: {
    fontSize: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeField: {
    flex: 1,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeInputText: {
    fontSize: 16,
    flex: 1,
  },
  durationCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checklistText: {
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  termsText: {
    fontSize: 16,
    flex: 1,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  conflictsCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  conflictsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  conflictText: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  draftButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  modalItemCapacity: {
    fontSize: 12,
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  fieldHint: {
    fontSize: 12,
    marginTop: 4,
  },
  periodCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodContent: {
    paddingLeft: 20,
  },
  periodText: {
    fontSize: 14,
    marginBottom: 4,
  },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurrenceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  statsCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
}); 