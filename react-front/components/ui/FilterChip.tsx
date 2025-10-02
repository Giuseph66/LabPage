import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  badge?: string | number;
}

export function FilterChip({ label, selected = false, onPress, badge }: FilterChipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected ? colors.accentPrimary : colors.surface,
          borderColor: selected ? colors.accentPrimary : colors.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.label,
        { 
          color: selected ? '#000000' : colors.textPrimary 
        }
      ]}>
        {label}
      </Text>
      {badge && (
        <View style={[
          styles.badge,
          { 
            backgroundColor: selected ? '#000000' : colors.accentPrimary 
          }
        ]}>
          <Text style={[
            styles.badgeText,
            { 
              color: selected ? colors.accentPrimary : '#000000' 
            }
          ]}>
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    height: 40,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 