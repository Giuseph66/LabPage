import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DateInputProps {
  label?: string;
  value: string; // formato YYYY-MM-DD ou ""
  onChange: (dateStr: string) => void;
  placeholder?: string;
  error?: string;
}

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function DateInput({ label, value, onChange, placeholder = 'Selecionar', error }: DateInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [visible, setVisible] = useState(false);
  const [picker, setPicker] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  });
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const selected = value ? new Date(value + 'T00:00:00') : null;

  const days = useMemo(() => {
    const firstDay = new Date(picker.year, picker.month, 1).getDay();
    const total = getDaysInMonth(picker.year, picker.month);
    const arr: (number|null)[][] = [];
    let week: (number|null)[] = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let d = 1; d <= total; d++) {
      week.push(d);
      if (week.length === 7) {
        arr.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      arr.push(week);
    }
    return arr;
  }, [picker.year, picker.month]);

  const handleSelect = (d: number) => {
    const selectedDate = new Date(picker.year, picker.month, d);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data
    
    // Não permitir seleção de datas anteriores a hoje
    if (selectedDate < todayDate) {
      return;
    }
    
    const yyyy = picker.year;
    const mm = pad(picker.month + 1);
    const dd = pad(d);
    onChange(`${yyyy}-${mm}-${dd}`);
    setVisible(false);
  };

  const handleToday = () => {
    const yyyy = today.year;
    const mm = pad(today.month + 1);
    const dd = pad(today.day);
    onChange(`${yyyy}-${mm}-${dd}`);
    setVisible(false);
  };

  const open = () => {
    let d = value ? new Date(value + 'T00:00:00') : new Date();
    setPicker({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() });
    setVisible(true);
    setShowMonthList(false);
    setShowYearList(false);
  };

  const renderMonthList = () => (
    <View style={[styles.monthListModal, { backgroundColor: colors.surface }]}>
      {meses.map((m, idx) => {
        const isPastMonth = picker.year === today.year && idx < today.month;
        
        return (
          <TouchableOpacity 
            key={m} 
            style={styles.monthListItem} 
            onPress={() => { 
              if (!isPastMonth) {
                setPicker(p => ({ ...p, month: idx })); 
                setShowMonthList(false); 
              }
            }}
            disabled={isPastMonth}
          >
            <Text style={[
              styles.monthListText, 
              { color: isPastMonth ? colors.textSecondary : colors.textPrimary },
              idx === picker.month && { color: colors.accentPrimary, fontWeight: 'bold' },
              isPastMonth && { opacity: 0.5 }
            ]}>
              {m}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderYearList = () => {
    const anos: number[] = [];
    const base = today.year;
    // Só permitir anos a partir do atual
    for (let y = base; y <= base + 10; y++) anos.push(y);
    return (
      <ScrollView style={[styles.yearListModal, { backgroundColor: colors.surface }]}>
        {anos.map(y => {
          const isPastYear = y < today.year;
          
          return (
            <TouchableOpacity 
              key={y} 
              style={styles.yearListItem} 
              onPress={() => { 
                if (!isPastYear) {
                  setPicker(p => ({ ...p, year: y })); 
                  setShowYearList(false); 
                }
              }}
              disabled={isPastYear}
            >
              <Text style={[
                styles.yearListText, 
                { color: isPastYear ? colors.textSecondary : colors.textPrimary },
                y === picker.year && { color: colors.accentPrimary, fontWeight: 'bold' },
                isPastYear && { opacity: 0.5 }
              ]}>
                {y}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity 
        style={[
          styles.input, 
          { 
            backgroundColor: colors.surface, 
            borderColor: error ? colors.error : colors.border 
          }
        ]} 
        onPress={open}
      >
        <Text style={{ 
          color: value ? colors.textPrimary : colors.textSecondary 
        }}>
          {value ? value.split('-').reverse().join('/') : placeholder}
        </Text>
      </TouchableOpacity>
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
          {error}
        </Text>
      )}
      {visible && (
        <Modal transparent animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={() => setVisible(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={[
                styles.card, 
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }
              ]} 
              onPress={e => e.stopPropagation()}
            >
              <View style={styles.headerRow}>
                <TouchableOpacity 
                  onPress={() => {
                    const newMonth = picker.month === 0 ? 11 : picker.month - 1;
                    const newYear = picker.month === 0 ? picker.year - 1 : picker.year;
                    
                    // Não permitir navegação para meses anteriores ao atual
                    if (newYear < today.year || (newYear === today.year && newMonth < today.month)) {
                      return;
                    }
                    
                    setPicker(p => ({ 
                      ...p, 
                      month: newMonth, 
                      year: newYear 
                    }));
                  }}
                  disabled={picker.year === today.year && picker.month === today.month}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={22} 
                    color={picker.year === today.year && picker.month === today.month 
                      ? colors.textSecondary 
                      : colors.accentPrimary
                    } 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowMonthList(v => !v)}>
                  <Text style={[styles.monthText, { color: colors.accentPrimary }]}>
                    {meses[picker.month]}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowYearList(v => !v)}>
                  <Text style={[styles.yearText, { color: colors.accentPrimary }]}>
                    {picker.year}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPicker(p => ({ 
                  ...p, 
                  month: p.month === 11 ? 0 : p.month + 1, 
                  year: p.month === 11 ? p.year + 1 : p.year 
                }))}>
                  <Ionicons name="chevron-forward" size={22} color={colors.accentPrimary} />
                </TouchableOpacity>
              </View>
              {showMonthList && renderMonthList()}
              {showYearList && renderYearList()}
              <View style={styles.daysHeader}>
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                  <Text key={d + i} style={[styles.dayLabel, { color: colors.textSecondary }]}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {days.map((week, wIdx) => (
                  <View key={wIdx} style={{ flexDirection: 'row' }}>
                    {week.map((d, dIdx) => {
                      if (d === null) {
                        return <View key={dIdx} style={[styles.dayCell, { backgroundColor: colors.surface }]} />;
                      }
                      
                      const dayDate = new Date(picker.year, picker.month, d);
                      const todayDate = new Date();
                      todayDate.setHours(0, 0, 0, 0);
                      const isPastDate = dayDate < todayDate;
                      const isSelected = d === picker.day && picker.month === (selected?.getMonth() ?? -1) && picker.year === (selected?.getFullYear() ?? -1) && value;
                      const isToday = d === today.day && picker.month === today.month && picker.year === today.year;
                      
                      return (
                        <TouchableOpacity
                          key={dIdx}
                          style={[
                            styles.dayCell,
                            { backgroundColor: colors.surface },
                            isSelected ? { backgroundColor: colors.accentPrimary } : {},
                            isToday ? { borderWidth: 1, borderColor: colors.accentSecondary } : {},
                            isPastDate ? { backgroundColor: colors.surface, opacity: 0.3 } : {},
                          ]}
                          onPress={() => handleSelect(d)}
                          disabled={isPastDate}
                        >
                          <Text style={[
                            styles.dayText, 
                            { color: colors.textPrimary },
                            isSelected ? { color: '#000000' } : {},
                            isPastDate ? { color: colors.textSecondary } : {},
                          ]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
              <View style={styles.footerRow}>
                <TouchableOpacity 
                  style={[
                    styles.btnToday, 
                    { backgroundColor: colors.accentPrimary + '20' }
                  ]} 
                  onPress={handleToday}
                >
                  <Text style={[styles.btnTodayText, { color: colors.accentPrimary }]}>
                    Hoje
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.btnCancel, 
                    { 
                      borderColor: colors.border 
                    }
                  ]} 
                  onPress={() => setVisible(false)}
                >
                  <Text style={[styles.btnCancelText, { color: colors.textPrimary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { 
    fontSize: 12, 
    marginBottom: 4, 
    fontWeight: '500' 
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 8,
    minHeight: 40,
  },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    width: 320, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center',
    borderWidth: 1,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 8 
  },
  monthText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginHorizontal: 4 
  },
  yearText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginHorizontal: 4 
  },
  daysHeader: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between', 
    marginBottom: 2 
  },
  dayLabel: { 
    width: 32, 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  daysGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginLeft: -4
  },
  dayCell: { 
    width: 32, 
    height: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: 5, 
    borderRadius: 16
  },
  dayText: { 
    fontSize: 14 
  },
  monthListModal: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 8 
  },
  monthListItem: { 
    width: 60, 
    padding: 6, 
    alignItems: 'center' 
  },
  monthListText: { 
    fontSize: 14 
  },
  yearListModal: { 
    maxHeight: 180, 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 8 
  },
  yearListItem: { 
    padding: 6, 
    alignItems: 'center' 
  },
  yearListText: { 
    fontSize: 14 
  },
  footerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    marginTop: 10 
  },
  btnToday: { 
    padding: 8, 
    borderRadius: 6 
  },
  btnTodayText: { 
    fontWeight: 'bold' 
  },
  btnCancel: { 
    padding: 8, 
    borderRadius: 6, 
    borderWidth: 1, 
    marginLeft: 8 
  },
  btnCancelText: { 
    fontWeight: 'bold' 
  },
}); 