import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingItem {
  label: string;
  description: string;
  icon: any;
  value: boolean;
  onToggle: (value: boolean) => void;
  warning?: boolean;
}

export default function SettingsScreen() {
  const { user, isAdmin, signOut, revalidateUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    async function validateAccess() {
      setValidating(true);
      
      if (!user) {
        router.replace("/(auth)/login");
        return;
      }
      
      const isValid = await revalidateUser();
      
      if (!isValid) {
        Alert.alert("Sessão Expirada", "Faça login novamente");
        router.replace("/(auth)/login");
        return;
      }
      
      if (!isAdmin()) {
        Alert.alert("Acesso Negado", "Você não tem permissão de administrador");
        router.replace("/(tabs)");
        return;
      }
      
      setValidating(false);
    }
    
    validateAccess();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da área administrativa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: "Notificações",
      items: [
        {
          label: "Notificações Push",
          description: "Receber alertas em tempo real",
          icon: "notifications-outline" as const,
          value: notifications,
          onToggle: setNotifications,
        } as SettingItem,
        {
          label: "Alertas por E-mail",
          description: "Enviar resumo diário por e-mail",
          icon: "mail-outline" as const,
          value: emailAlerts,
          onToggle: setEmailAlerts,
        } as SettingItem,
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          label: "Backup Automático",
          description: "Backup diário às 3h da manhã",
          icon: "cloud-upload-outline" as const,
          value: autoBackup,
          onToggle: setAutoBackup,
        } as SettingItem,
        {
          label: "Modo Manutenção",
          description: "Bloquear acesso de usuários",
          icon: "construct-outline" as const,
          value: maintenanceMode,
          onToggle: setMaintenanceMode,
          warning: true,
        } as SettingItem,
      ],
    },
  ];

  const actionItems = [
    {
      title: "Gerenciar Permissões",
      icon: "shield-checkmark-outline" as const,
      color: colors.accentPrimary,
      onPress: () => Alert.alert("Em breve", "Funcionalidade em desenvolvimento"),
    },
    {
      title: "Logs do Sistema",
      icon: "document-text-outline" as const,
      color: "#10B981",
      onPress: () => Alert.alert("Em breve", "Funcionalidade em desenvolvimento"),
    },
    {
      title: "Backup Manual",
      icon: "save-outline" as const,
      color: "#F59E0B",
      onPress: () => Alert.alert("Backup", "Iniciando backup do sistema..."),
    },
    {
      title: "Limpar Cache",
      icon: "trash-outline" as const,
      color: "#EF4444",
      onPress: () => Alert.alert("Cache", "Cache do sistema limpo com sucesso!"),
    },
  ];

  if (validating) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Validando permissões...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accentPrimary + '20' }]}>
            <Ionicons name="settings" size={32} color={colors.accentPrimary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Configurações do Sistema
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Gerencie as configurações administrativas
          </Text>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            
            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <View style={styles.settingItem}>
                    <View style={[styles.settingIcon, { backgroundColor: item.warning ? '#EF444420' : colors.accentPrimary + '15' }]}>
                      <Ionicons 
                        name={item.icon} 
                        size={22} 
                        color={item.warning ? '#EF4444' : colors.accentPrimary} 
                      />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ 
                        false: colors.border, 
                        true: item.warning ? '#EF4444' : colors.accentPrimary + '60' 
                      }}
                      thumbColor={item.value ? (item.warning ? '#EF4444' : colors.accentPrimary) : '#f4f3f4'}
                    />
                  </View>
                  {itemIndex < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ações do Sistema
        </Text>

        <View style={styles.actionsGrid}>
          {actionItems.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.dangerZone, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning-outline" size={24} color={colors.error} />
            <Text style={[styles.dangerTitle, { color: colors.error }]}>
              Zona de Perigo
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: colors.error, borderColor: colors.error }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>
              Sair da Administração
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            HardLab Admin Panel v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2025 - Todos os direitos reservados
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerZone: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 16,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  loadingText: {
    fontSize: 15,
  },
});

