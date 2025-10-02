import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalReservations: number;
  totalComponents: number;
  activeUsers: number;
  pendingReservations: number;
}

export default function StatsScreen() {
  const { user, isAdmin, token } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProjects: 0,
    totalReservations: 0,
    totalComponents: 0,
    activeUsers: 0,
    pendingReservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    
    if (!isAdmin()) {
      router.replace("/(tabs)");
      return;
    }
    
    fetchStats();
  }, [user, isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Simulando dados por enquanto
      // Você pode substituir por chamadas reais à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 42,
        totalProjects: 18,
        totalReservations: 156,
        totalComponents: 87,
        activeUsers: 12,
        pendingReservations: 5,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: "people" as const,
      color: colors.accentPrimary,
      subtitle: `${stats.activeUsers} ativos hoje`,
    },
    {
      title: "Projetos Criados",
      value: stats.totalProjects,
      icon: "git-branch" as const,
      color: "#10B981",
      subtitle: "Todos os tempos",
    },
    {
      title: "Reservas",
      value: stats.totalReservations,
      icon: "calendar" as const,
      color: "#F59E0B",
      subtitle: `${stats.pendingReservations} pendentes`,
    },
    {
      title: "Componentes",
      value: stats.totalComponents,
      icon: "hardware-chip" as const,
      color: "#8B5CF6",
      subtitle: "Cadastrados",
    },
  ];

  const quickActions = [
    {
      title: "Exportar Relatório",
      icon: "download-outline" as const,
      color: colors.accentPrimary,
    },
    {
      title: "Atualizar Dados",
      icon: "refresh-outline" as const,
      color: "#10B981",
      onPress: fetchStats,
    },
    {
      title: "Configurar Alertas",
      icon: "notifications-outline" as const,
      color: "#F59E0B",
    },
  ];

  if (loading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando estatísticas...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="stats-chart" size={32} color={colors.accentPrimary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Visão Geral do Sistema
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Acompanhe as métricas em tempo real
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Métricas Principais
        </Text>

        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={28} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statTitle, { color: colors.text }]}>
                {stat.title}
              </Text>
              <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                {stat.subtitle}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ações Rápidas
        </Text>

        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.accentPrimary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Dados Atualizados
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              As estatísticas são atualizadas automaticamente a cada 5 minutos
            </Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  headerCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

