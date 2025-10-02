// file: app/(auth)/login.tsx
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageModal } from "@/components/ui/MessageModal";
import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "warning">("info");

  async function onSubmit() {
    try {
      setLoading(true);
      await signIn(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setModalTitle("Erro ao entrar");
      setModalMessage(e?.message ?? "Tente novamente");
      setModalType("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen 
      title="Bem-vindo" 
      subtitle="Faça login para continuar"
      showLogo={true}
      logoSize="large"
      scrollable={true}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <View style={styles.passwordContainer}>
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry={!visible}
              autoComplete="password"
              style={styles.passwordInput}
            />
            <TouchableOpacity 
              style={[styles.eyeButton, { backgroundColor: colors.surface }]}
              onPress={() => setVisible(!visible)}
            >
              <Ionicons 
                name={visible ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          <Button title={loading ? "Entrando..." : "Entrar"} onPress={onSubmit} disabled={loading} />
          <View style={{ height: 12 }} />
          <Link href="/(auth)/reset_password" style={[styles.link, { color: colors.accentPrimary }]}>
            Esqueci minha senha
          </Link>
          <View style={{ height: 6 }} />
          <Link href="/(auth)/register" style={[styles.linkMuted, { color: colors.textSecondary }]}>
            Não tem conta? Criar conta
          </Link>
        </View>
      </ScrollView>
      <MessageModal 
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        confirmText="Fechar"
        onConfirm={() => setModalVisible(false)}
        onRequestClose={() => setModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 20,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50, // Espaço para o botão do olho
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 32, // Ajuste para alinhar com o input
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  link: { 
    fontSize: 14, 
    fontWeight: "600",
    textAlign: 'center',
  },
  linkMuted: { 
    fontSize: 13, 
    textAlign: 'center',
  },
});