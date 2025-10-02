import { StyleSheet, Platform } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  // Estilos de sombra compatíveis com web
  shadow: Platform.select({
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
    default: {
      elevation: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
  }),

  // Estilos de sombra forte
  shadowStrong: Platform.select({
    web: {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
    },
    default: {
      elevation: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
  }),

  // Estilos de scroll para web
  scrollContainer: Platform.select({
    web: {
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    default: {},
  }),

  // Estilos de input para web
  webInput: Platform.select({
    web: {
      outline: 'none',
    },
    default: {},
  }),
}); 