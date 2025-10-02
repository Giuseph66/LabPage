import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MessageModal } from "@/components/ui/MessageModal";
import { Screen } from "@/components/ui/Screen";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "warning">("info");

  async function onSubmit() {
    try {
      setLoading(true);
      await resetPassword(email.trim().toLowerCase());
      setModalTitle("Verifique seu e-mail");
      setModalMessage("Se esse e-mail estiver cadastrado, enviaremos as instruções de redefinição.");
      setModalType("info");
      setModalVisible(true);
    } catch (e: any) {
      setModalTitle("Falha");
      setModalMessage(e?.message ?? "Não foi possível solicitar a redefinição");
      setModalType("error");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen 
      title="Recuperar senha" 
      subtitle="Informe seu e-mail cadastrado"
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
          <Input label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Digite seu e-mail"/>
          <Button title={loading ? "Enviando..." : "Enviar código"} onPress={onSubmit} disabled={loading} />
          <Link href="/(auth)/login" style={[styles.linkMuted, { color: colors.textSecondary }]}>
          Voltar ao login
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
  linkMuted: { 
    fontSize: 13, 
    textAlign: 'center',
  },
});
