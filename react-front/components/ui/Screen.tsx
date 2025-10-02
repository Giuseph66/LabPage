import { MinimalHeader } from '@/components/MinimalHeader';
import { Logo } from '@/components/ui/Logo';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  style?: any;
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
  onLogoPress?: () => void;
}

export function Screen({ 
  title, 
  subtitle, 
  children, 
  scrollable = true, 
  style,
  showLogo = false,
  logoSize = 'large',
  onLogoPress
}: ScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const Content = scrollable ? ScrollView : View;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
      <StatusBar style="light" />
      
      {showLogo && (
        <View style={styles.logoContainer}>
          <Logo size={logoSize} onPress={onLogoPress} />
        </View>
      )}
      
      {(title || subtitle) && (
        <MinimalHeader 
          title={title || ''} 
          subtitle={subtitle}
          showMinimalElements={!showLogo}
        />
      )}
      
      <Content 
        style={[styles.content, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Content>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
}); 