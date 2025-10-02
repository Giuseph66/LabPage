import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TimeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  value?: string;
  title?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  value,
  title = 'Selecionar Horário'
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [selectedHour, setSelectedHour] = useState('08');
  const [selectedMinute, setSelectedMinute] = useState('00');

  // Inicializar com o valor atual quando o modal abre
  useEffect(() => {
    if (value && visible) {
      const [hour, minute] = value.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [value, visible]);

  // Gerar horas (00 até 23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  // Gerar minutos (00 até 59)
  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  const handleConfirm = () => {
    const time = `${selectedHour}:${selectedMinute}`;
    onSelect(time);
    onClose();
  };

  const renderHourItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.pickerItem,
        { backgroundColor: selectedHour === item ? colors.accentPrimary + '20' : 'transparent' }
      ]}
      onPress={() => setSelectedHour(item)}
    >
      <Text style={[
        styles.pickerText,
        { color: selectedHour === item ? colors.accentPrimary : colors.textPrimary }
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderMinuteItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.pickerItem,
        { backgroundColor: selectedMinute === item ? colors.accentPrimary + '20' : 'transparent' }
      ]}
      onPress={() => setSelectedMinute(item)}
    >
      <Text style={[
        styles.pickerText,
        { color: selectedMinute === item ? colors.accentPrimary : colors.textPrimary }
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {title}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={[styles.timeDisplayText, { color: colors.accentPrimary }]}>
              {selectedHour}:{selectedMinute}
            </Text>
          </View>

          {/* Time Pickers */}
          <View style={styles.pickersContainer}>
            {/* Hours Picker */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
                Hora
              </Text>
              <View style={[styles.pickerWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FlatList
                  data={hours}
                  renderItem={renderHourItem}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerList}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  initialScrollIndex={parseInt(selectedHour)}
                />
              </View>
            </View>

            {/* Separator */}
            <View style={styles.separator}>
              <Text style={[styles.separatorText, { color: colors.textPrimary }]}>:</Text>
            </View>

            {/* Minutes Picker */}
            <View style={styles.pickerColumn}>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
                Minuto
              </Text>
              <View style={[styles.pickerWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <FlatList
                  data={minutes}
                  renderItem={renderMinuteItem}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerList}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  initialScrollIndex={minutes.indexOf(selectedMinute)}
                />
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.accentPrimary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Confirmar Horário
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  timeDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerList: {
    paddingVertical: 75, // Para centralizar o item selecionado
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorText: {
    fontSize: 24,
    fontWeight: '700',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default TimeSelector;
