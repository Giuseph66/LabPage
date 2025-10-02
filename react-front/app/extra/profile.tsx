import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/ui/Logo';
import { MenuItem } from '@/components/ui/MenuItem';
import { ProfileCard } from '@/components/ui/ProfileCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

// Configurações de notificação
const notificationSettings = [
  { id: 'reservations', title: 'Reservas', enabled: true },
  { id: 'approvals', title: 'Aprovações', enabled: true },
  { id: 'reminders', title: 'Lembretes', enabled: false },
  { id: 'maintenance', title: 'Manutenções', enabled: true },
  { id: 'news', title: 'Notícias', enabled: false },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, signOut, isAdmin } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Redirecionar para login se não estiver autenticado
  React.useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  // Mapear roles para rótulos amigáveis
  const getRoleLabel = () => {
    if (!user?.roles || user.roles.length === 0) return 'Usuário';
    
    const roleLabels = {
      'ADMIN': 'Administrador',
      'PROFESSOR': 'Professor',
      'ACADEMICO': 'Acadêmico',
    };
    
    return user.roles.map(role => roleLabels[role as keyof typeof roleLabels] || role).join(', ');
  };

  // Criar objeto compatível com ProfileCard
  const userData = user ? {
    name: user.nome,
    email: user.gmail,
    role: getRoleLabel(),
    department: user.curso || 'Não informado',
    studentId: user.matricula || 'Não informado',
    phone: user.telefone || 'Não informado',
  } : null;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidade em desenvolvimento');
  };

  function handleLogoPress() {
    // Se já for admin, vai direto
    if (isAdmin()) {
      router.push("/(admin)");
      return;
    }
    
    // Senão, conta os cliques (easter egg)
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5) {
      setLogoClickCount(0);
      router.push("/(admin)");
    }
  }
  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleNotificationToggle = (id: string, value: boolean) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id ? { ...item, enabled: value } : item
      )
    );
  };

  const handleMenuItemPress = (title: string) => {
    Alert.alert(title, 'Funcionalidade em desenvolvimento');
  };

  const handleThemeToggle = () => {
    Alert.alert('Tema', 'Funcionalidade de tema em desenvolvimento');
  };

  const handleLanguageChange = () => {
    Alert.alert('Idioma', 'Funcionalidade de idioma em desenvolvimento');
  };

  const handlePrivacySettings = () => {
    Alert.alert('Privacidade', 'Configurações de privacidade em desenvolvimento');
  };

  const handleHelpSupport = () => {
    Alert.alert('Ajuda e Suporte', 'Central de ajuda em desenvolvimento');
  };

  const handleAbout = () => {
    Alert.alert('Sobre', 'HARDLAB v1.0.0\nSistema de Gestão de Laboratórios');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textSecondary}
            colors={[colors.accentPrimary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Logo size="small" onPress={handleLogoPress} />
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>Perfil</Text>
          </View>
        </View>

        {/* Profile Card */}
        {userData && (
          <ProfileCard
            user={userData}
            onEdit={handleEditProfile}
            onLogout={handleLogout}
          />
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Conta
          </Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuItem
              icon="person-outline"
              title="Editar Perfil"
              subtitle="Alterar informações pessoais"
              onPress={handleEditProfile}
            />
            <MenuItem
              icon="key-outline"
              title="Alterar Senha"
              subtitle="Atualizar senha de acesso"
              onPress={() => handleMenuItemPress('Alterar Senha')}
            />
            {user?.matricula && (
              <MenuItem
                icon="card-outline"
                title="Dados Acadêmicos"
                subtitle={`Matrícula: ${user.matricula}`}
                onPress={() => handleMenuItemPress('Dados Acadêmicos')}
              />
            )}
            {isAdmin() && (
              <MenuItem
                icon="shield-checkmark-outline"
                title="Painel Administrativo"
                subtitle="Gerenciar sistema"
                onPress={() => router.push('/(admin)')}
              />
            )}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Notificações
          </Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {notifications.map((item, index) => (
              <View key={item.id} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>
                    {item.title}
                  </Text>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={(value) => handleNotificationToggle(item.id, value)}
                  trackColor={{ false: colors.border, true: colors.accentPrimary + '40' }}
                  thumbColor={item.enabled ? colors.accentPrimary : colors.textSecondary}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Preferências
          </Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuItem
              icon="moon-outline"
              title="Tema"
              subtitle="Claro / Escuro"
              onPress={handleThemeToggle}
            />
            <MenuItem
              icon="language-outline"
              title="Idioma"
              subtitle="Português"
              onPress={handleLanguageChange}
            />
            <MenuItem
              icon="shield-outline"
              title="Privacidade"
              subtitle="Configurações de segurança"
              onPress={handlePrivacySettings}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Suporte
          </Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuItem
              icon="help-circle-outline"
              title="Ajuda e Suporte"
              subtitle="Central de ajuda"
              onPress={handleHelpSupport}
            />
            <MenuItem
              icon="document-text-outline"
              title="Termos de Uso"
              subtitle="Políticas e termos"
              onPress={() => handleMenuItemPress('Termos de Uso')}
            />
            <MenuItem
              icon="information-circle-outline"
              title="Sobre"
              subtitle="Versão 1.0.0"
              onPress={handleAbout}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Zona de Perigo
          </Text>
          <View style={[styles.sectionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MenuItem
              icon="trash-outline"
              title="Excluir Conta"
              subtitle="Remover permanentemente"
              onPress={() => Alert.alert('Excluir Conta', 'Esta ação não pode ser desfeita')}
              destructive={true}
            />
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            HARDLAB v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
  },
}); 