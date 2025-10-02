import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Input } from './Input';
import { Button } from './Button';

interface User {
  id: number;
  gmail: string;
  nome: string;
  matricula?: string;
  curso?: string;
  telefone?: string;
  ativo?: boolean;
  roles?: string[];
}

interface UserEditModalProps {
  visible: boolean;
  user: User | null;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_ROLES = [
  { value: 'ACADEMICO', label: 'Acadêmico', icon: 'school' as const, color: '#3B82F6' },
  { value: 'PROFESSOR', label: 'Professor', icon: 'person' as const, color: '#10B981' },
  { value: 'ADMIN', label: 'Administrador', icon: 'shield-checkmark' as const, color: '#EF4444' },
];

export function UserEditModal({ visible, user, token, onClose, onSuccess }: UserEditModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setMatricula(user.matricula || '');
      setCurso(user.curso || '');
      setTelefone(user.telefone || '');
      setAtivo(user.ativo ?? true);
      setSelectedRoles(user.roles || ['ACADEMICO']);
    }
  }, [user]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Não permitir remover todas as roles
        if (prev.length === 1) {
          Alert.alert('Atenção', 'O usuário deve ter pelo menos uma role');
          return prev;
        }
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;

    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    if (selectedRoles.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos uma role');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome.trim(),
          matricula: matricula.trim() || null,
          curso: curso.trim() || null,
          telefone: telefone.trim() || null,
          ativo,
          roles: selectedRoles,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar usuário');
      }

      Alert.alert('Sucesso', 'Usuário atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accentPrimary + '20' }]}>
                <Ionicons name="create-outline" size={24} color={colors.accentPrimary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Editar Usuário
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {user.gmail}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Basic Info */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Informações Básicas
              </Text>

              <Input
                label="Nome Completo *"
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome completo"
              />

              <Input
                label="Matrícula"
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Digite a matrícula"
              />

              <Input
                label="Curso"
                value={curso}
                onChangeText={setCurso}
                placeholder="Digite o curso"
              />

              <Input
                label="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                placeholder="+55 (00) 00000-0000"
                keyboardType="phone-pad"
              />
            </View>

            {/* Roles */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Permissões (Roles)
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                Selecione as permissões que o usuário terá no sistema
              </Text>

              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role.value);
                return (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: isSelected ? role.color + '15' : 'transparent',
                        borderColor: isSelected ? role.color : colors.border,
                      },
                    ]}
                    onPress={() => toggleRole(role.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}>
                      <Ionicons name={role.icon} size={24} color={role.color} />
                    </View>
                    <View style={styles.roleInfo}>
                      <Text style={[styles.roleLabel, { color: colors.text }]}>
                        {role.label}
                      </Text>
                      <Text style={[styles.roleValue, { color: colors.textSecondary }]}>
                        {role.value}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected ? role.color : 'transparent',
                          borderColor: isSelected ? role.color : colors.border,
                        },
                      ]}
                    >
                      {isSelected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Status */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Status da Conta
                  </Text>
                  <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                    {ativo ? 'Conta ativa no sistema' : 'Conta desativada'}
                  </Text>
                </View>
                <Switch
                  value={ativo}
                  onValueChange={setAtivo}
                  trackColor={{ false: colors.border, true: colors.accentPrimary + '60' }}
                  thumbColor={ativo ? colors.accentPrimary : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.accentPrimary }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  roleValue: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

