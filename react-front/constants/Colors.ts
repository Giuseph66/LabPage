/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Blueprint Tech Color Palette
const blueprintColors = {
  background: '#0E121B',
  surface: '#151A24',
  border: '#233044',
  textPrimary: '#E6EAF2',
  textSecondary: '#A9B4C7',
  accentPrimary: '#00E5FF', // Ciano
  accentSecondary: '#FF7A1A', // Laranja
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

const cleanResearchColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  accentPrimary: '#3B82F6',
  accentSecondary: '#F97316',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const Colors = {
  light: {
    text: cleanResearchColors.textPrimary,
    background: cleanResearchColors.background,
    tint: cleanResearchColors.accentPrimary,
    icon: cleanResearchColors.textSecondary,
    tabIconDefault: cleanResearchColors.textSecondary,
    tabIconSelected: cleanResearchColors.accentPrimary,
    surface: cleanResearchColors.surface,
    border: cleanResearchColors.border,
    accentSecondary: cleanResearchColors.accentSecondary,
    success: cleanResearchColors.success,
    warning: cleanResearchColors.warning,
    error: cleanResearchColors.error,
    textSecondary: cleanResearchColors.textSecondary,
    accentPrimary: cleanResearchColors.accentPrimary,
    textPrimary: cleanResearchColors.textPrimary,
  },
  dark: {
    text: blueprintColors.textPrimary,
    background: blueprintColors.background,
    tint: blueprintColors.accentPrimary,
    icon: blueprintColors.textSecondary,
    tabIconDefault: blueprintColors.textSecondary,
    tabIconSelected: blueprintColors.accentPrimary,
    surface: blueprintColors.surface,
    border: blueprintColors.border,
    accentSecondary: blueprintColors.accentSecondary,
    success: blueprintColors.success,
    warning: blueprintColors.warning,
    error: blueprintColors.error,
    textSecondary: blueprintColors.textSecondary,
    accentPrimary: blueprintColors.accentPrimary,
    textPrimary: blueprintColors.textPrimary,
  },
};
