
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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "warning">("info");

  async function onSubmit() {
    if (password !== confirm) {
      setModalTitle("Senhas diferentes");
      setModalMessage("As senhas precisam ser iguais.");
      setModalType("warning");
      setModalVisible(true);
      return;
    }
    try {
      setLoading(true);
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      setModalTitle("Conta criada");
      setModalMessage("Faça login para continuar.");
      setModalType("success");
      setModalVisible(true);
      // após confirmação, redireciona
      const goLogin = () => {
        setModalVisible(false);
        router.replace("/(auth)/login");
      };
      setTimeout(goLogin, 1200);
    } catch (e: any) {
      setModalTitle("Erro ao criar conta");
      setModalMessage(e?.message ?? "Tente novamente");
      setModalType("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }



  return (
    <Screen 
      title="Criar conta" 
      subtitle="Acesse recursos do HardLab"
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
          <Input label="Nome" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Digite seu nome" />
          <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Digite seu e-mail" />
          
          <View style={styles.passwordContainer}>
            <Input 
              label="Senha" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!visible} 
              placeholder="Digite sua senha"
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

          <View style={styles.passwordContainer}>
            <Input 
              label="Confirmar senha" 
              value={confirm} 
              onChangeText={setConfirm} 
              secureTextEntry={!visibleConfirm} 
              placeholder="Confirme sua senha"
              style={styles.passwordInput}
            />
            <TouchableOpacity 
              style={[styles.eyeButton, { backgroundColor: colors.surface }]}
              onPress={() => setVisibleConfirm(!visibleConfirm)}
            >
              <Ionicons 
                name={visibleConfirm ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <Button title={loading ? "Criando..." : "Criar conta"} onPress={onSubmit} disabled={loading} />
          <Link href="/(auth)/login" style={[styles.linkMuted, { color: colors.textSecondary }]}>
            Já tem conta? Faça login
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
  linkMuted: { 
    fontSize: 13, 
    textAlign: 'center',
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
});
