import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminIndexScreen() {
  const { user, isAdmin, revalidateUser } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    async function validateAccess() {
      setValidating(true);
      
      // Verificar se usuário está logado
      if (!user) {
        console.log("❌ Erro: Você precisa estar logado para acessar este painel");
        router.replace("/(auth)/login");
        return;
      }
      
      // Revalidar usuário no backend (segurança)
      console.log("🔐 Validando permissões de admin...");
      const isValid = await revalidateUser();
      
      if (!isValid) {
        console.log("❌ Erro: Falha na revalidação");
        Alert.alert("Sessão Expirada", "Faça login novamente");
        router.replace("/(auth)/login");
        return;
      }
      
      // Verificar se o usuário tem role de ADMIN
      if (!isAdmin()) {
        console.log("❌ Erro: Você não tem permissão para acessar este painel");
        Alert.alert("Acesso Negado", "Você não tem permissão de administrador");
        router.replace("/(tabs)");
        return;
      }
      
      console.log("✅ Acesso permitido ao painel admin");
      setValidating(false);
    }
    
    validateAccess();
  }, []);

  const adminOptions = [
    {
      title: "Gerenciar Usuários",
      subtitle: "Visualizar e administrar todos os usuários cadastrados",
      icon: "people-outline" as const,
      route: "/(admin)/users",
      color: colors.accentPrimary,
    },
    {
      title: "Estatísticas",
      subtitle: "Análise de uso e métricas do sistema",
      icon: "stats-chart-outline" as const,
      route: "/(admin)/stats",
      color: "#10B981",
    },
    {
      title: "Configurações",
      subtitle: "Configurações gerais do sistema",
      icon: "settings-outline" as const,
      route: "/(admin)/settings",
      color: "#F59E0B",
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
    <Screen 
      title="Painel Admin" 
      subtitle="Acesso administrativo do sistema"
      scrollable={true}
    >
      <View style={styles.container}>
        <View style={[styles.welcomeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.shieldContainer, { backgroundColor: colors.accentPrimary + '15' }]}>
            <Ionicons name="shield-checkmark-outline" size={56} color={colors.accentPrimary} />
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Painel Administrativo
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            {user?.nome || user?.gmail}
          </Text>
          <View style={[styles.adminBadge, { backgroundColor: colors.accentPrimary + '20' }]}>
            <Text style={[styles.adminBadgeText, { color: colors.accentPrimary }]}>
              Administrador
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ferramentas Administrativas
        </Text>

        <View style={styles.optionsContainer}>
          {adminOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon} size={28} color={option.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                  {option.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  shieldContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  adminBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  adminBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 4,
  },
  optionsContainer: {
    gap: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
});

