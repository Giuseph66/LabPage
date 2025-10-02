import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Admin',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: 'Gerenciar Usuários',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="stats" 
        options={{ 
          title: 'Estatísticas',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Configurações',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}